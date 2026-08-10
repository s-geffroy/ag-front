# Veille publique & validation depuis Slack — propositions

> **Note de conception, pas une décision.** Deux sujets demandés le 2026-08-10 : (A) une surface
> publique pour les actualités sur `www`, (B) un canal bidirectionnel permettant de promouvoir depuis
> Slack. Rien n'est implémenté. Les ADR viendront après l'arbitrage.

## État de départ

Le pipeline est complet et vérifié (API → cockpit → store → watcher → bloc public). Le bloc
`PromotedNewsBlock` n'apparaît aujourd'hui **que** sur une page chokepoint ou une fiche Atlas : il
faut donc déjà être sur le bon corridor pour voir quoi que ce soit. Aucune surface transversale
n'existe. `promoted-news.json` est vide.

---

# A. Surfaces publiques pour la veille

## Le principe qui doit gouverner les quatre options

**Une surface de veille doit tomber en panne vers le vide, jamais vers le périmé.**

C'est la leçon du matin : la fiche Mer Rouge affichait « État au 12 juillet » avec une affirmation
devenue fausse dix jours plus tard. Un bloc d'actualité non alimenté ne devient pas neutre en
vieillissant — il ment. Chaque option ci-dessous est donc assortie de sa condition d'effacement.

## A1 — `/veille`, page dédiée · **recommandée**

Toutes les promotions, antéchronologiques, groupées par corridor. Entrée de nav, flux
`/veille/rss.xml`.

- **Pour** : une URL partageable, indexable ; donne une destination évidente à la cadence du lundi ;
  actif SEO qui se construit tout seul si le rythme tient.
- **Contre** : une entrée de nav « Veille » vide est pire que pas d'entrée du tout.
- **Effacement** : page **et** entrée de nav retirées du build tant qu'il n'y a aucune promotion —
  le précédent existe et fonctionne (`plaquetteIsPublic()`, ADR 0073).
- **Fraîcheur visible** : bandeau « dernière revue éditoriale : ‹ date › » en tête. Si la revue
  saute, le lecteur le voit ; le silence devient lisible au lieu d'être trompeur.

## A2 — Bande en page d'accueil · **recommandée en complément**

Deux à trois promotions récentes, sous le hero.

- **Pour** : la surface la plus vue ; fait exister le fait que le site est vivant, ce qui sert
  directement la prospection.
- **Contre** : la home a un travail — la promesse et le CTA. L'actualité lui dispute la place, et une
  home périmée coûte plus cher qu'une sous-page périmée.
- **Effacement** : la bande **disparaît** si la promotion la plus récente dépasse N jours (proposition :
  N = 21). Elle ne doit jamais afficher « rien de récent » : elle doit ne pas être là.

## A3 — Colonne signaux sur `/atlas`

Bande de couverture récente sur l'index Atlas, chaque entrée pointant vers sa page corridor.

- **Pour** : contextuellement juste ; renforce le maillage interne (bénéfice SEO réel).
- **Contre** : peu visible, pas d'URL partageable. Complément, pas socle.

## A4 — Flux RSS/JSON seul, sans page

- **Pour** : le moins cher ; répond à « comment vous suivre ».
- **Contre** : aucune valeur SEO, aucune surface pour un prospect. À faire **en plus**, jamais **à la
  place**.

## Recommandation

**A1 + A2, toutes deux auto-effaçantes**, puis A3 quand le rythme est prouvé. A4 vient gratuitement
avec A1.

Un détail qui compte : la fiche Ormuz porte `chokepoint_id`, donc une promotion sur Ormuz apparaîtra
**aussi** sur sa fiche éditoriale le jour où elle sera publiée. Les surfaces se cumulent sans travail
supplémentaire.

---

# B. Valider depuis Slack

## B0. Ce que Slack exige, mécaniquement

1. Une **app Slack** avec l'interactivité activée.
2. Un message **Block Kit** portant des boutons (`actions`), ou une **modale** ouverte via
   `views.open` avec le `trigger_id` du clic.
3. **Slack doit pouvoir vous joindre.** En mode classique, cela signifie une **URL publique HTTPS**
   qui reçoit les POST d'interaction.
4. Vérification obligatoire de `X-Slack-Signature` + `X-Slack-Request-Timestamp` : HMAC-SHA256 sur
   `v0:‹ts›:‹corps brut›` avec le *signing secret*, **et rejet au-delà de 5 minutes** (anti-rejeu).
   Sans horodatage vérifié, une signature valide capturée reste rejouable indéfiniment.
5. Accusé de réception **sous 3 secondes**, puis travail en asynchrone (`response_url` ou
   `views.update`).

## B1 — Endpoint public sur `www` (`/slack/*` → conteneur dédié)

- **Pour** : Caddy est déjà là, pas de DNS nouveau.
- **Contre, et il est lourd** : cela pose **une surface d'écriture publique sur le site vitrine**, et
  cette surface **mute l'Atlas public**. Tout le déploiement a été construit dans l'autre sens — le
  cockpit est délibérément tailnet-only. Ce serait le premier chemin de publication exposé à
  l'Internet ouvert.

## B2 — **Socket Mode** · **recommandée**

Slack propose un mode où **votre application ouvre une WebSocket sortante** vers Slack. Aucune URL
entrante, aucun port ouvert, aucune règle Caddy.

- **Pour** : **zéro surface d'attaque nouvelle**. Le cockpit reste tailnet-only. Pas de DNS, pas de
  TLS à gérer, pas de vérification de signature à écrire correctement — le canal est authentifié par
  le jeton applicatif.
- **Contre** : demande un processus long qui tient la connexion (un petit conteneur `slackbot` de
  plus, à surveiller comme les autres) et un jeton `xapp-` en plus du jeton bot.
- **Coût réel** : un service, deux secrets dans `docker/.env`, un healthcheck.

C'est l'option cohérente avec la doctrine de ce déploiement : elle inverse le sens du flux plutôt que
d'ouvrir une porte.

## B3 — Réaction emoji, relevée par le cron

Le promoteur met un ✅ sur le digest ; le cron du lundi relève les réactions et promeut.

- **Pour** : rien de nouveau à exposer, presque rien à écrire.
- **Contre** : latence d'une semaine, aucune possibilité de saisir la phrase éditoriale — donc
  **incompatible avec l'ADR 0074**. À écarter.

---

## La vraie difficulté n'est pas technique

Promouvoir depuis Slack **abaisse la friction exactement là où la friction porte la garantie**.

L'ADR 0074 a rendu `editorial_note` obligatoire parce que juger un cluster sur son titre était le
défaut qu'ag-back nous avait nommé et que nous avons concédé. Un bouton « Promouvoir » sous un titre
dans Slack **reconstruit ce défaut avec une meilleure interface**. C'est précisément pour cela que le
digest hebdomadaire ne cite aucun titre.

Trois façons de tenir la garantie, du plus permissif au plus strict :

### P1 — Modale avec note obligatoire

Le clic ouvre une modale contenant **les titres des articles avec leurs liens** (mots des éditeurs,
pas prose du modèle) et un champ libre obligatoire. Le promoteur peut ouvrir les articles depuis la
modale.

*Tient ?* Partiellement. Rien n'empêche d'écrire une phrase depuis le seul titre.

### P2 — P1 + refus machine de la paraphrase · **recommandée**

Même modale, plus une règle **vérifiable** : la note est **rejetée** si elle est une quasi-copie d'un
titre d'article ou du `headline` du modèle (même empreinte que `familyQuestionDiversity` — on a déjà
le code, `packages/chokepoints/src/independence.ts`, seuil Jaccard).

*Tient ?* C'est la version applicable de « vous devez ajouter quelque chose ». On ne peut pas prouver
qu'un humain a lu ; on peut refuser mécaniquement qu'il se contente de recopier. Et le message
d'erreur est pédagogique : « votre phrase reprend le titre — dites ce que l'article change pour un
décideur ».

### P3 — Slack ne fait que **préparer**, jamais publier

L'action Slack écrit une promotion **en attente** ; le build public ignore les attentes ; la
publication reste un geste au cockpit.

*Tient ?* Totalement — mais ce n'est plus ce qui est demandé. À retenir si l'on veut le confort de
capture sans céder sur la porte.

---

## Ce que je recommande

**A1 + A2** côté public, **B2 (Socket Mode) + P2** côté Slack.

Séquence proposée, chaque étape ayant une valeur seule :

1. **A1 `/veille`** — la cadence du lundi a enfin une destination publique.
2. **B2 + P2** — la promotion devient possible en trois minutes depuis le téléphone, sans ouvrir
   quoi que ce soit sur Internet, et sans pouvoir recopier un titre.
3. **A2** — la bande d'accueil, une fois qu'il y a de la matière à y mettre.

## Points à trancher avant d'écrire une ligne

- **N pour l'effacement de la bande d'accueil** (proposition : 21 jours).
- **Identité** : Slack fournit un `user.id` ; faut-il le mapper vers `validated_by` ou exiger le nom
  complet ? Le journal est nominatif, et un identifiant Slack n'est pas un nom.
- **Seuil de similarité** pour P2, et que faire d'une note *courte mais juste*.
- **Qui peut promouvoir** : un canal privé restreint, ou une liste d'IDs autorisés côté service.
