/**
 * Deck theme — the "carte d'état-major" identity, transcribed for slides.
 *
 * SOURCE OF TRUTH is `apps/public/src/styles/global.css` (light mode), NOT
 * `packages/tokens`, which is stale: it still announces `#1f4e79` and Source Serif 4 while the site
 * has moved to the admiralty-chart palette and Fraunces. `theme.test.ts` re-reads global.css and fails
 * if these values drift from it, so this file cannot silently fall behind the way tokens did.
 *
 * Colours are pptxgenjs hex: six digits, NO leading '#', no alpha (both corrupt the .pptx).
 */

/** Light-mode palette, transcribed from the `:root` block of global.css. */
export const palette = {
  canvas: 'F4F6F8', // cold chart paper — slide ground
  surface: 'FCFDFE', // instrument face — cards
  subtle: 'EAEEF2', // recessed cold neutral
  ink: '141C26', // blue-black chart ink — body text
  muted: '5C6875', // cold slate — captions, secondary
  line: 'D3DBE1', // cold hairline
  hairline: 'BFCAD3', // slightly darker rule
  accent: 'C8282C', // precise signal vermilion — the binding constraint
  navy: '0F3C4E', // deep teal-navy — structural ink of corridors
} as const;

/**
 * Calibrated vulnerability ramp, bas → critique. Sequential and meaning-bearing: it doubles as the map
 * legend on the site, so it must never be reused as decoration here either.
 */
export const cviRamp = ['167858', 'A8740E', 'C24E12', 'B82622'] as const;

/** The four CVI bands, in order. Labels are language-dependent and live in `copy.*.ts`. */
export const cviLevels = ['bas', 'modere', 'eleve', 'critique'] as const;
export type CviLevel = (typeof cviLevels)[number];

/**
 * Type roles mirror the site's assignment: Fraunces displays, Inter reads, IBM Plex Mono instruments
 * (coordinates, scores, datelines). Newsreader is deliberately absent — it is the long-form reading
 * face, and a slide is not long-form.
 *
 * These are NOT on the `pptx` skill's safe-font list. That is a deliberate, contained risk: the shipped
 * PDF embeds them, the `slides` image installs them so our own QA render is true-to-width, and the
 * .pptx travels with the TTFs. See ADR 0073 §6.
 */
export const fonts = {
  display: 'Fraunces',
  body: 'Inter',
  mono: 'IBM Plex Mono',
} as const;

/** Type scale in points. Titles clear 36pt so they cannot be mistaken for body at a glance. */
export const type = {
  coverTitle: 44,
  title: 34,
  statement: 28,
  sectionHeader: 20,
  body: 15,
  small: 12,
  caption: 10,
  instrument: 10, // mono labels: step numbers, scale ticks
} as const;

/** 13.33 × 7.5 in (LAYOUT_WIDE). Everything below is inches. */
export const geometry = {
  w: 13.33,
  h: 7.5,
  margin: 0.72, // > the 0.5" floor: this deck breathes
  contentW: 13.33 - 2 * 0.72,
  titleY: 0.86,
  /**
   * Titles are budgeted for TWO lines, always. Sizing the band to the shortest title is how a deck
   * ends up with a wrapped heading sitting on top of the content beneath it — which is exactly what
   * the first render of the CVI slide did. The cost is a little more air under one-line titles.
   */
  titleH: 1.32,
  bodyY: 2.4,
  /** Bottom of the content band — the footnote and folio live below this line. */
  bodyBottom: 6.3,
} as const;
