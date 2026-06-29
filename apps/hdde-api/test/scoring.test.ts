import { describe, it, expect, beforeAll } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { loadPack, scoreAnswers, deriveVerdict, buildDiagnostic } from '../server/engine';
import type { DomainPack, EngineAnswer } from '../server/engine';

const packDir = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'domain_packs',
  'enterprise_hidden_dependency_discovery',
);

let pack: DomainPack;
beforeAll(() => {
  pack = loadPack(packDir);
});

// Mirrors samples/chinese_supplier_case.yaml — canonical tokens as the UI would submit them.
const chineseSupplierAnswers: EngineAnswer[] = [
  {
    question_id: 'critical_actor_replaceability_30d',
    raw_answer: 'Non, pas sans requalification technique.',
    normalized_answer: 'no',
    answer_type: 'estimate',
    evidence_quality: 2,
  },
  {
    question_id: 'hidden_tier2_visibility',
    raw_answer: 'Visibilité partielle seulement.',
    normalized_answer: 'no',
    answer_type: 'hypothesis',
    evidence_quality: 2,
  },
  {
    question_id: 'decision_thresholds_defined',
    raw_answer: 'Aucun seuil explicite formalisé.',
    normalized_answer: 'no',
    answer_type: 'verified_fact',
    evidence_quality: 3,
  },
];

describe('scoring engine (pack-driven)', () => {
  it('scores the chinese-supplier case and lands on prepare or act', () => {
    const { scores } = scoreAnswers(pack, chineseSupplierAnswers);
    expect(scores.supplier_dependency_score.value).toBeGreaterThanOrEqual(3);
    expect(scores.substitution_weakness_score.value).toBeGreaterThanOrEqual(3);
    expect(scores.decision_readiness_score.value).toBeLessThanOrEqual(2);

    const { verdict, confidence } = deriveVerdict(pack, scores);
    expect(['prepare', 'act']).toContain(verdict);
    expect(['low', 'medium', 'high']).toContain(confidence);
  });

  it('activates the expected patterns and red flags', () => {
    const { activatedPatterns, redFlags } = scoreAnswers(pack, chineseSupplierAnswers);
    expect(activatedPatterns).toContain('hidden_second_tier_dependency');
    expect(activatedPatterns).toContain('decision_threshold_absence');
    expect(redFlags.map((f) => f.id)).toContain('no_action_threshold');
    expect(redFlags.map((f) => f.id)).toContain('tier2_unknown');
  });

  it('builds a full diagnostic core with derived uncertainties and actions', () => {
    const core = buildDiagnostic(pack, chineseSupplierAnswers);
    // The client DECLARES the actor non-replaceable → a KNOWN, assumed dependency, not a hidden one.
    // The strongest finding is the overestimated/weak substitution, NOT a hardcoded hidden-tier win.
    expect(core.primary_diagnosis).toBe('substitution_capacity_overestimated');
    expect(['prepare', 'act']).toContain(core.operational_verdict);
    expect(core.scores.length).toBe(9);
    expect(core.light_actions.length).toBeGreaterThan(0);
    // Thin evidence (avg ~2) surfaces an uncertainty-reduction priority.
    expect(core.open_uncertainties.length).toBeGreaterThan(0);
    // Non-tautology: declared non-replaceable + only partial blindness ⇒ moderate divergence, not 5/5.
    expect(core.probable_real_dependency.divergence_score).toBeLessThan(5);
  });

  // --- Divergence model proofs (ADR 0040): "hidden" = declared-vs-proven gap, not a relabel. ---
  it('flags a HIGH hidden dependency when the client is overconfident (claims replaceable, unproven, blind)', () => {
    const overconfident: EngineAnswer[] = [
      { question_id: 'critical_actor_replaceability_30d', raw_answer: 'Oui, remplaçable', normalized_answer: 'yes', evidence_quality: 1 },
      { question_id: 'dependency_breaks_first', raw_answer: 'production', normalized_answer: 'production', evidence_quality: 1 },
      { question_id: 'hidden_tier2_visibility', raw_answer: 'Aucune visibilité', normalized_answer: 'no', evidence_quality: 1 },
    ];
    const core = buildDiagnostic(pack, overconfident);
    const hidden = core.scores.find((s) => s.dimension_id === 'hidden_dependency_score')!;
    expect(hidden.value).toBeGreaterThanOrEqual(4); // high exposure × high blindness
    expect(core.primary_diagnosis).toBe('hidden_second_tier_dependency');
    expect(core.probable_real_dependency.divergence_score).toBeGreaterThanOrEqual(4);
    expect(core.critical_flow.time_to_impact_days).toBeNull(); // no time answer here
  });

  it('keeps hidden dependency LOW when an equally-critical dependency is proven and visible', () => {
    const knownProven: EngineAnswer[] = [
      { question_id: 'critical_actor_replaceability_30d', raw_answer: 'Oui', normalized_answer: 'yes', evidence_quality: 5 },
      { question_id: 'substitution_real_test_proof', raw_answer: 'Bascule testée en conditions réelles en 2025.', evidence_quality: 5 },
      { question_id: 'dependency_breaks_first', raw_answer: 'production', normalized_answer: 'production', evidence_quality: 5 },
      { question_id: 'hidden_tier2_visibility', raw_answer: 'Cartographie complète', normalized_answer: 'yes', evidence_quality: 5 },
    ];
    const core = buildDiagnostic(pack, knownProven);
    const flow = core.scores.find((s) => s.dimension_id === 'flow_criticality_score')!;
    const hidden = core.scores.find((s) => s.dimension_id === 'hidden_dependency_score')!;
    expect(flow.value).toBe(5); // same high exposure as the overconfident case
    expect(hidden.value).toBeLessThanOrEqual(1); // but NOT hidden: proven + visible ⇒ low divergence
  });

  it('returns conservative defaults with no answers', () => {
    const { scores } = scoreAnswers(pack, []);
    const { verdict } = deriveVerdict(pack, scores);
    expect(verdict).toBe('monitor');
    expect(scores.supplier_dependency_score.value).toBe(0);
  });
});
