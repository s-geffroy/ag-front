# 0036 — HDDE : modèle « entreprise » (entités de 1er rang + scoring par acteur)

- **Statut :** accepté
- **Date :** 2026-06-26
- **Contexte connexe :** ADR 0032 (HDDE port TS), 0034 (red team), 0035 (chokepoints/CVI), SPEC_V1.

## Contexte

La V1 du starter pack part d'**un seul acteur visible**. Pour produire un **topo global et complet**
d'une entreprise, il faut modéliser l'entreprise dans son ensemble : **plusieurs fournisseurs,
plusieurs clients, plusieurs sites**, plus les partenaires (banques, assureurs, logistique,
régulateurs). Chaque acteur critique doit être scoré, et l'ensemble synthétisé.

## Décision

- **Le cas = une étude d'entreprise.** Profil ajouté au cas (`hq_country`, `employee_band`,
  `revenue_band`, `description`). `critical_actor_*` devient l'acteur **principal** (optionnel) ; le
  roster complet vit dans des entités.
- **Table `case_entities`** (entités de 1er rang) avec un discriminant `entity_type`
  (`supplier | customer | site | logistics_provider | bank | insurer | regulator | partner`) et des
  attributs structurés communs : `criticality` (0-5), `substitutability`, `tier2_visibility`,
  `jurisdiction_risk`, `time_to_impact`, `single_source`, `share_pct` (concentration), `country`,
  `tier`, `what_it_enables`.
- **Scoring par acteur** (`engine/enterprise.ts`) : les attributs d'une entité → les 9 dimensions du
  pack → un **verdict par acteur** (réutilise `deriveVerdict`). Un client dominant est traité comme
  une dépendance de concentration (`share_pct` → score).
- **Synthèse entreprise** : scores agrégés = `max(interview, pire acteur)` par dimension ; **verdict
  entreprise** = posture la plus sévère (interview ∪ scores agrégés ∪ acteurs) ; **matrice
  dépendance×acteur** désormais peuplée ; analyse de **concentration** (client top-share/HHI,
  concentration géographique fournisseurs, source unique, angles morts rang 2) → red flags entreprise.
- **La red team** reçoit un résumé du roster (acteurs + pays) en plus du contexte chokepoints, pour
  attaquer le panorama complet.
- **API** : CRUD `/api/cases/:id/entities` ; la génération de packet consomme le roster.

## Justification

Le verdict aggregé/par-acteur rend l'analyse fidèle à une vraie entreprise (ex. fournisseurs
source-unique Taïwan/Chine + gatekeeper logistique → `escalate`), là où un modèle mono-acteur ne
voyait qu'une dépendance isolée. La table unique polymorphe (vs 4 tables quasi identiques) garde le
code simple tout en exposant des groupes « dédiés » par type dans l'API/UI.

## Conséquences

- Migration additive : colonnes `cases` ajoutées via `ALTER TABLE ADD COLUMN` (idempotent) ; nouvelle
  table `case_entities` (`CREATE TABLE IF NOT EXISTS`). Schéma **v3**.
- Tout reste **candidat à valider** (ADR 0027) ; aucune mutation canonique.
- Scoring par-acteur encore heuristique (V1) ; affinable (pondérations, evidence par acteur) en V2.
- Exemple de référence : cas démo **Dürr Group** (`seed:demo`), illustratif/sourcé au niveau secteur.
