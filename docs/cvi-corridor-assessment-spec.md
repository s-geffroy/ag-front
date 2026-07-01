# Spec — évaluation CVI par corridor servie par l'API Chokepoints

**But.** Rendre vivante la branche « CVI multi-dimensions » de `@ag/verdict#buildCandidates`
(`packages/verdict/src/prefill.ts:211-239`) **sans fabriquer de scores** : l'API Chokepoints devient
la **source autoritative** d'un `CviAssessment` par corridor (donnée analytique candidate, validée par
un humain avant de devenir canonique). HDDE l'ingère (scope `read`), le persiste dans le packet, et
VERDICT le pré-remplit en `status='candidate'`.

Référence des types : `@ag/cvi` (`packages/cvi/src/{dimensions,assessment,levels}.ts`).
Doctrine : candidat ≠ fait (ADR 0027), Munich/anti-prédiction (ADR 0037), pas d'agrégat 0–100 sans
méthodologie documentée (ADR 0043), couplage scope `read` only / jamais `read_tainted` (ADR 0035).

---

## 1. Les 8 dimensions CVI (canoniques)

`cviDimensionKeys` — clé technique · libellé FR · question centrale (`packages/cvi/src/dimensions.ts`) :

| # | clé | libellé | question à laquelle le score 0–5 répond |
|---|---|---|---|
| 1 | `exposition` | Exposition | Quels flux dépendent du corridor ? |
| 2 | `concentration` | Concentration | Existe-t-il des alternatives crédibles ? |
| 3 | `menace` | Menace | Quels acteurs/événements peuvent perturber ? |
| 4 | `capacite_perturbation` | Capacité de perturbation | Ces acteurs ont-ils les moyens réels de perturber ? |
| 5 | `resilience` | Résilience | Combien de temps pour contourner/réparer/absorber ? |
| 6 | `cout_contournement` | Coût de contournement | Quel coût économique, logistique, assurantiel ou politique ? |
| 7 | `gouvernance` | Gouvernance | Qui peut sécuriser/coordonner/stabiliser ? |
| 8 | `incertitude` | Incertitude | Que ne sait-on pas, avec quel niveau de confiance ? |

Échelle d'un score : entier **0–5**. Mapping niveau (`levelFromScore`) : 0–1 `bas` · 2 `modéré` ·
3 `élevé` · 4–5 `critique`.

**Dimensions effectivement lues par VERDICT aujourd'hui** (`prefill.ts`) — donc le **minimum** que
l'API doit peupler pour activer la branche :
- `menace`, `capacite_perturbation`, `concentration` → **SWOT Menaces** (si score ≥ 3).
- `gouvernance` → **PESTEL Légal** (si score ≥ 3).
- Les 4 autres (`exposition`, `resilience`, `cout_contournement`, `incertitude`) ne sont pas encore
  consommées par `buildCandidates` mais font partie d'un assessment complet et alimentent le
  niveau/agrégat CVI montré au client. `resilience` et `cout_contournement` sont décisionnellement
  pertinentes (elles déplacent coût/risque/timing) → candidates à une extension future de `prefill.ts`.

---

## 2. Contrat de données attendu (ce que l'API doit renvoyer)

Forme cible = `CviAssessment` (`packages/cvi/src/assessment.ts`) **par corridor** :

```jsonc
{
  "scale": "0-5",                       // 'qualitative' (Basic) | '0-5' (Standard) | '0-100' (Premium)
  "global_level": "eleve",              // optionnel — 'bas'|'modere'|'eleve'|'critique'
  "dimensions": {                       // au moins les 4 lues par VERDICT, idéalement les 8
    "menace":                { "score": 4, "rationale": "…", "confidence": "moyen" },
    "capacite_perturbation": { "score": 3, "rationale": "…", "confidence": "bas"  },
    "concentration":         { "score": 4, "rationale": "…", "confidence": "eleve"},
    "gouvernance":           { "score": 3, "rationale": "…", "confidence": "moyen" }
    // exposition / resilience / cout_contournement / incertitude — mêmes objets
  },
  "aggregate_score": 72,                // 0–100, INTERDIT sans methodology_documented (ADR 0043)
  "methodology_documented": true,       // gate dur de l'agrégat Premium
  "sources": ["chokepoints:run:…", "…"],// provenance obligatoire (Munich R1)
  "uncertainties": ["…"],               // incertitudes ouvertes explicites (Munich, anti-prédiction)
  "last_updated": "2026-06-30T…Z"       // pour la détection de staleness côté VERDICT
}
```

Règles dures (déjà codées dans `@ag/cvi/validate.ts`, à respecter côté API) :
- `scale='0-5'` ⇒ `dimensions` non vide.
- `aggregate_score` (0–100) **interdit** si `methodology_documented=false`.
- Chaque `DimensionScore` : `score` entier 0–5, `rationale` non vide, `confidence` ∈ {`bas`,`moyen`,`eleve`}.

---

## 3. Manques pour que l'API Chokepoints **évalue** ces dimensions

### 3a. Données / modèle à tenir par corridor (sinon le score n'est pas sourçable)

Pour chaque dimension, l'entrée brute minimale qui justifie un 0–5 traçable :

| dimension | entrée(s) brute(s) requises côté base Chokepoints | déjà présent ? |
|---|---|---|
| `exposition` | part/volume des flux routés par le nœud (dépendance quantifiée par flux) | partiel (flux qualitatifs) — **manque la quantification** |
| `concentration` | alternatives + **capacité de contournement** vs demande (substituabilité) | champ « alternatives » présent — **manque la capacité chiffrée** |
| `menace` | acteurs hostiles + `event-signals` pondérés + épisodes | acteurs/épisodes/event-signals présents — **manque un scoring menace** |
| `capacite_perturbation` | évaluation des **moyens réels** de chaque acteur (capability) | **manque** (modèle de capacité d'acteur) |
| `resilience` | temps de contournement/réparation/absorption, buffers/stocks | **manque** (données de délai de récupération) |
| `cout_contournement` | coût éco/logistique/assurantiel/politique du reroutage | **manque** (modèle de coût) |
| `gouvernance` | cartographie des acteurs capables de sécuriser/coordonner | acteurs de contrôle présents — **manque le scoring gouvernance** |
| `incertitude` | méta-score qualité/complétude des données + confiance | **manque** (méta-évaluation de confiance) |

→ **Manque transverse : un « moteur CVI » (engine)** côté Chokepoints qui agrège ces entrées en un
`DimensionScore` par dimension, avec `rationale` (texte sourcé) et `confidence`. C'est un *engine*
analytique au sens de l'API (`/analytics/engine-runs`, `engine_id`, `engine_version`) — donc une sortie
**candidate** (tier « Derived-candidate »), pas un fait canonique.

### 3b. Manques d'API / contrat (exposition)

1. **Endpoint dédié** — `GET /chokepoints/{id}/cvi-assessment` (ou un `result_type='cvi_assessment'`
   structuré sous `/analytics/results`) renvoyant **exactement** la forme §2 (`CviAssessment`).
   Aujourd'hui `/analytics/results` ne renvoie que `score/result_type/result_payload` génériques :
   **manque un type de résultat CVI structuré aux 8 dimensions nommées**.
2. **Scope & tiering** : dimensions 0–5 = scope `read` (niveau Standard) ; **agrégat 0–100 gated** sur
   `methodology_documented` (Premium, ADR 0043). Jamais `read_tainted`. Filtrage `license_taint`.
3. **Provenance & confiance par dimension** : `sources[]` + `confidence` obligatoires (Munich R1/R2 ;
   `@ag/cvi` l'impose déjà dans le type). **Manque** si l'engine ne trace pas ses sources.
4. **Versionnement & fraîcheur** : `last_updated` + `engine_version` (ou un `assessment_hash`) pour la
   **détection de staleness** côté VERDICT (un changement après la note ⇒ proposer ré-ingestion, cf.
   §7.2 du workflow). **Manque** aujourd'hui.
5. **Statut candidat** : l'assessment est une **sortie analytique candidate** validée par un humain
   avant de devenir canonique (tier Derived-candidate de l'API, disclaimers verbatim). **Manque** un
   champ statut/validation si l'engine publie directement.
6. **OpenAPI** : ajouter le schéma au snapshot `docs/openapi.json` + drift-guard (contrat V2).

### 3c. Manques de câblage (côté app-geo, une fois 3a/3b livrés)

- `packages/chokepoints` (client) : méthode `cviAssessment(id)` + schéma de parse API→`CviAssessment`.
- `apps/hdde-api/server/integrations/cvi.ts` : `fetchCorridorCvi(chokepointId)` (validé via
  `@ag/cvi/validate`) — aujourd'hui le fichier ne fait que `deriveFlowVulnerability` (CVI de flux).
- `apps/hdde-api/server/routers/cases.ts` (génération packet, ~l.256-266) : pour le(s) corridor(s)
  suggéré(s), fetch + **persister** l'assessment dans le packet.
- `packages/schema/src/hdde/packet.ts` : ajouter `corridor_cvi?: CviAssessment` (ou tableau par corridor).
- `apps/hdde-api/server/routers/internal.ts` : exposer `cvi` (assessment complet) **et** `chokepoints[]`
  à côté du packet (aujourd'hui ni l'un ni l'autre).
- `apps/verdict-api/server/integrations/hdde.ts` + `routers/decisions.ts:269` : porter `cvi`/
  `chokepoints` et appeler `buildCandidates({ packet, cvi, chokepoints })`.
- **Staleness** : figer `cvi.last_updated` + `priority_class` chokepoint dans un `context_hash` au
  moment de la note VERDICT.

---

## 4. Découpage suggéré

- **Lot indépendant du blindage** (côté Chokepoints) : 3a (moteur CVI) + 3b (endpoint/contrat). C'est
  une feature à part entière, sa propre série d'ADR côté base Chokepoints.
- **Blindage immédiat** (côté app-geo, ne dépend pas de 3a/3b) : A1 (filtre packet validé) + le
  câblage **chokepoints** (HDDE les calcule déjà en live, il suffit de les persister + exposer). La
  branche `cvi.dimensions` reste inactive proprement jusqu'à livraison de 3a/3b — **aucun score
  fabriqué**.
