import { z } from 'zod';
import { ActorType, CaseStatus } from './enums';

/** Input to create a case — starts from a VISIBLE critical actor (SPEC_V1 §4). */
export const CaseInput = z.object({
  title: z.string().trim().min(1).max(300),
  client_name: z.string().trim().max(300).optional().default(''),
  sector: z.string().trim().min(1).max(300),
  critical_actor_name: z.string().trim().min(1).max(300),
  critical_actor_type: ActorType,
  suspected_dependency: z.string().trim().max(5000).optional().default(''),
  business_function_at_risk: z.string().trim().min(1).max(5000),
  initial_concern: z.string().trim().max(5000).optional().default(''),
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
