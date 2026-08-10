import { describe, expect, it } from 'vitest';
import { backend, corpusByFamily, corpusTotal } from './backend-facts';

/**
 * These figures are printed, at 54pt, in a document sent to prospects. They are measurements of the
 * backend, transcribed by hand from a read-only mirror — which means the failure mode is not "the
 * code is wrong" but "someone updated one number and not its neighbours".
 *
 * The identity below is the only cross-check available without querying the backend: the family
 * breakdown and the headline total come from two different greps over the same seed file, so an edit
 * to one that is not mirrored in the other shows up here instead of on a slide.
 */
describe('backend facts stay internally consistent', () => {
  it('the family breakdown sums to the headline corpus size', () => {
    expect(corpusTotal()).toBe(backend.objects);
  });

  it('P0 is a subset of the corpus, not a parallel count', () => {
    expect(backend.p0).toBeGreaterThan(0);
    expect(backend.p0).toBeLessThan(backend.objects);
  });

  it('every family carries a positive count', () => {
    expect(corpusByFamily.filter((f) => f.value <= 0)).toEqual([]);
  });

  it('the pinned contract version is a semver triple', () => {
    expect(backend.contract).toMatch(/^\d+\.\d+\.\d+$/);
  });
});
