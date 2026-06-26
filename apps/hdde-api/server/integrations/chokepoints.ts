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

// Coarse mapping from an HDDE critical-flow type to a chokepoints `family` filter. Best-effort only.
const FLOW_TO_FAMILY: Record<string, string | undefined> = {
  transport: 'maritime',
  goods: 'maritime',
  energy: 'energy',
  data: 'digital',
};

export async function suggestChokepoints(
  flowType?: string,
  macroRegion?: string,
): Promise<ChokepointEnrichment> {
  if (!config.chokepointsApiUrl || !config.chokepointsApiToken) {
    return { available: false, note: 'Chokepoints API non configurée.', candidates: [] };
  }
  try {
    // includeTainted intentionally omitted → false. Read scope token only.
    const client = createChokepointsClient({
      baseUrl: config.chokepointsApiUrl,
      token: config.chokepointsApiToken,
    });
    const family = flowType ? FLOW_TO_FAMILY[flowType.toLowerCase()] : undefined;
    const list = await client.listChokepoints({ family, macro_region: macroRegion, limit: 8 });
    const candidates = list.items
      // Defence-in-depth: never surface a redistribution-restricted record.
      .filter((it) => it.license_taint !== true)
      .map((it) => ({
        id: it.id,
        canonical_name: it.canonical_name,
        family: it.family,
        priority_class: it.priority_class,
        macro_region: it.macro_region ?? null,
      }));
    return {
      available: true,
      note: 'Candidats chokepoints (à valider) — issus de la Read API, scope read public.',
      candidates,
    };
  } catch (e) {
    return {
      available: false,
      note: `Enrichissement indisponible: ${(e as Error).message}`,
      candidates: [],
    };
  }
}
