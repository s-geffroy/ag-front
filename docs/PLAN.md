# app-geo — Plan : ce qui reste à faire

## Contexte

La reproduction de la config agent (skills + settings + `CLAUDE.md` + plugins) est **terminée et
vérifiée** :

- `.claude/skills/` = 20 skills, empreinte `1c5049f6…` (byte-identique à la source) ;
- `.claude/settings.json` (2 plugins) ;
- `CLAUDE.md` adapté à app-geo (2 UI, monorepo, Docker-only) ;
- plugins `commit-commands` + `security-guidance` installés (`/reload-plugins` pour appliquer).

**État au 2026-08-10** : le socle applicatif est **construit et déployé**. Les **4 UIs** sont en
service — site public en ligne (`www.applied-geopolitics.com`), cockpit interne via Tailscale, **HDDE**
et **VERDICT** publiés derrière authentification — plus le **consumer pinné** de la Read API
Chokepoints (ADR 0062, vert ce jour). Le monorepo compte 7 apps (`public, cockpit, hdde-api, hdde-web,
lead-api, verdict-api, verdict-web`) + 5 packages, sous la règle **Docker-only**, en _clean-room
rebuild_ depuis le pack de référence `/home/deploy/sources` (à LIRE, pas à copier). Le reste-à-faire
compte 8 apps (`public, cockpit, hdde-api, hdde-web, lead-api, verdict-api, verdict-web, slackbot`)
+ 5 packages.

Depuis, l'exploitation a été reprise (§ Phase 8) et le reste-à-faire s'est déplacé : il n'est plus
« construire », il est **valider, alimenter et renseigner**. Quatre branchements sont câblés, testés
et **inertes faute d'une valeur humaine** ; treize artefacts éditoriaux sont écrits et retenus par des
portes de jugement. Voir « Prochaine action recommandée » en bas.

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

### Phase 5 — `apps/hdde-*` (HDDE, hdde.applied-geopolitics.com) — ✅ FAIT

- **API** (`apps/hdde-api`, Express + SQLite + nunjucks + OpenAI) : cases → interview guidée →
  entités/preuves → packet diagnostic scoré (pack-driven, modèle entreprise per-actor + HHI) →
  diff/validate → exports FR/EN + JSON → **red team OpenAI gpt-4o** (suggestion ≠ preuve).
- **Web** (`apps/hdde-web`, React + Vite) : cockpit d'interview (`CaseWorkspace`).
- Auth applicative (bcrypt + sessions, seed CLI, pas d'auto-inscription) ; **Internet public derrière
  auth**, fronté par Caddy ; API interne d'ingestion pour VERDICT. Packs sous `domain_packs/`.
- ADR 0032–0036 (+ 0040 modèle de divergence, 0046 traçabilité de validation).

### Phase 6 — `apps/verdict-*` + `packages/verdict` (VERDICT premium) — ✅ FAIT

- **Engine** (`packages/verdict`, `@ag/verdict`) : port du PoC — scoring (7 critères pondérés), audit
  (veto dur, verdicts FAIRE/TESTER/DIFFÉRER/ABANDONNER), pré-remplissage géopolitique.
- **API** (`apps/verdict-api`, conteneur dédié, port 8095, SQLite propre) : pipeline V·E·R·D·I·C·T
  complet, ingestion **read-only** du packet HDDE **validé** (candidate ≠ fact) + CVI + chokepoints,
  red team OpenAI, exports note de décision FR/EN. **Web** (`apps/verdict-web`) : cockpit d'arbitrage.
- Service `verdict` + vhost Caddy `verdict.applied-geopolitics.com` en place. ADR 0041–0043.

### Phase 7 — Consumer Read API Chokepoints (pin + drift) — ✅ FAIT

- `scripts/consumer/` (hors règle Docker-only : tourne sur un pair tailnet quelconque) : client Python
  **pinné** généré depuis le contrat épinglé, `sync_contract.sh` (drift pin↔live), `check_client.sh`
  (« à jour ? » = pin↔live **et** client↔pin) avec **alerte Slack** + `--heartbeat` hebdo.
- Contrat épinglé `contract/openapi.json` (v0.2.0) ; `drift.log` **vert au 2026-07-02**. ADR 0062.
  Coexiste avec le client TS build-time `@ag/chokepoints` du site (partagent le contrat, pas le code).

### Phase 8 — Exploitation, conformité et veille — ✅ FAIT (2026-08-10)

Une journée de reprise, déclenchée par la question « que reste-t-il pour que le site soit 100 %
opérationnel ». Le code n'était pas le problème : aucun TODO dans `apps/public/src`. Ce qui manquait
était ailleurs.

- **Conformité** — pages légales et politique de confidentialité écrites, consentement RGPD
  `literal(true)` au schéma (sans lui, rien ne s'écrit). Les pages **quittent le build** tant qu'un
  fait obligatoire manque, plutôt que de faire échouer la reconstruction horaire.
- **Notification des leads** — SMTP câblé par `docker/.env`. Un prospect était jusque-là écrit sur
  disque sans que personne ne soit prévenu.
- **Intégrité publique** — `cp_alpha` (« Alpha Strait »), fixture servie par l'API amont, était
  publiée en page, au sitemap et dans le GeoJSON. Filtrée aux deux points d'entrée, signalée à
  ag-back.
- **Sauvegardes** (ADR 0076 voisin) — rien n'était sauvegardé. Les bases tournent en WAL : un `cp`
  aurait produit une base ouvrable et presque **vide**. API de sauvegarde en ligne + tirage de
  restauration hebdomadaire. Healthchecks sur huit services, rotation des journaux.
- **Mesure d'audience** (ADR 0076) — Plausible auto-hébergé, sans cookie donc sans bandeau, servi en
  première partie sous `/p/*` pour ne pas être bloqué ; tableau de bord tailnet-only.
- **Carte sociale** — `Base.astro` acceptait une prop `image` qu'aucune page ne passait : chaque
  partage rendait une vignette grise.
- **Cockpit** — piliers et types `ops` ajoutés : un cockpit de *déploiement* n'avait aucun moyen de
  représenter du travail de déploiement, ce qui est précisément pourquoi ces manques étaient
  invisibles.
- **Veille** — la cadence hebdomadaire (cron lundi), la surface publique (`/veille` + bande
  d'accueil, toutes deux auto-effaçantes), le refus machine de la paraphrase (P2) et le service Slack
  Socket Mode (B2, inerte faute de jetons).

## Reste à faire (gouvernance — ADR _Proposed_)

- **ADR 0044 (Proposed)** — cycle de vie & confidentialité des données client : rétention, purge, DSAR,
  DPA OpenAI. Politique à concevoir puis implémenter (surface HDDE + VERDICT).
- **ADR 0045 (Proposed)** — rail commercial : paiement → provisioning de compte, tiers de prix
  (Basic/Standard/Premium), KPIs commerciaux. Plomberie go-to-market encore au stade design.

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
- [x] **Garder les docs synchronisées** — `PLAN.md` remis à jour le 2026-08-10 (Phase 8).
      `CLAUDE.md` l'a été aussi (audience, sauvegardes). **Reste `apps/README.md`**, qui ignore encore
      `slackbot` et les ADR 0063–0076 ; et les en-têtes des ADR 0070/0071 décrivent des restrictions
      levées depuis.
- [ ] **Supervision externe d'uptime** — tous les signaux actuels sont émis PAR ce serveur, donc
      aucun ne peut partir quand c'est lui qui tombe. `BACKUP_PING_URL` est prêt à recevoir un
      moniteur tiers ; le compte reste à créer.

## Workflow de publication — état (2026-08-10)

Le site public est **en ligne** ; publier = rebuild (Caddy sert le `dist` monté). Durcissement livré
(commits `143b09d`/`6d7cbd9`/`bbc1f5a`) :

- **Garde-fou de publication** : flag `published` (atlas/dossiers, défaut `false`) filtré au build —
  un contenu non revu reste hors du site public. Fiche + dossier **Mer Rouge = hors-ligne (en revue)**.
- **Lecteur interne cockpit** (Tailscale) : `/lire/:type/:slug` + colonne « Lire » dans Quality Gates
  pour relire un candidat avant publication.
- **Conformité Charte de Munich** (ADR 0037) : contrôle machine bloquant au build/CI (`check:munich`)
  - mécanisme d'erratum + checklist 10 contrôles définissant `compliance_done`.
- **Publication 1-clic** (ADR 0069) : le cockpit pose un sentinelle, un watcher hôte republie en
  deux minutes. La porte reste `resolvePublish` — gates complets, journal nominatif.
- **Correctif du 2026-08-10** : quatre notes n'étaient pointées par aucun livrable et répondaient
  donc `409 no_linked_deliverable` **quoi qu'on valide** — impubliables par construction, et le
  défaut ne se voyait qu'au moment d'essayer. Par ailleurs, seul le livrable du **type propriétaire**
  gouverne désormais la publication : un renvoi (note teaser → fiche) imposait ses portes à la fiche.
- **Fiche + dossier Mer Rouge** : contenu complet, mais **affirmation devenue fausse** détectée avant
  publication — la reprise des attaques du 22 juillet 2026 contredisait l'encart « État au 12 juillet ».
  Réécriture candidate déposée ; la porte de revue humaine a fait exactement son travail.

## Prochaine action recommandée

L'ancienne version de cette section demandait de « valider les sources » du dossier Mer Rouge. Ce
gate est passé depuis. Ce qui bloque aujourd'hui est ailleurs, et se range en deux tas.

### 1. Quatre valeurs à renseigner — chacune débloque un dispositif déjà testé

| Manque | Effet tant qu'il manque |
| --- | --- |
| Identifiants **SMTP** (`docker/.env`) | Un prospect écrit, la donnée est stockée, **personne n'est prévenu** |
| **Faits légaux** (`apps/public/src/lib/legal.ts`) | `/mentions-legales` répond 404 **par construction** ; le site collecte sans notice publiée |
| **Compte Plausible** (tableau de bord tailnet) | L'ingestion répond `202`, les événements sont **écartés** |
| **Trois jetons Slack** (`docker/.env`) | Le digest du lundi part sans boutons ; la promotion reste au cockpit |

Aucune n'est un chantier. Chacune est un blanc à remplir, et toutes échouent en silence si on les
oublie — c'est pourquoi elles sont listées ici plutôt que dans un coin.

### 2. Un geste hebdomadaire, et une décision éditoriale

- **Tenir la revue de veille.** Le pipeline est complet depuis l'ADR 0071 et n'a jamais servi :
  `promoted-news.json` est resté vide pendant les cinq mois de la crise d'Ormuz, avec une vingtaine
  de clusters frais par semaine dans le flux. Ce n'est pas un manque d'information, c'est un manque
  de geste. Promouvoir **un** cluster ferait apparaître la crise sur la page publique d'Ormuz en deux
  minutes — plus vite que la fiche éditoriale, qui doit encore passer ses portes.
- **Trancher la lecture Mer Rouge / Ormuz.** Le motif de ciblage a changé de nature : les Houthis
  invoquent une interdiction de navigation visant les navires saoudiens, non plus le lien avec
  Israël, et l'analyse décrit une tentative de reproduire à Bab el-Mandeb le contrôle iranien sur
  Ormuz. Le `verdict`, le `cvi_level` et la `confidence` des deux fiches en dépendent. C'est un
  jugement éditorial, pas une retouche — il n'a pas été préempté.
- **Passer les portes.** Le dossier Mer Rouge est à une porte de la publication une fois la réécriture
  relue ; `validation_journal.json` est encore **vide**, donc la chaîne n'a jamais été exercée de bout
  en bout. La dérisquer sur un seul document a plus de valeur que d'en préparer trois de plus.

### 3. Puis les deux chantiers de code restants

**ADR 0044** (cycle de vie / confidentialité des données clients) et **ADR 0045** (rail commercial
paiement → provisioning). Ce sont les seuls chantiers structurants encore au stade design ; le second
conditionne la vente des trois paliers déjà affichés sur `/offres`.

> Un fil relie plusieurs défauts trouvés le 2026-08-10, et vaut d'être retenu : le **statut
> épistémique d'une absence**. Rien ne distinguait une fixture d'un objet réel (`cp_alpha`), ni
> « aucun épisode ouvert » de « rien ne se passe » (Ormuz), ni un flux d'actualités vide d'une
> agrégation qui n'a jamais tourné. Trois fois la même forme de trou, à trois endroits de la chaîne.
