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
