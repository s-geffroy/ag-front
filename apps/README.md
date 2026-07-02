# apps/

Applications du monorepo Applied Geopolitics. Le socle est **en service** : site public en ligne,
cockpit interne servi via Tailscale, HDDE et VERDICT publiés derrière authentification applicative.
État détaillé et reste-à-faire : `docs/PLAN.md` ; décisions : `docs/decisions/`.

- `public/` — site public `www.applied-geopolitics.com`, stack **Astro** (SSG + content collections).
  **En ligne.** Identité « carte d'état-major » (ADR 0004/0010/0031).
- `cockpit/` — cockpit interne de pilotage, **éditable** via petit back Express. **Tailscale-only**,
  jamais public. Architecture par métier + workspaces config-driven, contradiction LLM éditoriale
  (ADR 0005/0009/0038/0039).
- `hdde-api/` + `hdde-web/` — **HDDE** (Hidden Dependency Discovery Engine), `hdde.applied-geopolitics.com`,
  Internet public **derrière auth**. Express + SQLite + red team OpenAI, exports FR/EN (ADR 0032–0036/0040).
- `verdict-api/` + `verdict-web/` — **VERDICT** (arbitrage de décision, tier Premium),
  `verdict.applied-geopolitics.com`, conteneur dédié (port 8095, SQLite propre). Pré-remplissage depuis
  le packet HDDE validé + CVI + chokepoints (ADR 0041–0043).
- `lead-api/` — endpoint de capture de leads auto-hébergé `POST /api/lead`, derrière Caddy, alimente le
  pipeline Acquisition du cockpit (ADR 0006/0011).

Code partagé sous `packages/` : `chokepoints`, `cvi`, `schema`, `tokens`, `verdict`.

Tout le tooling passe par le service Docker `tools` (règle Docker-only, cf. `CLAUDE.md` et ADR 0002).
