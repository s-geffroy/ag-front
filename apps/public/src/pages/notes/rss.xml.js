import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { site } from '../../lib/site';

export async function GET(context) {
  const notes = (await getCollection('notes', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );
  return rss({
    title: `${site.name} — Notes`,
    description: 'Notes courtes sur les corridors stratégiques et les flux de puissance.',
    site: context.site,
    items: notes.map((n) => ({
      title: n.data.title,
      pubDate: n.data.date,
      description: n.data.summary,
      link: `/notes/${n.slug}`,
    })),
    customData: '<language>fr-fr</language>',
  });
}
