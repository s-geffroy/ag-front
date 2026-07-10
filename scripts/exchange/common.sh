#!/usr/bin/env bash
#
# Shared primitives for the ag-front <-> ag-back file exchange (ADR 0067).
#
# The channel is two directories on an sshfs mount of srv1305127, with ONE WRITER EACH:
#
#   $EX/ag-front-out/   we write, they read     (our outbox + our manifest, incl. our acks)
#   $EX/ag-back-out/    they write, we read     (our inbox)
#
# Single-writer is what lets us skip locking entirely: sshfs advisory locks are not dependable.
#
# A message's identity is NOT its sequence number, it is `msg_id = sha256(content)`. Deposited
# files are immutable; a correction is a NEW deposit carrying `supersedes: <old msg_id>`. That is
# what makes "this file, this version" a statement a reply can be checked against.
#
# Both scripts source this file. Override the mount root with AG_EXCHANGE_ROOT (used by the tests
# to run against a fake inbox instead of the real remote).
#
# Host-side tooling: the mount exists only on the host and is not bind-mounted into the `tools`
# service, so this is an explicit exception to the Docker-only rule (like `gh` and `pplx`).

set -euo pipefail

EXCHANGE_ROOT="${AG_EXCHANGE_ROOT:-/mnt/exchange}"
OUTBOX="$EXCHANGE_ROOT/ag-front-out"
INBOX="$EXCHANGE_ROOT/ag-back-out"
OUT_MANIFEST="$OUTBOX/manifest.jsonl"
IN_MANIFEST="$INBOX/manifest.jsonl"

PROTOCOL_VERSION=1

die() {
  printf 'error: %s\n' "$*" >&2
  exit 1
}

warn() { printf 'warning: %s\n' "$*" >&2; }

need() { command -v "$1" >/dev/null 2>&1 || die "missing required tool: $1"; }

need jq
need sha256sum

# sha256 of a file's bytes -- this is a message's msg_id.
sha_file() { sha256sum -- "$1" | cut -d' ' -f1; }

# sha256 of a string with no trailing newline -- used to chain manifest lines.
sha_text() { printf '%s' "$1" | sha256sum | cut -d' ' -f1; }

short() { printf '%.12s' "$1"; }

now_utc() { date -u +%Y-%m-%dT%H:%M:%SZ; }

# ---------------------------------------------------------------------------
# Manifest reads. Each takes a manifest path and tolerates the file's absence,
# because an empty channel is a legitimate state, not an error.
# ---------------------------------------------------------------------------

manifest_query() {
  local manifest="$1" filter="$2"
  [[ -f "$manifest" ]] || return 0
  jq -r "$filter" <"$manifest" 2>/dev/null || die "$manifest: not valid JSONL"
}

msg_ids() { manifest_query "$1" 'select(.type=="msg") | .msg_id'; }

# The msg_ids that a LATER deposit in the same manifest has retracted.
superseded_ids() { manifest_query "$1" 'select(.type=="msg" and .supersedes != null) | .supersedes'; }

acked_ids() { manifest_query "$1" 'select(.type=="ack") | .msg_id'; }

# The msg_ids a manifest's author has replied to. With acked_ids(), these are the two
# ways the peer can have COMMITTED to a message of ours -- after which rule 8 forbids
# retracting it: the correction goes forward as a new message.
replied_to_ids() { manifest_query "$1" 'select(.type=="msg" and .in_reply_to != null) | .in_reply_to'; }

# Rule 9: several acks may bear on one msg_id (read -> actioned); the LAST one holds.
last_ack_status() {
  local manifest="$1" id="$2"
  manifest_query "$manifest" "select(.type==\"ack\" and .msg_id==\"$id\") | .status" | tail -n 1
}

subject_of() {
  local manifest="$1" id="$2"
  manifest_query "$manifest" "select(.type==\"msg\" and .msg_id==\"$id\") | .subject" | head -n 1
}

file_of() {
  local manifest="$1" id="$2"
  manifest_query "$manifest" "select(.type==\"msg\" and .msg_id==\"$id\") | .file" | head -n 1
}

next_seq() {
  local manifest="$1" max
  max="$(manifest_query "$manifest" 'select(.type=="msg") | .seq' | sort -n | tail -n 1)"
  printf '%d' "$(( ${max:-0} + 1 ))"
}

contains() {
  local needle="$1"
  shift || true
  local hay
  for hay in "$@"; do [[ "$hay" == "$needle" ]] && return 0; done
  return 1
}

# ---------------------------------------------------------------------------
# Prefix resolution. `inbox.sh` prints 12-char msg_ids, so requiring the full 64
# invited hand-completing one from the displayed prefix -- which is fabricating an
# identifier. Accept an unambiguous prefix instead, and REFUSE an ambiguous one:
# a msg_id must never be guessed, and silently picking one of two matches would be
# the same failure this protocol exists to prevent.
#
# Only ever resolves against msg_ids the given manifest actually attests.
# ---------------------------------------------------------------------------

MIN_PREFIX=8

resolve_msg_id() {
  local manifest="$1" prefix="$2" label="${3:-msg_id}"
  [[ -n "$prefix" ]] || die "$label : empreinte vide"

  if [[ ! "$prefix" =~ ^[0-9a-f]+$ ]]; then
    die "$label $prefix : une empreinte est en hexadécimal minuscule"
  fi
  if ((${#prefix} < MIN_PREFIX)); then
    die "$label $prefix : préfixe trop court (au moins $MIN_PREFIX caractères)"
  fi

  local matches
  mapfile -t matches < <(msg_ids "$manifest" | grep -x -- "$prefix.*" || true)

  case "${#matches[@]}" in
    0) die "$label $(short "$prefix") : aucun message de $(basename "$(dirname "$manifest")") ne porte cette empreinte" ;;
    1) printf '%s' "${matches[0]}" ;;
    *)
      warn "$label $(short "$prefix") est ambigu — ${#matches[@]} messages y correspondent :"
      printf '  %s\n' "${matches[@]}" >&2
      die "précisez l'empreinte ; un msg_id ne se devine pas"
      ;;
  esac
}

# ---------------------------------------------------------------------------
# The `prev` chain: every line records the sha256 of the line before it. A gap or
# a rewritten line breaks the chain, so a truncated conversation cannot pass as a
# complete one.
# ---------------------------------------------------------------------------

chain_verify() {
  local manifest="$1" prev="" line expected n=0
  [[ -f "$manifest" ]] || return 0
  while IFS= read -r line; do
    [[ -n "$line" ]] || continue
    n=$((n + 1))
    expected="$(jq -r '.prev // ""' <<<"$line" 2>/dev/null)" ||
      { warn "$manifest: line $n is not valid JSON"; return 1; }
    if [[ "$expected" != "$prev" ]]; then
      warn "$manifest: broken prev chain at line $n (a line was lost or rewritten)"
      return 1
    fi
    prev="$(sha_text "$line")"
  done <"$manifest"
  return 0
}

# Append one event to OUR manifest, stamping `prev` from the current last line.
# Only ever called on $OUT_MANIFEST -- we never write into their outbox.
manifest_append() {
  local json="$1" prev="" last line
  mkdir -p "$OUTBOX"
  if [[ -s "$OUT_MANIFEST" ]]; then
    last="$(tail -n 1 "$OUT_MANIFEST")"
    prev="$(sha_text "$last")"
  fi
  if [[ -n "$prev" ]]; then
    line="$(jq -c --arg prev "$prev" '. + {prev: $prev}' <<<"$json")"
  else
    line="$(jq -c '. + {prev: null}' <<<"$json")"
  fi
  printf '%s\n' "$line" >>"$OUT_MANIFEST"
}
