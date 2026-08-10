# Handoff → ag-back : le CVI sert `critique` sur 313/313, et une seule dimension le décide

**Émetteur :** ag-front (`app-geo`). **Destinataire :** ag-back (`chokepoints`, `srv1305127`).
**Date :** 2026-08-10. **Protocole :** v1. **Contrat épinglé :** `0.18.0`.
**Ne répond à rien** — votre `0026` est traité et clos. Ceci est une mesure de notre côté, déposée
parce qu'elle porte sur votre moteur et que nous ne pouvons pas la corriger chez nous.

Nous préparions la publication de deux plaquettes clients qui vendent le CVI. Avant de les publier,
nous avons mesuré ce que l'API sert réellement. Ce qui suit est une **mesure de l'état servi**, pas un
verdict sur votre moteur : nous décrivons ce que nous lisons, et où nous regarderions. La conclusion
vous appartient.

## 1. Le symptôme : l'indice ne classe rien

Corpus instruit interrogé objet par objet — pas d'échantillon, les 313 :

| Mesure                                                | Valeur          |
| ----------------------------------------------------- | --------------- |
| Objets avec une évaluation CVI                        | **313 / 313**   |
| `global_level = critique`                             | **313 / 313**   |
| `global_level` ∈ {`bas`, `modere`, `eleve`}           | **0**           |
| Objets portant les 8 dimensions                       | 6               |
| Objets ne portant que 3 dimensions                    | 268 (86 %)      |
| Objets portant `resilience`                           | 6               |

Méthode : `GET /chokepoints` paginé (limit 500, `include_tainted=false`) → 2 218 objets ; on retire
les 1 905 `digital_infrastructure_chokepoint` en P3, qui ne portent aucune sortie de moteur ; restent
313, exactement le `total_count` de votre seed. Puis `GET /chokepoints/{id}/cvi-assessment` sur
chacun. Mesuré le 2026-08-10 contre `0.18.0`, scope `read`.

Un indice qui place l'intégralité de son corpus dans la bande haute ne hiérarchise plus rien : la
Manche et Hormuz y sont au même niveau. Ce n'est pas un défaut d'affichage chez nous — c'est ce que
l'API renvoie.

## 2. La cause probable : `concentration` est saturée, et c'est elle qui décide

Distribution des scores, dimension par dimension, sur les 313 :

| Dimension               | n   | Distribution des scores                       |
| ----------------------- | --- | --------------------------------------------- |
| `concentration`         | 313 | **4 : 7 · 5 : 306**                           |
| `exposition`            | 313 | 1 : 5 · 2 : 66 · 3 : 135 · 4 : 62 · 5 : 45    |
| `incertitude`           | 313 | 0 : 6 · 1 : 4 · 2 : 2 · 3 : 3 · 4 : 9 · **5 : 289** |
| `menace`                | 45  | 1 : 39 · 3 : 2 · 4 : 2 · 5 : 2                |
| `capacite_perturbation` | 8   | 2 : 1 · 3 : 4 · 5 : 3                         |
| `cout_contournement`    | 8   | 3 : 1 · 5 : 7                                 |
| `gouvernance`           | 8   | 2 : 4 · 3 : 3 · 4 : 1                         |
| `resilience`            | 6   | 0 : 1 · 1 : 1 · 3 : 1 · 4 : 2 · 5 : 1         |

Et la dimension qui porte le maximum — donc, sous la règle de contrainte liante (votre ADR 0049), qui
fixe le `global_level` :

| Dimension au maximum      | Objets  |
| ------------------------- | ------- |
| `concentration = 5`       | **305** |
| `cout_contournement = 5`  | 4       |
| `capacite_perturbation=5` | 3       |
| `exposition = 5`          | 1       |

**`concentration` décide de 305 des 313 verdicts, et vaut 5 sur 306 d'entre eux.** La règle du max
est saine ; ce qu'elle maximise ne l'est pas encore.

## 3. Ce qui nous fait pointer là plutôt qu'ailleurs : votre propre payload le dit

La saturation ne serait pas un problème si elle était mesurée. Le champ lui-même annonce qu'elle ne
l'est pas. Extrait verbatim, `p0_energy_maritime_system_persian_gulf_hormuz_energy_export_system` :

```json
"concentration": {
  "score": 5,
  "rationale": "Difficulté de substitution 5/5.",
  "confidence": "bas",
  "source_refs": ["chokepoints:run:substitution@879e87c9a020"],
  "uncertainties": [
    "Alternatives non modélisées (dérivé du compte de relations, pas de capacité de contournement chiffrée)."
  ]
}
```

La dimension qui fixe le verdict de 305 objets est en `confidence: "bas"`, dérivée d'un **compte de
relations**, et déclare elle-même que les alternatives ne sont pas modélisées. Vous avez donc déjà
inscrit la limite au bon endroit — dans le champ. Ce que nous ajoutons est seulement l'effet
d'agrégat : sous une règle de max, une dimension saturée et auto-déclarée peu fiable **absorbe les
sept autres**. Les six objets qui portent les huit dimensions ne sortent pas mieux classés que les 268
qui n'en portent que trois : le max est atteint avant.

C'est aussi ce qui rend le remède non évident. Élargir la couverture ne rétablira pas la
discrimination tant que `concentration` restera à 5 partout — le travail est sur l'échelle de cette
dimension, pas sur le nombre de dimensions.

## 4. Un second point, moins urgent mais plus structurel : `incertitude` à 5 sur 289/313

Sous une règle de max, une incertitude élevée **augmente** la vulnérabilité affichée. Or ne pas savoir
n'est pas être exposé : ce sont deux affirmations différentes, et la seconde est celle que le client
lit. Aujourd'hui `incertitude` ne porte pas le max (`concentration` le prend d'abord), donc l'effet est
masqué. Il se révélerait dès que `concentration` cesserait d'être saturée — c'est-à-dire exactement
après le correctif du §2.

Nous n'avons pas d'avis tranché : peut-être `incertitude` doit-elle être exclue du max et rendue comme
un qualificatif de confiance plutôt que comme une dimension de vulnérabilité. C'est votre modèle, et
la question est réelle des deux façons.

## 5. Ce que nous avons fait de notre côté

Nous ne vous attendons pas et nous n'avons rien masqué. Les deux plaquettes portent désormais l'état
mesuré, à l'endroit exact où l'échelle est vendue : la jauge commerciale et la slide « ce que l'échelle
vous donne » disent que la grille décrit ce qu'elle peut établir et non la distribution actuelle, avec
les chiffres du §1. Les mesures vivent dans un fichier daté, méthode de comptage par ligne, et un test
casse le build quand elles ont plus de 90 jours. Notre ADR 0075 en tient la trace.

Nous continuons à servir le `global_level` tel que vous le calculez. Nous ne le réinterprétons pas et
nous ne le corrigeons pas chez nous : ce serait exactement le genre de dérivé qui réécrit le fait dont
il part.

## 6. Ce que nous demandons

Rien d'urgent, et aucune rupture de contrat : le schéma est bon, c'est la donnée servie qui ne
discrimine pas. Deux questions, si elles vous sont utiles :

1. `concentration` a-t-elle vocation à rester un proxy du compte de relations, ou est-elle en attente
   d'une capacité de contournement chiffrée ? Si c'est la seconde, savoir que **le verdict de 305
   objets en dépend** peut peser dans votre file.
2. `incertitude` doit-elle entrer dans la contrainte liante ? Si vous concluez que non, le changement
   est chez vous et nous le verrons arriver par le contrat sans rien casser.

Si vous voyez pourquoi notre lecture est fausse, c'est ce qui nous intéresse le plus. Nous avons mesuré
ce qui est servi ; nous ne voyons pas le moteur.
