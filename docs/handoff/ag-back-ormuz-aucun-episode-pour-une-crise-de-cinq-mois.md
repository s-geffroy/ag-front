# Handoff → ag-back : Ormuz n’a aucun épisode ouvert, et votre propre métrique dit qu’il devrait

**Émetteur :** ag-front (`app-geo`). **Destinataire :** ag-back (`chokepoints`, `srv1305127`).
**Date :** 2026-08-10. **Protocole :** v2. **Contrat épinglé :** `0.18.0`.
**Ne répond à rien** — signalement spontané, second de la journée.

## Le fait, mesuré chez vous

`GET /chokepoints/p0_maritime_strait_strait_of_hormuz` retourne **un seul épisode** :

```
hormuz_tanker_attacks_2019 · status: ended · severity: high · 2019-05-12 → 2019-07-19
```

Le même appel retourne, dans `metrics` :

```
portwatch_avg_daily_transits = 2.5 vessels_per_day · période 2026-08
```

Pour situer, même métrique et même mois, sur vos autres P0 maritimes : **Suez 36,5**, **Malacca
230,5**, **détroit de Taïwan 248**. Ormuz est deux ordres de grandeur sous ses pairs.

Autrement dit : **votre couche `metrics` mesure un effondrement, et votre couche `episodes` n’en sait
rien.** Les deux sortent du même objet, dans la même réponse.

Recoupement hors de votre base, à titre de contexte et non de preuve : plusieurs sources situent la
restriction au-delà de 90 % et décrivent une perturbation sévère sur l’essentiel des cinq derniers
mois ; Reuters comptait 33 navires du lundi au jeudi la semaine du 7 août.

## Pourquoi cela nous coûte, concrètement

Nous venons de faire remonter les épisodes `ongoing` en bandeau, en tête de fiche chokepoint. C’était
un vrai défaut chez nous : la crise mer Rouge, ouverte depuis 33 mois, s’imprimait en liste plate en
bas de page, à côté de l’échouement de l’Ever Given. Le bandeau lit **votre** `status`.

Il fonctionne pour Suez, qui porte `red_sea_houthi_crisis_2024` en `ongoing`. Il n’affiche **rien**
sur Ormuz. Notre page publique montre donc les flux EIA 2024 en tête, `2,5 transits/jour` relégué
parmi les métriques, et aucun signe qu’il se passe quoi que ce soit.

Nous avons refusé de compenser par une heuristique. Comparer un objet à lui-même dans le temps est
impossible — vous exposez une période par appel, nous ne détenons pas d’historique. Comparer entre
objets ne veut rien dire : Malacca tourne légitimement au-dessus d’un petit détroit. Toute règle
transversale que nous aurions écrite aurait étiqueté à tort les petits chokepoints. Nous préférons un
trou visible à un faux positif silencieux — et notre bandeau dit explicitement que son silence
signifie « aucun épisode ouvert », jamais « corridor calme ».

## Ce que nous vous demandons

1. **Ouvrir un épisode pour la crise d’Ormuz 2026**, avec `started_on` et `severity`. C’est le
   correctif juste, et il est chez vous : l’épisode est votre objet sémantique pour « ceci est en
   cours », et aucun consommateur ne peut le déduire de son côté.
2. **Vérifier si d’autres objets sont dans le même cas.** Nous n’avons regardé que quatre P0
   maritimes. Si `episodes` est alimenté à la main, l’écart avec `metrics` est structurel, pas
   accidentel.

## Une question de contrat, qui vaut au-delà d’Ormuz

Rien dans le contrat ne permet de distinguer **« aucun épisode parce que rien ne se passe »** de
**« aucun épisode parce que personne ne l’a ouvert »**. Ce sont deux états opposés, encodés
identiquement — l’absence.

C’est exactement la forme du trou que nous vous signalions ce matin à propos de `cp_alpha` : rien ne
permettait alors de distinguer un objet réel d’une fixture. Deux fois dans la journée, le contrat est
muet non pas sur une valeur, mais sur le **statut épistémique** d’une absence.

Une piste, que nous ne vous imposons pas : un champ de fraîcheur au niveau de la couche
(`episodes_reviewed_at`, ou l’équivalent), qui dirait quand un humain a regardé pour la dernière fois.
Une absence datée d’hier est une information. Une absence non datée n’en est pas une.
