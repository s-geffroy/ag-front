import { z } from 'zod';
import { PestelCategory, SourceKind, CandidateStatus } from './enums';

/** PESTEL décisionnel dynamique — one factor (temps E). Only factors that materially change an
 * option's cost/risk/timing/hypothesis are retained. Pre-filled from chokepoints/CVI/HDDE. */
export const PestelFactor = z.object({
  id: z.string(),
  category: PestelCategory,
  statement: z.string(),
  // How it changes the decision (the "so what"), not a neutral description.
  decisional_impact: z.string().default(''),
  // Residual uncertainty on this factor.
  uncertainty: z.string().default(''),
  source_kind: SourceKind.default('manual'),
  source_ref: z.string().nullable().default(null),
  status: CandidateStatus.default('candidate'),
});
export type PestelFactor = z.infer<typeof PestelFactor>;
