#!/usr/bin/env bash
# Weekly red-team injection regression (ADR 0063) with Slack alerting.
#
# Mirrors the consumer freshness cron (scripts/consumer/check_client.sh): loads .env, POSTs to Slack
# via the same _notify_slack helper. Runs the real-model injection corpus in the `tools` container
# (Docker-only rule); alerts on REGRESSION. With --heartbeat it also posts on SUCCESS — a weekly
# dead-man's switch: if the green ping stops arriving, the cron/host itself is dead.
#
# Secrets stay out of git: OPENAI_API_KEY + OPENAI_MODEL come from docker/.env (gitignored);
# SLACK_WEBHOOK_URL is reused from scripts/consumer/.env if not already set. No webhook → silent no-op.
#
# Cron (host, deploy user) — installed alongside the consumer checks:
#   40 8 * * 1 /usr/bin/flock -n /tmp/redteam_injection.lock \
#     /home/deploy/app-geo/scripts/redteam-injection-cron.sh --heartbeat \
#     >> /home/deploy/app-geo/scripts/redteam-injection.log 2>&1
set -euo pipefail
# cron has a minimal PATH; make sure docker + coreutils are found.
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
COMPOSE="docker compose -f $ROOT/docker/docker-compose.yml"
LABEL="Red-team injection regression"

HEARTBEAT=0
QUICK=""
for a in "$@"; do
  case "$a" in
    --heartbeat) HEARTBEAT=1 ;;
    --quick) QUICK="--quick" ;;
    *) echo "unknown option: $a" >&2; exit 2 ;;
  esac
done

# Load OpenAI creds (docker/.env) + Slack webhook (reuse consumer/.env only if not already provided).
# `set -e` is lifted here: docker/.env defines UID= (a readonly bash var) whose assignment would abort
# the script; the stderr noise is harmless and suppressed.
set +e
set -a
[ -f "$ROOT/docker/.env" ] && . "$ROOT/docker/.env" 2>/dev/null
if [ -z "${SLACK_WEBHOOK_URL:-}" ] && [ -f "$SCRIPT_DIR/consumer/.env" ]; then . "$SCRIPT_DIR/consumer/.env" 2>/dev/null; fi
set +a
set -e

# Minimal JSON-string escaper + Slack POST — identical to scripts/consumer/check_client.sh.
_json_escape() {
  printf '%s' "$1" \
    | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/\t/\\t/g' -e 's/\r//g' \
    | sed ':a;N;$!ba;s/\n/\\n/g'
}
_notify_slack() {
  [ -n "${SLACK_WEBHOOK_URL:-}" ] || return 0
  local data
  data="{\"text\":\"$(_json_escape "$1")\"}"
  curl -sf -X POST -H 'Content-Type: application/json' --data "$data" "$SLACK_WEBHOOK_URL" >/dev/null \
    || echo "warn: Slack notify failed (webhook unreachable?)" >&2
}

if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "SKIP: OPENAI_API_KEY unset — cannot run the real regression" >&2
  _notify_slack ":warning: $LABEL — skipped: OPENAI_API_KEY not set on the host"
  exit 1
fi

cd "$ROOT"
set +e
out="$($COMPOSE run --rm \
  -e LLM_ENABLED=true -e OPENAI_API_KEY -e OPENAI_MODEL="${OPENAI_MODEL:-gpt-4o}" \
  tools npx tsx scripts/redteam-injection-regression.ts $QUICK 2>&1)"
rc=$?
set -e
printf '%s\n' "$out"

if [ "$rc" -ne 0 ]; then
  _notify_slack ":rotating_light: $LABEL — REGRESSION (exit $rc, $(date -u +%FT%TZ))"$'\n\n'"$(printf '%s\n' "$out" | tail -40)"
  exit "$rc"
fi

echo "OK: no injection regression"
if [ "$HEARTBEAT" = 1 ]; then
  _notify_slack ":white_check_mark: $LABEL — all clear ($(date -u +%FT%TZ))"$'\n'"$(printf '%s\n' "$out" | tail -6)"
fi
