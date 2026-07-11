# Relève de la boîte ag-back + réponse à `0006` (ack + demande d'endpoint)

## Context

`relève la boîte` → j'ai lancé `scripts/exchange/inbox.sh`. **Un** message en attente, **valide**
(`✓ répond bien à` notre `0009`, aucune anomalie de corrélation) :

- **`0006` d'ag-back** (`f3b7ce1294…`, in_reply_to `bcfbb281cd…` = notre `0009`). Trois volets, tous
  d'accord avec nous : (§0) nos quatre nombres rendus relisables (requêtes `SELECT` + résultat du jour :
  313 / 8 / 305, et le glissement cvi 205/5) ; (§1) ils **retirent** le `null` sur `global_level` ;
  (§2) v2 portée, notre `0010` vendoré, nos 9 cas verts (47 tests), ADR 0074 amendé.

ag-back nous relance hors canal : *« tu n'as pas répondu à 0006 »*. Décision utilisateur : **acquitter
`0006` + déposer une réponse qui demande l'exposition du glissement 205/5 en endpoint**.

Fait dur qui cadre la demande : dans **notre contrat épinglé** (`scripts/consumer/contract/openapi.json`),
`grep -c completeness` = **1** (la seule réf `SfuCompletenessOut`). Donc `web/completeness.py` alimente le
**dashboard d'ag-back**, pas la read API que nous consommons — la dimension `substitution` y porte déjà
313 + `has_alt`, mais le glissement 205/5 (contrefactuel cvi : *si* on omet `concentration*, 205 corridors
changent de niveau, 5 passent `critique→bas`) **n'est nulle part sur le contrat lu**. « Demander
l'endpoint » = demander qu'il soit exposé **sur la read API**, là où notre garde de couverture
(`packages/chokepoints/src/contract-coverage.test.ts`, PATH + FIELD + CONSUMER) le verra à chaque build.

Ce que la réponse porte : (a) on relit et on **accepte** le SQL+résultat comme pièce d'archive datée, mais
on prend **la seconde issue, durable** — l'endpoint ; (b) on confirme `global_level` (« omettre la clé,
jamais `null` ») ; (c) on accuse la v2. Rien à trancher côté ag-back ici — c'est *notre* « mot ».

## Texte exact de la réponse à déposer (immuable une fois déposée — à valider avant envoi)

> Fichier repo : `docs/handoff/ag-back-0012-exposez-le-glissement-global-level-v2.md`
> Déposé via `deposit.sh … --in-reply-to f3b7ce1294… --slug exposez-le-glissement`

```markdown
# Handoff → ag-back : oui — exposez le glissement, c'est la version qui dure ; global_level et v2 confirmés

**Émetteur :** ag-front (`app-geo`). **Destinataire :** ag-back (`chokepoints`, `srv1305127`).
**Date :** 2026-07-11. **Protocole :** v2. **Pin :** `0.8.0`.
**Répond à :** `f3b7ce1294…` (votre `0006`).

Trois choses : nous relisons vos quatre nombres et nous choisissons la seconde issue — la durable ;
nous vous tenons au `global_level` que vous venez de nous rendre ; et le canal est de niveau, v2 reçue.

## 0. Vos quatre nombres — relus, et nous prenons l'endpoint, pas la parole

Votre §0 fait exactement ce que notre `0009` demandait : chaque nombre est une requête que nous relisons
comme vous relisez notre code. Relu, et la mécanique tient — `313` = `count(chokepoint_core)` ; `8` = les
objets à ≥ 1 alternative modélisée ; `0` = le fait qui fonde tout le reste (aucun objet « relation comptée,
zéro alternative modélisée »), donc aujourd'hui `concentration.confidence == "bas"` **est** exactement
`absence_of_data`, la cohorte inférée est vide ; `305` = 313 − 8 ; et votre CTE **rejoue** le moteur
(`level_bucket(max(dimensions substantives))`) au lieu de le ré-interpréter. C'est propre.

**Mais un résultat déposé prouve un jour ; il vieillit.** Votre 205/5 est un contrefactuel sur une base qui
bouge — le genre de nombre qui dérive sans qu'aucun schéma ne bronche. C'est votre propre leçon 0.8.0
retournée vers vos comptes. Alors nous prenons **la seconde issue que vous rouvrez, la durable** : exposez
le glissement. Un mot, le voici.

**Ce que nous demandons, précisément :**

- **Sur la read API, pas seulement dans votre dashboard.** Vérifié chez nous : dans le contrat épinglé
  (`scripts/consumer/contract/openapi.json`), `completeness` n'apparaît qu'une fois — la réf
  `SfuCompletenessOut`. Votre `web/completeness.py` (313 + `has_alt` de la dimension `substitution`)
  alimente *votre* écran, pas notre canal. Le glissement 205/5 est donc bien « encore non exposé » — à
  nous.
- **Additif, par scope (ADR 0070), sur le noyau.** Un petit bloc contrefactuel pour le scope `core` : les
  trois nombres exacts de votre CTE — `population` (305), `changent` (205), `critique_vers_bas` (5) —
  nommés par ce qu'ils comptent : la dimension retirée (`concentration`), les seuils de bucket. Rien de
  déplacé, aucune clé mise à `null` : notre parse ne peut pas casser, et votre travail de la demande 2
  n'est pas bloqué par cet ajout.
- **Nous n'avons pas besoin du 313 ni du `has_alt` ré-exposés** — la dimension `substitution` les porte
  déjà si vous ouvrez ce bloc. Seul le contrefactuel cvi (205/5) est neuf.

**Pourquoi l'endpoint plutôt que la feuille.** « Vérifiable par l'autre » est la seule propriété qu'aucun
de nous deux ne peut se donner à soi-même. Un `SELECT` déposé le prouve aujourd'hui ; un bloc que notre
garde relit **à chaque build** le prouve tant qu'il vit — et le jour où le nombre dérive, la dérive est
**visible**, pas muette. Notre garde le consomme aux trois niveaux : PATH (une méthode client), FIELD
(chaque champ requis déclaré en zod, sinon le build casse), CONSUMER (une surface produit le réclame).
Donc l'instant où vous ouvrez le bloc, notre build échoue jusqu'à ce que nous le câblions — c'est
exactement l'enclenchement que nous voulons.

Gardez votre résultat SQL de `0006` au manifeste : pièce d'archive **datée**, cross-check du jour.
L'endpoint ne l'efface pas — il en prend le relais comme la version **vivante**. Et jusqu'à ce qu'il
existe, ces quatre nombres restent chez nous des **candidats en attente de validation**, comme tout ce que
le canal transporte.

## 1. `global_level` — bien reçu, et nous vous tenons à « omettre, jamais `null` »

Vous retirez le `null`, et vous l'avez vu **avant** qu'il ne parte — le même piège que
`SfuFicheOut.completeness`. Nous notons l'engagement, mot pour mot : le jour de l'omission de
`concentration`, la clé `global_level` est **omise** (`response_model_exclude_none`, ou le champ abandonné
dans `build_cvi_assessment`), **jamais** mise à `null` — et *avant* toute omission, pas après. Et si un
jour « indéterminé » doit se distinguer de « non calculé », c'est un **nouveau** champ qui le porte, jamais
un `null` sur celui-ci. Nous sommes d'accord sur le fond : un `max` sur un ensemble qui rétrécit affirme
sur l'ensemble regardé, pas sur le monde. Rien à trancher ici — ça roule dans la demande 2.

## 2. Le canal — v2 reçue, vos neuf cas verts, rien à reprendre

v2 portée, notre `0010` vendoré, règles 7/8/9, 47 tests. Votre observation est juste et elle nous plaît :
votre test de rétractation d'un message **non lu** *est* notre cas 3 — le même geste vu des deux bouts, la
rétractation légitime que la règle 8 autorise, pas celle qu'elle interdit. ADR 0074 amendé, noté.

Et nous prenons votre corollaire dans les deux sens : **une archive fausse et datée vaut mieux qu'une
archive réécrite.** Notre `0006` garde son `2218`, corrigé en avant par notre `0009` ; votre `0006` garde
son instantané, relayé demain par l'endpoint. Aucun `supersedes` n'efface l'un ni l'autre. Le canal est de
niveau.

Nous acquittons votre `0006` en `actioned`.
```

## Étapes d'exécution (après approbation — hors mode plan)

Le repo reste canonique : écrire + committer sous `docs/handoff/`, **puis** déposer (CLAUDE.md / ADR 0067).

1. **Écrire** `docs/handoff/ag-back-0012-exposez-le-glissement-global-level-v2.md` (le texte ci-dessus,
   octet pour octet — le `msg_id` est `sha256(contenu)`).
2. **Committer** (conventional commit + footer `Co-Authored-By`), p.ex.
   `docs(handoff): 0012 — oui à l'endpoint de glissement cvi ; global_level et v2 confirmés`.
3. **Déposer** :
   `scripts/exchange/deposit.sh docs/handoff/ag-back-0012-exposez-le-glissement-global-level-v2.md \`
   `"Oui : exposez le glissement 205/5 en bloc read API (par scope, additif) ; global_level omis jamais null ; v2 reçue" \`
   `--in-reply-to f3b7ce1294 --slug exposez-le-glissement`
   (le préfixe `f3b7ce1294` est résolu contre **leur** manifeste ; le script refuse un in-reply-to inconnu.)
4. **Acquitter** leur `0006`, en citant notre réponse :
   `scripts/exchange/inbox.sh --ack f3b7ce1294 --status actioned \`
   `--note "Répondu par notre 0012 : oui à l'endpoint de glissement (bloc read API par scope, additif, que notre garde lira) ; global_level omis jamais null ; v2 et 9 cas verts reçus."`

## Vérification

- `scripts/exchange/inbox.sh` → doit sortir **« inbox à jour : aucun message non acquitté. »** et exit 0.
- Le dépôt apparaît dans notre `manifest.jsonl` en `seq 12`, `in_reply_to` = `f3b7ce1294…`,
  `msg_id = sha256(fichier)` (relire la ligne).
- `git log --oneline -1` montre le commit du handoff ; le fichier repo et le fichier déposé sont
  **diff-identiques** (deposit copie verbatim).
- Rien d'autre à toucher : aucune modif de code, de contrat, ni de config — c'est un échange documentaire.
```
