import { z } from 'zod';

// Response shapes for the Chokepoints Read API (contract pinned at 0.18.0 —
// scripts/consumer/contract/openapi.json is the machine truth). Defensive: `.passthrough()` tolerates extra
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
    /**
     * TAILLE DE LA PAGE, et elle l'a toujours été — jamais le total. Personne n'avait signalé
     * l'ambiguïté, ce qui est précisément le problème : un champ nommé `count` à côté d'`items` se lit
     * comme un total jusqu'au jour où l'on pagine. `total_count` (1.0.0) est le vrai total.
     */
    count: z.number().optional(),
    /** Total réel du filtre, calculé AVANT la limite. Absent des charges utiles antérieures à 1.0.0. */
    total_count: z.number().nullish(),
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

/**
 * Demo/fixture records the producer serves alongside real ones. They are NOT corridors, and they must
 * never reach a public surface: `cp_alpha` ("Alpha Strait") was live at `/atlas/chokepoints/cp_alpha/`,
 * in the sitemap and in the GeoJSON export until 2026-08-10.
 *
 * We filter on our side rather than wait for the producer to clean their dataset — a fixture we drop
 * costs us one page, a fixture we publish costs credibility on an Atlas that sells rigour. Reported
 * upstream via the exchange channel (ADR 0067); keep the entry even once they remove it, since the
 * cost of a stale denylist entry is zero.
 *
 * Real records follow `p<tier>_<family>_<slug>`; this list stays explicit rather than a pattern match,
 * so a naming change upstream can never silently drop a genuine corridor.
 */
export const FIXTURE_RECORD_IDS: readonly string[] = ['cp_alpha'];

const FIXTURE_ID_SET = new Set(FIXTURE_RECORD_IDS);

/** True when `id` is a producer fixture that must be excluded from every public surface. */
export function isFixtureRecord(id: string | null | undefined): boolean {
  return typeof id === 'string' && FIXTURE_ID_SET.has(id);
}

/**
 * Project every feature onto the public-safe property allowlist (see PUBLIC_FEATURE_PROPS), dropping
 * producer fixtures entirely.
 */
export function toPublicFeatureCollection(fc: GeoJsonFeatureCollection): GeoJsonFeatureCollection {
  return {
    ...fc,
    features: fc.features
      .filter(
        (f) => !isFixtureRecord((f.properties as Record<string, unknown> | null)?.id as string),
      )
      .map((f) => {
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
    /**
     * CE QUE NOUS EN AVONS FAIT, pas ce que fait le monde — `status` dit le second (1.2.0, leur 0030).
     * La couche épisode est entièrement curée à la main : aucun moteur n'y écrit, chaque ligne naît
     * `candidate`. Les 19 épisodes du corpus le sont, Ormuz compris — ils ne se valident pas eux-mêmes
     * en publiant. Ne jamais lire un épisode `candidate` comme un fait établi.
     */
    validation_status: z.string().nullish(),
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
    /**
     * Sous une règle du maximum, UNE dimension décide. Sans ces quatre champs (0.19.0), un verdict
     * reposant sur une seule dimension peu fiable est indiscernable d'un verdict reposant sur sept.
     *
     * ILS NE FONT PAS UN CLASSEMENT. Mesuré le 2026-08-13 sur les huit corridors de l'Atlas :
     * `global_level` vaut `critique` pour les huit et `binding_dimension` vaut `exposition` pour sept.
     * Le seul écart est la route du Cap (`cout_contournement`, confiance basse, 4 dimensions sur 7).
     * `dimensions_evaluated` mesure une COUVERTURE, jamais une gravité — l'afficher comme telle.
     */
    binding_dimension: z.string().nullish(),
    binding_confidence: z.string().nullish(),
    dimensions_evaluated: z.number().nullish(),
    dimensions_total: z.number().nullish(),
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
    /**
     * API 0.17.0 — which rule attached this row to the corridor. A SCALAR, not to be confused with
     * the consensus's `attachment_rules` array.
     *
     * Why it exists, in their words (`0023` §4): `observations.event_signal` feeds the media-attention
     * spike, whose thresholds were calibrated on ONE day of volume. A rule that recovers 30 % more
     * rows on an object would read *exactly like that object entering a crisis*. The column is
     * `NOT NULL` with no default on their side, so a collector that forgets to declare its rule fails
     * at INSERT rather than silently widening a count.
     */
    attachment_rule: z.string().nullish(),
  })
  .passthrough();
export type EventSignalOut = z.infer<typeof EventSignalOut>;

/**
 * The rule under which a RAW signal row (event or perception) is attached deterministically: the row
 * names its object. Everything else — a future LLM judge above all — is an inference, and an inference
 * counted next to a name-match silently changes what a volume curve means.
 */
export const DETERMINISTIC_SIGNAL_ATTACHMENT_RULE = 'name_match';

/**
 * Was this raw row attached by a rule we already know how to read?
 *
 * Unlike the consensus gate this does NOT filter — these rows land on internal, authenticated surfaces
 * where hiding is worse than showing. It answers "does this deserve to be flagged to a human", which is
 * the honest thing to do with a rule nobody has reviewed yet. A row that declares no rule at all is
 * pre-0.17.0 history, not a violation.
 */
export function signalAttachmentRuleIsReviewed(row: { attachment_rule?: string | null }): boolean {
  const rule = row.attachment_rule;
  return rule == null || rule === DETERMINISTIC_SIGNAL_ATTACHMENT_RULE;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// GET /chokepoints/{id}/analysis — TYPÉ depuis le contrat 1.6.0
// ─────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * De 0.2.0 à 1.5.0, le schéma de réponse de cet endpoint était `{}` : tout ce qu'il servait était
 * invisible au contrat lisible par machine. C'est pourquoi `pressure_score` apparaissait ZÉRO fois
 * dans `openapi.json` et pourquoi nous avons dû MESURER un champ pour apprendre qu'il existait.
 *
 * TOUS LES CHAMPS DE LIGNE SONT OPTIONNELS, et c'est voulu : ce sont des tables analytiques, un
 * moteur écrit ce qu'il a pu calculer et laisse le reste à `null`. Prétendre l'inverse dans le schéma
 * serait la fabrication que nous refusons dans la donnée.
 */

/**
 * ATTENTION — `pressure_score` EXISTE DEUX FOIS dans ce document, et ce n'est pas la même grandeur.
 * Ici (`regime_assessment`) c'est une SOMME NON BORNÉE de sévérité × qualité de source amplifiée par
 * la criticité ; dans `AnalysisEventPressureRow` c'est une valeur BORNÉE 0–100. Le même jour, Ormuz
 * valait 295,01 dans l'une et 100 dans l'autre. La collision de noms est un défaut qu'ils ont
 * divulgué en typant l'endpoint — un dictionnaire non typé la cachait derrière un seul nom.
 *
 * CE SCORE N'EST PAS UNE CLÉ DE TRI. Il se compare à trois seuils (stress 1, disruption 3, closure 5)
 * et n'est plus différencié au-delà ; sa magnitude suit alors LE VOLUME DE LEUR COLLECTE, laquelle
 * varie pour des raisons éditoriales étrangères à la pression. Nous l'avons appris en triant une page
 * publique dessus, et nous avons retiré ce tri le 2026-08-13.
 *
 * `0.0` EST UNE MESURE, PAS UN DÉFAUT : chaque zéro porte `contributing_signals: 0`, un régime a été
 * calculé et tout signal qui aurait pu l'alimenter avait dépassé son délai de validité. Mais aucun
 * signal vivant n'est pas la même chose qu'un calme.
 */
export const AnalysisControlConcentrationRow = z
  .object({
    actor_count: z.number().nullish(),
    by_actor: z.unknown().nullish(),
    hhi: z.number().nullish(),
    state_count: z.number().nullish(),
    top_actor_id: z.string().nullish(),
    top_actor_share: z.number().nullish(),
  })
  .passthrough();
export type AnalysisControlConcentrationRow = z.infer<typeof AnalysisControlConcentrationRow>;

export const AnalysisCorroborationRow = z
  .object({
    best_tier: z.string().nullish(),
    corroboration_score: z.number().nullish(),
    credibility_grade: z.number().nullish(),
    independent_origin_count: z.number().nullish(),
    matched_count: z.number().nullish(),
    reliability_grade: z.string().nullish(),
    result_status: z.string().nullish(),
    signal_claim_id: z.string().nullish(),
  })
  .passthrough();
export type AnalysisCorroborationRow = z.infer<typeof AnalysisCorroborationRow>;

export const AnalysisCriticalityScoreRow = z
  .object({
    economic_cascade_score: z.number().nullish(),
    flow_volume_score: z.number().nullish(),
    geopolitical_risk_score: z.number().nullish(),
    infrastructure_fragility_score: z.number().nullish(),
    proposed_priority_class: z.string().nullish(),
    source_confidence_score: z.number().nullish(),
    substitution_difficulty_score: z.number().nullish(),
  })
  .passthrough();
export type AnalysisCriticalityScoreRow = z.infer<typeof AnalysisCriticalityScoreRow>;

export const AnalysisEventPressureRow = z
  .object({
    by_domain: z.unknown().nullish(),
    pressure_score: z.number().nullish(),
    signal_count: z.number().nullish(),
    top_domain: z.string().nullish(),
  })
  .passthrough();
export type AnalysisEventPressureRow = z.infer<typeof AnalysisEventPressureRow>;

export const AnalysisEvidenceQualityRow = z
  .object({
    evidence_score: z.number().nullish(),
    high_quality_source_count: z.number().nullish(),
    license_risk: z.string().nullish(),
    missing_evidence_flags: z.array(z.string()).nullish(),
    source_count: z.number().nullish(),
  })
  .passthrough();
export type AnalysisEvidenceQualityRow = z.infer<typeof AnalysisEvidenceQualityRow>;

/**
 * `divergence_flag` A ÉTÉ RETIRÉ EN 2.0.0, et nous ne le remplaçons pas.
 *
 * Il annonçait le contrôle d'une stratégie de valorisation par l'autre. Il comparait deux grandeurs
 * qui ne sont pas la même : Oxford `exposed_value_usd` compte TOUT le commerce routé par le passage,
 * leur prix × volume ne somme que les flux qu'ils ont chiffrés — pour Ormuz, le brut seul. Mesuré le
 * 2026-08-14 : vrai pour **5 objets sur les 5** qui portent les deux sources, et corriger le défaut
 * d'unités (qui a pourtant déplacé les valeurs de six à huit ordres de grandeur) ne l'a pas fait
 * basculer une fois. Un drapeau qui ne peut pas être faux n'informe pas.
 *
 * Ce qui reste pour juger une valeur est plus solide et se lit ensemble : `value_source` dit d'où
 * elle vient, `confidence` ce qu'elle vaut, `volume_basis` comment le volume a atteint l'unité du
 * prix. Nous n'avions jamais affiché ce drapeau — la vraie leçon est en amont : il a vécu parce
 * qu'un contrôle interne cohérent avec lui-même ne voit pas une erreur cohérente avec elle-même.
 */
export const AnalysisExposedTradeLossRow = z
  .object({
    closure_days: z.number().nullish(),
    confidence: z.string().nullish(),
    daily_loss_rate_usd: z.number().nullish(),
    expected_value_at_risk_usd: z.number().nullish(),
    exposed_value_usd: z.number().nullish(),
    scenario_closure_loss_usd: z.number().nullish(),
    value_source: z.string().nullish(),
  })
  .passthrough();
export type AnalysisExposedTradeLossRow = z.infer<typeof AnalysisExposedTradeLossRow>;

export const AnalysisFlowExposureRow = z
  .object({
    estimated_volume: z.number().nullish(),
    exposed_flow_type: z.string().nullish(),
    exposure_score: z.number().nullish(),
    quantification_status: z.string().nullish(),
    unit: z.string().nullish(),
  })
  .passthrough();
export type AnalysisFlowExposureRow = z.infer<typeof AnalysisFlowExposureRow>;

export const AnalysisFlowValueRow = z
  .object({
    confidence: z.string().nullish(),
    flow_type: z.string().nullish(),
    method: z.string().nullish(),
    price_ref: z.string().nullish(),
    value_usd: z.number().nullish(),
    /**
     * 1.9.0 — COMMENT le volume brut a atteint l'unité du prix, en clair :
     * « 14.6 million_barrels_per_day x 3.65e+08 -> 5.329e+09 bbl/year ».
     *
     * Il existe parce que le moteur ne lisait PAS `volume_unit` : Ormuz déclare 14,6 millions de
     * barils par JOUR, le brut vaut ~78 $/baril, et la valeur servie était **1 144,64 $**. Quatorze
     * virgule six barils. Le plus grave n'était pas l'ordre de grandeur mais l'incohérence interne —
     * Singapour (41,12 millions d'EVP/an) et un autre objet conteneur étaient servis à 10⁶ d'écart
     * d'échelle l'un de l'autre, sans que rien ne le dise.
     *
     * Une unité inconvertible est désormais **omise** plutôt que multipliée. `volume_basis` rend le
     * chiffre recalculable au lieu d'affirmé : à afficher avec la valeur, ou à ne pas afficher la
     * valeur.
     */
    volume_basis: z.string().nullish(),
  })
  .passthrough();
export type AnalysisFlowValueRow = z.infer<typeof AnalysisFlowValueRow>;

export const AnalysisNetworkCentralityRow = z
  .object({
    articulation_point: z.boolean().nullish(),
    betweenness: z.number().nullish(),
    cascade_impact_if_removed: z.number().nullish(),
    eigenvector: z.number().nullish(),
    isolated_subnetworks_count: z.number().nullish(),
    pagerank: z.number().nullish(),
    reachable_nodes_lost: z.number().nullish(),
  })
  .passthrough();
export type AnalysisNetworkCentralityRow = z.infer<typeof AnalysisNetworkCentralityRow>;

export const AnalysisPredictionConsensusRow = z
  .object({
    attachment_rules: z.array(z.string()).nullish(),
    consensus_probability: z.number().nullish(),
    market_count: z.number().nullish(),
    max_probability_change_24h: z.number().nullish(),
    observed_window_end: z.string().nullish(),
    signal_family: z.string().nullish(),
    total_liquidity: z.number().nullish(),
  })
  .passthrough();
export type AnalysisPredictionConsensusRow = z.infer<typeof AnalysisPredictionConsensusRow>;

export const AnalysisRegimeAssessmentRow = z
  .object({
    contributing_signals: z.number().nullish(),
    lifecycle_phase: z.string().nullish(),
    observed_window_end: z.string().nullish(),
    operational_state: z.string().nullish(),
    pressure_score: z.number().nullish(),
    vetoes_applied: z.unknown().nullish(),
  })
  .passthrough();
export type AnalysisRegimeAssessmentRow = z.infer<typeof AnalysisRegimeAssessmentRow>;

export const AnalysisRiskStateRow = z
  .object({
    assessment_status: z.string().nullish(),
    impact_score: z.number().nullish(),
    probability_score: z.number().nullish(),
    risk_family: z.string().nullish(),
    risk_severity: z.string().nullish(),
    triggers: z.array(z.string()).nullish(),
    vulnerability_score: z.number().nullish(),
  })
  .passthrough();
export type AnalysisRiskStateRow = z.infer<typeof AnalysisRiskStateRow>;

export const AnalysisSubstitutionScoreRow = z
  .object({
    affected_flows: z.array(z.string()).nullish(),
    best_alternative: z.string().nullish(),
    global_substitution_difficulty_score: z.number().nullish(),
    worst_constraint: z.string().nullish(),
  })
  .passthrough();
export type AnalysisSubstitutionScoreRow = z.infer<typeof AnalysisSubstitutionScoreRow>;

export const AnalysisSystemCascadeRow = z
  .object({
    alternative_routes: z.array(z.string()).nullish(),
    cascade_score: z.number().nullish(),
    key_dependency_objects: z.array(z.string()).nullish(),
  })
  .passthrough();
export type AnalysisSystemCascadeRow = z.infer<typeof AnalysisSystemCascadeRow>;

export const AnalysisWeaponizabilityRow = z
  .object({
    betweenness: z.number().nullish(),
    control_share: z.number().nullish(),
    dependency: z.number().nullish(),
    leverage_score: z.number().nullish(),
    substitution_factor: z.number().nullish(),
    top_actor_id: z.string().nullish(),
    top_actor_leverage: z.number().nullish(),
  })
  .passthrough();
export type AnalysisWeaponizabilityRow = z.infer<typeof AnalysisWeaponizabilityRow>;

export const AnalysisRelationOut = z
  .object({
    affected_flows: z.array(z.string()).nullish(),
    analytical_effect: z.array(z.string()).nullish(),
    arrow: z.string(),
    directionality: z.string().nullish(),
    other: z.string(),
    relation_type: z.string().nullish(),
    strength_score: z.number().nullish(),
  })
  .passthrough();
export type AnalysisRelationOut = z.infer<typeof AnalysisRelationOut>;

export const AnalysisClaimOut = z
  .object({
    claim_text: z.string().nullish(),
    claim_type: z.string().nullish(),
    confidence_score: z.number().nullish(),
    sources: z.array(z.string()).nullish(),
    verification_status: z.string().nullish(),
  })
  .passthrough();
export type AnalysisClaimOut = z.infer<typeof AnalysisClaimOut>;

/**
 * Un bloc de moteur. `generated_at` est arrivé en 1.5.0 et il faut LE LIRE AVANT LA VALEUR : un moteur
 * n'émet que pour les objets qui avaient une entrée dans la passe, et celui qui en sort GARDE SA LIGNE
 * PRÉCÉDENTE, servie comme si elle était courante. Le 2026-08-13, huit lignes `regime_assessment`
 * dataient du 12/07 ou du 01/07 — un `pressure_score: 0` de juillet et le même zéro calculé le jour
 * même ne disent pas la même chose, et sans la date ils sont une seule valeur.
 */
function analysisBlock<K extends string, R extends z.ZodTypeAny>(key: K, row: R) {
  return z
    .object({
      key: z.literal(key),
      title: z.string(),
      description: z.string(),
      columns: z.array(z.string()).default([]),
      rows: z.array(row).default([]),
      generated_at: z.string().nullish(),
      /**
       * 1.7.0 — LE VERDICT, quand 1.5.0 n'avait donné que de quoi le rendre. `generated_at` expose le
       * défaut à un lecteur qui pense à comparer deux dates ; `stale` FAIT la comparaison. Vrai quand
       * le moteur a recalculé SANS cet objet : `generated_at < engine_last_emitted_at`, interne à la
       * donnée — ni horloge murale ni TTL, parce que la ligne vieille d'un mois d'un moteur mensuel est
       * parfaitement courante et que seule la dernière passe du moteur tranche.
       *
       * Mesuré chez eux le 2026-08-13 : 28 objets sur cinq moteurs étaient servis avec des lignes de
       * juillet (`network_centrality` 10, `regime_assessment` 9, `event_pressure` 7,
       * `exposed_trade_loss` 1, `flow_value` 1). Le drapeau ne les rend pas fraîches — il empêche le
       * périmé de passer pour du frais. À LIRE AVANT LA VALEUR, et à AFFICHER avec elle.
       */
      stale: z.boolean().nullish(),
      /** La PREUVE du drapeau, servie à côté de lui pour qu'on vérifie au lieu de croire. */
      engine_last_emitted_at: z.string().nullish(),
    })
    .passthrough();
}

export const AnalysisControlConcentrationBlock = analysisBlock(
  'control_concentration',
  AnalysisControlConcentrationRow,
);
export const AnalysisCorroborationBlock = analysisBlock('corroboration', AnalysisCorroborationRow);
export const AnalysisCriticalityScoreBlock = analysisBlock(
  'criticality_score',
  AnalysisCriticalityScoreRow,
);
export const AnalysisEventPressureBlock = analysisBlock('event_pressure', AnalysisEventPressureRow);
export const AnalysisEvidenceQualityBlock = analysisBlock(
  'evidence_quality',
  AnalysisEvidenceQualityRow,
);
export const AnalysisExposedTradeLossBlock = analysisBlock(
  'exposed_trade_loss',
  AnalysisExposedTradeLossRow,
);
export const AnalysisFlowExposureBlock = analysisBlock('flow_exposure', AnalysisFlowExposureRow);
export const AnalysisFlowValueBlock = analysisBlock('flow_value', AnalysisFlowValueRow);
export const AnalysisNetworkCentralityBlock = analysisBlock(
  'network_centrality',
  AnalysisNetworkCentralityRow,
);
export const AnalysisPredictionConsensusBlock = analysisBlock(
  'prediction_consensus',
  AnalysisPredictionConsensusRow,
);
export const AnalysisRegimeAssessmentBlock = analysisBlock(
  'regime_assessment',
  AnalysisRegimeAssessmentRow,
);
export const AnalysisRiskStateBlock = analysisBlock('risk_state', AnalysisRiskStateRow);
export const AnalysisSubstitutionScoreBlock = analysisBlock(
  'substitution_score',
  AnalysisSubstitutionScoreRow,
);
export const AnalysisSystemCascadeBlock = analysisBlock('system_cascade', AnalysisSystemCascadeRow);
export const AnalysisWeaponizabilityBlock = analysisBlock(
  'weaponizability',
  AnalysisWeaponizabilityRow,
);

/**
 * `sources` valait `null` pour une revendication sans aucune source — `array_agg(...) FILTER (...)`
 * rend NULL plutôt qu'un tableau vide — et vaut `[]` depuis 1.6.0. C'est le rendu véridique : la
 * revendication existe et rien ne l'appuie, ce qui est *connu*, pas inconnu. Seul changement de fil
 * de cette version. Trouvé en appelant l'API vivante contre les données de production — leurs
 * fixtures donnent une source à chaque revendication, donc aucun test ne pouvait l'attraper.
 */
export const ChokepointAnalysis = z
  .object({
    chokepoint_id: z.string(),
    disclaimer: z.string().nullish(),
    /** Union discriminée sur `key` : brancher dessus et les lignes sont typées. */
    engines: z
      .array(
        z.discriminatedUnion('key', [
          AnalysisEvidenceQualityBlock,
          AnalysisCriticalityScoreBlock,
          AnalysisSubstitutionScoreBlock,
          AnalysisFlowExposureBlock,
          AnalysisRiskStateBlock,
          AnalysisSystemCascadeBlock,
          AnalysisControlConcentrationBlock,
          AnalysisRegimeAssessmentBlock,
          AnalysisEventPressureBlock,
          AnalysisPredictionConsensusBlock,
          AnalysisNetworkCentralityBlock,
          AnalysisCorroborationBlock,
          AnalysisFlowValueBlock,
          AnalysisWeaponizabilityBlock,
          AnalysisExposedTradeLossBlock,
        ]),
      )
      .default([]),
    relations: z.array(AnalysisRelationOut).default([]),
    claims: z.array(AnalysisClaimOut).default([]),
  })
  .passthrough();
export type ChokepointAnalysis = z.infer<typeof ChokepointAnalysis>;
/** Nom du composant au contrat ; `ChokepointAnalysis` est le nôtre, gardé pour les consommateurs. */
export const ChokepointAnalysisOut = ChokepointAnalysis;

/**
 * The one attachment rule we accept as a basis for a public number: the market NAMES the object, or
 * implies it under the ADR 0079 floor. Anything else — `full_text` history, a future `llm_implied` —
 * is refused by `consensusRowIsPublishable()` below (ag-back handoff 0022 §4).
 */
export const PUBLISHABLE_ATTACHMENT_RULE = 'named_or_implied';

/** Liquidity-weighted odds per signal_family, from the consensus engine. */
export const PerceptionConsensusOut = z
  .object({
    signal_family: z.string().nullish(),
    market_count: z.number().nullish(),
    consensus_probability: z.number().nullish(),
    max_probability_change_24h: z.number().nullish(),
    total_liquidity: z.number().nullish(),
    observed_window_end: z.string().nullish(),
    /**
     * API 0.16.0 — which attachment rules the summed rows actually carried. It is an
     * `array_agg(DISTINCT attachment_rule)` over those rows, **not** the engine's constant reprinted:
     * a literal restates the code's intention, an aggregate states what happened. That distinction is
     * the whole point — their `info.version` literal drifted from its own behaviour for ten days
     * (our handoff `0017`), which is exactly what a literal cannot catch and an aggregate can.
     *
     * Today it is `["named_or_implied"]`. ag-back committed to warning us through the channel *before*
     * `llm_implied` ever enters the aggregate served to the clear `read` token — we take the
     * commitment, and still filter on it, so we do not have to depend on it.
     */
    attachment_rules: z.array(z.string()).default([]),
  })
  .passthrough();
export type PerceptionConsensusOut = z.infer<typeof PerceptionConsensusOut>;

/**
 * May this consensus row become a number a reader sees? Fail-closed: any rule we do not explicitly
 * recognise disqualifies the row, so a rule that appears before we have decided what it means shows
 * nothing rather than something we cannot defend.
 *
 * An EMPTY array is tolerated, and it is NOT evidence: before 0.16.0 the producer did not report the
 * rule at all, and the ADR 0079 floor has been applied server-side since 0.13.0. So an empty array
 * means "not told", we fall back to trusting the floor — which is precisely the trust this field
 * exists to make unnecessary once every served row carries it.
 */
export function consensusRowIsPublishable(row: PerceptionConsensusOut): boolean {
  const rules = row.attachment_rules ?? [];
  return rules.every((r) => r === PUBLISHABLE_ATTACHMENT_RULE);
}

/**
 * How many markets a row must aggregate before the word "consensus" is honest about it (ADR 0072).
 *
 * Two is not a statistical threshold, it is a linguistic one: below it there is no aggregate at all,
 * only a quotation with a plural noun on top. ag-back measured (their `0025` §4) that four of the ten
 * rows they serve rest on a single market — including both of the lines we publish.
 */
export const PUBLISHABLE_MIN_MARKET_COUNT = 2;

/**
 * Does this row aggregate enough markets to be published as a consensus?
 *
 * A SEPARATE predicate from `consensusRowIsPublishable()` on purpose: an unrecognised attachment rule
 * and a single quotation are two different refusals, and folding them makes a dropped row unable to
 * say which one fired.
 *
 * **Fail-closed on absence**, and this is exactly where the floor differs from `attachment_rules`
 * (whose empty array is tolerated, for a documented historical reason): a row that does not state its
 * cardinality cannot clear a cardinality floor. Silence is not a count.
 */
export function consensusRowMeetsCardinalityFloor(row: PerceptionConsensusOut): boolean {
  const n = row.market_count;
  return typeof n === 'number' && Number.isFinite(n) && n >= PUBLISHABLE_MIN_MARKET_COUNT;
}

/**
 * /chokepoints/{id}/prediction-consensus (API 0.15.0) → the derived Polymarket consensus as its own
 * narrow surface, served to the CLEAR `read` token. This is what a public/`read`-scope consumer should
 * read: no engines, no relations, no claims — just the one block that is redistributable (with
 * Polymarket attribution + S5 low-reliability disclaimer, ag-back handoff 0018/0021).
 *
 * **`consensus: []` means "no honest market coverage", never an error.** Since their 0.13.0 the ADR 0079
 * attachment floor is applied server-side: only objects a market NAMES or IMPLIES carry rows, so Hormuz
 * & co. answer `200` with an empty list rather than the pre-floor noise (12 % precision). A 404 here is a
 * genuinely unknown — or tainted-and-not-permitted — object, as everywhere else.
 *
 * Since 0.16.0 each row also states the rule it was summed under (`attachment_rules`); we gate on it
 * with `consensusRowIsPublishable()` rather than assume the floor stayed where it was.
 */
export const PredictionConsensusList = z
  .object({
    chokepoint_id: z.string(),
    consensus: z.array(PerceptionConsensusOut).default([]),
    /* Enveloppe comptée (1.9.0). `count` reste servi comme alias de `returned` : rien ne casse.
       `truncated: false` + `limit: null` sur une liste qui ne plafonne pas est le but — « ceci est
       tout » est une phrase que la réponse doit pouvoir dire, sans qu'on ait à savoir lesquels de
       leurs endpoints paginent. */
    returned: z.number().nullish(),
    total_count: z.number().nullish(),
    truncated: z.boolean().nullish(),
    limit: z.number().nullish(),
    generated_at: z.string().nullish(),
    /**
     * API 0.18.0 — the cardinality floor the PRODUCER applied before serving (ADR 0087 their side,
     * 0072 ours). Required, with no default, and present even when `consensus` is empty, so an empty
     * list can be told apart from coverage that was refused.
     *
     * It answers a question no aggregate over the served rows could: *what did you decline to send?*
     * `attachment_rules` is measurable because it sums rows that are PRESENT; a floor is about rows
     * that are ABSENT, so it has to be declared rather than derived.
     *
     * We read it to CHECK them, not to obey them — see `consensusFloorDisagreement()`.
     */
    minimum_market_count: z.number(),
    /** Producer-authored EN disclaimer. Public surfaces carry their own equivalent copy. */
    disclaimer: z.string().nullish(),
  })
  .passthrough();
export type PredictionConsensusList = z.infer<typeof PredictionConsensusList>;

/**
 * Does the producer's declared floor sit below the one we require?
 *
 * Returns `null` when their floor is at least as strict as ours — the normal case — and the served
 * value otherwise. Our own row-level filter (`consensusRowMeetsCardinalityFloor`) already refuses the
 * rows either way, so this is not a safety net: it is the difference between a filter that silently
 * does nothing and one that can say WHY it had nothing to do.
 *
 * Deliberately not fail-closed and not thrown: a weaker server floor is not an emergency, it is a
 * disagreement about a threshold, and the two of us agreeing on 2 is a fact we should be able to
 * observe rather than assume. If it ever fires, it belongs in a handoff, not in a stack trace.
 */
export function consensusFloorDisagreement(list: PredictionConsensusList): number | null {
  const served = list.minimum_market_count;
  if (typeof served !== 'number' || !Number.isFinite(served)) return null;
  return served < PUBLISHABLE_MIN_MARKET_COUNT ? served : null;
}

// NOTE — `/analysis` still carries the same consensus under `engines[key="prediction_consensus"]`, and
// the cockpit sees it there in its raw engine view. We deliberately keep NO extractor for it: every
// typed consumer now reads the dedicated endpoint above, and a second way in would be a second thing to
// keep floored (ADR 0071, since 0.15.0).

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
    /**
     * API 0.17.0 — the rule that attached this raw market to the corridor. This surface used to serve
     * rows written under four incompatible rules and said so nowhere (ag-back `0023` §6); the field is
     * the fix. `read_tainted` only, so in practice the cockpit is its only reader.
     */
    attachment_rule: z.string().nullish(),
  })
  .passthrough();
export type PerceptionSignalOut = z.infer<typeof PerceptionSignalOut>;

/**
 * /chokepoints/{id}/perception-signals → Polymarket P3 perception.
 * Gated UNCONDITIONALLY on the `read_tainted` scope (the source is uncleared): a plain `read` token
 * gets 403, whatever `include_tainted` says. Only the cockpit holds that token — HDDE and the public
 * site must read the derived `prediction_consensus` block of /analysis instead (ADR 0013/0035).
 */
/**
 * `/chokepoints/{id}/perception-signals` rendait **200 lignes sur 30 021** (Détroits turcs) en
 * écrivant `count: 200` — indiscernable d'un objet qui en porte exactement 200. C'est notre défaut
 * `0029`, sur le voisin immédiat de l'endpoint qui l'avait motivé, et leur ADR 0098 le déclarait
 * corrigé partout. 1.9.0 le corrige ici, avec un vrai `count(*) OVER ()` évalué AVANT le LIMIT.
 */
export const PerceptionSignalList = z
  .object({
    chokepoint_id: z.string(),
    count: z.number().nullish(),
    /* Enveloppe comptée (1.9.0). `count` reste servi comme alias de `returned` : rien ne casse.
       `truncated: false` + `limit: null` sur une liste qui ne plafonne pas est le but — « ceci est
       tout » est une phrase que la réponse doit pouvoir dire, sans qu'on ait à savoir lesquels de
       leurs endpoints paginent. */
    returned: z.number().nullish(),
    total_count: z.number().nullish(),
    truncated: z.boolean().nullish(),
    limit: z.number().nullish(),
    generated_at: z.string().nullish(),

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
    /* Enveloppe comptée (1.9.0). `count` reste servi comme alias de `returned` : rien ne casse.
       `truncated: false` + `limit: null` sur une liste qui ne plafonne pas est le but — « ceci est
       tout » est une phrase que la réponse doit pouvoir dire, sans qu'on ait à savoir lesquels de
       leurs endpoints paginent. */
    returned: z.number().nullish(),
    total_count: z.number().nullish(),
    truncated: z.boolean().nullish(),
    limit: z.number().nullish(),
    generated_at: z.string().nullish(),
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
    /* Enveloppe comptée (1.9.0). `count` reste servi comme alias de `returned` : rien ne casse.
       `truncated: false` + `limit: null` sur une liste qui ne plafonne pas est le but — « ceci est
       tout » est une phrase que la réponse doit pouvoir dire, sans qu'on ait à savoir lesquels de
       leurs endpoints paginent. */
    returned: z.number().nullish(),
    total_count: z.number().nullish(),
    truncated: z.boolean().nullish(),
    limit: z.number().nullish(),
    generated_at: z.string().nullish(),
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
/**
 * Une entrée de `controlled`. Elle N'EST PLUS TOUJOURS UNE LISTE, et c'est le genre de changement
 * qu'aucune garde ne voit : la réponse de `/vocabularies` est un dict non typé au contrat, il n'y a
 * donc aucune propriété de schéma à comparer et `openapi_diff` reste muet. Ils nous l'ont dit à la
 * main (leur `0044`) — « si vous parsez l'un des deux comme une liste, il faut adapter ; le silence
 * d'une garde n'est pas une garantie ».
 *
 * Mesuré contre la production le 2026-08-21, trois formes coexistent :
 *
 * - **liste de termes** — le cas ordinaire, la grande majorité des vocabulaires ;
 * - **table terme → famille** — `flow_type_families` (`Afghanistan_transit` → `trade_corridor`) ;
 * - **table palier → classes** — `sfim_tier_crosswalk` (`tier_1` → `[S1_institutional, …]`) ;
 * - **table de tables** — `_index`, qui n'était pas annoncé du tout.
 *
 * Les deux premières servaient jusqu'en 1.9.0 des `sorted()` sur un dictionnaire, c'est-à-dire la
 * liste de leurs propres clefs : un contenu vide qui avait l'air d'un contenu.
 */
export const ControlledVocabularyEntry = z.union([
  z.array(z.string()),
  z.record(z.string(), z.string()),
  z.record(z.string(), z.array(z.string())),
  z.record(z.string(), z.record(z.string(), z.string())),
]);
export type ControlledVocabularyEntry = z.infer<typeof ControlledVocabularyEntry>;

export const VocabulariesOut = z
  .object({
    controlled: z.record(z.string(), ControlledVocabularyEntry).default({}),
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
 * One candidate edge of the derived systemic graph (ADR 0065). STRICTLY distinct from the canonical
 * `/relations`: candidates pending human validation, never canonical. Never merge into seed/ without
 * validation.
 *
 * DEPUIS 2.1.0, L'ENDPOINT NE SERT PLUS LE MÊME GRAPHE. Il servait le fichier
 * `seed/strategic_relations_candidates.yaml` (769 arêtes, dont 333 vers un nom hors corpus) ; il sert
 * désormais `analytics.derived_relation` — **le graphe que les moteurs lisent** (1 346 arêtes). Aucun
 * champ n'a bougé, donc aucune garde de schéma ne le voit : c'est le CONTENU qui a changé.
 *
 * Conséquence directe : les 333 cibles `external_candidate` ont disparu. `to_status` vaut désormais
 * toujours `in_corpus` — le champ reste, il ne varie plus, et le paramètre du même nom est accepté et
 * ignoré. Une branche qui teste `to_status === 'external_candidate'` est morte : elle ne peut plus
 * être vraie.
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
    /**
     * 2.1.0 — QUELLE RÈGLE a produit l'arête : `derived:fiche-extraction` (une fiche rédigée par un
     * humain l'affirme) ou l'une des trois inférences SQL — `derived:eez-colocation`,
     * `derived:system-comembership`, `derived:shared-country`.
     *
     * Le graphe est à ~30 % d'analyse assertée et ~70 % d'inférence géographique. « Une fiche
     * l'affirme » et « les deux objets touchent la même ZEE » ne sont pas la même prétention : un
     * lecteur qui pèse une arête doit savoir de quel tas elle vient, et le graphe fichier ne pouvait
     * pas le dire puisqu'il ne contenait que la première.
     */
    origin: z.string().nullish(),
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
    /** 2.1.0 — le décompte par règle de production. À rendre AVEC le graphe : sans lui, ~70 %
     *  d'inférence géographique se lit comme de l'analyse assertée. */
    by_origin: z.record(z.number()).nullish(),
    total_count: z.number().nullish(),
    truncated: z.boolean().nullish(),
    limit: z.number().nullish(),
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

// --- 0.9.0 additive: /analytics/cvi-counterfactual (ADR 0076 answer to our 0012) -----------------

/**
 * GET /analytics/cvi-counterfactual → the CVI "substitution slide" as a LIVE aggregate count, not a
 * deposited SELECT. `population` is the cohort never examined for substitution; `changent` is how many
 * see their `global_level` slide when `concentration` is removed; `critique_vers_bas` those falling
 * `critique → bas`. `buckets` names the 4 engine thresholds (`0–1|2|3|4–5`). Derived candidate pending
 * validation, never a fact — replaying it against the base is how we verify the producer. `scope` is a
 * bounded enum (`core` default; `bulk` has no CVI scores → population 0, licit).
 */
export const CviCounterfactualOut = z
  .object({
    scope: z.string(),
    removed_dimension: z.string(),
    population: z.number(),
    changent: z.number(),
    critique_vers_bas: z.number(),
    buckets: z.record(z.string(), z.unknown()),
    scale: z.string().nullish(),
    status: z.string().nullish(),
    method_note: z.string(),
    disclaimer: z.string().nullish(),
  })
  .passthrough();
export type CviCounterfactualOut = z.infer<typeof CviCounterfactualOut>;

// --- 0.10.0/0.11.0 additive: /news + /chokepoints/{id}/news (ADR 0076/0077) ---------------------

/**
 * One media article inside a news cluster. THE TRUST BOUNDARY: `articles[]` is recalculated
 * server-side from real collected signals — reliable, unlike the model prose on the parent cluster.
 * Attribution is REQUIRED when displaying: show `outlet` and link `url`. `source_id` distinguishes the
 * audited slate from `gdelt_gkg` (the web-wide long tail) — never present them as equivalents.
 */
export const NewsSourceRef = z
  .object({
    title: z.string().nullish(),
    url: z.string().nullish(),
    outlet: z.string().nullish(),
    source_id: z.string().nullish(),
    observed_on: z.string().nullish(),
    /**
     * Pays de l'ÉDITEUR, ISO 3166-1 alpha-2, DÉCLARÉ — jamais déduit du domaine (1.3.0, leur 0031).
     * Le champ est toujours présent : un champ absent se lirait « pas de pays », un `null` à côté de
     * `country_source: "unknown"` se lit « nous ne savons pas », et ce sont deux phrases différentes.
     * `country_source` vaut `registry` ou `unknown`, il n'y a pas de troisième valeur.
     *
     * COUVERTURE ANNONCÉE : 14 % des articles portent un pays déclaré, 86 % restent `unknown`. C'est
     * plus bas que les 33 % que notre propre déduction par TLD produisait — et c'est le progrès : nos
     * 33 % portaient un biais concentré sur un pays, que nous avions démontré nous-mêmes. Un plancher
     * honnête bat une distribution fausse. Ne jamais recalculer le pays ici.
     */
    country: z.string().nullish(),
    country_source: z.string().nullish(),
  })
  .passthrough();
export type NewsSourceRef = z.infer<typeof NewsSourceRef>;

/** A chokepoint a cluster is REALLY linked to — server-recalculated (reliable), not model-invented. */
export const NewsClusterChokepoint = z
  .object({
    chokepoint_id: z.string(),
    canonical_name: z.string().nullish(),
    /**
     * ATTENTION — ce n'est PAS une pertinence par corridor. ag-back a divulgué (leur 0027,
     * 2026-08-12) que ce champ porte la SALIENCE GLOBALE du regroupement, recopiée à l'identique sur
     * chaque objet lié. Deux objets d'un même regroupement portent donc toujours la même valeur.
     * Ne pas l'afficher à côté d'un corridor : cela laisse croire à une pondération qui n'existe pas.
     *
     * RENOMMÉ `cluster_salience` dans le 1.0.0 (leur 0028), pour dire enfin ce qu'il est. Les deux
     * noms sont acceptés : l'ancien pour les charges utiles antérieures, le nouveau pour la suite.
     * Ne pas retirer `relevance` avant que la rétention amont (14 jours) ait purgé l'ancien format.
     */
    relevance: z.number().nullish(),
    cluster_salience: z.number().nullish(),
  })
  .passthrough();
export type NewsClusterChokepoint = z.infer<typeof NewsClusterChokepoint>;

/**
 * Combien de MÉDIAS DISTINCTS d'un pays donné couvrent un regroupement — pas combien d'articles
 * (1.3.0). Une dépêche d'agence reprise par quarante stations locales est une histoire en quarante
 * endroits, pas quarante sources indépendantes.
 *
 * NE JAMAIS RENDRE `countries` SANS `outlets_without_country`. Un agrégat qui tait ses inconnus est
 * exactement l'objet contre lequel nous leur écrivions : sur le plus gros regroupement d'Ormuz du
 * 2026-08-13, 8 médias déclaraient un pays et 29 n'en déclaraient aucun.
 */
export const NewsClusterCountry = z
  .object({
    code: z.string(),
    outlets: z.number(),
  })
  .passthrough();
export type NewsClusterCountry = z.infer<typeof NewsClusterCountry>;

/**
 * Renseigné UNIQUEMENT quand un prédécesseur a été approché sans être atteint (1.4.0) — donc
 * `topic_matched_by: "new"` + `topic_break: null` = sujet neuf, le même + un `topic_break` = chaîne
 * cassée. `topic_matched_by` garde délibérément ses deux valeurs : élargir une énumération de réponse
 * casserait un consommateur qui la lit strictement, et nous la lisons strictement à dessein.
 *
 * `candidate_urls_dropped_by_cap` est la moitié honnête de la réponse à notre objection : le
 * recouvrement ne peut PAS être recalculé avant plafonnement (un regroupement n'existe que sur ce que
 * le modèle a reçu), donc ce champ dit combien d'articles du prédécesseur le plafond a tenus hors de
 * vue. Il ne répare pas la rupture de capacité, il la rend constatable — et distingue une chaîne
 * cassée par le plafond d'une chaîne cassée par l'actualité.
 */
export const NewsTopicBreak = z
  .object({
    best_containment: z.number(),
    shared_urls: z.number(),
    candidate_urls: z.number(),
    candidate_urls_dropped_by_cap: z.number(),
  })
  .passthrough();
export type NewsTopicBreak = z.infer<typeof NewsTopicBreak>;

/**
 * One event (not one article). CANDIDATE, NEVER A CONFIRMED INCIDENT: a news cluster reports what
 * media SAY, capped at `stress` by the regime engine (ADR 0042) — it never proves a closure. The model
 * writes `headline`/`summary_text`/`event_category`/`geographic_scope`/`salience_score`, and THEY CAN
 * BE WRONG; everything else (`article_count`, `source_domains`, `articles[]`, `first/last_seen`,
 * `affected_chokepoints[]`) is server-recalculated and reliable — believe the articles on conflict.
 * `cluster_id` is NOT durable across runs (snapshot, not history): track events by `articles[].url`.
 * Narrow beam (Hormuz-heavy today): counts reflect the news cycle, NOT object importance — never rank
 * objects on `gdelt_gkg` counts.
 */
export const NewsClusterOut = z
  .object({
    cluster_id: z.string(),
    headline: z.string().nullish(),
    summary_text: z.string().nullish(),
    event_category: z.string().nullish(),
    geographic_scope: z.string().nullish(),
    salience_score: z.number().nullish(),
    article_count: z.number().nullish(),
    source_domains: z.array(z.string()).default([]),
    articles: z.array(NewsSourceRef).default([]),
    affected_chokepoints: z.array(NewsClusterChokepoint).default([]),
    first_seen: z.string().nullish(),
    last_seen: z.string().nullish(),
    model: z.string().nullish(),
    prompt_version: z.string().nullish(),
    offline_facade: z.boolean().nullish(),
    license_taint: z.boolean().nullish(),
    status: z.string().nullish(),
    generated_at: z.string().nullish(),
    /**
     * SECONDE IDENTITÉ, à côté de `cluster_id` qui ne change pas de sens (1.1.0, leur 0029).
     * `cluster_id` ne survit pas à une passe — nous l'avions mesuré, 0 identifiant commun sur 15.
     * `topic_id` dure tant que le sujet reçoit des articles, et sa règle de clôture est TROIS JOURS,
     * la fenêtre de regroupement elle-même ; l'identifiant est ensuite clos et jamais réutilisé.
     *
     * MAIS IL N'EST PAS STABLE POUR AUTANT, et ils l'écrivent : il est aussi stable que la partition
     * du modèle, qui ne l'est pas. Régime permanent mesuré 80–87 % sur les passes du cron, avec une
     * passe à 50 % où le corpus était identique et le modèle a produit 30 regroupements puis 101.
     * GARDER LE REPLI PAR URL — c'est leur consigne, pas seulement notre prudence. Les regroupements
     * antérieurs au 2026-08-13 portent `topic_id: null` (la rétention à 14 jours les purge).
     */
    topic_id: z.string().nullish(),
    topic_matched_by: z.string().nullish(),
    topic_match_rule: z.string().nullish(),
    topic_break: NewsTopicBreak.nullish(),
    /** Voir NewsClusterCountry : les deux champs ne se rendent jamais l'un sans l'autre. */
    countries: z.array(NewsClusterCountry).default([]),
    outlets_without_country: z.number().nullish(),
  })
  .passthrough();
export type NewsClusterOut = z.infer<typeof NewsClusterOut>;

/**
 * GET /news (and /chokepoints/{id}/news) → the readable news layer, clusters grouped by event.
 * `run_notes` MUST be displayed: it reports the run's own limits (sample-vs-summary, a truncation cap,
 * model coverage). Without it a tidy cluster list *looks like* the period's news when it is a sample.
 * Taint PARTITIONS, it does not filter: `taint_class` says which pass you read (`cleared_only` XOR
 * `all_sources`); the two never cumulate. `count: 0` WITH a `run_id` is an honest empty feed;
 * `count: 0` WITHOUT one means no aggregation ever ran.
 */
export const NewsFeedOut = z
  .object({
    count: z.number(),
    run_id: z.string().nullish(),
    taint_class: z.string().nullish(),
    generated_at: z.string().nullish(),
    include_tainted: z.boolean().nullish(),
    items: z.array(NewsClusterOut).default([]),
    run_notes: z.array(z.string()).default([]),
    /**
     * LA PROSE DU MODÈLE SUR SA PROPRE PASSE, séparée de `run_notes` depuis 1.0.0. Les deux ne
     * faisaient qu'une liste : une phrase écrite par un modèle était indiscernable d'un décompte
     * calculé par leur code, dans un champ que ce contrat demande de rendre à un humain qui décide de
     * publier. Nous l'avions trouvé par le symptôme bénin — le mot hébreu « בלבד » au milieu d'une
     * note française partie dans notre Slack ; le défaut était le mélange.
     *
     * Borné à 300 caractères par note, NON VÉRIFIÉ, JAMAIS UN FAIT. `run_notes` ne contient plus que
     * leurs comptes déterministes. Si l'on rend les deux, les distinguer visuellement.
     */
    model_notes: z.array(z.string()).default([]),
    /**
     * 1.9.0 — la fenêtre DEMANDÉE et celle qui a été APPLIQUÉE. Une valeur au-dessus de la fenêtre de
     * collecte de l'agrégateur ne peut pas rendre davantage : une seule passe est servie, et cette
     * passe n'a jamais vu de signaux plus anciens. Ils rapportent l'écart plutôt que de substituer en
     * silence — donc `since=30` répondant sur 14 jours se constate au lieu de se deviner.
     */
    since_days_requested: z.number().nullish(),
    since_days_effective: z.number().nullish(),
    disclaimer: z.string().nullish(),
    attribution_notice: z.string().nullish(),
  })
  .passthrough();
export type NewsFeedOut = z.infer<typeof NewsFeedOut>;

/**
 * A list endpoint that answers with a BARE ARRAY cannot say "this is everything" rather than "this
 * is what fitted". Measured on `event-signals` (2026-08-10): Hormuz returns exactly `limit` rows at
 * 500, 900 and 2000 — so there are at least two thousand, and the default shows five hundred without
 * saying so. Malacca returns 53 at any limit: that list was complete. **The two responses have the
 * same shape.**
 *
 * Until the producer declares truncation (handoff 0029), a consumer can still know one thing for
 * certain: a full page MIGHT be truncated, and a short one certainly is not. That is enough to stop
 * treating a capped list as the whole set.
 */
export function mayBeTruncated(rows: readonly unknown[], requestedLimit: number): boolean {
  return rows.length >= requestedLimit;
}

// ─────────────────────────────────────────────────────────────────────────────────────────────────
// ENVELOPPES COMPTÉES (contrat 1.0.0) — treize ressources qui répondaient par un TABLEAU NU
// ─────────────────────────────────────────────────────────────────────────────────────────────────

/**
 * Un tableau nu ne peut pas dire « voici tout » plutôt que « voici ce que j'ai trouvé ». Mesuré chez
 * eux : `event-signals` servait **500 lignes sur un corridor qui en portait 6488**, et **53 sur un
 * corridor qui en portait 53**, dans deux réponses de forme identique. Six de ces listes n'avaient
 * aucune limite et rendaient des tables entières sans le dire.
 *
 * L'enveloppe porte `returned`, `total_count` (un vrai `count(*)` calculé AVANT la limite — jamais la
 * taille de page), `truncated`, `limit` (la limite réellement appliquée, `null` quand il n'y en a pas)
 * et `generated_at`. Une liste vide devient une phrase : `total_count: 0, truncated: false` ne dit pas
 * la même chose que `total_count: 4000, truncated: true`.
 *
 * `total_count` compte ce que le filtre a trouvé, **teinte comprise** — une ligne retenue par la règle
 * de licence n'est ni dans `items` ni dans le compte. Un compte qui trahirait ce que la garde de
 * teinte retient serait une fuite, pas de l'honnêteté.
 *
 * CES SCHÉMAS NE SONT PAS LE CHEMIN DE LECTURE. `readListEnvelope` (`list-envelope.ts`) reste le seul
 * point d'entrée : il accepte encore le tableau nu, parce qu'une charge utile antérieure à la bascule
 * peut toujours se présenter, et surtout parce qu'il refuse de déduire un total d'une longueur reçue.
 * Ces objets décrivent la forme servie et gardent la couverture de contrat honnête (ADR 0066).
 *
 * `returned` est redondant avec `items.length` — et c'est justement ce qui le rend utile : un écart
 * entre les deux est le signe que la charge utile a été tronquée en chemin, pas en amont.
 */
export const ActorControlList = z
  .object({
    chokepoint_id: z.string(),
    returned: z.number(),
    total_count: z.number(),
    truncated: z.boolean(),
    limit: z.number().nullish(),
    generated_at: z.string(),
    items: z.array(ActorControlOut).default([]),
  })
  .passthrough();
export type ActorControlList = z.infer<typeof ActorControlList>;

export const ActorList = z
  .object({
    returned: z.number(),
    total_count: z.number(),
    truncated: z.boolean(),
    limit: z.number().nullish(),
    generated_at: z.string(),
    items: z.array(ActorOut).default([]),
  })
  .passthrough();
export type ActorList = z.infer<typeof ActorList>;

export const AlertList = z
  .object({
    returned: z.number(),
    total_count: z.number(),
    truncated: z.boolean(),
    limit: z.number().nullish(),
    generated_at: z.string(),
    items: z.array(AlertOut).default([]),
  })
  .passthrough();
export type AlertList = z.infer<typeof AlertList>;

export const AnalyticalResultList = z
  .object({
    returned: z.number(),
    total_count: z.number(),
    truncated: z.boolean(),
    limit: z.number().nullish(),
    generated_at: z.string(),
    items: z.array(AnalyticalResultOut).default([]),
  })
  .passthrough();
export type AnalyticalResultList = z.infer<typeof AnalyticalResultList>;

export const EngineRunList = z
  .object({
    returned: z.number(),
    total_count: z.number(),
    truncated: z.boolean(),
    limit: z.number().nullish(),
    generated_at: z.string(),
    items: z.array(EngineRunOut).default([]),
  })
  .passthrough();
export type EngineRunList = z.infer<typeof EngineRunList>;

export const EpisodeList = z
  .object({
    returned: z.number(),
    total_count: z.number(),
    truncated: z.boolean(),
    limit: z.number().nullish(),
    generated_at: z.string(),
    items: z.array(EpisodeOut).default([]),
  })
  .passthrough();
export type EpisodeList = z.infer<typeof EpisodeList>;

export const EventSignalList = z
  .object({
    chokepoint_id: z.string(),
    returned: z.number(),
    total_count: z.number(),
    truncated: z.boolean(),
    limit: z.number().nullish(),
    generated_at: z.string(),
    items: z.array(EventSignalOut).default([]),
  })
  .passthrough();
export type EventSignalList = z.infer<typeof EventSignalList>;

export const FlowChokepointList = z
  .object({
    flow_type: z.string(),
    returned: z.number(),
    total_count: z.number(),
    truncated: z.boolean(),
    limit: z.number().nullish(),
    generated_at: z.string(),
    items: z.array(FlowChokepointOut).default([]),
  })
  .passthrough();
export type FlowChokepointList = z.infer<typeof FlowChokepointList>;

export const RelationList = z
  .object({
    returned: z.number(),
    total_count: z.number(),
    truncated: z.boolean(),
    limit: z.number().nullish(),
    generated_at: z.string(),
    items: z.array(RelationOut).default([]),
  })
  .passthrough();
export type RelationList = z.infer<typeof RelationList>;

export const RiskChokepointList = z
  .object({
    risk_type: z.string(),
    returned: z.number(),
    total_count: z.number(),
    truncated: z.boolean(),
    limit: z.number().nullish(),
    generated_at: z.string(),
    items: z.array(RiskChokepointOut).default([]),
  })
  .passthrough();
export type RiskChokepointList = z.infer<typeof RiskChokepointList>;

export const SourceList = z
  .object({
    returned: z.number(),
    total_count: z.number(),
    truncated: z.boolean(),
    limit: z.number().nullish(),
    generated_at: z.string(),
    items: z.array(SourceOut).default([]),
  })
  .passthrough();
export type SourceList = z.infer<typeof SourceList>;

export const StrategicSystemList = z
  .object({
    returned: z.number(),
    total_count: z.number(),
    truncated: z.boolean(),
    limit: z.number().nullish(),
    generated_at: z.string(),
    items: z.array(StrategicSystemOut).default([]),
  })
  .passthrough();
export type StrategicSystemList = z.infer<typeof StrategicSystemList>;

export const SystemChokepointList = z
  .object({
    system_id: z.string(),
    returned: z.number(),
    total_count: z.number(),
    truncated: z.boolean(),
    limit: z.number().nullish(),
    generated_at: z.string(),
    items: z.array(ChokepointSummary).default([]),
  })
  .passthrough();
export type SystemChokepointList = z.infer<typeof SystemChokepointList>;

/* ---- État courant d'un objet (1.7.0, ADR amont 0107/0108) ------------------------------------ */

/**
 * UNE composante de `/chokepoints/{id}/state`. Six existent — `regime`, `event_pressure`, `cvi`,
 * `prediction_consensus`, `media_attention`, `news` — et la charge utile sert la même forme pour
 * toutes : les champs qui ne concernent pas la composante valent `null`. C'est délibéré chez eux, et
 * commode ici : un seul schéma, aucune union à discriminer.
 *
 * `status` vaut **`observed` | `stale` | `no_data`**, et il n'y a pas de quatrième valeur. Une
 * composante sans rien derrière dit `no_data` ; elle ne retombe JAMAIS sur une valeur par défaut,
 * parce qu'une absence de signal n'est pas du calme.
 */
export const StateComponent = z
  .object({
    status: z.string(),
    tension: z.number().nullish(),
    confidence: z.number().nullish(),
    generated_at: z.string().nullish(),
    engine_last_emitted_at: z.string().nullish(),
    observed_window_end: z.string().nullish(),
    /* regime */
    operational_state: z.string().nullish(),
    lifecycle_phase: z.string().nullish(),
    contributing_signals: z.number().nullish(),
    /* event_pressure — servi avec son signal_count, et NE NOURRIT PAS tension_pct (voir plus bas) */
    pressure_score: z.number().nullish(),
    signal_count: z.number().nullish(),
    top_domain: z.string().nullish(),
    /* cvi */
    global_level: z.string().nullish(),
    binding_dimension: z.string().nullish(),
    dimensions_evaluated: z.number().nullish(),
    dimensions_total: z.number().nullish(),
    /* prediction_consensus */
    signal_family: z.string().nullish(),
    market_count: z.number().nullish(),
    consensus_probability: z.number().nullish(),
    /* media_attention — 1.9.0 ajoute review_status : une alerte écartée par un analyste ne doit pas
       piloter la tension pour toujours, et le champ est servi pour qu'on le vérifie. */
    level: z.string().nullish(),
    trigger_summary: z.string().nullish(),
    review_status: z.string().nullish(),
    /* news — 1.9.0 ajoute run_id : de quelle passe vient le compte. */
    cluster_count: z.number().nullish(),
    run_id: z.string().nullish(),
    last_seen: z.string().nullish(),
  })
  .passthrough();
export type StateComponent = z.infer<typeof StateComponent>;

/** Le décompte qui donne son dénominateur à `coverage_pct`, et le nombre de composantes qui ont
 *  effectivement nourri `tension_pct` — les deux ne sont pas le même nombre. */
export const StateCoverage = z
  .object({
    observed: z.number(),
    stale: z.number(),
    no_data: z.number(),
    total: z.number(),
    tension_components_used: z.number(),
  })
  .passthrough();
export type StateCoverage = z.infer<typeof StateCoverage>;

/**
 * `GET /chokepoints/{id}/state` — l'état courant d'UN objet, rassemblé, avec l'âge de chaque part.
 *
 * TROIS RÈGLES, ET AUCUNE N'EST DÉCORATIVE.
 *
 * 1. **`no_data` sort du dénominateur, ce n'est jamais un zéro.** Un objet à `{observed: 0,
 *    no_data: 6}` est une réponse valide : elle dit « nous ne savons rien de cet objet », pas « tout
 *    va bien ». Une absence qui deviendrait un zéro affirmerait le calme depuis un trou.
 * 2. **Les trois pourcentages ne se séparent pas.** `tension_pct: 75` seul est un piège ;
 *    `{tension 75, coverage 17, confidence 30}` est une information. Leur sérialiseur ne sert jamais
 *    l'un sans les autres et ils nous demandent de ne pas les découpler à l'affichage — `stateReading`
 *    ci-dessous existe pour rendre ce découplage difficile.
 * 3. **CELA NE SE TRIE PAS.** Ces pourcentages ne sont PAS comparables entre objets : deux objets
 *    reposent sur des composantes disponibles différentes. Chaque réponse le répète dans son champ
 *    `comparability`, et c'est la même mise en garde que `pressure_score` — que nous avons retiré du
 *    classement public le jour où nous l'avons comprise (ADR 0049 amont, et notre propre `bd5633c`).
 *    Pour une vue parc, `/analytics/state-summary` sert un DÉCOMPTE DE CATÉGORIES, pas une moyenne.
 *
 * `event_pressure` est servi comme composante mais **ne nourrit pas** `tension_pct` : sa magnitude
 * suit le volume de collecte, pas la sévérité (Ormuz 295 sur 308 signaux, Taïwan 1,28 sur 2).
 */
export const ChokepointState = z
  .object({
    chokepoint_id: z.string(),
    canonical_name: z.string(),
    priority_class: z.string().nullish(),
    components: z.record(StateComponent).default({}),
    coverage_pct: z.number(),
    tension_pct: z.number().nullish(),
    confidence_pct: z.number().nullish(),
    coverage: StateCoverage,
    comparability: z.string(),
  })
  .passthrough();
export type ChokepointState = z.infer<typeof ChokepointState>;

/**
 * `GET /analytics/state-summary` — la vue parc, et elle est un **décompte de catégories**, jamais une
 * moyenne. Elle compte les objets dont le régime dépasse `open`, et sert `objects_without_regime` à
 * côté de la part : la majeure partie du noyau n'a aucune évaluation de régime, et une part calculée
 * sur les quelques objets couverts ne doit pas se lire comme une part du noyau.
 *
 * `stale_regime_rows` est le compte de leur propre aveu, servi en continu plutôt qu'annoncé une fois.
 */
export const StateSummaryOut = z
  .object({
    share_above_normal_pct: z.number().nullish(),
    objects_above_normal: z.number(),
    objects_with_regime: z.number(),
    objects_without_regime: z.number(),
    core_total: z.number(),
    stale_regime_rows: z.number(),
    generated_at: z.string(),
  })
  .passthrough();
export type StateSummaryOut = z.infer<typeof StateSummaryOut>;
