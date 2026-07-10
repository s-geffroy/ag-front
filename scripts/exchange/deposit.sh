#!/usr/bin/env bash
#
# Déposer un fichier à destination du LLM d'ag-back (srv1305127) — ADR 0067.
#
# YOU MUST use this script rather than writing into $OUTBOX by hand: it is what guarantees the
# three properties the channel relies on.
#
#   1. Atomicité   — the file is written as `.NNNN.tmp` then `mv`'d into place (rename(2) is
#                    atomic on this sshfs), so ag-back never reads a half-written file.
#   2. Identité    — msg_id = sha256(content). The file is copied verbatim, never rewritten,
#                    so the deposited bytes stay diff-identical to the source.
#   3. Corrélation — --in-reply-to is checked against THEIR manifest: replying to a message they
#                    never sent, or that they have retracted, fails here. You cannot, mechanically,
#                    answer beside the point.
#
# The manifest line is appended only AFTER the file lands, so the manifest never announces a file
# that is not there.
#
# Usage:
#   scripts/exchange/deposit.sh <fichier> "<sujet>" [--in-reply-to <msg_id>] [--supersedes <msg_id>]
#                                                   [--slug <slug>]
#
# Corriger un dépôt = déposer un NOUVEAU fichier avec --supersedes <ancien msg_id>. Un fichier
# déposé ne se modifie jamais.
#
# Garde-fous : texte uniquement, ≤ 1 Mio, sujet non vide, aucun secret (la boîte est lisible par le
# compte `deploy` distant). Ce qu'on dépose est un document ; un chiffre déposé reste un candidat en
# attente de validation humaine, jamais un fait.

source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

MAX_BYTES=$((1024 * 1024))

SRC=""
SUBJECT=""
IN_REPLY_TO=""
SUPERSEDES=""
SLUG=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --in-reply-to) IN_REPLY_TO="${2:-}"; shift 2 ;;
    --supersedes) SUPERSEDES="${2:-}"; shift 2 ;;
    --slug) SLUG="${2:-}"; shift 2 ;;
    -h | --help) sed -n '2,28p' "${BASH_SOURCE[0]}"; exit 0 ;;
    -*) die "unknown argument: $1" ;;
    *)
      if [[ -z "$SRC" ]]; then SRC="$1"
      elif [[ -z "$SUBJECT" ]]; then SUBJECT="$1"
      else die "argument en trop : $1"
      fi
      shift
      ;;
  esac
done

# --- Validation : tout échoue AVANT la moindre écriture ----------------------

[[ -n "$SRC" ]] || die "usage: deposit.sh <fichier> \"<sujet>\" [--in-reply-to <msg_id>] [--supersedes <msg_id>]"
[[ -f "$SRC" ]] || die "fichier introuvable : $SRC"
[[ -n "${SUBJECT// /}" ]] || die "le sujet est obligatoire et ne peut pas être vide"
[[ -d "$OUTBOX" ]] || die "outbox absente : $OUTBOX (le montage sshfs est-il actif ?)"

size="$(stat -c %s -- "$SRC")"
[[ "$size" -le "$MAX_BYTES" ]] || die "$SRC : $size octets > 1 Mio — le canal transporte des documents, pas des dumps"
[[ "$size" -gt 0 ]] || die "$SRC : fichier vide"
grep -qI . -- "$SRC" || die "$SRC : contenu binaire — le canal transporte du texte"

chain_verify "$OUT_MANIFEST" || die "notre propre manifeste a une chaîne rompue — corriger avant de déposer"

# Both accept an unambiguous prefix; resolution refuses an unknown or ambiguous one,
# so a msg_id can never be hand-completed from a truncated display.
if [[ -n "$SUPERSEDES" ]]; then
  SUPERSEDES="$(resolve_msg_id "$OUT_MANIFEST" "$SUPERSEDES" "--supersedes")"
fi

if [[ -n "$IN_REPLY_TO" ]]; then
  [[ -f "$IN_MANIFEST" ]] ||
    die "--in-reply-to impossible : ag-back n'a pas de manifeste, aucune corrélation n'est vérifiable"
  chain_verify "$IN_MANIFEST" || die "chaîne du manifeste distant rompue — ne pas répondre dans le noir"

  IN_REPLY_TO="$(resolve_msg_id "$IN_MANIFEST" "$IN_REPLY_TO" "--in-reply-to")"

  mapfile -t theirs_dead < <(superseded_ids "$IN_MANIFEST")
  if contains "$IN_REPLY_TO" "${theirs_dead[@]+"${theirs_dead[@]}"}"; then
    die "--in-reply-to $(short "$IN_REPLY_TO") : ag-back a remplacé ce message — répondre à sa version courante"
  fi
fi

# --- Nommage ----------------------------------------------------------------

base="$(basename -- "$SRC")"
ext="md"
[[ "$base" == *.* ]] && ext="${base##*.}"
if [[ -z "$SLUG" ]]; then
  SLUG="$(printf '%s' "${base%.*}" | tr '[:upper:]' '[:lower:]' | tr -cs 'a-z0-9' '-' | sed 's/^-//; s/-$//')"
fi
[[ -n "$SLUG" ]] || die "slug vide : passer --slug"

seq="$(next_seq "$OUT_MANIFEST")"
msg_id="$(sha_file "$SRC")"
dest_name="$(printf '%04d-%s-%s.%s' "$seq" "$(date -u +%Y%m%d)" "$SLUG" "$ext")"
dest="$OUTBOX/$dest_name"
tmp="$OUTBOX/.$(printf '%04d' "$seq").tmp"

[[ -e "$dest" ]] && die "$dest_name existe déjà — un dépôt est immuable"

# --- Écriture atomique, PUIS manifeste ---------------------------------------

trap 'rm -f -- "$tmp"' EXIT
cp -- "$SRC" "$tmp"
sync -- "$tmp" 2>/dev/null || true
mv -- "$tmp" "$dest"
trap - EXIT

[[ "$(sha_file "$dest")" == "$msg_id" ]] ||
  die "$dest_name : le sha du fichier déposé diffère de la source — dépôt non fiable, NE PAS l'annoncer"

json="$(jq -nc \
  --arg ts "$(now_utc)" --argjson seq "$seq" --arg file "$dest_name" --arg id "$msg_id" \
  --arg subject "$SUBJECT" --arg irt "$IN_REPLY_TO" --arg sup "$SUPERSEDES" \
  '{type:"msg", seq:$seq, ts:$ts, file:$file, msg_id:$id, subject:$subject,
    in_reply_to: (if $irt == "" then null else $irt end),
    supersedes:  (if $sup == "" then null else $sup end)}')"
manifest_append "$json"

printf 'déposé %s\n' "$dest_name"
printf '  msg_id %s\n' "$msg_id"
[[ -n "$IN_REPLY_TO" ]] && printf '  en réponse à %s\n' "$(short "$IN_REPLY_TO")"
[[ -n "$SUPERSEDES" ]] && printf '  remplace %s\n' "$(short "$SUPERSEDES")"
printf '  manifeste %s\n' "$OUT_MANIFEST"
exit 0
