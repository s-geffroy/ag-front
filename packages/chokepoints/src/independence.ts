/**
 * Question diversity inside a signal family — the half of "consensus" that a count cannot express.
 *
 * The cardinality floor (ADR 0072) refuses a family resting on one market, because one quotation under
 * a plural noun is not an aggregate. But it is a floor on **how many**, and ag-back said the quiet part
 * in their `0026` §6: two markets by the same author, on near-identical questions, clear it. Counting
 * is not corroborating.
 *
 * We cannot fix that on the public surface — `/chokepoints/{id}/prediction-consensus` serves totals,
 * not questions. We can fix the part that was actually blind: on the internal `read_tainted` surface
 * every raw market carries its `market_question`, so duplication is MEASURABLE there, and a human
 * deciding whether a corridor's block is worth publishing can be shown it instead of guessing.
 *
 * What this is not: an independence test. Distinct questions can still come from one author with one
 * thesis, and we have no author field. This measures **question duplication**, which is the part of
 * dependence that leaves a trace in the data we are served. Naming it after what it measures rather
 * than after what we wish it proved is the whole discipline here.
 */

import type { PerceptionSignalOut } from './schema';

/** Words that carry no discriminating meaning in a prediction-market question. */
const STOPWORDS = new Set([
  'will',
  'the',
  'a',
  'an',
  'be',
  'is',
  'are',
  'to',
  'of',
  'in',
  'on',
  'at',
  'by',
  'for',
  'and',
  'or',
  'that',
  'this',
  'it',
  'as',
  'before',
  'after',
  'any',
  'there',
  'do',
  'does',
]);

/**
 * Reduce a question to its discriminating tokens: lowercased, unaccented, punctuation dropped,
 * stopwords removed, deduplicated and sorted.
 *
 * Sorted and deduplicated on purpose — "Will X close before Y?" and "Before Y, will X close?" are the
 * same question asked twice, and word order is exactly the difference we want to stop seeing.
 */
export function questionFingerprint(question: string): string[] {
  return [
    ...new Set(
      question
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, ' ')
        .split(/\s+/)
        .filter((w) => w.length > 1 && !STOPWORDS.has(w)),
    ),
  ].sort();
}

/** Jaccard similarity of two fingerprints, 0..1. Two empty fingerprints are treated as identical. */
export function fingerprintSimilarity(a: string[], b: string[]): number {
  if (a.length === 0 && b.length === 0) return 1;
  const setB = new Set(b);
  const shared = a.filter((t) => setB.has(t)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : shared / union;
}

/**
 * Above this, two questions are treated as the same question. Chosen high: the cost of calling two
 * genuinely different questions "duplicates" is that we understate a real aggregate, which is the
 * error we can afford. The reverse — waving through a duplicate pair as plurality — is the one we
 * cannot.
 */
export const NEAR_DUPLICATE_SIMILARITY = 0.8;

export interface FamilyDiversity {
  signalFamily: string;
  /** Rows served for this family. */
  markets: number;
  /** Groups of mutually near-identical questions — the honest count of DISTINCT questions asked. */
  distinctQuestions: number;
  /** Size of the largest near-duplicate group; > 1 means at least one question is asked twice. */
  largestDuplicateGroup: number;
  /** Rows whose question the producer did not give us; excluded from the grouping, reported here. */
  questionsMissing: number;
}

/**
 * Group raw markets by family and measure how many DISTINCT questions each family really rests on.
 *
 * Single-link grouping, deliberately: a question near-identical to any member joins the group. It
 * over-merges chains of drifting questions rather than under-merging, which errs toward reporting less
 * plurality than there might be — the safe direction for a measure whose job is to puncture a count.
 */
export function familyQuestionDiversity(rows: PerceptionSignalOut[]): FamilyDiversity[] {
  const byFamily = new Map<string, PerceptionSignalOut[]>();
  for (const row of rows) {
    const family = typeof row.signal_family === 'string' ? row.signal_family : '';
    if (!family) continue;
    const bucket = byFamily.get(family);
    if (bucket) bucket.push(row);
    else byFamily.set(family, [row]);
  }

  return [...byFamily.entries()]
    .map(([signalFamily, familyRows]) => {
      const fingerprints = familyRows
        .map((r) => (typeof r.market_question === 'string' ? r.market_question.trim() : ''))
        .filter((q) => q.length > 0)
        .map(questionFingerprint);
      const questionsMissing = familyRows.length - fingerprints.length;

      const groups: string[][][] = [];
      for (const fp of fingerprints) {
        const hit = groups.find((g) =>
          g.some((member) => fingerprintSimilarity(member, fp) >= NEAR_DUPLICATE_SIMILARITY),
        );
        if (hit) hit.push(fp);
        else groups.push([fp]);
      }

      return {
        signalFamily,
        markets: familyRows.length,
        distinctQuestions: groups.length,
        largestDuplicateGroup: groups.reduce((max, g) => Math.max(max, g.length), 0),
        questionsMissing,
      };
    })
    .sort((a, b) => b.markets - a.markets || a.signalFamily.localeCompare(b.signalFamily));
}

/**
 * Does this family's plurality survive deduplication?
 *
 * The same threshold as the publication floor, applied to DISTINCT questions instead of rows. A family
 * with four markets asking one question fails here while clearing the cardinality floor comfortably —
 * which is precisely the gap ag-back named and this function exists to make visible.
 *
 * Nothing gates on it automatically: it reads the internal surface, and the public block is built from
 * the clear one. It informs a human decision; it does not replace it.
 */
export function familyPluralitySurvivesDeduplication(d: FamilyDiversity, minimum: number): boolean {
  return d.distinctQuestions >= minimum;
}
