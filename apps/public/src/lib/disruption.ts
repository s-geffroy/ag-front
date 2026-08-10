/**
 * Ongoing disruption, read off the producer's own episode layer.
 *
 * WHY THIS EXISTS. The chokepoint pages already rendered `episodes`, but as a flat list near the
 * bottom of the page: an `Ongoing` high-severity crisis printed exactly like an `Ended` 2021
 * grounding, three lines below it. A reader scanning the page saw history, not a live state.
 *
 * WHAT THIS IS NOT. It is not a deviation detector. We considered flagging a chokepoint whose recent
 * transit metric departs from its own baseline — but the read API exposes one period per call, so we
 * hold no history to compare against, and comparing across objects is meaningless (Malacca legitimately
 * runs two orders of magnitude above a small strait). Rather than invent a heuristic that would
 * mislabel small chokepoints, this surfaces the signal the producer actually authors.
 *
 * THE KNOWN HOLE. That signal is only as good as their episode layer. On 2026-08-10 the Strait of
 * Hormuz carried a single episode — `hormuz_tanker_attacks_2019`, ended — while their own PortWatch
 * metric reported 2.5 transits/day for 2026-08 against 230.5 at Malacca. A five-month crisis with no
 * episode. Reported upstream (ADR 0067); this module cannot compensate for it, and must not pretend to.
 */

import type { ChokepointDetail, ChokepointEpisodeOut } from '@ag/chokepoints';

/** Episode statuses the producer uses for "still happening". Compared case-insensitively. */
const ONGOING = new Set(['ongoing', 'active', 'in_progress']);

export function episodeIsOngoing(e: ChokepointEpisodeOut): boolean {
  // An explicit end date wins over the status string: a row can be left `ongoing` by omission.
  if (e.ended_on) return false;
  return ONGOING.has(String(e.status ?? '').toLowerCase());
}

/**
 * The ongoing episodes worth hoisting to the top of the page, most recent first.
 * Empty when the object is calm — or when the producer has not opened an episode for what is
 * happening to it, which is not the same thing and is why the page never claims "no disruption".
 */
export function ongoingEpisodes(detail: ChokepointDetail | null): ChokepointEpisodeOut[] {
  if (!detail) return [];
  return (detail.episodes ?? [])
    .filter(episodeIsOngoing)
    .slice()
    .sort((a, b) => String(b.started_on ?? '').localeCompare(String(a.started_on ?? '')));
}

/** Whole months elapsed since `iso`, or null when the date is missing or unparseable. */
export function monthsSince(iso: string | null | undefined, now: Date): number | null {
  if (!iso) return null;
  const start = new Date(iso);
  if (Number.isNaN(start.getTime())) return null;
  const months =
    (now.getFullYear() - start.getFullYear()) * 12 + (now.getMonth() - start.getMonth());
  return months >= 0 ? months : null;
}

/** « depuis 21 mois » / « depuis 1 mois » / null when we cannot say. Duration is the point: an
 *  episode running for years is a structural state, not a news item. */
export function durationLabel(iso: string | null | undefined, now: Date): string | null {
  const m = monthsSince(iso, now);
  if (m === null) return null;
  if (m < 1) return 'depuis moins d’un mois';
  return `depuis ${m} mois`;
}
