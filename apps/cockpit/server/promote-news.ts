import { readFile, writeFile, rename } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  PromotedNewsItem,
  PromotedNewsStore,
  type PromotedNewsItem as PromotedNewsItemT,
} from '@ag/schema/content';
import type { NewsClusterOut, NewsFeedOut } from '@ag/chokepoints';
import { PUBLIC_DIR, touchPublishPending } from './publish';

// News promotion (ADR 0071). A human, in the cockpit, promotes ONE cluster from the (cockpit-only,
// read_tainted) /news feed onto the PUBLIC Atlas. Doctrine mirrors one-click publish (ADR 0069): the
// crossing candidate → public is a NOMINATIVE act (validated_by), journalled, and the host watcher does
// the rebuild. Two hard rules specific to news:
//   1. Only a CLEARED cluster is promotable — `license_taint` truthy is refused (ADR 0013 belt).
//   2. The reliable fields (articles[], affected_chokepoints[], counts) are taken from a FRESH
//      server-side re-fetch, never from the client body — believe the server, not the operator's copy.
// The store is app-owned public content (git-tracked JSON), decoupled from the producer's NewsClusterOut.

/** The public promoted-news store the SSG build reads (apps/public/src/data/promoted-news.json). */
export const PROMOTED_STORE = resolve(PUBLIC_DIR, 'src/data/promoted-news.json');

/** Only http(s) URLs survive into the public store (defence-in-depth; the schema also guards this). */
function isHttp(u: string | null | undefined): u is string {
  return typeof u === 'string' && /^https?:\/\//i.test(u);
}

/** A stable identity for a promoted cluster: durable cluster_id, else its sorted article-url set. */
export function itemKey(item: Pick<PromotedNewsItemT, 'cluster_id' | 'articles'>): string {
  if (item.cluster_id) return `id:${item.cluster_id}`;
  const urls = item.articles
    .map((a) => a.url)
    .filter(isHttp)
    .sort();
  return `urls:${urls.join('|')}`;
}

/**
 * Project a freshly-fetched cluster to the public-safe stored shape. Keeps only reliable fields verbatim
 * and the (candidate) prose the UI frames as such; drops non-http article URLs; forces
 * `taint_class: 'cleared_only'` (the caller has already verified the cluster is clear). Stamps WHO/WHEN.
 */
export function toPromotedItem(
  cluster: NewsClusterOut,
  opts: { promotedBy: string; promotedAt: string },
): PromotedNewsItemT {
  return PromotedNewsItem.parse({
    articles: (cluster.articles ?? [])
      .filter((a) => isHttp(a.url))
      .map((a) => ({
        title: a.title ?? '',
        url: a.url,
        outlet: a.outlet ?? '',
        source_id: a.source_id ?? '',
        observed_on: a.observed_on ?? '',
      })),
    affected_chokepoints: (cluster.affected_chokepoints ?? []).map((c) => ({
      chokepoint_id: c.chokepoint_id,
      canonical_name: c.canonical_name ?? '',
      relevance: c.relevance ?? undefined,
    })),
    article_count: cluster.article_count ?? undefined,
    first_seen: cluster.first_seen ?? '',
    last_seen: cluster.last_seen ?? '',
    generated_at: cluster.generated_at ?? '',
    headline: cluster.headline ?? '',
    summary_text: cluster.summary_text ?? '',
    event_category: cluster.event_category ?? '',
    salience_score: cluster.salience_score ?? undefined,
    cluster_id: cluster.cluster_id ?? '',
    run_id: '',
    taint_class: 'cleared_only',
    promoted_by: opts.promotedBy,
    promoted_at: opts.promotedAt,
  });
}

export type PromoteResolution =
  | { ok: false; status: number; error: string }
  | { ok: true; cluster: NewsClusterOut };

/**
 * Pick + validate the cluster to promote out of a fresh feed. Matches by `cluster_id` when given, else
 * by article-url overlap (cluster_id is not durable across runs — ADR 0076). Refuses a tainted cluster.
 */
export function resolvePromoteFromFeed(
  feed: NewsFeedOut,
  select: { cluster_id?: string; article_urls?: string[] },
): PromoteResolution {
  const items = feed.items ?? [];
  let cluster: NewsClusterOut | undefined;
  if (select.cluster_id) {
    cluster = items.find((c) => c.cluster_id === select.cluster_id);
  } else if (select.article_urls?.length) {
    const wanted = new Set(select.article_urls);
    cluster = items.find((c) => (c.articles ?? []).some((a) => a.url && wanted.has(a.url)));
  }
  if (!cluster) return { ok: false, status: 404, error: 'cluster_not_found' };
  // Belt to ADR 0013: a redistribution-restricted cluster never reaches the public site.
  if (cluster.license_taint) return { ok: false, status: 409, error: 'cluster_tainted' };
  // A cluster with no usable (http) article is not attributable → not promotable.
  if (!(cluster.articles ?? []).some((a) => isHttp(a.url))) {
    return { ok: false, status: 409, error: 'no_attributable_article' };
  }
  return { ok: true, cluster };
}

async function readStore(): Promise<Record<string, PromotedNewsItemT[]>> {
  let raw: unknown = {};
  try {
    raw = JSON.parse(await readFile(PROMOTED_STORE, 'utf8'));
  } catch {
    raw = {};
  }
  // `.catch({})` makes this total; a malformed file resets rather than throwing.
  return PromotedNewsStore.parse(raw) as Record<string, PromotedNewsItemT[]>;
}

async function writeStore(store: Record<string, PromotedNewsItemT[]>): Promise<void> {
  const tmp = `${PROMOTED_STORE}.tmp`;
  await writeFile(tmp, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
  await rename(tmp, PROMOTED_STORE);
}

/**
 * Add a promoted item under a corridor, de-duping by {@link itemKey} (re-promoting refreshes in place).
 * Atomic tmp+rename, then touch the publish sentinel so the host watcher ships it. Returns the stored
 * item. Newest promotions render first.
 */
export async function writePromotedNews(
  corridorId: string,
  item: PromotedNewsItemT,
): Promise<PromotedNewsItemT> {
  const store = await readStore();
  const key = itemKey(item);
  const existing = store[corridorId] ?? [];
  const next = [item, ...existing.filter((it) => itemKey(it) !== key)];
  store[corridorId] = next;
  await writeStore(store);
  await touchPublishPending();
  return item;
}

/** Remove a promoted item (by key) from a corridor. Returns true if something was removed. */
export async function unpromoteNews(corridorId: string, key: string): Promise<boolean> {
  const store = await readStore();
  const existing = store[corridorId] ?? [];
  const next = existing.filter((it) => itemKey(it) !== key);
  if (next.length === existing.length) return false;
  if (next.length === 0) delete store[corridorId];
  else store[corridorId] = next;
  await writeStore(store);
  await touchPublishPending();
  return true;
}
