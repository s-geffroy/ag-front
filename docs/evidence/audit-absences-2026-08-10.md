# Audit des absences dans les couches amont — 2026-08-10

> **CANDIDATS MESURÉS EN ATTENTE DE VALIDATION HUMAINE.** Application de l'ADR 0077 aux couches que
> la journée n'avait pas regardées. Contrat épinglé `0.18.0`, 40 chemins. Mesures faites contre l'API
> vivante, pas contre la spécification.

La question posée à chaque couche : **un `0`, un `[]`, un champ manquant peut-il y vouloir dire deux
choses — et si oui, le consommateur peut-il les distinguer ?**

---

## A. Ce qui marche, et sert de modèle

Trois mécanismes existants résolvent déjà le problème. Ils fixent ce qu'on demande ailleurs.

| Couche | Mécanisme | Ce qu'il permet de dire |
| --- | --- | --- |
| `/news`, `/chokepoints/{id}/news` | `run_id` + `generated_at` + `run_notes` | `count: 0` **avec** `run_id` = flux vide honnête ; **sans** = aucune agrégation n'a tourné |
| `perception-signals` | **403** hors scope `read_tainted` | Une erreur est honnête : elle ne se confond pas avec « aucun signal » |
| `cvi-assessment` | `status: candidate` | Le statut épistémique est **dans** la charge utile |

`run_notes` va plus loin que la distinction vide/inconnu : la sortie du jour déclare que **1 349
articles n'ont pas tenu** dans les créneaux, et que **23 sur 400 n'ont été ni retenus ni écartés** —
« rien n'a été décidé à leur sujet ». C'est le seul endroit du contrat où une couche dit ce qu'elle
ignore d'elle-même.

---

## B. Troncature silencieuse — une liste partielle ressemble à une liste complète

**Le défaut le plus concret de cet audit, et il ne concerne pas le vide mais le trop-plein.**

`GET /chokepoints/{id}/event-signals` répond par un **tableau nu** : ni total, ni indicateur de
troncature. `limit` vaut **500 par défaut**, maximum 2000.

Mesuré sur Ormuz :

| `limit` demandé | Lignes rendues |
| --- | --- |
| 500 (défaut) | **500** |
| 900 | **900** |
| 2000 | **2000** |

Il y a donc **au moins 2 000** signaux, et la réponse par défaut en montre 500 sans le dire.

Contraste, même endpoint, sur Malacca : **53** au défaut, **53** à `limit=2000`. Là, la liste était
complète.

**Les deux réponses ont la même forme.** Un consommateur ne peut pas savoir dans lequel des deux cas
il se trouve — c'est précisément ce que `run_notes` empêche sur `/news`.

### Ce que cela nous coûte, chez nous

- `apps/hdde-api` demande **20** signaux (`integrations/chokepoints.ts:209`) pour nourrir le red team
  et le paquet de diagnostic ;
- `apps/cockpit` en demande **100** (`server/api.ts:313`).

Sur un corridor actif, les deux reçoivent une troncature et la traitent comme *les* signaux. Le
défaut est partagé : leur réponse ne le dit pas, notre code ne le demande pas.

---

## C. Absences non décidables

### C1. `actors`, `alternatives`, `metrics` sur un objet peu couvert

Mesuré sur `p3_infrastructure_chokepoint_swift_financial_messaging` :
`actors=0`, `alternatives=0`, `metrics=0`, `event-signals=0`.

SWIFT n'a pas *zéro* acteur identifiable — la coopérative elle-même, l'UE, le Trésor américain sont
publiquement documentés et cités dans la littérature. Ces zéros disent bien plus probablement « pas
encore renseigné » que « rien à renseigner ». **Rien dans la réponse ne permet de trancher**, et un
consommateur qui rendrait « aucune alternative » sur cette fiche publierait une affirmation fausse.

Comparaison : Ormuz `actors=2`, Suez `actors=2`, Malacca `actors=3`, sur un `/actors` global de
**13 acteurs** pour l'ensemble de la base. La couche est manifestement en cours de constitution — ce
qui est légitime, et ce qui rend chacun de ses zéros indécidable.

### C2. `episodes` — le cas déjà signalé, confirmé à l'échelle

**18 épisodes** pour toute la base. Ormuz n'en porte qu'un, **clos en 2019**, pendant une crise de
cinq mois que la couche `metrics` du même objet mesure à 2,5 transits/jour. Malacca en porte **0**.

Impossible de distinguer « corridor calme » de « personne n'a ouvert d'épisode ».

### C3. Les endpoints globaux répondent par des tableaux nus

`/actors`, `/relations`, `/sources`, `/episodes`, `/analytics/results`, `/analytics/engine-runs`,
`/alerts` renvoient un tableau JSON **sans enveloppe** : ni `count`, ni `generated_at`, ni identifiant
de passe.

Une liste nue ne peut pas dire « voici tout ce qui existe » plutôt que « voici ce que j'ai trouvé ».
Sur `/analytics/results` (200 lignes) et `/analytics/engine-runs` (1 304), la question n'est pas
théorique : rien n'indique si le chiffre est un total ou un plafond.

---

## D. Ce que nous demandons — une seule chose, déclinée

Le contrat sait déjà faire, sur `/news`. La demande est d'étendre le même mécanisme :

1. **Déclarer la troncature.** Sur `event-signals` d'abord : un `count` total, ou une note du type
   `run_notes`, ou simplement une enveloppe. Aujourd'hui la valeur par défaut ment par omission sur
   tout objet actif.
2. **Dater la couche plutôt que l'objet.** Un marqueur de fraîcheur au niveau de la couche
   (`actors_reviewed_at`, `episodes_reviewed_at`) suffirait à rendre les zéros décidables. *Une
   absence datée d'hier est une information ; une absence non datée n'en est pas une.*
3. **Envelopper les listes globales.** Un `count` et un `generated_at` sur les sept endpoints nus.

## E. Ce que nous ne ferons pas

Compenser par une heuristique locale. Nous l'avons refusé pour Ormuz et nous le refusons ici : nous
n'avons ni historique par objet (une période par appel) ni base de comparaison entre objets. Une
règle transversale étiquetterait à tort les objets légitimement peu couverts. **Un trou visible vaut
mieux qu'un faux positif silencieux** (ADR 0077).

En revanche, le défaut de troncature est **partiellement nôtre** : demander 20 puis traiter le
résultat comme complet est une faute de consommation, indépendante de leur réponse. À corriger de
notre côté sans attendre.
