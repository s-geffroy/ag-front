# Matériaux de revue — matrice Munich, les 3 notes retirées du site

> **STATUT : ÉVALUATION CANDIDATE EN ATTENTE DE VALIDATION HUMAINE — PAS UNE VALIDATION.**
> Préparé le 2026-08-21 pour instruire (sans les préempter) les 10 contrôles Munich des livrables
> `deliv_note_assurance_maritime`, `deliv_note_corridors_strategiques`, `deliv_note_corridor_pas_route`.
> **Aucun contrôle n'est coché ici.** Ce document propose une justification par contrôle que Sylvain
> relit et valide dans la matrice du cockpit ; c'est cette validation nominative (ADR 0046) qui coche
> les `munich[…]`, puis le gate `compliance_done`. Base doctrinale : ADR 0037 (Munich), ADR 0039
> (contradiction), ADR 0046 (traçabilité), ADR 0068 (juge de pré-validation), ADR 0069 (publication).

## État de départ

Les 3 notes ont été **dépubliées le 2026-08-21 à 12:33Z** (journal `validation_journal.json`,
3 entrées `publication` / `rejected`), parce qu'elles étaient servies au public alors que leurs
livrables portaient `contradiction_done: false`, `compliance_done: false`, `human_review_done: false`
et une matrice Munich à **1/10** (seul le contrôle 5 était `ok`). Elles avaient été publiées avant
l'existence de la garde ADR 0069, qui garde l'endpoint et non l'état déjà servi.

| Note | Slug | Mots | Sources | Confiance |
|---|---|---|---|---|
| Assurance maritime : le signal faible… | `assurance-maritime-signal-faible` | 249 | 4 | moyen |
| Pourquoi les corridors sont redevenus… | `pourquoi-les-corridors-strategiques` | 302 | 3 | moyen |
| Un corridor n'est pas une route | `un-corridor-nest-pas-une-route` | 255 | 3 | eleve |

## Volet machine — vérifié, 0 violation

`checkArtifact` (`apps/public/scripts/munich-check.mjs`) exécuté sur les 3 notes en simulant l'état
publié — le scanner les ignore tant qu'elles sont `draft: true`, donc le résultat ne se lit pas dans
un build :

```
OK  assurance-maritime-signal-faible
OK  pourquoi-les-corridors-strategiques
OK  un-corridor-nest-pas-une-route
```

R1 (≥ 1 source, label + type sur chacune), R2 (`confidence` valide), R3 (`corrections` déclaré),
R7 (aucun lexique de sollicitation commerciale) passent pour les trois. Le volet machine des
contrôles 1, 3, 5 et 7 est donc acquis ; ne restent que leurs volets humains.

## Juge de pré-validation (ADR 0068) — première passe

Le juge n'avait **jamais tourné** sur ces trois notes. Lancé le 2026-08-21 (`gpt-5.6-terra`), aucune
injection détectée sur les trois. Verdicts candidats sur les 5 contrôles jugeables :

| Contrôle | assurance-maritime | corridors-strategiques | corridor-pas-route |
|---|---|---|---|
| 1 — Respecter la vérité | uncertain (0.80) | uncertain (0.76) | **fail (0.86)** |
| 2 — Fait / analyse / opinion | **fail (0.84)** | **fail (0.79)** | **fail (0.89)** |
| 3 — Origine connue | uncertain (0.74) | pass (0.85) | pass (0.74) |
| 7 — Pas de confusion pub | uncertain (0.67) | uncertain (0.72) | pass (0.78) |
| 8 — Plagiat / vie privée | uncertain (0.70) | uncertain (0.68) | uncertain (0.70) |

Rubriques du type `note` : `clear_angle` pass ×3, `sources` pass ×3, `three_signals` pass ×2 et
**fail sur `un-corridor-nest-pas-une-route`** — voir la réserve sur l'angle mort du juge, plus bas.

---

## 1. Revue contrôle par contrôle

Réf. contenu : `apps/public/src/content/notes/<slug>.md`.

### Contrôle 1 — Respecter la vérité (mixte)

Volet machine acquis. Volet humain : **évaluation candidate — satisfait avec réserve sur les notes 1
et 2, à corriger sur la note 3.**

Les trois notes portent `confidence`, une `date`, et un `blind_spot` rendu sur la page. Les notes 1
et 2 ferment leur corps par un encart « Diagnostic provisoire — … Aucune affirmation structurante
sans source ou marqueur d'incertitude ». Leurs affirmations structurantes sont **qualitatives et
non chiffrées** (« les primes ont bondi », « deux corridors ont vacillé fin 2023 ») : rien à
recouper ligne à ligne, mais rien non plus qui pointe une source précise.

**Point à trancher :** sur `un-corridor-nest-pas-une-route`, la source déclarée
« Littérature académique sur les chokepoints maritimes » (`analyse_secondaire`) **n'individualise
aucun travail**. C'est exactement le défaut qui a valu un `fail` du juge à la fiche Malacca sur ce
même contrôle. La note affirme par ailleurs que la largeur navigable de Malacca « se réduit à
quelques kilomètres » avec `confidence: eleve`, sans renvoyer explicitement à l'EIA qu'elle cite par
ailleurs. Deux issues : nommer le ou les travaux, ou basculer l'affirmation sur la source EIA.

### Contrôle 2 — Distinction fait / analyse / opinion (humain)

**Évaluation candidate : NON satisfait sur les trois.** C'est le seul point où le juge est unanime
et où je le suis avec lui.

Les notes 1 et 2 marquent leur statut analytique par le bloc « Diagnostic provisoire », mais ce bloc
qualifie le document **globalement** : il ne trace pas la frontière à l'intérieur du texte. La note 3
n'a aucun marqueur de ce type dans son corps. Or ces textes mêlent en continu du constat rapporté
(« fin 2023, deux corridors ont vacillé »), de l'analyse (« la fluidité n'était pas une propriété du
système mais une hypothèse ») et de la prescription (« une direction risques doit traiter… »).

Le gabarit qui résout ça existe déjà dans le dépôt : les fiches Atlas portent un encart
**« Fait / analyse »** explicite. Le porter aux notes est un ajout d'une à deux lignes par note.

**Ce contrôle est un bloqueur de contenu, pas un simple arbitrage.**

### Contrôle 3 — Origine connue, ne pas dénaturer (mixte)

Volet machine acquis (label + type sur les 10 sources). Volet humain : **évaluation candidate —
satisfait sur la lettre, faible sur l'esprit.**

**Aucune des 10 sources des 3 notes ne porte d'URL** (4 + 3 + 3, zéro `url:`). Le contrôle dit
« URL si dispo » — or elles le sont toutes : Lloyd's Market Association / Joint War Committee,
S&P Global Market Intelligence, IMF PortWatch, MarineTraffic, UNCTAD *Review of Maritime Transport*,
Lloyd's List, U.S. EIA *World Oil Transit Chokepoints*. Le composant `Sources.astro` rend le libellé
nu quand l'URL manque : le lecteur voit une bibliographie non rouvrable.

Aucune citation tronquée, aucun verbatim dans les trois notes — le volet « ne pas dénaturer » est
sans objet.

**Point à trancher :** cocher en l'état, ou renseigner les 10 URL d'abord. Recommandation : les
renseigner — c'est le geste le moins cher du lot et il tient aussi le contrôle 1.

### Contrôle 4 — Pas de méthodes déloyales (humain)

**Évaluation candidate : satisfait.** Sources institutionnelles, données ouvertes et presse
spécialisée, toutes publiques et nommées. Aucun contenu obtenu derrière authentification, aucun
scraping, aucune usurpation. Les figures sont absentes du corps : rien n'a été présenté comme fait
validé alors qu'il serait candidat.

### Contrôle 5 — Rectifier toute inexactitude (machine)

**Évaluation candidate : satisfait — vérifié en rendu.** `corrections: []` déclaré sur les trois
(liste vide *déclarée* vide, pas rubrique absente, ADR 0077). Le composant `Corrections.astro` est
monté sur chaque note (`pages/notes/[slug].astro:77`) : il affiche « Aucune correction à ce jour. »
puis « Une inexactitude ? **Signaler une erreur** » vers `/contact`, vérifié **200** en prod.
Seul contrôle déjà `ok` dans la matrice.

### Contrôle 6 — Secret des sources (humain, non jugeable par le modèle)

**Évaluation candidate : satisfait / sans objet.** Les 10 sources sont publiques et nommées ; aucune
source confidentielle, aucun informateur, aucune donnée en scope `tainted` interne (ADR 0013) n'est
exposée. MarineTraffic et S&P sont des fournisseurs commerciaux, cités comme tels, pas des sources
protégées. Rien à masquer.

### Contrôle 7 — Pas de confusion avec pub / propagande (mixte)

Volet machine acquis (lint R7, 0 violation ×3). Volet humain : **satisfait sur les notes 1 et 3, un
arbitrage sur la note 2.**

Aucune des trois n'appelle à l'achat, à l'abonnement ni ne mentionne un prix. Les renvois « Pour
aller plus loin » pointent `/methode-cvi`, `/atlas` et les autres notes — pages de méthode et
d'index, vérifiées 200, pas la page `/offres`.

**Point à trancher :** `pourquoi-les-corridors-strategiques` referme son corps par « C'est
précisément l'objet de l'Atlas et de la méthode CVI : rendre la vulnérabilité d'un corridor lisible,
sourcée et actionnable, au lieu d'une intuition géopolitique. » Le juge l'a relevé (« l'Atlas et la
méthode CVI sont promus dans le corps du texte »). Ce n'est pas une sollicitation commerciale — c'est
une phrase auto-référentielle dans le corps analytique. À confirmer comme admissible, ou à déplacer
en « Pour aller plus loin ».

### Contrôle 8 — Pas de plagiat / diffamation, vie privée (humain)

**Évaluation candidate : satisfait.** Aucune personne privée n'est nommée dans les trois notes.
Aucun acteur n'est accusé : la note 2 écrit « sous les attaques contre les navires » sans attribuer,
la note 1 ne nomme aucun assaillant, la note 3 ne nomme que des lieux et un hub (Singapour). Aucun
verbatim, donc aucun risque de citation non attribuée.

_Vigilance :_ les trois paraphrasent des cadres d'analyse institutionnels (UNCTAD, EIA) sans
attribution en ligne. Le contrôle 3 corrigé (URLs) lève aussi cette réserve.

### Contrôle 9 — Pas de corruption / d'avantage (humain, non jugeable)

**Évaluation candidate : satisfait.** Aucun client, aucun pilote Premium : le jalon
`milestone_premium_pilots_12m` est `not_started` et `contacts.json` compte 2 entrées de prospection.
Aucun contenu sponsorisé, aucun annonceur, aucune contrepartie. L'indépendance n'est pas seulement
déclarée, elle est structurellement vraie à cette date — et c'est le bon moment pour le graver.

### Contrôle 10 — Refus de pression ; traçabilité des décisions (humain, non jugeable)

**Évaluation candidate : satisfait pour la republication, pas pour l'historique.**

La publication d'origine de ces trois notes n'a laissé **aucune trace** : `validation_journal.json`
ne contient aucune entrée les concernant avant le 2026-08-21. Elles sont antérieures à ADR 0069.
En revanche, leur **retrait** du 2026-08-21 12:33Z est journalisé nominativement, et leur
republication passera obligatoirement par `POST /api/publish` — gate complet + `validated_by` +
entrée de journal. La gouvernance éditoriale est donc en place *pour l'acte à venir*, ce qui est ce
que le contrôle demande.

_Limite reconnue (ADR 0046) :_ `validated_by` reste déclaratif (honor-system, pas d'authentification).

---

## 2. Où le juge et cette instruction divergent

| Contrôle | Juge | Ici | Pourquoi |
|---|---|---|---|
| 3 (note 1) | uncertain | satisfait sur la lettre | Le juge s'alarme de l'absence d'URL sur la note 1 mais donne `pass` aux notes 2 et 3, **qui n'en ont pas davantage**. Incohérence du juge, pas des notes. |
| 7 (notes 1 et 2) | uncertain | satisfait / à arbitrer | Le juge dit ne pas pouvoir trancher « sur le texte seul » — c'est précisément le rôle du relecteur, qui voit le chrome de la page. |
| 8 (les trois) | uncertain | satisfait | « L'absence de plagiat ne peut être établie depuis le texte » : réserve de principe du modèle, non un constat. |

Un point où le juge a raison contre l'intuition : **le contrôle 2 est réellement en défaut sur les
trois**, y compris celles qui portent le bloc « Diagnostic provisoire ».

## 3. Réserve sur l'angle mort du juge — quatrième occurrence du même défaut

`provenanceSummary` (`apps/cockpit/server/content.ts:125`) transmet au juge la date, la confiance,
l'accès, les sources et les errata — et, depuis le correctif des fiches, `verdict` et
`strategic_question`. Il ne transmet **pas** `signals`, `decision_implication` ni `blind_spot`.

Or ces trois champs sont **rendus sur la page publique** (`pages/notes/[slug].astro:47-75` :
« Signaux à suivre », « Implication décisionnelle — », « Angle mort — »), et `signals` est
exactement ce que note la rubrique `three_signals`. Conséquence directe et mesurée : le juge donne
`fail` sur `three_signals` à `un-corridor-nest-pas-une-route`, **qui déclare bien trois signaux en
frontmatter** ; les deux autres notes n'obtiennent `pass` que parce que leur corps répète les
signaux en prose. Le `fail` est un artefact du prompt, pas un défaut de la note.

Le commentaire du code, écrit lors du correctif précédent, appelait déjà ce défaut « troisième
occurrence ». C'en est la quatrième. **Correctif non appliqué ici** — hors du périmètre demandé ;
il suppose un `redeploy-cockpit.sh --restart-only` et une nouvelle passe du juge sur les 3 notes.

## 4. Ce qui reste à faire avant de pouvoir cocher `compliance_done`

`compliance_done` est refusé (`400 munich_incomplete`, `apps/cockpit/server/validate.ts:56-64`) tant
que les **10** contrôles ne sont pas `ok`. Donc, par note :

| Contrôle | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 |
|---|---|---|---|---|---|---|---|---|---|---|
| assurance-maritime | réserve | **✗** | URLs | ✓ | ✓ déjà `ok` | ✓ | ✓ | ✓ | ✓ | ✓ |
| corridors-strategiques | réserve | **✗** | URLs | ✓ | ✓ déjà `ok` | ✓ | arbitrage | ✓ | ✓ | ✓ |
| corridor-pas-route | **✗** source non individualisée | **✗** | URLs | ✓ | ✓ déjà `ok` | ✓ | ✓ | ✓ | ✓ | ✓ |

**Six contrôles sont cochables immédiatement** (4, 5, 6, 8, 9, 10) sur les trois notes — 18 coches
d'un coup, sans toucher au contenu.

**Trois demandent une correction de contenu d'abord**, dans cet ordre de coût croissant :

1. **Contrôle 3** — renseigner les 10 URL de sources. Purement mécanique, lève aussi la réserve du
   contrôle 8 et une part du contrôle 1.
2. **Contrôle 1** — sur `un-corridor-nest-pas-une-route` : individualiser
   « Littérature académique sur les chokepoints maritimes », ou adosser l'affirmation sur la largeur
   navigable de Malacca à la source EIA déjà déclarée.
3. **Contrôle 2** — porter aux trois notes l'encart « Fait / analyse » du gabarit des fiches Atlas.
   Une à deux lignes par note ; c'est le seul vrai travail rédactionnel du lot.

**Un arbitrage** : contrôle 7 sur `pourquoi-les-corridors-strategiques` (phrase auto-référentielle).

## 5. Après la matrice

Munich 10/10 → `compliance_done` → `contradiction_done` (les 3 notes n'ont **aucun** rapport red team
ADR 0039 à ce jour — à lancer) → `human_review_done` → `POST /api/publish` avec
`decision: publish` → rebuild par le watcher.

Rappel : leurs renvois croisés (`assurance-maritime` → `pourquoi-les-corridors`, `pourquoi-les-corridors`
→ `un-corridor-nest-pas-une-route`, `un-corridor-nest-pas-une-route` → `pourquoi-les-corridors`) sont
morts tant qu'une seule reste hors ligne. **Les republier ensemble, ou pas du tout.**

---

## 6. Suite donnée — 2026-08-21, après-midi

### 6.1 Corrections appliquées

| Contrôle | Geste | Notes concernées |
|---|---|---|
| 3 | URL renseignée sur **les 10 sources** (JWC, S&P Commodity Insights, IMF PortWatch, MarineTraffic, UNCTAD RMT, Lloyd's List, EIA, Rodrigue) — toutes vérifiées, les 403/503 rencontrés étaient de l'anti-bot | les 3 |
| 1 | « Littérature académique sur les chokepoints maritimes » → **Rodrigue, J.-P. (2004), « Straits, Passages and Chokepoints », _Cahiers de géographie du Québec_ 48(135)** (Érudit, accès libre). Largeur navigable de Malacca : « quelques kilomètres » → **≈ 2,7 km au Phillips Channel**, adossé à l'U.S. EIA (`pplx verify` : *supported*, confiance haute) | corridor-pas-route |
| 2 | Encart **« Fait / analyse / opinion »** ajouté au corps des trois, sur le gabarit des fiches Atlas : ce qui est fait rapporté, ce qui est analyse, ce qui est opinion argumentée | les 3 |
| 7 | Arbitrage rendu : la phrase auto-référentielle « C'est précisément l'objet de l'Atlas et de la méthode CVI… » **quitte le corps analytique** et devient une entrée de « Pour aller plus loin » | corridors-strategiques |

Volet machine re-vérifié après corrections : **0 violation** sur les trois, 10/10 sources avec URL.
Build public : 129 pages, 12/12 ancrages, `check:munich` passé. Les notes restent `draft: true`.

### 6.2 La réserve du §3 est corrigée

`provenanceSummary` transmet désormais `signals`, `decision_implication` et `blind_spot`, avec le
libellé qui dit où ils sont rendus — même convention que `verdict_declare`. Le commentaire du bloc
`verdict` renvoie à la quatrième occurrence au lieu de s'arrêter à la troisième.

Nouveau fichier `apps/cockpit/server/provenance.test.ts` (4 cas) : il garde les quatre correctifs
d'un coup et existe pour qu'il n'y ait pas de cinquième occurrence. Suite cockpit : **145 tests,
17 fichiers, tout au vert.** Prettier appliqué, serveur redéployé (`--restart-only`).

### 6.3 Seconde passe du juge — l'effet est mesuré

| Contrôle | assurance-maritime | corridors-strategiques | corridor-pas-route |
|---|---|---|---|
| 1 | uncertain 0.78 (était 0.80) | **pass 0.84** (était uncertain) | **uncertain 0.72** (était **fail**) |
| 2 | **pass 0.98** (était fail) | **pass 0.99** (était fail) | **pass 0.98** (était fail) |
| 3 | **pass 0.90** (était uncertain) | pass 0.88 | pass 0.91 |
| 7 | **pass 0.84** (était uncertain) | uncertain 0.72 | uncertain 0.61 (était pass) |
| 8 | **pass 0.85** (était uncertain) | uncertain 0.78 | uncertain 0.69 |
| rubrique `three_signals` | pass 0.98 | pass 0.97 | **pass 0.97** (était **fail** — artefact levé) |

Le `fail` unanime sur le contrôle 2 a disparu des trois. Le `fail` sur `three_signals` de
`un-corridor-nest-pas-une-route` a disparu **sans qu'on touche à ses signaux** : c'était bien
l'angle mort du prompt, pas un défaut de la note. Le contrôle 7 de `corridor-pas-route` passe de
`pass` à `uncertain` sans qu'aucune de ses lignes n'ait changé — variance du juge, à lire comme
telle.

### 6.4 Coches posées

**18 validations nominatives** le 2026-08-21, une par contrôle et par note, chacune avec sa
justification en réserve, signées « Sylvain Geffroy », journalisées dans `validation_journal.json`
(qui passe de 12 à 30 entrées et contient enfin des entrées `target_kind: 'munich'` — il n'en avait
aucune). Le verdict du juge est attaché en `judge_verdict_snapshot` sur le contrôle 8, seul contrôle
jugeable des six.

| | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|
| assurance-maritime | todo | todo | todo | **ok** | **ok** | **ok** | todo | **ok** | **ok** | **ok** | 6/10 |
| corridors-strategiques | todo | todo | todo | **ok** | **ok** | **ok** | todo | **ok** | **ok** | **ok** | 6/10 |
| corridor-pas-route | todo | todo | todo | **ok** | **ok** | **ok** | todo | **ok** | **ok** | **ok** | 6/10 |

Le contrôle 5 était déjà `ok` mais **sans signataire journalisé** ; l'entrée le lui donne.

### 6.5 Ce qui reste

Les quatre contrôles restants (1, 2, 3, 7) sont ceux dont le contenu vient d'être corrigé — ils
n'étaient pas dans le lot des six et attendent ta lecture. Le juge donne désormais `pass` sur 2 et 3
pour les trois notes, `pass` sur 1 pour `corridors-strategiques`, `pass` sur 7 pour
`assurance-maritime`. Une fois les quatre posés : `compliance_done` s'ouvre (10/10), puis
`contradiction_done` — **les trois notes n'ont toujours aucun rapport red team ADR 0039** — puis
`human_review_done`, puis republication **des trois ensemble** (leurs renvois croisés sont morts
sinon).
