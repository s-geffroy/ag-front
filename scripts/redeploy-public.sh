#!/usr/bin/env bash
#
# Rebuild + ship the public site (www.applied-geopolitics.com) after a publication change (ADR 0069).
#
# The cockpit flips a document's frontmatter flag (published/draft) and touches the sentinel
# `apps/public/.publish-pending`. This host script is what actually rebuilds the static site and
# reloads Caddy — the cockpit (a container) never runs the build itself. The build runs INSIDE the
# `tools` container (Docker-only rule) and includes `check:munich`, the hard editorial gate (ADR 0037):
# a non-compliant published document breaks the build and is NOT shipped.
#
# Usage:
#   scripts/redeploy-public.sh                  # unconditional build + up -d public (manual / fallback)
#   scripts/redeploy-public.sh --if-pending     # build ONLY if a publication is pending (watcher mode)
#   scripts/redeploy-public.sh --refresh-signals # rebuild to re-pull LIVE consensus (ADR 0071), rate-limited
#
# Watcher (host, deploy user) — polls every 2 min, flock-guarded, logged:
#   */2 * * * * /usr/bin/flock -n /tmp/redeploy_public.lock \
#     /home/deploy/app-geo/scripts/redeploy-public.sh --if-pending \
#     >> /home/deploy/app-geo/scripts/redeploy-public.log 2>&1
#
# Signal-refresh cron (ADR 0071) — hourly is ample (consensus is a 24 h metric), separate lock:
#   17 * * * * /usr/bin/flock -n /tmp/redeploy_public_signals.lock \
#     /home/deploy/app-geo/scripts/redeploy-public.sh --refresh-signals \
#     >> /home/deploy/app-geo/scripts/redeploy-public.log 2>&1
#
set -euo pipefail
# cron has a minimal PATH; make sure docker + coreutils are found.
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="docker compose -f $ROOT/docker/docker-compose.yml"
SENTINEL="$ROOT/apps/public/.publish-pending"
LAST_BUILD="$ROOT/apps/public/.last-build"
LAST_SIGNAL_BUILD="$ROOT/apps/public/.last-signal-build"
# Floor between two signal refreshes; a stuck/overlapping run can't thrash. Override via env.
REFRESH_MIN_INTERVAL="${REFRESH_MIN_INTERVAL:-1200}" # 20 min

IF_PENDING=0
REFRESH_SIGNALS=0
case "${1:-}" in
  --if-pending)      IF_PENDING=1 ;;
  --refresh-signals) REFRESH_SIGNALS=1 ;;
  "")                ;;
  *) echo "unknown option: $1" >&2; echo "use --if-pending | --refresh-signals | (none)" >&2; exit 2 ;;
esac

cd "$ROOT"

if [ "$IF_PENDING" -eq 1 ]; then
  # Nothing was published since the last successful build → quiet no-op (the common case).
  if [ ! -e "$SENTINEL" ]; then exit 0; fi
  if [ -e "$LAST_BUILD" ] && [ ! "$SENTINEL" -nt "$LAST_BUILD" ]; then exit 0; fi
  echo "▸ [$(date -u +%FT%TZ)] publication pending — rebuilding public site…"
fi

if [ "$REFRESH_SIGNALS" -eq 1 ]; then
  # Rebuild UNCONDITIONALLY to re-pull the live derived consensus (and promoted news), but rate-limit
  # against a marker so overlapping crons can't thrash. `check:munich` still runs — a refresh can never
  # ship a non-compliant doc. When the consensus block is dark (ATLAS_CONSENSUS_PUBLIC unset) this just
  # re-pulls the same canonical data — harmless, and it keeps the timer warm for go-live day.
  if [ -e "$LAST_SIGNAL_BUILD" ]; then
    now="$(date +%s)"
    last="$(date -r "$LAST_SIGNAL_BUILD" +%s 2>/dev/null || echo 0)"
    if [ "$((now - last))" -lt "$REFRESH_MIN_INTERVAL" ]; then
      echo "▸ [$(date -u +%FT%TZ)] signal refresh skipped — last was $((now - last))s ago (< ${REFRESH_MIN_INTERVAL}s)."
      exit 0
    fi
  fi
  echo "▸ [$(date -u +%FT%TZ)] signal refresh — rebuilding public site to re-pull live consensus…"
fi

# Build the static site (check:munich runs first; a non-compliant doc fails here and is not shipped).
$COMPOSE run --rm tools npm --workspace @ag/public run build
# (Re)start Caddy so it serves the freshly built dist.
$COMPOSE up -d public

# Mark the build point only AFTER success, so a failed build retries on the next watcher tick. Any
# successful build re-pulled the live signals too, so it also rearms the signal-refresh timer.
touch "$LAST_BUILD" "$LAST_SIGNAL_BUILD"
echo "✓ Public site rebuilt and served."
