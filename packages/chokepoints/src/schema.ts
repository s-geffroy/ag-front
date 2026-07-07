import { z } from 'zod';

// Response shapes for the Chokepoints Read API (v0.2.0). Defensive: `.passthrough()` tolerates extra
// fields and additive API changes; we only depend on what we render. Mirrors
// docs/api-interface-contract_V2.md (changelog 0.2.0 — additive, backward-compatible).

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

const Flow = z
  .object({
    flow_type: z.string(),
    importance_score: z.number().nullish(),
    estimated_volume: z.union([z.number(), z.string()]).nullish(),
    volume_unit: z.string().nullish(),
    directionality: z.string().nullish(),
  })
  .passthrough();

const Risk = z
  .object({
    risk_type: z.string(),
    probability_score: z.number().nullish(),
    impact_score: z.number().nullish(),
    current_status: z.string().nullish(),
  })
  .passthrough();

const Alternative = z
  .object({
    description: z.string(),
    feasibility: z.string().nullish(),
    cost_penalty: z.union([z.number(), z.string()]).nullish(),
    time_penalty: z.union([z.number(), z.string()]).nullish(),
    substitution_note: z.string().nullish(),
  })
  .passthrough();

const Episode = z
  .object({
    episode_key: z.string(),
    name: z.string(),
    status: z.string().nullish(),
    severity: z.string().nullish(),
  })
  .passthrough();

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
  flows: z.array(Flow).default([]),
  risks: z.array(Risk).default([]),
  alternatives: z.array(Alternative).default([]),
  episodes: z.array(Episode).default([]),
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
  })
  .passthrough();
export type CviDimensionScoreOut = z.infer<typeof CviDimensionScoreOut>;

export const CviAssessmentOut = z
  .object({
    scale: z.string(),
    global_level: z.string().nullish(),
    dimensions: z.record(z.string(), CviDimensionScoreOut).nullish(),
    aggregate_score: z.number().nullish(),
    methodology_documented: z.boolean().nullish(),
    sources: z.array(z.string()).nullish(),
    uncertainties: z.array(z.string()).nullish(),
    last_updated: z.string().nullish(),
  })
  .passthrough();
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

/** /chokepoints/{id}/perception-signals → Polymarket P3 perception (read_tainted scope only). */
export const PerceptionSignalList = z
  .object({
    chokepoint_id: z.string(),
    count: z.number().nullish(),
    consensus: z.array(z.unknown()).default([]),
    signals: z.array(z.unknown()).default([]),
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
    red_team: z.unknown().nullish(),
    disclaimer: z.string().nullish(),
  })
  .passthrough();
export type SfuFicheOut = z.infer<typeof SfuFicheOut>;
