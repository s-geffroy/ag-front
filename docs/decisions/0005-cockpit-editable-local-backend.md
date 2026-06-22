# 0005 — Cockpit editable via a small local backend

**Status:** Accepted · 2026-06-22 · revises `docs/PLAN.md` Phase 2 (was read-only / no-backend)

## Context

The reference spec describes the cockpit as **read-only over local JSON** (no backend). In practice a
pilot cockpit you cannot edit forces hand-editing JSON for every Kanban move or status change — high
daily friction. The cockpit is served **only over Tailscale** (`srv1100990.tail880531.ts.net`), never
public.

## Decision

Keep the React + Vite + TS + Tailwind + shadcn/ui front end, but make it **editable** through a **small
local write API** that persists the E-light JSON files (`config / deliverables / milestones / metrics /
contacts / quality_gates`). Tailscale provides the network boundary; no auth in V1. Request/response
shapes reuse `@ag/schema/cockpit` (zod) for validation on write.

## Consequences

- The Kanban/board is genuinely operational (move = persisted).
- A backend exists — a deliberate, scoped exception to "no-backend V1", justified by daily use and the
  Tailscale-only exposure. Writes validate against zod and must not mutate **canonical** product data
  (cockpit pilots the launch; it is not the product DB — ADR 0007).
- Still no public exposure; `owasp-security` applies to inputs even behind Tailscale.
