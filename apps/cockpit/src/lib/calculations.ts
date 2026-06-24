import type { Deliverable, HealthState } from '@ag/schema/cockpit';

const PRIORITY_ORDER: Record<Deliverable['priority'], number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

/** A non-published deliverable is late once its deadline is in the past. */
export function isLate(d: Deliverable, now: Date): boolean {
  if (d.status === 'published') return false;
  return new Date(d.deadline).getTime() < now.getTime();
}

/**
 * Global deployment health (data_model.md):
 *  - `blocked`  if any P0 deliverable is blocked;
 *  - `at_risk`  if any P0 is at risk, late, or carries a blocker note;
 *  - `on_track` otherwise.
 */
export function globalHealth(deliverables: Deliverable[], now: Date): HealthState {
  const p0 = deliverables.filter((d) => d.priority === 'P0' && d.status !== 'published');
  if (p0.some((d) => d.quality_gate_status === 'blocked')) return 'blocked';
  if (p0.some((d) => d.quality_gate_status === 'at_risk' || isLate(d, now) || hasBlocker(d))) {
    return 'at_risk';
  }
  return 'on_track';
}

function hasBlocker(d: Deliverable): boolean {
  return typeof d.blocker === 'string' && d.blocker.trim().length > 0;
}

/**
 * The deliverables to push now: non-published, ordered by priority, then late-vs-`now`, then blocker
 * presence, then nearest deadline, then lowest progress.
 */
export function p0ToPush(deliverables: Deliverable[], now: Date, limit = 3): Deliverable[] {
  return deliverables
    .filter((d) => d.status !== 'published')
    .slice()
    .sort(
      (a, b) =>
        PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority] ||
        Number(isLate(b, now)) - Number(isLate(a, now)) ||
        Number(hasBlocker(b)) - Number(hasBlocker(a)) ||
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime() ||
        a.progress - b.progress,
    )
    .slice(0, limit);
}

export type QualityAlert = { deliverable: Deliverable; missing: string[] };

/**
 * Methodological alerts: deliverables that are editorially `ready`/`published` but still miss a
 * required gate (sources, LLM contradiction, compliance, human review, CVI justification).
 * A deliverable can be ready and yet blocked methodologically.
 */
export function qualityAlerts(deliverables: Deliverable[]): QualityAlert[] {
  const alerts: QualityAlert[] = [];
  for (const d of deliverables) {
    if (d.status !== 'ready' && d.status !== 'published') continue;
    const missing: string[] = [];
    if (!d.gates.sources_ok) missing.push('sources');
    if (!d.gates.contradiction_done) missing.push('contradiction LLM');
    if (!d.gates.compliance_done) missing.push('conformité');
    if (!d.gates.human_review_done) missing.push('revue humaine');
    if (d.type === 'cvi' && d.gates.cvi_justified === false) missing.push('CVI justifié');
    if (missing.length > 0) alerts.push({ deliverable: d, missing });
  }
  return alerts;
}

export function criticalBlockers(deliverables: Deliverable[]): Deliverable[] {
  return deliverables.filter((d) => d.status !== 'published' && hasBlocker(d));
}
