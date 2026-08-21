/**
 * La pulsation — ce qui remplace le digest du lundi.
 *
 * SA FONCTION N'EST PAS D'INFORMER, C'EST D'ÊTRE LÀ. Le flux au fil de l'eau ne parle que quand il a
 * quelque chose à dire ; son silence est donc ambigu — « rien à signaler » ou « le sondeur est
 * mort » ? La pulsation part tous les deux jours, y compris quand tout est vide, et c'est son
 * absence à elle qui devient le signal. Le sondeur horaire, lui, n'alerte pas : vingt-quatre
 * messages pour une panne d'une journée feraient taire le canal.
 */

import { describe, expect, it } from 'vitest';
import {
  POLL_LATE_AFTER_HOURS,
  buildPulseMessage,
  pollAgeHours,
  pulseAlarms,
  shouldPulse,
  type PulseState,
} from './pulse.js';

const NOW = new Date('2026-08-21T09:00:00.000Z');

function state(over: Partial<PulseState> = {}): PulseState {
  return {
    feed: 'ok',
    servedAtScope: 12,
    announcedSince: 4,
    promotedSince: 1,
    promotedTotal: 3,
    promotedCorridors: 2,
    pollAgeHours: 0.5,
    runNotes: [],
    sinceLabel: 'depuis le 19/08',
    ...over,
  };
}

describe('shouldPulse — tous les deux jours, sans le piège du quantième', () => {
  it('part quand aucune pulsation n’a jamais eu lieu', () => {
    expect(shouldPulse(undefined, NOW)).toBe(true);
  });

  it('ne repart pas le lendemain', () => {
    expect(shouldPulse('2026-08-20T09:00:00.000Z', NOW)).toBe(false);
  });

  it('repart au bout de deux jours', () => {
    expect(shouldPulse('2026-08-19T08:30:00.000Z', NOW)).toBe(true);
  });

  it("part quand l'horodatage est illisible, plutôt que de se taire", () => {
    expect(shouldPulse('pas une date', NOW)).toBe(true);
  });
});

describe('pollAgeHours — depuis quand le sondeur n’a plus rien écrit', () => {
  it('compte les heures depuis la dernière écriture du registre', () => {
    expect(pollAgeHours(new Date('2026-08-21T06:00:00.000Z'), NOW)).toBe(3);
  });

  it('rend null quand le registre n’existe pas — jamais zéro, qui voudrait dire « à l’instant »', () => {
    expect(pollAgeHours(null, NOW)).toBeNull();
  });
});

describe('pulseAlarms — ce qui doit crier, et ce qui ne doit pas', () => {
  it('se tait quand tout va bien, même une période sans promotion', () => {
    expect(pulseAlarms(state({ promotedSince: 0 }))).toEqual([]);
  });

  it('crie quand le sondeur horaire n’a plus écrit depuis des heures', () => {
    expect(pulseAlarms(state({ pollAgeHours: POLL_LATE_AFTER_HOURS + 1 }))[0]).toMatch(/sondeur/i);
  });

  it('crie quand le sondeur n’a JAMAIS tourné', () => {
    expect(pulseAlarms(state({ pollAgeHours: null }))).toHaveLength(1);
  });

  it('distingue un flux vide HONNÊTE d’une agrégation qui n’a jamais tourné', () => {
    expect(pulseAlarms(state({ feed: 'empty_honest' }))).toEqual([]);
    expect(pulseAlarms(state({ feed: 'never_ran' }))[0]).toMatch(/n'a pas tourné|jamais tourné/i);
    expect(pulseAlarms(state({ feed: 'unreachable' }))).toHaveLength(1);
  });

  it('cumule les alarmes au lieu de n’en montrer qu’une', () => {
    expect(pulseAlarms(state({ feed: 'never_ran', pollAgeHours: null }))).toHaveLength(2);
  });
});

describe('buildPulseMessage — elle part même quand il n’y a rien à dire', () => {
  it('produit un message sur une période entièrement vide', () => {
    const m = buildPulseMessage(
      state({ servedAtScope: 0, announcedSince: 0, promotedSince: 0, promotedTotal: 0 }),
    );
    expect(m.text.length).toBeGreaterThan(0);
    expect(JSON.stringify(m.blocks)).toContain('0');
  });

  it('fait voyager les run_notes — le contrat exige qu’elles soient rendues', () => {
    const m = buildPulseMessage(state({ runNotes: ['bulk cap: 529 articles écartés'] }));
    expect(JSON.stringify(m.blocks)).toContain('bulk cap');
  });

  it('met l’alarme dans le TEXTE de notification, pas seulement dans les blocs', () => {
    const m = buildPulseMessage(state({ pollAgeHours: null }));
    expect(m.text).toMatch(/⚠|alarme|sondeur/i);
  });

  it('ne prétend pas qu’une absence de promotion est un problème', () => {
    const m = buildPulseMessage(state({ promotedSince: 0 }));
    expect(m.text).not.toMatch(/⚠/);
  });
});
