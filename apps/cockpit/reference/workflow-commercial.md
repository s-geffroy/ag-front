---
title: "Workflow complet : Chokepoints · CVI · HDDE · VERDICT corrélés aux offres"
summary: "De la base de faits à la décision : comment les quatre briques s'enchaînent et se mappent sur Basic / Standard / Premium."
updated: "2026-06-29"
order: 10
---

# Workflow complet : de la base de faits à la décision

Ce document décrit la **chaîne produit** d'Applied Geopolitics — **Chokepoints → CVI → HDDE →
VERDICT** — et sa **corrélation avec les offres commerciales** Basic / Standard / Premium. C'est un
document de **doctrine interne** (tailnet uniquement), à ne pas confondre avec une sortie éditoriale.

## 1. Vue d'ensemble — une seule chaîne de raisonnement

Toute la plateforme matérialise une chaîne unique, déclinée en surfaces et en niveaux d'offre :

```
Corridors → Flux → Dépendances → Vulnérabilités → Seuils → Scénarios → Décisions
└ Chokepoints ┘   └──── HDDE ────┘   └── CVI ──┘            └──── VERDICT ────┘
```

| Brique | Rôle | Surface | Offre |
| --- | --- | --- | --- |
| **Chokepoints** | Base de **faits** : registre des points de passage critiques (P0–P3) | API read-only interne (Tailnet) | Alimente tout |
| **CVI** | **Métrique** de vulnérabilité (8 dimensions) | Site public + enrichissement | Échelonné par tier |
| **HDDE** | **Diagnostic** : révèle les dépendances cachées d'une entreprise | `hdde.applied-geopolitics.com` | **Standard** |
| **VERDICT** | **Arbitrage** : transforme le diagnostic en décision | `verdict.applied-geopolitics.com` | **Premium** |

**Principe transverse — candidat ≠ fait (ADR 0027).** Tout ce qui descend de Chokepoints/CVI vers
HDDE, puis de HDDE vers VERDICT, arrive avec le statut `candidate` : un analyste humain valide avant
que cela devienne un fait. Aucune donnée canonique n'est mutée par les couches dérivées. La charte
anti-prédiction (Munich, ADR 0037) s'applique : l'outil éclaire, il ne prédit pas.

## 2. Socle — la base Chokepoints

Base stratégique séparée (plusieurs centaines de nœuds **P0–P3** par classe de priorité), exposée en
**API read-only authentifiée par Bearer**, accessible uniquement sur le tailnet. Chaque enregistrement
porte flux, risques, alternatives, épisodes, acteurs de contrôle et signaux analytiques.

Deux modes de consommation :

- **Build-time (site public)** — les fiches Atlas, la carte interactive et l'export GeoJSON sont
  générés statiquement à la compilation via le client partagé `@ag/chokepoints`. Le token est un
  secret de build, jamais livré au client. Les enregistrements **« tainted »** (restriction de
  licence) ne sortent **jamais** sur la surface publique (allowlist de propriétés + filtrage). Réf.
  ADR 0012.
- **Runtime (HDDE)** — enrichissement côté serveur : quand un analyste décrit un flux critique, l'API
  suggère les chokepoints pertinents. Le scope est **`read` strict** (jamais `read_tainted`), avec
  filtrage défensif pour qu'aucun enregistrement restreint ne fuite. Réf. ADR 0035.

## 3. Socle — la métrique CVI (Corridor Vulnerability Index)

Le CVI (`packages/cvi/`) évalue la vulnérabilité d'un corridor selon **8 dimensions** :

1. **Exposition** — quels flux dépendent du corridor ?
2. **Concentration** — existe-t-il des alternatives crédibles ?
3. **Menace** — quels acteurs / événements peuvent perturber ?
4. **Capacité de perturbation** — ces acteurs en ont-ils réellement les moyens ?
5. **Résilience** — combien de temps pour contourner / réparer / absorber ?
6. **Coût de contournement** — quel coût économique, logistique, assurantiel, politique ?
7. **Gouvernance** — qui peut sécuriser / coordonner / stabiliser ?
8. **Incertitude** — que reste-t-il d'inconnu, avec quel niveau de confiance ?

**La granularité du CVI est elle-même échelonnée par offre** — c'est le premier point de corrélation
commerciale :

| Tier | Granularité CVI |
| --- | --- |
| **Basic** | Qualitatif seul : `bas / modéré / élevé / critique` |
| **Standard** | Score **0–5 par dimension** + niveau global |
| **Premium** | Score agrégé **0–100** (uniquement si méthodologie documentée) |

Mapping score → niveau : 0–1 = `bas`, 2 = `modéré`, 3 = `élevé`, 4–5 = `critique`. La méthode
publique est exposée sur la page `methode-cvi` du site.

## 4. HDDE — le diagnostic (offre **Standard**)

HDDE (*Hidden Dependency Discovery Engine*) est un **cockpit d'entretien expert** où un analyste
révèle les dépendances géopolitiques cachées d'une entreprise. Il est **pack-driven** : toute la
méthodologie vit dans un **domain pack** YAML (`apps/hdde-api/domain_packs/…`), pas dans le code
(ADR 0032) — ajouter une question ou une règle est un changement de données.

### Le parcours en 8 étapes

1. **Cadrage du cas** — métadonnées entreprise (secteur, acteur critique, fonction métier à risque,
   pays, taille). Statut `draft → in_progress → archived`.
2. **Entretien guidé** — 11 blocs structurés (acteur critique, type de dépendance, flux critique,
   substitution, dépendances tier-2 cachées, gatekeepers, délai d'impact, seuils de décision,
   red team, synthèse). Chaque réponse est typée : `verified_fact / estimate / hypothesis /
   intuition / unknown` + qualité de preuve 0–5.
3. **Registre de preuves** — contrats, données logistiques, sources officielles, notes d'analyste…
   notés en fiabilité 0–5, liés aux dimensions et aux réponses. Les suggestions LLM ne sont **pas**
   admissibles comme preuve (ADR 0034).
4. **Roster d'entreprise** — fournisseurs, clients, sites, banques, assureurs, régulateurs,
   partenaires… chacun scoré indépendamment sur les 9 dimensions (modèle « enterprise », ADR 0036).
5. **Génération du packet de diagnostic** — le cœur du moteur :
   - **9 dimensions** scorées (dépendance fournisseur, dépendance cachée, faiblesse de substitution,
     exposition juridictionnelle, criticité de flux, délai d'impact, pression gatekeeper, qualité de
     preuve, maturité décisionnelle).
   - **Modèle de divergence (ADR 0040)**, anti-tautologie :
     `dépendance_cachée = exposition × aveuglement`, où *exposition* = max(dépendance fournisseur,
     criticité flux) et *aveuglement* = moyenne(invisibilité tier-2, substitution non prouvée,
     preuve faible). Lier des preuves augmente la confiance et réduit l'aveuglement.
   - **Verdict opérationnel** dérivé de règles : `monitor → prepare → act → escalate`.
   - **Enrichissement** : chokepoints (candidats P0 filtrés, scope read) + niveau CVI (mapping local).
6. **Red team OpenAI** (`gpt-4o`, ADR 0034) — 8 personas adverses (Achats, Supply Chain, Juridique,
   Exec, Assurance, Logistique, Régulateur/État, Acteur disruptif) attaquent le diagnostic
   provisoire. **Les suggestions ≠ preuves** : statut `pending` jusqu'à validation analyste. Une
   suggestion acceptée « pouvant remonter le verdict » le fait monter d'un cran (biais conservateur).
7. **Diff & validation** — comparaison des versions de packet ; validation humaine (`validated_by`,
   `validated_at`).
8. **Exports FR/EN** — fiche diagnostic, matrice dépendance↔contrôle, couche d'actions légères, et
   `diagnostic_packet.json` canonique (avec `pack_hash` pour la traçabilité).

### Le livrable HDDE

Un **packet** structuré : verdict opérationnel + confiance, diagnostic primaire, « dépendance réelle
probable » (description + hypothèse + score de divergence), flux critique (type, substituabilité,
délai d'impact), 9 scores tracés avec preuves, patterns activés, red flags (tests à mener),
incertitudes ouvertes, actions légères priorisées, couche entreprise (concentration HHI, single-source,
angles morts tier-2) et matrice acteur × risque.

> Le code HDDE **ne verrouille pas les fonctionnalités par tier** : la frontière Basic/Standard/Premium
> est **commerciale et opérationnelle**, pas codée. Un compte analyste HDDE donne accès au workflow
> complet.

## 5. VERDICT — l'arbitrage (offre **Premium « Arbitrer »**)

VERDICT est un **conteneur Docker séparé** (SQLite propre, port 8095) qui porte le protocole
**V·E·R·D·I·C·T**. Il ne diagnostique pas : il **tranche**. Réf. ADR 0041–0043,
[`docs/methode-verdict.md`](../../../docs/methode-verdict.md).

### Le protocole en 7 temps

| Temps | | Rôle | Garde-fou |
| --- | --- | --- | --- |
| **V** | Voir | Poser la situation réelle **sans solution préférée** | La question, pas la réponse |
| **E** | Évaluer | PESTEL **décisionnel** : seuls les facteurs qui changent coût/risque/timing | Pas de PESTEL encyclopédique |
| **R** | Révéler | SWOT **décisionnelle** : capacités réelles, contraintes dures, leviers | Force sans preuve = hypothèse |
| **D** | Définir | **≥3 options** (principale + alternative minimale + opposée/non-action) + Canvas de viabilité 5D | Alternative minimale obligatoire |
| **I** | Interroger | Hypothèse critique, preuve, contradiction, **niveau de preuve 0–5**, red flags | Preuve ET objection explicites |
| **C** | Comparer | **7 critères pondérés /100** → score brut + ajusté ; **audit hard-veto** | Le score ≠ la décision |
| **T** | Trancher | Verdict + seuil d'arrêt + date de revue + **validation humaine** | Condition d'arrêt obligatoire |

### Les 7 critères pondérés (somme = 100)

Valeur stratégique (20) · Adéquation au contexte (15) · Capacité réelle (15) · Viabilité systémique
(15) · Risque net (15) · Niveau de preuve (10) · Optionalité (10).

### Verdicts et audit

Par score ajusté, **avant** veto : `≥80` → **FAIRE** · `60–79` → **TESTER** · `40–59` → **DIFFÉRER**
· `0–39` → **ABANDONNER**.

L'**audit hard-veto** (anti-tyrannie du score) prime sur le score. Pour autoriser **FAIRE** : preuve
≥4 sur l'option retenue, confiance non-faible, aucun red flag bloquant non résolu, un seuil d'arrêt
**et** une validation humaine. Pour **TESTER** : un test de vérité falsifiable qui **peut tuer
l'option**. Statuts : `VALIDE / À CORRIGER / BLOQUÉ`.

### Le pont HDDE → VERDICT (pré-remplissage géopolitique)

C'est ici que la chaîne se referme. `@ag/verdict#buildCandidates` (ADR 0042/0043) ingère **en lecture
seule** le packet HDDE (via une API interne Docker token-protégée, `http://hdde:8090`, jamais via
Caddy) + CVI + chokepoints, et **pré-remplit** les temps E et R :

- Red flags HDDE → **Faiblesses** SWOT ; patterns activés → **Menaces** SWOT.
- Concentration (single-source, top-client ≥30 %, clustering géographique) → Faiblesses/Menaces + PESTEL.
- Scores CVI (menace, capacité de perturbation, gouvernance) → Menaces SWOT + PESTEL.
- Contrôle/dépendance de corridor (chokepoints) → PESTEL Politique.
- `light_actions` HDDE → **Opportunités** + amorces d'options (type « alternative minimale »).

Tout arrive en `status: 'candidate'` avec `source_ref` ; l'analyste valide/rejette ; **aucune donnée
HDDE n'est mutée**. PESTEL/SWOT/Business-Model-Canvas ne sont pas empilés mais **transformés pour la
décision** (seuls les facteurs qui déplacent coût/risque/timing sont retenus). Enfin, une **red team
OpenAI** (proof level 0, jamais un verdict) attaque l'arbitrage provisoire, et une **note de décision
FR/EN** est exportée (restitution 45–60 min).

## 6. Corrélation offre ↔ workflow

```
┌──────────── BASIC — « Informer » (19–49 €/mois) ────────────┐
│ Site public en lecture : Atlas, Notes, résumés de Dossiers   │
│ CVI QUALITATIF (bas/modéré/élevé/critique)                   │
│ → Comprendre les corridors. Aucun outil authentifié.         │
└──────────────────────────────────────────────────────────────┘
                          ▼  (passe au tooling)
┌──────────── STANDARD — « Surveiller » (199–799 €/mois) ──────┐
│ Tout Basic + Fiches Atlas complètes, alertes, comparaisons   │
│ CVI 0–5 PAR DIMENSION + historique léger                     │
│ OUTIL : HDDE → diagnostic des dépendances cachées            │
│ → Savoir OÙ on est exposé.                                    │
└──────────────────────────────────────────────────────────────┘
                          ▼  (le packet HDDE alimente…)
┌──────────── PREMIUM — « Arbitrer » (3 000–15 000 €+) ────────┐
│ Tout Standard + entretien de cadrage, scénarios, seuils      │
│ CVI 0–100 agrégé (méthodo documentée)                        │
│ OUTIL : VERDICT → arbitrage décisionnel (7 temps, veto)      │
│ Pré-rempli depuis HDDE+CVI+chokepoints, note de décision     │
│ + pilote fermé 6–8 semaines                                  │
│ → Décider QUOI faire (FAIRE/TESTER/DIFFÉRER/ABANDONNER).      │
└──────────────────────────────────────────────────────────────┘
```

### Détail des trois offres

| | **Basic — Informer** | **Standard — Surveiller** | **Premium — Arbitrer** |
| --- | --- | --- | --- |
| Prix | 19–49 €/mois | 199–799 €/mois | 3 000–15 000 €+ |
| Promesse | Comprendre corridors/flux/vulnérabilités | Suivre signaux, scores et évolutions | Scénarios, seuils de bascule, arbitrage contextualisé |
| Outil associé | — (lecture publique) | **HDDE** | **VERDICT** (+ HDDE) |
| Granularité CVI | Qualitatif | 0–5 par dimension | 0–100 agrégé |
| Inclus clés | Notes, Fiches Atlas Basic, résumés de dossiers, newsletter | + Atlas complet, alertes thématiques, 3–5 signaux/corridor, comparaisons | + entretien de cadrage, diagnostic d'exposition, scénarios & seuils, options de mitigation, restitution + note de décision, pilote 6–8 sem. |
| Exclus | Scoring 0–5, alertes, historique | Pondérations CVI sur mesure, restitution perso | Audit supply-chain complet, conseil juridique, garantie de prédiction, surveillance temps réel |

### La logique de valeur

La valeur monte avec la **profondeur du raisonnement**, chaque outil consommant le précédent :

- **Basic** répond à *« que se passe-t-il sur les corridors ? »* → **information**.
- **Standard** répond à *« où mon entreprise est-elle exposée ? »* → **diagnostic** (HDDE).
- **Premium** répond à *« que dois-je décider, et à quel seuil basculer ? »* → **arbitrage** (VERDICT).

VERDICT ne part jamais d'une page blanche : il part du packet HDDE, lui-même nourri par les scores CVI
et le registre Chokepoints. Et à chaque transition, le garde-fou doctrinal tient : **candidat ≠ fait**,
validation humaine obligatoire, pas de prédiction garantie.

---

### Pour aller plus loin

- Méthode VERDICT (référence canonique FR) : `docs/methode-verdict.md`.
- Méthode CVI : page publique `methode-cvi` du site.
- ADR clés : 0012/0035 (Chokepoints), 0027 (candidat ≠ fait), 0032–0036 + 0040 (HDDE),
  0041–0043 (VERDICT).
