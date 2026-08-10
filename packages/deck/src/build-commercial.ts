/**
 * Assemble the commercial plaquette from the site's own canonical data.
 *
 * The single rule that makes this worth generating rather than writing by hand: anything that also
 * appears on the public site is IMPORTED from `apps/public/src/lib/site.ts`, never retyped. Prices,
 * the doctrine chain, the positioning and the contact details therefore cannot drift from /offres.
 * Only what has no FR/EN twin on the site lives in `copy.{fr,en}.ts`.
 */

import { doctrineChain, offers, site } from '../../../apps/public/src/lib/site';
import { backend } from './backend-facts';
import type { DeckCopy } from './copy';
import { en } from './copy.en';
import { fr } from './copy.fr';
import { cviFacts } from './cvi-facts';
import type { MethodeCopy } from './methode-copy';
import { methodeEn } from './methode-copy.en';
import { methodeFr } from './methode-copy.fr';
import type { Deck, Lang, Slide } from './model';
import { cviLevels } from './theme';

const COPY: Record<Lang, DeckCopy> = { fr, en };
/** The long deck's copy, for the one panel the short deck borrows — see the coverage slide below. */
const METHODE: Record<Lang, MethodeCopy> = { fr: methodeFr, en: methodeEn };

/** Offers, keyed — site.ts exposes them as an ordered array. */
function offer(id: 'basic' | 'standard' | 'premium') {
  const found = offers.find((o) => o.id === id);
  if (!found) throw new Error(`offer '${id}' missing from apps/public/src/lib/site.ts`);
  return found;
}

export function buildCommercialDeck(lang: Lang, date: string): Deck {
  const c = COPY[lang];
  const m = METHODE[lang];
  /** The walkthrough's opening step — the four sourced measures the coverage slide borrows. */
  const measured = m.walkthrough.steps[0]!;
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
    // A second `statement` used to sit here ("visible dependency is not critical dependency"). It made
    // the same argument as slide 2 with the chain slide in between, and the deck could not afford two
    // slots for one idea. Its strongest image — the second rank — folded into slide 2's support, and
    // the slot went to the coverage slide below, which now carries verifiable figures.
    { kind: 'section-break', ...c.acts.ground },
    {
      kind: 'stat-row',
      eyebrow: c.substrate.eyebrow,
      title: c.substrate.title,
      stats: [backend.objects, backend.sources, backend.engines].map((value, i) => ({
        value: String(value),
        label: c.substrate.labels[i]!,
      })),
      footnote: c.substrate.footnote,
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
      footnote: c.cvi.footnote(cviFacts),
    },
    {
      kind: 'bullets',
      eyebrow: c.cviScope.eyebrow,
      title: c.cviScope.title,
      bullets: c.cviScope.bullets,
      // The measured coverage rides with the exclusions: it is a limit on what the scale currently
      // resolves to, and it belongs on the slide that states the claim it qualifies.
      exclusions: [...c.cviScope.exclusions, c.cviScope.measuredLimit(cviFacts)],
      footnote: c.cviScope.footnote,
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
    // The proof slide, and the reason this deck was restructured.
    //
    // A cold prospect reaching this point had been given two numbers — 313 and 3 — and no way to check
    // either, because every Atlas fiche is still `published: false` and the deck (correctly) links to
    // none of them. Meanwhile the one genuinely demonstrative sequence in the corpus, the Malacca
    // walkthrough, sat in the `methode` deck, read only by prospects already convinced. The proof was
    // on the wrong side.
    //
    // So the coverage slide now carries the walkthrough's opening panel: four institutional measures,
    // from the US EIA and MPA Singapore, that the reader can verify without us. Imported from the
    // methode copy rather than retyped — the figures have exactly one home.
    {
      kind: 'split',
      eyebrow: c.coverage.eyebrow,
      title: c.coverage.title,
      body: c.coverage.body,
      panelTitle: measured.panelTitle,
      panel: measured.panel,
      // Same disclaimer as in `methode`, and for the same reason: a slide gets photographed alone.
      footnote: `${m.walkthrough.disclaimer} ${measured.footnote}`,
    },
    { kind: 'section-break', ...c.acts.offers },
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
    // One slide per tier used to sit here. Dropped: the comparison table below says the same thing in
    // a form a prospect can actually compare, and three near-identical bullet slides were the deck's
    // flattest stretch. The per-tier detail lives on /offres, which is one click away.
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
