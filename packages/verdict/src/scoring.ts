import { criteriaKeys } from '@ag/schema/verdict';
import type { CriterionKey, ScoreDefaultVerdict } from '@ag/schema/verdict';

/** Faithful TypeScript port of `verdict/scoring.py` (verdict_v1_poc_ui_pack).
 * The numbers ARE the method — do not "improve" the weights or thresholds without an ADR. */

// Default weights reproduce the V1 PoC multipliers (sum = 100):
//   20-point criterion ⇒ value×4 ; 15-point ⇒ value×3 ; 10-point ⇒ value×2.
export const DEFAULT_WEIGHTS: Record<CriterionKey, number> = {
  strategic_value: 20,
  context_fit: 15,
  real_capacity: 15,
  systemic_viability: 15,
  net_risk: 15,
  proof_level: 10,
  optionality: 10,
};

export const CRITERIA: readonly CriterionKey[] = criteriaKeys;

/** Adjustment limits documented by the POC (applied as explicit, reasoned penalties). */
export const ADJUSTMENT_LIMITS = {
  confidence_low: -15,
  confidence_medium: -5,
  serious_red_flag: -10,
  serious_contradiction: -10,
  proof_fragile: -5,
} as const;

type Weights = Record<string, number>;

function toNumber(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(n) ? n : 0;
}

/** Weighted /100 raw score from 0–5 criteria values. */
export function computeRawScore(
  criteria: Partial<Record<CriterionKey, number>>,
  weights: Weights = DEFAULT_WEIGHTS,
): number {
  let total = 0;
  for (const key of CRITERIA) {
    const value = toNumber(criteria[key]);
    total += (value / 5) * toNumber(weights[key]);
  }
  return Math.round(total);
}

/** Validate a weight profile: sum = 100, proof_level present & > 0, each within ±5 of its default. */
export function validateWeights(weights: unknown): string[] {
  const errors: string[] = [];
  if (typeof weights !== 'object' || weights === null || Array.isArray(weights)) {
    return ['weights_must_be_mapping'];
  }
  const w = weights as Weights;
  const values = Object.values(w);
  if (values.some((v) => !Number.isFinite(Number(v)))) {
    return ['weights_must_be_numeric'];
  }
  const total = values.reduce((acc, v) => acc + Number(v), 0);
  if (Math.round(total * 1e6) / 1e6 !== 100) {
    errors.push('weights_total_must_equal_100');
  }
  if (!('proof_level' in w) || Number(w.proof_level ?? 0) <= 0) {
    errors.push('proof_level_weight_required');
  }
  for (const key of CRITERIA) {
    const def = DEFAULT_WEIGHTS[key];
    if (!(key in w)) {
      errors.push(`missing_weight_${key}`);
      continue;
    }
    const value = Number(w[key]);
    if (!Number.isFinite(value)) {
      errors.push(`weight_must_be_numeric_${key}`);
      continue;
    }
    if (Math.abs(value - def) > 5) {
      errors.push(`weight_variation_exceeds_5_for_${key}`);
    }
    if (value <= 0) {
      errors.push(`weight_must_be_positive_${key}`);
    }
  }
  return errors;
}

/** Validate that all 7 criteria are present and in 0–5. */
export function validateCriterionValues(criteria: unknown, prefix = 'criteria'): string[] {
  const errors: string[] = [];
  if (typeof criteria !== 'object' || criteria === null || Array.isArray(criteria)) {
    return [`${prefix}_must_be_mapping`];
  }
  const c = criteria as Record<string, unknown>;
  for (const key of CRITERIA) {
    if (!(key in c)) {
      errors.push(`missing_${prefix}_${key}`);
      continue;
    }
    const value = Number(c[key]);
    if (!Number.isFinite(value)) {
      errors.push(`${prefix}_${key}_must_be_number`);
      continue;
    }
    if (value < 0 || value > 5) {
      errors.push(`${prefix}_${key}_must_be_between_0_and_5`);
    }
  }
  return errors;
}

export type Penalty = { points: number; reason?: string };
export type Cap = { max_score: number; active?: boolean; reason?: string };

/** Adjusted score = raw + penalties, then capped, clamped to 0–100. */
export function computeAdjustedScore(
  rawScore: number,
  penalties: Penalty[] = [],
  caps: Cap[] = [],
): number {
  let score = Math.trunc(rawScore || 0);
  for (const penalty of penalties) {
    score += Math.trunc(toNumber(penalty.points));
  }
  for (const cap of caps) {
    if (cap.active ?? true) {
      const max = Math.trunc(toNumber(cap.max_score));
      score = Math.min(score, max);
    }
  }
  return Math.max(0, Math.min(100, score));
}

/** The default verdict the score alone would suggest — NEVER the decision (vetoes override). */
export function expectedDefaultVerdict(adjustedScore: number): ScoreDefaultVerdict {
  if (adjustedScore >= 80) return 'FAIRE_POSSIBLE';
  if (adjustedScore >= 60) return 'TESTER';
  if (adjustedScore >= 40) return 'DIFFÉRER';
  return 'ABANDONNER';
}
