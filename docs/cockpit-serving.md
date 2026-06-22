# Cockpit — serving runbook (Tailscale only)

The internal cockpit is served **only** on the tailnet at `https://srv1100990.tail880531.ts.net`.
Never public. Decision: [ADR 0009](decisions/0009-cockpit-serving-tailscale.md) (+ [0005](decisions/0005-cockpit-editable-local-backend.md)).

## Architecture

```
tailnet device ──HTTPS──> tailscale serve (host :443, tailnet only)
                              └─ proxy ─> 127.0.0.1:8787 (host loopback)
                                              └─ docker publish ─> cockpit container :8787
                                                                      └─ Express: built SPA + /api
```

## Start / update

```bash
# 1. build the SPA (Docker-only)
docker compose -f docker/docker-compose.yml run --rm tools npm --workspace @ag/cockpit run build

# 2. run the production server (detached, restarts on reboot)
docker compose -f docker/docker-compose.yml up -d cockpit

# 3. expose it on the tailnet (host-level, once; config persists)
tailscale serve --bg 8787
```

Check:

```bash
curl -s https://srv1100990.tail880531.ts.net/api/health      # {"status":"ok"}
tailscale serve status                                        # "(tailnet only)"
tailscale funnel status                                       # must NOT be public
```

## Stop

```bash
docker compose -f docker/docker-compose.yml stop cockpit
tailscale serve --https=443 off          # remove the tailnet proxy
```

## Dev mode (hot reload, not for the tailnet)

```bash
docker compose -f docker/docker-compose.yml run --rm --service-ports tools \
  npm --workspace @ag/cockpit run dev
# Vite on 127.0.0.1:5173 proxies /api to the tsx server on 8787.
```

## Notes

- The container binds `0.0.0.0:8787` internally; the host publishes only on `127.0.0.1:8787`. Do not
  publish on `0.0.0.0`.
- No app auth in V1 — the tailnet is the boundary. Writes are zod-validated; collection names are
  allowlisted (no path traversal).
- After a reboot: `docker compose ... up -d cockpit` is automatic (restart policy); `tailscale serve`
  config persists. If serving was reset, re-run `tailscale serve --bg 8787`.
