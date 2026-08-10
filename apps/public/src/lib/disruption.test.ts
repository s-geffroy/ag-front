import { describe, expect, it } from 'vitest';
import type { ChokepointDetail, ChokepointEpisodeOut } from '@ag/chokepoints';
import { durationLabel, episodeIsOngoing, monthsSince, ongoingEpisodes } from './disruption';

const ep = (o: Partial<ChokepointEpisodeOut>): ChokepointEpisodeOut =>
  ({ episode_key: 'k', name: 'n', ...o }) as ChokepointEpisodeOut;

describe('episodeIsOngoing', () => {
  it('accepts the producer’s ongoing spellings', () => {
    for (const s of ['ongoing', 'Ongoing', 'ACTIVE', 'in_progress']) {
      expect(episodeIsOngoing(ep({ status: s }))).toBe(true);
    }
  });

  it('treats an end date as decisive, whatever the status says', () => {
    // A row left `ongoing` by omission but carrying an end date is over. Trusting the status alone
    // would have kept the 2019 Hormuz tanker episode on screen for seven years.
    expect(episodeIsOngoing(ep({ status: 'ongoing', ended_on: '2019-07-19' }))).toBe(false);
    expect(episodeIsOngoing(ep({ status: 'ended', ended_on: '2019-07-19' }))).toBe(false);
  });

  it('does not guess when the status is missing', () => {
    expect(episodeIsOngoing(ep({}))).toBe(false);
    expect(episodeIsOngoing(ep({ status: 'unknown' }))).toBe(false);
  });
});

describe('ongoingEpisodes', () => {
  const detail = (episodes: ChokepointEpisodeOut[]) => ({ episodes }) as ChokepointDetail;

  it('keeps only the live ones, most recent first', () => {
    const out = ongoingEpisodes(
      detail([
        ep({ name: 'vieux', status: 'ongoing', started_on: '2021-01-01' }),
        ep({ name: 'clos', status: 'ended', started_on: '2024-01-01', ended_on: '2024-02-01' }),
        ep({ name: 'récent', status: 'ongoing', started_on: '2023-11-19' }),
      ]),
    );
    expect(out.map((e) => e.name)).toEqual(['récent', 'vieux']);
  });

  it('returns empty rather than throwing on a null detail or absent episodes', () => {
    expect(ongoingEpisodes(null)).toEqual([]);
    expect(ongoingEpisodes({} as ChokepointDetail)).toEqual([]);
  });

  it('is empty for Hormuz as the producer describes it today — the known hole', () => {
    // Regression guard on the reasoning, not on the data: a single ENDED 2019 episode must not
    // produce a banner. The 2026 crisis is invisible here because no episode was opened for it.
    expect(
      ongoingEpisodes(
        detail([
          ep({
            episode_key: 'hormuz_tanker_attacks_2019',
            status: 'ended',
            started_on: '2019-05-12',
            ended_on: '2019-07-19',
          }),
        ]),
      ),
    ).toEqual([]);
  });
});

describe('monthsSince / durationLabel', () => {
  const now = new Date('2026-08-10T00:00:00Z');

  it('counts whole months', () => {
    expect(monthsSince('2023-11-19', now)).toBe(33);
    expect(monthsSince('2026-08-01', now)).toBe(0);
  });

  it('refuses to invent a duration', () => {
    expect(monthsSince(null, now)).toBeNull();
    expect(monthsSince('pas-une-date', now)).toBeNull();
    expect(monthsSince('2027-01-01', now)).toBeNull(); // future start: say nothing
    expect(durationLabel(undefined, now)).toBeNull();
  });

  it('reads naturally at both ends', () => {
    expect(durationLabel('2023-11-19', now)).toBe('depuis 33 mois');
    expect(durationLabel('2026-08-05', now)).toBe('depuis moins d’un mois');
  });
});
