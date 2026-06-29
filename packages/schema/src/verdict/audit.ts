import { z } from 'zod';
import { AuditStatus, ScoreDefaultVerdict } from './enums';

/** Result of running the VERDICT audit engine over a decision (decision + options + scores).
 * BLOQUÉ when any hard veto is violated; À CORRIGER on warnings only; VALIDE otherwise. */
export const AuditResult = z.object({
  audit_status: AuditStatus,
  blocking_errors: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
  selected_option_id: z.string().nullable().default(null),
  selected_option_proof_level: z.number().int().min(0).max(5),
  // Default verdict the adjusted score would suggest (before vetoes) — informational.
  score_default_verdict: ScoreDefaultVerdict.nullable().default(null),
});
export type AuditResult = z.infer<typeof AuditResult>;
