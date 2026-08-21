# Cadrage — Corridors GNL

- **Slug** : `gnl` · **Livrable** : `deliv_atlas_gnl_fiche`
- **Objet base** : **aucun, et c'est la réponse.** Le GNL se lit par `GET /chokepoints/by-flow/LNG` —
  une **coupe transversale** du corpus, pas un objet. Ancrage secondaire :
  `sfu_gulf_oil_lng_hormuz_v1` (P0), qui porte l'artère principale et elle seule.
- **Relevé base** : 2026-08-21 · **Statut** : à cadrer (dégelée)

## Pourquoi cette fiche était gelée, et ce qui l'a dégelée

Nous l'avions gelée le 2026-08-13 : nous ne voyions qu'**une seule** *lane* GNL et des grappes de
terminaux. Leur `0051` a corrigé le constat, mesure à l'appui — **29 objets portaient un flux `LNG`,
dont 15 en P0**. Nous n'en voyions qu'un parce que nous cherchions un objet **nommé** GNL.

Notre propre tableau du `0036` formulait pourtant l'hypothèse juste — *« ou votre avis que le GNL se
lit par `flow_type` et non par un objet dédié »*. Elle était bonne. Nous avons gelé la fiche en
attendant une confirmation d'un fait que nous avions déjà écrit.

## Pas de `chokepoint_id`, et c'est la thèse

Ancrer cette fiche sur Ormuz la ferait doubler `ormuz.md`. Ancrer sur un terminal ferait passer une
grappe pour un corridor. La fiche est une **coupe**, et son absence de clef de jointure est ce qu'elle
démontre : *le corridor GNL n'a pas de nœud à nommer, ses nœuds sont ceux des autres corridors*.

Conséquence à porter dans le squelette : ni bloc consensus, ni actualité promue, ni page de base liée.

## Thèse pressentie

**Le GNL n'est pas un corridor, c'est une cargaison — et sa vulnérabilité n'est pas celle du pétrole
qui l'accompagne.** Le point le plus dur est dans leur `0058` : **le GNL d'Ormuz n'a aucun
contournement**, là où le brut du Golfe en a deux (l'oléoduc Est-Ouest saoudien vers Yanbu, la conduite
d'Abou Dabi vers Fujairah). Ras Laffan n'a pas d'autre débouché maritime. À fermeture égale, la part
gazière est **intégralement** exposée quand la part pétrolière ne l'est qu'en partie.

C'est exactement l'asymétrie qu'un « taux de contournement » moyen du détroit efface — et c'est la
raison d'être de la fiche.

## Périmètre — et ce qu'on s'interdit

Les passages que le GNL emprunte, leur substituabilité **par cargaison** et non par corridor, et
l'asymétrie gaz/pétrole. **On s'interdit** : le marché du GNL et ses prix, la politique énergétique
européenne comme sujet, et toute somme de volumes entre objets — deux objets d'un même passage
produisent un double compte, et ils viennent d'en retirer deux pour cette raison (4.0.0).

## Nœuds à décrire

Les 15 P0 portant le flux `LNG`, dont l'importance sur ce flux est déjà cotée en base : Ormuz (5) et
le système énergétique golfe Persique–Ormuz (5) en tête, puis Malacca, Singapour, Panama, le système
Panama-Caraïbes, la mer de Chine méridionale et Taïwan (4), puis Suez, Gibraltar, le Cap, Luzon et le
système mer Rouge (3), Bab el-Mandeb (2).

À traiter à part, et **jamais comme des corridors** : les grappes de terminaux (Ras Laffan, Freeport,
regas nord-européen, hub Japon-Corée). Ce sont des terminaux, ils ne s'inscrivent pas dans notre
modèle de fiche, et l'amont refuse d'en faire des objets-corridors.

## Grandeurs à chiffrer

| Grandeur | Où la chercher | État |
| --- | --- | --- |
| Volumes GNL par passage | base, `metrics` | **omis plutôt que faux** : les prix GNL restent une fixture chez eux, les volumes ne sont donc pas valorisés (leur `0042`) |
| Part du GNL mondial transitant par Ormuz | AIE, GIIGNL, EIA via `pplx` | à réunir — externe obligatoire |
| Capacité des contournements pétroliers (Yanbu, Fujairah) | EIA *World Oil Transit Chokepoints* | à réunir ; sert à établir l'**asymétrie**, pas à la supposer |
| Absence de gazoduc de contournement d'Ormuz | affirmation de l'amont (`0058`) | **à re-sourcer nous-mêmes** : c'est le cœur de la thèse, il ne peut pas reposer sur une note de flux |
| `importance_score` sur le flux LNG | `by-flow/LNG` | disponible, **non comparable à un volume** |

## Ce que la base porte déjà (candidat, non validé)

- **28 objets** portent le flux `LNG` au 2026-08-21, dont **15 P0** (29 au 14/08 : la 4.0.0 a fusionné
  le couloir GNL d'Ormuz dans le détroit).
- `sfu_gulf_oil_lng_hormuz_v1` — **P0, une route, un nœud** : Ormuz. C'est le pétrole **et** le GNL du
  Golfe, pas les corridors GNL mondiaux.
- L'argument d'absence de contournement gazier vit désormais dans la **note du flux `LNG`** du détroit
  d'Ormuz, plus dans un objet séparé.

## Angles morts connus d'avance

1. **Aucun volume valorisé.** Les prix GNL sont une fixture chez eux ; ils omettent plutôt que
   multiplier. La fiche ne trouvera donc aucun montant en base — tout chiffre viendra de l'extérieur.
2. **`importance_score` n'est pas un volume** et ne se compare pas d'un objet à l'autre. Il ordonne
   une liste, il ne mesure pas un flux.
3. **Le fait central est une affirmation de l'amont.** « Le GNL d'Ormuz n'a aucun contournement » est
   une note de flux, pas une source. Elle est plausible et elle est leur travail ; elle n'est pas la
   nôtre. Sans source primaire rouverte, la thèse s'écrit au conditionnel ou ne s'écrit pas.
