/**
 * The plaquette manifest, read at build time.
 *
 * `presentations/` is the single source: the site does not hold a second copy of the binaries, it
 * distributes the ones the generator wrote (ADR 0073). This module is what both the page and the
 * build-time copy integration read, so they can never disagree about which files exist.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export const PRESENTATIONS_DIR = fileURLToPath(
  new URL('../../../../presentations', import.meta.url),
);
export const FAMILY = 'commercial';
/** Public URL prefix and, by construction, the dist/ subdirectory the binaries are copied into. */
export const PLAQUETTE_BASE = '/plaquette';

export interface PlaquetteLanguage {
  lang: 'fr' | 'en';
  slides: number;
  pptx: string;
  pdf: string;
}

export interface PlaquetteManifest {
  family: string;
  updated: string;
  /**
   * Human decision, taken in the cockpit (ADR 0069). FALSE keeps /plaquette out of the served build
   * entirely — an unlisted-but-reachable page is still a public page, so hiding it from the nav would
   * not be a gate.
   */
  published: boolean;
  languages: PlaquetteLanguage[];
}

/** Absolute path of one artifact inside `presentations/`. */
export function artifactPath(lang: 'fr' | 'en', file: string): string {
  return join(PRESENTATIONS_DIR, FAMILY, lang, file);
}

export function readManifest(): PlaquetteManifest | null {
  const file = join(PRESENTATIONS_DIR, FAMILY, 'manifest.json');
  if (!existsSync(file)) return null;

  const raw = JSON.parse(readFileSync(file, 'utf-8')) as {
    family: string;
    updated: string;
    published?: boolean;
    languages: Record<string, { slides: number; pptx: string; pdf: string }>;
  };

  return {
    family: raw.family,
    updated: raw.updated,
    published: raw.published === true,
    languages: (['fr', 'en'] as const)
      .filter((l) => raw.languages[l])
      .map((l) => ({ lang: l, ...raw.languages[l]! })),
  };
}

/** Human-readable file size. Read from disk, not stored: the manifest should not restate the OS. */
export function fileSize(lang: 'fr' | 'en', file: string): string | null {
  const p = artifactPath(lang, file);
  if (!existsSync(p)) return null;
  const mb = statSync(p).size / 1_000_000;
  return mb >= 1 ? `${mb.toFixed(1)} Mo` : `${Math.round(statSync(p).size / 1000)} ko`;
}

/**
 * Whether anything on the site may link to /plaquette.
 *
 * Every internal link to the page must be guarded by this: when the deck is unpublished the build
 * integration removes `dist/plaquette/` entirely, so an unguarded footer link is a 404 in production.
 */
export function plaquetteIsPublic(): boolean {
  return readManifest()?.published === true;
}

/** Every (lang, file) pair the page will link to — the list the build integration must copy. */
export function expectedArtifacts(m: PlaquetteManifest): { lang: 'fr' | 'en'; file: string }[] {
  return m.languages.flatMap((l) => [
    { lang: l.lang, file: l.pdf },
    { lang: l.lang, file: l.pptx },
  ]);
}
