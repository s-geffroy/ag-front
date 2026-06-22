# 0007 — Separate content vs cockpit data models

**Status:** Accepted · 2026-06-22

## Context

Two models are easily conflated. The **product** model (corridors, flux, Atlas fiches, notes, dossiers,
signals, thresholds, scenarios, CVI) is what the public site publishes. The **cockpit** model (E-light:
config / deliverables / milestones / metrics / contacts / quality_gates) tracks the *launch*. They
relate (a `deliverable` may produce a published fiche) but have different lifecycles and owners.

## Decision

Model them as **two namespaces** in `@ag/schema`: `@ag/schema/content` and `@ag/schema/cockpit`, each
with zod schemas + inferred types. CVI lives in its own package `@ag/cvi` and is referenced by content
(a corridor *carries* a CVI assessment). **Derived analysis (CVI rankings, health) never mutates
canonical records** (data-integrity rule); seeds are candidates pending validation
(`Provenance.validation_status` defaults to `candidate`).

## Consequences

- Clear ownership; apps import the narrow entrypoint they need.
- CVI rules (no 0–100 without documented methodology) are enforced once, in `@ag/cvi`.
- The cockpit Contact model is also the lead-capture target (ADR 0006), keeping acquisition coherent.
