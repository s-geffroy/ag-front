# Agent skills — adoption & triggers

Skills under `.claude/skills/` are **agent tooling**, not project tooling — they are **outside** the
Docker-only rule. Selection rationale: [ADR 0001](../decisions/0001-selection-skills.md). Data-integrity
guardrails that override skill defaults: [ADR 0027](../decisions/0027-thinking-skills-guardrails.md) and
the "Data integrity" section of `CLAUDE.md`.

## Trigger moments

| Trigger moment                                                               | Skill(s)                                                                            |
| ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Any non-trivial code task — before writing code                              | `brainstorming` → `writing-plans` → `test-driven-development` (superpowers)         |
| A bug, test failure, or unexpected behavior                                  | `systematic-debugging` (before proposing a fix)                                     |
| Parallel / multi-agent work                                                  | `using-git-worktrees`, `dispatching-parallel-agents`, `subagent-driven-development` |
| Executing a written plan                                                     | `executing-plans`                                                                   |
| Wrapping up a branch                                                         | `finishing-a-development-branch`, `requesting-code-review`, `receiving-code-review` |
| Before declaring work done                                                   | `verification-before-completion`                                                    |
| Fetch/verify a web source for the evidence registry                          | `agent-browser` (runs inside the `tools` container)                                 |
| Changes touching the read API or admin/cockpit UI (auth, inputs, endpoints)  | `owasp-security`                                                                    |
| Build/modify a front-end (components, layout, design system)                 | `frontend-design`                                                                   |
| Produce a visual deliverable (briefing/report PDF, poster) from derived data | `canvas-design`                                                                     |
| Analyse a chokepoint / flow network                                          | `thinking-theory-of-constraints`, `thinking-leverage-points`                        |
| Start of any conversation (auto)                                             | `using-superpowers` (routes to the right superpowers skill)                         |
| Creating/editing skills                                                      | `writing-skills`                                                                    |

## Guardrails (override skill defaults)

- `agent-browser` collects **candidates pending human validation**, never facts.
- `canvas-design` / `frontend-design` consume **derived** data only; never mutate canonical records.
- `thinking-*` outputs are **derived analysis**, candidates pending validation (ADR 0027).
- `agent-browser` lives in the **`tools`** Docker image (ADR 0002): prefix with
  `docker compose -f docker/docker-compose.yml run --rm tools agent-browser <cmd>`.
