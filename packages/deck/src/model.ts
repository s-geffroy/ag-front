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

/**
 * A dark full-bleed act divider. The deck's pulse: without these the reader has no idea whether they
 * are at the start of an argument or the end of one, and every slide reads at the same pitch.
 */
export interface SectionBreakSlide {
  kind: 'section-break';
  /** Act number, set in mono — `II`, `III`. */
  numeral: string;
  title: string;
  lede: string;
}

/** Two to four figures, set very large. Shows scale in the time it takes to glance. */
export interface StatRowSlide {
  kind: 'stat-row';
  eyebrow: string;
  title: string;
  stats: { value: string; label: string; note?: string }[];
  footnote?: string;
}

/**
 * A horizontal distribution, rendered as a NATIVE PowerPoint chart so it stays editable in the .pptx
 * rather than arriving as a picture the client cannot touch.
 */
export interface DistributionSlide {
  kind: 'distribution';
  eyebrow: string;
  title: string;
  unit: string;
  bars: { label: string; value: number }[];
  footnote?: string;
}

/** Numbered steps laid out as a grid — for sequences too long for the single-line `chain`. */
export interface SequenceSlide {
  kind: 'sequence';
  eyebrow: string;
  title: string;
  /** `marker` is the step's own sigil: `01`, or a letter for V·E·R·D·I·C·T. */
  steps: { marker: string; label: string; note: string }[];
  columns?: 2 | 3 | 4;
  footnote?: string;
}

/** Weighted criteria: the weight IS the bar, so the reader sees the arbitration's shape. */
export interface WeightedBarsSlide {
  kind: 'weighted-bars';
  eyebrow: string;
  title: string;
  items: { label: string; weight: number; question: string }[];
  footnote?: string;
}

/** A graduated scale, read bottom-up — the evidence ladder, and what it refuses to admit. */
export interface LadderSlide {
  kind: 'ladder';
  eyebrow: string;
  title: string;
  /** Ordered from the strongest rung down. `admissible: false` is rendered struck through. */
  rungs: { score: number; label: string; admissible: boolean }[];
  footnote?: string;
}

/** Text on the left, an instrument panel of key/value rows on the right. */
export interface SplitSlide {
  kind: 'split';
  eyebrow: string;
  title: string;
  body: string[];
  panelTitle: string;
  panel: { key: string; value: string }[];
  footnote?: string;
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
  | SectionBreakSlide
  | StatRowSlide
  | DistributionSlide
  | SequenceSlide
  | WeightedBarsSlide
  | LadderSlide
  | SplitSlide
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
