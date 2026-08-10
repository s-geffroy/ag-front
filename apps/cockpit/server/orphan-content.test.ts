import { readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { Deliverable } from '@ag/schema/cockpit';
import { CONTENT_DIR } from './content';
import { deliverableLinksTo, governingDeliverables, resolvePublish } from './publish';

/**
 * Every editorial document must be reachable by the publish gate.
 *
 * `resolvePublish` finds a document's deliverable by matching `links[].url` against
 * `/<type>/<slug>`. A document nobody linked is therefore not "awaiting validation" — it answers
 * `409 no_linked_deliverable` for ever, whatever a reviewer approves in the cockpit. Four notes sat
 * in exactly that state (written 2026-07-15, discovered 2026-08-10), invisible because the failure
 * only shows at the moment someone finally tries to publish.
 *
 * This is a data test on purpose: the bug was in the data, and the code was behaving correctly.
 */

const DELIVERABLES = resolve(CONTENT_DIR, '../../../cockpit/data/deliverables.json');
const TYPES = ['notes', 'atlas', 'dossiers'] as const;

/** The publish gate keys collections by directory name; `type` in the URL is that same name. */
function documentsOf(type: string): string[] {
  return readdirSync(resolve(CONTENT_DIR, type))
    .filter((f) => f.endsWith('.md'))
    .map((f) => f.slice(0, -3));
}

const deliverables = Deliverable.array().parse(
  JSON.parse(readFileSync(DELIVERABLES, 'utf-8')) as unknown,
);

describe('no editorial document is orphaned from the publish gate', () => {
  for (const type of TYPES) {
    it(`every ${type} document has a linked deliverable`, () => {
      const orphans = documentsOf(type).filter(
        (slug) => !deliverables.some((d) => deliverableLinksTo(d, type, slug)),
      );
      expect(orphans, `documents sans livrable lié dans ${type}/`).toEqual([]);
    });
  }

  it('never reports no_linked_deliverable for a real document', () => {
    // The distinction that matters: `gates_incomplete` is a document waiting for a human,
    // `no_linked_deliverable` is a document waiting for nothing at all.
    for (const type of TYPES) {
      for (const slug of documentsOf(type)) {
        const res = resolvePublish(deliverables, type, slug, 'publish');
        if (!res.ok) expect(res.error).not.toBe('no_linked_deliverable');
      }
    }
  });
});

describe('deliverables.json integrity', () => {
  it('has unique ids', () => {
    const ids = deliverables.map((d) => d.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('lets exactly one deliverable govern each document', () => {
    // Cross-reference links are legitimate and stay (a teaser note points at the fiche it feeds), but
    // only the deliverable of the owning type may gate publication — otherwise `resolvePublish`
    // unions unrelated gates and reports a missing gate the operator cannot find on the card.
    for (const type of TYPES) {
      for (const slug of documentsOf(type)) {
        const governing = governingDeliverables(deliverables, type, slug);
        expect(
          governing.length,
          `${type}/${slug} est gouverné par ${governing.length} livrables : ${governing.map((d) => d.id).join(', ')}`,
        ).toBe(1);
      }
    }
  });

  it('keeps the Malacca cross-reference without letting it gate the fiche', () => {
    // The concrete case that surfaced the bug: the teaser note links to /atlas/malacca to say it
    // feeds it. That link must survive, and must not drag the note's gates onto the fiche.
    const linked = deliverables.filter((d) => deliverableLinksTo(d, 'atlas', 'malacca'));
    expect(linked.map((d) => d.id).sort()).toEqual([
      'deliv_atlas_malacca_fiche',
      'deliv_note_malacca_teaser',
    ]);
    expect(governingDeliverables(deliverables, 'atlas', 'malacca').map((d) => d.id)).toEqual([
      'deliv_atlas_malacca_fiche',
    ]);
  });
});
