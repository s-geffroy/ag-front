# docker/ — the `tools` service (Docker-only rule)

All project tooling runs inside the `tools` container. **Never run npm/build/test on the host**
(cf. `CLAUDE.md`, ADR 0002).

## Setup

```bash
cp docker/.env.example docker/.env            # set UID/GID if not 1000:1000
docker compose -f docker/docker-compose.yml build tools
```

## Everyday use

```bash
# install workspaces
docker compose -f docker/docker-compose.yml run --rm tools npm install
# typecheck / tests across packages
docker compose -f docker/docker-compose.yml run --rm tools npm run typecheck
docker compose -f docker/docker-compose.yml run --rm tools npm run test
# a one-off shell
docker compose -f docker/docker-compose.yml run --rm tools
```

Dev servers (later phases) are port-mapped: cockpit `5173` (Vite), public `4321` (Astro). Run e.g.
`... run --rm --service-ports tools npm --workspace apps/cockpit run dev`.

## Redeploying the cockpit (after a code change)

The cockpit runs as the `cockpit` compose service via `tsx server/index.ts` (**no watch**) and serves
the built `apps/cockpit/dist` statically. A change is not live until you redeploy — use the script:

```bash
scripts/redeploy-cockpit.sh                # build SPA + restart server (default; always safe)
scripts/redeploy-cockpit.sh --build-only   # front change only (apps/cockpit/src/**) → rebuild dist/
scripts/redeploy-cockpit.sh --restart-only # server change only (apps/cockpit/server/**) → restart
```

The build runs inside `tools` (Docker-only rule); the script then restarts the service and
health-checks `http://127.0.0.1:8787/api/health`. Skipping the restart after a **server** change is
the classic "front updated but `/api/*` returns `unknown api route`" trap (stale Express process).

## agent-browser (one-time browser fetch)

The CLI is baked into the image; the Chromium it drives is downloaded once into the workspace cache
(`/workspace/.cache`, git-ignored):

```bash
docker compose -f docker/docker-compose.yml run --rm tools agent-browser install
docker compose -f docker/docker-compose.yml run --rm tools agent-browser --version
```

## Notes

- The container runs as your host UID/GID, so files written into the mounted repo stay yours.
- npm cache lives in the image (`/home/tools/.npm`); the browser cache persists in `/workspace/.cache`.
