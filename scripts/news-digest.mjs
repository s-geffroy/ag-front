#!/usr/bin/env node
/**
 * Weekly news-promotion digest.
 *
 * The pipeline (API → cockpit promotion → public block) has been complete since ADR 0071 and had
 * never been used once: `promoted-news.json` sat at `{}` while the API served fresh clusters daily.
 * Nothing was missing technically. What was missing was a rhythm. This is the rhythm.
 *
 * WHAT IT DELIBERATELY DOES NOT DO: paste cluster headlines into the alert. Those headlines are
 * model prose, and ADR 0074 exists because judging a promotion on titles is precisely the failure we
 * removed — the public block no longer renders them, and a promoter must write their own sentence.
 * A Slack digest full of headlines would rebuild the comfort of not reading, one channel to the left.
 * So this reports HOW MUCH there is and WHERE, never WHAT it says. Reading happens in the cockpit.
 *
 * Run: docker compose -f docker/docker-compose.yml run --rm tools node scripts/news-digest.mjs
 * Emits a human summary on stdout and a final line `DIGEST_JSON={...}` for the shell wrapper.
 */

import { existsSync, readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createChokepointsClient } from '@ag/chokepoints';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PROMOTED = resolve(ROOT, 'apps/public/src/data/promoted-news.json');

const FRESH_DAYS = Number(process.env.NEWS_FRESH_DAYS ?? 7);
const TOP_CORRIDORS = 8;

/** Clusters first seen within `days` of `now`. A cluster with no date is NOT assumed fresh. */
export function freshClusters(items, now, days = FRESH_DAYS) {
  const cutoff = now.getTime() - days * 86_400_000;
  return items.filter((c) => {
    const d = Date.parse(c.last_seen ?? c.first_seen ?? '');
    return Number.isFinite(d) && d >= cutoff;
  });
}

/** Cluster counts per affected corridor, biggest first. One cluster can touch several corridors. */
export function byCorridor(items) {
  const counts = new Map();
  for (const c of items) {
    for (const a of c.affected_chokepoints ?? []) {
      const id = a.chokepoint_id ?? a.id ?? a;
      if (typeof id === 'string') counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return [...counts.entries()].sort((x, y) => y[1] - x[1]);
}

/**
 * Read the public promotion store. Distinguishes "no file" from "empty file": the second means the
 * rhythm ran and promoted nothing, the first means it never ran at all.
 */
export function promotionState(path = PROMOTED, now = new Date()) {
  if (!existsSync(path)) return { exists: false, items: 0, corridors: 0, daysSinceChange: null };
  const store = JSON.parse(readFileSync(path, 'utf8'));
  const corridors = Object.keys(store);
  const items = corridors.reduce((n, k) => n + (store[k]?.length ?? 0), 0);
  const days = Math.floor((now.getTime() - statSync(path).mtimeMs) / 86_400_000);
  return { exists: true, items, corridors: corridors.length, daysSinceChange: days };
}

/**
 * The feed's own epistemic status, per the contract: `count: 0` WITH a run_id is an honest empty
 * feed; `count: 0` WITHOUT one means no aggregation ever ran. Reporting "no news" for the second
 * would turn a broken pipeline into a calm week.
 */
export function feedStatus(feed) {
  if (!feed) return 'unreachable';
  if ((feed.count ?? 0) > 0) return 'ok';
  return feed.run_id ? 'empty_honest' : 'never_ran';
}

async function main() {
  const baseUrl = process.env.CHOKEPOINTS_API_URL;
  const token = process.env.CHOKEPOINTS_API_TOKEN;
  const now = new Date();
  const promo = promotionState(PROMOTED, now);

  let feed = null;
  let error = null;
  if (!baseUrl || !token) {
    error = 'CHOKEPOINTS_API_URL / CHOKEPOINTS_API_TOKEN absents';
  } else {
    try {
      feed = await createChokepointsClient({ baseUrl, token }).listNews({ limit: 100 });
    } catch (e) {
      error = String(e).slice(0, 200);
    }
  }

  const status = error ? 'unreachable' : feedStatus(feed);
  const items = feed?.items ?? [];
  const fresh = freshClusters(items, now);
  const corridors = byCorridor(fresh).slice(0, TOP_CORRIDORS);

  console.log(
    `[news] flux : ${status} | clusters ${items.length} | frais (${FRESH_DAYS} j) ${fresh.length}`,
  );
  if (error) console.log(`[news] erreur : ${error}`);
  for (const note of feed?.run_notes ?? []) console.log(`[news] run_note : ${note}`);
  console.log(
    `[news] promotions publiques : ${promo.items} item(s) sur ${promo.corridors} corridor(s)` +
      (promo.daysSinceChange === null
        ? ' (store absent)'
        : ` | dernier changement il y a ${promo.daysSinceChange} j`),
  );
  for (const [id, n] of corridors) console.log(`[news]   ${String(n).padStart(3)}  ${id}`);

  // Machine-readable tail for the shell wrapper. run_notes travel: the contract says they must be
  // shown, and a digest that hides the run's own caveats is the tidy-list trap the contract warns of.
  console.log(
    'DIGEST_JSON=' +
      JSON.stringify({
        status,
        error,
        total: items.length,
        fresh: fresh.length,
        corridors,
        promoted: promo,
        run_notes: feed?.run_notes ?? [],
      }),
  );
}

if (process.argv[1] && process.argv[1].endsWith('news-digest.mjs')) await main();
