// End-to-end API test: boots the Express app on an ephemeral port with an in-memory SQLite DB and a
// seeded analyst, then walks the full workflow (login → case → interview → packet → validate →
// export → red team → diff). Red team runs in offline facade mode (LLM disabled).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';

// Env must be set BEFORE the app modules read config at import time.
process.env.HDDE_DB_PATH = ':memory:';
process.env.LLM_ENABLED = 'false';
process.env.SESSION_SECRET = 'test-secret-test-secret';

let server: Server;
let base: string;
let cookie = '';

async function api(method: string, path: string, body?: unknown): Promise<Response> {
  return fetch(`${base}${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(cookie ? { cookie } : {}) },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function jsonOf(res: Response): Promise<any> {
  return res.json();
}

beforeAll(async () => {
  const { createApp } = await import('../server/app');
  const { createUser } = await import('../server/db/repo');
  const { hashPassword } = await import('../server/auth/password');
  const app = createApp();
  createUser('analyst@example.com', hashPassword('correct-horse-battery'), 'owner_admin');
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => resolve());
  });
  const addr = server.address();
  const port = typeof addr === 'object' && addr ? addr.port : 0;
  base = `http://127.0.0.1:${port}`;
});

afterAll(() => {
  server?.close();
});

describe('HDDE API e2e', () => {
  it('rejects unauthenticated case access', async () => {
    const res = await api('GET', '/api/cases');
    expect(res.status).toBe(401);
  });

  it('logs in and sets a session cookie', async () => {
    const bad = await api('POST', '/api/auth/login', {
      email: 'analyst@example.com',
      password: 'wrong',
    });
    expect(bad.status).toBe(401);

    const res = await api('POST', '/api/auth/login', {
      email: 'analyst@example.com',
      password: 'correct-horse-battery',
    });
    expect(res.status).toBe(200);
    const setCookie = res.headers.getSetCookie?.() ?? [];
    cookie = setCookie.map((c) => c.split(';')[0]).join('; ');
    expect(cookie).toContain('hdde_session=');
  });

  it('runs the full diagnostic workflow', async () => {
    // Create case
    const caseRes = await api('POST', '/api/cases', {
      title: 'Dépendance fournisseur chinois',
      sector: 'équipement industriel',
      critical_actor_name: 'Shenzhen Precision Components Ltd.',
      critical_actor_type: 'supplier',
      business_function_at_risk: 'Production de modules électroniques.',
    });
    expect(caseRes.status).toBe(201);
    const caseId = (await jsonOf(caseRes)).id as string;

    // Interview answers (canonical tokens)
    const answers = [
      {
        question_id: 'critical_actor_replaceability_30d',
        block_id: 'critical_actor',
        normalized_answer: 'no',
      },
      {
        question_id: 'hidden_tier2_visibility',
        block_id: 'hidden_dependencies',
        normalized_answer: 'no',
      },
      {
        question_id: 'decision_thresholds_defined',
        block_id: 'decision_thresholds',
        normalized_answer: 'no',
      },
    ];
    for (const a of answers) {
      const r = await api('POST', `/api/cases/${caseId}/interview/answers`, {
        ...a,
        raw_answer: 'Non.',
        answer_type: 'estimate',
        evidence_quality: 2,
      });
      expect(r.status).toBe(201);
    }

    // Generate packet
    const p1 = await api('POST', `/api/cases/${caseId}/diagnostic-packets`);
    expect(p1.status).toBe(201);
    const packet1 = await jsonOf(p1);
    expect(['prepare', 'act']).toContain(packet1.operational_verdict);
    expect(packet1.pack_hash).toMatch(/^sha256:/);
    expect(packet1.packet_json.cvi).toBeDefined();

    // Validate
    const val = await api('POST', `/api/cases/${caseId}/diagnostic-packets/${packet1.id}/validate`);
    expect(val.status).toBe(200);
    const valBody = await jsonOf(val);
    expect(valBody.status).toBe('validated');

    // Idempotent: re-validating must not overwrite validated_at/validated_by.
    const reval = await api(
      'POST',
      `/api/cases/${caseId}/diagnostic-packets/${packet1.id}/validate`,
    );
    expect(reval.status).toBe(200);
    expect((await jsonOf(reval)).validated_at).toBe(valBody.validated_at);

    // Export
    const exp = await api('POST', `/api/cases/${caseId}/diagnostic-packets/${packet1.id}/exports`);
    expect(exp.status).toBe(201);
    const files = (await jsonOf(exp)).files as string[];
    expect(files).toContain('diagnostic_fiche.fr.md');
    expect(files).toContain('diagnostic_packet.json');

    // Red team (facade): a suggestion is persisted as pending — never evidence.
    const rt = await api('POST', `/api/cases/${caseId}/red-team/run`, {
      persona: 'disruptive_actor',
    });
    expect(rt.status).toBe(201);
    expect((await jsonOf(rt)).status).toBe('pending');

    // Second packet → diff
    const p2 = await api('POST', `/api/cases/${caseId}/diagnostic-packets`);
    const packet2 = await jsonOf(p2);
    const diff = await api(
      'GET',
      `/api/cases/${caseId}/diagnostic-packets/${packet1.id}/diff/${packet2.id}`,
    );
    expect(diff.status).toBe(200);
    const diffBody = await jsonOf(diff);
    expect(diffBody.verdict.changed).toBe(false);
  });

  it('lets an accepted red-team suggestion raise the verdict (feedback loop)', async () => {
    const c = await api('POST', '/api/cases', {
      title: 'Feedback red team',
      sector: 'x',
      business_function_at_risk: 'y',
    });
    const caseId = (await jsonOf(c)).id as string;
    for (const a of [
      { question_id: 'critical_actor_replaceability_30d', block_id: 'critical_actor', normalized_answer: 'no' },
      { question_id: 'hidden_tier2_visibility', block_id: 'hidden_dependencies', normalized_answer: 'no' },
    ]) {
      await api('POST', `/api/cases/${caseId}/interview/answers`, {
        ...a,
        raw_answer: 'Non.',
        answer_type: 'estimate',
        evidence_quality: 2,
      });
    }
    const p1 = await jsonOf(await api('POST', `/api/cases/${caseId}/diagnostic-packets`));
    const order = ['monitor', 'prepare', 'act', 'escalate'];
    const v1 = order.indexOf(p1.operational_verdict);

    // Run red team (facade → could_raise_verdict:true) and ACCEPT the suggestion.
    const sug = await jsonOf(
      await api('POST', `/api/cases/${caseId}/red-team/run`, { persona: 'disruptive_actor' }),
    );
    const patch = await api('PATCH', `/api/cases/${caseId}/red-team/suggestions/${sug.id}`, {
      status: 'accepted',
    });
    expect(patch.status).toBe(200);

    // The next packet reflects the accepted pressure: verdict bumped by one (capped at escalate).
    const p2 = await jsonOf(await api('POST', `/api/cases/${caseId}/diagnostic-packets`));
    expect(p2.packet_json.redteam_adjustment.applied).toBe(true);
    expect(order.indexOf(p2.operational_verdict)).toBe(Math.min(v1 + 1, 3));
  });

  it('creates a case without critical_actor_type (no NOT NULL crash)', async () => {
    // Regression: the column is NOT NULL but the schema field is optional — must not 500.
    const r = await api('POST', '/api/cases', {
      title: 'Sans type acteur',
      sector: 'x',
      business_function_at_risk: 'y',
    });
    expect(r.status).toBe(201);
  });

  it('enforces case isolation between non-admin analysts (no IDOR)', async () => {
    const { createUser } = await import('../server/db/repo');
    const { hashPassword } = await import('../server/auth/password');
    createUser('alice@example.com', hashPassword('alice-password-1234'), 'analyst');
    createUser('bob@example.com', hashPassword('bob-password-1234'), 'analyst');

    const loginAs = async (email: string, password: string): Promise<string> => {
      const r = await api('POST', '/api/auth/login', { email, password });
      expect(r.status).toBe(200);
      return (r.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
    };
    const aliceCookie = await loginAs('alice@example.com', 'alice-password-1234');
    const bobCookie = await loginAs('bob@example.com', 'bob-password-1234');

    const withCookie = (method: string, path: string, c: string, body?: unknown): Promise<Response> =>
      fetch(`${base}${path}`, {
        method,
        headers: { 'content-type': 'application/json', cookie: c },
        body: body === undefined ? undefined : JSON.stringify(body),
      });

    // Alice creates a confidential case.
    const created = await withCookie('POST', '/api/cases', aliceCookie, {
      title: 'Alice — dossier confidentiel',
      sector: 'défense',
      business_function_at_risk: 'secret',
    });
    expect(created.status).toBe(201);
    const aliceCaseId = (await jsonOf(created)).id as string;

    // Bob (a different non-admin analyst) must NOT be able to read it — 403, the security-critical path.
    expect((await withCookie('GET', `/api/cases/${aliceCaseId}`, bobCookie)).status).toBe(403);
    // ...nor generate a packet on it.
    expect(
      (await withCookie('POST', `/api/cases/${aliceCaseId}/diagnostic-packets`, bobCookie)).status,
    ).toBe(403);
    // ...nor see it in his own list.
    const bobList = await jsonOf(await withCookie('GET', '/api/cases', bobCookie));
    expect((bobList as { id: string }[]).find((c) => c.id === aliceCaseId)).toBeUndefined();

    // Alice herself still can (sanity: the case exists and is hers).
    expect((await withCookie('GET', `/api/cases/${aliceCaseId}`, aliceCookie)).status).toBe(200);
  });
});
