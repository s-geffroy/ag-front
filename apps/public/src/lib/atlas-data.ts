import {
  createChokepointsClient,
  type ChokepointDetail,
  type ChokepointSummary,
  type GeoJsonFeatureCollection,
} from '@ag/chokepoints';

export type AtlasChokepoint = {
  id: string;
  name: string;
  family?: string;
  priority?: string;
  region?: string;
  attributions: string[];
};

export type ChokepointsLoad = {
  ok: boolean;
  items: AtlasChokepoint[];
  attributionNotice?: string;
};

function config(): { baseUrl: string; token: string } | null {
  const baseUrl = process.env.CHOKEPOINTS_API_URL;
  const token = process.env.CHOKEPOINTS_API_TOKEN;
  if (!baseUrl || !token) return null;
  return { baseUrl, token };
}

function toAtlas(c: ChokepointSummary): AtlasChokepoint {
  return {
    id: c.id,
    name: c.canonical_name,
    family: c.family,
    priority: c.priority_class,
    region: c.macro_region ?? undefined,
    attributions: c.required_attributions ?? [],
  };
}

let cache: ChokepointsLoad | null = null;

/**
 * Build-time load of the chokepoints list. **Degrades gracefully**: never throws — if the token is
 * missing or the API is unreachable, returns `{ ok: false, items: [] }` and the Atlas simply omits the
 * database section, so the public build always succeeds. `read` scope only (tainted excluded).
 */
export async function loadChokepoints(): Promise<ChokepointsLoad> {
  if (cache) return cache;
  const cfg = config();
  if (!cfg) {
    console.warn(
      '[atlas] Chokepoints API non configurée (CHOKEPOINTS_API_TOKEN absent) — section désactivée.',
    );
    cache = { ok: false, items: [] };
    return cache;
  }
  try {
    // The base spans hundreds of nodes (P0–P3); the public Atlas surfaces the strategic core (P0),
    // each with a detail page. Broader tiers stay a database, not hundreds of editorial pages.
    const list = await createChokepointsClient(cfg).listChokepoints({
      priority_class: 'P0',
      limit: 100,
    });
    cache = {
      ok: true,
      items: list.items.map(toAtlas),
      attributionNotice: list.attribution_notice,
    };
  } catch (e) {
    console.warn('[atlas] Chokepoints API injoignable au build :', String(e));
    cache = { ok: false, items: [] };
  }
  return cache;
}

/** Build-time GeoJSON export (schematic geometries, clear records only). Graceful: empty on failure. */
export async function loadGeoJson(): Promise<GeoJsonFeatureCollection> {
  const empty: GeoJsonFeatureCollection = { type: 'FeatureCollection', features: [] };
  const cfg = config();
  if (!cfg) return empty;
  try {
    return await createChokepointsClient(cfg).exportGeoJson();
  } catch (e) {
    console.warn('[atlas] export GeoJSON injoignable au build :', String(e));
    return empty;
  }
}

export async function loadChokepointDetail(id: string): Promise<ChokepointDetail | null> {
  const cfg = config();
  if (!cfg) return null;
  try {
    return await createChokepointsClient(cfg).getChokepoint(id);
  } catch (e) {
    console.warn(`[atlas] détail chokepoint ${id} injoignable :`, String(e));
    return null;
  }
}

// --- Strategic systems (public, conservative: canonical structure, no derived scores) ------------

export type AtlasSystem = {
  id: string;
  name: string;
  type?: string;
  priority?: string;
  memberCount?: number;
};

/** Build-time list of strategic systems (grouped corridors). Graceful: empty on failure. */
export async function loadStrategicSystems(): Promise<AtlasSystem[]> {
  const cfg = config();
  if (!cfg) return [];
  try {
    const systems = await createChokepointsClient(cfg).listStrategicSystems();
    return systems
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: s.system_type ?? undefined,
        priority: s.priority_class ?? undefined,
        memberCount: s.member_count ?? undefined,
      }))
      .sort((a, b) => (b.memberCount ?? 0) - (a.memberCount ?? 0) || a.name.localeCompare(b.name));
  } catch (e) {
    console.warn('[atlas] systèmes stratégiques injoignables :', String(e));
    return [];
  }
}

/** A system + its member corridors (via /chokepoints/by-system). Graceful: null on failure. */
export async function loadStrategicSystem(
  id: string,
): Promise<{ system: AtlasSystem; members: AtlasChokepoint[] } | null> {
  const cfg = config();
  if (!cfg) return null;
  try {
    const client = createChokepointsClient(cfg);
    const [detail, members] = await Promise.all([
      client.getStrategicSystem(id),
      client.chokepointsBySystem(id).catch(() => [] as ChokepointSummary[]),
    ]);
    return {
      system: {
        id: detail.id,
        name: detail.name,
        type: detail.system_type ?? undefined,
        priority: detail.priority_class ?? undefined,
        memberCount: members.length,
      },
      members: members.map(toAtlas),
    };
  } catch (e) {
    console.warn(`[atlas] système ${id} injoignable :`, String(e));
    return null;
  }
}

// --- Browse by risk (public: canonical risk tags only, curated headline set, no impact scores) ----

/** Headline public risk types. Curated (not the full ~130-entry vocab) to keep the public page focused. */
const PUBLIC_RISK_TYPES = [
  'blockade',
  'sanctions',
  'piracy',
  'war_spillover',
  'cyber_attack',
  'regional_conflict',
  'closure',
  'geopolitical_risk',
] as const;

export type RiskBrowse = { risk: string; corridors: { id: string; name: string }[] };

/** For each curated risk type, the corridors tagged with it. Skips unknown/empty types. Graceful. */
export async function loadCorridorsByRisk(): Promise<RiskBrowse[]> {
  const cfg = config();
  if (!cfg) return [];
  const client = createChokepointsClient(cfg);
  const out: RiskBrowse[] = [];
  for (const risk of PUBLIC_RISK_TYPES) {
    try {
      const rows = await client.chokepointsByRisk(risk);
      if (rows.length) {
        out.push({ risk, corridors: rows.map((r) => ({ id: r.id, name: r.canonical_name })) });
      }
    } catch {
      /* a risk type the API doesn't know → skip */
    }
  }
  return out;
}
