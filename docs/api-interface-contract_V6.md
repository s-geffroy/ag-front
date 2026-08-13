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
- **API version:** `1.6.0` — see the [Changelog](#7-changelog).

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
Prediction-market odds as **anticipation, not event evidence**. The raw signals are **low-reliability
(S5) and internal-only**, so this endpoint is **gated on the `read_tainted` scope unconditionally** —
a plain `read` key gets **403**. The *derived* consensus aggregate is served clear at
`GET /chokepoints/{id}/prediction-consensus` (below); the raw markets stay internal by choice, not by
licence (the source is `cleared_with_attribution` — ADR 0083). 404 if the chokepoint is unknown. Optional
`limit` (1–500, default 200). Response: `PerceptionSignalList` (`chokepoint_id`, `count`,
`consensus[]` = liquidity-weighted odds per signal_family from the consensus engine, `signals[]` =
latest raw observations, `disclaimer`).

#### `GET /chokepoints/{chokepoint_id}/prediction-consensus` — derived Polymarket consensus (clear) — *new in 0.15.0*
The derived, liquidity-weighted consensus aggregate for one object at the **clear `read` token** — the
narrow, redistributable surface, so a consumer reads just this instead of the whole `/analysis` bundle.
Floored **twice**, and both floors are readable in the payload. On **attachment**
([ADR 0079](decisions/0079-polymarket-tier-floor.md), `attachment_rule = 'named_or_implied'`): only
objects a market **names or implies** return rows. On **cardinality** (*new in 0.18.0*,
[ADR 0087](decisions/0087-consensus-cardinality-floor.md)): a `signal_family` resting on fewer than
`minimum_market_count` markets is **not served**, because one quotation under a plural noun is not a
consensus. Either way an object with nothing left returns **200 with an empty `consensus[]`**, never
404. 404 only if the chokepoint is unknown or tainted-without-scope. Response:
`PredictionConsensusList` (`chokepoint_id`, `consensus[]` = `{signal_family, market_count,
consensus_probability, max_probability_change_24h, total_liquidity, observed_window_end,
attachment_rules}`, `minimum_market_count`, `disclaimer`). **Redistribute with Polymarket
attribution + S5/low-reliability disclaimer** (`cleared_with_attribution`, ADR 0083).

`minimum_market_count` (*new in 0.18.0*) is the cardinality floor **actually applied**, served rather
than merely obeyed. It is present even when `consensus[]` is empty, so you can distinguish *no
coverage* from *coverage refused by the floor*, and assert the threshold instead of trusting this
paragraph. The floor is **fail-closed on absence**: a row that cannot state its `market_count` does not
clear a floor on `market_count` (the column is `NOT NULL` since migration 0066, and `market_count` is
`required` and non-nullable in the schema). It applies **here only** — `/perception-signals`
(`read_tainted`) and the `prediction_consensus` block of `/analysis` keep serving the refused rows, so
what a public reader never sees stays countable internally (ADR 0083's posture).

`attachment_rules` (*new in 0.16.0*) is the list of rules that actually fed the aggregate, measured by
`array_agg(DISTINCT attachment_rule)` over the rows summed — **not** the engine constant re-printed. It
is `["named_or_implied"]` today because the engine filters on it, so you can **read** the floor instead
of trusting it. It stays a list because a future rule (e.g. an LLM-judged attachment) must be
distinguishable at the point of consumption, not fused into the same label — and because a widened
aggregate is a change of *matter* that an unchanged schema would otherwise hide from a coverage guard.

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

**This payload is NOT typed in the OpenAPI document.** Its response schema is `{}`, so no field inside
it — including every one named below — is described by the machine-readable contract. That is a real gap
and the root cause of what follows; typing it is owed, not done. Until then, read this section as the
specification.

**Each block carries `generated_at`** — the snapshot it comes from — since 1.5.0. An engine emits only
for objects that had input in that run, so an object that drops out keeps its previous row and it goes
on being served. On 2026-08-13, eight `regime_assessment` rows dated from 2026-07-12 or 2026-07-01. Read
the date before reading the value.

##### `pressure_score` — two different fields sharing one name

Reported by ag-front `0034`, who sort a public page on it. Both live in this payload:

| block | field | scale |
| --- | --- | --- |
| `event_pressure` | `pressure_score` | **0–100, bounded** — a saturating transform of a half-life-decayed sum (ADR 0042) |
| `regime_assessment` | `pressure_score` | **unbounded sum** of `severity × source-quality`, amplified by criticality (ADR 0039) |

The name collision is ours and it is a defect; the two are not interchangeable. On 2026-08-13 the Strait
of Hormuz read **100** in the first and **295.01** in the second.

**`regime.pressure_score` is not a ranking key, and must not be used as one.** It is compared against
three thresholds — `stress ≥ 1`, `disruption ≥ 3`, `closure ≥ 5` — and **above 5 it is undifferentiated
for its own purpose**. What its magnitude then tracks is how many signals we collected about the object:
Hormuz 295.01 on 308 contributing signals, Suez 138.32 on 59. Collection volume differs between objects
for editorial reasons — alias coverage, feed coverage — that have nothing to do with pressure. A ranking
built on it will read correctly wherever coverage happens to follow reality, and invert wherever it does
not.

**`0.0` is a measure, not a default.** Every zero row carries `contributing_signals: 0`: a regime was
computed and every signal that could have fed it had passed its TTL (72 h for an operational warning,
168 h for an official notice). It means "no live signal", which is not "calm" — and, per the paragraph
above, check `generated_at` before reading it as current.

**Cadence and window.** Recomputed with the engine pass inside the 6-hourly news refresh — four times a
day. There is no fixed window: each signal expires on its own TTL, so the score decays continuously as
signals age out. A large overnight drop is expiry, not a re-window.

**Coverage.** The engine emits only for objects with at least one live signal, which is why 10 of 30 P0
carry the field. Extending it to all 30 is not a code change: it needs signals to exist for objects we do
not currently cover, which is the recall ceiling of the collection slate — an editorial limit.


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
with no real engine input is **omitted** (never fabricated). In particular `resilience` is a **reroute-time
proxy** — "how long to go around?", from the searoute deltas ([ADR 0020](decisions/0020-substitution-deltas-from-searoute.md))
— and never "how long to repair or absorb?": no buffer/stock nor repair-time data exists. It is therefore
served only for the corridors whose modelled alternatives are other maritime nodes with a computed delta.
A chokepoint bypassed by pipelines or strategic reserves (Hormuz) has real alternatives but **no computable
delay**, so the dimension is omitted rather than scored — its absence is a data gap, not a claim of
resilience. Response also: `scale="0-5"`, `global_level`
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
  is announced in the Changelog below. **"New required *input*" means exactly that** — a field a
  consumer must now send. A *response* field that becomes required is a **strengthening**: we bind
  ourselves to always send it, the consumer's existing code keeps working, and their coverage guard
  gains a property it can check. Since 0.18.0 `tools/openapi_diff.py` scopes the rule to schemas
  reachable from a `requestBody`/`parameters` — see that release's note.
- **The rule is now enforced, not merely stated.** `docs/openapi.published.json` holds the last *published*
  contract; `tests/test_openapi_breaking_change.py` diffs the committed snapshot against it and fails on any
  removal, narrowing or new required input that is not paid for with a major bump. Promote the baseline
  deliberately, when releasing: `python -m tools.publish_contract`. (Before 2026-07-10 nothing enforced this
  — see the retroactive `0.3.0` Changelog entry — because `oasdiff` was only ever a "recommended workflow",
  ADR 0050, and the drift test compares the snapshot to the *code*, never to the published promise.)
- **Engine column names in `/analysis` are part of the contract.** The blocks are self-describing
  (`columns[]` + `rows[]`), so consumers bind to column names. A rename does not raise for them — it
  silently empties the value. The columns a consumer has told us it reads are pinned in
  `tests/test_analysis_contract_columns.py`; renaming one is breaking and must be announced here.
  Currently pinned: `weaponizability.leverage_score`, `exposed_trade_loss.exposed_value_usd`,
  `network_centrality.articulation_point`, `control_concentration.hhi`. If you consume another column,
  tell us and we will pin it.
- **API version `0.18.0`** — additive only vs 0.8.0 (every bump through 0.18.0 is non-breaking);
  no client changes required. 0.18.0 *withholds* rows on the public consensus surface (the cardinality
  floor) — a change of matter, not of schema: the shape a consumer binds to is unchanged, and the
  endpoint already returned an empty list for objects without coverage.
- **Schematic geometry** is for display/proximity only, never navigational or legal use.
- **Analytics and file-backed analyses are candidates** pending human validation; they are
  never canonical and never trigger priority promotion.
- **Not public.** Reachable only on the tailnet and only with a valid Bearer token; add
  rate-limiting and CORS lock-down before any public exposure.

## 7. Changelog

Follows [Keep a Changelog](https://keepachangelog.com/); dates are release dates.

### 1.6.0 — 2026-08-13
**Added** — `GET /chokepoints/{id}/analysis` is **typed**
([ADR 0104](decisions/0104-un-endpoint-non-type-ne-se-documente-pas.md)). Its response schema was `{}`
from 0.2.0 to 1.5.0: everything the endpoint served was invisible to the machine-readable contract, which
is why `pressure_score` appeared **zero times** in `openapi.json` and why ag-front had to measure a field
to learn it existed (`0034`).

`ChokepointAnalysisOut` now carries `engines[]` as a **union discriminated on `key`** — switch on it and
the rows are typed — plus typed `relations[]` and `claims[]`. One row model per engine, generated from
the typed tables themselves so the schema cannot drift from the columns. Every row field is optional:
these are analytics tables, an engine writes what it could compute and leaves the rest null; claiming
otherwise in the schema would be the fabrication we refuse in the data.

**One wire change, and only one.** `claims[].sources` was `null` for a claim with no source at all —
`array_agg(...) FILTER (...)` yields NULL rather than an empty array — and is now `[]`. That is the
truthful rendering: the claim exists and nothing backs it, which is *known*, not unknown. Everything else
on the response is byte-for-byte what 1.5.0 sent; only the description became precise. A consumer reading
the payload keeps working; one generating from the contract now gets types instead of `any`.

This one was found by calling the live API against production data — the fixtures give every claim a
source, so no test could have caught it. Typing an endpoint is also a way of discovering what it really
serves.

**Disclosure that typing forced into the open** — `pressure_score` appears **twice** in the document, in
`AnalysisRegimeAssessmentRow` (unbounded sum) and `AnalysisEventPressureRow` (bounded 0–100). The name
collision is a real defect of ours; one untyped dict was hiding it behind a single name.

### 1.5.0 — 2026-08-13
**Added** — `generated_at` on every block of `GET /chokepoints/{id}/analysis`. An engine emits only for
objects that had input in that run, so an object that drops out keeps its previous row and it goes on
being served as if current. On 2026-08-13 eight `regime_assessment` rows dated from 2026-07-12 or
2026-07-01 — and a `pressure_score: 0` from July is not the same statement as the same zero computed
today. Without the date they are one value. The `regime_assessment` block also gains
`observed_window_end`.

**Documented (no code change)** — `pressure_score`, reported by ag-front `0034`, who sort a public page
on it. See §`GET /chokepoints/{id}/analysis`. Three things they needed and the contract did not say:
**two different fields share the name** (`event_pressure.pressure_score` bounded 0–100, and
`regime_assessment.pressure_score` an unbounded sum — Hormuz read 100 and 295.01 on the same day); the
regime one **is not a ranking key** (thresholds at 1/3/5, undifferentiated above 5, its magnitude
tracking collection volume rather than exposure); and **`0.0` is a measure, not a default** (every zero
carries `contributing_signals: 0` — all signals past their TTL).

**Known gap, stated rather than left to be found** — the `/analysis` response schema is `{}` in the
OpenAPI document. Nothing inside it is machine-described, which is why `pressure_score` appears zero
times in `openapi.json` and why ag-front had to measure the field to learn it existed. Typing the
payload is owed; this release documents it instead.

### 1.4.0 — 2026-08-13
**Added** — `topic_break` on `NewsClusterOut`, and `scope=capped-supplied-set` in `topic_match_rule`
([ADR 0101](decisions/0101-un-sujet-qui-dure-porte-un-identifiant-qui-dure.md), amended). ag-front `0035`
§4 accepted the chaining rule and then found the hole in it: **the chain compares CAPPED samples.** Our own
`run_notes` say so — a busy day drops over a thousand bulk articles that did not fit the budget. So the
chain can break for a reason of **capacity, not of news**, and the most-covered topic is the most exposed
to it, which is the opposite of what anyone wants.

`topic_matched_by` keeps its two values on purpose: widening a response enum breaks a consumer that parses
it strictly, and ag-front parses strictly by design. The distinction rides on a nullable field instead —
`topic_matched_by: "new"` with `topic_break: null` is a **new subject**; the same with a `topic_break`
present is a **chain that snapped**. Without it, `topic_id` would reproduce `cluster_id`'s defect at a
lower frequency, and a rarer failure is a harder one to see.

`topic_break` carries `best_containment`, `shared_urls`, `candidate_urls`, and
`candidate_urls_dropped_by_cap` — how many of the predecessor's articles this pass's cap kept out of the
model's view. That last one is the honest half of the answer: we **cannot** recompute the overlap before
capping, because a cluster only exists over what the model was given. So we declare the scope in the rule
and measure what was hidden on each miss. Asked for in ag-front `0035` §4, both requests.

### 1.3.0 — 2026-08-13
**Added** — `country` and `country_source` on every article of `/news` and `/chokepoints/{id}/news`;
`countries[]` and `outlets_without_country` on each cluster
([ADR 0103](decisions/0103-le-pays-d-un-media-se-declare-il-ne-se-devine-pas.md)). Asked for by
ag-front `0030`.

`country` is ISO 3166-1 alpha-2 or `null`, and the field is **always present**: an absent field reads
as "no country", a `null` beside `country_source: "unknown"` reads as "we do not know", and those are
different sentences. `country_source` is `registry` (declared, hand-curated in our source registry) or
`unknown` — **never derived from the domain**. ag-front measured that TLD deduction is blind to the most
represented country, so a "dominant country" computed on it came out inverted; moving that heuristic one
step upstream would only make it invisible.

`countries[]` counts distinct **outlets** per declared country, not articles: an agency dispatch
reprinted by forty local stations is one story in forty places, and counting articles would read as
forty independent sources. `outlets_without_country` carries the unknowns beside the aggregate — the two
fields are not to be used one without the other.

**Coverage, stated rather than implied.** On the 2026-08-13 06:15 pass, **52 articles of 373 (14 %)**
come from the curated slate and carry a declared country; **321 (86 %)** come from the bulk GDELT feed
and stay `unknown`. That is LOWER than the 33 % ag-front derived from TLDs, and that is the improvement:
their 33 % carried a bias concentrated on one country, our 14 % carries only declared facts. The bulk
feed is not promised — our GKG reader takes 4 of 27 columns on purpose (ADR 0080), and GKG's location
fields describe the place an article is ABOUT, not where its publisher sits.

**Correction to our `0027` §5.** We told ag-front "no country column anywhere, not even in the source
registry". Literally true — there is no `country` column — and materially false: the registry already
carried `watch_meta.origin_country` for **all sixteen** curated feeds, hand-entered in ISO 3166-1
alpha-2. The data existed; it had never been served. Looking for a column and concluding a datum is
absent is the fault this corpus punishes everywhere else.

### 1.2.0 — 2026-08-13
**Added** — `validation_status` on `EpisodeOut` / `EpisodeDetail`
([ADR 0102](decisions/0102-une-absence-d-episode-n-est-pas-un-calme.md)). `status` says what the WORLD
is doing (`ongoing` / `ended`); `validation_status` says what WE have done about it. The episode layer is
hand-curated — no engine writes one — so every row is a `candidate` until a human rules, and until now
nothing in the payload said so. Found while answering ag-front's `0028`: it is their own defect
(`0029`, "an absence does not distinguish itself from a fact") one level down.

**Changed (matter, not schema)** — a new episode, `hormuz_closure_2026`, `ongoing` since **2026-02-28**,
severity `high`, on the Strait of Hormuz. ag-front's `0028` was right and the gap was ours: our `metrics`
layer measured a collapse (2.5 vessels/day for 2026-08 against Suez 36.5 and Malacca 230.5) while our
`episodes` layer knew nothing, in the same response. Their disruption banner reads our `status`, so their
public page showed nothing for five months of crisis.

Sourced as it actually is, and no better: the closure and its severity are established VERBATIM in the
IEA Oil Market Report of 14 April 2026, page 1 — "the Strait of Hormuz leading to the largest disruption
in history" and "with limited outlets after the effective closure of the Strait". **The start date is the
weak point**: 2026-02-28 converges across a Congressional Research Service product and encyclopaedic
sources, neither of which could be re-opened at the source (congress.gov serves a Cloudflare challenge,
which we do not circumvent), so it did not enter the evidence registry. Hence `source_confidence:
medium` on an episode whose closure is institutional. The metric corroborates; it does not date.

### 1.1.0 — 2026-08-12
**Added** — `topic_id`, `topic_matched_by` and `topic_match_rule` on `NewsClusterOut`
([ADR 0101](decisions/0101-un-sujet-qui-dure-porte-un-identifiant-qui-dure.md)). `cluster_id` is a
`gen_random_uuid()` drawn at insert and every run rewrites a fresh set of rows, so ag-front's
measurement — **0 identifiers in common out of 15** between two passes of the same corridor on the same
day (`0033`) — was the only possible result. It was documented ("do not treat a `cluster_id` as durable
across runs") and it still cost them a promotion refused to an operator who had done nothing wrong, a
public deduplication with no anchor, and an unpublish that could not find its target. Documenting was
not enough: a phrase in a contract does not offset a key that invites being used as a key.

`cluster_id` keeps its meaning — the identity of a grouping **in one pass**. `topic_id` is stable while
the topic keeps receiving articles. Use `topic_id` to deduplicate, `cluster_id` to address a snapshot.

The rule travels with the value: `topic_match_rule` carries its name, version and thresholds
(`url-containment@0.2.0:min_shared=min(2,|A|,|B|),containment>=0.5,lookback=3d,assignment=global-greedy`), `topic_matched_by` is `new` or
`url_overlap`. Chaining is by **containment** of article-URL sets, not Jaccard: a living topic's set
GROWS at every pass, so Jaccard falls as the story gets covered and would break the chain precisely on
the topics that matter. A predecessor is claimed once — two groupings of one run never inherit the same
`topic_id`, because that would fuse a story that split back into one line.

**Closure rule, stated:** a topic that receives nothing for **3 days** — the clustering window itself —
is closed, and its identifier is never reused. A later story on the same subject gets a new one, because
asserting continuity there would assert what nothing measured.

Note for consumers: keep a URL-based fallback. Ours can miss a match, and two guards beat one promise.

### 1.0.0 — 2026-08-12
**BREAKING** — thirteen endpoints that answered with a **bare JSON array** now answer with a
**counted envelope** ([ADR 0098](decisions/0098-une-liste-qui-sait-ce-qu-elle-ne-montre-pas.md)):
`GET /chokepoints/by-flow/{flow_type}`, `/chokepoints/by-risk/{risk_type}`,
`/chokepoints/by-system/{system_id}`, `/chokepoints/{id}/actors`, `/chokepoints/{id}/event-signals`,
`/sources`, `/relations`, `/actors`, `/alerts`, `/strategic-systems`, `/analytics/results`,
`/analytics/engine-runs`, `/episodes`. `for (const r of body)` stops iterating: the rows moved to
`body.items`.

Why it is worth the break: a bare array cannot say "this is everything" rather than "this is what I
found". `event-signals` served **500 rows on a corridor holding 6488** and **53 on one holding 53**, in
responses of identical shape (ag-front `0029`, reproduced here). The envelope carries `returned`,
`total_count` (a real `count(*)`, computed **before** the limit — never the page size), `truncated`,
`limit` (the limit actually applied, `null` where none is) and `generated_at`. Six of these lists had no
`limit` at all and returned whole tables; they now say so. An empty list becomes a sentence:
`total_count: 0, truncated: false` is not the same statement as `total_count: 4000, truncated: true`.

`total_count` counts what the filter matched, **taint included** — a row withheld by the licence rule is
in neither `items` nor `total_count`. A count that betrayed what the taint guard withheld would be a
leak, not honesty.

**BREAKING** — `NewsClusterChokepoint.relevance` is renamed **`cluster_salience`**
([ADR 0099](decisions/0099-la-prose-du-modele-porte-son-nom.md)). It never was a per-corridor relevance:
it is the cluster's single global `salience_score` — a model judgement — copied onto every corridor link,
so on a multi-corridor cluster every link ties and `ORDER BY relevance` degenerates. Renamed rather than
filled, because we have no per-corridor measure and inventing one would be the second mistake.
ag-front did not report this one; we owed it to them.

**Added** — `model_notes` on `NewsFeedOut`: the MODEL's own prose about its pass, kept out of
`run_notes`. Until now the two were one list, so a sentence a model wrote was indistinguishable from a
tally our code computed — in a field this contract asks you to render to a human deciding whether to
publish. ag-front found it the honest way: `בלבד`, Hebrew for "only", inside an otherwise French note
that travelled to their Slack (`0032` §2). The word is the benign symptom; the defect is the blend.
`model_notes` is bounded at 300 characters per note, is unverified, and is never a fact. `run_notes`
keeps its meaning and now contains only our deterministic counts.

**Changed (matter, not schema)** — `salience` is bounded `0..1` in the model's own JSON schema, not only
clamped afterwards: a model returning `7.5` silently became `1.0`, a fabricated value wearing a plausible
one's face. And `prompt_version` moves to `news-agg-0.3.0`, which constrains `notes[]` — French, at most
three notes of 200 characters, and only about the limits of the grouping work. It had no constraint at
all: no language, no length, no subject.

**Added** — `total_count` on `ChokepointList` (`/chokepoints`, `/chokepoints/search`,
`/chokepoints/nearby`). Its `count` is the PAGE size and always was; nobody reported the ambiguity,
which is the point — a field named `count` beside `items` reads as a total until someone paginates.
`count` is kept; it is simply no longer the only number. Additive: no consumer breaks.

**Not done, and why** — `actors_reviewed_at` / `episodes_reviewed_at`, asked for in the same message
(`0029` §2). Nothing here records that a *human looked at a layer*: the stamp would be written by the
loader and would date a machine write while claiming to date a review. That is the "guard described as
active while something else holds the line" failure we keep correcting on both sides. The alternative
offered on the channel is to hang the date on the validation queues, which do record dated human
decisions — narrower, and true.

**Note (guard changed, in its own commit BEFORE this one)** — `tools/openapi_diff.py` compared paths,
schemas, fields and enums but **never response shapes**: wrapping `list[X]` in an envelope keeps the
path, keeps `X` and removes no property, so the detector reported "no break" on precisely the change
that breaks every consumer. It now compares array-vs-object per response media type, and reports a
dropped media type. Shipped alone, with its justification, ahead of the change it must catch — ag-front
`0024` §1: modifying a guard in the very commit it blocks destroys the only evidence that it was
narrowed for the right reason.

**Note (baseline republished)** — `docs/openapi.published.json` had been frozen at `0.8.0` since
2026-07-10, so the breaking-change diff reported nine minor versions of accumulated delta on every run.
Promoted with this release (ag-front `0024` §3).

### 0.19.0 — 2026-08-12
**Changed (matter, not schema)** — `GET /chokepoints/{id}/cvi-assessment` no longer serves a
`concentration` dimension where **no substitution study exists**
([ADR 0097](decisions/0097-une-dimension-inferee-n-est-pas-une-dimension.md)). Upstream, the
substitution engine falls back to the bare count of `alternative_route` / `redundancy` /
`capacity_substitute` relations when nothing is modelled, so an object nobody had studied scored 5 for
lack of a study. Under the binding-constraint (max) rule that inference decided **305 of 313** core
verdicts and put the whole corpus in one band: `global_level = critique` on **313 / 313**, measured by
ag-front (`0026`) and reproduced here. Everywhere else in this engine a dimension without an input is
omitted; this was the only place one was fabricated. Measured effect on the core, before switchover:
**108 stay `critique`, 134 fall to `eleve`, 66 to `modere`, 5 to `bas`** — and no object loses its last
substantive dimension. This removes an assertion; it adds no knowledge about substitution (305 of 313
objects still await a written bypass capacity). Announced in `ag-back-out/0027` before switchover.
**Added** — four fields on `CviAssessment`: `binding_dimension` (which substantive dimension carries
the max, i.e. actually decides the level), `binding_confidence` (that dimension's own confidence,
promoted to the top level), `dimensions_evaluated` and `dimensions_total`. Under a max rule one
dimension decides; without these, a verdict resting on one low-confidence dimension is indistinguishable
from one resting on seven.
**Fixed** — `GET /analytics/cvi-counterfactual` read each object's latest row **per dimension**, which
crosses snapshots: once the engine stops emitting a dimension, that dimension's newest row is a
pre-0097 one and would be served forever, so the block would answer for a base that no longer exists.
It now reads one snapshot per object, whole — the rule `cvi-assessment` already applied. Consequence:
on the never-examined cohort it now reports `changent: 0`, because there is nothing left to remove;
that zero is the **verification that the removal was applied**, not the measure of a null slide, and
`method_note` says so.
**Note** — `incertitude` remains excluded from the binding constraint, as since ADR 0055. ag-front's
`0026` §4 anticipated that its effect "would reveal itself once `concentration` stopped being
saturated"; it will not — it has never weighed on `global_level`.

### 0.18.0 — 2026-08-10
**Changed (matter, not schema)** — `GET /chokepoints/{id}/prediction-consensus` now applies a
**cardinality floor**: a `signal_family` resting on fewer than **2** markets is not served
([ADR 0087](decisions/0087-consensus-cardinality-floor.md)). Measured on 2026-08-10 (snapshot
`879e87c9…`), **4 of 11 served rows rested on a single market — including both rows then publicly
displayed**: Panama and Suez each carried a "consensus" over one quotation. Effect, measured on that
snapshot: Panama loses its block entirely, Suez keeps `infrastructure_capacity` (n=29) and loses
`disruption` (n=1), Hormuz keeps three families and loses `perception_watch` (n=1), Bab-el-Mandeb is
unchanged, Taiwan loses its block. The floor is applied **on this endpoint only** — the engine keeps
writing the refused rows, and `/perception-signals` (`read_tainted`) and the `prediction_consensus`
block of `/analysis` keep serving them, so a row withheld from publication stays countable internally
(ADR 0083). Asked for by ag-front `0022` §2, answering our `0025` §4.
**Added** — `minimum_market_count` on `PredictionConsensusList`: the floor actually applied, served
rather than merely obeyed ("servez-le explicitement plutôt que de filtrer en silence"). Required, no
default, and present even when `consensus[]` is empty — so an empty list is distinguishable from
coverage refused by the floor, and the threshold can be asserted rather than trusted.
**Changed** — four response fields are now `required` **and non-nullable**:
`PerceptionConsensusOut.attachment_rules` and `.market_count`, `PerceptionSignalOut.attachment_rule`,
`EventSignalOut.attachment_rule`. Offered in our `0023` §5, requested in ag-front `0022` §4. Each is
backed by a `NOT NULL` column (migrations 0060, **0066** for `market_count`, 0059/0063, 0064), so this
states what the schema enforces. **This is a strengthening, not a break**: existing consumer code is
unaffected and gains a property its coverage guard can check.
**Note (guard changed)** — `tools/openapi_diff.py` flagged *any* newly-required property as breaking, on
every schema, though its own docstring and §6 above scope the rule to a new required **input**. The read
API has no `requestBody` at all, so the rule could only ever fire on responses — the case it was never
written for — and it refused the change ag-front had just asked for. It is now scoped to schemas
reachable from a `requestBody`/`parameters`; removal and enum-narrowing stay global. Both halves are
pinned by tests. Stated here because the guard was changed in the same release as the change it blocked.
**Note (perimeter)** — our exchange `0018` condition 2 ("publish only Panama and Suez") is **lifted**,
with no replacement allowlist; the floors are the perimeter (ADR 0087 §7). The LLM attachment judge
(ADR 0086) remains out of service — `llm_implied` is still zero rows in every table.

### 0.17.0 — 2026-07-29
**Added** — `attachment_rule` on the two RAW perception streams, so a caller can make the same
distinction the engines make. On `GET /chokepoints/{id}/perception-signals` (`read_tainted`) each market
row now carries the rule that attached it: `full_text` | `strongest_tier` | `named_or_implied` |
`llm_implied` ([ADR 0079](decisions/0079-polymarket-tier-floor.md), 0086). This endpoint has always
served rows written under incompatible rules and said so nowhere — a 12 %-precision July row looked
exactly like a floored one. On `GET /chokepoints/{id}/event-signals` each signal now carries
`name_match` | `llm_implied`.
**Note (matter, not schema)** — `llm_implied` is a *declared* value, not a served one yet: no row bears
it. It is **excluded** from `engine_prediction_consensus`, from `engine_event_pressure`, from the
media-attention spike and from `/news`, all by explicit filter. Entry into the clear `read` aggregate
would be announced on the channel first (ag-front `0019` engagement 10) — this release does not do it.
Existing columns unchanged; both fields are optional and additive.

### 0.16.0 — 2026-07-27
**Added** — `attachment_rules` on the consensus rows, served both by
`GET /chokepoints/{id}/prediction-consensus` and in the `prediction_consensus` block of
`GET /chokepoints/{id}/analysis`. It answers ag-front `0019` §5 ("nous préférerions le **lire**"): the
ADR 0079 floor was applied server-side but invisible in the payload. The value is **aggregated over the
rows actually summed**, not the engine constant re-printed — a literal restates intent, an aggregate
states what happened. `["named_or_implied"]` today; additive, existing columns unchanged. Now pinned in
`test_analysis_contract_columns.py`. See §4.
**Note (matter, not schema)** — the Polymarket matcher now requires **word boundaries**
([ADR 0084](decisions/0084-polymarket-gazetteer-integrity.md)). Measured on the 820 distinct markets
collected: attachment is **unchanged** (same 3 markets, same objects), and of the rows that actually
reach the aggregate only Panama's internal `relevance_score` moves (56 → 53, not a served field). What
changes is the noise underneath: `INDIRECT_CHOKEPOINT` falls from 816 markets to 8, because `UN` was
matching all 820 questions inside ordinary words. Nothing in the served consensus moves.

### 0.15.0 — 2026-07-26
**Added** — `GET /chokepoints/{id}/prediction-consensus`: the derived Polymarket consensus for one
object at the **clear `read`** token — the narrow, redistributable surface, so a consumer reads just
this instead of the whole `/analysis` bundle. Floored per ADR 0079 (Panama/Suez today); an object with
no honest coverage returns **200 + empty `consensus[]`**, never 404. Redistribute with Polymarket
attribution + S5 disclaimer. See §4.
**Changed** — the stale "uncleared (high license risk)" wording on the raw `/perception-signals`
endpoint (docstring, `PerceptionSignalList` disclaimer, the `/perception` page + banner) now reads
**"low-reliability (S5), internal-only"**: the raw stream stays `read_tainted` on **reliability**
grounds, not licence — the source is `cleared_with_attribution` and its derived aggregate is public with
attribution (ADR 0083). No functional or auth change — the gate is unchanged.

### 0.14.0 — 2026-07-26
**Added** — the `prediction_consensus` block (`GET /chokepoints/{id}/analysis`) gains a column
**`observed_window_end`** (the timestamp of the newest odds snapshot in the aggregate), so a consumer can
show an honest "consensus as of `<date>`" label without opening `/perception-signals`. Already computed
and stored; additive — existing columns unchanged. Now pinned in `test_analysis_contract_columns.py`.
**Changed** — the block's `description` no longer reads "(uncleared source)": the derived aggregate is
`cleared_with_attribution` (2026-07-12), so it now states it is redistributable **with Polymarket
attribution** and stays S5/low-reliability. Provenance being an unregulated market is a reliability flag,
not a redistribution bar (the raw `/perception-signals` endpoint stays `read_tainted` — unchanged here).

### 0.13.0 — 2026-07-26
**Changed** — the `prediction_consensus` engine (in `GET /chokepoints/{id}/analysis`) now floors
attachment on ADR 0079's rule: only odds rows the collector attached because the market **names or
implies** the object (`attachment_rule = 'named_or_implied'`) feed the aggregate. The retained pre-floor
history — `full_text` (~98% noise) and `strongest_tier` (12% precision), kept as an audit record
(migration 0059) — no longer moves a per-object consensus. No schema change; one consumer-visible
consequence:
- **Honest coverage is Panama and Suez only.** The `prediction_consensus` block previously appeared for
  ~8 corridors (Hormuz, Taiwan, Bab-el-Mandeb, Cape, Malacca, Turkish Straits included); those were
  built from 12%-precision actor-fan-out history and are gone. An object whose entire odds history is
  pre-floor now returns **no** `prediction_consensus` block, rather than a noise average. Redistribute
  the aggregate with Polymarket attribution + an S5/low-reliability disclaimer (source
  `cleared_with_attribution`).

### 0.12.0 — 2026-07-16
**Changed** — the `/news` aggregation model moved from `gpt-4o` to **`gpt-5.6-terra`** (reasoning, medium
effort). No schema change; three consumer-visible consequences (ADR 0076 §8):
- **`NewsClusterOut.model` now reads `gpt-5.6-terra`**, `prompt_version` `news-agg-0.2.0`.
- **Prose is now attributed, not asserted.** gpt-4o wrote "The US has renewed its blockade on Iran";
  gpt-5.6-terra writes "Plusieurs médias rapportent que les États-Unis ont réimposé…". The prompt always
  required the second form (a headline is not proof of a closure) — the chat model ignored it, the
  reasoning model applies it. If your UI added its own "reportedly" hedging, it is now redundant.
- **`summary_text`/`headline` are in FRENCH.** The prompt is French; gpt-4o answered in English regardless,
  gpt-5.6-terra follows it. Tell us if you need English — it is a one-line prompt change, not a redesign.
- **Coverage is no longer erratic.** Measured head-to-head on the same 129-article corpus, 3 runs each:
  gpt-4o accounted for 76–98% of articles with cluster counts of **6, 62, 12** (identical input — the shape
  of the feed was essentially random); gpt-5.6-terra accounts for 98–100% with counts of 39, 44, 45. Expect
  `run_notes` to report `UNACCOUNTED` rarely now, and a stable number of clusters run to run.

### 0.11.0 — 2026-07-16
**Added** — `NewsFeedOut.run_notes: list[str]` on `/news` and `/chokepoints/{id}/news`: what the
aggregation run reports about its OWN limits. **Render it.** The headline case: the model routinely places
only a fraction of the period's articles into clusters and says nothing — first live gpt-4o runs put
**26 of 129** articles in a cluster (20%), ignoring 103. The note then reads "LOW COVERAGE (<50%): this
feed is a SAMPLE of the period's coverage, not a summary of it". Without it, a tidy list of clusters looks
like the news while being a fifth of it. Empty list = nothing to report.

**Added** (additive — no schema change): a new `alert_type` value on `GET /alerts` and
`GET /chokepoints/{id}/alerts`: **`media_attention_spike`** (ADR 0077). Consumers that switch on
`alert_type` must handle it; `disruption_risk_alert` is unchanged.
- **Why it exists.** `disruption_risk_alert.level` is a function of `regime.lifecycle_phase`, and the regime
  veto correctly caps media-only evidence at `stress` — press coverage does not establish an operational
  fact. But `stress → elevated` is unconditional, so every media-driven crisis emitted the same level: on
  2026-07-16 the Strait of Hormuz (live US-Iran exchange, tankers struck, 123 media signals, pressure≈36.45)
  carried the SAME alert as the Panama Canal at pressure≈1.59. The veto's correctness had flattened the
  alert layer.
- **What it means.** The two alerts answer different questions. `disruption_risk_alert` = "can we ASSERT a
  disruption?" (veto-governed, media can never drive it past `stress`). `media_attention_spike` = "is
  something HAPPENING worth a look?" — it may escalate freely precisely because it asserts nothing about
  operational state. **Do not render it as a disruption, a confirmation, or an incident.** Its
  `trigger_summary` states "coverage volume only, NOT evidence of disruption"; keep that meaning in the UI.
- **How it is scored.** Against each object's OWN 28-day baseline, not an absolute threshold (raw volume
  measures fame and feed coverage as much as danger — Hormuz always outsignals Panama), and on two axes:
  the ratio decides whether anything changed, the volume decides how loud. `critical` needs both (ratio ≥ 3
  AND ≥ 10 articles/day); ratio alone would rank a quiet object's stirring above a war, which it did on
  first implementation. `level` uses the existing vocabulary (`none|watch|elevated|critical`); the ratio and
  both rates are stated verbatim in `trigger_summary`.
- **As with every alert**, it is created `review_status: open` and routed to a queue: a trigger for human
  review, never a conclusion (ADR 0037).
- **Caveat, stated plainly:** thresholds are calibrated on one day of live data plus fixtures, and a feed
  added today cannot inform this alert until it has its own baseline (28 days) — new sources are excluded
  from BOTH windows so a slate change cannot masquerade as a world event.

### 0.10.0 — 2026-07-16
**Added** (additive — no breaking change): live chokepoint news (ADR 0076). Media articles collected from a
curated 15-outlet RSS slate (6-hourly) and from GDELT (daily) are grouped **by event** by an LLM and served
as readable clusters. Until now an article entered only as a weight in `event_signal`; its title and URL sat
in `raw_payload` and were never exposed.
- `GET /news` returns `NewsFeedOut` — params `since` (1..30, default 7), `limit` (1..200, default 50),
  `chokepoint_id?`, `category?` (`security|congestion|weather|policy|market|infrastructure|other`),
  `include_tainted`. Ordered by `salience_score DESC, last_seen DESC`.
- `GET /chokepoints/{id}/news` returns the same `NewsFeedOut`, restricted to clusters linked to that
  chokepoint, ordered by `relevance DESC, salience_score DESC`. 404 on an unknown/tainted-and-not-permitted
  chokepoint, as elsewhere.
- **Trust boundary — read this before consuming.** Only `headline`, `summary_text`, `event_category`,
  `geographic_scope` and `salience_score` are model-authored, and they may be wrong. Every fact —
  `article_count`, `source_domains`, `articles[]`, `first_seen`/`last_seen`, `affected_chokepoints[]` — is
  recomputed **server-side** from the collected signal rows. A member or a chokepoint the model invents is
  dropped before storage, never served.
- **News is never proof of a closure.** Every article enters as `domain='media_report'`, which the regime
  engine caps at `stress` (ADR 0042). A cluster headlined "strait closed" records what media REPORT; only an
  authority's `operational_notice` can drive `disruption`/`closure`.
- **Snapshot semantics.** Each response serves the LATEST run only (`run_id`, `generated_at` on the feed);
  runs are swept at 14 days. `observations.event_signal` stays append-only and is the source of truth, so any
  snapshot is rebuildable — do not treat a `cluster_id` as durable across runs.
- **Taint partitions, it does not filter.** Each run is aggregated into two alternative passes: `cleared_only`
  (non-tainted sources only) is served to a `read` principal; `all_sources` (richer) is served **instead** to
  a `read_tainted` principal passing `include_tainted=true` — never both, so no event is returned twice. The
  served pass is named in `taint_class`. `include_tainted` without the `read_tainted` scope is a 403, as
  everywhere. Article-level source attribution is required: see `attribution_notice`.
- With no `OPENAI_NEWS_API_KEY` configured, aggregation runs an **offline façade**: a real run with ZERO
  clusters (`offline_facade: true`). An empty feed is honest; a fabricated one would not be. `count: 0` with
  no `run_id` means no aggregation has ever run.

### 0.9.0 — 2026-07-15
**Added** (additive — no breaking change): the CVI `concentration`-removed counterfactual is exposed as a
durable endpoint, at ag-front's request (canal 0012).
- `GET /analytics/cvi-counterfactual?scope=core` returns `CviCounterfactualOut`: over the cohort of scope
  objects **never examined for substitution** (no modelled alternative, no alternative-route/redundancy/
  capacity_substitute relation), it replays the engine to count how the binding-constraint `global_level`
  slides once the inferred-from-absence `concentration` dimension is dropped — `population`, `changent`
  (level moves), `critique_vers_bas` (falls critique→bas), plus `removed_dimension` and the four score→level
  `buckets`. It reproduces the CTE cross-validated in `ag-back-out/0006`.
- `population` is a **live count** (≈305 in core today) — it drifts with the base, and the endpoint makes
  the drift visible at every consumer build rather than a `SELECT` that only proves one day. Numbers are
  candidate (`status: candidate`, verbatim disclaimer); the block validates nothing and never mutates
  canonical. No per-object identity is exposed, so no taint filter applies; `scope` is a bounded enum
  (`core` default; `bulk` has no CVI scores → population 0).

### 0.8.0 — 2026-07-10
**Added** (additive — no breaking change): the CVI `resilience` dimension is served where it can be computed.
- `GET /chokepoints/{id}/cvi-assessment` may now return **8 dimensions instead of 7**. `resilience` had never
  been emitted for any chokepoint: `engines/cvi.py` carried the field and the scoring block, but nothing ever
  assigned `reroute_delta_days`. It now reads the searoute deltas (`analytics.substitution_route_delta`,
  ADR 0020) — best modelled alternative per flow, then the binding flow — so the dimension appears for the
  6 corridors that have one (Panama, Suez, Bab el-Mandeb, Singapore, Gibraltar, Malacca).
- It is a **reroute-time proxy** (`confidence: bas`, uncertainty stated verbatim): "how long to go around?",
  never "how long to repair or absorb?". Hormuz still returns **7 dimensions** — its alternatives are
  pipelines and strategic reserves, which searoute cannot time. The omission is a data gap, not a claim that
  Hormuz is resilient; do not read an absent dimension as a low score.
- No `global_level` changes: the 6 corridors were already `critique` on another dimension. Engine
  `corridor_vulnerability` 0.1.0 → **0.2.0** (staleness signal).
- Contract, now enforced: engine column names in `/analysis` are public API (see §6), and a breaking change
  can no longer ship without a major bump (`tests/test_openapi_breaking_change.py`).

### 0.7.0 — 2026-07-10
**Added** (additive — no breaking change): the SFIM fiche stops reading as structurally empty.
- `SfuFicheOut.scoring[]` now merges the engine's auto-filled dimensions with the analyst's submission
  instead of returning only the latter. It had returned `[]` for every SFU, because `engines/sfim.py`
  writes `result_type='sfim_auto_dimension'` while the fiche read only `'sfim_scoring'` — a type produced
  at analyst submit time alone. Precedence is **by result type, per dimension** (a submission wins; an
  unsubmitted dimension falls back to the latest succeeded `sfim` run), never by timestamp, so a fresh
  engine run cannot mask a score a human signed.
- `SfuDimensionOut` gains `origin` (`analyst_submission | engine_auto`).
- `SfuFicheOut` gains `completeness` (`SfuCompletenessOut`) and `StrategicFlowUnitSummary` gains
  `dimensions_scored`. An empty block is now a readable state — "4 of 10 dimensions, engine-sourced,
  `awaiting_analyst_verdict: true`" — rather than a silent `[]`. Per ADR 0054 only 4 of the 10 dimensions
  have a deterministic engine source; the 6 judgment dimensions and the verdict are authored by a human,
  so `verdict: null` is the designed state, not a gap.

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
**Added** (additive):
- `GET /chokepoints/{id}/cvi-assessment` — Corridor Vulnerability Index assessment: 8 named 0–5
  dimensions for the downstream VERDICT/HDDE consumer, derived from the existing engines (ADR 0055).
  Candidate output, clearly marked (`status` + disclaimer); the 0–100 aggregate stays gated on a
  documented methodology and is never served.

**Changed — BREAKING, and mis-shipped** *(entry written 2026-07-10; this line was missing for two weeks)*:
- `RiskOut.current_status` was **removed**, replaced by `assessment_status` (`to_assess|monitoring|assessed`)
  \+ `risk_severity` (`baseline|seasonal|structural|elevated|active`) — the old field conflated the
  assessment workflow with the risk posture (ADR 0052, commit `3c55522`, **2026-06-27**).
- Per §6 a removed field bumps the **major**. This shipped three days earlier, under an unchanged `0.2.0`
  literal, and was never announced. A consumer pinned to `0.2.0` therefore saw the contract change beneath a
  stable version number, kept reading `current_status`, and rendered an **empty field with no error** until
  ag-front reported it on 2026-07-10. The honest number was `1.0.0`; we record the debt rather than renumber
  published history, and we do not re-break the field to correct it.
- Root cause: nothing enforced §6. `oasdiff` was adopted as a "recommended workflow, not wired to CI"
  (ADR 0050) and never ran; the drift test compares the snapshot to the *code*, so a removed field simply
  rewrote the snapshot and passed. Fixed in 0.8.0 by `tests/test_openapi_breaking_change.py`, which diffs
  against `docs/openapi.published.json`.

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
