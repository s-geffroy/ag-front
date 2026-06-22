# API Interface Contract — Chokepoints Read API

This is the integration contract for the **Chokepoints Read API**: how to reach it over
Tailscale, how to authenticate, and what data it returns. It is a self-contained reference
for any tailnet client. The always-in-sync machine contract is the OpenAPI document the API
serves at `/openapi.json` (interactive docs at `/docs`); this file is the human companion.

- **Decision of record:** [ADR 0007 — read API (FastAPI)](decisions/0007-read-api-fastapi.md)
- **Security posture:** [`docs/security/m3-read-api-review.md`](security/m3-read-api-review.md)
- **Deployment / ops runbook:** [`docs/deploy.md`](deploy.md)
- **API version:** `0.1.0`

## 1. Overview & status

- **Read-only.** No write routes. Canonical mutations happen only through the separate
  validation console (`/validate`, see `deploy.md`), never through this API.
- **Taint-aware.** Redistribution-restricted ("tainted") records are **excluded by default**
  ([ADR 0010](decisions/0010-license-taint-model.md)). They are reachable only with the
  `read_tainted` scope and `include_tainted=true`.
- **Geometry is schematic.** Coordinates are for display and proximity only — *not* validated
  for navigational or legal precision.
- **Posture.** Intended for **internal / contracted use**. Access is gated by tailnet
  membership *and* a Bearer token; front it with rate-limiting/CORS lock-down before any
  public exposure.

## 2. Access via Tailscale

The API runs as a Docker service bound to **loopback only** (`127.0.0.1:8000`) and is exposed
over **Tailscale serve** (tailnet-only HTTPS, Let's Encrypt cert) — never on the VPS public IP.

```
Base URL:  https://srv1305127.tail880531.ts.net/api
```

`tailscale serve --set-path /api` strips the `/api` prefix; the app runs with
`--root-path /api`, so all paths in §4 are relative to the base URL above
(e.g. `GET /chokepoints` → `https://srv1305127.tail880531.ts.net/api/chokepoints`).

Only devices on the tailnet can resolve/reach that host. There is no public route.

### Authentication

Every endpoint except `/health` and `/openapi.json` requires a Bearer token:

```
Authorization: Bearer <token>
```

Tokens are looked up by sha256 hash in `auth.api_key`; the last-used timestamp is updated on
each call. There are two **scopes**:

| Scope          | Capability                                                              |
|----------------|-------------------------------------------------------------------------|
| `read`         | Sees clear (non-tainted) records. `include_tainted=true` is rejected (403). |
| `read_tainted` | May pass `include_tainted=true` to also receive redistribution-restricted records. |

### Key management

Keys are managed with the `tools.api_keys` CLI, run inside the Docker `tools` service (the
project is Docker-only). The plaintext token is shown **once** at creation; only its hash is
stored.

```bash
# create (default scope is read)
docker compose -f docker/docker-compose.yml run --rm tools \
  python -m tools.api_keys create --name my-client --scope read
docker compose -f docker/docker-compose.yml run --rm tools \
  python -m tools.api_keys create --name analyst --scope read_tainted

# list / revoke
docker compose -f docker/docker-compose.yml run --rm tools python -m tools.api_keys list
docker compose -f docker/docker-compose.yml run --rm tools \
  python -m tools.api_keys revoke --name my-client
```

### Status codes

| Code | Meaning                                                                              |
|------|--------------------------------------------------------------------------------------|
| 200  | OK.                                                                                  |
| 401  | Missing/invalid token. Response carries `WWW-Authenticate: Bearer`.                  |
| 403  | `include_tainted=true` without the `read_tainted` scope.                             |
| 404  | Resource not found — **also returned for a tainted record** requested without scope (existence is not leaked). |
| 422  | Parameter validation failure (out-of-range / wrong type / missing required query).  |

## 3. Data model

The API surfaces three tiers of data, kept strictly separate:

| Tier | Source of truth? | What it is | Notes |
|------|------------------|------------|-------|
| **Canonical** | Yes | Human-curated chokepoints, flows, risks, relations, systems, episodes, sources. | Single source of truth; never mutated by analytics. |
| **Derived / analytics** | No | Engine outputs: criticality, substitution, flow exposure, reroute deltas, etc. | Candidate, append-only; never promoted to canonical without a human gate. |
| **File-backed analyses** | No | Theory-of-Constraints + Leverage-Points Markdown per chokepoint ([ADR 0027](decisions/0027-thinking-frameworks-toc-leverage.md)/[0028](decisions/0028-chokepoint-analyses-corpus.md)). | Read-only Markdown on disk, not in the DB. |

Responses embed disclaimers verbatim so consumers cannot mistake the tier:

- **Geometry** — *"Geometry is schematic and not validated for navigational or legal precision."*
- **Analytics** — *"Analytical results are derived, candidate outputs (not human-validated) and are never written back to canonical without a review gate."*
- **Analyses** — *"Derived systemic analysis (Theory of Constraints + Leverage Points, ADR 0027/0028). Figures are unvalidated public order-of-magnitude candidates pending human validation; capacities and geometry are schematic. No canonical mutation or priority promotion."*
- **Attribution notice** (on list endpoints) — *"Records may require source attribution. Redistribution-restricted (tainted) records are excluded by default; pass include_tainted=true to include them."*

### Core entities (as seen through the API)

- **Chokepoint** — the central object. A *summary* (id, name, kind, family, type, priority,
  region, taint fields) is returned by list endpoints; a *detail* adds flows, risks,
  geometries, external metrics, substitution alternatives (with derived reroute deltas),
  disruption episodes, and contributing `source_ids`.
- **Relation** — directed/undirected edges between two chokepoints (e.g. `alternative_route`,
  `bypass_asset`, `part_of`), with strength and analytical-effect tags.
- **Strategic system** — a named grouping of member chokepoints (e.g. a maritime corridor).
- **Disruption episode** — a historical event (e.g. `red_sea_2024`) and the chokepoints it hit.
- **Source** — registry entry with level and license summary (redistribution / attribution / risk).
- **Analytics result / engine run** — derived candidate outputs and the runs that produced them.

### Taint model ([ADR 0010](decisions/0010-license-taint-model.md))

Every chokepoint summary carries:

- `license_taint` (bool) — true if any contributing source restricts redistribution.
- `required_attributions` (string[]) — attribution strings to display when used.
- `max_license_risk` (string|null) — highest license risk among contributing sources.

Tainted records are filtered out by default. Aggregate counts (`member_count`,
`object_count`) reflect **clear members only**, so they never leak a tainted tally.

### Controlled vocabularies

Field values are drawn from closed vocabularies defined in
[`seed/controlled_vocabularies.yaml`](../seed/controlled_vocabularies.yaml) — cite that file
for the authoritative lists. Approximate sizes: priority classes **4** (`P0`–`P3`), object
kinds **5**, families **9**, flow types **83**, risk types **122**, relation types **23**,
source levels **10**, analytical effects **8**.

### Geometry

Stored as **GeoJSON in WGS84 (EPSG:4326)**, schematic. Each chokepoint may carry geometries
in several roles: `display_point` (Point, used for `/chokepoints/nearby`), `core_geometry`
(LineString/Polygon), `influence_area` (Polygon), `parent_system_geometry`.

## 4. Endpoint reference

All paths are relative to the base URL (§2). Unless noted, endpoints require a Bearer token
and accept `include_tainted` (bool, default `false`, `read_tainted` scope required to set true).

### Service

#### `GET /health` — liveness (open, no auth)
Returns `{"status": "ok"}`.

#### `GET /openapi.json` — OpenAPI 3 spec (open, no auth)
The canonical machine contract; interactive UI at `GET /docs`.

```bash
curl -s https://srv1305127.tail880531.ts.net/api/health
curl -s https://srv1305127.tail880531.ts.net/api/openapi.json | jq '.paths | keys'
```

### Chokepoints

#### `GET /chokepoints` — list with filters
Query params: `family` (str), `priority_class` (`P0`|`P1`|`P2`|`P3`), `macro_region` (str),
`include_tainted` (bool), `limit` (int, 1–500, default 100), `offset` (int, ≥0, default 0).
Response `ChokepointList`: `count`, `include_tainted`, `attribution_notice`, `items[]` of
`ChokepointSummary` (`id, canonical_name, object_kind, family, type, priority_class,
macro_region, license_taint, required_attributions[], max_license_risk`).

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://srv1305127.tail880531.ts.net/api/chokepoints?priority_class=P0&limit=20"
```

#### `GET /chokepoints/{chokepoint_id}` — full detail
Returns `ChokepointDetail` = `ChokepointSummary` plus:
`flows[]` (`flow_type, importance_score, estimated_volume, volume_unit, value_status,
directionality, source_confidence`), `risks[]` (`risk_type, probability_score, impact_score,
vulnerability_score, current_status, triggers[], affected_flows[]`), `geometries[]`
(`geometry_role, geometry_status, geom_geojson`), `metrics[]` (`metric_key, metric_label,
value, rank, unit, period, source_id, url`), `alternatives[]` (`description, target_object_id,
affected_flows[], cost_penalty, time_penalty, capacity_penalty, feasibility, substitution_note,
validation_status, reroute_deltas[]`), `episodes[]` (`episode_key, name, started_on, ended_on,
status, severity, object_role`), `source_ids[]`, and `geometry_disclaimer`.
Each `reroute_deltas[]` item: `flow_type, vessel_class, delta_days, delta_cost_usd,
toll_saved_usd, net_cost_usd, suggested_cost_penalty, corridor`.
404 if the id is unknown **or** tainted-and-not-scoped.

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  https://srv1305127.tail880531.ts.net/api/chokepoints/p0_maritime_canal_panama_canal
```

#### `GET /chokepoints/search` — full-text search
Query params: `q` (str, **required**, 1–120 chars; matches id, canonical name, and aliases),
`include_tainted`, `limit` (int, 1–200, default 50). Response `ChokepointList`.

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://srv1305127.tail880531.ts.net/api/chokepoints/search?q=suez"
```

#### `GET /chokepoints/nearby` — spatial proximity (schematic display points)
Query params: `lat` (float, −90..90, **required**), `lon` (float, −180..180, **required**),
`radius_km` (float, >0..20000, default 500), `include_tainted`, `limit` (1–200, default 50).
Response `ChokepointList`. Proximity is computed on the schematic `display_point` — not
navigational truth.

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://srv1305127.tail880531.ts.net/api/chokepoints/nearby?lat=30&lon=32&radius_km=300"
```

#### `GET /chokepoints/by-flow/{flow_type}` — chokepoints carrying a flow
404 if `flow_type` is not in the vocabulary. Response: list of `FlowChokepointOut`
(`ChokepointSummary` + `importance_score`), ordered by importance.

#### `GET /chokepoints/by-risk/{risk_type}` — chokepoints exposed to a risk
404 if `risk_type` is not in the vocabulary. Response: list of `RiskChokepointOut`
(`ChokepointSummary` + `impact_score`), ordered by impact.

#### `GET /chokepoints/by-system/{system_id}` — members of a strategic system
404 if the system is unknown. Response: list of `ChokepointSummary`.

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  https://srv1305127.tail880531.ts.net/api/chokepoints/by-flow/crude_oil
```

### Relations & strategic systems

#### `GET /relations` — all chokepoint-to-chokepoint relations
Response: list of `RelationOut` (`from_object_id, to_object_id, relation_type, directionality,
strength_score, analytical_effect[], affected_flows[]`).

#### `GET /strategic-systems` — list systems
Response: list of `StrategicSystemOut` (`id, name, system_type, priority_class, notes,
member_count`). `member_count` counts clear members only.

#### `GET /strategic-systems/{system_id}` — system detail + members
404 if unknown. Response `StrategicSystemDetail` = `StrategicSystemOut` + `members[]` of
`SystemMemberOut` (`chokepoint_id, canonical_name, member_role, priority_class, license_taint`).
Members are taint-aware.

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  https://srv1305127.tail880531.ts.net/api/strategic-systems
```

### Disruption episodes

#### `GET /episodes` — list episodes
Response: list of `EpisodeOut` (`episode_key, name, description, started_on, ended_on, status,
severity, affected_flows[], object_count`). `object_count` counts clear members only.

#### `GET /episodes/{episode_key}` — episode detail + affected chokepoints
404 if unknown. Response `EpisodeDetail` = `EpisodeOut` + `members[]` of `EpisodeMemberOut`
(`chokepoint_id, canonical_name, object_role, priority_class, license_taint`).

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  https://srv1305127.tail880531.ts.net/api/episodes/red_sea_2024
```

### Sources

#### `GET /sources` — source registry
Response: list of `SourceOut` (`source_id, source_name, source_level, url,
redistribution_allowed, attribution_required, license_risk`).

### Analytics (derived / candidate)

#### `GET /analytics/results` — derived analytical results
Query params: `object_id` (str), `engine_id` (str), `status` (str), `include_tainted`,
`limit` (int, 1–1000, default 200). Response: list of `AnalyticalResultOut` (`id, run_id,
engine_id, engine_version, input_snapshot_id, object_id, object_type, result_type, status,
score, confidence, result_summary, result_payload, generated_at, disclaimer`). Taint-aware
via the referenced canonical object.

#### `GET /analytics/engine-runs` — engine run history
Query param: `engine_id` (str). Response: list of `EngineRunOut` (`run_id, engine_id,
engine_version, input_snapshot_id, status, started_at, finished_at, output_result_count,
error_message`).

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://srv1305127.tail880531.ts.net/api/analytics/results?object_id=p0_maritime_canal_panama_canal"
```

### File-backed analyses (Theory of Constraints + Leverage Points)

#### `GET /chokepoint-analyses` — list available analyses
Query params: `priority_class`, `family`. Response `ChokepointAnalysisList`: `count`,
`disclaimer`, `items[]` of `ChokepointAnalysisSummary` (`id, canonical_name, priority_class,
family, type, macro_region, available_docs[]`).

#### `GET /chokepoint-analyses/{chokepoint_id}` — full analysis
404 if none. Response `ChokepointAnalysisDetail` = summary + `synthesis_md`,
`theory_of_constraints_md`, `leverage_points_md`, `disclaimer`.

#### `GET /chokepoint-analyses/{chokepoint_id}/{doc}` — raw Markdown of one doc
`doc` ∈ `synthesis` | `theory-of-constraints` | `leverage-points`. Returns `text/markdown`.
404 if the doc is absent.

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  https://srv1305127.tail880531.ts.net/api/chokepoint-analyses/p0_maritime_canal_panama_canal
```

### Exports

#### `GET /exports/geojson` — schematic geometries as a FeatureCollection
Query param: `include_tainted`. Returns a GeoJSON `FeatureCollection` with a `note`
(geometry disclaimer); each feature's `properties`: `id, name, priority, family, taint, role`.

#### `GET /exports/jsonl` — stream chokepoint summaries (JSON Lines)
Query param: `include_tainted`. Streams `application/x-ndjson`, one `ChokepointSummary`-shaped
object per line.

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  "https://srv1305127.tail880531.ts.net/api/exports/geojson" | jq '.features | length'
```

## 5. Worked examples

Assume `TOKEN` holds a `read` (or `read_tainted`) key and `BASE` the base URL:

```bash
BASE=https://srv1305127.tail880531.ts.net/api
TOKEN=...   # from tools.api_keys create

# (a) list → detail: top-priority maritime chokepoints, then drill into one
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE/chokepoints?family=maritime_chokepoint&priority_class=P0" | jq '.items[].id'
curl -s -H "Authorization: Bearer $TOKEN" \
  "$BASE/chokepoints/p0_maritime_canal_panama_canal" | jq '{id, flows: .flows|length, risks: .risks|length}'

# (b) search by name/alias
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/chokepoints/search?q=hormuz" | jq '.items[].canonical_name'

# (c) export schematic geometries for a map
curl -s -H "Authorization: Bearer $TOKEN" "$BASE/exports/geojson" > chokepoints.geojson

# (d) include restricted records (requires a read_tainted key, else 403)
curl -s -H "Authorization: Bearer $TOKEN_TAINTED" \
  "$BASE/chokepoints?include_tainted=true" | jq '.count'
```

## 6. Caveats & versioning

- **OpenAPI is the canonical machine contract.** When this file and `/openapi.json` disagree,
  the spec wins — regenerate/refresh from `api/main.py` + `api/schemas.py`.
- **API version `0.1.0`** — no compatibility guarantees yet; expect additive changes.
- **Schematic geometry** is for display/proximity only, never navigational or legal use.
- **Analytics and file-backed analyses are candidates** pending human validation; they are
  never canonical and never trigger priority promotion.
- **Not public.** Reachable only on the tailnet and only with a valid Bearer token; add
  rate-limiting and CORS lock-down before any public exposure.
