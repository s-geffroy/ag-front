import { describe, it, expect } from 'vitest';
import type { NewsClusterOut, NewsFeedOut } from '@ag/chokepoints';
import { itemKey, resolvePromoteFromFeed, toPromotedItem } from './promote-news';

function cluster(overrides: Partial<NewsClusterOut> = {}): NewsClusterOut {
  return {
    cluster_id: 'c1',
    headline: 'Titre &#x2013; test',
    summary_text: '',
    event_category: 'disruption',
    salience_score: 0.4,
    article_count: 2,
    source_domains: [],
    articles: [
      {
        title: 'A',
        url: 'https://ex.com/a',
        outlet: 'Ex',
        source_id: 'gdelt_gkg',
        observed_on: '2026-07-20',
      },
      {
        title: 'B',
        url: 'https://ex.com/b',
        outlet: 'Ex2',
        source_id: 'reuters',
        observed_on: '2026-07-20',
      },
    ],
    affected_chokepoints: [{ chokepoint_id: 'p0_x', canonical_name: 'X', relevance: 0.9 }],
    first_seen: '2026-07-19',
    last_seen: '2026-07-20',
    license_taint: false,
    status: 'stress',
    generated_at: '2026-07-20T00:00:00Z',
    ...overrides,
  } as NewsClusterOut;
}

function feed(items: NewsClusterOut[]): NewsFeedOut {
  return { items } as NewsFeedOut;
}

describe('promote-news — resolvePromoteFromFeed', () => {
  it('selects a cluster by cluster_id', () => {
    const r = resolvePromoteFromFeed(feed([cluster()]), { cluster_id: 'c1' });
    expect(r.ok).toBe(true);
  });

  it('selects a cluster by article-url overlap when cluster_id is not given', () => {
    const r = resolvePromoteFromFeed(feed([cluster()]), { article_urls: ['https://ex.com/b'] });
    expect(r.ok && r.cluster.cluster_id).toBe('c1');
  });

  it('404 when no cluster matches', () => {
    const r = resolvePromoteFromFeed(feed([cluster()]), { cluster_id: 'nope' });
    expect(r).toMatchObject({ ok: false, status: 404 });
  });

  it('REFUSES a tainted cluster (ADR 0013 belt)', () => {
    const r = resolvePromoteFromFeed(feed([cluster({ license_taint: true })]), {
      cluster_id: 'c1',
    });
    expect(r).toMatchObject({ ok: false, status: 409, error: 'cluster_tainted' });
  });

  it('refuses a cluster with no attributable http article', () => {
    const r = resolvePromoteFromFeed(
      feed([cluster({ articles: [{ url: 'javascript:alert(1)' }] as NewsClusterOut['articles'] })]),
      { cluster_id: 'c1' },
    );
    expect(r).toMatchObject({ ok: false, status: 409, error: 'no_attributable_article' });
  });
});

describe('promote-news — toPromotedItem', () => {
  it('projects the public-safe subset, forces cleared_only, stamps who/when', () => {
    const item = toPromotedItem(cluster(), {
      promotedBy: 'sylvain',
      promotedAt: '2026-07-25T10:00:00Z',
    });
    expect(item.taint_class).toBe('cleared_only');
    expect(item.promoted_by).toBe('sylvain');
    expect(item.promoted_at).toBe('2026-07-25T10:00:00Z');
    expect(item.articles).toHaveLength(2);
    expect(item.affected_chokepoints[0]!.chokepoint_id).toBe('p0_x');
    // prose is kept verbatim (the public component decodes/escapes at render — not here)
    expect(item.headline).toContain('&#x2013;');
  });

  it('throws on a tainted cluster (local invariant, ADR 0013)', () => {
    expect(() =>
      toPromotedItem(cluster({ license_taint: true }), {
        promotedBy: 'op',
        promotedAt: '2026-07-25T10:00:00Z',
      }),
    ).toThrow(/tainted/);
  });

  it('drops non-http article URLs (defence-in-depth against javascript:/data:)', () => {
    const item = toPromotedItem(
      cluster({
        articles: [
          { title: 'ok', url: 'https://ex.com/ok', outlet: 'Ex', source_id: 's', observed_on: '' },
          {
            title: 'evil',
            url: 'javascript:alert(1)',
            outlet: 'X',
            source_id: 's',
            observed_on: '',
          },
          { title: 'data', url: 'data:text/html,x', outlet: 'X', source_id: 's', observed_on: '' },
        ],
      }),
      { promotedBy: 'op', promotedAt: '2026-07-25T10:00:00Z' },
    );
    expect(item.articles).toHaveLength(1);
    expect(item.articles[0]!.url).toBe('https://ex.com/ok');
  });
});

describe('promote-news — itemKey', () => {
  it('keys by cluster_id when present', () => {
    expect(itemKey({ cluster_id: 'c9', articles: [] })).toBe('id:c9');
  });

  it('keys by sorted article-url set when cluster_id is empty (cluster_id is not durable)', () => {
    const k = itemKey({
      cluster_id: '',
      articles: [
        { title: '', url: 'https://b.com', outlet: '', source_id: '', observed_on: '' },
        { title: '', url: 'https://a.com', outlet: '', source_id: '', observed_on: '' },
      ],
    });
    expect(k).toBe('urls:https://a.com|https://b.com');
  });
});
