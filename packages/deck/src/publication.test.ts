import { describe, expect, it } from 'vitest';
import { buildCommercialDeck } from './build-commercial';
import { deckSitePaths, deckStrings } from './model';
import { readContentEntries, unpublishablePaths } from './publication';

/**
 * The publication guard.
 *
 * The plaquette is downloadable from the open internet and lands in prospects' inboxes as a PDF we
 * cannot recall. A slide naming a fiche that is still `published: false` is therefore not a broken
 * link — it is a promise we cannot keep, made in writing, to a buyer.
 *
 * Today every Atlas fiche and the single dossier are unpublished, and 10 of 12 notes are drafts, so the
 * correct number of editorial deep links in the deck is zero. This test states that as a rule rather
 * than as a fact of the moment: the day a fiche IS published, linking to it starts passing on its own.
 */
describe('the deck never points at unpublished content', () => {
  const decks = (['fr', 'en'] as const).map((lang) => buildCommercialDeck(lang, '2026-08-10'));

  it.each(decks)('$lang deck emits no unpublishable site path', (deck) => {
    const offending = unpublishablePaths(deckSitePaths(deck));
    expect(offending).toEqual([]);
  });

  it('the guard has teeth — an unpublished fiche IS rejected', () => {
    // Self-check: without this, a broken path extractor would make the test above vacuously green.
    const unpublished = readContentEntries().filter((e) => !e.public);
    expect(unpublished.length).toBeGreaterThan(0);
    expect(unpublishablePaths([unpublished[0]!.path])).toEqual([unpublished[0]!.path]);
  });

  it.each(decks)('$lang deck carries no http link outside the official domain', (deck) => {
    const foreign = deckStrings(deck)
      .flatMap((s) => s.match(/https?:\/\/[^\s)]+/g) ?? [])
      .filter((u) => !u.startsWith('https://www.applied-geopolitics.com'));
    expect(foreign).toEqual([]);
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
});
