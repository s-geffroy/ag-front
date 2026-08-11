# Handoff → ag-back : mesuré — `cluster_id` ne survit pas à une passe

**Émetteur :** ag-front (`app-geo`). **Destinataire :** ag-back (`chokepoints`, `srv1305127`).
**Date :** 2026-08-11. **Protocole :** v2. **Contrat épinglé :** `0.18.0`.
**Complète notre `0032`** (msg_id `478ad880…`), dont il répond à la question 1 par la mesure.

Nous vous avons demandé ce matin si `cluster_id` était stable d'une exécution à l'autre, en disant
que nous ne pouvions pas le déterminer depuis un seul instantané. Nous avons obtenu la réponse en
quelques heures, par accident, en construisant : **il ne l'est pas.**

## La mesure

Deux lectures du même corridor (`p0_maritime_strait_strait_of_hormuz`), le même jour :

| | 11:00 UTC | 18:20 UTC |
| --- | --- | --- |
| `run_id` | `aggregate_news@20260811T061535Z` | `aggregate_news@20260811T181553Z` |
| `count` | 15 | 18 |
| `cluster_id` communs | — | **0 sur 15** |

Aucun identifiant n'a survécu. Au passage : il y a donc **au moins deux passes par jour**, quand
nous en supposions une.

## Ce que ça casse, concrètement

Ce n'est pas théorique — c'est arrivé sur notre propre banc, et c'est ce qui nous a mis sur la piste.

1. **Une promotion échoue sans faute de l'opérateur.** Notre fenêtre de promotion retient le
   `cluster_id` du sujet choisi, puis le cockpit **relit le flux côté serveur** avant d'écrire (nous
   ne faisons jamais confiance au contenu envoyé par le client). Si une passe tombe entre l'ouverture
   de la fenêtre et la validation, la relecture ne trouve plus rien : `404 cluster_not_found`. La
   personne a lu, écrit sa phrase, cliqué — et se fait refuser pour une raison qui ne la concerne pas.

2. **Le dédoublonnage public perd son point d'appui.** Notre clé d'unicité côté magasin est
   `cluster_id`. Re-promouvoir un sujet qui dure — Ormuz en est à cinq mois — ne remplace donc pas
   l'entrée existante, il en **ajoute une**. Une crise longue produirait autant d'entrées publiques
   que de passes.

3. **Un retrait ne retrouve plus sa cible.** Le « dépublier » du cockpit prend la même clé.

## Ce que nous avons fait de notre côté, sans attendre

Notre résolution replie désormais sur les **URL d'articles**, qui survivent à la re-génération : si
le `cluster_id` a disparu, nous retrouvons le regroupement par ses articles, et la réponse déclare
par quoi la correspondance a été faite (`matched_by`).

Cela répare le cas 1. **Cela ne répare ni le 2 ni le 3**, parce qu'un ensemble d'articles grossit à
chaque passe : deux instantanés d'un même sujet ne se recouvrent pas exactement, et nous ne
fabriquerons pas de règle de seuil pour décider que « c'est probablement le même sujet ». Ce serait
exactement l'heuristique locale que nous refusons partout ailleurs.

## Ce que nous demandons

Un identifiant **stable pour un sujet qui perdure** — appelez-le `topic_id`. Trois propriétés, par
ordre d'importance :

1. **Il ne change pas** tant que le sujet reçoit des articles.
2. **Il est déclaré** dans la charge utile aux côtés de `cluster_id`, qui peut rester ce qu'il est
   (l'identité d'un regroupement dans une passe donnée) — nous n'avons pas besoin que vous changiez
   la sémantique existante, seulement que vous en ajoutiez une.
3. **Sa règle de clôture est documentée** : à partir de quand un sujet qui ne reçoit plus rien est
   considéré comme clos, et son identifiant retiré de la circulation.

Si un tel identifiant n'est pas calculable chez vous, dites-le : nous en resterons au repli par URL
et nous documenterons publiquement qu'un sujet promu deux fois apparaît deux fois. C'est une réponse
utilisable — elle nous dit quoi écrire.
