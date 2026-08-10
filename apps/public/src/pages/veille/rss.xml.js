import rss from '@astrojs/rss';
import { loadVeille } from '../../lib/veille';
import { site } from '../../lib/site';
import { humanize } from '../../lib/labels';

/**
 * Veille feed. Carries the PROMOTER's sentence as the description — never the model's headline
 * (ADR 0074): a feed reader is exactly the surface where a second-order summary would travel
 * furthest, read by people who will never click through to check it.
 *
 * Unlike the page, this file has no `getStaticPaths` to opt out of, so it is always built. An empty
 * feed is a valid feed — it says "nothing promoted", which is true, and it does not mislead the way
 * an empty *page* with a heading would.
 */
export function GET(context) {
  const entries = loadVeille();
  return rss({
    title: `${site.name} — Veille`,
    description: 'Couverture média retenue à la main sur les corridors stratégiques.',
    site: context.site,
    items: entries
      .filter((e) => e.promotedAt)
      .map((e) => ({
        title: `${e.corridorName} — ${humanize(e.item.event_category) || 'couverture'}`,
        pubDate: e.promotedAt,
        description: e.item.editorial_note,
        link: `/atlas/chokepoints/${e.corridorId}`,
      })),
    customData: '<language>fr-fr</language>',
  });
}
