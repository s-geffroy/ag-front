# Architecture Decision Records

Short, dated records of material decisions. Format: **Status · Context · Decision · Consequences**.

## Numbering

`app-geo` is a clean-room rebuild connexe to the `chokepoints` lineage. A few low/“carried” numbers
are **referenced by `CLAUDE.md`** and kept at their cited value so links resolve; new app-geo
decisions are numbered sequentially from 0003. Gaps are intentional.

| ADR | Title | Status |
|----:|-------|--------|
| [0001](0001-selection-skills.md) | Selection of agent skills | Accepted (carried) |
| [0002](0002-docker-tools-service.md) | Docker-only `tools` service (+ agent-browser) | Accepted |
| [0003](0003-monorepo-npm-workspaces.md) | Monorepo via npm workspaces | Accepted |
| [0004](0004-public-site-astro.md) | Public site stack = Astro | Accepted |
| [0005](0005-cockpit-editable-local-backend.md) | Cockpit editable via a small local backend | Accepted |
| [0006](0006-lead-capture-self-hosted-endpoint.md) | Lead capture = self-hosted endpoint | Accepted |
| [0007](0007-data-model-separation.md) | Separate content vs cockpit data models | Accepted |
| [0008](0008-shared-packages-strategy.md) | Shared packages = types/logic/tokens, not React UI | Accepted |
| [0009](0009-cockpit-serving-tailscale.md) | Cockpit serving over Tailscale (tailnet only) | Accepted |
| [0010](0010-public-deploy-caddy.md) | Public deployment via Caddy on the VPS (auto-HTTPS) | Accepted |
| [0027](0027-thinking-skills-guardrails.md) | Thinking-skills data-integrity guardrails | Accepted (carried) |
| [0029](0029-plugins.md) | Installed plugins (commit-commands, security-guidance) | Accepted (carried) |
