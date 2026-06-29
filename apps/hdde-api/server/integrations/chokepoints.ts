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
