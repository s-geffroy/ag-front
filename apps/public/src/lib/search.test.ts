import { describe, expect, it } from 'vitest';
import { classify, kindOf, rankResults, segmentsOf } from './search';

describe('segmentsOf', () => {
  it('strips origin, query, hash and trailing slash', () => {
    expect(segmentsOf('https://www.applied-geopolitics.com/notes/x/?a=1#b')).toEqual([
      'notes',
      'x',
    ]);
  });

  it('treats a directory URL and its index.html as the same path', () => {
    expect(segmentsOf('/atlas/ormuz/')).toEqual(segmentsOf('/atlas/ormuz/index.html'));
  });

  it('reduces the site root to no segments', () => {
    expect(segmentsOf('/')).toEqual([]);
  });
});

describe('kindOf', () => {
  it('classifies editorial documents', () => {
    expect(kindOf('/atlas/ormuz/')).toBe('fiche-atlas');
    expect(kindOf('/notes/prime-assurance/')).toBe('note');
    expect(kindOf('/dossiers/mer-rouge-suez/')).toBe('dossier');
  });

  it('classifies the database-derived Atlas pages', () => {
    expect(kindOf('/atlas/chokepoints/hormuz/')).toBe('point-de-passage');
    expect(kindOf('/atlas/systemes/energie/')).toBe('systeme');
  });

  it('does not mistake Atlas sub-indexes for fiches', () => {
    // The generic /atlas/<slug> rule is last, so these must be caught before it.
    expect(kindOf('/atlas/')).toBe('page');
    expect(kindOf('/atlas/carte/')).toBe('page');
    expect(kindOf('/atlas/risques/')).toBe('page');
    expect(kindOf('/atlas/systemes/')).toBe('page');
    expect(kindOf('/atlas/chokepoints/')).toBe('page');
  });

  it('does not mistake collection indexes for documents', () => {
    expect(kindOf('/notes/')).toBe('page');
    expect(kindOf('/dossiers/')).toBe('page');
  });

  it('classifies the method pages and falls back to page', () => {
    expect(kindOf('/methode-cvi/')).toBe('methode');
    expect(kindOf('/methode-hdde/')).toBe('methode');
    expect(kindOf('/methode-verdict/')).toBe('methode');
    expect(kindOf('/offres/')).toBe('page');
    expect(kindOf('/a-propos/')).toBe('page');
    expect(kindOf('/')).toBe('page');
  });
});

describe('classify', () => {
  it('pairs each kind with a badge and a bucket', () => {
    expect(classify('/notes/x/')).toEqual({ kind: 'note', badge: 'NOTE', rank: 0 });
    expect(classify('/atlas/systemes/x/')).toEqual({ kind: 'systeme', badge: 'SYSTÈME', rank: 3 });
  });
});

describe('rankResults', () => {
  it('puts editorial ahead of method, and method ahead of database-derived pages', () => {
    const ranked = rankResults([
      { url: '/atlas/systemes/energie/' },
      { url: '/methode-cvi/' },
      { url: '/atlas/chokepoints/hormuz/' },
      { url: '/notes/prime-assurance/' },
    ]);
    expect(ranked.map((r) => r.url)).toEqual([
      '/notes/prime-assurance/',
      '/methode-cvi/',
      '/atlas/chokepoints/hormuz/',
      '/atlas/systemes/energie/',
    ]);
  });

  it('sorts generic pages last, below the database-derived Atlas pages', () => {
    // Regression: on the query "ormuz" the home page and /veille outranked the Hormuz chokepoint
    // fiche, because both mention the corridor in passing. Weak-but-broad pages go to the bottom.
    const ranked = rankResults([
      { url: '/' },
      { url: '/veille/' },
      { url: '/atlas/chokepoints/p0_maritime_strait_strait_of_hormuz/' },
    ]);
    expect(ranked[0].url).toBe('/atlas/chokepoints/p0_maritime_strait_strait_of_hormuz/');
    expect(ranked.slice(1).map((r) => r.badge)).toEqual(['PAGE', 'PAGE']);
  });

  it('preserves the engine relevance order within a bucket', () => {
    const ranked = rankResults([
      { url: '/notes/second/' },
      { url: '/dossiers/first/' },
      { url: '/atlas/third/' },
    ]);
    // All three are editorial (rank 0) — the input order must survive untouched.
    expect(ranked.map((r) => r.url)).toEqual([
      '/notes/second/',
      '/dossiers/first/',
      '/atlas/third/',
    ]);
  });

  it('carries the original result fields through', () => {
    const [only] = rankResults([{ url: '/notes/x/', excerpt: 'hit' }]);
    expect(only.excerpt).toBe('hit');
    expect(only.badge).toBe('NOTE');
  });
});
