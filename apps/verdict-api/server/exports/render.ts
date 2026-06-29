// Export renderer — nunjucks (Jinja2-compatible) over the FR/EN decision templates → Markdown, plus a
// canonical decision.json. Outputs land under data/exports/<decision_id>/ (latest). Mirrors the
// hdde-api export pattern. The decision note is the Premium deliverable (ADR 0041/0043).
import nunjucks from 'nunjucks';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from '../config';
import {
  getDecision, listOptions, listScores, listPestel, listSwot, latestAudit,
} from '../db/repo';

const MARKDOWN_TEMPLATES = ['decision.fr.md.j2', 'decision.en.md.j2'] as const;

export interface RenderedExport {
  filename: string;
  content: string;
}

let env: nunjucks.Environment | null = null;
function getEnv(): nunjucks.Environment {
  if (!env) {
    env = nunjucks.configure(config.templatesDir, { autoescape: false, throwOnUndefined: false });
  }
  return env;
}

function parse<T>(text: unknown, fallback: T): T {
  if (text === null || text === undefined) return fallback;
  try {
    return JSON.parse(String(text)) as T;
  } catch {
    return fallback;
  }
}

/** Assemble the full, template-ready view of a decision from its stored rows. */
export function assembleDecision(decisionId: string): Record<string, unknown> | null {
  const decision = getDecision(decisionId);
  if (!decision) return null;

  const auditRow = latestAudit(decisionId);
  const audit = auditRow
    ? {
        audit_status: auditRow.audit_status,
        ...parse<{ blocking_errors: string[]; warnings: string[] }>(auditRow.result_json, {
          blocking_errors: [],
          warnings: [],
        }),
      }
    : null;

  return {
    decision: {
      ...decision,
      human_validation: Boolean(decision.human_validation),
      truth_test: parse<Record<string, unknown> | null>(decision.truth_test_json, null),
      red_flags: parse<unknown[]>(decision.red_flags_json, []),
      weight_profile: parse<Record<string, unknown> | null>(decision.weight_profile_json, null),
      cvi: parse<Record<string, unknown> | null>(decision.cvi_json, null),
    },
    pestel: listPestel(decisionId),
    swot: listSwot(decisionId),
    options: listOptions(decisionId).map((o) => ({ ...o, canvas: parse(o.canvas_json, {}) })),
    scores: listScores(decisionId).map((s) => ({
      ...s,
      criteria: parse(s.criteria_json, {}),
      adjustment_reasons: parse<string[]>(s.adjustment_reasons_json, []),
    })),
    audit,
    generated_at: new Date().toISOString(),
  };
}

/** Render FR/EN markdown + decision.json for a decision. Returns in-memory files (also written to disk). */
export function renderDecisionExports(decisionId: string): RenderedExport[] | null {
  const ctx = assembleDecision(decisionId);
  if (!ctx) return null;

  const outputs: RenderedExport[] = MARKDOWN_TEMPLATES.map((tpl) => ({
    filename: tpl.replace(/\.j2$/, ''),
    content: getEnv().render(tpl, ctx),
  }));
  outputs.push({ filename: 'decision.json', content: JSON.stringify(ctx, null, 2) });

  const dir = join(config.exportsDir, decisionId);
  mkdirSync(dir, { recursive: true });
  for (const out of outputs) writeFileSync(join(dir, out.filename), out.content, 'utf-8');

  return outputs;
}
