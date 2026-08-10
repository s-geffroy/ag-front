# 0072 — Plancher de cardinalité et allowlist de publication pour le consensus de marché

- **Statut :** accepté
- **Date :** 2026-08-10
- **Contexte connexe :** ADR 0071 (consensus + news promue sur l'Atlas public), ADR 0066 (consommation
  intégrale garantie au build), ADR 0067 (canal d'échange). Côté producteur : leur ADR 0079 (plancher de
  rattachement), 0085 (balayage + recensement), 0086 (juge de rattachement). Handoffs ag-back : `0018`
  (conditions de publication), `0023`, `0024`, `0025`.

## Contexte

Le 2026-07-29, ag-back a déposé trois messages qui annulent deux choses que nous avions inscrites comme
acquises. La cause est unique et elle est la même dans les deux cas : **leur collecteur lisait 500 des
12 233 événements Polymarket ouverts — 4 %** (`active=true` silencieusement ignoré par
`/events/keyset` ; `limit` plafonné à 100 côté serveur alors que l'OpenAPI publié annonce 500). Deux
mesures qui portaient sur leur fenêtre ont donc été présentées, et reçues, comme des mesures sur le
monde.

Leur balayage complet (152 459 marchés au lieu de 820) fait sortir **trois objets de `[]`** : Ormuz,
Bab-el-Mandeb et Taïwan. Tout ce qui entre porte `attachment_rule = 'named_or_implied'` — notre garde
`consensusRowIsPublishable()` les laisse passer, et c'est correct : ce sont des rattachements
déterministes, pas des inférences de modèle.

Nous avons vérifié notre propre surface avant de décider. Trois constats, dont aucun n'était connu
d'ag-back :

1. **La page publique était gelée depuis le 2026-07-29 11:18.** Le cron horaire `--refresh-signals`,
   documenté en tête de `scripts/redeploy-public.sh`, **n'avait jamais été installé** ; seul
   `--if-pending` tournait. `www` a donc servi douze jours un « Consensus au 27 juillet 2026 », pendant
   que nous écrivions à ag-back (handoff `0022` §5) que la page était « rafraîchie toutes les heures ».
2. **`CONSENSUS_PUBLIC_ALLOWLIST` n'existait pas.** `ConsensusBlock.astro` la citait en commentaire
   comme le lieu où se décide quels corridors atteignent le composant ; aucun code ne l'implémentait.
   La **condition 2** de leur `0018` — « ne publier que Panama et Suez » — n'était donc tenue que parce
   que les autres corridors renvoyaient `[]`.
3. **Quatre des dix lignes servies reposent sur un marché unique**, dont **nos deux lignes publiques**
   (leur `0025` §4). « Consensus de marché » titrait une cotation.

Le premier constat explique pourquoi rien n'avait encore basculé publiquement, et il n'a rien d'un
soulagement : le prochain rebuild — fût-il déclenché par une simple publication éditoriale — mettait en
ligne trois corridors non revus, dont un `perception_watch` à 72,5 % sur un seul marché, sous un libellé
que nous n'avions jamais traduit.

**Une garde tenue par la donnée n'est pas une garde.** C'est le constat qui motive cet ADR : la
condition 2 et le plancher de cardinalité doivent être tenus par du code, pas par la forme que prend
aujourd'hui la réponse du producteur.

## Décision

### 1. Plancher de cardinalité `market_count >= 2`

Deux n'est pas un seuil statistique, c'est un seuil **linguistique** : en dessous il n'y a pas
d'agrégat, seulement une cotation surmontée d'un nom pluriel. `PUBLISHABLE_MIN_MARKET_COUNT = 2` et
`consensusRowMeetsCardinalityFloor()` dans `@ag/chokepoints`.

- **Prédicat séparé** de `consensusRowIsPublishable()`, pas une clause de plus à l'intérieur : une règle
  de rattachement inconnue et une cotation unique sont deux refus différents, et les fondre rend une
  ligne écartée incapable de dire lequel a joué. C'est le raisonnement qu'ag-back applique de son côté
  en séparant « ce que le modèle a dit » de « ce que nous en avons fait ».
- **Fail-closed sur l'absence** — et c'est là que le plancher **diffère** de `attachment_rules`, dont le
  tableau vide est toléré pour une raison historique documentée : une ligne qui ne déclare pas sa
  cardinalité ne peut pas franchir un plancher de cardinalité. *Le silence n'est pas un compte.*
- **Client ET serveur.** Nous demandons à ag-back le plancher serveur — leur argument est juste (« un
  seuil appliqué à un endroit se vérifie, un seuil appliqué chez chaque consommateur dérive »), et HDDE
  lit le même endpoint. Nous filtrons quand même chez nous, par la doctrine déjà posée pour
  `attachment_rules` : **on vérifie plutôt qu'on suppose.**

Effet mesuré sur l'état servi le 2026-08-10 : Panama perd son unique famille (`n=1`) donc son bloc
entier ; Taïwan de même ; Ormuz perd `perception_watch` ; Suez conserve `infrastructure_capacity`
(n=29) et perd sa ligne `disruption` (n=1) ; Bab-el-Mandeb conserve ses trois familles (30/45/10).

### 2. Allowlist de publication, rétablie en code

`CONSENSUS_PUBLIC_ALLOWLIST` = Panama + Suez, dans `apps/public/src/lib/atlas-data.ts`. Le refus
intervient **avant l'appel réseau** : un corridor que nous n'avons pas le droit de publier n'est pas un
corridor dont nous avons besoin d'aller chercher les chiffres.

Élargir cette liste est un acte **éditorial**, conditionné à la réponse écrite d'ag-back sur la levée de
leur condition 2 — pas à l'état de leur cron. La question leur est posée dans la réponse déposée ce jour.

### 3. Liste close des familles publiables

`CONSENSUS_FAMILY_LABELS` devient la liste des familles que nous acceptons de publier, et
`ConsensusBlock.astro` la consomme au lieu de retomber sur `humanize()`. Une famille sans libellé
français est une famille dont **nous n'avons pas décidé la présentation** ; le repli générique la
publiait quand même. Ce n'est pas théorique : Ormuz sert aujourd'hui `perception_watch` à 72,5 %, qui se
serait affiché « Perception watch » sur une page publique indexée.

### 4. Estampille = la fenêtre la plus **ancienne** des lignes retenues

`observedAt` prenait la première ligne servie. Or ag-back sert dans une même réponse des lignes d'âges
différents (Suez, 2026-08-10 : une ligne au 08-10, une au 08-01). « Consensus au \<date\> » ne doit
jamais promettre plus de fraîcheur que le chiffre le plus vieux du bloc — et l'estampille est calculée
**après** les filtres, pour qu'une ligne écartée ne puisse pas dater le bloc.

### 5. Le rafraîchissement devient réel

Installation du cron horaire déjà documenté (`--refresh-signals`). Sans lui, tout ce qui précède décrit
une page qui ne se reconstruit pas.

## Conséquences

- Le bloc consensus **disparaît de Panama** — notre corridor le plus visible. C'est le résultat
  recherché : il ne reposait sur rien d'autre qu'une cotation.
- Le plancher et l'allowlist sont des règles de **publication**, pas de lecture. Le cockpit et HDDE
  continuent de tout voir, `market_count` affiché : ce sont des surfaces internes ou authentifiées, où
  masquer serait pire que montrer.
- Deux ADR de leur côté restent sans effet chez nous et le resteront tant que la ligne ne bouge pas :
  le juge de rattachement (leur 0086) écrit `llm_implied`, quatrième valeur distincte du `CHECK`, et
  `engine_prediction_consensus` continue de filtrer `named_or_implied`. Notre garde est fail-closed sur
  toute règle inconnue : aucun chiffre jugé ne peut atteindre une page, même si leur engagement de
  prévenir n'était pas tenu.
- Rien de ce qui précède ne change le statut des chiffres : un consensus de marché reste une
  **anticipation de foule**, S5, **candidat en attente de validation humaine** — jamais une preuve
  d'événement.

---

## Amendement du 2026-08-10 — l'allowlist de corridors est levée (contrat `0.18.0`)

Ajouté après coup, sans réécrire ce qui précède : l'allowlist a existé, elle a servi, et la trace de
pourquoi elle a été posée vaut plus que la propreté du document.

**Ce qui change.** `CONSENSUS_PUBLIC_ALLOWLIST` est **supprimée**. ag-back lève la condition 2 par
écrit (leur handoff `0026` §3) et refuse délibérément de nous fournir une liste nommée de remplacement.
Leur argument est celui que nous leur avions opposé au §1b de notre `0022` : un périmètre qui vit à deux
endroits finit par ne vivre à aucun — le nôtre s'était réduit à un commentaire citant une constante que
personne n'avait écrite, et il n'a tenu douze jours que parce que leur donnée était vide.

Le périmètre est désormais **les planchers**, qui sont du code et qui sont testés :

| garde | où | ce qu'elle refuse |
| --- | --- | --- |
| rattachement | `consensusRowIsPublishable` | tout ce qui n'est pas `named_or_implied` |
| cardinalité | `consensusRowMeetsCardinalityFloor` | N < 2, **et l'absence de compte** |
| famille | `CONSENSUS_FAMILY_LABELS` | toute famille sans libellé décidé — **liste close, entièrement nôtre** |

La troisième ligne est la seule qui tienne réellement `perception_watch` d'Ormuz (0,725 sur la surface
servie, la plus haute probabilité de tout l'ensemble) : le plancher de cardinalité d'ag-back ne l'a
retirée **que par accident de sa cardinalité**, comme ils l'écrivent eux-mêmes. Une garde qui attrape la
bonne ligne pour la mauvaise raison n'est pas la garde de cette ligne.

**Ce que nous consommons en plus.** Le contrat `0.18.0` rend requis et non nullables `attachment_rules`
et `market_count` (`PerceptionConsensusOut`), `attachment_rule` (`PerceptionSignalOut`, `EventSignalOut`),
et ajoute `minimum_market_count` sur `PredictionConsensusList` — le plancher que le producteur déclare
avoir appliqué. Nous le lisons pour **les vérifier**, pas pour leur obéir : `consensusFloorDisagreement()`
signale un plancher servi inférieur au nôtre. Nos lignes seraient filtrées de toute façon ; ce que la
fonction préserve, c'est la capacité à dire que les deux planchers **coïncident** au lieu de le supposer.

`minimum_market_count` est déclaré **non optionnel** en zod. Un payload qui ne le porte pas ne parse pas,
donc le bloc disparaît. C'est le bon sens de l'échec : une liste vide sans plancher déclaré et une liste
vide avec un plancher à 2 ne disent pas la même chose — « rien à signaler » contre « couverture
écartée » — et un payload incapable de distinguer les deux n'est pas exploitable.

**Ce que la levée n'emporte pas.** Le juge de rattachement (leur ADR 0086) est hors service,
`llm_implied` compte zéro ligne, et ils s'engagent à écrire sur le canal avant que quoi que ce soit du
genre n'entre dans l'agrégat clair. Lever le périmètre ne lève pas cet engagement — et notre garde
fail-closed sur toute règle inconnue est ce qui le rend superflu plutôt que porteur.

**Ce que cette version ne corrige toujours pas**, de leur aveu et du nôtre : le plancher porte sur la
**cardinalité, pas sur l'indépendance** — deux marchés du même auteur sur des questions quasi identiques
le franchissent. Compter n'est pas corroborer, et nous n'avons pas de correctif à annoncer.
