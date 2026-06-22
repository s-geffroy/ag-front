# 0010 — Public deployment via Caddy on the VPS

**Status:** Accepted · 2026-06-22

## Context

`apps/public` (Astro SSG) must be reachable publicly at `https://www.applied-geopolitics.com` with
valid TLS. Everything else already runs on this VPS (srv1100990, public IP `72.61.101.1`) under the
Docker-only rule; the cockpit uses the Tailscale interface. The domain's DNS is managed at **Hostinger**
and currently points elsewhere (`148.230.117.243`).

## Decision

Serve the static build from the VPS with **Caddy** (Docker `public` service), automatic HTTPS via
Let's Encrypt:

- Caddy serves `apps/public/dist` (read-only mount); `docker/Caddyfile` defines the site.
- Canonical host `www`; apex `applied-geopolitics.com` **301-redirects to www** (single SEO origin).
- HTTP→HTTPS forced; HTTP/3 enabled; hashed `_astro/*` assets long-cached.
- Ports bind the **public IP only** (`${PUBLIC_IP}:80/443`, not `0.0.0.0`) so they never collide with
  the cockpit's `tailscale serve` on the Tailscale interface (`100.94.106.73:443`).
- `restart: unless-stopped`; cert/state persist in named volumes (`caddy_data`, `caddy_config`).

Deployment is a two-step loop: `npm --workspace @ag/public run build` then
`docker compose ... up -d public`. The cert provisions automatically once DNS points at `PUBLIC_IP`.

Runbook + Hostinger DNS method: `docs/public-deploy.md`.

## Consequences

- Public site and internal cockpit share one VPS but separate network interfaces and ports.
- The TLS cert cannot issue until the Hostinger A records point at `72.61.101.1` and ports 80/443 are
  open — Caddy retries until then, no manual cert step.
- Static hosting only; the lead endpoint (ADR 0006) is a separate, later service.
