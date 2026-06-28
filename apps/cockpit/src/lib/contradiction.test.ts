import { describe, it, expect } from 'vitest';
import type { ContradictionReport, Deliverable } from '@ag/schema/cockpit';
import {
  contradictionForDeliverable,
  deliverablesForDoc,
  docIdForDeliverable,
  maxSeverity,
  severityTone,
} from './contradiction';

// Only the `links` field matters to the wiring helpers; cast minimal stubs to keep tests focused.
const deliv = (id: string, url?: string): Deliverable =>
  ({ id, links: url ? [{ label: 'x', url }] : [] }) as unknown as Deliverable;

const report = (doc_id: string, severities: number[]): ContradictionReport =>
  ({
    doc_id,
    content_type: doc_id.split('/')[0],
    slug: doc_id.split('/')[1],
    findings: severities.map((severity) => ({ severity })),
  }) as unknown as ContradictionReport;

describe('contradiction wiring helpers', () => {
  it('derives a doc_id from a deliverable content link, null otherwise', () => {
    expect(docIdForDeliverable(deliv('d1', '/dossiers/mer-rouge-suez'))).toBe(
      'dossiers/mer-rouge-suez',
    );
    expect(docIdForDeliverable(deliv('d2'))).toBeNull();
  });

  it('matches a deliverable to the report of its linked document', () => {
    const reports = [report('dossiers/mer-rouge-suez', [2, 4]), report('atlas/malacca', [1])];
    const found = contradictionForDeliverable(reports, deliv('d1', '/dossiers/mer-rouge-suez'));
    expect(found?.doc_id).toBe('dossiers/mer-rouge-suez');
    expect(contradictionForDeliverable(reports, deliv('d2'))).toBeUndefined();
  });

  it('finds deliverables tracking a document (inverse link)', () => {
    const ds = [
      deliv('d1', '/dossiers/mer-rouge-suez'),
      deliv('d2', '/atlas/mer-rouge-suez'),
      deliv('d3'),
    ];
    expect(deliverablesForDoc(ds, 'dossiers', 'mer-rouge-suez').map((d) => d.id)).toEqual(['d1']);
  });

  it('computes max severity and maps it to a tone', () => {
    expect(maxSeverity(report('x/y', [0, 3, 1]))).toBe(3);
    expect(maxSeverity(report('x/y', []))).toBe(0);
    expect(severityTone(0)).toBe('neutral');
    expect(severityTone(2)).toBe('at_risk');
    expect(severityTone(5)).toBe('blocked');
  });
});
