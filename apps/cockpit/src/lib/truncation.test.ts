import { describe, expect, it } from 'vitest';
import { countLabel, readListAccount } from './truncation';

describe('readListAccount', () => {
  it('lit une enveloppe qui déclare sa troncature — le cas Ormuz', () => {
    expect(readListAccount({ count: 2000, requested_limit: 2000, may_be_truncated: true })).toEqual(
      {
        count: 2000,
        truncated: true,
        requestedLimit: 2000,
      },
    );
  });

  it('lit une enveloppe complète — le cas Malacca', () => {
    expect(readListAccount({ count: 53, requested_limit: 2000, may_be_truncated: false })).toEqual({
      count: 53,
      truncated: false,
      requestedLimit: 2000,
    });
  });

  it('compte un tableau nu sans prétendre qu’il est complet', () => {
    // Un tableau nu ne déclare rien. On ne le marque pas tronqué — on n'en sait rien — mais on ne
    // fabrique pas non plus une garantie d'exhaustivité.
    expect(readListAccount([1, 2, 3])).toEqual({
      count: 3,
      truncated: false,
      requestedLimit: null,
    });
  });

  it('ne bronche pas sur null, une chaîne ou un objet sans compte', () => {
    for (const v of [null, undefined, 'texte', {}, { count: 'beaucoup' }]) {
      expect(readListAccount(v)).toEqual({ count: null, truncated: false, requestedLimit: null });
    }
  });

  it('n’accepte que le booléen vrai comme aveu de troncature', () => {
    expect(readListAccount({ count: 5, may_be_truncated: 'true' }).truncated).toBe(false);
    expect(readListAccount({ count: 5, may_be_truncated: 1 }).truncated).toBe(false);
  });
});

describe('countLabel', () => {
  it('affiche un plancher quand la liste peut être coupée', () => {
    expect(countLabel({ count: 2000, truncated: true, requestedLimit: 2000 })).toBe('≥ 2000');
  });

  it('affiche le compte exact sinon, et rien s’il est inconnu', () => {
    expect(countLabel({ count: 53, truncated: false, requestedLimit: null })).toBe('53');
    expect(countLabel({ count: null, truncated: false, requestedLimit: null })).toBeNull();
  });
});
