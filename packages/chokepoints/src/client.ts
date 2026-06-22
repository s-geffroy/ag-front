import { ChokepointDetail, ChokepointList, GeoJsonFeatureCollection } from './schema';

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

export type ChokepointsClient = {
  listChokepoints(params?: ListParams): Promise<ChokepointList>;
  getChokepoint(id: string): Promise<ChokepointDetail>;
  exportGeoJson(): Promise<GeoJsonFeatureCollection>;
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
  ): Promise<unknown> {
    const url = new URL(base + path);
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        if (v !== undefined) url.searchParams.set(k, String(v));
      }
    }
    if (opts.includeTainted) url.searchParams.set('include_tainted', 'true');
    const res = await fetchImpl(url, {
      headers: { Authorization: `Bearer ${opts.token}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) throw new Error(`Chokepoints API ${path} → HTTP ${res.status}`);
    return res.json();
  }

  return {
    async listChokepoints(params) {
      return ChokepointList.parse(await get('/chokepoints', params));
    },
    async getChokepoint(id) {
      return ChokepointDetail.parse(await get(`/chokepoints/${encodeURIComponent(id)}`));
    },
    async exportGeoJson() {
      // Schematic geometries, clear records only (include_tainted is never sent).
      return GeoJsonFeatureCollection.parse(await get('/exports/geojson'));
    },
  };
}
