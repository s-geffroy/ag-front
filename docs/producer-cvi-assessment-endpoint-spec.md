# Producer brief — ship `GET /chokepoints/{chokepoint_id}/cvi-assessment`

**Audience:** the LLM/engineer implementing the **Chokepoints Read API** (producer side, on
`srv1305127`). **Hand this file to that side as-is.**

**Why:** the consumer (`app-geo`) already ships a typed client method
`getChokepointCviAssessment(id)` and calls it from HDDE (`fetchCorridorCvi`, ADR 0035) to pre-fill the
CVI reading that feeds VERDICT. The endpoint is **not yet in the contract** (`v0.2.0` has no
`/cvi-assessment` path). Today the consumer call is **guarded** (try/catch → `null`, graceful
degradation), so nothing breaks — but the feature stays dark until you ship this route. Shipping it is
an **additive, backward-compatible** change → bump the OpenAPI `info.version` **`0.2.0` → `0.3.0`**
(minor). The consumer will see the drift alert, review it as non-breaking, accept the pin, regenerate.

## Route

```
GET /chokepoints/{chokepoint_id}/cvi-assessment
```

- **Auth:** `Authorization: Bearer <token>`, scope **`read`** (same as the other data endpoints).
- **Taint:** honor `?include_tainted=true` exactly like the sibling `/chokepoints/{id}/*` routes —
  restricted corridors require `read_tainted` **and** the flag, else **404** (never leak existence).
- **404** when the chokepoint is unknown, or is tainted and the caller lacks `read_tainted`.
- **422** on a malformed `chokepoint_id` (consistent with the existing validation error model).

## Response body (200) — JSON

The consumer validates the payload with `@ag/cvi`'s `validateCvi()` and **drops (returns `null`) any
payload that fails**, so a malformed or unsourced assessment silently disappears downstream. Match this
shape exactly:

```jsonc
{
  "scale": "0-5",                       // REQUIRED enum: "qualitative" | "0-5" | "0-100"
  "global_level": "eleve",              // optional enum: "bas" | "modere" | "eleve" | "critique"
  "dimensions": {                       // keyed by the 8 CVI dimension keys (see below)
    "menace":      { "score": 4, "rationale": "Acteurs hostiles présents", "confidence": "moyen" },
    "gouvernance": { "score": 3, "rationale": "Gouvernance fragmentée",     "confidence": "bas" }
    // ... any subset of the 8 keys; each score is an INTEGER 0–5, rationale non-empty
  },
  "aggregate_score": 62,                // optional number 0–100 (only meaningful for scale "0-100")
  "methodology_documented": false,      // REQUIRED-by-rule for 0-100 (see validity rules)
  "sources": ["chokepoints:run:cvi-2026-06"],   // provenance — SHOULD be non-empty (candidate ≠ fact)
  "uncertainties": ["Coût de contournement non chiffré"],
  "last_updated": "2026-06-30T00:00:00Z"        // optional ISO-8601 string
}
```

### The 8 CVI dimension keys (exact strings)

`exposition`, `concentration`, `menace`, `capacite_perturbation`, `resilience`, `cout_contournement`,
`gouvernance`, `incertitude`. Each dimension value = `{ score: int 0–5, rationale: non-empty string,
confidence?: "bas" | "moyen" | "eleve" }`.

### Validity rules the consumer enforces (mirror them producer-side so payloads survive)

1. **`scale` is required** and must be one of `qualitative` / `0-5` / `0-100`.
2. **`scale: "0-5"` ⇒ `dimensions` must be present and non-empty.** (An empty-dimensions 0-5 payload is
   rejected.)
3. **`scale: "0-100"` ⇒ `aggregate_score` is required AND `methodology_documented: true`.** Hard rule:
   *no 0–100 aggregate score without a documented methodology* (playbook). Without it, the consumer
   drops the payload.
4. Every dimension `score` is an **integer in [0,5]**; `rationale` is a **non-empty** string.
5. `sources` / `uncertainties` default to `[]` but SHOULD be populated — the consumer treats this as a
   **candidate pending validation, never a fact** (ADR 0027). Prefer emitting provenance.

### Scale gating by offering (recommended, not enforced by the consumer)

`qualitative` (Basic) → `0-5` (Standard) → `0-100` (Premium). For the HDDE→VERDICT prefill path, the
useful default is **`0-5` with per-dimension scores** (what the consumer maps to a qualitative level).

## Data-integrity constraints (producer side)

- The assessment is a **derived/analytical output**. It MUST NOT be produced by mutating canonical
  chokepoint records; compute it read-only from canonical + engine runs.
- Geometry/precision claims are out of scope here; this endpoint returns scores + provenance only.

## Definition of done

- [ ] Route returns the shape above for a known corridor with `scale: "0-5"` + ≥1 dimension + sources.
- [ ] Taint parity: restricted corridor → 404 without `read_tainted`+`include_tainted`.
- [ ] `info.version` bumped `0.2.0` → `0.3.0`; `/openapi.json` reflects the new path + a `CviAssessment`
      component schema.
- [ ] A `0-100` sample without `methodology_documented` is either not emitted or clearly flagged (the
      consumer will reject it).

Once shipped: on the consumer, `sync_contract.sh` alerts (additive/non-breaking per `oasdiff`), then
`cp openapi.live.json openapi.json && gen_client.sh`; the HDDE CVI prefill lights up automatically.
