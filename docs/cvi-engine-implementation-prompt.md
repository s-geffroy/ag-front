# Prompt d'implémentation — Moteur & endpoint « CVI assessment par corridor » (API Chokepoints)

> À copier-coller tel quel à l'agent/LLM qui implémente l'API Chokepoints. Autonome : tout le contrat
> nécessaire est inclus. Ne suppose rien du repo consommateur (Applied Geopolitics).

---

## Rôle & contexte

Tu implémentes une fonctionnalité dans l'**API de la base stratégique Chokepoints** (FastAPI, API
analytique **lecture seule**, tiers de données **Canonical / Derived-candidate / File-backed**, auth
**Bearer**, scopes **`read`** et **`read_tainted`**, modèle de **license-taint**, tailnet-only). Elle
expose déjà des chokepoints (corridors/points de passage critiques, classés P0–P3), leurs flux,
risques, alternatives, épisodes, acteurs de contrôle, des `event-signals`, des `alerts`, et des
sorties analytiques génériques via `/analytics/results` (`engine_id`, `engine_version`, `score`,
`result_payload`, disclaimers).

Un consommateur aval (le produit d'arbitrage décisionnel **VERDICT** d'Applied Geopolitics, via son
moteur de diagnostic HDDE) a besoin d'une **évaluation CVI (Corridor Vulnerability Index) par
corridor**, structurée selon **8 dimensions nommées**. Aujourd'hui `/analytics/results` est trop
générique : il ne fournit pas ces 8 dimensions sous une forme typée. Ta mission : ajouter (1) un
**moteur d'évaluation CVI** et (2) un **endpoint de lecture** qui sert un `CviAssessment` par corridor.

## Objectif

`GET /chokepoints/{id}/cvi-assessment` → renvoie un `CviAssessment` (forme ci-dessous) pour le corridor
`{id}`, calculé par un moteur analytique traçable, en **sortie candidate** (tier Derived-candidate),
**sourcée** et **non fabriquée**.

---

## Contrat de sortie (IMMUABLE — le consommateur valide contre cette forme exacte)

```jsonc
{
  "scale": "0-5",                  // "qualitative" | "0-5" | "0-100" — sert "0-5" par défaut
  "global_level": "eleve",         // optionnel — un de: "bas" | "modere" | "eleve" | "critique"
  "dimensions": {                  // clés = identifiants techniques EXACTS ci-dessous
    "exposition":            { "score": 3, "rationale": "…", "confidence": "moyen" },
    "concentration":         { "score": 4, "rationale": "…", "confidence": "eleve" },
    "menace":                { "score": 4, "rationale": "…", "confidence": "moyen" },
    "capacite_perturbation": { "score": 3, "rationale": "…", "confidence": "bas"   },
    "resilience":            { "score": 2, "rationale": "…", "confidence": "moyen" },
    "cout_contournement":    { "score": 3, "rationale": "…", "confidence": "bas"   },
    "gouvernance":           { "score": 3, "rationale": "…", "confidence": "moyen" },
    "incertitude":           { "score": 4, "rationale": "…", "confidence": "bas"   }
  },
  "aggregate_score": 72,           // entier 0–100 — INTERDIT si methodology_documented=false
  "methodology_documented": false, // gate dur de l'agrégat 0–100
  "sources": ["chokepoints:run:<run_id>", "chokepoints:<id>:event-signals", "…"],
  "uncertainties": ["Pas de donnée de capacité de contournement chiffrée pour ce corridor", "…"],
  "last_updated": "2026-06-30T12:00:00Z"
}
```

### Règles de validation DURES (le consommateur les applique ; les violer = payload rejeté)

1. `scale="0-5"` ⇒ `dimensions` **non vide**.
2. Chaque `DimensionScore` : `score` **entier 0–5** ; `rationale` **non vide** ; `confidence` ∈
   {`"bas"`, `"moyen"`, `"eleve"`} (optionnel mais **fortement recommandé**, exigé par la déontologie
   ci-dessous).
3. `aggregate_score` (entier 0–100) **interdit** si `methodology_documented=false`. Ne le renvoie que
   si une méthodologie d'agrégation est documentée et publiée (niveau Premium).
4. Clés de dimensions **exactement** ces 8 chaînes (snake_case, sans accent) :
   `exposition`, `concentration`, `menace`, `capacite_perturbation`, `resilience`,
   `cout_contournement`, `gouvernance`, `incertitude`.
5. `global_level` (si présent) ∈ {`bas`,`modere`,`eleve`,`critique`}. Mapping conseillé depuis un score
   0–5 : 0–1→`bas`, 2→`modere`, 3→`eleve`, 4–5→`critique`.

---

## Les 8 dimensions — définition + entrées brutes à agréger

| clé | question (ce que le 0–5 mesure) | entrées brutes à agréger côté Chokepoints |
|---|---|---|
| `exposition` | Quels flux dépendent du corridor ? | part/volume des flux routés par le nœud (dépendance quantifiée) |
| `concentration` | Existe-t-il des alternatives crédibles ? | alternatives + **capacité de contournement** vs demande |
| `menace` | Quels acteurs/événements peuvent perturber ? | acteurs hostiles + `event-signals` pondérés + épisodes |
| `capacite_perturbation` | Ces acteurs ont-ils les moyens réels ? | évaluation de capacité/moyens de chaque acteur |
| `resilience` | Combien de temps pour contourner/réparer/absorber ? | délais de récupération, buffers/stocks |
| `cout_contournement` | Quel coût éco/logistique/assurantiel/politique ? | modèle de coût du reroutage |
| `gouvernance` | Qui peut sécuriser/coordonner/stabiliser ? | cartographie des acteurs de contrôle/gouvernance |
| `incertitude` | Que ne sait-on pas, avec quelle confiance ? | méta-score de qualité/complétude des données |

**Priorité de livraison** : le consommateur lit en premier `menace`, `capacite_perturbation`,
`concentration`, `gouvernance` (les autres complètent l'assessment). Si une dimension n'a pas de donnée
suffisante, **ne fabrique pas** un score : abaisse la `confidence`, explicite le trou dans
`uncertainties`, et — si vraiment aucune donnée — omets la dimension plutôt que d'inventer (mais alors
préviens que la branche aval ne se déclenchera pas pour elle).

---

## Le moteur (engine) à implémenter

- Un **engine analytique** au sens de l'API existante : il produit des sorties **candidates**
  (tier Derived-candidate), traçables via un `engine_id` + `engine_version` et un `run_id`
  (réutilise `/analytics/engine-runs` / le mécanisme d'engine-run existant).
- Pour chaque dimension : calcule un `score` 0–5 **dérivé de données réelles** du corridor, produis un
  `rationale` textuel **citant ses entrées**, et une `confidence` reflétant la qualité des données.
- Renseigne `sources[]` (références aux runs/signaux/épisodes utilisés) et `uncertainties[]`
  (ce qui manque, hypothèses, angles morts). **Obligatoire** (voir déontologie).
- `last_updated` = horodatage du run ; expose aussi `engine_version` pour permettre au consommateur de
  détecter la **péremption** (staleness) d'un assessment déjà ingéré en aval.
- L'assessment est **candidat tant qu'un humain ne l'a pas validé** : prévois un statut (ex.
  `status: "candidate" | "validated"`) et n'expose pas un agrégat 0–100 tant que la méthodologie n'est
  pas documentée.

---

## L'endpoint

- `GET /chokepoints/{id}/cvi-assessment` → `200` avec le `CviAssessment`, `404` si le corridor n'existe
  pas **ou** s'il est restreint et que le scope ne l'autorise pas (ne **jamais** divulguer l'existence
  d'un enregistrement restreint).
- **Scope** : dimensions 0–5 = scope **`read`**. L'**agrégat 0–100** (s'il est un jour servi) est
  **Premium** et **gated sur `methodology_documented`**.
- **Taint** : **jamais** `read_tainted` pour ce endpoint ; filtre défensivement tout enregistrement
  `license_taint=true` (défense en profondeur, comme les autres endpoints `read`).
- Ajoute le schéma à ton **snapshot OpenAPI** committé + au **drift-guard test** (cohérence de contrat).

---

## Garde-fous doctrinaux (DURS — ne pas contourner)

1. **Candidat ≠ fait.** Toute sortie du moteur est une **candidate analytique** en attente de
   validation humaine, jamais un fait canonique. Disclaimers verbatim comme les autres sorties
   Derived-candidate.
2. **Pas de score fabriqué.** Chaque `score` doit tracer à des entrées réelles + `sources`. Donnée
   insuffisante ⇒ `confidence` basse + `uncertainties` explicite, ou dimension omise. Jamais d'invention.
3. **Anti-prédiction (charte de Munich).** L'outil éclaire, il ne prédit pas. `uncertainties` explicites
   obligatoires ; `confidence` requise sur tout score structurant ; aucune formulation de garantie.
4. **Pas d'agrégat 0–100 sans méthodologie documentée** (gate dur).
5. **Lecture seule.** Cet endpoint ne mute aucune donnée canonique.

---

## Critères d'acceptation / tests

- `GET /chokepoints/{id}/cvi-assessment` sur un corridor valide → `200`, `scale="0-5"`, `dimensions`
  non vide, chaque dimension `{score 0–5 entier, rationale non vide, confidence ∈ bas|moyen|eleve}`.
- `sources[]` et `uncertainties[]` non vides quand des trous existent.
- `methodology_documented=false` ⇒ **aucun** `aggregate_score` dans la réponse.
- Corridor inexistant **ou** restreint sans scope → `404` (pas de fuite d'existence).
- Aucun enregistrement `license_taint=true` ne sort.
- Les 8 clés de dimensions sont exactement les chaînes spécifiées.
- Snapshot OpenAPI mis à jour + drift-guard vert.
- Un corridor sans données suffisantes ne produit **pas** de score inventé (la dimension est omise ou en
  confidence `bas` avec une `uncertainty` correspondante).

## Hors périmètre

Le câblage aval (client TypeScript, ingestion HDDE, pré-remplissage VERDICT) est traité séparément par
l'équipe Applied Geopolitics. Ta livraison s'arrête au **moteur + l'endpoint + le contrat de sortie**
ci-dessus.
