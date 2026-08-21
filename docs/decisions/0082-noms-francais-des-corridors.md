# 0082 — Les noms français des corridors : une table décidée, pas une traduction (complète 0081)

- **Statut** : accepté
- **Date** : 2026-08-21
- **Voisins** : [0081](0081-fil-d-actualite-unifie.md) (qui laissait la question ouverte),
  [0066](0066-consommation-integrale-read-api.md) (lecture intégrale du contrat),
  [0077](0077-statut-epistemique-d-une-absence.md) (le statut épistémique d'une absence)

## Contexte

L'ADR 0081 laissait ouvert un défaut qu'elle venait de rendre plus voyant : les corridors
s'affichaient sous leur `canonical_name` **anglais** — « Strait of Hormuz », « Panama Canal » — sur
les trente cartes de `/atlas` et, depuis le fil unifié, en titre serif de la page d'accueil. Sur un
site dont la langue première est le français.

La cause n'est pas un réglage oublié : **la base ne sert qu'un nom par objet**, sans champ `_fr`,
sans locale, sans alias traduit. Vérifié sur le contrat épinglé — la donnée n'existe pas.

## Décision

Une **table de noms explicite**, `apps/public/src/lib/corridor-names.ts`, consultée par
`corridorNameFr(id, canonicalName)` aux deux points où un nom de corridor entre dans une page :
`atlas-data.ts` (cartes et fiches corridor) et `veille.ts` (fil d'accueil et `/veille`). Un corridor
porte ainsi **un seul nom sur tout le site** — sinon le fil et la fiche vers laquelle il pointe
s'appelleraient différemment.

### 1. Pas une dérivation des titres de fiches

C'était la première idée, et elle était fausse. Onze fiches portent un `chokepoint_id` et un titre
français, mais **un titre de fiche n'est pas un nom de corridor** : « Taïwan — semi-conducteurs et
routes maritimes » est un cadrage éditorial quand le corridor s'appelle « Taiwan Strait » ; « Mer
Rouge / Suez / Bab el-Mandeb » couvre trois objets là où le `chokepoint_id` n'en désigne qu'un ;
« Câbles sous-marins de la mer Rouge » vise un autre objet que le corridor de câbles égyptien. Six
titres sur onze tombaient juste, cinq auraient renommé l'objet avec l'angle de la fiche. La table est
donc décidée entrée par entrée, à la main.

### 2. Deux rayons, et un seul est rendu

- **`CORRIDOR_NAME_FR` (20 entrées, rendues)** — n'invente rien : exonymes français attestés
  (« détroit de Luçon » et « canal de Bashi », qui en fait partie ; « Bab-el-Mandeb », forme
  française dominante) et traduction de libellés purement descriptifs (« Eastern Mediterranean
  System »). SUMED reste SUMED : c'est un acronyme (SUez-MEDiterranean) sans exonyme français, seul
  le nom commun se traduit — « oléoduc SUMED ».
- **`CORRIDOR_NAME_FR_PENDING` (13 entrées, NON rendues)** — ce qui demande un **arbitrage** et non
  une traduction. « Chokepoint » n'a pas d'équivalent français stable dans notre vocabulaire (goulet ?
  point de passage obligé ? le mot anglais, que la méthode CVI emploie déjà ?), et « Western Nuclear
  Fuel Conversion » porte une qualification géopolitique — « occidental » — qui est une position,
  pas une traduction. Ce sont des **candidats en attente de validation humaine**, et un candidat ne
  s'affiche pas : `corridorNameFr` ne lit pas ce rayon, un test le vérifie.

**Valider, c'est déplacer la ligne** d'un rayon à l'autre. C'est tout, et c'est le geste.

### 3. Une absence rend le nom anglais, jamais une traduction fabriquée

`corridorNameFr` retombe sur le `canonical_name`. C'est honnête : c'est le nom que porte la donnée.
Traduire à la volée produirait un libellé que la base n'a pas, affiché exactement là où va le nom
canonique — candidat présenté comme fait.

### 4. La garde de build, parce que le défaut a déjà frappé

Un libellé posé sur un identifiant inexistant **ne casse rien** : le fallback rend le nom anglais, la
page s'affiche, et le nom français qu'on croyait avoir branché n'apparaît jamais. C'est le « bloc
vide en silence » de l'ADR 0059, appliqué aux noms.

Ce n'est pas théorique : **dix-neuf des trente-trois clés de la première version étaient fausses**,
fabriquées d'après le nom anglais au lieu d'être relevées sur la donnée. Aucune n'aurait été
signalée. L'intégration `ag:anchors` vérifie donc désormais aussi les clés de la table contre l'API
au build — 33/33 au premier passage vert.

Deux notes que cet épisode impose d'écrire : **le préfixe `p0_`/`p1_`/`p3_` d'un identifiant n'est
pas sa classe de priorité** (la grille « P0 » de `/atlas` contient des identifiants `p1_` et `p3_`),
et **on ne fabrique jamais un identifiant d'après un nom**.

Ces identifiants **ne rejoignent pas** `docs/chokepoint-ids.pinned.txt` : cet inventaire est un
artefact de contrat, déposé à ag-back et gelé par eux (leur 0054). Nos libellés ne les regardent pas,
et grossir la liste déposée leur ferait porter une contrainte qui est la nôtre.

## Conséquences

- **17 des 30 cartes** de `/atlas` sont en français, et le fil d'accueil l'est entièrement :
  « Canal de Panama », « Système mer Rouge – Bab-el-Mandeb – Suez », « Détroit d'Ormuz ».
- Les **13 restantes** — filières minérales, nucléaires, financières — gardent leur nom anglais
  jusqu'à arbitrage. Leur proposition est écrite et relisible dans le rayon en attente.
- Trois entrées rendues visent des objets **hors de la grille P0** (Méditerranée orientale,
  corridor médian trans-caspien, corridor de câbles égyptien) : elles servent les fiches et les
  pages de détail.
- Le vocabulaire à trancher pour vider le rayon en attente est d'abord **un seul mot** : comment
  nous disons « chokepoint » en français, ou si nous le gardons.
