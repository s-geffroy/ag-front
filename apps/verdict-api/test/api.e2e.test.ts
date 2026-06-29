// End-to-end API test: boots the Express app on an ephemeral port with an in-memory SQLite DB and a
// seeded analyst, then walks the VERDICT workflow (login → decision → options → score → verdict page
// → audit VALIDE). Mirrors the hdde-api e2e harness (plain fetch, no supertest).
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { Server } from 'node:http';

// Env must be set BEFORE the app modules read config at import time.
process.env.VERDICT_DB_PATH = ':memory:';
process.env.LLM_ENABLED = 'false';

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

let DEFAULT_WEIGHTS: Record<string, number>;

beforeAll(async () => {
  ({ DEFAULT_WEIGHTS } = await import('@ag/verdict'));
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

describe('VERDICT API — full decision workflow', () => {
  let decisionId = '';

  it('rejects unauthenticated access', async () => {
    const res = await api('GET', '/api/decisions');
    expect(res.status).toBe(401);
  });

  it('logs in', async () => {
    const res = await api('POST', '/api/auth/login', {
      email: 'analyst@example.com',
      password: 'correct-horse-battery',
    });
    expect(res.status).toBe(200);
    cookie = res.headers.get('set-cookie')!.split(';')[0];
    expect(cookie).toContain('verdict_session');
  });

  it('creates a decision', async () => {
    const res = await api('POST', '/api/decisions', {
      title: 'Rerouter hors du corridor Mer Rouge ?',
      sector: 'logistique',
    });
    expect(res.status).toBe(201);
    decisionId = (await jsonOf(res)).id;
    expect(decisionId).toBeTruthy();
  });

  it('sets the standard weight profile', async () => {
    const res = await api('PUT', `/api/decisions/${decisionId}/weight-profile`, {
      profile: 'standard',
      adapted_before_scoring: true,
      justification: '',
      weights: DEFAULT_WEIGHTS,
    });
    expect(res.status).toBe(200);
  });

  it('adds the three mandatory options', async () => {
    const opts = [
      { option_id: 'opt_main', type: 'main', title: 'Rerouter', proof_level: 3 },
      { option_id: 'opt_minimal', type: 'minimal_alternative', title: 'Tester un fournisseur alterne', proof_level: 4 },
      { option_id: 'opt_opposite', type: 'opposite', title: 'Ne rien changer, surveiller', proof_level: 3 },
    ];
    for (const o of opts) {
      const res = await api('PUT', `/api/decisions/${decisionId}/options`, {
        ...o,
        critical_hypothesis: 'h',
        main_evidence: 'e',
        main_contradiction: 'c',
      });
      expect(res.status).toBe(200);
    }
  });

  it('scores each option (raw computed server-side)', async () => {
    const scores = {
      opt_main: { strategic_value: 4, context_fit: 3, real_capacity: 3, systemic_viability: 3, net_risk: 3, proof_level: 3, optionality: 3 },
      opt_minimal: { strategic_value: 4, context_fit: 4, real_capacity: 4, systemic_viability: 3, net_risk: 4, proof_level: 4, optionality: 4 },
      opt_opposite: { strategic_value: 2, context_fit: 3, real_capacity: 5, systemic_viability: 3, net_risk: 4, proof_level: 3, optionality: 4 },
    };
    const expected: Record<string, number> = { opt_main: 64, opt_minimal: 77, opt_opposite: 67 };
    for (const [oid, criteria] of Object.entries(scores)) {
      const res = await api('PUT', `/api/decisions/${decisionId}/options/${oid}/score`, { criteria });
      expect(res.status).toBe(200);
      expect((await jsonOf(res)).raw_score).toBe(expected[oid]);
    }
  });

  it('adds a manual PESTEL factor and a SWOT item', async () => {
    const p = await api('POST', `/api/decisions/${decisionId}/pestel`, {
      category: 'political',
      statement: 'Tensions en Mer Rouge',
      decisional_impact: 'Renchérit le routage via Suez',
    });
    expect(p.status).toBe(201);
    const s = await api('POST', `/api/decisions/${decisionId}/swot`, {
      quadrant: 'threat',
      statement: 'Fournisseur unique exposé au corridor',
    });
    expect(s.status).toBe(201);
  });

  it('sets the verdict page (TESTER with a complete truth test)', async () => {
    const res = await api('PATCH', `/api/decisions/${decisionId}`, {
      final_verdict: 'TESTER',
      proposed_verdict: 'TESTER',
      selected_option_id: 'opt_minimal',
      confidence: 'moyenne',
      human_validation: true,
      review_date: '2026-09-01',
      stop_threshold: '6 semaines sans alternative qualifiée',
      truth_test: {
        critical_hypothesis: 'Un fournisseur alterne est qualifiable en 6 semaines',
        minimal_protocol: 'RFQ + audit express',
        max_duration: '6 semaines',
        max_cost: '5000 EUR',
        success_signal: '1 fournisseur qualifié',
        failure_signal: '0 réponse crédible',
        decision_if_success: 'FAIRE bascule',
        decision_if_failure: 'DIFFÉRER',
        can_kill_option: true,
      },
    });
    expect(res.status).toBe(200);
  });

  it('runs the audit and returns VALIDE', async () => {
    const res = await api('POST', `/api/decisions/${decisionId}/audit`, {});
    expect(res.status).toBe(200);
    const audit = await jsonOf(res);
    expect(audit.blocking_errors).toEqual([]);
    expect(audit.audit_status).toBe('VALIDE');
    expect(audit.selected_option_id).toBe('opt_minimal');
    expect(audit.selected_option_proof_level).toBe(4);
  });

  it('blocks FAIRE on a proof-3 option', async () => {
    await api('PATCH', `/api/decisions/${decisionId}`, {
      final_verdict: 'FAIRE',
      selected_option_id: 'opt_main',
      why_faire_not_tester: 'urgence',
    });
    const res = await api('POST', `/api/decisions/${decisionId}/audit`, {});
    const audit = await jsonOf(res);
    expect(audit.audit_status).toBe('BLOQUÉ');
    expect(audit.blocking_errors).toContain('faire_forbidden_when_selected_option_proof_level_below_4');
  });

  it('returns the full decision bundle', async () => {
    const res = await api('GET', `/api/decisions/${decisionId}`);
    expect(res.status).toBe(200);
    const bundle = await jsonOf(res);
    expect(bundle.options).toHaveLength(3);
    expect(bundle.scores).toHaveLength(3);
    expect(bundle.pestel).toHaveLength(1);
    expect(bundle.swot).toHaveLength(1);
    expect(bundle.audit).not.toBeNull();
  });

  let suggestionId = '';
  it('runs the red team (offline facade) and stores a pending suggestion', async () => {
    const res = await api('POST', `/api/decisions/${decisionId}/red-team/run`, { role: 'red_team_option' });
    expect(res.status).toBe(201);
    const s = await jsonOf(res);
    expect(s.model).toBe('facade'); // LLM disabled in tests
    expect(s.status).toBe('pending');
    expect(s.suggestion_json.role).toBe('red_team_option');
    expect(s.suggestion_json.do_not_conclude.length).toBeGreaterThan(0);
    suggestionId = s.id;
  });

  it('lets the analyst accept the suggestion', async () => {
    const res = await api('PATCH', `/api/decisions/${decisionId}/red-team/${suggestionId}`, { status: 'accepted' });
    expect(res.status).toBe(200);
    expect((await jsonOf(res)).status).toBe('accepted');
  });

  it('renders FR/EN decision-note exports', async () => {
    const res = await api('POST', `/api/decisions/${decisionId}/exports`, {});
    expect(res.status).toBe(200);
    const { files } = await jsonOf(res);
    const names = files.map((f: { filename: string }) => f.filename);
    expect(names).toContain('decision.fr.md');
    expect(names).toContain('decision.en.md');
    expect(names).toContain('decision.json');
    const frieg = files.find((f: { filename: string }) => f.filename === 'decision.fr.md');
    expect(frieg.content).toContain('Note de décision');
    expect(frieg.content).toContain('Rerouter hors du corridor Mer Rouge');
  });
});
