import { describe, expect, it } from 'vitest';
import {
  familyPluralitySurvivesDeduplication,
  familyQuestionDiversity,
  fingerprintSimilarity,
  questionFingerprint,
} from './independence';

const q = (signal_family: string, market_question: string) => ({ signal_family, market_question });

describe('questionFingerprint', () => {
  it('is blind to word order, punctuation, case and accents', () => {
    expect(questionFingerprint('Will the Suez Canal close before 2027?')).toEqual(
      questionFingerprint('before 2027, will SUEZ canal CLOSE'),
    );
    expect(questionFingerprint('Blocage du détroit ?')).toEqual(
      questionFingerprint('blocage du detroit'),
    );
  });

  it('drops stopwords but keeps what discriminates', () => {
    expect(questionFingerprint('Will the canal close?')).toEqual(['canal', 'close']);
  });
});

describe('fingerprintSimilarity', () => {
  it('is 1 for identical fingerprints and 0 for disjoint ones', () => {
    expect(fingerprintSimilarity(['a', 'b'], ['a', 'b'])).toBe(1);
    expect(fingerprintSimilarity(['a'], ['b'])).toBe(0);
  });
});

describe('familyQuestionDiversity', () => {
  it('counts a genuinely plural family at its full breadth', () => {
    const [d] = familyQuestionDiversity([
      q('disruption_expectation', 'Will the Suez Canal close before 2027?'),
      q('disruption_expectation', 'Will Houthi attacks exceed 50 vessels in 2026?'),
      q('disruption_expectation', 'Will insurance premiums for Red Sea transit double?'),
    ]);
    expect(d!.markets).toBe(3);
    expect(d!.distinctQuestions).toBe(3);
    expect(d!.largestDuplicateGroup).toBe(1);
  });

  it('sees through the exact case ag-back named: N clears the floor, the question is one', () => {
    // Four markets, one proposition reworded. `market_count` says 4 and the cardinality floor is
    // satisfied; deduplication says the family rests on a single question.
    const [d] = familyQuestionDiversity([
      q('regime_change_expectation', 'Will the government of X fall before July 2027?'),
      q('regime_change_expectation', 'Before July 2027, will the X government fall?'),
      q('regime_change_expectation', 'Will X’s government fall prior to July 2027?'),
      q('regime_change_expectation', 'Will the government of X fall ahead of July 2027?'),
    ]);
    expect(d!.markets).toBe(4);
    expect(d!.distinctQuestions).toBe(1);
    expect(d!.largestDuplicateGroup).toBe(4);
    expect(familyPluralitySurvivesDeduplication(d!, 2)).toBe(false);
  });

  it('is defeated by synonyms, and the test says so rather than pretending otherwise', () => {
    // "fall" and "collapse" share no token, so the measure reads two questions where a human reads
    // one. This is the documented resolution limit: it catches rewording, not paraphrase. Pinning it
    // means the day someone tightens the threshold, they find out what they broke.
    const [d] = familyQuestionDiversity([
      q('regime_change_expectation', 'Will the government of X fall before July 2027?'),
      q('regime_change_expectation', 'Will the government of X collapse before July 2027?'),
    ]);
    expect(d!.distinctQuestions).toBe(2);
    expect(familyPluralitySurvivesDeduplication(d!, 2)).toBe(true);
  });

  it('reports rows whose question the producer withheld, rather than counting them as distinct', () => {
    const [d] = familyQuestionDiversity([
      q('infrastructure_capacity_expectation', 'Will Panama Canal daily transits fall below 24?'),
      { signal_family: 'infrastructure_capacity_expectation', market_question: null },
      { signal_family: 'infrastructure_capacity_expectation' },
    ]);
    expect(d!.markets).toBe(3);
    expect(d!.questionsMissing).toBe(2);
    // Silence is not a distinct question, exactly as silence is not a count (ADR 0072).
    expect(d!.distinctQuestions).toBe(1);
  });

  it('ignores rows with no family rather than inventing an empty one', () => {
    expect(familyQuestionDiversity([{ market_question: 'orphan' }])).toEqual([]);
  });

  it('orders families by how many markets they carry', () => {
    const out = familyQuestionDiversity([
      q('small', 'a b c'),
      q('big', 'd e f'),
      q('big', 'g h i'),
    ]);
    expect(out.map((d) => d.signalFamily)).toEqual(['big', 'small']);
  });
});
