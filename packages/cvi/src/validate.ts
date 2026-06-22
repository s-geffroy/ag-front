import { CviAssessment } from './assessment';

export type CviValidationIssue = { code: string; message: string };
export type CviValidationResult =
  | { ok: true; issues: []; data: CviAssessment }
  | { ok: false; issues: CviValidationIssue[]; data?: undefined };

/**
 * Validate a CVI assessment against shape + methodology rules.
 *
 * Hard rule (playbook): **no aggregated 0–100 score without documented methodology**.
 * Also: a 0–100 scale needs an aggregate_score; a 0–5 scale needs per-dimension scores.
 */
export function validateCvi(input: unknown): CviValidationResult {
  const parsed = CviAssessment.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      issues: parsed.error.issues.map((i) => ({ code: 'schema', message: i.message })),
    };
  }

  const a = parsed.data;
  const issues: CviValidationIssue[] = [];

  if (a.scale === '0-100') {
    if (a.aggregate_score === undefined) {
      issues.push({ code: 'aggregate_missing', message: 'scale "0-100" requires an aggregate_score.' });
    }
    if (!a.methodology_documented) {
      issues.push({
        code: 'methodology_required',
        message: 'No 0–100 aggregate score without documented methodology.',
      });
    }
  }

  if (a.scale === '0-5' && (!a.dimensions || Object.keys(a.dimensions).length === 0)) {
    issues.push({ code: 'dimensions_missing', message: 'scale "0-5" requires per-dimension scores.' });
  }

  return issues.length === 0 ? { ok: true, issues: [], data: a } : { ok: false, issues };
}

/** Throwing variant — returns the parsed assessment or raises with the joined issues. */
export function assertCvi(input: unknown): CviAssessment {
  const r = validateCvi(input);
  if (!r.ok) {
    throw new Error('Invalid CVI assessment: ' + r.issues.map((i) => i.message).join('; '));
  }
  return r.data;
}
