// CVI enrichment — local, in-process reuse of @ag/cvi (ADR 0035). Maps the HDDE flow_criticality_score
// (0-5) to the shared qualitative vulnerability level so the analyst sees a familiar CVI reading.
// Derived candidate, never a fact; does not mutate any canonical record.
import { createChokepointsClient, ChokepointsApiError } from '@ag/chokepoints';
import { levelFromScore, validateCvi, type VulnerabilityLevel, type CviAssessment } from '@ag/cvi';
import { config } from '../config';

export interface CviEnrichment {
  flow_criticality_score: number;
  vulnerability_level: VulnerabilityLevel;
  note: string;
}

export function deriveFlowVulnerability(flowCriticalityScore: number): CviEnrichment {
  const score = Math.max(0, Math.min(5, Math.round(flowCriticalityScore)));
  return {
    flow_criticality_score: score,
    vulnerability_level: levelFromScore(score),
    note: 'Lecture CVI dérivée du score de criticité de flux — candidat à valider (ADR 0027/0035).',
  };
}

/**
 * Fetch the per-corridor multi-dimension CVI assessment from the Chokepoints Read API (read scope,
 * never read_tainted — ADR 0035) and validate it into a candidate `CviAssessment`. Returns null when
 * the API is unconfigured/unreachable OR the payload fails `@ag/cvi` validation — a candidate quality
 * gate: no malformed or unsourced scores flow downstream to VERDICT (candidate ≠ fact, ADR 0027).
 */
export async function fetchCorridorCvi(chokepointId: string): Promise<CviAssessment | null> {
  if (!config.chokepointsApiUrl || !config.chokepointsApiToken) return null;
  const client = createChokepointsClient({
    baseUrl: config.chokepointsApiUrl,
    token: config.chokepointsApiToken,
  });
  try {
    const raw = await client.getChokepointCviAssessment(chokepointId);
    const result = validateCvi(raw);
    if (!result.ok) {
      console.warn(
        `[hdde] CVI assessment for ${chokepointId} failed the candidate quality gate:`,
        result.issues.map((i) => `${i.code}: ${i.message}`).join('; '),
      );
      return null;
    }
    return result.data;
  } catch (err) {
    // A 404 means no assessment has been computed for this corridor — expected, degrade quietly.
    // Anything else (403 wrong scope, 5xx, network) is a defect and must not pass for "no CVI".
    if (!(err instanceof ChokepointsApiError) || err.status !== 404) {
      console.error(`[hdde] CVI assessment for ${chokepointId} failed — this is not "no CVI":`, err);
    }
    return null;
  }
}
