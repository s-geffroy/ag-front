# 0001 — Selection of agent skills

**Status:** Accepted (carried from the reference pack) · 2026-06-22

## Context

The project adopts a curated set of agent skills under `.claude/skills/` (versioned). Skills are
_agent tooling_, not project tooling, so they fall **outside** the Docker-only rule. `CLAUDE.md` points
here for the selection rationale and maps trigger moments to skills.

## Decision

Vendor the 20 skills present in `.claude/skills/`: the **superpowers** suite (`using-superpowers`,
`brainstorming`, `writing-plans`, `test-driven-development`, `executing-plans`,
`subagent-driven-development`, `dispatching-parallel-agents`, `using-git-worktrees`,
`finishing-a-development-branch`, `requesting-code-review`, `receiving-code-review`,
`verification-before-completion`, `systematic-debugging`, `writing-skills`); domain/design skills
(`agent-browser`, `frontend-design`, `canvas-design`, `owasp-security`); and the constraint-analysis
pair (`thinking-theory-of-constraints`, `thinking-leverage-points`).

See `docs/skills/README.md` for the trigger-moment mapping.

## Consequences

- A consistent method gate precedes non-trivial work (brainstorm → plan → TDD).
- Data-integrity guardrails override skill defaults (see ADR 0027 and `CLAUDE.md`).
- Skills evolve independently of the Dockerized build.
