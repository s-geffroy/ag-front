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
