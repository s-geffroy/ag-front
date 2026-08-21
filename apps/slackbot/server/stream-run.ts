/**
 * Le sondeur : une passe du flux au fil de l'eau. Lancé par cron, il ne tient rien entre deux appels.
 *
 * PARTAGE DES RÔLES. Tout ce qui décide est dans `stream.ts` et testé sans réseau ni jeton ; ce
 * fichier ne fait que lire le flux, poser des messages et écrire le registre. C'est aussi pour cela
 * qu'il est court.
 *
 * L'AMONT AGRÈGE QUATRE FOIS PAR JOUR, mais nous sondons toutes les heures sans chercher à nous
 * aligner sur leurs passes : nous ignorons leurs horaires, le registre rend le sondage idempotent,
 * et un sujet neuf est vu dans l'heure plutôt qu'avec six heures de retard.
 *
 *   docker compose -f docker/docker-compose.yml run --rm tools \
 *     npm --workspace @ag/slackbot run stream -- --dry-run
 */

import { readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createChokepointsClient } from '@ag/chokepoints';
import {
  ELIGIBLE_CLASSES,
  buildStreamMessage,
  feedIsUsable,
  maxPerRunFrom,
  planStream,
  purgeLedger,
  revertKey,
  toStreamCluster,
  type Ledger,
  type StreamAction,
} from './stream.js';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const LEDGER_PATH =
  process.env.NEWS_STREAM_LEDGER ?? resolve(ROOT, 'apps/cockpit/data/news-stream-ledger.json');
const DRY_RUN = process.argv.includes('--dry-run');
const MAX_PER_RUN = maxPerRunFrom(process.env.NEWS_STREAM_MAX_PER_RUN);

/** Registre absent = premier sondage, pas une erreur. Registre illisible = erreur, et on s'arrête. */
async function loadLedger(): Promise<Ledger> {
  try {
    return JSON.parse(await readFile(LEDGER_PATH, 'utf8')) as Ledger;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return {};
    throw new Error(`registre illisible (${LEDGER_PATH}) : ${(err as Error).message}`);
  }
}

/** Écriture atomique : un sondage interrompu ne doit pas laisser un registre tronqué. */
async function saveLedger(ledger: Ledger): Promise<void> {
  const tmp = `${LEDGER_PATH}.tmp`;
  await writeFile(tmp, `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
  await rename(tmp, LEDGER_PATH);
}

/**
 * `curl -f` ne suffirait pas : Slack refuse en HTTP 200 avec `{"ok":false,"error":"not_in_channel"}`.
 * Un bot jamais invité rendrait donc un succès silencieux, et le sujet serait consommé sans avoir
 * été annoncé. On lit le corps.
 */
async function post(
  token: string,
  channel: string,
  message: { text: string; blocks: unknown[] },
): Promise<string> {
  const r = await fetch('https://slack.com/api/chat.postMessage', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({ channel, ...message }),
  });
  const body = (await r.json().catch(() => ({}))) as { ok?: boolean; error?: string; ts?: string };
  if (!body.ok) throw new Error(body.error ?? `HTTP ${r.status}`);
  return body.ts ?? '';
}

async function main(): Promise<void> {
  const baseUrl = process.env.CHOKEPOINTS_API_URL;
  const token = process.env.CHOKEPOINTS_API_TOKEN;
  const slackToken = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_CHANNEL_ID;

  if (!baseUrl || !token) throw new Error('CHOKEPOINTS_API_URL / CHOKEPOINTS_API_TOKEN absents');
  if (!DRY_RUN && (!slackToken || !channel))
    throw new Error('SLACK_BOT_TOKEN / SLACK_CHANNEL_ID absents (ou lancez avec --dry-run)');

  const client = createChokepointsClient({ baseUrl, token });
  const feed = await client.listNews({ limit: 200 });

  if (!feedIsUsable(feed)) {
    // Ne PAS toucher au registre : un pipeline amont en panne ne doit pas ressembler à une accalmie,
    // et surtout ne doit pas consommer des sujets qu'il n'a pas servis.
    console.log('[stream] flux inexploitable (0 sans run_id, ou injoignable) — aucune action.');
    process.exitCode = 1;
    return;
  }

  // La classe de priorité se LIT dans le recensement ; on ne la devine pas depuis le préfixe de
  // l'identifiant. Une page incomplète laisse des corridors sans classe — et sans classe, le seuil
  // appliqué est le plus exigeant, jamais le plus permissif.
  // On ne charge QUE les classes surveillées : P0 (30 objets) + P1 (182). Charger tout le
  // recensement était impossible sans pagination — 2239 objets pour une limite serveur de 500 — et
  // la première version, silencieusement tronquée à 500, ne reconnaissait que 14 corridors. Ici une
  // classe absente de la carte signifie « hors périmètre », pas « inconnue ».
  const classes = new Map<string, string>();
  for (const cls of ELIGIBLE_CLASSES) {
    const page = await client.listChokepoints({ priority_class: cls, limit: 500 });
    // `id` côté recensement, `chokepoint_id` côté actualités : deux noms pour le même espace
    // d'identifiants. Le typechecker a attrapé la confusion ; sans lui la carte serait restée vide
    // et le flux se serait tu, sans que rien ne le dise.
    for (const cp of page.items ?? []) if (cp.id) classes.set(cp.id, cls);
    const total = page.total_count ?? page.items?.length ?? 0;
    if (total > (page.items?.length ?? 0))
      console.log(`[stream] classe ${cls} TRONQUÉE : ${page.items?.length}/${total} — paginer.`);
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const before = purgeLedger(await loadLedger(), now);
  const plan = planStream({
    clusters: (feed.items ?? []).map((c) => toStreamCluster(c as Record<string, unknown>)),
    ledger: before,
    classes,
    now: nowIso,
    maxPerRun: MAX_PER_RUN,
  });

  // Diagnostic qui compte : si aucun sujet ne trouve sa classe, le flux fonctionne quand même mais
  // au seuil le plus strict, silencieusement. Ce nombre rend cette dégradation visible.
  // Diagnostic qui compte : si aucun corridor du flux n'est au périmètre, le sondeur se tait
  // légitimement — mais il doit le DIRE, sinon un périmètre mal chargé ressemble à une accalmie.
  const au_perimetre = new Set(
    (feed.items ?? []).flatMap((c) =>
      ((c.affected_chokepoints ?? []) as { chokepoint_id?: string }[])
        .map((a) => a.chokepoint_id ?? '')
        .filter((id) => classes.has(id)),
    ),
  );
  console.log(
    `[stream] corridors au périmètre dans le flux : ${au_perimetre.size} (surveillés : ${classes.size})`,
  );
  console.log(
    `[stream] ${feed.count} regroupement(s) servis | ${plan.notify.length} annonce(s), ` +
      `${plan.remind.length} rappel(s) | registre ${Object.keys(before).length} → ${Object.keys(plan.ledger).length}`,
  );
  for (const note of feed.run_notes ?? []) console.log(`[stream] run_note : ${note}`);

  let ledger = plan.ledger;
  const today = nowIso.slice(0, 10);
  const send = async (action: StreamAction, kind: 'annonce' | 'rappel') => {
    const message = buildStreamMessage(action.cluster, action.corridorId, today);
    if (DRY_RUN) {
      console.log(`[stream] (à blanc) ${kind} — ${action.corridorId} — ${message.text}`);
      return;
    }
    try {
      const ts = await post(slackToken!, channel!, message);
      const entry = ledger[action.key];
      if (entry) ledger = { ...ledger, [action.key]: { ...entry, ts } };
      console.log(`[stream] ${kind} postée — ${action.key}`);
    } catch (err) {
      // L'envoi a échoué : on REND la clé à son état d'avant, sinon le sujet serait consommé sans
      // avoir été annoncé et ne reviendrait jamais.
      ledger = revertKey(ledger, before, action.key);
      console.error(`[stream] ${kind} EN ÉCHEC (${action.key}) : ${(err as Error).message}`);
      process.exitCode = 1;
    }
  };

  for (const action of plan.notify) await send(action, 'annonce');
  for (const action of plan.remind) await send(action, 'rappel');

  if (DRY_RUN) {
    console.log('[stream] à blanc : registre NON écrit.');
    return;
  }
  await saveLedger(ledger);
}

await main();
