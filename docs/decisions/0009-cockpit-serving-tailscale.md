# 0009 — Cockpit serving over Tailscale

**Status:** Accepted · 2026-06-22

## Context

The cockpit is internal and must be reachable **only** on the tailnet
(`https://srv1100990.tail880531.ts.net`), never on the public internet (`CLAUDE.md`). It also needs to
run under the Docker-only rule. The production server (built SPA + editable `/api`) is a Node process
(ADR 0005).

## Decision

- The cockpit runs as a dedicated Docker Compose service (`cockpit`) built from the same `tools` image,
  command `npm --workspace @ag/cockpit start`, `restart: unless-stopped`.
- Inside the container it binds `0.0.0.0:8787` (isolated network); the host **publishes only on
  `127.0.0.1:8787`** — never `0.0.0.0`.
- **`tailscale serve --bg 8787`** (host-level, like other harness/host tooling — outside Docker-only)
  fronts it as tailnet-only HTTPS with a Let's Encrypt cert. **No `tailscale funnel`** → never public.
- No application auth in V1: the tailnet + loopback publish is the boundary. Inputs are still
  zod-validated and the collection name allowlisted (ADR 0005), so a hostile payload can't corrupt data.

Runbook: `docs/cockpit-serving.md`.

## Consequences

- Reachable at `https://srv1100990.tail880531.ts.net/` for tailnet devices only; verified health +
  SPA + `funnel status` = tailnet only.
- Two host-level prerequisites survive reboots independently: the Compose service (restart policy) and
  the persisted `tailscale serve` config. The runbook documents both.
- If multi-user auth is ever needed, add it before any thought of Funnel.
