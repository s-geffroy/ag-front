# Cadrage — Détroit de Singapour

- **Slug** : `singapour` · **Livrable** : `deliv_atlas_singapour_fiche` · **Objet base** :
  `p0_maritime_strait_singapore_strait` (P0, `maritime_chokepoint` / `maritime_strait`)
- **Relevé base** : 2026-08-13 · **Statut** : à cadrer

## Thèse pressentie

Singapour n'est pas un verrou qu'on ferme, c'est un corridor **saturé en permanence**. La base y place
le seul risque coté au maximum sur les trois axes — `congestion` probabilité 5, impact 5, vulnérabilité
5, sévérité **structurelle** — et un risque d'abordage à vulnérabilité 5. Autrement dit la défaillance
attendue n'est pas la fermeture par un acteur, c'est l'accident dans un trafic trop dense, et elle n'a
besoin de personne pour se produire.

## Frontière avec la fiche Malacca — à trancher ici, sinon les deux fiches se contrediront

`atlas/malacca.md` existe déjà, traite Malacca comme **le verrou énergétique** (volume de brut, absence
d'alternative de capacité) et mentionne le rétrécissement « devant Singapour ». La répartition retenue :

- **Malacca** = la dépendance de volume et la non-substituabilité énergétique.
- **Singapour** = la **densité** et le hub — conteneurs (importance 5, la plus haute du corridor),
  concentration de services portuaires, effet d'un incident local sur la chaîne.

Trois objets concurrents dans la base ; la fiche retient **le détroit** et le dit explicitement :
`p0_global_port_gateway_port_of_singapore` (le port) et
`p0_maritime_energy_trade_system_malacca_singapore_strait_system` (le système) ne sont pas l'objet.

## Périmètre — et ce qu'on s'interdit

Le détroit, sa densité, ses reports par Lombok et Sunda. **On s'interdit** la politique intérieure
singapourienne, la rivalité de hubs régionaux, et toute reprise du contenu de la fiche Malacca.

## Nœuds à décrire

Rail de navigation du détroit, rades et mouillages, terminaux de soutage, Lombok et Sunda comme
alternatives. Ne pas décrire le port lui-même au-delà de ce que sa défaillance fait au détroit.

## Grandeurs à chiffrer

| Grandeur | Où la chercher | État |
| --- | --- | --- |
| Transits/j, capacité DWT/j | base, `metrics` | **ABSENT — aucune métrique PortWatch sur cet objet**, contrairement aux trois autres fiches de la vague |
| Conteneurs, GNL | base | `qualitative_scored`, aucun volume → externe |
| Brut, produits raffinés | base | `derived_from_system` : **dérivés du système Malacca–Singapour, pas mesurés sur le détroit** — ne jamais les présenter comme une mesure du détroit |
| Trafic annuel de navires, tonnage | MPA Singapore via `pplx` | à réunir |
| Incidents et abordages | ReCAAP | à réunir (déjà utilisé par la fiche Malacca — vérifier qu'on ne recopie pas) |

## Ce que la base porte déjà (candidat, non validé)

- **Lombok** (`reroute_deltas`) : Océan Indien ↔ mer de Chine méridionale, conteneurs **+3,39 jours**,
  net **441 553 USD** ; Golfe ↔ Asie du Nord-Est brut **+2,86 j / 234 642 USD** ; GNL **+2,86 j /
  406 329 USD** ; vrac sec **+2,61 j / 143 697 USD**. Capacité d'absorption cotée **basse**.
- **Sunda** : moins profond, limites de navigation, report **partiel** seulement.
- **Transbordement régional** : « redistribue le débit au lieu de le remplacer » — formulation utile,
  à reprendre comme idée, pas à traduire mot à mot.
- **CVI** : `critique`, 7/7 dimensions, liante `exposition` en confiance moyenne.
- **Aucun épisode** ouvert ni clos.

## Angles morts connus d'avance

1. **Pas de métrique de débit** sur cet objet : la fiche ne pourra pas dire « X transits par jour »
   depuis la base. Soit une source externe la fournit, soit la fiche s'en passe et le déclare.
2. Deux des quatre flux sont dérivés d'un objet plus large. Les citer sans le préciser fabriquerait
   une mesure qui n'existe pas.
3. Le risque cyber portuaire est coté bas (probabilité 2) alors que c'est le sujet à la mode : ne pas
   surpondérer un risque parce qu'il est médiatique — et si on s'en écarte, dire pourquoi.
