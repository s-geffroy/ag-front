// Chokepoints enrichment — SERVER-SIDE ONLY, READ SCOPE ONLY, never read_tainted (ADR 0035).
// The client is created with includeTainted:false, and we additionally drop any record that still
// carries license_taint=true as a defence-in-depth guard so no restricted data can reach the public
// client. Suggestions are CANDIDATES pending analyst validation, never facts.
import { createChokepointsClient } from '@ag/chokepoints';
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

export interface CorridorEvidence {
  available: boolean;
  note: string;
  actors: { name: string; actor_type?: string; control_type?: string; basis?: string }[];
  event_signals: { domain?: string; weight?: number; observed_on?: string; event_key?: string }[];
  perception: { count: number; disclaimer?: string } | null;
}

// Defence-in-depth taint drop (records may carry license_taint via passthrough).
const isTainted = (it: unknown): boolean =>
  (it as { license_taint?: boolean }).license_taint === true;

/**
 * Fetch actors + event/perception signals for ONE corridor as EVIDENCE CANDIDATES (ADR 0035:
 * read scope, never read_tainted; candidate ≠ fact). Each endpoint degrades independently — a
 * failure/404 on one yields an empty slice, never throws. NOTE: /perception-signals is a
 * read_tainted-scope surface producer-side, so on HDDE's read token it is best-effort (usually
 * empty). Returns available:false when the API is unconfigured or nothing came back.
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
    .catch(() => [] as CorridorEvidence['actors']);

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
    .catch(() => [] as CorridorEvidence['event_signals']);

  const perception = await client
    .getChokepointPerceptionSignals(chokepointId, 20)
    .then((p) => ({ count: p.count ?? p.signals.length, disclaimer: p.disclaimer ?? undefined }))
    .catch(() => null);

  const available =
    actors.length > 0 || event_signals.length > 0 || (perception?.count ?? 0) > 0;
  return {
    available,
    note: available
      ? 'Signaux & acteurs du corridor (candidats à valider) — Read API, scope read.'
      : 'Aucun signal/acteur disponible pour ce corridor (scope read).',
    actors,
    event_signals,
    perception,
  };
}
