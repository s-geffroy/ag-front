/**
 * Regrouper des articles d'actualité en HISTOIRES distinctes.
 *
 * POURQUOI CE FICHIER EXISTE ICI, ET PAS DANS UN SEUL CONSOMMATEUR. La règle a d'abord été écrite
 * dans le bot Slack, où elle a montré son utilité : sur Ormuz, 89 articles ne sont que 38 histoires
 * — le reste est une dépêche relayée par des dizaines de rédactions. Mais la promotion écrivait
 * ensuite les 89 articles BRUTS dans le magasin public, et la page corridor les recrachait à plat :
 * 82 médias, 41 Ko de balisage, aucune date, des titres arabes au milieu des anglais. Le travail
 * était fait du mauvais côté du mur.
 *
 * Une seule implémentation, donc, pour la fenêtre de promotion ET pour la page publique. Elles
 * doivent regrouper de la même façon, sinon ce qu'on choisit n'est pas ce qu'on publie.
 */

export interface NewsArticleLike {
  title?: string | null;
  url?: string | null;
  outlet?: string | null;
  /** Date d'OBSERVATION par le flux amont, pas de publication (ADR 0077). */
  observed_on?: string | null;
}

export interface NewsStory {
  title: string;
  url: string;
  outlet?: string;
  /** Rédactions distinctes portant cette histoire. Le poids réel — 1 signifie « pas de reprise ». */
  outlets: number;
  /** Articles regroupés sous cette histoire, reprises comprises. */
  articles: number;
  /** La PLUS ANCIENNE observation : un relais tardif ne rajeunit pas une dépêche. */
  observedOn?: string;
}

const NAMED: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  laquo: '«',
  raquo: '»',
};

/**
 * Les titres arrivent du flux avec leurs entités HTML (`Trump says&#xA0;the US…`). On les rend
 * lisibles, et on normalise l'espace insécable : invisible à l'œil mais distincte à la comparaison,
 * elle suffirait à empêcher deux titres identiques de se regrouper.
 */
export function decodeEntities(text: string): string {
  return text
    .replace(/&#x([0-9a-f]+);/gi, (_m, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_m, d) => String.fromCodePoint(Number(d)))
    .replace(/&([a-z]+);/gi, (m, n) => NAMED[n.toLowerCase()] ?? m)
    .replace(/ /g, ' ');
}

/** Clé de regroupement : le titre, dépouillé de sa ponctuation et de sa casse. */
export function storyKey(title: string): string {
  return decodeEntities(title)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function isHttp(u: unknown): u is string {
  return typeof u === 'string' && /^https?:\/\//i.test(u);
}

/**
 * Regroupe, puis classe : la plus portée d'abord, et à poids égal la plus récemment observée.
 *
 * Le classement n'est pas cosmétique. Sans lui, l'ordre du flux met en tête les quatre premières
 * reprises rencontrées — sur Ormuz, quatre radios locales identiques — pendant que l'article qui
 * aurait servi à juger attend en cinquième position.
 */
export function groupNewsStories(articles: readonly NewsArticleLike[]): NewsStory[] {
  const acc = new Map<string, NewsStory & { _outlets: Set<string> }>();
  for (const a of articles) {
    const title = (a.title ?? '').trim();
    const url = a.url ?? '';
    if (!title || !isHttp(url)) continue;
    const key = storyKey(title);
    const outlet = (a.outlet ?? '').toLowerCase() || undefined;
    const seen = acc.get(key);
    if (seen) {
      seen.articles += 1;
      if (a.observed_on && (!seen.observedOn || a.observed_on < seen.observedOn)) {
        seen.observedOn = a.observed_on;
      }
      if (outlet) seen._outlets.add(outlet);
    } else {
      acc.set(key, {
        title: decodeEntities(title),
        url,
        outlet: a.outlet ?? undefined,
        outlets: 0,
        articles: 1,
        observedOn: a.observed_on ?? undefined,
        _outlets: new Set(outlet ? [outlet] : []),
      });
    }
  }
  return [...acc.values()]
    .map(({ _outlets, ...s }) => ({ ...s, outlets: _outlets.size || 1 }))
    .sort(
      (x, y) => y.outlets - x.outlets || (y.observedOn ?? '').localeCompare(x.observedOn ?? ''),
    );
}
