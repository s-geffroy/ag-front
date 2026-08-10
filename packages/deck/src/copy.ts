/**
 * The translation contract.
 *
 * Deliberately NOT nunjucks. The repo renders its HDDE/VERDICT exports from FR/EN `.j2` templates
 * (`apps/hdde-api/server/exports/render.ts`), but those run with `throwOnUndefined: false` — a key
 * missing from one language renders as empty and ships. An interface makes the same mistake a
 * compile error, which is what a client-facing artifact deserves.
 *
 * PRICES ARE NOT HERE. They come from `apps/public/src/lib/site.ts`, so the plaquette and /offres can
 * never disagree. Anything transcribed into this file is transcribed twice and will drift.
 */

export interface OfferCopy {
  /** Localised inclusion lines, replacing the FR-only `offers[].includes` from site.ts. */
  includes: string[];
  excludes: string[];
  promise: string;
  tagline: string;
}

export interface DeckCopy {
  /** Document metadata (PowerPoint "subject" field, cover dateline label). */
  docTitle: string;
  docSubject: string;
  coverMeta: (date: string) => string;

  problem: { eyebrow: string; statement: string; support: string };
  chain: { eyebrow: string; title: string; footnote: string };
  hiddenDependency: { eyebrow: string; statement: string; support: string };

  cvi: {
    eyebrow: string;
    title: string;
    levels: [string, string, string, string];
    glosses: [string, string, string, string];
    footnote: string;
  };
  /** The disclaimer slide. `exclusions` are rendered muted — what is explicitly NOT promised. */
  cviLimits: {
    eyebrow: string;
    title: string;
    bullets: string[];
    exclusions: string[];
    footnote: string;
  };

  hdde: { eyebrow: string; title: string; bullets: string[]; footnote: string };
  verdict: { eyebrow: string; title: string; bullets: string[]; footnote: string };

  coverage: { eyebrow: string; statement: string; support: string };

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
