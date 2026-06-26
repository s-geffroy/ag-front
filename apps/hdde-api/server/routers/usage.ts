// LLM cost reporting (ADR 0034). Aggregates the llm_usage ledger into day / week (Monday) / month /
// all-time windows. Authenticated; visible to every analyst so spend is transparent.
import { Router } from 'express';
import { requireAuth } from '../auth/middleware';
import { usageSince, recentLlmUsage } from '../db/repo';
import { config } from '../config';

export const usageRouter = Router();

/** Format a Date as a SQLite UTC datetime boundary 'YYYY-MM-DD HH:MM:SS'. */
function sqliteUtc(d: Date): string {
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

function boundaries(now: Date): { day: string; week: string; month: string } {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const d = now.getUTCDate();
  const startOfDay = new Date(Date.UTC(y, m, d));
  // ISO week: Monday = 1 … Sunday = 7. Roll back to Monday.
  const dow = now.getUTCDay() === 0 ? 7 : now.getUTCDay();
  const startOfWeek = new Date(Date.UTC(y, m, d - (dow - 1)));
  const startOfMonth = new Date(Date.UTC(y, m, 1));
  return {
    day: sqliteUtc(startOfDay),
    week: sqliteUtc(startOfWeek),
    month: sqliteUtc(startOfMonth),
  };
}

usageRouter.get('/llm/summary', requireAuth, (_req, res) => {
  const b = boundaries(new Date());
  res.json({
    currency: 'USD',
    model: config.openaiModel,
    llm_enabled: config.llmEnabled && config.openaiApiKey.length > 0,
    today: usageSince(b.day),
    week: usageSince(b.week),
    month: usageSince(b.month),
    all_time: usageSince(null),
    recent: recentLlmUsage(10),
  });
});
