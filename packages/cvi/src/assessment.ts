import { z } from 'zod';
import { cviDimensionKeys } from './dimensions';
import { vulnerabilityLevels, confidenceLevels } from './levels';

/** Notation scale, gated by offering: qualitative (Basic) → 0-5 (Standard) → 0-100 (Premium). */
export const cviScales = ['qualitative', '0-5', '0-100'] as const;
export const CviScale = z.enum(cviScales);
export type CviScale = z.infer<typeof CviScale>;

export const CviDimensionKeyEnum = z.enum(cviDimensionKeys);

export const DimensionScore = z.object({
  score: z.number().int().min(0).max(5),
  rationale: z.string().min(1),
  confidence: z.enum(confidenceLevels).optional(),
});
export type DimensionScore = z.infer<typeof DimensionScore>;

/**
 * A CVI assessment of a corridor. Always carries its provenance (sources, uncertainties).
 * Validity rules — including the hard "no 0–100 without documented methodology" — live in
 * `validate.ts`, not in the shape itself, so callers get explicit, typed issues.
 */
export const CviAssessment = z.object({
  scale: CviScale,
  global_level: z.enum(vulnerabilityLevels).optional(),
  dimensions: z.record(CviDimensionKeyEnum, DimensionScore).optional(),
  aggregate_score: z.number().min(0).max(100).optional(),
  methodology_documented: z.boolean().default(false),
  sources: z.array(z.string()).default([]),
  uncertainties: z.array(z.string()).default([]),
  last_updated: z.string().optional(),
});
export type CviAssessment = z.infer<typeof CviAssessment>;
