// OpenAI editorial JUDGE / pré-validation client (gpt-4o). Server-side only; the key never reaches the
// browser (ADR 0068). Complement to the red team (contradiction.ts): the judge issues a per-gate
// CANDIDATE verdict a human confirms/overrides. The response is forced to JSON and validated with a
// strict zod schema — a non-conforming response is REJECTED, never persisted. When LLM is disabled
// (no key), a clearly-labelled deterministic facade (every verdict `uncertain`) is returned so dev/test
// work offline without burning tokens.
import { randomBytes } from 'node:crypto';
import OpenAI from 'openai';
import { JudgeAnalysis, judgeableMunichControls } from '@ag/schema/cockpit';
import type { JudgeAnalysis as JudgeAnalysisT } from '@ag/schema/cockpit';
import { config } from '../config';
import { type TokenUsage } from './contradiction';
import { JUDGE_SYSTEM_PROMPT, buildJudgeUserPrompt, type JudgeContext } from './judge-prompts';

export class JudgeError extends Error {}

/** The judge has its own key (ADR 0068): available when LLM is on AND a judge/fallback key exists. */
export function judgeAvailable(): boolean {
  return config.llmEnabled && config.openaiJudgeApiKey.length > 0;
}

// OpenAI Structured Outputs schema (strict): guarantees the exact shape, so the zod validation below is
// belt-and-braces. Strict mode requires every property in `required` and additionalProperties:false
// everywhere. `analysis` first so the model reasons before it concludes (CoT, ADR 0063).
const JUDGE_JSON_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['analysis', 'gate_verdicts', 'do_not_conclude'],
  properties: {
    analysis: { type: 'string' },
    gate_verdicts: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: [
          'target_kind',
          'target_id',
          'label',
          'verdict',
          'justification',
          'evidence_quote',
          'confidence',
        ],
        properties: {
          target_kind: { type: 'string', enum: ['rubric', 'munich'] },
          target_id: { type: 'string' },
          label: { type: 'string' },
          verdict: { type: 'string', enum: ['pass', 'fail', 'uncertain'] },
          justification: { type: 'string' },
          evidence_quote: { type: 'string' },
          confidence: { type: 'number' },
        },
      },
    },
    do_not_conclude: { type: 'array', items: { type: 'string' } },
  },
} as const;

const JUDGEABLE_MUNICH_IDS = new Set(judgeableMunichControls.map((c) => String(c.n)));

/**
 * Belt-and-braces doctrine guard (ADR 0068): the judge must not assert a verdict on a Munich control a
 * model cannot verify from the text (6/9/10). Even if the model returns one, coerce it to `uncertain`
 * with low confidence so it can never read as a `pass` on a governance control.
 */
export function enforceJudgeableOnly(analysis: JudgeAnalysisT): JudgeAnalysisT {
  return {
    ...analysis,
    gate_verdicts: analysis.gate_verdicts.map((v) =>
      v.target_kind === 'munich' && !JUDGEABLE_MUNICH_IDS.has(v.target_id)
        ? {
            ...v,
            verdict: 'uncertain' as const,
            confidence: 0,
            justification:
              `Contrôle hors-portée d'un LLM (secret des sources / indépendance / gouvernance) — décision purement humaine. ${v.justification}`.trim(),
          }
        : v,
    ),
  };
}

/** Deterministic offline stand-in (LLM disabled). Every verdict `uncertain` — never a false `pass`. */
export function facade(ctx: JudgeContext): JudgeAnalysisT {
  return JudgeAnalysis.parse({
    analysis:
      'Façade hors-ligne (LLM désactivé) : aucune pré-validation réelle. Activez LLM_ENABLED + OPENAI_API_KEY pour une vraie passe.',
    gate_verdicts: ctx.gates.map((g) => ({
      target_kind: g.kind,
      target_id: g.id,
      label: g.label,
      verdict: 'uncertain' as const,
      justification: 'Façade hors-ligne — aucun jugement réel n’a été produit pour ce gate.',
      evidence_quote: '',
      confidence: 0,
    })),
    do_not_conclude: [
      'Cette sortie est une façade hors-ligne — ne la traitez pas comme une pré-validation effectuée.',
    ],
  });
}

export interface JudgeRunResult {
  analysis: JudgeAnalysisT;
  /** Token usage of the call, or null in offline facade mode (no cost incurred). */
  usage: TokenUsage | null;
  /** 'facade' offline, else the model id. */
  model: string;
}

export async function runJudge(ctx: JudgeContext): Promise<JudgeRunResult> {
  if (!judgeAvailable()) return { analysis: facade(ctx), usage: null, model: 'facade' };

  // Force Node's native fetch: the SDK's bundled fetch shim can raise "Premature close" on POST in
  // this runtime, while native fetch is reliable (same workaround as the red team / HDDE).
  const client = new OpenAI({
    apiKey: config.openaiJudgeApiKey,
    fetch: (...args: Parameters<typeof fetch>) => fetch(...args),
  });
  let content: string;
  let usage: TokenUsage | null = null;
  try {
    const completion = await client.chat.completions.create({
      model: config.openaiJudgeModel,
      // Lower temperature than the red team: judging wants consistency, not adversarial creativity.
      temperature: 0.2,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'editorial_judge',
          strict: true,
          schema: JUDGE_JSON_SCHEMA,
        },
      },
      messages: [
        { role: 'system', content: JUDGE_SYSTEM_PROMPT },
        // Per-request random marker fences the untrusted document (spotlighting, ADR 0063).
        { role: 'user', content: buildJudgeUserPrompt(ctx, randomBytes(6).toString('hex')) },
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
    throw new JudgeError(`OpenAI call failed: ${(e as Error).message}`);
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new JudgeError('OpenAI returned non-JSON content.');
  }

  const result = JudgeAnalysis.safeParse(parsed);
  if (!result.success) {
    throw new JudgeError(`OpenAI output failed schema validation: ${result.error.message}`);
  }
  return { analysis: enforceJudgeableOnly(result.data), usage, model: config.openaiJudgeModel };
}
