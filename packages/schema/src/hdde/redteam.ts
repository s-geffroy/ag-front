import { z } from 'zod';
import { SuggestionStatus } from './enums';

/** Strict schema for an OpenAI red-team persona response. A non-conforming response is REJECTED and
 * never persisted (ADR 0034). LLM output is an adversarial suggestion — never evidence. */
export const RedTeamOutput = z.object({
  persona: z.string(),
  /** Adversarial reasoning scratchpad, emitted BEFORE the conclusions so the model thinks first
   * (CoT under Structured Outputs). Persisted for human-validation traceability (ADR 0046).
   * `.default('')` keeps suggestions persisted before this field was added parseable. */
  analysis: z.string().default(''),
  main_objection: z.string(),
  attacked_assumptions: z
    .array(
      z.object({
        assumption: z.string(),
        why_fragile: z.string(),
        severity: z.number().int().min(0).max(5),
        required_test: z.string(),
      }),
    )
    .default([]),
  possible_contradictions: z
    .array(
      z.object({
        contradiction: z.string(),
        basis: z.enum([
          'client_statement',
          'evidence_gap',
          'analyst_inference',
          'provided_evidence',
        ]),
        severity: z.number().int().min(0).max(5),
      }),
    )
    .default([]),
  questions_to_ask: z.array(z.object({ question: z.string(), purpose: z.string() })).default([]),
  verdict_pressure: z.object({
    could_raise_verdict: z.boolean(),
    could_lower_verdict: z.boolean(),
    reason: z.string(),
  }),
  do_not_conclude: z.array(z.string()).default([]),
});
export type RedTeamOutput = z.infer<typeof RedTeamOutput>;

/** Request to run a persona red team against the provisional diagnosis. */
export const RedTeamRunInput = z.object({
  persona: z.string().trim().min(1).max(120),
});
export type RedTeamRunInput = z.infer<typeof RedTeamRunInput>;

export const RedTeamSuggestion = z.object({
  id: z.string(),
  case_id: z.string(),
  persona: z.string(),
  status: SuggestionStatus,
  suggestion_json: RedTeamOutput,
  reviewed_by: z.string().nullable(),
  reviewed_at: z.string().nullable(),
  created_at: z.string(),
});
export type RedTeamSuggestion = z.infer<typeof RedTeamSuggestion>;
