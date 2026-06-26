# HDDE — Hidden Dependency Discovery Engine (`@ag/hdde-api` + `@ag/hdde-web`)

Expert-guided interview cockpit that reveals an enterprise's **hidden geopolitical dependencies** from
a visible critical actor. Public-Internet behind app auth at `hdde.applied-geopolitics.com`. See ADRs
0032 (TS port), 0033 (auth surface), 0034 (OpenAI red team), 0035 (chokepoints/CVI coupling).

## Architecture

- **`apps/hdde-api`** — Express + SQLite (`better-sqlite3`). `server/`:
  - `engine/` — pack loader (+ `pack_hash`), pack-driven scoring, verdict, diagnostic builder.
  - `db/` — schema + migrations + repo. `auth/` — bcrypt + opaque session cookies + seeding CLI.
  - `routers/` — auth, pack, cases (interview / evidence / diagnostics / red-team / exports / enrichment).
  - `llm/` — OpenAI `gpt-4o` red team (strict JSON validation; offline facade when disabled).
  - `exports/` — nunjucks → Markdown FR/EN + `diagnostic_packet.json`.
  - `integrations/` — chokepoints (read scope, server-side, anti-tainted) + CVI (local).
  - `domain_packs/enterprise_hidden_dependency_discovery/` — the methodology (YAML + templates).
- **`apps/hdde-web`** — React + Vite + Tailwind SPA (French UI).

## Doctrine (hard rules)

- `LLM output = adversarial suggestion ≠ evidence ≠ validated diagnosis ≠ decision`. Suggestions stay
  `pending` until an analyst accepts them.
- Verdict (`monitor | prepare | act | escalate`) is an operational **posture**, never an automatic decision.
- Chokepoints enrichment is **read scope only, server-side, tainted records filtered** (ADR 0035).
- Every packet carries the `pack_hash` + an answers snapshot (traceability).

## Run (Docker-only)

```bash
# tests + typecheck
docker compose -f docker/docker-compose.yml run --rm tools npm --workspace @ag/hdde-api test
docker compose -f docker/docker-compose.yml run --rm tools npm --workspace @ag/hdde-api run typecheck

# build the SPA (Caddy serves apps/hdde-web/dist)
docker compose -f docker/docker-compose.yml run --rm tools npm --workspace @ag/hdde-web run build

# seed the first account (no self-signup)
docker compose -f docker/docker-compose.yml run --rm tools \
  npm --workspace @ag/hdde-api run seed:user -- you@example.com "a-long-password" owner_admin

# seed the demo enterprise case (Dürr Group, illustrative — ADR 0036): full roster of
# suppliers / customers / sites / partners, per-actor scoring + concentration synthesis
docker compose -f docker/docker-compose.yml run --rm tools \
  npm --workspace @ag/hdde-api run seed:demo -- you@example.com

# run the production service (host loopback; Caddy fronts hdde.applied-geopolitics.com)
docker compose -f docker/docker-compose.yml up -d hdde public
```

Config: see `apps/hdde-api/.env.example` and the `hdde` service env in `docker/docker-compose.yml`
(`OPENAI_API_KEY`, `HDDE_SESSION_SECRET`, `CHOKEPOINTS_API_TOKEN` read scope). Runtime data
(`data/hdde.sqlite`, `data/exports/`) is git-ignored.
