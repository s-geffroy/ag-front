#!/usr/bin/env bash
# "Is the consumer fully up to date?" — one command, two checks (ADR 0062):
#   (a) pinned spec == live spec   (delegates to sync_contract.sh)
#   (b) generated client == pinned spec  (compares the stamp written by gen_client.sh)
# Exit 0 only if BOTH hold. Safe to run in cron/CI on the consumer.
#
# On drift it POSTs a Slack alert if SLACK_WEBHOOK_URL is set (in .env, gitignored) — so you
# are actively told when the producer's API moves, instead of relying on reading a log. With no
# webhook configured the Slack step is a silent no-op (drift still logged + non-zero exit).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PIN_DIR="${PIN_DIR:-$SCRIPT_DIR/contract}"
OUT_DIR="${OUT_DIR:-$SCRIPT_DIR/client}"
SPEC="$PIN_DIR/openapi.json"
STAMP="$OUT_DIR/.spec.sha256"

# --heartbeat: also POST to Slack on SUCCESS (a weekly "alive + up to date" dead-man's switch —
# if this stops arriving, the cron/host itself is dead). Default (daily run): Slack only on drift.
HEARTBEAT=0
[ "${1:-}" = "--heartbeat" ] && HEARTBEAT=1

# Load consumer env (SLACK_WEBHOOK_URL, API_BASE, …) if present — keeps secrets out of git.
ENV_FILE="${ENV_FILE:-$SCRIPT_DIR/.env}"
if [ -f "$ENV_FILE" ]; then set -a; . "$ENV_FILE"; set +a; fi

_sha256() {
  if command -v sha256sum >/dev/null 2>&1; then sha256sum "$1" | awk '{print $1}';
  else shasum -a 256 "$1" | awk '{print $1}'; fi
}

# Minimal JSON-string escaper (quotes, backslashes, tabs, CR, then newlines -> \n).
_json_escape() {
  printf '%s' "$1" \
    | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/\t/\\t/g' -e 's/\r//g' \
    | sed ':a;N;$!ba;s/\n/\\n/g'
}

# POST a plain-text alert to Slack if a webhook is configured; silent no-op otherwise.
_notify_slack() {
  [ -n "${SLACK_WEBHOOK_URL:-}" ] || return 0
  local data
  data="{\"text\":\"$(_json_escape "$1")\"}"
  curl -sf -X POST -H 'Content-Type: application/json' --data "$data" "$SLACK_WEBHOOK_URL" >/dev/null \
    || echo "warn: Slack notify failed (webhook unreachable?)" >&2
}

# (a) pin vs live — sync_contract.sh exits non-zero on drift (and prints the diff). Capture its
# output so the same detail reaches both the log/stderr and the Slack message.
if ! sync_out="$("$SCRIPT_DIR/sync_contract.sh" 2>&1)"; then
  msg="pinned spec has drifted from live — accept the diff then rerun gen_client.sh"
  echo "NOT up to date: $msg" >&2
  printf '%s\n' "$sync_out" >&2
  _notify_slack ":rotating_light: Chokepoints read-API — $msg"$'\n\n'"$(printf '%s\n' "$sync_out" | head -50)"
  exit 1
fi
printf '%s\n' "$sync_out"

# (b) client vs pin
if [ ! -f "$STAMP" ]; then
  msg="client not generated (no $STAMP) — run gen_client.sh"
  echo "NOT up to date: $msg" >&2
  _notify_slack ":warning: Chokepoints read-API — $msg"
  exit 1
fi
want="$(_sha256 "$SPEC")"; have="$(cat "$STAMP")"
if [ "$want" != "$have" ]; then
  msg="generated client is stale vs the pin — run gen_client.sh"
  echo "NOT up to date: $msg" >&2
  echo "  pin=$want  client=$have" >&2
  _notify_slack ":warning: Chokepoints read-API — $msg"$'\n'"pin=$want  client=$have"
  exit 1
fi

echo "up to date: pin matches live AND client matches pin"
if [ "$HEARTBEAT" = 1 ]; then
  _notify_slack ":white_check_mark: Chokepoints read-API consumer — alive & fully up to date ($(date -u +%FT%TZ))"
fi
