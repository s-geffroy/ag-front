import { describe, it, expect } from 'vitest';
import { levelFromScore } from './levels';
import { validateCvi, assertCvi } from './validate';
import { cviDimensionKeys, cviDimensions } from './dimensions';

describe('levelFromScore', () => {
  it('maps 0–5 to qualitative levels', () => {
    expect(levelFromScore(0)).toBe('bas');
    expect(levelFromScore(1)).toBe('bas');
    expect(levelFromScore(2)).toBe('modere');
    expect(levelFromScore(3)).toBe('eleve');
    expect(levelFromScore(4)).toBe('critique');
    expect(levelFromScore(5)).toBe('critique');
  });

  it('rejects out-of-range / non-integer scores', () => {
    expect(() => levelFromScore(6)).toThrow();
    expect(() => levelFromScore(-1)).toThrow();
    expect(() => levelFromScore(2.5)).toThrow();
  });
});

describe('CVI hard rule — no 0–100 without documented methodology', () => {
  it('rejects a 0–100 aggregate when methodology is not documented', () => {
    const r = validateCvi({ scale: '0-100', aggregate_score: 72, methodology_documented: false });
    expect(r.ok).toBe(false);
    expect(r.issues.map((i) => i.code)).toContain('methodology_required');
  });

  it('accepts a 0–100 aggregate with documented methodology', () => {
    const r = validateCvi({ scale: '0-100', aggregate_score: 72, methodology_documented: true });
    expect(r.ok).toBe(true);
  });

  it('rejects a 0–100 scale missing its aggregate score', () => {
    const r = validateCvi({ scale: '0-100', methodology_documented: true });
    expect(r.ok).toBe(false);
    expect(r.issues.map((i) => i.code)).toContain('aggregate_missing');
  });
});

describe('CVI 0-5 scale', () => {
  it('requires per-dimension scores', () => {
    const r = validateCvi({ scale: '0-5' });
    expect(r.ok).toBe(false);
    expect(r.issues.map((i) => i.code)).toContain('dimensions_missing');
  });

  it('accepts well-formed dimension scores and rejects out-of-range', () => {
    const ok = validateCvi({
      scale: '0-5',
      dimensions: { exposition: { score: 5, rationale: '12% du commerce maritime mondial' } },
    });
    expect(ok.ok).toBe(true);

    const bad = validateCvi({ scale: '0-5', dimensions: { exposition: { score: 9, rationale: 'x' } } });
    expect(bad.ok).toBe(false);
  });
});

describe('qualitative scale', () => {
  it('accepts a global_level only', () => {
    expect(assertCvi({ scale: 'qualitative', global_level: 'eleve' }).scale).toBe('qualitative');
  });
});

describe('dimension catalogue', () => {
  it('defines exactly the 8 CVI dimensions', () => {
    expect(cviDimensionKeys).toHaveLength(8);
    expect(Object.keys(cviDimensions).sort()).toEqual([...cviDimensionKeys].sort());
  });
});
