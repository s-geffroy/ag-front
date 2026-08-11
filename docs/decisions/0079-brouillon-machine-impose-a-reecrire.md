# 0079 — Un brouillon machine, imposé à réécrire

- **Statut** : accepté
- **Date** : 2026-08-11
- **Voisins** : [0074](0074-jugement-sur-titres-et-independance-des-marches.md) (phrase du promoteur
  requise), [0078](0078-intitule-du-modele-pour-choisir-jamais-pour-publier.md) (intitulé du modèle
  pour choisir), [0039](0039-cockpit-editorial-contradiction.md) (contradiction éditoriale),
  [0063](0063-red-team-prompt-hardening.md) (spotlighting)

## Contexte

L'ADR 0074 exige que le promoteur écrive lui-même la phrase publiée. À l'usage, cette exigence se
heurte à la page blanche : la personne a lu quatre titres, elle sait que le sujet compte, et elle
doit produire d'un coup une phrase juste sur ce que cela change pour un décideur.

La demande d'un pré-remplissage par LLM est donc légitime. Elle bute sur un fait mécanique qu'il
fallait établir avant de trancher : **le garde-fou anti-paraphrase ne compare la note qu'à
l'intitulé, au résumé et aux titres d'articles.** Une phrase fraîchement écrite par un modèle ne
ressemble à aucun de ces textes. Pré-remplir le champ sans rien d'autre n'aurait pas contourné la
règle de 0074 — **il l'aurait désactivée en silence**, ce qui est pire, parce que le refus aurait
continué d'exister et de donner l'impression de protéger.

## Décision

Le champ est pré-rempli par un brouillon, **et le brouillon entre dans les textes que la note ne
doit pas recopier**.

- `paraphraseCandidates(cluster, draft)` reçoit le brouillon en plus des trois sources historiques.
  Publier le brouillon tel quel est refusé en `422`, sous le champ de saisie.
- Le refus **nomme sa cause** : recopier le brouillon et recopier un titre demandent deux
  corrections différentes — s'approprier la phrase dans un cas, passer du fait à sa conséquence dans
  l'autre. Un message unique laissait la personne deviner laquelle.
- Le brouillon voyage dans `private_metadata` et repart au cockpit à la validation. Sans ce voyage,
  le serveur ne saurait pas ce qui a été mis sous les yeux de la personne.
- Le champ affiche « Brouillon machine — à RÉÉCRIRE. Le publier tel quel sera refusé. »

### Ce que le modèle reçoit, et ce qu'il en dit

Titres distincts, compteurs de diffusion, fenêtre d'observation, saillance amont, **et la fiche
corridor interne** (volumes de flux, état opérationnel, concentration du contrôle). Sans elle, le
brouillon ne pouvait que reformuler un titre ; avec elle, il parle de conséquence.

Le modèle renvoie deux champs typés qui accompagnent le brouillon dans la fenêtre : `basis` (ce sur
quoi la phrase s'appuie) et `cannot_say` (ce qu'un décideur voudrait savoir et que les données ne
portent pas — durée, chiffrage, source primaire). Une proposition qui déclare ses trous est
relisable ; une proposition lisse ne l'est pas.

### Sécurité

Les titres viennent du web ouvert : ce sont des données non fiables, encadrées par un marqueur
aléatoire par requête (spotlighting, ADR 0063) comme la contradiction éditoriale et le juge.
`injection_detected` / `injection_evidence` sont typés, et **une injection détectée annule le
brouillon** : on ne met pas sous les yeux d'un opérateur une phrase écrite pendant qu'on tentait de
piloter le modèle.

## Conséquences

- La page blanche disparaît ; la signature garde son sens.
- Un brouillon indisponible (LLM coupé, appel en échec) **n'empêche jamais de promouvoir** : la
  fenêtre reste ouverte, le champ vide, et la raison s'affiche. Le brouillon est un confort, pas une
  dépendance.
- Le coût d'un appel `gpt-4o` s'ajoute à chaque ouverture de fenêtre d'écriture — pas à chaque
  affichage de la liste des sujets.

## Ce que cette décision n'autorise pas

Publier une phrase machine. Le brouillon est un point de départ que le serveur refuse à l'arrivée.
Si un jour le refus devient contournable, cette ADR tombe avec lui : c'est le refus qui la porte,
pas l'intention.
