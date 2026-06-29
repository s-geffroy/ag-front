import { isAbsolute, relative, resolve } from 'node:path';
import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

/** Thrown when a slug is malformed or resolves outside its content directory (path traversal). */
export class InvalidSlugError extends Error {}

const SLUG_RE = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Resolve `<baseDir>/<slug>.md`, asserting the slug is well-formed AND the resolved path stays
 * strictly inside baseDir (defense in depth — a regex-passing slug still can't traverse out).
 * Throws InvalidSlugError otherwise. Shared by the editorial reader (content.ts) and the internal
 * reference library (reference.ts).
 */
export function resolveDocPath(baseDir: string, slug: string): string {
  if (!SLUG_RE.test(slug)) throw new InvalidSlugError();
  const file = resolve(baseDir, `${slug}.md`);
  const rel = relative(baseDir, file);
  if (rel.startsWith('..') || isAbsolute(rel)) throw new InvalidSlugError();
  return file;
}

/**
 * Render repo-authored Markdown to sanitized HTML. GFM (tables, etc.) is on by default in marked.
 * Even though the markdown is repo-authored and the surface is tailnet-only, we sanitize the
 * rendered HTML server-side (defense in depth) so no endpoint can emit script/handlers/javascript:
 * URLs to the client. Shared by content.ts and reference.ts.
 */
export async function renderMarkdown(md: string): Promise<string> {
  const rendered = await marked.parse(md, { async: true });
  return sanitizeHtml(rendered, {
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
}
