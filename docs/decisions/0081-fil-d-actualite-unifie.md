# 0081 — Un fil d'actualité unifié, et le retrait d'un badge qui n'attribuait rien

- **Statut** : accepté
- **Date** : 2026-08-21
- **Voisins** : [0074](0074-jugement-sur-titres-et-independance-des-marches.md) (la phrase du
  promoteur, jamais celle du modèle), [0071](0071-consensus-et-news-promue-sur-atlas-public.md) (signaux Atlas et veille
  promue), [0077](0077-statut-epistemique-d-une-absence.md) (aucune clé ne classe les corridors),
  [0066](0066-consommation-integrale-read-api.md) (lecture intégrale du contrat chokepoints),
  [0069](0069-cockpit-one-click-publish.md) (publication un clic et watcher hôte)

## Contexte

Deux constats, et une seule cause commune : **l'accent visuel du site était dépensé sur ce qui
n'informait pas.**

Sur `/atlas`, chaque carte de corridor portait un badge « Attribution requise », rendu dès que
`required_attributions` était non vide — c'est-à-dire sur **les trente cartes**. Quatre-vingt-dix
pilules affichées sur cette page, dont trois portaient une information : la date d'une actualité.
Le badge, lui, ne départageait rien et, surtout, **ne nommait aucune source** : il ne dischargeait
donc aucune obligation de licence. L'attribution qui oblige est nominative et vit ailleurs — sur la
fiche de chaque corridor, et dans la clause de réutilisation des mentions légales.

Sur la page d'accueil, l'actualité tenait dans une bande grise (`VeilleStrip`) qui se lisait comme
un pied de section, sous un bloc « À la une · Dossier » plus lourd qu'elle — lequel promeut un
dossier vieux de deux mois, déjà mis en avant par le bouton du hero.

## Décision

### 1. Le badge d'attribution quitte les cartes ; la notice du producteur ne s'affiche plus

Un badge qui ne nomme pas sa source n'attribue pas. Retiré de la grille ; rien n'est touché là où
l'attribution existe réellement (`/atlas/chokepoints/<id>`, mentions légales). Une garde de source
dans `legal.test.ts` tient les trois moitiés de la règle : le badge et la notice absents de la
liste, l'attribution nominative présente sur la fiche, la clause présente dans les mentions.

`attribution_notice` reste **consommé mais non rendu**, et le champ le dit maintenant en toutes
lettres. C'est un disclaimer adressé à l'intégrateur — « pass `include_tainted=true` » est une
instruction d'API — servi en anglais, qui était collé au bout d'un paragraphe français. Le champ
n'est pas supprimé du type : l'ADR 0066 fait de la lecture intégrale du contrat un invariant de
build, et le retirer parce qu'une page a cessé de l'afficher est le geste que cette ADR interdit.
Il est remplacé, à l'écran, par une phrase à nous, adossée à trois faits vérifiables ici.

### 2. Un point, et une date : jamais l'un sans l'autre

Les cartes de corridor portant une actualité de moins de 21 jours reçoivent une **pastille accent en
haut à droite**, fixe, sans animation. Elle est décorative au sens de l'accessibilité, et c'est le
point : l'information reste portée **en texte** par la pilule datée du pied de carte, donc le signal
ne repose jamais sur la couleur seule. Point et pilule sortent du **même** appel à
`corridorNewsSignal` — un point sans sa date serait un signal qu'on ne peut ni lire ni situer.

La pastille se pose à 8 px du coin, à l'intérieur de l'équerre de survol (`.card-link::before`, 12 px,
traits collés aux bords) : les deux marques accent coexistent au survol sans se toucher, et l'unique
animation autorisée sur une carte est préservée.

Portée : la grille P0 de `/atlas` seule. La prop `signal` d'`EntryCard` est optionnelle et n'est
passée que là.

### 3. Le fil d'accueil devient unifié : veille **et** publications

`VeilleStrip` est remplacé par `ActualiteBlock`, alimenté par une règle pure,
`lib/actualite.ts`, qui fusionne quatre sources — promotions de veille, dossiers, notes, fiches
Atlas — en un seul fil daté.

**Le module ne charge rien.** Il ne connaît ni `promoted-news.json` ni `astro:content` : la page lit,
le module fusionne. Sans cela la règle ne serait pas exécutable sous vitest (`apps/public` n'a pas de
`vitest.config`), et un test qu'on ne peut pas lancer n'est pas une garde. C'est le partage déjà
retenu entre `newsSignalFrom` et `corridorNewsSignal`.

Quatre règles, chacune contre une panne nommée :

- **Un seul seuil, 21 jours**, importé et non recopié — trois constantes portaient déjà cette valeur
  et ont dû être tenues en phase à la main. Il s'applique **aussi** aux publications éditoriales : un
  bloc titré « Actualité » surmontant un dossier de juin n'est pas neutre, il affirme, et c'est
  exactement ainsi que la fiche Mer Rouge en est venue à soutenir « aucune attaque depuis octobre
  2025 » dix jours après que ce fut faux.
- **Filtrage entrée par entrée**, pas sur l'âge du plus récent. `homepageVeille` testait le plus
  récent puis coupait sans revérifier : elle pouvait afficher mars à côté d'hier.
- **Écarte ce qu'on ne peut pas dater, et ce qui est daté du futur.** Écart assumé vis-à-vis de
  `loadVeille`, qui garde une estampille cassée en la triant en dernier — là-bas la liste est
  exhaustive et la date est un ornement ; ici la date **est** le prédicat.
- **Une ligne par cible, la plus fraîche.** Ormuz portait deux promotions valides ; sur un fil de
  quatre lignes, les répéter donnait la moitié de la page au même corridor. L'exhaustivité est le
  travail de `/veille` et de la fiche.

Le lien vers `/veille` est une **prop gardée par `veilleIsPublic()`**, pas une constante : cette page
quitte le build quand le magasin de promotions est vide, or le fil peut être plein sans une seule
promotion — une note fraîche y suffit.

### 4. « À la une » devient « Dossier de référence »

Les deux blocs promettaient la même chose. L'un dit désormais ce qui vient de bouger (daté, borné,
il s'efface), l'autre le dossier de preuve (permanent). Un dossier fraîchement publié apparaîtra
légitimement dans le fil **et** restera la référence en dessous : deux affirmations distinctes.

## Conséquences

- **Le fil disparaîtra entièrement le 2026-09-11** si rien n'est publié d'ici là — les trois
  promotions du 21 août auront 21 jours, les 12 notes sont `draft: true` et les 13 fiches
  `published: false`. C'est le comportement voulu, et c'est le vrai coût de la décision : elle rend
  l'absence de cadence éditoriale visible sur la page la plus vue. C'est un argument **pour**.
- **La fraîcheur est calculée à l'instant du build.** Le site est statique : c'est le cron horaire
  `17 * * * * scripts/redeploy-public.sh --refresh-signals` qui fait réellement s'éteindre le bloc.
  Sans lui, « tombe vers le vide » ne serait qu'une propriété de test.
- `homepageVeille` est supprimée ; `HOMEPAGE_MAX_AGE_DAYS` reste, avec l'arbitrage qui l'a produite.
- La garde ADR 0074 couvre maintenant `ActualiteBlock.astro`, `lib/actualite.ts` et
  `pages/index.astro` : la page compose le fil, elle ne doit pas contourner l'adaptateur.

## Reste ouvert

Les corridors s'affichent sous leur **`canonical_name` anglais** — « Strait of Hormuz »,
« Panama Canal » — sur `/atlas` comme, désormais, en titre serif des lignes du fil d'accueil, sur un
site dont la langue première est le français. La base ne sert pas de libellé français et nous n'en
fabriquons pas : ce serait une donnée dérivée présentée comme canonique. Le choix — table de
correspondance éditoriale, validée à la main — est une décision à prendre, pas un correctif.
