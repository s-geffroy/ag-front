import { z } from 'zod';
import { ActorType, CaseStatus } from './enums';

/** Input to create a case. A case models a whole ENTERPRISE study (its sites, suppliers, customers,
 * partners — see CaseEntity / ADR 0036). `critical_actor_*` remains the headline/primary visible actor
 * (SPEC_V1 §4) but is now optional: the full roster lives in case entities. */
export const CaseInput = z.object({
  title: z.string().trim().min(1).max(300),
  client_name: z.string().trim().max(300).optional().default(''),
  sector: z.string().trim().min(1).max(300),
  critical_actor_name: z.string().trim().max(300).optional().default(''),
  critical_actor_type: ActorType.optional(),
  suspected_dependency: z.string().trim().max(5000).optional().default(''),
  business_function_at_risk: z.string().trim().min(1).max(5000),
  initial_concern: z.string().trim().max(5000).optional().default(''),
  // Enterprise profile (ADR 0036) — for a complete picture of the company under study.
  hq_country: z.string().trim().max(120).optional().default(''),
  employee_band: z.string().trim().max(40).optional().default(''),
  revenue_band: z.string().trim().max(40).optional().default(''),
  description: z.string().trim().max(5000).optional().default(''),
});
export type CaseInput = z.infer<typeof CaseInput>;

/** Patchable case fields. */
export const CasePatch = CaseInput.partial().extend({
  status: CaseStatus.optional(),
});
export type CasePatch = z.infer<typeof CasePatch>;

export const Case = CaseInput.extend({
  id: z.string(),
  owner_id: z.string(),
  status: CaseStatus,
  created_at: z.string(),
  updated_at: z.string(),
});
export type Case = z.infer<typeof Case>;
