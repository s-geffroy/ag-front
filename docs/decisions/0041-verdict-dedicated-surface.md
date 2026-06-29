# 0041 — VERDICT : surface & conteneur dédiés (port TypeScript du POC)

- **Statut :** accepté
- **Date :** 2026-06-29
- **Contexte connexe :** ADR 0032 (port HDDE Python→TS), 0033 (auth publique HDDE), 0002 (Docker-only),
  0027 (candidats ≠ faits). Voir `docs/methode-verdict.md`.

## Contexte

Le tunnel Applied Geopolitics outille deux étages (site public ; HDDE → Basic/Standard) mais pas le
**3ᵉ étage Premium « Arbitrer »** (scénarios, seuils de bascule, options de mitigation, note de
décision — `apps/public/src/lib/site.ts`). Le métier dispose déjà d'une méthode de décision aboutie et
éprouvée sur 3 cas réels : le POC **`verdict_v1_poc_ui_pack`** (Python : CLI Typer + UI Streamlit +
fichiers YAML/Markdown). Cette méthode **intègre nativement** PESTEL, SWOT et le Business Model Canvas
en les transformant pour la décision (V·E·R·D·I·C·T).

Trois options : (a) déployer le POC Python tel quel ; (b) l'embarquer dans HDDE ; (c) le **porter en
TypeScript** comme **surface dédiée**.

## Décision

**Porter VERDICT en TypeScript, comme surface dédiée dans un conteneur Docker indépendant.**

- Nouvelle paire d'apps **`apps/verdict-api`** (Express + better-sqlite3) + **`apps/verdict-web`**
  (React + Vite), moteur pur dans **`packages/verdict`** (`@ag/verdict`) et schémas dans
  **`packages/schema/src/verdict`** (`@ag/schema/verdict`) — architecture **symétrique à HDDE**
  (mêmes patrons que `@ag/cvi` / `@ag/schema/hdde`).
- **Conteneur Docker séparé** : service `verdict` indépendant (image propre, `verdict.sqlite` propre,
  exports propres), servi sur **`verdict.applied-geopolitics.com`** derrière app-auth, fronté par Caddy
  comme HDDE (ADR 0033). Pas de couplage runtime fort avec HDDE.
- **Source de vérité = SQLite** + **export YAML/Markdown/PDF + snapshots versionnés** (concilie le
  multi-analyste/auth de HDDE avec la trace d'audit git-trackable chère au POC).

## Justification

- **Cohérence de stack** : le monorepo est TS ; HDDE a précisément été porté Python→TS (ADR 0032) pour
  éviter une seconde toolchain. Réutiliser Streamlit/Typer recréerait ce coût (auth, design-system,
  Docker-only, candidat ≠ fait à recâbler).
- **Réutilisation** : auth, exports nunjucks, red team OpenAI, intégration chokepoints sont déjà en TS
  côté HDDE et se réemploient.
- **Testabilité** : le cœur (scoring 7 critères, vetos, audit) est pur et déterministe ; les exemples
  `valid`/`invalid` du POC deviennent des **fixtures TDD** (`packages/verdict/src/*.test.ts`).

## Conséquences

- Deux bases de comptes (HDDE et VERDICT) → double `seed:user` en v1 (cookie de domaine partagé =
  refactor ultérieur).
- Un nouveau service à exploiter/déployer. L'ingestion HDDE→VERDICT est traitée en **ADR 0042**.
- La méthode (7 temps, 7 critères, vetos, branchement géopolitique) est spécifiée en **ADR 0043** et
  `docs/methode-verdict.md`.
