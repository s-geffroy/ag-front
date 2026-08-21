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

---

# Reprise d'instruction — 2026-08-21

> **STATUT INCHANGÉ : ÉVALUATION CANDIDATE, AUCUN GATE N'EST FLIPPÉ ICI.**

Le dossier ci-dessus datait du 2026-07-14. Trois choses ont bougé depuis, et la première change la
lecture des deux autres :

1. **2026-08-10** — la fiche a été **réécrite** : bloc « État au 10 août 2026 » (reprise des attaques
   du 22 juillet, motif de ciblage changé, JMIC SEVERE), section *Flux* rechiffrée des deux côtés de
   la scission (4,67 Md$ / +23 %, 3 580 navires au T2, 266 transits du 27/07 au 02/08), section
   *Niveau de confiance* réécrite pour nommer trois grandeurs manquantes plutôt que les combler.
2. **2026-08-13** — `contradiction_done` coché ; le juge et la red team relancés sur la version du 10.
3. Le livrable porte depuis un `blocker` : *« le motif de ciblage a changé de nature, ce qui met en
   question le verdict, le niveau CVI et la confiance »*.

État au 2026-08-21 : Munich **4/10** (1, 3, 4, 5 = `ok`) ; restent **2, 6, 7, 8, 9, 10**.
Portes : `compliance_done`, `human_review_done`, `cvi_justified`. Échéance **2026-08-30**.

Volet machine re-vérifié sur la version du 10 août : **0 violation**, 26 sources, 25 avec URL.

## A. Le point qui prime sur tous les autres : le verdict se contredit lui-même

Le `verdict` rendu **en tête de la page publique** dit :

> « **Ouvert aux pétroliers** et aux petits porte-conteneurs, il reste de facto interdit aux
> mégaporteurs Asie–Europe. »

Le corps de la même fiche, six lignes plus bas, dit :

> « Depuis le 22 juillet 2026, des **pétroliers sont de nouveau attaqués** […] le JMIC a inscrit un
> niveau régional SEVERE le 2 août. »

**La première clause du verdict est périmée par le propre bloc d'actualité de la fiche.** Le reste du
verdict, lui, tient — et tient même remarquablement : « le chokepoint est devenu un filtre tarifé par
le risque — son curseur n'est plus la distance, mais la prime d'assurance et **la crédibilité d'un
cessez-le-feu** ». Le curseur qu'il désignait est exactement celui qui a bougé le 22 juillet. Le
verdict n'est donc pas invalidé par la reprise : il est **confirmé**, sauf sur son premier mot.

_Décision demandée :_ réécrire la clause d'ouverture (le segment pétrolier n'est plus « ouvert », il
est **ciblé**, et c'est le segment conteneurs feeder qui reste praticable), ou dater explicitement la
clause. C'est un geste d'auteur, pas une coche — mais il conditionne `human_review_done`, et sans lui
la fiche s'ouvre sur une phrase que son propre corps dément.

## B. Les 6 contrôles Munich restants, revus sur la version du 10 août

### Contrôle 2 — Fait / analyse / opinion (humain)

**Satisfait, et mieux qu'en juillet.** Les trois dispositifs de juillet sont intacts : encart
« Fait / analyse » en pied, colonne **_Statut / fondement_** du tableau de seuils (**Adossé** ≥ 2
sources vs **Repère historique**), section *Scénarios* séparée des *Flux*. La réécriture du 10 août
en ajoute un quatrième, plus fin : le bloc d'actualité qualifie ses propres chiffres —
« **Premières mesures, à manier avec prudence** », « **préliminaires et d'origine commerciale** »,
« ils indiquent une stabilisation basse, **pas une tendance établie** », et nomme ce qui n'est pas
mesuré (« aucun décompte public ne sépare encore le report des conteneurs de celui des tankers »).
Le juge donne **pass 0.98**.

### Contrôle 6 — Secret des sources (humain, non jugeable)

**Satisfait / sans objet.** 26 sources, toutes publiques et nommées, 25 avec URL. La seule sans URL
(« Reuters / Kpler — comptage journalier ») est explicitement qualifiée de **donnée commerciale
volatile** dans son propre libellé. Aucune source confidentielle, aucun informateur, aucune donnée
en scope `tainted` interne (ADR 0013).

### Contrôle 7 — Séparation éditorial / commercial (mixte)

**Satisfait.** Volet machine : lint R7 à **0 violation** sur la version du 10. Volet humain : la
seule mention d'offre est une **divulgation neutre de périmètre** en pied (« le scoring CVI 0–5 par
dimension est réservé à l'offre Standard »), pas une sollicitation ; aucun CTA dans le corps. Le
juge rend `uncertain 0.71` au motif qu'il « ne peut établir sur le seul texte l'absence de
sponsorisation » — réserve de principe du modèle, pas un constat : c'est précisément ce que le
relecteur, lui, sait.

### Contrôle 8 — Plagiat / diffamation / vie privée (humain)

**Satisfait, et c'est le contrôle où la réécriture a le plus apporté.** La fiche nomme des acteurs
— Houthis, Iran, Égypte, EUNAVFOR Aspides — et, depuis le 10 août, des **acteurs commerciaux**
(CMA CGM retiré de la plupart des transits, Maersk annulant son service MECL, un tanker contrôlé par
Bahri). Deux raisons de tenir le contrôle :

- chaque imputation d'attaque renvoie à une source primaire ou institutionnelle citée (Reuters,
  ACLED, US MARAD, JMIC/CMF, SPA via Xinhua) ;
- la fiche pose une **distinction de preuve explicite** là où elle était le plus nécessaire :
  l'incendie de l'*Encelia* est « **confirmé par l'agence de presse saoudienne, et non seulement
  revendiqué** ». C'est exactement la prudence que le contrôle demande.

Aucune personne privée n'est mise en cause. Les faits d'entreprise (retrait, annulation de service)
sont des décisions publiques rapportées, pas des imputations.

_Point à trancher :_ confirmer qu'aucune des trois attaques de juillet-août n'est attribuée
au-delà de ce que la source cite.

### Contrôle 9 — Indépendance / pas de corruption (humain, non jugeable)

**Satisfait, et désormais vérifiable.** Aucun client, aucun pilote : le jalon
`milestone_premium_pilots_12m` est `not_started`, `contacts.json` porte 2 entrées de prospection.
Aucun sponsor, aucune contrepartie. Comme pour les notes validées ce jour : l'indépendance est
structurellement vraie à cette date, c'est le bon moment pour la graver.

### Contrôle 10 — Refus de pression / traçabilité (humain, non jugeable)

**Satisfait, et plus solidement qu'en juillet.** À l'époque le dossier invoquait « la gouvernance
tracée au cockpit » alors que le journal était vide. Aujourd'hui : ADR 0069 est en place, le journal
compte 30 entrées nominatives, la publication passera par `POST /api/publish` — gates complets +
`validated_by` + entrée de journal — et `check:munich` garde le build en dernier ressort.
_Limite reconnue (ADR 0046) :_ `validated_by` reste déclaratif, sans authentification.

**Synthèse :** les 6 contrôles sont proposés `ok`. Cela ouvre `compliance_done` (10/10), et **rien
de plus** — ni `human_review_done`, qui suppose la décision du §A, ni `cvi_justified`, qui suppose
celle du §C.

## C. `cvi_justified` — la reprise du 22 juillet change-t-elle `eleve` ?

**Évaluation candidate : non. `eleve` tient, et la reprise le conforte plutôt qu'elle ne le
conteste.** Reprise des trois arguments de juillet, testés contre les faits d'août :

| Argument de juillet | Après le 22 juillet 2026 |
|---|---|
| Exposition très forte (≈ 15 % du commerce maritime, chokepoint sans alternative physique) | **Inchangé** — géographie et parts ne bougent pas. |
| Plafonné à `eleve` car **il existe un bypass fonctionnel** (route du Cap) | **Confirmé** — le Cap reste la route par défaut du conteneur ; le corridor ne s'est pas fermé, les transits sont revenus au niveau du début 2026 (266 du 27/07 au 02/08). |
| Réversibilité réelle mais fragile | **Dégradée** — le compteur des « ~3 mois sans attaque » est remis à zéro. C'est la dimension résilience qui bouge, et `eleve` (plutôt que `critique`) encode déjà cette fragilité. |

Argument supplémentaire, propre à août : le ciblage est **plus étroit** qu'en 2023-24 — un pavillon
et un armateur, non le trafic Asie–Europe indistinctement. L'exposition du commerce général n'est
donc pas supérieure à celle qui avait justifié `eleve`.

**Ce sur quoi je ne me prononce pas, et qui est ton arbitrage :** `confidence: moyen` est-elle encore
juste ? Le comptage journalier à Bab el-Mandeb est passé de 28 à **1** navire en cinq jours, et
**aucun décompte public ne sépare encore conteneurs et tankers depuis le 22 juillet**. La fiche
nomme honnêtement les trois grandeurs manquantes plutôt que de les estimer — mais on peut soutenir
que `moyen` reste généreux tant que ces trois-là manquent. Deux issues défendables : maintenir
`moyen` en s'appuyant sur la section *Niveau de confiance* qui borne explicitement l'incertitude, ou
descendre à `bas` le temps que la prime post-juillet soit documentée.

## D. Red team ADR 0039 — 5 findings à arbitrer (rapport `pending`)

`contradiction_done` est **déjà coché** (2026-08-13), mais le rapport n'a jamais été marqué lu. Les
5 findings, avec une proposition d'arbitrage :

| Sév. | Claim visée | Objection | Arbitrage proposé |
|---|---|---|---|
| **4** | « Le Cap reste la route par défaut pour l'Asie–Europe » | Affirmé sans chiffrer la capacité d'absorption du Cap | **Partiellement fondé.** La fiche donne le report (+191 % de transits conteneurs en 2024) et pose la limite (« capacité limitée à grande échelle sans tension sur les ports »), mais jamais la capacité elle-même. À **déclarer en angle mort**, pas à combler : aucune source publique ne donne une capacité mensuelle de la route du Cap. |
| 3 | « Les deux segments se mesurent séparément » | Pas de distinction chiffrée entre rétablissement énergie et conteneurs | **Non fondé.** C'est précisément ce que fait la section *Flux* : 5,7 % du niveau 2023 pour les ≥ 7 500 EVP contre 91 % pour les < 7 500 (WSC/Alphaliner), et 4,0 vs 8,7 mb/j côté brut. La red team lit une lacune là où la fiche est la plus chiffrée. |
| 3 | « La menace est active […] les frappes ont repris le 22 juillet » | Pas de données sur l'impact économique des attaques récentes | **Fondé, et déjà assumé.** C'est exactement l'une des trois grandeurs que la section *Niveau de confiance* déclare manquantes. À lever comme **lacune nommée**, pas comme défaut. |
| 2 | « Le corridor a filtré les mégaporteurs » | N'explique pas pourquoi les petits porteurs reviennent à 91 % | **Fondé mais hors périmètre.** La fiche constate le tri et n'en propose pas la mécanique. Une phrase d'explication (exposition assurantielle et valeur de coque très différentes) serait un ajout utile — à faire, ou à assumer comme hors du format fiche. |
| 3 | Arc de la prime war-risk | N'analyse pas l'effet des primes sur les décisions d'armateurs | **Non fondé.** L'effet est le verdict même de la fiche (« filtre tarifé par le risque ») et la ligne « Prime war-risk » du tableau de seuils lie explicitement le bond à « révision des choix d'armateurs ». |

Deux findings à porter en angle mort assumé (n° 1 et 3), deux à écarter comme mal lus (n° 2 et 5),
un ajout facultatif (n° 4). Aucun ne remet en cause une affirmation de la fiche.

## E. Ordre de travail proposé

1. **Trancher le §A** — la clause d'ouverture du verdict. Rien d'autre ne devrait partir avant.
2. **Marquer le rapport red team comme lu** après arbitrage des 5 findings (§D) — accusé de lecture,
   pas une porte.
3. **Poser les 6 contrôles Munich** (2, 6, 7, 8, 9, 10) → Munich 10/10 → **`compliance_done`**.
4. **Trancher le §C** — `confidence` maintenue ou abaissée → **`cvi_justified`**.
5. **`human_review_done`**, puis publication 1-clic. Échéance **2026-08-30**.

Soit **9 actes nominatifs** et **deux décisions d'auteur** (le verdict, la confiance).
