// CVI enrichment — local, in-process reuse of @ag/cvi (ADR 0035). Maps the HDDE flow_criticality_score
// (0-5) to the shared qualitative vulnerability level so the analyst sees a familiar CVI reading.
// Derived candidate, never a fact; does not mutate any canonical record.
import { levelFromScore, type VulnerabilityLevel } from '@ag/cvi';

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
