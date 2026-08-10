# 0074 — Fermer deux angles morts : le jugement sur titres, et l'indépendance des marchés

- **Statut :** accepté
- **Date :** 2026-08-10
- **Contexte connexe :** ADR 0071 (consensus + news promue sur l'Atlas public), 0072 (plancher de
  cardinalité, amendé le même jour), 0046 (traçabilité de la validation humaine), 0042 (couverture ≠
  incident). Côté producteur : leur ADR 0087. Handoffs : leur `0026` §5 et §6, notre réponse `0024`.

## Contexte

Deux défauts sont restés ouverts à la fin de l'échange `0026`. Les deux avaient été **reconnus des deux
côtés sans correctif annoncé**, ce qui est mieux que de les découvrir une troisième fois mais ne les
ferme pas. Ils n'ont rien en commun sauf cela, et ce document les traite séparément.

---

## Défaut 1 — nos portes de promotion éditoriale jugeaient sur des titres

### Ce qui se passait

Le flux de promotion (ADR 0071) fonctionnait ainsi : ag-back regroupe des articles et en dérive, **par
modèle**, un `headline` et un `summary_text`. Un opérateur ouvrait le cockpit, voyait ce titre et les
titres des articles, cliquait, confirmait une boîte de dialogue. `PromotedNewsBlock.astro` affichait
ensuite le `headline` du modèle **en tête de bloc, en `font-medium`** — la phrase la plus visible de la
section.

Personne n'avait lu un article. Le titre du modèle est un résumé de titres : un artefact de second
rang, qui ajoute une affirmation sans ajouter une source. Et il était validé par quelqu'un qui disposait
exactement des mêmes titres.

Nous avions écrit ce reproche à ag-back à propos de leur juge de rattachement. Ils nous l'ont retourné
au §5 de leur `0026`, et il porte.

### La décision

**La prose du modèle n'est plus jamais publiée.** `headline` et `summary_text` restent stockés — ils
sont la trace de ce qui a été *proposé*, à mettre en regard de ce qu'un humain a écrit — et
`PromotedNewsBlock.astro` ne les rend plus.

**Une phrase humaine devient obligatoire.** `PromotedNewsItem.editorial_note` est `z.string().min(1)` :
une promotion sans phrase **ne parse pas**, donc ne s'écrit pas. La garde est le schéma, pas l'interface
— un autre appelant se heurte au même refus, et un test le vérifie.

Le bloc public ne porte donc plus que deux sortes de texte, et les deux sont défendables : les **titres
d'articles**, qui sont les mots des éditeurs, attribués et liés ; et **une ligne signée** de son auteur,
affichée avec son nom.

### Pourquoi une phrase plutôt qu'une case à cocher

Une case à cocher « j'ai lu les articles » est une déclaration invérifiable, et tout le monde la coche.
Écrire une phrase est le plus petit acte qui **ne peut pas être accompli sans s'être fait une opinion**.
Un promoteur qui n'a rien à dire d'un cluster le découvre en essayant d'écrire la ligne — et c'est
précisément le moment où la décision devait être reconsidérée.

Ce n'est pas une garantie qu'un article a été lu. C'est le retrait de la seule chose qui rendait le
non-lecture *confortable* : un titre déjà rédigé, qu'il suffisait d'approuver.

---

## Défaut 2 — le plancher compte les marchés, pas les questions

### Ce qui se passait

Le plancher de cardinalité (ADR 0072, leur 0087) refuse une famille adossée à un seul marché : une
cotation sous un nom pluriel n'est pas un agrégat. Mais c'est un plancher sur **combien**, et ils
l'écrivent au §6 de leur `0026` : deux marchés du même auteur, sur des questions quasi identiques, le
franchissent. **Compter n'est pas corroborer.**

### Ce que nous ne pouvons pas faire

Le point d’accès public `/chokepoints/{id}/prediction-consensus` sert des totaux : `market_count`,
`consensus_probability`, `total_liquidity`. **Pas les questions, pas les auteurs.** Aucune mesure
d'indépendance n'est possible depuis la surface qui alimente la page. Nous ne demandons pas de champ
supplémentaire aujourd'hui : ils n'ont pas de correctif à annoncer, et réclamer une donnée pour une
mesure que nous n'avons pas encore su définir serait prématuré.

### Ce que nous faisons à la place

**Sur la surface interne, la duplication est mesurable.** `/chokepoints/{id}/perception-signals`
(`read_tainted`, donc cockpit uniquement) sert chaque marché brut avec son `market_question`.
`packages/chokepoints/src/independence.ts` en tire une mesure :

- `questionFingerprint` — minuscules, sans accents ni ponctuation, mots vides retirés, tokens
  dédupliqués **et triés**. L'ordre des mots est exactement la différence qu'il faut cesser de voir :
  « Will X close before Y? » et « Before Y, will X close? » sont une question posée deux fois.
- `familyQuestionDiversity` — par famille : nombre de marchés, nombre de **questions distinctes** après
  regroupement (Jaccard ≥ 0,8, lien simple), taille du plus gros groupe de doublons, et le nombre de
  lignes dont la question ne nous a pas été servie.
- `familyPluralitySurvivesDeduplication` — le même seuil que le plancher de publication, appliqué aux
  questions distinctes au lieu des lignes.

Le `PerceptionPanel` du cockpit affiche un badge quand une famille ne survit pas à la déduplication.
C'est là que la décision se prend, et c'est la seule surface qui dispose de la donnée.

**Sur la page publique**, ce que nous pouvons corriger est le texte : la légende dit désormais que le
nombre de marchés indique une pluralité de cotations, **pas leur indépendance**, et que deux marchés
proches du même auteur y comptent pour deux.

### Ce que la mesure ne fait pas, et le test qui l'inscrit

Elle attrape une **reformulation**, pas une **paraphrase**. « fall » et « collapse » ne partagent aucun
token : la mesure y lit deux questions là où un humain en lit une. Un test épingle ce cas
nommément — pas pour célébrer la limite, mais pour que quiconque durcira le seuil découvre ce qu'il
casse.

Et elle ne dit **rien de l'auteur**. Deux questions réellement distinctes peuvent venir d'une seule
personne avec une seule thèse. Nous n'avons pas de champ auteur et nous ne prétendons pas en déduire un.
La fonction s'appelle donc `familyQuestionDiversity` et non `independence` : nommer une mesure d'après
ce qu'elle mesure plutôt que d'après ce qu'on voudrait qu'elle prouve est toute la discipline ici.

## Conséquences

- Le seuil de similarité est choisi **haut** (0,8) : sous-estimer une pluralité réelle est l'erreur
  qu'on peut se permettre ; laisser passer un doublon pour de la pluralité ne l'est pas.
- La mesure ne garde **rien** automatiquement. Elle informe un humain sur une surface interne ; le bloc
  public est construit depuis la surface claire, qui ne porte pas les questions. Un jour où cela
  changerait, la garde pourrait devenir automatique — pas avant.
- Le `headline` du modèle reste dans `promoted-news.json`, donc dans un fichier versionné que le site
  lit au build. Il n'est pas rendu ; il n'est pas non plus secret. C'est un compromis assumé : la trace
  de ce que le modèle a proposé vaut plus que la propreté du fichier.
- Aucun des deux correctifs ne change le statut des chiffres : une couverture média reste une
  **couverture**, jamais un incident confirmé (ADR 0042), et un consensus de marché reste une
  anticipation de foule, S5, **candidat en attente de validation humaine**.
