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
#   scripts/redeploy-public.sh              # unconditional build + up -d public (manual / fallback)
#   scripts/redeploy-public.sh --if-pending # build ONLY if a publication is pending (watcher mode)
#
# Watcher (host, deploy user) — polls every 2 min, flock-guarded, logged:
#   */2 * * * * /usr/bin/flock -n /tmp/redeploy_public.lock \
#     /home/deploy/app-geo/scripts/redeploy-public.sh --if-pending \
#     >> /home/deploy/app-geo/scripts/redeploy-public.log 2>&1
#
set -euo pipefail
# cron has a minimal PATH; make sure docker + coreutils are found.
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="docker compose -f $ROOT/docker/docker-compose.yml"
SENTINEL="$ROOT/apps/public/.publish-pending"
LAST_BUILD="$ROOT/apps/public/.last-build"

IF_PENDING=0
case "${1:-}" in
  --if-pending) IF_PENDING=1 ;;
  "")           ;;
  *) echo "unknown option: $1" >&2; echo "use --if-pending | (none)" >&2; exit 2 ;;
esac

cd "$ROOT"

if [ "$IF_PENDING" -eq 1 ]; then
  # Nothing was published since the last successful build → quiet no-op (the common case).
  if [ ! -e "$SENTINEL" ]; then exit 0; fi
  if [ -e "$LAST_BUILD" ] && [ ! "$SENTINEL" -nt "$LAST_BUILD" ]; then exit 0; fi
  echo "▸ [$(date -u +%FT%TZ)] publication pending — rebuilding public site…"
fi

# Build the static site (check:munich runs first; a non-compliant doc fails here and is not shipped).
$COMPOSE run --rm tools npm --workspace @ag/public run build
# (Re)start Caddy so it serves the freshly built dist.
$COMPOSE up -d public

# Mark the build point only AFTER success, so a failed build retries on the next watcher tick.
touch "$LAST_BUILD"
echo "✓ Public site rebuilt and served."
