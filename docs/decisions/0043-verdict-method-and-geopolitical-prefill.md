# 0043 — Méthode VERDICT & branchement géopolitique

- **Statut :** accepté
- **Date :** 2026-06-29
- **Contexte connexe :** ADR 0041 (surface dédiée), 0042 (ingestion HDDE), 0027 (candidats ≠ faits),
  0037 (charte de Munich). Spécification détaillée : `docs/methode-verdict.md`.

## Contexte

La demande : une **méthode de prise de décision** Premium s'appuyant sur **PESTEL + SWOT + Business
Model Canvas**, puis son implémentation. Le POC `verdict_v1_poc_ui_pack` fournit déjà cette méthode
(VERDICT), qui **transforme** les trois cadres au lieu de les juxtaposer. Il faut acter (1) la méthode
retenue et (2) la façon dont les actifs géopolitiques l'alimentent.

## Décision

**La méthode est VERDICT** : protocole en 7 temps **V·E·R·D·I·C·T**, scoring à **7 critères pondérés
/100**, **échelle de preuve 0–5**, **4 verdicts** (FAIRE / TESTER / DIFFÉRER / ABANDONNER) et un
**moteur de vetos + audit** (VALIDE / À CORRIGER / BLOQUÉ). Les trois cadres deviennent : **PESTEL
décisionnel** (temps E), **SWOT décisionnelle** (temps R), **Canvas de viabilité systémique** à 5
dimensions par option (temps D). Le cœur algorithmique est porté **à l'identique** depuis le POC
(`packages/verdict` : `scoring.ts`, `audit.ts`) — modifier une règle de veto est une décision de niveau
ADR.

**Branchement géopolitique** : `@ag/verdict#buildCandidates` consomme le packet HDDE, le CVI du
corridor et le contexte chokepoints pour **pré-remplir** E/R et **amorcer** D. Règles de mapping
principales (détail dans `docs/methode-verdict.md`) :

- HDDE `red_flags` / scores `hidden|supplier|flow ≥ 3` / source unique / angles morts rang-2 → **SWOT
  Faiblesses** ; patterns + concentration (pays, part client) → **SWOT Menaces** ; `light_actions` →
  **Opportunités** + amorces d'options.
- chokepoints → **PESTEL Politique/Légal** ; CVI `flow_criticality` → **PESTEL Économique** ; CVI
  `menace`/`capacite_perturbation`/`concentration ≥ 3` → **Menaces** + seuils de bascule.

## Garde-fous (doctrine)

- **Candidats ≠ faits** : tout élément pré-rempli porte `status='candidate'` + `source_ref` ; l'analyste
  valide. Aucune mutation des données canoniques.
- **Anti-tyrannie du score** : le score n'est jamais la décision ; les vetos peuvent l'interdire ; un
  **humain valide** ; **aucune action irréversible** sans seuil d'arrêt.
- **Gate CVI** : pas de seuil sur agrégat 0–100 sans `methodology_documented` (`@ag/cvi`).
- **Red team = preuve niveau 0** (ADR 0034) : elle attaque les hypothèses, ne conclut pas.
- **Munich** (ADR 0037) : incertitudes ouvertes explicites ; aucune garantie de prédiction.

## Amendement (2026-07-01) — source du CVI multi-dimensions

Le branchement ci-dessus est **effectif**, avec une précision de source : l'assessment CVI
multi-dimensions (`menace`/`capacite_perturbation`/`concentration`/`gouvernance`) provient de l'**API
Chokepoints** (`GET /chokepoints/{id}/cvi-assessment`, scope `read`, validé par `@ag/cvi`), récupéré
par HDDE et porté dans le packet (champ `corridor_cvi`) — **VERDICT ne parle pas directement à l'API
Chokepoints** (contrat HDDE unique, ADR 0042). Le CVI **de flux** embarqué reste la source de PESTEL
Économique. Aucun score n'est fabriqué : si l'API n'en sert pas, la branche CVI est simplement inactive
(candidat ≠ fait). Contrat & spec : `docs/cvi-corridor-assessment-spec.md`. Câblage :
`@ag/chokepoints#getChokepointCviAssessment` → `hdde-api/integrations/cvi.ts#fetchCorridorCvi` →
packet → `verdict-api/routers/decisions.ts`.

## Conséquences

- Tier Premium uniquement (la méthode produit l'arbitrage promis par l'offre Premium).
- Une **page de méthode publique** (`/methode-verdict`, miroir de `/methode-cvi`) explicite la méthode
  et ses références pour démontrer le sérieux (porte d'entrée du tunnel).
- La méthode est versionnée dans `docs/methode-verdict.md` (source FR canonique).
