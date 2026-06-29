# 0040 — HDDE : modèle de divergence (fin de la « dépendance cachée » tautologique)

- **Statut :** accepté
- **Date :** 2026-06-29
- **Contexte connexe :** ADR 0032 (moteur pack-driven), 0034 (red team), 0035 (chokepoints/CVI),
  0036 (modèle entreprise), 0027 (candidats ≠ faits).

## Contexte

Une revue critique a établi que le « cœur » de HDDE était **tautologique** :

- `hidden_dependency_score` n'était qu'un **relabel** d'une seule réponse (`VIS_RISK[tier2_visibility]`).
- `pickPrimaryDiagnosis` **forçait** `hidden_second_tier_dependency` à toujours gagner.
- Le diagnostic se réduisait à : « vous dites ne pas voir votre rang-2, donc votre risque est un
  rang-2 caché » — aucune découverte, aucun acteur/flux/juridiction réellement nommé.

En outre, le livrable phare (`diagnostic_fiche`) référençait `probable_real_dependency` et
`critical_flow` que le moteur **ne produisait jamais** → sections exportées **vides**. Et
`flow_criticality_score` était quasi-toujours 0 (les options de `dependency_breaks_first` n'étaient pas
dans la table de polarité, donc sans signal numérique).

## Décision

**La « dépendance cachée » est redéfinie comme une DIVERGENCE entre la résilience _déclarée_ et la
résilience _prouvée_.** La découverte, c'est l'écart, pas la reformulation d'une réponse.

- `hidden = exposure × blindness` (normalisé 0..5) :
  - **exposure** = `max(supplier_dependency, flow_criticality)` — combien la défaillance coûte.
  - **blindness** = moyenne de (invisibilité rang-2, substitution non prouvée, preuve faible).
  - Conséquence : une dépendance **critique mais prouvée et visible** = dépendance **connue/assumée**
    → score caché **bas** ; une dépendance **critique mais invisible / déclarée remplaçable sans
    preuve** → score caché **élevé** (l'angle mort réel). Implémenté côté interview (`scoring.ts`,
    `divergenceSignals`) et côté acteur (`enterprise.ts`).
- **`pickPrimaryDiagnosis` classe par force du signal** (score de la dimension qui sous-tend chaque
  pattern), départage des ex æquo par **saillance** (préférer le diagnostic le plus spécifique /
  « découverte »). Plus aucun gagnant codé en dur (`diagnostic.ts`).
- Le moteur **produit** désormais `probable_real_dependency` (description + hypothèse de localisation +
  base de signaux + score de divergence) et `critical_flow` (type de flux, substituabilité, délai
  d'impact). Les sections autrefois vides du livrable se remplissent.
- **`answer_risk` par option** ajouté au schéma du pack : `dependency_breaks_first` mappe désormais ses
  options vers un risque 0..5 (toute défaillance concrète = criticité élevée ; `unknown` = pire).

## Justification

Le modèle de divergence est **fondé sur des patterns déjà présents dans le pack**
(`substitution_capacity_overestimated`, `hidden_second_tier_dependency`) — on implémente l'intention,
on n'invente pas une méthode. Il est **non-tautologique** : prouvé par deux tests
(`scoring.test.ts`) — sur-confiance (déclaré remplaçable + non prouvé + invisible) ⇒ caché 5/5 ;
dépendance également critique mais prouvée et visible ⇒ caché ≤ 1/5.

## Conséquences

- Toutes les sorties restent des **candidats à valider** (ADR 0027) ; rien ne mute le canonique.
- Le `pack_hash` change (modification de `questions.yaml`) — traçabilité préservée par le recalcul.
- **Reste à faire (chantiers méthode distincts, non couverts ici) :** brancher le registre de preuves
  sur le score (les liens de preuve n'influencent pas encore la confiance), et réinjecter le
  `verdict_pressure` de la red team dans le diagnostic (aujourd'hui purement consultatif).
</content>
</invoke>
