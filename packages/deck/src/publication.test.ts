import { describe, expect, it } from 'vitest';
import { buildCommercialDeck } from './build-commercial';
import { buildMethodeDeck } from './build-methode';
import { deckSitePaths, deckStrings } from './model';
import { readContentEntries, unpublishablePaths } from './publication';

/**
 * The publication guard.
 *
 * The plaquette is downloadable from the open internet and lands in prospects' inboxes as a PDF we
 * cannot recall. A slide naming a fiche that is still `published: false` is therefore not a broken
 * link — it is a promise we cannot keep, made in writing, to a buyer.
 *
 * Today every Atlas fiche and the single dossier are unpublished, and 9 of 12 notes are drafts, so the
 * correct number of editorial deep links in the deck is zero. This test states that as a rule rather
 * than as a fact of the moment: the day a fiche IS published, linking to it starts passing on its own.
 */
describe('the deck never points at unpublished content', () => {
  const decks = (['fr', 'en'] as const).flatMap((lang) => [
    buildCommercialDeck(lang, '2026-08-10'),
    buildMethodeDeck(lang, '2026-08-10'),
  ]);

  it.each(decks)('$family/$lang emits no unpublishable site path', (deck) => {
    const offending = unpublishablePaths(deckSitePaths(deck));
    expect(offending).toEqual([]);
  });

  it('the guard has teeth — an unpublished fiche IS rejected', () => {
    // Self-check: without this, a broken path extractor would make the test above vacuously green.
    const unpublished = readContentEntries().filter((e) => !e.public);
    expect(unpublished.length).toBeGreaterThan(0);
    expect(unpublishablePaths([unpublished[0]!.path])).toEqual([unpublished[0]!.path]);
  });

  it.each(decks)('$family/$lang carries no http link outside the official domain', (deck) => {
    const foreign = deckStrings(deck)
      .flatMap((s) => s.match(/https?:\/\/[^\s)]+/g) ?? [])
      .filter((u) => !u.startsWith('https://www.applied-geopolitics.com'));
    expect(foreign).toEqual([]);
  });
});

describe('the method walkthrough stays an illustration, not a diagnosis', () => {
  /**
   * The walkthrough runs on a corridor whose Atlas fiche is `published: false`. It is allowed to cite
   * that corridor's PUBLIC, institutional figures; it is not allowed to publish a CVI verdict for it.
   * The caveat must also ride on every walkthrough slide, because slides get forwarded one at a time.
   */
  it.each(['fr', 'en'] as const)('%s: every walkthrough slide carries the caveat', (lang) => {
    const deck = buildMethodeDeck(lang, '2026-08-10');
    const walkthrough = deck.slides.filter((s) => s.kind === 'split' && /[1-4]\/4/.test(s.eyebrow));
    expect(walkthrough.length).toBe(4);
    for (const s of walkthrough) {
      expect(s.kind === 'split' && s.footnote).toMatch(
        lang === 'fr' ? /pas un diagnostic publié/ : /not a published diagnosis/,
      );
    }
  });

  it.each(['fr', 'en'] as const)('%s: no CVI band is asserted for the worked corridor', (lang) => {
    const deck = buildMethodeDeck(lang, '2026-08-10');
    const walkthrough = deck.slides.filter((s) => s.kind === 'split' && /[1-4]\/4/.test(s.eyebrow));
    // Publishing "Malacca: élevé" here would be publishing the unvalidated fiche's verdict.
    const banded = deckStrings({ ...deck, slides: walkthrough }).filter((t) =>
      /\b(critique|élevé|modéré|critical|high|moderate)\b/i.test(t),
    );
    expect(banded).toEqual([]);
  });
});

describe('the deck reads its prices from the site, not from the copy files', () => {
  it.each(['fr', 'en'] as const)('%s prices match apps/public/src/lib/site.ts', async (lang) => {
    const { offers } = await import('../../../apps/public/src/lib/site');
    const deck = buildCommercialDeck(lang, '2026-08-10');
    const columns = deck.slides.find((s) => s.kind === 'three-columns');
    expect(columns?.kind).toBe('three-columns');
    if (columns?.kind !== 'three-columns') return;
    expect(columns.columns.map((c) => c.price)).toEqual(offers.map((o) => o.price));
  });

  /**
   * Prices had this guard; the promises and taglines did not, and they are byte-identical twins of
   * `site.ts` sitting in the FR copy file. That is the same shape of exposure that let the VERDICT
   * score bands drift — a value with a canonical home, retyped, unguarded.
   *
   * FR only: the EN deck is a translation of intent, and `site.ts` is French. Its divergence from
   * site.ts is the point, not a defect.
   */
  it('fr promises and taglines match apps/public/src/lib/site.ts', async () => {
    const { offers } = await import('../../../apps/public/src/lib/site');
    const deck = buildCommercialDeck('fr', '2026-08-10');
    const columns = deck.slides.find((s) => s.kind === 'three-columns');
    if (columns?.kind !== 'three-columns') throw new Error('three-columns slide missing');

    expect(columns.columns.map((c) => c.promise)).toEqual(offers.map((o) => o.promise));
    expect(columns.columns.map((c) => c.tagline)).toEqual(offers.map((o) => o.tagline));
  });
});
