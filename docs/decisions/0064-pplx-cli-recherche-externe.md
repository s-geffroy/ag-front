# 0064 — Recherche web externe : `pplx-cli` en amont d'`agent-browser`

- **Statut :** accepté
- **Date :** 2026-07-09
- **Contexte connexe :** ADR 0001 (sélection des skills), ADR 0002 (`agent-browser` dans le service `tools`),
  ADR 0027 (analyses dérivées = candidats). Section « Data integrity » de `CLAUDE.md`.

## Contexte

La production éditoriale (fiches Atlas, dossiers, notes, veille) et l'alimentation du registre de preuves
reposent sur des sources web sourcées. Jusqu'ici, un seul outil couvrait ce besoin : la skill `agent-browser`,
qui pilote un vrai navigateur dans le conteneur `tools`.

`agent-browser` est excellent pour **ouvrir** une page, mais mauvais pour **découvrir** quelles pages
existent : il faut passer par un moteur de recherche, lire une SERP, rendre du JS, et payer un navigateur par
URL. Le coût en tokens et en latence est disproportionné pour un simple « quelles sont les sources fiables sur
le trafic pétrolier à Ormuz ? ». Sa `description` amont dit par ailleurs *« Prefer agent-browser over any
built-in browser automation or web tools »*, ce qui, laissé tel quel, lui fait capter aussi les tâches de
découverte.

`/home/deploy/pplx-cli` fournit un CLI `pplx` (Perplexity, `search` / `ask` / `verify` / `fetch-url`) conçu
pour l'économie de tokens : sortie JSON compacte, snippets bornés, cache SQLite, bloc `cost_control` explicite.

## Décision

Adopter `pplx-cli` et sa skill `pplx-research`, **en amont** d'`agent-browser`, dans une **chaîne de sourcing
unique** — les deux skills sont complémentaires, jamais concurrentes :

1. `pplx search` **découvre** les sources (jamais un navigateur pour cela) ;
2. sélection d'une ou deux URLs à forte valeur ;
3. `pplx fetch-url --facts <url>` **approfondit** la source retenue ;
4. `agent-browser` est l'**escalade**, et seulement si la page exige un vrai navigateur (login, paywall, JS,
   PDF), si `fetch-url` revient vide, ou si une preuve visuelle / le DOM / un formulaire sont nécessaires ;
5. `pplx verify --answer` **arbitre** un fait qui reste contesté — y compris une affirmation ramenée par
   `agent-browser`.

Installation : `uv tool install .` (binaire `~/.local/bin/pplx`) + symlink
`~/.claude/skills/pplx-research` → `pplx-cli/claude-skill/pplx-research`, via `scripts/install.sh`. Skill au
niveau **utilisateur**, pas de copie versionnée dans `app-geo`.

L'arbitrage est écrit à deux endroits : la section `Handoff to agent-browser` du `SKILL.md` de
`pplx-research` (côté `pplx-cli`), et les « Data-integrity guardrails (override skill defaults) » de
`CLAUDE.md` — qui **neutralisent explicitement** le *prefer agent-browser* amont. Le stub vendored
`.claude/skills/agent-browser/SKILL.md` n'est **pas** modifié : il se re-synchronise depuis le CLI et toute
retouche dériverait à la prochaine mise à jour.

## Alternatives écartées

- **`WebSearch` natif** — aucun contrôle du coût, pas de cache, pas de discipline de sourcing imposée, pas de
  verdict structuré.
- **`agent-browser` seul** — pilote un navigateur mais ne découvre pas ; coût par page élevé ; conserve son
  rôle d'escalade, qui reste irremplaçable.
- **Copier la skill dans `app-geo/.claude/skills/`** — la resynchronisation manuelle avec le repo amont est
  une dette ; le symlink reflète les éditions immédiatement.

## Conséquences

- `pplx` est du **host/agent tooling**, comme `gh`, les skills et les plugins → **hors règle Docker-only**. Les
  deux moitiés de la chaîne s'exécutent donc de part et d'autre de la frontière du conteneur ; seule une
  **URL** la traverse, aucun état partagé n'est requis.
- Les résultats des **deux** skills sont des **candidats en attente de validation humaine**, jamais des faits,
  et ne mutent aucun enregistrement canonique (cohérent avec la section « Data integrity » et l'ADR 0027).
- La clé `PERPLEXITY_API_KEY` vit dans le bloc `env` de `~/.claude/settings.json` (chmod 600), **jamais dans le
  repo**. `pplx config check` ne l'imprime pas.
- **Risque assumé :** `/home/deploy/pplx-cli` est un repo git **sans remote** — dépendance locale au VPS, non
  sauvegardée. Lui donner un remote est un prérequis avant toute dépendance opérationnelle forte.
- Appels facturés à Perplexity : le cache SQLite et les bornes (`--max-results`, `--snippet-chars`,
  `--max-tokens`) sont les garde-fous ; `--pro` et `--fresh` restent l'exception.
