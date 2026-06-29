#!/usr/bin/env bash
#
# Redeploy the internal cockpit (Tailscale-only) after a code change.
#
#   - Front-end change  → the SPA must be rebuilt (`dist/` is served statically by Express).
#   - Server change     → the Express process must be restarted (`tsx server/index.ts`, no watch).
#   - Both / unsure     → do both. That's the default and is always safe.
#
# The build runs INSIDE the `tools` container (Docker-only rule, cf. CLAUDE.md / ADR 0002). The
# restart is a compose orchestration command on the host. After redeploy, the API is health-checked.
#
# Usage:
#   scripts/redeploy-cockpit.sh                # build SPA + restart server (default)
#   scripts/redeploy-cockpit.sh --build-only   # front-end change only (rebuild, no restart)
#   scripts/redeploy-cockpit.sh --restart-only # server change only (restart, no rebuild)
#
set -euo pipefail

# Repo root = parent of this script's directory, regardless of where it's invoked from.
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE="docker compose -f $ROOT/docker/docker-compose.yml"
HEALTH_URL="http://127.0.0.1:8787/api/health"

DO_BUILD=1
DO_RESTART=1
case "${1:-}" in
  --build-only)   DO_RESTART=0 ;;
  --restart-only) DO_BUILD=0 ;;
  "")             ;;
  *) echo "unknown option: $1" >&2; echo "use --build-only | --restart-only | (none)" >&2; exit 2 ;;
esac

cd "$ROOT"

if [ "$DO_BUILD" -eq 1 ]; then
  echo "▸ Rebuilding cockpit SPA (inside tools container)…"
  $COMPOSE run --rm tools npm --workspace @ag/cockpit run build
fi

if [ "$DO_RESTART" -eq 1 ]; then
  echo "▸ Restarting cockpit service…"
  $COMPOSE restart cockpit
fi

echo "▸ Waiting for the API to come up…"
for _ in $(seq 1 40); do
  if curl -sf "$HEALTH_URL" >/dev/null 2>&1; then
    echo "✓ Cockpit healthy at $HEALTH_URL"
    exit 0
  fi
  sleep 0.5
done

echo "✗ Cockpit did not become healthy in time. Check: $COMPOSE logs --tail=50 cockpit" >&2
exit 1
