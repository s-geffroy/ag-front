// OpenAI red-team client for VERDICT arbitrage (ADR 0034/0043). Server-side only; the key never
// reaches the browser. Response forced to strict JSON and validated with zod — non-conforming output
// is REJECTED, never persisted. With no key, a clearly-labelled offline facade is returned so
// dev/test work without paid calls. Mirrors hdde-api/llm/openai.
import { randomBytes } from 'node:crypto';
import OpenAI from 'openai';
import { RedTeamOutput } from '@ag/schema/verdict';
import type { RedTeamOutput as RedTeamOutputT } from '@ag/schema/verdict';
import { config } from '../config';
import {
  SYSTEM_PROMPT,
  buildUserPrompt,
  type RedTeamRole,
  type VerdictRedTeamContext,
} from './verdict-prompts';

export class RedTeamError extends Error {}

// OpenAI Structured Outputs schema (strict): every property required + additionalProperties:false.
const REDTEAM_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  // Order matters: `analysis` first so the model reasons before it concludes (CoT), the summary
  // (main_objection) last so it follows from the detail (ADR 0063).
  required: [
    'analysis',
    'attacked_assumptions',
    'overestimations',
    'missing_proofs',
    'undervalued_alternatives',
    'could_change_recommendation',
    'reason',
    'main_objection',
    'do_not_conclude',
  ],
  properties: {
    analysis: { type: 'string' },
    attacked_assumptions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['assumption', 'why_fragile', 'severity', 'required_test'],
        properties: {
          assumption: { type: 'string' },
          why_fragile: { type: 'string' },
          severity: { type: 'integer' },
          required_test: { type: 'string' },
        },
      },
    },
    overestimations: { type: 'array', items: { type: 'string' } },
    missing_proofs: { type: 'array', items: { type: 'string' } },
    undervalued_alternatives: { type: 'array', items: { type: 'string' } },
    could_change_recommendation: { type: 'boolean' },
    reason: { type: 'string' },
    main_objection: { type: 'string' },
    do_not_conclude: { type: 'array', items: { type: 'string' } },
  },
} as const;

function facade(role: RedTeamRole, targetOptionId: string | null): RedTeamOutputT {
  return RedTeamOutput.parse({
    role,
    target_option_id: targetOptionId,
    analysis:
      'Façade hors-ligne (LLM désactivé) : aucun raisonnement adversarial réel. Activez LLM_ENABLED + OPENAI_API_KEY pour une vraie passe.',
    main_objection:
      'Façade hors-ligne (LLM désactivé) : vérifier que l’option retenue ne repose pas sur une hypothèse critique non prouvée.',
    attacked_assumptions: [
      {
        assumption: 'L’option retenue est exécutable et son hypothèse critique tient.',
        why_fragile: 'Aucune preuve directe (niveau ≥4) n’est fournie pour l’hypothèse critique.',
        severity: 4,
        required_test:
          'Définir un test de vérité borné (coût/délai) qui peut invalider l’option avant tout engagement.',
      },
    ],
    overestimations: ['La valeur stratégique peut être surestimée sans preuve directe.'],
    missing_proofs: ['Preuve directe de faisabilité de l’option retenue.'],
    undervalued_alternatives: [
      'Une alternative minimale moins coûteuse mérite d’être testée d’abord.',
    ],
    could_change_recommendation: true,
    reason: 'Sans preuve ≥4, TESTER est préférable à FAIRE.',
    do_not_conclude: [
      'Ne pas traiter cette sortie comme une preuve ni comme un verdict sans validation analyste.',
    ],
  });
}

export function llmAvailable(): boolean {
  return config.llmEnabled && config.openaiApiKey.length > 0;
}

export interface TokenUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}
export interface RedTeamRunResult {
  output: RedTeamOutputT;
  usage: TokenUsage | null;
  model: string;
}

export async function runRedTeam(
  role: RedTeamRole,
  ctx: VerdictRedTeamContext,
): Promise<RedTeamRunResult> {
  const targetOptionId = ctx.targetOption?.option_id ?? null;
  if (!llmAvailable())
    return { output: facade(role, targetOptionId), usage: null, model: 'facade' };

  // Force Node's native fetch (the SDK's bundled shim raises "Premature close" on POST in this runtime).
  const client = new OpenAI({
    apiKey: config.openaiApiKey,
    fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
  });
  let content: string;
  let usage: TokenUsage | null = null;
  try {
    const completion = await client.chat.completions.create(
      {
        model: config.openaiModel,
        temperature: 0.4,
        max_tokens: config.llmMaxOutputTokens,
        response_format: {
          type: 'json_schema',
          json_schema: { name: 'verdict_red_team', strict: true, schema: REDTEAM_JSON_SCHEMA },
        },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          // Per-request random marker fences untrusted case data (spotlighting, ADR 0063).
          { role: 'user', content: buildUserPrompt(role, ctx, randomBytes(6).toString('hex')) },
        ],
      },
      { signal: AbortSignal.timeout(config.llmTimeoutMs) },
    );
    content = completion.choices[0]?.message?.content ?? '';
    if (completion.usage) {
      usage = {
        prompt_tokens: completion.usage.prompt_tokens ?? 0,
        completion_tokens: completion.usage.completion_tokens ?? 0,
        total_tokens: completion.usage.total_tokens ?? 0,
      };
    }
  } catch (e) {
    throw new RedTeamError(`OpenAI call failed: ${(e as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new RedTeamError('OpenAI returned non-JSON content.');
  }

  const result = RedTeamOutput.safeParse({
    ...(parsed as object),
    role,
    target_option_id: targetOptionId,
  });
  if (!result.success) {
    throw new RedTeamError(`OpenAI output failed schema validation: ${result.error.message}`);
  }
  return { output: result.data, usage, model: config.openaiModel };
}
