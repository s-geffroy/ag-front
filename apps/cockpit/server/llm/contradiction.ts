// OpenAI editorial contradiction client (gpt-4o). Server-side only; the key never reaches the
// browser (ADR 0039). The response is forced to JSON and validated with a strict zod schema — a
// non-conforming response is REJECTED, never persisted. When LLM is disabled (no key), a clearly
// -labelled deterministic facade is returned so dev/test work offline without burning tokens.
import { randomBytes } from 'node:crypto';
import OpenAI from 'openai';
import { ContradictionAnalysis } from '@ag/schema/cockpit';
import type { ContradictionAnalysis as ContradictionAnalysisT } from '@ag/schema/cockpit';
import { config } from '../config';
import { SYSTEM_PROMPT, buildUserPrompt, type EditorialContext } from './prompts';

export class ContradictionError extends Error {}

// OpenAI Structured Outputs schema (strict): guarantees the exact shape, so the zod validation below
// is a belt-and-braces check rather than a frequent failure point. Strict mode requires every
// property in `required` and additionalProperties:false everywhere.
const CONTRADICTION_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  // Order matters: `analysis` first so the model reasons before it concludes (CoT), the `summary`
  // last so it follows from the detailed findings (ADR 0063).
  required: ['analysis', 'findings', 'open_questions', 'summary', 'do_not_conclude'],
  properties: {
    analysis: { type: 'string' },
    findings: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['claim', 'objection', 'basis', 'severity', 'suggested_test'],
        properties: {
          claim: { type: 'string' },
          objection: { type: 'string' },
          basis: {
            type: 'string',
            enum: [
              'internal_inconsistency',
              'unsupported_claim',
              'source_gap',
              'overstated_certainty',
              'missing_counterargument',
            ],
          },
          severity: { type: 'integer' },
          suggested_test: { type: 'string' },
        },
      },
    },
    open_questions: { type: 'array', items: { type: 'string' } },
    summary: { type: 'string' },
    do_not_conclude: { type: 'array', items: { type: 'string' } },
  },
} as const;

/** Deterministic offline stand-in (LLM disabled). Clearly labelled so it's never mistaken for a run. */
export function facade(): ContradictionAnalysisT {
  return ContradictionAnalysis.parse({
    analysis:
      'Façade hors-ligne (LLM désactivé) : aucun raisonnement adverse réel. Activez LLM_ENABLED + OPENAI_API_KEY pour une vraie passe.',
    summary:
      'Façade hors-ligne (LLM désactivé) : la contradiction automatique n’a pas été exécutée. Activez LLM_ENABLED + OPENAI_API_KEY pour lancer une vraie passe.',
    findings: [
      {
        claim: 'Thèse centrale du document.',
        objection:
          'Aucune passe LLM n’a tourné — cette entrée est un gabarit, pas une objection réelle.',
        basis: 'unsupported_claim',
        severity: 0,
        suggested_test: 'Activer le LLM puis relancer la contradiction sur ce document.',
      },
    ],
    open_questions: ['Quelles affirmations centrales ne sont pas encore sourcées ?'],
    do_not_conclude: [
      'Cette sortie est une façade hors-ligne — ne la traitez pas comme une revue effectuée.',
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
export interface ContradictionRunResult {
  analysis: ContradictionAnalysisT;
  /** Token usage of the call, or null in offline facade mode (no cost incurred). */
  usage: TokenUsage | null;
  /** 'facade' offline, else the model id. */
  model: string;
}

export async function runContradiction(ctx: EditorialContext): Promise<ContradictionRunResult> {
  if (!llmAvailable()) return { analysis: facade(), usage: null, model: 'facade' };

  // Force Node's native fetch: the SDK's bundled fetch shim can raise "Premature close" on POST in
  // this runtime, while native fetch is reliable (same workaround as the HDDE red team).
  const client = new OpenAI({
    apiKey: config.openaiApiKey,
    fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
  });
  let content: string;
  let usage: TokenUsage | null = null;
  try {
    const completion = await client.chat.completions.create({
      model: config.openaiModel,
      temperature: 0.4,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'editorial_contradiction',
          strict: true,
          schema: CONTRADICTION_JSON_SCHEMA,
        },
      },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        // Per-request random marker fences the untrusted document (spotlighting, ADR 0063).
        { role: 'user', content: buildUserPrompt(ctx, randomBytes(6).toString('hex')) },
      ],
    });
    content = completion.choices[0]?.message?.content ?? '';
    if (completion.usage) {
      usage = {
        prompt_tokens: completion.usage.prompt_tokens ?? 0,
        completion_tokens: completion.usage.completion_tokens ?? 0,
        total_tokens: completion.usage.total_tokens ?? 0,
      };
    }
  } catch (e) {
    throw new ContradictionError(`OpenAI call failed: ${(e as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new ContradictionError('OpenAI returned non-JSON content.');
  }

  const result = ContradictionAnalysis.safeParse(parsed);
  if (!result.success) {
    throw new ContradictionError(`OpenAI output failed schema validation: ${result.error.message}`);
  }
  return { analysis: result.data, usage, model: config.openaiModel };
}
