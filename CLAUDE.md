# CLAUDE.md

**app-geo** — code base of **Applied Geopolitics**, a B2B platform analysing strategic corridors, power
flows, critical dependencies and geopolitical vulnerabilities (offerings: Basic / Standard / Premium;
proprietary **CVI** — Corridor Vulnerability Index — methodology). Connexe to the `chokepoints`
strategic database. This is a **clean-room rebuild** — the directory starts empty.

The repo ships **three UIs**:

- **Public site** → `www.applied-geopolitics.com`: B2B content platform (landing, Atlas, dossiers,
  notes, CVI method, tiered offers, lead capture / newsletter). French primary; SEO is a slow-built
  asset, secondary to prospection.
- **Internal cockpit** → served **only** over Tailscale at `https://srv1100990.tail880531.ts.net`:
  operational deployment cockpit tracking the launch, organised by métier: **Accueil** (cross-domain
  home), **Suivi du projet** (pipeline, roadmap, KPIs projet), **Gestion commerciale** (acquisition,
  KPIs commerciaux), **Espaces de sortie** (one config-driven workspace per editorial output type —
  Dossiers, Fiches Atlas, Notes, …; each bundles production board, gates + Munich, revue, sources),
  and **Outils** (exploration, dépôts). Output workspaces are driven by `config.json#output_types`
  so a new output type is a data change. Never exposed publicly.
- **HDDE** (Hidden Dependency Discovery Engine) → `hdde.applied-geopolitics.com`: **public-Internet
  behind app auth** (individual analyst accounts) — an expert-guided interview cockpit that reveals an
  enterprise's hidden geopolitical dependencies (cases → guided interview → evidence → OpenAI red team
  → diagnostic packet → diff/validate → FR/EN exports). Pack-driven (`apps/hdde-api/domain_packs/`),
  SQLite, OpenAI `gpt-4o` red team, chokepoints (read scope) + CVI enrichment. ADRs 0032–0035.

This file is a living document; refine it as real structure lands.

## IMPORTANT: hard rules

- **Docker-only. YOU MUST NOT run project tooling on the host.** All build, lint, tests, and scripts
  run inside containers. Build the Docker setup first rather than falling back to a local install.
  Expected shape once infra exists: a `tools` service, e.g.
  `docker compose -f docker/docker-compose.yml run --rm tools <cmd>`.
- **`/home/deploy/sources/` is a reference to READ, not a template to COPY.** It holds the _Applied
  Geopolitics_ pack (12-month playbook, public-site spec, deployment-UI spec, data model, recommended
  structure). Read it for domain methodology, controlled vocabularies, data-model semantics, content
  cadence, and example records. Do not copy its files, schema, or tooling.
- **Challenge the source architecture.** Nothing from the pack is assumed correct (the proposed
  React/Vite/Tailwind/shadcn cockpit, the local-JSON E-light data model, the no-backend V1, the
  unspecified public-site stack). Justify each decision you keep or change; record material choices as
  short ADRs under `docs/decisions/`.

## Data integrity

- Canonical data is the single source of truth; derived/analytical outputs MUST NOT mutate canonical records.
- Seeds are **candidates pending validation**, not facts. Priority promotion (P0…) needs sourced, human-validated evidence.
- Geometry is schematic unless explicitly validated — never imply navigational or legal precision.

## Tech (current leaning — open to challenge)

Monorepo (`apps/`) with a shared `tools` service (Node + agent-browser/Chrome).

- **`apps/cockpit`** (internal): React + Vite + TypeScript + Tailwind CSS + shadcn/ui. Data is local
  JSON (E-light model: `config / deliverables / milestones / metrics / contacts / quality_gates`)
  under `apps/cockpit/src/data/`. No backend / API in V1.
- **`apps/public`** (`www.applied-geopolitics.com`): stack **to be decided in an ADR** — candidates:
  Astro (SSG, best for SEO-driven content; recommended), Next.js, or the same React + Vite as the
  cockpit. Lead-capture forms + newsletter; French primary.

## Commands & layout

Docker-only. The `tools` service (Node + agent-browser/Chrome) is the entry point:

```bash
# build (UID/GID default to 1000; override via docker/.env for other hosts)
docker compose -f docker/docker-compose.yml build tools
# run any tooling (npm workspaces)
docker compose -f docker/docker-compose.yml run --rm tools npm install
docker compose -f docker/docker-compose.yml run --rm tools npm --workspace apps/cockpit run dev
docker compose -f docker/docker-compose.yml run --rm tools npm --workspace apps/public run dev
docker compose -f docker/docker-compose.yml run --rm tools agent-browser open http://localhost:5173
```

Layout:

- `apps/public/` — public site (`www.applied-geopolitics.com`).
- `apps/cockpit/` — internal cockpit (`src/{data,types,lib,components,pages}`).
- `apps/hdde-api/` — HDDE backend (Express + SQLite; `server/{db,auth,routers,engine,llm,exports,integrations}`,
  `domain_packs/`). `apps/hdde-web/` — HDDE SPA (React + Vite). ADRs 0032–0035.
- `packages/` — shared code (types, UI primitives, CVI calculations).
- `docker/` — `tools.Dockerfile`, `docker-compose.yml`, pinned Node stack.
- `.claude/skills/` — adopted agent skills (see `docs/skills/README.md`).
- `docs/decisions/` — ADRs.

**Deployment:** `apps/public` → `www.applied-geopolitics.com` (public). `apps/cockpit` → exposed
**only** via Tailscale `https://srv1100990.tail880531.ts.net` (tailnet `tail880531.ts.net`); never
published to the public internet. `apps/hdde-api` + `apps/hdde-web` → `hdde.applied-geopolitics.com`
(public-Internet **behind app auth**, fronted by Caddy; `hdde` service on host loopback). Seed the
first account via `npm --workspace @ag/hdde-api run seed:user -- <email> <password> owner_admin`.

## Skills — when to use what

Project skills live in `.claude/skills/` (versioned). They are agent tooling, not project tooling, so they
do **not** fall under the Docker-only rule. Selection rationale: `docs/decisions/0001-selection-skills.md`.
Invoke the matching skill at these moments:

| Trigger moment                                                                                    | Skill                                                                                     |
| ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Any non-trivial code task — before writing code                                                   | `brainstorming` → `writing-plans` → `test-driven-development` (the **superpowers** suite) |
| A bug, test failure, or unexpected behavior                                                       | `systematic-debugging` (before proposing a fix)                                           |
| Parallel / multi-agent work                                                                       | `using-git-worktrees`, `dispatching-parallel-agents`, `subagent-driven-development`       |
| Before declaring work done                                                                        | `verification-before-completion`                                                          |
| Fetch/verify a **web source** for the evidence registry (feed a seed, validate a claim)           | `agent-browser`                                                                           |
| Any change touching the **read API** or **admin UI** — auth, input handling, endpoints            | `owasp-security`                                                                          |
| Build/modify the **admin/exploration UI** (components, layout, design system)                     | `frontend-design`                                                                         |
| Produce a **visual deliverable** (briefing/report PDF, poster) from the data                      | `canvas-design`                                                                           |
| Analyse a **chokepoint / flow network** — binding node, where to intervene, cascade to neighbours | `thinking-theory-of-constraints`, `thinking-leverage-points` (ADR 0027)                   |

`using-superpowers` auto-loads at conversation start and routes to the right superpowers skill.

**Data-integrity guardrails (override skill defaults):**

- `agent-browser` collects **candidates pending human validation**, never facts — see "Data integrity" above.
- `canvas-design` / `frontend-design` consume **derived** data only; they MUST NOT mutate canonical records.
- `thinking-theory-of-constraints` / `thinking-leverage-points` produce **derived analysis** only — constraint
  rankings, bypass capacities and leverage effects are **candidates pending human validation**, never facts, and
  never mutate canonical records (ADR 0027).
- `agent-browser` is installed in the **`tools` service** (ADR 0002), not on the host. Invoke it inside the
  container: `docker compose -f docker/docker-compose.yml run --rm tools agent-browser <cmd>`. The skill's
  guidance applies, but the binary lives in Docker, so prefix commands with the compose wrapper.

## Plugins — installed (ADR 0029)

Two plugins from the official `claude-code-plugins` marketplace (`github:anthropics/claude-code`) are enabled
via `.claude/settings.json`. Like skills, plugin commands/hooks are **agent tooling at the harness/host level**,
so they are **outside the Docker-only rule**. (`frontend-design` plugin was rejected — it only duplicates the
already-vendored `frontend-design` skill.)

| Plugin              | What it adds                                | Notes                                                                                                                                                                                                                          |
| ------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `commit-commands`   | `/commit`, `/commit-push-pr`, `/clean_gone` | Keep the conventional-commit + `Co-Authored-By: Claude Opus 4.8` footer. The remote is a normal GitHub repo (`origin` → `s-geffroy/ag-front`), so the `gh`/GitHub-PR flow works; current practice is direct commits to `main`. |
| `security-guidance` | Automatic security hooks                    | **Regex-only** (`ENABLE_CODE_SECURITY_REVIEW=0` in settings) → Layer 1 pattern warnings on Edit/Write, **no** automatic LLM calls. Complements, does not replace, the manual `owasp-security` skill.                           |

Activation is a one-time harness step (not done by `settings.json` alone): accept the trust/install prompt on
launch, or run `/plugin marketplace add anthropics/claude-code` then
`/plugin install commit-commands@claude-code-plugins` and `/plugin install security-guidance@claude-code-plugins`.
