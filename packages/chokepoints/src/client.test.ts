import { describe, it, expect } from 'vitest';
import { createChokepointsClient } from './client';

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
          { source_id: 's1', redistribution_allowed: 'restricted', attribution_required: 'prohibited' },
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
