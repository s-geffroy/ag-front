import { z } from 'zod';
import { MunichStatus } from './enums';
import { JudgeGateVerdict } from './judgement';

// Append-only human-validation journal (ADR 0046, implemented per ADR 0068). Every `candidate → fact`
// crossing on an editorial gate is recorded here with WHO validated WHAT and WHEN. The server treats
// this collection as append-only: it never rewrites or deletes an existing entry (no retroactive edit
// of a validation). Git-tracked — it is the durable audit trail, not a regenerable candidate.

/**
 * What was validated: a deliverable gate boolean, a Munich control, the CVI justification, or a
 * `publication` (the final candidate → public crossing — flipping the frontmatter flag, ADR 0069).
 */
export const ValidationTargetKind = z.enum(['gate', 'munich', 'cvi', 'publication']);
export type ValidationTargetKind = z.infer<typeof ValidationTargetKind>;

/** Snapshot of a target's value — a boolean (gate/cvi/publication) or a Munich status ('ok'|'todo'|'na'). */
export const ValidationValue = z.union([z.boolean(), MunichStatus]);
export type ValidationValue = z.infer<typeof ValidationValue>;

export const ValidationEntry = z.object({
  id: z.string(),
  deliverable_id: z.string(),
  target_kind: ValidationTargetKind,
  /** Gate key ('compliance_done'), Munich control number ('7'), or 'cvi_justified'. */
  target_id: z.string(),
  decision: z.enum(['validated', 'rejected']),
  /** The human's reserve/comment — pre-filled from the judge justification, then edited (ADR 0068). */
  reserve: z.string().default(''),
  /** Target value before / after the decision, for a replayable trail. */
  before: ValidationValue.optional(),
  after: ValidationValue.optional(),
  /** The LLM judge candidate the human confirmed or overrode, if a judge run existed (ADR 0068). */
  judge_verdict_snapshot: JudgeGateVerdict.optional(),
  /** Nominative validator identity (honor-system on the single-operator tailnet — ADR 0046). */
  validated_by: z.string(),
  validated_at: z.string(), // ISO 8601
});
export type ValidationEntry = z.infer<typeof ValidationEntry>;

export const ValidationJournal = z.array(ValidationEntry);
export type ValidationJournal = z.infer<typeof ValidationJournal>;
