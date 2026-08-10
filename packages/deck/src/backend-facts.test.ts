import { describe, expect, it } from 'vitest';
import { MEASURED_ON, backend, corpusByFamily, corpusTotal } from './backend-facts';
import { CVI_MEASURED_ON, cviCoverage } from './cvi-facts';

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

  it('the instructed corpus is a subset of the served catalogue', () => {
    expect(backend.objects).toBeLessThan(backend.servedCatalogue);
  });
});

/**
 * The freshness guard.
 *
 * ADR 0073 recorded, as an accepted consequence, that these hand-transcribed measurements age and that
 * *nothing signals it*. That is a poor property for numbers set at 54pt in a document whose argument is
 * that it can be checked. The consistency tests above are blind to it by construction: a wholly stale
 * set of figures whose family counts still sum passes them all green.
 *
 * So staleness becomes a red test. When this fails, the fix is to re-measure using the counting method
 * written beside each figure — not to move the date.
 */
const MAX_AGE_DAYS = 90;

describe('the measurements are recent enough to print', () => {
  it.each([
    ['backend-facts.ts', MEASURED_ON],
    ['cvi-facts.ts', CVI_MEASURED_ON],
  ])(`%s was measured less than ${MAX_AGE_DAYS} days ago`, (_file, measuredOn) => {
    const ageDays = (Date.now() - Date.parse(measuredOn)) / 86_400_000;
    expect(Number.isNaN(ageDays)).toBe(false);
    expect(ageDays).toBeLessThan(MAX_AGE_DAYS);
  });

  it('the two measurement passes describe the same corpus', () => {
    // Both were counted against the same read API on the same day; if one is re-measured alone, the
    // deck would print an instructed-corpus size that its own coverage figures contradict.
    expect(cviCoverage.instructedCorpus).toBe(backend.objects);
    expect(cviCoverage.servedCatalogue).toBe(backend.servedCatalogue);
  });
});
