import { readFile, rename, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { Deliverable } from '@ag/schema/cockpit';
import { CONTENT_DIR } from './content';
import { resolveDocPath } from './markdown';

// One-click publish (ADR 0069). The cockpit relaxes its "read-only over content" discipline for the
// SINGLE frontmatter flag (`published` / `draft`), under gates, and journals the act. The rebuild that
// actually ships the change is a HOST gesture (scripts/redeploy-public.sh), triggered by a watcher that
// polls the sentinel this module writes. Publishing NEVER touches the body or any other frontmatter.

// atlas/dossiers use `published` (true = public). notes use `draft` (true = hidden) — inverse polarity.
export const PUBLISHED_GATES = [
  'sources_ok',
  'contradiction_done',
  'compliance_done',
  'human_review_done',
] as const;

/** apps/public — the site root whose `dist` Caddy serves. CONTENT_DIR is apps/public/src/content. */
const PUBLIC_DIR = resolve(CONTENT_DIR, '../..');
/** Sentinel the watcher polls: touched on every publish/unpublish. Git-ignored (ADR 0069). */
export const PUBLISH_PENDING = resolve(PUBLIC_DIR, '.publish-pending');

/** True when a deliverable's links point at the public URL of this document (`/atlas/mer-rouge-suez`). */
export function deliverableLinksTo(d: Deliverable, type: string, slug: string): boolean {
  const target = `/${type}/${slug}`;
  return (d.links ?? []).some((l) => l.url === target || l.url === `${target}/`);
}

export type PublishResolution =
  | { ok: false; status: number; error: string; missing?: string[] }
  | { ok: true; deliverableId: string | null };

/**
 * Gate the publish act (ADR 0069): a document goes public only when its linked deliverable has every
 * validation gate `true` (each backed by a nominative journal entry, ADR 0046/0068). Unpublishing is
 * always allowed — you can always pull something offline.
 */
export function resolvePublish(
  deliverables: Deliverable[],
  type: string,
  slug: string,
  decision: 'publish' | 'unpublish',
): PublishResolution {
  const linked = deliverables.filter((d) => deliverableLinksTo(d, type, slug));
  const deliverableId = linked[0]?.id ?? null;
  if (decision === 'unpublish') return { ok: true, deliverableId };
  if (linked.length === 0) return { ok: false, status: 409, error: 'no_linked_deliverable' };

  const missing = new Set<string>();
  for (const d of linked) {
    for (const g of PUBLISHED_GATES) if (!d.gates[g]) missing.add(g);
    // cvi_justified only counts when it applies to this deliverable (present and false).
    if (d.gates.cvi_justified === false) missing.add('cvi_justified');
  }
  if (missing.size > 0) {
    return { ok: false, status: 409, error: 'gates_incomplete', missing: [...missing] };
  }
  return { ok: true, deliverableId };
}

/**
 * Set the publication flag inside a frontmatter block, surgically: only the `published`/`draft` line
 * changes (inserted if absent), the body and every other line are preserved byte-for-byte. Returns the
 * new file text and the PUBLISHED STATE before the change (true = was public). Pure — unit-tested.
 */
export function setFrontmatterFlag(
  raw: string,
  type: string,
  publish: boolean,
): { newRaw: string; publishedBefore: boolean } {
  const isNote = type === 'notes';
  const key = isNote ? 'draft' : 'published';
  // Desired flag value from the desired published state: notes hide with draft:true (inverse polarity).
  const flagValue = isNote ? !publish : publish;

  const fm = /^(---\n)([\s\S]*?)(\n---)/.exec(raw);
  if (!fm) {
    // No frontmatter: prepend a minimal block. Default published state matches the Astro schema
    // (atlas/dossiers default published:false → not public; notes default draft:false → public).
    const publishedBefore = isNote;
    return { newRaw: `---\n${key}: ${flagValue}\n---\n${raw}`, publishedBefore };
  }

  const [, open, block, close] = fm;
  const lineRe = new RegExp(`^(\\s*)${key}:\\s*.*$`, 'm');
  const existing = lineRe.exec(block);

  let publishedBefore: boolean;
  let newBlock: string;
  if (existing) {
    const prevTrue = /:\s*true\b/.test(existing[0]);
    publishedBefore = isNote ? !prevTrue : prevTrue;
    newBlock = block.replace(lineRe, `${existing[1]}${key}: ${flagValue}`);
  } else {
    // Key absent → current state is the schema default (notes public, atlas/dossiers not public).
    publishedBefore = isNote;
    newBlock = `${key}: ${flagValue}\n${block}`;
  }
  return { newRaw: raw.replace(fm[0], `${open}${newBlock}${close}`), publishedBefore };
}

export interface PublishWriteResult {
  /** Published state before the write (true = was public). */
  before: boolean;
  /** Published state after the write. */
  after: boolean;
}

/** Write the publication flag to the PUBLIC content file (atomic tmp+rename). Slug is anti-traversal
 *  checked via resolveDocPath (throws InvalidSlugError on a bad/escape slug). */
export async function writePublishFlag(
  type: string,
  slug: string,
  publish: boolean,
): Promise<PublishWriteResult> {
  const file = resolveDocPath(resolve(CONTENT_DIR, type), slug);
  const raw = await readFile(file, 'utf8');
  const { newRaw, publishedBefore } = setFrontmatterFlag(raw, type, publish);
  const tmp = `${file}.tmp`;
  await writeFile(tmp, newRaw, 'utf8');
  await rename(tmp, file);
  return { before: publishedBefore, after: publish };
}

/** Touch the sentinel the host watcher polls (ADR 0069). Content-changing publish/unpublish only. */
export async function touchPublishPending(): Promise<void> {
  await writeFile(PUBLISH_PENDING, `${new Date().toISOString()}\n`, 'utf8');
}
