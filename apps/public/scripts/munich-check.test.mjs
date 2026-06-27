import { describe, expect, it } from 'vitest';
import { checkArtifact, isPublished } from './munich-check.mjs';

const okDossier = {
  data: {
    published: true,
    confidence: 'moyen',
    corrections: [],
    sources: [
      { label: 'A', type: 'institutionnel' },
      { label: 'B', type: 'presse_specialisee' },
      { label: 'C', type: 'donnees_ouvertes' },
    ],
  },
  body: '## Résumé\n...\n## Limites et angles morts\n...',
};

describe('isPublished', () => {
  it('treats notes as published unless drafted', () => {
    expect(isPublished('notes', {})).toBe(true);
    expect(isPublished('notes', { draft: true })).toBe(false);
  });
  it('treats atlas/dossiers as published only when published===true', () => {
    expect(isPublished('atlas', { published: false })).toBe(false);
    expect(isPublished('dossiers', { published: true })).toBe(true);
  });
});

describe('checkArtifact', () => {
  it('passes a compliant dossier', () => {
    expect(checkArtifact('dossiers', okDossier.data, okDossier.body)).toEqual([]);
  });

  it('R1: flags too few sources', () => {
    const issues = checkArtifact(
      'dossiers',
      { ...okDossier.data, sources: [{ label: 'A', type: 'x' }] },
      okDossier.body,
    );
    expect(issues.some((i) => i.startsWith('R1'))).toBe(true);
  });

  it('R1: flags a source missing label/type', () => {
    const issues = checkArtifact(
      'atlas',
      { published: true, corrections: [], sources: [{ label: 'A', type: 't' }, { label: 'B' }] },
      'x',
    );
    expect(issues.some((i) => i.includes('source #2'))).toBe(true);
  });

  it('R2: flags a dossier without a limits section', () => {
    const issues = checkArtifact('dossiers', okDossier.data, '## Résumé seulement');
    expect(issues.some((i) => i.startsWith('R2'))).toBe(true);
  });

  it('R3: flags a missing corrections field', () => {
    const { corrections, ...noCorr } = okDossier.data;
    void corrections;
    const issues = checkArtifact('dossiers', noCorr, okDossier.body);
    expect(issues.some((i) => i.startsWith('R3'))).toBe(true);
  });
});
