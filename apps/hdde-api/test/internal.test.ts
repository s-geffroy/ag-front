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
    const res = await fetch(`${base}${path}`, {
      headers: { 'X-Internal-Token': 'test-internal-token' },
    });
    expect(res.status).toBe(404);
    const body = (await res.json()) as { error?: string };
    expect(body.error).toBe('case_not_found');
  });
});

describe('HDDE internal API — only human-validated packets are ingestible (ADR 0042)', () => {
  const auth = { 'X-Internal-Token': 'test-internal-token' };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let repo: any;
  let caseId = '';
  let packetId = '';
  let userId = '';

  beforeAll(async () => {
    repo = await import('../server/db/repo');
    userId = repo.createUser('an@x.io', 'hash', 'analyst').id;
    caseId = repo.createCase(userId, {
      title: 'C',
      sector: 's',
      business_function_at_risk: 'f',
    }).id;
    // A freshly generated packet is status='draft' (createPacket hard-codes it).
    packetId = repo.createPacket(
      caseId,
      {
        operational_verdict: 'act',
        confidence: 'medium',
        primary_diagnosis: 'd',
        scores: [],
        activated_patterns: [],
        red_flags: [],
        open_uncertainties: [],
        light_actions: [],
        matrix_rows: [],
      },
      'sha256:test',
      {},
    ).id;
  });

  const url = (): string => `${base}/api/internal/cases/${caseId}/packet/latest`;

  it('404s no_validated_packet while only a draft exists', async () => {
    const res = await fetch(url(), { headers: auth });
    expect(res.status).toBe(404);
    expect(((await res.json()) as { error?: string }).error).toBe('no_validated_packet');
  });

  it('serves the packet once a human validates it', async () => {
    repo.validatePacket(packetId, userId);
    const res = await fetch(url(), { headers: auth });
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status?: string; packet?: unknown };
    expect(body.status).toBe('validated');
    expect(body.packet).toBeTruthy();
  });
});
