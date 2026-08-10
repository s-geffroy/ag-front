# ADR 0073 — Générateur de plaquettes (`.pptx` + `.pdf`), publication sur `/plaquette`

- **Statut** : accepté
- **Date** : 2026-08-10
- **Contexte** : « as-tu de quoi faire une présentation PowerPoint ? » — non. Aucun outillage
  bureautique n'existait : ni `python-pptx`, ni LibreOffice, ni `pandoc` sur l'hôte, aucun
  Marp/Slidev/reveal.js dans le repo, et le service `tools` est un Node 22 `bookworm-slim`.
- **Voisins** : ADR 0002 (service `tools`), 0046 (traçabilité de la validation humaine), 0066 (garde de
  couverture de contrat), 0069 (publication 1-clic), 0071 (garde `ATLAS_CONSENSUS_PUBLIC`).

## Décision

Un **générateur** (`packages/deck`, `@ag/deck`) plutôt qu'un document rédigé à la main, dont la sortie
est rangée dans `presentations/` (versionnée), relue dans le cockpit, et publiée sur
`https://www.applied-geopolitics.com/plaquette` sous garde.

**Deux familles**, pas un document unique : `commercial` (16 slides — le problème, la doctrine, le
socle en chiffres, les offres) et `methode` (29 slides — le backend, le CVI, HDDE, VERDICT, et une
démonstration déroulée). Un prospect froid ne lit pas trente slides ; un prospect engagé ne se contente
pas de seize. Chaque famille porte **son propre** `published` : `methode` peut être en ligne pendant
que `commercial` ne l'est pas. Les familles sont **découvertes** par balayage de
`presentations/*/manifest.json` — côté site comme côté cockpit — pour qu'ajouter une plaquette ne
suppose pas de se souvenir d'un enregistrement ailleurs.

La raison d'être du générateur tient en une ligne : le positionnement, la chaîne doctrinale et les
**trois offres avec leurs prix** sont déjà canoniques dans `apps/public/src/lib/site.ts`. Une plaquette
écrite à la main diverge du site à la première révision tarifaire ; une plaquette générée ne le peut
pas. Seul ce qui n'a pas de jumeau FR/EN sur le site vit dans `copy.{fr,en}.ts`.

## Arbitrages

### pptxgenjs, pas Marp ni reveal.js

Marp exporte en `.pptx` des slides-images : non éditables, non sélectionnables, sans texte extractible.
reveal.js ne produit pas de PowerPoint du tout. pptxgenjs écrit du vrai Open XML. Le skill `pptx`
d'Anthropic recommande exactement cette chaîne, ce qui a confirmé le choix après coup.

### Conversion LibreOffice, pas un second moteur de rendu

Le PDF est obtenu **en convertissant le `.pptx` généré**. Un second moteur HTML→PDF aurait dérivé du
premier ; la conversion garantit par construction que le PDF *est* le deck.

### Une image `slides` séparée, pas un `tools` alourdi

LibreOffice + poppler + qpdf + Python pèsent ~1,3 Go au-dessus de `tools`. Les faire porter à chaque
`npm install` du quotidien est inacceptable. `docker/slides.Dockerfile` (`app-geo-slides:local`, 1,99 Go)
est construite **à la demande** et sert aussi de runtime aux scripts des skills.

### Adoption des skills `pptx` et `pdf` (`anthropics/skills`)

Vendorisés dans `.claude/skills/`, licence conservée. `pptx` apporte `office/validate.py` (schéma OOXML,
relations, content-types), `office/soffice.py`, `thumbnail.py`, `clean.py`. `pdf` **ne fait pas**
pptx→PDF : son apport se limite ici à `pypdf` pour la normalisation et `pdfplumber` pour la QA texte.
L'image n'installe qu'un **sous-ensemble** de leurs dépendances — pas d'OCR (`pytesseract`,
`pdf2image`), pas de `reportlab`, pas de `markitdown` : on génère avec pptxgenjs, on ne fait ici que
valider, convertir, vignetter et normaliser.

### `presentations/` versionné, distribué par une intégration Astro

Une plaquette envoyée à un prospect est un livrable daté, pas un build jetable : elle ne va donc pas
dans `dist/`. Mais `apps/public/` n'a qu'un `publicDir`, et y déposer une seconde copie des binaires
aurait garanti la dérive. `apps/public/integrations/plaquette.mjs` les copie au build depuis
`presentations/`, source unique. L'intégration **casse le build** si le manifeste annonce un fichier
absent : une page `/plaquette` aux liens morts est pire qu'un build rouge.

### Un vrai garde de publication, pas une page non listée

`manifest.json#published` est la barrière, sur le modèle d'ADR 0069/0071. Tant qu'il est `false`,
l'intégration **sort physiquement** `dist/plaquette/` de l'arbre servi et la range dans
`apps/public/.plaquette-preview/` — parce qu'une page présente dans `dist/` est publique, listée ou
non. Le sitemap est filtré au même endroit, et tout lien interne (`Footer.astro`, `offres.astro`) est
gardé par `plaquetteIsPublic()`.

## Le rythme, et les données montrées plutôt qu'affirmées

Un deck où chaque page a la même densité et la même couleur se lit comme un formulaire. Trois leviers,
tous portés par le modèle de slides plutôt que par des retouches page à page :

- **Des respirations sombres** (`section-break`) entre les actes, avec leur numéro romain. Sans elles,
  un lecteur ne sait jamais s'il entre dans un argument ou s'il en sort.
- **Des instruments, pas des listes.** `stat-row` (un chiffre à 54pt), `distribution` (un histogramme
  **natif** pptxgenjs, donc éditable chez le client — une image de graphique est précisément ce qu'un
  destinataire ne peut pas corriger), `sequence` (grille numérotée), `weighted-bars` (le poids **est**
  la barre : lire la forme d'un arbitrage ne doit pas exiger de lire des chiffres), `ladder` (l'échelle
  de preuve, avec le barreau non recevable barré), `split` (texte + panneau d'instrument).
- **Une démonstration déroulée**, trois slides sur Malacca.

### La démonstration, et sa ligne rouge

La fiche Atlas de Malacca est `published: false`. La démonstration n'utilise donc que ses **faits
institutionnels sourcés** — EIA, MPA Singapore, ReCAAP, Reuters/GEM — et **ne publie aucun score CVI**.
La slide la plus utile des trois est celle qui énonce ce qu'aucune source publique ne documente : la
capacité résiduelle d'absorption en cas de fermeture.

Deux gardes automatiques tiennent cette ligne (`publication.test.ts`) : chaque slide de démonstration
doit porter la mention « pas un diagnostic publié » — **sur chacune**, parce qu'une slide se
photographie et se transfère seule — et aucune ne doit contenir de bande CVI pour le corridor traité.

## Ce que la plaquette dit du backend

C'était l'argument le plus fort du dossier et il était absent. `backend-facts.ts` porte les
mesures — 313 objets recensés en 8 familles, 190 sources au registre avec leur régime de licence,
15 moteurs dérivés, 40 endpoints, 87 ADR — **avec la méthode de comptage de chacune**, parce que la
personne qui les mettra à jour doit pouvoir reproduire le compte plutôt que le deviner. Un test vérifie
la seule identité disponible sans interroger le backend : la ventilation par famille somme au total.

Une distinction que le deck ne doit jamais brouiller : le corpus est **recensé**, pas **validé**.
Écrire « 313 corridors analysés » serait exactement le genre de mensonge que la slide sur les limites
du CVI promet qu'on ne fait pas.

## Relecture dans le cockpit — la fidélité comme exigence

Page dédiée `/commercial/plaquette` (`apps/cockpit/src/pages/PlaquettePage.tsx`), organisée sur deux
axes pour qu'aucun des deux ne se lise en faisant défiler : un **sélecteur de famille** (chacune
publie indépendamment, avec son état affiché) et des **onglets** sur les quatre gestes du relecteur —
Document, Page publique, Rendu dégradé, Décision.

Deux vues, choisies pour qu'il n'y ait rien à extrapoler :

1. **Le PDF dans le lecteur du navigateur.** Ce n'est pas une vue de l'artefact, c'est l'artefact.
2. **La page publique construite, servie par le cockpit à son propre `/plaquette`.** `server/index.ts`
   monte `dist/plaquette` (ou `.plaquette-preview`) et `/_astro` : mêmes octets, mêmes feuilles de
   style, **mêmes chemins absolus**, donc les liens de téléchargement fonctionnent aussi. Aucune
   collision : le SPA du cockpit sert ses propres assets depuis `/assets`, jamais `/_astro`. Limite
   assumée : les liens sortants (`/offres`, `/contact`) retombent sur le cockpit.

La décision est nominative et journalisée (`target_kind: 'publication'`, ADR 0046), pose la sentinelle
`.publish-pending`, et le watcher de l'hôte fait le reste. Le cockpit ne génère pas la plaquette et ne
lance jamais le build du site.

Le garde de publication y est volontairement **étroit**. Contrairement à une fiche éditoriale, la
plaquette n'a ni livrable ni checklist de Munich derrière elle ; lui inventer des gates serait du
théâtre. Ce qui est vérifié est ce qui casse réellement : un PDF absent ou périmé (typiquement après un
`--pptx-only`), ou une page jamais construite — donc jamais relue. Dépublier est toujours permis.

## Deux pièges rencontrés, et ce qu'ils ont coûté

**Les polices.** `@fontsource*` dans `node_modules` ne fournit que du **woff2**, inutilisable par
LibreOffice comme par PowerPoint. Et `google/fonts` ne publie Inter et Fraunces qu'en **variable** — or
LibreOffice rend une variable à son instance par défaut et *simule* les autres graisses ; du faux-gras
Fraunces sur un titre est précisément la dérive que le PDF doit éliminer. L'image instancie donc de
vraies coupes statiques avec `fonttools`. Contrainte non évidente : `--update-name-table` refuse toute
valeur absente de la table STAT — Fraunces ne nomme que `opsz` 9 / 72 / 144, ce qui impose 72pt (qui se
trouve être la bonne, c'est la coupe display).

**Le losange en tofu.** pptxgenjs code en dur `buFont typeface="Arial"` sur les puces : le glyphe est
résolu dans Arial, pas dans la police du run. Inter possède U+25C6 (◆), Arial et son substitut
Liberation non — la puce sortait en carré vide. La solution est U+25CA (◊), présent dans WGL4 donc dans
le vrai Arial de Windows, et par chance c'est le losange *évidé* de `CorridorChain`.

## Reproductibilité — la contrepartie du versionnage

Versionner des binaires impose qu'un rebuild sans changement ne produise **aucun** diff.
`scripts/deck-normalise.py` retire trois sources d'aléa, et **l'ordre compte** :

- `.pptx` — `dcterms:created`/`modified` dans `docProps/core.xml` + les mtimes d'entrées ZIP ;
- `.pdf` — `/CreationDate`, `/ModDate` et l'`/ID` aléatoire. Les métadonnées sont fixées avec `pypdf`
  **d'abord**, `qpdf --deterministic-id` calcule l'ID **en dernier**. L'ordre inverse — l'intuitif —
  annule silencieusement l'ID déterministe, puisque pypdf réécrit le trailer qu'il vient de figer.

La normalisation du `.pptx` précède la **validation**, pour que ce qui est certifié soit le fichier qui
expédie et non son brouillon.

## La limite assumée : les polices chez le client

pptxgenjs n'embarque pas les polices. Sur un poste sans Inter ni Fraunces, la substitution décale les
largeurs. Trois réponses, aucune magique :

1. **Le PDF est l'artefact de référence** — polices embarquées. C'est lui que `/plaquette` met en avant.
2. **Marge à la composition** — titres budgétés pour deux lignes, blocs dimensionnés large.
3. **QA de substitution** — `scripts/build-deck.sh --substitution-qa` re-rend via un `FONTCONFIG_FILE`
   qui masque les polices maison, et le cockpit affiche le résultat. Inspection humaine, pas test.
   Au tirage du 2026-08-10 : aucun débordement, l'identité tombe, le document tient.

## Gardes automatiques

- `packages/deck/src/theme.test.ts` — relit `apps/public/src/styles/global.css` et échoue si la palette
  du deck a dérivé. `packages/tokens/src/index.ts` est la démonstration du problème : il annonce encore
  `#1f4e79` et Source Serif 4, longtemps après que le site est passé à la charte carte d'état-major.
- `packages/deck/src/publication.test.ts` — **aucune slide ne pointe vers un contenu non publié.** Les
  deux collections ont des polarités inverses (`published: true` pour atlas/dossiers, `draft: true`
  pour les notes), ce qu'une relecture humaine rate. Le générateur refuse aussi d'écrire le fichier :
  un fichier qui existe finit par être envoyé.

## Deux règles qui doivent rester alignées

La page `plaquette.astro` liste les familles **publiées**, ou **toutes** quand aucune ne l'est — ce
build-là est retenu pour relecture, et une page de relecture aux liens morts ne sert à rien.
`integrations/plaquette.mjs` doit copier **exactement le même ensemble**. Les avoir désalignées une
fois a produit une prévisualisation retenue avec un `index.html` et zéro binaire.

## Conséquences

- Une nouvelle plaquette est un frère de `commercial/` plus une entrée dans `BUILDERS` — le site et le
  cockpit la découvrent seuls.
- Toute révision tarifaire sur `/offres` impose de régénérer `commercial` — sinon le site et le
  document divergent. Rien n'automatise ce rappel aujourd'hui.
- Les mesures de `backend-facts.ts` sont datées et transcrites à la main. Elles vieillissent : le
  corpus grossit, les ADR s'accumulent. Rien ne le signale non plus.
- L'image `slides` doit être reconstruite si les polices changent ; le `fc-list` final échoue plutôt
  que de laisser LibreOffice substituer en silence.
