# 0067 — Canal d'échange de fichiers avec ag-back, et corrélation réponse ↔ question

- **Statut :** accepté
- **Date :** 2026-07-10
- **Contexte connexe :** ADR 0062 (contrat épinglé), ADR 0066 (consommation intégrale de la read API).
  Handoffs : `docs/handoff/ag-back-*.md`. Protocole : `scripts/exchange/PROTOCOL.md`.

## Contexte

`app-geo` (« ag-front ») et `chokepoints` (« ag-back ») sont développés par deux agents LLM distincts,
sur deux machines. Leur coordination — versions du contrat, trous de données, corrections mutuelles —
passait par des documents versionnés dans `docs/handoff/`, **sans canal de transport**. Rien ne
garantissait que l'agent distant les reçoive. De fait, le handoff 0.7.0 (commit `fe05398`) n'a jamais
été lu par ag-back.

Un répertoire partagé existe désormais : `/mnt/exchange`, montage sshfs de
`deploy@srv1305127:/home/deploy/exchange`, avec `ag-front-out/` et `ag-back-out/`.

Un répertoire partagé, seul, ne suffit pas. Aucun des deux agents n'est un démon : ils s'exécutent par
sessions, jamais forcément en même temps, et personne n'écoute le répertoire. Trois propriétés
manquent nativement, et une quatrième est le véritable enjeu :

1. **Ordre total.** Les `mtime` du montage sont arrondis à la seconde (mesuré : `10:15:51.000000000`).
   Deux dépôts d'une même session peuvent les partager.
2. **Lecture non déchirée.** Une écriture directe est visible partiellement par le lecteur distant.
3. **Preuve de lecture.** Rien ne distingue « pas encore lu » de « lu, sans objet ».
4. **Corrélation.** Si nous déposons `0002` corrigeant `0001` et qu'ag-back répond après n'avoir lu
   que `0001`, sa réponse cite un numéro qui existe, se lit comme valide, et traite une question que
   nous ne posons plus. **Une réponse à une question retirée est pire qu'une absence de réponse :
   elle a l'air d'être une réponse.**

## Décision

Un protocole de fichiers, `protocol_version: 1`, décrit dans `scripts/exchange/PROTOCOL.md` et
implémenté par `scripts/exchange/{common,deposit,inbox}.sh`. Quatre choix structurants :

### Un seul écrivain par répertoire, plutôt qu'un verrou

Chaque côté n'écrit que dans sa propre boîte, **y compris ses accusés de lecture** (qui vont dans son
propre manifeste, jamais dans celui d'en face). Il n'y a donc jamais d'écriture concurrente sur un
fichier, et aucun verrou n'est nécessaire — ce qui tombe bien : les verrous consultatifs sur sshfs ne
sont pas dignes de confiance.

### L'identité d'un message est son contenu, pas son numéro

`msg_id = sha256(contenu)`. La séquence `NNNN` ne sert qu'à l'ordre et à la lecture humaine. Un dépôt
est **immuable** ; corriger, c'est déposer un nouveau fichier portant `supersedes: <ancien msg_id>`.

C'est ce qui résout (4). Une réponse porte `in_reply_to: <msg_id>`, et « ce fichier-là, cette
version-là » devient une affirmation vérifiable :

| `in_reply_to` désigne…                    | Verdict                                                |
| ----------------------------------------- | ------------------------------------------------------ |
| un de nos `msg_id`, non remplacé          | ✓ répond bien à ce fichier-là                          |
| un `msg_id` que nous avons remplacé       | ✗ **réponse périmée** — ne pas consommer, redéposer    |
| un `msg_id` jamais émis                   | ✗ **réponse orpheline** — canal désynchronisé          |
| `null`                                    | · message spontané, légitime                           |

La contrainte est **symétrique et mécanique** : `deposit.sh --in-reply-to` refuse un `msg_id` absent
du manifeste d'en face ou que celui-ci déclare remplacé. On ne peut pas répondre à côté.

L'adressage par contenu paie une seconde fois : recalculer le sha du fichier reçu vérifie
simultanément son intégrité (tronqué / en cours d'écriture) et son identité. Une seule opération, deux
garanties.

**Une empreinte s'abrège, elle ne se devine pas** (ajouté le 2026-07-10). `inbox.sh` affiche des
`msg_id` tronqués à 12 caractères, et exiger les 64 au moment d'`--ack` ou d'`--in-reply-to` invitait à
**compléter l'empreinte à la main** depuis le préfixe affiché — c'est-à-dire à fabriquer un
identifiant. Nous l'avons fait, et le garde de corrélation l'a attrapé. Les scripts acceptent désormais
un **préfixe non ambigu** (≥ 8 caractères hexadécimaux), résolu contre le manifeste qui l'atteste — le
leur pour `--in-reply-to`, le nôtre pour `--supersedes`. Un préfixe ambigu est **refusé**, avec la
liste des candidats : choisir silencieusement l'un des deux serait exactement la défaillance que ce
protocole existe pour empêcher. C'est un changement d'**outillage**, pas de protocole : le fil ne porte
que des empreintes entières, et `PROTOCOL.md` reste inchangé (sha `a69696038e49…`, qu'ag-back a épinglé).

### Un manifeste append-only chaîné, plutôt que l'état du répertoire

`manifest.jsonl` par boîte, une ligne JSON par événement (`msg` | `ack`), chaque ligne portant `prev`
= sha256 de la ligne précédente. La chaîne rend détectable toute ligne perdue ou réécrite : une
conversation tronquée ne peut pas passer pour complète. Le manifeste est écrit **après** le fichier,
donc il n'annonce jamais un fichier absent.

### Écriture atomique par `rename(2)`

`.NNNN.tmp` puis `mv` dans le même répertoire — vérifié atomique sur ce montage (un observateur qui
échantillonne le nom cible pendant un dépôt de 900 Ko ne voit qu'un seul sha, jamais d'intermédiaire).

### La règle qui rend la lecture certaine

Elle ne tient pas dans un script mais dans `CLAUDE.md` : `inbox.sh` **doit** être exécuté au début de
toute session touchant la read API, son contrat ou un handoff, et avant tout dépôt ; et un message
signalé périmé, orphelin ou corrompu **ne doit pas** être consommé. La certitude vient de l'asymétrie :
*lire* est obligatoire et vérifié, *acquitter* n'est qu'un effet de bord du script, *répondre à côté*
est refusé au dépôt.

## Conséquences

- Le repo reste **canonique** pour les handoffs (`docs/handoff/`, référencé par l'ADR 0066) ; l'outbox
  reçoit une **copie** octet-pour-octet, déposée par `deposit.sh`. Le contenu de `/mnt/exchange` n'est
  pas versionné.
- Tant qu'ag-back n'a pas adopté le protocole, `inbox.sh` **dégrade** : il liste les fichiers, annonce
  le canal non conforme, et refuse d'acquitter. Il ne présente aucun fichier comme une réponse
  corrélée — le mode dégradé ne fabrique pas la certitude qu'il ne peut pas donner.
- Les scripts sont **hôte-only** : le montage n'est pas exposé au service `tools`. C'est une exception
  explicite à la règle Docker-only, du même ordre que `gh` et `pplx`.
- Garde-fous : texte ≤ 1 Mio, sujet obligatoire, **aucun secret** (la boîte est lisible par le compte
  `deploy` d'en face). Ce qui transite est un document ; un chiffre déposé reste un **candidat en
  attente de validation humaine**, jamais un fait — la règle d'intégrité des données s'applique au
  canal comme au reste.

## Alternatives écartées

- **Se fier au `mtime` / au « dernier fichier ».** Résolution d'une seconde, et surtout : la fraîcheur
  ne dit rien de la corrélation. C'est le mauvais critère.
- **Un numéro de séquence comme identité.** Un `seq` survit à une réécriture du fichier ; il ne
  distingue pas deux versions. Une réponse citant `0001` reste ambiguë.
- **Un verrou (`flock`) sur le répertoire partagé.** Inutile sous l'invariant un-écrivain-par-boîte, et
  peu fiable sur sshfs.
- **Un dépôt git commun / une branche d'échange.** Lourd pour deux agents qui échangent des notes, et
  ne résout ni l'atomicité de lecture, ni l'accusé.
