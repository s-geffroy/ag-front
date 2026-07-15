import { z } from 'zod';
import { ContentTypeId } from './contradiction';

// LLM judge / pré-validation for the cockpit (ADR 0068). Complement to the red team (ADR 0039): where
// the red team ATTACKS a document, the judge issues a per-gate CANDIDATE verdict (pass/fail/uncertain)
// so the human confirms/overrides instead of reasoning from a blank slate. Same doctrine as ADR 0039:
// the output is a CANDIDATE pending human validation — never a fact, never a decision, never a gate.
// Running it NEVER mutates the canonical content and NEVER auto-clears a gate; a human clicks and a
// nominative journal entry is written (ADR 0046). See validation.ts.

/** A judge verdict for one gate. Default to `uncertain`: the model must never guess `pass`. */
export const GateVerdict = z.enum(['pass', 'fail', 'uncertain']);
export type GateVerdict = z.infer<typeof GateVerdict>;

/** Which catalogue the scored gate comes from. */
export const GateTargetKind = z.enum(['rubric', 'munich']);
export type GateTargetKind = z.infer<typeof GateTargetKind>;

export const JudgeGateVerdict = z.object({
  /** 'rubric' → a `quality_gates.json` required-gate id; 'munich' → a control number "1".."10". */
  target_kind: GateTargetKind,
  /** The rubric gate id (e.g. 'strategic_verdict') or the Munich control number as a string. */
  target_id: z.string(),
  /** Human-readable label of the gate, for display without re-deriving it. */
  label: z.string().default(''),
  verdict: GateVerdict,
  /** One-line justification citing the document evidence (or its absence). */
  justification: z.string(),
  /** A short verbatim quote from the document supporting the verdict (empty when none applies). */
  evidence_quote: z.string().default(''),
  /** Calibrated confidence 0 (guess) … 1 (certain). Low confidence is a human-attention signal. */
  confidence: z.number().min(0).max(1),
});
export type JudgeGateVerdict = z.infer<typeof JudgeGateVerdict>;

/** The raw analysis the LLM returns (validated; persisted inside a report below). */
export const JudgeAnalysis = z.object({
  /** Reasoning scratchpad emitted BEFORE the verdicts (CoT under Structured Outputs), persisted for
   * human-validation traceability (ADR 0046 / 0063). `.default('')` keeps older reports parseable. */
  analysis: z.string().default(''),
  gate_verdicts: z.array(JudgeGateVerdict).default([]),
  /** Restatements that this output is a candidate and must be validated by a human. */
  do_not_conclude: z.array(z.string()).default([]),
});
export type JudgeAnalysis = z.infer<typeof JudgeAnalysis>;

/** A persisted report — one per editorial document, keyed by `doc_id` = `${content_type}/${slug}`. */
export const JudgeReport = JudgeAnalysis.extend({
  doc_id: z.string(),
  content_type: ContentTypeId,
  slug: z.string(),
  /** Document title at run time, for display without re-reading the file. */
  title: z.string().default(''),
  /** 'facade' when produced offline (no key), else the model id (e.g. 'gpt-4o'). */
  model: z.string(),
  /** 'pending' until a human marks the report as reviewed. */
  status: z.enum(['pending', 'reviewed']).default('pending'),
  generated_at: z.string(), // ISO 8601
  reviewed_at: z.string().optional(),
});
export type JudgeReport = z.infer<typeof JudgeReport>;

export const Judgements = z.array(JudgeReport);
export type Judgements = z.infer<typeof Judgements>;
