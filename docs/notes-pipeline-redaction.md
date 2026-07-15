# Plan de rédaction — 3 notes du pipeline

Plan de production pour les 3 notes actuellement en `framing` dans le cockpit
(`apps/cockpit/data/deliverables.json`, espace de sortie **Notes**). Chaque note nourrit un
livrable existant (règle de scope playbook §11.1 : une note doit alimenter une fiche/dossier).

## Contexte

L'espace Notes a été peuplé le 2026-07-14 : 3 notes déjà publiées + 3 cartes « à produire ». Ces
3 cartes n'ont pour l'instant **que le suivi**, pas le contenu. Objectif : rédiger les 3 markdown
sous `apps/public/src/content/notes/`, au **template du pack** (accroche datable, angle, 3 signaux
avec seuil, implication risque/résilience, angle mort, 3–6 sources visibles, « pour aller plus loin »),
**≤ 2 min de lecture** (~250–400 mots de corps).

## Garde-fou de publication (différence clé avec l'enrichissement)

Les notes n'ont **pas** de garde `published` (champ `draft`, défaut `false`) → **un rebuild d'`apps/public`
les met en ligne** (Caddy sert `apps/public/dist` en lecture seule). Contrairement aux 3 notes déjà
publiées qu'on a étoffées, celles-ci sont des **candidates non revues**. Donc :

- Créer chaque fichier avec **`draft: true`** dans le frontmatter → la note reste hors-ligne (absente de
  `/notes` et du build public) pendant la rédaction et la revue.
- Ne passer `draft: false` (+ rebuild) **qu'après** `human_review_done` dans le cockpit.

## Chaîne de production (par note)

Séquence identique à celle des fiches, allégée pour le format note :

1. **Cadrage** (`framing` → `sources`) — figer 1 accroche concrète + 1 thèse (angle). Rester dans le
   scope de la fiche nourrie ; ne pas dériver.
2. **Sourcing** (`sources`) — chaîne `pplx` **dans l'ordre** : `pplx search` découvre → `pplx fetch-url
   --facts` deepen 1–2 URLs → `pplx verify --answer` arbitre un chiffre contesté. Réutiliser en priorité
   les candidats déjà collectés (voir briefs ci-dessous). `agent-browser` uniquement en escalade
   (login/paywall/JS/PDF). Toute figure = **candidate en attente de validation humaine**, marquée
   FAIT / ESTIMATION / DÉDUCTION, jamais un fait. → gate `sources_ok`.
3. **Rédaction** (`production`) — écrire le markdown au template (voir structure ci-dessous). → gate
   `llm_draft_done`.
4. **Contradiction ADR 0039** (`review`) — passer le brouillon au contrôle LLM de contradiction, traiter
   les findings (lever, nuancer, ou déclarer en angle mort). → gate `contradiction_done` après revue humaine.
5. **Munich + compliance** — renseigner la matrice Munich du record (contrôles 1–10), vérifier disclaimers
   (géométrie schématique, frontière d'offre : CVI 0–5 réservé aux tiers payants). → `compliance_done`.
6. **Revue humaine finale** → `human_review_done`. Puis `draft: false` + `status: published` + rebuild.

Mettre à jour `next_action`, `gates`, `munich`, `progress`, `status` du record à chaque étape (miroir des
fiches Malacca/Taïwan).

## Structure markdown (frontmatter attendu)

Schéma : `apps/public/src/content/config.ts` (collection `notes`). Types de source valides :
`institutionnel, donnees_ouvertes, presse_specialisee, rapport_entreprise, reglementaire, carte,
analyse_secondaire, source_contradictoire, signal_faible`. `confidence` : `bas|moyen|eleve`.

```yaml
title, date, summary, access: public, corridor (si pertinent),
signals: [3 items avec seuil, max 5], decision_implication, blind_spot,
confidence, sources: [3–6 {label, type, url?}], corrections: [], draft: true
```

Corps : accroche datable → angle (1–2 §) → « Trois signaux à suivre » (liste) → marqueur « Diagnostic
provisoire » → « ## Pour aller plus loin » (liens **routes publiques seulement** : `/methode-cvi`, `/atlas`,
liens croisés `/notes/…` ; **jamais** `/atlas/<fiche>` ni `/dossiers/<x>` tant que `published:false` → 404).

---

## Brief 1 — `deliv_note_malacca_teaser`

- **Fichier** : `apps/public/src/content/notes/malacca-dependance-energetique.md`
- **Nourrit** : fiche Atlas Malacca. **Preuves** : `docs/evidence/malacca-candidates.md` (EIA ~23 Mb/j de
  pétrole transitant le détroit, MPA 41,12 M EVP / 94 301 navires, ReCAAP 108 incidents SOMS, pipeline
  Chine-Myanmar — capacité limitée). Vérifier fraîcheur via `pplx` avant réemploi.
- **Angle** : Malacca concentre les flux énergétiques Golfe→Asie ; les alternatives (Sonde, Lombok) sont
  plus longues/coûteuses et le pipeline Chine-Myanmar ne couvre qu'une fraction du volume → dépendance
  sans vraie substitution à court terme.
- **Accroche** : la part des importations pétrolières asiatiques passant par Malacca (chiffre EIA, daté,
  candidat).
- **Signaux (+seuil)** : (1) trafic pétrolier journalier vs capacité ; (2) taux d'incidents SOMS (ReCAAP) ;
  (3) montée en charge des contournements Sonde/Lombok ou du pipeline.
- **Angle mort** : capacité réelle des bypass et du pipeline mal documentée publiquement.
- **Scope** : nœud énergétique + maritime. **Ne pas** dériver vers géopolitique Indo-Pacifique générale.
- **confidence** : `moyen`.

## Brief 2 — `deliv_note_taiwan_teaser`

- **Fichier** : `apps/public/src/content/notes/taiwan-semiconducteurs-irremplacables.md`
- **Nourrit** : fiche Atlas Taïwan. **Preuves** : `docs/evidence/taiwan-candidates.md` (TSMC ~67,6 %
  fonderie, ~68 %/80 % capacité avancée/EUV, ~48 % flotte détroit, Kaohsiung 9,3 M EVP, capacité hors
  Taïwan 32→59 % d'ici 2027 — candidats FAIT/ESTIMATION/DÉDUCTION).
- **Angle** : la relocalisation des nœuds de pointe est lente (fabs = années + main-d'œuvre + écosystème) →
  irremplaçabilité **à court terme** des composants avancés, indépendamment du calendrier géopolitique.
- **Accroche** : la part de la capacité de pointe (avancé/EUV) concentrée à Taïwan aujourd'hui.
- **Signaux (+seuil)** : (1) capacité avancée hors Taïwan (trajectoire 2027) ; (2) part de la flotte via le
  détroit ; (3) inertie des nouvelles fabs (délai annoncé vs volume qualifié).
- **Angle mort** : « irremplaçabilité » est une **estimation** temporelle, pas un absolu ; production par
  pays mal documentée.
- **Scope** : composants + maritime. **Pas** de commentaire géopolitique général.
- **confidence** : `moyen`.

## Brief 3 — `deliv_note_methode_cvi`

- **Fichier** : `apps/public/src/content/notes/mesurer-vulnerabilite-corridor-cvi.md`
- **Nourrit** : page `/methode-cvi`. **Réf.** : `docs/cvi-corridor-assessment-spec.md`, ADR 0043.
- **Angle** : note **conceptuelle** — ce que le CVI mesure (concentration, substituabilité, contrôle,
  cascade…) et ne mesure pas, sans caricature. **Pas de nouvelle donnée chiffrée** → pas de chaîne pplx,
  sourcing = méthode interne.
- **Frontière d'offre** : le **score 0–5 est réservé aux tiers payants** ; en public, lecture **qualitative**
  seulement. Ne pas divulguer la pondération fine.
- **Signaux** : ici plutôt « ce que le score fait bouger » (les dimensions), adaptés au format.
- **confidence** : `eleve` (méthode propriétaire).
- Note du **pack de preuve 90 jours** (spec §18.2).

---

## Notes explicatives produit — HDDE & VERDICT (ajout 2026-07-15)

Deux notes **conceptuelles** supplémentaires, sur le même patron que le Brief 3 (note *méthode CVI*) :
elles n'apportent **aucune donnée chiffrée nouvelle** ⇒ **pas de chaîne pplx**, sourcing = méthode
interne + références déjà citées par la méthode. `confidence: eleve`. Elles nourrissent une **page
méthode** (scope playbook §11.1 satisfait comme pour la note CVI), sont top-of-funnel et renvoient vers
`/methode-*` et `/offres`. Records de suivi : `deliv_note_hdde_explicative`,
`deliv_note_verdict_explicative` (`status: production`). Brouillons complets rédigés (`draft:true`, corps
au template — hors-ligne jusqu'à revue humaine).

### Brief 4 — `deliv_note_hdde_explicative`

- **Fichier** : `apps/public/src/content/notes/dependance-visible-dependance-cachee.md`
- **Nourrit** : page `/methode-hdde` + offre Premium. **Réf.** (méthode interne) :
  `apps/public/src/pages/methode-hdde.astro`, domain pack
  `apps/hdde-api/domain_packs/enterprise_hidden_dependency_discovery/`, ADR 0040 (modèle de divergence
  `hidden = exposure × blindness`), ADR 0034 (frontière de preuve : suggestion LLM ≠ preuve).
- **Angle** : une entreprise voit un acteur critique **visible** (fournisseur, point de passage) ; le
  risque réel est l'**angle mort** — l'écart entre résilience *déclarée* et résilience *prouvée*. HDDE
  remonte du visible aux dépendances cachées (rang-2, juridictions, gatekeepers, chokepoints).
- **Accroche** : une entreprise découvre **tard** qu'un fournisseur visible reposait sur une dépendance
  cachée (candidate, datable).
- **« Trois signaux » adaptés (angles morts, dérivés de `red_flags.yaml`)** : (1) alternative déclarée
  mais non testée/contractualisée ; (2) dépendance de rang-2 inconnue ; (3) gatekeeper non cartographié
  (logistique/assurance/finance/régulateur).
- **Angle mort** : HDDE ne prédit pas et ne remplace pas le jugement interne ; suggestion LLM ≠ preuve.
- **Frontière d'offre** : HDDE = outil des offres **payantes** ; diagnostic complet (packet, scores 0–5)
  réservé ; lecture publique **qualitative**.
- **Scope** : concept de dépendance cachée. **Ne pas** dériver vers un cas d'entreprise nominatif.
- **confidence** : `eleve`.

### Brief 5 — `deliv_note_verdict_explicative`

- **Fichier** : `apps/public/src/content/notes/du-diagnostic-a-la-decision.md`
- **Nourrit** : page `/methode-verdict` + offre Premium. **Réf.** (méthode interne) :
  `apps/public/src/pages/methode-verdict.astro`, `packages/verdict/src/labels.ts` (7 temps, 7 critères,
  preuve 0–5, 4 verdicts — source FR synchronisée avec le moteur), `docs/methode-verdict.md`, ADR 0043.
- **Angle** : une fois les dépendances révélées (HDDE), il faut **trancher**. VERDICT transforme une
  situation incertaine en options **comparables, testables, arbitrables** et rend un verdict
  (FAIRE / TESTER / DIFFÉRER / ABANDONNER) assorti d'un **seuil d'arrêt** et d'une **date de revue**.
  Principe : « le score ouvre une possibilité, il ne décide jamais seul » (anti-tyrannie du score).
- **Accroche** : une décision engagée sous incertitude, sans condition d'arrêt, dont le coût se mesure
  trop tard (conceptuelle, datable si possible).
- **« Trois signaux » adaptés (garde-fous, de `packages/verdict/src/audit.ts`)** : (1) FAIRE interdit
  sous preuve niveau 4 ; (2) TESTER exige un test de vérité **capable de tuer l'option** ; (3) aucune
  action sans seuil d'arrêt **+ validation humaine**.
- **Angle mort** : la red team (LLM) = preuve **niveau 0** ; VERDICT ne prédit pas, ne remplace pas le
  jugement du dirigeant.
- **Sources** (`analyse_secondaire`) : cadres fondateurs déjà cités par la méthode — PESTEL (Aguilar
  1967), SWOT/TOWS, Business Model Canvas (Osterwalder & Pigneur 2010), décision sous incertitude
  (Kahneman 2011, Popper).
- **Frontière d'offre** : VERDICT = 3ᵉ étage **Premium « Arbitrer »** ; **ne pas divulguer la
  pondération fine** ; l'arbitrage opérationnel se fait dans le pilote fermé.
- **Scope** : principe d'arbitrage. **Pas** de cas de décision client réel.
- **confidence** : `eleve`.

---

## Vérification (à la publication de chaque note)

1. Build public en Docker : `docker compose -f docker/docker-compose.yml run --rm tools npm --workspace
   apps/public run build` → la note apparaît **seulement** si `draft: false`.
2. Liens « pour aller plus loin » : vérifier que chaque cible existe dans `apps/public/dist/` (aucun 404).
3. Cockpit : record passé `published`, `gates` complets, `munich` renseigné ; `/api/state` cohérent.
4. Rebuild final = mise en ligne prod (Caddy sert `dist`). Ne le faire qu'après `human_review_done`.
