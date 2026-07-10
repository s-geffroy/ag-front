# Architecture Decision Records

Short, dated records of material decisions. Format: **Status · Context · Decision · Consequences**.

## Numbering

`app-geo` is a clean-room rebuild connexe to the `chokepoints` lineage. A few low/“carried” numbers
are **referenced by `CLAUDE.md`** and kept at their cited value so links resolve; new app-geo
decisions are numbered sequentially from 0003. Gaps are intentional.

|                                                    ADR | Title                                                                      | Status             |
| -----------------------------------------------------: | -------------------------------------------------------------------------- | ------------------ |
|                       [0001](0001-selection-skills.md) | Selection of agent skills                                                  | Accepted (carried) |
|                   [0002](0002-docker-tools-service.md) | Docker-only `tools` service (+ agent-browser)                              | Accepted           |
|                [0003](0003-monorepo-npm-workspaces.md) | Monorepo via npm workspaces                                                | Accepted           |
|                      [0004](0004-public-site-astro.md) | Public site stack = Astro                                                  | Accepted           |
|         [0005](0005-cockpit-editable-local-backend.md) | Cockpit editable via a small local backend                                 | Accepted           |
|      [0006](0006-lead-capture-self-hosted-endpoint.md) | Lead capture = self-hosted endpoint                                        | Accepted           |
|                  [0007](0007-data-model-separation.md) | Separate content vs cockpit data models                                    | Accepted           |
|               [0008](0008-shared-packages-strategy.md) | Shared packages = types/logic/tokens, not React UI                         | Accepted           |
|              [0009](0009-cockpit-serving-tailscale.md) | Cockpit serving over Tailscale (tailnet only)                              | Accepted           |
|                    [0010](0010-public-deploy-caddy.md) | Public deployment via Caddy on the VPS (auto-HTTPS)                        | Accepted           |
|                          [0011](0011-lead-endpoint.md) | Self-hosted public lead endpoint (POST /api/lead)                          | Accepted           |
|                  [0012](0012-atlas-chokepoints-api.md) | Atlas ↔ Chokepoints Read API (build-time, taint-aware)                     | Accepted           |
|            [0013](0013-tainted-scope-internal-only.md) | read_tainted internal-only; public stays clear                             | Accepted           |
|             [0027](0027-thinking-skills-guardrails.md) | Thinking-skills data-integrity guardrails                                  | Accepted (carried) |
|                                [0029](0029-plugins.md) | Installed plugins (commit-commands, security-guidance)                     | Accepted (carried) |
|                 [0030](0030-public-visual-identity.md) | Public site visual identity = editorial "strategic-briefing"               | Superseded by 0031 |
| [0031](0031-public-visual-identity-admiralty-chart.md) | Public site visual identity = "carte d'état-major" (admiralty chart)       | Accepted           |
|                   [0032](0032-hdde-typescript-port.md) | HDDE: TypeScript port (Express + React + SQLite + nunjucks)                | Accepted           |
|               [0033](0033-hdde-public-auth-surface.md) | HDDE: public authenticated surface (hdde.applied-geopolitics.com)          | Accepted           |
|                   [0034](0034-hdde-red-team-openai.md) | HDDE: OpenAI red team (gpt-4o), suggestion ≠ evidence                      | Accepted           |
|          [0035](0035-hdde-chokepoints-cvi-coupling.md) | HDDE: chokepoints (read scope) + CVI coupling, anti-tainted guard          | Accepted           |
|                  [0036](0036-hdde-enterprise-model.md) | HDDE: enterprise model (first-class entities + per-actor scoring)          | Accepted           |
|              [0037](0037-munich-charter-compliance.md) | Munich Charter compliance for all published content (machine + human gate) | Accepted           |
|        [0038](0038-cockpit-metier-architecture.md) | Cockpit métier architecture + config-driven output workspaces             | Accepted           |
| [0039](0039-cockpit-editorial-contradiction.md) | Cockpit: editorial contradiction (LLM red team), suggestion ≠ evidence ≠ gate | Accepted       |
| [0040](0040-hdde-divergence-model.md) | HDDE: divergence model (hidden = exposure × blindness), anti-tautology | Accepted |
| [0041](0041-verdict-dedicated-surface.md) | VERDICT: dedicated surface (separate container, port 8095) | Accepted |
| [0042](0042-verdict-hdde-ingestion-contract.md) | VERDICT ↔ HDDE ingestion contract (read-only, validated packet) | Accepted |
| [0043](0043-verdict-method-and-geopolitical-prefill.md) | VERDICT method & geopolitical prefill (HDDE + CVI + chokepoints) | Accepted |
| [0044](0044-client-data-lifecycle-confidentiality.md) | Client data lifecycle & confidentiality (retention/purge/DSAR, OpenAI DPA) | Proposed |
| [0045](0045-access-provisioning-commercial-rail.md) | Access provisioning & commercial rail (payment → account, tiers, KPIs) | Proposed |
| [0046](0046-human-validation-traceability.md) | Human validation traceability (validated-packet guard + validator log) | Accepted |
| [0062](0062-consumer-pinned-contract-client.md) | Consumer pinned-contract client for the Chokepoints Read API (pin + drift cron) | Accepted |
| [0063](0063-red-team-prompt-hardening.md) | Cross-cutting red-team prompt hardening (spotlighting, analysis-first, unified scale) | Accepted |
| [0064](0064-pplx-cli-recherche-externe.md) | External web research: `pplx-cli` upstream of `agent-browser` (single sourcing chain) | Accepted |
| [0066](0066-consommation-integrale-read-api.md) | Full consumption of the chokepoints Read API 0.6.0, enforced by build-time coverage guards | Accepted |
| [0067](0067-canal-echange-ag-back.md) | ag-front ↔ ag-back file-exchange channel: content-addressed messages, verified reply correlation | Accepted |
