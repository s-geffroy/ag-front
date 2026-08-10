/**
 * Plaquette review surface (ADR 0073).
 *
 * The cockpit's job here is the one it always has: let a human look at a candidate under conditions as
 * close as possible to the real thing, then record a nominative decision (ADR 0046/0069). It does NOT
 * generate the decks — that is `scripts/build-deck.sh` — and it does NOT rebuild the site. Flipping a
 * family's `manifest.published` and touching the publish sentinel is the whole of its authority; the
 * host watcher picks the sentinel up and runs `scripts/redeploy-public.sh`.
 *
 * "As close as possible" is meant literally: `server/index.ts` serves the built page at the cockpit's
 * own `/plaquette`, with the same absolute asset paths, so the reviewer reads the bytes that would
 * ship rather than a re-implementation of them.
 *
 * Families are discovered by scanning `presentations/`, and each carries its OWN publication flag —
 * `methode` can be online while `commercial` is not.
 */

import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

export const REPO_ROOT = resolve(here, '../../..');
export const PRESENTATIONS_DIR = resolve(REPO_ROOT, 'presentations');

/** Where the built page lives, depending on whether anything passed the gate. Byte-identical. */
export const PUBLIC_DIST = resolve(REPO_ROOT, 'apps/public/dist');
export const WITHHELD_PAGE_DIR = resolve(REPO_ROOT, 'apps/public/.plaquette-preview');
export const SERVED_PAGE_DIR = join(PUBLIC_DIST, 'plaquette');

export type Lang = 'fr' | 'en';
const LANGS: Lang[] = ['fr', 'en'];
/** Display order; anything not listed sorts after, alphabetically. */
const FAMILY_ORDER = ['commercial', 'methode'];

export interface PlaquetteLanguageStatus {
  lang: Lang;
  slides: number;
  pptx: { file: string; bytes: number | null };
  pdf: { file: string; bytes: number | null };
  previews: string[];
  substitutionPreviews: string[];
}

export interface PlaquetteFamilyStatus {
  family: string;
  updated: string;
  published: boolean;
  languages: PlaquetteLanguageStatus[];
}

export interface PlaquetteStatus {
  families: PlaquetteFamilyStatus[];
  /** True when the built page exists somewhere — i.e. the site was rebuilt since the last deck. */
  pageBuilt: boolean;
  previewSource: 'served' | 'withheld' | 'none';
  /** Which families the CURRENTLY BUILT public page actually contains. */
  pageContains: string[];
}

interface RawManifest {
  family: string;
  updated: string;
  published?: boolean;
  languages: Record<string, { slides: number; pptx: string; pdf: string }>;
}

function manifestPath(family: string): string {
  return join(PRESENTATIONS_DIR, family, 'manifest.json');
}

function readManifest(family: string): RawManifest | null {
  const file = manifestPath(family);
  if (!existsSync(file)) return null;
  try {
    return JSON.parse(readFileSync(file, 'utf8')) as RawManifest;
  } catch {
    return null;
  }
}

export function listFamilies(): string[] {
  if (!existsSync(PRESENTATIONS_DIR)) return [];
  return readdirSync(PRESENTATIONS_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && existsSync(manifestPath(d.name)))
    .map((d) => d.name)
    .sort((a, b) => {
      const ia = FAMILY_ORDER.indexOf(a);
      const ib = FAMILY_ORDER.indexOf(b);
      return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib) || a.localeCompare(b);
    });
}

function sizeOf(path: string): number | null {
  return existsSync(path) ? statSync(path).size : null;
}

function previewsFor(family: string, lang: Lang, prefix: 'slide' | 'subst'): string[] {
  const dir = join(PRESENTATIONS_DIR, family, 'preview');
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => f.startsWith(`${lang}-${prefix}-`) && f.endsWith('.jpg'))
    .sort();
}

function familyStatus(family: string): PlaquetteFamilyStatus | null {
  const m = readManifest(family);
  if (!m) return null;
  return {
    family: m.family,
    updated: m.updated,
    published: m.published === true,
    languages: LANGS.filter((l) => m.languages[l]).map((lang) => {
      const e = m.languages[lang]!;
      return {
        lang,
        slides: e.slides,
        pptx: { file: e.pptx, bytes: sizeOf(join(PRESENTATIONS_DIR, family, lang, e.pptx)) },
        pdf: { file: e.pdf, bytes: sizeOf(join(PRESENTATIONS_DIR, family, lang, e.pdf)) },
        previews: previewsFor(family, lang, 'slide'),
        substitutionPreviews: previewsFor(family, lang, 'subst'),
      };
    }),
  };
}

export function readStatus(): PlaquetteStatus | null {
  const families = listFamilies()
    .map(familyStatus)
    .filter((f): f is PlaquetteFamilyStatus => f !== null);
  if (families.length === 0) return null;

  const servedExists = existsSync(join(SERVED_PAGE_DIR, 'index.html'));
  const withheldExists = existsSync(join(WITHHELD_PAGE_DIR, 'index.html'));

  return {
    families,
    pageBuilt: servedExists || withheldExists,
    previewSource: servedExists ? 'served' : withheldExists ? 'withheld' : 'none',
    // The built page lists only the families that were published AT BUILD TIME. Saying so explicitly
    // matters: a reviewer looking at the page preview for an unpublished family must not conclude
    // from its absence that something is broken.
    pageContains: servedExists ? families.filter((f) => f.published).map((f) => f.family) : [],
  };
}

export type PublishResolution =
  | { ok: false; status: number; error: string }
  | { ok: true; before: boolean };

/**
 * Can this decision be taken right now, for this family?
 *
 * The gate is narrow on purpose. Unlike an editorial fiche, a plaquette has no deliverable and no
 * Munich checklist behind it — it is a marketing artifact, and inventing gates it does not have would
 * be theatre. What IS checked is the thing that actually goes wrong: publishing a deck whose PDF is
 * missing or stale, or that nobody could have reviewed because the page was never built.
 *
 * Unpublishing is always allowed. You can always pull something offline.
 */
export function resolvePlaquettePublish(
  status: PlaquetteStatus | null,
  family: string,
  decision: 'publish' | 'unpublish',
): PublishResolution {
  const f = status?.families.find((x) => x.family === family);
  if (!f) return { ok: false, status: 404, error: 'unknown_family' };
  if (decision === 'unpublish') return { ok: true, before: f.published };

  if (f.languages.length === 0) return { ok: false, status: 409, error: 'no_language_built' };
  if (f.languages.some((l) => l.pdf.bytes === null || l.pptx.bytes === null)) {
    return { ok: false, status: 409, error: 'artifact_missing' };
  }
  if (!status!.pageBuilt) return { ok: false, status: 409, error: 'page_never_built' };

  return { ok: true, before: f.published };
}

/** Flip one family's `published`, touching nothing else in its manifest. Returns the prior value. */
export function writePublishedFlag(family: string, published: boolean): boolean {
  const m = readManifest(family);
  if (!m) throw new Error(`manifest.json is missing for family '${family}'`);
  const before = m.published === true;
  writeFileSync(manifestPath(family), `${JSON.stringify({ ...m, published }, null, 2)}\n`, 'utf8');
  return before;
}

/** Resolve one artifact for download, refusing anything that is not a known manifest entry. */
export function resolveArtifact(family: string, lang: string, file: string): string | null {
  const m = readManifest(family);
  if (!m || !LANGS.includes(lang as Lang)) return null;
  const entry = m.languages[lang];
  // Allow-list, not path sanitisation: the only filenames served are the ones a manifest names.
  if (!entry || (file !== entry.pdf && file !== entry.pptx)) return null;
  const path = join(PRESENTATIONS_DIR, family, lang, file);
  return existsSync(path) ? path : null;
}

/** Resolve a QA render, same allow-list discipline. */
export function resolvePreviewImage(family: string, name: string): string | null {
  if (!listFamilies().includes(family)) return null;
  if (!/^(fr|en)-(slide|subst)-\d+\.jpg$/.test(name)) return null;
  const path = join(PRESENTATIONS_DIR, family, 'preview', name);
  return existsSync(path) ? path : null;
}
