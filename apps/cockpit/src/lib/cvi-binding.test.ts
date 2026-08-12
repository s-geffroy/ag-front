import { describe, expect, it } from 'vitest';
import { cviBinding, levelForScore } from './cvi-binding';

const d = (o: Record<string, number>) =>
  Object.fromEntries(Object.entries(o).map(([k, score]) => [k, { score }]));

describe('cviBinding — le niveau tient-il à une dimension dérivée d’une absence ?', () => {
  it('Ormuz : trois dimensions à 5, le niveau ne tient PAS à concentration', () => {
    // Valeurs réelles relevées le 2026-08-12.
    const b = cviBinding(
      d({
        capacite_perturbation: 3,
        concentration: 4,
        cout_contournement: 5,
        exposition: 5,
        gouvernance: 2,
        incertitude: 0,
        menace: 5,
      }),
    );
    expect(b.max).toBe(5);
    expect(b.boundByInferred).toBe(false);
    expect(b.maxWithoutInferred).toBe(5);
  });

  it('la cohorte des 305 : concentration seule à 5, le niveau tombera', () => {
    const b = cviBinding(d({ concentration: 5, exposition: 2, gouvernance: 1 }));
    expect(b.boundByInferred).toBe(true);
    expect(levelForScore(b.max)).toBe('critique');
    expect(levelForScore(b.maxWithoutInferred)).toBe('modere');
  });

  it('une égalité ne lie rien : la retirer ne changerait pas le niveau', () => {
    const b = cviBinding(d({ concentration: 5, menace: 5 }));
    expect(b.boundByInferred).toBe(false);
  });

  it('exclut incertitude du maximum — notre handoff 0026 se trompait sur ce point', () => {
    // Si incertitude comptait, le max vaudrait 5 et le niveau serait « critique ».
    const b = cviBinding(d({ incertitude: 5, exposition: 2 }));
    expect(b.max).toBe(2);
    expect(levelForScore(b.max)).toBe('modere');
  });

  it('ne conclut rien quand aucune dimension n’est servie', () => {
    expect(cviBinding({})).toEqual({ max: null, boundByInferred: false, maxWithoutInferred: null });
    expect(cviBinding(undefined)).toEqual({
      max: null,
      boundByInferred: false,
      maxWithoutInferred: null,
    });
  });

  it('respecte les bandes servies par l’amont', () => {
    expect(levelForScore(0)).toBe('bas');
    expect(levelForScore(1)).toBe('bas');
    expect(levelForScore(2)).toBe('modere');
    expect(levelForScore(3)).toBe('eleve');
    expect(levelForScore(4)).toBe('critique');
    expect(levelForScore(null)).toBeNull();
  });
});
