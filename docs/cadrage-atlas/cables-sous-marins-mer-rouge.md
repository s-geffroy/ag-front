# Cadrage — Câbles sous-marins de la mer Rouge

- **Slug** : `cables-sous-marins-mer-rouge` · **Livrable** : `deliv_atlas_cables_mer_rouge_fiche`
- **Objet base** : `p2_submarine_cable_corridor_egypt_red_sea_mediterranean_cable_corridor`
  (**P2**, `digital_infrastructure_chokepoint` / `submarine_cable_corridor`)
- **Relevé base** : 2026-08-13 · **Statut** : à cadrer

## Limite à porter dès le cadrage : l'objet est P2

Comme pour le Trans-Caspien, `loadChokepoints()` ne charge que les P0 : **pas de page de base, pas
d'entrée d'index**. Aucun lien vers `/atlas/chokepoints/<id>` dans le corps.

## Thèse pressentie

Le même isthme porte deux dépendances sans rapport apparent — les navires et les données — et c'est la
seconde qui est la moins substituable. Un porte-conteneurs contourne par le Cap en payant deux
semaines ; un flux de données ne contourne pas l'Égypte à volonté, parce que les alternatives
terrestres et satellitaires n'ont ni la capacité ni la latence. Le corridor maritime le plus commenté
du monde est aussi, silencieusement, un goulot numérique.

À vérifier avant de l'écrire : la part réelle du trafic Europe–Asie transitant par l'Égypte, et
l'existence de routes alternatives (transsibérienne terrestre, contournement par le Cap, constellations
satellitaires). Si la substituabilité s'avère meilleure qu'annoncé, la thèse tombe — et on la change.

## Articulation avec `atlas/mer-rouge-suez.md`

La fiche mer Rouge existe et traite le corridor maritime. Celle-ci traite la **couche numérique** du
même isthme et doit s'y référer sans la répéter : pas de récit de la crise houthie, pas de primes
d'assurance, pas de trafic de conteneurs. Le point de contact utile est la **concentration
géographique** — deux dépendances hétérogènes sur le même segment de quelques centaines de kilomètres.

## Périmètre — et ce qu'on s'interdit

Les câbles, leurs atterrissages, la traversée terrestre égyptienne, la concentration des stations, et
la réparation. **On s'interdit** la cybersécurité au sens large, la souveraineté numérique comme
thème, et le sabotage attribué : les coupures documentées sont majoritairement accidentelles, et
l'attribution est précisément ce qu'on ne saura pas.

## Nœuds à décrire

Atterrissages égyptiens (façades Méditerranée et mer Rouge), la traversée terrestre entre les deux, les
stations d'atterrissage et leur concentration, la flotte de réparation
(`p3_infrastructure_chokepoint_submarine_cable_repair_fleet` est un objet distinct de la base — objet
voisin utile, à ne pas confondre avec celui de la fiche).

## Grandeurs à chiffrer

| Grandeur | Où la chercher | État |
| --- | --- | --- |
| Nombre de câbles empruntant l'isthme | TeleGeography, UIT via `pplx` | **absent de la base** |
| Part du trafic Europe–Asie concerné | TeleGeography | à réunir — **le chiffre central** |
| Délai moyen de réparation d'une coupure | opérateurs, UIT | à réunir |
| Nombre de stations d'atterrissage et leur exploitant | UIT, registres | à réunir — étaye `landing_station_concentration` |
| Incidents documentés et leur cause | UIT, presse spécialisée | à réunir ; distinguer accidentel / non établi |

## Ce que la base porte déjà (candidat, non validé)

Encore moins que pour le Trans-Caspien :

- **1 flux** : `submarine_data`, `qualitative_scored`, importance **2** (basse), confiance moyenne.
- **3 risques**, cotation identique 2/3/2, `baseline`, sans déclencheur : coupure de câble, risque
  géopolitique, concentration des stations d'atterrissage.
- **Aucune alternative, aucune métrique, aucun épisode.**

L'objet existe et donne un ancrage nommé ; tout le reste est à sourcer dehors.

## Angles morts connus d'avance

1. **L'importance déclarée du flux est basse (2/5)** alors que la thèse repose sur sa criticité. Deux
   lectures possibles — la base sous-cote, ou la thèse surestime. Trancher avec des sources, et si le
   doute persiste, écrire le désaccord avec la base plutôt que de le taire.
2. Les tracés précis et les propriétaires de câbles sont partiellement confidentiels : la fiche
   travaillera sur des données publiques incomplètes, à déclarer.
3. L'attribution des coupures est un piège : ne rapporter que ce qui est établi, et nommer ce qui ne
   l'est pas.
