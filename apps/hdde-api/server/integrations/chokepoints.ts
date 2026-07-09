// Chokepoints enrichment — SERVER-SIDE ONLY, READ SCOPE ONLY, never read_tainted (ADR 0035).
// The client is created with includeTainted:false, and we additionally drop any record that still
// carries license_taint=true as a defence-in-depth guard so no restricted data can reach the public
// client. Suggestions are CANDIDATES pending analyst validation, never facts.
import { createChokepointsClient, ChokepointsApiError } from '@ag/chokepoints';
import type { PacketPayload } from '@ag/schema/hdde';
import { config } from '../config';

export interface ChokepointSuggestion {
  id: string;
  canonical_name: string;
  family?: string;
  priority_class?: string;
  macro_region?: string | null;
}

export interface ChokepointEnrichment {
  available: boolean;
  note: string;
  candidates: ChokepointSuggestion[];
}

// Best-effort mapping from an HDDE critical-flow type to a representative chokepoints flow_type
// (controlled vocabulary, contract V2). Drives GET /chokepoints/by-flow/{flow_type}; on a vocabulary
// miss (404) we fall back to the most strategic (P0) chokepoints so enrichment never comes back empty.
const FLOW_TO_CP_FLOW: Record<string, string> = {
  energy: 'crude_oil',
  goods: 'containers',
  transport: 'container_shipping',
  data: 'submarine_data',
};

interface RawSummary {
  id: string;
  canonical_name: string;
  family?: string;
  priority_class?: string;
  macro_region?: string | null;
  license_taint?: boolean;
}

// Defence-in-depth: never surface a redistribution-restricted record, whatever the API returns.
const toCandidates = (items: RawSummary[]): ChokepointSuggestion[] =>
  items
    .filter((it) => it.license_taint !== true)
    .map((it) => ({
      id: it.id,
      canonical_name: it.canonical_name,
      family: it.family,
      priority_class: it.priority_class,
      macro_region: it.macro_region ?? null,
    }));

export async function suggestChokepoints(
  flowType?: string,
  macroRegion?: string,
): Promise<ChokepointEnrichment> {
  if (!config.chokepointsApiUrl || !config.chokepointsApiToken) {
    return { available: false, note: 'Chokepoints API non configurée.', candidates: [] };
  }
  // includeTainted intentionally omitted → false. Read scope token only (ADR 0035).
  const client = createChokepointsClient({
    baseUrl: config.chokepointsApiUrl,
    token: config.chokepointsApiToken,
  });

  // 1) Flow-specific via the V2 by-flow endpoint when we have a confident vocabulary mapping.
  const cpFlow = flowType ? FLOW_TO_CP_FLOW[flowType.toLowerCase()] : undefined;
  if (cpFlow) {
    try {
      const byFlow = await client.chokepointsByFlow(cpFlow);
      if (byFlow.length) {
        return {
          available: true,
          note: `Candidats chokepoints (à valider) — flux « ${cpFlow} », endpoint by-flow (scope read).`,
          candidates: toCandidates(byFlow as RawSummary[]).slice(0, 8),
        };
      }
    } catch {
      // 404 (flow not in vocabulary) or transient → fall through to the strategic baseline.
    }
  }

  // 2) Baseline: the most strategic (P0) chokepoints, optionally scoped by region.
  try {
    const list = await client.listChokepoints({
      priority_class: 'P0',
      macro_region: macroRegion,
      limit: 8,
    });
    return {
      available: true,
      note: 'Candidats chokepoints stratégiques P0 (à valider) — Read API, scope read public.',
      candidates: toCandidates(list.items as RawSummary[]),
    };
  } catch (e) {
    return {
      available: false,
      note: `Enrichissement indisponible: ${(e as Error).message}`,
      candidates: [],
    };
  }
}

// --- Per-corridor evidence (actors + signals) for the interview -----------------------------------

/** Liquidity-weighted crowd anticipation per signal family. ANTICIPATION, never event evidence. */
export interface PerceptionFamily {
  signal_family?: string;
  market_count?: number;
  consensus_probability?: number;
  total_liquidity?: number;
}

export interface CorridorEvidence {
  available: boolean;
  note: string;
  actors: { name: string; actor_type?: string; control_type?: string; basis?: string }[];
  event_signals: { domain?: string; weight?: number; observed_on?: string; event_key?: string }[];
  perception: { count: number; families: PerceptionFamily[]; disclaimer?: string } | null;
}

// Defence-in-depth taint drop (records may carry license_taint via passthrough).
const isTainted = (it: unknown): boolean =>
  (it as { license_taint?: boolean }).license_taint === true;

/**
 * Degrade a per-endpoint failure to `fallback`, but only when the failure is BENIGN.
 *
 * A 404 means the record or route is absent — expected, and an empty slice is the honest answer.
 * Anything else (403 wrong scope, 5xx, network) is a defect: it must be logged loudly rather than
 * disguised as "no data". Blanket `.catch(() => [])` is exactly how HDDE's `/perception-signals`
 * call sat at a permanent 403 while the UI reported "no perception signals for this corridor".
 */
function degrade<T>(label: string, fallback: T): (err: unknown) => T {
  return (err: unknown) => {
    const status = err instanceof ChokepointsApiError ? err.status : 0;
    if (status !== 404) {
      console.error(
        `[hdde] chokepoints ${label} failed (${status || 'network'}) — degrading to empty. ` +
          `This is NOT an empty dataset; it is a failure.`,
        err,
      );
    }
    return fallback;
  };
}

/**
 * Fetch actors + event/perception signals for ONE corridor as EVIDENCE CANDIDATES (ADR 0035:
 * read scope, never read_tainted; candidate ≠ fact). Each endpoint degrades independently, but only
 * a 404 degrades silently — see `degrade()`. Returns available:false when the API is unconfigured.
 *
 * PERCEPTION: we do NOT call `/perception-signals`. The producer gates that route unconditionally on
 * the `read_tainted` scope (its Polymarket source is uncleared), so HDDE's `read` token always got a
 * 403 — which the previous `.catch(() => null)` reported as "no perception signals". Granting HDDE a
 * tainted token is forbidden (ADR 0013/0035: HDDE is on the public Internet behind app auth).
 *
 * Instead we read the DERIVED `prediction_consensus` block of `/analysis`, which the producer serves
 * under plain `read`: the raw uncleared observations stay restricted, while their liquidity-weighted
 * consensus — the part that is actually decision-relevant — is cleared for redistribution.
 */
export async function fetchCorridorEvidence(chokepointId: string): Promise<CorridorEvidence> {
  const empty: CorridorEvidence = {
    available: false,
    note: 'Chokepoints API non configurée.',
    actors: [],
    event_signals: [],
    perception: null,
  };
  if (!config.chokepointsApiUrl || !config.chokepointsApiToken) return empty;
  const client = createChokepointsClient({
    baseUrl: config.chokepointsApiUrl,
    token: config.chokepointsApiToken,
  });

  const actors = await client
    .getChokepointActors(chokepointId)
    .then((rows) =>
      rows
        .filter((r) => !isTainted(r))
        .map((r) => ({
          name: r.actor_name ?? r.actor_id,
          actor_type: r.actor_type ?? undefined,
          control_type: r.control_type ?? undefined,
          basis: r.basis ?? undefined,
        })),
    )
    .catch(degrade('actors', [] as CorridorEvidence['actors']));

  const event_signals = await client
    .getChokepointEventSignals(chokepointId, 20)
    .then((rows) =>
      rows
        .filter((r) => !isTainted(r))
        .map((r) => ({
          domain: r.domain ?? undefined,
          weight: typeof r.weight === 'number' ? r.weight : undefined,
          observed_on: r.observed_on ?? undefined,
          event_key: r.event_key ?? undefined,
        })),
    )
    .catch(degrade('event-signals', [] as CorridorEvidence['event_signals']));

  const perception = await client
    .getChokepointAnalysis(chokepointId)
    .then((a) => {
      const block = a.engines.find((e) => e.key === 'prediction_consensus');
      if (!block?.rows.length) return null;
      const families = (block.rows as PerceptionFamily[]).map((r) => ({
        signal_family: r.signal_family,
        market_count: r.market_count,
        consensus_probability: r.consensus_probability,
        total_liquidity: r.total_liquidity,
      }));
      return { count: families.length, families, disclaimer: a.disclaimer ?? undefined };
    })
    .catch(degrade('analysis/prediction_consensus', null));

  const available =
    actors.length > 0 || event_signals.length > 0 || (perception?.count ?? 0) > 0;
  return {
    available,
    note: available
      ? 'Signaux & acteurs du corridor (candidats à valider) — Read API, scope read. ' +
        'Perception = consensus dérivé des marchés de prédiction (anticipation, pas une preuve).'
      : 'Aucun signal/acteur disponible pour ce corridor (scope read).',
    actors,
    event_signals,
    perception,
  };
}

// --- Per-corridor decision context (episodes + analytics) for the VERDICT packet ------------------

export interface CorridorContext {
  available: boolean;
  episodes: { key: string; name: string; started_on?: string; ended_on?: string }[];
  analytics: { result_type?: string; score?: number; confidence?: string; summary?: string }[];
}

/**
 * Fetch disruption-precedent episodes and derived analytics for ONE corridor, to carry in the HDDE
 * diagnostic packet (ADR 0042: VERDICT never calls the Read API directly). Read scope, candidate ≠
 * fact (ADR 0027/0035). Episodes are matched via /episodes + /episodes/{key} membership; analytics
 * via /analytics/results?object_id=. Tainted members/records dropped; every branch degrades to empty.
 */
export async function fetchCorridorContext(chokepointId: string): Promise<CorridorContext> {
  const empty: CorridorContext = { available: false, episodes: [], analytics: [] };
  if (!config.chokepointsApiUrl || !config.chokepointsApiToken) return empty;
  const client = createChokepointsClient({
    baseUrl: config.chokepointsApiUrl,
    token: config.chokepointsApiToken,
  });

  const analytics = await client
    .listAnalyticsResults({ object_id: chokepointId, limit: 20 })
    .then((rows) =>
      rows
        .filter((r) => !isTainted(r))
        .map((r) => ({
          result_type: r.result_type ?? undefined,
          score: typeof r.score === 'number' ? r.score : undefined,
          confidence: typeof r.confidence === 'string' ? r.confidence : undefined,
          summary: (r as { result_summary?: string }).result_summary ?? undefined,
        })),
    )
    .catch(degrade('analytics/results', [] as CorridorContext['analytics']));

  // Bound the per-episode detail fan-out: /episodes has no corridor filter, so we must getEpisode()
  // each to read membership. Cap the lookups and LOG if we truncate, so a silently-dropped precedent
  // is at least visible in the logs rather than vanishing.
  const MAX_EPISODE_LOOKUPS = 100;
  const episodes = await client
    .listEpisodes()
    .then(async (all) => {
      if (all.length > MAX_EPISODE_LOOKUPS) {
        console.warn(
          `[hdde] fetchCorridorContext: ${all.length} episodes > cap ${MAX_EPISODE_LOOKUPS}; ` +
            `truncating membership scan for ${chokepointId} (some precedents may be omitted).`,
        );
      }
      const details = await Promise.all(
        all
          .slice(0, MAX_EPISODE_LOOKUPS)
          .map((e) => client.getEpisode(e.episode_key).catch(degrade(`episode ${e.episode_key}`, null))),
      );
      return details
        .filter((d): d is NonNullable<typeof d> => d !== null)
        .filter((d) =>
          d.members.some((m) => m.chokepoint_id === chokepointId && m.license_taint !== true),
        )
        .map((d) => ({
          key: d.episode_key,
          name: d.name,
          started_on: d.started_on ?? undefined,
          ended_on: d.ended_on ?? undefined,
        }));
    })
    .catch(degrade('episodes', [] as CorridorContext['episodes']));

  return { available: episodes.length > 0 || analytics.length > 0, episodes, analytics };
}

// --- Derived systemic context for the VERDICT packet (ADR 0042/0057/0065) --------------------------

export type CorridorAnalysis = NonNullable<PacketPayload['corridor_analysis']>;
export type CorridorRelations = NonNullable<PacketPayload['corridor_relations']>;
export type SystemResilience = NonNullable<PacketPayload['system_resilience']>;

function client() {
  if (!config.chokepointsApiUrl || !config.chokepointsApiToken) return null;
  // includeTainted intentionally omitted → false. Read scope only (ADR 0035).
  return createChokepointsClient({
    baseUrl: config.chokepointsApiUrl,
    token: config.chokepointsApiToken,
  });
}

/**
 * Typed engine outputs for ONE corridor. Relayed verbatim (`columns[]` + `rows[]`): the producer owns
 * these shapes and adds engines over time, so freezing 11 bespoke schemas here would rot on contact.
 */
export async function fetchCorridorAnalysis(chokepointId: string): Promise<CorridorAnalysis | null> {
  const c = client();
  if (!c) return null;
  return c
    .getChokepointAnalysis(chokepointId)
    .then((a) => ({
      disclaimer: a.disclaimer ?? undefined,
      engines: a.engines.map((e) => ({
        key: e.key,
        title: e.title ?? undefined,
        columns: e.columns,
        rows: e.rows as Record<string, unknown>[],
      })),
    }))
    .catch(degrade('analysis', null));
}

/** Candidate systemic edges OUT of this corridor. Never canonical — distinct from /relations. */
export async function fetchDerivedRelations(chokepointId: string): Promise<CorridorRelations | null> {
  const c = client();
  if (!c) return null;
  return c
    .listDerivedRelations({ from_object_id: chokepointId, limit: 50 })
    .then((g) =>
      g.items.length
        ? {
            disclaimer: g.disclaimer ?? undefined,
            edges: g.items.map((e) => ({
              to: e.to,
              to_label: e.to_label ?? undefined,
              to_status: e.to_status,
              relation_type: e.relation_type,
              strength_score: e.strength_score ?? undefined,
            })),
          }
        : null,
    )
    .catch(degrade('derived/relations', null));
}

/**
 * The ONE global ENA resilience row — it describes the whole graph, not a corridor, so it is fetched
 * once per process rather than once per case. 404 until the engine has run on a non-degenerate graph.
 */
let resilienceCache: { at: number; value: SystemResilience | null } | undefined;
const RESILIENCE_TTL_MS = 10 * 60 * 1000;

export async function fetchSystemResilience(): Promise<SystemResilience | null> {
  const c = client();
  if (!c) return null;
  const now = Date.now();
  if (resilienceCache && now - resilienceCache.at < RESILIENCE_TTL_MS) return resilienceCache.value;

  const value = await c
    .getSystemResilience()
    .then((r) => ({
      scope: r.scope,
      regime: r.regime ?? undefined,
      robustness: r.robustness ?? undefined,
      ascendency: r.ascendency ?? undefined,
      alpha: r.alpha ?? undefined,
      node_count: r.node_count ?? undefined,
      edge_count: r.edge_count ?? undefined,
      disclaimer: r.disclaimer ?? undefined,
    }))
    .catch(degrade('analytics/system-resilience', null));

  resilienceCache = { at: now, value };
  return value;
}
