// Verdict derivation from verdict_rules.yaml. The verdict is an operational POSTURE
// (monitor|prepare|act|escalate), never an automatic decision (SPEC_V1 §7). When several rules match,
// the highest-severity posture wins.

import type { DomainPack, DimensionScore, Verdict, Confidence } from './types';
import { overallConfidence } from './scoring';

const PRECEDENCE: Record<Verdict, number> = { monitor: 0, prepare: 1, act: 2, escalate: 3 };

/** Ordered postures, weakest → strongest. */
export const VERDICT_ORDER: Verdict[] = ['monitor', 'prepare', 'act', 'escalate'];

/** Move a verdict up/down the posture ladder, clamped. Used to apply accepted red-team pressure. */
export function bumpVerdict(v: Verdict, delta: number): Verdict {
  const i = VERDICT_ORDER.indexOf(v);
  const j = Math.max(0, Math.min(VERDICT_ORDER.length - 1, i + delta));
  return VERDICT_ORDER[j];
}

/** Evaluate a single verdict-rule `if` block (suffix-encoded thresholds) against the scores. */
function ruleMatches(
  conditions: Record<string, number>,
  scores: Record<string, DimensionScore>,
): boolean {
  for (const [key, threshold] of Object.entries(conditions)) {
    const gte = key.endsWith('_gte');
    const lte = key.endsWith('_lte');
    if (!gte && !lte) return false;
    const dimId = key.replace(/_(gte|lte)$/, '');
    const value = scores[dimId]?.value ?? 0;
    if (gte && !(value >= threshold)) return false;
    if (lte && !(value <= threshold)) return false;
  }
  return true;
}

export function deriveVerdict(
  pack: DomainPack,
  scores: Record<string, DimensionScore>,
): { verdict: Verdict; confidence: Confidence; matchedRuleIds: string[] } {
  let verdict: Verdict = 'monitor';
  const matchedRuleIds: string[] = [];

  for (const rule of pack.verdictRules) {
    if (ruleMatches(rule.if, scores)) {
      matchedRuleIds.push(rule.id);
      if (PRECEDENCE[rule.verdict] > PRECEDENCE[verdict]) verdict = rule.verdict;
    }
  }

  return { verdict, confidence: overallConfidence(scores), matchedRuleIds };
}
