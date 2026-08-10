# 0076 — Mesure d'audience : Plausible auto-hébergé, sans cookie, en première partie

- **Statut** : accepté
- **Date** : 2026-08-10
- **Voisins** : [0044](0044-client-data-lifecycle-confidentiality.md) (cycle de vie des données
  clients), [0006](0006-lead-capture-self-hosted-endpoint.md) (lead-capture auto-hébergé),
  [0010](0010-public-deploy-caddy.md) (Caddy en frontal), [0033](0033-hdde-public-auth-surface.md)
  (surfaces privées derrière auth)

## Contexte

Le site public était en ligne depuis six semaines **sans aucune mesure d'audience** — ni Plausible,
ni Matomo, ni Google Analytics, rien. Or le SEO est décrit dans `CLAUDE.md` comme « un actif lentement
construit ». Un actif qu'on ne mesure pas est une hypothèse : impossible de dire si les 130 pages
publiées amènent qui que ce soit, ni lesquelles.

Trois options ont été pesées : Plausible auto-hébergé, Plausible Cloud (UE), et un comptage dérivé des
logs Caddy. La troisième a été écartée non pour son coût mais pour ce qu'elle ne distingue pas — un
robot d'un lecteur — sans un travail de classification qu'il faudrait écrire et maintenir. La
deuxième ajoutait une dépendance externe payante à une plateforme dont tout le reste est ici.

## Décision

**Plausible Community Edition, sur ce serveur**, avec ses deux bases (PostgreSQL, ClickHouse), et
deux choix de déploiement qui comptent plus que le choix de l'outil.

### 1. Le suivi est servi en première partie, sous `/p/*`

Caddy proxifie `/p/script.js → plausible:8000/js/script.js` et `/p/event → /api/event`.

Ce n'est pas une commodité. Un hôte d'analytics tiers figure sur toutes les listes de blocage : un
traceur bloqué pour un tiers des visiteurs ne mesure pas un tiers de moins, il mesure **deux tiers
biaisés** — précisément la population la moins soucieuse de sa vie privée. Servi depuis l'origine
canonique, il n'y a ni tiers ni motif à bloquer.

Effet de bord utile : **aucun enregistrement DNS nouveau**. Le préfixe `/p/` évite `/api/*`, qui
appartient déjà au service de leads.

### 2. Le tableau de bord n'est pas sur l'Internet public

Il écoute sur la boucle locale et sort par `tailscale serve --https=8443`, comme le cockpit. Seuls
les deux points d'entrée qu'un navigateur *doit* joindre pour enregistrer une visite sont publics.

### 3. Pas de bandeau, parce qu'il n'y a rien à consentir

Plausible ne dépose aucun cookie et ne stocke aucune donnée personnelle : l'adresse IP est combinée
au navigateur et à un sel renouvelé chaque jour pour produire une empreinte anonyme, jamais conservée.
La clé de thème dans `localStorage` reste donc la seule chose que ce site écrit dans un navigateur, et
elle relève des traceurs strictement nécessaires.

C'est le critère qui a départagé les options : ajouter un outil qui aurait imposé un bandeau aurait
dégradé chaque page du site pour mesurer les pages du site.

## Garde-fous obligatoires

- **`DISABLE_REGISTRATION` par défaut à `true`.** Une instance neuve n'a pas d'utilisateur, donc
  l'inscription doit être ouverte **une fois** pour créer le propriétaire, puis refermée. La valeur
  versionnée est la valeur sûre ; l'ouverture est un geste explicite dans `docker/.env`.
- **ClickHouse est bridé** (`docker/clickhouse/`) : plafond mémoire, journaux système supprimés. Il
  est l'invité de cinq services de production sur une machine **sans swap** ; un OOM pour compter des
  pages vues serait un échange inacceptable. Mesuré après mise en service : ~180 Mo.
- **La base Plausible entre dans la sauvegarde** (`pg_dump` dans `scripts/backup.sh`), en échec
  **non bloquant** : perdre l'historique d'audience est ennuyeux, perdre la sauvegarde des données
  clients parce que l'audience a échoué serait pire.
- **Le suivi ne tourne pas en développement** : `import.meta.env.PROD` est faux sous `astro dev`, ce
  qui tient la navigation locale hors des chiffres sans dépendre d'une variable qu'on oublierait.
- **La politique de confidentialité décrit ce traitement**, y compris le double usage transitoire de
  l'IP (anti-abus du formulaire + empreinte d'audience). Elle décrit ce que le code fait, pas ce
  qu'il pourrait faire.

## Conséquences

- Trois conteneurs de plus (~600 Mo au total, mesurés), et une base de plus à sauvegarder.
- Une étape manuelle restante : créer le compte propriétaire sur le tableau de bord tailnet, y
  déclarer le site `www.applied-geopolitics.com`, puis refermer l'inscription. Tant qu'elle n'est pas
  faite, la chaîne d'ingestion fonctionne (elle répond `202`) mais les événements sont écartés.
- Le jour où une seconde propriété doit être mesurée (HDDE, VERDICT), elle s'ajoute dans le même
  tableau de bord — mais ces surfaces sont `noindex` et derrière auth : les mesurer serait une
  décision distincte, pas une extension automatique de celle-ci.
