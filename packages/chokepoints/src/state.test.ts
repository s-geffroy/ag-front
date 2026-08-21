import { describe, it, expect } from 'vitest';
import { stateReading } from './state';
import { ChokepointState } from './schema';
import * as api from './index';

function state(over: Record<string, unknown> = {}) {
  return ChokepointState.parse({
    chokepoint_id: 'p0_x',
    canonical_name: 'X',
    components: {
      regime: { status: 'observed', tension: 50 },
      event_pressure: { status: 'observed', pressure_score: 100, signal_count: 7126 },
      cvi: { status: 'observed', tension: 100, confidence: 60 },
      prediction_consensus: { status: 'observed', tension: 35.5 },
      media_attention: { status: 'no_data' },
      news: { status: 'stale', cluster_count: 4 },
    },
    coverage_pct: 66.7,
    tension_pct: 61.8,
    confidence_pct: 60,
    coverage: { observed: 4, stale: 1, no_data: 1, total: 6, tension_components_used: 3 },
    comparability: 'Per-object reading only.',
    ...over,
  });
}

describe('la lecture d’un état sert les trois chiffres ensemble', () => {
  it('ouvre par la couverture — c’est elle qui dit ce qu’il y a sous les deux autres', () => {
    expect(stateReading(state()).label).toBe(
      'couverture 66,7 % · tension 61,8 % · confiance 60,0 %',
    );
  });

  it('une tension absente s’écrit « — », jamais 0 : aucune composante ne la porte', () => {
    const r = stateReading(state({ tension_pct: null, confidence_pct: null }));
    expect(r.tensionPct).toBeNull();
    expect(r.label).toBe('couverture 66,7 % · tension — · confiance —');
  });
});

describe('une absence n’est pas du calme', () => {
  it('zéro composante observée se dit « nous ne savons rien », pas « tout va bien »', () => {
    const r = stateReading(
      state({
        components: {
          regime: { status: 'no_data' },
          event_pressure: { status: 'no_data' },
          cvi: { status: 'no_data' },
          prediction_consensus: { status: 'no_data' },
          media_attention: { status: 'no_data' },
          news: { status: 'no_data' },
        },
        coverage_pct: 0,
        tension_pct: null,
        confidence_pct: null,
      }),
    );
    expect(r.knowsNothing).toBe(true);
    expect(r.missingComponents).toHaveLength(6);
    expect(r.tensionPct).toBeNull();
  });

  it('une composante périmée reste connue : elle n’est pas un trou', () => {
    const r = stateReading(state());
    expect(r.staleComponents).toEqual(['news']);
    expect(r.missingComponents).toEqual(['media_attention']);
    expect(r.knowsNothing).toBe(false);
  });
});

describe('ce module n’offre aucune clef de tri', () => {
  /**
   * La garde qui compte. Leur `0037` : « nous avons choisi de ne pas vous donner de clé de tri de
   * remplacement plutôt que d’en donner une fausse ». Si quelqu’un exporte un jour un comparateur
   * depuis ce paquet, ce test le nomme — et le nom seul suffit à rouvrir la discussion.
   */
  it('rien de comparable ne sort du paquet', () => {
    const suspects = Object.keys(api).filter((k) => /compare|sort|rank|classe/i.test(k));
    expect(suspects, `exports qui ressemblent à un tri : ${suspects.join(', ')}`).toEqual([]);
  });

  it('l’avertissement de comparabilité voyage avec les chiffres', () => {
    expect(stateReading(state()).comparability).toContain('Per-object');
  });
});
