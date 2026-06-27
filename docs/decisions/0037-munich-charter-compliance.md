# ADR 0037 — Conformité Charte de Munich pour tout contenu publié

- **Statut** : accepté (2026-06-27)
- **Contexte** : ADR 0004 (site public Astro), garde-fou de publication (`published`), gate
  `compliance_done` du cockpit.

## Contexte

Le gate `compliance_done` des livrables éditoriaux était un booléen sans contenu opérationnel. Applied
Geopolitics publie de l'analyse géopolitique sourcée s'adressant à des décideurs ; la qualité exigée est
**universitaire et déontologique**. Nous adoptons la **Déclaration de Munich (1971) — devoirs et droits
des journalistes** comme socle déontologique de **tout ce qui est publié** (notes, fiches Atlas,
dossiers), et nous l'**opérationnalisons** : une partie est vérifiée par machine au build/CI, le reste
est une checklist humaine qui **définit** `compliance_done`.

## Décision

`compliance_done = TRUE` **si et seulement si** l'artefact publié satisfait les 10 contrôles ci-dessous.
Un sous-ensemble est **bloquant au build** (CI échoue) ; le reste est **revue humaine** tracée au
cockpit. Tout artefact publié porte un **mécanisme de rectification** (errata datés) — devoir 5.

### Mapping devoirs de Munich → contrôles Applied Geopolitics

| #   | Devoir (Munich 1971)                                                                     | Contrôle AG                                                                                                                     | Vérif                                            |
| --- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| 1   | Respecter la vérité / droit du public à la vérité                                        | Aucune affirmation structurante sans source ; `confidence` présent ; données datées                                             | **machine** (sources ≥ min, confidence) + humain |
| 2   | Défendre la liberté d'information et de commentaire                                      | Distinction **fait / analyse / opinion** explicite                                                                              | humain                                           |
| 3   | Publier une information d'origine connue ; ne pas dénaturer ni supprimer l'essentiel     | **Provenance obligatoire** (label + type, URL si dispo) ; pas de citation tronquée                                              | **machine** (provenance) + humain                |
| 4   | Ne pas utiliser de méthodes déloyales                                                    | Collecte = candidats _pending validation_ ; pas de scraping derrière auth ni usurpation                                         | humain (process)                                 |
| 5   | Rectifier toute information inexacte                                                     | **Bloc errata daté** présent sur chaque artefact publié + affordance « signaler une erreur »                                    | **machine** (champ `corrections` + rendu)        |
| 6   | Garder le secret professionnel (sources)                                                 | Ne pas exposer de source confidentielle ; données restreintes → scope `tainted` interne (ADR 0013)                              | humain                                           |
| 7   | Ne pas confondre le métier avec la publicité / la propagande                             | Séparation **éditorial / offres** Basic/Standard/Premium ; pas de sponsorisé déguisé ; le paywall ne déforme pas l'analyse      | humain (+ revue)                                 |
| 8   | Pas de plagiat, calomnie, diffamation, accusation sans preuve ; respect de la vie privée | Attribution des citations ; aucune accusation non sourcée ; prudence sur acteurs nommés (lien modèle entreprise HDDE, ADR 0036) | humain                                           |
| 9   | Ne jamais confondre le métier avec la corruption                                         | Déclaration de conflits d'intérêts ; indépendance vis-à-vis des clients / pilotes Premium                                       | humain                                           |
| 10  | Refuser toute pression ; clause de conscience                                            | Gouvernance éditoriale ; traçabilité des décisions de publication (cockpit)                                                     | humain                                           |

### Contrôles bloquants au build (CI) — `apps/public/scripts/munich-check.mjs`

Sur **chaque artefact publié** (`published: true`, ou note non `draft`) :

- **R1 — Provenance (devoirs 1, 3)** : `sources` non vide. Minima par type : note ≥ 1, fiche ≥ 2,
  dossier ≥ 3. Chaque source a un `label` et un `type`.
- **R2 — Incertitude (devoir 1)** : `confidence` présent. Un **dossier** doit comporter une section
  _Limites / angles morts_ (le dossier répond à une question unique avec ses limites explicites).
- **R3 — Rectificabilité (devoir 5)** : champ `corrections` présent (tableau, éventuellement vide) →
  le bloc errata est rendu sur la page.

Les violations **font échouer le build/CI** : un contenu non conforme ne peut pas être publié.

### Revue humaine (tracée au cockpit)

Devoirs 2, 4, 6, 7, 8, 9, 10 : checklist affichée dans la page _Quality Gates_. `compliance_done` n'est
coché **qu'après** la revue de ces points par un humain — conformément aux garde-fous data-integrity
(promotion = preuve validée par un humain).

## Conséquences

- Le site public ne sert que des artefacts conformes au sous-ensemble machine ; le reste est garanti
  par la revue humaine avant `compliance_done`.
- Nouveau champ `corrections` sur les trois collections + composant `Corrections.astro`.
- Nouvelle étape CI `check:munich`. Référence vivante : ce fichier + le panneau cockpit.
- Limite assumée : R4/R7 (séparation éditorial/commercial) et la distinction fait/analyse restent
  **humaines** — automatisables plus tard (lint de motifs promotionnels), non bloquantes aujourd'hui
  pour éviter les faux positifs.
