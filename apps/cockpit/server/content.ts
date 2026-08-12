import { readFile } from 'node:fs/promises';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';
import { renderMarkdown, resolveDocPath } from './markdown';

// Re-exported so existing importers (server/api.ts) keep importing it from './content'.
export { InvalidSlugError } from './markdown';

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
  // Prefer the internal full version; fall back to the public abstract.
  const sources = [
    { dir: INTERNAL_DIR, full: true },
    { dir: CONTENT_DIR, full: false },
  ];
  for (const s of sources) {
    // Throws InvalidSlugError on a malformed slug or one that resolves outside the type directory.
    const file = resolveDocPath(resolve(s.dir, type), slug);
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
/**
 * Métadonnées de PROVENANCE d'un document, rendues lisibles pour un juge.
 *
 * POURQUOI ELLES SORTENT D'ICI. `readContentSource` jetait le frontmatter et ne rendait que le
 * corps. Le juge LLM (ADR 0068) était donc chargé de contrôler la véracité (Munich 1) et le sourcing
 * sur un document dont on lui CACHAIT la confiance déclarée, la liste des sources et les errata.
 * Constaté le 2026-08-12 sur le dossier Mer Rouge : verdict `fail` sur Munich 1 au motif qu'« aucun
 * champ explicite de confiance » n'était présent — alors que le frontmatter porte `confidence:
 * moyen` et sept sources typées. Le juge avait raison sur ce qu'il voyait ; il ne voyait pas tout.
 */
export function provenanceSummary(data: Record<string, unknown>): string {
  const lines: string[] = [];
  // YAML transforme `date: 2026-08-12` en objet Date : `String()` rendrait
  // « Wed Aug 12 2026 00:00:00 GMT+0000 », illisible dans un prompt et trompeur sur le fuseau.
  const fmt = (v: unknown) => (v instanceof Date ? v.toISOString().slice(0, 10) : String(v));
  const push = (k: string, v: unknown) => {
    if (v !== undefined && v !== null && v !== '') lines.push(`${k}: ${fmt(v)}`);
  };
  push('date', data.date);
  push('confidence_declaree', data.confidence);
  push('access', data.access);
  const sources = Array.isArray(data.sources) ? data.sources : [];
  if (sources.length > 0) {
    lines.push(`sources_declarees: ${sources.length}`);
    for (const raw of sources as Record<string, unknown>[]) {
      const bits = [raw.label, raw.type, raw.url].filter(Boolean).map(String);
      if (bits.length) lines.push(`  - ${bits.join(' | ')}`);
    }
  } else {
    lines.push('sources_declarees: 0');
  }
  const corrections = Array.isArray(data.corrections) ? data.corrections : [];
  // Une liste vide est DÉCLARÉE vide : « aucun erratum » n'est pas « rubrique absente » (ADR 0077).
  lines.push(`corrections_declarees: ${corrections.length}`);
  for (const c of corrections as Record<string, unknown>[]) {
    const bits = [c.date, c.note ?? c.label].filter(Boolean).map(fmt);
    if (bits.length) lines.push(`  - ${bits.join(' | ')}`);
  }
  return lines.join('\n');
}

/**
 * Résout les codes `[Cxx]` cités par un document contre son registre de sources.
 *
 * DEUXIÈME ÉTAGE DU MÊME AVEUGLEMENT. Une fois le frontmatter transmis, le juge a répondu ce qu'il
 * fallait entendre : « les nombreuses références sous codes [Cxx] renvoient à un registre non
 * inclus ». Il contrôlait donc l'origine des sources sans pouvoir en consulter une seule. Un
 * relecteur humain, lui, a le registre sous la main — la limite était dans le prompt, pas dans le
 * document.
 *
 * On ne transmet PAS le registre entier (plus de cinq cents lignes, dont des sources non citées) :
 * seulement les entrées effectivement citées, avec leur intitulé, leur type et leur URL. Un code
 * cité qui ne se résout pas est rendu comme tel — c'est un signal, pas un blanc à combler.
 */
export async function resolveCitedSources(body: string, repoRoot: string): Promise<string> {
  const cited = [...new Set([...body.matchAll(/\[(C\d{1,3})\]/g)].map((m) => m[1]))];
  if (cited.length === 0) return '';
  // Le registre n'est pas codé en dur : le document le NOMME (« Voir le registre `docs/evidence/…` »).
  // Un document qui ne déclare pas le sien n'en reçoit pas — et le juge le verra manquer, ce qui est
  // le comportement juste : c'est le document qui doit dire d'où viennent ses codes.
  const declared = /docs\/evidence\/[A-Za-z0-9._-]+\.md/.exec(body)?.[0];
  if (!declared) {
    return `codes cités: ${cited.join(', ')}\n(le document ne déclare aucun registre de sources)`;
  }
  let registry: string;
  try {
    registry = await readFile(resolve(repoRoot, declared), 'utf8');
  } catch {
    return `codes cités: ${cited.join(', ')}\n(registre « ${declared} » introuvable — aucune entrée résolue)`;
  }
  const entries = new Map<string, string>();
  // Chaque entrée du registre commence par « ### C<n> — <intitulé> » ; l'URL suit dans les lignes
  // qui la composent, jusqu'à l'entrée suivante.
  const blocks = registry.split(/^### (?=C\d)/m).slice(1);
  for (const block of blocks) {
    const code = /^(C\d{1,3})\b/.exec(block)?.[1];
    if (!code || !cited.includes(code)) continue;
    const title = (block.split('\n')[0] ?? '').replace(/^C\d{1,3}\s*[—-]\s*/, '').trim();
    const url = /https?:\/\/[^\s`)<>]+/.exec(block)?.[0] ?? '';
    const type = /\*\*Type\*\*\s*:\s*`?([a-z_]+)`?/.exec(block)?.[1] ?? '';
    entries.set(code, [title, type, url].filter(Boolean).join(' | '));
  }
  const lines = cited
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
    .map((c) => `  - ${c}: ${entries.get(c) ?? '(code cité, absent du registre — à vérifier)'}`);
  return `sources_citees_resolues: ${entries.size}/${cited.length}\n${lines.join('\n')}`;
}

export async function readContentSource(
  type: ContentType,
  slug: string,
): Promise<{ title: string; body: string; provenance: string; full: boolean } | null> {
  const found = await readRawDoc(type, slug);
  if (!found) return null;
  const { data, content } = matter(found.raw);
  const cited = await resolveCitedSources(content, resolve(here, '../../..'));
  return {
    title: String(data.title ?? slug),
    body: content,
    provenance: [provenanceSummary(data as Record<string, unknown>), cited]
      .filter(Boolean)
      .join('\n'),
    full: found.full,
  };
}

export async function readContent(
  type: ContentType,
  slug: string,
): Promise<RenderedContent | null> {
  const found = await readRawDoc(type, slug);
  if (found === null) return null;
  const { full } = found;

  const { data, content } = matter(found.raw);
  const html = await renderMarkdown(content);
  return { type, slug, data: data as Record<string, unknown>, html, full };
}
