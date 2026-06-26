# 0035 — HDDE : couplage chokepoints (Read API, scope read) + CVI, garde-fou anti-tainted

- **Statut :** accepté
- **Date :** 2026-06-26
- **Contexte connexe :** ADR 0012 (Atlas ↔ Chokepoints Read API), 0013 (tainted internal-only),
  0027 (thinking-skills guardrails), 0033 (HDDE surface publique).

## Contexte

HDDE doit enrichir l'analyse de flux : quand l'analyste décrit un flux critique
(`critical_flow_type` = transport / energy / goods…), proposer les chokepoints/corridors pertinents et
un indicateur de criticité dérivé. Deux sources existent dans le repo :

- **`@ag/chokepoints`** — client lecture seule de la **Chokepoints Read API** (HTTP, Bearer,
  taint-aware).
- **`@ag/cvi`** — calcul **local in-process** du Corridor Vulnerability Index (pas de réseau).

Mais `hdde` est une **surface publique** (ADR 0033), alors que la donnée `tainted` est
**internal-only** (ADR 0013) : le scope `read_tainted` ne doit **jamais** transiter par un service
public-facing.

## Décision

- **`@ag/cvi`** : intégré directement (local, in-process), aucun risque réseau. Sorties = **candidats
  pending validation** (ADR 0027), ne mutent jamais de canonique.
- **`@ag/chokepoints`** : appelé **uniquement côté serveur** (`hdde-api`), avec le **token scope
  `read` public** (`CHOKEPOINTS_API_TOKEN`), **jamais** `read_tainted` / `CHOKEPOINTS_INCLUDE_TAINTED`.
  - Garde-fou code : `include_tainted` forcé à `false` ; filtrage défensif de tout enregistrement
    marqué `tainted` avant retour au client.
  - Le **token n'est jamais exposé au navigateur** : le front interroge `hdde-api`, qui proxy.
  - Les suggestions chokepoints sont présentées comme **candidates** (jamais des faits), à valider par
    l'analyste — cohérent avec la discipline de preuve de la méthode.

## Justification

On obtient l'enrichissement demandé (chokepoints + CVI complets) sans violer la séparation
public/interne : l'appel réseau est server-to-server (le host atteint la Read API via le tailnet), le
client public ne voit ni le token ni la donnée tainted.

## Conséquences

- `hdde` requiert `CHOKEPOINTS_API_URL` + `CHOKEPOINTS_API_TOKEN` (scope read) en env ; dégradation
  gracieuse si absents (enrichissement simplement omis).
- Un test doit prouver qu'aucun enregistrement `tainted` ne sort de `hdde-api`.
- Couplage CVI complet (lier acteurs ↔ chokepoints, scorer la criticité de flux) reste prudent : tout
  reste candidat, jamais une décision.

## Mise à jour — contrat API v0.2.0 (2026-06-26)

Le client partagé `@ag/chokepoints` suit désormais le contrat **v0.2.0** (`docs/api-interface-contract_V2.md`,
additif/rétrocompatible). L'enrichissement HDDE utilise l'endpoint **`GET /chokepoints/by-flow/{flow_type}`**
(mapping flux HDDE → flow_type contrôlé, ex. `energy → crude_oil`), avec **repli sur les chokepoints
stratégiques P0** si le flow_type n'est pas dans la vocabulaire (404) — l'enrichissement n'est jamais vide.
Toujours scope `read`, server-side, `tainted` filtré.
