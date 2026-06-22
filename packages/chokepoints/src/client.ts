import { ChokepointDetail, ChokepointList, GeoJsonFeatureCollection } from './schema';

export type ChokepointsClientOptions = {
  baseUrl: string;
  token: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
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
 * PUBLIC-SAFE BY CONSTRUCTION: only the `read` scope is ever exercised — `include_tainted` is never
 * sent, so redistribution-restricted ("tainted") records stay excluded. Intended for **build-time**
 * use on a tailnet host; the Bearer token must never reach the client.
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
