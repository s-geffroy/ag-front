# app-geo — Plan : ce qui reste à faire

## Contexte

La reproduction de la config agent (skills + settings + `CLAUDE.md` + plugins) est **terminée et
vérifiée** :
- `.claude/skills/` = 20 skills, empreinte `1c5049f6…` (byte-identique à la source) ;
- `.claude/settings.json` (2 plugins) ;
- `CLAUDE.md` adapté à app-geo (2 UI, monorepo, Docker-only) ;
- plugins `commit-commands` + `security-guidance` installés (`/reload-plugins` pour appliquer).

Le projet est aujourd'hui un **squelette** (`.claude/` + `CLAUDE.md` + `app-geo.code-workspace`).
Tout le code applicatif reste à construire : **monorepo deux-UI** (`apps/public` +
`apps/cockpit`), sous la règle **Docker-only**, en *clean-room rebuild* depuis le pack de référence
`/home/deploy/sources` (à LIRE, pas à copier).

> Méthode (cf. `CLAUDE.md`) : avant tout code non trivial → `brainstorming` → `writing-plans` →
> `test-driven-development`. Chaque décision matérielle ci-dessous = un ADR sous `docs/decisions/`.

## Décisions — désormais tranchées (ADR sous `docs/decisions/`)

| # | Décision | Résolution |
|---|---|---|
| Stack site public | Astro vs Next.js vs React+Vite | **Astro** (SSG + content collections) — ADR 0004 |
| Layout monorepo | npm workspaces `apps/*` + `packages/*` | acté — ADR 0003 |
| Docker tools | image `tools` Node + agent-browser/Chrome | acté + vérifié — ADR 0002 |
| Modèle de données | un seul modèle vs séparation | **2 modèles** content / cockpit (`@ag/schema`) — ADR 0007 |
| Cockpit lecture seule vs éditable | spec = read-only/no-backend | **éditable** via petit back local (Tailscale) — ADR 0005 |
| Capture de leads / newsletter | service externe vs endpoint | **endpoint auto-hébergé** — ADR 0006 (contrat API fourni par l'utilisateur) |
| Numérotation ADR | renvois `CLAUDE.md` 0001/0002/0027/0029 | réconciliée + `docs/decisions/README.md` + `docs/skills/README.md` |
| Packages partagés | `@ag/ui` React ? | **non** — types/logic/tokens seulement — ADR 0008 |

## Phasage

### Phase 0 — Bootstrap repo & infra (socle) — ✅ FAIT (2026-06-22)
- `git init` (branche `main`) + `.gitignore` ; `package.json` racine `workspaces: ["apps/*","packages/*"]` ;
  `tsconfig.base.json` strict ; Prettier.
- **Docker-only** : `docker/tools.Dockerfile` (Node 22 + agent-browser + libs Chromium),
  `docker/docker-compose.yml` (service `tools`, UID/GID via `docker/.env`).
- **Vérifié** : `build tools` OK ; conteneur → Node v22.23, npm 10.9, agent-browser 0.27, runtime 1000:1000.
- **ADR 0001/0002** + `docs/decisions/README.md` + `docs/skills/README.md` (renvois `CLAUDE.md` résolus).

### Phase 1 — `packages/` partagés — ✅ FAIT (2026-06-22)
- `@ag/schema` : modèle de données zod + types, **2 namespaces** `content` (corridors/flux/fiches/
  notes/dossiers/signaux/seuils/scénarios) et `cockpit` (E-light) — ADR 0007.
- `@ag/cvi` : CVI (8 dimensions, échelles qualitative/0-5/0-100, **règle dure** 0-100→méthodo). **TDD** : 9 tests verts.
- `@ag/tokens` : tokens sobres + preset Tailwind partagés (pas de `@ag/ui` React — ADR 0008).
- Vérifié dans `tools` : `npm install`, `npm run typecheck`, `npm run test` (cvi 9 + schema 4) verts.

> **⏸ POINT D'ARRÊT / REVUE** — fin du socle. Les phases ci-dessous ne démarrent qu'après revue.

### Phase 2 — `apps/cockpit` (interne, Tailscale) — ✅ FAIT (2026-06-22)
Stack : React + Vite + TS + Tailwind + primitives shadcn-style ; **back Express éditable** persistant les
JSON E-light (zod-validé, écriture atomique, allowlist). Consomme `@ag/schema/cockpit` + `@ag/tokens` + `@ag/cvi`.
- **6 vues** livrées : Cockpit, Kanban (édition via panneau), Roadmap (90j/12m), Quality Gates, Scorecard, Acquisition.
- Édition persistée vérifiée (PUT → fichier) ; entrées invalides rejetées (400/404).
- Seed E-light dérivé du pack (candidats *pending validation*).
- **Servi via Tailscale** : `https://srv1100990.tail880531.ts.net` (tailnet only, non public) — ADR 0009,
  runbook `docs/cockpit-serving.md`. Vérifié : 6 vues (screenshots agent-browser), health HTTPS, `funnel` off.
- **6 vues** : Cockpit (santé/priorités/blocages), Kanban (7 colonnes), Roadmap (90 j + 12 mois),
  Quality Gates, Scorecard (KPIs), Acquisition (pipeline contacts).
- Garde-fous data-integrity : l'UI consomme des données **dérivées**, ne mute pas le canonique.
- **Skills** : `frontend-design` (UI), `owasp-security` (auth/inputs même derrière Tailscale),
  `thinking-theory-of-constraints` / `thinking-leverage-points` (analyse CVI/corridors).

### Phase 3 — `apps/public` (www.applied-geopolitics.com) — **Astro** (ADR 0004)
- Scaffold Astro (SSG + content collections) ; FR principal, SEO « slow asset » ; consomme
  `@ag/schema/content` (schémas de collections) + `@ag/tokens`.
- Pages : landing, Atlas, dossiers, notes, méthode CVI, offres Basic/Standard/Premium, contact/about.
- Capture de leads + newsletter → **endpoint auto-hébergé** (ADR 0006 ; contrat API fourni par l'utilisateur).
- **Skills** : `frontend-design`, `owasp-security` (formulaires/inputs publics = surface d'attaque),
  `canvas-design` (visuels Atlas/dossiers si livrables PDF/poster).

### Phase 4 — Déploiement
- **Public** : `apps/public` → `www.applied-geopolitics.com` (DNS/hébergement/CDN à décider — ADR).
- **Interne** : `apps/cockpit` → `tailscale serve` / `funnel`-off sur
  `https://srv1100990.tail880531.ts.net` (tailnet `tail880531.ts.net`). **Jamais public.**
- Build de prod via le service `tools` Docker ; smoke test avec `agent-browser` (dans le conteneur).

## Vérification (par phase, Docker-only)
1. `docker compose … build tools` réussit ; aucune commande projet lancée sur l'hôte.
2. `npm --workspace apps/cockpit run dev` (dans `tools`) sert le cockpit ;
   `agent-browser open http://localhost:5173` → screenshot des 6 vues.
3. `npm --workspace apps/public run dev` (dans `tools`) sert le site public.
4. Tests `packages/cvi` verts (TDD) avant câblage UI.
5. Déploiement : `www.applied-geopolitics.com` résout en public ; cockpit **uniquement** joignable
   via Tailscale (vérifier qu'il n'est pas exposé en clair).

## Prochaine action recommandée
Socle (Phases 0–1) **terminé et vérifié**. **Revue** du socle, puis trancher l'ordre des apps
(cockpit Phase 2 vs public Phase 3) et scaffolder l'app retenue. Le **contrat d'interface API** (back
cockpit / endpoint lead) et le **remote GitHub** sont fournis par l'utilisateur au moment voulu.
