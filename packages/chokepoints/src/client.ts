import { z } from 'zod';
import {
  ChokepointDetail,
  ChokepointList,
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
  listChokepoints(params?: ListParams): Promise<ChokepointList>;
  getChokepoint(id: string): Promise<ChokepointDetail>;
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
    async listChokepoints(params) {
      return ChokepointList.parse(await get('/chokepoints', params));
    },
    async getChokepoint(id) {
      return ChokepointDetail.parse(await get(`/chokepoints/${encodeURIComponent(id)}`));
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
      return ChokepointList.parse(await get(`/chokepoints/by-system/${enc(systemId)}`)).items;
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
  };
}
