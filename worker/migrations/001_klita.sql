-- Migration 001 — klita platform + admin table hardening (2026-07-08)
-- Apply: wrangler d1 execute maale-amos --remote --file=migrations/001_klita.sql

-- Add columns to existing admins table (SQLite: one at a time, and no
-- 'IF NOT EXISTS' on ADD COLUMN — safe to run once, errors if re-run).
ALTER TABLE admins ADD COLUMN password_changed_at INTEGER NOT NULL DEFAULT 0;
ALTER TABLE admins ADD COLUMN email TEXT;
ALTER TABLE admins ADD COLUMN active INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);

-- Applicant families
CREATE TABLE IF NOT EXISTS applicants (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id         INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  family_name     TEXT NOT NULL,
  husband_name    TEXT,
  wife_name       TEXT,
  husband_id      TEXT,
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

-- Form submissions
CREATE TABLE IF NOT EXISTS application_forms (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  applicant_id    INTEGER NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  form_type       TEXT NOT NULL,
  form_data       TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','submitted','signed','approved','rejected')),
  signed_file_key TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_forms_applicant ON application_forms(applicant_id);
CREATE INDEX IF NOT EXISTS idx_forms_status ON application_forms(status);
