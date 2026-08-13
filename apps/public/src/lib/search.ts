/**
 * Classification of a search result, derived from its URL alone.
 *
 * The alternative was emitting `data-pagefind-meta` from every page template. That would mean
 * touching 100+ generated pages (30 chokepoints + 82 systèmes are produced by two dynamic routes)
 * and keeping the badge in sync with the route tree by hand. The route tree *is* the taxonomy here,
 * so reading it back off the path is both shorter and impossible to leave stale.
 */

export type ResultKind =
  | 'fiche-atlas'
  | 'dossier'
  | 'note'
  | 'methode'
  | 'point-de-passage'
  | 'systeme'
  | 'page';

export type Classification = {
  kind: ResultKind;
  /** Uppercase label shown as the badge in the overlay. */
  badge: string;
  /**
   * Sort bucket. Editorial (0) ahead of institutional/method (1), ahead of the database-derived
   * reference pages (2, 3). Within a bucket the engine's own relevance order is preserved.
   */
  rank: number;
};

const KINDS: Record<ResultKind, { badge: string; rank: number }> = {
  'fiche-atlas': { badge: 'FICHE ATLAS', rank: 0 },
  dossier: { badge: 'DOSSIER', rank: 0 },
  note: { badge: 'NOTE', rank: 0 },
  methode: { badge: 'MÉTHODE', rank: 1 },
  'point-de-passage': { badge: 'POINT DE PASSAGE', rank: 2 },
  systeme: { badge: 'SYSTÈME', rank: 3 },
  // Landing page, section indexes, /veille, /offres, /a-propos. Last on purpose: they mention
  // everything in passing, so they match almost any corridor name weakly. Ranking them above the
  // database pages put the home page ahead of the Hormuz fiche on the query "ormuz".
  page: { badge: 'PAGE', rank: 4 },
};

/** Reduce a Pagefind URL to bare path segments: no origin, no query, no hash, no empty segments. */
export function segmentsOf(url: string): string[] {
  let path = url;
  const schemeless = path.replace(/^[a-z]+:\/\/[^/]+/i, '');
  if (schemeless !== path) path = schemeless;
  path = path.split(/[?#]/)[0];
  path = path.replace(/\/index\.html?$/i, '/').replace(/\.html?$/i, '');
  return path.split('/').filter(Boolean);
}

export function kindOf(url: string): ResultKind {
  const seg = segmentsOf(url);
  if (seg.length === 0) return 'page';

  const [head, second] = seg;

  if (head === 'atlas') {
    // /atlas, /atlas/carte, /atlas/risques and /atlas/systemes are ordinary pages; only the deeper
    // routes carry a document. Order matters — the generic /atlas/<slug> rule must come last.
    if (seg.length === 1) return 'page';
    if (second === 'chokepoints') return seg.length > 2 ? 'point-de-passage' : 'page';
    if (second === 'systemes') return seg.length > 2 ? 'systeme' : 'page';
    if (second === 'carte' || second === 'risques') return 'page';
    return 'fiche-atlas';
  }

  if (head === 'notes') return seg.length > 1 ? 'note' : 'page';
  if (head === 'dossiers') return seg.length > 1 ? 'dossier' : 'page';
  if (head.startsWith('methode-')) return 'methode';

  return 'page';
}

export function classify(url: string): Classification {
  const kind = kindOf(url);
  return { kind, ...KINDS[kind] };
}

/**
 * Stable sort by rank bucket. `Array.prototype.sort` is stable (ES2019), which is the whole point:
 * relevance ordering inside a bucket is the engine's, not ours. A thin `systeme` page can therefore
 * never outrank a substantive note, but two notes stay in relevance order.
 */
export function rankResults<T extends { url: string }>(
  results: readonly T[],
): (T & Classification)[] {
  return results.map((r) => ({ ...r, ...classify(r.url) })).sort((a, b) => a.rank - b.rank);
}
