import { describe, it, expect } from 'vitest';
import type {
  ContradictionReport,
  JudgeGateVerdict,
  JudgeReport,
  ValidationEntry,
} from '@ag/schema/cockpit';
import {
  LOW_CONFIDENCE,
  disagreements,
  latestValidation,
  needsAttention,
  summarize,
  verdictTone,
} from './judge';

function verdict(p: Partial<JudgeGateVerdict>): JudgeGateVerdict {
  return {
    target_kind: 'rubric',
    target_id: 'g',
    label: 'G',
    verdict: 'pass',
    justification: '',
    evidence_quote: '',
    confidence: 0.9,
    ...p,
  };
}

function judgeReport(verdicts: JudgeGateVerdict[]): JudgeReport {
  return {
    analysis: '',
    gate_verdicts: verdicts,
    do_not_conclude: [],
    doc_id: 'atlas/x',
    content_type: 'atlas',
    slug: 'x',
    title: 'X',
    model: 'gpt-4o',
    status: 'pending',
    generated_at: '2026-07-15T00:00:00.000Z',
  };
}

function contradiction(maxSev: number): ContradictionReport {
  return {
    analysis: '',
    summary: '',
    findings:
      maxSev > 0
        ? [
            {
              claim: 'c',
              objection: 'o',
              basis: 'unsupported_claim',
              severity: maxSev,
              suggested_test: 't',
            },
          ]
        : [],
    open_questions: [],
    do_not_conclude: [],
    doc_id: 'atlas/x',
    content_type: 'atlas',
    slug: 'x',
    title: 'X',
    model: 'gpt-4o',
    status: 'pending',
    generated_at: '2026-07-15T00:00:00.000Z',
  };
}

describe('verdictTone', () => {
  it('tones a low-confidence pass as at-risk (it must not read as a clean go)', () => {
    expect(verdictTone('pass', 0.95)).toBe('on_track');
    expect(verdictTone('pass', LOW_CONFIDENCE - 0.01)).toBe('at_risk');
    expect(verdictTone('fail', 0.9)).toBe('blocked');
    expect(verdictTone('uncertain', 0.9)).toBe('at_risk');
  });
});

describe('needsAttention', () => {
  it('flags any fail/uncertain, or a low-confidence pass', () => {
    expect(needsAttention(verdict({ verdict: 'pass', confidence: 0.9 }))).toBe(false);
    expect(needsAttention(verdict({ verdict: 'pass', confidence: 0.3 }))).toBe(true);
    expect(needsAttention(verdict({ verdict: 'fail', confidence: 0.9 }))).toBe(true);
    expect(needsAttention(verdict({ verdict: 'uncertain', confidence: 0.9 }))).toBe(true);
  });
});

describe('summarize', () => {
  it('counts verdicts and how many need attention', () => {
    const s = summarize(
      judgeReport([
        verdict({ verdict: 'pass', confidence: 0.9 }),
        verdict({ verdict: 'pass', confidence: 0.2 }),
        verdict({ verdict: 'uncertain' }),
        verdict({ verdict: 'fail' }),
      ]),
    );
    expect(s).toMatchObject({ pass: 2, uncertain: 1, fail: 1, total: 4, attention: 3 });
  });
});

describe('disagreements', () => {
  it('flags judge-pass gates when the red team applies high-severity pressure', () => {
    const report = judgeReport([verdict({ verdict: 'pass' }), verdict({ verdict: 'uncertain' })]);
    // sev 4 ≥ pressure threshold → the pass verdict is contested.
    expect(disagreements(report, contradiction(4)).map((v) => v.verdict)).toEqual(['pass']);
  });

  it('finds no disagreement when the red team is quiet (low severity)', () => {
    const report = judgeReport([verdict({ verdict: 'pass' })]);
    expect(disagreements(report, contradiction(2))).toHaveLength(0);
  });

  it('is empty when either report is missing', () => {
    expect(disagreements(undefined, contradiction(5))).toHaveLength(0);
    expect(disagreements(judgeReport([verdict({})]), undefined)).toHaveLength(0);
  });
});

describe('latestValidation', () => {
  it('returns the most recent journal entry for a deliverable + target', () => {
    const entry = (id: string, at: string, targetId = 'sources_ok'): ValidationEntry => ({
      id,
      deliverable_id: 'd1',
      target_kind: 'gate',
      target_id: targetId,
      decision: 'validated',
      reserve: '',
      validated_by: 'A',
      validated_at: at,
    });
    const journal = [
      entry('1', '2026-07-10T00:00:00.000Z'),
      entry('2', '2026-07-14T00:00:00.000Z'),
      entry('3', '2026-07-12T00:00:00.000Z', 'compliance_done'),
    ];
    expect(latestValidation(journal, 'd1', 'sources_ok')?.id).toBe('2');
    expect(latestValidation(journal, 'd1', 'compliance_done')?.id).toBe('3');
    expect(latestValidation(journal, 'd1', 'human_review_done')).toBeUndefined();
  });
});
