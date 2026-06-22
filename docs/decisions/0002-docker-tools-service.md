# 0002 — Docker-only `tools` service (+ agent-browser)

**Status:** Accepted · 2026-06-22

## Context

Hard rule (`CLAUDE.md`): no project tooling on the host. All build/lint/test/scripts run in
containers. The reference pack also expects `agent-browser` available for evidence/QA work.

## Decision

A single `tools` service (`docker/tools.Dockerfile`, `docker/docker-compose.yml`) is the entry point
for every command (`npm`, builds, tests, `agent-browser`). Details:

- Base **`node:22-bookworm-slim`**, Chromium runtime libs installed via apt.
- **`agent-browser` CLI baked into the image**; the Chromium it drives is fetched once at runtime via
  `agent-browser install` into `/workspace/.cache` (git-ignored) so it persists across `--rm`.
- Runs as the **host UID/GID** (`docker/.env`, default 1000:1000) so files written into the mounted
  repo stay owned by the developer. A world-writable `HOME=/home/tools` holds the npm cache.

Usage: `docker compose -f docker/docker-compose.yml run --rm tools <cmd>` (see `docker/README.md`).

## Consequences

- Reproducible toolchain; nothing installed on the host.
- First agent-browser use pays a one-time browser download.
- Pinned Node major (22) — bump deliberately.
