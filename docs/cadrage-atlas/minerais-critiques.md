# Cadrage — Corridor des minerais critiques

- **Slug** : `minerais-critiques` · **Livrable** : `deliv_atlas_minerais_critiques_fiche`
- **Objet base** : `sfu_critical_minerals_v1` — une **unité de flux stratégique (SFU)**, pas un
  chokepoint. Lue par `GET /strategic-flows/{id}/fiche`.
- **Relevé base** : 2026-08-21 · **Statut** : à cadrer (dégelée)

## Pourquoi cette fiche était gelée, et ce qui l'a dégelée

Nous l'avions gelée le 2026-08-13 faute d'objet-corridor : les 32 objets `critical_supply_chokepoint`
sont **tous** des sites de production ou de raffinage, et le versant acheminement n'existait pas.
Leur `0039` a confirmé le refus. **Leur `0040`, une heure plus tard, l'a retiré** : ils avaient cherché
dans `canonical.chokepoint`, comme nous, alors que l'unité qui porte un corridor chez eux **n'est pas
un chokepoint**. C'est la SFU, servie sur `/strategic-flows` — depuis la 0.7.0, soit bien avant la
version que nous épinglions.

La leçon est pour nous autant que pour eux : nous avons cherché un corridor dans la seule ressource
dont nous connaissions le nom, et conclu à l'absence d'un objet depuis l'absence d'une **famille**.

## Pas de `chokepoint_id`, et c'est délibéré

Notre modèle de fiche n'a **aucune clef de jointure vers une SFU** : `chokepoint_id` joint un objet de
`canonical.chokepoint`, rien d'autre. Ancrer cette fiche sur l'un des six nœuds serait un ancrage
approximatif — et ils nous l'ont explicitement refusé : *« nous ne vous donnerons pas Ganzhou comme
point d'ancrage d'un corridor : vous avez décrit précisément ce que ça produirait chez vous — des blocs
vides, sans erreur »*. La fiche part donc **sans clef de jointure**, et cite ses nœuds par leur nom.

Conséquence à porter dans le squelette : ni bloc consensus, ni actualité promue, ni page de base liée.

## Thèse pressentie

**La contrainte n'est pas la mine, c'est la séparation.** La route primaire de la SFU le dit dans sa
propre description — *« the binding refining stage rather than the mine »* : Bayan Obo extrait,
Ganzhou sépare, et c'est Ganzhou qui contraint. Un corridor de minerais critiques ne se décrit donc
pas comme une route mais comme un **étranglement d'étape** : le minerai a plusieurs origines, le
raffinage n'en a presque qu'une.

À vérifier avant d'écrire : que la substituabilité de la route alternative (`partial`, cotée par le
moteur et non par un analyste) tienne sur des sources externes. Une qualité de substitution
automatique n'est pas une démonstration.

## Périmètre — et ce qu'on s'interdit

Les terres rares et les intrants batteries/PGM, de l'extraction au produit raffiné, et la dépendance
sectorielle qui en découle. **On s'interdit** : la guerre commerciale sino-américaine comme sujet,
la prospective sur les prix, et toute affirmation sur des capacités de raffinage hors Chine sans
source primaire — c'est le point où la littérature est la plus militante.

## Nœuds à décrire

| Nœud | Rôle dans la SFU |
| --- | --- |
| `p1_critical_supply_chokepoint_bayan_obo_rare_earths` | extraction, route primaire |
| `p1_critical_supply_chokepoint_ganzhou_rare_earth_processing` | **séparation — l'étape liante** |
| `p1_critical_supply_chokepoint_sulawesi_nickel_indonesia` | nickel, route alternative |
| `p1_critical_supply_chokepoint_drc_copperbelt_cobalt` | cobalt, route alternative |
| `p1_critical_supply_chokepoint_bushveld_pgm_south_africa` | PGM, route alternative |
| `p1_critical_supply_chokepoint_atacama_lithium_chile` | lithium, route alternative |

## Grandeurs à chiffrer

| Grandeur | Où la chercher | État |
| --- | --- | --- |
| Part chinoise de la **séparation** des terres rares (≠ extraction) | USGS, AIE, JOGMEC via `pplx` | **absente de la base** — externe obligatoire |
| Capacités de séparation hors Chine, mises en service et dates | rapports d'exploitants, AIE | à réunir ; distinguer annoncé / opérationnel |
| Volumes par nœud | base, `metrics` | à relever nœud par nœud |
| Politique d'export indonésienne du nickel | acteur `actor_state_indonesia`, attribution **confirmée** en base | ancrage disponible |
| Exposition sectorielle | SFU, `value_chain` | batteries `high`, défense `high`, aimants éolien/VE `high`, catalyseurs `medium_high` |

## Ce que la base porte déjà (candidat, non validé)

- **2 routes, 6 nœuds** : primaire `route_rare_earth_processing` (Bayan Obo → Ganzhou), alternative
  `route_battery_and_pgm_inputs` en `substitution_quality: partial`.
- **Scoring : 3 dimensions sur 10**, toutes `engine_auto`, **aucune cotation d'analyste** —
  `chokepoint_exposure` 4,8 · `strategic_criticality` 5,0 · `substitution_difficulty` 5,0.
- **Statut `scoped`, aucune fiche rédigée, aucun verdict** : `awaiting_analyst_verdict: true`.
- **Un seul acteur canonique** : l'Indonésie. Les juridictions chinoise, congolaise, sud-africaine et
  chilienne sont **laissées de côté plutôt qu'inventées** — leur mot, et c'est le bon choix.
- Réserve portée par l'objet lui-même : le moteur `control_concentration` **ne couvre aucun** de ces
  nœuds d'approvisionnement.

## Angles morts connus d'avance

1. **Trois dimensions sur dix, toutes automatiques.** Les scores 4,8 / 5,0 / 5,0 ne sont pas un
   jugement : ils sont ce qu'un moteur calcule sur une couverture partielle. Ne pas les citer comme
   une évaluation, ni en déduire un niveau.
2. **Aucun acteur de contrôle pour la Chine**, alors que la thèse porte sur la concentration du
   raffinage chinois. Le trou est déclaré en base ; il devra être comblé par des sources externes et
   attribué comme tel, jamais présenté comme un relevé.
3. **`substitution_quality: partial` est une cotation moteur.** La fiche ne peut pas s'appuyer dessus
   pour affirmer qu'une alternative existe : c'est précisément la question à instruire.
