# Cadrage — Corridor médian / Trans-Caspien

- **Slug** : `trans-caspien` · **Livrable** : `deliv_atlas_trans_caspien_fiche` · **Objet base** :
  `p1_multimodal_corridor_system_trans_caspian_middle_corridor` (**P1**, `land_chokepoint` /
  `multimodal_corridor`)
- **Relevé base** : 2026-08-13, `type` revérifié le 2026-08-21 · **Statut** : à cadrer

> Le `type` servi était `multimodal_corridor_system` au relevé ; le contrat 2.3.0 (2026-08-14) a
> normalisé la colonne — 125 valeurs libres deviennent 59, et celle-ci devient `multimodal_corridor`.
> **L'identifiant, lui, n'a pas bougé** : il porte encore l'ancienne chaîne dans son préfixe, et c'est
> normal — un identifiant est stable, il ne se relit pas comme une description.

## Limite à porter dès le cadrage : l'objet est P1

`loadChokepoints()` ne charge que les P0. La fiche n'aura donc **ni page de base associée**
(`/atlas/chokepoints/<id>` n'est pas générée) **ni entrée dans l'index des chokepoints**. Le
`chokepoint_id` reste utile — les blocs consensus et actualité promue passent par lui sans filtre de
priorité — mais aucun lien « voir la fiche de base » ne doit être écrit dans le corps : il serait mort.

## Thèse pressentie

Le corridor médian n'est pas une route, c'est une **chaîne de ruptures de charge** : rail, ferry
caspien, rail à nouveau, avec des changements d'écartement et des frontières à chaque jonction. Sa
contrainte n'est donc pas un point unique mais l'**addition** de contraintes moyennes — et c'est
exactement ce que la base traduit sans le vouloir : ses quatre risques (retard frontalier, contrainte
de capacité, météo caspienne, accès politique) portent **tous la même cotation**, probabilité 3,
impact 4, vulnérabilité 3. Aucun n'est liant, tous pèsent.

À vérifier : que cette cotation uniforme soit une lecture du corridor et non un remplissage par
défaut. Si c'est un défaut de couverture, le dire — et ne pas construire la thèse dessus.

## Périmètre — et ce qu'on s'interdit

Le corridor comme alternative au transit russe entre Chine et Europe, ses maillons, sa capacité réelle.
**On s'interdit** la géopolitique du Caucase, les sanctions pour elles-mêmes, et le récit « nouvelle
route de la soie » : la fiche décrit une capacité de transport et ses limites.

## Nœuds à décrire

Traversée caspienne (Alat/Bakou, Aktau/Kuryk, Turkmenbashi — trois `port_gateway` P1 distincts dans la
base), passage de la mer Noire, ruptures d'écartement, postes-frontières. La traversée caspienne est le
maillon à instruire en premier : c'est le seul segment non ferroviaire.

## Grandeurs à chiffrer

| Grandeur | Où la chercher | État |
| --- | --- | --- |
| Volume annuel transporté (EVP, tonnes) | TRACECA / CAREC / BAD via `pplx` | **absent de la base** — externe obligatoire |
| Temps de transit bout-en-bout et sa variance | TRACECA, opérateurs | à réunir ; **la variance importe plus que la moyenne** |
| Capacité de la traversée caspienne (ferries, rotations) | BAD, opérateurs portuaires | à réunir |
| Part du corridor dans le fret Chine–Europe | comparaison à la route Nord | à réunir |
| Métriques de débit | base, `metrics` | **absent** : aucune métrique sur cet objet |

## Ce que la base porte déjà (candidat, non validé)

Peu de chose, et c'est le fait marquant :

- **3 flux**, tous `qualitative_scored`, tous à importance 3 : conteneurs, ferry-rail, fret ferroviaire.
- **4 risques**, cotation identique 3/4/3, sévérité `baseline`, **aucun déclencheur renseigné**.
- **Aucune alternative déclarée. Aucune métrique. Aucun épisode.**

La base fournit un **ancrage**, pas une matière. Cette fiche sera écrite à ~90 % sur sources externes,
et le budget de sourcing doit être calibré en conséquence — nettement au-dessus des fiches de la vague 1.

## Angles morts connus d'avance

1. La cotation uniforme des quatre risques n'est pas exploitable comme hiérarchie. Ne pas en déduire
   un classement de vulnérabilités.
2. Aucune alternative n'est déclarée : la section « Alternatives / bypass » devra être construite de
   zéro (route Nord via Russie, route Sud via Iran, maritime par Suez), en assumant qu'elle est de
   l'analyse et non un relevé.
3. Le corridor est promu politiquement par plusieurs de ses opérateurs : les volumes annoncés
   proviennent souvent de parties intéressées. Chercher une source tierce, et à défaut attribuer
   explicitement le chiffre à son émetteur.
