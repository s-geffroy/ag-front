import { z } from 'zod';
import {
  ChokepointDetail,
  ChokepointList,
  ChokepointSummary,
  GeoJsonFeatureCollection,
  toPublicFeatureCollection,
  FlowChokepointOut,
  RiskChokepointOut,
  ActorOut,
  ActorControlOut,
  RelationOut,
  StrategicSystemOut,
  StrategicSystemDetail,
  EpisodeOut,
  EpisodeDetail,
  SourceOut,
  AlertOut,
  AnalyticalResultOut,
  EngineRunOut,
  CviAssessmentOut,
  EventSignalOut,
  ChokepointAnalysis,
  PerceptionSignalList,
  PredictionConsensusList,
  ChokepointAnalysisList,
  ChokepointAnalysisDetail,
  HealthOut,
  FicheOut,
  SystemResilienceOut,
  StrategicFlowUnitList,
  SfuVerdictOut,
  SfuFicheOut,
  VocabulariesOut,
  DerivedRelationGraphOut,
  CviCounterfactualOut,
  NewsFeedOut,
} from './schema';
import type {
  FlowChokepointOut as FlowChokepointOutT,
  RiskChokepointOut as RiskChokepointOutT,
  ActorOut as ActorOutT,
  ActorControlOut as ActorControlOutT,
  RelationOut as RelationOutT,
  StrategicSystemOut as StrategicSystemOutT,
  StrategicSystemDetail as StrategicSystemDetailT,
  EpisodeOut as EpisodeOutT,
  EpisodeDetail as EpisodeDetailT,
  SourceOut as SourceOutT,
  AlertOut as AlertOutT,
  AnalyticalResultOut as AnalyticalResultOutT,
  EngineRunOut as EngineRunOutT,
  CviAssessmentOut as CviAssessmentOutT,
  EventSignalOut as EventSignalOutT,
  ChokepointAnalysis as ChokepointAnalysisT,
  PerceptionSignalList as PerceptionSignalListT,
  PredictionConsensusList as PredictionConsensusListT,
  ChokepointAnalysisList as ChokepointAnalysisListT,
  ChokepointAnalysisDetail as ChokepointAnalysisDetailT,
  HealthOut as HealthOutT,
  FicheOut as FicheOutT,
  SystemResilienceOut as SystemResilienceOutT,
  StrategicFlowUnitList as StrategicFlowUnitListT,
  SfuVerdictOut as SfuVerdictOutT,
  SfuFicheOut as SfuFicheOutT,
  VocabulariesOut as VocabulariesOutT,
  DerivedRelationGraphOut as DerivedRelationGraphOutT,
  CviCounterfactualOut as CviCounterfactualOutT,
  NewsFeedOut as NewsFeedOutT,
} from './schema';

/**
 * A non-2xx response from the Read API, carrying the status so callers can TELL FAILURES APART.
 *
 * This exists because the previous generic `Error` forced every consumer into `.catch(() => [])`,
 * which conflates "not authorised" (403), "absent" (404) and "genuinely empty" ([]). That conflation
 * hid a permanently-failing call for months: HDDE requests `/perception-signals` with a `read` token,
 * the producer gates that route on `read_tainted` unconditionally, and the resulting 403 was silently
 * rendered as "this corridor has no perception signals". An authorization bug must never look like an
 * empty dataset.
 */
export class ChokepointsApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
  ) {
    super(`Chokepoints API ${path} → HTTP ${status}`);
    this.name = 'ChokepointsApiError';
  }
  /** The record (or route) is absent — an expected, benign outcome worth degrading to empty. */
  get isNotFound(): boolean {
    return this.status === 404;
  }
  /** Wrong scope. Never benign: it means the caller is using a token it was not provisioned for. */
  get isForbidden(): boolean {
    return this.status === 403;
  }
}

export type ChokepointsClientOptions = {
  baseUrl: string;
  token: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
  /**
   * Opt-in to redistribution-restricted ("tainted") records. Defaults to **false** (clear only).
   * Requires a `read_tainted` token AND a non-public surface — never enable on the public site.
   */
  includeTainted?: boolean;
};

export type ListParams = {
  family?: string;
  priority_class?: string;
  macro_region?: string;
  limit?: number;
  offset?: number;
};

export type SearchParams = { q: string; limit?: number };
export type NearbyParams = { lat: number; lon: number; radius_km?: number; limit?: number };
export type AlertParams = { review_status?: string; chokepoint_id?: string; limit?: number };
export type AnalyticsParams = {
  object_id?: string;
  engine_id?: string;
  status?: string;
  limit?: number;
};
export type AnalysisDoc = 'synthesis' | 'theory-of-constraints' | 'leverage-points';
export type DerivedRelationParams = {
  relation_type?: string;
  /** `in_corpus` | `external_candidate` — the latter marks a coverage gap, not a corpus object. */
  to_status?: string;
  from_object_id?: string;
  limit?: number;
};
/** `scope` is a bounded enum on the producer (`core` default; `bulk` → population 0, licit). */
export type CviCounterfactualParams = { scope?: string };
/** GET /news filters. `include_tainted` is NOT here — the client's taint gate sets it (ADR 0013). */
export type NewsParams = {
  since?: number;
  limit?: number;
  chokepoint_id?: string;
  category?: string;
};
/** GET /chokepoints/{id}/news filters (no chokepoint_id/category — the path fixes the object). */
export type ChokepointNewsParams = { since?: number; limit?: number };

export type ChokepointsClient = {
  // --- 0.1.0 ---
  getHealth(): Promise<HealthOutT>;
  listChokepoints(params?: ListParams): Promise<ChokepointList>;
  getChokepoint(id: string): Promise<ChokepointDetail>;
  getChokepointFiche(id: string): Promise<FicheOutT>;
  exportGeoJson(): Promise<GeoJsonFeatureCollection>;
  // --- 0.2.0 (additive, docs/api-interface-contract_V2.md) ---
  searchChokepoints(params: SearchParams): Promise<ChokepointList>;
  nearbyChokepoints(params: NearbyParams): Promise<ChokepointList>;
  chokepointsByFlow(flowType: string): Promise<FlowChokepointOutT[]>;
  chokepointsByRisk(riskType: string): Promise<RiskChokepointOutT[]>;
  chokepointsBySystem(systemId: string): Promise<ChokepointList['items']>;
  getChokepointAnalysis(id: string): Promise<ChokepointAnalysisT>;
  getChokepointActors(id: string): Promise<ActorControlOutT[]>;
  getChokepointEventSignals(id: string, limit?: number): Promise<EventSignalOutT[]>;
  getChokepointPerceptionSignals(id: string, limit?: number): Promise<PerceptionSignalListT>;
  listActors(): Promise<ActorOutT[]>;
  listRelations(): Promise<RelationOutT[]>;
  listStrategicSystems(): Promise<StrategicSystemOutT[]>;
  getStrategicSystem(id: string): Promise<StrategicSystemDetailT>;
  listEpisodes(): Promise<EpisodeOutT[]>;
  getEpisode(key: string): Promise<EpisodeDetailT>;
  listSources(): Promise<SourceOutT[]>;
  getVocabularies(): Promise<VocabulariesOutT>;
  listAlerts(params?: AlertParams): Promise<AlertOutT[]>;
  listAnalyticsResults(params?: AnalyticsParams): Promise<AnalyticalResultOutT[]>;
  listEngineRuns(engineId?: string): Promise<EngineRunOutT[]>;
  getChokepointCviAssessment(id: string): Promise<CviAssessmentOutT>;
  listChokepointAnalyses(params?: {
    priority_class?: string;
    family?: string;
  }): Promise<ChokepointAnalysisListT>;
  getChokepointAnalysisDetail(id: string): Promise<ChokepointAnalysisDetailT>;
  getChokepointAnalysisDoc(id: string, doc: AnalysisDoc): Promise<string>;
  exportJsonl(): Promise<string>;
  // --- 0.3.0 / 0.4.0 ---
  /** GET /analytics/system-resilience — global ENA resilience row. Throws (404) until computed. */
  getSystemResilience(): Promise<SystemResilienceOutT>;
  /** GET /strategic-flows — SFIM flow-unit list (envelope with items). */
  listStrategicFlows(): Promise<StrategicFlowUnitListT>;
  /** GET /strategic-flows/{sfuId}/verdict — SFIM decision. `null` when no verdict authored yet. */
  getStrategicFlowVerdict(sfuId: string): Promise<SfuVerdictOutT | null>;
  /** GET /strategic-flows/{sfuId}/fiche — full SFU fiche (red_team block only with read_tainted). */
  getStrategicFlowFiche(sfuId: string): Promise<SfuFicheOutT>;
  // --- added in 0.6.0 ---
  /** GET /derived/relations — candidate graph extracted from the analysis fiches (ADR 0065). */
  listDerivedRelations(params?: DerivedRelationParams): Promise<DerivedRelationGraphOutT>;
  /** GET /derived/relation-graph — raw centrality/topology report. Opaque text; do not parse. */
  getDerivedRelationGraph(): Promise<string>;
  // --- 0.9.0 / 0.10.0-0.11.0 additive ---
  /** GET /analytics/cvi-counterfactual — CVI substitution slide as a live aggregate (ADR 0076). */
  getCviCounterfactual(params?: CviCounterfactualParams): Promise<CviCounterfactualOutT>;
  /** GET /news — readable news layer, clusters by event. Candidates, never confirmed incidents. */
  listNews(params?: NewsParams): Promise<NewsFeedOutT>;
  /** GET /chokepoints/{id}/news — clusters really linked to one object. */
  getChokepointNews(id: string, params?: ChokepointNewsParams): Promise<NewsFeedOutT>;
  // --- 0.15.0 ---
  /**
   * GET /chokepoints/{id}/prediction-consensus — the derived Polymarket consensus as its own narrow,
   * clear/`read`-scope surface (ADR 0071). Replaces the interim `/analysis` projection: the public site
   * no longer touches engines/relations/claims to reach the one block it may publish. `consensus: []`
   * means **no honest market coverage** (ADR 0079 floor, server-side since 0.13.0) — not an error.
   * Publishing it obliges Polymarket attribution + the S5 low-reliability disclaimer.
   *
   * Since 0.16.0 each row carries `attachment_rules`, the measured aggregate of the rules its summed
   * rows actually used. Consumers gate on it (`consensusRowIsPublishable`) instead of assuming the
   * floor held — an aggregate can be checked, the engine constant it replaced could not.
   */
  getChokepointPredictionConsensus(id: string): Promise<PredictionConsensusListT>;
};

/**
 * Every contract path this client implements, as OpenAPI-style templates (producer param names, so
 * they compare directly against the pinned `scripts/consumer/contract/openapi.json`). This is the
 * TS-side coverage ledger the Python drift-check can't see (it generates a Python client, not this
 * hand-written TS one). `contract-coverage.test.ts` asserts every pinned path appears here, so a
 * contract that gains an endpoint fails the build until a method + schema are wired — closing the
 * "front pinned to an older/narrower surface than the producer" gap. The subset check is
 * one-directional (pin ⊆ covered), so pre-wiring an endpoint ahead of a producer deploy is fine.
 */
export const COVERED_PATHS = [
  // 0.1.0
  '/health',
  '/chokepoints',
  '/chokepoints/{chokepoint_id}',
  '/chokepoints/{chokepoint_id}/fiche',
  '/exports/geojson',
  '/exports/jsonl',
  '/relations',
  '/strategic-systems',
  '/strategic-systems/{system_id}',
  '/episodes',
  '/episodes/{episode_key}',
  '/sources',
  '/analytics/results',
  '/analytics/engine-runs',
  '/chokepoint-analyses',
  '/chokepoint-analyses/{chokepoint_id}',
  '/chokepoint-analyses/{chokepoint_id}/{doc}',
  // 0.2.0
  '/chokepoints/search',
  '/chokepoints/nearby',
  '/chokepoints/by-flow/{flow_type}',
  '/chokepoints/by-risk/{risk_type}',
  '/chokepoints/by-system/{system_id}',
  '/chokepoints/{chokepoint_id}/analysis',
  '/chokepoints/{chokepoint_id}/actors',
  '/chokepoints/{chokepoint_id}/event-signals',
  '/chokepoints/{chokepoint_id}/perception-signals',
  '/actors',
  '/vocabularies',
  '/alerts',
  // 0.3.0 (pre-wired ahead of deploy)
  '/chokepoints/{chokepoint_id}/cvi-assessment',
  // 0.4.0 (pre-wired ahead of deploy)
  '/analytics/system-resilience',
  '/strategic-flows',
  '/strategic-flows/{sfu_id}/verdict',
  '/strategic-flows/{sfu_id}/fiche',
  // added in 0.6.0
  '/derived/relations',
  '/derived/relation-graph',
  // 0.9.0
  '/analytics/cvi-counterfactual',
  // 0.10.0 / 0.11.0
  '/news',
  '/chokepoints/{chokepoint_id}/news',
  // 0.15.0
  '/chokepoints/{chokepoint_id}/prediction-consensus',
] as const;

/** A product surface that actually reads an endpoint. The client itself is NOT a consumer. */
export type ConsumerSurface = 'public' | 'cockpit' | 'hdde' | 'verdict';

/**
 * Which product surface consumes each contract endpoint. `contract-coverage.test.ts` fails if a
 * pinned path has no entry, closing the "wired in the client but read by nobody" gap: a method can
 * satisfy `COVERED_PATHS` while no screen or packet ever calls it.
 *
 * Hand-maintained on purpose. Statically scanning four apps for usage is fragile; an explicit ledger
 * is auditable and forces a conscious decision when the producer's surface grows.
 *
 * VERDICT never appears here: it must never call the Read API directly (ADR 0042) — it consumes the
 * HDDE diagnostic packet. `/chokepoints/{id}/perception-signals` is cockpit-only: the producer gates
 * it unconditionally on `read_tainted`, and HDDE holds a `read` token by design (ADR 0035), so it
 * reads the dedicated `/chokepoints/{id}/prediction-consensus` instead. (That surface still serves the
 * unfloored `full_text` history, ~98 % noise — ag-back handoff 0022 §6 leaves it open deliberately, and
 * it costs us nothing: we never read it.)
 *
 * `/chokepoints/{id}/analysis` is NO LONGER `public`. It was, briefly, read through a narrow
 * `getChokepointConsensus` projection — the reversible interim of ADR 0071 while the derived consensus
 * had no surface of its own. ag-back shipped the dedicated
 * `/chokepoints/{id}/prediction-consensus` (0.15.0, clear `read`), so the public build reads THAT and
 * the wide analysis payload stops crossing into a public consumer at all. That is the point of the
 * ledger: an interim widening must be visible, and it must be taken back once the reason lapses.
 */
export const CONSUMERS: Record<string, ConsumerSurface[]> = {
  '/health': ['cockpit'],
  '/chokepoints': ['public', 'cockpit', 'hdde'],
  '/chokepoints/{chokepoint_id}': ['public', 'cockpit'],
  '/chokepoints/{chokepoint_id}/fiche': ['cockpit'],
  '/chokepoints/search': ['cockpit'],
  '/chokepoints/nearby': ['cockpit'],
  '/chokepoints/by-flow/{flow_type}': ['cockpit', 'hdde'],
  '/chokepoints/by-risk/{risk_type}': ['public', 'cockpit'],
  '/chokepoints/by-system/{system_id}': ['public', 'cockpit'],
  '/chokepoints/{chokepoint_id}/analysis': ['cockpit', 'hdde'],
  '/chokepoints/{chokepoint_id}/actors': ['cockpit', 'hdde'],
  '/chokepoints/{chokepoint_id}/event-signals': ['cockpit', 'hdde'],
  '/chokepoints/{chokepoint_id}/perception-signals': ['cockpit'],
  '/chokepoints/{chokepoint_id}/cvi-assessment': ['cockpit', 'hdde'],
  '/actors': ['cockpit'],
  '/relations': ['cockpit', 'hdde'],
  '/strategic-systems': ['public', 'cockpit'],
  '/strategic-systems/{system_id}': ['public', 'cockpit'],
  '/episodes': ['cockpit', 'hdde'],
  '/episodes/{episode_key}': ['cockpit', 'hdde'],
  '/sources': ['cockpit'],
  '/vocabularies': ['cockpit'],
  '/alerts': ['cockpit'],
  '/analytics/results': ['cockpit', 'hdde'],
  '/analytics/engine-runs': ['cockpit'],
  '/analytics/system-resilience': ['cockpit', 'hdde'],
  '/chokepoint-analyses': ['cockpit'],
  '/chokepoint-analyses/{chokepoint_id}': ['cockpit'],
  '/chokepoint-analyses/{chokepoint_id}/{doc}': ['cockpit'],
  '/strategic-flows': ['cockpit'],
  '/strategic-flows/{sfu_id}/verdict': ['cockpit'],
  '/strategic-flows/{sfu_id}/fiche': ['cockpit'],
  '/derived/relations': ['cockpit', 'hdde'],
  '/derived/relation-graph': ['cockpit'],
  '/exports/geojson': ['public', 'cockpit'],
  '/exports/jsonl': ['cockpit'],
  // News + counterfactual are cockpit-only: candidates pending validation, surfaced on the internal
  // Tailscale-only Exploration console — never republished to the public site (ADR 0013).
  '/analytics/cvi-counterfactual': ['cockpit'],
  '/news': ['cockpit'],
  '/chokepoints/{chokepoint_id}/news': ['cockpit'],
  // The ONE derived surface that reaches the open internet (ADR 0071): narrow, clear-scope, floored
  // server-side on ADR 0079, and publishable only WITH Polymarket attribution + the S5 disclaimer.
  // HDDE reads it too — same `read` scope, and it replaces the wide /analysis pull it used to make
  // for this single block (ADR 0035): same evidence, less surface.
  '/chokepoints/{chokepoint_id}/prediction-consensus': ['public', 'hdde'],
};

/**
 * Read-only client for the Chokepoints Read API.
 *
 * SAFE BY DEFAULT: `include_tainted` is sent **only** when `includeTainted: true` is explicitly set
 * (which also requires a `read_tainted` token). Left unset, redistribution-restricted records stay
 * excluded — the public build never opts in. The Bearer token must never reach the browser; intended
 * for build-time (public) or server-side (cockpit) use on a tailnet host.
 */
export function createChokepointsClient(opts: ChokepointsClientOptions): ChokepointsClient {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const base = opts.baseUrl.replace(/\/+$/, '');
  const timeoutMs = opts.timeoutMs ?? 15_000;

  async function get(
    path: string,
    params?: Record<string, string | number | undefined>,
    callOpts?: { allowTainted?: boolean },
  ): Promise<unknown> {
    // Per-call taint gate: tainted records are sent ONLY when the client opted in AND this
    // specific call allows it. Public-redistribution paths (the GeoJSON export) pass
    // `allowTainted: false`, so they can never request restricted records — the guarantee is a
    // property of the call, not just of who built the client.
    const allowTainted = callOpts?.allowTainted ?? true;
    const url = new URL(base + path);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }
    if (opts.includeTainted && allowTainted) url.searchParams.set('include_tainted', 'true');
    const res = await fetchImpl(url, {
      headers: { Authorization: `Bearer ${opts.token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) throw new ChokepointsApiError(res.status, path);
    return res.json();
  }

  // Raw text fetch for non-JSON endpoints (markdown docs, JSONL stream). Same taint gate.
  async function getText(
    path: string,
    params?: Record<string, string | number | undefined>,
  ): Promise<string> {
    const url = new URL(base + path);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }
    if (opts.includeTainted) url.searchParams.set('include_tainted', 'true');
    const res = await fetchImpl(url, {
      headers: { Authorization: `Bearer ${opts.token}` },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) throw new ChokepointsApiError(res.status, path);
    return res.text();
  }

  const enc = encodeURIComponent;

  return {
    async getHealth() {
      // Liveness probe. Auth header is sent (harmless) but the endpoint is public; never tainted.
      return HealthOut.parse(await get('/health', undefined, { allowTainted: false }));
    },
    async listChokepoints(params) {
      return ChokepointList.parse(await get('/chokepoints', params));
    },
    async getChokepoint(id) {
      return ChokepointDetail.parse(await get(`/chokepoints/${encodeURIComponent(id)}`));
    },
    async getChokepointFiche(id) {
      return FicheOut.parse(await get(`/chokepoints/${enc(id)}/fiche`));
    },
    async exportGeoJson() {
      // Public redistribution surface. Two structural guarantees, independent of how the client
      // was constructed: (1) `include_tainted` is never sent (allowTainted: false); (2) each feature
      // is projected to a public-safe property allowlist, so restricted attributes
      // (license_taint, max_license_risk, …) can never reach a clear consumer even if the upstream
      // API leaks them. Geometries are schematic.
      const raw = GeoJsonFeatureCollection.parse(
        await get('/exports/geojson', undefined, { allowTainted: false }),
      );
      return toPublicFeatureCollection(raw);
    },

    // --- 0.2.0 additive endpoints (taint-aware via the shared `get`) ---
    async searchChokepoints(params) {
      return ChokepointList.parse(await get('/chokepoints/search', params));
    },
    async nearbyChokepoints(params) {
      return ChokepointList.parse(await get('/chokepoints/nearby', params));
    },
    async chokepointsByFlow(flowType) {
      return z.array(FlowChokepointOut).parse(await get(`/chokepoints/by-flow/${enc(flowType)}`));
    },
    async chokepointsByRisk(riskType) {
      return z.array(RiskChokepointOut).parse(await get(`/chokepoints/by-risk/${enc(riskType)}`));
    },
    async chokepointsBySystem(systemId) {
      // The live endpoint returns a BARE array of summaries (not a ChokepointList envelope).
      return z.array(ChokepointSummary).parse(await get(`/chokepoints/by-system/${enc(systemId)}`));
    },
    async getChokepointAnalysis(id) {
      return ChokepointAnalysis.parse(await get(`/chokepoints/${enc(id)}/analysis`));
    },
    async getChokepointPredictionConsensus(id) {
      // The narrow surface ag-back shipped at our request (0.15.0): no projection needed, and a
      // `read`-scope consumer never has to touch engines/relations/claims to reach the one block it
      // may publish. Empty `consensus` = no honest market coverage, not a failure (ADR 0079 floor).
      return PredictionConsensusList.parse(
        await get(`/chokepoints/${enc(id)}/prediction-consensus`),
      );
    },
    async getChokepointActors(id) {
      return z.array(ActorControlOut).parse(await get(`/chokepoints/${enc(id)}/actors`));
    },
    async getChokepointEventSignals(id, limit) {
      return z
        .array(EventSignalOut)
        .parse(await get(`/chokepoints/${enc(id)}/event-signals`, { limit }));
    },
    async getChokepointPerceptionSignals(id, limit) {
      return PerceptionSignalList.parse(
        await get(`/chokepoints/${enc(id)}/perception-signals`, { limit }),
      );
    },
    async listActors() {
      return z.array(ActorOut).parse(await get('/actors'));
    },
    async listRelations() {
      return z.array(RelationOut).parse(await get('/relations'));
    },
    async listStrategicSystems() {
      return z.array(StrategicSystemOut).parse(await get('/strategic-systems'));
    },
    async getStrategicSystem(id) {
      return StrategicSystemDetail.parse(await get(`/strategic-systems/${enc(id)}`));
    },
    async listEpisodes() {
      return z.array(EpisodeOut).parse(await get('/episodes'));
    },
    async getEpisode(key) {
      return EpisodeDetail.parse(await get(`/episodes/${enc(key)}`));
    },
    async listSources() {
      return z.array(SourceOut).parse(await get('/sources'));
    },
    async getVocabularies() {
      return VocabulariesOut.parse(await get('/vocabularies'));
    },
    async listAlerts(params) {
      return z
        .array(AlertOut)
        .parse(await get('/alerts', params as Record<string, string | number | undefined>));
    },
    async listAnalyticsResults(params) {
      return z
        .array(AnalyticalResultOut)
        .parse(
          await get('/analytics/results', params as Record<string, string | number | undefined>),
        );
    },
    async listEngineRuns(engineId) {
      return z
        .array(EngineRunOut)
        .parse(await get('/analytics/engine-runs', { engine_id: engineId }));
    },
    async getChokepointCviAssessment(id) {
      return CviAssessmentOut.parse(await get(`/chokepoints/${enc(id)}/cvi-assessment`));
    },
    async listChokepointAnalyses(params) {
      return ChokepointAnalysisList.parse(await get('/chokepoint-analyses', params));
    },
    async getChokepointAnalysisDetail(id) {
      return ChokepointAnalysisDetail.parse(await get(`/chokepoint-analyses/${enc(id)}`));
    },
    async getChokepointAnalysisDoc(id, doc) {
      return getText(`/chokepoint-analyses/${enc(id)}/${doc}`);
    },
    async exportJsonl() {
      return getText('/exports/jsonl');
    },

    // --- 0.3.0 / 0.4.0 additive endpoints ---
    async getSystemResilience() {
      return SystemResilienceOut.parse(await get('/analytics/system-resilience'));
    },
    async listStrategicFlows() {
      return StrategicFlowUnitList.parse(await get('/strategic-flows'));
    },
    async getStrategicFlowVerdict(sfuId) {
      // The producer returns `null` (not 404) when no verdict has been authored for the SFU yet.
      return SfuVerdictOut.nullable().parse(await get(`/strategic-flows/${enc(sfuId)}/verdict`));
    },
    async getStrategicFlowFiche(sfuId) {
      return SfuFicheOut.parse(await get(`/strategic-flows/${enc(sfuId)}/fiche`));
    },

    // --- endpoints added in 0.6.0 ---
    async listDerivedRelations(params) {
      // Derived candidates, NOT canonical — distinct from `listRelations()`. No taint gate producer-side.
      return DerivedRelationGraphOut.parse(
        await get('/derived/relations', params as Record<string, string | number | undefined>),
      );
    },
    async getDerivedRelationGraph() {
      return getText('/derived/relation-graph');
    },

    // --- 0.9.0 / 0.10.0-0.11.0 additive endpoints ---
    async getCviCounterfactual(params) {
      return CviCounterfactualOut.parse(
        await get(
          '/analytics/cvi-counterfactual',
          params as Record<string, string | number | undefined>,
        ),
      );
    },
    async listNews(params) {
      return NewsFeedOut.parse(
        await get('/news', params as Record<string, string | number | undefined>),
      );
    },
    async getChokepointNews(id, params) {
      return NewsFeedOut.parse(
        await get(
          `/chokepoints/${enc(id)}/news`,
          params as Record<string, string | number | undefined>,
        ),
      );
    },
  };
}
