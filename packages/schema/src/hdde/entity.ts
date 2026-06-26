import { z } from 'zod';

/** First-class enterprise actors attached to a case (ADR 0036). A case models a whole enterprise:
 * its sites, suppliers, customers and partners — not just one visible actor. Each critical entity is
 * scored per-actor and rolled up into an enterprise synthesis. */
export const entityTypes = [
  'supplier',
  'customer',
  'site',
  'logistics_provider',
  'bank',
  'insurer',
  'regulator',
  'partner',
] as const;
export const EntityType = z.enum(entityTypes);
export type EntityType = z.infer<typeof EntityType>;

export const substitutabilityLevels = ['yes', 'partial', 'no', 'unknown'] as const;
export const Substitutability = z.enum(substitutabilityLevels);
export type Substitutability = z.infer<typeof Substitutability>;

export const visibilityLevels = ['yes', 'partial', 'no', 'unknown'] as const;
export const Tier2Visibility = z.enum(visibilityLevels);

export const CaseEntityInput = z.object({
  entity_type: EntityType,
  name: z.string().trim().min(1).max(300),
  country: z.string().trim().max(120).optional().default(''),
  role: z.string().trim().max(300).optional().default(''),
  what_it_enables: z.string().trim().max(2000).optional().default(''),
  tier: z.number().int().min(1).max(5).optional().nullable().default(null),
  criticality: z.number().int().min(0).max(5).default(0),
  substitutability: Substitutability.default('unknown'),
  tier2_visibility: Tier2Visibility.default('unknown'),
  jurisdiction_risk: z.number().int().min(0).max(5).default(0),
  time_to_impact: z.number().int().min(0).max(5).default(0),
  single_source: z.boolean().default(false),
  /** Revenue share (customer) or spend share (supplier), 0–100 — feeds concentration analysis. */
  share_pct: z.number().int().min(0).max(100).optional().nullable().default(null),
  notes: z.string().trim().max(2000).optional().default(''),
});
export type CaseEntityInput = z.infer<typeof CaseEntityInput>;

export const CaseEntityPatch = CaseEntityInput.partial();
export type CaseEntityPatch = z.infer<typeof CaseEntityPatch>;

export const CaseEntity = CaseEntityInput.extend({
  id: z.string(),
  case_id: z.string(),
  created_at: z.string(),
});
export type CaseEntity = z.infer<typeof CaseEntity>;
