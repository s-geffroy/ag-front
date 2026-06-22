# 0013 — read_tainted scope is internal-only (public stays clear)

**Status:** Accepted · 2026-06-22 · refines [ADR 0012](0012-atlas-chokepoints-api.md)

## Context

A `read_tainted` token (`ag-front-tainted`) was issued. Tainted records are
**redistribution-restricted**. The public site is open and search-indexed, so publishing tainted data
there would redistribute restricted content (hard to reverse). Owner's instruction: **the public front
must not show sensitive data.** At adoption there are **0 tainted records** — this is a forward-looking
boundary, not a current exposure.

## Decision

- **Public site (`apps/public`) stays `read` (clear).** The `@ag/chokepoints` client is safe-by-default
  (`include_tainted` sent only on explicit `includeTainted: true`); the public loader never opts in. The
  public build uses the `read` token (`CHOKEPOINTS_API_TOKEN`).
- **`read_tainted` is used ONLY by the internal cockpit** (Tailscale-only). A server-side proxy
  (`/api/chokepoints*`) holds the `read_tainted` token (`CHOKEPOINTS_API_TOKEN_TAINTED`, wired solely to
  the `cockpit` service) and sets `include_tainted=true`. New cockpit **Exploration** view lists/searches
  chokepoints; restricted records are marked (“Restreint” + `required_attributions` + `max_license_risk`)
  and must never be republished.

## Consequences

- Clear public surface vs. tainted internal surface, by construction (two tokens, two scopes).
- The token never reaches any browser (build-time for public; server-side proxy for cockpit).
- Reversible via env; if tainted records appear later, they surface only inside the tailnet cockpit.
- Verified: cockpit `/api/chokepoints` returns data with `include_tainted`; public GeoJSON publishes 0
  tainted features.
