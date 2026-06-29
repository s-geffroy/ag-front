import { z } from 'zod';
import { OptionType, SourceKind, CandidateStatus } from './enums';

/** Canvas de viabilité systémique — VERDICT's reframe of the Business Model Canvas: 5 dimensions
 * assessed per option (commercial AND non-commercial decisions). MASTER_DOCUMENT §D. */
export const ViabilityCanvas = z.object({
  value: z.string().default(''),
  beneficiaries: z.string().default(''),
  adoption_validation: z.string().default(''),
  critical_resources_costs: z.string().default(''),
  sustainability_systemic_risk: z.string().default(''),
});
export type ViabilityCanvas = z.infer<typeof ViabilityCanvas>;

/** A decision option. A valid decision needs ≥3 with the mandatory type spread (see audit). */
export const DecisionOption = z.object({
  option_id: z.string(),
  type: OptionType,
  title: z.string(),
  description: z.string().default(''),
  critical_hypothesis: z.string().default(''),
  main_evidence: z.string().default(''),
  main_contradiction: z.string().default(''),
  // Proof level 0–5 gates the verdict: FAIRE needs ≥4 on the selected option (MASTER_DOCUMENT §I).
  proof_level: z.number().int().min(0).max(5),
  canvas: ViabilityCanvas.default({}),
  // Provenance for pre-filled option seeds (HDDE light_actions → option amorces).
  source_kind: SourceKind.default('manual'),
  source_ref: z.string().nullable().default(null),
  status: CandidateStatus.default('candidate'),
});
export type DecisionOption = z.infer<typeof DecisionOption>;
