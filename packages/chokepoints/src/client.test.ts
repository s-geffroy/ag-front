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
          items: [{ id: 'p0_maritime_x', canonical_name: 'Détroit X', required_attributions: ['Src'] }],
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

  it('throws on a non-200 response', async () => {
    const client = createChokepointsClient({
      baseUrl: 'https://host/api',
      token: 't',
      fetchImpl: async () => jsonResponse({}, 401),
    });
    await expect(client.listChokepoints()).rejects.toThrow();
  });
});
