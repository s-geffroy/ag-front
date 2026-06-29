import { z } from 'zod';
import { SuggestionStatus } from './enums';

/** Structured red-team output (ported from the POC's red_team_option / minimal_alternative /
 * truth_test prompts). The LLM produces SUGGESTIONS (proof level 0), never a verdict — the
 * analyst accepts/rejects (ADR 0034, candidate ≠ fact). */
export const RedTeamOutput = z.object({
  // Which assistant role produced this (drives the prompt).
  role: z.enum(['red_team_option', 'minimal_alternative', 'truth_test']),
  target_option_id: z.string().nullable().default(null),
  main_objection: z.string().default(''),
  attacked_assumptions: z
    .array(
      z.object({
        assumption: z.string(),
        why_fragile: z.string(),
        severity: z.number().int().min(0).max(5),
        required_test: z.string().default(''),
      }),
    )
    .default([]),
  overestimations: z.array(z.string()).default([]),
  missing_proofs: z.array(z.string()).default([]),
  undervalued_alternatives: z.array(z.string()).default([]),
  // Pressure on the arbitrage (could this change the recommended option / verdict?).
  could_change_recommendation: z.boolean().default(false),
  reason: z.string().default(''),
  do_not_conclude: z.array(z.string()).default([]),
});
export type RedTeamOutput = z.infer<typeof RedTeamOutput>;

/** A stored red-team suggestion (pending until the analyst reviews it). */
export const RedTeamSuggestion = z.object({
  id: z.string(),
  decision_id: z.string(),
  role: z.string(),
  status: SuggestionStatus.default('pending'),
  suggestion: RedTeamOutput,
  reviewed_by: z.string().nullable().default(null),
  reviewed_at: z.string().nullable().default(null),
  created_at: z.string(),
});
export type RedTeamSuggestion = z.infer<typeof RedTeamSuggestion>;
