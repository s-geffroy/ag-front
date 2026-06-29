import { readFile } from 'node:fs/promises';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { renderMarkdown, resolveDocPath } from './markdown';

/**
 * Read-only library of internal methodology / reference docs, surfaced in the cockpit under
 * Outils → Référence. Distinct from the editorial pipeline (content.ts): no public fallback, no
 * publication gate, no contradiction LLM. The directory lives OUTSIDE `apps/public`, so the public
 * site never builds these — they stay tailnet-only (ADR 0005). Same path safety as the editorial
 * reader (slug format-checked + resolved path asserted inside the directory).
 */
const here = dirname(fileURLToPath(import.meta.url));
// apps/cockpit/server → reference markdown lives in apps/cockpit/reference. Tracked in git.
export const REFERENCE_DIR = resolve(here, '../reference');

export interface ReferenceSummary {
  slug: string;
  title: string;
  summary?: string;
  updated?: string;
  /** Sort key; lower comes first. Defaults to 100 when absent. */
  order: number;
}

export interface RenderedReference {
  slug: string;
  data: Record<string, unknown>;
  html: string;
}

/** List every reference document, ordered by `order` then title. */
export function listReferences(): ReferenceSummary[] {
  let files: string[];
  try {
    files = readdirSync(REFERENCE_DIR).filter((f) => f.endsWith('.md'));
  } catch {
    return [];
  }
  const out: ReferenceSummary[] = files.map((file) => {
    const { data } = matter(readFileSync(resolve(REFERENCE_DIR, file), 'utf8'));
    return {
      slug: file.replace(/\.md$/, ''),
      title: String(data.title ?? file.replace(/\.md$/, '')),
      summary: typeof data.summary === 'string' ? data.summary : undefined,
      updated: typeof data.updated === 'string' ? data.updated : undefined,
      order: typeof data.order === 'number' ? data.order : 100,
    };
  });
  out.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
  return out;
}

/** Read and render a single reference document. Returns null when the slug doesn't exist. */
export async function readReference(slug: string): Promise<RenderedReference | null> {
  // Throws InvalidSlugError on a malformed slug or one that resolves outside REFERENCE_DIR.
  const file = resolveDocPath(REFERENCE_DIR, slug);
  let raw: string;
  try {
    raw = await readFile(file, 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException)?.code === 'ENOENT') return null;
    throw err;
  }
  const { data, content } = matter(raw);
  const html = await renderMarkdown(content);
  return { slug, data: data as Record<string, unknown>, html };
}
