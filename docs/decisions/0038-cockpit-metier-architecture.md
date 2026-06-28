# ADR 0038 — Architecture du cockpit par métier + espaces de sortie pilotés par config

- **Statut** : accepté (2026-06-28)
- **Contexte** : ADR 0005 (cockpit interne Tailscale-only), ADR 0037 (conformité Charte de Munich,
  gate `compliance_done`), modèle E-light du cockpit (`config / deliverables / milestones / metrics /
  contacts / quality_gates`).

## Contexte

Le cockpit exposait **9 vues à plat** dans une barre latérale unique (Cockpit, Kanban, Roadmap,
Quality Gates, Revue, Scorecard, Acquisition, Exploration, Dépôts), sans regroupement par activité.
Les trois types de sorties éditoriales (dossiers, fiches Atlas, notes) partageaient les **mêmes**
vues (Revue, Dépôts, Lire) sans distinction, ce qui rendait illisible « où en est tel dossier » vs
« où en est telle fiche ». Il manquait une **différenciation claire entre les métiers** : suivi du
projet, gestion commerciale, et l'écriture de chaque type de sortie.

## Décision

Réorganiser le cockpit **par métier**, avec une barre latérale à **5 sections** :

1. **Accueil** (transverse) — santé globale, prochaine action, blocages, alertes qualité, jalons 90j,
   et une **synthèse cross-domaine** des indicateurs.
2. **Suivi du projet** — **Pipeline** (board global d'avancement, filtrable par type), **Roadmap**,
   **KPIs projet**.
3. **Gestion commerciale** — **Acquisition** (pipeline contacts), **KPIs commerciaux**.
4. **Espaces de sortie** — **un espace par type de sortie éditoriale** (Dossiers, Fiches Atlas,
   Notes, …), chacun regroupant en onglets : **Suivi** (board verrouillé au type), **Gates & Munich**
   (matrice des gates + référence + checklist Munich, ADR 0037), **Revue** (index de lecture),
   **Sources** (dépôts rattachés, lecture seule).
5. **Outils** (transverse) — **Exploration** (base chokepoints, lecture seule), **Dépôts** (outil
   complet de dépôt/collage).

### Principes structurants

- **Espaces de sortie pilotés par configuration.** La liste des types de sortie et leurs métadonnées
  d'affichage vivent dans `apps/cockpit/data/config.json#output_types`
  (`{ type, slug, label, icon, content_type }`), validés par le schéma `Config` (`@ag/schema`).
  Une **seule** route `/sorties/:slug` et une **seule** page `OutputWorkspacePage` les servent toutes.
  ⇒ **Ajouter un futur type de sortie est un changement de données**, pas de code (au plus une icône
  à enregistrer dans le registre frontend `src/lib/outputs.ts`, les icônes lucide n'étant pas
  sérialisables).
- **Hybride pipeline / gates.** L'avancement **global** (tous types) est dans Suivi projet ; le board
  **verrouillé au type** et les gates/Munich détaillés sont dans chaque espace de sortie. Une seule
  implémentation de board/carte/détail (`DeliverableBoard`, prop `forcedType` / `showTypeFilter`).
- **Scorecard ventilé + synthèse.** Chaque tier de `metrics.json` porte un `domain`
  (`project | commercial`, absent ⇒ `project`). Les KPIs sont ventilés par métier (`ScorecardTiers`
  avec prop `domain`) et une synthèse compacte cross-domaine s'affiche sur l'Accueil.
- **Lecture + suivi uniquement.** Le cockpit ne contient **aucun éditeur de contenu** : l'écriture
  reste en Markdown/Git. Les espaces de sortie lisent (Revue/Lecteur), suivent le statut (board), et
  contrôlent les gates ; l'onglet Sources est en lecture seule (le dépôt reste dans l'outil global).
- **Compatibilité ascendante.** Les anciennes routes redirigent (`/kanban → /suivi/pipeline`,
  `/revue → /sorties/dossiers`, `/scorecard → /suivi/kpis`, `/depots → /outils/depots` en préservant
  la query `?deliverable=`, etc.) pour ne pas casser favoris et liens internes.

## Conséquences

- Logique des anciennes pages monolithiques extraite en composants partagés réutilisables
  (`DeliverableBoard`, `QualityGateMatrix`, `MunichMatrix`, `RequiredGatesReference`, `ReviewList`,
  `UploadsList`, `ScorecardTiers`). Pages `KanbanPage`/`QualityGatesPage`/`ReviewPage`/`ScorecardPage`
  supprimées.
- **Contrainte de schéma** : toute clé ajoutée aux données du cockpit (`output_types`, `domain`) doit
  être déclarée dans `@ag/schema`, sinon Zod la dépouille silencieusement en lecture **et** écriture
  (`server/store.ts` fait `schema.parse()` des deux côtés).
- Le décalage `type` de livrable (`atlas_fiche`) ↔ dossier de contenu (`atlas`) est porté
  explicitement par `output_types` (`type` vs `content_type`).
- Pas de changement serveur ni de nouvel endpoint : l'état étendu est servi par `GET /api/state` une
  fois les schémas mis à jour.

## Alternatives écartées

- **Un espace « Contenu » commun avec filtre par type** : rejeté — la demande est une séparation
  forte par métier, et des types de sortie supplémentaires sont attendus.
- **Une route + page explicite par type** : rejeté — réintroduirait du code à chaque nouveau type,
  à l'opposé de l'objectif d'extensibilité.
- **Éditeur de contenu intégré** : rejeté — l'écriture reste en Markdown/Git (garde-fou d'intégrité
  des données ; le cockpit ne mute pas le contenu canonique).
