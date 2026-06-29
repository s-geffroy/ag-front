// Internal ingestion API guard (ADR 0042): the service-token boundary. Boots the app with a token
// set, then checks that the endpoint 404s without/with a wrong token and only reaches the handler
// (case_not_found) when the token matches. This is the security contract VERDICT relies on.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';

process.env.HDDE_DB_PATH = ':memory:';
process.env.LLM_ENABLED = 'false';
process.env.INTERNAL_API_TOKEN = 'test-internal-token';

let server: Server;
let base: string;

beforeAll(async () => {
  const { createApp } = await import('../server/app');
  const app = createApp();
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const addr = server.address();
  base = `http://127.0.0.1:${typeof addr === 'object' && addr ? addr.port : 0}`;
});

afterAll(() => server?.close());

const path = '/api/internal/cases/unknown-case/packet/latest';

describe('HDDE internal API — token guard', () => {
  it('404s with no token (endpoint indistinguishable from not-mounted)', async () => {
    const res = await fetch(`${base}${path}`);
    expect(res.status).toBe(404);
  });

  it('404s with a wrong token', async () => {
    const res = await fetch(`${base}${path}`, { headers: { 'X-Internal-Token': 'nope' } });
    expect(res.status).toBe(404);
  });

  it('reaches the handler with the right token (case_not_found for an unknown case)', async () => {
    const res = await fetch(`${base}${path}`, { headers: { 'X-Internal-Token': 'test-internal-token' } });
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe('case_not_found');
  });
});
