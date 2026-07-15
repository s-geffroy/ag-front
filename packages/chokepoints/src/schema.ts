import { z } from 'zod';

// Response shapes for the Chokepoints Read API (v0.6.0). Defensive: `.passthrough()` tolerates extra
// fields and additive API changes. Mirrors docs/api-interface-contract_V3.md.
//
// `.passthrough()` is a runtime safety net, NOT a licence to leave fields undeclared: an undeclared
// field survives parsing but is invisible to consumers, so it is never rendered. `contract-coverage.
// test.ts` therefore asserts, field by field, that every property of the pinned contract is declared
// here — that guard is what makes "the app consumes the whole API" a build-time property rather than
// a periodic catch-up. It is what would have caught the 0.4.0 `current_status` → `assessment_status`
// rename, which silently blanked two live UIs.

export const ChokepointSummary = z
  .object({
    id: z.string(),
    canonical_name: z.string(),
    object_kind: z.string().optional(),
    family: z.string().optional(),
    type: z.string().optional(),
    priority_class: z.string().optional(),
    macro_region: z.string().nullish(),
    license_taint: z.boolean().optional(),
    required_attributions: z.array(z.string()).default([]),
    max_license_risk: z.string().nullish(),
  })
  .passthrough();
export type ChokepointSummary = z.infer<typeof ChokepointSummary>;

export const ChokepointList = z
  .object({
    count: z.number().optional(),
    include_tainted: z.boolean().optional(),
    attribution_notice: z.string().optional(),
    items: z.array(ChokepointSummary).default([]),
  })
  .passthrough();
export type ChokepointList = z.infer<typeof ChokepointList>;

/**
 * A flow magnitude is meaningless without its qualifiers. `estimated_volume` is realised throughput
 * over `volume_year`; `value_status` grades the evidence (a `qualitative_scored` flow carries no
 * volume at all, by design); `method_note` states how the number was obtained and what it EXCLUDES.
 * Per the contract, a consumer displaying a volume MUST surface `method_note` alongside it.
 * `sources[]` is the evidence for THIS flow — narrower than the object-level `source_ids[]`.
 */
export const FlowOut = z
  .object({
    flow_type: z.string(),
    importance_score: z.number().nullish(),
    estimated_volume: z.union([z.number(), z.string()]).nullish(),
    volume_unit: z.string().nullish(),
    volume_year: z.number().nullish(),
    value_status: z.string().nullish(),
    directionality: z.string().nullish(),
    source_confidence: z.string().nullish(),
    method_note: z.string().nullish(),
    sources: z.array(z.string()).default([]),
  })
  .passthrough();
export type FlowOut = z.infer<typeof FlowOut>;

/**
 * What is NOT a flow (ADR 0069). `metric_kind` distinguishes a `stock` (a balance at a date) or a
 * `capacity` (a maximum potential throughput, never a realised one) from a realised `estimated_volume`.
 * Comparing the two is a category error; `metric_kind` exists so the mistake is detectable
 * programmatically rather than by reading prose. Rows written by external collectors legitimately
 * carry an empty `sources[]`.
 */
export const MetricOut = z
  .object({
    metric_key: z.string(),
    metric_kind: z.string().nullish(),
    metric_label: z.string().nullish(),
    value: z.number().nullish(),
    unit: z.string().nullish(),
    period: z.string().nullish(),
    rank: z.number().nullish(),
    source_id: z.string().nullish(),
    sources: z.array(z.string()).default([]),
    url: z.string().nullish(),
    notes: z.string().nullish(),
  })
  .passthrough();
export type MetricOut = z.infer<typeof MetricOut>;

/** Schematic geometry (WGS84). Display/proximity only — never navigational or legal precision. */
export const GeometryOut = z
  .object({
    geometry_role: z.string(),
    geometry_status: z.string(),
    geom_geojson: z.unknown().nullish(),
  })
  .passthrough();
export type GeometryOut = z.infer<typeof GeometryOut>;

/** Per-flow reroute delta (searoute, schematic). Derived candidate — never advice. */
export const RerouteDeltaOut = z
  .object({
    flow_type: z.string(),
    vessel_class: z.string().nullish(),
    delta_days: z.number().nullish(),
    delta_cost_usd: z.number().nullish(),
    toll_saved_usd: z.number().nullish(),
    net_cost_usd: z.number().nullish(),
    suggested_cost_penalty: z.string().nullish(),
    corridor: z.string().nullish(),
  })
  .passthrough();
export type RerouteDeltaOut = z.infer<typeof RerouteDeltaOut>;

export const RiskOut = z
  .object({
    risk_type: z.string(),
    probability_score: z.number().nullish(),
    impact_score: z.number().nullish(),
    vulnerability_score: z.number().nullish(),
    // Renamed from `current_status` by the producer at 0.4.0 (breaking, shipped in a minor bump).
    assessment_status: z.string().nullish(),
    risk_severity: z.string().nullish(),
    triggers: z.array(z.string()).default([]),
    affected_flows: z.array(z.string()).default([]),
  })
  .passthrough();
export type RiskOut = z.infer<typeof RiskOut>;

export const AlternativeOut = z
  .object({
    description: z.string(),
    target_object_id: z.string().nullish(),
    affected_flows: z.array(z.string()).default([]),
    feasibility: z.string().nullish(),
    cost_penalty: z.union([z.number(), z.string()]).nullish(),
    time_penalty: z.union([z.number(), z.string()]).nullish(),
    capacity_penalty: z.union([z.number(), z.string()]).nullish(),
    substitution_note: z.string().nullish(),
    validation_status: z.string().nullish(),
    reroute_deltas: z.array(RerouteDeltaOut).default([]),
  })
  .passthrough();
export type AlternativeOut = z.infer<typeof AlternativeOut>;

/** A disruption episode as seen from one of its affected chokepoints. */
export const ChokepointEpisodeOut = z
  .object({
    episode_key: z.string(),
    name: z.string(),
    started_on: z.string().nullish(),
    ended_on: z.string().nullish(),
    status: z.string().nullish(),
    severity: z.string().nullish(),
    object_role: z.string().nullish(),
  })
  .passthrough();
export type ChokepointEpisodeOut = z.infer<typeof ChokepointEpisodeOut>;

/** GeoJSON export (/exports/geojson). Geometry kept loose; we only read feature properties + geometry. */
export const GeoJsonFeature = z
  .object({
    type: z.string(),
    geometry: z.any().nullable(),
    properties: z.record(z.any()).nullish(),
  })
  .passthrough();

export const GeoJsonFeatureCollection = z
  .object({
    type: z.literal('FeatureCollection'),
    note: z.string().optional(),
    features: z.array(GeoJsonFeature).default([]),
  })
  .passthrough();
export type GeoJsonFeatureCollection = z.infer<typeof GeoJsonFeatureCollection>;

/**
 * Feature properties safe to expose on the public redistribution surface (the GeoJSON export / map).
 * Deny-by-default: any other key — notably taint markers like `license_taint` / `max_license_risk`,
 * or restricted source notes the upstream API might leak — is dropped before a clear consumer sees it.
 * Keep this list to fields the public map/Atlas actually renders, plus legally-required attributions.
 */
export const PUBLIC_FEATURE_PROPS = [
  'id',
  'name',
  'canonical_name',
  'family',
  'priority',
  'role',
  'region',
  'required_attributions',
] as const;

/** Project every feature onto the public-safe property allowlist (see PUBLIC_FEATURE_PROPS). */
export function toPublicFeatureCollection(fc: GeoJsonFeatureCollection): GeoJsonFeatureCollection {
  return {
    ...fc,
    features: fc.features.map((f) => {
      const props = (f.properties ?? {}) as Record<string, unknown>;
      const safe: Record<string, unknown> = {};
      for (const k of PUBLIC_FEATURE_PROPS) {
        if (k in props) safe[k] = props[k];
      }
      return { ...f, properties: safe };
    }),
  };
}

export const ChokepointDetail = ChokepointSummary.extend({
  flows: z.array(FlowOut).default([]),
  risks: z.array(RiskOut).default([]),
  metrics: z.array(MetricOut).default([]),
  geometries: z.array(GeometryOut).default([]),
  alternatives: z.array(AlternativeOut).default([]),
  episodes: z.array(ChokepointEpisodeOut).default([]),
  source_ids: z.array(z.string()).default([]),
  geometry_disclaimer: z.string().optional(),
}).passthrough();
export type ChokepointDetail = z.infer<typeof ChokepointDetail>;

// ---------------------------------------------------------------------------------------------------
// v0.2.0 additive surface (docs/api-interface-contract_V2.md). All shapes use .passthrough() and
// nullish fields so the client stays forward-compatible; we only assert the fields the contract lists.
// ---------------------------------------------------------------------------------------------------

/** /chokepoints/by-flow/{flow_type} → ChokepointSummary + importance_score. */
export const FlowChokepointOut = ChokepointSummary.extend({
  importance_score: z.number().nullish(),
}).passthrough();
export type FlowChokepointOut = z.infer<typeof FlowChokepointOut>;

/** /chokepoints/by-risk/{risk_type} → ChokepointSummary + impact_score. */
export const RiskChokepointOut = ChokepointSummary.extend({
  impact_score: z.number().nullish(),
}).passthrough();
export type RiskChokepointOut = z.infer<typeof RiskChokepointOut>;

/** /actors → validated actors. */
export const ActorOut = z
  .object({
    id: z.string(),
    name: z.string(),
    actor_type: z.string().nullish(),
    jurisdiction: z.string().nullish(),
    validation_status: z.string().nullish(),
    control_edge_count: z.number().nullish(),
  })
  .passthrough();
export type ActorOut = z.infer<typeof ActorOut>;

/** /chokepoints/{id}/actors → validated actor↔chokepoint control edges. */
export const ActorControlOut = z
  .object({
    actor_id: z.string(),
    actor_name: z.string().nullish(),
    actor_type: z.string().nullish(),
    chokepoint_id: z.string(),
    control_type: z.string().nullish(),
    control_strength: z.union([z.number(), z.string()]).nullish(),
    basis: z.string().nullish(),
    source_confidence: z.union([z.number(), z.string()]).nullish(),
    valid_from: z.string().nullish(),
    valid_to: z.string().nullish(),
  })
  .passthrough();
export type ActorControlOut = z.infer<typeof ActorControlOut>;

/** /relations → chokepoint-to-chokepoint edges. */
export const RelationOut = z
  .object({
    from_object_id: z.string(),
    to_object_id: z.string(),
    relation_type: z.string(),
    directionality: z.string().nullish(),
    strength_score: z.number().nullish(),
    analytical_effect: z.array(z.string()).default([]),
    affected_flows: z.array(z.string()).default([]),
  })
  .passthrough();
export type RelationOut = z.infer<typeof RelationOut>;

/** /strategic-systems → systems; member_count counts clear members only. */
export const StrategicSystemOut = z
  .object({
    id: z.string(),
    name: z.string(),
    system_type: z.string().nullish(),
    priority_class: z.string().nullish(),
    notes: z.string().nullish(),
    member_count: z.number().nullish(),
  })
  .passthrough();
export type StrategicSystemOut = z.infer<typeof StrategicSystemOut>;

export const SystemMemberOut = z
  .object({
    chokepoint_id: z.string(),
    canonical_name: z.string().nullish(),
    member_role: z.string().nullish(),
    priority_class: z.string().nullish(),
    license_taint: z.boolean().optional(),
  })
  .passthrough();

export const StrategicSystemDetail = StrategicSystemOut.extend({
  members: z.array(SystemMemberOut).default([]),
}).passthrough();
export type StrategicSystemDetail = z.infer<typeof StrategicSystemDetail>;

/** /episodes → disruption episodes; object_count counts clear members only. */
export const EpisodeOut = z
  .object({
    episode_key: z.string(),
    name: z.string(),
    description: z.string().nullish(),
    started_on: z.string().nullish(),
    ended_on: z.string().nullish(),
    status: z.string().nullish(),
    severity: z.string().nullish(),
    affected_flows: z.array(z.string()).default([]),
    object_count: z.number().nullish(),
  })
  .passthrough();
export type EpisodeOut = z.infer<typeof EpisodeOut>;

export const EpisodeMemberOut = z
  .object({
    chokepoint_id: z.string(),
    canonical_name: z.string().nullish(),
    object_role: z.string().nullish(),
    priority_class: z.string().nullish(),
    license_taint: z.boolean().optional(),
  })
  .passthrough();

export const EpisodeDetail = EpisodeOut.extend({
  members: z.array(EpisodeMemberOut).default([]),
}).passthrough();
export type EpisodeDetail = z.infer<typeof EpisodeDetail>;

/** /sources → registry (now incl. watch coverage in 0.2.0). */
/**
 * The live /sources endpoint returns these flags as STRINGS ("true"/"false"), not JSON booleans.
 * Coerce defensively so a bare `z.boolean()` doesn't reject the whole list. These are
 * redistribution/licensing flags, so coercion FAILS CLOSED: only an explicit truthy token yields
 * `true`; explicit falsy tokens yield `false`; anything unrecognized ("restricted", "conditional",
 * …) → `null` (unknown), never silently `true`. Real booleans and numbers pass through sensibly.
 */
const TRUE_TOKENS = ['true', '1', 'yes', 'oui'];
const FALSE_TOKENS = ['false', '0', 'no', 'non', ''];
const boolish = z.preprocess((v) => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v === 'string') {
    const t = v.trim().toLowerCase();
    if (TRUE_TOKENS.includes(t)) return true;
    if (FALSE_TOKENS.includes(t)) return false;
    return null; // unknown token → fail closed (never coerce an unknown to "allowed")
  }
  return v; // null / undefined → accepted by .nullish()
}, z.boolean().nullish());

export const SourceOut = z
  .object({
    source_id: z.string(),
    source_name: z.string().nullish(),
    source_level: z.string().nullish(),
    url: z.string().nullish(),
    redistribution_allowed: boolish,
    attribution_required: boolish,
    license_risk: z.string().nullish(),
    domain_relevance: z.unknown().nullish(),
    evidence_types: z.array(z.string()).default([]),
    storage_policy: z.string().nullish(),
  })
  .passthrough();
export type SourceOut = z.infer<typeof SourceOut>;

/** /alerts → analytical alerts. An alert is a trigger for review, not a conclusion. */
export const AlertOut = z
  .object({
    id: z.string(),
    chokepoint_id: z.string().nullish(),
    canonical_name: z.string().nullish(),
    alert_type: z.string(),
    level: z.string().nullish(),
    time_horizon: z.string().nullish(),
    queue: z.string().nullish(),
    trigger_summary: z.string().nullish(),
    affected_dimensions: z.array(z.string()).default([]),
    affected_actors: z.array(z.string()).default([]),
    confidence: z.union([z.number(), z.string()]).nullish(),
    review_status: z.string().nullish(),
    generated_at: z.string().nullish(),
    disclaimer: z.string().nullish(),
  })
  .passthrough();
export type AlertOut = z.infer<typeof AlertOut>;

/** /analytics/results → derived candidate outputs. */
export const AnalyticalResultOut = z
  .object({
    id: z.string(),
    run_id: z.string().nullish(),
    engine_id: z.string().nullish(),
    engine_version: z.string().nullish(),
    input_snapshot_id: z.string().nullish(),
    object_id: z.string().nullish(),
    object_type: z.string().nullish(),
    result_type: z.string().nullish(),
    status: z.string().nullish(),
    score: z.number().nullish(),
    confidence: z.union([z.number(), z.string()]).nullish(),
    result_summary: z.string().nullish(),
    result_payload: z.unknown().nullish(),
    generated_at: z.string().nullish(),
    disclaimer: z.string().nullish(),
  })
  .passthrough();
export type AnalyticalResultOut = z.infer<typeof AnalyticalResultOut>;

export const EngineRunOut = z
  .object({
    run_id: z.string(),
    engine_id: z.string().nullish(),
    engine_version: z.string().nullish(),
    input_snapshot_id: z.string().nullish(),
    status: z.string().nullish(),
    started_at: z.string().nullish(),
    finished_at: z.string().nullish(),
    output_result_count: z.number().nullish(),
    error_message: z.string().nullish(),
  })
  .passthrough();
export type EngineRunOut = z.infer<typeof EngineRunOut>;

/**
 * /chokepoints/{id}/cvi-assessment → per-corridor CVI assessment (derived candidate, read scope).
 * Structurally mirrors `@ag/cvi`'s CviAssessment; kept permissive (.passthrough) here so the client
 * stays dependency-free — the consumer (HDDE) re-validates it with `@ag/cvi` before use. The hard
 * rule "no 0–100 aggregate without documented methodology" (ADR 0043) is enforced at that validation,
 * not here. Candidate ≠ fact: an analyst validates before it becomes canonical.
 */
export const CviDimensionScoreOut = z
  .object({
    score: z.number(),
    rationale: z.string().nullish(),
    confidence: z.string().nullish(),
    source_refs: z.array(z.string()).default([]),
    uncertainties: z.array(z.string()).default([]),
  })
  .passthrough();
export type CviDimensionScoreOut = z.infer<typeof CviDimensionScoreOut>;

/**
 * `aggregate_score` is INTENTIONALLY ABSENT. The producer gates it on `methodology_documented`
 * (always false) and never serves it (ADR 0049). We do not merely leave it undeclared — `.passthrough()`
 * would let it reach a consumer if the producer ever regressed. The `.transform` below DELETES it,
 * so "no 0–100 CVI aggregate" is a structural property of this client, like `toPublicFeatureCollection`.
 * `dimensions` may omit any of the 8 keys (e.g. `resilience`, which usually has no engine input) —
 * a dimension with no real input is omitted, never fabricated.
 */
export const CviAssessmentOut = z
  .object({
    chokepoint_id: z.string().nullish(),
    scale: z.string(),
    global_level: z.string().nullish(),
    dimensions: z.record(z.string(), CviDimensionScoreOut).nullish(),
    methodology_documented: z.boolean().nullish(),
    status: z.string().nullish(),
    engine_version: z.string().nullish(),
    sources: z.array(z.string()).nullish(),
    uncertainties: z.array(z.string()).nullish(),
    last_updated: z.string().nullish(),
    disclaimer: z.string().nullish(),
  })
  .passthrough()
  .transform((a) => {
    delete (a as Record<string, unknown>).aggregate_score;
    return a;
  });
export type CviAssessmentOut = z.infer<typeof CviAssessmentOut>;

/** GET /health → liveness probe. Kept permissive; `{ "status": "ok" }` in practice. */
export const HealthOut = z.object({ status: z.string().nullish() }).passthrough();
export type HealthOut = z.infer<typeof HealthOut>;

/**
 * GET /chokepoints/{id}/fiche → the 16-section Chokepoint Control Method deliverable (`web/fiche.py`
 * `build_fiche`). The producer serialises a plain dict (no `response_model`), so we type the known
 * top-level sections as optional + `.passthrough()`: callers get autocomplete on the documented
 * sections without the schema ever rejecting an additive producer change. Each section stays
 * `z.unknown()` (its inner shape is producer-owned and evolving). Taint-gated like the sibling
 * `/chokepoints/{id}/*` routes. Derived candidate, never canonical.
 */
export const FicheOut = z
  .object({
    chokepoint_id: z.string().nullish(),
    chokepoint: z.unknown().nullish(),
    flows: z.unknown().nullish(),
    regime: z.unknown().nullish(),
    leverage: z.unknown().nullish(),
    leverage_by_family: z.unknown().nullish(),
    polarity: z.unknown().nullish(),
    profiles: z.unknown().nullish(),
    dependency: z.unknown().nullish(),
    formal_effective: z.unknown().nullish(),
    concentration: z.unknown().nullish(),
    concentration_breakdown: z.unknown().nullish(),
    architecture_labels: z.unknown().nullish(),
    alerts: z.unknown().nullish(),
    scenarios: z.unknown().nullish(),
    backlog: z.unknown().nullish(),
    uncertainties: z.unknown().nullish(),
    audit: z.unknown().nullish(),
    counts: z.unknown().nullish(),
    disclaimer: z.string().nullish(),
  })
  .passthrough();
export type FicheOut = z.infer<typeof FicheOut>;

/** /chokepoints/{id}/event-signals → raw append-only event stream. */
export const EventSignalOut = z
  .object({
    chokepoint_id: z.string(),
    domain: z.string().nullish(),
    weight: z.number().nullish(),
    observed_on: z.string().nullish(),
    event_key: z.string().nullish(),
  })
  .passthrough();
export type EventSignalOut = z.infer<typeof EventSignalOut>;

/** /chokepoints/{id}/analysis → full typed engine output + relations + claims. */
export const ChokepointAnalysis = z
  .object({
    chokepoint_id: z.string(),
    disclaimer: z.string().nullish(),
    engines: z
      .array(
        z
          .object({
            key: z.string(),
            title: z.string().nullish(),
            description: z.string().nullish(),
            columns: z.array(z.string()).default([]),
            rows: z.array(z.unknown()).default([]),
          })
          .passthrough(),
      )
      .default([]),
    relations: z.array(z.unknown()).default([]),
    claims: z.array(z.unknown()).default([]),
  })
  .passthrough();
export type ChokepointAnalysis = z.infer<typeof ChokepointAnalysis>;

/** Liquidity-weighted odds per signal_family, from the consensus engine. */
export const PerceptionConsensusOut = z
  .object({
    signal_family: z.string().nullish(),
    market_count: z.number().nullish(),
    consensus_probability: z.number().nullish(),
    max_probability_change_24h: z.number().nullish(),
    total_liquidity: z.number().nullish(),
    observed_window_end: z.string().nullish(),
  })
  .passthrough();
export type PerceptionConsensusOut = z.infer<typeof PerceptionConsensusOut>;

/** One raw prediction-market observation. Crowd ANTICIPATION, never event evidence. */
export const PerceptionSignalOut = z
  .object({
    signal_family: z.string().nullish(),
    market_question: z.string().nullish(),
    classification: z.string().nullish(),
    implied_probability: z.number().nullish(),
    probability_change_24h: z.number().nullish(),
    volume_24h: z.number().nullish(),
    liquidity: z.number().nullish(),
    perception_signal_score: z.number().nullish(),
    proposed_action: z.string().nullish(),
    observed_at: z.string().nullish(),
  })
  .passthrough();
export type PerceptionSignalOut = z.infer<typeof PerceptionSignalOut>;

/**
 * /chokepoints/{id}/perception-signals → Polymarket P3 perception.
 * Gated UNCONDITIONALLY on the `read_tainted` scope (the source is uncleared): a plain `read` token
 * gets 403, whatever `include_tainted` says. Only the cockpit holds that token — HDDE and the public
 * site must read the derived `prediction_consensus` block of /analysis instead (ADR 0013/0035).
 */
export const PerceptionSignalList = z
  .object({
    chokepoint_id: z.string(),
    count: z.number().nullish(),
    consensus: z.array(PerceptionConsensusOut).default([]),
    signals: z.array(PerceptionSignalOut).default([]),
    disclaimer: z.string().nullish(),
  })
  .passthrough();
export type PerceptionSignalList = z.infer<typeof PerceptionSignalList>;

/** /chokepoint-analyses → file-backed ToC + Leverage-Points (candidate, never canonical). */
export const ChokepointAnalysisSummary = z
  .object({
    id: z.string(),
    canonical_name: z.string().nullish(),
    priority_class: z.string().nullish(),
    family: z.string().nullish(),
    type: z.string().nullish(),
    macro_region: z.string().nullish(),
    available_docs: z.array(z.string()).default([]),
  })
  .passthrough();

export const ChokepointAnalysisList = z
  .object({
    count: z.number().nullish(),
    disclaimer: z.string().nullish(),
    items: z.array(ChokepointAnalysisSummary).default([]),
  })
  .passthrough();
export type ChokepointAnalysisList = z.infer<typeof ChokepointAnalysisList>;

export const ChokepointAnalysisDetail = ChokepointAnalysisSummary.extend({
  synthesis_md: z.string().nullish(),
  theory_of_constraints_md: z.string().nullish(),
  leverage_points_md: z.string().nullish(),
  disclaimer: z.string().nullish(),
}).passthrough();
export type ChokepointAnalysisDetail = z.infer<typeof ChokepointAnalysisDetail>;

// ---------------------------------------------------------------------------------------------------
// 0.3.0 / 0.4.0 additive surface — pre-wired ahead of the producer deploy (see
// docs/handoff/ag-back-deploy-0.4.0-and-consumer-needs.md). Endpoints exist in the ag-back repo
// (contract 0.4.0) but are NOT yet on the deployed 0.2.0 instance, so these stay inert until the
// pin bumps. Shapes mirror ag-back `api/schemas.py` exactly. All derived candidates, never canonical.
// ---------------------------------------------------------------------------------------------------

/**
 * GET /analytics/system-resilience → whole-graph resilience via Ecological Network Analysis
 * (Ulanowicz), engine `system_resilience` (ADR 0057). One global row (`scope="GLOBAL"`). `robustness`
 * peaks in the balanced middle; `regime` is the window-of-vitality classification. 404 until computed.
 */
export const SystemResilienceOut = z
  .object({
    scope: z.string().default('GLOBAL'),
    total_system_throughput: z.number().nullish(),
    ascendency: z.number().nullish(),
    development_capacity: z.number().nullish(),
    overhead: z.number().nullish(),
    alpha: z.number().nullish(),
    robustness: z.number().nullish(),
    regime: z.enum(['brittle', 'window_of_vitality', 'redundant']).nullish(),
    weight_basis: z.enum(['strength_proxy', 'throughput']).nullish(),
    node_count: z.number().nullish(),
    edge_count: z.number().nullish(),
    engine_version: z.string().nullish(),
    generated_at: z.string().nullish(),
    disclaimer: z.string().nullish(),
  })
  .passthrough();
export type SystemResilienceOut = z.infer<typeof SystemResilienceOut>;

/** Strategic Flow Unit — SFIM (ADR 0054). Decision-oriented layer parallel to chokepoints. */
export const StrategicFlowUnitSummary = z
  .object({
    id: z.string(),
    name: z.string(),
    flow_type: z.string(),
    priority_class: z.string().nullish(),
    status: z.string().nullish(),
    validation_status: z.string(),
    verdict: z.string().nullish(), // latest verdict decision (any status)
    verdict_status: z.string().nullish(), // candidate | reviewed | accepted
    dimensions_scored: z.number().nullish(), // numerator only — the total lives on the fiche
  })
  .passthrough();
export type StrategicFlowUnitSummary = z.infer<typeof StrategicFlowUnitSummary>;

/** GET /strategic-flows → envelope { count, disclaimer, items }. */
export const StrategicFlowUnitList = z
  .object({
    count: z.number().nullish(),
    disclaimer: z.string().nullish(),
    items: z.array(StrategicFlowUnitSummary).default([]),
  })
  .passthrough();
export type StrategicFlowUnitList = z.infer<typeof StrategicFlowUnitList>;

export const SfuDimensionOut = z
  .object({
    dimension: z.string(),
    effective_score: z.number().nullish(),
    auto_value: z.number().nullish(),
    analyst_value: z.number().nullish(),
    confidence: z.string().nullish(),
    evidence_status: z.string().nullish(),
    rationale: z.string().nullish(),
    origin: z.string().nullish(), // engine_auto | analyst_submission — the contract types it as a free string
  })
  .passthrough();
export type SfuDimensionOut = z.infer<typeof SfuDimensionOut>;

/** GET /strategic-flows/{sfu_id}/verdict → SFIM decision (FAIRE/TESTER/…). Nullable if none yet. */
export const SfuVerdictOut = z
  .object({
    decision: z.string(),
    status: z.string(), // candidate | reviewed | accepted
    confidence: z.string().nullish(),
    rationale: z.string().nullish(),
    required_actions: z.array(z.string()).default([]),
    supporting_sources: z.array(z.string()).default([]),
    rejected_verdicts: z.array(z.unknown()).default([]),
  })
  .passthrough();
export type SfuVerdictOut = z.infer<typeof SfuVerdictOut>;

/**
 * SFIM completeness envelope (API 0.7.0). Only 4 of the 10 dimensions have a deterministic engine
 * source; the 6 judgment dimensions and the verdict are analyst-authored, so a partially-scored SFU
 * with `awaiting_analyst_verdict: true` is the designed state, not a gap. Every field is optional —
 * a fiche may omit the whole block.
 */
export const SfuCompletenessOut = z
  .object({
    dimensions_total: z.number().default(10),
    dimensions_scored: z.number().default(0),
    analyst_dimensions: z.number().default(0),
    auto_dimensions: z.number().default(0),
    has_draft: z.boolean().default(false),
    draft_status: z.string().nullish(),
    has_verdict: z.boolean().default(false),
    verdict_status: z.string().nullish(),
    awaiting_analyst_verdict: z.boolean().default(true),
  })
  .passthrough();
export type SfuCompletenessOut = z.infer<typeof SfuCompletenessOut>;

/**
 * GET /vocabularies → the enum-enforced vocabularies behind the data, plus the CCM analytics lookups.
 * `controlled` holds ~48 named lists (priority_classes, families, flow_types, risk_types, …); the
 * other blocks are lookup tables. Prefer driving UI filters from this rather than hard-coding lists.
 */
export const VocabulariesOut = z
  .object({
    controlled: z.record(z.string(), z.array(z.string())).default({}),
    control_dimensions: z
      .array(
        z
          .object({ control_dimension: z.string(), dimension_family: z.string().nullish() })
          .passthrough(),
      )
      .default([]),
    actor_profile_types: z
      .array(
        z.object({ profile_type: z.string(), is_critical: z.boolean().nullish() }).passthrough(),
      )
      .default([]),
    alert_types: z
      .array(
        z.object({ alert_type: z.string(), default_queue: z.string().nullish() }).passthrough(),
      )
      .default([]),
    architecture_labels: z.array(z.string()).default([]),
  })
  .passthrough();
export type VocabulariesOut = z.infer<typeof VocabulariesOut>;

/**
 * One candidate edge of the derived systemic graph (ADR 0065), extracted from the analysis fiches.
 * STRICTLY distinct from the canonical `/relations`: these are file-backed candidates pending human
 * validation, never canonical. A target flagged `external_candidate` is a COVERAGE GAP — an object
 * the corpus does not contain — not a corpus object. Never merge into seed/ without validation.
 */
export const DerivedRelationOut = z
  .object({
    from_object_id: z.string(),
    to: z.string(),
    to_label: z.string().nullish(),
    to_status: z.string(),
    relation_type: z.string(),
    directionality: z.string().nullish(),
    strength_score: z.number().nullish(),
    resolution_score: z.number().nullish(),
    validation_status: z.string().default('not_validated'),
    analytical_effect: z.array(z.string()).default([]),
    affected_flows: z.array(z.string()).default([]),
    evidence_file: z.string().nullish(),
    evidence_quote: z.string().nullish(),
  })
  .passthrough();
export type DerivedRelationOut = z.infer<typeof DerivedRelationOut>;

/** GET /derived/relations → envelope. Derived candidate graph, no taint gate (public order-of-magnitude). */
export const DerivedRelationGraphOut = z
  .object({
    edge_count_total: z.number(),
    returned: z.number(),
    status: z.string().nullish(),
    generated_from: z.string().nullish(),
    items: z.array(DerivedRelationOut).default([]),
    disclaimer: z.string().nullish(),
  })
  .passthrough();
export type DerivedRelationGraphOut = z.infer<typeof DerivedRelationGraphOut>;

/** GET /strategic-flows/{sfu_id}/fiche → full SFU fiche. `red_team` present only with read_tainted. */
export const SfuFicheOut = z
  .object({
    id: z.string(),
    name: z.string(),
    flow_type: z.string(),
    priority_class: z.string().nullish(),
    status: z.string().nullish(),
    routes: z.array(z.unknown()).default([]),
    control_actors: z.array(z.unknown()).default([]),
    value_chain: z.array(z.unknown()).default([]),
    scoring: z.array(SfuDimensionOut).default([]),
    aggregates: z.array(z.unknown()).default([]),
    integration: z.array(z.unknown()).default([]),
    verdict: SfuVerdictOut.nullish(),
    completeness: SfuCompletenessOut.optional(), // absent-or-object, never null
    red_team: z.unknown().nullish(),
    disclaimer: z.string().nullish(),
  })
  .passthrough();
export type SfuFicheOut = z.infer<typeof SfuFicheOut>;
