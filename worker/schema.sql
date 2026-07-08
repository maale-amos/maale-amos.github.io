-- Cloudflare D1 schema for maale-amos backend
-- Run: wrangler d1 execute maale-amos --file=schema.sql --remote

CREATE TABLE IF NOT EXISTS admins (
  id                    INTEGER PRIMARY KEY AUTOINCREMENT,
  username              TEXT UNIQUE NOT NULL,
  password_hash         TEXT NOT NULL,     -- PBKDF2-SHA256, format: "iterations$salt_b64$hash_b64"
  role                  TEXT NOT NULL DEFAULT 'admin', -- 'admin' | 'committee' | 'family' | 'viewer'
  created_at            INTEGER NOT NULL DEFAULT (unixepoch()),
  last_login_at         INTEGER,
  password_changed_at   INTEGER NOT NULL DEFAULT 0,   -- H-1 fix: invalidates tokens with iat < this
  email                 TEXT,                          -- for klita families / notifications
  active                INTEGER NOT NULL DEFAULT 1,    -- soft-delete flag
  CHECK (username = lower(username))                   -- L-2 fix: DB-enforced normalization
);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

-- Klita platform (2026-07-08) — one row per applicant family. Auto-fill
-- source: once written, subsequent forms pre-populate from these fields.
CREATE TABLE IF NOT EXISTS applicants (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  family_name     TEXT NOT NULL,
  husband_name    TEXT,
  wife_name       TEXT,
  husband_id      TEXT,          -- ת.ז. (later: encrypt at rest)
  wife_id         TEXT,
  phone           TEXT,
  email           TEXT,
  address         TEXT,
  track           TEXT NOT NULL DEFAULT 'buy' CHECK (track IN ('buy','rent','plot')),
  current_stage   INTEGER NOT NULL DEFAULT 1,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_review','approved','rejected','archived')),
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_applicants_user ON applicants(user_id);
CREATE INDEX IF NOT EXISTS idx_applicants_status ON applicants(status);

-- One row per form submission (draft or final). form_type distinguishes the
-- questionnaire / stage-N form / financial / etc.
CREATE TABLE IF NOT EXISTS application_forms (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  applicant_id    INTEGER NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  form_type       TEXT NOT NULL,            -- 'questionnaire' | 'medical' | 'financial' | ...
  form_data       TEXT NOT NULL,             -- JSON snapshot
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','signed','approved','rejected')),
  signed_file_key TEXT,                      -- key in R2 or Drive after user uploads signed PDF
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_forms_applicant ON application_forms(applicant_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON application_forms(status);

CREATE TABLE IF NOT EXISTS content (
  section_id     TEXT PRIMARY KEY,
  json_data      TEXT NOT NULL,
  updated_by     INTEGER,
  updated_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (updated_by) REFERENCES admins(id)
);

CREATE TABLE IF NOT EXISTS audit_log (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id       INTEGER,
  action         TEXT NOT NULL,
  target         TEXT,
  ip             TEXT,
  meta           TEXT,
  at             INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (actor_id) REFERENCES admins(id)
);
CREATE INDEX IF NOT EXISTS idx_audit_at ON audit_log(at DESC);
