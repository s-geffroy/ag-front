# API Interface Contract — Chokepoints Read API

This is the integration contract for the **Chokepoints Read API**: how to reach it over
Tailscale, how to authenticate, and what data it returns. It is a self-contained reference
for any tailnet client. The always-in-sync machine contract is the OpenAPI document the API
serves at `/openapi.json` (interactive docs at `/docs` (Swagger UI) and `/redoc` (ReDoc)); this
file is the human companion. A committed snapshot of the spec lives at [`docs/openapi.json`](openapi.json),
regenerated with `python -m tools.dump_openapi` and drift-guarded by a test (ADR 0050).

Consuming this API from **another VPS on the tailnet** (pinned spec + drift-check + typed client):
see [`consuming-the-api.md`](consuming-the-api.md) (ADR 0062).

- **Decision of record:** [ADR 0007 — read API (FastAPI)](decisions/0007-read-api-fastapi.md),
  [ADR 0050 — API contract tooling](decisions/0050-api-contract-tooling.md)
- **Security posture:** [`docs/security/m3-read-api-review.md`](security/m3-read-api-review.md)
- **Deployment / ops runbook:** [`docs/deploy.md`](deploy.md)
- **API version:** `0.6.0` — see the [Changelog](#7-changelog).

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
`flows[]` (`flow_type, importance_score, estimated_volume, volume_unit, volume_year, value_status,
directionality, source_confidence, method_note, sources[]`), `risks[]` (`risk_type, probability_score, impact_score,
vulnerability_score, assessment_status, risk_severity, triggers[], affected_flows[]`), `geometries[]`
(`geometry_role, geometry_status, geom_geojson`), `metrics[]` (`metric_key, metric_label,
metric_kind, value, rank, unit, period, source_id, url, notes, sources[]`), `alternatives[]` (`description, target_object_id,
affected_flows[], cost_penalty, time_penalty, capacity_penalty, feasibility, substitution_note,
validation_status, reroute_deltas[]`), `episodes[]` (`episode_key, name, started_on, ended_on,
status, severity, object_role`), `source_ids[]`, and `geometry_disclaimer`.
Each `reroute_deltas[]` item: `flow_type, vessel_class, delta_days, delta_cost_usd,
toll_saved_usd, net_cost_usd, suggested_cost_penalty, corridor`.
404 if the id is unknown **or** tainted-and-not-scoped.

**Reading a flow magnitude.** `estimated_volume` is meaningless without the three fields that qualify
it. `value_status` gives its evidence level (`official_reported`, `derived_from_components`,
`qualitative_scored`, …; full list in `seed/controlled_vocabularies.yaml`) — a `qualitative_scored`
flow carries no volume at all, by design (omit, never fabricate). `method_note` states how the number
was obtained and, critically, what it excludes. `sources[]` names the registry sources backing **that
flow specifically**, which is narrower than the object-level `source_ids[]` (the union over every claim
attached to the object). Consumers displaying a volume MUST surface `method_note` alongside it.

**Reading a metric.** `metrics[]` carries what is *not* a flow (ADR 0069). `metric_kind` is one of
`stock` (a balance at a date — participants, cards issued, a drawn swap balance), `ratio` (a share or a
rate of change), `rank`, `index`, or `capacity` (a maximum potential throughput, never a realised one).
`period` is a date for a stock and a span for a ratio. **Never compare a `stock` to a flow's
`estimated_volume`** — the two have different dimensions, and `metric_kind` exists so the mistake is
detectable programmatically rather than by reading prose. `sources[]` is the per-metric evidence; seeded
metrics carry it, while rows written by the external collectors (e.g. `cppi_2023`) legitimately return
an empty list.

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

#### `GET /chokepoints/{chokepoint_id}/perception-signals` — Polymarket P3 perception ([ADR 0037](decisions/0037-sfd-target-architecture.md))
Prediction-market odds as **anticipation, not event evidence**. The source (`polymarket_gamma`) is
uncleared (high license risk), so this endpoint is **gated on the `read_tainted` scope
unconditionally** — a plain `read` key gets **403**. 404 if the chokepoint is unknown. Optional
`limit` (1–500, default 200). Response: `PerceptionSignalList` (`chokepoint_id`, `count`,
`consensus[]` = liquidity-weighted odds per signal_family from the consensus engine, `signals[]` =
latest raw observations, `disclaimer`).

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  https://srv1305127.tail880531.ts.net/api/chokepoints/by-flow/crude_oil
# read_tainted scope required:
curl -s -H "Authorization: Bearer $TAINTED_TOKEN" \
  https://srv1305127.tail880531.ts.net/api/chokepoints/p0_maritime_strait_strait_of_hormuz/perception-signals
```

#### `GET /chokepoints/{chokepoint_id}/analysis` — all engine outputs (typed) — *new in 0.2.0*
Full typed output of **every chokepoint-scoped** analytical engine for this object's latest snapshot,
plus its relation edges and evidence claims (the JSON twin of the explorer detail page's "Engine
outputs"). Response: `{ chokepoint_id, disclaimer, engines[], relations[], claims[] }` where each
`engines[]` block is `{ key, title, description, columns[], rows[] }`. The engine `key`s are:
`evidence_quality`, `criticality_score`, `substitution_score`, `flow_exposure`, `risk_state`,
`system_cascade`, `control_concentration`, `regime_assessment`, `event_pressure`,
`prediction_consensus`, `network_centrality`, `corroboration`, `flow_value`, `weaponizability`,
`exposed_trade_loss` (a block appears only when that engine has a typed row for the object). The one
engine NOT here is the global-graph `system_resilience` — served at `GET /analytics/system-resilience`
(§ Analytics). Taint-aware; 404 for a tainted object without `read_tainted` + `include_tainted`.

#### `GET /chokepoints/{chokepoint_id}/fiche` — consolidated Control-Method fiche
The 16-section Chokepoint Control Method deliverable as JSON (validated leverage cells, actor profiles,
dependency, alerts, scenarios, backlog, regime, control architecture, formal/effective gap, audit). No
global power ranking (ADR 0049). Taint-aware.

#### `GET /chokepoints/{chokepoint_id}/actors` — control edges — *new in 0.2.0*
Validated actor↔chokepoint control edges (ADR 0041/0043). Response: list of `ActorControlOut`
(`actor_id, actor_name, actor_type, chokepoint_id, control_type, control_strength, basis,
source_confidence, valid_from, valid_to`). Taint-aware.

#### `GET /chokepoints/{chokepoint_id}/event-signals` — raw event stream — *new in 0.2.0*
Append-only event signals (USGS hazards + GDELT media, ADR 0042). Query: `limit` (1–2000, default 500),
`include_tainted`. Response: list of `EventSignalOut` (`chokepoint_id, domain, weight, observed_on,
event_key`). The aggregate is `event_pressure` in `/analysis`.

#### `GET /chokepoints/{chokepoint_id}/cvi-assessment` — Corridor Vulnerability Index — *new in 0.3.0*
Derived/candidate `CviAssessment` ([ADR 0055](decisions/0055-cvi-corridor-vulnerability-index.md)) for the
downstream VERDICT/HDDE consumer: 8 named 0–5 dimensions (`exposition, concentration, menace,
capacite_perturbation, resilience, cout_contournement, gouvernance, incertitude`), each
`{score:int 0–5, rationale, confidence ∈ bas|moyen|eleve, source_refs[], uncertainties[]}`. A dimension
with no real engine input is **omitted** (never fabricated). Response also: `scale="0-5"`, `global_level`
(`bas|modere|eleve|critique`, per-corridor binding-constraint summary), `methodology_documented=false` ⇒
**no `aggregate_score` is ever served** (hard gate, ADR 0049), `sources[]`, `uncertainties[]`,
`last_updated`, `engine_version` (staleness), `status` (`candidate|partially_validated|validated`),
`disclaimer`. Scope `read`; **no `include_tainted`** — a tainted/missing chokepoint returns the same `404`
(existence not leaked); `404` too when no assessment has been computed.

### Actors

#### `GET /actors` — validated actors — *new in 0.2.0*
Response: list of `ActorOut` (`id, name, actor_type, jurisdiction, validation_status,
control_edge_count`). Per-edge detail is `GET /chokepoints/{id}/actors`.

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
redistribution_allowed, attribution_required, license_risk`, and — *new in 0.2.0* — watch coverage
`domain_relevance, evidence_types[], storage_policy`).

#### `GET /vocabularies` — controlled vocabularies — *new in 0.2.0*
The enum-enforced vocabularies behind the data, including the CCM analytics lookups. Response:
`{ controlled{<name>:[...]}, control_dimensions[{control_dimension, dimension_family}],
actor_profile_types[{profile_type, is_critical}], alert_types[{alert_type, default_queue}],
architecture_labels[] }`.

### Analytics (derived / candidate)

#### `GET /alerts` — analytical alerts — *new in 0.2.0*
Typed alerts (ADR 0047). *An alert is a trigger for review, not a conclusion.* Query params:
`review_status` (default `open` + `acknowledged`), `chokepoint_id`, `include_tainted`, `limit`
(1–2000, default 500). Response: list of `AlertOut` (`id, chokepoint_id, canonical_name, alert_type,
level, time_horizon, queue, trigger_summary, affected_dimensions[], affected_actors[], confidence,
review_status, generated_at, disclaimer`). Taint-aware.

#### `GET /analytics/system-resilience` — whole-graph resilience (ENA) — *new in 0.4.0*
System Resilience via Ecological Network Analysis (Ulanowicz) over the **entire** systemic relation
graph — a single global result, not per-object, which is why it is served here rather than in
`/chokepoints/{id}/analysis` ([ADR 0057](decisions/0057-system-resilience-ena.md)). Derived/candidate,
never canonical; scope `read` (no taint dimension). Response `SystemResilienceOut`: `scope` (`"GLOBAL"`),
`total_system_throughput, ascendency, development_capacity, overhead, alpha, robustness, regime`
(`brittle|window_of_vitality|redundant`), `weight_basis` (`strength_proxy|throughput`), `node_count,
edge_count, engine_version, generated_at, disclaimer`. Latest snapshot only. **404** if no resilience
result has been computed yet (e.g. degenerate graph).

```bash
curl -s -H "Authorization: Bearer $TOKEN" \
  https://srv1305127.tail880531.ts.net/api/analytics/system-resilience
```

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
  the spec wins — regenerate the snapshot with `python -m tools.dump_openapi` (a test fails if
  `docs/openapi.json` drifts from the code). Interactive docs: `/docs` (Swagger UI), `/redoc` (ReDoc).
- **Versioning is [SemVer](https://semver.org/).** The version is `api/main.py` `FastAPI(version=…)`,
  echoed in `/openapi.json`. Additive, backward-compatible changes bump the **minor**; a breaking
  change (removed/renamed field or endpoint, narrowed type, new required input) bumps the **major** and
  is announced in the Changelog below. Detect breaking changes by diffing the committed snapshot with
  `oasdiff` (see ADR 0050).
- **API version `0.6.0`** — additive only vs 0.5.0; no client changes required.
- **Schematic geometry** is for display/proximity only, never navigational or legal use.
- **Analytics and file-backed analyses are candidates** pending human validation; they are
  never canonical and never trigger priority promotion.
- **Not public.** Reachable only on the tailnet and only with a valid Bearer token; add
  rate-limiting and CORS lock-down before any public exposure.

## 7. Changelog

Follows [Keep a Changelog](https://keepachangelog.com/); dates are release dates.

### 0.6.0 — 2026-07-09
**Added** (additive — no breaking change): stocks and ratios stop masquerading as flows.
- `ChokepointDetail.metrics[]` gains `metric_kind` (`stock | ratio | rank | index | capacity`), `notes`
  and `sources[]` (ADR 0069). A metric is **not** a flow: `estimated_volume` means realised throughput
  over `volume_year`, while a stock is a balance at a date. Comparing the two is a category error, and
  `metric_kind` is what makes it detectable without reading prose.
- Behaviour change worth noting: `p0_pipeline_bypass_asset_sumed_pipeline` no longer reports an
  `estimated_volume`. Its 2.5 mb/d **design capacity** moved to the `sumed_design_capacity` metric
  (`metric_kind: capacity`). It had been sitting in `estimated_volume`, where `engine_flow_value`
  multiplied a *maximum* by the crude price and served it as realised value. Consumers reading SUMED's
  flow value will now see it omitted, which is correct.

### 0.5.0 — 2026-07-09
**Added** (additive — no breaking change): a flow magnitude now travels with its qualifiers.
- `ChokepointDetail.flows[]` gains `volume_year`, `method_note` and `sources[]`. The first sourced
  finance magnitude (combined Visa + Mastercard card volume, `derived_from_components`) exposed the
  gap: `estimated_volume` was reachable while the note stating its exclusions was not. `sources[]` is
  the per-flow evidence, narrower than the object-level `source_ids[]`.

### 0.4.0 — 2026-07-01
**Added** (additive — no breaking change): full API coverage for every analytical engine.
- `GET /chokepoints/{id}/analysis` now emits five previously payload-only engines as typed blocks:
  `network_centrality`, `corroboration`, `flow_value`, `weaponizability`, `exposed_trade_loss` (they
  were reachable before only via the generic `/analytics/results` JSON payload).
- `GET /analytics/system-resilience` — System Resilience via Ecological Network Analysis over the
  whole systemic graph, the one global-scope engine (ADR 0057). Derived/candidate; 404 until computed.

### 0.3.0 — 2026-06-30
**Added** (additive — no breaking change):
- `GET /chokepoints/{id}/cvi-assessment` — Corridor Vulnerability Index assessment: 8 named 0–5
  dimensions for the downstream VERDICT/HDDE consumer, derived from the existing engines (ADR 0055).
  Candidate output, clearly marked (`status` + disclaimer); the 0–100 aggregate stays gated on a
  documented methodology and is never served.

### 0.2.0 — 2026-06-26
**Added** (all additive — no breaking change; existing clients keep working):
- `GET /chokepoints/{id}/analysis` — full typed output of every engine + relations + evidence claims.
- `GET /chokepoints/{id}/fiche` — consolidated 16-section Chokepoint Control Method deliverable (JSON).
- `GET /alerts` — analytical alerts (filterable by `review_status`, `chokepoint_id`).
- `GET /actors` and `GET /chokepoints/{id}/actors` — validated actors + their control edges.
- `GET /chokepoints/{id}/event-signals` — raw event-signal stream.
- `GET /vocabularies` — controlled vocabularies incl. CCM lookups.
- `GET /sources` now also returns watch coverage (`domain_relevance`, `evidence_types`, `storage_policy`).
- Committed OpenAPI snapshot `docs/openapi.json` + drift-guard test.

### 0.1.0 — initial
Read-only chokepoint data, search/nearby, relations, strategic systems, episodes, sources,
`/analytics/results` + engine-runs, file-backed analyses, GeoJSON/JSONL exports.
