// V1 SQLite schema for VERDICT (ADR 0041). Single idempotent migration; bump SCHEMA_VERSION + add an
// `if` block (ADDED_COLUMNS) when evolving. Confidential client decisions live here — the file is
// git-ignored and volume-mounted. `users`/`sessions`/`llm_usage` mirror hdde-api verbatim.

export const SCHEMA_VERSION = 1;

// Additive columns applied to existing DBs via ALTER TABLE (idempotent; duplicate-column errors are
// swallowed by the migrator). Fresh DBs get them from CREATE TABLE below.
export const ADDED_COLUMNS: { table: string; column: string; ddl: string }[] = [];

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

-- A decision dossier: identity + the VERDICT "verdict page" (mirrors decision.yaml of the POC).
CREATE TABLE IF NOT EXISTS decisions (
  id                       TEXT PRIMARY KEY,
  owner_id                 TEXT NOT NULL REFERENCES users(id),
  title                    TEXT NOT NULL,
  client_name              TEXT,
  sector                   TEXT NOT NULL DEFAULT '',
  status                   TEXT NOT NULL DEFAULT 'draft',
  situation                TEXT NOT NULL DEFAULT '',
  proposed_verdict         TEXT,
  final_verdict            TEXT,
  selected_option_id       TEXT,
  confidence               TEXT,
  stop_threshold           TEXT,
  review_date              TEXT,
  human_validation         INTEGER NOT NULL DEFAULT 0,
  why_faire_not_tester     TEXT,
  defer_reason             TEXT,
  reopening_signal         TEXT,
  abandonment_disposition  TEXT,
  truth_test_json          TEXT,
  weight_profile_json      TEXT,
  red_flags_json           TEXT NOT NULL DEFAULT '[]',
  graph_json               TEXT NOT NULL DEFAULT '{}',
  hdde_case_ref            TEXT,
  source_packet_id         TEXT,
  source_pack_hash         TEXT,
  ingested_at              TEXT,
  cvi_json                 TEXT,
  created_at               TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at               TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_decisions_owner ON decisions(owner_id);

-- Decision options (temps D). ≥3 with the mandatory type spread (enforced by the audit engine).
CREATE TABLE IF NOT EXISTS decision_options (
  id                  TEXT PRIMARY KEY,
  decision_id         TEXT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  option_id           TEXT NOT NULL,
  type                TEXT NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT NOT NULL DEFAULT '',
  critical_hypothesis TEXT NOT NULL DEFAULT '',
  main_evidence       TEXT NOT NULL DEFAULT '',
  main_contradiction  TEXT NOT NULL DEFAULT '',
  proof_level         INTEGER NOT NULL DEFAULT 0,
  canvas_json         TEXT NOT NULL DEFAULT '{}',
  source_kind         TEXT NOT NULL DEFAULT 'manual',
  source_ref          TEXT,
  status              TEXT NOT NULL DEFAULT 'candidate',
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_options_decision ON decision_options(decision_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_options_decision_optid ON decision_options(decision_id, option_id);

-- One score row per option (temps C). criteria stored as JSON of the 7 0–5 values.
CREATE TABLE IF NOT EXISTS decision_scores (
  id                     TEXT PRIMARY KEY,
  decision_id            TEXT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  option_id              TEXT NOT NULL,
  criteria_json          TEXT NOT NULL DEFAULT '{}',
  raw_score              INTEGER,
  adjusted_score         INTEGER,
  adjustment_reasons_json TEXT NOT NULL DEFAULT '[]',
  created_at             TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_scores_decision ON decision_scores(decision_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_scores_decision_optid ON decision_scores(decision_id, option_id);

-- PESTEL décisionnel (temps E). Candidate rows carry provenance.
CREATE TABLE IF NOT EXISTS pestel_factors (
  id                TEXT PRIMARY KEY,
  decision_id       TEXT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  category          TEXT NOT NULL,
  statement         TEXT NOT NULL,
  decisional_impact TEXT NOT NULL DEFAULT '',
  uncertainty       TEXT NOT NULL DEFAULT '',
  source_kind       TEXT NOT NULL DEFAULT 'manual',
  source_ref        TEXT,
  status            TEXT NOT NULL DEFAULT 'candidate',
  created_at        TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_pestel_decision ON pestel_factors(decision_id);

-- SWOT décisionnelle (temps R).
CREATE TABLE IF NOT EXISTS swot_items (
  id            TEXT PRIMARY KEY,
  decision_id   TEXT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  quadrant      TEXT NOT NULL,
  statement     TEXT NOT NULL,
  is_hypothesis INTEGER NOT NULL DEFAULT 0,
  source_kind   TEXT NOT NULL DEFAULT 'manual',
  source_ref    TEXT,
  status        TEXT NOT NULL DEFAULT 'candidate',
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_swot_decision ON swot_items(decision_id);

-- Red-team suggestions (ADR 0034): LLM output is a suggestion (proof 0), pending analyst review.
CREATE TABLE IF NOT EXISTS redteam_suggestions (
  id              TEXT PRIMARY KEY,
  decision_id     TEXT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  role            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending',
  suggestion_json TEXT NOT NULL,
  reviewed_by     TEXT REFERENCES users(id),
  reviewed_at     TEXT,
  created_at      TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_redteam_decision ON redteam_suggestions(decision_id);

-- Versioned audit trail: every run of the veto engine is snapshotted (status + error codes).
CREATE TABLE IF NOT EXISTS audit_snapshots (
  id                   TEXT PRIMARY KEY,
  decision_id          TEXT NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  audit_status         TEXT NOT NULL,
  blocking_errors_json TEXT NOT NULL DEFAULT '[]',
  warnings_json        TEXT NOT NULL DEFAULT '[]',
  result_json          TEXT NOT NULL DEFAULT '{}',
  created_at           TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_audit_decision ON audit_snapshots(decision_id);

-- LLM usage ledger (ADR 0034): one row per real OpenAI call. Cost in USD computed at call time.
CREATE TABLE IF NOT EXISTS llm_usage (
  id                TEXT PRIMARY KEY,
  decision_id       TEXT REFERENCES decisions(id) ON DELETE SET NULL,
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
