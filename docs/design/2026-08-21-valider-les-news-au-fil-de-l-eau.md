# Valider les news au fil de l'eau, et non par lots — étude

> **Note de conception, pas une décision.** Demandée le 2026-08-21 sous la forme « continue-t-on la
> validation via Slack ou passe-t-on par Discord ». **La réponse à cette question-là est : on reste
> sur Slack, et ce n'était pas le sujet.** Le canal n'est pas ce qui bloque ; c'est la forme du
> rituel. Les faits Discord vérifiés au passage sont conservés en annexe pour ne pas refaire
> l'enquête.

## Le déplacement de la question

Le dispositif Slack fonctionne. Ce qui ne fonctionne pas, c'est **le lot** : trente-six
regroupements déposés le lundi matin forment une tâche qu'on ne commence pas. L'unité de validation
doit être **le sujet**, pas la semaine.

| Mesure | Valeur | Comment la refaire |
| --- | --- | --- |
| Promotions depuis le câblage (2026-08-11) | **1**, le jour même | `apps/public/src/data/promoted-news.json` |
| Clusters frais au dernier digest | **36**, dont 22 sur Ormuz | `tail scripts/news-review.log` |
| `pong` manqués en 10 jours | 69 + 3 `SMWebsocketError` | `docker compose … logs slackbot --timestamps` |

Le bruit de connexion est du bruit : Bolt se reconnecte seul, aucune interaction perdue, la seule
promotion du corpus est passée. **Ce n'était un argument ni pour changer de canal, ni pour rester.**

## Pourquoi le canal n'était pas le sujet

**Aucune garantie doctrinale n'est portée par Slack.** Elles vivent toutes dans
`apps/cockpit/server/promote-news.ts`, derrière une API HTTP agnostique du canal :

- la note éditoriale obligatoire (ADR 0074) ;
- le refus de paraphrase — **taux de recouvrement ≥ 0,8**, et non Jaccard, parce que Jaccard pénalise
  l'écart de longueur et laissait passer une note brève recopiée d'un titre long
  (`promote-news.ts:270-286`) ;
- l'intitulé du modèle affiché mais jamais publié (ADR 0078) ;
- la provenance de la phrase consignée — `human_written` / `draft_edited` / `draft_accepted`
  (`promote-news.ts:377`) ;
- le refus d'un cluster taché ou sans article attribuable (`promote-news.ts:125-128`) ;
- le journal nominatif append-only (ADR 0046) et le watcher hôte (ADR 0069).

Slack n'est qu'une télécommande. **Changer la forme du rituel ne touche donc à aucune garantie non
plus** — c'est ce qui rend le changement proposé ici peu risqué.

## La forme retenue : un sujet, un message

Le parcours actuel a trois étages : digest hebdomadaire → bouton corridor → modale de choix parmi
sept sujets → modale d'écriture. **Le nouveau en a deux**, et l'étage supprimé est le plus cher :

```
sondage horaire → sujet nouveau au-dessus du seuil ?
                → un message dans le canal privé : poids, fenêtre, titres des éditeurs cliquables
                → bouton « Écrire la phrase » → modale à un champ, brouillon pré-rempli
                → cockpit (mêmes gardes) → publié
```

La modale de choix disparaît : le message **est** la surface de lecture, et les liens y sont
cliquables de plein droit. Ce qui reste de `promote.ts` — poids des sujets, histoires distinctes,
âges, plancher de pays, entités HTML — sert tel quel à composer le message.

## Les deux faits qui contraignent la conception

### 1. Le plancher du « fil de l'eau » est de six heures

L'amont agrège **quatre fois par jour** (`docs/api-interface-contract_V7.md:345`). On ne peut pas
ruisseler plus vite que le producteur. C'est néanmoins vingt-huit fois plus fin que le lundi.

**Sonder quand même toutes les heures**, sans chercher à s'aligner sur leurs passes : nous ignorons
leurs horaires, le registre rend le sondage idempotent, et un sujet neuf est vu dans l'heure plutôt
qu'avec six heures de retard. Le coût est de vingt-quatre appels par jour sur le tailnet.

### 2. L'identité durable existe, et nous ne l'utilisons pas

C'est le piège qui aurait fait échouer un flux naïf. **`cluster_id` ne survit pas à une passe** —
0 identifiant commun sur 15 entre deux passes du même corridor le même jour, mesuré par nous,
documenté chez eux. Un registre indexé dessus re-notifierait les trente-six sujets **quatre fois par
jour**.

`topic_id` est fait pour ça : il dure tant que le sujet reçoit des articles, sa règle de clôture est
de trois jours, il n'est jamais réutilisé. Il est dans notre schéma
(`packages/chokepoints/src/schema.ts:1652`) — **parsé et jeté, utilisé nulle part**.

Avec la réserve que le producteur écrit lui-même : stabilité **80–87 %**, avec une passe à **50 %**
où le même corpus a produit 30 regroupements puis 101. **Le repli par URL est leur consigne**, pas
seulement notre prudence. Donc l'identité du registre est : `topic_id` s'il existe, **sinon
l'ensemble trié des URL d'articles** — et jamais `cluster_id`. Les regroupements antérieurs au
2026-08-13 portent `topic_id: null`.

## Paramètres arbitrés le 2026-08-21

| Décision | Choix | Conséquence |
| --- | --- | --- |
| Filtre | **Seuil de poids, plus bas sur les P0** | Les P0 alertent tôt, les P1+ seulement quand le sujet est porté |
| Sujet qui grossit | **Re-notifier au franchissement d'un palier** | L'emballement se voit ; le tiède ne se répète pas |
| Pulsation | **Tous les deux jours**, réduite à une ligne | Un cron mort se voit sous 48 h au lieu de 7 jours |
| Canal | **Slack, inchangé** | Aucune migration, aucun secret nouveau, le bot existant est réemployé |

### Seuils proposés (à confirmer — ce sont des propositions, pas des mesures)

Ancrés sur ce qui existe déjà dans le code plutôt que sur des nombres inventés :

- **P0** : notifier dès **2 médias distincts** **ou** saillance ≥ 0,80 (`SALIENT_AT`,
  `promote.ts:279`), même peu repris. Le 2 vient d'un principe déjà retenu ailleurs — ne jamais agir
  sur une source unique — et **non** du plancher de l'ADR 0072, qui compte des marchés de prédiction
  et non des médias : c'est un précédent de doctrine, pas la même mesure.
- **P1 et au-delà** : **5 médias distincts** (`LOW_ECHO_UNDER`, `promote.ts:280`) **ou** saillance
  ≥ 0,80 avec au moins 3 médias.
- **Paliers de re-notification** : 5 → 20 → 50 → 100 médias distincts, une fois par palier, jamais
  plus de trois rappels pour un même sujet.

Le cas qui justifie de compter les **médias distincts** et non les articles : sur Ormuz, « le trafic
tombe à six navires » vaut 0,90 de saillance pour 3 médias, quand « l'Iran lie la réouverture » vaut
0,90 pour 199. Deux mesures, jamais fondues en un score unique (`promote.ts:60-92`).

## Ce qu'il faut écrire

| Élément | Nature | Réemploi |
| --- | --- | --- |
| Registre du flux (`topic_id` \| URL → paliers notifiés, `ts` du message Slack) | **neuf** | — |
| Sondeur horaire + filtre par seuil | **neuf**, petit | `subjectWeight`, `rankSubjects`, `distinctStories` (`promote.ts`) tels quels |
| Composition du message par sujet | adapté | les constructeurs de `promote.ts:405` perdent la sélection, gardent le reste |
| Bouton → modale d'écriture | **inchangé** | `buildWritingModal*`, `views.push`/`views.update` (`index.ts:128-171`) |
| Soumission → cockpit | **inchangé** | `promote-news.ts` : rien à toucher |
| `scripts/news-review-cron.sh` | réduit à la pulsation | perd les boutons corridor, garde le dead-man's switch |

## Pièges à ne pas rejouer

- **Le silence doit rester lisible.** Un flux au fil de l'eau rend l'absence ambiguë : « rien à
  signaler » ou « le cron est mort » ? D'où la pulsation tous les deux jours, qui part **même** quand
  il n'y a rien. C'est la fonction du digest actuel, pas son contenu, qu'il faut sauver.
- **`0 9 */2 * *` n'est pas « tous les deux jours ».** `*/2` porte sur le quantième, donc les jours
  impairs — et un mois de 31 jours enchaîne le 31 sur le 1er, soit **un trou de trois jours** aux
  bascules. Soit on l'assume, soit on cadence depuis le script (dernier envoi horodaté dans le
  registre), ce qui est plus sûr et coûte trois lignes.
- **`itemKey()` (`promote-news.ts:29`) préfère `cluster_id`** et son commentaire le dit « durable » —
  l'inverse de ce qu'affirme le contrat. Inoffensif aujourd'hui (un item promu est un instantané
  figé) ; en régime « fil de l'eau », promouvoir le même sujet à deux passes différentes produirait
  deux clés, donc **un doublon en public**. À corriger dans le même chantier.
- **Un canal bruyant se mute**, et un canal muté est exactement le point de départ. Si le flux
  dépasse deux ou trois messages par jour, monter les seuils avant de blâmer le rituel.
- **Ne pas juger sur le message.** Le message porte les titres des éditeurs et les poids, jamais un
  raccourci de promotion : le refus de paraphrase reste côté cockpit et la phrase reste à écrire.
  Baisser le nombre d'étages ne baisse pas cette exigence-là (ADR 0074).

## Points à trancher

- **Les trois seuils chiffrés ci-dessus.** Ce sont des propositions ancrées sur des constantes
  existantes ; seule une semaine d'observation dira si elles produisent un ou six messages par jour.
  Proposition : les câbler en configuration, pas en dur.
- **Rétention du registre.** L'amont purge à 14 jours et clôt un sujet après 3 jours sans article.
  Proposition : purger une entrée 14 jours après sa dernière activité — assez pour qu'un sujet clos
  ne revienne pas, assez court pour que le fichier ne grossisse pas.
- **Où vit le registre.** `apps/cockpit/data/` (sauvegardé par `backup-sqlite.mjs`, versionné avec
  les autres données du cockpit) ou un fichier d'état hors dépôt ? Il n'est ni canonique ni
  éditorial : c'est de la mémoire d'outil.
- **Que devient le bouton corridor.** Il n'a plus d'emploi une fois le flux en place. Le retirer du
  cron, ou le garder pour rattraper un sujet passé sous les seuils ?

## Annexe — ce qui a été vérifié côté Discord le 2026-08-21

Conservé pour ne pas refaire l'enquête si la question revient.

- Un bot Gateway ouvre une **WebSocket sortante** : aucune URL entrante, aucune règle Caddy. La
  doctrine « inverser le flux plutôt qu'ouvrir une porte » y tient à l'identique — ce n'était pas un
  point de différence.
- Un message posté en `POST /channels/{id}/messages` avec un jeton **bot** peut porter des boutons ;
  la restriction sur les composants vise les webhooks non possédés par une application.
- 5 boutons par rangée, 5 rangées par message ; **5 composants au maximum par modale** ; réponse
  initiale sous 3 s ; jeton d'interaction valable **15 minutes**.
- **Les liens markdown ne sont pas cliquables dans une modale** (Text Display type 10 admis, rendu en
  texte) ; une modale affichée **ne peut plus être modifiée** ; elle **ne peut être ni différée ni
  ouverte depuis une soumission de modale** — donc pas d'équivalent à `response_action: errors`.
- **Non vérifié** : la route de compatibilité `…/slack` de Discord rend-elle les `blocks` de
  `scripts/lib/slack.sh` ? Les sources consultées ne le confirment pas. À éprouver avec un webhook de
  test avant d'en faire un fait.

Fait notable pour un éventuel retour de la question : **la forme « un sujet, un message » supprime le
principal handicap de Discord**, puisque la surface de lecture quitte la modale pour le message. Ne
resterait comme régression que l'erreur sous le champ au refus de paraphrase.
