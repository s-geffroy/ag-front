import { z } from 'zod';

/** Controlled vocabularies for VERDICT — the Premium strategic decision-arbitrage method
 * (port of the `verdict_v1_poc_ui_pack`). FR-primary domain values, English identifiers per the
 * repo language doctrine. See ADR 0041–0043. */

// The four operational verdicts. A verdict is never produced automatically: the score opens a
// possibility, the vetoes (audit.ts) can forbid it, and a human validates (MASTER_DOCUMENT §7).
export const decisionVerdicts = ['FAIRE', 'TESTER', 'DIFFÉRER', 'ABANDONNER'] as const;
export const DecisionVerdict = z.enum(decisionVerdicts);
export type DecisionVerdict = z.infer<typeof DecisionVerdict>;

// Default verdict suggested by the adjusted score before vetoes (FAIRE_POSSIBLE ≠ FAIRE).
export const scoreDefaultVerdicts = [
  'FAIRE_POSSIBLE',
  'TESTER',
  'DIFFÉRER',
  'ABANDONNER',
] as const;
export const ScoreDefaultVerdict = z.enum(scoreDefaultVerdicts);
export type ScoreDefaultVerdict = z.infer<typeof ScoreDefaultVerdict>;

// VERDICT uses its own confidence vocabulary (distinct from HDDE's low/medium/high).
export const decisionConfidences = ['faible', 'moyenne', 'forte'] as const;
export const DecisionConfidence = z.enum(decisionConfidences);
export type DecisionConfidence = z.infer<typeof DecisionConfidence>;

// Mandatory option typology — a valid decision needs main + minimal_alternative +
// (opposite OR active_non_action). Enforced by the audit vetoes.
export const optionTypes = [
  'main',
  'minimal_alternative',
  'opposite',
  'active_non_action',
] as const;
export const OptionType = z.enum(optionTypes);
export type OptionType = z.infer<typeof OptionType>;

// The 7 scoring criteria (weights sum to 100 — see scoring.ts).
export const criteriaKeys = [
  'strategic_value',
  'context_fit',
  'real_capacity',
  'systemic_viability',
  'net_risk',
  'proof_level',
  'optionality',
] as const;
export const CriterionKey = z.enum(criteriaKeys);
export type CriterionKey = z.infer<typeof CriterionKey>;

// Audit verdict on the decision dossier itself.
export const auditStatuses = ['VALIDE', 'À CORRIGER', 'BLOQUÉ'] as const;
export const AuditStatus = z.enum(auditStatuses);
export type AuditStatus = z.infer<typeof AuditStatus>;

// PESTEL décisionnel — only factors that change an option's cost/risk/timing/hypothesis.
export const pestelCategories = [
  'political',
  'economic',
  'social',
  'technological',
  'environmental',
  'legal',
] as const;
export const PestelCategory = z.enum(pestelCategories);
export type PestelCategory = z.infer<typeof PestelCategory>;

// SWOT décisionnelle.
export const swotQuadrants = ['strength', 'weakness', 'opportunity', 'threat'] as const;
export const SwotQuadrant = z.enum(swotQuadrants);
export type SwotQuadrant = z.infer<typeof SwotQuadrant>;

// Provenance of a pre-filled candidate (doctrine: candidate ≠ fact, ADR 0027).
export const sourceKinds = [
  'hdde_packet',
  'cvi',
  'chokepoint',
  'episode',
  'analytics',
  'atlas',
  'manual',
] as const;
export const SourceKind = z.enum(sourceKinds);
export type SourceKind = z.infer<typeof SourceKind>;

// Validation state of a candidate row.
export const candidateStatuses = ['candidate', 'validated', 'rejected'] as const;
export const CandidateStatus = z.enum(candidateStatuses);
export type CandidateStatus = z.infer<typeof CandidateStatus>;

// Decision lifecycle.
export const decisionStatuses = ['draft', 'in_review', 'arbitrated', 'archived'] as const;
export const DecisionStatus = z.enum(decisionStatuses);
export type DecisionStatus = z.infer<typeof DecisionStatus>;

// Red-team suggestion lifecycle (mirrors HDDE).
export const suggestionStatuses = ['pending', 'accepted', 'rejected'] as const;
export const SuggestionStatus = z.enum(suggestionStatuses);
export type SuggestionStatus = z.infer<typeof SuggestionStatus>;
