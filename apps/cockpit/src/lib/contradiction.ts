import type { ContradictionReport, Deliverable } from '@ag/schema/cockpit';
import { contentRefFromLinks } from './display';

// Wiring between the editorial contradiction reports (keyed by `${content_type}/${slug}`) and the
// deliverables that track those documents (linked via their public-site URLs). Lets the quality views
// surface the red-team state next to the `contradiction_done` gate it informs (ADR 0039).

/** The `doc_id` of the editorial document a deliverable tracks, or null if it links to none. */
export function docIdForDeliverable(d: Deliverable): string | null {
  const ref = contentRefFromLinks(d.links);
  return ref ? `${ref.type}/${ref.slug}` : null;
}

/** The contradiction report for a deliverable's linked document, if a run exists. */
export function contradictionForDeliverable(
  reports: ContradictionReport[],
  d: Deliverable,
): ContradictionReport | undefined {
  const docId = docIdForDeliverable(d);
  return docId ? reports.find((r) => r.doc_id === docId) : undefined;
}

/** Deliverables that track a given document (inverse link). */
export function deliverablesForDoc(
  deliverables: Deliverable[],
  contentType: string,
  slug: string,
): Deliverable[] {
  const docId = `${contentType}/${slug}`;
  return deliverables.filter((d) => docIdForDeliverable(d) === docId);
}

/** Highest finding severity in a report (0 when none). */
export function maxSeverity(r: ContradictionReport): number {
  return r.findings.reduce((m, f) => Math.max(m, f.severity), 0);
}

export function severityTone(s: number): 'neutral' | 'at_risk' | 'blocked' {
  if (s >= 4) return 'blocked';
  if (s >= 2) return 'at_risk';
  return 'neutral';
}
