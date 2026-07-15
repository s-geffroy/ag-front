import type { Deliverable } from '@ag/schema/cockpit';
import { docIdForDeliverable } from './contradiction';

// Client-side readiness for one-click publish (ADR 0069): mirrors the server gate (server/publish.ts).
// A document may go public only when its linked deliverable has every validation gate satisfied.

/** Gates that must hold before publishing, with human labels for the "missing" list. */
export const PUBLISH_GATE_LABELS: Record<string, string> = {
  sources_ok: 'Sources',
  contradiction_done: 'Contradiction',
  compliance_done: 'Conformité',
  human_review_done: 'Revue humaine',
  cvi_justified: 'CVI justifié',
};

const REQUIRED_GATES = [
  'sources_ok',
  'contradiction_done',
  'compliance_done',
  'human_review_done',
] as const;

export interface PublishReadiness {
  /** Deliverables tracking this document (usually one; none blocks publish). */
  linked: Deliverable[];
  /** Gate keys still missing across the linked deliverables. */
  missing: string[];
  /** True when there is at least one linked deliverable and no missing gate. */
  ready: boolean;
}

export function publishReadiness(
  deliverables: Deliverable[],
  type: string,
  slug: string,
): PublishReadiness {
  const docId = `${type}/${slug}`;
  const linked = deliverables.filter((d) => docIdForDeliverable(d) === docId);
  const missing = new Set<string>();
  for (const d of linked) {
    for (const g of REQUIRED_GATES) if (!d.gates[g]) missing.add(g);
    // cvi_justified only counts when it applies (present and false).
    if (d.gates.cvi_justified === false) missing.add('cvi_justified');
  }
  return { linked, missing: [...missing], ready: linked.length > 0 && missing.size === 0 };
}
