/**
 * Slack listener, Socket Mode.
 *
 * WHY SOCKET MODE AND NOT A WEBHOOK ENDPOINT. Slack's classic interactivity needs a public HTTPS URL
 * that receives POSTs — which would have been the first write path to the public internet in a
 * deployment built the other way round: the cockpit is deliberately tailnet-only, and this endpoint
 * would MUTATE the public Atlas. Socket Mode inverts the direction: this process opens an OUTBOUND
 * WebSocket to Slack. No port, no Caddy rule, no DNS record, and no request signature to verify
 * correctly — one fewer thing to get wrong.
 *
 * It reaches the cockpit over the Docker network (`cockpit:8787`), never over the tailnet.
 *
 * Inert until three values exist in docker/.env: SLACK_APP_TOKEN (xapp-), SLACK_BOT_TOKEN (xoxb-),
 * SLACK_CHANNEL_ID. Missing any of them, it logs why and exits 0 rather than crash-looping.
 */

import { App, LogLevel } from '@slack/bolt';
import {
  MODAL_CALLBACK_ID,
  NOTE_BLOCK_ID,
  PROMOTE_ACTION_PATTERN,
  buildPromoteModal,
  isAllowedChannel,
  outcomeFromCockpit,
  parseSubmission,
  validatedBy,
  type ClusterChoice,
} from './promote.js';

const APP_TOKEN = process.env.SLACK_APP_TOKEN;
const BOT_TOKEN = process.env.SLACK_BOT_TOKEN;
const CHANNEL = process.env.SLACK_CHANNEL_ID;
const OPERATOR = process.env.SLACK_OPERATOR_NAME ?? 'Sylvain Geffroy';
const COCKPIT = process.env.COCKPIT_URL ?? 'http://cockpit:8787';

if (!APP_TOKEN || !BOT_TOKEN || !CHANNEL) {
  console.log(
    '[slackbot] inactif : SLACK_APP_TOKEN / SLACK_BOT_TOKEN / SLACK_CHANNEL_ID requis dans docker/.env.',
  );
  process.exit(0);
}

const app = new App({
  token: BOT_TOKEN,
  appToken: APP_TOKEN,
  socketMode: true,
  logLevel: LogLevel.INFO,
});

/** Clusters for one corridor, read through the cockpit (which holds the tainted-scope token). */
async function fetchClusters(corridorId: string): Promise<ClusterChoice[]> {
  const r = await fetch(
    `${COCKPIT}/api/explore/chokepoints/${encodeURIComponent(corridorId)}/news?limit=20`,
  );
  if (!r.ok) throw new Error(`cockpit ${r.status}`);
  const feed = (await r.json()) as { items?: Record<string, unknown>[] };
  return (feed.items ?? []).map((c) => ({
    clusterId: String(c.cluster_id ?? ''),
    eventCategory: c.event_category ? String(c.event_category) : undefined,
    articleCount: typeof c.article_count === 'number' ? c.article_count : undefined,
    firstSeen: c.first_seen ? String(c.first_seen) : undefined,
    lastSeen: c.last_seen ? String(c.last_seen) : undefined,
    articles: ((c.articles ?? []) as Record<string, unknown>[])
      .filter((a) => typeof a.url === 'string' && /^https?:\/\//i.test(String(a.url)))
      .map((a) => ({
        title: String(a.title ?? ''),
        url: String(a.url),
        outlet: a.outlet ? String(a.outlet) : undefined,
        // `observed_on` = quand le flux a VU l'article. Ce n'est pas sa date de publication, et nous
        // ne la déduirons pas : l'interface dit « vu le », jamais « publié le » (ADR 0077).
        observedOn: a.observed_on ? String(a.observed_on) : undefined,
      })),
  }));
}

app.action(PROMOTE_ACTION_PATTERN, async ({ ack, body, client, logger }) => {
  await ack(); // within 3 s, always
  const b = body as unknown as {
    channel?: { id?: string };
    trigger_id: string;
    actions?: { value?: string }[];
  };
  if (!isAllowedChannel(b.channel?.id, CHANNEL)) {
    logger.warn('[slackbot] interaction hors du canal autorisé, ignorée');
    return;
  }
  const corridorId = b.actions?.[0]?.value ?? '';
  const clusters = await fetchClusters(corridorId);
  if (clusters.length === 0) {
    await client.views.open({
      trigger_id: b.trigger_id,
      view: {
        type: 'modal',
        title: { type: 'plain_text', text: 'Rien à promouvoir' },
        close: { type: 'plain_text', text: 'Fermer' },
        blocks: [
          {
            type: 'section',
            text: { type: 'mrkdwn', text: 'Aucun regroupement servi pour ce corridor.' },
          },
        ],
      },
    });
    return;
  }
  await client.views.open({
    trigger_id: b.trigger_id,
    // `today` est injecté ici et pas calculé dans la vue : l'âge affiché doit être testable.
    view: buildPromoteModal(corridorId, clusters, new Date().toISOString().slice(0, 10)),
  });
});

app.view(MODAL_CALLBACK_ID, async ({ ack, view, logger }) => {
  let sub;
  try {
    sub = parseSubmission(view as never);
  } catch {
    await ack({ response_action: 'errors', errors: { [NOTE_BLOCK_ID]: 'Formulaire incomplet.' } });
    return;
  }

  const r = await fetch(`${COCKPIT}/api/promote-news/${encodeURIComponent(sub.corridorId)}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      cluster_id: sub.clusterId,
      editorial_note: sub.note,
      // The journal is append-only and nominative: it must carry that this came through Slack.
      validated_by: validatedBy(OPERATOR),
    }),
  }).catch(() => null);

  if (!r) {
    await ack({ response_action: 'errors', errors: { [NOTE_BLOCK_ID]: 'Cockpit injoignable.' } });
    return;
  }
  const outcome = outcomeFromCockpit(r.status, (await r.json().catch(() => ({}))) as never);
  if (outcome.ok) {
    await ack();
    logger.info(`[slackbot] promu ${sub.clusterId} sur ${sub.corridorId}`);
    return;
  }
  // The paraphrase refusal lands under the note field, where the person is typing — not in a log.
  await ack({ response_action: 'errors', errors: { [NOTE_BLOCK_ID]: outcome.message } });
});

await app.start();
console.log('[slackbot] Socket Mode connecté — aucune surface publique ouverte.');
