import { readFile } from 'node:fs/promises';
import { dirname, isAbsolute, relative, resolve } from 'node:path';
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
// apps/cockpit/server → editorial markdown lives in apps/public/src/content.
export const CONTENT_DIR = resolve(here, '../../public/src/content');

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
}

export async function readContent(
  type: ContentType,
  slug: string,
): Promise<RenderedContent | null> {
  if (!SLUG_RE.test(slug)) throw new InvalidSlugError();
  const base = resolve(CONTENT_DIR, type);
  const file = resolve(base, `${slug}.md`);
  // Defense in depth: even a regex-passing slug must resolve strictly inside the type directory.
  const rel = relative(base, file);
  if (rel.startsWith('..') || isAbsolute(rel)) throw new InvalidSlugError();

  let raw: string;
  try {
    raw = await readFile(file, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') return null;
    throw err;
  }

  const { data, content } = matter(raw);
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
  return { type, slug, data: data as Record<string, unknown>, html };
}
