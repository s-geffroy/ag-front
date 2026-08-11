# Handoff → ag-back : l'agrégation d'actualités, vue depuis un usage quotidien

**Émetteur :** ag-front (`app-geo`). **Destinataire :** ag-back (`chokepoints`, `srv1305127`).
**Date :** 2026-08-11. **Protocole :** v2. **Contrat épinglé :** `0.18.0`.
**Ne répond à rien.** Porte sur `aggregate_news`, `prompt_version: news-agg-0.2.0`,
`model: gpt-5.6-terra`.

Nous avons ouvert aujourd'hui la promotion d'actualités à un usage humain quotidien : un opérateur
choisit un sujet, lit les articles, écrit sa phrase, publie sur l'Atlas public. Quelques heures
d'usage réel ont produit quatre constats que la lecture de la spécification n'avait pas donnés.

**D'abord ce qui marche.** Vos regroupements *sont* des sujets, et bien formés. Sur Ormuz, le flux du
jour livre « L'Iran lie la réouverture du détroit à des concessions américaines », « Les marchés et
les prix du pétrole réagissent à l'incertitude », « Les Émirats accusent l'Iran d'avoir visé un
navire ADNOC ». Les intitulés sont factuels et attribués (« selon des médias », « Des médias
rapportent »). Nous les affichons désormais dans notre fenêtre de sélection — marqués comme venant
du modèle, jamais publiés (notre ADR 0078). Votre prose est donc entrée dans notre chaîne de
décision : sa qualité nous concerne maintenant directement, d'où ce message.

## 1. `cluster_id` survit-il d'une exécution à l'autre ? — la question bloquante

`run_id` vaut `aggregate_news@20260811T061535Z` : une exécution par jour. Nous ne pouvons pas
déterminer, depuis un seul instantané, si le `cluster_id` d'un sujet est **stable d'un jour au
suivant** ou régénéré à chaque passe.

Ce que ça décide chez nous : notre clé de dédoublonnage est `cluster_id`. Un sujet promu aujourd'hui
et re-promu demain **remplace** son entrée publique si l'identifiant tient, et la **duplique** s'il
change. Une crise qui dure — Ormuz en est à cinq mois — produirait alors autant d'entrées que de
jours.

Trois réponses nous vont, très différemment :

- **Il est stable** → nous n'avons rien à faire, dites-le simplement.
- **Il change à chaque passe** → nous avons besoin d'un identifiant qui, lui, ne change pas
  (`topic_id`), sans quoi la continuité d'un sujet est impossible côté consommateur.
- **Il est stable tant que le sujet reçoit des articles, puis se clôt** → dites-nous la règle de
  clôture ; c'est elle qui pilote notre comportement.

## 2. Une fuite de langue dans `run_notes`

```
"Agrégation candidate dérivée de titres בלבד ; les affirmations de contrôle, de déminage,
 d'ouverture ou de fermeture sont attribuées aux médias et acteurs cités."
```

`בלבד` est de l'hébreu — « seulement ». Le reste de la note est en français. Constaté sur les deux
exécutions du digest aujourd'hui, donc stable, pas accidentel.

Ce n'est pas cosmétique de notre côté : cette note **voyage jusqu'à Slack**, sous les yeux de la
personne qui décide de publier. Nous transportons vos `run_notes` intégralement et volontairement —
c'est ce qui empêche une liste bien rangée de passer pour la couverture complète de la période.
Autrement dit, nous montrons vos avertissements à un humain, et l'un d'eux est illisible pour lui.

## 3. La granularité est irrégulière, et nous ne pouvons pas la corriger

Sur un même corridor, le même jour : **220 articles** dans un regroupement, **1** dans un autre. Et
plusieurs sujets sont les facettes d'une même négociation — « L'Iran lie la réouverture à des
concessions » (220 art.), « Trump exige une compensation » (73), « L'Iran et l'Allemagne discutent
des voies de désescalade » (9).

Nous avons cherché à les rapprocher **sans sémantique**, et c'est mesurément impossible :

| Signal testé | Résultat sur les 15 regroupements d'Ormuz |
| --- | --- |
| Articles partagés entre deux regroupements | **0 sur 105 paires** — la partition est disjointe |
| Médias communs | 29 paires, mais « négociation » et « marchés » en partagent 7 : c'est du bruit |
| Recouvrement des fenêtres | toutes se recouvrent, aucun pouvoir discriminant |

Seul le **sens** des intitulés permettrait le rapprochement. Nous ne le ferons pas ici : ce serait un
second modèle refaisant votre travail, sans le `model` / `prompt_version` qui rend le vôtre traçable,
et nous porterions une interprétation non versionnée. C'est notre règle (ADR 0077) et elle vaut aussi
contre nous-mêmes.

**Donc, si un niveau « thème » a du sens pour vous** — un `topic_id` parent regroupant les facettes
d'une même affaire — c'est chez vous qu'il doit naître. Si vous jugez que non, dites-le : nous
resterons à votre granularité, qui est déjà exploitable.

## 4. `salience_score` : quelle est sa sémantique exacte ?

Nous venons de commencer à l'utiliser et il s'avère **précieux**, précisément parce qu'il ne mesure
pas ce que mesure l'écho médiatique :

| saillance | médias distincts | sujet |
| --- | --- | --- |
| 0.90 | 199 | L'Iran lie la réouverture à des concessions américaines |
| 0.90 | **3** | Le trafic maritime tombe à six navires |
| 0.88 | **4** | Les Émirats accusent l'Iran d'avoir visé un navire ADNOC |

Les deux derniers sont, pour une plateforme de vulnérabilité des corridors, **les faits les plus
décisionnels du jour** — et ils sont quasiment absents de la presse. Un classement par écho seul les
enterrait. Nous réservons désormais des places à ces cas dans notre fenêtre de promotion.

Trois questions, dans l'ordre d'utilité :

1. **Que mesure ce score ?** Importance opérationnelle estimée, intensité de couverture attendue,
   confiance du modèle dans le regroupement ? Nous en faisons aujourd'hui la première lecture, et
   nous aimerions savoir si c'est la bonne.
2. **Est-il comparable entre corridors** ou seulement à l'intérieur d'un même corridor / d'une même
   passe ?
3. **Est-il stable** d'une exécution à l'autre pour un sujet inchangé, ou re-tiré à chaque fois ?

Nous ne le fondons pas avec l'écho dans un score unique : un jugement de modèle et une mesure ne
s'additionnent pas sans fabriquer un troisième nombre qui n'est ni l'un ni l'autre. Mais pour
l'afficher honnêtement, il faut savoir ce qu'il dit.

## Rappel de ce qui reste ouvert par ailleurs

Le pays d'un média (notre `0030`) est le cinquième point, déjà déposé. Il pèse sur le même écran :
c'est la seule des trois dimensions demandées par notre opérateur — combien de médias, combien de
pays, quelle importance — que nous ne pouvons pas servir.
