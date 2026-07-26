import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  CONSENSUS_ATTRIBUTION,
  CONSENSUS_PUBLIC_ALLOWLIST,
  CONSENSUS_RELIABILITY,
  loadCorridorConsensus,
} from './atlas-data';

// Publication conditions imposed by ag-back's handoff 0018 (`e3518308`) and recorded in ADR 0071:
// (a) mandatory Polymarket attribution + S5 disclaimer carried WITH the aggregate, and (b) publish
// Panama and Suez ONLY — their consensus engine does not yet apply the ADR 0079 `ATTACH_FLOOR=2`, so
// every other corridor's rows are retained 12 %-precision attachment noise, not market coverage.
// These tests are the machine guard on conditions we do not get to relax unilaterally.

const PANAMA = 'p0_maritime_canal_panama_canal';
const SUEZ = 'p0_maritime_canal_suez_canal';
// Real corridor, real rows served by the API — and exactly the noise we must NOT publish.
const HORMUZ = 'p0_maritime_strait_strait_of_hormuz';

const ANALYSIS_WITH_CONSENSUS = {
  chokepoint_id: PANAMA,
  engines: [
    { key: 'criticality_score', columns: ['a'], rows: [[1]] },
    {
      key: 'prediction_consensus',
      title: 'Polymarket P3 perception consensus (uncleared source)',
      columns: [
        'signal_family',
        'market_count',
        'consensus_probability',
        'max_probability_change_24h',
        'total_liquidity',
      ],
      rows: [
        {
          signal_family: 'infrastructure_capacity_expectation',
          market_count: 1,
          consensus_probability: 0.038,
          max_probability_change_24h: -0.012,
          total_liquidity: 31803.22356,
          observed_window_end: '2026-07-26T06:00:00Z',
        },
      ],
    },
  ],
  relations: [],
  claims: [],
};

let fetchCalls: string[] = [];
const originalFetch = globalThis.fetch;

function stubFetch(payload: unknown): void {
  globalThis.fetch = (async (url: string | URL) => {
    fetchCalls.push(String(url));
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'content-type': 'application/json' },
    });
  }) as typeof fetch;
}

beforeEach(() => {
  fetchCalls = [];
  process.env.CHOKEPOINTS_API_URL = 'https://host/api';
  process.env.CHOKEPOINTS_API_TOKEN = 'test-token';
  process.env.ATLAS_CONSENSUS_PUBLIC = '1';
  stubFetch(ANALYSIS_WITH_CONSENSUS);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.ATLAS_CONSENSUS_PUBLIC;
  delete process.env.CHOKEPOINTS_API_URL;
  delete process.env.CHOKEPOINTS_API_TOKEN;
});

describe('loadCorridorConsensus — Panama/Suez publication allowlist (ADR 0071, ag-back 0018)', () => {
  it('publishes an allowlisted corridor (Panama)', async () => {
    const c = await loadCorridorConsensus(PANAMA);
    expect(c?.families).toHaveLength(1);
    expect(c?.families[0]!.signalFamily).toBe('infrastructure_capacity_expectation');
    expect(c?.observedAt).toBe('2026-07-26T06:00:00Z');
  });

  it('publishes the other allowlisted corridor (Suez)', async () => {
    expect(await loadCorridorConsensus(SUEZ)).not.toBeNull();
  });

  it('returns null for a NON-allowlisted corridor even though the API serves rows for it', async () => {
    expect(await loadCorridorConsensus(HORMUZ)).toBeNull();
  });

  it('does not even call the API for a non-allowlisted corridor', async () => {
    await loadCorridorConsensus(HORMUZ);
    expect(fetchCalls).toEqual([]);
  });

  it('holds EXACTLY Panama and Suez — widening it is an ag-back decision, not ours', () => {
    expect([...CONSENSUS_PUBLIC_ALLOWLIST].sort()).toEqual([PANAMA, SUEZ].sort());
  });

  it('stays dark when the go-live flag is unset, allowlisted or not', async () => {
    delete process.env.ATLAS_CONSENSUS_PUBLIC;
    expect(await loadCorridorConsensus(PANAMA)).toBeNull();
    expect(fetchCalls).toEqual([]);
  });

  it('degrades gracefully when the API fails, without throwing', async () => {
    globalThis.fetch = (async () => new Response('nope', { status: 500 })) as typeof fetch;
    expect(await loadCorridorConsensus(PANAMA)).toBeNull();
  });
});

describe('mandatory attribution + S5 disclaimer (ag-back 0018 §1)', () => {
  it('names Polymarket explicitly — attribution is mandatory, not optional', () => {
    expect(CONSENSUS_ATTRIBUTION.source).toBe('Polymarket');
    expect(CONSENSUS_ATTRIBUTION.text).toMatch(/Polymarket/);
    expect(CONSENSUS_ATTRIBUTION.url).toMatch(/^https:\/\/polymarket\.com/);
  });

  it('carries the S5 / low-reliability disclaimer', () => {
    expect(CONSENSUS_RELIABILITY.grade).toBe('S5');
    expect(CONSENSUS_RELIABILITY.text.toLowerCase()).toContain('faible');
  });

  it('frames the aggregate as anticipation, never as event evidence', () => {
    const blob = `${CONSENSUS_RELIABILITY.text} ${CONSENSUS_ATTRIBUTION.text}`.toLowerCase();
    expect(blob).toMatch(/anticipation/);
    expect(blob).toMatch(/ni une preuve|jamais une preuve/);
  });
});
