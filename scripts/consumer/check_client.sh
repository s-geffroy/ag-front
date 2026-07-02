#!/usr/bin/env bash
# "Is the consumer fully up to date?" — one command, two checks (ADR 0062):
#   (a) pinned spec == live spec   (delegates to sync_contract.sh)
#   (b) generated client == pinned spec  (compares the stamp written by gen_client.sh)
# Exit 0 only if BOTH hold. Safe to run in cron/CI on the consumer.
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIN_DIR="${PIN_DIR:-$SCRIPT_DIR/contract}"
OUT_DIR="${OUT_DIR:-$SCRIPT_DIR/client}"
SPEC="$PIN_DIR/openapi.json"
STAMP="$OUT_DIR/.spec.sha256"

_sha256() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | awk '{print $1}';
  else shasum -a 256 "$1" | awk '{print $1}'; fi
}

# (a) pin vs live — sync_contract.sh exits non-zero on drift (and prints the diff).
if ! "$SCRIPT_DIR/sync_contract.sh"; then
  echo "NOT up to date: pinned spec has drifted from live — accept the diff then rerun gen_client.sh" >&2
  exit 1
fi

# (b) client vs pin
if [ ! -f "$STAMP" ]; then
  echo "NOT up to date: client not generated (no $STAMP) — run gen_client.sh" >&2
  exit 1
fi
want="$(_sha256 "$SPEC")"; have="$(cat "$STAMP")"
if [ "$want" != "$have" ]; then
  echo "NOT up to date: generated client is stale vs the pin — run gen_client.sh" >&2
  echo "  pin=$want  client=$have" >&2
  exit 1
fi

echo "up to date: pin matches live AND client matches pin"
