# 0032 — HDDE : port TypeScript du starter pack (Express + React + SQLite + nunjucks)

- **Statut :** accepté
- **Date :** 2026-06-26
- **Contexte connexe :** ADR 0003 (monorepo npm workspaces), 0005 (cockpit editable local backend),
  0008 (shared packages), 0033/0034/0035 (HDDE auth / LLM / couplage data).

## Contexte

Le pack `hidden_dependency_discovery_starter_pack` (réf. dans `/home/deploy/sources/`) décrit le
**Hidden Dependency Discovery Engine** (HDDE) : un poste d'interview expert B2B révélant les
dépendances géopolitiques cachées d'une entreprise à partir d'un acteur visible. Le pack est livré en
**Python / FastAPI / PostgreSQL / Jinja2** et n'est qu'un squelette (~30 %) : méthodologie YAML riche,
moteur stubé.

CLAUDE.md impose : `/home/deploy/sources/` est une **référence à lire, pas un template à copier** ;
**challenger l'architecture source** ; le repo est **mono Node/TypeScript, Docker-only**.

## Décision

Porter HDDE en **TypeScript dans le monorepo** plutôt qu'adopter le stack Python :

- **`apps/hdde-api`** — backend Express + `tsx` + `zod` (pattern `@ag/lead-api`), persistance
  **SQLite** via `better-sqlite3` (synchrone, transactionnel, un fichier sur volume Docker), exports
  via **`nunjucks`** (compatible Jinja2 → réutilise les `.j2` du pack quasi tels quels).
- **`apps/hdde-web`** — frontend React + Vite + Tailwind + shadcn/radix (pattern `@ag/cockpit`).
- **Domain pack YAML adopté comme donnée méthodologique** (controlled vocabulary), versionné sous
  `apps/hdde-api/domain_packs/` et raffinable. On **ne copie pas** le code Python ni le schéma SQL.
- Schémas partagés API ↔ web ajoutés à **`@ag/schema`** (entrypoint `./hdde`).

## Justification

- **Cohérence** : un seul langage/toolchain, Docker-only, réutilise `@ag/schema`, `@ag/cvi`,
  `@ag/chokepoints`, le service `tools` et le pattern Caddy.
- **SQLite vs Postgres** : multi-analyste + versioning de packets exigent du transactionnel fiable,
  mais une V1 privée n'a pas besoin d'un service Postgres à opérer/sauvegarder. SQLite est le juste
  milieu (les fichiers JSON façon cockpit seraient fragiles en écriture concurrente).
- **nunjucks** : préserve l'investissement des templates Jinja FR/EN du pack.

## Conséquences

- `better-sqlite3` est un module natif → à compiler dans l'image `tools` (build Node 22 bookworm OK).
- Le moteur (scoring piloté par `scoring_rules.yaml`, verdict, exports) doit être **réécrit** : les
  stubs Python ne sont pas portés tels quels.
- Migration vers Postgres possible plus tard si multi-client (hors V1).
