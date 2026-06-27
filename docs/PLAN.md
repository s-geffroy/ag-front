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
`apps/cockpit`), sous la règle **Docker-only**, en _clean-room rebuild_ depuis le pack de référence
`/home/deploy/sources` (à LIRE, pas à copier).

> Méthode (cf. `CLAUDE.md`) : avant tout code non trivial → `brainstorming` → `writing-plans` →
> `test-driven-development`. Chaque décision matérielle ci-dessous = un ADR sous `docs/decisions/`.

## Décisions — désormais tranchées (ADR sous `docs/decisions/`)

| #                                 | Décision                                  | Résolution                                                                  |
| --------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------- |
| Stack site public                 | Astro vs Next.js vs React+Vite            | **Astro** (SSG + content collections) — ADR 0004                            |
| Layout monorepo                   | npm workspaces `apps/*` + `packages/*`    | acté — ADR 0003                                                             |
| Docker tools                      | image `tools` Node + agent-browser/Chrome | acté + vérifié — ADR 0002                                                   |
| Modèle de données                 | un seul modèle vs séparation              | **2 modèles** content / cockpit (`@ag/schema`) — ADR 0007                   |
| Cockpit lecture seule vs éditable | spec = read-only/no-backend               | **éditable** via petit back local (Tailscale) — ADR 0005                    |
| Capture de leads / newsletter     | service externe vs endpoint               | **endpoint auto-hébergé** — ADR 0006 (contrat API fourni par l'utilisateur) |
| Numérotation ADR                  | renvois `CLAUDE.md` 0001/0002/0027/0029   | réconciliée + `docs/decisions/README.md` + `docs/skills/README.md`          |
| Packages partagés                 | `@ag/ui` React ?                          | **non** — types/logic/tokens seulement — ADR 0008                           |

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
- Seed E-light dérivé du pack (candidats _pending validation_).
- **Servi via Tailscale** : `https://srv1100990.tail880531.ts.net` (tailnet only, non public) — ADR 0009,
  runbook `docs/cockpit-serving.md`. Vérifié : 6 vues (screenshots agent-browser), health HTTPS, `funnel` off.
- **6 vues** : Cockpit (santé/priorités/blocages), Kanban (7 colonnes), Roadmap (90 j + 12 mois),
  Quality Gates, Scorecard (KPIs), Acquisition (pipeline contacts).
- Garde-fous data-integrity : l'UI consomme des données **dérivées**, ne mute pas le canonique.
- **Skills** : `frontend-design` (UI), `owasp-security` (auth/inputs même derrière Tailscale),
  `thinking-theory-of-constraints` / `thinking-leverage-points` (analyse CVI/corridors).

### Phase 3 — `apps/public` (www.applied-geopolitics.com) — ✅ FAIT (2026-06-22)

- Astro (SSG + content collections), FR, SEO (sitemap, robots, OG, canonical, RSS notes). Design sobre
  via `@ag/tokens` ; dimensions CVI via `@ag/cvi`.
- 8 sections : accueil, Atlas (liste + fiches), dossiers, notes, méthode CVI, offres, à propos, contact.
- Seed de contenu = candidates pending validation (3 notes, 3 fiches Atlas, 1 dossier) + sources/confiance.
- **Déployé via Caddy** (HTTPS auto Let's Encrypt) sur le VPS `72.61.101.1`, ports liés à l'IP publique
  (pas de conflit avec le tailscale serve du cockpit) — ADR 0010, runbook `docs/public-deploy.md`.
- **En ligne** : DNS repointé (A `@`/`www` → `72.61.101.1`), certificat Let's Encrypt émis, Caddy
  sert `apps/public/dist` en HTTPS. `https://www.applied-geopolitics.com` répond 200. Pour publier du
  contenu : rebuild (Caddy reprend le `dist` monté, sans redémarrage).
- Lead capture : **branchée** sur l'endpoint auto-hébergé `POST /api/lead` (service `apps/lead-api`,
  derrière Caddy, same-origin) — zod + honeypot + rate-limit ; les leads alimentent le pipeline
  Acquisition du cockpit ; email SMTP optionnel (ADR 0006/0011). Repli `mailto` si réseau KO.
- **Mode nuit** du site public : tokens sémantiques (vars CSS) + toggle header, défaut préférence système.
- **Atlas ↔ Chokepoints Read API** : intégration **au build** via `@ag/chokepoints` (client typé, scope
  `read`, taint-aware), section base de données + pages détail `/atlas/chokepoints/[id]` + **carte
  Leaflet** (`/atlas/carte`, export GeoJSON). Dégradation gracieuse sans token. Token build-only (ADR 0012).
- **Scope `read_tainted` = interne uniquement** (ADR 0013) : le **site public reste clair** ; les données
  restreintes ne vivent que dans le **cockpit** (vue **Exploration**, Tailscale, proxy serveur + token
  tainted dédié). 0 tainted aujourd'hui ; frontière prospective.
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

## Suivi sécurité / dette (post-revue)

- [ ] **Rotation des tokens Chokepoints API** — `CHOKEPOINTS_API_TOKEN` (read) et
      `CHOKEPOINTS_API_TOKEN_TAINTED` (read_tainted) dans `docker/.env`. Ils ont été stockés en clair
      avec des permissions `644` ; le fichier est désormais en `600` et n'a jamais été versionné, mais
      une rotation reste la bonne hygiène (action manuelle côté admin de l'API Chokepoints). Voir la
      revue complète (commit `7024944`).

## Workflow de publication — état (2026-06-27)

Le site public est **en ligne** ; publier = rebuild (Caddy sert le `dist` monté). Durcissement livré
(commits `143b09d`/`6d7cbd9`/`bbc1f5a`) :

- **Garde-fou de publication** : flag `published` (atlas/dossiers, défaut `false`) filtré au build —
  un contenu non revu reste hors du site public. Fiche + dossier **Mer Rouge = hors-ligne (en revue)**.
- **Lecteur interne cockpit** (Tailscale) : `/lire/:type/:slug` + colonne « Lire » dans Quality Gates
  pour relire un candidat avant publication.
- **Conformité Charte de Munich** (ADR 0037) : contrôle machine bloquant au build/CI (`check:munich`)
  - mécanisme d'erratum + checklist 10 contrôles définissant `compliance_done`.
- **Fiche Atlas Mer Rouge** : seuils quantifiés + carte schématique livrés ; reste conformité + revue
  humaine avant `published: true`.
- **Candidats-sources assurance** collectés : `docs/evidence/mer-rouge-suez-assurance-candidates.md`
  (_pending validation_).

## Prochaine action recommandée

**Débloquer le dossier Mer Rouge / Suez** (`deliv_red_sea_suez_dossier`, jalon `at_risk` 2026-09-15) :

1. **Valider les sources** (gate `sources_ok`) : fournir le contenu des sites bloqués au bot (S&P,
   NorthStandard, PDF UNCTAD/IUMI — listés dans le registre), recouper chaque chiffre dans **≥ 2**
   sources indépendantes, puis promouvoir les sources validées.
2. **Refonte académique du dossier** : squelette Méthode / Constructs opérationnalisés / Données
   sourcées / Scénarios formalisés / Analyse contradictoire / **CVI appliqué** / Limites / Références
   normées — avec marqueurs `[À SOURCER]` partout où une preuve manque (cf. challenge du 2026-06-27).
3. Une fois conforme (Munich + revue humaine) → `published: true` pour fiche puis dossier.
