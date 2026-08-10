import { describe, expect, it } from 'vitest';
import {
  TO_COMPLETE,
  groupBody,
  legalPageIsComplete,
  legalPages,
  publishableLegalPages,
  type LegalPage,
} from './legal';

const page = (overrides: Partial<LegalPage> = {}): LegalPage => ({
  slug: 'test',
  navLabel: 'Test',
  title: 'Test',
  description: 'description',
  intro: 'intro',
  sections: [{ heading: 'Section', body: ['Une phrase complète.'] }],
  ...overrides,
});

describe('legalPageIsComplete', () => {
  it('accepts a page where every fact is filled in', () => {
    expect(legalPageIsComplete(page())).toBe(true);
  });

  it('rejects a marker wherever it hides', () => {
    // Each field is scanned, because a marker left in a heading or a description is just as
    // publishable — and just as embarrassing — as one left in a paragraph.
    expect(legalPageIsComplete(page({ title: `T ${TO_COMPLETE}` }))).toBe(false);
    expect(legalPageIsComplete(page({ description: TO_COMPLETE }))).toBe(false);
    expect(legalPageIsComplete(page({ intro: TO_COMPLETE }))).toBe(false);
    expect(legalPageIsComplete(page({ sections: [{ heading: TO_COMPLETE, body: ['ok'] }] }))).toBe(
      false,
    );
    expect(
      legalPageIsComplete(page({ sections: [{ heading: 'ok', body: ['a', TO_COMPLETE] }] })),
    ).toBe(false);
  });
});

describe('groupBody', () => {
  it('merges a run of bullets into one list and keeps paragraphs apart', () => {
    expect(groupBody(['Intro.', '- un', '- deux', 'Conclusion.'])).toEqual([
      { kind: 'p', text: 'Intro.' },
      { kind: 'ul', items: ['un', 'deux'] },
      { kind: 'p', text: 'Conclusion.' },
    ]);
  });

  it('starts a new list after an intervening paragraph', () => {
    expect(groupBody(['- a', 'texte', '- b'])).toEqual([
      { kind: 'ul', items: ['a'] },
      { kind: 'p', text: 'texte' },
      { kind: 'ul', items: ['b'] },
    ]);
  });

  it('leaves a hyphenated sentence alone — only "- " opens an item', () => {
    expect(groupBody(['-pas un item', 'Suez -- Bab el-Mandeb'])).toEqual([
      { kind: 'p', text: '-pas un item' },
      { kind: 'p', text: 'Suez -- Bab el-Mandeb' },
    ]);
  });

  it('returns nothing for an empty body', () => {
    expect(groupBody([])).toEqual([]);
  });
});

describe('publishableLegalPages', () => {
  it('never returns a page that still carries a marker', () => {
    // The invariant that must hold in BOTH states of the repo: before the facts are filled in
    // (nothing ships) and after (everything ships). This is the test that stops a placeholder
    // mentions-légales from reaching production via the unattended hourly rebuild.
    for (const p of publishableLegalPages()) {
      expect(legalPageIsComplete(p)).toBe(true);
    }
  });

  it('keeps slugs unique and URL-safe — they become the public path', () => {
    const slugs = legalPages.map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it('still declares the two pages French law requires', () => {
    // Guards against someone "fixing" the build by deleting the page instead of filling it in.
    expect(legalPages.map((p) => p.slug)).toEqual(
      expect.arrayContaining(['mentions-legales', 'politique-de-confidentialite']),
    );
  });

  it('gives every page a footer label and a description for the <title>/meta', () => {
    for (const p of legalPages) {
      expect(p.navLabel.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
      expect(p.sections.length).toBeGreaterThan(0);
    }
  });
});
