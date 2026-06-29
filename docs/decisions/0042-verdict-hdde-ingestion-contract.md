# 0042 — Contrat d'ingestion VERDICT ↔ HDDE (lecture seule)

- **Statut :** accepté
- **Date :** 2026-06-29
- **Contexte connexe :** ADR 0041 (surface dédiée), 0035 (couplage chokepoints/CVI, lecture seule),
  0036 (modèle entreprise HDDE), 0027 (candidats ≠ faits).

## Contexte

VERDICT pré-remplit ses temps E (PESTEL) et R (SWOT) et amorce ses options (temps D) à partir du
**packet diagnostic HDDE** + **CVI** + **chokepoints**. La surface VERDICT étant **séparée** (ADR 0041,
propre SQLite), il faut un mécanisme pour lire les données HDDE. Trois pistes : (a) DB SQLite partagée +
nouvelles tables ; (b) **API interne lecture seule** exposée par HDDE ; (c) import du
`diagnostic_packet.json` exporté.

## Décision

**HDDE expose une petite API interne en lecture seule, consommée côté serveur par `verdict-api`** — même
patron que l'intégration chokepoints de HDDE (ADR 0035). **Pas de base de données partagée.**

- Routeur **`apps/hdde-api/server/routers/internal.ts`** (`GET /api/internal/...packet/latest`), protégé
  par un **middleware de token de service** (`X-Internal-Token`), **distinct** de `requireAuth`.
- `verdict-api` appelle HDDE par le **réseau Docker interne** (`http://hdde:8090`), jamais via Caddy.
- Le packet est **revalidé** par le même schéma `PacketPayload` (`@ag/schema/hdde`) ; VERDICT en **copie**
  les champs utiles comme **candidats** (`status='candidate'`, `source_ref` renseigné). Le packet est un
  **instantané immuable** : on stocke `source_pack_hash` ; s'il change après ingestion, l'UI propose une
  **ré-ingestion** plutôt que de diverger silencieusement.
- Repli hors-ligne autorisé : import d'un `diagnostic_packet.json` exporté.

## Sécurité (garde-fous obligatoires)

- **Caddy** : le bloc HDDE renvoie **404** sur `/api/internal/*` côté public — l'API interne n'est
  jamais joignable depuis Internet (défense en profondeur **en plus** du token).
- **Lecture seule stricte** : VERDICT n'écrit **jamais** dans la base HDDE. Aucune donnée canonique
  HDDE/CVI/chokepoints n'est mutée (ADR 0027).
- **Chokepoints** : VERDICT réutilise le **read scope** (jamais `read_tainted`) comme HDDE (ADR 0035).

## Conséquences

- Un secret partagé `INTERNAL_API_TOKEN` à provisionner pour les deux services (docker/.env).
- Couplage faible et explicite : si HDDE est indisponible, VERDICT reste utilisable en saisie manuelle.
