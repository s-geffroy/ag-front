# 0008 — Shared packages = types/logic/tokens, not React UI

**Status:** Accepted · 2026-06-22

## Context

`apps/public` is Astro; `apps/cockpit` is React. A shared **React component library** across the two is
awkward (Astro uses islands) and premature. We still want visual + data coherence.

## Decision

The shared layer is **types, logic, and design tokens** — not components:

- **`@ag/schema`** — data model (zod + types), content + cockpit namespaces.
- **`@ag/cvi`** — CVI dimensions, scales, and validation rules.
- **`@ag/tokens`** — sober design tokens + a Tailwind preset, consumed by both apps.

No `@ag/ui` React package in V1. If real component reuse emerges (likely only within React surfaces),
introduce it then.

## Consequences

- Coherent look (tokens) and data (schema) without coupling two render models.
- Each app owns its components; less shared surface to break.
- Packages are consumed as TS source (ADR 0003), so no build step gates app dev.

## Amendment (2026-06-24) — public site owns its palette

`@ag/tokens` is consumed by **`apps/cockpit`** (Tailwind preset). The **public site does not** consume
it: ADR 0030, then **ADR 0031** ("admiralty chart" identity), gave `apps/public` a bespoke editorial
palette + typography defined in `src/styles/global.css` + `tailwind.config.ts`. This is deliberate —
the public brand and the internal cockpit are intentionally distinct render _and_ visual systems. The
dead `@ag/tokens` alias/dep that lingered in `apps/public` (never imported) has been removed to stop the
config contradicting reality. `@ag/tokens` stays isolated and is never mutated by either app (token
_isolation_ holds; cross-app token _coherence_ is explicitly not a goal for the public surface).
