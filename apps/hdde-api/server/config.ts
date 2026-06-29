// Centralised runtime configuration. All paths resolve from the package root so the app behaves the
// same under `tsx` (dev) and the Docker `start` command.

import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url)); // .../apps/hdde-api/server
export const PACKAGE_ROOT = resolve(here, '..'); // .../apps/hdde-api

const fromRoot = (p: string): string =>
  p === ':memory:' || p.startsWith('/') ? p : join(PACKAGE_ROOT, p);

export const config = {
  appEnv: process.env.APP_ENV ?? 'development',
  host: process.env.HOST ?? '0.0.0.0',
  port: Number(process.env.PORT ?? 8090),

  dbPath: fromRoot(process.env.HDDE_DB_PATH ?? 'data/hdde.sqlite'),
  exportsDir: fromRoot(process.env.HDDE_EXPORTS_DIR ?? 'data/exports'),
  packDir: fromRoot(
    process.env.DOMAIN_PACK_PATH ?? 'domain_packs/enterprise_hidden_dependency_discovery',
  ),

  // NB: no SESSION_SECRET — sessions are opaque random ids stored server-side (session.ts); nothing is
  // signed, so a secret would be misleading. Removed to avoid the audit trap (was dead config).
  allowSignup: process.env.ALLOW_SIGNUP === 'true',
  cookieSecure: process.env.COOKIE_SECURE === 'true',

  llmEnabled: process.env.LLM_ENABLED === 'true',
  openaiApiKey: process.env.OPENAI_API_KEY ?? '',
  openaiModel: process.env.OPENAI_MODEL ?? 'gpt-4o',
  // Per-analyst daily LLM budget — enforced BEFORE each call so a single account cannot run unbounded
  // paid red-team runs (financial DoS — ADR 0034). 0 disables that specific cap.
  llmMaxCallsPerUserPerDay: Number(process.env.LLM_MAX_CALLS_PER_USER_PER_DAY ?? 50),
  llmMaxCostPerUserPerDayUsd: Number(process.env.LLM_MAX_COST_PER_USER_PER_DAY_USD ?? 5),
  llmMaxOutputTokens: Number(process.env.LLM_MAX_OUTPUT_TOKENS ?? 1500),
  llmTimeoutMs: Number(process.env.LLM_TIMEOUT_MS ?? 30_000),

  // Chokepoints Read API: READ SCOPE ONLY, never read_tainted (ADR 0035).
  chokepointsApiUrl: process.env.CHOKEPOINTS_API_URL ?? '',
  chokepointsApiToken: process.env.CHOKEPOINTS_API_TOKEN ?? '',
} as const;
