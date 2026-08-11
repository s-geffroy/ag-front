/**
 * Pure logic for promoting a news cluster from Slack. Kept apart from the Bolt wiring so the rules
 * that matter are testable without a workspace, a token, or a socket.
 *
 * DOCTRINE THIS FILE ENFORCES (ADR 0071 / 0074, arbitrated 2026-08-10):
 *  - Promotion is nominative. From Slack the promoter is recorded as "‹name› (via Slack)" — the
 *    journal must not lose the fact that the act came through a phone.
 *  - Authorisation is carried by the PRIVATE CHANNEL: no other allowlist. An interaction from
 *    anywhere else is dropped, because a button forwarded into another channel is not an approval.
 *  - No model prose is offered as a shortcut. The modal shows ARTICLE TITLES with their links —
 *    publishers' words, clickable — never the cluster `headline`.
 *  - The note is checked for paraphrase server-side by the cockpit (P2), and the refusal is surfaced
 *    inline on the note field, where the person is typing.
 */

import { outletCountry } from './country.js';

export const PROMOTE_ACTION_ID = 'promote_corridor';
/**
 * Slack exige un `action_id` UNIQUE PAR MESSAGE : cinq boutons portant tous `promote_corridor`
 * faisaient rejeter le digest entier en `invalid_blocks` — donc aucun bouton, jamais, depuis le
 * premier envoi. Le digest suffixe donc `_0`…`_4`, et l'écoute se fait sur le motif, pas sur la
 * chaîne exacte. Le corridor voyage dans `value`, jamais dans l'identifiant.
 */
export const PROMOTE_ACTION_PATTERN = /^promote_corridor(?:_\d+)?$/;
/** L'identifiant du n-ième bouton d'un même message. */
export function promoteActionId(index: number): string {
  return `${PROMOTE_ACTION_ID}_${index}`;
}
export const MODAL_CALLBACK_ID = 'promote_news_modal';
export const NOTE_BLOCK_ID = 'note_block';
export const NOTE_ACTION_ID = 'editorial_note';
export const CLUSTER_BLOCK_ID = 'cluster_block';
export const CLUSTER_ACTION_ID = 'cluster_choice';

/** Authorisation is the channel, and only the channel. */
export function isAllowedChannel(
  channelId: string | undefined,
  allowed: string | undefined,
): boolean {
  if (!allowed || !allowed.trim()) return false; // unset ⇒ refuse everything, never allow everything
  return !!channelId && channelId === allowed.trim();
}

/** "Sylvain Geffroy" + Slack ⇒ what the append-only journal will carry forever. */
export function validatedBy(operator: string): string {
  return `${operator.trim()} (via Slack)`;
}

export interface ClusterChoice {
  clusterId: string;
  /** Article titles + urls — the publishers' own words, the only text we put in front of a promoter. */
  articles: { title: string; url: string; outlet?: string; observedOn?: string }[];
  /** Bornes d'OBSERVATION du regroupement (`first_seen`/`last_seen` amont), pas de publication. */
  firstSeen?: string;
  lastSeen?: string;
  eventCategory?: string;
  articleCount?: number;
}

/**
 * Regroupe les REPRISES d'une même dépêche. Un regroupement de 220 articles peut n'être que quatre
 * histoires : une dépêche d'agence relayée par des dizaines de radios locales. L'aperçu montrait
 * donc les quatre premières lignes — quatre reprises identiques — pendant que l'article qui aurait
 * servi à juger attendait en cinquième position.
 *
 * On ne SUPPRIME pas les reprises, on les COMPTE : « 216 médias reprennent la même dépêche » dit
 * quelque chose sur l'ampleur de l'écho. L'effacer rendrait une couverture massive indistinguable
 * d'un entrefilet (ADR 0077).
 */
export interface DistinctStory {
  title: string;
  url: string;
  outlet?: string;
  /** Nombre d'autres médias publiant le même titre. 0 = pas de reprise. */
  republications: number;
  /** Nombre de MÉDIAS DISTINCTS portant cette histoire — le poids réel, celui de la donnée. */
  outlets: number;
  /**
   * Pays identifiés par le domaine. C'est un PLANCHER : les gTLD (.com/.org/.net) n'en déclarent
   * aucun et forment les deux tiers du corpus. D'où l'affichage « ≥ N pays ».
   */
  countries: string[];
  /**
   * MÉDIAS DISTINCTS dont le domaine ne déclare aucun pays. Compté en médias comme `outlets`,
   * pas en articles : afficher « 16 médias · 16 sans pays » quand il y a 17 articles pour
   * 16 médias donnait une ligne dont les deux nombres ne parlaient pas de la même chose.
   */
  countryUnknown: number;
  /**
   * La PLUS ANCIENNE observation de cette histoire. `observed_on` dit quand le flux l'a vue, pas
   * quand elle a été publiée — nous n'avons pas la date de publication et nous ne la déduirons pas.
   * D'où « vu », jamais « publié » (ADR 0077).
   */
  observedOn?: string;
}

/**
 * Le flux transporte les titres avec leurs entités HTML (`Trump says&#xA0;the US has swept…`).
 * On les rend lisibles à l'affichage sans toucher au titre stocké : ce qui est promu reste le mot
 * de l'éditeur, tel qu'il nous est parvenu.
 */
export function decodeEntities(text: string): string {
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    nbsp: ' ',
    laquo: '«',
    raquo: '»',
    hellip: '…',
    mdash: '—',
    ndash: '–',
    rsquo: '’',
    lsquo: '‘',
    ldquo: '“',
    rdquo: '”',
  };
  return (
    text
      .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
      .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
      .replace(/&([a-z]+);/gi, (m, n) => named[n.toLowerCase()] ?? m)
      // `&#xA0;` donne une espace insécable, invisible à l'œil mais distincte à la comparaison :
      // deux titres identiques cesseraient de se regrouper pour ce seul caractère.
      .replace(/\u00a0/g, ' ')
  );
}

function storyKey(title: string): string {
  return title
    .toLowerCase()
    .replace(/&#x[0-9a-f]+;|&[a-z]+;/gi, ' ') // les entités HTML voyagent telles quelles dans le flux
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function distinctStories(
  articles: readonly ClusterChoice['articles'][number][],
): DistinctStory[] {
  type Acc = DistinctStory & {
    _outlets: Set<string>;
    _countries: Set<string>;
    _noCountry: Set<string>;
  };
  const byKey = new Map<string, Acc>();
  for (const a of articles) {
    const k = storyKey(a.title);
    let e = byKey.get(k);
    if (!e) {
      e = {
        title: a.title,
        url: a.url,
        outlet: a.outlet,
        republications: 0,
        outlets: 0,
        countries: [],
        countryUnknown: 0,
        observedOn: a.observedOn,
        _outlets: new Set<string>(),
        _countries: new Set<string>(),
        _noCountry: new Set<string>(),
      };
      byKey.set(k, e);
    } else {
      e.republications += 1;
      // La reprise la plus ancienne date l'histoire : une dépêche vue le 8 reste vue le 8, même si
      // une radio la relaie le 11. Prendre la plus récente rajeunirait artificiellement le sujet.
      if (a.observedOn && (!e.observedOn || a.observedOn < e.observedOn))
        e.observedOn = a.observedOn;
    }
    const dom = a.outlet?.toLowerCase();
    if (dom) e._outlets.add(dom);
    const country = outletCountry(a.outlet);
    if (country) e._countries.add(country);
    else e._noCountry.add(dom ?? a.url);
  }
  const out = [...byKey.values()].map(({ _outlets, _countries, _noCountry, ...rest }) => ({
    ...rest,
    outlets: _outlets.size,
    countries: [..._countries].sort(),
    countryUnknown: _noCountry.size,
  }));
  // Le plus PORTÉ d'abord : un sujet repris par 40 médias n'a pas à se lire après un entrefilet
  // unique parce qu'il arrivait plus loin dans le tableau. À poids égal, le plus récemment vu.
  return out.sort(
    (x, y) => y.outlets - x.outlets || (y.observedOn ?? '').localeCompare(x.observedOn ?? ''),
  );
}

/** `2026-08-08` → nombre de jours écoulés depuis, ou null si la date est absente/illisible. */
export function daysSince(observedOn: string | undefined, today: string): number | null {
  if (!observedOn || !/^\d{4}-\d{2}-\d{2}$/.test(observedOn)) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return null;
  const a = Date.parse(`${observedOn}T00:00:00Z`);
  const b = Date.parse(`${today}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return null;
  return Math.round((b - a) / 86_400_000);
}

/**
 * « vu il y a 3 j », jamais « publié il y a 3 j ». Renvoie null plutôt qu'un mot vague quand la date
 * manque : une absence de date ne doit pas se rendre comme une fraîcheur (ADR 0077).
 */
export function ageLabel(observedOn: string | undefined, today: string): string | null {
  const d = daysSince(observedOn, today);
  if (d === null) return null;
  if (d < 0) return `vu le ${frDate(observedOn as string)}`; // date à venir : on la montre telle quelle
  if (d === 0) return "vu aujourd'hui";
  if (d === 1) return 'vu hier';
  return `vu il y a ${d} j`;
}

/** `2026-08-08` → `08/08`. Format explicite, sans dépendre de la locale du conteneur. */
export function frDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  return m ? `${m[3]}/${m[2]}` : iso;
}

/** « fenêtre 08/08 → 11/08 » — les bornes d'observation du regroupement, ou null si inconnues. */
export function windowLabel(firstSeen?: string, lastSeen?: string): string | null {
  if (!firstSeen && !lastSeen) return null;
  if (firstSeen && lastSeen && firstSeen !== lastSeen)
    return `${frDate(firstSeen)} → ${frDate(lastSeen)}`;
  return frDate((firstSeen || lastSeen) as string);
}

/** Compact label for the cluster picker. Deliberately NOT the model headline. */
export function clusterLabel(c: ClusterChoice): string {
  const n = c.articleCount ?? c.articles.length;
  const cat = c.eventCategory ? c.eventCategory.replace(/_/g, ' ') : 'couverture';
  const d = distinctStories(c.articles);
  const first = d[0]?.outlet || d[0]?.title || '';
  const win = windowLabel(c.firstSeen, c.lastSeen);
  const label = `${cat} · ${n} art.${win ? ` · ${win}` : ''}${first ? ` · ${first}` : ''}`;
  // Slack caps option text at 75 characters and errors on longer.
  return label.length > 75 ? `${label.slice(0, 72)}…` : label;
}

/**
 * The modal. Article titles are rendered as markdown links so the promoter can open them from the
 * modal — the only honest answer to "did you read it" is to make reading one tap away.
 */
export function buildPromoteModal(corridorId: string, clusters: ClusterChoice[], today: string) {
  const options = clusters.slice(0, 100).map((c) => ({
    text: { type: 'plain_text' as const, text: clusterLabel(c) },
    value: c.clusterId,
  }));

  const articleBlocks = clusters.slice(0, 3).flatMap((c) => {
    const stories = distinctStories(c.articles);
    const win = windowLabel(c.firstSeen, c.lastSeen);
    // L'en-tête dit d'abord QUAND et COMBIEN : « 220 articles » sur quatre jours et « 4 histoires »
    // ne se décide pas comme un fait du jour. Sans bornes, on écrit qu'on ne les a pas.
    const head = [
      win ? `*Observé* ${win}` : '*Fenêtre d’observation inconnue*',
      `${c.articleCount ?? c.articles.length} article(s)`,
      `${stories.length} histoire(s) distincte(s)`,
    ].join(' · ');
    return [
      {
        type: 'context' as const,
        elements: [
          {
            type: 'mrkdwn' as const,
            text: [
              head,
              ...stories.slice(0, 4).map((a) => {
                const t = decodeEntities(a.title).replace(/[<>|]/g, ' ').slice(0, 90);
                // La reprise est dite, pas cachée : elle mesure l'écho, elle ne le remplace pas.
                const age = ageLabel(a.observedOn, today);
                // Deuxième ligne : le POIDS. Médias distincts = donnée réelle, donc en gras.
                // Pays = PLANCHER (« ≥ »), parce que deux tiers des domaines n'en déclarent aucun ;
                // l'indéterminé est affiché à côté au lieu d'être confondu avec zéro (ADR 0077).
                const weight = [
                  a.outlets > 1 ? `*${a.outlets} médias*` : (a.outlet ?? 'média inconnu'),
                  a.countries.length > 0
                    ? `≥ ${a.countries.length} pays (${a.countries.slice(0, 3).join(', ')}${a.countries.length > 3 ? '…' : ''})`
                    : null,
                  a.countryUnknown > 0 ? `${a.countryUnknown} sans pays déclaré` : null,
                  age,
                ]
                  .filter(Boolean)
                  .join(' · ');
                return `<${a.url}|${t}>\n   _${weight}_`;
              }),
            ].join('\n'),
          },
        ],
      },
    ];
  });

  return {
    type: 'modal' as const,
    callback_id: MODAL_CALLBACK_ID,
    private_metadata: corridorId,
    title: { type: 'plain_text' as const, text: 'Promouvoir' },
    submit: { type: 'plain_text' as const, text: 'Publier' },
    close: { type: 'plain_text' as const, text: 'Annuler' },
    blocks: [
      {
        type: 'input' as const,
        block_id: CLUSTER_BLOCK_ID,
        label: { type: 'plain_text' as const, text: 'Regroupement' },
        element: {
          type: 'static_select' as const,
          action_id: CLUSTER_ACTION_ID,
          options,
        },
      },
      ...articleBlocks,
      {
        type: 'input' as const,
        block_id: NOTE_BLOCK_ID,
        label: { type: 'plain_text' as const, text: 'Ce que cela change pour un décideur' },
        hint: {
          type: 'plain_text' as const,
          text: 'Votre phrase, pas celle du titre. Une phrase courte et juste suffit.',
        },
        element: {
          type: 'plain_text_input' as const,
          action_id: NOTE_ACTION_ID,
          multiline: true,
        },
      },
    ],
  };
}

export interface Submission {
  corridorId: string;
  clusterId: string;
  note: string;
}

/** Read back what the promoter chose and wrote. Throws on a shape Slack should never send. */
export function parseSubmission(view: {
  private_metadata?: string;
  state?: { values?: Record<string, Record<string, unknown>> };
}): Submission {
  const values = view.state?.values ?? {};
  const cluster = values[CLUSTER_BLOCK_ID]?.[CLUSTER_ACTION_ID] as
    | { selected_option?: { value?: string } }
    | undefined;
  const note = values[NOTE_BLOCK_ID]?.[NOTE_ACTION_ID] as { value?: string } | undefined;
  const corridorId = (view.private_metadata ?? '').trim();
  const clusterId = cluster?.selected_option?.value ?? '';
  if (!corridorId || !clusterId) throw new Error('submission incomplète');
  return { corridorId, clusterId, note: (note?.value ?? '').trim() };
}

export type PromoteOutcome =
  | { ok: true }
  | { ok: false; field: 'note'; message: string }
  | { ok: false; field: null; message: string };

/**
 * Map the cockpit's answer onto something the modal can show. A 422 paraphrase is NOT an error to
 * log and swallow: it is the whole point of P2, and it belongs under the note field.
 */
export function outcomeFromCockpit(status: number, body: Record<string, unknown>): PromoteOutcome {
  if (status >= 200 && status < 300) return { ok: true };
  if (status === 422 && body.error === 'editorial_note_paraphrase') {
    return {
      ok: false,
      field: 'note',
      message: String(body.message ?? 'Votre phrase reprend un texte déjà présent.'),
    };
  }
  if (status === 400) return { ok: false, field: 'note', message: 'Une phrase est requise.' };
  return { ok: false, field: null, message: `Le cockpit a refusé (HTTP ${status}).` };
}
