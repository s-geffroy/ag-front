import { describe, expect, it } from 'vitest';
import type { NewsClusterOut } from '@ag/chokepoints';
import {
  containment,
  findParaphrase,
  noteFingerprint,
  paraphraseCandidates,
  PARAPHRASE_CONTAINMENT,
} from './promote-news';

// Le titre réel servi par l'API le 2026-08-10, en français, tel que le promoteur le voit.
const HEADLINE = 'L’Iran lie la réouverture du détroit d’Ormuz à des concessions américaines';

describe('noteFingerprint', () => {
  it('ignore accents, casse, ponctuation et mots-outils français', () => {
    expect(noteFingerprint('L’Iran, à la réouverture !')).toEqual(['iran', 'reouverture']);
  });

  it('ne retient pas les mots-outils qui feraient se ressembler deux phrases sans rapport', () => {
    const a = noteFingerprint('Le passage de la mer dans les faits');
    const b = noteFingerprint('La prime des navires sur le marché');
    expect(containment(a, b)).toBe(0);
  });

  it('rend une empreinte vide pour une chaîne vide', () => {
    expect(noteFingerprint('')).toEqual([]);
    expect(noteFingerprint('   ')).toEqual([]);
  });
});

describe('containment plutôt que Jaccard', () => {
  it('attrape une note brève entièrement contenue dans un titre long', () => {
    // C'est le cas que Jaccard raterait : peu de mots communs rapportés à l'union, mais la note
    // n'apporte rien. Jaccard ≈ 0,4 ici ; le recouvrement vaut 1.
    const note = noteFingerprint('Iran réouverture Ormuz');
    const titre = noteFingerprint(HEADLINE);
    expect(containment(note, titre)).toBe(1);
  });

  it('vaut 0 pour une note vide, sans diviser par zéro', () => {
    expect(containment([], noteFingerprint(HEADLINE))).toBe(0);
  });
});

describe('findParaphrase', () => {
  it('refuse la recopie du titre du modèle', () => {
    const hit = findParaphrase(
      'L’Iran conditionne la réouverture du détroit d’Ormuz à des concessions américaines',
      [HEADLINE],
    );
    expect(hit).not.toBeNull();
    expect(hit!.source).toBe(HEADLINE);
    expect(hit!.score).toBeGreaterThanOrEqual(PARAPHRASE_CONTAINMENT);
  });

  it('LAISSE PASSER une note courte mais juste — la consigne explicite', () => {
    // Elle est brève, elle porte une analyse, et ses mots ne sont pas ceux du titre.
    expect(findParaphrase('Le passage devient une monnaie d’échange.', [HEADLINE])).toBeNull();
  });

  it('laisse passer une note longue qui ajoute une lecture', () => {
    expect(
      findParaphrase(
        'Téhéran transforme un goulet physique en péage politique : ce qui décide n’est plus la sécurité de la navigation mais la négociation.',
        [HEADLINE],
      ),
    ).toBeNull();
  });

  it('compare aussi aux titres des articles, pas seulement à la prose du modèle', () => {
    const titre = 'Vessel traffic through Hormuz dwindles this week';
    expect(findParaphrase('Vessel traffic through Hormuz dwindles', [titre])).not.toBeNull();
  });

  it('ne bronche pas sur une liste de candidats vide ou trouée', () => {
    expect(findParaphrase('Une phrase quelconque', [])).toBeNull();
    expect(findParaphrase('Une phrase quelconque', [null, undefined, '', '   '])).toBeNull();
  });

  it('retient le pire recouvrement quand plusieurs textes matchent', () => {
    const hit = findParaphrase('Iran réouverture Ormuz concessions', [
      'Iran réouverture',
      HEADLINE,
    ]);
    expect(hit!.source).toBe(HEADLINE);
  });

  it('limite assumée : une note française paraphrasant un titre ANGLAIS passe', () => {
    // À dire plutôt qu'à masquer. Le cas dominant — le headline du modèle, en français — est couvert.
    expect(
      findParaphrase('L’Iran lie la réouverture d’Ormuz à des concessions américaines', [
        'Iran ties Hormuz reopening to US concessions',
      ]),
    ).toBeNull();
  });
});

describe('paraphraseCandidates', () => {
  it('rassemble prose du modèle et titres, en écartant le vide', () => {
    const cluster = {
      headline: HEADLINE,
      summary_text: '',
      articles: [{ title: 'Un titre' }, { title: '' }],
    } as unknown as NewsClusterOut;
    expect(paraphraseCandidates(cluster)).toEqual([HEADLINE, 'Un titre']);
  });
});
