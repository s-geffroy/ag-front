import { describe, it, expect } from 'vitest';
import type { Deliverable } from '@ag/schema/cockpit';
import { resolvePublish, setFrontmatterFlag } from './publish';

function deliverable(overrides: Partial<Deliverable> = {}): Deliverable {
  return {
    id: 'deliv_x',
    title: 'X',
    description: '',
    type: 'atlas_fiche',
    pillar: 'production',
    status: 'review',
    priority: 'P0',
    progress: 90,
    deadline: '2026-08-01',
    next_action: '',
    impact: '',
    offer: 'basic',
    quality_gate_status: 'ok',
    gates: {
      sources_ok: true,
      llm_draft_done: true,
      contradiction_done: true,
      compliance_done: true,
      human_review_done: true,
      cvi_justified: true,
    },
    links: [{ label: 'Fiche', url: '/atlas/mer-rouge-suez' }],
    ...overrides,
  };
}

describe('resolvePublish', () => {
  it('allows publish when the linked deliverable has every validation gate', () => {
    const r = resolvePublish([deliverable()], 'atlas', 'mer-rouge-suez', 'publish');
    expect(r).toEqual({ ok: true, deliverableId: 'deliv_x' });
  });

  it('refuses publish and lists the missing gates', () => {
    const d = deliverable({
      gates: { ...deliverable().gates, human_review_done: false, compliance_done: false },
    });
    const r = resolvePublish([d], 'atlas', 'mer-rouge-suez', 'publish');
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toBe('gates_incomplete');
      expect(r.missing).toEqual(expect.arrayContaining(['compliance_done', 'human_review_done']));
    }
  });

  it('refuses publish when no deliverable is linked to the document', () => {
    const r = resolvePublish([deliverable()], 'atlas', 'autre-slug', 'publish');
    expect(r).toMatchObject({ ok: false, error: 'no_linked_deliverable' });
  });

  it('always allows unpublish, even with missing gates or no link', () => {
    const incomplete = deliverable({ gates: { ...deliverable().gates, human_review_done: false } });
    expect(resolvePublish([incomplete], 'atlas', 'mer-rouge-suez', 'unpublish').ok).toBe(true);
    expect(resolvePublish([], 'atlas', 'x', 'unpublish').ok).toBe(true);
  });

  it('ignores cvi_justified when it does not apply (undefined), requires it when present+false', () => {
    const noCvi = deliverable({ gates: { ...deliverable().gates, cvi_justified: undefined } });
    expect(resolvePublish([noCvi], 'atlas', 'mer-rouge-suez', 'publish').ok).toBe(true);
    const cviFalse = deliverable({ gates: { ...deliverable().gates, cvi_justified: false } });
    const r = resolvePublish([cviFalse], 'atlas', 'mer-rouge-suez', 'publish');
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.missing).toContain('cvi_justified');
  });
});

describe('setFrontmatterFlag', () => {
  const atlas = `---\ntitle: Mer Rouge\npublished: false\naccess: basic\n---\n\n# Corps\n\nTexte préservé.\n`;

  it('flips published false → true, preserving the body and other fields', () => {
    const { newRaw, publishedBefore } = setFrontmatterFlag(atlas, 'atlas', true);
    expect(publishedBefore).toBe(false);
    expect(newRaw).toContain('published: true');
    expect(newRaw).not.toContain('published: false');
    expect(newRaw).toContain('title: Mer Rouge');
    expect(newRaw).toContain('access: basic');
    expect(newRaw).toContain('# Corps');
    expect(newRaw).toContain('Texte préservé.');
  });

  it('reports publishedBefore=true when atlas was published', () => {
    const pub = atlas.replace('published: false', 'published: true');
    const { newRaw, publishedBefore } = setFrontmatterFlag(pub, 'atlas', false);
    expect(publishedBefore).toBe(true);
    expect(newRaw).toContain('published: false');
  });

  it('inserts the key when absent (atlas default = not public)', () => {
    const noKey = `---\ntitle: X\n---\n\nBody\n`;
    const { newRaw, publishedBefore } = setFrontmatterFlag(noKey, 'atlas', true);
    expect(publishedBefore).toBe(false);
    expect(newRaw).toContain('published: true');
    expect(newRaw).toContain('title: X');
    expect(newRaw).toContain('Body');
  });

  it('handles notes inverse polarity: publish → draft:false, was hidden (draft:true)', () => {
    const note = `---\ntitle: Note\ndraft: true\n---\n\nBody\n`;
    const { newRaw, publishedBefore } = setFrontmatterFlag(note, 'notes', true);
    expect(publishedBefore).toBe(false); // draft:true meant hidden
    expect(newRaw).toContain('draft: false');
  });

  it('notes default is public: unpublish inserts draft:true, publishedBefore=true', () => {
    const note = `---\ntitle: Note\n---\n\nBody\n`;
    const { newRaw, publishedBefore } = setFrontmatterFlag(note, 'notes', false);
    expect(publishedBefore).toBe(true);
    expect(newRaw).toContain('draft: true');
  });
});
