# 0066 — Consommation intégrale de la read API chokepoints, garantie par le build

- **Statut :** accepté
- **Date :** 2026-07-09
- **Contexte connexe :** ADR 0012 (Atlas ↔ read API), ADR 0013 (`read_tainted` interne uniquement),
  ADR 0035 (couplage HDDE ↔ chokepoints/CVI), ADR 0042 (VERDICT ne lit que le packet HDDE),
  ADR 0049 (pas de score CVI agrégé), ADR 0057 (résilience ENA), ADR 0062 (contrat épinglé),
  ADR 0065 (graphe dérivé), ADR 0069 côté producteur (métriques ≠ flux).
  Handoff : `docs/handoff/ag-back-deploy-0.4.0-and-consumer-needs.md` §5.

## Contexte

Le producteur (`ag-back`) sert la read API chokepoints en **0.6.0**, peuplée. Le consommateur
(`app-geo`) était resté épinglé sur **0.2.0**. Le drift-check (ADR 0062) était « vert » parce qu'il
comparait le déployé à un pin périmé : il ne mesurait rien.

Trois défauts en découlaient, tous **actifs en production** :

1. **Un breaking change livré dans un bump mineur.** `RiskOut.current_status` a été renommé en
   `assessment_status` + `risk_severity` en 0.4.0. La fiche publique et le cockpit lisaient encore
   l'ancien nom : ils affichaient un champ vide depuis des mois, sans erreur.
2. **La provenance était jetée.** `@ag/cvi` validait avec des `z.object` stricts, qui suppriment les
   clés non déclarées. `disclaimer`, `status`, `engine_version` et, par dimension, `source_refs` /
   `uncertainties` disparaissaient. Un candidat qui perd son étiquette « candidat » en route vers le
   packet HDDE devient indiscernable d'un fait — c'est une atteinte à l'intégrité, pas un manque de
   complétude.
3. **Un 403 permanent se lisait comme un jeu de données vide.** HDDE appelait
   `/chokepoints/{id}/perception-signals` avec un jeton `read`, alors que le producteur gate cette
   route inconditionnellement sur `read_tainted`. Un `.catch(() => null)` transformait l'échec
   d'autorisation en « ce corridor n'a aucun signal ». Le commentaire du code entérinait le mensonge.

Le fond commun : **`.passthrough()` rend un champ non déclaré invisible.** Il survit au parse, mais
aucun consommateur ne peut le lire, donc rien ne l'affiche jamais. La couverture par *chemin* ne voit
pas ce trou. `ChokepointDetail` n'a ainsi jamais déclaré `metrics[]` ni `geometries[]`, quatre
versions mineures durant.

## Décision

**Consommer 100 % du contrat, et le garantir au build plutôt que par vigilance.**

1. **Pin sur 0.6.0** + régénération du client Python de l'outillage de drift.
2. **Chaque champ du contrat est déclaré en zod.** 7 schémas absents ajoutés (`MetricOut`,
   `GeometryOut`, `RerouteDeltaOut`, `PerceptionConsensusOut`, `PerceptionSignalOut`,
   `DerivedRelationOut`, `DerivedRelationGraphOut`) ; 2 endpoints manquants câblés (`/derived/*`).
3. **Trois gardes dans `contract-coverage.test.ts`**, du plus grossier au plus fin :
   - *chemins* : chaque endpoint épinglé a une méthode client (`COVERED_PATHS`) ;
   - *champs* : chaque propriété **requise** de chaque schéma épinglé est déclarée en zod, avec une
     liste d'exemptions **explicites et commentées** ;
   - *consommateurs* : chaque endpoint épinglé est réclamé par une surface produit (`CONSUMERS`).
     Le client lui-même n'est pas un consommateur : une méthode câblée que personne n'appelle est un
     trou, pas une couverture.
4. **Le gate ADR 0049 devient structurel.** `CviAssessmentOut` **supprime** activement
   `aggregate_score` au parse, sur le modèle de `toPublicFeatureCollection` — une garantie du client,
   pas une convention de relecture.
5. **Un échec n'est plus un vide.** `ChokepointsApiError{status}` remplace un `Error` générique dont
   le message était re-parsé à la regex. Un `404` (absent) dégrade en silence ; un `403` (mauvais
   scope) ou un `5xx` est journalisé bruyamment.
6. **La perception passe par le dérivé, pas par la source.** HDDE lit le bloc `prediction_consensus`
   de `/analysis`, servi sous `read`, au lieu de `/perception-signals`, gated `read_tainted`. Les
   observations non-clearées restent restreintes ; leur consensus pondéré par la liquidité, qui est la
   partie utile à la décision, est redistribuable. Donner le jeton tainted à HDDE reste **exclu**
   (ADR 0013/0035 : HDDE est sur l'Internet public derrière auth applicative).

### Postures maintenues

- **Site public : conservateur.** Canonique enrichi uniquement (métriques avec `metric_kind`, dates
  d'épisodes, qualificateurs de volume). Aucun dérivé, aucun candidat, aucun enregistrement restreint.
  Audit du build : zéro occurrence de `aggregate_score`, `license_taint`, `read_tainted`, `Polymarket`
  ou `consensus_probability` dans les 121 pages générées.
- **Cockpit : tout, typé, avec ses disclaimers verbatim.** Seul détenteur du jeton `read_tainted`.
- **VERDICT n'appelle jamais l'API** (ADR 0042) : tout transite par le packet HDDE, désormais porteur
  de `corridor_analysis`, `corridor_relations` et `system_resilience`.

### Choix de rendu

- Les blocs de `/analysis` sont **auto-descriptifs** (`columns[]` + `rows[]`) : **une seule** table
  générique les consomme tous, présents et futurs. Coder 11 vues casserait à chaque retouche du
  producteur et perdrait silencieusement toute colonne nouvelle. Idem pour la fiche CCM 16 sections :
  on type l'enveloppe, jamais le corps.
- Un score nul n'engendre aucun candidat : « ce corridor n'est pas instrumentalisable » est une
  réponse, pas une menace. Noyer l'analyste serait pire que se taire.
- Un score `resilience` élevé est une **faiblesse** interne (contournement lent), pas une menace
  externe : l'échelle CVI 0–5 se lit « plus haut = plus vulnérable ».
- `system_resilience` est modélisé **au niveau du packet**, jamais par corridor : c'est une ligne
  globale sur le graphe entier, et la placer par candidat la travestirait.

## Conséquences

- Un bump producteur qui ajoute un endpoint **ou un champ requis** fait échouer le build tant que le
  front ne l'a pas typé et attribué à une surface. Le rattrapage périodique disparaît.
- Vérifié par mutation : retirer `RiskOut.risk_type` du schéma fait tomber la garde. À ce jour,
  **zéro champ optionnel non consommé**.
- Deux surfaces restent vides **par manque de données côté producteur**, pas par câblage : les 7 SFU
  SFIM sont en `skeleton` (aucun verdict, aucun scoring). L'écran SFIM le dit franchement plutôt que
  de masquer ses sections : cacher une section vide donnerait à un pipeline non peuplé l'apparence du
  travail fini. Voir le handoff de suivi.
- Le test de couverture des champs est **volontairement peu profond** (propriétés de premier niveau,
  une récursion dans `items`). Descendre dans les unions et les records serait fragile et sans valeur ;
  les champs optionnels manquants sont un avertissement, jamais un échec.

## Alternatives écartées

- **Donner un jeton `read_tainted` à HDDE** pour débloquer `/perception-signals` : viole ADR 0013/0035.
  Le bloc dérivé `prediction_consensus` porte la même information, sous le bon scope.
- **Publier le CVI sur le site public**, même « avec disclaimer » : ADR 0013/0049. Un disclaimer ne
  transforme pas un candidat en donnée publiable.
- **Scanner statiquement les quatre apps** pour prouver qu'un endpoint est consommé : fragile. Un
  registre `CONSUMERS` manuscrit est auditable et force une décision consciente quand la surface grandit.
- **Hard-typer les 11 blocs moteurs** : churn garanti à chaque retouche d'ag-back, pour zéro gain —
  le payload décrit déjà ses propres colonnes.
