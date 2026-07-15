// Thin typed data-access layer over better-sqlite3. JSON columns are stored as TEXT and parsed here.
// Mirrors the hdde-api repo conventions (tx, safeJson, JSON-as-TEXT). See ADR 0041.
import { getDb, newId } from './index';
import type { AuditInput } from '@ag/verdict';

type Row = Record<string, unknown>;
const db = () => getDb();

function tx<T>(fn: () => T): T {
  return db().transaction(fn)();
}

function safeJson<T>(text: unknown, fallback: T, ctx: string): T {
  if (text === null || text === undefined) return fallback;
  try {
    return JSON.parse(String(text)) as T;
  } catch {
    console.error(`[verdict-api] corrupt JSON in ${ctx}; using fallback`);
    return fallback;
  }
}

// ---------------------------------------------------------------- users + sessions (mirror HDDE)
export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  role: string;
  is_active: number;
}

export function createUser(email: string, passwordHash: string, role = 'analyst'): UserRow {
  const id = newId();
  db()
    .prepare('INSERT INTO users (id, email, password_hash, role) VALUES (?, ?, ?, ?)')
    .run(id, email.toLowerCase(), passwordHash, role);
  return getUserById(id)!;
}

export function getUserByEmail(email: string): UserRow | undefined {
  return db().prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as
    | UserRow
    | undefined;
}

export function getUserById(id: string): UserRow | undefined {
  return db().prepare('SELECT * FROM users WHERE id = ?').get(id) as UserRow | undefined;
}

export function createSession(userId: string, expiresAtIso: string): string {
  const id = newId();
  db()
    .prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)')
    .run(id, userId, expiresAtIso);
  return id;
}

export function getSessionUser(sessionId: string): UserRow | undefined {
  return db()
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > datetime('now') AND u.is_active = 1`,
    )
    .get(sessionId) as UserRow | undefined;
}

export function deleteSession(sessionId: string): void {
  db().prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

// ---------------------------------------------------------------- decisions
export interface DecisionInput {
  title: string;
  client_name?: string | null;
  sector?: string;
  situation?: string;
}

export function createDecision(ownerId: string, input: DecisionInput): Row {
  const id = newId();
  db()
    .prepare(
      `INSERT INTO decisions (id, owner_id, title, client_name, sector, situation)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      ownerId,
      input.title,
      input.client_name ?? null,
      input.sector ?? '',
      input.situation ?? '',
    );
  return getDecision(id)!;
}

export function getDecision(id: string): Row | undefined {
  return db().prepare('SELECT * FROM decisions WHERE id = ?').get(id) as Row | undefined;
}

export function listDecisions(ownerId: string, isAdmin: boolean): Row[] {
  return isAdmin
    ? (db().prepare('SELECT * FROM decisions ORDER BY updated_at DESC').all() as Row[])
    : (db()
        .prepare('SELECT * FROM decisions WHERE owner_id = ? ORDER BY updated_at DESC')
        .all(ownerId) as Row[]);
}

// Whitelisted patchable columns (string/JSON/flag). JSON fields are passed as already-serialised TEXT.
const DECISION_COLUMNS = new Set([
  'title',
  'client_name',
  'sector',
  'status',
  'situation',
  'proposed_verdict',
  'final_verdict',
  'selected_option_id',
  'confidence',
  'stop_threshold',
  'review_date',
  'human_validation',
  'why_faire_not_tester',
  'defer_reason',
  'reopening_signal',
  'abandonment_disposition',
  'truth_test_json',
  'weight_profile_json',
  'red_flags_json',
  'graph_json',
  'hdde_case_ref',
  'source_packet_id',
  'source_pack_hash',
  'ingested_at',
  'cvi_json',
]);

export function patchDecision(id: string, patch: Record<string, unknown>): Row | undefined {
  const entries = Object.entries(patch).filter(([k]) => DECISION_COLUMNS.has(k));
  if (entries.length === 0) return getDecision(id);
  const sets = entries.map(([k]) => `${k} = ?`).join(', ');
  const values = entries.map(([, v]) =>
    typeof v === 'boolean' ? (v ? 1 : 0) : (v as unknown as string),
  );
  db()
    .prepare(`UPDATE decisions SET ${sets}, updated_at = datetime('now') WHERE id = ?`)
    .run(...values, id);
  return getDecision(id);
}

function touchDecision(id: string): void {
  db().prepare(`UPDATE decisions SET updated_at = datetime('now') WHERE id = ?`).run(id);
}

// ---------------------------------------------------------------- options
export interface OptionInput {
  option_id: string;
  type: string;
  title: string;
  description?: string;
  critical_hypothesis?: string;
  main_evidence?: string;
  main_contradiction?: string;
  proof_level?: number;
  canvas?: unknown;
  source_kind?: string;
  source_ref?: string | null;
  status?: string;
}

/** Insert or replace an option by (decision_id, option_id). */
export function upsertOption(decisionId: string, input: OptionInput): Row {
  const existing = db()
    .prepare('SELECT id FROM decision_options WHERE decision_id = ? AND option_id = ?')
    .get(decisionId, input.option_id) as Row | undefined;
  const id = (existing?.id as string) ?? newId();
  db()
    .prepare(
      `INSERT INTO decision_options
         (id, decision_id, option_id, type, title, description, critical_hypothesis, main_evidence,
          main_contradiction, proof_level, canvas_json, source_kind, source_ref, status)
       VALUES (@id, @decision_id, @option_id, @type, @title, @description, @critical_hypothesis,
          @main_evidence, @main_contradiction, @proof_level, @canvas_json, @source_kind, @source_ref, @status)
       ON CONFLICT(decision_id, option_id) DO UPDATE SET
         type=@type, title=@title, description=@description, critical_hypothesis=@critical_hypothesis,
         main_evidence=@main_evidence, main_contradiction=@main_contradiction, proof_level=@proof_level,
         canvas_json=@canvas_json, source_kind=@source_kind, source_ref=@source_ref, status=@status`,
    )
    .run({
      id,
      decision_id: decisionId,
      option_id: input.option_id,
      type: input.type,
      title: input.title,
      description: input.description ?? '',
      critical_hypothesis: input.critical_hypothesis ?? '',
      main_evidence: input.main_evidence ?? '',
      main_contradiction: input.main_contradiction ?? '',
      proof_level: input.proof_level ?? 0,
      canvas_json: JSON.stringify(input.canvas ?? {}),
      source_kind: input.source_kind ?? 'manual',
      source_ref: input.source_ref ?? null,
      status: input.status ?? 'candidate',
    });
  touchDecision(decisionId);
  return db().prepare('SELECT * FROM decision_options WHERE id = ?').get(id) as Row;
}

export function listOptions(decisionId: string): Row[] {
  return db()
    .prepare('SELECT * FROM decision_options WHERE decision_id = ? ORDER BY created_at')
    .all(decisionId) as Row[];
}

export function deleteOption(decisionId: string, optionId: string): void {
  db()
    .prepare('DELETE FROM decision_options WHERE decision_id = ? AND option_id = ?')
    .run(decisionId, optionId);
  touchDecision(decisionId);
}

// ---------------------------------------------------------------- scores
export interface ScoreInput {
  option_id: string;
  criteria: Record<string, number>;
  raw_score?: number | null;
  adjusted_score?: number | null;
  adjustment_reasons?: string[];
}

export function upsertScore(decisionId: string, input: ScoreInput): Row {
  const existing = db()
    .prepare('SELECT id FROM decision_scores WHERE decision_id = ? AND option_id = ?')
    .get(decisionId, input.option_id) as Row | undefined;
  const id = (existing?.id as string) ?? newId();
  db()
    .prepare(
      `INSERT INTO decision_scores
         (id, decision_id, option_id, criteria_json, raw_score, adjusted_score, adjustment_reasons_json)
       VALUES (@id, @decision_id, @option_id, @criteria_json, @raw_score, @adjusted_score, @reasons)
       ON CONFLICT(decision_id, option_id) DO UPDATE SET
         criteria_json=@criteria_json, raw_score=@raw_score, adjusted_score=@adjusted_score,
         adjustment_reasons_json=@reasons`,
    )
    .run({
      id,
      decision_id: decisionId,
      option_id: input.option_id,
      criteria_json: JSON.stringify(input.criteria ?? {}),
      raw_score: input.raw_score ?? null,
      adjusted_score: input.adjusted_score ?? null,
      reasons: JSON.stringify(input.adjustment_reasons ?? []),
    });
  touchDecision(decisionId);
  return db().prepare('SELECT * FROM decision_scores WHERE id = ?').get(id) as Row;
}

export function listScores(decisionId: string): Row[] {
  return db()
    .prepare('SELECT * FROM decision_scores WHERE decision_id = ?')
    .all(decisionId) as Row[];
}

// ---------------------------------------------------------------- PESTEL + SWOT (candidate rows)
export interface PestelInput {
  category: string;
  statement: string;
  decisional_impact?: string;
  uncertainty?: string;
  source_kind?: string;
  source_ref?: string | null;
  status?: string;
}

export function createPestel(decisionId: string, input: PestelInput): Row {
  const id = newId();
  db()
    .prepare(
      `INSERT INTO pestel_factors
         (id, decision_id, category, statement, decisional_impact, uncertainty, source_kind, source_ref, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      decisionId,
      input.category,
      input.statement,
      input.decisional_impact ?? '',
      input.uncertainty ?? '',
      input.source_kind ?? 'manual',
      input.source_ref ?? null,
      input.status ?? 'candidate',
    );
  touchDecision(decisionId);
  return db().prepare('SELECT * FROM pestel_factors WHERE id = ?').get(id) as Row;
}

export function listPestel(decisionId: string): Row[] {
  return db()
    .prepare('SELECT * FROM pestel_factors WHERE decision_id = ? ORDER BY created_at')
    .all(decisionId) as Row[];
}

export interface SwotInput {
  quadrant: string;
  statement: string;
  is_hypothesis?: boolean;
  source_kind?: string;
  source_ref?: string | null;
  status?: string;
}

export function createSwot(decisionId: string, input: SwotInput): Row {
  const id = newId();
  db()
    .prepare(
      `INSERT INTO swot_items
         (id, decision_id, quadrant, statement, is_hypothesis, source_kind, source_ref, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      decisionId,
      input.quadrant,
      input.statement,
      input.is_hypothesis ? 1 : 0,
      input.source_kind ?? 'manual',
      input.source_ref ?? null,
      input.status ?? 'candidate',
    );
  touchDecision(decisionId);
  return db().prepare('SELECT * FROM swot_items WHERE id = ?').get(id) as Row;
}

export function listSwot(decisionId: string): Row[] {
  return db()
    .prepare('SELECT * FROM swot_items WHERE decision_id = ? ORDER BY created_at')
    .all(decisionId) as Row[];
}

/** Flip the candidate status of a pestel/swot row (validate/reject). Returns the updated row. */
export function setItemStatus(
  table: 'pestel_factors' | 'swot_items',
  decisionId: string,
  itemId: string,
  status: string,
): Row | undefined {
  const res = db()
    .prepare(`UPDATE ${table} SET status = ? WHERE id = ? AND decision_id = ?`)
    .run(status, itemId, decisionId);
  if (res.changes === 0) return undefined;
  touchDecision(decisionId);
  return db().prepare(`SELECT * FROM ${table} WHERE id = ?`).get(itemId) as Row;
}

export function deleteItem(
  table: 'pestel_factors' | 'swot_items',
  decisionId: string,
  itemId: string,
): boolean {
  const res = db()
    .prepare(`DELETE FROM ${table} WHERE id = ? AND decision_id = ?`)
    .run(itemId, decisionId);
  if (res.changes > 0) touchDecision(decisionId);
  return res.changes > 0;
}

// ---------------------------------------------------------------- red team
export function createSuggestion(decisionId: string, role: string, suggestion: unknown): Row {
  const id = newId();
  db()
    .prepare(
      'INSERT INTO redteam_suggestions (id, decision_id, role, suggestion_json) VALUES (?, ?, ?, ?)',
    )
    .run(id, decisionId, role, JSON.stringify(suggestion));
  return db().prepare('SELECT * FROM redteam_suggestions WHERE id = ?').get(id) as Row;
}

export function listSuggestions(decisionId: string): Row[] {
  return db()
    .prepare('SELECT * FROM redteam_suggestions WHERE decision_id = ? ORDER BY created_at DESC')
    .all(decisionId) as Row[];
}

export function reviewSuggestion(
  decisionId: string,
  id: string,
  status: string,
  userId: string,
): Row | undefined {
  const res = db()
    .prepare(
      `UPDATE redteam_suggestions SET status = ?, reviewed_by = ?, reviewed_at = datetime('now') WHERE id = ? AND decision_id = ?`,
    )
    .run(status, userId, id, decisionId);
  if (res.changes === 0) return undefined;
  return db().prepare('SELECT * FROM redteam_suggestions WHERE id = ?').get(id) as Row;
}

// ---------------------------------------------------------------- audit snapshots
export function createAuditSnapshot(
  decisionId: string,
  result: { audit_status: string; blocking_errors: string[]; warnings: string[] },
): Row {
  const id = newId();
  db()
    .prepare(
      `INSERT INTO audit_snapshots (id, decision_id, audit_status, blocking_errors_json, warnings_json, result_json)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      id,
      decisionId,
      result.audit_status,
      JSON.stringify(result.blocking_errors),
      JSON.stringify(result.warnings),
      JSON.stringify(result),
    );
  return db().prepare('SELECT * FROM audit_snapshots WHERE id = ?').get(id) as Row;
}

export function latestAudit(decisionId: string): Row | undefined {
  return db()
    .prepare('SELECT * FROM audit_snapshots WHERE decision_id = ? ORDER BY created_at DESC LIMIT 1')
    .get(decisionId) as Row | undefined;
}

// ---------------------------------------------------------------- bulk pre-fill ingestion
/** Persist a batch of pre-filled candidates atomically (Phase 3 ingest). */
export function ingestCandidates(
  decisionId: string,
  candidates: { pestel: PestelInput[]; swot: SwotInput[]; options: OptionInput[] },
): { pestel: number; swot: number; options: number } {
  return tx(() => {
    for (const p of candidates.pestel) createPestel(decisionId, p);
    for (const s of candidates.swot) createSwot(decisionId, s);
    for (const o of candidates.options) upsertOption(decisionId, o);
    return {
      pestel: candidates.pestel.length,
      swot: candidates.swot.length,
      options: candidates.options.length,
    };
  });
}

// ---------------------------------------------------------------- audit input assembly
/** Reconstruct the loose object shape the @ag/verdict audit engine expects from the stored rows. */
export function buildAuditInput(decisionId: string): AuditInput | undefined {
  const decision = getDecision(decisionId);
  if (!decision) return undefined;

  const options = listOptions(decisionId).map((o) => ({
    option_id: o.option_id as string,
    type: o.type as string,
    title: o.title as string,
    critical_hypothesis: o.critical_hypothesis as string,
    main_evidence: o.main_evidence as string,
    main_contradiction: o.main_contradiction as string,
    proof_level: o.proof_level as number,
  }));

  const scores = {
    weight_profile: safeJson<Record<string, unknown>>(
      decision.weight_profile_json,
      {},
      'weight_profile',
    ),
    scores: listScores(decisionId).map((s) => ({
      option_id: s.option_id as string,
      criteria: safeJson<Record<string, number>>(s.criteria_json, {}, 'criteria'),
      raw_score: s.raw_score as number | null,
      adjusted_score: s.adjusted_score as number | null,
      adjustment_reasons: safeJson<string[]>(s.adjustment_reasons_json, [], 'adjustment_reasons'),
    })),
  };

  const decisionObj: Record<string, unknown> = {
    final_verdict: decision.final_verdict,
    proposed_verdict: decision.proposed_verdict,
    confidence: decision.confidence,
    selected_option_id: decision.selected_option_id,
    human_validation: Boolean(decision.human_validation),
    stop_threshold: decision.stop_threshold,
    review_date: decision.review_date,
    why_faire_not_tester: decision.why_faire_not_tester,
    defer_reason: decision.defer_reason,
    reopening_signal: decision.reopening_signal,
    abandonment_disposition: decision.abandonment_disposition,
    red_flags: safeJson<unknown[]>(decision.red_flags_json, [], 'red_flags'),
    truth_test: safeJson<Record<string, unknown>>(decision.truth_test_json, {}, 'truth_test'),
  };

  return { decision: decisionObj, options, scores };
}

// ---------------------------------------------------------------- LLM usage ledger
export interface LlmUsageInput {
  decisionId: string | null;
  userId: string;
  model: string;
  promptTokens: number;
  completionTokens: number;
  costUsd: number;
}

export function recordLlmUsage(u: LlmUsageInput): void {
  db()
    .prepare(
      `INSERT INTO llm_usage (id, decision_id, user_id, kind, model, prompt_tokens, completion_tokens, total_tokens, cost_usd)
       VALUES (?, ?, ?, 'red_team', ?, ?, ?, ?, ?)`,
    )
    .run(
      newId(),
      u.decisionId,
      u.userId,
      u.model,
      u.promptTokens,
      u.completionTokens,
      u.promptTokens + u.completionTokens,
      u.costUsd,
    );
}

export function usageSinceForUser(
  userId: string,
  boundaryIso: string,
): { calls: number; costUsd: number } {
  const row = db()
    .prepare(
      `SELECT COUNT(*) AS calls, COALESCE(SUM(cost_usd), 0) AS cost
       FROM llm_usage WHERE user_id = ? AND created_at >= ?`,
    )
    .get(userId, boundaryIso) as { calls: number; cost: number };
  return { calls: row.calls, costUsd: row.cost };
}
