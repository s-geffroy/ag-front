import { describe, it, expect } from 'vitest';
import { createChokepointsClient, ChokepointsApiError } from './client';
import {
  SfuCompletenessOut,
  consensusRowIsPublishable,
  consensusRowMeetsCardinalityFloor,
  signalAttachmentRuleIsReviewed,
} from './schema';

function jsonResponse(body: unknown, status = 200): Response {
  return { ok: status < 400, status, json: async () => body } as unknown as Response;
}

describe('chokepoints client', () => {
  it('parses a list and never requests tainted records (read scope only)', async () => {
    let calledUrl = '';
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async (url) => {
        calledUrl = String(url);
        return jsonResponse({
          count: 1,
          attribution_notice: 'notice',
          items: [
            { id: 'p0_maritime_x', canonical_name: 'Détroit X', required_attributions: ['Src'] },
          ],
        });
      },
    });

    const list = await client.listChokepoints({ limit: 50, priority_class: 'P0' });
    expect(list.items[0]!.canonical_name).toBe('Détroit X');
    expect(list.items[0]!.required_attributions).toEqual(['Src']);
    expect(calledUrl).toContain('/chokepoints');
    expect(calledUrl).toContain('priority_class=P0');
    expect(calledUrl).not.toContain('include_tainted');
  });

  it('sends include_tainted=true only when explicitly opted in', async () => {
    let calledUrl = '';
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      includeTainted: true,
      fetchImpl: async (url) => {
        calledUrl = String(url);
        return jsonResponse({ items: [] });
      },
    });
    await client.listChokepoints();
    expect(calledUrl).toContain('include_tainted=true');
  });

  it('exportGeoJson never sends include_tainted, even on a tainted client', async () => {
    let calledUrl = '';
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      includeTainted: true, // tainted client…
      fetchImpl: async (url) => {
        calledUrl = String(url);
        return jsonResponse({ type: 'FeatureCollection', features: [] });
      },
    });
    await client.exportGeoJson();
    expect(calledUrl).toContain('/exports/geojson');
    expect(calledUrl).not.toContain('include_tainted'); // …export is structurally clear-only
  });

  it('exportGeoJson strips restricted feature properties (public-safe allowlist)', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      includeTainted: true,
      fetchImpl: async () =>
        jsonResponse({
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [0, 0] },
              properties: {
                id: 'p0_x',
                name: 'Détroit X',
                priority: 'P0',
                license_taint: true, // restricted — must be dropped
                max_license_risk: 'high', // restricted — must be dropped
                internal_note: 'secret', // unknown — must be dropped
              },
            },
          ],
        }),
    });
    const fc = await client.exportGeoJson();
    const props = fc.features[0]!.properties!;
    expect(props.id).toBe('p0_x');
    expect(props.name).toBe('Détroit X');
    expect(props.priority).toBe('P0');
    expect(props).not.toHaveProperty('license_taint');
    expect(props).not.toHaveProperty('max_license_risk');
    expect(props).not.toHaveProperty('internal_note');
  });

  it('throws on a non-200 response', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () => jsonResponse({}, 401),
    });
    await expect(client.listChokepoints()).rejects.toThrow();
  });
});

function textResponse(body: string, status = 200): Response {
  return { ok: status < 400, status, text: async () => body } as unknown as Response;
}

describe('chokepoints client — v0.2.0 additive surface', () => {
  it('by-flow returns an array of summaries with importance_score', async () => {
    let calledUrl = '';
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async (url) => {
        calledUrl = String(url);
        return jsonResponse([
          { id: 'p0_maritime_strait_x', canonical_name: 'Détroit X', importance_score: 0.9 },
        ]);
      },
    });
    const rows = await client.chokepointsByFlow('crude_oil');
    expect(calledUrl).toContain('/chokepoints/by-flow/crude_oil');
    expect(rows[0]!.importance_score).toBe(0.9);
  });

  it('parses the typed analysis envelope', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse({
          chokepoint_id: 'p0_x',
          disclaimer: 'derived',
          engines: [{ key: 'criticality_score', columns: ['a'], rows: [[1]] }],
          relations: [],
          claims: [],
        }),
    });
    const a = await client.getChokepointAnalysis('p0_x');
    expect(a.engines[0]!.key).toBe('criticality_score');
  });

  // 0.15.0 — the dedicated consensus endpoint replaces the /analysis projection (ADR 0071). It is the
  // narrow, redistributable surface: a `read`-scope consumer no longer has to fetch engines/relations/
  // claims to reach the one block it may publish.
  it('getChokepointPredictionConsensus reads the dedicated endpoint, not /analysis', async () => {
    let calledUrl = '';
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async (url) => {
        calledUrl = String(url);
        return jsonResponse({
          chokepoint_id: 'p0_maritime_canal_suez_canal',
          consensus: [
            {
              signal_family: 'disruption_expectation',
              market_count: 1,
              consensus_probability: 0.0135,
              max_probability_change_24h: -0.0225,
              total_liquidity: 2112.38,
              observed_window_end: '2026-07-26T06:00:18Z',
            },
          ],
          disclaimer: 'liquidity-weighted crowd anticipation, NOT event evidence…',
        });
      },
    });
    const res = await client.getChokepointPredictionConsensus('p0_maritime_canal_suez_canal');
    expect(calledUrl).toContain('/chokepoints/p0_maritime_canal_suez_canal/prediction-consensus');
    expect(calledUrl).not.toContain('/analysis');
    expect(res.consensus).toHaveLength(1);
    expect(res.consensus[0]!.signal_family).toBe('disruption_expectation');
    // 0.14.0 additive column — the honest "consensus au <date>" label.
    expect(res.consensus[0]!.observed_window_end).toBe('2026-07-26T06:00:18Z');
  });

  // ADR 0079 floor, applied server-side since 0.13.0: an object no market names or implies yields an
  // EMPTY list with a 200 — "no market coverage", never an error and never a zero to display.
  it('getChokepointPredictionConsensus returns an empty list (not a 404) with no coverage', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse({ chokepoint_id: 'p0_maritime_strait_strait_of_hormuz', consensus: [] }),
    });
    const res = await client.getChokepointPredictionConsensus(
      'p0_maritime_strait_strait_of_hormuz',
    );
    expect(res.consensus).toEqual([]);
    expect(res.chokepoint_id).toBe('p0_maritime_strait_strait_of_hormuz');
  });

  // 0.16.0 — `attachment_rules` is an array_agg over the rows actually summed, so it can be CHECKED.
  // The gate is fail-closed: only `named_or_implied` may become a number a reader sees.
  it('consensusRowIsPublishable accepts named_or_implied and refuses anything else', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse({
          chokepoint_id: 'p0_x',
          consensus: [
            { signal_family: 'ok', attachment_rules: ['named_or_implied'] },
            { signal_family: 'llm', attachment_rules: ['llm_implied'] },
            { signal_family: 'mixed', attachment_rules: ['named_or_implied', 'llm_implied'] },
            { signal_family: 'history', attachment_rules: ['full_text'] },
            { signal_family: 'unknown_future_rule', attachment_rules: ['whatever_comes_next'] },
          ],
        }),
    });
    const { consensus } = await client.getChokepointPredictionConsensus('p0_x');
    expect(consensus.filter(consensusRowIsPublishable).map((r) => r.signal_family)).toEqual(['ok']);
  });

  // Back-compat with 0.15.0 payloads: the producer did not report the rule at all, and the ADR 0079
  // floor has been server-side since 0.13.0. Absent ≠ disqualifying — but it is not evidence either.
  it('consensusRowIsPublishable tolerates a row that omits attachment_rules', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse({ chokepoint_id: 'p0_x', consensus: [{ signal_family: 'legacy' }] }),
    });
    const { consensus } = await client.getChokepointPredictionConsensus('p0_x');
    expect(consensus[0]!.attachment_rules).toEqual([]);
    expect(consensus.every(consensusRowIsPublishable)).toBe(true);
  });

  // ADR 0072 — cardinality floor. ag-back measured (their 0025 §4) that four of the ten served rows
  // rest on a SINGLE market, including both of our public lines: "consensus" titling one quote.
  // Deliberately a SECOND predicate rather than a clause inside the first: an unrecognised attachment
  // rule and a single quotation are two different refusals, and a reader of a dropped row must be able
  // to tell which one fired.
  it('consensusRowMeetsCardinalityFloor refuses a single-market row and keeps N ≥ 2', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse({
          chokepoint_id: 'p0_x',
          consensus: [
            { signal_family: 'single', market_count: 1 },
            { signal_family: 'pair', market_count: 2 },
            { signal_family: 'many', market_count: 74 },
            { signal_family: 'zero', market_count: 0 },
          ],
        }),
    });
    const { consensus } = await client.getChokepointPredictionConsensus('p0_x');
    expect(consensus.filter(consensusRowMeetsCardinalityFloor).map((r) => r.signal_family)).toEqual(
      ['pair', 'many'],
    );
  });

  // Fail-closed, and this is where the floor DIFFERS from `attachment_rules` (tolerated when absent,
  // for a documented historical reason): a row that does not state its cardinality cannot clear a
  // cardinality floor. Silence is not a count.
  it('consensusRowMeetsCardinalityFloor refuses a row that omits market_count', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse({
          chokepoint_id: 'p0_x',
          consensus: [{ signal_family: 'silent' }, { signal_family: 'null', market_count: null }],
        }),
    });
    const { consensus } = await client.getChokepointPredictionConsensus('p0_x');
    expect(consensus.some(consensusRowMeetsCardinalityFloor)).toBe(false);
  });

  // 0.17.0 — `attachment_rule` on the two RAW surfaces. Not a filter: these land on internal screens
  // where a rule nobody has reviewed must be seen, not hidden (ag-back 0023 §4/§6).
  it('signalAttachmentRuleIsReviewed flags an unreviewed rule and tolerates pre-0.17.0 silence', () => {
    expect(signalAttachmentRuleIsReviewed({ attachment_rule: 'name_match' })).toBe(true);
    expect(signalAttachmentRuleIsReviewed({})).toBe(true);
    expect(signalAttachmentRuleIsReviewed({ attachment_rule: null })).toBe(true);
    expect(signalAttachmentRuleIsReviewed({ attachment_rule: 'llm_implied' })).toBe(false);
    expect(signalAttachmentRuleIsReviewed({ attachment_rule: 'whatever_comes_next' })).toBe(false);
  });

  it('parses attachment_rule on the raw event-signal surface (0.17.0)', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse([
          { chokepoint_id: 'p0_x', domain: 'media', attachment_rule: 'name_match' },
          { chokepoint_id: 'p0_x', domain: 'media' },
        ]),
    });
    const rows = await client.getChokepointEventSignals('p0_x', 20);
    expect(rows[0]!.attachment_rule).toBe('name_match');
    expect(rows[1]!.attachment_rule ?? null).toBeNull();
  });

  it('getChokepointPredictionConsensus tolerates the omitted `consensus` key', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () => jsonResponse({ chokepoint_id: 'p0_x' }),
    });
    expect((await client.getChokepointPredictionConsensus('p0_x')).consensus).toEqual([]);
  });

  it('propagates the taint gate to a new endpoint when opted in', async () => {
    let calledUrl = '';
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      includeTainted: true,
      fetchImpl: async (url) => {
        calledUrl = String(url);
        return jsonResponse([]);
      },
    });
    await client.getChokepointActors('p0_x');
    expect(calledUrl).toContain('/chokepoints/p0_x/actors');
    expect(calledUrl).toContain('include_tainted=true');
  });

  it('reads markdown docs as text', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () => textResponse('# Synthèse\n…'),
    });
    const md = await client.getChokepointAnalysisDoc('p0_x', 'synthesis');
    expect(md).toContain('# Synthèse');
  });

  it('chokepointsBySystem parses a bare array of summaries (not a ChokepointList envelope)', async () => {
    let calledUrl = '';
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async (url) => {
        calledUrl = String(url);
        return jsonResponse([{ id: 'p0_x', canonical_name: 'Détroit X' }]);
      },
    });
    const rows = await client.chokepointsBySystem('sys_adriatic');
    expect(calledUrl).toContain('/chokepoints/by-system/sys_adriatic');
    expect(rows).toHaveLength(1);
    expect(rows[0]!.canonical_name).toBe('Détroit X');
  });

  it('listSources coerces string booleans ("true"/"false") from the live API', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse([
          { source_id: 's1', redistribution_allowed: 'true', attribution_required: 'false' },
          { source_id: 's2', redistribution_allowed: 'false', attribution_required: 'true' },
        ]),
    });
    const rows = await client.listSources();
    expect(rows[0]!.redistribution_allowed).toBe(true);
    expect(rows[0]!.attribution_required).toBe(false);
    expect(rows[1]!.redistribution_allowed).toBe(false);
    expect(rows[1]!.attribution_required).toBe(true);
  });

  it('listSources fails CLOSED on an unrecognized redistribution token (never coerces to true)', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse([
          // Unknown wording must NOT become `true` (it would wrongly mark the source redistributable).
          {
            source_id: 's1',
            redistribution_allowed: 'restricted',
            attribution_required: 'prohibited',
          },
          { source_id: 's2', redistribution_allowed: true, attribution_required: null },
        ]),
    });
    const rows = await client.listSources();
    expect(rows[0]!.redistribution_allowed).toBeNull(); // "restricted" → null, not true
    expect(rows[0]!.attribution_required).toBeNull();
    expect(rows[1]!.redistribution_allowed).toBe(true); // real boolean passes through
    expect(rows[1]!.attribution_required).toBeNull();
  });

  it('getHealth returns the liveness status and never sends include_tainted', async () => {
    let calledUrl = '';
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      includeTainted: true, // even a tainted client…
      fetchImpl: async (url) => {
        calledUrl = String(url);
        return jsonResponse({ status: 'ok' });
      },
    });
    const h = await client.getHealth();
    expect(h.status).toBe('ok');
    expect(calledUrl).toContain('/health');
    expect(calledUrl).not.toContain('include_tainted'); // …liveness is structurally clear-only
  });

  it('getChokepointFiche reads a corridor fiche and honors the taint gate when opted in', async () => {
    let calledUrl = '';
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      includeTainted: true,
      fetchImpl: async (url) => {
        calledUrl = String(url);
        return jsonResponse({ chokepoint_id: 'p0_x', canonical_name: 'Détroit X', summary: '…' });
      },
    });
    const fiche = await client.getChokepointFiche('p0_x');
    expect(fiche.canonical_name).toBe('Détroit X');
    expect(calledUrl).toContain('/chokepoints/p0_x/fiche');
    expect(calledUrl).toContain('include_tainted=true');
  });

  it('fetches a per-corridor CVI assessment (read scope, 8 dimensions)', async () => {
    let calledUrl = '';
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async (url) => {
        calledUrl = String(url);
        return jsonResponse({
          scale: '0-5',
          methodology_documented: false,
          sources: ['chokepoints:run:cvi-1'],
          uncertainties: ['Coût de contournement non chiffré'],
          dimensions: {
            menace: { score: 4, rationale: 'Acteurs hostiles', confidence: 'moyen' },
            gouvernance: { score: 3, rationale: 'Gouvernance fragmentée', confidence: 'bas' },
          },
        });
      },
    });
    const cvi = await client.getChokepointCviAssessment('p0_ormuz');
    expect(calledUrl).toContain('/chokepoints/p0_ormuz/cvi-assessment');
    expect(calledUrl).not.toContain('include_tainted');
    expect(cvi.scale).toBe('0-5');
    expect(cvi.dimensions?.menace?.score).toBe(4);
  });
});

describe('chokepoints client — 0.3.0 / 0.4.0 additive surface', () => {
  it('getSystemResilience parses the global ENA row', async () => {
    let calledUrl = '';
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async (url) => {
        calledUrl = String(url);
        return jsonResponse({
          scope: 'GLOBAL',
          robustness: 0.37,
          regime: 'window_of_vitality',
          weight_basis: 'throughput',
          node_count: 42,
        });
      },
    });
    const r = await client.getSystemResilience();
    expect(calledUrl).toContain('/analytics/system-resilience');
    expect(r.regime).toBe('window_of_vitality');
    expect(r.robustness).toBe(0.37);
  });

  it('listStrategicFlows parses the SFIM envelope with verdict fields', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse({
          count: 1,
          items: [
            {
              id: 'sfu_containers_asia_europe_v1',
              name: 'Conteneurs Asie→Europe',
              flow_type: 'containers',
              validation_status: 'validated',
              verdict: 'TESTER',
              verdict_status: 'candidate',
              dimensions_scored: 4,
            },
          ],
        }),
    });
    const list = await client.listStrategicFlows();
    expect(list.items[0]!.verdict).toBe('TESTER');
    expect(list.items[0]!.verdict_status).toBe('candidate');
    expect(list.items[0]!.dimensions_scored).toBe(4);
  });

  it('getStrategicFlowVerdict returns null when no verdict is authored', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () => jsonResponse(null),
    });
    const v = await client.getStrategicFlowVerdict('sfu_x');
    expect(v).toBeNull();
  });

  it('getStrategicFlowVerdict parses a decision with required_actions', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse({
          decision: 'DIFFÉRER',
          status: 'reviewed',
          required_actions: ['Sécuriser une route alternative'],
          rejected_verdicts: [],
        }),
    });
    const v = await client.getStrategicFlowVerdict('sfu_x');
    expect(v?.decision).toBe('DIFFÉRER');
    expect(v?.required_actions).toEqual(['Sécuriser une route alternative']);
  });

  it('getStrategicFlowFiche parses scoring dimensions', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse({
          id: 'sfu_x',
          name: 'SFU X',
          flow_type: 'containers',
          scoring: [
            {
              dimension: 'substitution',
              effective_score: 2.5,
              confidence: 'moyen',
              origin: 'engine_auto',
            },
          ],
          completeness: {
            dimensions_total: 10,
            dimensions_scored: 4,
            analyst_dimensions: 0,
            auto_dimensions: 4,
            has_draft: true,
            draft_status: 'draft',
            has_verdict: false,
            awaiting_analyst_verdict: true,
          },
        }),
    });
    const f = await client.getStrategicFlowFiche('sfu_x');
    expect(f.scoring[0]!.dimension).toBe('substitution');
    expect(f.scoring[0]!.effective_score).toBe(2.5);
    expect(f.scoring[0]!.origin).toBe('engine_auto');
    expect(f.completeness?.dimensions_scored).toBe(4);
    expect(f.completeness?.analyst_dimensions).toBe(0);
    expect(f.completeness?.awaiting_analyst_verdict).toBe(true);
  });

  it('a fiche without a completeness block parses, leaving it undefined', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () => jsonResponse({ id: 'sfu_x', name: 'SFU X', flow_type: 'containers' }),
    });
    const f = await client.getStrategicFlowFiche('sfu_x');
    expect(f.completeness).toBeUndefined();
  });

  it('SfuCompletenessOut applies the contract defaults on an empty block', () => {
    const c = SfuCompletenessOut.parse({});
    expect(c.dimensions_total).toBe(10);
    expect(c.dimensions_scored).toBe(0);
    expect(c.has_draft).toBe(false);
    expect(c.awaiting_analyst_verdict).toBe(true);
  });

  it('typed FicheOut exposes known sections and passes extra keys through', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse({ chokepoint_id: 'p0_x', leverage: [{ family: 'toll' }], extra: 1 }),
    });
    const fiche = await client.getChokepointFiche('p0_x');
    expect(fiche.chokepoint_id).toBe('p0_x');
    expect(fiche).toHaveProperty('extra', 1);
  });
  it('a non-2xx raises a typed ChokepointsApiError carrying the status', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse({ detail: "include_tainted requires the 'read_tainted' scope" }, 403),
    });

    // The regression that motivated this: a `read` token hitting the unconditionally
    // read_tainted-gated /perception-signals got a 403 which callers turned into `[]` — an
    // authorization failure that read as "this corridor has no perception signals".
    const err = await client.getChokepointPerceptionSignals('p0_x').catch((e: unknown) => e);
    expect(err).toBeInstanceOf(ChokepointsApiError);
    expect((err as ChokepointsApiError).status).toBe(403);
    expect((err as ChokepointsApiError).isForbidden).toBe(true);
    expect((err as ChokepointsApiError).isNotFound).toBe(false);
  });

  it('distinguishes a 404 (absent) from a 403 (wrong scope)', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () => jsonResponse({ detail: 'Not Found' }, 404),
    });
    const err = (await client
      .getChokepoint('nope')
      .catch((e: unknown) => e)) as ChokepointsApiError;
    expect(err.isNotFound).toBe(true);
    expect(err.isForbidden).toBe(false);
  });

  it('parses perception consensus + signals as typed rows', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse({
          chokepoint_id: 'p0_x',
          count: 1,
          consensus: [
            {
              signal_family: 'disruption_expectation',
              market_count: 29,
              consensus_probability: 0.017,
            },
          ],
          signals: [{ market_question: 'Q?', implied_probability: 0.002, liquidity: 4951.24 }],
        }),
    });
    const p = await client.getChokepointPerceptionSignals('p0_x');
    expect(p.consensus[0]!.market_count).toBe(29);
    expect(p.signals[0]!.implied_probability).toBe(0.002);
  });

  it('ChokepointDetail exposes metrics and geometries (undeclared before 0.6.0)', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse({
          id: 'p0_sumed',
          canonical_name: 'SUMED',
          metrics: [
            {
              metric_key: 'sumed_design_capacity',
              metric_kind: 'capacity',
              value: 2.5,
              unit: 'million_barrels_per_day',
              notes: 'A maximum potential rate, not a realised flow.',
              sources: ['eia_world_oil_transit_chokepoints'],
            },
          ],
          geometries: [{ geometry_role: 'display_point', geometry_status: 'schematic' }],
          flows: [
            {
              flow_type: 'crude_oil',
              value_status: 'qualitative_scored',
              method_note: 'excludes transhipment',
              volume_year: 2024,
              sources: ['eia'],
            },
          ],
          risks: [
            { risk_type: 'congestion', assessment_status: 'assessed', risk_severity: 'elevated' },
          ],
          alternatives: [
            {
              description: 'Cape route',
              capacity_penalty: 'high',
              reroute_deltas: [{ flow_type: 'crude_oil', delta_days: 4.52, net_cost_usd: 787252 }],
            },
          ],
          episodes: [{ episode_key: 'red_sea_2024', name: 'Red Sea', started_on: '2023-11-19' }],
        }),
    });
    const d = await client.getChokepoint('p0_sumed');
    // `capacity` is a maximum, never a realised throughput — must not be compared to estimated_volume.
    expect(d.metrics[0]!.metric_kind).toBe('capacity');
    expect(d.geometries[0]!.geometry_role).toBe('display_point');
    // A qualitative_scored flow carries no volume by design; the note explaining that must reach us.
    expect(d.flows[0]!.method_note).toBe('excludes transhipment');
    expect(d.risks[0]!.risk_severity).toBe('elevated');
    expect(d.alternatives[0]!.reroute_deltas[0]!.delta_days).toBe(4.52);
    expect(d.episodes[0]!.started_on).toBe('2023-11-19');
  });

  it('CVI keeps its provenance and never yields an aggregate score (ADR 0049)', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse({
          chokepoint_id: 'p0_x',
          scale: '0-5',
          global_level: 'critique',
          status: 'candidate',
          engine_version: '0.1.0',
          disclaimer: 'Analytical results are derived, candidate outputs',
          aggregate_score: 91,
          dimensions: {
            exposition: { score: 5, rationale: 'r', confidence: 'moyen', source_refs: ['eia'] },
          },
        }),
    });
    const cvi = await client.getChokepointCviAssessment('p0_x');
    expect(cvi.status).toBe('candidate');
    expect(cvi.disclaimer).toContain('candidate');
    expect(cvi.dimensions!.exposition!.source_refs).toEqual(['eia']);
    // The producer never serves it; even if it regressed, the client strips it.
    expect(cvi).not.toHaveProperty('aggregate_score');
    // `resilience` has no engine input and is omitted, never fabricated.
    expect(cvi.dimensions!.resilience).toBeUndefined();
  });

  it('listDerivedRelations passes filters and marks external candidates', async () => {
    let url = '';
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async (u) => {
        url = String(u);
        return jsonResponse({
          edge_count_total: 769,
          returned: 1,
          status: 'derived_candidate_pending_human_validation',
          items: [
            {
              from_object_id: 'p1_anchorage',
              to: 'autres_hubs_pacifique_nord',
              to_status: 'external_candidate',
              relation_type: 'dependency',
              strength_score: 4,
            },
          ],
        });
      },
    });
    const g = await client.listDerivedRelations({ to_status: 'external_candidate', limit: 10 });
    expect(url).toContain('to_status=external_candidate');
    expect(url).toContain('limit=10');
    expect(g.edge_count_total).toBe(769);
    // An external_candidate target is a coverage gap, not a corpus object.
    expect(g.items[0]!.to_status).toBe('external_candidate');
    expect(g.items[0]!.validation_status).toBe('not_validated');
  });

  it('getDerivedRelationGraph returns opaque text, not parsed JSON', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        ({ ok: true, status: 200, text: async () => '# Betweenness\n...' }) as unknown as Response,
    });
    expect(await client.getDerivedRelationGraph()).toContain('# Betweenness');
  });
});

describe('chokepoints client — 0.9.0 / 0.10.0-0.11.0 additive surface (cvi-counterfactual + news)', () => {
  it('getCviCounterfactual parses the live aggregate and passes the scope enum', async () => {
    let url = '';
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async (u) => {
        url = String(u);
        return jsonResponse({
          scope: 'core',
          removed_dimension: 'concentration',
          population: 305,
          changent: 205,
          critique_vers_bas: 5,
          buckets: { '0-1': 12, '2': 3, '3': 40, '4-5': 250 },
          scale: '0-5',
          status: 'candidate',
          method_note: 'Rejoue le CTE engines.cvi.level_bucket',
          disclaimer: 'Derived candidate pending validation',
        });
      },
    });
    const cf = await client.getCviCounterfactual({ scope: 'core' });
    expect(url).toContain('/analytics/cvi-counterfactual');
    expect(url).toContain('scope=core');
    expect(cf.population).toBe(305);
    expect(cf.changent).toBe(205);
    expect(cf.critique_vers_bas).toBe(5);
    expect(cf.status).toBe('candidate');
  });

  it('listNews parses the feed and keeps run_notes + attribution intact', async () => {
    let url = '';
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async (u) => {
        url = String(u);
        return jsonResponse({
          count: 1,
          run_id: 'aggregate_news@20260716T090347Z',
          taint_class: 'cleared_only',
          generated_at: '2026-07-16T09:03:47Z',
          include_tainted: false,
          run_notes: ['model coverage: 26/129 supplied articles were placed in a cluster'],
          disclaimer: 'Media coverage is a candidate, never a confirmed incident',
          attribution_notice: 'Attribute each article to its outlet',
          items: [
            {
              cluster_id: '4fb9ff76-…',
              headline: 'Media report a tanker seizure in the Strait of Hormuz',
              summary_text: 'Several outlets report…',
              event_category: 'security',
              salience_score: 0.85,
              article_count: 2,
              source_domains: ['wsj.com', 'gcaptain.com'],
              articles: [
                {
                  title: 'A',
                  url: 'https://wsj.com/a',
                  outlet: 'wsj.com',
                  source_id: 'wsj_world',
                  observed_on: '2026-07-16',
                },
              ],
              affected_chokepoints: [
                {
                  chokepoint_id: 'p0_maritime_strait_strait_of_hormuz',
                  canonical_name: 'Strait of Hormuz',
                  relevance: 0.85,
                },
              ],
              model: 'gpt-5.6-terra',
              prompt_version: 'news-agg-0.2.0',
              status: 'candidate',
            },
          ],
        });
      },
    });
    const feed = await client.listNews({ since: 7, category: 'security' });
    expect(url).toContain('/news');
    expect(url).toContain('since=7');
    expect(url).toContain('category=security');
    // run_notes must survive parsing — the UI is required to display it (sample vs summary).
    expect(feed.run_notes[0]).toContain('model coverage');
    // Server-recalculated fields are the reliable ones; attribution must be present.
    expect(feed.items[0]!.articles[0]!.outlet).toBe('wsj.com');
    expect(feed.items[0]!.affected_chokepoints[0]!.chokepoint_id).toBe(
      'p0_maritime_strait_strait_of_hormuz',
    );
  });

  it('an honest empty feed (count 0 WITH a run_id) parses without inventing clusters', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () =>
        jsonResponse({ count: 0, run_id: 'aggregate_news@x', run_notes: [], items: [] }),
    });
    const feed = await client.listNews();
    expect(feed.count).toBe(0);
    expect(feed.items).toEqual([]);
    expect(feed.run_id).toBe('aggregate_news@x'); // distinguishes "ran, empty" from "never ran"
  });

  it('getChokepointNews propagates the taint gate when opted in', async () => {
    let url = '';
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      includeTainted: true,
      fetchImpl: async (u) => {
        url = String(u);
        return jsonResponse({ count: 0, run_id: 'r', items: [] });
      },
    });
    await client.getChokepointNews('p0_ormuz', { since: 14 });
    expect(url).toContain('/chokepoints/p0_ormuz/news');
    expect(url).toContain('since=14');
    expect(url).toContain('include_tainted=true');
  });
});
