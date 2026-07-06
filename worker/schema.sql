-- Cloudflare D1 schema for maale-amos backend
-- Run: wrangler d1 execute maale-amos --file=schema.sql

CREATE TABLE IF NOT EXISTS residents (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  phone         TEXT UNIQUE NOT NULL,      -- normalized +9725XXXXXXX
  family_name   TEXT NOT NULL,
  first_name    TEXT,
  street        TEXT,
  house_no      TEXT,
  role          TEXT NOT NULL DEFAULT 'resident',  -- resident | admin | leadership
  active        INTEGER NOT NULL DEFAULT 1,
  joined_at     INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_residents_family ON residents(family_name);
CREATE INDEX IF NOT EXISTS idx_residents_role ON residents(role);

CREATE TABLE IF NOT EXISTS content (
  section_id    TEXT PRIMARY KEY,
  json_data     TEXT NOT NULL,
  updated_by    INTEGER,
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  FOREIGN KEY (updated_by) REFERENCES residents(id)
);

CREATE TABLE IF NOT EXISTS announcements (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL,
  body          TEXT NOT NULL,
  category      TEXT,
  urgent        INTEGER NOT NULL DEFAULT 0,
  published_at  INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at    INTEGER,
  author_id     INTEGER,
  FOREIGN KEY (author_id) REFERENCES residents(id)
);
CREATE INDEX IF NOT EXISTS idx_ann_published ON announcements(published_at DESC);

CREATE TABLE IF NOT EXISTS events (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  title         TEXT NOT NULL,
  description   TEXT,
  location      TEXT,
  starts_at     INTEGER NOT NULL,
  ends_at       INTEGER,
  category      TEXT,
  created_at    INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_events_starts ON events(starts_at);

CREATE TABLE IF NOT EXISTS audit_log (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_id      INTEGER,
  action        TEXT NOT NULL,
  target        TEXT,
  meta          TEXT,
  at            INTEGER NOT NULL DEFAULT (unixepoch())
);
