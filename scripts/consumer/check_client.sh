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

# Block Kit Slack notifier (shared; single source of truth for the escaper + the POST).
# shellcheck source=../lib/slack.sh
. "$SCRIPT_DIR/../lib/slack.sh"

# Pull the concise summary block sync_contract.sh emits between markers, and the version line from it.
_drift_detail() { printf '%s\n' "$1" | sed -n '/DRIFT-SUMMARY-BEGIN/,/DRIFT-SUMMARY-END/p' | sed '1d;$d'; }
_drift_version() { printf '%s\n' "$1" | sed -n 's/^version: //p' | head -1; }

# (a) pin vs live — sync_contract.sh exit codes: 0 up-to-date, 3 version/data-only bump (soft, info),
# 2 structural drift, other non-zero = fetch/other failure. Capture output for the log + Slack summary.
soft_seen=0
sync_rc=0
sync_out="$("$SCRIPT_DIR/sync_contract.sh" 2>&1)" || sync_rc=$?
if [ "$sync_rc" -eq 3 ]; then
  # Version/data-only bump: the consumer is functionally up to date (coverage green, client matches
  # the pin) — only the version literal lags. Informational, not a page; refresh the pin at leisure.
  soft_seen=1
  echo "INFO: version/data-only bump — refresh the pin at leisure" >&2
  printf '%s\n' "$sync_out" >&2
  ver="$(_drift_version "$sync_out")"
  slack_notify ":information_source:" "Chokepoints read-API — version/data-only bump${ver:+ ($ver)}" \
    "*change:* version/data-only — no path or schema delta
*build impact:* none (coverage test stays green)
*action:* refresh the pin at leisure — \`cp openapi.live.json openapi.json && gen_client.sh\`" \
    "$(_drift_detail "$sync_out")"
elif [ "$sync_rc" -ne 0 ]; then
  # Structural drift OR fetch failure — a real problem: red alarm.
  msg="pinned spec has drifted from live — accept the diff then rerun gen_client.sh"
  echo "NOT up to date: $msg" >&2
  printf '%s\n' "$sync_out" >&2
  ver="$(_drift_version "$sync_out")"
  detail="$(_drift_detail "$sync_out")"
  [ -n "$detail" ] || detail="$(printf '%s\n' "$sync_out" | tail -20)" # e.g. a fetch failure has no summary
  slack_notify ":rotating_light:" "Chokepoints read-API — $msg${ver:+ ($ver)}" \
    "*action:* review the diff, then \`cp openapi.live.json openapi.json && gen_client.sh\`
*build impact:* the contract-coverage test fails until the client is regenerated" \
    "$detail"
  exit 1
else
  printf '%s\n' "$sync_out"
fi

# (b) client vs pin
if [ ! -f "$STAMP" ]; then
  msg="client not generated (no $STAMP) — run gen_client.sh"
  echo "NOT up to date: $msg" >&2
  slack_notify_text ":warning: Chokepoints read-API — $msg"
  exit 1
fi
want="$(_sha256 "$SPEC")"; have="$(cat "$STAMP")"
if [ "$want" != "$have" ]; then
  msg="generated client is stale vs the pin — run gen_client.sh"
  echo "NOT up to date: $msg" >&2
  echo "  pin=$want  client=$have" >&2
  slack_notify ":warning:" "Chokepoints read-API — $msg" \
    "*pin:* \`$want\`
*client:* \`$have\`" ""
  exit 1
fi

echo "up to date: pin matches live AND client matches pin"
# A pending soft bump means the pin lags live, so don't also claim "fully up to date".
if [ "$HEARTBEAT" = 1 ] && [ "${soft_seen:-0}" != 1 ]; then
  slack_notify_text ":white_check_mark: Chokepoints read-API consumer — alive & fully up to date ($(date -u +%FT%TZ))"
fi
