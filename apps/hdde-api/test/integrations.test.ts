// Guards for the chokepoints/CVI coupling (ADR 0035) + red-team schema validation (ADR 0034).
import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';

// Configure the chokepoints integration BEFORE importing it (config reads env at import time).
process.env.CHOKEPOINTS_API_URL = 'http://chokepoints.test/api';
process.env.CHOKEPOINTS_API_TOKEN = 'read-scope-token';

let suggestChokepoints: (typeof import('../server/integrations/chokepoints'))['suggestChokepoints'];
let fetchCorridorEvidence: (typeof import('../server/integrations/chokepoints'))['fetchCorridorEvidence'];
let fetchCorridorContext: (typeof import('../server/integrations/chokepoints'))['fetchCorridorContext'];
let deriveFlowVulnerability: (typeof import('../server/integrations/cvi'))['deriveFlowVulnerability'];
let fetchCorridorCvi: (typeof import('../server/integrations/cvi'))['fetchCorridorCvi'];

beforeAll(async () => {
  ({ suggestChokepoints, fetchCorridorEvidence, fetchCorridorContext } = await import(
    '../server/integrations/chokepoints'
  ));
  ({ deriveFlowVulnerability, fetchCorridorCvi } = await import('../server/integrations/cvi'));
});

// Route a mocked fetch by URL path so per-endpoint behaviour can be asserted independently.
function routeFetch(handlers: Record<string, () => Response>) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
    const u = String(url);
    for (const [needle, make] of Object.entries(handlers)) {
      if (u.includes(needle)) {
        expect(u).not.toContain('include_tainted'); // read scope only (ADR 0035)
        return make();
      }
    }
    return new Response('not found', { status: 404 });
  });
}
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

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

describe('fetchCorridorEvidence — per-corridor actors + signals (ADR 0035)', () => {
  it('returns actors + event signals, drops tainted records, never opts into include_tainted', async () => {
    routeFetch({
      '/actors': () =>
        json([
          { actor_id: 'a1', chokepoint_id: 'p0_x', actor_name: 'Marine X', control_type: 'physical', license_taint: false },
          { actor_id: 'a2', chokepoint_id: 'p0_x', actor_name: 'Restricted', control_type: 'legal', license_taint: true },
        ]),
      '/event-signals': () =>
        json([{ chokepoint_id: 'p0_x', domain: 'security', weight: 0.8, event_key: 'e1' }]),
      '/analysis': () => json({ chokepoint_id: 'p0_x', engines: [], relations: [], claims: [] }),
    });
    const ev = await fetchCorridorEvidence('p0_x');
    expect(ev.available).toBe(true);
    expect(ev.actors.map((a) => a.name)).toEqual(['Marine X']); // tainted actor dropped
    expect(ev.event_signals[0]!.domain).toBe('security');
  });

  /**
   * HDDE holds a `read` token by design (ADR 0035). The producer gates /perception-signals
   * unconditionally on `read_tainted`, so calling it always returned 403 — and the old
   * `.catch(() => null)` reported that authorization failure as "this corridor has no perception
   * signals". We now read the DERIVED prediction_consensus block of /analysis, served under `read`.
   */
  it('sources perception from the derived prediction_consensus block, never /perception-signals', async () => {
    let perceptionCalled = false;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (url) => {
      const u = String(url);
      if (u.includes('/perception-signals')) {
        perceptionCalled = true;
        return json({ detail: "include_tainted requires the 'read_tainted' scope" }, 403);
      }
      if (u.includes('/actors')) return json([]);
      if (u.includes('/event-signals')) return json([]);
      if (u.includes('/analysis')) {
        return json({
          chokepoint_id: 'p0_x',
          disclaimer: 'Analytical results are derived, candidate outputs',
          engines: [
            {
              key: 'prediction_consensus',
              columns: ['signal_family', 'market_count', 'consensus_probability'],
              rows: [
                { signal_family: 'disruption_expectation', market_count: 29, consensus_probability: 0.017 },
                { signal_family: 'regime_change_expectation', market_count: 2, consensus_probability: 0.19 },
              ],
            },
          ],
          relations: [],
          claims: [],
        });
      }
      return new Response('not found', { status: 404 });
    });

    const ev = await fetchCorridorEvidence('p0_x');
    expect(perceptionCalled).toBe(false); // the read_tainted-gated route is never touched
    expect(ev.available).toBe(true);
    expect(ev.perception?.count).toBe(2);
    expect(ev.perception?.families[0]!.signal_family).toBe('disruption_expectation');
    expect(ev.perception?.families[0]!.market_count).toBe(29);
    // The candidate marking must travel with the derived data.
    expect(ev.perception?.disclaimer).toContain('candidate');
  });

  it('a 403 is logged loudly, never silently rendered as an empty dataset', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      json({ detail: 'forbidden' }, 403),
    );
    const ev = await fetchCorridorEvidence('p0_x');
    expect(ev.available).toBe(false);
    expect(spy).toHaveBeenCalled();
    expect(spy.mock.calls.some((c) => String(c[0]).includes('403'))).toBe(true);
    expect(spy.mock.calls.some((c) => String(c[0]).includes('NOT an empty dataset'))).toBe(true);
  });

  it('a 404 degrades quietly — an absent record is not a defect', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => new Response('nope', { status: 404 }));
    const ev = await fetchCorridorEvidence('p0_missing');
    expect(ev.available).toBe(false);
    expect(spy).not.toHaveBeenCalled();
  });

  it('degrades gracefully — every endpoint failing yields available:false, empty', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network down'));
    const ev = await fetchCorridorEvidence('p0_x');
    expect(ev.available).toBe(false);
    expect(ev.actors).toEqual([]);
    expect(ev.event_signals).toEqual([]);
    expect(ev.perception).toBeNull();
  });
});

describe('fetchCorridorContext — episodes + analytics for the VERDICT packet (ADR 0042)', () => {
  it('keeps only episodes whose (non-tainted) members include the corridor + maps analytics', async () => {
    routeFetch({
      '/analytics/results': () =>
        json([{ id: 'r1', object_id: 'p0_x', result_type: 'criticality_score', score: 0.9, result_summary: 'flux critique' }]),
      // getEpisode(:key) — matched before the list route by longer path; return per-key details.
      '/episodes/ep_match': () =>
        json({ episode_key: 'ep_match', name: 'Crise', members: [{ chokepoint_id: 'p0_x' }] }),
      '/episodes/ep_other': () =>
        json({ episode_key: 'ep_other', name: 'Autre', members: [{ chokepoint_id: 'p0_y' }] }),
      '/episodes': () =>
        json([{ episode_key: 'ep_match', name: 'Crise' }, { episode_key: 'ep_other', name: 'Autre' }]),
    });
    const ctx = await fetchCorridorContext('p0_x');
    expect(ctx.available).toBe(true);
    expect(ctx.episodes.map((e) => e.key)).toEqual(['ep_match']); // ep_other excluded (different corridor)
    expect(ctx.analytics[0]!.result_type).toBe('criticality_score');
    expect(ctx.analytics[0]!.summary).toBe('flux critique');
  });

  it('degrades gracefully — API failing yields available:false, empty', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('down'));
    const ctx = await fetchCorridorContext('p0_x');
    expect(ctx).toEqual({ available: false, episodes: [], analytics: [] });
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
