import { describe, it, expect } from 'vitest';
import type { NewsClusterOut, NewsFeedOut } from '@ag/chokepoints';
import { itemKey, noteOrigin, resolvePromoteFromFeed, toPromotedItem } from './promote-news';

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
      editorialNote: 'Couverture réelle, aucun incident confirmé.',
      promotedBy: 'sylvain',
      promotedAt: '2026-07-25T10:00:00Z',
    });
    expect(item.taint_class).toBe('cleared_only');
    expect(item.promoted_by).toBe('sylvain');
    expect(item.promoted_at).toBe('2026-07-25T10:00:00Z');
    expect(item.articles).toHaveLength(2);
    expect(item.affected_chokepoints[0]!.chokepoint_id).toBe('p0_x');
    // The model's headline is still STORED — it is the audit trail of what was proposed — but the
    // public component no longer renders it (ADR 0074). What the page shows is the line below.
    expect(item.headline).toContain('&#x2013;');
    expect(item.editorial_note).toBe('Couverture réelle, aucun incident confirmé.');
  });

  it('refuses to project a promotion with no human sentence (ADR 0074)', () => {
    // The gate is the schema, not the UI: a promotion written by any other caller fails here too.
    expect(() =>
      toPromotedItem(cluster(), {
        editorialNote: '   ',
        promotedBy: 'op',
        promotedAt: '2026-07-25T10:00:00Z',
      }),
    ).toThrow();
  });

  it('throws on a tainted cluster (local invariant, ADR 0013)', () => {
    expect(() =>
      toPromotedItem(cluster({ license_taint: true }), {
        editorialNote: 'n/a',
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
      {
        editorialNote: 'Couverture réelle, sans confirmation d’incident.',
        promotedBy: 'op',
        promotedAt: '2026-07-25T10:00:00Z',
      },
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

describe('noteOrigin — consigner d’où vient la phrase publiée', () => {
  const draft =
    'Les décideurs doivent anticiper des coûts supplémentaires et des routes alternatives.';

  it('dit « écrite » quand aucun brouillon n’a été proposé', () => {
    expect(noteOrigin('Ma phrase à moi.', undefined)).toBe('human_written');
    expect(noteOrigin('Ma phrase à moi.', '')).toBe('human_written');
  });

  it('dit « acceptée » quand le brouillon est publié intact', () => {
    expect(noteOrigin(draft, draft)).toBe('draft_accepted');
    expect(noteOrigin(`  ${draft}  `, draft)).toBe('draft_accepted');
  });

  it('dit « retouchée » quand la personne s’est approprié la phrase', () => {
    expect(
      noteOrigin(
        'Tout chargeur passant par Ormuz doit budgéter une surprime de guerre, sans date de levée.',
        draft,
      ),
    ).toBe('draft_edited');
  });

  it('ne qualifie pas d’acceptée une réécriture qui garde quelques mots', () => {
    expect(
      noteOrigin('Les décideurs doivent revoir leurs contrats d’assurance maritime.', draft),
    ).toBe('draft_edited');
  });
});

describe('noteOrigin — le journal ne doit pas dire « écrit par un humain » d’une phrase de machine', () => {
  const modele = 'La mort d’un chef mécanicien déplace le dossier vers l’atteinte aux personnes.';

  it('reste inchangé quand rien de la machine n’est en jeu', () => {
    expect(noteOrigin('Ma phrase à moi.', undefined)).toBe('human_written');
    expect(noteOrigin('Ma phrase à moi.', 'Un brouillon sans rapport avec ce texte.')).toBe(
      'draft_edited',
    );
  });

  it('reconnaît le brouillon publié tel quel, comme avant', () => {
    expect(noteOrigin('Un brouillon.', 'Un brouillon.')).toBe('draft_accepted');
  });

  it('RECONNAÎT UNE AUTRE PROSE DU MODÈLE recopiée — c’est ce qui passait pour « human_written »', () => {
    expect(noteOrigin(modele, undefined, [modele])).toBe('model_text_accepted');
    expect(noteOrigin(modele, 'Un brouillon sans rapport.', [modele])).toBe('model_text_accepted');
  });

  it('le brouillon prime : recopier le brouillon reste draft_accepted, pas l’autre valeur', () => {
    expect(noteOrigin('Un brouillon.', 'Un brouillon.', ['Un brouillon.'])).toBe('draft_accepted');
  });

  it('ne se déclenche pas sur une phrase qui ne fait qu’effleurer le texte du modèle', () => {
    expect(
      noteOrigin('Les clauses d’équipage deviennent le point dur de la négociation.', undefined, [
        modele,
      ]),
    ).toBe('human_written');
  });

  it('ignore les textes vides passés dans la liste', () => {
    expect(noteOrigin('Ma phrase.', undefined, ['', '   '])).toBe('human_written');
  });
});
