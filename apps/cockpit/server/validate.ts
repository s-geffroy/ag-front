import { munichControls, type Deliverable } from '@ag/schema/cockpit';

// Pure decision logic for POST /deliverables/:id/validate (ADR 0046 / 0068), extracted so it can be
// unit-tested without an HTTP server: which target is addressable, the `compliance_done` invariant,
// and the before/after values a nominative validation/rejection produces.

export const GATE_KEYS = new Set<string>([
  'sources_ok',
  'llm_draft_done',
  'contradiction_done',
  'compliance_done',
  'human_review_done',
  'cvi_justified',
]);
export const MUNICH_IDS = new Set(munichControls.map((c) => String(c.n)));

export type ValidationDecision = 'validated' | 'rejected';
// A gate boolean, or a Munich status ('ok' | 'todo' | 'na'), or undefined when never set.
export type ValidationTargetValue = boolean | 'ok' | 'todo' | 'na' | undefined;

export type ValidateResolution =
  | { ok: false; status: number; error: string }
  | { ok: true; isMunich: boolean; before: ValidationTargetValue; after: boolean | 'ok' | 'todo' };

/** All 10 Munich controls are `ok` — the precondition for ticking `compliance_done` (ADR 0037). */
export function munichComplete(d: Deliverable): boolean {
  return munichControls.every((c) => d.munich?.[String(c.n)] === 'ok');
}

export function resolveGateValidation(
  d: Deliverable,
  input: {
    target_kind: 'gate' | 'munich' | 'cvi';
    target_id: string;
    decision: ValidationDecision;
  },
): ValidateResolution {
  const { target_kind, target_id, decision } = input;

  // Target must address a real gate/control, so a bad payload can't write a meaningless journal row.
  if (
    (target_kind === 'gate' && !GATE_KEYS.has(target_id)) ||
    (target_kind === 'cvi' && target_id !== 'cvi_justified')
  ) {
    return { ok: false, status: 400, error: 'unknown_gate' };
  }
  if (target_kind === 'munich' && !MUNICH_IDS.has(target_id)) {
    return { ok: false, status: 400, error: 'unknown_munich_control' };
  }

  const isMunich = target_kind === 'munich';
  const before: ValidationTargetValue = isMunich
    ? d.munich?.[target_id]
    : d.gates[target_id as keyof Deliverable['gates']];

  // compliance_done means the whole Munich checklist holds — refuse to tick it otherwise (ADR 0037).
  if (
    decision === 'validated' &&
    target_kind === 'gate' &&
    target_id === 'compliance_done' &&
    !munichComplete(d)
  ) {
    return { ok: false, status: 400, error: 'munich_incomplete' };
  }

  // A validation ticks the target; a rejection explicitly un-ticks it — both nominative, both journalled.
  const after = decision === 'validated' ? (isMunich ? 'ok' : true) : isMunich ? 'todo' : false;
  return { ok: true, isMunich, before, after };
}
