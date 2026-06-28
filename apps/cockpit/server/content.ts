import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, isAbsolute, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

/**
 * Read-only reader for editorial content the public site builds from. It lets a reviewer read a
 * candidate **before** it is published (the public build now ships only `published: true` content),
 * over the tailnet-only cockpit. Read-only and locked down: type is allowlisted, the slug is
 * format-checked, and the resolved path is asserted to stay inside the content directory — no
 * traversal, no arbitrary file read.
 */
const here = dirname(fileURLToPath(import.meta.url));
// apps/cockpit/server → public editorial markdown lives in apps/public/src/content.
export const CONTENT_DIR = resolve(here, '../../public/src/content');
// Full, internal-only versions (e.g. a 15–25 page dossier) live in apps/cockpit/content and are
// NEVER built by the public site. The cockpit reader prefers them so an analyst reads the complete
// artifact, not the public abstract. Tracked in git (authored deliverables).
export const INTERNAL_DIR = resolve(here, '../content');

export const contentTypes = ['atlas', 'dossiers', 'notes'] as const;
export type ContentType = (typeof contentTypes)[number];

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

export class InvalidSlugError extends Error {}

export function isContentType(t: string): t is ContentType {
  return (contentTypes as readonly string[]).includes(t);
}

export interface RenderedContent {
  type: ContentType;
  slug: string;
  data: Record<string, unknown>;
  html: string;
  /** true when this is the internal full version (not the public abstract). */
  full: boolean;
}

/** One-line summary of an editorial artifact, for the review index. */
export interface ContentSummary {
  type: ContentType;
  slug: string;
  title: string;
  published: boolean;
  access?: string;
  confidence?: string;
  sources: number;
  corrections: number;
  date?: string;
  /** true when a full internal version exists in INTERNAL_DIR (vs only the public abstract). */
  full: boolean;
}

/** List every editorial artifact across the content tree (published + unpublished candidates). */
export function listContent(): ContentSummary[] {
  const out: ContentSummary[] = [];
  for (const type of contentTypes) {
    let files: string[];
    try {
      files = readdirSync(join(CONTENT_DIR, type)).filter((f) => f.endsWith('.md'));
    } catch {
      continue;
    }
    for (const file of files) {
      const { data } = matter(readFileSync(join(CONTENT_DIR, type, file), 'utf8'));
      // notes are public unless drafted; atlas/dossiers reach the public site only when published.
      const published = type === 'notes' ? data.draft !== true : data.published === true;
      const dateVal = data.date ?? data.updated;
      out.push({
        type,
        slug: file.replace(/\.md$/, ''),
        title: String(data.title ?? file.replace(/\.md$/, '')),
        published,
        access: typeof data.access === 'string' ? data.access : undefined,
        confidence: typeof data.confidence === 'string' ? data.confidence : undefined,
        sources: Array.isArray(data.sources) ? data.sources.length : 0,
        corrections: Array.isArray(data.corrections) ? data.corrections.length : 0,
        date: dateVal ? String(dateVal) : undefined,
        full: existsSync(join(INTERNAL_DIR, type, file)),
      });
    }
  }
  return out;
}

/** Locate and read a document's raw file, preferring the internal full version. Same path safety as
 *  the reader: slug format-checked + resolved path asserted inside the type directory. */
async function readRawDoc(
  type: ContentType,
  slug: string,
): Promise<{ raw: string; full: boolean } | null> {
  if (!SLUG_RE.test(slug)) throw new InvalidSlugError();
  // Prefer the internal full version; fall back to the public abstract.
  const sources = [
    { dir: INTERNAL_DIR, full: true },
    { dir: CONTENT_DIR, full: false },
  ];
  for (const s of sources) {
    const base = resolve(s.dir, type);
    const file = resolve(base, `${slug}.md`);
    // Defense in depth: even a regex-passing slug must resolve strictly inside the type directory.
    const rel = relative(base, file);
    if (rel.startsWith('..') || isAbsolute(rel)) throw new InvalidSlugError();
    try {
      return { raw: await readFile(file, 'utf8'), full: s.full };
    } catch (err) {
      if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') continue;
      throw err;
    }
  }
  return null;
}

/** Raw markdown body + title for a document (frontmatter stripped). Used to feed the editorial
 *  contradiction LLM the actual text — never the sanitized HTML (ADR 0039). */
export async function readContentSource(
  type: ContentType,
  slug: string,
): Promise<{ title: string; body: string; full: boolean } | null> {
  const found = await readRawDoc(type, slug);
  if (!found) return null;
  const { data, content } = matter(found.raw);
  return { title: String(data.title ?? slug), body: content, full: found.full };
}

export async function readContent(
  type: ContentType,
  slug: string,
): Promise<RenderedContent | null> {
  const found = await readRawDoc(type, slug);
  if (found === null) return null;
  const { full } = found;

  const { data, content } = matter(found.raw);
  // GFM (tables, etc.) is on by default in marked. Even though the markdown is repo-authored and the
  // surface is tailnet-only, we sanitize the rendered HTML server-side (defense in depth) so the
  // endpoint can never emit script/handlers/javascript: URLs to the client.
  const rendered = await marked.parse(content, { async: true });
  const html = sanitizeHtml(rendered, {
    // marked emits h1/h2 (excluded from sanitize-html defaults) — add them and tables/figure markup.
    allowedTags: [...sanitizeHtml.defaults.allowedTags, 'h1', 'h2', 'img', 'figure', 'figcaption'],
    allowedAttributes: {
      a: ['href', 'name', 'title'],
      img: ['src', 'alt', 'title'],
      td: ['align'],
      th: ['align'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    // Force safe external links once they reach the client.
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { rel: 'noopener noreferrer', target: '_blank' }),
    },
  });
  return { type, slug, data: data as Record<string, unknown>, html, full };
}
