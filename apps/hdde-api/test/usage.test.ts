// LLM cost tracking: deterministic pricing + usage ledger aggregation (ADR 0034).
import { describe, it, expect, beforeAll } from 'vitest';

process.env.HDDE_DB_PATH = ':memory:';

let computeCost: (typeof import('../server/llm/pricing'))['computeCost'];
let recordLlmUsage: (typeof import('../server/db/repo'))['recordLlmUsage'];
let usageSince: (typeof import('../server/db/repo'))['usageSince'];

beforeAll(async () => {
  const { getDb } = await import('../server/db/index');
  getDb(); // migrate in-memory DB
  ({ computeCost } = await import('../server/llm/pricing'));
  ({ recordLlmUsage, usageSince } = await import('../server/db/repo'));
});

describe('LLM pricing', () => {
  it('computes gpt-4o cost from list prices', () => {
    // 1M input ($2.50) + 1M output ($10.00) = $12.50
    expect(computeCost('gpt-4o', 1_000_000, 1_000_000)).toBeCloseTo(12.5, 6);
    expect(computeCost('gpt-4o', 0, 0)).toBe(0);
  });
});

describe('LLM usage ledger', () => {
  it('aggregates recorded usage', () => {
    expect(usageSince(null).calls).toBe(0);
    recordLlmUsage({
      case_id: null,
      user_id: null,
      model: 'gpt-4o',
      prompt_tokens: 1000,
      completion_tokens: 500,
      total_tokens: 1500,
      cost_usd: computeCost('gpt-4o', 1000, 500),
    });
    const all = usageSince(null);
    expect(all.calls).toBe(1);
    expect(all.total_tokens).toBe(1500);
    expect(all.cost_usd).toBeGreaterThan(0);
  });
});
