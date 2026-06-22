# 0006 — Lead capture = self-hosted endpoint

**Status:** Accepted · 2026-06-22

## Context

The public site captures leads (strategic-exchange / pilot / critique / press) and newsletter sign-ups.
Options: a third-party form/email service vs a self-hosted endpoint. The business values **control over
prospect data** (qualified B2B contacts feed the acquisition pipeline) and GDPR posture.

## Decision

Use a **self-hosted endpoint** for form submissions and newsletter opt-in. Payloads validate against
**`@ag/schema`** zod shapes; captured leads map to the cockpit **Contact** model (acquisition pipeline).
The concrete **API interface contract is supplied by the user** when implementation starts — until then
only the types/schemas are prepared, the endpoint is not built.

## Consequences

- Full ownership of lead data; no third-party form processor.
- We carry the infra + **GDPR** obligations (EU hosting, consent, retention) — to be detailed when the
  endpoint is built.
- Shared zod schemas keep the public form, the endpoint, and the cockpit Contact model in lockstep.
