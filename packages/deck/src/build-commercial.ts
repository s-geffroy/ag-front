/**
 * Assemble the commercial plaquette from the site's own canonical data.
 *
 * The single rule that makes this worth generating rather than writing by hand: anything that also
 * appears on the public site is IMPORTED from `apps/public/src/lib/site.ts`, never retyped. Prices,
 * the doctrine chain, the positioning and the contact details therefore cannot drift from /offres.
 * Only what has no FR/EN twin on the site lives in `copy.{fr,en}.ts`.
 */

import { doctrineChain, offers, site } from '../../../apps/public/src/lib/site';
import type { DeckCopy } from './copy';
import { en } from './copy.en';
import { fr } from './copy.fr';
import type { Deck, Lang, Slide } from './model';
import { cviLevels } from './theme';

const COPY: Record<Lang, DeckCopy> = { fr, en };

/** Offers, keyed — site.ts exposes them as an ordered array. */
function offer(id: 'basic' | 'standard' | 'premium') {
  const found = offers.find((o) => o.id === id);
  if (!found) throw new Error(`offer '${id}' missing from apps/public/src/lib/site.ts`);
  return found;
}

export function buildCommercialDeck(lang: Lang, date: string): Deck {
  const c = COPY[lang];
  const tiers = (['basic', 'standard', 'premium'] as const).map((id) => ({
    id,
    site: offer(id),
    copy: c.offers[id],
  }));

  const slides: Slide[] = [
    {
      kind: 'cover',
      title: site.name,
      baseline: site.baseline,
      meta: c.coverMeta(date),
    },
    {
      kind: 'statement',
      eyebrow: c.problem.eyebrow,
      statement: c.problem.statement,
      support: c.problem.support,
    },
    {
      kind: 'chain',
      eyebrow: c.chain.eyebrow,
      title: c.chain.title,
      steps: [...doctrineChain],
      footnote: c.chain.footnote,
    },
    {
      kind: 'statement',
      eyebrow: c.hiddenDependency.eyebrow,
      statement: c.hiddenDependency.statement,
      support: c.hiddenDependency.support,
    },
    {
      kind: 'cvi-ramp',
      eyebrow: c.cvi.eyebrow,
      title: c.cvi.title,
      levels: cviLevels.map((level, i) => ({
        level,
        label: c.cvi.levels[i]!,
        gloss: c.cvi.glosses[i]!,
      })),
      footnote: c.cvi.footnote,
    },
    {
      kind: 'bullets',
      eyebrow: c.cviLimits.eyebrow,
      title: c.cviLimits.title,
      bullets: c.cviLimits.bullets,
      exclusions: c.cviLimits.exclusions,
      footnote: c.cviLimits.footnote,
    },
    {
      kind: 'bullets',
      eyebrow: c.hdde.eyebrow,
      title: c.hdde.title,
      bullets: c.hdde.bullets,
      footnote: c.hdde.footnote,
    },
    {
      kind: 'bullets',
      eyebrow: c.verdict.eyebrow,
      title: c.verdict.title,
      bullets: c.verdict.bullets,
      footnote: c.verdict.footnote,
    },
    {
      kind: 'statement',
      eyebrow: c.coverage.eyebrow,
      statement: c.coverage.statement,
      support: c.coverage.support,
    },
    {
      kind: 'three-columns',
      eyebrow: c.offersIntro.eyebrow,
      title: c.offersIntro.title,
      columns: tiers.map((t) => ({
        name: t.site.name, // brand names are not translated
        promise: t.copy.promise,
        price: t.site.price, // ← the single source; never retyped in copy.*.ts
        tagline: t.copy.tagline,
        featured: t.site.featured,
      })),
      footnote: c.offersIntro.footnote,
    },
    ...tiers.map(
      (t): Slide => ({
        kind: 'bullets',
        eyebrow: `${c.offersIntro.eyebrow} · ${t.site.name}`,
        title: `${t.copy.promise} — ${t.site.price}`,
        bullets: t.copy.includes,
        exclusions: t.copy.excludes,
        footnote: t.copy.tagline,
      }),
    ),
    {
      kind: 'comparison-table',
      eyebrow: c.comparison.eyebrow,
      title: c.comparison.title,
      columnHeaders: tiers.map((t) => t.site.name),
      rows: c.comparison.rows,
      footnote: c.comparison.footnote,
    },
    {
      kind: 'bullets',
      eyebrow: c.pilot.eyebrow,
      title: c.pilot.title,
      bullets: c.pilot.bullets,
      footnote: c.pilot.footnote,
    },
    {
      kind: 'contact',
      title: c.contact.title,
      lines: c.contact.lines,
      links: [
        { label: site.email, href: `mailto:${site.email}` },
        // The URL itself, not a "Website" label: this slide is read on a projector and photographed.
        { label: site.url.replace(/^https:\/\//, ''), href: site.url },
      ],
    },
  ];

  return { lang, family: 'commercial', title: c.docTitle, subject: c.docSubject, slides };
}
