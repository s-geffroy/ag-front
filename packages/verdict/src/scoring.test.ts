import { describe, it, expect } from 'vitest';
import {
  DEFAULT_WEIGHTS,
  computeRawScore,
  validateWeights,
  validateCriterionValues,
  computeAdjustedScore,
  expectedDefaultVerdict,
} from './scoring';

describe('computeRawScore — reproduces the POC example math', () => {
  it('scores opt_main = 64', () => {
    expect(
      computeRawScore({
        strategic_value: 4,
        context_fit: 3,
        real_capacity: 3,
        systemic_viability: 3,
        net_risk: 3,
        proof_level: 3,
        optionality: 3,
      }),
    ).toBe(64);
  });

  it('scores opt_minimal = 77', () => {
    expect(
      computeRawScore({
        strategic_value: 4,
        context_fit: 4,
        real_capacity: 4,
        systemic_viability: 3,
        net_risk: 4,
        proof_level: 4,
        optionality: 4,
      }),
    ).toBe(77);
  });

  it('scores opt_opposite = 67', () => {
    expect(
      computeRawScore({
        strategic_value: 2,
        context_fit: 3,
        real_capacity: 5,
        systemic_viability: 3,
        net_risk: 4,
        proof_level: 3,
        optionality: 4,
      }),
    ).toBe(67);
  });

  it('all-5 criteria reach 100; all-0 reach 0', () => {
    const all = (v: number) => Object.fromEntries(Object.keys(DEFAULT_WEIGHTS).map((k) => [k, v]));
    expect(computeRawScore(all(5))).toBe(100);
    expect(computeRawScore(all(0))).toBe(0);
  });
});

describe('validateWeights', () => {
  it('accepts the standard profile', () => {
    expect(validateWeights(DEFAULT_WEIGHTS)).toEqual([]);
  });

  it('rejects weights that do not sum to 100', () => {
    expect(validateWeights({ ...DEFAULT_WEIGHTS, optionality: 20 })).toContain(
      'weights_total_must_equal_100',
    );
  });

  it('requires a positive proof_level weight', () => {
    const w: Record<string, number> = { ...DEFAULT_WEIGHTS, proof_level: 0, optionality: 20 };
    expect(validateWeights(w)).toContain('proof_level_weight_required');
  });

  it('rejects a variation greater than ±5 from the default', () => {
    // strategic_value 20→13 (−7), push the 7 onto net_risk to keep the sum at 100.
    const w = { ...DEFAULT_WEIGHTS, strategic_value: 13, net_risk: 22 };
    const errors = validateWeights(w);
    expect(errors).toContain('weight_variation_exceeds_5_for_strategic_value');
    expect(errors).toContain('weight_variation_exceeds_5_for_net_risk');
  });
});

describe('validateCriterionValues', () => {
  it('flags out-of-range and missing criteria', () => {
    const errors = validateCriterionValues({ strategic_value: 9 });
    expect(errors).toContain('criteria_strategic_value_must_be_between_0_and_5');
    expect(errors).toContain('missing_criteria_optionality');
  });
});

describe('computeAdjustedScore', () => {
  it('applies penalties and clamps to 0–100', () => {
    expect(computeAdjustedScore(77, [{ points: -15 }])).toBe(62);
    expect(computeAdjustedScore(10, [{ points: -50 }])).toBe(0);
    expect(computeAdjustedScore(95, [{ points: 20 }])).toBe(100);
  });

  it('honours an active cap', () => {
    expect(computeAdjustedScore(90, [], [{ max_score: 79 }])).toBe(79);
    expect(computeAdjustedScore(90, [], [{ max_score: 79, active: false }])).toBe(90);
  });
});

describe('expectedDefaultVerdict — score thresholds', () => {
  it('maps adjusted score to the default verdict band', () => {
    expect(expectedDefaultVerdict(85)).toBe('FAIRE_POSSIBLE');
    expect(expectedDefaultVerdict(80)).toBe('FAIRE_POSSIBLE');
    expect(expectedDefaultVerdict(70)).toBe('TESTER');
    expect(expectedDefaultVerdict(60)).toBe('TESTER');
    expect(expectedDefaultVerdict(50)).toBe('DIFFÉRER');
    expect(expectedDefaultVerdict(40)).toBe('DIFFÉRER');
    expect(expectedDefaultVerdict(39)).toBe('ABANDONNER');
  });
});
