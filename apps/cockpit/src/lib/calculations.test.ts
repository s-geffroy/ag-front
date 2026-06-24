import { describe, it, expect } from 'vitest';
import type { Deliverable } from '@ag/schema/cockpit';
import { globalHealth, isLate, p0ToPush, qualityAlerts, criticalBlockers } from './calculations';

const NOW = new Date('2026-06-22T00:00:00Z');

function deliv(over: Partial<Deliverable>): Deliverable {
  return {
    id: 'd',
    title: 't',
    description: '',
    type: 'note',
    pillar: 'production',
    status: 'production',
    priority: 'P2',
    progress: 0,
    deadline: '2026-12-31',
    next_action: '',
    impact: '',
    offer: 'public',
    quality_gate_status: 'ok',
    gates: {
      sources_ok: true,
      llm_draft_done: true,
      contradiction_done: true,
      compliance_done: true,
      human_review_done: true,
    },
    ...over,
  };
}

describe('globalHealth', () => {
  it('is blocked when a P0 is blocked', () => {
    const d = [deliv({ priority: 'P0', quality_gate_status: 'blocked' }), deliv({})];
    expect(globalHealth(d, NOW)).toBe('blocked');
  });

  it('is at_risk when a P0 is at risk or late', () => {
    expect(globalHealth([deliv({ priority: 'P0', quality_gate_status: 'at_risk' })], NOW)).toBe(
      'at_risk',
    );
    expect(globalHealth([deliv({ priority: 'P0', deadline: '2026-01-01' })], NOW)).toBe('at_risk');
    expect(globalHealth([deliv({ priority: 'P0', blocker: 'sources manquantes' })], NOW)).toBe(
      'at_risk',
    );
  });

  it('ignores published P0s', () => {
    expect(
      globalHealth(
        [deliv({ priority: 'P0', status: 'published', quality_gate_status: 'blocked' })],
        NOW,
      ),
    ).toBe('on_track');
  });

  it('is on_track otherwise', () => {
    expect(globalHealth([deliv({ priority: 'P0' }), deliv({ priority: 'P1' })], NOW)).toBe(
      'on_track',
    );
  });
});

describe('isLate', () => {
  it('is true for a past deadline on a non-published item', () => {
    expect(isLate(deliv({ deadline: '2026-01-01' }), NOW)).toBe(true);
  });
  it('is false once published', () => {
    expect(isLate(deliv({ deadline: '2026-01-01', status: 'published' }), NOW)).toBe(false);
  });
});

describe('p0ToPush', () => {
  it('orders P0 before lower priorities and excludes published', () => {
    const list = [
      deliv({ id: 'low', priority: 'P2' }),
      deliv({ id: 'done', priority: 'P0', status: 'published' }),
      deliv({ id: 'high', priority: 'P0', deadline: '2026-07-01' }),
      deliv({ id: 'blocked', priority: 'P0', deadline: '2026-08-01', blocker: 'x' }),
    ];
    const top = p0ToPush(list, NOW, 3).map((d) => d.id);
    expect(top[0]).toBe('blocked'); // P0 + blocker wins the tie-break before deadline
    expect(top).toContain('high');
    expect(top).not.toContain('done');
  });
});

describe('qualityAlerts', () => {
  it('flags ready/published items with missing gates', () => {
    const list = [
      deliv({ id: 'ok', status: 'ready' }),
      deliv({
        id: 'bad',
        status: 'ready',
        gates: {
          sources_ok: false,
          llm_draft_done: true,
          contradiction_done: false,
          compliance_done: false,
          human_review_done: false,
        },
      }),
      deliv({
        id: 'inprog',
        status: 'production',
        gates: {
          sources_ok: false,
          llm_draft_done: false,
          contradiction_done: false,
          compliance_done: false,
          human_review_done: false,
        },
      }),
    ];
    const alerts = qualityAlerts(list);
    expect(alerts.map((a) => a.deliverable.id)).toEqual(['bad']);
    expect(alerts[0]!.missing).toContain('revue humaine');
  });
});

describe('criticalBlockers', () => {
  it('returns non-published deliverables carrying a blocker', () => {
    const list = [
      deliv({ id: 'b', blocker: 'x' }),
      deliv({ id: 'n' }),
      deliv({ id: 'p', status: 'published', blocker: 'x' }),
    ];
    expect(criticalBlockers(list).map((d) => d.id)).toEqual(['b']);
  });
});
