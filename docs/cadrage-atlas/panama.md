# Cadrage — Canal de Panama

- **Slug** : `panama` · **Livrable** : `deliv_atlas_panama_fiche` · **Objet base** :
  `p0_maritime_canal_panama_canal` (P0, `maritime_chokepoint` / `maritime_canal`)
- **Relevé base** : 2026-08-13 · **Statut** : à cadrer

## Thèse pressentie

Le facteur limitant de Panama n'est pas politique, il est **hydrologique** : le canal est un escalier
d'eau douce alimenté par un lac, et sa capacité se règle sur la pluie. La base classe `drought` et
`water_level_restriction` au même niveau que ses risques les plus lourds (probabilité 4, impact 5,
vulnérabilité 5), très au-dessus de la congestion. Corollaire à tenir : le contournement principal
déclaré est **Suez**, c'est-à-dire un corridor lui-même sous crise — se détourner de Panama ne réduit
pas l'exposition, cela la **déplace** vers la mer Rouge.

À vérifier avant de l'écrire : que la restriction de tirant d'eau soit bien le mécanisme de rationnement,
et non une conséquence d'une file d'attente.

## Périmètre — et ce qu'on s'interdit

Le canal, ses restrictions de transit, et le report vers Suez / Cap Horn / landbridge ferroviaire
américain. **On s'interdit** la politique intérieure panaméenne, la question de la souveraineté du
canal, et le débat sur les concessions portuaires : ce sont d'autres sujets, ils feraient dériver la
fiche hors du modèle corridor.

Ne pas traiter ici l'objet `p0_maritime_canal_system_panama_caribbean_interoceanic_system` (l'agrégat
système) : la fiche porte sur le canal.

## Nœuds à décrire

Écluses (Gatún, Pedro Miguel, Miraflores), lac Gatún comme réservoir, écluses néopanamax, et les deux
façades océaniques. Le lac est le nœud réel — c'est lui qu'il faut placer au centre, pas les écluses.

## Grandeurs à chiffrer

| Grandeur | Où la chercher | État |
| --- | --- | --- |
| Transits/j et capacité DWT/j | base, `metrics` (PortWatch, période 2026-08) | **disponible** : 30,0 navires/j et 740 642 DWT/j |
| Céréales | base, `flows.grain` | **disponible** : 25,1 Mt, **exercice fiscal ACP 2025 — pas l'année civile** |
| Conteneurs, vrac sec, GNL, GPL | base | **absent** : `qualitative_scored`, aucun volume → source externe obligatoire |
| Tirant d'eau maximal autorisé et son historique | ACP (autorité du canal) via `pplx` | à réunir |
| Nombre de créneaux journaliers en régime restreint vs normal | ACP | à réunir |
| Niveau du lac Gatún et seuil de restriction | ACP / IMF PortWatch | à réunir |

Requête de rappel :
`curl -H "Authorization: Bearer $CHOKEPOINTS_TOKEN" "$API_BASE/chokepoints/p0_maritime_canal_panama_canal"`

## Ce que la base porte déjà (candidat, non validé)

- **Alternatives chiffrées** (`reroute_deltas`) — c'est le matériau le plus fort de la fiche :
  - Suez pour Asie ↔ côte Est US, conteneurs : **+4,52 jours**, surcoût net **787 252 USD**
  - Suez pour Golfe US ↔ Asie de l'Est, vrac sec : **+8,64 jours**, net **574 999 USD**
  - Suez pour Golfe US ↔ Asie de l'Est, GNL : **+8,64 jours**, net **1 426 398 USD**
  - Cap Horn / détroit de Magellan : coût, temps et capacité tous « élevés », faisabilité **basse**
  - Landbridge ferroviaire américain : n'absorbe qu'une petite part du flux conteneurisé
- **Épisode** `panama_drought_2023_2024`, statut **terminé**, sévérité haute — la fiche peut s'y adosser
  comme précédent documenté, à condition de dire qu'il est clos.
- **CVI** : `critique`, 7/7 dimensions évaluées, dimension liante **`capacite_perturbation`** motivée
  par une concentration de contrôle **HHI ≈ 100/100 sur un seul acteur**
  (`actor_authority_panama_canal`). La base assortit elle-même ce score d'une réserve à reprendre :
  « capacité de perturbation **inférée** de la concentration de contrôle, pas d'une évaluation directe
  des moyens de l'acteur ».

## Angles morts connus d'avance

1. Quatre des cinq flux n'ont aucun volume dans la base. Sans source externe, la fiche décrit une
   hiérarchie d'importance, pas des magnitudes — le dire plutôt que de meubler.
2. Les `reroute_deltas` sont des `validation_status: candidate`. Ils se citent comme **ordres de
   grandeur déclarés par la base**, jamais comme des mesures.
3. L'exercice fiscal de l'ACP ne coïncide pas avec l'année civile : toute comparaison inter-annuelle
   avec une autre source est un piège.
