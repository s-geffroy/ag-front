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
  ChokepointAnalysisList,
  ChokepointAnalysisDetail,
  HealthOut,
  FicheOut,
  SystemResilienceOut,
  StrategicFlowUnitList,
  SfuVerdictOut,
  SfuFicheOut,
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
  ChokepointAnalysisList as ChokepointAnalysisListT,
  ChokepointAnalysisDetail as ChokepointAnalysisDetailT,
  HealthOut as HealthOutT,
  FicheOut as FicheOutT,
  SystemResilienceOut as SystemResilienceOutT,
  StrategicFlowUnitList as StrategicFlowUnitListT,
  SfuVerdictOut as SfuVerdictOutT,
  SfuFicheOut as SfuFicheOutT,
} from './schema';

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
  getVocabularies(): Promise<Record<string, unknown>>;
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
  // --- 0.3.0 / 0.4.0 (additive; inert until the deployed instance bumps past 0.2.0) ---
  /** GET /analytics/system-resilience — global ENA resilience row. Throws (404) until computed. */
  getSystemResilience(): Promise<SystemResilienceOutT>;
  /** GET /strategic-flows — SFIM flow-unit list (envelope with items). */
  listStrategicFlows(): Promise<StrategicFlowUnitListT>;
  /** GET /strategic-flows/{sfuId}/verdict — SFIM decision. `null` when no verdict authored yet. */
  getStrategicFlowVerdict(sfuId: string): Promise<SfuVerdictOutT | null>;
  /** GET /strategic-flows/{sfuId}/fiche — full SFU fiche (red_team block only with read_tainted). */
  getStrategicFlowFiche(sfuId: string): Promise<SfuFicheOutT>;
};

/**
 * Every contract path this client implements, as OpenAPI-style templates (producer param names, so
 * they compare directly against the pinned `scripts/consumer/contract/openapi.json`). This is the
 * TS-side coverage ledger the Python drift-check can't see (it generates a Python client, not this
 * hand-written TS one). `contract-coverage.test.ts` asserts every pinned path appears here, so a
 * contract that gains an endpoint fails the build until a method + schema are wired — closing the
 * "front pinned to an older/narrower surface than the producer" gap (Phase 6). Entries beyond the
 * current pin (cvi-assessment, system-resilience, strategic-flows) are pre-wired ahead of the 0.4.0
 * deploy; the subset check is one-directional (pin ⊆ covered), so being ahead is fine.
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
] as const;

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
    if (!res.ok) throw new Error(`Chokepoints API ${path} → HTTP ${res.status}`);
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
    if (!res.ok) throw new Error(`Chokepoints API ${path} → HTTP ${res.status}`);
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
      return z.record(z.unknown()).parse(await get('/vocabularies'));
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
  };
}
