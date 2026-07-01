# 0062 — Consumer pinned-contract client for the Chokepoints Read API

**Status:** Accepted · 2026-07-01

## Context

Tailnet peers other than the Astro build need to consume the Chokepoints Read API
(`srv1305127.tail880531.ts.net/api`, read-only, Bearer-authenticated, tailnet-only). The existing
integration (ADR 0012) is a **TypeScript, build-time** client (`@ag/chokepoints`, zod `.passthrough()`)
embedded in the Astro build — it is coupled to that repo's toolchain and refreshes only on rebuild.

A second consumer profile is now real: **out-of-band, Python-side** callers that want a typed client
without vendoring the API's source, and — critically — **without silently inheriting producer-side
contract changes**. The producer can bump the OpenAPI contract at any time; a consumer that regenerates
its client from the *live* endpoint would drift on every deploy, turning a producer change into an
unannounced consumer break. The API description (`/openapi.json`, `/docs`, `/redoc`) is served
**tokenless** to any tailnet peer; only data endpoints require a Bearer token (scopes `read` /
`read_tainted`, ADR 0013). Tokens are issued producer-side; consumers cannot mint them.

## Decision

Adopt a **pin-and-drift-check** consumer pattern, materialised in `scripts/consumer/`:

- **Pin the spec, generate from the pin — never the live endpoint.** `sync_contract.sh` fetches the
  tokenless `/openapi.json` and, on first run, pins it at `contract/openapi.json` (committed →
  reproducible builds). `gen_client.sh` generates a typed httpx client **from the pin only**, so the
  client changes only on a **deliberate** contract bump.
- **Drift is surfaced, never auto-applied.** On later runs `sync_contract.sh` compares live vs pin:
  identical → exit 0; drift → write `openapi.live.json` + an `oasdiff`/textual diff, exit non-zero,
  **never overwrite the pin**. A cron (`flock`-guarded, daily) alerts on drift; accepting it is the
  explicit `cp openapi.live.json openapi.json && gen_client.sh`. Contract is SemVer — a minor bump is
  additive, a major may break; `oasdiff` classifies breaking changes in the alert.
- **Token via env, never in git.** The Bearer token lives only in a gitignored `.env` (`.env.example`
  committed), injected at call time (`docker run --env-file`). `/openapi.json` needs no token; data
  calls do. `read_tainted` + `include_tainted=true` are both required for restricted records, else
  403/404 (ADR 0013 stays enforced consumer-side).
- **Environment-agnostic generation.** `gen_client.sh` prefers `uvx`, falls back to `pipx` then Docker,
  so a consumer needs neither this repo's `tools` image nor a host Python. Generated-client runtime =
  `httpx` + `attrs` + `python-dateutil`; `post_hooks: []` skips generated-code lint.

This lives **outside** the Docker-only rule: it is consumer tooling that runs on an arbitrary tailnet
peer, not app-geo project build/lint/test.

## Consequences

- Producer contract changes can no longer break a consumer silently: the client is frozen to a
  committed pin, and drift is an alert + a diff to review, not an automatic regeneration.
- Two consumer profiles coexist by design: TS build-time `@ag/chokepoints` (ADR 0012) for the Astro
  Atlas, and this Python pinned-contract client for other tailnet peers. They share the contract, not code.
- Offline resilience: pin + generated client are local, so a consumer can build/develop even when the
  producer (data **and** live spec) is offline — the point of pinning.
- Operational caveat on **this** VPS: `ghcr.io` image pulls are blocked (403), so the Docker fallback
  uses a Docker Hub base image (`python` + `openapi-python-client==0.24.2`, the 0.24.x line kept for
  pydantic 2.9.2 / httpx 0.27.2 compat), or install `uv` for the preferred `uvx` path. `tufin/oasdiff`
  (Docker Hub) provides the drift classification. MAILTO alerts need an MTA; absent one, the cron logs
  to `drift.log`.
