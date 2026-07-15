#!/usr/bin/env bash
# Consumer-side contract drift-check for the Chokepoints Read API (ADR 0062).
#
# This script runs on the CONSUMER VPS (any tailnet peer), NOT on the producer. Copy the
# scripts/consumer/ directory to the consumer and schedule this via cron. It fetches the LIVE
# OpenAPI spec from the tailnet-served API and compares it to the PINNED local copy:
#
#   * pinned copy absent            -> first run: pin the live spec, exit 0.
#   * live == pinned                -> no-op, exit 0.
#   * live != pinned                -> write openapi.live.json + a diff, DO NOT overwrite the
#                                      pin, and exit non-zero so cron's MAILTO alerts you.
#
# The pin is the single input to gen_client.sh, so the generated client never drifts silently:
# updating it is a DELIBERATE act (accept the diff, then `cp openapi.live.json openapi.json` and
# rerun gen_client.sh). /openapi.json needs NO Bearer token (tailnet membership is the gate).
#
# Install (consumer host crontab) — daily at 08:15, alert on drift via MAILTO:
#   MAILTO=you@example.com
#   15 8 * * * /usr/bin/flock -n /tmp/chokepoints_contract.lock /path/to/scripts/consumer/sync_contract.sh
#
# Config via env (defaults shown):
#   API_BASE   base URL of the read API on the tailnet
#   PIN_DIR    where the pinned spec + live snapshot live
set -euo pipefail

API_BASE="${API_BASE:-https://srv1305127.tail880531.ts.net/api}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIN_DIR="${PIN_DIR:-$SCRIPT_DIR/contract}"
PINNED="$PIN_DIR/openapi.json"
LIVE="$PIN_DIR/openapi.live.json"

# Test/inspection mode: `sync_contract.sh --classify <pinned> <live>` runs the drift classification
# against two local specs (no network) and exits with the code the cron reacts to: 3 = version/data-
# only bump, 2 = structural drift, 0 = byte-identical. Used by the drift-classification test.
CLASSIFY_MODE=0
if [ "${1:-}" = "--classify" ]; then
  CLASSIFY_MODE=1
  PINNED="${2:?usage: sync_contract.sh --classify <pinned> <live>}"
  LIVE="${3:?usage: sync_contract.sh --classify <pinned> <live>}"
fi

# --- drift classification helpers (oasdiff JSON → kind + concise summary) -----------------------
# WHY: a version-literal-only bump (identical paths/schemas) used to trip the same red DRIFT alarm as
# a real structural change, because drift was decided by a byte `cmp`. We keep the fast byte check, but
# when bytes differ we ask oasdiff whether anything STRUCTURAL moved before choosing the severity.
_can_classify() {
  { command -v oasdiff >/dev/null 2>&1 || command -v docker >/dev/null 2>&1; } \
    && command -v jq >/dev/null 2>&1
}
# Semantic diff as JSON (native oasdiff, else the pinned docker image). Empty on no semantic change.
_oasdiff_json() {
  local a="$1" b="$2" tmp rc
  if command -v oasdiff >/dev/null 2>&1; then oasdiff diff --format json "$a" "$b" 2>/dev/null; return; fi
  tmp="$(mktemp -d)"; cp "$a" "$tmp/a.json"; cp "$b" "$tmp/b.json"
  docker run --rm -v "$tmp":/specs tufin/oasdiff:latest diff --format json /specs/a.json /specs/b.json 2>/dev/null
  rc=$?; rm -rf "$tmp"; return $rc
}
# Human-readable diff (for the log / structural detail), same fallbacks.
_oasdiff_text() {
  local a="$1" b="$2" tmp rc
  if command -v oasdiff >/dev/null 2>&1; then oasdiff diff "$a" "$b"; return; fi
  tmp="$(mktemp -d)"; cp "$a" "$tmp/a.json"; cp "$b" "$tmp/b.json"
  docker run --rm -v "$tmp":/specs tufin/oasdiff:latest diff /specs/a.json /specs/b.json
  rc=$?; rm -rf "$tmp"; return $rc
}
# Classify a diff JSON: "soft" if only info.version changed (or nothing semantic), else "structural".
_classify() {
  printf '%s' "$1" | jq -r '
    ([keys[] | select(. != "info")] | length) as $n
    | (((.info // {}) | [keys[] | select(. != "version")]) | length) as $iv
    | if ($n == 0 and $iv == 0) then "soft" else "structural" end
  ' 2>/dev/null || echo structural
}
# One readable line per change, from a diff JSON.
_summarize() {
  printf '%s' "$1" | jq -r '
    def arr(x): (x // []);
    def ks(x): (x // {} | keys);
    def line(l; xs): if (xs | length) > 0 then [l + (xs | join(", "))] else [] end;
    ( [ "version: \(.info.version.from // "?") → \(.info.version.to // "?")" ]
      + line("paths added: ";      arr(.paths.added))
      + line("paths deleted: ";    arr(.paths.deleted))
      + line("paths modified: ";   ks(.paths.modified))
      + line("schemas added: ";    arr(.components.schemas.added))
      + line("schemas modified: "; ks(.components.schemas.modified))
    ) | .[]' 2>/dev/null || true
}

mkdir -p "$PIN_DIR"

# Fetch the live spec (no token; --fail so an HTTP error is a hard failure, not a saved error page).
if [ "$CLASSIFY_MODE" != 1 ]; then
  if ! curl -sSf "$API_BASE/openapi.json" -o "$LIVE"; then
    echo "$(date -u +%FT%TZ) contract sync: FAILED to fetch $API_BASE/openapi.json" >&2
    exit 1
  fi
fi

# First run: adopt the live spec as the pin and stop (nothing to compare against yet).
if [ ! -f "$PINNED" ]; then
  mv "$LIVE" "$PINNED"
  ver="$(grep -o '"version"[^,]*' "$PINNED" | head -1 || true)"
  echo "$(date -u +%FT%TZ) contract sync: pinned initial spec ($ver) at $PINNED"
  exit 0
fi

# Byte-identical -> no drift.
if cmp -s "$LIVE" "$PINNED"; then
  [ "$CLASSIFY_MODE" = 1 ] || rm -f "$LIVE"
  echo "$(date -u +%FT%TZ) contract sync: no drift (pin matches live)"
  exit 0
fi

# Drift: bytes differ. Classify before choosing severity — a version/data-only bump is a soft notice
# (exit 3), a structural change (paths/schemas) is a red alarm (exit 2). Never overwrite the pin here.
echo "$(date -u +%FT%TZ) contract sync: DRIFT — live spec differs from pin $PINNED" >&2

if _can_classify; then
  diff_json="$(_oasdiff_json "$PINNED" "$LIVE" || true)"
  [ -n "$diff_json" ] || diff_json='{}'
  kind="$(_classify "$diff_json")"
  summary="$(_summarize "$diff_json")"
else
  # No oasdiff/jq → cannot tell structural from cosmetic; treat as structural (safe: keeps the alarm).
  diff_json='{}'; kind="structural"
  summary="(oasdiff/jq unavailable — cannot classify; treating as structural)"
fi

# Machine-readable block so check_client.sh can build a clean Slack summary (kept on stdout).
echo "DRIFT-KIND: $kind"
echo "DRIFT-SUMMARY-BEGIN"
printf '%s\n' "$summary"
echo "DRIFT-SUMMARY-END"

if [ "$kind" = soft ]; then
  echo "$(date -u +%FT%TZ) contract sync: version/data-only bump — no path/schema change (coverage test stays green); refresh the pin at leisure" >&2
  echo "to accept: cp \"$LIVE\" \"$PINNED\" && \"$SCRIPT_DIR/gen_client.sh\"" >&2
  exit 3
fi

# Structural: also emit the full human diff to the log.
if _can_classify; then _oasdiff_text "$PINNED" "$LIVE" >&2 || true; else diff -u "$PINNED" "$LIVE" >&2 || true; fi
echo "review the diff, then to accept: cp \"$LIVE\" \"$PINNED\" && \"$SCRIPT_DIR/gen_client.sh\"" >&2
exit 2
