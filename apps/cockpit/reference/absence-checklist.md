---
title: 'Une absence n''est pas une donnée — la vérification en trois questions'
summary: 'Version opérationnelle de l''ADR 0077 : quoi vérifier au moment de consommer un endpoint, de rendre une surface, ou de lire un tableau vide.'
updated: '2026-08-10'
order: 20
---

# Une absence n'est pas une donnée

Doctrine complète : **ADR 0077**. Ce document est sa version *au moment de faire* — l'ADR dit
pourquoi, celui-ci dit quoi vérifier.

La règle tient en une phrase : **par défaut, un lecteur lit une absence comme un fait rassurant.**
Un zéro, un tableau vide, un champ manquant se lisent « tout va bien » alors qu'ils veulent souvent
dire « personne n'a regardé ».

---

## Question 1 — Je consomme quelque chose d'amont

> Ce `0`, ce `[]`, ce `null` peut-il vouloir dire **deux choses** ?

- **Le contrat sait distinguer** → la distinction est obligatoire dans le code appelant. Elle ne se
  garde pas dans la tête de qui l'a écrit.
  _Exemple qui marche_ : sur `/news`, `count: 0` **avec** `run_id` = semaine calme ; **sans** = aucune
  agrégation n'a tourné. Le digest hebdomadaire crie sur le second et se contente de compter sur le
  premier.
- **Le contrat ne sait pas distinguer** → l'absence vaut **inconnu**, jamais « rien ». On ne conclut
  pas dessus, et on l'écrit là où ça se voit.
  _Exemple qui ne marche pas_ : la couche `episodes` ne dit pas si un corridor est calme ou si
  personne n'a ouvert d'épisode. Ormuz, restreint à plus de 90 % depuis cinq mois, n'y porte qu'un
  épisode clos en 2019.

**Et surtout : ne pas compenser par une heuristique locale.** La tentation était réelle sur Ormuz —
écrire un détecteur d'écart de métrique de notre côté. Refusé : une période par appel donc aucun
historique, et comparer entre objets ne veut rien dire (Malacca tourne légitimement deux ordres de
grandeur au-dessus d'un petit détroit). **Un trou visible vaut mieux qu'un faux positif silencieux.**
Le correctif appartient à qui détient la donnée ; on le signale (ADR 0067), on ne le simule pas.

## Question 2 — Je rends une surface publique

> Si personne n'alimente pendant trois mois, **qu'est-ce que cette page affirme ?**

- Une surface non alimentée **disparaît**. Elle ne se déclare pas calme.
- Aucune formule du type « aucune perturbation », « pas d'actualité », « rien à signaler ». Ce sont
  des **affirmations**, et ce sont exactement celles qui pourrissent.
- Une garde de rendu s'écrit « n'affiche rien si vide », jamais « affiche *rien à signaler* si vide ».

_En service_ : `/veille` et son entrée de nav quittent le build s'il n'y a aucune promotion ; la bande
d'accueil s'efface passé 21 jours ; une page légale à laquelle il manque un fait n'est pas construite.
Le bandeau de perturbation, lui, énonce sa propre limite plutôt que de se taire.

## Question 3 — Je produis une absence

> Est-elle **datée** ?

- **Store absent ≠ store vide.** Le premier dit que le dispositif n'a jamais tourné, le second qu'il a
  tourné et n'a rien retenu.
- Quand un état vide est légitime, il porte une date. `/veille` affiche « dernière revue éditoriale ».

**Une absence datée est une information. Une absence non datée n'en est pas une.**

---

## Où ça s'est déjà produit

| Cas | La distinction qui manquait |
| --- | --- |
| `cp_alpha` — fixture publiée comme un détroit réel | rien ne séparait un objet de démonstration d'un corridor |
| Épisodes d'Ormuz | « aucun épisode ouvert » vs « rien ne se passe » |
| Flux d'actualités | flux vide vs agrégation jamais lancée — **le seul des trois qui était résolu** |

Trois étages différents de la chaîne, la même forme. La prochaine sera ailleurs.

## Quand signaler à ag-back

Un signalement se dépose en nommant la **distinction manquante**, pas seulement la valeur fausse :
c'est la distinction qui se corrige une fois pour toutes. La piste suggérée dans les deux handoffs du
2026-08-10 est un marqueur de fraîcheur de couche (`…_reviewed_at`) — une absence datée d'hier est une
information ; une absence non datée n'en est pas une.
