import {
  createChokepointsClient,
  type ChokepointDetail,
  type ChokepointSummary,
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
    cache = { ok: true, items: list.items.map(toAtlas), attributionNotice: list.attribution_notice };
  } catch (e) {
    console.warn('[atlas] Chokepoints API injoignable au build :', String(e));
    cache = { ok: false, items: [] };
  }
  return cache;
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
