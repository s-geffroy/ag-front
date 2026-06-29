// Engine-internal types for the loaded domain pack and the scoring/verdict output.
// The domain pack YAML is the single source of truth for the methodology (ADR 0032); these types
// describe only the shapes the engine depends on, leaving unrelated fields untouched.

export type Confidence = 'low' | 'medium' | 'high';
export type Verdict = 'monitor' | 'prepare' | 'act' | 'escalate';

export type AnswerType =
  | 'verified_fact'
  | 'estimate'
  | 'hypothesis'
  | 'intuition'
  | 'unknown'
  | 'not_applicable';

export interface Dimension {
  id: string;
  label_fr: string;
  label_en: string;
  scale: string;
}

export interface QuestionTargetDimension {
  id: string;
  weight: number;
}

export interface Question {
  id: string;
  block_id: string;
  order: number;
  required: boolean;
  type: 'categorical' | 'free_text' | 'ordinal_scale';
  text_fr: string;
  answer_options?: string[];
  /**
   * Optional per-option risk (0..5) for categorical questions whose options are NOT in the generic
   * yes/no polarity table (RISK_MAP) — e.g. an enumeration of failure modes. Without this, such
   * answers carry no numeric signal and silently leave their targeted dimensions at 0.
   */
  answer_risk?: Record<string, number>;
  targets?: {
    dimensions?: QuestionTargetDimension[];
    patterns?: { id: string; weight: number }[];
  };
  followups?: { trigger: string; question_id: string }[];
}

export interface ScoringRule {
  id: string;
  if: {
    question_id: string;
    evidence_quality_lte?: number;
    answer_in?: string[];
  };
  then: {
    adjust_dimension?: Record<string, number>;
    activate_pattern?: string;
    add_red_flag?: string;
  };
}

export interface VerdictRule {
  id: string;
  if: Record<string, number>; // e.g. { supplier_dependency_score_gte: 3, ... }
  verdict: Verdict;
}

export interface RedFlagDef {
  id: string;
  severity: number;
  message_fr: string;
}

export interface PatternDef {
  id: string;
  label_fr: string;
  label_en?: string;
  description_fr?: string;
}

export interface Persona {
  id: string;
  label_fr: string;
  attacks: string[];
}

export interface DomainPack {
  id: string;
  version: string;
  uiLanguage: string;
  outputLanguages: string[];
  dimensions: Dimension[];
  questions: Question[];
  scoringRules: ScoringRule[];
  verdictRules: VerdictRule[];
  redFlags: RedFlagDef[];
  patterns: PatternDef[];
  personas: Persona[];
  evidenceTypes: { id: string; allowed_as_evidence: boolean; default_reliability?: number }[];
  actorTypes: string[];
  actorRoles: string[];
  interviewBlocks: { id: string; order: number; label_fr: string; required: boolean }[];
  packHash: string;
}

/** A single interview answer fed to the engine. */
export interface EngineAnswer {
  question_id: string;
  raw_answer: string;
  /** Optional canonical token (e.g. "no", "partial", or an ordinal "0".."5"). */
  normalized_answer?: string | null;
  answer_type?: AnswerType;
  evidence_quality: number; // 0..5
}

/** A piece of evidence linked to a dimension, resolved from evidence_items + evidence_links. */
export interface DimensionEvidence {
  id: string;
  reliability: number; // 0..5
  status: string; // 'accepted' | 'pending' | 'rejected'
}

export interface DimensionScore {
  dimension_id: string;
  value: number; // 0..5
  confidence: Confidence;
  rationale: string;
  evidence_refs: string[];
  open_uncertainties: string[];
}

export interface ScoringResult {
  scores: Record<string, DimensionScore>;
  activatedPatterns: string[];
  redFlags: { id: string; severity: number; message_fr: string }[];
}
