// Pack-driven scoring engine. Unlike the starter pack's hard-coded Python placeholder, this derives
// every dimension from questions.yaml `targets` weights, then applies scoring_rules.yaml if/then
// adjustments, pattern activations and red flags. Deterministic and conservative by design (ADR 0032).

import type {
  DomainPack,
  EngineAnswer,
  DimensionScore,
  DimensionEvidence,
  ScoringResult,
  Confidence,
  Question,
} from './types';

const clamp05 = (n: number): number => Math.max(0, Math.min(5, n));
const round05 = (n: number): number => clamp05(Math.round(n));
const mean = (xs: number[]): number => (xs.length ? xs.reduce((s, v) => s + v, 0) / xs.length : 0);

// Question ids the divergence model reads directly (the "declared vs. proven" gap, ADR 0040).
const Q_REPLACEABILITY = 'critical_actor_replaceability_30d';
const Q_SUBSTITUTION_PROOF = 'substitution_real_test_proof';
const Q_TIER2 = 'hidden_tier2_visibility';
const HIDDEN_DIMENSION = 'hidden_dependency_score';

// Tier-2 invisibility, on a 0..5 blindness scale (yes = fully visible = 0).
const TIER2_BLINDNESS: Record<string, number> = {
  yes: 0,
  partial: 2,
  unknown: 4,
  no: 5,
  not_applicable: 0,
};

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
function answerRisk(token: string, question: Question): number | null {
  if (question.type === 'ordinal_scale') {
    const n = Number(token);
    return Number.isFinite(n) ? clamp05(n) : null;
  }
  // Per-question option→risk map takes precedence (enumerations not covered by the generic polarity).
  if (question.answer_risk && token in question.answer_risk) {
    return clamp05(question.answer_risk[token]);
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
export function scoreAnswers(
  pack: DomainPack,
  answers: EngineAnswer[],
  dimensionEvidence: Record<string, DimensionEvidence[]> = {},
): ScoringResult {
  const questionById = new Map(pack.questions.map((q) => [q.id, q]));

  // 1. Weighted aggregation of direct numeric contributions per dimension.
  const acc: Record<string, { weighted: number; weight: number; count: number }> = {};
  const evidenceValues: number[] = [];

  for (const answer of answers) {
    evidenceValues.push(clamp05(Number(answer.evidence_quality) || 0));
    const q = questionById.get(answer.question_id);
    if (!q?.targets?.dimensions) continue;
    const token = answerToken(answer);
    const risk = answerRisk(token, q);
    if (risk === null) continue;

    for (const target of q.targets.dimensions) {
      if (target.id === EVIDENCE_DIMENSION) continue; // evidence handled separately below
      if (target.id === HIDDEN_DIMENSION) continue; // hidden dependency = divergence model (below)
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

  // 4b. Wire the EVIDENCE REGISTRY into the scores (ADR 0040 follow-up): linking accepted evidence to
  //     a dimension populates its evidence_refs, raises its confidence, and lifts the global evidence
  //     quality — which in turn REDUCES the divergence blindness below. Linking real proof now matters.
  applyLinkedEvidence(scores, dimensionEvidence);

  // 5. Hidden dependency = DIVERGENCE between declared resilience and proven resilience (ADR 0040).
  //    It is NOT a relabel of "do you see tier-2?" — it is "how much exposure can you NOT see/prove".
  //    hidden = exposure (how much it matters) × blindness (how unproven/invisible it is).
  scores[HIDDEN_DIMENSION] = deriveHiddenDependency(answers, questionById, scores);

  const redFlags = [...redFlagIds].map((id) => {
    const def = redFlagById.get(id);
    return { id, severity: def?.severity ?? 0, message_fr: def?.message_fr ?? id };
  });

  return { scores, activatedPatterns: [...activatedPatterns], redFlags };
}

/** Fold linked evidence into the scores: evidence_refs, per-dimension confidence, evidence quality. */
function applyLinkedEvidence(
  scores: Record<string, DimensionScore>,
  dimensionEvidence: Record<string, DimensionEvidence[]>,
): void {
  const acceptedReliabilities: number[] = [];
  for (const [dimId, evs] of Object.entries(dimensionEvidence)) {
    const s = scores[dimId];
    if (!s || !evs.length) continue;
    s.evidence_refs = evs.map((e) => e.id);
    const accepted = evs.filter((e) => e.status === 'accepted');
    if (accepted.length) {
      const maxRel = Math.max(...accepted.map((e) => clamp05(e.reliability)));
      s.confidence = maxRel >= 3 ? 'high' : 'medium';
      s.rationale += ` Étayé par ${accepted.length} preuve(s) liée(s) (fiabilité max ${maxRel}/5).`;
      for (const e of accepted) acceptedReliabilities.push(clamp05(e.reliability));
    }
  }
  // Accepted linked evidence raises the global evidence-quality reading (it reduces the blind spot,
  // so the divergence model treats a documented dependency as less "hidden").
  if (acceptedReliabilities.length) {
    const linked = round05(mean(acceptedReliabilities));
    const ev = scores[EVIDENCE_DIMENSION];
    if (ev && linked > ev.value) {
      ev.value = linked;
      ev.confidence = 'high';
      ev.rationale += ` Relevé via preuves liées acceptées (${linked}/5).`;
    }
  }
}

/** Components of the declared-vs-proven divergence, reused by the diagnostic narrative. */
export interface DivergenceSignals {
  exposure: number; // how much this dependency matters (0..5)
  blindness: number; // how invisible/unproven it is (0..5)
  tier2_blindness: number;
  substitution_unproven: number;
  low_evidence: number;
  replaceability_claimed: boolean;
}

function tokenFor(
  answers: EngineAnswer[],
  questionId: string,
): { token: string; evidence: number } | null {
  const a = answers.find((x) => x.question_id === questionId);
  if (!a) return null;
  return { token: answerToken(a), evidence: clamp05(Number(a.evidence_quality) || 0) };
}

/**
 * Quantify the gap between what the client *believes* (replaceable, in control) and what they can
 * *prove* (tested alternative, documented tier-2). High exposure that is fully proven/visible is a
 * KNOWN dependency (low divergence); high exposure that is unproven/invisible is a HIDDEN one.
 */
export function divergenceSignals(
  answers: EngineAnswer[],
  scores: Record<string, DimensionScore>,
): DivergenceSignals {
  const replace = tokenFor(answers, Q_REPLACEABILITY);
  const proof = tokenFor(answers, Q_SUBSTITUTION_PROOF);
  const tier2 = tokenFor(answers, Q_TIER2);

  // The client claims the actor is replaceable (overconfidence candidate).
  const replaceabilityClaimed = ['yes', 'probably_yes', 'uncertain'].includes(replace?.token ?? '');
  // Substitution is "unproven" when replaceability is claimed but no real-condition test is evidenced.
  const proofWeak = (proof?.evidence ?? 0) <= 2 || (proof?.token ?? '').length === 0;
  const substitution_unproven = replaceabilityClaimed
    ? proofWeak
      ? 5
      : 2 // claims replaceable AND has proof → low blindness
    : replace?.token === 'no' || replace?.token === 'probably_no'
      ? 1 // declares NOT replaceable → a known dependency, not a hidden one
      : 3;

  const tier2_blindness = tier2 ? (TIER2_BLINDNESS[tier2.token] ?? 4) : 4;
  const low_evidence = 5 - (scores[EVIDENCE_DIMENSION]?.value ?? 0);

  const exposure = Math.max(
    scores['supplier_dependency_score']?.value ?? 0,
    scores['flow_criticality_score']?.value ?? 0,
  );
  const blindness = round05(mean([tier2_blindness, substitution_unproven, low_evidence]));

  return {
    exposure,
    blindness,
    tier2_blindness,
    substitution_unproven,
    low_evidence,
    replaceability_claimed: replaceabilityClaimed,
  };
}

function deriveHiddenDependency(
  answers: EngineAnswer[],
  questionById: Map<string, Question>,
  scores: Record<string, DimensionScore>,
): DimensionScore {
  const s = divergenceSignals(answers, scores);
  const value = round05((s.exposure * s.blindness) / 5);
  const answered = [Q_REPLACEABILITY, Q_TIER2].filter((q) => answers.some((a) => a.question_id === q))
    .length;
  void questionById;
  return {
    dimension_id: HIDDEN_DIMENSION,
    value,
    confidence: answered >= 2 ? 'high' : answered === 1 ? 'medium' : 'low',
    rationale:
      `Divergence déclaré/prouvé : exposition ${s.exposure}/5 × cécité ${s.blindness}/5 ` +
      `(visibilité rang-2 ${s.tier2_blindness}/5, substitution non prouvée ${s.substitution_unproven}/5, ` +
      `preuve faible ${s.low_evidence}/5). Une dépendance n'est « cachée » que là où l'exposition est réelle ` +
      `mais non vue/prouvée.`,
    evidence_refs: [],
    open_uncertainties: [],
  };
}

/** Overall confidence heuristic from average evidence quality. */
export function overallConfidence(scores: Record<string, DimensionScore>): Confidence {
  const ev = scores[EVIDENCE_DIMENSION]?.value ?? 0;
  if (ev >= 4) return 'high';
  if (ev >= 2) return 'medium';
  return 'low';
}
