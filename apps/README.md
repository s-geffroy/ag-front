# apps/

Applications du monorepo Applied Geopolitics. **Vide pour l'instant** : ce dépôt en est au stade
*fondations* (monorepo + Docker + packages partagés + ADRs). Les apps sont scaffoldées après la revue
du socle (cf. `docs/PLAN.md` et `docs/decisions/`).

- `apps/public/` — site public `www.applied-geopolitics.com` — stack **Astro** (ADR 0004) — *Phase 3*.
- `apps/cockpit/` — cockpit interne (Tailscale only), **éditable** via petit back (ADR 0005) — *Phase 2*.

Tout le tooling passe par le service Docker `tools` (règle Docker-only, cf. `CLAUDE.md` et ADR 0002).
