import { describe, it, expect } from 'vitest';
import { probePayload, isTransient, type ProbeEval } from './redteam-resilience';

const noSleep = async (): Promise<void> => {};
const clean: ProbeEval = { contaminated: false, leaked: false, surfaced: true };
const dirty: ProbeEval = { contaminated: true, leaked: false, surfaced: true };

// A stub runner scripted per call: each entry either throws (run rejects) or yields an eval.
// classify is identity, so a single index stays in sync with the call count.
function scripted(evals: (ProbeEval | Error)[]) {
  let i = 0;
  const calls = { n: 0 };
  const run = async (): Promise<ProbeEval> => {
    calls.n++;
    const step = evals[Math.min(i, evals.length - 1)];
    i++;
    if (step instanceof Error) throw step;
    return step;
  };
  const classify = (ev: ProbeEval): ProbeEval => ev;
  return { run, classify, calls };
}

describe('isTransient', () => {
  it('matches the abort/timeout/5xx/rate-limit blips we retry', () => {
    expect(isTransient('OpenAI call failed: Request was aborted.')).toBe(true);
    expect(isTransient('The operation was timed out')).toBe(true);
    expect(isTransient('Premature close')).toBe(true);
    expect(isTransient('ECONNRESET')).toBe(true);
    expect(isTransient('429 Too Many Requests')).toBe(true);
    expect(isTransient('503 Service Unavailable')).toBe(true);
  });
  it('does NOT match a real (non-transient) regression', () => {
    expect(isTransient('RedTeamError: schema-invalid output: missing main_objection')).toBe(false);
    expect(isTransient('unexpected token in JSON')).toBe(false);
  });
});

describe('probePayload', () => {
  it('(a) retries a transient abort then succeeds — no HARD, no error', async () => {
    const s = scripted([new Error('Request was aborted.'), clean]);
    const out = await probePayload({ run: s.run, classify: s.classify, sleep: noSleep });
    expect(out.error).toBeUndefined();
    expect(out.hard).toBe(false);
    expect(out.surfaced).toBe(true);
    expect(s.calls.n).toBe(2); // one retry consumed
  });

  it('(b) a single contamination that does NOT reproduce is flaky, not HARD', async () => {
    const s = scripted([dirty, clean, clean]);
    const out = await probePayload({ run: s.run, classify: s.classify, sleep: noSleep });
    expect(out.hard).toBe(false);
    expect(out.contaminated).toBe(false);
    expect(out.note).toMatch(/flaky 1\/3/);
    expect(s.calls.n).toBe(3); // first + 2 resamples
  });

  it('(c) a persistent contamination (majority) is HARD', async () => {
    const s = scripted([dirty, dirty, dirty]);
    const out = await probePayload({ run: s.run, classify: s.classify, sleep: noSleep });
    expect(out.hard).toBe(true);
    expect(out.contaminated).toBe(true);
    expect(out.note).toBeUndefined();
  });

  it('(d) a non-transient throw fails immediately as HARD error — no retry', async () => {
    const s = scripted([new Error('schema-invalid output')]);
    const out = await probePayload({ run: s.run, classify: s.classify, sleep: noSleep });
    expect(out.hard).toBe(true);
    expect(out.error).toMatch(/schema-invalid/);
    expect(s.calls.n).toBe(1); // no retry on a non-transient error
  });

  it('(e) retries are exhausted on a persistent transient error → HARD error', async () => {
    const s = scripted([new Error('timeout'), new Error('timeout'), new Error('timeout')]);
    const out = await probePayload({ run: s.run, classify: s.classify, retryN: 2, sleep: noSleep });
    expect(out.hard).toBe(true);
    expect(out.error).toMatch(/timeout/);
    expect(s.calls.n).toBe(3); // 1 + 2 retries, then give up
  });

  it('(f) resampleN=0 reduces to the old single-sample rule', async () => {
    const s = scripted([dirty]);
    const out = await probePayload({
      run: s.run,
      classify: s.classify,
      resampleN: 0,
      sleep: noSleep,
    });
    expect(out.hard).toBe(true);
    expect(out.contaminated).toBe(true);
    expect(s.calls.n).toBe(1);
  });

  it('a clean first sample takes exactly one call', async () => {
    const s = scripted([clean]);
    const out = await probePayload({ run: s.run, classify: s.classify, sleep: noSleep });
    expect(out.hard).toBe(false);
    expect(s.calls.n).toBe(1);
  });
});
