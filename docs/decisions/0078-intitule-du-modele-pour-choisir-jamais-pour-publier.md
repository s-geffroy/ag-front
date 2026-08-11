# 0078 — L'intitulé du modèle sert à choisir, jamais à publier

- **Statut** : accepté
- **Date** : 2026-08-11
- **Amende** : [0074](0074-jugement-sur-titres-et-independance-des-marches.md) (prose du modèle
  jamais rendue)
- **Voisins** : [0077](0077-statut-epistemique-d-une-absence.md) (statut épistémique d'une absence),
  [0071](0071-consensus-et-news-promue-sur-atlas-public.md) (news promue sur l'Atlas public)

## Contexte

L'ADR 0074 a banni la prose du modèle — `headline`, `summary_text` — de tout affichage. Le motif
tenait : valider un regroupement sur le résumé d'un modèle, après n'avoir lu que les titres que ce
résumé résume, ferme le circuit sans qu'aucun humain n'ait ajouté de connaissance.

La règle a été appliquée à la lettre partout, y compris dans la **fenêtre de sélection**. Résultat
mesuré à l'usage, le 2026-08-11 : le menu proposait

```
security · 220 art. · 08/08 → 11/08 · wmal.com
security · 9 art.   · 10/08 → 11/08 · arabnews.com
policy   · 73 art.  · 10/08 → 11/08 · cnn.com
```

Sept des quinze regroupements d'Ormuz portaient l'étiquette `policy` et trois `security`. **Aucun
choix n'était possible.** L'opérateur ouvrait donc les regroupements au hasard, ce qui est
exactement l'inverse du but poursuivi : la règle censée forcer la lecture forçait le tirage au sort.

Or les intitulés existent et sont utilisables — « L'Iran lie la réouverture du détroit d'Ormuz à des
concessions américaines », « Les marchés et les prix du pétrole réagissent à l'incertitude ».

## Décision

L'intitulé du modèle est **affiché pour choisir**, et **jamais publié**.

Trois gardes rendent cette réouverture tenable, et elles préexistent toutes :

1. **Le marquage.** Le libellé du champ dit d'où vient le texte — « Sujet — intitulé proposé par le
   modèle, à ne pas reprendre » — et chaque aperçu le préfixe de `⟨modèle⟩`. Le marquage porte sur
   le bloc, pas sur chaque ligne : Slack plafonne une option à 75 caractères et un préfixe par ligne
   mangerait l'intitulé.
2. **Le poids d'abord.** L'étiquette ouvre sur `63 méd. ·` puis l'intitulé. Ce qui est lu en premier
   est une mesure, pas une phrase.
3. **Le refus de recopie.** `paraphraseCandidates` contient déjà `headline` et `summary_text` : une
   note qui reprend l'intitulé est refusée par le cockpit, en `422`, sous le champ de saisie. C'est
   la garde décisive — elle rend l'usage paresseux impossible plutôt qu'improbable.

Le périmètre de 0074 est donc réduit à ce qu'il visait vraiment : **la publication**. Le bloc public
`PromotedNewsBlock.astro` ne rend toujours que deux textes — les titres d'articles, mots des
éditeurs attribués et liés, et la phrase du promoteur, signée. L'intitulé du modèle reste dans le
magasin comme trace de ce qui avait été proposé.

## Conséquences

- Choisir un sujet redevient un acte informé ; lire reste obligatoire pour écrire.
- Le test qui gardait « aucune prose du modèle dans l'étiquette » change de garde plutôt que de
  disparaître : il vérifie désormais que le chiffre précède la prose, et que la catégorie prend le
  relais quand le modèle se tait.
- Une dépendance nouvelle : la **qualité** de `headline` compte maintenant pour nous. Elle est
  produite par `news-agg-0.2.0` chez ag-back ; sa dérive nous concerne, et se signale par handoff.

## Ce que cette décision n'autorise pas

Elle n'ouvre pas la porte à publier de la prose de modèle « en la marquant ». Le marquage est une
aide au tri interne, pas un label de conformité. Un texte que personne n'a écrit ne devient pas
publiable parce qu'on a écrit à côté qu'il vient d'une machine.
