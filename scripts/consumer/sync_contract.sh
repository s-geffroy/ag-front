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

mkdir -p "$PIN_DIR"

# Fetch the live spec (no token; --fail so an HTTP error is a hard failure, not a saved error page).
if ! curl -sSf "$API_BASE/openapi.json" -o "$LIVE"; then
  echo "$(date -u +%FT%TZ) contract sync: FAILED to fetch $API_BASE/openapi.json" >&2
  exit 1
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
  rm -f "$LIVE"
  echo "$(date -u +%FT%TZ) contract sync: no drift (pin matches live)"
  exit 0
fi

# Drift: surface a semantic diff if oasdiff is available (native binary or the pinned image),
# otherwise fall back to a plain textual diff. Never overwrite the pin here.
echo "$(date -u +%FT%TZ) contract sync: DRIFT — live spec differs from pin $PINNED" >&2
if command -v oasdiff >/dev/null 2>&1; then
  oasdiff diff "$PINNED" "$LIVE" || true
elif command -v docker >/dev/null 2>&1; then
  docker run --rm -v "$PIN_DIR":/specs tufin/oasdiff:latest \
    diff /specs/openapi.json /specs/openapi.live.json || true
else
  diff -u "$PINNED" "$LIVE" || true
fi
echo "review the diff, then to accept: cp \"$LIVE\" \"$PINNED\" && \"$SCRIPT_DIR/gen_client.sh\"" >&2
exit 2
