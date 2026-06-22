# 0029 — Installed plugins (commit-commands, security-guidance)

**Status:** Accepted (carried) · 2026-06-22

## Context

Two plugins from the official `claude-code-plugins` marketplace are enabled via `.claude/settings.json`.
Like skills, plugin commands/hooks are agent tooling at the harness level — **outside** the Docker-only
rule.

## Decision

Enable **`commit-commands`** (`/commit`, `/commit-push-pr`, `/clean_gone`) and **`security-guidance`**
(regex-only Layer-1 hooks; `ENABLE_CODE_SECURITY_REVIEW=0`, no automatic LLM calls). The
`frontend-design` plugin is **rejected** — it duplicates the vendored `frontend-design` skill.

Conventions: keep the conventional-commit + `Co-Authored-By: Claude Opus 4.8` footer; `/commit-push-pr`
assumes a GitHub-PR flow, so prefer `/commit` + `/clean_gone` here. `security-guidance` complements, not
replaces, the manual `owasp-security` skill.

## Consequences

- Lightweight commit ergonomics + pattern-level security warnings on Edit/Write.
- Activation is a one-time harness step (trust/install prompt), not done by `settings.json` alone.
