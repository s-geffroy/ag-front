// Centralised runtime configuration for VERDICT (ADR 0041). Mirrors hdde-api/config.ts. Paths resolve
// from the package root so the app behaves the same under `tsx` (dev) and the Docker `start` command.

import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url)); // .../apps/verdict-api/server
export const PACKAGE_ROOT = resolve(here, '..'); // .../apps/verdict-api

const fromRoot = (p: string): string =>
  p === ':memory:' || p.startsWith('/') ? p : join(PACKAGE_ROOT, p);

export const config = {
  appEnv: process.env.APP_ENV ?? 'development',
  host: process.env.HOST ?? '0.0.0.0',
  port: Number(process.env.PORT ?? 8095),

  dbPath: fromRoot(process.env.VERDICT_DB_PATH ?? 'data/verdict.sqlite'),
  exportsDir: fromRoot(process.env.VERDICT_EXPORTS_DIR ?? 'data/exports'),
  templatesDir: fromRoot(process.env.VERDICT_TEMPLATES_DIR ?? 'templates/output_templates'),

  // Opaque server-side sessions (no signing secret — see hdde-api/config.ts note).
  allowSignup: process.env.ALLOW_SIGNUP === 'true',
  cookieSecure: process.env.COOKIE_SECURE === 'true',

  // HDDE internal read-only API (ADR 0042). VERDICT pulls diagnostic packets to pre-fill PESTEL/SWOT.
  // Reached by Docker service name on the compose network; never via Caddy. Empty URL → ingest is
  // unavailable and the cockpit falls back to manual entry.
  hddeInternalUrl: process.env.HDDE_INTERNAL_URL ?? '',
  internalApiToken: process.env.INTERNAL_API_TOKEN ?? '',

  // OpenAI red team (ADR 0034). Set the key in docker/.env to enable; empty → offline facade.
  llmEnabled: process.env.LLM_ENABLED === 'true',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o',
  llmMaxCallsPerUserPerDay: Number(process.env.LLM_MAX_CALLS_PER_USER_PER_DAY ?? 50),
  llmMaxCostPerUserPerDayUsd: Number(process.env.LLM_MAX_COST_PER_USER_PER_DAY_USD ?? 5),
  llmMaxOutputTokens: Number(process.env.LLM_MAX_OUTPUT_TOKENS ?? 1500),
  llmTimeoutMs: Number(process.env.LLM_TIMEOUT_MS ?? 30_000),
  // NB: VERDICT does NOT call the Chokepoints API directly — chokepoint candidates (and, later, the
  // per-corridor CVI assessment) arrive only via the single HDDE ingestion contract (ADR 0042).
} as const;
