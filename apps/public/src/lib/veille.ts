/**
 * The site-wide veille surface: every promoted news cluster, across corridors.
 *
 * `loadCorridorPromotedNews` answers "what was promoted for THIS corridor", which is what a
 * chokepoint page needs. It cannot answer "what is new on the site", so a visitor had to already be
 * on the right corridor page to see that anything was happening at all. This module is the
 * transversal read.
 *
 * THE RULE THESE SURFACES OBEY: they fail to EMPTY, never to STALE. A veille block nobody feeds does
 * not become neutral as it ages — it lies, which is exactly how the Mer Rouge fiche came to assert
 * "aucune attaque depuis octobre 2025" ten days after that stopped being true. So `/veille` and its
 * nav entry leave the build entirely when there is nothing (the `plaquetteIsPublic()` precedent), and
 * the homepage strip disappears past `HOMEPAGE_MAX_AGE_DAYS` rather than showing "rien de récent".
 */

import { PromotedNewsItem, type PromotedNewsItem as PromotedNewsItemT } from '@ag/schema/content';
import promotedNewsRaw from '../data/promoted-news.json';
import { nav, type NavItem } from './site';

/**
 * Past this age, a freshness surface is not stale — it is absent. Arbitrated 2026-08-10.
 *
 * `homepageVeille` used to live here and consume it; the homepage now runs a UNIFIED feed (veille +
 * editorial publications) whose rule is `lib/actualite.ts`, which imports this constant rather than
 * copying its value. The constant stays here, with the arbitration that produced it.
 */
export const HOMEPAGE_MAX_AGE_DAYS = 21;

export interface VeilleEntry {
  item: PromotedNewsItemT;
  /** The corridor this was promoted under — the store's key, not a guess from the payload. */
  corridorId: string;
  /** Human name, taken from the cluster's own affected list when it names this corridor. */
  corridorName: string;
  /** Parsed `promoted_at`, or null when unusable — never silently replaced by "now". */
  promotedAt: Date | null;
}

function parseDate(s: string | undefined | null): Date | null {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

/**
 * Every promoted item, newest first. Items whose `promoted_at` is unusable sort last rather than
 * being dropped: a promotion that happened must stay visible even if its stamp is malformed.
 */
export function loadVeille(): VeilleEntry[] {
  const store = promotedNewsRaw as Record<string, unknown>;
  const out: VeilleEntry[] = [];
  for (const [corridorId, bucket] of Object.entries(store)) {
    if (!Array.isArray(bucket)) continue;
    for (const raw of bucket) {
      const parsed = PromotedNewsItem.safeParse(raw);
      if (!parsed.success) continue;
      const item = parsed.data;
      // Same taint gate as the per-corridor read: a stamp of `cleared_only` is the only pass.
      if (item.taint_class !== 'cleared_only') continue;
      const named = item.affected_chokepoints.find((c) => c.chokepoint_id === corridorId);
      out.push({
        item,
        corridorId,
        corridorName: named?.canonical_name || corridorId,
        promotedAt: parseDate(item.promoted_at),
      });
    }
  }
  return out.sort((a, b) => {
    if (a.promotedAt && b.promotedAt) return b.promotedAt.getTime() - a.promotedAt.getTime();
    if (a.promotedAt) return -1;
    if (b.promotedAt) return 1;
    return 0;
  });
}

/** Whether anything on the site may link to /veille. Guard EVERY internal link with this. */
export function veilleIsPublic(): boolean {
  return loadVeille().length > 0;
}

/** The most recent promotion date, or null when there is none — the page's freshness stamp. */
export function lastReviewedAt(entries: VeilleEntry[] = loadVeille()): Date | null {
  return entries.find((e) => e.promotedAt)?.promotedAt ?? null;
}

/**
 * The public nav, with `Veille` inserted only when the page actually exists in the build.
 *
 * Lives here rather than in `site.ts` so the guard sits next to the reason for it, and so the header
 * and the footer cannot drift apart: both call this, and neither knows the condition.
 */
export function navWithVeille(): NavItem[] {
  const items = [...nav];
  if (!veilleIsPublic()) return items;
  // After Notes: the editorial cluster reads Atlas → Dossiers → Notes → Veille.
  const i = items.findIndex((n) => 'href' in n && n.href === '/notes');
  const entry: NavItem = { href: '/veille', label: 'Veille' };
  items.splice(i >= 0 ? i + 1 : items.length, 0, entry);
  return items;
}
