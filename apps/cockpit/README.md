# apps/cockpit

Internal **deployment cockpit** for the Applied Geopolitics launch. Six views — Cockpit, Kanban,
Roadmap, Quality Gates, Scorecard, Acquisition — over the E-light model
(`config / deliverables / milestones / metrics / contacts / quality_gates`).

**Internal only.** Served exclusively on the tailnet at `https://srv1100990.tail880531.ts.net` — never
public. See [`docs/cockpit-serving.md`](../../docs/cockpit-serving.md) and
[ADR 0009](../../docs/decisions/0009-cockpit-serving-tailscale.md).

## Shape

- `src/` — React + Vite + TS + Tailwind front end. `pages/` (6 views), `components/` (ui + layout),
  `lib/` (calculations, filters, api client, export), `store.tsx` (data + optimistic edits).
- `server/` — small **Express** backend: serves the built SPA and an editable `/api`
  (`GET /api/state`, narrow `PUT` per collection), zod-validated, atomic JSON writes (ADR 0005).
- `data/` — the E-light JSON (seeded from the pack; **candidates pending validation**, not facts).

Shared: `@ag/schema/cockpit` (types + zod), `@ag/tokens` (design), `@ag/cvi`.

## Commands (Docker-only)

```bash
docker compose -f docker/docker-compose.yml run --rm tools npm --workspace @ag/cockpit run typecheck
docker compose -f docker/docker-compose.yml run --rm tools npm --workspace @ag/cockpit run test
docker compose -f docker/docker-compose.yml run --rm tools npm --workspace @ag/cockpit run build
docker compose -f docker/docker-compose.yml up -d cockpit       # production server on 127.0.0.1:8787
```

Editing in the UI (move a card, change a status/progress, advance a contact) is **persisted** to
`data/*.json` through the backend. No auth in V1 — the tailnet is the boundary.
