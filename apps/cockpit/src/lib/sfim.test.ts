import { describe, it, expect } from 'vitest';
import { isSfimVerdict, scoredDimensionRange, sfimVerdictTone, sfuFieldKind } from './sfim';

describe('isSfimVerdict', () => {
  it('accepts the five terms of their published `sfim_verdicts`', () => {
    for (const v of ['INTEGRATE', 'STABILIZE', 'FRAGMENT', 'DISINTEGRATE', 'MONITOR']) {
      expect(isSfimVerdict(v)).toBe(true);
    }
  });

  it('rejects the VERDICT protocol vocabulary, which is a different method entirely', () => {
    // Le défaut corrigé : l'écran SFIM colorait FAIRE / TESTER / ABANDONNER, qui appartiennent au
    // protocole VERDICT (`@ag/verdict`) et ne sortiront jamais de cette API.
    expect(isSfimVerdict('FAIRE')).toBe(false);
    expect(isSfimVerdict('TESTER')).toBe(false);
    expect(isSfimVerdict('ABANDONNER')).toBe(false);
  });

  it('is case-sensitive — their ADR 0114 forbids lowercasing these terms', () => {
    expect(isSfimVerdict('integrate')).toBe(false);
  });

  it('rejects an absent decision', () => {
    expect(isSfimVerdict(null)).toBe(false);
    expect(isSfimVerdict(undefined)).toBe(false);
  });
});

describe('sfimVerdictTone', () => {
  it('marks a term outside their own vocabulary as an anomaly, whatever its status', () => {
    expect(sfimVerdictTone('FAIRE', 'accepted')).toBe('blocked');
    expect(sfimVerdictTone('ANYTHING', 'candidate')).toBe('blocked');
  });

  it('colours the VALIDATION, not the decision: only `accepted` is a human-signed verdict', () => {
    // `awaiting_analyst_verdict = verdict_status != "accepted"` chez eux (web/sfim.py). Aucune des
    // cinq décisions n'est « bonne » ou « mauvaise » — leur vocabulaire ne publie aucun ordre.
    expect(sfimVerdictTone('DISINTEGRATE', 'accepted')).toBe('on_track');
    expect(sfimVerdictTone('INTEGRATE', 'accepted')).toBe('on_track');
  });

  it('flags a reviewed-but-unaccepted verdict — leur porte ne s’est pas ouverte', () => {
    expect(sfimVerdictTone('DISINTEGRATE', 'reviewed')).toBe('at_risk');
  });

  it('leaves a machine candidate neutral — it asserts nothing yet', () => {
    expect(sfimVerdictTone('MONITOR', 'candidate')).toBe('neutral');
    expect(sfimVerdictTone('MONITOR', null)).toBe('neutral');
    expect(sfimVerdictTone('MONITOR', 'un_statut_inconnu')).toBe('neutral');
  });
});

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
