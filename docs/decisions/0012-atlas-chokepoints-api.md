# 0012 — Atlas ↔ Chokepoints Read API (build-time, taint-aware)

**Status:** Accepted · 2026-06-22

## Context

The Atlas lives on the **public, static** site, but the Chokepoints Read API
(`docs/api-interface-contract.md`) is **read-only, Bearer-authenticated, and tailnet-only**
(`srv1305127.tail880531.ts.net`). A public browser can neither reach it nor hold the token.

Verified: the API is live and the build container reaches it over Tailscale (MagicDNS resolves
inside Docker). The shared `@ag/chokepoints` client tracks the API contract — now **v0.2.0**
(`docs/api-interface-contract_V2.md`, additive/backward-compatible; `.passthrough()` schemas absorbed
the new fields and the client gained typed methods for the new read endpoints).

## Decision

Integrate at **build time (SSG)** via a typed client package **`@ag/chokepoints`**:

- The Astro build (in the `tools` container, on the tailnet) fetches the chokepoints list + details and
  renders **static** Atlas pages (`/atlas` database section + `/atlas/chokepoints/[id]`). The Bearer
  token is a **build-only secret** (`CHOKEPOINTS_API_TOKEN` via `docker/.env`), never shipped to clients.
- **`read` scope only**: the client never sends `include_tainted`, so redistribution-restricted records
  stay excluded. `required_attributions` and the list `attribution_notice` are surfaced; geometry is
  labelled schematic; derived analytics are framed as candidates pending validation (data-integrity).
- **Graceful degradation**: missing token or unreachable API → the loader returns empty, the Atlas omits
  the database section, and the build still succeeds. Responses are zod-parsed defensively
  (`.passthrough()`), tolerating additive API changes.
- Atlas data refreshes on **rebuild** (slow content cadence makes this acceptable; no runtime coupling,
  token never at the edge).

## Consequences

- SEO-friendly static Atlas backed by canonical chokepoints data; editorial fiches and the API-backed
  database coexist.
- Updating the Atlas DB requires a rebuild (`npm --workspace @ag/public run build`).
- Tainted records are never published; the public site only ever uses a `read` token.
- The Read API stays a separate, read-only concern; the lead endpoint (ADR 0011) is unrelated.
