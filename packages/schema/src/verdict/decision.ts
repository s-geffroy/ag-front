import { z } from 'zod';
import { DecisionVerdict, DecisionConfidence, DecisionStatus } from './enums';

/** Truth test — mandatory for a TESTER verdict. A falsifiable, bounded experiment that can KILL
 * the option (can_kill_option). All 8 fields required by the audit. MASTER_DOCUMENT §T. */
export const TruthTest = z.object({
  critical_hypothesis: z.string().default(''),
  minimal_protocol: z.string().default(''),
  max_duration: z.string().default(''),
  max_cost: z.string().default(''),
  success_signal: z.string().default(''),
  failure_signal: z.string().default(''),
  decision_if_success: z.string().default(''),
  decision_if_failure: z.string().default(''),
  can_kill_option: z.boolean().default(false),
});
export type TruthTest = z.infer<typeof TruthTest>;

/** A red flag on the decision. A `bloquant`/`blocking` unresolved flag forbids FAIRE. */
export const RedFlag = z.object({
  id: z.string(),
  message: z.string(),
  severity: z.enum(['minor', 'serious', 'blocking', 'bloquant']),
  resolved: z.boolean().default(false),
});
export type RedFlag = z.infer<typeof RedFlag>;

/** Lightweight decision graph (parent/child/dependencies) — visualised as Mermaid, no engine. */
export const DecisionGraph = z.object({
  parent_decision_id: z.string().nullable().default(null),
  child_decision_ids: z.array(z.string()).default([]),
  dependencies: z
    .array(
      z.object({
        type: z.string(),
        target: z.string(),
        status: z.string().default(''),
        effect: z.string().default(''),
      }),
    )
    .default([]),
});
export type DecisionGraph = z.infer<typeof DecisionGraph>;

/** The decision "identity + verdict page" (mirrors decision.yaml of the POC). */
export const Decision = z.object({
  id: z.string(),
  title: z.string(),
  client_name: z.string().nullable().default(null),
  sector: z.string().default(''),
  status: DecisionStatus.default('draft'),
  // V — the real situation, stated without a preferred solution.
  situation: z.string().default(''),
  proposed_verdict: DecisionVerdict.nullable().default(null),
  final_verdict: DecisionVerdict.nullable().default(null),
  selected_option_id: z.string().nullable().default(null),
  confidence: DecisionConfidence.nullable().default(null),
  // Operational gates.
  stop_threshold: z.string().nullable().default(null),
  review_date: z.string().nullable().default(null),
  human_validation: z.boolean().default(false),
  // Verdict-specific justification fields.
  why_faire_not_tester: z.string().nullable().default(null),
  defer_reason: z.string().nullable().default(null),
  reopening_signal: z.string().nullable().default(null),
  abandonment_disposition: z.string().nullable().default(null),
  truth_test: TruthTest.nullable().default(null),
  red_flags: z.array(RedFlag).default([]),
  graph: DecisionGraph.default({}),
  // Geopolitical ingestion provenance (HDDE case → decision dossier).
  hdde_case_ref: z.string().nullable().default(null),
  source_packet_id: z.string().nullable().default(null),
  source_pack_hash: z.string().nullable().default(null),
  ingested_at: z.string().nullable().default(null),
});
export type Decision = z.infer<typeof Decision>;
