// Thin typed data-access layer over better-sqlite3. JSON columns are stored as TEXT and parsed here.
import { getDb, newId } from './index';
import type {
  CaseInput,
  CasePatch,
  InterviewAnswerInput,
  EvidenceInput,
  CaseEntityInput,
  CaseEntityPatch,
} from '@ag/schema/hdde';
import type { DiagnosticCore } from '../engine';

type Row = Record<string, unknown>;
const db = () => getDb();

// ---------------------------------------------------------------- users + sessions
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
  const row = db()
    .prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > datetime('now') AND u.is_active = 1`,
    )
    .get(sessionId) as UserRow | undefined;
  return row;
}

export function deleteSession(sessionId: string): void {
  db().prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

// ---------------------------------------------------------------- cases
export function createCase(ownerId: string, input: CaseInput): Row {
  const id = newId();
  db()
    .prepare(
      `INSERT INTO cases (id, owner_id, title, client_name, sector, critical_actor_name,
         critical_actor_type, suspected_dependency, business_function_at_risk, initial_concern,
         hq_country, employee_band, revenue_band, description)
       VALUES (@id, @owner_id, @title, @client_name, @sector, @critical_actor_name,
         @critical_actor_type, @suspected_dependency, @business_function_at_risk, @initial_concern,
         @hq_country, @employee_band, @revenue_band, @description)`,
    )
    .run({
      id,
      owner_id: ownerId,
      title: input.title,
      client_name: input.client_name ?? '',
      sector: input.sector,
      critical_actor_name: input.critical_actor_name ?? '',
      critical_actor_type: input.critical_actor_type ?? '', // column is NOT NULL; schema field is optional
      suspected_dependency: input.suspected_dependency ?? '',
      business_function_at_risk: input.business_function_at_risk,
      initial_concern: input.initial_concern ?? '',
      hq_country: input.hq_country ?? '',
      employee_band: input.employee_band ?? '',
      revenue_band: input.revenue_band ?? '',
      description: input.description ?? '',
    });
  return getCase(id)!;
}

export function getCase(id: string): Row | undefined {
  return db().prepare('SELECT * FROM cases WHERE id = ?').get(id) as Row | undefined;
}

export function listCases(ownerId: string, isAdmin: boolean): Row[] {
  return isAdmin
    ? (db().prepare('SELECT * FROM cases ORDER BY updated_at DESC').all() as Row[])
    : (db()
        .prepare('SELECT * FROM cases WHERE owner_id = ? ORDER BY updated_at DESC')
        .all(ownerId) as Row[]);
}

export function patchCase(id: string, patch: CasePatch): Row | undefined {
  const allowed = [
    'title',
    'client_name',
    'sector',
    'critical_actor_name',
    'critical_actor_type',
    'suspected_dependency',
    'business_function_at_risk',
    'initial_concern',
    'status',
    'hq_country',
    'employee_band',
    'revenue_band',
    'description',
  ] as const;
  const sets: string[] = [];
  const params: Row = { id };
  for (const key of allowed) {
    if (patch[key] !== undefined) {
      sets.push(`${key} = @${key}`);
      params[key] = patch[key];
    }
  }
  if (sets.length === 0) return getCase(id);
  sets.push(`updated_at = datetime('now')`);
  db()
    .prepare(`UPDATE cases SET ${sets.join(', ')} WHERE id = @id`)
    .run(params);
  return getCase(id);
}

function touchCase(id: string): void {
  db().prepare(`UPDATE cases SET updated_at = datetime('now') WHERE id = ?`).run(id);
}

// ---------------------------------------------------------------- case entities (enterprise roster)
const ENTITY_COLUMNS = [
  'entity_type',
  'name',
  'country',
  'role',
  'what_it_enables',
  'tier',
  'criticality',
  'substitutability',
  'tier2_visibility',
  'jurisdiction_risk',
  'time_to_impact',
  'single_source',
  'share_pct',
  'notes',
] as const;

export function createEntity(caseId: string, input: CaseEntityInput): Row {
  const id = newId();
  db()
    .prepare(
      `INSERT INTO case_entities
         (id, case_id, entity_type, name, country, role, what_it_enables, tier, criticality,
          substitutability, tier2_visibility, jurisdiction_risk, time_to_impact, single_source,
          share_pct, notes)
       VALUES (@id, @case_id, @entity_type, @name, @country, @role, @what_it_enables, @tier,
          @criticality, @substitutability, @tier2_visibility, @jurisdiction_risk, @time_to_impact,
          @single_source, @share_pct, @notes)`,
    )
    .run({
      id,
      case_id: caseId,
      entity_type: input.entity_type,
      name: input.name,
      country: input.country ?? '',
      role: input.role ?? '',
      what_it_enables: input.what_it_enables ?? '',
      tier: input.tier ?? null,
      criticality: input.criticality,
      substitutability: input.substitutability,
      tier2_visibility: input.tier2_visibility,
      jurisdiction_risk: input.jurisdiction_risk,
      time_to_impact: input.time_to_impact,
      single_source: input.single_source ? 1 : 0,
      share_pct: input.share_pct ?? null,
      notes: input.notes ?? '',
    });
  touchCase(caseId);
  return getEntity(id)!;
}

export function getEntity(id: string): Row | undefined {
  const row = db().prepare('SELECT * FROM case_entities WHERE id = ?').get(id) as Row | undefined;
  if (row) row.single_source = !!row.single_source;
  return row;
}

export function listEntities(caseId: string): Row[] {
  return (
    db()
      .prepare(
        'SELECT * FROM case_entities WHERE case_id = ? ORDER BY entity_type, criticality DESC',
      )
      .all(caseId) as Row[]
  ).map((r) => ({ ...r, single_source: !!r.single_source }));
}

export function patchEntity(id: string, patch: CaseEntityPatch): Row | undefined {
  const sets: string[] = [];
  const params: Row = { id };
  for (const key of ENTITY_COLUMNS) {
    const v = (patch as Record<string, unknown>)[key];
    if (v !== undefined) {
      sets.push(`${key} = @${key}`);
      params[key] = key === 'single_source' ? (v ? 1 : 0) : (v as never);
    }
  }
  if (sets.length === 0) return getEntity(id);
  db()
    .prepare(`UPDATE case_entities SET ${sets.join(', ')} WHERE id = @id`)
    .run(params);
  return getEntity(id);
}

export function deleteEntity(id: string): void {
  db().prepare('DELETE FROM case_entities WHERE id = ?').run(id);
}

// ---------------------------------------------------------------- interview answers
export function upsertAnswer(caseId: string, input: InterviewAnswerInput): Row {
  // One stored answer per (case, question): re-answering overwrites.
  const existing = db()
    .prepare('SELECT id FROM interview_answers WHERE case_id = ? AND question_id = ?')
    .get(caseId, input.question_id) as { id: string } | undefined;
  const id = existing?.id ?? newId();
  db()
    .prepare(
      `INSERT INTO interview_answers
         (id, case_id, question_id, block_id, raw_answer, normalized_answer, answer_type,
          evidence_quality, interviewer_note)
       VALUES (@id, @case_id, @question_id, @block_id, @raw_answer, @normalized_answer, @answer_type,
          @evidence_quality, @interviewer_note)
       ON CONFLICT(id) DO UPDATE SET
         raw_answer=excluded.raw_answer, normalized_answer=excluded.normalized_answer,
         answer_type=excluded.answer_type, evidence_quality=excluded.evidence_quality,
         interviewer_note=excluded.interviewer_note`,
    )
    .run({
      id,
      case_id: caseId,
      question_id: input.question_id,
      block_id: input.block_id,
      raw_answer: input.raw_answer,
      normalized_answer: input.normalized_answer ?? null,
      answer_type: input.answer_type,
      evidence_quality: input.evidence_quality,
      interviewer_note: input.interviewer_note ?? null,
    });
  touchCase(caseId);
  return db().prepare('SELECT * FROM interview_answers WHERE id = ?').get(id) as Row;
}

export function listAnswers(caseId: string): Row[] {
  return db()
    .prepare('SELECT * FROM interview_answers WHERE case_id = ? ORDER BY created_at ASC')
    .all(caseId) as Row[];
}

// ---------------------------------------------------------------- evidence
export function createEvidence(caseId: string, input: EvidenceInput): Row {
  const id = newId();
  db()
    .prepare(
      `INSERT INTO evidence_items (id, case_id, title, evidence_type, source_type, summary,
         reliability, relevance, confidence)
       VALUES (@id, @case_id, @title, @evidence_type, @source_type, @summary,
         @reliability, @relevance, @confidence)`,
    )
    .run({ id, case_id: caseId, ...input });
  touchCase(caseId);
  return db().prepare('SELECT * FROM evidence_items WHERE id = ?').get(id) as Row;
}

export function listEvidence(caseId: string): Row[] {
  return db()
    .prepare('SELECT * FROM evidence_items WHERE case_id = ? ORDER BY created_at ASC')
    .all(caseId) as Row[];
}

export function getEvidence(id: string): Row | undefined {
  return db().prepare('SELECT * FROM evidence_items WHERE id = ?').get(id) as Row | undefined;
}

export function listEvidenceLinks(caseId: string): Row[] {
  return db()
    .prepare('SELECT * FROM evidence_links WHERE case_id = ?')
    .all(caseId) as Row[];
}

export function createEvidenceLink(
  caseId: string,
  evidenceId: string,
  targetKind: string,
  targetRef: string,
): Row {
  const id = newId();
  db()
    .prepare(
      `INSERT INTO evidence_links (id, case_id, evidence_id, target_kind, target_ref)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(id, caseId, evidenceId, targetKind, targetRef);
  return db().prepare('SELECT * FROM evidence_links WHERE id = ?').get(id) as Row;
}

// ---------------------------------------------------------------- diagnostic packets
export function nextVersionNumber(caseId: string): number {
  const row = db()
    .prepare(
      'SELECT COALESCE(MAX(version_number), 0) AS n FROM diagnostic_packets WHERE case_id = ?',
    )
    .get(caseId) as { n: number };
  return row.n + 1;
}

export function createPacket(
  caseId: string,
  core: DiagnosticCore,
  packHash: string,
  snapshot: unknown,
): Row {
  const id = newId();
  const version = nextVersionNumber(caseId);
  const packetJson = { case_id: caseId, pack_hash: packHash, ...core };
  db()
    .prepare(
      `INSERT INTO diagnostic_packets (id, case_id, version_number, status, operational_verdict,
         confidence, primary_diagnosis, pack_hash, packet_json, generated_from_snapshot_json)
       VALUES (@id, @case_id, @version_number, 'draft', @operational_verdict, @confidence,
         @primary_diagnosis, @pack_hash, @packet_json, @snapshot)`,
    )
    .run({
      id,
      case_id: caseId,
      version_number: version,
      operational_verdict: core.operational_verdict,
      confidence: core.confidence,
      primary_diagnosis: core.primary_diagnosis,
      pack_hash: packHash,
      packet_json: JSON.stringify(packetJson),
      snapshot: JSON.stringify(snapshot),
    });
  touchCase(caseId);
  return getPacket(id)!;
}

function parsePacketRow(row: Row | undefined): Row | undefined {
  if (!row) return undefined;
  return {
    ...row,
    packet_json: JSON.parse(String(row.packet_json)),
    generated_from_snapshot_json: JSON.parse(String(row.generated_from_snapshot_json)),
  };
}

export function getPacket(id: string): Row | undefined {
  return parsePacketRow(
    db().prepare('SELECT * FROM diagnostic_packets WHERE id = ?').get(id) as Row | undefined,
  );
}

export function listPackets(caseId: string): Row[] {
  return (
    db()
      .prepare('SELECT * FROM diagnostic_packets WHERE case_id = ? ORDER BY version_number DESC')
      .all(caseId) as Row[]
  ).map((r) => parsePacketRow(r)!);
}

export function validatePacket(id: string, userId: string): Row | undefined {
  db()
    .prepare(
      `UPDATE diagnostic_packets SET status='validated', validated_by=?, validated_at=datetime('now')
       WHERE id=?`,
    )
    .run(userId, id);
  return getPacket(id);
}

// ---------------------------------------------------------------- red team suggestions
export function createSuggestion(caseId: string, persona: string, suggestion: unknown): Row {
  const id = newId();
  db()
    .prepare(
      `INSERT INTO red_team_suggestions (id, case_id, persona, status, suggestion_json)
       VALUES (?, ?, ?, 'pending', ?)`,
    )
    .run(id, caseId, persona, JSON.stringify(suggestion));
  return getSuggestion(id)!;
}

function parseSuggestionRow(row: Row | undefined): Row | undefined {
  if (!row) return undefined;
  return { ...row, suggestion_json: JSON.parse(String(row.suggestion_json)) };
}

export function getSuggestion(id: string): Row | undefined {
  return parseSuggestionRow(
    db().prepare('SELECT * FROM red_team_suggestions WHERE id = ?').get(id) as Row | undefined,
  );
}

export function listSuggestions(caseId: string): Row[] {
  return (
    db()
      .prepare('SELECT * FROM red_team_suggestions WHERE case_id = ? ORDER BY created_at DESC')
      .all(caseId) as Row[]
  ).map((r) => parseSuggestionRow(r)!);
}

export function reviewSuggestion(id: string, status: string, userId: string): Row | undefined {
  db()
    .prepare(
      `UPDATE red_team_suggestions SET status=?, reviewed_by=?, reviewed_at=datetime('now')
       WHERE id=?`,
    )
    .run(status, userId, id);
  return getSuggestion(id);
}

// ---------------------------------------------------------------- LLM usage / cost
export interface LlmUsageInput {
  case_id: string | null;
  user_id: string | null;
  kind?: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
  cost_usd: number;
}

export function recordLlmUsage(u: LlmUsageInput): void {
  db()
    .prepare(
      `INSERT INTO llm_usage (id, case_id, user_id, kind, model, prompt_tokens, completion_tokens,
         total_tokens, cost_usd)
       VALUES (@id, @case_id, @user_id, @kind, @model, @prompt_tokens, @completion_tokens,
         @total_tokens, @cost_usd)`,
    )
    .run({ id: newId(), kind: 'red_team', ...u });
}

export interface UsageWindow {
  calls: number;
  total_tokens: number;
  cost_usd: number;
}

/** Aggregate usage since a SQLite datetime boundary (UTC 'YYYY-MM-DD HH:MM:SS'); null = all time. */
export function usageSince(boundary: string | null): UsageWindow {
  const row = (
    boundary
      ? db()
          .prepare(
            `SELECT COUNT(*) AS calls, COALESCE(SUM(total_tokens),0) AS total_tokens,
                    COALESCE(SUM(cost_usd),0) AS cost_usd FROM llm_usage WHERE created_at >= ?`,
          )
          .get(boundary)
      : db()
          .prepare(
            `SELECT COUNT(*) AS calls, COALESCE(SUM(total_tokens),0) AS total_tokens,
                    COALESCE(SUM(cost_usd),0) AS cost_usd FROM llm_usage`,
          )
          .get()
  ) as UsageWindow;
  return { calls: row.calls, total_tokens: row.total_tokens, cost_usd: row.cost_usd };
}

/** Per-user usage since a SQLite datetime boundary — drives the per-analyst LLM budget (ADR 0034). */
export function usageSinceForUser(userId: string, boundary: string): UsageWindow {
  const row = db()
    .prepare(
      `SELECT COUNT(*) AS calls, COALESCE(SUM(total_tokens),0) AS total_tokens,
              COALESCE(SUM(cost_usd),0) AS cost_usd
         FROM llm_usage WHERE user_id = ? AND created_at >= ?`,
    )
    .get(userId, boundary) as UsageWindow;
  return { calls: row.calls, total_tokens: row.total_tokens, cost_usd: row.cost_usd };
}

export function recentLlmUsage(limit = 10): Row[] {
  return db()
    .prepare(
      `SELECT model, total_tokens, cost_usd, kind, created_at FROM llm_usage
              ORDER BY created_at DESC LIMIT ?`,
    )
    .all(limit) as Row[];
}
