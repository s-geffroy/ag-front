import { z } from 'zod';
import { AnswerType } from './enums';

/** Input to record one interview answer. `normalized_answer` carries the canonical token for
 * categorical/ordinal questions (e.g. "no", "partial", "3") used by the scoring engine. */
export const InterviewAnswerInput = z.object({
  question_id: z.string().trim().min(1).max(120),
  block_id: z.string().trim().min(1).max(120),
  raw_answer: z.string().trim().max(10000),
  normalized_answer: z.string().trim().max(200).optional().nullable().default(null),
  answer_type: AnswerType,
  evidence_quality: z.number().int().min(0).max(5),
  interviewer_note: z.string().trim().max(5000).optional().nullable().default(null),
});
export type InterviewAnswerInput = z.infer<typeof InterviewAnswerInput>;

export const InterviewAnswer = InterviewAnswerInput.extend({
  id: z.string(),
  case_id: z.string(),
  follow_up_required: z.boolean(),
  created_at: z.string(),
});
export type InterviewAnswer = z.infer<typeof InterviewAnswer>;
