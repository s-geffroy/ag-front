import {
  createChokepointsClient,
  type ChokepointDetail,
  type ChokepointSummary,
  type GeoJsonFeatureCollection,
} from '@ag/chokepoints';
import { PromotedNewsItem, type PromotedNewsItem as PromotedNewsItemT } from '@ag/schema/content';
import promotedNewsRaw from '../data/promoted-news.json';

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

// --- Derived Polymarket consensus (public, live-ish; ADR 0071) ------------------------------------

/** One signal-family consensus row, public-safe view (no raw market question/odds/action). */
export type AtlasConsensusFamily = {
  signalFamily: string;
  /** Liquidity-weighted consensus probability, 0..1. */
  probability: number;
  /** Max 24 h probability move across the family's markets (points, 0..1), when present. */
  change24h?: number;
  marketCount?: number;
  totalLiquidity?: number;
};

export type AtlasConsensus = {
  families: AtlasConsensusFamily[];
  /** ISO timestamp of the consensus window end, for an honest "consensus au <date>" label. */
  observedAt?: string;
};

/**
 * Mandatory attribution carried WITH the aggregate (ag-back 0018 §1: « attribution Polymarket
 * obligatoire (pas optionnelle) »). `polymarket_gamma` is `cleared_with_attribution` in their
 * clearance ledger — the clearance IS the attribution; dropping the credit voids it.
 */
export const CONSENSUS_ATTRIBUTION = {
  source: 'Polymarket',
  url: 'https://polymarket.com',
  text:
    'Source : Polymarket (marchés de prédiction). Agrégat dérivé, pondéré par la liquidité et ' +
    'regroupé par famille de signal — aucun marché individuel, aucune cote brute, aucune action ' +
    'proposée. Redistribué avec attribution obligatoire.',
} as const;

/**
 * S5 / low-reliability disclaimer required alongside the attribution (ag-back 0018 §1). S5 is our
 * internal source scale's press/private-firm rung — a crowd anticipation is never event evidence
 * (ADR 0042 caps media-grade signal at attention, and this is weaker still).
 */
export const CONSENSUS_RELIABILITY = {
  grade: 'S5',
  label: 'Fiabilité S5',
  text:
    'Fiabilité S5 (faible) : anticipation de la foule sur un marché de paris, ni une preuve ' +
    "d'événement ni un conseil. Candidat en attente de validation humaine.",
} as const;

/**
 * Build-time load of the derived Polymarket consensus for one corridor, from the dedicated
 * `/chokepoints/{id}/prediction-consensus` endpoint (API 0.15.0, clear `read` scope) — never from the
 * wide `/analysis` payload. **Graceful**: returns `null` when the API is unconfigured/unreachable OR
 * the producer reports no market coverage, so the page omits the block rather than showing a hole.
 *
 * **An empty `consensus` is an answer, not a failure.** ag-back applies the ADR 0079 attachment floor
 * server-side (0.13.0): only objects a market names or implies carry rows, everything else answers
 * `200` with `[]`. We render nothing in that case — no zero, no flat line, no "aucune donnée" that a
 * reader could mistake for calm. Coverage is theirs to decide; ours is only to not misreport it.
 */
export async function loadCorridorConsensus(id: string): Promise<AtlasConsensus | null> {
  // Go-live gate (ADR 0071): both owners have now cleared public redistribution (their ADR 0083; ours
  // 2026-07-26), so this flag is the last switch — the block is dark until `ATLAS_CONSENSUS_PUBLIC=1`
  // is set for the public build. Flip the env, rebuild, and it appears. Reversible by unsetting it.
  if (process.env.ATLAS_CONSENSUS_PUBLIC !== '1') return null;
  const cfg = config();
  if (!cfg) return null;
  try {
    const { consensus: rows } =
      await createChokepointsClient(cfg).getChokepointPredictionConsensus(id);
    const families: AtlasConsensusFamily[] = rows
      .filter(
        (r) =>
          typeof r.signal_family === 'string' &&
          r.signal_family.length > 0 &&
          typeof r.consensus_probability === 'number' &&
          Number.isFinite(r.consensus_probability),
      )
      .map((r) => ({
        signalFamily: r.signal_family as string,
        probability: r.consensus_probability as number,
        change24h:
          typeof r.max_probability_change_24h === 'number' &&
          Number.isFinite(r.max_probability_change_24h)
            ? r.max_probability_change_24h
            : undefined,
        marketCount: typeof r.market_count === 'number' ? r.market_count : undefined,
        totalLiquidity: typeof r.total_liquidity === 'number' ? r.total_liquidity : undefined,
      }));
    if (families.length === 0) return null;
    const observedAt = rows
      .map((r) => r.observed_window_end)
      .find((s): s is string => typeof s === 'string' && s.length > 0);
    return { families, observedAt: observedAt ?? undefined };
  } catch (e) {
    console.warn(`[atlas] consensus ${id} injoignable :`, String(e));
    return null;
  }
}

// --- Promoted media coverage (public, human-promoted; ADR 0071) -----------------------------------

/**
 * Human-promoted news clusters for one corridor, from the repo-committed store
 * `src/data/promoted-news.json` (written by the cockpit under gates + journal). No API, no token — works
 * even when the chokepoints API is unconfigured. Parses PER ITEM so one malformed entry drops to nothing
 * instead of nuking the corridor's whole list, and enforces `taint_class === 'cleared_only'` as
 * defence-in-depth (the writer already refuses anything else).
 */
export function loadCorridorPromotedNews(id: string): PromotedNewsItemT[] {
  const bucket = (promotedNewsRaw as Record<string, unknown>)[id];
  if (!Array.isArray(bucket)) return [];
  return bucket
    .map((x) => PromotedNewsItem.safeParse(x))
    .flatMap((r) => (r.success ? [r.data] : []))
    .filter((it) => it.taint_class === 'cleared_only');
}

// --- Strategic systems (public, conservative: canonical structure, no derived scores) ------------

export type AtlasSystem = {
  id: string;
  name: string;
  type?: string;
  priority?: string;
  memberCount?: number;
};

/**
 * The set of chokepoint ids that actually have a generated detail page (`/atlas/chokepoints/[id]`).
 * Only P0 corridors get editorial pages (see `loadChokepoints`), so system/risk browse pages must
 * link ONLY these ids and render the rest as plain text — otherwise P1–P3 corridors would 404.
 */
export async function loadChokepointPageIds(): Promise<Set<string>> {
  return new Set((await loadChokepoints()).items.map((c) => c.id));
}

let systemsCache: AtlasSystem[] | null = null;

/** Build-time list of strategic systems (grouped corridors). Graceful: empty on failure. Memoized. */
export async function loadStrategicSystems(): Promise<AtlasSystem[]> {
  if (systemsCache) return systemsCache;
  const cfg = config();
  if (!cfg) return [];
  try {
    const systems = await createChokepointsClient(cfg).listStrategicSystems();
    systemsCache = systems
      .map((s) => ({
        id: s.id,
        name: s.name,
        type: s.system_type ?? undefined,
        priority: s.priority_class ?? undefined,
        memberCount: s.member_count ?? undefined,
      }))
      .sort((a, b) => (b.memberCount ?? 0) - (a.memberCount ?? 0) || a.name.localeCompare(b.name));
    return systemsCache;
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
    // Defence-in-depth: drop any restricted record even though the read-scope client is clear-only.
    const clear = members.filter((m) => !m.license_taint);
    return {
      system: {
        id: detail.id,
        name: detail.name,
        type: detail.system_type ?? undefined,
        priority: detail.priority_class ?? undefined,
        memberCount: clear.length,
      },
      members: clear.map(toAtlas),
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
  // Fan out the per-risk lookups concurrently (bounded by PUBLIC_RISK_TYPES), so a slow API adds one
  // round-trip to the build, not N sequential ones. Each risk fails independently → [].
  const groups = await Promise.all(
    PUBLIC_RISK_TYPES.map(async (risk): Promise<RiskBrowse | null> => {
      try {
        const rows = await client.chokepointsByRisk(risk);
        // Defence-in-depth taint drop (read-scope client is clear-only, but never trust the wire).
        const corridors = rows
          .filter((r) => !r.license_taint)
          .map((r) => ({ id: r.id, name: r.canonical_name }));
        return corridors.length ? { risk, corridors } : null;
      } catch {
        return null; // a risk type the API doesn't know → skip
      }
    }),
  );
  return groups.filter((g): g is RiskBrowse => g !== null);
}
