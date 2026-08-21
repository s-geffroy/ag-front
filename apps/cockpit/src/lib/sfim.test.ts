import { describe, it, expect } from 'vitest';
import { scoredDimensionRange, sfuFieldKind } from './sfim';

describe('scoredDimensionRange', () => {
  it('reads the measured spread rather than a hard-coded count', () => {
    // Mesuré le 2026-08-21 contre la production : 5 unités à 4, 2 unités à 3.
    const items = [3, 4, 4, 4, 3, 4, 4].map((n) => ({ dimensions_scored: n }));
    expect(scoredDimensionRange(items)).toEqual({ min: 3, max: 4, label: '3 à 4' });
  });

  it('collapses to a single figure when every unit agrees', () => {
    const items = [4, 4, 4].map((n) => ({ dimensions_scored: n }));
    expect(scoredDimensionRange(items)).toEqual({ min: 4, max: 4, label: '4' });
  });

  it('treats a missing numerator as zero, never as absent', () => {
    expect(scoredDimensionRange([{ dimensions_scored: null }, { dimensions_scored: 2 }])).toEqual({
      min: 0,
      max: 2,
      label: '0 à 2',
    });
    expect(scoredDimensionRange([{}])).toEqual({ min: 0, max: 0, label: '0' });
  });

  it('returns null on an empty list — there is no range to state', () => {
    expect(scoredDimensionRange([])).toBeNull();
  });
});

describe('sfuFieldKind', () => {
  // Les cinq blocs de la fiche SFU sont typés `items: {}` au contrat : le producteur ne promet AUCUNE
  // forme. La classification ci-dessous ne décide donc jamais QUOI afficher — tout est affiché — elle
  // ne décide que COMMENT. Une valeur qu'elle ne sait pas présenter retombe sur son JSON, jamais sur
  // le silence.
  it('marks an absent value as empty rather than rendering "null"', () => {
    expect(sfuFieldKind(null).kind).toBe('empty');
    expect(sfuFieldKind(undefined).kind).toBe('empty');
    expect(sfuFieldKind('').kind).toBe('empty');
    expect(sfuFieldKind('   ').kind).toBe('empty');
    expect(sfuFieldKind([]).kind).toBe('empty');
  });

  it('renders a short string inline', () => {
    expect(sfuFieldKind('primary')).toEqual({ kind: 'scalar', text: 'primary' });
  });

  it('renders numbers and booleans inline, zero and false included', () => {
    expect(sfuFieldKind(0)).toEqual({ kind: 'scalar', text: '0' });
    expect(sfuFieldKind(false)).toEqual({ kind: 'scalar', text: 'false' });
  });

  it('promotes a long string to its own paragraph', () => {
    const long =
      'Advanced-node production concentrated on the Taiwan fab cluster, upstream of the EUV ' +
      'lithography and high-purity quartz supply chokepoints it depends on.';
    expect(sfuFieldKind(long)).toEqual({ kind: 'text', text: long });
  });

  it('renders a list of identifiers as chips', () => {
    expect(sfuFieldKind(['p0_maritime_strait_taiwan_strait', 'p1_x'])).toEqual({
      kind: 'chips',
      items: ['p0_maritime_strait_taiwan_strait', 'p1_x'],
    });
    expect(sfuFieldKind([1, 2])).toEqual({ kind: 'chips', items: ['1', '2'] });
  });

  it('falls back to JSON for a shape it cannot present — nothing is dropped', () => {
    expect(sfuFieldKind({ nested: true })).toEqual({
      kind: 'json',
      json: JSON.stringify({ nested: true }, null, 2),
    });
    expect(sfuFieldKind([{ a: 1 }])).toEqual({
      kind: 'json',
      json: JSON.stringify([{ a: 1 }], null, 2),
    });
    // Tableau mixte : une moitié présentable ne suffit pas, on montre l'ensemble tel qu'il est.
    expect(sfuFieldKind(['a', { b: 2 }]).kind).toBe('json');
  });
});
