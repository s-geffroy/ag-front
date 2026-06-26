// OpenAI red-team client (gpt-4o). Server-side only; the key never reaches the browser (ADR 0034).
// The response is forced to JSON and validated with a strict zod schema — a non-conforming response
// is REJECTED, never persisted. When LLM is disabled (no key), a clearly-labelled deterministic
// facade is returned so dev/test work offline.
import OpenAI from 'openai';
import { RedTeamOutput } from '@ag/schema/hdde';
import type { RedTeamOutput as RedTeamOutputT } from '@ag/schema/hdde';
import { config } from '../config';
import type { Persona } from '../engine';
import { SYSTEM_PROMPT, buildUserPrompt, type RedTeamContext } from './prompts';

export class RedTeamError extends Error {}

// OpenAI Structured Outputs schema (strict): guarantees the model returns the exact shape, so the
// zod validation below becomes a belt-and-braces check instead of a frequent failure point. Strict
// mode requires every property listed in `required` and additionalProperties:false everywhere.
const REDTEAM_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: [
    'main_objection',
    'attacked_assumptions',
    'possible_contradictions',
    'questions_to_ask',
    'verdict_pressure',
    'do_not_conclude',
  ],
  properties: {
    main_objection: { type: 'string' },
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
    possible_contradictions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['contradiction', 'basis', 'severity'],
        properties: {
          contradiction: { type: 'string' },
          basis: {
            type: 'string',
            enum: ['client_statement', 'evidence_gap', 'analyst_inference', 'provided_evidence'],
          },
          severity: { type: 'integer' },
        },
      },
    },
    questions_to_ask: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['question', 'purpose'],
        properties: { question: { type: 'string' }, purpose: { type: 'string' } },
      },
    },
    verdict_pressure: {
      type: 'object',
      additionalProperties: false,
      required: ['could_raise_verdict', 'could_lower_verdict', 'reason'],
      properties: {
        could_raise_verdict: { type: 'boolean' },
        could_lower_verdict: { type: 'boolean' },
        reason: { type: 'string' },
      },
    },
    do_not_conclude: { type: 'array', items: { type: 'string' } },
  },
} as const;

function facade(persona: Persona): RedTeamOutputT {
  return RedTeamOutput.parse({
    persona: persona.id,
    main_objection:
      'Façade hors-ligne (LLM désactivé) : valider si le fournisseur visible masque une dépendance de rang 2 non testée.',
    attacked_assumptions: [
      {
        assumption: 'Le fournisseur peut être substitué rapidement.',
        why_fragile:
          "Aucune preuve acceptée ne prouve la qualification, la capacité, le contrat ou le délai de livraison d'une alternative.",
        severity: 4,
        required_test:
          "Demander la qualification documentée et un test de capacité d'un fournisseur alternatif.",
      },
    ],
    possible_contradictions: [],
    questions_to_ask: [
      {
        question:
          'Quels composants de rang 2 bloqueraient la substitution même si un autre fournisseur est identifié ?',
        purpose: 'Révéler la dépendance cachée de second rang.',
      },
    ],
    verdict_pressure: {
      could_raise_verdict: true,
      could_lower_verdict: false,
      reason: 'Sans alternative prouvée, la posture peut passer de prepare à act.',
    },
    do_not_conclude: ['Ne pas traiter cette sortie comme une preuve sans validation analyste.'],
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
  /** Token usage of the call, or null in offline facade mode (no cost incurred). */
  usage: TokenUsage | null;
  model: string;
}

export async function runPersona(persona: Persona, ctx: RedTeamContext): Promise<RedTeamRunResult> {
  if (!llmAvailable()) return { output: facade(persona), usage: null, model: 'facade' };

  // Force Node 22's native fetch: the SDK's bundled fetch shim raises "Premature close" on POST in
  // this runtime, while native fetch is reliable (verified 0/3 vs 3/3).
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
        json_schema: { name: 'red_team_persona', strict: true, schema: REDTEAM_JSON_SCHEMA },
      },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: buildUserPrompt(persona, ctx) },
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
    throw new RedTeamError(`OpenAI call failed: ${(e as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new RedTeamError('OpenAI returned non-JSON content.');
  }

  const result = RedTeamOutput.safeParse({ ...(parsed as object), persona: persona.id });
  if (!result.success) {
    throw new RedTeamError(`OpenAI output failed schema validation: ${result.error.message}`);
  }
  return { output: result.data, usage, model: config.openaiModel };
}
