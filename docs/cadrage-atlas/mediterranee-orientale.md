# Cadrage — Méditerranée orientale

- **Slug** : `mediterranee-orientale` · **Livrable** : `deliv_atlas_mediterranee_orientale_fiche`
- **Objet base** : `p1_maritime_route_system_eastern_mediterranean_system` (**P1**,
  `strategic_system` / `maritime_route_system`, macro-région `Eastern Mediterranean`)
- **Relevé base** : 2026-08-21 · **Statut** : à cadrer (dégelée)

## Pourquoi cette fiche était gelée, et ce qui l'a dégelée

Nous l'avions gelée le 2026-08-13 : aucun objet ne portait le bassin. Leur `0039` a confirmé, avec un
raisonnement que nous reprenons — *un bassin n'a pas de contournement, il a des sorties*. Puis leur
`0051` a mesuré que notre constat était **partiellement faux** : la macro-région `Eastern
Mediterranean` existait, avec trois objets (Le Pirée, canal de Corinthe, terminal de Ceyhan), et le
système stratégique `sys_eastern_mediterranean` aussi.

Ce qui manquait était plus précis que « rien » : **aucun objet ne représentait le bassin**, alors que
ce patron existe pour trois autres — mer Rouge–Bab el-Mandeb–Suez, golfe Persique–Ormuz,
Malacca–Singapour. Un trou dans une série, pas une catégorie absente. Ils l'ont comblé.

## La réserve, avant l'ancrage — elle conditionne toute la fiche

L'objet est `needs_source` / `not_validated`, et **ce n'est pas une formalité de cycle de vie** :
*aucune source de leur registre ne couvre spécifiquement la Méditerranée orientale.* Les quatre
sources citées (UNCTAD *Review of Maritime Transport*, avis ITU sur la résilience des câbles, EIA
*World Oil Transit Chokepoints*, East Mediterranean Gas Forum) portent les **flux qui traversent** le
bassin, pas le bassin comme unité d'analyse. Ses volumes sont nuls, ses scores qualitatifs.

Leur phrase mérite d'être citée dans la fiche elle-même : *« Nous aurions pu le qualifier `verified`
et vous n'y auriez vu que du feu. »* L'objet est un **ancrage stable et honnête** — son identifiant ne
bougera pas, son contenu est déclaré mince, et il le restera tant qu'une source propre au bassin
n'aura pas été trouvée. C'est exactement ce que nous demandions.

**Un angle mort de lecture, à connaître :** `GET /chokepoints/{id}` **ne sert aucun
`validation_status`** — le champ n'est pas au contrat pour cette ressource. La minceur de cet objet
n'est donc **pas lisible depuis l'objet** : elle nous a été dite dans un message. La fiche doit porter
la réserve en dur, elle ne peut pas la dériver.

## Thèse pressentie

**Un bassin ne se ferme pas, il s'enferme.** La Méditerranée orientale n'a pas de point de passage
propre : sa vulnérabilité est celle de ses **quatre sorties** — Suez au sud-est, les Détroits turcs au
nord-est, le canal de Sicile à l'ouest, Le Pirée comme porte d'éclatement — plus Gibraltar en amont.
Ce qui la rend intéressante n'est donc pas une contrainte de transit mais une **superposition** :
conteneurs, brut, gaz et données empruntent le même plan d'eau, et les quatre flux que la base cote
(4/3/4/4) le disent sans le vouloir.

À vérifier avant d'écrire : que cette superposition produise un effet propre, et non la somme
d'effets déjà décrits dans les fiches de Suez et des Détroits turcs. Si c'est une somme, la fiche
n'a pas de raison d'être et il faut le dire.

## Périmètre — et ce qu'on s'interdit

Le bassin comme lieu de superposition de flux, ses quatre sorties, et le risque d'escalade militaire
que la base est seule à coter. **On s'interdit** : le conflit israélo-palestinien comme sujet, les
différends de ZEE traités pour eux-mêmes, et **la somme des volumes des sorties** — ce serait
compter deux fois ce que Suez et les Détroits turcs portent déjà.

## Nœuds à décrire

| Nœud | Rôle |
| --- | --- |
| `p0_maritime_canal_suez_canal` | sortie sud-est, **P0** |
| `p1_maritime_strait_system_turkish_straits_system` | sortie nord-est |
| `p1_maritime_strait_strait_of_sicily` | sortie ouest |
| `p1_mediterranean_gateway_piraeus_port` | porte d'éclatement (identifiant inchangé, `type` passé de `mediterranean_gateway` à `port_gateway` en 2.3.0) |
| `p2_maritime_canal_corinth_canal` · `p2_oil_export_terminal_ceyhan_export_terminal` | membres du bassin, P2 |

## Grandeurs à chiffrer

| Grandeur | Où la chercher | État |
| --- | --- | --- |
| Trafic conteneurs du bassin | UNCTAD, autorités portuaires via `pplx` | **aucune métrique en base** — externe obligatoire |
| Gaz : production et routes d'export | EMGF, EIA | à réunir ; l'attribution EMGF est déjà exigée par l'objet |
| Câbles sous-marins traversant le bassin | avis ITU, opérateurs | à réunir ; recouvre notre fiche câbles mer Rouge — **délimiter** |
| Volumes des quatre sorties | fiches existantes | **ne pas sommer** |

## Ce que la base porte déjà (candidat, non validé)

- **4 flux**, tous sans quantification : `container_shipping` (4), `natural_gas` (4),
  `submarine_data` (4), `crude_oil` (3).
- **1 risque** : `military_escalation`. C'est tout.
- **Aucune alternative, aucune métrique, aucun épisode.**
- **4 attributions obligatoires** : `unctad_review_maritime_transport_2024`,
  `emgf_east_mediterranean_gas_forum`, `itu_submarine_cable_resilience_advisory`,
  `eia_world_oil_transit_chokepoints`.

## Angles morts connus d'avance

1. **L'objet est plus mince que les fiches de ses sorties.** Écrire le bassin en s'appuyant sur les
   chiffres de Suez reviendrait à écrire Suez. La fiche doit tenir sur ce que la superposition ajoute,
   ou ne pas exister.
2. **Un seul risque coté**, et c'est le plus politique. Ne pas en faire une hiérarchie de risques : il
   n'y a pas de second terme à comparer.
3. **La réserve `needs_source` n'est pas lisible depuis l'API.** Elle nous a été dite dans un message
   et doit être portée en dur dans la fiche ; si l'objet est un jour sourcé, rien ne nous préviendra.
