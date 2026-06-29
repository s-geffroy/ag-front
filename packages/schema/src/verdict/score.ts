import { z } from 'zod';
import { criteriaKeys } from './enums';

/** The 7 criteria values for one option (each 0–5). */
export const CriteriaValues = z.object(
  Object.fromEntries(criteriaKeys.map((k) => [k, z.number().min(0).max(5)])) as Record<
    (typeof criteriaKeys)[number],
    z.ZodNumber
  >,
);
export type CriteriaValues = z.infer<typeof CriteriaValues>;

/** Weight profile — standard (default weights) or a justified adaptation (±5 per criterion). */
export const WeightProfile = z.object({
  profile: z.enum(['standard', 'custom']).default('standard'),
  adapted_before_scoring: z.boolean().default(false),
  justification: z.string().default(''),
  weights: z.record(z.string(), z.number()),
});
export type WeightProfile = z.infer<typeof WeightProfile>;

/** One option's score: raw (computed from criteria×weights) + adjusted (after penalties/caps). */
export const ScoreEntry = z.object({
  option_id: z.string(),
  criteria: CriteriaValues,
  raw_score: z.number().int().min(0).max(100).nullable().default(null),
  adjusted_score: z.number().int().min(0).max(100).nullable().default(null),
  adjustment_reasons: z.array(z.string()).default([]),
});
export type ScoreEntry = z.infer<typeof ScoreEntry>;

/** The full scoring document for a decision. */
export const ScoringDoc = z.object({
  weight_profile: WeightProfile,
  scores: z.array(ScoreEntry).default([]),
});
export type ScoringDoc = z.infer<typeof ScoringDoc>;
