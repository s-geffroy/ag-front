/**
 * Slide model → .pptx, via pptxgenjs.
 *
 * The visual language is ported from the site's own instruments rather than invented:
 *  - the DIAMOND WAYPOINT of `CorridorMap`/`CorridorChain` is the bullet marker and the chain node;
 *  - the four-cell GAUGE of `CviMeter` is the CVI slide;
 *  - the dashed NAVY BEARING LINE carries the doctrine chain.
 * Repeating those three across the deck is what makes it read as this brand and not as a template.
 *
 * pptxgenjs footguns respected here, each of which silently corrupts or misplaces output:
 *  - `layout` is set BEFORE the first slide (the default canvas is 10", not 13.33");
 *  - hex colours carry no '#' and no alpha;
 *  - every add* call gets a FRESHLY BUILT options object (pptxgenjs mutates them in place);
 *  - bullets come from `bullet:`, never a literal glyph in the text;
 *  - `margin: 0` wherever text has to align with a shape at the same x.
 */

import PptxGenJS from 'pptxgenjs';
import type {
  BulletsSlide,
  ChainSlide,
  ComparisonTableSlide,
  ContactSlide,
  CoverSlide,
  CviRampSlide,
  Deck,
  Slide,
  StatementSlide,
  ThreeColumnsSlide,
} from './model';
import { cviRamp, fonts, geometry as g, palette as p, type } from './theme';

/**
 * Lozenge, U+25CA — the bullet marker, echoing the outline waypoint of `CorridorChain`.
 *
 * NOT U+25C6 (filled diamond), which is the obvious choice and the wrong one: pptxgenjs hard-codes
 * `buFont typeface="Arial"` on bullet glyphs, so the marker is resolved in Arial and not in the run's
 * own font — Inter has ◆, Arial and its Liberation substitute do not, and it renders as tofu on both
 * our converter and a client's PowerPoint. U+25CA is in WGL4, so Arial really does have it everywhere.
 */
const DIAMOND = '25CA';
/** Em dash, U+2014 — the marker for what is explicitly NOT included. */
const EMDASH = '2014';

type Sl = PptxGenJS.Slide;

// ── shared furniture ────────────────────────────────────────────────────────────────────────────

/** Mono, uppercase, letter-spaced: the instrument layer (eyebrows, datelines, scale ticks). */
function eyebrow(slide: Sl, text: string, color: string = p.muted): void {
  slide.addText(text.toUpperCase(), {
    x: g.margin,
    y: 0.52,
    w: g.contentW,
    h: 0.26,
    fontFace: fonts.mono,
    fontSize: type.instrument,
    color,
    charSpacing: 1.6,
    margin: 0,
    valign: 'middle',
  });
}

function title(slide: Sl, text: string): void {
  slide.addText(text, {
    x: g.margin,
    y: g.titleY,
    w: g.contentW,
    h: g.titleH,
    fontFace: fonts.display,
    fontSize: type.title,
    bold: true,
    color: p.ink,
    margin: 0,
    valign: 'top',
    lineSpacingMultiple: 1.05,
  });
}

function footnote(slide: Sl, text?: string): void {
  if (!text) return;
  slide.addText(text, {
    x: g.margin,
    y: g.h - 1.06,
    w: g.contentW - 1.2,
    h: 0.5,
    fontFace: fonts.body,
    fontSize: type.caption,
    italic: true,
    color: p.muted,
    margin: 0,
    valign: 'bottom',
  });
}

/** `03 / 15`, mono, bottom-right. Instrument, not decoration: it tells a reader where they are. */
function folio(slide: Sl, index: number, total: number, color: string = p.muted): void {
  slide.addText(`${String(index).padStart(2, '0')} / ${String(total).padStart(2, '0')}`, {
    x: g.w - g.margin - 1.2,
    y: g.h - 0.78,
    w: 1.2,
    h: 0.3,
    fontFace: fonts.mono,
    fontSize: type.instrument,
    color,
    align: 'right',
    margin: 0,
    valign: 'middle',
  });
}

/** A chart graticule: a sparse hairline grid. Used only on the two dark slides, as chart paper. */
function graticule(slide: Sl, color: string): void {
  for (let x = 1; x < 13; x += 1) {
    slide.addShape('line', {
      x,
      y: 0,
      w: 0,
      h: g.h,
      line: { color, width: 0.5, transparency: 78 },
    });
  }
  for (let y = 1; y < 8; y += 1) {
    slide.addShape('line', {
      x: 0,
      y,
      w: g.w,
      h: 0,
      line: { color, width: 0.5, transparency: 78 },
    });
  }
}

// ── layouts ─────────────────────────────────────────────────────────────────────────────────────

function renderCover(slide: Sl, s: CoverSlide): void {
  slide.background = { color: p.navy };
  graticule(slide, p.canvas);

  slide.addShape('diamond', {
    x: g.margin,
    y: 2.42,
    w: 0.2,
    h: 0.2,
    fill: { color: p.accent },
    line: { color: p.accent, width: 1 },
  });

  slide.addText(s.title, {
    x: g.margin,
    y: 2.86,
    w: 10.4,
    h: 1.5,
    fontFace: fonts.display,
    fontSize: type.coverTitle,
    bold: true,
    color: p.canvas,
    margin: 0,
    valign: 'top',
  });

  slide.addText(s.baseline, {
    x: g.margin,
    y: 4.36,
    w: 8.6,
    h: 0.9,
    fontFace: fonts.body,
    fontSize: 17,
    color: p.line,
    margin: 0,
    valign: 'top',
    lineSpacingMultiple: 1.25,
  });

  slide.addText(s.meta, {
    x: g.margin,
    y: g.h - 1.0,
    w: 7,
    h: 0.3,
    fontFace: fonts.mono,
    fontSize: type.instrument,
    color: p.hairline,
    charSpacing: 1.6,
    margin: 0,
    valign: 'middle',
  });
}

function renderStatement(slide: Sl, s: StatementSlide): void {
  slide.background = { color: p.canvas };
  eyebrow(slide, s.eyebrow, p.accent);

  // The statement sits in an instrument-face card. A card, not a stripe: an edge accent bar is the
  // single most template-looking thing a deck can do.
  slide.addShape('rect', {
    x: g.margin,
    y: 1.5,
    w: g.contentW,
    h: 3.5,
    fill: { color: p.surface },
    line: { color: p.line, width: 1 },
  });

  slide.addShape('diamond', {
    x: g.margin + 0.52,
    y: 2.0,
    w: 0.17,
    h: 0.17,
    fill: { color: p.navy },
    line: { color: p.navy, width: 1 },
  });

  slide.addText(s.statement, {
    x: g.margin + 0.52,
    y: 2.42,
    w: g.contentW - 1.6,
    h: 1.5,
    fontFace: fonts.display,
    fontSize: type.statement,
    bold: true,
    color: p.ink,
    margin: 0,
    valign: 'top',
    lineSpacingMultiple: 1.12,
  });

  if (s.support) {
    slide.addText(s.support, {
      x: g.margin + 0.52,
      y: 3.94,
      w: g.contentW - 1.6,
      h: 0.86,
      fontFace: fonts.body,
      fontSize: type.body,
      color: p.muted,
      margin: 0,
      valign: 'top',
      lineSpacingMultiple: 1.25,
    });
  }
}

function renderBullets(slide: Sl, s: BulletsSlide): void {
  slide.background = { color: p.canvas };
  eyebrow(slide, s.eyebrow);
  title(slide, s.title);

  const included = s.bullets.map((t, i) => ({
    text: t,
    options: {
      bullet: { code: DIAMOND, indent: 22 },
      color: p.ink,
      fontSize: type.body,
      paraSpaceAfter: 11,
      breakLine: i < s.bullets.length - 1 || !!s.exclusions?.length,
    },
  }));

  const excluded = (s.exclusions ?? []).map((t, i, arr) => ({
    text: t,
    options: {
      bullet: { code: EMDASH, indent: 22 },
      color: p.muted,
      fontSize: type.small,
      paraSpaceAfter: 8,
      breakLine: i < arr.length - 1,
    },
  }));

  // Top-anchored, deliberately. Centring was tried and looks worse: a short list floats away from its
  // own title, which reads as a mistake, whereas whitespace *below* a list reads as composure.
  slide.addText([...included, ...excluded], {
    x: g.margin,
    y: g.bodyY,
    w: 9.6,
    h: g.bodyBottom - g.bodyY,
    fontFace: fonts.body,
    margin: 0,
    valign: 'top',
  });

  footnote(slide, s.footnote);
}

function renderChain(slide: Sl, s: ChainSlide): void {
  slide.background = { color: p.canvas };
  eyebrow(slide, s.eyebrow);
  title(slide, s.title);

  const n = s.steps.length;
  const cellW = g.contentW / n;
  // The chain block (node + number + label) is ~1.1" tall; centre it in the content band.
  const nodeY = (g.bodyY + g.bodyBottom) / 2 - 0.55;

  // The plotted route: a dashed bearing line from the first waypoint to the last, exactly as
  // CorridorChain.astro draws it — inset by half a cell at each end so it starts and ends on a node.
  slide.addShape('line', {
    x: g.margin + cellW / 2,
    y: nodeY + 0.09,
    w: g.contentW - cellW,
    h: 0,
    line: { color: p.navy, width: 1, dashType: 'dash', transparency: 45 },
  });

  s.steps.forEach((step, i) => {
    const last = i === n - 1;
    const cx = g.margin + cellW * i;
    const color = last ? p.accent : p.navy;

    slide.addShape('diamond', {
      x: cx + cellW / 2 - 0.09,
      y: nodeY,
      w: 0.18,
      h: 0.18,
      fill: { color: last ? p.accent : p.canvas },
      line: { color, width: 1.5 },
    });

    slide.addText(String(i + 1).padStart(2, '0'), {
      x: cx,
      y: nodeY + 0.32,
      w: cellW,
      h: 0.22,
      fontFace: fonts.mono,
      fontSize: type.instrument,
      color: last ? p.accent : p.muted,
      align: 'center',
      margin: 0,
      valign: 'middle',
    });

    slide.addText(step.toUpperCase(), {
      x: cx,
      y: nodeY + 0.58,
      w: cellW,
      h: 0.5,
      fontFace: fonts.mono,
      fontSize: 11,
      bold: last,
      color: last ? p.accent : p.ink,
      charSpacing: 0.8,
      align: 'center',
      margin: 0,
      valign: 'top',
    });
  });

  footnote(slide, s.footnote);
}

function renderCviRamp(slide: Sl, s: CviRampSlide): void {
  slide.background = { color: p.canvas };
  eyebrow(slide, s.eyebrow);
  title(slide, s.title);

  const rowH = 0.82;
  const top = (g.bodyY + g.bodyBottom) / 2 - (rowH * 4) / 2;
  const gaugeX = g.margin;
  const cellW = 0.42;
  const cellH = 0.3;

  s.levels.forEach((lv, i) => {
    const y = top + rowH * i;

    // The CviMeter gauge: four graduated cells in a hairline frame, filled up to this level.
    for (let c = 0; c < 4; c += 1) {
      slide.addShape('rect', {
        x: gaugeX + cellW * c,
        y,
        w: cellW,
        h: cellH,
        fill: { color: c <= i ? cviRamp[c]! : p.subtle },
        line: { color: p.hairline, width: 0.75 },
      });
    }

    slide.addText(lv.label.toUpperCase(), {
      x: gaugeX + cellW * 4 + 0.34,
      y,
      w: 1.7,
      h: cellH,
      fontFace: fonts.mono,
      fontSize: 12,
      bold: true,
      color: cviRamp[i]!,
      charSpacing: 1,
      margin: 0,
      valign: 'middle',
    });

    slide.addText(lv.gloss, {
      x: gaugeX + cellW * 4 + 2.16,
      y,
      w: g.contentW - (cellW * 4 + 2.16),
      h: cellH,
      fontFace: fonts.body,
      fontSize: type.body,
      color: p.ink,
      margin: 0,
      valign: 'middle',
    });
  });

  footnote(slide, s.footnote);
}

function renderThreeColumns(slide: Sl, s: ThreeColumnsSlide): void {
  slide.background = { color: p.canvas };
  eyebrow(slide, s.eyebrow);
  title(slide, s.title);

  const gap = 0.36;
  const cardW = (g.contentW - gap * 2) / 3;
  const cardH = 3.35;
  const cardY = (g.bodyY + g.bodyBottom) / 2 - cardH / 2;

  s.columns.forEach((col, i) => {
    const x = g.margin + (cardW + gap) * i;

    slide.addShape('rect', {
      x,
      y: cardY,
      w: cardW,
      h: cardH,
      fill: { color: col.featured ? p.surface : p.canvas },
      line: { color: col.featured ? p.navy : p.line, width: col.featured ? 1.75 : 1 },
    });

    slide.addText(col.promise.toUpperCase(), {
      x: x + 0.34,
      y: cardY + 0.34,
      w: cardW - 0.68,
      h: 0.26,
      fontFace: fonts.mono,
      fontSize: type.instrument,
      color: col.featured ? p.accent : p.muted,
      charSpacing: 1.4,
      margin: 0,
      valign: 'middle',
    });

    slide.addText(col.name, {
      x: x + 0.34,
      y: cardY + 0.7,
      w: cardW - 0.68,
      h: 0.6,
      fontFace: fonts.display,
      fontSize: 26,
      bold: true,
      color: p.ink,
      margin: 0,
      valign: 'top',
    });

    slide.addText(col.price, {
      x: x + 0.34,
      y: cardY + 1.44,
      w: cardW - 0.68,
      h: 0.4,
      fontFace: fonts.mono,
      fontSize: 15,
      bold: true,
      color: p.navy,
      margin: 0,
      valign: 'middle',
    });

    slide.addText(col.tagline, {
      x: x + 0.34,
      y: cardY + 2.0,
      w: cardW - 0.68,
      h: 1.0,
      fontFace: fonts.body,
      fontSize: 13,
      color: p.muted,
      margin: 0,
      valign: 'top',
      lineSpacingMultiple: 1.25,
    });
  });

  footnote(slide, s.footnote);
}

function renderComparisonTable(slide: Sl, s: ComparisonTableSlide): void {
  slide.background = { color: p.canvas };
  eyebrow(slide, s.eyebrow);
  title(slide, s.title);

  const head: PptxGenJS.TableRow = [
    {
      text: '',
      options: { fill: { color: p.navy } },
    },
    ...s.columnHeaders.map((h) => ({
      text: h,
      options: {
        fill: { color: p.navy },
        color: p.canvas,
        bold: true,
        align: 'center' as const,
        fontFace: fonts.mono,
        fontSize: 11,
      },
    })),
  ];

  const body: PptxGenJS.TableRow[] = s.rows.map((row, r) => [
    {
      text: row.label,
      options: {
        color: p.ink,
        fontSize: 12,
        fill: { color: r % 2 ? p.canvas : p.surface },
      },
    },
    ...row.cells.map((cell) => ({
      // A tick is affirmative, an en dash is a plain absence — never a cross, which reads as a fault.
      text: cell === true ? '✓' : cell === false ? '–' : String(cell),
      options: {
        align: 'center' as const,
        fontSize: 12,
        bold: cell === true,
        color: cell === true ? p.navy : cell === false ? p.hairline : p.ink,
        fill: { color: r % 2 ? p.canvas : p.surface },
        fontFace: typeof cell === 'string' ? fonts.mono : fonts.body,
      },
    })),
  ]);

  slide.addTable([head, ...body], {
    x: g.margin,
    y: g.bodyY,
    w: g.contentW,
    colW: [5.6, 1.1, 1.1, 1.1].map((c) => (c * g.contentW) / 8.9),
    border: { type: 'solid', color: p.line, pt: 0.5 },
    fontFace: fonts.body,
    margin: [4, 8, 4, 8],
    valign: 'middle',
    rowH: 0.34,
  });

  footnote(slide, s.footnote);
}

function renderContact(slide: Sl, s: ContactSlide): void {
  slide.background = { color: p.navy };
  graticule(slide, p.canvas);

  slide.addText(s.title, {
    x: g.margin,
    y: 2.3,
    w: 9.4,
    h: 0.9,
    fontFace: fonts.display,
    fontSize: 36,
    bold: true,
    color: p.canvas,
    margin: 0,
    valign: 'top',
  });

  slide.addText(
    s.lines.map((l, i) => ({
      text: l,
      options: {
        color: p.line,
        fontSize: 14,
        paraSpaceAfter: 8,
        breakLine: i < s.lines.length - 1,
      },
    })),
    {
      x: g.margin,
      y: 3.34,
      w: 8.8,
      h: 1.3,
      fontFace: fonts.body,
      margin: 0,
      valign: 'top',
    },
  );

  s.links.forEach((link, i) => {
    slide.addText(link.label, {
      x: g.margin,
      y: 4.86 + i * 0.42,
      w: 6,
      h: 0.34,
      fontFace: fonts.mono,
      fontSize: 14,
      color: p.canvas,
      hyperlink: { url: link.href },
      margin: 0,
      valign: 'middle',
    });
  });
}

// ── entry point ─────────────────────────────────────────────────────────────────────────────────

function renderSlide(pres: PptxGenJS, s: Slide, index: number, total: number): void {
  const slide = pres.addSlide();
  switch (s.kind) {
    case 'cover':
      renderCover(slide, s);
      return; // no folio on the cover
    case 'statement':
      renderStatement(slide, s);
      break;
    case 'bullets':
      renderBullets(slide, s);
      break;
    case 'chain':
      renderChain(slide, s);
      break;
    case 'cvi-ramp':
      renderCviRamp(slide, s);
      break;
    case 'three-columns':
      renderThreeColumns(slide, s);
      break;
    case 'comparison-table':
      renderComparisonTable(slide, s);
      break;
    case 'contact':
      renderContact(slide, s);
      folio(slide, index, total, p.hairline);
      return;
  }
  folio(slide, index, total);
}

/**
 * Write the deck to `outPath`.
 *
 * `date` also stamps the document metadata: pptxgenjs otherwise writes the wall-clock time into
 * core.xml, and `presentations/` is VERSIONED — an unstamped rebuild would produce a binary diff on
 * every run and pollute the history with changes that alter nothing.
 */
export async function renderDeckToPptx(deck: Deck, outPath: string, date: string): Promise<void> {
  const pres = new PptxGenJS();
  pres.layout = 'LAYOUT_WIDE'; // 13.33 × 7.5 in — MUST precede the first addSlide()
  pres.author = 'Applied Geopolitics';
  pres.company = 'Applied Geopolitics — LucidAxis';
  pres.title = deck.title;
  pres.subject = deck.subject;
  pres.revision = date;

  const total = deck.slides.length;
  deck.slides.forEach((s, i) => renderSlide(pres, s, i + 1, total));

  await pres.writeFile({ fileName: outPath });
}
