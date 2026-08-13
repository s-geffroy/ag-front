# 0080 — Recherche interne du site public : indexer le `dist/`, pas le contenu

- **Statut** : accepté
- **Date** : 2026-08-13
- **Voisins** : [0073](0073-generateur-de-plaquettes.md) (garde de publication de la plaquette),
  [0069](0069-publication-un-clic-gardee.md) (publication un clic et watcher hôte),
  [0010](0010-public-deploy-caddy.md) (Caddy en frontal),
  [0076](0076-mesure-audience-plausible-auto-heberge.md) (mesure d'audience)

## Contexte

Le site public comptait 131 pages construites et **aucun moyen de recherche** : ni champ, ni filtre,
ni index. Un visiteur cherchant « Ormuz » n'avait que la navigation par rubriques.

Le déséquilibre du corpus est ce qui décide de la conception. Le texte utile tient en ~18–20 k mots,
mais **112 des 131 pages** sont des pages Atlas dérivées de la base chokepoints (30 points de
passage, 82 systèmes stratégiques), atteignables uniquement en parcourant des listes. Et les quatre
fiches Atlas — l'éditorial le plus dense du site — sont toutes `published: false`, donc absentes du
build : un moteur limité à l'éditorial aurait contenu une douzaine de documents et n'aurait rien
renvoyé sur « Ormuz ».

## Décision

**Pagefind, exécuté sur le `dist/` construit**, via une intégration Astro locale
(`apps/public/integrations/search.mjs`). Une icône loupe dans le bandeau ouvre un overlay type
palette de commandes ; pas de page `/recherche`.

### 1. Indexer le rendu, pas les sources

C'est le cœur de la décision. Sur ce site, la garde de publication **fonctionne par absence** : le
filtrage a lieu dans `getStaticPaths`, donc un document retenu ne produit ni page, ni entrée de
sitemap. Il est de ce fait absent de `dist`, donc absent de l'index — **sans une ligne de filtrage à
réécrire**.

L'alternative — un index construit depuis les collections de contenu — aurait exigé de répliquer la
règle de publication dans un second endroit. Deux copies d'une règle de publication finissent par
diverger, et le mode de défaillance est le pire possible : un document retenu qui réapparaît par le
moteur. Le même raisonnement couvre l'allowlist `PUBLIC_FEATURE_PROPS` : l'index étant dérivé de HTML
**déjà public**, il ne peut rien contenir que le site ne publie pas.

Bénéfice second : les 112 pages issues de la base sont couvertes sans aucun code de correspondance.

### 2. L'ordre des hooks de build porte la garde

`ag:search` **doit** être enregistrée *après* `plaquette()` dans `astro.config.mjs`. Astro exécute
les hooks de même nom dans l'ordre d'enregistrement, et `plaquette()` **déplace physiquement**
`dist/plaquette/` hors de l'arbre servi quand aucune famille n'est publiée (ADR 0073). Indexer avant
ce hook publierait par le moteur une page délibérément retenue. L'intégration ne se contente pas de
l'ordre : elle vérifie que `dist/plaquette/` a disparu et avertit sinon.

### 3. L'indexation est un opt-in porté par une seule ligne

Pagefind n'indexe que les pages portant `data-pagefind-body`, et seulement ce sous-arbre. L'attribut
est posé sur le `<main>` de `layouts/Base.astro`, conditionné par une prop `searchable` (défaut
`true`). Deux conséquences : le bandeau et le pied de page ne peuvent pas correspondre à chaque
requête (aucun `data-pagefind-ignore` n'est nécessaire), et le retrait d'une page est un
`searchable={false}` sur son appel à `<Base>` — quatre pages aujourd'hui (contact, mentions légales,
404, plaquette), les ~15 autres étant couvertes par le défaut.

Le titre affiché vient du même endroit (`data-pagefind-meta`), depuis la prop `title` de la page,
plutôt que du premier `<h1>` deviné : sans cela l'accueil s'annonçait par sa phrase d'accroche.

### 4. Le classement est un tri stable par famille, pas un score maison

Le type d'un résultat se déduit de son URL (`src/lib/search.ts`) : l'arbre de routes *est* la
taxonomie, et la relire évite de propager des métadonnées dans 100+ gabarits générés. Les familles
sont triées de façon **stable**, ce qui préserve à l'intérieur d'un groupe l'ordre de pertinence du
moteur : éditorial (0) → méthode (1) → points de passage (2) → systèmes (3) → **pages génériques
(4)**.

Les pages génériques passent en dernier, contre l'intuition. Elles mentionnent tout en passant et
correspondent donc faiblement à presque tout : au premier essai, « ormuz » renvoyait l'accueil et
`/veille` **avant** la fiche du détroit d'Ormuz.

### 5. L'index est relu avant d'être servi

Pagefind est revenu d'un `writeFiles()` en laissant `pagefind-entry.json` et trois autres fichiers à
**0 octet** — une fois sur plusieurs exécutions identiques. La défaillance est silencieuse et
mauvaise : le moteur se charge, l'overlay paraît vivant, et **chaque requête** meurt sur « Failed to
load Pagefind metadata ». Rien en aval ne l'aurait vu.

L'intégration relit donc l'index produit et prouve sa cohérence (fichiers requis non vides, entrée
JSON valide, artefacts `.pf_meta`/`.wasm` référencés présents, nombre de fragments égal au nombre de
pages déclaré), réessaie jusqu'à trois fois sur répertoire nettoyé, puis **casse le build**. C'est la
doctrine déjà appliquée par `plaquette.mjs` aux liens de téléchargement morts : une boîte de
recherche qui ne renvoie rien est pire qu'un build rouge. Le garde-fou est couvert par
`integrations/search.test.mjs`, sur la panne réellement observée.

## Conséquences

- Le déploiement ne change pas : l'indexation étant un hook de build, `scripts/redeploy-public.sh` et
  le watcher horaire la déclenchent sans modification. Caddy sert `dist/pagefind/` par son
  `file_server` attrape-tout — aucune ligne de configuration à ajouter.
- Nouvelle dépendance de développement avec binaire de plateforme (`pagefind`, ~37 Mo décompressés).
  Si le registre venait à ne plus la servir, le repli est un `dist/search-index.json` produit par la
  même intégration et un scoreur client — plus de code à tenir, et pas d'extrait surligné.
- L'index n'existe pas sous `astro dev` : l'overlay le dit explicitement au lieu de rester muet.
- Le moteur reste utile le jour où les fiches Atlas seront publiées : elles entrent dans le bandeau
  de tête sans aucun changement de code.
