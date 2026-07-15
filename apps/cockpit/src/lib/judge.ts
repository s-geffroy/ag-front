import type {
  ContradictionReport,
  Deliverable,
  GateVerdict,
  JudgeGateVerdict,
  JudgeReport,
  ValidationEntry,
} from '@ag/schema/cockpit';
import type { Tone } from './display';
import { docIdForDeliverable, maxSeverity } from './contradiction';

// Client-side wiring for the LLM judge / pré-validation (ADR 0068). The judge issues a per-gate
// CANDIDATE verdict; this module maps reports to documents/deliverables, tones the verdicts, and —
// crucially — computes where the JUDGE and the RED TEAM DISAGREE, the signal that should draw the
// human's eye. None of this ticks a gate: that only happens through a nominative validate (store).

/** Below this confidence a `pass` is not trustworthy on its own — flag it for human attention. */
export const LOW_CONFIDENCE = 0.6;
/** A red-team finding at or above this severity puts a document under real pressure. */
export const RED_TEAM_PRESSURE_SEVERITY = 3;

/** The judge report for a document, if a run exists. */
export function judgementForDoc(
  reports: JudgeReport[],
  contentType: string,
  slug: string,
): JudgeReport | undefined {
  return reports.find((r) => r.doc_id === `${contentType}/${slug}`);
}

/** The judge report for a deliverable's linked document, if a run exists. */
export function judgementForDeliverable(
  reports: JudgeReport[],
  d: Deliverable,
): JudgeReport | undefined {
  const docId = docIdForDeliverable(d);
  return docId ? reports.find((r) => r.doc_id === docId) : undefined;
}

export const verdictLabel: Record<GateVerdict, string> = {
  pass: 'Satisfait',
  fail: 'Non satisfait',
  uncertain: 'Incertain',
};

/** Verdict badge tone. A LOW-confidence `pass` is toned as at-risk: it must not read as a clean go. */
export function verdictTone(verdict: GateVerdict, confidence: number): Tone {
  if (verdict === 'fail') return 'blocked';
  if (verdict === 'uncertain') return 'at_risk';
  return confidence < LOW_CONFIDENCE ? 'at_risk' : 'on_track'; // pass
}

/** A verdict a human must look at closely: any fail/uncertain, or a low-confidence pass. */
export function needsAttention(v: JudgeGateVerdict): boolean {
  return v.verdict !== 'pass' || v.confidence < LOW_CONFIDENCE;
}

export function munichVerdicts(report: JudgeReport): JudgeGateVerdict[] {
  return report.gate_verdicts.filter((v) => v.target_kind === 'munich');
}
export function rubricVerdicts(report: JudgeReport): JudgeGateVerdict[] {
  return report.gate_verdicts.filter((v) => v.target_kind === 'rubric');
}

/** The judge verdict for a specific Munich control number, if scored. */
export function verdictForMunich(
  report: JudgeReport | undefined,
  n: number,
): JudgeGateVerdict | undefined {
  return report?.gate_verdicts.find((v) => v.target_kind === 'munich' && v.target_id === String(n));
}

export interface JudgeSummary {
  pass: number;
  fail: number;
  uncertain: number;
  /** verdicts needing human attention (fail/uncertain/low-confidence pass). */
  attention: number;
  total: number;
}

export function summarize(report: JudgeReport): JudgeSummary {
  const s: JudgeSummary = { pass: 0, fail: 0, uncertain: 0, attention: 0, total: 0 };
  for (const v of report.gate_verdicts) {
    s.total += 1;
    s[v.verdict] += 1;
    if (needsAttention(v)) s.attention += 1;
  }
  return s;
}

/**
 * Where the JUDGE and the RED TEAM disagree: gates the judge marked `pass` while the red team put the
 * document under real pressure (a finding at/above RED_TEAM_PRESSURE_SEVERITY). This is the delta a
 * human should arbitrate — a green check the adversary would contest. Doc-level pressure is used
 * because red-team findings aren't keyed to individual gates.
 */
export function disagreements(
  judge: JudgeReport | undefined,
  contradiction: ContradictionReport | undefined,
): JudgeGateVerdict[] {
  if (!judge || !contradiction) return [];
  if (maxSeverity(contradiction) < RED_TEAM_PRESSURE_SEVERITY) return [];
  return judge.gate_verdicts.filter((v) => v.verdict === 'pass');
}

/** The latest journal entry for a given deliverable target (who last validated/rejected it). */
export function latestValidation(
  journal: ValidationEntry[],
  deliverableId: string,
  targetId: string,
): ValidationEntry | undefined {
  let latest: ValidationEntry | undefined;
  for (const e of journal) {
    if (e.deliverable_id !== deliverableId || e.target_id !== targetId) continue;
    if (!latest || e.validated_at > latest.validated_at) latest = e;
  }
  return latest;
}
