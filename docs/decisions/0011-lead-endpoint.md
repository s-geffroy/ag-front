# 0011 — Self-hosted public lead endpoint

**Status:** Accepted · 2026-06-22 · implements [ADR 0006](0006-lead-capture-self-hosted-endpoint.md)

## Context

The public contact form must submit leads. The contract handed over (`docs/api-interface-contract.md`)
is the **Chokepoints Read API** — read-only (no write/lead route) and **tailnet-only** — so it cannot
receive public form posts. ADR 0006 already decided on a self-hosted endpoint; this ADR implements it.

## Decision

A dedicated **`apps/lead-api`** (Express) service exposes **`POST /api/lead`**, fronted by Caddy on the
same origin (`https://www.applied-geopolitics.com/api/*` → `lead:8080`) — no CORS, no host port (only
Caddy reaches it).

- **Validation:** `@ag/schema`'s `LeadInput` (zod). **Anti-abuse (owasp):** honeypot field (`website`,
  silently dropped), in-memory per-IP rate limit, 16 kB body cap, generic error responses, no input
  reflection.
- **Storage:** maps the lead to a cockpit **Contact** (`stage: identified`, `source: web_form`) appended
  to `apps/cockpit/data/contacts.json` → it surfaces in the cockpit **Acquisition** pipeline. Also
  append-only to a `leads.ndjson` ledger (git-ignored — may contain personal data).
- **Email:** optional `notifyLead` via nodemailer, **no-op unless `SMTP_*` env is set** (pluggable
  later). User input goes only into the body + a validated `replyTo`; subject is a fixed label (no
  header injection).
- **Front end:** the Astro contact form posts same-origin JSON, shows success/failure, and falls back to
  `mailto:` on network error.

## Consequences

- Leads flow into the existing acquisition pipeline; the founder sees them in the cockpit.
- Email is one env-var change away; no SMTP dependency to run.
- The Chokepoints Read API stays a separate, read-only, tailnet-only concern — never the lead sink.
- `contacts.json` diverges from its seed in production as leads arrive (expected for a data file).
