/**
 * The plaquette manifests, read at build time.
 *
 * `presentations/` is the single source: the site does not hold a second copy of the binaries, it
 * distributes the ones the generator wrote (ADR 0073). This module is what both the page and the
 * build-time copy integration read, so they can never disagree about which files exist.
 *
 * Families are DISCOVERED by scanning for `presentations/<family>/manifest.json` rather than listed
 * here. Adding a plaquette is then a directory plus a builder entry in `@ag/deck` — nothing to
 * remember on the site side, which is where a forgotten registration would show up as a 404.
 *
 * Each family carries its OWN `published` flag. `methode` can be online while `commercial` is not.
 */

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export const PRESENTATIONS_DIR = fileURLToPath(
  new URL('../../../../presentations', import.meta.url),
);
/** Public URL prefix and, by construction, the dist/ subdirectory the binaries are copied into. */
export const PLAQUETTE_BASE = '/plaquette';

export type Lang = 'fr' | 'en';

export interface PlaquetteLanguage {
  lang: Lang;
  slides: number;
  pptx: string;
  pdf: string;
  pdfSize: string | null;
  pptxSize: string | null;
}

export interface PlaquetteFamily {
  family: string;
  updated: string;
  published: boolean;
  languages: PlaquetteLanguage[];
}

interface RawManifest {
  family: string;
  updated: string;
  published?: boolean;
  languages: Record<string, { slides: number; pptx: string; pdf: string }>;
}

/** Human-readable size, read from disk: the manifest should not restate what the filesystem knows. */
function fileSize(path: string): string | null {
  if (!existsSync(path)) return null;
  const bytes = statSync(path).size;
  return bytes >= 1_000_000
    ? `${(bytes / 1_000_000).toFixed(1)} Mo`
    : `${Math.round(bytes / 1000)} ko`;
}

function readFamily(family: string): PlaquetteFamily | null {
  const file = join(PRESENTATIONS_DIR, family, 'manifest.json');
  if (!existsSync(file)) return null;
  const raw = JSON.parse(readFileSync(file, 'utf-8')) as RawManifest;

  return {
    family: raw.family,
    updated: raw.updated,
    published: raw.published === true,
    languages: (['fr', 'en'] as const)
      .filter((l) => raw.languages[l])
      .map((lang) => {
        const e = raw.languages[lang]!;
        return {
          lang,
          slides: e.slides,
          pptx: e.pptx,
          pdf: e.pdf,
          pdfSize: fileSize(join(PRESENTATIONS_DIR, family, lang, e.pdf)),
          pptxSize: fileSize(join(PRESENTATIONS_DIR, family, lang, e.pptx)),
        };
      }),
  };
}

/** Every family on disk, in a stable order (the short deck first — it is the one to read first). */
export function readFamilies(): PlaquetteFamily[] {
  if (!existsSync(PRESENTATIONS_DIR)) return [];
  const order = ['commercial', 'methode'];
  return readdirSync(PRESENTATIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(join(PRESENTATIONS_DIR, d.name, 'manifest.json')))
    .map((d) => readFamily(d.name))
    .filter((f): f is PlaquetteFamily => f !== null)
    .sort((a, b) => {
      const ia = order.indexOf(a.family);
      const ib = order.indexOf(b.family);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.family.localeCompare(b.family);
    });
}

/** Only the families cleared for the open internet. */
export function publishedFamilies(): PlaquetteFamily[] {
  return readFamilies().filter((f) => f.published);
}

/**
 * Whether anything on the site may link to /plaquette.
 *
 * Every internal link to the page must be guarded by this: when no family is published the build
 * integration removes `dist/plaquette/` entirely, so an unguarded footer link is a 404 in production.
 */
export function plaquetteIsPublic(): boolean {
  return publishedFamilies().length > 0;
}
