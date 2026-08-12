import {
  createChokepointsClient,
  consensusFloorDisagreement,
  consensusRowIsPublishable,
  consensusRowMeetsCardinalityFloor,
  isFixtureRecord,
  PUBLISHABLE_MIN_MARKET_COUNT,
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
      // Producer fixtures (e.g. `cp_alpha` / "Alpha Strait") are dropped here rather than in the page
      // template: this is the single list every Atlas surface derives from — detail pages, the index,
      // `loadChokepointPageIds`, the sitemap — so filtering once covers all of them.
      items: list.items.filter((c) => !isFixtureRecord(c.id)).map(toAtlas),
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
  // Defence in depth: no page should ask for a fixture (getStaticPaths already excludes them), but a
  // direct caller must not be able to resurrect one.
  if (isFixtureRecord(id)) return null;
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
 * The corridor allowlist is GONE — ag-back's handoff `0026` §3 lifted condition 2 in writing.
 *
 * It existed because their `0018` §1 said « ne publie que Panama et Suez », and the reason was
 * precise: pre-floor attachment noise, 12 % precision. That reason has since disappeared twice — the
 * engine filters `attachment_rule = 'named_or_implied'`, and word boundaries (their ADR 0084) emptied
 * the residue underneath. They deliberately refused to hand us a replacement named list, on the
 * grounds that a perimeter living in two places is the defect we reported to them: ours had decayed
 * into a comment citing a constant nobody had written, and it only held for twelve days because their
 * data happened to be empty.
 *
 * So the perimeter is now the FLOORS, which are code and are tested — on both sides:
 *
 *   - attachment  — `consensusRowIsPublishable`, refuses anything but `named_or_implied`;
 *   - cardinality — `consensusRowMeetsCardinalityFloor`, N ≥ 2, fail-closed on absence;
 *   - family      — `CONSENSUS_FAMILY_LABELS` below, a CLOSED list. This one is entirely ours, and it
 *                   is what holds `perception_watch`; their floor only caught it by accident of its
 *                   cardinality, as they say themselves.
 *
 * What has NOT changed and is not implied by this: `llm_implied` counts zero rows in all their tables,
 * the attachment judge (their ADR 0086) is out of service, and they committed to a message on this
 * channel before anything of the sort enters the clear aggregate. Lifting the perimeter does not lift
 * that commitment — and `consensusRowIsPublishable` is what makes it unnecessary rather than
 * load-bearing.
 */

/**
 * The families we are willing to publish, and their French labels — a CLOSED list, consumed by
 * `ConsensusBlock.astro`.
 *
 * Closed on purpose: a family with no label is a family whose presentation we have not decided, and
 * `humanize()` would happily ship it anyway. That is not hypothetical — Hormuz currently serves
 * `perception_watch` at 72,5 %, which would have read "Perception watch" on a public page.
 */
export const CONSENSUS_FAMILY_LABELS: Record<string, string> = {
  infrastructure_capacity_expectation: "Capacité d'infrastructure",
  disruption_expectation: 'Perturbation du trafic',
  conflict_escalation_expectation: 'Escalade du conflit',
  regime_change_expectation: 'Changement de régime',
};

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
 *
 * **And we check the floor rather than assume it.** Since 0.16.0 every row states the attachment rules
 * it was actually summed under, so `consensusRowIsPublishable` drops anything that is not
 * `named_or_implied` before a number can reach a page. ag-back committed to warning us before widening
 * that aggregate (handoff 0022 §4); this filter is what makes the commitment unnecessary rather than
 * load-bearing. `consensusRowMeetsCardinalityFloor` applies the same doctrine to cardinality (ADR
 * 0072): we asked them for a server-side floor and we still check it here, because a threshold we only
 * assume is a threshold we cannot demonstrate.
 */
export async function loadCorridorConsensus(id: string): Promise<AtlasConsensus | null> {
  // Go-live gate (ADR 0071): both owners have now cleared public redistribution (their ADR 0083; ours
  // 2026-07-26), so this flag is the last switch — the block is dark until `ATLAS_CONSENSUS_PUBLIC=1`
  // is set for the public build. Flip the env, rebuild, and it appears. Reversible by unsetting it.
  if (process.env.ATLAS_CONSENSUS_PUBLIC !== '1') return null;
  const cfg = config();
  if (!cfg) return null;
  try {
    const payload = await createChokepointsClient(cfg).getChokepointPredictionConsensus(id);
    const { consensus: all } = payload;

    // Contract 0.18.0 states the floor the producer applied. We check it against ours rather than
    // trust it: the rows are filtered below either way, so this cannot change what is published — it
    // only decides whether we are still able to SAY the two floors agree. A disagreement is a handoff.
    const weaker = consensusFloorDisagreement(payload);
    if (weaker !== null) {
      console.warn(
        `[atlas] ${id} : plancher serveur ${weaker} < notre plancher ${PUBLISHABLE_MIN_MARKET_COUNT} — ` +
          `notre filtre tient, mais les deux planchers ont divergé : à signaler à ag-back.`,
      );
    }
    // Fail-closed FIRST, on both floors: everything downstream — the families, and the "observé le"
    // stamp — must describe only rows we are willing to publish. Order matters for the stamp: a row
    // dropped here must not be able to date the block.
    const rows = all
      .filter(consensusRowIsPublishable)
      .filter(consensusRowMeetsCardinalityFloor)
      .filter(
        (r) =>
          typeof r.signal_family === 'string' &&
          r.signal_family in CONSENSUS_FAMILY_LABELS &&
          typeof r.consensus_probability === 'number' &&
          Number.isFinite(r.consensus_probability),
      );
    const families: AtlasConsensusFamily[] = rows.map((r) => ({
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
    // The OLDEST window among the rows we publish. "Consensus au <date>" must never promise more
    // freshness than the stalest number under it — ag-back serves rows of different ages in one
    // response (Suez, 2026-08-10: one row at 08-10, one at 08-01).
    const observedAt = rows
      .map((r) => r.observed_window_end)
      .filter((s): s is string => typeof s === 'string' && s.length > 0)
      .reduce<string | undefined>((oldest, s) => {
        if (!oldest) return s;
        const a = Date.parse(s);
        const b = Date.parse(oldest);
        if (Number.isNaN(a)) return oldest;
        if (Number.isNaN(b)) return s;
        return a < b ? s : oldest;
      }, undefined);
    return { families, observedAt };
  } catch (e) {
    console.warn(`[atlas] consensus ${id} injoignable :`, String(e));
    return null;
  }
}

// --- Promoted media coverage (public, human-promoted; ADR 0071) -----------------------------------
/**
 * Fraîcheur de la couverture média d'un corridor, pour les pages qui LISTENT des corridors.
 *
 * `null` veut dire « rien à signaler », jamais « corridor calme ». Le seuil est celui de la page
 * /veille — 21 jours — pour la même raison : une date de mars affichée sur une carte se lit encore
 * comme un signal actif, et un signal qui ne s'éteint jamais cesse d'en être un.
 */
export const NEWS_SIGNAL_MAX_AGE_DAYS = 21;

export function corridorNewsSignal(
  id: string,
  now: Date = new Date(),
): { promotedAt: string } | null {
  const items = loadCorridorPromotedNews(id);
  if (items.length === 0) return null;
  const latest = items
    .map((it) => it.promoted_at)
    .filter((d): d is string => typeof d === 'string' && d.length > 0)
    .sort()
    .at(-1);
  if (!latest) return null;
  const age = (now.getTime() - new Date(latest).getTime()) / 86_400_000;
  if (!Number.isFinite(age) || age > NEWS_SIGNAL_MAX_AGE_DAYS) return null;
  return { promotedAt: latest };
}

/**
 * Pression déclarée par la base pour chaque corridor (`regime.pressure_score` de la fiche).
 *
 * POURQUOI CE CHAMP ET PAS UN AUTRE. Les deux critères d'importance attendus sont inertes ici :
 * `/atlas` n'affiche que des P0, donc `priority_class` ne départage rien ; et le CVI est saturé à
 * `critique` sur tout le corpus (handoff ag-back 0026, sans réponse). La pression est le seul signal
 * ordinal que la base porte — mesuré le 2026-08-12 : Ormuz 263.8, Suez 59.9, Panama 8.3.
 *
 * ELLE N'EST DÉCLARÉE QUE POUR UN TIERS DES CORRIDORS (10 sur 30). Les autres reçoivent `null`, et
 * `null` ne vaut PAS zéro : un corridor sans mesure n'est pas un corridor sous faible pression, il
 * est un corridor qu'on n'a pas mesuré (ADR 0077). Le classement les traite à part au lieu de les
 * enterrer sous un score qu'ils n'ont pas.
 */
let pressureCache: Map<string, number | null> | null = null;

export async function loadCorridorPressure(
  ids: readonly string[],
): Promise<Map<string, number | null>> {
  if (pressureCache) return pressureCache;
  const out = new Map<string, number | null>();
  const cfg = config();
  if (!cfg) {
    for (const id of ids) out.set(id, null);
    pressureCache = out;
    return out;
  }
  const client = createChokepointsClient(cfg);
  await Promise.all(
    ids.map(async (id) => {
      try {
        const fiche = (await client.getChokepointFiche(id)) as {
          regime?: { pressure_score?: number | null };
        };
        const v = fiche.regime?.pressure_score;
        out.set(id, typeof v === 'number' ? v : null);
      } catch (err) {
        // Une fiche injoignable donne `null`, pas 0 : l'échec réseau ne doit pas se lire comme une
        // mesure basse.
        console.warn(`[atlas] pression indisponible pour ${id} :`, (err as Error).message);
        out.set(id, null);
      }
    }),
  );
  pressureCache = out;
  return out;
}

/**
 * Classe les corridors : ceux qui portent une actualité récente d'abord, la plus fraîche en tête,
 * puis les autres dans l'ordre habituel (priorité, puis nom).
 *
 * POURQUOI L'ACTUALITÉ NE REMPLACE PAS LA PRIORITÉ, ELLE LA PRÉCÈDE. Trier tout le tableau par date
 * ferait remonter un P2 promu hier au-dessus d'un P0 jamais promu — or l'absence de promotion ne
 * veut pas dire « rien ne s'y passe », seulement « personne n'a promu » (ADR 0077). Les corridors
 * sans actualité gardent donc exactement l'ordre qu'ils avaient : on ajoute une tête de liste, on ne
 * réorganise pas le reste.
 */
export function sortCorridorsByNews<
  T extends { id: string; priority?: string | null; name: string },
>(
  items: readonly T[],
  now: Date = new Date(),
  pressure: ReadonlyMap<string, number | null> = new Map(),
): T[] {
  const signal = new Map<string, string>();
  for (const c of items) {
    const s = corridorNewsSignal(c.id, now);
    if (s) signal.set(c.id, s.promotedAt);
  }
  return items.slice().sort((a, b) => {
    // 1. Âge de l'actualité — la plus fraîche en tête.
    const da = signal.get(a.id);
    const db = signal.get(b.id);
    if (da && db) return db.localeCompare(da);
    if (da) return -1;
    if (db) return 1;
    // 2. Pression déclarée, décroissante. Un corridor SANS mesure ne passe pas derrière un corridor
    //    mesuré à 0 : il passe derrière tous les mesurés, parce qu'on ne sait pas où le placer —
    //    et on le dit au lecteur plutôt que de lui vendre un rang.
    const pa = pressure.get(a.id);
    const pb = pressure.get(b.id);
    const ma = typeof pa === 'number';
    const mb = typeof pb === 'number';
    if (ma && mb && pa !== pb) return (pb as number) - (pa as number);
    if (ma !== mb) return ma ? -1 : 1;
    // 2 bis. La classe de priorité. Inerte sur /atlas, qui n'affiche que des P0 — gardée quand même :
    //        elle est le critère d'importance canonique, et la page pourrait un jour élargir sa
    //        requête. La retirer aurait été supprimer une règle juste parce que ses données le sont.
    const prio = (a.priority ?? 'P9').localeCompare(b.priority ?? 'P9');
    if (prio !== 0) return prio;
    // 3. Ordre alphabétique.
    return a.name.localeCompare(b.name);
  });
}

/** « 11 août ». Le jour et le mois suffisent : l'année n'apporte rien sous 21 jours. */
export function newsSignalLabel(promotedAt: string): string {
  const d = new Date(promotedAt);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' });
}

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
