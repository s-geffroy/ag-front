import { describe, it, expect } from 'vitest';
import { auditDecision, type AuditInput } from './audit';
import { DEFAULT_WEIGHTS } from './scoring';

/** Base fixture = the POC's `examples/valid/business_decision_standard` (a VALIDE TESTER decision).
 * Each invalid test mutates a single field, mirroring `examples/invalid/*` + `tests/test_audit_examples.py`. */
function validInput(): AuditInput {
  return {
    decision: {
      title: 'business decision standard',
      proposed_verdict: 'TESTER',
      final_verdict: 'TESTER',
      selected_option_id: 'opt_minimal',
      confidence: 'moyenne',
      human_validation: true,
      review_date: '2026-09-01',
      stop_threshold: '6 semaines sans signal d’achat',
      red_flags: [],
      truth_test: {
        critical_hypothesis: 'Les décideurs acceptent un pilote payant',
        minimal_protocol: '3 entretiens qualifiés + proposition pilote',
        max_duration: '6 semaines',
        max_cost: '1000 EUR',
        success_signal: '2 intentions de paiement',
        failure_signal: '0 engagement concret',
        decision_if_success: 'FAIRE pilote',
        decision_if_failure: 'ABANDONNER ou reformuler',
        can_kill_option: true,
      },
    },
    options: [
      {
        option_id: 'opt_main',
        type: 'main',
        critical_hypothesis: 'x',
        main_evidence: 'x',
        main_contradiction: 'x',
        proof_level: 3,
      },
      {
        option_id: 'opt_minimal',
        type: 'minimal_alternative',
        critical_hypothesis: 'x',
        main_evidence: 'x',
        main_contradiction: 'x',
        proof_level: 4,
      },
      {
        option_id: 'opt_opposite',
        type: 'opposite',
        critical_hypothesis: 'x',
        main_evidence: 'x',
        main_contradiction: 'x',
        proof_level: 3,
      },
    ],
    scores: {
      weight_profile: {
        profile: 'standard',
        adapted_before_scoring: true,
        justification: '',
        weights: { ...DEFAULT_WEIGHTS },
      },
      scores: [
        {
          option_id: 'opt_main',
          criteria: { strategic_value: 4, context_fit: 3, real_capacity: 3, systemic_viability: 3, net_risk: 3, proof_level: 3, optionality: 3 },
          raw_score: 64,
          adjusted_score: 62,
          adjustment_reasons: ['preuve niveau 3'],
        },
        {
          option_id: 'opt_minimal',
          criteria: { strategic_value: 4, context_fit: 4, real_capacity: 4, systemic_viability: 3, net_risk: 4, proof_level: 4, optionality: 4 },
          raw_score: 77,
          adjusted_score: 78,
          adjustment_reasons: ['risque limité'],
        },
        {
          option_id: 'opt_opposite',
          criteria: { strategic_value: 2, context_fit: 3, real_capacity: 5, systemic_viability: 3, net_risk: 4, proof_level: 3, optionality: 4 },
          raw_score: 67,
          adjusted_score: 64,
          adjustment_reasons: ['option sûre'],
        },
      ],
    },
  };
}

describe('auditDecision — valid case', () => {
  it('passes the standard TESTER decision as VALIDE', () => {
    const r = auditDecision(validInput());
    expect(r.blocking_errors).toEqual([]);
    expect(r.audit_status).toBe('VALIDE');
    expect(r.selected_option_id).toBe('opt_minimal');
    expect(r.selected_option_proof_level).toBe(4);
    expect(r.score_default_verdict).toBe('TESTER'); // adjusted 78 → TESTER band
  });
});

/** Helper: a hard veto must put a specific error code in blocking_errors and set status BLOQUÉ. */
function expectBlocked(input: AuditInput, codePrefix: string) {
  const r = auditDecision(input);
  expect(r.audit_status).toBe('BLOQUÉ');
  expect(r.blocking_errors.some((e) => e.startsWith(codePrefix))).toBe(true);
}

describe('auditDecision — hard vetoes (mirror examples/invalid)', () => {
  it('faire_with_low_proof: FAIRE on a proof-3 option is blocked', () => {
    const input = validInput();
    input.decision.final_verdict = 'FAIRE';
    input.decision.selected_option_id = 'opt_main'; // proof_level 3
    expectBlocked(input, 'faire_forbidden_when_selected_option_proof_level_below_4');
  });

  it('tester_without_truth_test: TESTER without a complete truth test is blocked', () => {
    const input = validInput();
    input.decision.truth_test = {};
    expectBlocked(input, 'tester_forbidden_without_complete_truth_test');
  });

  it('tester_without_kill_condition: a truth test that cannot kill the option is blocked', () => {
    const input = validInput();
    (input.decision.truth_test as Record<string, unknown>).can_kill_option = false;
    expectBlocked(input, 'tester_forbidden_if_truth_test_cannot_kill_option');
  });

  it('missing_minimal_alternative is blocked', () => {
    const input = validInput();
    input.options[1].type = 'main';
    expectBlocked(input, 'missing_minimal_alternative');
  });

  it('missing_opposite_or_active_non_action is blocked', () => {
    const input = validInput();
    input.options[2].type = 'main';
    expectBlocked(input, 'missing_opposite_or_active_non_action');
  });

  it('blocking_red_flag_ignored: FAIRE with an unresolved blocking red flag is blocked', () => {
    const input = validInput();
    input.decision.final_verdict = 'FAIRE';
    input.decision.selected_option_id = 'opt_minimal'; // proof 4, so this is the *only* trip
    input.decision.red_flags = [{ id: 'rf1', message: 'unproven', severity: 'blocking', resolved: false }];
    expectBlocked(input, 'faire_forbidden_with_unresolved_blocking_red_flag');
  });

  it('missing_human_validation is blocked for FAIRE/TESTER', () => {
    const input = validInput();
    input.decision.human_validation = false;
    expectBlocked(input, 'final_verdict_invalid_without_human_validation');
  });

  it('faire_without_stop_threshold is blocked', () => {
    const input = validInput();
    input.decision.final_verdict = 'FAIRE';
    input.decision.selected_option_id = 'opt_minimal';
    input.decision.stop_threshold = null;
    expectBlocked(input, 'faire_or_tester_forbidden_without_stop_threshold');
  });

  it('invalid_weight_adaptation: weights not summing to 100 are blocked', () => {
    const input = validInput();
    input.scores.weight_profile!.weights = { ...DEFAULT_WEIGHTS, optionality: 25 };
    expectBlocked(input, 'weights_total_must_equal_100');
  });

  it('fewer than 3 scored options is blocked', () => {
    const input = validInput();
    input.scores.scores = input.scores.scores!.slice(0, 2);
    expectBlocked(input, 'at_least_3_scored_options_required');
  });

  it('inconsistent raw_score is blocked', () => {
    const input = validInput();
    input.scores.scores![0].raw_score = 99;
    expectBlocked(input, 'raw_score_inconsistent_for_option_opt_main');
  });
});

describe('auditDecision — warnings only → À CORRIGER', () => {
  it('a DIFFÉRER missing operational fields is À CORRIGER, not blocked', () => {
    const input = validInput();
    input.decision.final_verdict = 'DIFFÉRER';
    input.decision.proposed_verdict = 'DIFFÉRER';
    // No truth test needed; no stop_threshold required for DIFFÉRER.
    const r = auditDecision(input);
    expect(r.audit_status).toBe('À CORRIGER');
    expect(r.warnings.some((w) => w.startsWith('differer_should_include_operational_defer_fields'))).toBe(true);
    expect(r.blocking_errors).toEqual([]);
  });
});
