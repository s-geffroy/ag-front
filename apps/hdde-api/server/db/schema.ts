// V1 SQLite schema (ADR 0032). Single idempotent migration; bump SCHEMA_VERSION + add an `if` block
// when evolving. Confidential client data lives here — the file is git-ignored and volume-mounted.

export const SCHEMA_VERSION = 2;

export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'analyst',
  is_active     INTEGER NOT NULL DEFAULT 1,
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS sessions (
  id         TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);

CREATE TABLE IF NOT EXISTS cases (
  id                        TEXT PRIMARY KEY,
  owner_id                  TEXT NOT NULL REFERENCES users(id),
  title                     TEXT NOT NULL,
  client_name               TEXT,
  sector                    TEXT NOT NULL,
  critical_actor_name       TEXT NOT NULL,
  critical_actor_type       TEXT NOT NULL,
  suspected_dependency      TEXT,
  business_function_at_risk TEXT NOT NULL,
  initial_concern           TEXT,
  status                    TEXT NOT NULL DEFAULT 'draft',
  created_at                TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at                TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_cases_owner ON cases(owner_id);

CREATE TABLE IF NOT EXISTS interview_answers (
  id                TEXT PRIMARY KEY,
  case_id           TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  question_id       TEXT NOT NULL,
  block_id          TEXT NOT NULL,
  raw_answer        TEXT NOT NULL,
  normalized_answer TEXT,
  answer_type       TEXT NOT NULL,
  evidence_quality  INTEGER NOT NULL DEFAULT 0,
  interviewer_note  TEXT,
  follow_up_required INTEGER NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_answers_case ON interview_answers(case_id);

CREATE TABLE IF NOT EXISTS evidence_items (
  id              TEXT PRIMARY KEY,
  case_id         TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  evidence_type   TEXT NOT NULL,
  source_type     TEXT NOT NULL DEFAULT 'manual',
  status          TEXT NOT NULL DEFAULT 'accepted',
  reliability     INTEGER NOT NULL DEFAULT 0,
  relevance       INTEGER NOT NULL DEFAULT 0,
  confidence      INTEGER NOT NULL DEFAULT 0,
  summary         TEXT NOT NULL,
  attachment_path TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_evidence_case ON evidence_items(case_id);

CREATE TABLE IF NOT EXISTS evidence_links (
  id          TEXT PRIMARY KEY,
  case_id     TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  evidence_id TEXT NOT NULL REFERENCES evidence_items(id) ON DELETE CASCADE,
  target_kind TEXT NOT NULL,
  target_ref  TEXT NOT NULL,
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_links_case ON evidence_links(case_id);

CREATE TABLE IF NOT EXISTS diagnostic_packets (
  id                           TEXT PRIMARY KEY,
  case_id                      TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  version_number               INTEGER NOT NULL,
  status                       TEXT NOT NULL DEFAULT 'draft',
  operational_verdict          TEXT NOT NULL,
  confidence                   TEXT NOT NULL,
  primary_diagnosis            TEXT NOT NULL,
  pack_hash                    TEXT NOT NULL,
  packet_json                  TEXT NOT NULL,
  generated_from_snapshot_json TEXT NOT NULL,
  validated_by                 TEXT REFERENCES users(id),
  validated_at                 TEXT,
  created_at                   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_packets_case ON diagnostic_packets(case_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_packets_case_version ON diagnostic_packets(case_id, version_number);

CREATE TABLE IF NOT EXISTS red_team_suggestions (
  id              TEXT PRIMARY KEY,
  case_id         TEXT NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  persona         TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  suggestion_json TEXT NOT NULL,
  reviewed_by     TEXT REFERENCES users(id),
  reviewed_at     TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_suggestions_case ON red_team_suggestions(case_id);

-- LLM usage ledger (schema v2): one row per real OpenAI call. Cost in USD computed at call time.
CREATE TABLE IF NOT EXISTS llm_usage (
  id                TEXT PRIMARY KEY,
  case_id           TEXT REFERENCES cases(id) ON DELETE SET NULL,
  user_id           TEXT REFERENCES users(id),
  kind              TEXT NOT NULL DEFAULT 'red_team',
  model             TEXT NOT NULL,
  prompt_tokens     INTEGER NOT NULL DEFAULT 0,
  completion_tokens INTEGER NOT NULL DEFAULT 0,
  total_tokens      INTEGER NOT NULL DEFAULT 0,
  cost_usd          REAL NOT NULL DEFAULT 0,
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_llm_usage_created ON llm_usage(created_at);
`;
