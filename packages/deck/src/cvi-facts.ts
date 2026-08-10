/**
 * What the CVI actually covers today — measured, not asserted.
 *
 * Both plaquettes sell the CVI: the commercial deck shows the four-level gauge, the methode deck shows
 * the eight dimensions and the scale that follows the offer. Neither said, until the 2026-08-10 audit,
 * what the served base actually looks like. It looks like this:
 *
 *   - every instructed corridor sits in the TOP band. Not most — all 313.
 *   - 268 of 313 (86 %) carry three of the eight dimensions.
 *   - six objects carry all eight.
 *
 * The gauge therefore illustrates a scale of which exactly one band is currently occupied, and
 * "see WHERE the vulnerability sits" rests on three dimensions for the large majority of the corpus.
 * The grid is the instruction method and it is applied uniformly — that claim is true and worth making.
 * What is not yet true is that it discriminates. A deck whose signature move is stating its own limits
 * cannot leave that one out, so these figures exist to be printed, sourced by the counting method
 * recorded on each line.
 *
 * MEASURED 2026-08-10 against the read API (contract `0.18.0`), `read` scope, `include_tainted=false`.
 * Method: paginate `GET /chokepoints` (limit 500) for the full catalogue, drop the P3
 * digital-infrastructure bulk — which carries no engine output — to obtain the instructed corpus, then
 * `GET /chokepoints/{id}/cvi-assessment` object by object. No sampling: all 313 were queried.
 *
 * `backend-facts.test.ts` fails when this measurement goes stale, and asserts it agrees with
 * `backend-facts.ts` on the corpus sizes.
 */

/** The date the figures below were counted. Any slide printing them is only as fresh as this. */
export const CVI_MEASURED_ON = '2026-08-10';

export const cviCoverage = {
  /** Objects the read API serves, all families — the same count as `backend.servedCatalogue`. */
  servedCatalogue: 2218,
  /** The served catalogue minus the 1 905 P3 digital objects with no engine output. */
  instructedCorpus: 313,
  /** Instructed objects returning a CVI assessment with a `global_level`. 313 of 313. */
  assessed: 313,
  /** Instructed objects carrying all eight dimensions. */
  allEightDimensions: 6,
  /** Instructed objects carrying only three (`exposition`, `concentration`, `incertitude`). */
  threeDimensions: 268,
  /** Objects carrying `resilience` — and it is a reroute-time proxy, never repair or absorption time. */
  resilience: 6,
  /** Distinct `global_level` values observed across the instructed corpus. One: `critique`. */
  distinctLevels: 1,
  /** The single observed level. Stated as data, because the gauge shows four. */
  observedLevel: 'critique',
} as const;

/**
 * The figures as the copy files receive them: the measurement plus the date it was taken, because a
 * coverage claim without its date is the same failure as a score without its sources.
 *
 * Copy functions take this object. They are never handed a literal — that is the discipline the
 * VERDICT score bands broke.
 */
export type CviFacts = typeof cviCoverage & { measuredOn: string };
export const cviFacts: CviFacts = { ...cviCoverage, measuredOn: CVI_MEASURED_ON };

/**
 * The dimensions actually served, most-covered first, out of `cviCoverage.instructedCorpus`.
 * Counted from the same pass: one increment per dimension key present on an assessment.
 */
export const cviDimensionCoverage: { key: string; value: number }[] = [
  { key: 'concentration', value: 313 },
  { key: 'exposition', value: 313 },
  { key: 'incertitude', value: 313 },
  { key: 'menace', value: 45 },
  { key: 'capacite_perturbation', value: 8 },
  { key: 'cout_contournement', value: 8 },
  { key: 'gouvernance', value: 8 },
  { key: 'resilience', value: 6 },
];
