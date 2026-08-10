import { describe, expect, it } from 'vitest';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { byCorridor, feedStatus, freshClusters, promotionState } from './news-digest.mjs';

const now = new Date('2026-08-10T12:00:00Z');
const c = (o) => ({ cluster_id: 'x', affected_chokepoints: [], ...o });

describe('feedStatus — le statut épistémique d’un flux vide', () => {
  it('distingue un flux vide honnête d’une agrégation qui n’a jamais tourné', () => {
    // Le contrat est explicite : count 0 AVEC run_id = semaine calme ; SANS run_id = pipeline muet.
    // Les confondre transformerait une panne amont en « pas d’actualité ».
    expect(feedStatus({ count: 0, run_id: 'run_42' })).toBe('empty_honest');
    expect(feedStatus({ count: 0 })).toBe('never_ran');
    expect(feedStatus({ count: 0, run_id: null })).toBe('never_ran');
  });

  it('reconnaît un flux servi et un flux absent', () => {
    expect(feedStatus({ count: 3, run_id: 'r' })).toBe('ok');
    expect(feedStatus(null)).toBe('unreachable');
  });
});

describe('freshClusters', () => {
  it('retient ce qui tombe dans la fenêtre, sur last_seen de préférence', () => {
    const out = freshClusters(
      [
        c({ cluster_id: 'récent', last_seen: '2026-08-09T00:00:00Z' }),
        c({ cluster_id: 'vieux', last_seen: '2026-07-01T00:00:00Z' }),
        c({ cluster_id: 'first_seen seul', first_seen: '2026-08-08T00:00:00Z' }),
      ],
      now,
      7,
    );
    expect(out.map((x) => x.cluster_id)).toEqual(['récent', 'first_seen seul']);
  });

  it('ne suppose jamais qu’un cluster sans date est frais', () => {
    expect(freshClusters([c({}), c({ last_seen: 'pas-une-date' })], now, 7)).toEqual([]);
  });
});

describe('byCorridor', () => {
  it('compte par corridor, le plus fourni d’abord, un cluster pouvant en toucher plusieurs', () => {
    const out = byCorridor([
      c({ affected_chokepoints: [{ chokepoint_id: 'hormuz' }, { chokepoint_id: 'suez' }] }),
      c({ affected_chokepoints: [{ chokepoint_id: 'hormuz' }] }),
    ]);
    expect(out).toEqual([
      ['hormuz', 2],
      ['suez', 1],
    ]);
  });

  it('tolère une forme d’identifiant inattendue sans planter le digest', () => {
    expect(byCorridor([c({ affected_chokepoints: [{ id: 'a' }, 'b', { autre: 1 }] })])).toEqual([
      ['a', 1],
      ['b', 1],
    ]);
  });
});

describe('promotionState', () => {
  it('distingue un store absent d’un store vide', () => {
    // Absent = le dispositif n’a jamais tourné ; vide = il a tourné et rien n’a été promu.
    const dir = mkdtempSync(join(tmpdir(), 'promo-'));
    try {
      expect(promotionState(join(dir, 'nexiste-pas.json'), now).exists).toBe(false);
      const f = join(dir, 'p.json');
      writeFileSync(f, '{}');
      const s = promotionState(f, now);
      expect(s.exists).toBe(true);
      expect(s.items).toBe(0);
      expect(s.corridors).toBe(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('compte les items promus à travers les corridors', () => {
    const dir = mkdtempSync(join(tmpdir(), 'promo-'));
    try {
      const f = join(dir, 'p.json');
      writeFileSync(f, JSON.stringify({ hormuz: [{ a: 1 }, { a: 2 }], suez: [{ a: 3 }] }));
      const s = promotionState(f, now);
      expect(s.items).toBe(3);
      expect(s.corridors).toBe(2);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});
