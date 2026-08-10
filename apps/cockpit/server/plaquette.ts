/**
 * Plaquette review surface (ADR 0073).
 *
 * The cockpit's job here is the one it always has: let a human look at a candidate under conditions as
 * close as possible to the real thing, then record a nominative decision (ADR 0046/0069). It does NOT
 * generate the deck — that is `scripts/build-deck.sh` — and it does NOT rebuild the site. Flipping
 * `manifest.published` and touching the publish sentinel is the whole of its authority; the host
 * watcher picks the sentinel up and runs `scripts/redeploy-public.sh`.
 *
 * "As close as possible" is meant literally: `server/index.ts` serves the built page at the cockpit's
 * own `/plaquette`, with the same absolute asset paths, so the reviewer reads the bytes that would
 * ship rather than a re-implementation of them.
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = resolve(here, '../../..');
export const FAMILY = 'commercial';
export const PLAQUETTE_DIR = resolve(REPO_ROOT, 'presentations', FAMILY);
export const MANIFEST_FILE = join(PLAQUETTE_DIR, 'manifest.json');
export const PREVIEW_IMG_DIR = join(PLAQUETTE_DIR, 'preview');

/** Where the built page lives, depending on whether it passed the gate. Both are byte-identical. */
export const PUBLIC_DIST = resolve(REPO_ROOT, 'apps/public/dist');
export const WITHHELD_PAGE_DIR = resolve(REPO_ROOT, 'apps/public/.plaquette-preview');
export const SERVED_PAGE_DIR = join(PUBLIC_DIST, 'plaquette');

export type Lang = 'fr' | 'en';
const LANGS: Lang[] = ['fr', 'en'];

export interface PlaquetteLanguageStatus {
  lang: Lang;
  slides: number;
  pptx: { file: string; bytes: number | null };
  pdf: { file: string; bytes: number | null };
  /** QA renders written by build-deck.sh, newest build only. */
  previews: string[];
  substitutionPreviews: string[];
}

export interface PlaquetteStatus {
  family: string;
  updated: string;
  published: boolean;
  /** True when the built page exists somewhere — i.e. the site has been rebuilt since the last deck. */
  pageBuilt: boolean;
  /** Where the reviewer's iframe should point. */
  previewSource: 'served' | 'withheld' | 'none';
  languages: PlaquetteLanguageStatus[];
}

interface RawManifest {
  family: string;
  updated: string;
  published?: boolean;
  languages: Record<string, { slides: number; pptx: string; pdf: string }>;
}

function readManifest(): RawManifest | null {
  if (!existsSync(MANIFEST_FILE)) return null;
  return JSON.parse(readFileSync(MANIFEST_FILE, 'utf8')) as RawManifest;
}

function sizeOf(path: string): number | null {
  return existsSync(path) ? statSync(path).size : null;
}

function previewsFor(lang: Lang, prefix: 'slide' | 'subst'): string[] {
  if (!existsSync(PREVIEW_IMG_DIR)) return [];
  return readdirSync(PREVIEW_IMG_DIR)
    .filter((f) => f.startsWith(`${lang}-${prefix}-`) && f.endsWith('.jpg'))
    .sort();
}

export function readStatus(): PlaquetteStatus | null {
  const m = readManifest();
  if (!m) return null;

  const servedExists = existsSync(join(SERVED_PAGE_DIR, 'index.html'));
  const withheldExists = existsSync(join(WITHHELD_PAGE_DIR, 'index.html'));

  return {
    family: m.family,
    updated: m.updated,
    published: m.published === true,
    pageBuilt: servedExists || withheldExists,
    previewSource: servedExists ? 'served' : withheldExists ? 'withheld' : 'none',
    languages: LANGS.filter((l) => m.languages[l]).map((lang) => {
      const entry = m.languages[lang]!;
      return {
        lang,
        slides: entry.slides,
        pptx: { file: entry.pptx, bytes: sizeOf(join(PLAQUETTE_DIR, lang, entry.pptx)) },
        pdf: { file: entry.pdf, bytes: sizeOf(join(PLAQUETTE_DIR, lang, entry.pdf)) },
        previews: previewsFor(lang, 'slide'),
        substitutionPreviews: previewsFor(lang, 'subst'),
      };
    }),
  };
}

export type PublishResolution =
  | { ok: false; status: number; error: string }
  | { ok: true; before: boolean };

/**
 * Can this decision be taken right now?
 *
 * The gate is narrow on purpose. Unlike an editorial fiche, the plaquette has no deliverable and no
 * Munich checklist behind it — it is a marketing artifact, and inventing gates it does not have would
 * be theatre. What IS checked is the thing that actually goes wrong: publishing a deck whose PDF is
 * missing or stale, or that nobody could have reviewed because the page was never built.
 *
 * Unpublishing is always allowed. You can always pull something offline.
 */
export function resolvePlaquettePublish(
  status: PlaquetteStatus | null,
  decision: 'publish' | 'unpublish',
): PublishResolution {
  if (!status) return { ok: false, status: 409, error: 'no_manifest' };
  if (decision === 'unpublish') return { ok: true, before: status.published };

  if (status.languages.length === 0) return { ok: false, status: 409, error: 'no_language_built' };
  const incomplete = status.languages.filter((l) => l.pdf.bytes === null || l.pptx.bytes === null);
  if (incomplete.length > 0) return { ok: false, status: 409, error: 'artifact_missing' };
  if (!status.pageBuilt) return { ok: false, status: 409, error: 'page_never_built' };

  return { ok: true, before: status.published };
}

/** Flip `manifest.published`, touching nothing else in the file. Returns the value before the write. */
export function writePublishedFlag(published: boolean): boolean {
  const m = readManifest();
  if (!m) throw new Error('manifest.json is missing');
  const before = m.published === true;
  writeFileSync(MANIFEST_FILE, `${JSON.stringify({ ...m, published }, null, 2)}\n`, 'utf8');
  return before;
}

/** Resolve one artifact for download, refusing anything that is not a known manifest entry. */
export function resolveArtifact(lang: string, file: string): string | null {
  const m = readManifest();
  if (!m || !LANGS.includes(lang as Lang)) return null;
  const entry = m.languages[lang];
  // Allow-list, not path sanitisation: the only two filenames served are the ones the manifest names.
  if (!entry || (file !== entry.pdf && file !== entry.pptx)) return null;
  const path = join(PLAQUETTE_DIR, lang, file);
  return existsSync(path) ? path : null;
}

/** Resolve a QA render, same allow-list discipline. */
export function resolvePreviewImage(name: string): string | null {
  if (!/^(fr|en)-(slide|subst)-\d+\.jpg$/.test(name)) return null;
  const path = join(PREVIEW_IMG_DIR, name);
  return existsSync(path) ? path : null;
}
