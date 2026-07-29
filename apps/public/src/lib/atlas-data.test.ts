import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { CONSENSUS_ATTRIBUTION, CONSENSUS_RELIABILITY, loadCorridorConsensus } from './atlas-data';

// Publication conditions imposed by ag-back's handoff 0018 (`e3518308`) and recorded in ADR 0071:
// mandatory Polymarket attribution + S5 disclaimer carried WITH the aggregate, and honest coverage
// only. The coverage half used to be OUR display allowlist (Panama/Suez hardcoded); since their
// 0.13.0 the ADR 0079 attachment floor is applied SERVER-SIDE and the dedicated 0.15.0 endpoint
// simply returns an empty list for an object no market names or implies. What we must still not get
// wrong is the reading of that empty list: "no market coverage", never an error, never a rendered
// zero — which is what these tests pin.

const PANAMA = 'p0_maritime_canal_panama_canal';
// Real corridor, real page — and no honest market coverage: the API answers 200 + [].
const HORMUZ = 'p0_maritime_strait_strait_of_hormuz';

const CONSENSUS_PAYLOAD = {
  chokepoint_id: PANAMA,
  consensus: [
    {
      signal_family: 'infrastructure_capacity_expectation',
      market_count: 1,
      consensus_probability: 0.038,
      max_probability_change_24h: -0.012,
      total_liquidity: 31803.22356,
      observed_window_end: '2026-07-26T06:00:00Z',
    },
  ],
  disclaimer: 'liquidity-weighted crowd anticipation, NOT event evidence…',
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
  stubFetch(CONSENSUS_PAYLOAD);
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  delete process.env.ATLAS_CONSENSUS_PUBLIC;
  delete process.env.CHOKEPOINTS_API_URL;
  delete process.env.CHOKEPOINTS_API_TOKEN;
});

describe('loadCorridorConsensus — dedicated 0.15.0 endpoint (ADR 0071, ag-back 0020/0021)', () => {
  it('publishes a corridor the producer covers (Panama)', async () => {
    const c = await loadCorridorConsensus(PANAMA);
    expect(c?.families).toHaveLength(1);
    expect(c?.families[0]!.signalFamily).toBe('infrastructure_capacity_expectation');
    expect(c?.observedAt).toBe('2026-07-26T06:00:00Z');
  });

  it('reads the narrow endpoint, never /analysis', async () => {
    await loadCorridorConsensus(PANAMA);
    expect(fetchCalls).toHaveLength(1);
    expect(fetchCalls[0]).toContain('/prediction-consensus');
    expect(fetchCalls[0]).not.toContain('/analysis');
  });

  it('renders NOTHING when the producer reports no honest coverage (200 + [])', async () => {
    stubFetch({ chokepoint_id: HORMUZ, consensus: [] });
    // An empty list is an answer, not a failure: no block, no zero, no flat line.
    expect(await loadCorridorConsensus(HORMUZ)).toBeNull();
  });

  it('drops a row whose probability is unusable rather than rendering a hole', async () => {
    stubFetch({
      chokepoint_id: PANAMA,
      consensus: [
        { signal_family: 'disruption_expectation', consensus_probability: null },
        { signal_family: 'regime_change_expectation', consensus_probability: 0.0005 },
      ],
    });
    const c = await loadCorridorConsensus(PANAMA);
    expect(c?.families).toHaveLength(1);
    expect(c?.families[0]!.signalFamily).toBe('regime_change_expectation');
  });

  // 0.16.0 `attachment_rules` (ag-back 0022 §4). They committed to warning us before `llm_implied`
  // enters the served aggregate; this pins that the page does not depend on the warning arriving.
  it('refuses a row not summed under named_or_implied, and its observed-at stamp with it', async () => {
    stubFetch({
      chokepoint_id: PANAMA,
      consensus: [
        {
          signal_family: 'disruption_expectation',
          consensus_probability: 0.42,
          observed_window_end: '2026-08-01T06:00:00Z',
          attachment_rules: ['llm_implied'],
        },
      ],
    });
    expect(await loadCorridorConsensus(PANAMA)).toBeNull();
  });

  it('publishes a row that states named_or_implied', async () => {
    stubFetch({
      chokepoint_id: PANAMA,
      consensus: [
        {
          signal_family: 'infrastructure_capacity_expectation',
          consensus_probability: 0.038,
          observed_window_end: '2026-07-26T06:00:00Z',
          attachment_rules: ['named_or_implied'],
        },
      ],
    });
    const c = await loadCorridorConsensus(PANAMA);
    expect(c?.families).toHaveLength(1);
    expect(c?.observedAt).toBe('2026-07-26T06:00:00Z');
  });

  it('stays dark when the go-live flag is unset', async () => {
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
