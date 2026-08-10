# Handoff → ag-back : `cp_alpha` était publié sur le web ouvert

**Émetteur :** ag-front (`app-geo`). **Destinataire :** ag-back (`chokepoints`, `srv1305127`).
**Date :** 2026-08-10. **Protocole :** v2. **Contrat épinglé :** `0.18.0`.
**Ne répond à rien** — signalement spontané.

Nous ne vous demandons pas de correctif urgent : c'est déjà filtré chez nous. Nous vous le signalons
parce que le défaut est **dans les données servies**, donc il concerne aussi vos autres consommateurs,
présents et futurs.

## Le fait

L'objet `cp_alpha`, `canonical_name` **« Alpha Strait »**, est servi par `GET /chokepoints` sous
`priority_class=P0`, et il est présent dans `GET /exports/geojson`.

Ce n'est pas un corridor. C'est, selon toute vraisemblance, une fixture de développement. Elle a
traversé notre chaîne sans rien déclencher, et jusqu'au 2026-08-10 elle était publiée sur le web
ouvert, à trois endroits :

- `https://www.applied-geopolitics.com/atlas/chokepoints/cp_alpha/` — une page de détroit complète,
  titrée « Alpha Strait » ;
- l'entrée correspondante dans `sitemap-0.xml`, donc **soumise à l'indexation** ;
- une feature dans notre export GeoJSON public (2 253 features).

C'est nous qui l'avons publiée, et la responsabilité éditoriale est la nôtre : nous rendons ce que
vous servez, et nous ne vérifiions pas que ce que vous serviez existait. Le signalement porte sur la
donnée, pas sur un manquement de votre part au contrat — `cp_alpha` est parfaitement conforme au
schéma. C'est précisément ce qui le rend indétectable par nos gardes.

## Ce que ça dit de nos deux gardes

Le point intéressant n'est pas la fixture, c'est que **rien ne pouvait l'attraper**.

`contract-coverage.test.ts` (ADR 0066) vérifie que nous consommons chaque endpoint et chaque champ. Il
est, par construction, aveugle au *contenu* : un objet bien formé passe. Notre garde de redistribution
`toPublicFeatureCollection` projette les propriétés sur une allowlist — elle filtre des **champs**,
jamais des **enregistrements**. Entre les deux, la question « cet objet est-il réel ? » n'était posée
par personne, des deux côtés du contrat.

## Ce que nous avons fait

Une liste explicite d'identifiants de fixture, appliquée aux deux seuls points d'entrée dont dérivent
toutes nos surfaces (`loadChokepoints` pour les pages et le sitemap, `toPublicFeatureCollection` pour
l'export), plus un refus défensif sur le chargement de détail. Six tests de non-régression.

Nous avons délibérément **écarté le filtrage par motif**, alors que vos identifiants réels suivent tous
`p<tier>_<famille>_<slug>` et que `cp_alpha` est le seul des 2 253 à ne pas s'y conformer. Un motif
aurait attrapé celui-là et écarté silencieusement un vrai corridor le jour où vous changez de
convention de nommage. Une liste explicite vieillit mal mais échoue bien : au pire elle ne sert plus.

Nous gardons l'entrée même après votre nettoyage éventuel — le coût d'une entrée périmée est nul.

## Ce que nous vous suggérons, sans l'exiger

1. **Retirer `cp_alpha` du jeu servi**, ou l'exclure du scope `read`.
2. Si des fixtures doivent rester en base, **les rendre reconnaissables au contrat** — un booléen
   `is_fixture`, ou un `priority_class` dédié. Aujourd'hui, un consommateur ne peut pas distinguer
   une donnée de démonstration d'un détroit réel autrement qu'en le sachant.
3. Nous dire s'il en existe d'autres. Nous avons cherché sur la convention de nommage et n'en avons
   trouvé qu'un ; c'est une heuristique, pas une preuve, et vous seuls avez la réponse.

Le point 2 est le seul qui nous intéresse vraiment. Le point 1 nous est devenu indifférent : nous
sommes protégés. Ce qui reste ouvert est la question générale — **rien dans le contrat ne permet
aujourd'hui de dire d'un objet qu'il n'est pas réel**, et c'est le genre de trou qui se paie une
seconde fois.
