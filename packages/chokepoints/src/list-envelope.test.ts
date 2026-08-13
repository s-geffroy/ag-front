import { describe, expect, it } from 'vitest';
import { envelopeCountLabel, readListEnvelope } from './list-envelope';

const asIs = (x: unknown) => (Array.isArray(x) ? (x as number[]) : []);

describe('readListEnvelope — survivre à la bascule 1.0.0 sans mentir avant', () => {
  it('lit la forme historique, un tableau nu, sans rien déduire de sa longueur', () => {
    const e = readListEnvelope([1, 2, 3], asIs);
    expect(e.items).toEqual([1, 2, 3]);
    expect(e.total).toBeNull();
    expect(e.truncated).toBeNull(); // surtout PAS false
    expect(e.limit).toBeNull();
  });

  it('lit l’enveloppe comptée annoncée pour 1.0.0', () => {
    const e = readListEnvelope(
      {
        items: [1, 2],
        returned: 2,
        total_count: 6488,
        truncated: true,
        limit: 2000,
        generated_at: '2026-08-12T06:00:00Z',
      },
      asIs,
    );
    expect(e.total).toBe(6488);
    expect(e.truncated).toBe(true);
    expect(e.limit).toBe(2000);
    expect(e.generatedAt).toBe('2026-08-12T06:00:00Z');
  });

  it('accepte results/data, pour ne pas casser sur un détail de nommage', () => {
    expect(readListEnvelope({ results: [1] }, asIs).items).toEqual([1]);
    expect(readListEnvelope({ data: [1, 2] }, asIs).items).toEqual([1, 2]);
  });

  it('ne prend que le booléen true pour un aveu de troncature', () => {
    expect(readListEnvelope({ items: [], truncated: 'true' }, asIs).truncated).toBeNull();
    expect(readListEnvelope({ items: [], truncated: 1 }, asIs).truncated).toBeNull();
    expect(readListEnvelope({ items: [], truncated: false }, asIs).truncated).toBe(false);
  });

  it('ne casse pas sur null, une chaîne ou un objet vide', () => {
    for (const raw of [null, undefined, 'oups', {}]) {
      expect(readListEnvelope(raw, asIs).items).toEqual([]);
    }
  });
});

describe('envelopeCountLabel — un plancher tant que le total est inconnu', () => {
  it('rend le total quand l’amont le déclare', () => {
    expect(envelopeCountLabel(readListEnvelope({ items: [1, 2], total_count: 6488 }, asIs))).toBe(
      '6488',
    );
  });

  it('rend un plancher quand l’amont avoue couper', () => {
    expect(envelopeCountLabel(readListEnvelope({ items: [1, 2], truncated: true }, asIs))).toBe(
      '≥ 2',
    );
  });

  it('rend un plancher quand la réponse touche exactement la limite', () => {
    expect(envelopeCountLabel(readListEnvelope({ items: [1, 2], limit: 2 }, asIs))).toBe('≥ 2');
  });

  it('rend le compte simple quand rien ne suggère une coupe', () => {
    expect(envelopeCountLabel(readListEnvelope([1, 2, 3], asIs))).toBe('3');
  });
});

// Le client lui-même : la garde qui manquait le 2026-08-13.
describe('parseList (client) — accepter les deux formes du contrat', () => {
  it('documente le défaut : un z.array() strict a fait perdre 81 pages au site public', () => {
    // Le 1.0.0 a été servi AVANT son annonce. `z.array(...).parse(enveloppe)` levait, la dégradation
    // gracieuse rendait [], et le build passait de 131 à 48 pages SANS une erreur — un `catch` écrit
    // pour survivre à une panne réseau a traité un changement de forme comme une indisponibilité.
    // Ce test fige la forme servie ce jour-là.
    const servi = {
      returned: 82,
      total_count: 82,
      truncated: false,
      limit: null,
      generated_at: '2026-08-13T09:05:53.345528Z',
      items: [{ id: 'sys_red_sea_suez', name: 'Mer Rouge / Suez' }],
    };
    const e = readListEnvelope(servi, (x) => x as { id: string }[]);
    expect(e.items).toHaveLength(1);
    expect(e.total).toBe(82);
    expect(e.truncated).toBe(false);
  });
});
