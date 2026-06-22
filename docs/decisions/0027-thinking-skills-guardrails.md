# 0027 — Thinking-skills data-integrity guardrails

**Status:** Accepted (carried) · 2026-06-22

## Context

`thinking-theory-of-constraints` and `thinking-leverage-points` support corridor/flow analysis (binding
chokepoint, where to intervene, cascade to neighbours). Their outputs could be mistaken for facts.

## Decision

Constraint rankings, bypass capacities, and leverage effects are **derived analysis** — **candidates
pending human validation, never facts** — and **must not mutate canonical records**. They consume
derived/validated data and feed analysis surfaces only. This overrides any skill default.

## Consequences

- Analysis stays separable from canonical product data (aligns with ADR 0007).
- Schematic geometry/effects never imply navigational, legal, or predictive precision.
