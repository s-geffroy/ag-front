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
    expect(core.primary_diagnosis).toBe('hidden_second_tier_dependency');
    expect(['prepare', 'act']).toContain(core.operational_verdict);
    expect(core.scores.length).toBe(9);
    expect(core.light_actions.length).toBeGreaterThan(0);
    // Thin evidence (avg ~2) surfaces an uncertainty-reduction priority.
    expect(core.open_uncertainties.length).toBeGreaterThan(0);
  });

  it('returns conservative defaults with no answers', () => {
    const { scores } = scoreAnswers(pack, []);
    const { verdict } = deriveVerdict(pack, scores);
    expect(verdict).toBe('monitor');
    expect(scores.supplier_dependency_score.value).toBe(0);
  });
});
