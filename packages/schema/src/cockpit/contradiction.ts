import { z } from 'zod';

// Editorial contradiction / red-team for the cockpit (ADR 0039). Mirrors the HDDE red-team doctrine
// (ADR 0034): the LLM output is an adversarial SUGGESTION — a CANDIDATE pending human validation,
// never a fact, never a decision. Running it NEVER mutates the canonical editorial content and NEVER
// auto-clears the `contradiction_done` quality gate; a human reads the report and decides.

/** The content folders the reader/review index use (mirrors server/content.ts `contentTypes`). */
export const ContentTypeId = z.enum(['atlas', 'dossiers', 'notes']);
export type ContentTypeId = z.infer<typeof ContentTypeId>;

/** Why a passage is fragile — the register of the objection. */
export const ContradictionBasis = z.enum([
  'internal_inconsistency', // the document contradicts itself
  'unsupported_claim', // an assertion with no cited source / evidence
  'source_gap', // a claim that would need a source the corpus lacks
  'overstated_certainty', // a hedge-worthy claim stated as fact
  'missing_counterargument', // an obvious objection the document never addresses
]);
export type ContradictionBasis = z.infer<typeof ContradictionBasis>;

export const ContradictionFinding = z.object({
  /** The claim or passage under attack (quote or close paraphrase from the document). */
  claim: z.string(),
  /** Why it is fragile / what contradicts it. */
  objection: z.string(),
  basis: ContradictionBasis,
  /** 0 (cosmetic) … 5 (load-bearing claim that, if wrong, breaks the analysis). */
  severity: z.number().int().min(0).max(5),
  /** A concrete, proportionate test the human can run to resolve it. */
  suggested_test: z.string(),
});
export type ContradictionFinding = z.infer<typeof ContradictionFinding>;

/** The raw analysis the LLM returns (validated; persisted inside a report below). */
export const ContradictionAnalysis = z.object({
  /** Adversarial reasoning scratchpad, emitted BEFORE the conclusions so the model thinks first
   * (CoT under Structured Outputs). Persisted for human-validation traceability (ADR 0046).
   * `.default('')` keeps reports persisted before this field was added parseable. */
  analysis: z.string().default(''),
  /** One-paragraph overall objection — the single biggest weakness. */
  summary: z.string(),
  findings: z.array(ContradictionFinding).default([]),
  /** Open questions a human should resolve before publishing. */
  open_questions: z.array(z.string()).default([]),
  /** Restatements that this output is not evidence and must be validated. */
  do_not_conclude: z.array(z.string()).default([]),
});
export type ContradictionAnalysis = z.infer<typeof ContradictionAnalysis>;

/** A persisted report — one per editorial document, keyed by `doc_id` = `${content_type}/${slug}`. */
export const ContradictionReport = ContradictionAnalysis.extend({
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
export type ContradictionReport = z.infer<typeof ContradictionReport>;

export const Contradictions = z.array(ContradictionReport);
export type Contradictions = z.infer<typeof Contradictions>;
