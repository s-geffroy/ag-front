# Cadrage — Route du Cap de Bonne-Espérance

- **Slug** : `route-du-cap` · **Livrable** : `deliv_atlas_route_du_cap_fiche` · **Objet base** :
  `p0_maritime_passage_cape_of_good_hope_route` (P0, `maritime_chokepoint` / `maritime_passage`)
- **Relevé base** : 2026-08-13 · **Statut** : à cadrer

## Thèse pressentie

Le Cap n'est pas un chokepoint : c'est **le contournement des autres**, et il est en train d'en devenir
un. La base le dit de deux façons convergentes. Son risque dominant est `rerouting_congestion`
(probabilité 4, impact 4, vulnérabilité 4), et son déclencheur déclaré est `suez_red_sea_disruption` —
c'est-à-dire que sa vulnérabilité **est** la crise d'un autre corridor. Et son alternative principale
est « Suez / Bab el-Mandeb quand c'est sûr » : la substitution est **circulaire**, chacun des deux
corridors est déclaré comme le repli de l'autre. Quand les deux sont dégradés simultanément, la base
ne propose plus rien.

C'est aussi la route qui porte le plus gros débit en tonnage des quatre fiches de la vague : 5,38
millions de DWT/j pour 90 navires/j — soit des navires en moyenne bien plus gros qu'à Gibraltar
(130,5 navires/j pour 3,29 M DWT/j). À creuser : c'est cohérent avec un détour long-courrier, où seuls
les gros porteurs amortissent la distance.

## Périmètre — et ce qu'on s'interdit

La route comme capacité de report, son coût, et ce qui arrive quand elle sature. **On s'interdit** la
politique sud-africaine, l'économie portuaire régionale pour elle-même, et toute reprise du contenu de
`atlas/mer-rouge-suez.md`, qui traite la crise de la mer Rouge — ici on regarde **l'autre bout du
report**, pas sa cause.

## Nœuds à décrire

Le passage lui-même, les escales de soutage d'Afrique australe, et surtout la **relation** aux deux
corridors qu'il double (Suez/Bab el-Mandeb). Le nœud n'est pas géographique, il est fonctionnel : la
capacité de flotte immobilisée par l'allongement des rotations.

## Grandeurs à chiffrer

| Grandeur | Où la chercher | État |
| --- | --- | --- |
| Transits/j, capacité DWT/j | base, `metrics` (PortWatch 2026-08) | **disponible** : 90,0 navires/j, 5 381 713 DWT/j |
| Conteneurs, brut, vrac sec, GNL | base | `qualitative_scored`, aucun volume → externe |
| Allongement de rotation Asie–Europe par le Cap | UNCTAD / armateurs via `pplx` | à réunir |
| Effet de flotte : navires supplémentaires nécessaires à service constant | UNCTAD, analyse secondaire | à réunir — **c'est le chiffre qui fait la fiche** |
| Historique du débit avant / pendant la crise mer Rouge | PortWatch | à réunir |

## Ce que la base porte déjà (candidat, non validé)

- **Épisode `red_sea_houthi_crisis_2024`, statut `ongoing`, sévérité haute** — le seul épisode ouvert
  des quatre corridors de la vague. La fiche est donc écrite sur un corridor en régime perturbé, et
  doit dater ses constats.
- **Alternatives** : « Suez / Bab el-Mandeb quand c'est sûr » (coût, temps et capacité **bas**,
  faisabilité **haute**) ; « ponts multimodaux limités » (aérien/ferroviaire de niche, part négligeable).
  Aucun `reroute_deltas` chiffré sur cet objet.
- **Risques** : `rerouting_congestion` 4/4/4 **élevé** ; `weather` 3/3/3 **structurel** ;
  `piracy_regional_spillover` 2/3/3 baseline.
- **CVI** : `critique` mais **4 dimensions évaluées sur 7 seulement**, et la dimension liante est
  `cout_contournement` en **confiance basse** — le seul des huit corridors de l'Atlas dont la dimension
  liante n'est pas `exposition`.

## Angles morts connus d'avance

1. **La couverture CVI est incomplète (4/7)** et sa dimension liante est en confiance basse. Toute
   affirmation adossée au CVI sur ce corridor doit porter cette réserve — c'est l'angle honnête, et
   c'est aussi ce qui distingue cette fiche des trois autres.
2. Aucun `reroute_deltas` : contrairement à Panama, Singapour et Gibraltar, la base ne chiffre pas le
   détour **depuis** le Cap. Normal — le Cap *est* le détour — mais cela veut dire qu'il n'y a pas de
   sortie chiffrée si la route sature.
3. La circularité des alternatives (Cap ↔ Suez) est un constat de structure, pas un défaut de la base.
   À présenter comme tel, sans en faire un reproche au producteur.
