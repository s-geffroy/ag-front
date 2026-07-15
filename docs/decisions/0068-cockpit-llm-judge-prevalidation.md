# 0068 — Cockpit : LLM-juge de pré-validation éditoriale (candidat ≠ fait ≠ gate)

- **Statut :** accepté
- **Date :** 2026-07-15
- **Contexte connexe :** ADR 0027 (candidat ≠ fait), 0037 (Munich, `compliance_done`), 0039 (red team
  éditorial), 0046 (traçabilité de la validation humaine), 0063 (durcissement prompt red team). Registre :
  `apps/cockpit/reference/workflow-commercial.md` §7.2.

## Contexte

La doctrine impose une **validation humaine nominative** à chaque saut `candidate → fact` (ADR 0027,
0046). Concrètement, avant qu'une fiche Atlas / note / dossier passe `published`, un opérateur humain
unique doit poser six actes à froid : `sources_ok`, lecture du red team → `contradiction_done`, revue
des 10 contrôles de Munich → `compliance_done`, `cvi_justified`, relecture → `human_review_done`, puis
édition du frontmatter.

Le seul LLM en boucle (ADR 0039) est un **red team** : il _attaque_ le document et remonte des failles.
Il n'émet **aucun verdict par gate** — il ajoute donc de la lecture au relecteur au lieu de lui préparer
sa décision. Le raisonnement à froid, gate par gate, reste entièrement à la charge de l'humain, et l'acte
nominatif (ADR 0046) se fait aujourd'hui en éditant à la main des tableaux markdown (`docs/evidence/*-gates-review.md`).

## Décision

Ajouter au cockpit un **LLM-juge de pré-validation** qui **complète** le red team (il ne le remplace pas)
et **prépare** la décision humaine sans jamais la prendre.

- **Verdict-candidat par gate.** Pour un document, le juge émet, pour chaque gate de rubrique du type
  (`quality_gates.json`) et chaque contrôle Munich _adossable au texte_, un verdict `pass | fail | uncertain`
  assorti d'une justification d'une ligne **citant un passage du document**, d'une citation (`evidence_quote`)
  et d'une **confiance** 0–1. Le juge tourne un **modèle de raisonnement** (défaut `gpt-5.6-terra`) via
  l'**API Responses**, réglé par l'**effort de raisonnement** (`OPENAI_JUDGE_EFFORT`, défaut `medium`) et
  non par la température — un juge a besoin de précision, et les modèles de raisonnement jugent plus
  fidèlement les critères non-vérifiables (arXiv 2601.03630). Clé/modèle découplés du red team
  (`OPENAI_JUDGE_API_KEY`/`OPENAI_JUDGE_MODEL`, la clé se rabattant sur celle du red team). Il réutilise
  le socle durci de l'ADR 0039/0063 (spotlighting à marqueur aléatoire, anti-injection
  `INJECTION DÉTECTÉE:`, `json_schema` strict via `text.format` + validation zod, façade hors-ligne).
  Persisté en candidat régénérable (`judgements.json`, git-ignoré), un rapport par document, keyé par
  `${content_type}/${slug}` — exactement comme le red team.
- **Candidat, jamais gate.** Un verdict `pass` **ne coche jamais** un booléen. Seul un clic humain qui
  écrit une entrée de journal nominative (ADR 0046) coche un gate. Le juge ne mute jamais le contenu canonique.
- **Deux passes indépendantes.** Le juge et le red team tournent séparément et ne se voient pas. Le
  **désaccord** (juge `pass` là où le red team lève une faille de sévérité élevée sur la même zone) et la
  **confiance basse** sont calculés côté client et affichés comme **signal d'attention primaire** — l'UI
  montre le désaccord plutôt que de le masquer derrière une coche verte.
- **Un clic par gate, jamais de validation en lot.** Le juge pré-remplit toujours, mais chaque acte
  nominatif reste un geste conscient et isolé. La confiance et le désaccord orientent l'attention ; ils
  n'autorisent aucun raccourci de validation groupée.

## Garde-fous obligatoires

- Aucune donnée ne devient un **fait** sans un enregistrement de validation nominatif (ADR 0027 / 0046) :
  le juge produit des **candidats**, jamais des faits, jamais une décision de publication.
- **Contrôles hors-portée d'un LLM.** Le juge n'émet **aucun candidat** pour les contrôles Munich qu'un
  modèle ne peut pas vérifier depuis le seul texte : 6 (secret des sources), 9 (indépendance / conflit
  d'intérêts), 10 (gouvernance / pressions). Un flag `judgeable` (au niveau du catalogue Munich) le limite
  aux cibles adossées au texte : gates de rubrique + Munich 1, 2, 3, 7, 8. Une garde post-parse force à
  `uncertain` tout contrôle non-`judgeable` que le modèle aurait quand même noté.
- **Biais d'automatisation.** Un juge qui peut dire `pass` invite au tampon réflexe (à la différence d'un
  red team qui ne fait qu'attaquer). Mitigations _structurelles_, pas cosmétiques : verdicts candidats
  seulement ; validation = clic + entrée de journal ; aucun lot ; désaccord et confiance affichés.
- **Défaut `uncertain`.** Le prompt impose : `pass` uniquement si un passage cité satisfait le gate, `fail`
  si un passage le contredit, sinon `uncertain` — **ne jamais deviner `pass`**.
- **Anti-injection.** Le corps du document est encadré par le fence spotlighting (ADR 0063) ; toute tentative
  de pilotage est neutralisée et remontée via `INJECTION DÉTECTÉE:`.

## Conséquences

- Le relecteur confirme/écarte un verdict-candidat sourcé au lieu de raisonner de zéro ; la justification du
  juge devient la _réserve_ pré-remplie de sa validation nominative (ADR 0046).
- Nouveau module serveur `apps/cockpit/server/llm/judge.ts` (+ `judge-prompts.ts`), schéma
  `@ag/schema/cockpit` (`judgement.ts`), endpoint `POST /api/judgements/:type/:slug/run`. Le catalogue
  Munich remonte dans le paquet schéma (`packages/schema/src/cockpit/munich.ts`) avec le flag `judgeable`,
  pour que le serveur et le front partagent une source unique.
- Réversible : comme l'ADR 0039, le fournisseur LLM est isolé dans un module `server/llm/`.
