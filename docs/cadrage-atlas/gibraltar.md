# Cadrage — Détroit de Gibraltar

- **Slug** : `gibraltar` · **Livrable** : `deliv_atlas_gibraltar_fiche` · **Objet base** :
  `p0_maritime_strait_strait_of_gibraltar` (P0, `maritime_chokepoint` / `maritime_strait`)
- **Relevé base** : 2026-08-13 · **Statut** : à cadrer

## Thèse pressentie

Gibraltar est le seul corridor de la vague dont le flux le plus important **n'est pas commercial** :
`naval_access` y est coté 5, au-dessus des conteneurs, du brut, du vrac et du GNL. Et c'est le
corridor **le plus cher à contourner du corpus** — plus de trois semaines de détour — parce qu'il n'a
pas de substitut : on ne remplace pas l'accès Atlantique–Méditerranée, on renonce à la Méditerranée.
Un détroit dont on ne peut pas sortir par le contournement, seulement par l'abandon de la destination.

## Périmètre — et ce qu'on s'interdit

Le détroit comme porte d'accès (navale et commerciale) entre Atlantique et Méditerranée, et le coût
réel de son évitement. **On s'interdit** le contentieux de souveraineté hispano-britannique, la
question migratoire pour elle-même, et le commentaire sur les postures navales : la fiche décrit une
dépendance de passage, pas une situation diplomatique.

## Nœuds à décrire

Le rail de navigation, les deux rives et leurs ports de soutage/transbordement, la baie d'Algésiras
comme point de concentration de services. La Méditerranée elle-même comme destination captive.

## Grandeurs à chiffrer

| Grandeur | Où la chercher | État |
| --- | --- | --- |
| Transits/j, capacité DWT/j | base, `metrics` (PortWatch 2026-08) | **disponible** : 130,5 navires/j, 3 287 968 DWT/j — le plus haut compte de navires des quatre |
| **Tous** les flux (conteneurs, brut, vrac, GNL, accès naval) | base | **tous `qualitative_scored`, aucun volume, aucun** |
| Tonnage annuel du détroit | source externe indispensable | à réunir |
| Part du commerce européen dépendant du passage | Eurostat / CE via `pplx` | à réunir |

**Conséquence structurante : la fiche ne pourra afficher aucune magnitude de flux depuis la base.**
C'est à déclarer dans « Niveau de confiance », pas à combler par une estimation maison. Le compte de
navires PortWatch est la seule grandeur solide disponible — l'utiliser, et dire qu'il mesure un
passage, pas une valeur.

## Ce que la base porte déjà (candidat, non validé)

- **Cap de Bonne-Espérance** pour les seuls long-courriers pouvant éviter entièrement la Méditerranée
  (`reroute_deltas`) : Atlantique ↔ Méditerranée, conteneurs **+21,74 jours**, net **2 825 751 USD** ;
  brut **+21,74 j / 1 782 470 USD** ; GNL **+21,74 j / 3 086 721 USD**. Faisabilité **basse**. La base
  écrit elle-même qu'il n'y a **aucun substitut** à l'accès Atlantique–Méditerranée.
- **Substitutions terrestres/portuaires Europe–Afrique du Nord** : marginales, ne remplacent pas le
  débit du détroit.
- **Risques** : congestion (structurelle, 3/3/3), pression migratoire (structurelle, impact 2),
  escalade militaire (probabilité 2, impact 4, **baseline**).
- **CVI** : `critique`, 7/7 dimensions, liante `exposition` en confiance moyenne.
- **Aucun épisode**.

## Angles morts connus d'avance

1. Zéro volume dans la base : c'est la limite principale, elle doit être visible dans la fiche.
2. `naval_access` est un flux à importance 5 mais sans définition publique de ce qu'il mesure —
   demander la définition plutôt que l'interpréter, ou l'employer avec la réserve explicite.
3. Le détour à +21,74 jours est calculé pour des paires origine–destination qui **peuvent** éviter la
   Méditerranée. Il ne dit rien du coût pour un flux dont la destination *est* la Méditerranée — et
   c'est précisément ce cas qui fait la vulnérabilité. Ne pas présenter ce chiffre comme le coût du
   contournement en général.
