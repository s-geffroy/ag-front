/**
 * The slide model — one layout per editorial intention, not a generic DSL.
 *
 * Deliberately serialisable and free of any pptxgenjs import: `build-commercial.ts` produces this,
 * `render-pptx.ts` consumes it, and the tests assert over it without ever opening a .pptx. That split
 * is what lets `publication.test.ts` prove no slide links to an unpublished artifact.
 */

import type { CviLevel } from './theme';

/** A rendered link. `href` is checked against the site's publication flags — see `publication.ts`. */
export interface DeckLink {
  label: string;
  href: string;
}

export interface CoverSlide {
  kind: 'cover';
  title: string;
  baseline: string;
  meta: string; // dateline, mono — e.g. "PLAQUETTE · FR · 2026-08-10"
}

/** One sentence, set large. The argument, not a list of points. */
export interface StatementSlide {
  kind: 'statement';
  eyebrow: string;
  statement: string;
  support?: string;
}

export interface BulletsSlide {
  kind: 'bullets';
  eyebrow: string;
  title: string;
  bullets: string[];
  /** Rendered muted with an em-dash marker: what is explicitly NOT promised. */
  exclusions?: string[];
  footnote?: string;
}

/** The doctrine chain, as the site's CorridorChain instrument: dashed bearing line, diamond waypoints. */
export interface ChainSlide {
  kind: 'chain';
  eyebrow: string;
  title: string;
  steps: string[];
  footnote?: string;
}

/** The CVI meter, as the site's signature gauge: four graduated cells in a hairline frame. */
export interface CviRampSlide {
  kind: 'cvi-ramp';
  eyebrow: string;
  title: string;
  levels: { level: CviLevel; label: string; gloss: string }[];
  footnote?: string;
}

export interface ThreeColumnsSlide {
  kind: 'three-columns';
  eyebrow: string;
  title: string;
  columns: {
    name: string;
    promise: string;
    price: string;
    tagline: string;
    featured?: boolean;
  }[];
  footnote?: string;
}

export interface ComparisonTableSlide {
  kind: 'comparison-table';
  eyebrow: string;
  title: string;
  columnHeaders: string[];
  rows: { label: string; cells: (boolean | string)[] }[];
  footnote?: string;
}

export interface ContactSlide {
  kind: 'contact';
  title: string;
  lines: string[];
  links: DeckLink[];
}

export type Slide =
  | CoverSlide
  | StatementSlide
  | BulletsSlide
  | ChainSlide
  | CviRampSlide
  | ThreeColumnsSlide
  | ComparisonTableSlide
  | ContactSlide;

export type Lang = 'fr' | 'en';

export interface Deck {
  lang: Lang;
  /** Deck family — `commercial` today; the output path is derived from it. */
  family: string;
  title: string;
  subject: string;
  slides: Slide[];
}

/** Every string the deck renders, wherever it sits in the model. */
export function deckStrings(deck: Deck): string[] {
  const out: string[] = [];
  const walk = (v: unknown): void => {
    if (typeof v === 'string') out.push(v);
    else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === 'object') Object.values(v).forEach(walk);
  };
  walk(deck.slides);
  return out;
}

/**
 * Every site path the deck points at — not just `DeckLink.href`.
 *
 * Scanning the free text too is the whole point: the risk is not a structured link we forgot to check,
 * it is a bullet that says "see applied-geopolitics.com/atlas/malacca" for a fiche that is still
 * `published: false`. Matches `/atlas/x`, `/notes/x`, `/dossiers/x`, with or without a host prefix.
 */
export function deckSitePaths(deck: Deck): string[] {
  const re = /\/(atlas|notes|dossiers)\/[a-z0-9-]+/gi;
  return deckStrings(deck).flatMap((s) => s.match(re) ?? []);
}
