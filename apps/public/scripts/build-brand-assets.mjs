#!/usr/bin/env node
/**
 * Generate the raster brand assets the HTML head points at:
 *   - `public/og.png`               (1200×630) — the default Open Graph / Twitter card
 *   - `public/apple-touch-icon.png` (180×180)  — iOS home-screen icon
 *
 * Why committed PNGs rather than build-time generation: they change only when the brand changes.
 * Rasterising them on every build would put fontconfig and sharp on the critical path of the
 * unattended hourly rebuild, to redraw identical files. So this script is run by hand, and its
 * output is versioned:
 *
 *   docker compose -f docker/docker-compose.yml run --rm tools \
 *     npm --workspace @ag/public run build:brand
 *
 * The card is drawn from the site's own tokens (apps/public/src/styles/global.css) and the same three
 * families the pages use — Fraunces for display, IBM Plex Mono for the instrument layer, Inter for
 * chrome. The TTFs live in `presentations/fonts/` (already vendored for the decks, ADR 0073); they are
 * registered with fontconfig here because librsvg resolves text through it.
 *
 * Deterministic: no date, no counter, no randomness. Re-running on an unchanged repo rewrites the
 * same bytes.
 */

import { execFileSync } from 'node:child_process';
import { cpSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const PUBLIC_APP = join(here, '..');
const FONTS_SRC = join(PUBLIC_APP, '../../presentations/fonts');
const OUT = join(PUBLIC_APP, 'public/og.png');
const OUT_TOUCH = join(PUBLIC_APP, 'public/apple-touch-icon.png');

const WIDTH = 1200;
const HEIGHT = 630;

// Light-theme tokens, read off global.css. Kept as literals so the card does not depend on parsing
// CSS at build time — if a token moves, this file is the one place to follow it.
const NAVY = '#0f3c4e'; // --navy, deep teal-navy structural ink
const PAPER = '#f4f6f8'; // --canvas, cold chart paper
const MUTED = '#8fa6b2'; // cold slate, lightened for legibility on navy
const ACCENT = '#c8282c'; // --accent, precise signal vermilion
const GRID = '#1a4c60'; // graticule hairline on navy

/** Make the vendored brand fonts resolvable by librsvg (which goes through fontconfig). */
function registerFonts() {
  const dir = join(homedir(), '.local/share/fonts');
  mkdirSync(dir, { recursive: true });
  for (const f of readdirSync(FONTS_SRC).filter((f) => f.endsWith('.ttf'))) {
    cpSync(join(FONTS_SRC, f), join(dir, f));
  }
  execFileSync('fc-cache', ['-f'], { stdio: 'ignore' });
}

/**
 * The graticule: the same cartographic ground the site uses, drawn sparse enough to stay a texture.
 * Meridians are denser than parallels so the card reads as a chart, not as graph paper.
 */
function graticule() {
  const lines = [];
  for (let x = 0; x <= WIDTH; x += 60) {
    lines.push(`<line x1="${x}" y1="0" x2="${x}" y2="${HEIGHT}" />`);
  }
  for (let y = 0; y <= HEIGHT; y += 60) {
    lines.push(`<line x1="0" y1="${y}" x2="${WIDTH}" y2="${y}" />`);
  }
  return `<g stroke="${GRID}" stroke-width="1" opacity="0.55">${lines.join('')}</g>`;
}

/**
 * A schematic corridor: two gates, a chokepoint between them, and a dashed bypass arcing around it.
 * It is the site's own visual argument in one stroke — the direct route is short and pinched, the
 * alternative is long. Schematic by construction: no coastline, no projection, no coordinates.
 */
function corridor() {
  const y = 470;
  const gateL = 120;
  const gateR = 1080;
  const choke = 600;
  return `
    <g>
      <line x1="${gateL}" y1="${y}" x2="${gateR}" y2="${y}" stroke="${PAPER}" stroke-width="2" opacity="0.85" />
      <path d="M ${gateL} ${y} Q ${choke} ${y + 120} ${gateR} ${y}"
            fill="none" stroke="${MUTED}" stroke-width="2" stroke-dasharray="8 7" opacity="0.75" />
      <circle cx="${gateL}" cy="${y}" r="7" fill="${PAPER}" />
      <circle cx="${gateR}" cy="${y}" r="7" fill="${PAPER}" />
      <circle cx="${choke}" cy="${y}" r="12" fill="${ACCENT}" />
      <circle cx="${choke}" cy="${y}" r="22" fill="none" stroke="${ACCENT}" stroke-width="2" opacity="0.5" />
    </g>`;
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <rect width="${WIDTH}" height="${HEIGHT}" fill="${NAVY}" />
  ${graticule()}
  <rect x="0" y="0" width="${WIDTH}" height="6" fill="${ACCENT}" />

  <text x="90" y="150" font-family="IBM Plex Mono" font-size="22" font-weight="500"
        letter-spacing="6" fill="${MUTED}">APPLIED GEOPOLITICS</text>

  <text x="90" y="250" font-family="Fraunces" font-size="62" font-weight="700" fill="${PAPER}">
    Géopolitique des corridors
  </text>
  <text x="90" y="325" font-family="Fraunces" font-size="62" font-weight="700" fill="${PAPER}">
    stratégiques
  </text>

  <line x1="90" y1="368" x2="330" y2="368" stroke="${ACCENT}" stroke-width="3" />

  <text x="90" y="412" font-family="Inter" font-size="26" fill="${MUTED}">
    Dépendances critiques, vulnérabilités, décisions de résilience.
  </text>

  ${corridor()}

  <text x="90" y="570" font-family="IBM Plex Mono" font-size="20" letter-spacing="2" fill="${PAPER}"
        opacity="0.85">www.applied-geopolitics.com</text>
</svg>`;

/**
 * The iOS home-screen icon: the favicon mark, full-bleed.
 *
 * No rounded corners here even though `favicon.svg` has them — iOS applies its own mask, so baking a
 * radius in would show the page background in the four corners once masked.
 */
const touchIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="180" height="180">
  <rect width="32" height="32" fill="#1f4e79" />
  <path d="M5 20 Q16 7 27 20" fill="none" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" />
  <circle cx="16" cy="13" r="2.3" fill="#ffffff" />
</svg>`;

registerFonts();

const png = await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toBuffer();
writeFileSync(OUT, png);
console.log(`[brand] ${OUT} — ${WIDTH}×${HEIGHT}, ${(png.length / 1024).toFixed(0)} ko`);

const touch = await sharp(Buffer.from(touchIcon))
  .resize(180, 180)
  .png({ compressionLevel: 9 })
  .toBuffer();
writeFileSync(OUT_TOUCH, touch);
console.log(`[brand] ${OUT_TOUCH} — 180×180, ${(touch.length / 1024).toFixed(0)} ko`);
