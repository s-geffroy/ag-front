import { describe, expect, it } from 'vitest';
import { decodeEntities, groupNewsStories, storyKey } from './news-stories';

const wire = (outlet: string, observed = '2026-08-11') => ({
  title: "Strait of Hormuz will not reopen until US' naval blockade: Iran",
  url: `https://${outlet}/a`,
  outlet,
  observed_on: observed,
});

describe('groupNewsStories — 89 articles ne sont pas 89 nouvelles', () => {
  it('regroupe les reprises et compte les rédactions distinctes', () => {
    const s = groupNewsStories([wire('a.com'), wire('b.com'), wire('c.com')]);
    expect(s).toHaveLength(1);
    expect(s[0].outlets).toBe(3);
    expect(s[0].articles).toBe(3);
  });

  it('classe la plus portée en tête, quel que soit son rang dans le flux', () => {
    const s = groupNewsStories([
      { title: 'Entrefilet', url: 'https://z.com/1', outlet: 'z.com', observed_on: '2026-08-11' },
      wire('a.com'),
      wire('b.com'),
    ]);
    expect(s[0].outlets).toBe(2);
    expect(s[1].title).toBe('Entrefilet');
  });

  it('date une histoire par sa reprise la plus ancienne, sans la rajeunir', () => {
    const s = groupNewsStories([wire('a.com', '2026-08-11'), wire('b.com', '2026-08-08')]);
    expect(s[0].observedOn).toBe('2026-08-08');
  });

  it('ne compte pas un article sans lien http, ni un titre vide', () => {
    const s = groupNewsStories([
      { title: 'Sans lien', url: 'javascript:alert(1)', outlet: 'x' },
      { title: '', url: 'https://y.com/1', outlet: 'y' },
      wire('a.com'),
    ]);
    expect(s).toHaveLength(1);
    expect(s[0].outlet).toBe('a.com');
  });

  it('traite les entités HTML comme du texte, pas comme une différence de titre', () => {
    const s = groupNewsStories([
      { title: 'Trump says&#xA0;the US swept Hormuz', url: 'https://a/1', outlet: 'a' },
      { title: 'Trump says the US swept Hormuz', url: 'https://b/1', outlet: 'b' },
    ]);
    expect(s).toHaveLength(1);
    expect(s[0].title).not.toContain('&#');
  });

  it('rend une histoire même quand aucun média n’est déclaré', () => {
    const s = groupNewsStories([{ title: 'T', url: 'https://a/1' }]);
    expect(s[0].outlets).toBe(1);
  });

  it('normalise la clé sans écraser des titres réellement différents', () => {
    expect(storyKey('Hormuz : réouverture ?')).toBe(storyKey('hormuz réouverture'));
    expect(storyKey('Hormuz rouvre')).not.toBe(storyKey('Hormuz ferme'));
  });

  it('décode les entités numériques et nommées', () => {
    expect(decodeEntities('Oil &amp; gas &#8212; Hormuz')).toBe('Oil & gas — Hormuz');
  });
});
