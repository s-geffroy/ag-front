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
Caddy) et **pré-remplit** les temps E et R. **Garde-fou dur : seul un packet _validé par un analyste_
est ingérable** — l'API interne refuse un brouillon (`no_validated_packet`), et VERDICT revérifie le
statut avant de s'en servir. Le packet porte, sous le **contrat HDDE unique** (pas de seconde source,
ADR 0042), trois signaux géopolitiques :

- Red flags HDDE → **Faiblesses** SWOT ; patterns activés → **Menaces** SWOT.
- Concentration (single-source, top-client ≥30 %, clustering géographique) → Faiblesses/Menaces + PESTEL.
- **Évaluation CVI du corridor** (assessment multi-dimensions servi par l'API Chokepoints —
  `GET /chokepoints/{id}/cvi-assessment`, scope `read`, validé par `@ag/cvi`) : `menace`, `capacité de
  perturbation`, `concentration` → **Menaces** SWOT ; `gouvernance` → **PESTEL Légal**. Le CVI de flux
  embarqué alimente en plus **PESTEL Économique**.
- Contrôle/dépendance de corridor (candidats chokepoints portés par le packet) → **PESTEL Politique** +
  **Menaces** SWOT.
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

## 7. Maillons à blinder — manques opérationnels

Cette section est le **fil rouge d'optimisation pour les attentes du client** : chaque maillon est une
**promesse** faite au client, et la question est « la chaîne la tient-elle de bout en bout ? ». On lit
d'abord le **parcours** et ses **moments de vérité**, puis les manques par axe (service / validation /
plus-value), chacun avec l'**attente client**, la **garde requise** et le **statut**.

**Parcours & moments de vérité.** Basic « informer » → Standard « surveiller » → Premium « arbitrer ».
La valeur doit **atterrir** à quatre moments : (1) **souscription** (le client paie et obtient un
accès), (2) **premier diagnostic** (HDDE révèle une exposition réelle), (3) **restitution** (la note de
décision VERDICT est remise et comprise), (4) **suivi de seuil** (le client sait quand re-décider).
Aujourd'hui les moments 1 et 4 ne sont pas tenus par la chaîne (voir ci-dessous).

### 7.1 Service au client

- **Rail de paiement / abonnement.** *Attente client :* « je paie mon offre `€/mois` et j'ai accès. »
  *Réel :* aucun paiement — les trois CTA pointent vers `/contact`. *Garde requise :* rail d'abonnement
  (décision Stripe/Paddle vs facturation manuelle) → **ADR 0045**. *Statut : cible.*
- **Provisioning `paiement → compte`.** *Attente :* « après paiement, je reçois mes identifiants. »
  *Réel :* création de compte **manuelle** (`seed:user` lancé à la main) ; rôles `owner_admin|analyst`
  seulement, **aucun tier codé**, aucune identité client/tenant. *Garde :* déclenchement depuis
  l'encaissement + invitation e-mail + identité client + tier → **ADR 0045**. *Statut : cible.*
- **Cycle de vie commercial.** *Attente (côté AG) :* piloter revenus et rétention. *Réel :* le pipeline
  s'arrête à `pilot_started` (pas de `won/active/churn`) ; KPIs sans MRR/ARR/conversion/rétention.
  *Garde :* stades post-vente + KPIs revenus → **ADR 0045**. *Statut : cible.*
- **Pilote fermé 6–8 sem.** *Attente :* un pilote cadré, borné, livrant une restitution. *Réel :* prose
  (1 stade pipeline + 1 KPI), aucune checklist/timeline/livrables. *Garde :* cycle de vie de pilote
  outillé (caps : 1 corridor, 2–3 flux, 3–5 signaux, 1 restitution). *Statut : cible.*
- **Newsletter + consentement.** *Attente :* « je m'abonne à la newsletter » (vendue en Basic). *Réel :*
  inexistante (pas de formulaire, pas de sujet `newsletter`, pas de consentement). *Garde :* formulaire
  + opt-in RGPD stocké → **ADR 0045**. *Statut : cible.*

### 7.2 Validation & rédaction interne

- **Validation humaine au passage HDDE→VERDICT.** *Attente :* aucune décision ne part d'un diagnostic
  non validé. *Réel :* **fait** — l'API interne ne sert que les packets `validated`, VERDICT revérifie.
  *Garde :* codifiée → **ADR 0046** + amendement **ADR 0042**. *Statut : **fait**.*
- **Cycle de vie & confidentialité des données clients.** *Attente :* « mes données d'entreprise
  sensibles sont protégées, conservées puis supprimées. » *Réel :* non traité — le `taint` couvre la
  **licence de source**, pas la **confidentialité client** ; roster tiers sensible stocké dans HDDE puis
  copié dans VERDICT, sans rétention/purge/suppression/résidence. *Garde :* classification donnée-client
  ≠ taint, rétention = durée contrat + prescription, purge/DSAR, chiffrement-au-repos, résidence UE, DPA
  client → **ADR 0044**. *Statut : cible.* (RGPD art. 28 ; CNIL très active sur la rétention.)
- **Sous-traitant OpenAI (red team).** *Attente :* mes données ne fuitent pas / n'entraînent pas un
  modèle tiers. *Réel :* un résumé du roster (acteurs + pays) part vers `gpt-4o` sans note DPA/résidence.
  *Garde :* DPA signé + exclusion d'entraînement + **Zero Data Retention** **ou** minimisation du roster
  envoyé (abstraction, pas les noms) → **ADR 0044**. *Statut : cible.* (OpenAI : API non utilisée pour
  l'entraînement, rétention 30 j puis suppression, ZDR sur accord entreprise.)
- **Traçabilité du validateur.** *Attente (interne/audit) :* savoir **qui** a validé **quoi**, **quand**.
  *Réel :* « validation humaine » exigée partout mais l'**identité du signataire** et un **journal
  immuable** ne sont pas spécifiés (`compliance_done` = booléen sans signataire). *Garde :* capter
  validateur + horodatage + journal append-only à chaque saut candidat→fait → **ADR 0046**. *Statut :
  cible.*
- **Fraîcheur (staleness) chokepoints/CVI.** *Attente :* une note reste rejouable / signale sa péremption.
  *Réel :* seul le `pack_hash` HDDE est figé ; un changement de `priority_class` chokepoint ou de score
  CVI après la note n'est pas détecté. *Garde :* figer un `context_hash` (assessment CVI `last_updated` +
  priorités chokepoints) et proposer une **ré-ingestion** à divergence → amendement **ADR 0042**.
  *Statut : cible.*

### 7.3 Plus-value client opérationnalisée

- **Boucle post-verdict (le maillon décisif).** *Attente Premium :* « je sais **à quel seuil basculer**
  et on me prévient. » *Réel :* la note pose un seuil d'arrêt + une date de revue, mais **rien** ne
  surveille le seuil ni ne déclenche la revue — la promesse meurt à la livraison du PDF. *Garde :*
  opérationnaliser le seuil (quel signal Atlas/CVI, qui surveille) et la date de revue (rappel,
  re-arbitrage). *Statut : cible.*
- **Restitution 45–60 min.** *Attente :* repartir avec un actionnable clair. *Réel :* format non
  spécifié (qui anime, quel support, quel livrable remis). *Garde :* format de restitution + livrable
  cadré. *Statut : cible.*
- **Articulation éditorial ↔ outillé.** *Attente :* une cohérence entre ce que le client lit (Notes,
  Fiches Atlas) et ce que l'outil diagnostique. *Réel :* le pipeline éditorial (backlog→…→published,
  gates Munich) est **déconnecté** de la chaîne HDDE/VERDICT dans la doctrine. *Garde :* expliciter comment
  une sortie éditoriale nourrit (ou non) un diagnostic client. *Statut : cible.*

## 8. État réel vs cible (registre de blindage)

Chaque ligne = une **promesse**, son **écart**, sa **garde**. À lire du point de vue du client.

| Maillon | Axe | Attente client | Réel aujourd'hui | Garde / ADR | Statut |
| --- | --- | --- | --- | --- | --- |
| Packet validé → VERDICT | Validation | Pas de décision sur diagnostic non validé | Filtre `validated` + garde VERDICT | ADR 0046 / amend. 0042 | **fait** |
| CVI + chokepoints → VERDICT | Plus-value | Arbitrage pré-rempli du contexte géopolitique | Câblé via contrat HDDE unique | ADR 0043 (amendé) | **fait** |
| Rail de paiement | Service | Payer l'offre `€/mois` | CTA → `/contact`, aucun paiement | ADR 0045 | cible |
| Provisioning paiement→compte | Service | Recevoir mes accès après paiement | `seed:user` manuel, pas de tier | ADR 0045 | cible |
| Cycle commercial (won/churn, MRR) | Service | (interne) piloter revenus | Pipeline s'arrête au pilote | ADR 0045 | cible |
| Pilote 6–8 sem. outillé | Service | Pilote cadré et borné | Prose, pas de cycle de vie | ADR 0045 | cible |
| Newsletter + consentement | Service | M'abonner (offre Basic) | Inexistante | ADR 0045 | cible |
| Données clients (rétention/purge/DSAR) | Validation | Données protégées puis supprimées | Non traité (taint ≠ confidentialité) | ADR 0044 | cible |
| Sous-traitant OpenAI (DPA/ZDR) | Validation | Pas de fuite / pas d'entraînement tiers | Roster envoyé sans DPA/minimisation | ADR 0044 | cible |
| Traçabilité du validateur | Validation | (audit) qui a validé quoi/quand | Booléen sans signataire ni journal | ADR 0046 | cible |
| Fraîcheur chokepoints/CVI | Validation | Note rejouable / péremption signalée | Seul `pack_hash` HDDE figé | amend. 0042 | cible |
| Boucle post-verdict (seuil/revue) | Plus-value | Savoir quand re-décider, être prévenu | S'arrête au PDF | ADR 0045/0046 | cible |
| Restitution 45–60 min | Plus-value | Repartir avec un actionnable | Format non spécifié | — | cible |
| Éditorial ↔ outillé | Plus-value | Cohérence lecture ↔ diagnostic | Déconnecté dans la doctrine | — | cible |

---

### Pour aller plus loin

- Méthode VERDICT (référence canonique FR) : `docs/methode-verdict.md`.
- Méthode CVI : page publique `methode-cvi` du site.
- Évaluation CVI par corridor (contrat + spec API) : `docs/cvi-corridor-assessment-spec.md`.
- ADR clés : 0012/0035 (Chokepoints), 0027 (candidat ≠ fait), 0032–0036 + 0040 (HDDE),
  0041–0043 (VERDICT), **0044** (données clients/RGPD), **0045** (provisioning & rail commercial),
  **0046** (traçabilité de la validation humaine).
