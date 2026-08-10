# 0077 — Le statut épistémique d'une absence

- **Statut** : accepté
- **Date** : 2026-08-10
- **Voisins** : [0066](0066-consommation-integrale-read-api.md) (consommation intégrale du contrat),
  [0013](0013-tainted-scope-internal-only.md) (séparation des scopes),
  [0071](0071-consensus-et-news-promue-sur-atlas-public.md) (consensus et news sur l'Atlas public),
  [0027](0027-thinking-skills-guardrails.md) (candidats ≠ faits)

## Contexte

Trois défauts trouvés le même jour, à trois étages différents de la chaîne, avec la même forme.

**1. `cp_alpha`.** L'API amont servait un enregistrement de démonstration, « Alpha Strait », parmi
les corridors réels. Nous l'avons publié : page, sitemap, export GeoJSON. Aucune de nos deux gardes
ne pouvait l'attraper. `contract-coverage.test.ts` (ADR 0066) vérifie que nous consommons chaque
champ — elle est aveugle au *contenu* par construction. `toPublicFeatureCollection` filtre des
**champs**, jamais des **enregistrements**. Entre les deux, la question « cet objet est-il réel ? »
n'était posée par personne, des deux côtés du contrat.

**2. Les épisodes d'Ormuz.** Le détroit est restreint de plus de 90 % depuis cinq mois. La couche
`episodes` de l'API n'en porte rien : un seul épisode, clos en 2019. Sa couche `metrics`, dans la
**même réponse**, donne 2,5 transits par jour contre 230,5 à Malacca. Nous avions justement câblé un
bandeau « perturbation en cours » qui lit leur `status` : il n'affiche rien sur Ormuz. Rien dans le
contrat ne permet de distinguer *« aucun épisode parce que rien ne se passe »* de *« aucun épisode
parce que personne ne l'a ouvert »*.

**3. Le flux d'actualités.** Ici, le producteur a résolu le problème, et c'est le contre-exemple qui
prouve que c'est faisable : `count: 0` **avec** un `run_id` est une semaine calme ; `count: 0`
**sans** `run_id` signifie qu'aucune agrégation n'a tourné. Deux états opposés, distingués par un
champ. Sans lui, un pipeline en panne se serait lu « pas d'actualité ».

La forme commune : **l'absence est encodée identiquement, qu'elle soit un fait ou une ignorance.**
Et par défaut, un lecteur — humain ou code — lit une absence comme un fait rassurant.

## Décision

Une absence n'est pas une donnée tant qu'elle ne porte pas son propre statut. Quatre règles.

### 1. Ne jamais rendre une absence comme une affirmation

Aucune surface publique ne dit « aucune perturbation », « pas d'actualité cette semaine », « rien à
signaler ». Ces phrases sont des **affirmations**, et ce sont précisément celles qui pourrissent
quand personne n'alimente. Une surface non alimentée doit **disparaître**, pas se déclarer calme.

Application : `/veille` et son entrée de nav quittent le build quand rien n'est promu ; la bande
d'accueil s'efface passé 21 jours ; les pages légales incomplètes ne sont pas construites. Le
bandeau de perturbation, lui, énonce sa propre limite : « l'absence d'épisode sur une autre fiche ne
signifie pas qu'elle est calme ».

### 2. À la consommation, demander si le contrat sait distinguer

Avant de dériver quoi que ce soit d'une absence servie par une source externe, la question est :
**le contrat permet-il de séparer le vide constaté du vide non renseigné ?**

- S'il le permet (`run_id`), la distinction est **obligatoire** dans le code appelant.
- S'il ne le permet pas, l'absence vaut **inconnu**, jamais « rien ». On ne construit pas de
  conclusion dessus, et on le dit à l'endroit où ça se voit.

### 3. Ne pas compenser un trou amont par une heuristique locale

Tentation réelle, écartée le jour même : puisque leur couche `episodes` rate Ormuz, écrire un
détecteur d'écart de métrique chez nous. Refusé — l'API expose une période par appel, donc aucun
historique pour comparer un objet à lui-même, et comparer entre objets ne veut rien dire (Malacca
tourne légitimement deux ordres de grandeur au-dessus d'un petit détroit). Toute règle transversale
aurait étiqueté à tort les petits chokepoints.

**Un trou visible vaut mieux qu'un faux positif silencieux.** Le correctif appartient à qui détient
la donnée ; notre travail est de le signaler, pas de le simuler.

### 4. À la production, dater ou qualifier nos propres absences

Ce que nous servons obéit à la même règle. Un store absent et un store vide ne disent pas la même
chose : le premier signifie que le dispositif n'a jamais tourné, le second qu'il a tourné et n'a rien
retenu. `promotionState` les distingue ; le digest hebdomadaire crie sur le premier et se contente de
compter sur le second.

Quand un état vide est légitime, il porte une date : `/veille` affiche « dernière revue éditoriale ».
**Une absence datée est une information ; une absence non datée n'en est pas une.**

## Garde-fous obligatoires

- Toute nouvelle consommation d'un endpoint amont vérifie **explicitement** si `0`, `[]`, `null` ou
  un champ manquant peuvent signifier deux choses. La réponse va dans le code, pas dans la tête de
  qui l'a écrit.
- Aucune surface publique n'affirme la tranquillité. Une garde de rendu s'écrit « n'affiche rien si
  vide », jamais « affiche “rien à signaler” si vide ».
- Un signalement amont sur un trou de ce type se dépose (ADR 0067) en nommant la **distinction
  manquante**, pas seulement la valeur fausse — c'est la distinction qui se corrige une fois pour
  toutes.

## Conséquences

- Deux handoffs déposés le 2026-08-10 portent déjà cette formulation (`cp_alpha`, épisodes d'Ormuz),
  et suggèrent la même piste : un marqueur de fraîcheur de couche (`…_reviewed_at`) qui daterait
  l'absence.
- Le coût assumé : nos surfaces disparaissent plus souvent qu'elles ne rassurent. Un visiteur qui ne
  voit pas de bloc de veille n'apprend rien — c'est exact, et c'est mieux que d'apprendre quelque
  chose de faux.
- Cet ADR est **transversal** : il ne remplace aucune décision existante, il ajoute une question à
  poser à chacune. La prochaine occurrence sera ailleurs, dans une couche que nous n'avons pas encore
  regardée.
