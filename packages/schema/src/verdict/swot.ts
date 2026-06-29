import { z } from 'zod';
import { SwotQuadrant, SourceKind, CandidateStatus } from './enums';

/** SWOT décisionnelle — one item (temps R). Real capacities/vulnerabilities/levers/asymmetries.
 * Doctrine: a strength without proof is recorded as a hypothesis (is_hypothesis=true). */
export const SwotItem = z.object({
  id: z.string(),
  quadrant: SwotQuadrant,
  statement: z.string(),
  // A claimed strength with no evidence is downgraded to a hypothesis (anti-bias guardrail §R).
  is_hypothesis: z.boolean().default(false),
  source_kind: SourceKind.default('manual'),
  source_ref: z.string().nullable().default(null),
  status: CandidateStatus.default('candidate'),
});
export type SwotItem = z.infer<typeof SwotItem>;
