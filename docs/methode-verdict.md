# Méthode VERDICT — arbitrage décisionnel sous incertitude

> Document de méthode (canonique). Adaptation au contexte _Applied Geopolitics_ du POC
> `verdict_v1_poc_ui_pack` (`MASTER_DOCUMENT.md`). VERDICT est le **3ᵉ étage Premium** : il prolonge
> le diagnostic HDDE jusqu'à la **décision arbitrée**. Voir ADR 0041–0043.
>
> **Statut des sorties :** tout artefact VERDICT est un **candidat en attente de validation humaine**,
> jamais un fait ni une prédiction (doctrine ADR 0027). Le score ouvre une possibilité ; il ne décide
> jamais seul.

## 1. À quoi sert VERDICT

VERDICT sert à **décider lucidement quand le contexte est incertain, les options imparfaites et les
biais dangereux**. Il transforme une situation complexe en **options comparables, testables et
arbitrables**, et produit un **verdict opérationnel** assorti d'une condition d'arrêt et d'une date de
revue.

Dans le tunnel Applied Geopolitics :

- le **site public** démontre le sérieux et déclenche l'échange stratégique ;
- **HDDE** co-construit les besoins de connaissance et révèle les **dépendances cachées** (→ Basic/Standard) ;
- **VERDICT** accompagne le client **Premium** jusqu'à l'**arbitrage** : il opérationnalise les derniers
  maillons de la doctrine maison `… → Seuils → Scénarios → Décisions`.

## 2. Les trois cadres, transformés pour la décision

VERDICT **n'empile pas** PESTEL, SWOT et le Business Model Canvas : il les **transforme** et les
**chaîne**. Chacun perd sa version « descriptive » au profit d'une version « décisionnelle ».

| Cadre d'origine | Version VERDICT | Ce qui change |
| --- | --- | --- |
| **PESTEL** | **PESTEL décisionnel dynamique** (temps E) | On ne retient **que** les facteurs qui changent réellement le **coût, le risque, le timing ou une hypothèse** d'une option. Un facteur qui ne déplace aucune option est écarté. |
| **SWOT** | **SWOT décisionnelle** (temps R) | Capacités **réelles**, vulnérabilités, **contraintes dures**, leviers exploitables, **asymétries** — pas de forces aspirationnelles. *Une force sans preuve est enregistrée comme une hypothèse.* |
| **Business Model Canvas** | **Canvas de viabilité systémique** (temps D) | 5 dimensions évaluées **par option** : valeur produite, bénéficiaires, mode d'adoption/validation, ressources/coûts critiques, soutenabilité/risque systémique. Vaut pour les décisions commerciales **et** non commerciales. |

Le **prisme géopolitique** est l'apport propre d'Applied Geopolitics : le diagnostic **HDDE**, les
scores **CVI** et le contexte **chokepoints** **pré-remplissent** les temps E et R et **amorcent** les
options du temps D (cf. §6).

## 3. Le protocole en 7 temps — V·E·R·D·I·C·T

Chaque temps impose des questions obligatoires et un garde-fou anti-biais.

1. **V — Voir la situation réelle.** Énoncer la situation **sans solution préférée** : objet de
   décision, horizon, parties prenantes. *Garde-fou : la situation est posée sans la réponse.*
2. **E — Évaluer les forces externes.** PESTEL décisionnel : uniquement les facteurs qui déplacent une
   option. *Garde-fou : pas de PESTEL « encyclopédique ».*
3. **R — Révéler la position, les contraintes et les asymétries.** SWOT décisionnelle. *Garde-fou :
   une force sans preuve devient une hypothèse.*
4. **D — Définir les options décisionnelles.** **Au moins trois options**, dont les **types
   obligatoires** : `principale` (`main`), `alternative minimale` (`minimal_alternative`), et
   `opposée` (`opposite`) **ou** `non-action active` (`active_non_action`). Chaque option reçoit son
   **Canvas de viabilité** (5 dimensions). *Garde-fou : alternative minimale + opposée/non-action
   obligatoires.*
5. **I — Interroger les hypothèses, les preuves et les biais.** Pour chaque option : `hypothèse
   critique`, `preuve principale`, `contradiction principale`, **niveau de preuve 0–5** ; red flags.
   *Garde-fou : preuve **et** contre-argument explicités.*
6. **C — Comparer par score, risques et vetos.** 7 critères pondérés /100 → score brut + ajustements ;
   **audit + vetos**. *Garde-fou : le score n'est pas la décision ; les vetos sont vérifiés.*
7. **T — Trancher, tester ou différer.** Verdict **FAIRE / TESTER / DIFFÉRER / ABANDONNER** + **seuil
   d'arrêt** + **date de revue** + **validation humaine**. *Garde-fou : condition d'arrêt obligatoire.*

## 4. Comparaison : score, échelle de preuve, verdict

### 4.1 Les 7 critères (poids par défaut, somme = 100)

| Critère | Poids | Question |
| --- | --- | --- |
| `strategic_value` — Valeur stratégique | 20 | L'option améliore-t-elle réellement la situation ? |
| `context_fit` — Adéquation au contexte | 15 | Résiste-t-elle aux forces externes (PESTEL) ? |
| `real_capacity` — Capacité réelle | 15 | Avons-nous **vraiment** les moyens d'exécuter ? |
| `systemic_viability` — Viabilité systémique | 15 | Peut-elle fonctionner comme un système réel ? |
| `net_risk` — Risque net | 15 | Le risque est-il acceptable au regard du gain ? |
| `proof_level` — Niveau de preuve | 10 | Repose-t-elle sur des preuves solides ? |
| `optionality` — Optionalité | 10 | Ouvre-t-elle plus de portes qu'elle n'en ferme ? |

`score_brut = Σ (valeur_critère / 5 × poids)`, arrondi à l'entier (0–100). Le `score_ajusté` applique
des **pénalités explicites et justifiées** (confiance faible, contradiction sérieuse, red flag,
preuve fragile) puis d'éventuels **plafonds**, borné à 0–100. Une **adaptation des poids** est tolérée
seulement si elle est **justifiée** et reste à **±5** de chaque poids par défaut (somme = 100).

### 4.2 Échelle de niveau de preuve (0–5)

`0` aucune preuve (préférence) · `1` intuition · `2` raisonnement plausible non vérifié · `3` signaux
externes / cas comparables / signaux faibles · `4` donnée directe partielle, test, entretien, mesure ·
`5` validation directe forte (paiement, engagement, usage répété, mesure robuste).

### 4.3 Verdict par défaut suggéré par le score (avant vetos)

`≥ 80` → **FAIRE possible** · `60–79` → **TESTER** · `40–59` → **DIFFÉRER** · `0–39` → **ABANDONNER**.
Ce n'est **qu'une suggestion** : les vetos peuvent l'interdire, et un humain valide.

## 5. Vetos durs (anti-tyrannie du score)

L'audit rend l'un de trois statuts : **VALIDE**, **À CORRIGER** (avertissements), **BLOQUÉ** (≥1 veto).
Règles dures :

- **3 types d'options obligatoires** (principale + alternative minimale + opposée/non-action) ;
  niveau de preuve par option ; ≥3 options scorées ; cohérence du `score_brut` recalculé.
- **FAIRE interdit si** : preuve de l'option retenue **< 4**, confiance **faible**, **red flag bloquant
  non résolu**, absence de **seuil d'arrêt**, absence de **validation humaine**.
- **TESTER interdit sans test de vérité complet** (8 champs, cf. §5.1) **et** capable de **tuer
  l'option** (`can_kill_option`). *« Un test qui ne peut pas tuer l'option n'est pas un test VERDICT. »*
- **DIFFÉRER** : motif, signal de réouverture et date de revue attendus. **ABANDONNER** : disposition
  (archiver / transformer / surveiller / remplacer) attendue.

### 5.1 Le test de vérité (obligatoire pour TESTER)

Action **falsifiable** et **bornée** : `hypothèse critique`, `protocole minimal`, `durée max`, `coût
max`, `signal de succès`, `signal d'échec`, `décision si succès`, `décision si échec` — et capacité à
**invalider** l'option.

## 6. Branchement géopolitique (pré-remplissage)

Le moteur `@ag/verdict#buildCandidates` consomme le **packet diagnostic HDDE**, l'éventuel **CVI** du
corridor et le contexte **chokepoints** (lecture seule) pour émettre des **candidats** :

- HDDE `red_flags`, scores élevés (`hidden/supplier/flow ≥ 3`), source unique, angles morts rang-2 →
  **SWOT Faiblesses** ; patterns activés et concentration (pays, part client) → **SWOT Menaces** ;
  `light_actions` → **Opportunités** + **amorces d'options**.
- chokepoints → **PESTEL Politique/Légal** + Menaces ; CVI `flow_criticality` → **PESTEL Économique** ;
  CVI `menace`/`capacite_perturbation`/`concentration ≥ 3` → **Menaces** + seuils de bascule.

Chaque candidat porte sa **provenance** (`source_ref`) et le statut `candidate` ; l'analyste valide ou
rejette. Aucun écrit n'est fait dans les données canoniques HDDE/CVI/chokepoints.

## 7. Sorties

- **Note de décision FR/EN** (les 7 temps, options, canvas, scoring, audit, verdict, test de vérité,
  seuils, incertitudes ouvertes).
- **Trace d'audit** versionnée (statut + codes de veto) et **snapshots** — la décision est rejouable
  avec le même `pack_hash`/contexte.

## 8. Limites

VERDICT **ne prédit pas**, **ne remplace pas** le jugement du dirigeant et **n'autorise aucune action
irréversible** sans seuil d'arrêt ni validation humaine. La red team (LLM) **n'apporte aucune preuve**
(niveau 0) : elle attaque les hypothèses ; l'analyste tranche.

## Références

- **PESTEL** — analyse des macro-environnements (Politique, Économique, Social, Technologique,
  Environnemental, Légal) ; origine « ETPS » attribuée à F. Aguilar, *Scanning the Business
  Environment* (1967), enrichie ensuite (PEST → PESTEL).
- **SWOT / TOWS** — A. Humphrey (SRI, années 1960) et la tradition de Harvard (K. Andrews,
  *The Concept of Corporate Strategy*, 1971) ; matrice TOWS de H. Weihrich (1982).
- **Business Model Canvas** — A. Osterwalder & Y. Pigneur, *Business Model Generation* (2010).
- **Doctrine de décision sous incertitude** — tests falsifiables (héritage popperien), pensée par
  options réelles, garde-fous anti-biais cognitifs (Kahneman, *Thinking, Fast and Slow*, 2011).
- **Cadres internes Applied Geopolitics** — Méthode **CVI** (`docs/` + `/methode-cvi`), **HDDE**
  (ADR 0032–0040), couplage **chokepoints/CVI** (ADR 0035), **candidats ≠ faits** (ADR 0027),
  charte de **Munich** (ADR 0037).
- **Source de la méthode** — POC `verdict_v1_poc_ui_pack` (`MASTER_DOCUMENT.md`), porté en TypeScript
  (`@ag/verdict`) ; décisions d'architecture **ADR 0041–0043**.
