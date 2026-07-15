#!/usr/bin/env bash
# Shared Slack notifier for the consumer + red-team crons.
#
# WHY: each cron used to POST a bare {"text": …} carrying raw tool output — `head -50` of an oasdiff
# YAML dump, or `tail -40` of the harness stdout — which Slack rendered as an unreadable wall. This
# helper builds a Block Kit payload (header + summary fields + a code-fenced detail block) so callers
# pass a SUMMARY, not raw output. Source it; it defines slack_notify / slack_notify_text.
#
# Env:
#   SLACK_WEBHOOK_URL  incoming-webhook URL; unset → silent no-op (unless SLACK_DRY_RUN=1).
#   SLACK_DRY_RUN=1    print the composed JSON to stdout instead of POSTing (tests; validate with `jq .`).
#
# Guardrail: no secrets are embedded here — callers pass already-summarised, human-readable text only.

# Minimal JSON-string escaper (quotes, backslashes, tabs, CR, then newlines -> \n). Single source of
# truth; the crons used to duplicate this verbatim.
slack_json_escape() {
  printf '%s' "$1" \
    | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/\t/\\t/g' -e 's/\r//g' \
    | sed ':a;N;$!ba;s/\n/\\n/g'
}

# _slack_post <json> — POST a ready Slack payload, or print it under SLACK_DRY_RUN. Internal.
_slack_post() {
  local payload="$1"
  if [ "${SLACK_DRY_RUN:-0}" = "1" ]; then
    if command -v jq >/dev/null 2>&1; then printf '%s' "$payload" | jq .; else printf '%s\n' "$payload"; fi
    return 0
  fi
  [ -n "${SLACK_WEBHOOK_URL:-}" ] || return 0
  curl -sf -X POST -H 'Content-Type: application/json' --data "$payload" "$SLACK_WEBHOOK_URL" >/dev/null \
    || echo "warn: Slack notify failed (webhook unreachable?)" >&2
}

# slack_notify <emoji> <title> <fields_mrkdwn> <detail_raw>
#   emoji         a Slack shortcode, e.g. :rotating_light: (rendered in the header via emoji:true)
#   title         one-line plain-text headline
#   fields_mrkdwn optional mrkdwn (key/value lines, "\n"-separated); "" to omit that block
#   detail_raw    optional raw text wrapped in a ``` code block; capped to 50 lines; "" to omit
slack_notify() {
  local emoji="$1" title="$2" fields="${3:-}" detail="${4:-}"
  local header blocks
  header="$(printf '%s %s' "$emoji" "$title")"
  blocks="{\"type\":\"header\",\"text\":{\"type\":\"plain_text\",\"text\":\"$(slack_json_escape "$header")\",\"emoji\":true}}"
  if [ -n "$fields" ]; then
    blocks="$blocks,{\"type\":\"section\",\"text\":{\"type\":\"mrkdwn\",\"text\":\"$(slack_json_escape "$fields")\"}}"
  fi
  if [ -n "$detail" ]; then
    # Line-based cap (never cuts mid-character, unlike a byte/char cut) — well under Slack's 3000-char limit.
    local maxlines=50 total body
    total="$(printf '%s\n' "$detail" | grep -c '' || true)"
    body="$(printf '%s\n' "$detail" | head -n "$maxlines")"
    if [ "${total:-0}" -gt "$maxlines" ]; then
      body="$body"$'\n'"…(truncated, $((total - maxlines)) more lines)"
    fi
    body="\`\`\`"$'\n'"$body"$'\n'"\`\`\`"
    blocks="$blocks,{\"type\":\"section\",\"text\":{\"type\":\"mrkdwn\",\"text\":\"$(slack_json_escape "$body")\"}}"
  fi
  # `text` fallback (mobile notifications / legacy clients) mirrors the header line.
  _slack_post "{\"text\":\"$(slack_json_escape "$header")\",\"blocks\":[$blocks]}"
}

# slack_notify_text <text> — a single mrkdwn section, for short one-line notices (no header/detail).
slack_notify_text() {
  _slack_post "{\"text\":\"$(slack_json_escape "$1")\",\"blocks\":[{\"type\":\"section\",\"text\":{\"type\":\"mrkdwn\",\"text\":\"$(slack_json_escape "$1")\"}}]}"
}
