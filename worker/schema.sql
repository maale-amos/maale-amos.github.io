-- Cloudflare D1 schema for maale-amos backend
-- Run: wrangler d1 execute maale-amos --file=schema.sql --remote

CREATE TABLE IF NOT EXISTS admins (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  username       TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,     -- PBKDF2-SHA256, format: "iterations$salt_b64$hash_b64"
  role           TEXT NOT NULL DEFAULT 'admin',
  created_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  last_login_at  INTEGER
);
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);

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
