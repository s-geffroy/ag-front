# 0039 — Cockpit : contradiction éditoriale (red team LLM), suggestion ≠ preuve ≠ validation du gate

- **Statut :** accepté
- **Date :** 2026-06-28
- **Contexte connexe :** ADR 0034 (red team HDDE OpenAI), ADR 0038 (architecture cockpit par métier),
  ADR 0005 (backend local éditable), ADR 0009 (cockpit Tailscale-only), ADR 0037 (conformité Munich).

## Contexte

Le jalon contraignant de la roadmap (`milestone_red_sea_dossier`, statut `at_risk`) a pour
`next_action` : « Compléter corpus et **lancer contradiction LLM** ». Tous les jalons aval (3 fiches
Atlas, 50 contacts, pilotes Premium) sont en aval de ce dossier. Or la contradiction adversariale par
LLM n'existait que dans **HDDE** (ADR 0034) ; le cockpit n'avait aucun moyen de « lancer la
contradiction » sur un document éditorial (dossier, fiche Atlas, note).

Le cockpit est en **lecture + suivi seulement** (ADR 0038) : pas d'éditeur, l'écriture reste
Markdown/Git. L'outil doit donc produire une **aide à la relecture**, pas modifier le contenu.

## Décision

- **Réutiliser le pattern red-team d'HDDE** (ADR 0034) côté cockpit : **OpenAI `gpt-4o`** par défaut
  (configurable via `OPENAI_MODEL`), clé `OPENAI_API_KEY` **server-side uniquement** (jamais côté
  navigateur), appels explicites au runtime (jamais au build). Surface Tailnet-only ⇒ l'appel sortant
  OpenAI est acceptable. Alternative écartée : Claude (consigne CLAUDE.md « default to Claude ») —
  la cohérence inter-apps et la réutilisation du pattern éprouvé (structured outputs stricts) ont
  primé pour ce premier jet ; réversible (un seul module `server/llm/`).
- **Sortie JSON contrainte (Structured Outputs `strict`) + validation `zod`** stricte
  (`summary, findings[]{claim, objection, basis, severity 0-5, suggested_test}, open_questions[],
do_not_conclude[]`). Réponse non conforme ⇒ rejet, **pas de persistance**.
- **Frontière dure (garde-fous intégrité des données)** : la sortie LLM est un **candidat à valider
  par un humain**, jamais un fait. L'outil **ne modifie jamais le contenu canonique** et **ne coche
  jamais automatiquement** le gate qualité `contradiction_done` — décision humaine séparée. Un statut
  `pending` / `reviewed` n'est qu'un accusé de lecture.
- **Façade hors-ligne** : sans clé ou `LLM_ENABLED=false`, un stand-in déterministe **clairement
  étiqueté** est renvoyé (dev/test sans consommer de tokens), réplique de la façade HDDE.
- **Modèle de données** : un rapport par document, collection JSON `contradictions`
  (clé `doc_id = ${content_type}/${slug}`), un nouveau run **remplace** le précédent. Fichier de
  runtime git-ignoré (seed `contradictions.seed.json = []`), comme `contacts`.
- **Surfaces** : panneau complet dans le **lecteur** (`/lire/:type/:slug`, surface primaire — on lance
  et on lit sur le texte ouvert) + roll-up lecture seule dans l'onglet **Gates & Munich** de l'espace
  de sortie (ADR 0038).
- **Routes** : `POST /api/contradictions/:type/:slug/run` (lit le markdown brut via `content.ts`,
  type allowlisté + slug anti-traversal, persiste via `mutateCollection`), `PUT …/review` (statut).

## Justification

Contraindre le rôle du LLM à l'adversarialité + validation humaine empêche la contamination du
contenu éditorial, exactement comme pour le diagnostic HDDE. Travailler sur le **document** (et non le
deliverable) découple l'outil du lien lâche deliverable↔contenu et le rend réutilisable sur tout
futur type de sortie sans code (cohérent avec l'extensibilité par config d'ADR 0038).

## Conséquences

- Dépendance réseau OpenAI au runtime côté cockpit (nouvelle dépendance `openai` dans `@ag/cockpit`,
  nouveau module `server/llm/`, `server/config.ts`). Coût par run à surveiller ; `gpt-4o` = compromis
  qualité/prix retenu (aligné ADR 0034).
- La contradiction reste un **gate manuel** : aucune automatisation ne ferme la boucle qualité — c'est
  voulu (Munich, ADR 0037 ; intégrité, CLAUDE.md).
- Le LLM lit le **markdown brut** (pas le HTML assaini) du document, via un helper serveur dédié qui
  réutilise la même résolution de chemin sécurisée que le lecteur.
