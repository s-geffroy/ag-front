// Guards for the chokepoints/CVI coupling (ADR 0035) + red-team schema validation (ADR 0034).
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';

// Configure the chokepoints integration BEFORE importing it (config reads env at import time).
process.env.CHOKEPOINTS_API_URL = 'http://chokepoints.test/api';
process.env.CHOKEPOINTS_API_TOKEN = 'read-scope-token';

let suggestChokepoints: (typeof import('../server/integrations/chokepoints'))['suggestChokepoints'];
let deriveFlowVulnerability: (typeof import('../server/integrations/cvi'))['deriveFlowVulnerability'];
let fetchCorridorCvi: (typeof import('../server/integrations/cvi'))['fetchCorridorCvi'];

beforeAll(async () => {
  ({ suggestChokepoints } = await import('../server/integrations/chokepoints'));
  ({ deriveFlowVulnerability, fetchCorridorCvi } = await import('../server/integrations/cvi'));
});

afterEach(() => vi.restoreAllMocks());

describe('chokepoints enrichment (anti-tainted guard, ADR 0035)', () => {
  it('never returns a tainted record and never opts into include_tainted', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const u = String(url);
      // Assert the request did NOT ask for tainted records.
      expect(u).not.toContain('include_tainted');
      // 'transport' → by-flow/container_shipping (V2), which returns a bare array of summaries.
      expect(u).toContain('/chokepoints/by-flow/container_shipping');
      return new Response(
        JSON.stringify([
          {
            id: 'clean-1',
            canonical_name: 'Strait Clear',
            importance_score: 0.9,
            license_taint: false,
          },
          {
            id: 'tainted-1',
            canonical_name: 'Restricted Node',
            importance_score: 0.8,
            license_taint: true,
          },
        ]),
        { status: 200, headers: { 'content-type': 'application/json' } },
      );
    });

    const result = await suggestChokepoints('transport');
    expect(fetchSpy).toHaveBeenCalled();
    expect(result.available).toBe(true);
    const ids = result.candidates.map((c) => c.id);
    expect(ids).toContain('clean-1');
    expect(ids).not.toContain('tainted-1'); // tainted record filtered out
  });

  it('degrades gracefully when the API errors', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    const result = await suggestChokepoints('energy');
    expect(result.available).toBe(false);
    expect(result.candidates).toEqual([]);
  });
});

describe('CVI enrichment (local, candidate only)', () => {
  it('maps a high flow-criticality score to a critical vulnerability level', () => {
    expect(deriveFlowVulnerability(5).vulnerability_level).toBe('critique');
    expect(deriveFlowVulnerability(0).vulnerability_level).toBe('bas');
  });
});

describe('fetchCorridorCvi — remote CVI prefill guard (ADR 0035)', () => {
  it('returns null when the endpoint 404s (not yet shipped) — graceful degradation', async () => {
    // /chokepoints/{id}/cvi-assessment is not in the v0.2.0 contract yet; a 404 must NOT throw.
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response('not found', { status: 404 }),
    );
    expect(await fetchCorridorCvi('p0_ormuz')).toBeNull();
  });

  it('returns null on a network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    expect(await fetchCorridorCvi('p0_ormuz')).toBeNull();
  });

  it('drops a payload that fails @ag/cvi validation (0-5 without dimensions → candidate gate)', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ scale: '0-5', dimensions: {} }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    expect(await fetchCorridorCvi('p0_ormuz')).toBeNull();
  });

  it('returns a validated assessment on a well-formed 0-5 payload', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          scale: '0-5',
          methodology_documented: false,
          sources: ['chokepoints:run:cvi-1'],
          dimensions: { menace: { score: 4, rationale: 'Acteurs hostiles' } },
        }),
        { status: 200, headers: { 'content-type': 'application/json' } },
      ),
    );
    const cvi = await fetchCorridorCvi('p0_ormuz');
    expect(cvi?.scale).toBe('0-5');
    expect(cvi?.dimensions?.menace?.score).toBe(4);
  });
});
