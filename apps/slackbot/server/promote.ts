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

export const PROMOTE_ACTION_ID = 'promote_corridor';
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
  articles: { title: string; url: string; outlet?: string }[];
  eventCategory?: string;
  articleCount?: number;
}

/** Compact label for the cluster picker. Deliberately NOT the model headline. */
export function clusterLabel(c: ClusterChoice): string {
  const n = c.articleCount ?? c.articles.length;
  const cat = c.eventCategory ? c.eventCategory.replace(/_/g, ' ') : 'couverture';
  const first = c.articles[0]?.outlet || c.articles[0]?.title || '';
  const label = `${cat} · ${n} article(s)${first ? ` · ${first}` : ''}`;
  // Slack caps option text at 75 characters and errors on longer.
  return label.length > 75 ? `${label.slice(0, 72)}…` : label;
}

/**
 * The modal. Article titles are rendered as markdown links so the promoter can open them from the
 * modal — the only honest answer to "did you read it" is to make reading one tap away.
 */
export function buildPromoteModal(corridorId: string, clusters: ClusterChoice[]) {
  const options = clusters.slice(0, 100).map((c) => ({
    text: { type: 'plain_text' as const, text: clusterLabel(c) },
    value: c.clusterId,
  }));

  const articleBlocks = clusters.slice(0, 3).flatMap((c) => [
    {
      type: 'context' as const,
      elements: [
        {
          type: 'mrkdwn' as const,
          text: c.articles
            .slice(0, 4)
            .map((a) => `<${a.url}|${a.title.replace(/[<>|]/g, ' ').slice(0, 90)}>`)
            .join('\n'),
        },
      ],
    },
  ]);

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
