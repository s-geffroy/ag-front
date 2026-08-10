/**
 * The translation contract.
 *
 * Deliberately NOT nunjucks. The repo renders its HDDE/VERDICT exports from FR/EN `.j2` templates
 * (`apps/hdde-api/server/exports/render.ts`), but those run with `throwOnUndefined: false` — a key
 * missing from one language renders as empty and ships. An interface makes the same mistake a
 * compile error, which is what a client-facing artifact deserves.
 *
 * PRICES ARE NOT HERE. They come from `apps/public/src/lib/site.ts`, so the plaquette and /offres can
 * never disagree. MEASUREMENTS ARE NOT HERE EITHER: anything counted is imported from
 * `backend-facts.ts` / `cvi-facts.ts` and reaches the copy as a function argument. Anything
 * transcribed into this file is transcribed twice and will drift — the VERDICT score bands did.
 */

import type { CviFacts } from './cvi-facts';

export interface OfferCopy {
  promise: string;
  tagline: string;
}

export interface DeckCopy {
  /** Document metadata (PowerPoint "subject" field, cover dateline label). */
  docTitle: string;
  docSubject: string;
  coverMeta: (date: string) => string;

  /** The two dark act dividers that give the short deck its pulse. */
  acts: {
    ground: { numeral: string; title: string; lede: string };
    offers: { numeral: string; title: string; lede: string };
  };
  /** The substrate figures slide — the credibility beat the short deck was missing. */
  substrate: { eyebrow: string; title: string; labels: [string, string, string]; footnote: string };

  problem: { eyebrow: string; statement: string; support: string };
  chain: { eyebrow: string; title: string; footnote: string };

  cvi: {
    eyebrow: string;
    title: string;
    levels: [string, string, string, string];
    glosses: [string, string, string, string];
    /**
     * Takes the measured coverage, because the gauge is the slide most likely to mislead: it shows
     * four bands, and every instructed corridor currently sits in the top one. The footnote is where
     * that gets said, in the same breath as the scale it qualifies.
     */
    footnote: (f: CviFacts) => string;
  };
  /**
   * What the CVI establishes — and, in support, what it does not claim.
   *
   * `bullets` lead and carry the substance; `exclusions` render muted and smaller beneath them. That
   * order is the point: a slide titled "what this is not" reads as a defence, and the limits land
   * harder when they qualify a stated claim than when they ARE the claim.
   */
  cviScope: {
    eyebrow: string;
    title: string;
    bullets: string[];
    exclusions: string[];
    /** The measured state of the base, rendered as a final exclusion. Built from `cvi-facts.ts`. */
    measuredLimit: (f: CviFacts) => string;
    footnote: string;
  };

  hdde: { eyebrow: string; title: string; bullets: string[]; footnote: string };
  verdict: { eyebrow: string; title: string; bullets: string[]; footnote: string };

  /**
   * Coverage — and the deck's only externally checkable moment.
   *
   * `panelTitle` and `panel` are NOT here: they are borrowed from the methode deck's walkthrough, so
   * the four institutional measures have exactly one home. This copy owns the framing only.
   */
  coverage: { eyebrow: string; title: string; body: string[] };

  offersIntro: { eyebrow: string; title: string; footnote: string };
  offers: { basic: OfferCopy; standard: OfferCopy; premium: OfferCopy };
  comparison: {
    eyebrow: string;
    title: string;
    rows: { label: string; cells: (boolean | string)[] }[];
    footnote: string;
  };
  pilot: { eyebrow: string; title: string; bullets: string[]; footnote: string };

  contact: { title: string; lines: string[] };
}
