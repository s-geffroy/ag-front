import { z } from 'zod';
import { cviDimensionKeys } from './dimensions';
import { vulnerabilityLevels, confidenceLevels } from './levels';

/** Notation scale, gated by offering: qualitative (Basic) → 0-5 (Standard) → 0-100 (Premium). */
export const cviScales = ['qualitative', '0-5', '0-100'] as const;
export const CviScale = z.enum(cviScales);
export type CviScale = z.infer<typeof CviScale>;

export const CviDimensionKeyEnum = z.enum(cviDimensionKeys);

/**
 * One dimension's score, WITH its provenance. `source_refs` and `uncertainties` are what let a reader
 * tell a sourced score from a guess; a `z.object` strips undeclared keys, so omitting them here
 * silently discarded the evidence trail on its way into the HDDE packet.
 */
export const DimensionScore = z.object({
  score: z.number().int().min(0).max(5),
  rationale: z.string().min(1),
  confidence: z.enum(confidenceLevels).optional(),
  source_refs: z.array(z.string()).default([]),
  uncertainties: z.array(z.string()).default([]),
});
export type DimensionScore = z.infer<typeof DimensionScore>;

/**
 * A CVI assessment of a corridor. Always carries its provenance (sources, uncertainties) AND the
 * markers that identify it as derived: `status` (candidate|partially_validated|validated) and the
 * verbatim `disclaimer`. Those must survive validation — a candidate that loses its "candidate" label
 * on the way into a downstream packet is indistinguishable from a fact (data-integrity rule).
 *
 * `dimensions` may omit any key: a dimension with no engine input (typically `resilience`) is omitted,
 * never fabricated. zod's `z.record` over an enum key yields `Partial<Record<…>>`, so every read must
 * be guarded.
 *
 * Validity rules — including the hard "no 0–100 without documented methodology" (ADR 0049) — live in
 * `validate.ts`, not in the shape itself, so callers get explicit, typed issues.
 */
export const CviAssessment = z.object({
  chokepoint_id: z.string().optional(),
  scale: CviScale,
  global_level: z.enum(vulnerabilityLevels).optional(),
  dimensions: z.record(CviDimensionKeyEnum, DimensionScore).optional(),
  aggregate_score: z.number().min(0).max(100).optional(),
  methodology_documented: z.boolean().default(false),
  status: z.string().optional(),
  engine_version: z.string().optional(),
  sources: z.array(z.string()).default([]),
  uncertainties: z.array(z.string()).default([]),
  last_updated: z.string().optional(),
  disclaimer: z.string().optional(),
});
export type CviAssessment = z.infer<typeof CviAssessment>;
