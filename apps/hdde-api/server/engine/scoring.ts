// Pack-driven scoring engine. Unlike the starter pack's hard-coded Python placeholder, this derives
// every dimension from questions.yaml `targets` weights, then applies scoring_rules.yaml if/then
// adjustments, pattern activations and red flags. Deterministic and conservative by design (ADR 0032).

import type { DomainPack, EngineAnswer, DimensionScore, ScoringResult, Confidence } from './types';

const clamp05 = (n: number): number => Math.max(0, Math.min(5, n));

// Generic risk polarity for categorical answers where "no" = high exposure.
const RISK_MAP: Record<string, number> = {
  yes: 0,
  probably_yes: 1,
  partial: 2,
  uncertain: 3,
  probably_no: 4,
  no: 5,
  unknown: 4,
  not_applicable: 0,
};

// "Good" dimensions: higher = better (readiness/quality). For these we invert the risk into an amount.
const POSITIVE_DIMENSIONS = new Set(['decision_readiness_score', 'evidence_quality_score']);

const EVIDENCE_DIMENSION = 'evidence_quality_score';

function answerToken(a: EngineAnswer): string {
  return String(a.normalized_answer ?? a.raw_answer ?? '')
    .trim()
    .toLowerCase();
}

/**
 * Direct numeric contribution of an answer to a targeted dimension, on a 0..5 risk scale, or null
 * when the answer carries no direct numeric signal (free-text, enumerations) — those dimensions are
 * still moved by scoring rules and the evidence aggregate.
 */
function answerRisk(token: string, questionType: string): number | null {
  if (questionType === 'ordinal_scale') {
    const n = Number(token);
    return Number.isFinite(n) ? clamp05(n) : null;
  }
  if (token in RISK_MAP) return RISK_MAP[token];
  return null;
}

export function initialScores(pack: DomainPack): Record<string, DimensionScore> {
  const scores: Record<string, DimensionScore> = {};
  for (const d of pack.dimensions) {
    scores[d.id] = {
      dimension_id: d.id,
      value: 0,
      confidence: 'low',
      rationale: 'No answers yet.',
      evidence_refs: [],
      open_uncertainties: [],
    };
  }
  return scores;
}

/** Compute dimension scores, activated patterns and red flags from interview answers. */
export function scoreAnswers(pack: DomainPack, answers: EngineAnswer[]): ScoringResult {
  const questionById = new Map(pack.questions.map((q) => [q.id, q]));

  // 1. Weighted aggregation of direct numeric contributions per dimension.
  const acc: Record<string, { weighted: number; weight: number; count: number }> = {};
  const evidenceValues: number[] = [];

  for (const answer of answers) {
    evidenceValues.push(clamp05(Number(answer.evidence_quality) || 0));
    const q = questionById.get(answer.question_id);
    if (!q?.targets?.dimensions) continue;
    const token = answerToken(answer);
    const risk = answerRisk(token, q.type);
    if (risk === null) continue;

    for (const target of q.targets.dimensions) {
      if (target.id === EVIDENCE_DIMENSION) continue; // evidence handled separately below
      const value = POSITIVE_DIMENSIONS.has(target.id) ? 5 - risk : risk;
      const slot = (acc[target.id] ??= { weighted: 0, weight: 0, count: 0 });
      slot.weighted += value * target.weight;
      slot.weight += target.weight;
      slot.count += 1;
    }
  }

  const scores = initialScores(pack);
  for (const [dimId, slot] of Object.entries(acc)) {
    if (slot.weight === 0) continue;
    scores[dimId] = {
      dimension_id: dimId,
      value: clamp05(Math.round(slot.weighted / slot.weight)),
      confidence: slot.count >= 2 ? 'high' : 'medium',
      rationale: `Derived from ${slot.count} interview answer(s) weighted by the domain pack.`,
      evidence_refs: [],
      open_uncertainties: [],
    };
  }

  // 2. Evidence quality = average declared evidence across answers (a "good" amount, not a risk).
  if (evidenceValues.length) {
    const avg = Math.round(evidenceValues.reduce((s, v) => s + v, 0) / evidenceValues.length);
    scores[EVIDENCE_DIMENSION] = {
      dimension_id: EVIDENCE_DIMENSION,
      value: clamp05(avg),
      confidence: 'medium',
      rationale: 'Average declared evidence quality across answers.',
      evidence_refs: [],
      open_uncertainties: [],
    };
  }

  // 3. Apply scoring rules: dimension adjustments, pattern activations, red flags.
  const activatedPatterns = new Set<string>();
  const redFlagIds = new Set<string>();
  const redFlagById = new Map(pack.redFlags.map((f) => [f.id, f]));

  for (const rule of pack.scoringRules) {
    const matches = answers.filter((a) => {
      if (a.question_id !== rule.if.question_id) return false;
      if (
        rule.if.evidence_quality_lte !== undefined &&
        clamp05(Number(a.evidence_quality) || 0) > rule.if.evidence_quality_lte
      ) {
        return false;
      }
      if (rule.if.answer_in && !rule.if.answer_in.includes(answerToken(a))) return false;
      return true;
    });
    if (matches.length === 0) continue;

    if (rule.then.adjust_dimension) {
      for (const [dimId, delta] of Object.entries(rule.then.adjust_dimension)) {
        const target = scores[dimId];
        if (!target) continue;
        target.value = clamp05(target.value + delta);
        if (target.confidence === 'low') target.confidence = 'medium';
        target.rationale += ` Adjusted ${delta >= 0 ? '+' : ''}${delta} by rule ${rule.id}.`;
      }
    }
    if (rule.then.activate_pattern) activatedPatterns.add(rule.then.activate_pattern);
    if (rule.then.add_red_flag) redFlagIds.add(rule.then.add_red_flag);
  }

  // 4. Activate patterns directly targeted by answered questions (pattern is a qualitative signal).
  for (const answer of answers) {
    const q = questionById.get(answer.question_id);
    for (const p of q?.targets?.patterns ?? []) activatedPatterns.add(p.id);
  }

  const redFlags = [...redFlagIds].map((id) => {
    const def = redFlagById.get(id);
    return { id, severity: def?.severity ?? 0, message_fr: def?.message_fr ?? id };
  });

  return { scores, activatedPatterns: [...activatedPatterns], redFlags };
}

/** Overall confidence heuristic from average evidence quality. */
export function overallConfidence(scores: Record<string, DimensionScore>): Confidence {
  const ev = scores[EVIDENCE_DIMENSION]?.value ?? 0;
  if (ev >= 4) return 'high';
  if (ev >= 2) return 'medium';
  return 'low';
}
