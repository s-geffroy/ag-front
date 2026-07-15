import { describe, it, expect } from 'vitest';
import type { Deliverable, MunichStatus } from '@ag/schema/cockpit';
import { resolveGateValidation } from './validate';

function deliverable(overrides: Partial<Deliverable> = {}): Deliverable {
  return {
    id: 'deliv_x',
    title: 'X',
    description: '',
    type: 'atlas_fiche',
    pillar: 'production',
    status: 'review',
    priority: 'P0',
    progress: 80,
    deadline: '2026-08-01',
    next_action: '',
    impact: '',
    offer: 'basic',
    quality_gate_status: 'at_risk',
    gates: {
      sources_ok: false,
      llm_draft_done: true,
      contradiction_done: false,
      compliance_done: false,
      human_review_done: false,
      cvi_justified: false,
    },
    ...overrides,
  };
}

const allMunichOk: Record<string, MunichStatus> = Object.fromEntries(
  Array.from({ length: 10 }, (_, i) => [String(i + 1), 'ok' as const]),
);

describe('resolveGateValidation', () => {
  it('rejects an unknown gate / munich target', () => {
    const d = deliverable();
    expect(
      resolveGateValidation(d, { target_kind: 'gate', target_id: 'nope', decision: 'validated' }),
    ).toMatchObject({ ok: false, error: 'unknown_gate' });
    expect(
      resolveGateValidation(d, { target_kind: 'munich', target_id: '11', decision: 'validated' }),
    ).toMatchObject({ ok: false, error: 'unknown_munich_control' });
    expect(
      resolveGateValidation(d, {
        target_kind: 'cvi',
        target_id: 'sources_ok',
        decision: 'validated',
      }),
    ).toMatchObject({ ok: false, error: 'unknown_gate' });
  });

  it('ticks a gate on validate and captures before → after', () => {
    const r = resolveGateValidation(deliverable(), {
      target_kind: 'gate',
      target_id: 'sources_ok',
      decision: 'validated',
    });
    expect(r).toEqual({ ok: true, isMunich: false, before: false, after: true });
  });

  it('un-ticks a gate on reject (a rejection is a nominative act too)', () => {
    const d = deliverable({ gates: { ...deliverable().gates, sources_ok: true } });
    const r = resolveGateValidation(d, {
      target_kind: 'gate',
      target_id: 'sources_ok',
      decision: 'rejected',
    });
    expect(r).toEqual({ ok: true, isMunich: false, before: true, after: false });
  });

  it('refuses compliance_done while any Munich control is not ok (ADR 0037)', () => {
    const partial = { ...allMunichOk, '7': 'todo' as const };
    const r = resolveGateValidation(deliverable({ munich: partial }), {
      target_kind: 'gate',
      target_id: 'compliance_done',
      decision: 'validated',
    });
    expect(r).toMatchObject({ ok: false, error: 'munich_incomplete' });
  });

  it('allows compliance_done once all 10 Munich controls are ok', () => {
    const r = resolveGateValidation(deliverable({ munich: allMunichOk }), {
      target_kind: 'gate',
      target_id: 'compliance_done',
      decision: 'validated',
    });
    expect(r).toEqual({ ok: true, isMunich: false, before: false, after: true });
  });

  it('maps a Munich validation to ok / a rejection to todo', () => {
    const d = deliverable({ munich: { '1': 'todo' } });
    expect(
      resolveGateValidation(d, { target_kind: 'munich', target_id: '1', decision: 'validated' }),
    ).toEqual({ ok: true, isMunich: true, before: 'todo', after: 'ok' });
    const d2 = deliverable({ munich: { '1': 'ok' } });
    expect(
      resolveGateValidation(d2, { target_kind: 'munich', target_id: '1', decision: 'rejected' }),
    ).toEqual({ ok: true, isMunich: true, before: 'ok', after: 'todo' });
  });
});
