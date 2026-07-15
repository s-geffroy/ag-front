import type { AuditResult } from '@ag/schema/verdict';
import {
  CRITERIA,
  computeRawScore,
  validateWeights,
  validateCriterionValues,
  expectedDefaultVerdict,
} from './scoring';

/** Faithful TypeScript port of `verdict/audit.py` (verdict_v1_poc_ui_pack), operating on in-memory
 * objects instead of YAML files. These hard-veto rules ARE the value of the method: they prevent
 * "score tyranny" (a high score never validates alone) and enforce the proof/option/test discipline.
 * Reproduce them exactly — changing a rule is an ADR-level decision. */

const HARD_BLOCK = 'BLOQUÉ' as const;
const CORRECT = 'À CORRIGER' as const;
const VALID = 'VALIDE' as const;

const VALID_VERDICTS = new Set(['FAIRE', 'TESTER', 'DIFFÉRER', 'ABANDONNER']);
const REQUIRED_TRUTH_TEST_FIELDS = [
  'critical_hypothesis',
  'minimal_protocol',
  'max_duration',
  'max_cost',
  'success_signal',
  'failure_signal',
  'decision_if_success',
  'decision_if_failure',
] as const;

// Loose shapes — the audit tolerates partial/draft data and reports what's missing.
type AnyOption = Record<string, unknown> & {
  option_id?: string;
  type?: string;
  proof_level?: number | null;
};
type AnyScoreEntry = Record<string, unknown> & { option_id?: string };
type AnyRedFlag = { severity?: string; resolved?: boolean };

export interface AuditInput {
  decision: Record<string, unknown>;
  options: AnyOption[];
  scores: { weight_profile?: Record<string, unknown>; scores?: AnyScoreEntry[] };
}

function hasOptionType(options: AnyOption[], typeName: string): boolean {
  return options.some((o) => o.type === typeName);
}

function findOptionById(options: AnyOption[], id: string | null | undefined): AnyOption | null {
  if (!id) return null;
  return options.find((o) => o.option_id === id) ?? null;
}

function selectedOption(decision: Record<string, unknown>, options: AnyOption[]): AnyOption | null {
  const explicitId =
    (decision.selected_option_id as string | undefined) ??
    (decision.retained_option_id as string | undefined);
  const found = findOptionById(options, explicitId);
  if (found) return found;
  // V1 fallback: the main option, else the first.
  return options.find((o) => o.type === 'main') ?? options[0] ?? null;
}

function optionProofLevel(option: AnyOption | null, decision: Record<string, unknown>): number {
  if (option && option.proof_level !== null && option.proof_level !== undefined) {
    return Math.trunc(Number(option.proof_level) || 0);
  }
  return Math.trunc(Number(decision.proof_level ?? 0) || 0);
}

function scoreEntries(scores: AuditInput['scores']): AnyScoreEntry[] {
  return scores.scores ?? [];
}

function scoreByOption(scores: AuditInput['scores']): Map<string, AnyScoreEntry> {
  const map = new Map<string, AnyScoreEntry>();
  for (const s of scoreEntries(scores)) {
    if (s.option_id) map.set(s.option_id, s);
  }
  return map;
}

function auditScores(
  scores: AuditInput['scores'],
  options: AnyOption[],
): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const weightProfile = scores.weight_profile ?? {};
  const weights = (weightProfile.weights as Record<string, number> | undefined) ?? {};

  if (Object.keys(weights).length > 0) {
    errors.push(...validateWeights(weights));
  } else {
    errors.push('missing_weight_profile');
  }

  if (weightProfile.profile !== 'standard' && !weightProfile.justification) {
    errors.push('custom_weight_profile_requires_justification');
  }
  if (!weightProfile.adapted_before_scoring) {
    errors.push('weights_must_be_adapted_before_scoring');
  }

  const entries = scoreEntries(scores);
  if (entries.length < 3) {
    errors.push('at_least_3_scored_options_required');
  }
  const optionIds = new Set(options.map((o) => o.option_id).filter(Boolean) as string[]);
  const scoredIds = new Set(entries.map((s) => s.option_id).filter(Boolean) as string[]);
  for (const oid of optionIds) {
    if (!scoredIds.has(oid)) errors.push(`missing_score_for_option_${oid}`);
  }

  for (const entry of entries) {
    const optionId = (entry.option_id as string) ?? 'unknown';
    const criteria = (entry.criteria as Record<string, unknown>) ?? {};
    errors.push(...validateCriterionValues(criteria, `score_${optionId}`));
    if (Object.keys(criteria).length > 0 && Object.keys(weights).length > 0) {
      const expectedRaw = computeRawScore(
        criteria as Record<(typeof CRITERIA)[number], number>,
        weights,
      );
      if (entry.raw_score === null || entry.raw_score === undefined) {
        errors.push(`missing_raw_score_for_option_${optionId}`);
      } else if (Math.trunc(Number(entry.raw_score)) !== expectedRaw) {
        errors.push(`raw_score_inconsistent_for_option_${optionId}:expected_${expectedRaw}`);
      }
    }
    if (entry.adjusted_score === null || entry.adjusted_score === undefined) {
      errors.push(`missing_adjusted_score_for_option_${optionId}`);
    } else {
      const adjusted = Number(entry.adjusted_score);
      const raw = Number(entry.raw_score);
      if (Number.isFinite(adjusted) && Number.isFinite(raw)) {
        if (adjusted > raw + 5) {
          warnings.push(`adjusted_score_unusually_above_raw_for_option_${optionId}`);
        }
      } else {
        errors.push(`adjusted_score_invalid_for_option_${optionId}`);
      }
    }
    if (entry.adjustment_reasons === null || entry.adjustment_reasons === undefined) {
      warnings.push(`missing_adjustment_reasons_for_option_${optionId}`);
    }
  }
  return { errors, warnings };
}

/** Run the decision audit. Returns the status + the exact blocking-error codes (stable identifiers
 * the UI and tests assert on). */
export function auditDecision(input: AuditInput): AuditResult {
  const { decision, options, scores } = input;
  const errors: string[] = [];
  const warnings: string[] = [];

  const finalVerdict =
    (decision.final_verdict as string | undefined) ??
    (decision.proposed_verdict as string | undefined);
  const confidence = decision.confidence as string | undefined;
  const humanValidation = Boolean(decision.human_validation ?? false);
  const stopThreshold = decision.stop_threshold;
  const reviewDate = decision.review_date;
  const redFlags = (decision.red_flags as AnyRedFlag[] | undefined) ?? [];
  const truthTest = (decision.truth_test as Record<string, unknown> | null | undefined) ?? {};

  if (!finalVerdict || !VALID_VERDICTS.has(finalVerdict)) {
    errors.push('final_verdict_must_be_faire_tester_differer_or_abandonner');
  }
  if (!confidence || !['faible', 'moyenne', 'forte'].includes(confidence)) {
    errors.push('confidence_must_be_faible_moyenne_or_forte');
  }

  if (!hasOptionType(options, 'main')) errors.push('missing_main_option');
  if (!hasOptionType(options, 'minimal_alternative')) errors.push('missing_minimal_alternative');
  if (!(hasOptionType(options, 'opposite') || hasOptionType(options, 'active_non_action'))) {
    errors.push('missing_opposite_or_active_non_action');
  }

  for (const option of options) {
    const oid = (option.option_id as string) ?? 'unknown';
    if (option.proof_level === null || option.proof_level === undefined) {
      errors.push(`missing_proof_level_for_option_${oid}`);
    }
    if (!option.critical_hypothesis) warnings.push(`missing_critical_hypothesis_for_option_${oid}`);
    if (!option.main_evidence) warnings.push(`missing_main_evidence_for_option_${oid}`);
    if (!option.main_contradiction) warnings.push(`missing_main_contradiction_for_option_${oid}`);
  }

  const { errors: scoreErrors, warnings: scoreWarnings } = auditScores(scores, options);
  errors.push(...scoreErrors);
  warnings.push(...scoreWarnings);

  const selected = selectedOption(decision, options);
  const selectedProofLevel = optionProofLevel(selected, decision);
  const selectedScore = selected ? scoreByOption(scores).get(selected.option_id ?? '') : undefined;
  const selectedAdjusted = selectedScore?.adjusted_score;

  if (finalVerdict === 'FAIRE') {
    if (selectedProofLevel < 4) {
      errors.push('faire_forbidden_when_selected_option_proof_level_below_4');
    }
    if (confidence === 'faible') {
      errors.push('faire_forbidden_when_confidence_low');
    }
    if (
      redFlags.some((r) => (r.severity === 'blocking' || r.severity === 'bloquant') && !r.resolved)
    ) {
      errors.push('faire_forbidden_with_unresolved_blocking_red_flag');
    }
    if (!decision.why_faire_not_tester) {
      warnings.push('faire_should_explain_why_tester_is_not_preferable');
    }
    if (
      selectedAdjusted !== null &&
      selectedAdjusted !== undefined &&
      Number(selectedAdjusted) < 80
    ) {
      warnings.push('faire_with_adjusted_score_below_80_requires_exception_justification');
    }
  }

  if (finalVerdict === 'TESTER') {
    const missing = REQUIRED_TRUTH_TEST_FIELDS.filter((k) => !truthTest[k]);
    if (missing.length > 0) {
      errors.push('tester_forbidden_without_complete_truth_test:' + missing.join(','));
    }
    if (Object.keys(truthTest).length > 0 && !truthTest.can_kill_option) {
      errors.push('tester_forbidden_if_truth_test_cannot_kill_option');
    }
  }

  if (finalVerdict === 'DIFFÉRER') {
    const requiredDefer = ['defer_reason', 'reopening_signal', 'review_date'];
    const missing = requiredDefer.filter((k) => !decision[k]);
    if (missing.length > 0) {
      warnings.push('differer_should_include_operational_defer_fields:' + missing.join(','));
    }
  }

  if (finalVerdict === 'ABANDONNER' && !decision.abandonment_disposition) {
    warnings.push('abandonner_should_define_disposition:archive_transform_monitor_or_replace');
  }

  if (finalVerdict === 'FAIRE' || finalVerdict === 'TESTER') {
    if (!stopThreshold) errors.push('faire_or_tester_forbidden_without_stop_threshold');
    if (!reviewDate) warnings.push('faire_or_tester_should_have_review_date');
    if (!humanValidation) errors.push('final_verdict_invalid_without_human_validation');
  }

  const status = errors.length > 0 ? HARD_BLOCK : warnings.length > 0 ? CORRECT : VALID;

  return {
    audit_status: status,
    blocking_errors: errors,
    warnings,
    selected_option_id: selected?.option_id ?? null,
    selected_option_proof_level: selectedProofLevel,
    score_default_verdict:
      selectedAdjusted !== null && selectedAdjusted !== undefined
        ? expectedDefaultVerdict(Number(selectedAdjusted))
        : null,
  };
}
