import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  CONSENSUS_ATTRIBUTION,
  CONSENSUS_RELIABILITY,
  loadCorridorConsensus,
  corridorNewsSignal,
  newsSignalLabel,
  sortCorridorsByNews,
} from './atlas-data';

// Publication conditions imposed by ag-back's handoff 0018 (`e3518308`) and recorded in ADR 0071:
// mandatory Polymarket attribution + S5 disclaimer carried WITH the aggregate, and honest coverage
// only. The coverage half used to be OUR display allowlist (Panama/Suez hardcoded); since their
// 0.13.0 the ADR 0079 attachment floor is applied SERVER-SIDE and the dedicated 0.15.0 endpoint
// simply returns an empty list for an object no market names or implies. What we must still not get
// wrong is the reading of that empty list: "no market coverage", never an error, never a rendered
// zero — which is what these tests pin.

const PANAMA = 'p0_maritime_canal_panama_canal';
const SUEZ = 'p0_maritime_canal_suez_canal';
// Real corridor, real page. It used to be the corridor the publication allowlist held back; ag-back's
// 0026 §3 lifted that condition in writing, so it is now published on the same terms as any other —
// the floors, not a named list. It serves four families, one of them a 72,5 % on a single market,
// which is precisely what those floors have to catch.
const HORMUZ = 'p0_maritime_strait_strait_of_hormuz';

const CONSENSUS_PAYLOAD = {
  chokepoint_id: PANAMA,
  // Contract 0.18.0 — required, and present even on an empty list, so "nothing to report" can be told
  // apart from "coverage refused".
  minimum_market_count: 2,
  consensus: [
    {
      signal_family: 'infrastructure_capacity_expectation',
      market_count: 29,
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
    stubFetch({
      chokepoint_id: SUEZ,
      minimum_market_count: 2,
      consensus: [],
    });
    // An empty list is an answer, not a failure: no block, no zero, no flat line.
    expect(await loadCorridorConsensus(SUEZ)).toBeNull();
  });

  it('drops a row whose probability is unusable rather than rendering a hole', async () => {
    stubFetch({
      chokepoint_id: PANAMA,
      minimum_market_count: 2,
      consensus: [
        { signal_family: 'disruption_expectation', market_count: 4, consensus_probability: null },
        {
          signal_family: 'regime_change_expectation',
          market_count: 4,
          consensus_probability: 0.0005,
        },
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
      minimum_market_count: 2,
      consensus: [
        {
          signal_family: 'disruption_expectation',
          market_count: 42,
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
      minimum_market_count: 2,
      consensus: [
        {
          signal_family: 'infrastructure_capacity_expectation',
          market_count: 29,
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

// ADR 0072, as amended by ag-back's 0026 §3 — the corridor allowlist is gone, lifted in writing. What
// replaces it is not another list: it is the floors, which are code and are tested. These cases pin
// that the perimeter really did move, rather than quietly disappearing.
describe('perimeter after the allowlist was lifted (ag-back 0026 §3)', () => {
  it('publishes any corridor whose rows clear the floors — including the once-excluded one', async () => {
    expect(await loadCorridorConsensus(PANAMA)).not.toBeNull();
    expect(await loadCorridorConsensus(SUEZ)).not.toBeNull();
    // Hormuz was the corridor condition 2 held back. It is now on the same terms as the others.
    expect(await loadCorridorConsensus(HORMUZ)).not.toBeNull();
    expect(fetchCalls).toHaveLength(3);
  });

  it('still refuses an unlabelled family, on any corridor — that list is ours and it stays closed', async () => {
    // Hormuz's real 72,5 % is `perception_watch`. ag-back's floor only caught it by accident of its
    // cardinality, as they say themselves; what actually holds it is CONSENSUS_FAMILY_LABELS.
    stubFetch({
      chokepoint_id: HORMUZ,
      minimum_market_count: 2,
      consensus: [
        {
          signal_family: 'perception_watch',
          market_count: 12,
          consensus_probability: 0.725,
          attachment_rules: ['named_or_implied'],
        },
      ],
    });
    expect(await loadCorridorConsensus(HORMUZ)).toBeNull();
  });

  it('refuses a payload that declares no floor at all — contract 0.18.0 guarantees the field', async () => {
    stubFetch({ chokepoint_id: PANAMA, consensus: [] });
    expect(await loadCorridorConsensus(PANAMA)).toBeNull();
  });
});

describe('cardinality floor N=2 (ADR 0072, arbitrating ag-back 0024 §2 / 0025 §4)', () => {
  it('refuses a single-market row — "consensus" must not title one quotation', async () => {
    stubFetch({
      chokepoint_id: PANAMA,
      minimum_market_count: 2,
      consensus: [
        {
          signal_family: 'infrastructure_capacity_expectation',
          market_count: 1,
          consensus_probability: 0.032,
          attachment_rules: ['named_or_implied'],
        },
      ],
    });
    // This is the live Panama row of 2026-08-10: its whole block goes away, and that is the point.
    expect(await loadCorridorConsensus(PANAMA)).toBeNull();
  });

  it('refuses a row that omits market_count — silence is not a count', async () => {
    stubFetch({
      chokepoint_id: PANAMA,
      minimum_market_count: 2,
      consensus: [
        { signal_family: 'disruption_expectation', consensus_probability: 0.42 },
        { signal_family: 'regime_change_expectation', consensus_probability: 0.1 },
      ],
    });
    expect(await loadCorridorConsensus(PANAMA)).toBeNull();
  });

  it('keeps the aggregated families and drops only the thin ones', async () => {
    stubFetch({
      chokepoint_id: SUEZ,
      minimum_market_count: 2,
      consensus: [
        {
          signal_family: 'infrastructure_capacity_expectation',
          market_count: 29,
          consensus_probability: 0.4627,
          observed_window_end: '2026-08-10T06:04:24Z',
        },
        {
          signal_family: 'disruption_expectation',
          market_count: 1,
          consensus_probability: 0.005,
          observed_window_end: '2026-08-01T06:03:42Z',
        },
      ],
    });
    const c = await loadCorridorConsensus(SUEZ);
    expect(c?.families.map((f) => f.signalFamily)).toEqual(['infrastructure_capacity_expectation']);
    // The stamp follows the rows we kept — the dropped 2026-08-01 row must not date the block.
    expect(c?.observedAt).toBe('2026-08-10T06:04:24Z');
  });
});

describe('closed list of publishable families', () => {
  it('refuses a family we have no French label for', async () => {
    stubFetch({
      chokepoint_id: PANAMA,
      minimum_market_count: 2,
      consensus: [
        {
          signal_family: 'perception_watch',
          market_count: 12,
          consensus_probability: 0.725,
          attachment_rules: ['named_or_implied'],
        },
      ],
    });
    // Live on Hormuz today at 72,5 %. `humanize()` would have published it as "Perception watch": a
    // family with no label is a family whose presentation we have not decided.
    expect(await loadCorridorConsensus(PANAMA)).toBeNull();
  });
});

describe('freshness stamp = the OLDEST window kept (never a promise of freshness)', () => {
  it('dates the block by its stalest published row, whatever the serving order', async () => {
    stubFetch({
      chokepoint_id: PANAMA,
      minimum_market_count: 2,
      consensus: [
        {
          signal_family: 'infrastructure_capacity_expectation',
          market_count: 30,
          consensus_probability: 0.18,
          observed_window_end: '2026-08-10T06:04:24Z',
        },
        {
          signal_family: 'disruption_expectation',
          market_count: 45,
          consensus_probability: 0.17,
          observed_window_end: '2026-08-01T06:03:42Z',
        },
      ],
    });
    const c = await loadCorridorConsensus(PANAMA);
    expect(c?.families).toHaveLength(2);
    expect(c?.observedAt).toBe('2026-08-01T06:03:42Z');
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

describe('corridorNewsSignal — un signal qui ne s’éteint pas cesse d’en être un', () => {
  const HORMUZ = 'p0_maritime_strait_strait_of_hormuz';
  // Le magasin réel porte une promotion du 2026-08-11 : les dates ci-dessous sont relatives à elle.
  const promotedDay = new Date('2026-08-11T21:00:00Z');

  it('signale une promotion récente, et rend sa date', () => {
    const s = corridorNewsSignal(HORMUZ, promotedDay);
    expect(s).not.toBeNull();
    expect(newsSignalLabel(s!.promotedAt)).toBe('11 août');
  });

  it('tient exactement 21 jours, puis se tait', () => {
    expect(corridorNewsSignal(HORMUZ, new Date('2026-09-01T00:00:00Z'))).not.toBeNull();
    expect(corridorNewsSignal(HORMUZ, new Date('2026-09-03T00:00:00Z'))).toBeNull();
  });

  it('ne signale rien pour un corridor jamais promu — ce qui ne veut pas dire « calme »', () => {
    expect(corridorNewsSignal('p0_maritime_canal_panama_canal', promotedDay)).toBeNull();
  });

  it('ne rend pas de libellé pour une date illisible plutôt que d’en inventer une', () => {
    expect(newsSignalLabel('pas-une-date')).toBe('');
  });
});

describe('sortCorridorsByNews — une tête de liste, pas une réorganisation', () => {
  const HORMUZ = 'p0_maritime_strait_strait_of_hormuz';
  const at = new Date('2026-08-12T09:00:00Z');
  const items = [
    { id: 'p0_a', priority: 'P0', name: 'Alpha' },
    { id: HORMUZ, priority: 'P0', name: 'Zulu' },
    { id: 'p2_b', priority: 'P2', name: 'Bravo' },
  ];

  it('met en tête le corridor porteur d’actualité, même s’il finissait la liste', () => {
    expect(sortCorridorsByNews(items, at).map((c) => c.id)[0]).toBe(HORMUZ);
  });

  it('laisse les autres exactement dans leur ordre habituel', () => {
    expect(sortCorridorsByNews(items, at).map((c) => c.id)).toEqual([HORMUZ, 'p0_a', 'p2_b']);
  });

  it('rend l’ordre habituel quand plus aucune actualité n’est fraîche', () => {
    const vieux = new Date('2026-10-01T00:00:00Z');
    expect(sortCorridorsByNews(items, vieux).map((c) => c.id)).toEqual(['p0_a', HORMUZ, 'p2_b']);
  });

  it('ne modifie pas le tableau reçu', () => {
    const copie = items.map((c) => c.id);
    sortCorridorsByNews(items, at);
    expect(items.map((c) => c.id)).toEqual(copie);
  });
});

describe('sortCorridorsByNews — aucun rang de gravité', () => {
  // RÉGRESSION 2026-08-13. Un tri par `regime.pressure_score` classait cette page ; le producteur
  // l'a désavoué (échange 0033) : la magnitude du score suit le volume de LEUR collecte, donc le
  // classement s'inverse sur un corridor sous-collecté sans que rien ne le signale. Ces tests
  // fixent qu'aucun rang de gravité ne revient par la porte de derrière : à actualité égale, seuls
  // la classe de priorité puis le nom départagent.
  const HORMUZ = 'p0_maritime_strait_strait_of_hormuz';
  const at = new Date('2026-08-12T09:00:00Z');
  const items = [
    { id: 'z_zoulou', priority: 'P0', name: 'Zoulou' },
    { id: 'a_alpha', priority: 'P0', name: 'Alpha' },
    { id: 'b_bravo', priority: 'P0', name: 'Bravo' },
    { id: HORMUZ, priority: 'P0', name: 'Zulu actualité' },
  ];

  it('classe par actualité puis par nom, sans autre critère', () => {
    expect(sortCorridorsByNews(items, at).map((c) => c.id)).toEqual([
      HORMUZ, // 1. seule l'actualité fait une tête de liste
      'a_alpha', // 2. puis l'alphabétique, à priorité égale
      'b_bravo',
      'z_zoulou',
    ]);
  });

  it('n’accepte plus de troisième argument de classement', () => {
    expect(sortCorridorsByNews.length).toBe(1);
  });

  it('la priorité départage avant le nom', () => {
    const mixte = [
      { id: 'p2_a', priority: 'P2', name: 'Alpha' },
      { id: 'p0_z', priority: 'P0', name: 'Zoulou' },
    ];
    expect(sortCorridorsByNews(mixte, at).map((c) => c.id)).toEqual(['p0_z', 'p2_a']);
  });
});
