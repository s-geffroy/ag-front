# Matériaux de revue — matrice Munich et gates, fiche Atlas Détroit d'Ormuz

> **STATUT : ÉVALUATION CANDIDATE EN ATTENTE DE VALIDATION HUMAINE — PAS UNE VALIDATION.**
> Préparé le 2026-08-21 pour instruire (sans les préempter) les gates du livrable
> `deliv_atlas_ormuz_contexte`. **Aucun gate n'est flippé ici.** Base doctrinale : ADR 0037 (Munich),
> ADR 0039 (contradiction), ADR 0046 (traçabilité), ADR 0068 (juge), ADR 0069 (publication).

## État de départ

Fiche rédigée en candidat le **2026-08-10**, chiffrée le 13. Contenu :
`apps/public/src/content/atlas/ormuz.md` (1 556 mots, 11 sections, 10 sources).
Échéance **2026-08-31**.

Matrice Munich : **0/10** — aucun contrôle instruit, c'est la fiche la moins avancée des quatre P0.
Portes : `sources_ok` ✓, `llm_draft_done` ✓ ; restent **`contradiction_done`**, **`compliance_done`**,
**`human_review_done`**.

Volet machine (`checkArtifact`, simulé en publié — le scanner ignore les `published: false`) :
**0 violation**, 10 sources, toutes avec label et type.

---

## A. La porte qui n'existe pas — `cvi_justified` absent sur la fiche qui affirme le plus

La fiche déclare **`cvi_level: critique`**, le niveau le plus fort du vocabulaire. Son livrable ne
porte **aucun gate `cvi_justified`** :

| Livrable | `cvi_level` déclaré | Gate `cvi_justified` |
|---|---|---|
| `deliv_atlas_red_sea_fiche` | `eleve` | **présent**, à `false` |
| `deliv_atlas_ormuz_contexte` | **`critique`** | **absent** |

L'inversion est complète : la fiche qui porte l'affirmation la plus forte est celle qu'aucune porte
n'oblige à la justifier. Et ce n'est pas sans effet — `resolvePublish`
(`apps/cockpit/server/publish.ts:88-89`) ne compte `cvi_justified` que s'il est **présent et faux**.
Ormuz peut donc être publiée avec un `critique` que personne n'a eu à défendre.

Le `blocker` du livrable dit pourtant, mot pour mot : « reste la chaîne normale (contradiction ADR
0039, conformité Munich, validation humaine, **justification CVI `critique`**) ». La chaîne est
nommée, la porte manque.

_Décision demandée :_ ajouter le gate `cvi_justified: false` au record, ou retirer `cvi_level` de la
fiche. La troisième voie — publier `critique` sans justification — est celle que le dépôt s'interdit
partout ailleurs.

_Pour mémoire, la justification est facile à faire ici_ : le §*Alternatives* chiffre un **déficit de
~14 Mb/j** non contournable et l'**absence totale** de substitution pour 10,5 Gpc/j de GNL. C'est
exactement l'argument qui plafonnait la mer Rouge à `eleve` (bypass fonctionnel) et qui, absent,
fonde `critique`. La matière est dans la fiche ; il lui manque une porte.

## B. Le trou de chronologie — et la source qu'on possède déjà

La fiche décrit un **état** sans jamais le **dater**. On y lit « le trafic est effondré », « l'Iran
lie la réouverture à des concessions », « une perturbation sévère sur l'essentiel des cinq derniers
mois » — mais aucune date de début de crise, et aucune mention du **cessez-le-feu du 7 avril 2026**.
Un lecteur ne peut situer ni le point de départ, ni les phases.

Or nous détenons la source, vérifiée ce matin même et déposée à ag-back
(`docs/handoff/ag-back-une-source-rouvrable-pour-la-date-d-ormuz.md`) :

**Congressional Research Service, `R45281`, « The Strait of Hormuz: Security Developments and Impacts
on Oil, Gas, and Other Commodities », mise à jour du 7 août 2026.** Les URL de l'éditeur rendent 403
(Cloudflare) ; le miroir `everycrsreport.com` sert le PDF de l'éditeur tel quel, **vérifié 200 ce
jour**, empreinte `sha256 = 72d26cb6…8194a` publiée dans le handoff.

Elle porte trois choses qui manquent à la fiche :

1. **La date.** « As part of its response to U.S. and Israeli attacks **beginning on February 28,
   2026**, Iran has sought to exert control over the Strait of Hormuz. » Avec la nuance que le
   handoff a établie et qu'il ne faut pas perdre : le 28 février **ouvre la période**, la déclaration
   de fermeture arrive « days after » — la date ne date pas l'acte qu'elle semble dater.
2. **Les phases.** Le cessez-le-feu du **7 avril 2026** ferme la phase de fermeture. Ce qui dure
   depuis n'est donc pas une fermeture continue mais un **régime dégradé post-cessez-le-feu** — ce
   qui est précisément la thèse du verdict (« passage sous autorisation »), et qui la renforce au
   lieu de l'affaiblir.
3. **Le péage, sourcé.** Le CRS attribue le régime de péage iranien à **Lloyd's List, 25 mars 2026**
   (« Tehran's 'toll booth' system is now controlling Hormuz traffic »). C'est **l'affirmation
   centrale du verdict** de la fiche — « de goulet physique, il est passé à péage politique » — et
   elle n'est aujourd'hui adossée à aucune source citée.

_Réserve à conserver telle quelle :_ un miroir n'est pas l'éditeur, et le handoff le dit. La source
entre comme **candidate rouvrable**, pas comme preuve de registre.

---

## C. Revue Munich contrôle par contrôle

### Contrôle 1 — Respecter la vérité (mixte)

**NON satisfait en l'état.** Volet machine acquis. Le juge rend `uncertain 0.82` en visant juste :
« certaines affirmations structurantes reposent sur des sources externes non identifiées précisément
dans le texte ». Elles sont quatre, toutes repérables :

- « **Des sources externes** situent la restriction au-delà de 90 % » — aucune nommée.
- « **des travaux externes** estiment que la fermeture effective a retiré ≈ 17,8 Mb/j » — déclaré
  « candidat, non recoupé par nos soins » (honnête), mais anonyme.
- « **Des analyses** décrivent explicitement une tentative de reproduire en mer Rouge le contrôle
  iranien sur Ormuz » — aucune nommée.
- « une coordination […] est *évoquée par des experts* » — aucun nommé.

S'y ajoute le trou de chronologie du §B : la fiche ne date pas la crise qu'elle décrit.

_Ce qu'il faut pour cocher :_ nommer les quatre, ou requalifier chaque affirmation en angle mort
déclaré ; dater la crise avec la source CRS. Le second geste est fait en dix minutes et lève aussi le
contrôle 8.

### Contrôle 2 — Distinction fait / analyse / opinion (humain)

**Satisfait — et c'est la meilleure des quatre fiches P0 sur ce contrôle.** Cinq dispositifs, pas un :

- l'encart **« Fait / analyse »** en pied ;
- la colonne **_Statut / fondement_** du tableau de seuils (**Adossé** vs **Repère**) ;
- l'encart **« Ce que nous ne concluons pas »**, qui sépare explicitement ce qui est observable (la
  convergence des méthodes) de ce qui ne l'est pas (la chaîne de commandement) ;
- les qualifications inline : « candidat, non recoupé par nos soins », « **capacité future, pas
  disponible aujourd'hui** », « ce n'est pas un contournement, c'est un délai » ;
- la section *Niveau de confiance*, qui **nomme trois grandeurs manquantes plutôt que de les
  combler**.

Le juge donne `pass 0.97`.

### Contrôle 3 — Origine connue, ne pas dénaturer (mixte)

**NON satisfait en l'état.** Volet machine acquis (label + type sur les 10). L'audit des URL, source
par source, donne :

| # | État | Source |
|---|---|---|
| 2 | **page d'accueil** | AIE — *Strait of Hormuz oil security* → `https://www.iea.org/` |
| 5 | **page d'accueil** | Reuters — *Le trafic à Ormuz se réduit…* (7 août 2026) → `https://www.reuters.com/` |
| 4 | sans URL | Base chokepoints (API de lecture) — **légitime**, API interne sans URL publique |
| 9 | sans URL | Iran / Oman — accord sur les coordonnées de la route (5 août 2026) |
| 10 | sans URL | Ansar Allah — déclaration du 5 août 2026 (29 navires saoudiens empêchés) |
| 1, 3, 6, 7, 8 | ok | EIA ×3, UNCTAD, AIE (lien profond) |

**Une URL de page d'accueil sous un libellé qui nomme un document précis est pire que pas d'URL** :
elle donne l'apparence du rouvrable. La source 2 est en outre redondante avec la 6, qui porte le vrai
lien profond vers la même page AIE.

Les sources 9 et 10 sont les plus exposées : deux affirmations datées du 5 août, dont une
**déclaration de belligérant** (`source_contradictoire`), citées sans aucune référence.

_Ce qu'il faut pour cocher :_ remplacer les deux pages d'accueil par les liens profonds (ou retirer la
source 2, redondante), et donner une référence rouvrable aux sources 9 et 10 — la CRS R45281 couvre
le régime de passage et la chronologie.

### Contrôle 4 — Pas de méthodes déloyales (humain, non jugeable)

**Satisfait.** Sources institutionnelles, presse, données ouvertes, et une source de belligérant
**typée comme telle** (`source_contradictoire`) — ce qui est la manière honnête de l'employer. La base
chokepoints est lue en scope `read`. Aucune usurpation.

_Point notable, à assumer explicitement :_ la source CRS du §B a été obtenue via un **miroir public**
parce que l'éditeur rend 403. Ce n'est pas un contournement déloyal — le miroir est public, sert le
PDF de l'éditeur tel quel, et l'empreinte est publiée pour que quiconque vérifie qu'il ouvre le même
objet. Mais c'est à dire, pas à taire.

### Contrôle 5 — Rectifier toute inexactitude (machine)

**Satisfait.** `corrections: []` déclaré (liste vide *déclarée* vide, ADR 0077) ; volet machine R3 à
0 violation. `Corrections.astro` est monté sur le gabarit Atlas
(`pages/atlas/[slug].astro:77`) : « Aucune correction à ce jour » puis « Signaler une erreur » vers
`/contact`, vérifié 200 en prod ce jour.

### Contrôle 6 — Secret des sources (humain, non jugeable)

**Satisfait / sans objet.** Les 10 sources sont publiques et nommées ; aucun informateur, aucune
source confidentielle. Les données de la base chokepoints sont lues en **scope `read`**, jamais
`read_tainted` (ADR 0035) — les métriques citées (PortWatch, évaluations de risque `assessed`) en
relèvent.

_Point à confirmer :_ qu'aucune valeur reprise dans la fiche ne provienne d'un champ à scope restreint.

### Contrôle 7 — Pas de confusion avec pub / propagande (mixte)

**Satisfait.** Lint R7 à 0 violation. La seule mention d'offre est la divulgation neutre de périmètre
en pied (« le scoring CVI 0–5 par dimension est réservé à l'offre Standard ») ; aucun CTA dans le
corps. Le juge donne `pass 0.86`. À noter : le livrable porte `offer: public` alors que les trois
autres fiches P0 portent `basic` — cohérent avec une fiche de contexte de crise, mais c'est une
décision d'offre, pas un fait ; à confirmer.

### Contrôle 8 — Pas de plagiat / diffamation, vie privée (humain)

**NON satisfait en l'état — et c'est le contrôle le plus délicat de la fiche.** Le juge rend
`uncertain 0.74` : « plusieurs attributions restent génériques (« des analyses », « des experts »), ce
qui impose une vérification humaine de leur traçabilité ». Il a raison, et l'enjeu est plus lourd ici
qu'ailleurs, parce que les imputations visent des **États et un mouvement armé** :

- « **L'Iran lie la réouverture à des concessions américaines** » — imputation d'intention politique,
  non sourcée dans le texte ;
- « **Téhéran lie la réouverture à des concessions** » — la même, dans le **verdict rendu en tête de
  page** ;
- « de goulet physique, il est passé à **péage politique** » — la qualification centrale, non sourcée.

Ce qui **sauve** le contrôle par ailleurs, et qu'il faut porter au crédit de la fiche : l'encart
« Ce que nous ne concluons pas » refuse explicitement d'établir une coordination Téhéran–Ansar Allah,
et la déclaration d'Ansar Allah est rapportée avec « **affirmant** », typée `source_contradictoire`.
La prudence est là où elle est le plus nécessaire ; elle manque là où l'affirmation est devenue si
familière qu'elle passe pour un fait.

_Ce qu'il faut pour cocher :_ adosser le régime de péage à la source que le CRS donne (**Lloyd's
List, 25 mars 2026**) et nommer les « analyses » et « experts ». Même geste que pour les contrôles 1
et 3 — les trois se lèvent ensemble.

### Contrôle 9 — Pas de corruption / d'avantage (humain, non jugeable)

**Satisfait.** Aucun client, aucun pilote : `milestone_premium_pilots_12m` est `not_started`,
`contacts.json` porte 2 entrées de prospection. Aucun sponsor, aucune contrepartie, sur un sujet
— l'énergie du Golfe — où un intérêt commercial se verrait.

### Contrôle 10 — Refus de pression ; traçabilité (humain, non jugeable)

**Satisfait.** ADR 0069 en place, `validation_journal.json` peuplé (30 entrées nominatives, dont 18
posées ce jour), publication par `POST /api/publish` avec gates complets + `validated_by` + entrée de
journal, `check:munich` en garde dure au build.
_Limite reconnue (ADR 0046) :_ `validated_by` reste déclaratif, sans authentification.

**Synthèse : 7 contrôles proposés `ok` (2, 4, 5, 6, 7, 9, 10). Trois bloqués (1, 3, 8), et ils se
lèvent d'un même geste** — nommer quatre attributions génériques, remplacer deux URL de page
d'accueil, adosser la chronologie et le péage à la CRS R45281 qu'on détient déjà.

---

## D. Red team ADR 0039 — 5 findings, gate `contradiction_done` **non coché**

Contrairement à la mer Rouge, la porte est ici **ouverte** : le rapport (2026-08-13, `pending`) doit
être arbitré **avant** de cocher.

| Sév. | Claim | Objection | Arbitrage proposé |
|---|---|---|---|
| **4** | « Ormuz n'a pas de route maritime alternative » | Affirmé en absolu sans explorer les pipelines | **Non fondé — la red team n'a pas lu la fiche.** Le §*Alternatives* consacre un tableau entier aux pipelines : 3,5–5,5 Mb/j disponibles contre 20,7 en transit, ~14 non contournables. La phrase dit « pas de route **maritime** », et la fiche chiffre les routes non maritimes juste en dessous. À écarter, en notant que la formulation invite au contresens. |
| **4** | « Les pipelines saturent, les réserves s'épuisent, la contrainte devient physique » | Aucune donnée sur les niveaux de réserves | **Fondé.** C'est une phrase du **scénario 3 (« Ré-escalade »)**, donc de la prospective — mais rien dans la phrase ne le signale au lecteur qui la lit isolément. À traiter par le rattachement explicite au registre scénario, pas par du chiffrage. |
| **4** | « ≈ 17,8 Mb/j retirés, un cinquième de l'offre échangée » | Estimation non recoupée | **Fondé, et déjà assumé** — la fiche écrit « candidat, non recoupé par nos soins ». Reste que la source n'est pas nommée (cf. contrôle 1). À lever **avec** le contrôle 1, pas séparément. |
| 3 | « ~2,5 transits par jour » | Manque l'analyse des causes | **Non fondé.** La cause est le sujet de toute la fiche (passage sous autorisation, négociation). La red team demande ici un texte qui existe déjà deux sections plus loin. |
| 3 | « le point de passage le moins substituable de l'économie mondiale » | Comparaison implicite sans critères chiffrés | **Partiellement fondé, et facile à lever.** La fiche compare bien — à Bab el-Mandeb, explicitement, et par un déficit chiffré de ~14 Mb/j. Ce qui manque est la comparaison aux **autres** chokepoints. Une ligne suffirait ; à défaut, requalifier en « parmi les moins substituables ». |

Deux à écarter, deux fondés dont un déjà assumé, un ajout d'une ligne. **Aucun ne conteste un chiffre
de la fiche** — tous portent sur la manière de les présenter.

## E. Où le juge et cette instruction divergent

| Contrôle | Juge | Ici | Pourquoi |
|---|---|---|---|
| 3 | `pass` 0.88 | **non satisfait** | Le juge voit « des URL fournies » et ne peut pas savoir que deux pointent vers une page d'accueil sous un libellé qui nomme un document. Il note la présence du champ, pas ce qu'il ouvre. |
| 1 | `uncertain` 0.82 | non satisfait | Accord de fond ; je nomme les quatre occurrences qu'il désigne en bloc. |
| 8 | `uncertain` 0.74 | non satisfait | Accord. |

Le juge est **plus généreux** que cette instruction sur le contrôle 3 — l'inverse du réflexe qu'on
attendrait. C'est l'illustration de sa limite structurelle : il évalue un texte, pas un web.

## F. Ordre de travail proposé

1. **Trancher le §A** — ajouter le gate `cvi_justified`, ou retirer `cvi_level: critique`. Cette
   décision est indépendante du contenu et bloque tout le reste sur le plan doctrinal.
2. **Corriger d'un geste les contrôles 1, 3 et 8** — nommer les quatre attributions génériques,
   remplacer les deux URL de page d'accueil, dater la crise et adosser le péage à la CRS R45281
   (Lloyd's List, 25 mars 2026, cité par le CRS).
3. **Arbitrer les 5 findings red team** (§D), puis cocher **`contradiction_done`**.
4. **Poser les 10 contrôles Munich** → **`compliance_done`**.
5. **`cvi_justified`** si le gate est créé — la matière est déjà dans la fiche (§A).
6. **`human_review_done`**, puis publication. Échéance **2026-08-31**.

Soit **13 actes nominatifs** (10 Munich + 3 portes, 14 si `cvi_justified` est créé), **une décision de
gouvernance** (§A) et **une passe de correction** de vingt minutes qui lève trois contrôles à la fois.

---

## G. Passe de correction — 2026-08-21

Les contrôles 1, 3 et 8 se levaient d'un même geste (§C). Le geste est fait.

### G.1 Sources — de 10 à 14, une seule sans URL

| Avant | Après |
|---|---|
| AIE → `iea.org/` (page d'accueil) | **supprimée** — redondante avec la source AIE qui portait déjà le lien profond |
| Reuters → `reuters.com/` (page d'accueil) | lien profond vers l'article du 7 août 2026 |
| Iran / Oman, sans URL | **Reuters, 5 août 2026**, citant le ministère iranien |
| Ansar Allah, sans URL | **gCaptain, 5 août 2026** — et le libellé dit désormais que gCaptain précise que le chiffre n'a pas pu être vérifié de source indépendante |

Cinq sources ajoutées, toutes vérifiées : **CRS R45281** (miroir, l'éditeur rend 403) ; **CNBC**
(12 août, ~90 % sous la moyenne d'avant-frappes) ; **Policy Center for the New South**, PB-29/26,
Emran & Berahab, juin 2026 (les 17,8 Mb/j) ; **Reuters** du 27 juillet (le modèle d'Ormuz reproduit
en mer Rouge) ; **CFR** (analyse).

La seule source sans URL est la **base chokepoints** — API interne, sans URL publique. C'est
légitime et ce sera toujours le cas.

_Note de vérification :_ les trois liens Reuters rendent **401** à un client non-navigateur. Ouverts
dans un vrai navigateur (`agent-browser`) : les trois chargent. Chatham House, lui, oppose un défi
Cloudflare **même en navigateur** — il a donc été écarté au profit du CFR, qui rend 200.

### G.2 Corps

- **Chronologie ajoutée** — le bloc *État du corridor* s'ouvre désormais sur la date du **28 février
  2026**, citée mot pour mot depuis le CRS, avec la nuance que le handoff avait établie et qu'il ne
  fallait pas perdre : elle **ouvre la période** et ne date pas la déclaration de fermeture, que le
  rapport situe « days after » sans en donner le jour. Le **cessez-le-feu du 7 avril** est nommé, et
  la fiche dit explicitement que ce qu'elle décrit est un **régime dégradé post-cessez-le-feu**, non
  une fermeture continue.
- **Le péage est sourcé** — l'affirmation centrale du verdict s'adosse à **Lloyd's List du 25 mars
  2026**, telle que le CRS la reprend : « *Tehran's 'toll booth' system is now controlling Hormuz
  traffic* ». Ce n'est plus notre lecture seule.
- **Les quatre attributions génériques ont disparu** — vérifié par recherche sur le corps : plus
  aucune occurrence de « des sources externes », « des travaux externes », « Des analyses »,
  « évoquée par des experts ».
- **Précision de fait** — « 29 navires saoudiens » devient « **29 pétroliers** saoudiens », ce que
  dit la source, avec la mention explicite qu'il s'agit d'une revendication de belligérant non
  vérifiée.
- **Findings red team traités** — le scénario 3 dit maintenant qu'il projette (« *dans cette
  hypothèse* […] ce qui suit est une projection, non une mesure ») et déclare l'absence de série
  publique sur les réserves et le taux d'utilisation des tubes. « Le moins substituable » porte
  désormais son critère et sa comparaison : Bab el-Mandeb par le Cap, Malacca par la Sonde ou
  Lombok, Panama par le cap Horn ou le rail — Ormuz, rien.

Vérifications : volet machine **0 violation**, 14 sources ; build public 129 pages, 12/12 ancrages.
La fiche reste `published: false`.

### G.3 Effet mesuré — juge et red team relancés

| Gate | Avant | Après |
|---|---|---|
| Munich 1 — vérité | uncertain 0.82 | **pass 0.84** |
| Munich 3 — origine | pass 0.88 *(généreux, cf. §E)* | **pass 0.90** *(mérité)* |
| Munich 8 — plagiat / vie privée | uncertain 0.74 — « attributions génériques » | uncertain 0.80 — réserve de principe seule |
| Munich 2 | pass 0.97 | pass 0.96 |
| Munich 7 | pass 0.86 | uncertain 0.73 — **variance**, rien n'a changé sur ce terrain |
| rubrique `strategic_verdict` | pass 0.84 | pass 0.90 |

Le motif que le juge donnait au contrôle 8 a changé de nature : il ne parle plus d'attributions
génériques, seulement de l'impossibilité d'établir l'absence de plagiat depuis un texte seul —
réserve qu'aucune correction ne lèvera jamais et qui appartient au relecteur.

**Nouvelle red team (5 findings).** Trois sont des variantes de « vous affirmez une absence sans
avoir exploré toutes les alternatives théoriques » (route maritime, substitution du GNL) : à écarter,
la fiche chiffre le déficit. Un est l'ancien finding du scénario 3, maintenu **alors même que le
texte déclare désormais la lacune** — à porter en angle mort assumé, définitivement. Le cinquième
est **fondé et il porte sur cette passe** : « la source principale est un acteur du conflit ». C'est
exact — le ministre yéménite des Affaires étrangères est partie au conflit. Le texte le dit
maintenant en toutes lettres et le CFR corrobore l'analyse, mais la remarque reste juste et mérite
d'être consignée plutôt que balayée.

### G.4 Ce que cette passe a trouvé et n'a PAS corrigé

En cherchant les sources, la recherche a fait remonter des développements **postérieurs au 10 août**
que la fiche ne couvre pas : deux navires attaqués à Ormuz vers le 14 août sur fond de pression
économique américaine accrue, un ralentissement supplémentaire du trafic constaté sur données le
16 août, une révision à la baisse des prévisions d'offre par l'AIE le 12 août, et de nouvelles
attaques revendiquées au large de Mocha le 17.

**Rien de cela n'a été intégré.** Ce n'était pas la passe demandée, et chacun de ces points demande
la chaîne de sourcing complète avant d'entrer dans une fiche. Mais le bloc « État au 10 août 2026 »
a onze jours, dans une crise qui bouge à la semaine — c'est la même dérive de fraîcheur qui avait
frappé la fiche Mer Rouge. À décider avant `human_review_done` : rafraîchir l'état, ou assumer une
fiche datée qui dit clairement à quelle date elle parle.

### G.5 Ce qu'il reste

Les trois contrôles bloqués sont **débloqués** : 1, 3 et 8 sont désormais proposés `ok`, ce qui porte
la proposition à **10/10**. Restent inchangés :

1. **La décision de gouvernance du §A** — créer le gate `cvi_justified` ou retirer `cvi_level:
   critique`. Rien dans cette passe ne l'a touchée.
2. **L'arbitrage des 5 findings red team** (§D refondu ci-dessus), puis `contradiction_done`.
3. **Les 10 contrôles Munich**, puis `compliance_done`.
4. **La décision de fraîcheur du §G.4**, puis `human_review_done`.

---

## H. Le gate manquant est créé — 2026-08-21

La décision de gouvernance du §A est tranchée **dans le sens du gate**, pas du retrait de
`cvi_level`. `deliv_atlas_ormuz_contexte` porte désormais :

```
gates: sources_ok ✓ · llm_draft_done ✓ · contradiction_done ✗ · compliance_done ✗
       human_review_done ✗ · cvi_justified ✗   ← créé
```

`cvi_justified: z.boolean().optional()` (`packages/schema/src/cockpit/deliverable.ts:19`) : la clé
était prévue, elle n'était simplement pas posée. Le champ est ajouté à `false`, à la même place que
sur `deliv_atlas_red_sea_fiche`.

**Vérifié, et c'est le point qui compte** — `resolvePublish` ne compte cette porte que si elle est
**présente ET fausse**. Avant :

```
ormuz          missing: contradiction_done, compliance_done, human_review_done
```

Après :

```
ormuz          missing: contradiction_done, compliance_done, human_review_done, cvi_justified
mer-rouge-suez missing: compliance_done, human_review_done, cvi_justified
```

La fiche ne peut plus être publiée avec un `critique` que personne n'a eu à défendre. L'inversion
relevée au §A — la fiche qui affirme le plus était la seule sans porte — est corrigée.

Le `blocker` du livrable, qui nommait déjà « justification CVI `critique` » dans la chaîne restante,
le dit maintenant avec la porte en face.

Contrôles : typecheck cockpit passe, 145 tests sur 17 fichiers au vert, `/api/state` sert bien les
six portes.

**La justification, elle, reste à poser** — c'est un acte nominatif, et la matière est au §A : le
déficit chiffré de **~14 Mb/j** non contournable et l'absence **totale** de substitution pour les
**10,5 Gpc/j** de GNL. C'est exactement l'argument qui plafonnait la mer Rouge à `eleve` (bypass
fonctionnel) et qui, absent ici, fonde `critique`.

Le décompte du §F passe de 13 à **14 actes nominatifs**.

---

## I. Bloc d'état rafraîchi — 2026-08-21

La décision de fraîcheur du §G.4 est tranchée dans le sens du rafraîchissement. Chaîne de sourcing
complète : `pplx search` → `pplx fetch-url --facts` → `pplx verify --answer`, puis vérification de
chaque URL en navigateur réel.

### I.1 Ce qui entre

- **Notre propre métrique, relue** — `portwatch_avg_daily_transits = 2.5`, période `2026-08`,
  interrogée sur l'API de lecture le 21 août : **inchangée**. La fiche le dit désormais.
- **Un point de comparaison d'avant-crise chiffré** — **plus de 130 navires par jour** franchissaient
  le détroit avant la guerre de février (Reuters). La fiche comparait jusqu'ici l'effondrement à
  d'autres détroits, jamais à son propre passé.
- **L'effondrement s'est creusé** — trois navires exploités par l'**ADNOC** attaqués en transit dans
  la semaine du 10 août (déclaration émiratie) ; données Kpler relevées par Reuters : **5 navires de
  commerce le samedi 15, aucun le dimanche 16**, contre **31** le week-end précédent.
- **Les pourparlers sont au point mort** — là où l'état du 10 août décrivait une coordination de
  tracé avec Mascate et des discussions « en phase finale ».
- **Réserve de mesure** — certains navires passent transpondeur éteint : les comptages sont un
  **plancher observé**, pas un décompte exhaustif. La fiche le dit maintenant.
- **Précision de date** — le blocus houthi visant l'Arabie saoudite est **déclaré le 20 juillet**,
  la campagne d'attaques s'ouvrant deux jours plus tard. La fiche datait tout du 22.
- **Comparaison chiffrée des deux détroits** — sur le même week-end : **49 transits à Bab
  el-Mandeb** (contre 55) quand Ormuz en comptait **5 puis zéro**. Le blocus houthi filtre un
  pavillon ; celui d'Ormuz arrête le passage.

Trois sources ajoutées (Reuters du 17 août, Reuters du 14, Al Jazeera du 12) : **17 sources**, une
seule sans URL — la base chokepoints. Toutes ouvertes en navigateur réel.

### I.2 Le fait qui change la lecture : le guichet a deux guichetiers

Les États-Unis ont déclaré pouvoir maintenir **indéfiniment un blocus naval de l'Iran** et affirment
contrôler l'accès maritime ; Téhéran affirme contrôler le détroit et le garder fermé tant que le
blocus, les sanctions et les gels d'avoirs ne sont pas levés.

La fiche rapporte **les deux revendications sans trancher** — aucune source publique ne permet
d'établir laquelle détermine le débit constaté — et une **quatrième inconnue** est ajoutée à la
section *Niveau de confiance* : elle ne porte plus sur une grandeur, mais sur **l'acteur**.

> **Décision d'auteur, non prise ici.** Le `verdict` rendu en tête de page attribue le contrôle à
> Téhéran seul : « *Téhéran lie la réouverture à des concessions, coordonne un tracé avec Mascate et
> examine un régime de droits de passage* ». Le corps décrit maintenant une situation **à deux
> parties**, dont l'une n'est pas nommée dans le verdict, et la coordination avec Mascate a été
> suivie d'un blocage des pourparlers. **C'est le même défaut que celui relevé sur la fiche Mer
> Rouge** — un verdict que son propre corps dépasse — et il se tranche de la même manière : par une
> décision d'auteur, pas par une coche. Le cœur du verdict (« de goulet physique, il est passé à
> péage politique ») n'est pas en cause ; c'est l'identité du péager qui n'est plus unique.

### I.3 Effet mesuré — et une leçon sur la lecture du juge

| Gate | Avant refresh | Après refresh |
|---|---|---|
| Munich 1 | pass 0.84 | **uncertain 0.72** |
| Munich 2 | pass 0.96 | pass 0.94 |
| Munich 3 | pass 0.90 | **uncertain 0.68** |
| Munich 7 | uncertain 0.73 | uncertain 0.65 |
| Munich 8 | uncertain 0.80 | uncertain 0.70 |
| `strategic_verdict` | pass 0.90 | **pass 0.93** |

**Le score baisse, la substance monte.** Il faut lire les motifs, pas les étiquettes : les quatre
`uncertain` sont désormais des **réserves de principe**, sans exception —

- Munich 1 : « *le texte seul ne permet pas de vérifier que chaque affirmation structurante possède
  une source précise* » — plus aucune affirmation nommée, là où la première passe désignait
  précisément « des sources externes non identifiées » ;
- Munich 3 : « *l'absence de citation tronquée ne peut pas être vérifiée depuis le seul document* » ;
- Munich 7 : « *ne permet pas d'établir que le paywall ne déforme pas l'analyse* » ;
- Munich 8 : « *l'absence totale de plagiat ne peut pas être certifiée sur le texte seul* » — et la
  citation retenue en preuve est notre propre qualification « revendication d'un belligérant ».

Aucune de ces réserves ne sera jamais levée par une correction : elles décrivent la limite du juge,
pas un défaut du document. **Troisième passe sur ce document dans la journée, et Munich 7 a fait
`pass 0.86` → `uncertain 0.73` → `uncertain 0.65` sans qu'une seule ligne ait bougé sur ce terrain.**
C'est la mise en garde d'ADR 0068 prise à l'envers : le biais d'automatisation ne consiste pas
seulement à tamponner un `pass`, il consiste aussi à reculer devant un `uncertain` qui ne dit rien.

### I.4 Red team — de 5 findings à 4

Le finding sur le scénario 3 **a disparu** : le rattachement explicite au registre prospectif l'a
levé. Les quatre restants :

| Sév. | Objet | Arbitrage proposé |
|---|---|---|
| 4 | « pas de route maritime alternative du tout » | **À écarter** — troisième formulation du même reproche en trois passes ; la fiche chiffre le déficit et compare désormais aux autres chokepoints. |
| 3 | Le déficit de ~14 Mb/j sans source propre | **À écarter** — c'est une **dérivation**, pas une donnée : le tableau montre l'arithmétique et source chaque ligne, la colonne *Fondement* disant « différence des deux lignes précédentes ». |
| 3 | Revendications concurrentes sans moyen de départager | **Fondé et déjà déclaré deux fois** — dans le bloc d'état et dans le *Niveau de confiance*. Angle mort assumé. |
| 2 | `insurance_cost_spike` cité sans série de primes | **Fondé et déjà déclaré** — c'est l'une des grandeurs que la fiche nomme plutôt que de combler. |

Aucun ne conteste un chiffre. Deux à écarter, deux déjà assumés dans le texte.

### I.5 État après refresh

`updated: 2026-08-21`. Volet machine **0 violation**, 17 sources, build 129 pages et 12/12 ancrages.
La fiche reste `published: false`.

Les **14 actes nominatifs** du §H sont inchangés — un rafraîchissement de contenu n'en coche aucun.
Ce qui change, c'est qu'il reste **une** décision d'auteur au lieu de deux : la fraîcheur est réglée,
le verdict à deux guichetiers ne l'est pas.

---

## J. Le verdict est tranché — 2026-08-21

Décision d'auteur rendue : **deux guichetiers**. Le verdict rendu en tête de la page publique dit
désormais :

> Ormuz n'est pas fermé : il est devenu un passage sous autorisation, et l'autorisation est
> revendiquée des deux côtés. Le trafic s'est effondré à ~2,5 transits par jour. Washington dit tenir
> l'accès par un blocus naval qu'il se déclare capable de maintenir indéfiniment ; Téhéran dit tenir
> le détroit jusqu'à la levée de ce blocus. Aucune source publique ne les départage. Le chokepoint le
> moins substituable du monde est passé de goulet physique à péage politique — et le péage a deux
> guichets.

Ce que la décision **conserve** : le cœur de l'ancien verdict (« de goulet physique, il est passé à
péage politique ») et le chiffre d'effondrement. Ce qu'elle **corrige** : l'attribution du contrôle à
Téhéran seul, et la mention d'une coordination avec Mascate que le blocage des pourparlers a périmée.
Ce qu'elle **refuse d'affirmer** : laquelle des deux mains commande le débit — le verdict le dit
explicitement plutôt que de choisir.

**Longueur tenue en famille.** Première rédaction à 636 caractères, resserrée à **494** — les trois
autres fiches P0 tiennent entre 324 et 397. Le champ est rendu en tête de page, il doit rester un
bloc d'ouverture, pas un paragraphe.

### J.1 Le corps suit, sinon on recrée le défaut qu'on corrige

Trois passages étaient écrits sur l'hypothèse d'un acteur unique :

- **Vulnérabilités** — le bullet devient « *Passage sous autorisation, revendiqué des deux côtés* » et
  expose les deux côtés séparément. La formule de Lloyd's List reste citée telle quelle, suivie de ce
  qu'elle ne dit plus : **qui** tient le guichet.
- **Scénario 1 (« Réouverture négociée »)** — suppose désormais **deux levées et non une** :
  conditions iraniennes satisfaites *et* blocus naval retiré. Le précédent qui resterait est
  « actionnable, et par plus d'un acteur ».
- **Scénario 2 (« Péage institutionnalisé »)** — « un péage à deux guichets se négocie deux fois ».

### J.2 Effet mesuré

Juge : `strategic_verdict` **pass 0.91**, et sa justification ne porte plus sur le rendu mais sur le
contenu. Munich 3 remonte de 0.68 à **0.76**, Munich 8 de 0.70 à **0.78** ; Munich 1 reste à 0.72,
Munich 7 à 0.67 — toujours les mêmes réserves de principe, sans affirmation nommée.

**Red team : le finding le plus sévère de toute l'instruction apparaît ici — severity 5.** Il vise :
« *les deux revendications portent sur le même passage et aucune source ne permet de trancher* », au
motif que « *l'absence de sources indépendantes laisse une incertitude majeure non résolue* ».

C'est exact, et c'est **déclaré trois fois** dans la fiche — au verdict, dans le bloc d'état, dans le
*Niveau de confiance*. La red team ne signale pas un défaut : elle mesure le poids de la lacune, et
elle a raison de le placer au maximum. Une incertitude sur **qui contrôle le passage le moins
substituable du monde** est effectivement l'inconnue la plus lourde de la fiche. Elle se déclare, elle
ne se comble pas : aucune source publique n'existe.

_Arbitrage proposé :_ **angle mort assumé, de sévérité maximale** — à porter comme tel au journal
quand `contradiction_done` sera posé, et non à traiter comme un défaut rédactionnel.

Les trois autres findings sont connus : le déficit de 14 Mb/j (dérivation dont le tableau montre
l'arithmétique), « pas de route maritime alternative » (quatrième formulation du même reproche, la
fiche compare et chiffre), la projection du scénario 3 (déjà rattachée au registre prospectif et
déclarée sans série publique).

### J.3 État

`updated: 2026-08-21`, verdict 494 caractères, 17 sources, volet machine **0 violation**, build 129
pages et 12/12 ancrages. Fiche toujours `published: false`.

**Les deux décisions d'auteur sont rendues** — la fraîcheur au §I, le verdict ici. Il ne reste que
les **14 actes nominatifs** : 10 contrôles Munich, puis `contradiction_done`, `compliance_done`,
`cvi_justified`, `human_review_done`.
