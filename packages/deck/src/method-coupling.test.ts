import { cviDimensionKeys, cviDimensions } from '@ag/cvi';
import { DEFAULT_WEIGHTS, criterionLabels, verdictLabels } from '@ag/verdict';
import { describe, expect, it } from 'vitest';
import { buildMethodeDeck } from './build-methode';

/**
 * The method-coupling guard.
 *
 * The deck's whole premise is that nothing with a twin in the monorepo is retyped, so the document
 * cannot drift from the engine. That held for prices — `publication.test.ts` asserts it — and failed
 * for the method itself: the four VERDICT score bands were hand-typed into the copy files and said
 * `≥80 / 65–79 / 50–64 / <50` while `@ag/verdict`, `docs/methode-verdict.md` and the public
 * `/methode-verdict` page all said `≥80 / 60–79 / 40–59 / 0–39`. A prospect reading the plaquette and
 * then the site saw two different methods — in the deck that sells stating one's limits.
 *
 * Prices had a guard; the method did not. This is that guard. It asserts equality against the
 * canonical source rather than against expected literals, so it keeps its teeth when the engine's
 * numbers legitimately change: the day an ADR moves a threshold, this test stays green and the deck
 * follows, which is the entire point.
 */

const LANGS = ['fr', 'en'] as const;
const DATE = '2026-08-10';

describe('the deck reads the VERDICT method from @ag/verdict, not from the copy files', () => {
  it.each(LANGS)('%s: the four score bands are the engine’s', (lang) => {
    const deck = buildMethodeDeck(lang, DATE);
    const slide = deck.slides.find(
      (s) => s.kind === 'sequence' && s.steps.length === 4 && /≥\s*80/.test(s.steps[0]!.marker),
    );
    expect(slide, 'the verdicts slide is missing from the deck').toBeDefined();
    if (slide?.kind !== 'sequence') return;

    expect(slide.steps.map((s) => s.marker)).toEqual(
      Object.values(verdictLabels).map((v) => v.scoreBand),
    );
  });

  it.each(LANGS)('%s: the seven weighted criteria are the engine’s', (lang) => {
    const deck = buildMethodeDeck(lang, DATE);
    const slide = deck.slides.find((s) => s.kind === 'weighted-bars');
    expect(slide?.kind).toBe('weighted-bars');
    if (slide?.kind !== 'weighted-bars') return;

    expect(slide.items.map((i) => i.weight)).toEqual(
      Object.values(criterionLabels).map((c) => c.weight),
    );
    // The slide's headline is "out of one hundred" — that claim has to be true of what is rendered.
    expect(slide.items.reduce((n, i) => n + i.weight, 0)).toBe(100);
    expect(slide.items.reduce((n, i) => n + i.weight, 0)).toBe(
      Object.values(DEFAULT_WEIGHTS).reduce((n, w) => n + w, 0),
    );
  });

  it.each(LANGS)('%s: the eight CVI dimensions are @ag/cvi’s, in its order', (lang) => {
    const deck = buildMethodeDeck(lang, DATE);
    const slide = deck.slides.find(
      (s) => s.kind === 'sequence' && s.steps.length === cviDimensionKeys.length,
    );
    expect(slide, 'the CVI dimensions slide is missing from the deck').toBeDefined();
    if (slide?.kind !== 'sequence') return;

    expect(slide.steps.map((s) => s.label)).toEqual(
      cviDimensionKeys.map((k) => cviDimensions[k].label),
    );
    expect(slide.steps.map((s) => s.note)).toEqual(
      cviDimensionKeys.map((k) => cviDimensions[k].question),
    );
  });
});
