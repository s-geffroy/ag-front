# 0003 — Monorepo via npm workspaces

**Status:** Accepted · 2026-06-22

## Context

Two apps (`apps/public`, `apps/cockpit`) plus shared model/logic/design. We want one install, shared
packages by symlink, and a single Docker `tools` service — without extra tooling complexity.

## Decision

Use **npm workspaces** (`workspaces: ["apps/*", "packages/*"]`) — no pnpm/turbo/nx in V1. Root holds
`tsconfig.base.json` (strict), Prettier, and delegating scripts
(`npm run <script> --workspaces --if-present`). Shared packages are `@ag/*` and consumed as TypeScript
source via package `exports` (bundler/Vitest resolution), so no build step is required to use them.

## Consequences

- Minimal moving parts; matches the Docker-only `tools` workflow.
- No cross-package build artifacts to manage; apps bundle the TS source.
- If build graph/caching needs grow, revisit (Turbo/Nx) in a later ADR.
