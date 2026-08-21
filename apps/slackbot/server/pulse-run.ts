/**
 * Une pulsation. Lancé chaque jour par cron ; c'est le SCRIPT qui décide s'il est temps, pas la
 * crontab — un pas de deux sur le quantième ne donne que les jours impairs et laisse un trou de
 * trois jours aux mois de 31.
 *
 * Le signal « le sondeur vit-il encore ? » n'a demandé aucun fichier nouveau : `stream-run.ts` écrit
 * le registre à CHAQUE passage réussi, et s'arrête avant de l'écrire quand le flux est inexploitable.
 * La date de modification du registre EST donc la date du dernier sondage utile.
 *
 *   docker compose -f docker/docker-compose.yml run --rm tools \
 *     npm --workspace @ag/slackbot run pulse -- --dry-run --force
 */

import { readFile, rename, stat, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createChokepointsClient } from '@ag/chokepoints';
import { ELIGIBLE_CLASSES, feedIsUsable, type Ledger } from './stream.js';
import {
  buildPulseMessage,
  pollAgeHours,
  shouldPulse,
  type FeedState,
  type PulseState,
} from './pulse.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const LEDGER_PATH =
  process.env.NEWS_STREAM_LEDGER ?? resolve(ROOT, 'apps/cockpit/data/news-stream-ledger.json');
const STATE_PATH =
  process.env.NEWS_PULSE_STATE ?? resolve(ROOT, 'apps/cockpit/data/news-pulse-state.json');
const PROMOTED_PATH = resolve(ROOT, 'apps/public/src/data/promoted-news.json');
const DRY_RUN = process.argv.includes('--dry-run');
const FORCE = process.argv.includes('--force');

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return fallback;
    throw new Error(`illisible (${path}) : ${(err as Error).message}`);
  }
}

async function mtimeOf(path: string): Promise<Date | null> {
  try {
    return (await stat(path)).mtime;
  } catch {
    return null;
  }
}

async function post(
  token: string,
  channel: string,
  message: { text: string; blocks: unknown[] },
): Promise<void> {
  const r = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ channel, ...message }),
  });
  // Slack refuse en HTTP 200 avec `{"ok":false}` : sans lire le corps, une pulsation « partie » mais
  // jamais arrivée ferait taire le dead-man's switch tout en le croyant vivant.
  const body = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string };
  if (!body.ok) throw new Error(body.error ?? `HTTP ${r.status}`);
}

async function main(): Promise<void> {
  const now = new Date();
  const state = await readJson<{ lastPulseAt?: string }>(STATE_PATH, {});

  if (!FORCE && !shouldPulse(state.lastPulseAt, now)) {
    console.log(`[pulse] pas encore l'heure (dernière : ${state.lastPulseAt ?? 'jamais'}).`);
    return;
  }

  const since = Date.parse(state.lastPulseAt ?? '');
  const sinceLabel = Number.isFinite(since)
    ? `depuis le ${new Date(since).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}`
    : 'depuis toujours';

  const ledger = await readJson<Ledger>(LEDGER_PATH, {});
  const entries = Object.values(ledger);
  const announcedSince = Number.isFinite(since)
    ? entries.filter((e) => Date.parse(e.firstNotifiedAt) >= since).length
    : entries.length;

  const promoted = await readJson<Record<string, { promoted_at?: string }[]>>(PROMOTED_PATH, {});
  const items = Object.values(promoted).flat();
  const promotedSince = Number.isFinite(since)
    ? items.filter((i) => Date.parse(i.promoted_at ?? '') >= since).length
    : items.length;

  let feedState: FeedState = 'unreachable';
  let servedAtScope = 0;
  let runNotes: string[] = [];
  const baseUrl = process.env.CHOKEPOINTS_API_URL;
  const token = process.env.CHOKEPOINTS_API_TOKEN;
  if (baseUrl && token) {
    try {
      const client = createChokepointsClient({ baseUrl, token });
      const feed = await client.listNews({ limit: 200 });
      runNotes = feed.run_notes ?? [];
      feedState = !feedIsUsable(feed) ? 'never_ran' : (feed.count ?? 0) > 0 ? 'ok' : 'empty_honest';
      const scope = new Set<string>();
      for (const cls of ELIGIBLE_CLASSES) {
        const page = await client.listChokepoints({ priority_class: cls, limit: 500 });
        for (const cp of page.items ?? []) if (cp.id) scope.add(cp.id);
      }
      servedAtScope = (feed.items ?? []).filter((c) =>
        ((c.affected_chokepoints ?? []) as { chokepoint_id?: string }[]).some((a) =>
          scope.has(a.chokepoint_id ?? ''),
        ),
      ).length;
    } catch (err) {
      console.error(`[pulse] flux injoignable : ${(err as Error).message}`);
    }
  }

  const pulse: PulseState = {
    feed: feedState,
    servedAtScope,
    announcedSince,
    promotedSince,
    promotedTotal: items.length,
    promotedCorridors: Object.keys(promoted).length,
    pollAgeHours: pollAgeHours(await mtimeOf(LEDGER_PATH), now),
    runNotes,
    sinceLabel,
  };

  const message = buildPulseMessage(pulse);
  console.log(`[pulse] ${message.text}`);

  if (DRY_RUN) {
    console.log('[pulse] à blanc : rien posté, horodatage NON écrit.');
    return;
  }

  const slackToken = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_CHANNEL_ID;
  if (!slackToken || !channel) throw new Error('SLACK_BOT_TOKEN / SLACK_CHANNEL_ID absents');
  await post(slackToken, channel, message);

  // L'horodatage n'est écrit QU'APRÈS un envoi confirmé : une pulsation qui n'est pas partie ne doit
  // pas décaler la suivante de deux jours.
  const tmp = `${STATE_PATH}.tmp`;
  await writeFile(tmp, `${JSON.stringify({ lastPulseAt: now.toISOString() }, null, 2)}\n`, 'utf8');
  await rename(tmp, STATE_PATH);
  console.log('[pulse] postée.');
}

await main();
