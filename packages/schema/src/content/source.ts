import { z } from 'zod';
import { confidenceLevels } from '@ag/cvi';
import { sourceTypes } from './vocab';

export const SourceType = z.enum(sourceTypes);
export const Source = z.object({
  label: z.string(),
  type: SourceType,
  url: z.string().url().optional(),
  note: z.string().optional(),
});
export type Source = z.infer<typeof Source>;

/** Seeds are candidates pending human validation, never facts (data-integrity rule). */
export const ValidationStatus = z.enum(['candidate', 'validated']);
export type ValidationStatus = z.infer<typeof ValidationStatus>;

export const ConfidenceLevel = z.enum(confidenceLevels);
export type ConfidenceLevel = z.infer<typeof ConfidenceLevel>;

/**
 * Provenance travels with every structuring claim: validation status, confidence,
 * visible sources, and explicit uncertainties. No structuring claim without a source
 * or an uncertainty marker.
 */
export const Provenance = z.object({
  validation_status: ValidationStatus.default('candidate'),
  confidence: ConfidenceLevel,
  last_updated: z.string().optional(),
  sources: z.array(Source).default([]),
  uncertainties: z.array(z.string()).default([]),
});
export type Provenance = z.infer<typeof Provenance>;
