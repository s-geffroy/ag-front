/**
 * Publication state of the site's editorial content, read straight from the frontmatter.
 *
 * Why this exists: the plaquette is a PUBLIC artifact. A slide that names a fiche Atlas which is still
 * `published: false` promises a prospect something that 404s — and does it in a PDF we cannot recall.
 * The two collections use opposite polarity, which is exactly the kind of detail a human check misses:
 *
 *   atlas / dossiers → `published: true`  means public
 *   notes            → `draft: true`      means hidden
 */

import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

export const CONTENT_DIR = fileURLToPath(
  new URL('../../../apps/public/src/content', import.meta.url),
);

export type Collection = 'atlas' | 'dossiers' | 'notes';

export interface ContentEntry {
  collection: Collection;
  slug: string;
  /** The site path a link would use, e.g. `/atlas/malacca`. */
  path: string;
  public: boolean;
}

/** Read a single top-level scalar out of the leading `---` frontmatter block. */
function frontmatterValue(raw: string, key: string): string | undefined {
  if (!raw.startsWith('---')) return undefined;
  const end = raw.indexOf('\n---', 3);
  const block = end === -1 ? raw : raw.slice(0, end);
  return new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm').exec(block)?.[1];
}

function isPublic(collection: Collection, raw: string): boolean {
  if (collection === 'notes') {
    // Absent `draft` means published — that is Astro's default in apps/public/src/content/config.ts.
    return frontmatterValue(raw, 'draft') !== 'true';
  }
  // Absent `published` means NOT published — also the schema default, and the safer polarity.
  return frontmatterValue(raw, 'published') === 'true';
}

export function readContentEntries(contentDir: string = CONTENT_DIR): ContentEntry[] {
  const collections: Collection[] = ['atlas', 'dossiers', 'notes'];
  return collections.flatMap((collection) => {
    const dir = join(contentDir, collection);
    return readdirSync(dir)
      .filter((f) => f.endsWith('.md'))
      .map((f) => {
        const slug = f.replace(/\.md$/, '');
        return {
          collection,
          slug,
          path: `/${collection}/${slug}`,
          public: isPublic(collection, readFileSync(join(dir, f), 'utf-8')),
        };
      });
  });
}

/** Paths a public artifact may safely point at. */
export function publicPaths(contentDir?: string): Set<string> {
  return new Set(
    readContentEntries(contentDir)
      .filter((e) => e.public)
      .map((e) => e.path),
  );
}

/**
 * Which of `paths` must not be linked: either the target is unpublished, or it does not exist at all
 * (a typo in a slug is just as broken for the prospect who clicks it).
 */
export function unpublishablePaths(paths: string[], contentDir?: string): string[] {
  const allowed = publicPaths(contentDir);
  return [...new Set(paths.map((p) => p.toLowerCase()))].filter((p) => !allowed.has(p));
}
