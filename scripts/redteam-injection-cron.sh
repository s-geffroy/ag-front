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

# Block Kit Slack notifier (shared; single source of truth for the JSON escaper + the POST).
# shellcheck source=lib/slack.sh
. "$SCRIPT_DIR/lib/slack.sh"

# Parse the harness stdout into a compact one-line surfacing summary + failing rows, so the Slack
# alert carries a readable digest instead of a raw 40-line stdout tail.
_summ_model() { printf '%s\n' "$1" | sed -n 's/.*(model \(.*\)).*/\1/p' | head -1; }
_summ_surfacing() {
  printf '%s\n' "$1" | sed -n '/Surfacing rate/,/^$/p' | grep -E '[0-9]+/[0-9]+' \
    | sed -e 's/^ *//' -e 's/  */ /g' | awk '{ printf "%s%s", (NR > 1 ? " · " : ""), $0 }'
}
_summ_hard() { printf '%s\n' "$1" | sed -n 's/^HARD failures[^:]*: \([0-9]*\).*/\1/p' | tail -1; }
_summ_flaky() { printf '%s\n' "$1" | sed -n 's/^Flaky (.*): \([0-9]*\).*/\1/p' | tail -1; }
# Only the rows that matter for triage: contamination/leak (❌) and hard errors — never RESULT/summary lines.
_summ_fails() { printf '%s\n' "$1" | grep -E '❌|ERROR' | grep -v 'RESULT:' || true; }

if [ -z "${OPENAI_API_KEY:-}" ]; then
  echo "SKIP: OPENAI_API_KEY unset — cannot run the real regression" >&2
  slack_notify_text ":warning: $LABEL — skipped: OPENAI_API_KEY not set on the host"
  exit 1
fi

cd "$ROOT"
set +e
# LLM_TIMEOUT_MS: the heavier red-team probes can be slow; give them more headroom than the 30s
# product default so a transient slow call doesn't abort (the harness also retries transient aborts).
out="$($COMPOSE run --rm \
  -e LLM_ENABLED=true -e OPENAI_API_KEY -e OPENAI_MODEL="${OPENAI_MODEL:-gpt-4o}" \
  -e LLM_TIMEOUT_MS="${LLM_TIMEOUT_MS:-60000}" \
  tools npx tsx scripts/redteam-injection-regression.ts $QUICK 2>&1)"
rc=$?
set -e
printf '%s\n' "$out"

# Digest for Slack (shared across the REGRESSION + heartbeat branches).
model="$(_summ_model "$out")"
surfacing="$(_summ_surfacing "$out")"
hard="$(_summ_hard "$out")"
flaky="$(_summ_flaky "$out")"
flaky="${flaky:-0}"

if [ "$rc" -ne 0 ]; then
  fields="*model:* ${model:-?}
*HARD failures:* ${hard:-?}   ·   *flaky (non-hard):* ${flaky}
*surfacing:* ${surfacing:-n/a}"
  slack_notify ":rotating_light:" "$LABEL — REGRESSION (exit $rc, $(date -u +%FT%TZ))" \
    "$fields" "$(_summ_fails "$out")"
  exit "$rc"
fi

echo "OK: no injection regression"
if [ "$HEARTBEAT" = 1 ]; then
  fields="*model:* ${model:-?}
*surfacing:* ${surfacing:-n/a}
*HARD failures:* ${hard:-0}   ·   *flaky (non-hard):* ${flaky}"
  slack_notify ":white_check_mark:" "$LABEL — all clear ($(date -u +%FT%TZ))" "$fields" ""
fi
