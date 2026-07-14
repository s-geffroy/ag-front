# Matériaux de revue — gates humains, fiche Atlas Mer Rouge / Suez

> **STATUT : ÉVALUATION CANDIDATE EN ATTENTE DE VALIDATION HUMAINE — PAS UNE VALIDATION.**
> Préparé le 2026-07-14 pour accélérer (sans les préempter) les gates humains du deliverable
> `deliv_atlas_red_sea_fiche`. **Aucun gate n'est flippé ici.** Ce document propose une
> justification par contrôle que Sylvain **relit et valide** dans la matrice _Quality Gates_ du
> cockpit ; c'est cette validation nominative (ADR 0046) qui coche les `munich[…]` et le gate
> `compliance_done`, puis `cvi_justified`. Base doctrinale : ADR 0037 (Munich), ADR 0039
> (contradiction), ADR 0046 (traçabilité).

État de départ (`apps/cockpit/data/deliverables.json`) : `compliance_done: false`,
`human_review_done: false`, `cvi_justified: false` ; Munich `1,3,4,5 = ok`, contrôles
**`2, 6, 7, 8, 9, 10 = todo`**. Gates méthodo déjà à `true` : `sources_ok`, `llm_draft_done`,
`contradiction_done`.

---

## 1. Revue Munich contrôle-par-contrôle (contrôles `todo`)

Réf. contenu : `apps/public/src/content/atlas/mer-rouge-suez.md`.

### Contrôle 2 — Distinction fait / analyse / opinion (humain)

**Évaluation candidate : satisfait.** La fiche matérialise la frontière à trois endroits :
- l'encart _« Fait / analyse »_ en fin de fiche (« les valeurs chiffrées proviennent des sources
  citées — faits **rapportés**, non reconfirmés par nos soins ; les seuils et scénarios relèvent
  de l'analyse ») ;
- la colonne **_Statut / fondement_** du tableau de seuils, qui étiquette chaque repère
  **Adossé** (≥ 2 sources) vs **Repère historique / hypothétique** ;
- la section _Scénarios_, explicitement prospective, séparée des _Flux_ (chiffrés/sourcés).

_Point à trancher par l'humain :_ vérifier qu'aucune formulation du corps ne présente un scénario
comme un fait.

### Contrôle 6 — Secret professionnel / protection des sources (humain)

**Évaluation candidate : satisfait / sans objet.** Toutes les sources sont **publiques et
citées avec URL** (SCA, WSC, UNCTAD, FMI, EIA, Reuters, S&P, JWC/LMA, IUMI, MARAD, ACLED, JMIC,
EEAS…). Aucune source confidentielle, aucune donnée en scope `tainted` interne (ADR 0013) n'est
exposée. Rien à masquer.

### Contrôle 7 — Séparation éditorial / commercial (machine + humain)

**Évaluation candidate : satisfait.** Volet machine : le lint R7 (`munich-check.mjs`) doit
retourner **0 violation** (à confirmer au build). Volet humain : la seule mention d'offre est une
**divulgation neutre de périmètre** (« le scoring CVI 0–5 par dimension est réservé à l'offre
Standard »), pas une sollicitation ; aucun CTA d'achat/abonnement/tarif dans le corps. Le paywall
vit dans le chrome (`/offres`), pas dans l'analyse.

### Contrôle 8 — Pas de diffamation / accusation sans preuve ; vie privée (humain)

**Évaluation candidate : satisfait, avec vigilance.** Les acteurs nommés (Houthis, Iran, Égypte,
opération EU Aspides) sont traités **factuellement et avec attribution** : les attaques houthies
sont rapportées via sources primaires/institutionnelles (ACLED, US MARAD, JMIC/CMF), pas comme
accusation non étayée. Aucune personne privée mise en cause.

_Point à trancher par l'humain :_ confirmer que chaque imputation d'attaque renvoie bien à une
source citée (recoupement ACLED/MARAD/JMIC).

### Contrôle 9 — Indépendance / pas de corruption (humain)

**Évaluation candidate : satisfait.** Fiche éditoriale sans sponsor, sans lien à un client ou un
pilote Premium ; aucun intérêt commercial ne colore l'analyse du corridor. Pas de conflit
d'intérêts identifié.

### Contrôle 10 — Refus des pressions / clause de conscience (humain)

**Évaluation candidate : satisfait.** La décision de publication passe par la gouvernance
éditoriale tracée au cockpit (gates + validation nominative). Aucune pression externe sur le
contenu.

**Synthèse proposée :** si l'humain confirme 2/6/7/8/9/10 → `compliance_done` peut passer à
`true` **après** que le build ait confirmé 0 violation machine. Cela ne coche pas
`human_review_done`, qui reste la relecture éditoriale finale distincte.

---

## 2. Justification CVI qualitative — `cvi_justified` (candidate)

Modèle : commit dossier `7a045df` (justification CVI qualitative). Rappel : le **scoring CVI 0–5
par dimension** est réservé à l'offre Standard ; la fiche Basic ne porte qu'un **niveau
qualitatif** (`cvi_level`). Valeur en fiche : **`eleve`**.

**Justification proposée du niveau `eleve` (et non `critique`) :**
- **Exposition / criticité** — très forte : le corridor porte ≈ 15 % du commerce maritime mondial
  et ≈ 22 % du conteneurisé (2023) ; Bab el-Mandeb est un chokepoint **sans alternative
  physique**.
- **Ce qui plafonne à `eleve` plutôt que `critique`** — il **existe un bypass fonctionnel** : la
  route du Cap absorbe le report (au prix de +10–16 j, +38–48 % de distance, ~+40 % de carburant)
  et le corridor a **filtré** les mégaporteurs sans se **fermer**. La vulnérabilité est donc
  **coûteuse mais contournable**, à la différence d'un nœud irremplaçable (cf. fiche Taïwan,
  `critique`).
- **Résilience / réversibilité** — moyenne : l'accalmie post-cessez-le-feu (oct. 2025) montre une
  réversibilité réelle mais **fragile** (menace latente, prime volatile) ; la variable pivot est
  politique (crédibilité du cessez-le-feu, trajectoire de la prime _war-risk_), non hydrographique.

**Cohérence :** `cvi_level: eleve` est cohérent avec le verdict (« filtre tarifé par le risque »,
pas verrou absolu) et avec la confiance `moyen`. À valider par l'humain avant de flipper
`cvi_justified`.

---

## Journal de validation humaine (ADR 0046) — append-only

_(À compléter par l'analyste : `Contrôle/Gate | Décision (validé/refusé) | Réserve | Validé par |
Date`. Rappel : cette relecture coche les `munich[…]`, `compliance_done` et `cvi_justified` dans
le cockpit ; elle ne vaut pas `human_review_done`, relecture éditoriale finale distincte.)_
