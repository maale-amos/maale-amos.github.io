-- Migration 002 — hardening after 2026-07-09 audit
-- Apply after `wrangler login`:
--   wrangler d1 execute maale-amos --remote --file=migrations/002_hardening.sql
--
-- NOTE: `CREATE UNIQUE INDEX IF NOT EXISTS ux_applicants_user ON applicants(user_id)`
-- will fail if duplicates already exist. Check first:
--   SELECT user_id, COUNT(*) c FROM applicants GROUP BY user_id HAVING c > 1;
-- and dedupe manually before running this migration.

-- H-4: prevent two concurrent handleKlitaApplicant calls from creating two rows.
CREATE UNIQUE INDEX IF NOT EXISTS ux_applicants_user ON applicants(user_id);

-- Defense in depth: hash of the ת.ז. so committee UI can display a masked
-- value ('***3456') without pulling the raw number.
ALTER TABLE applicants ADD COLUMN husband_id_last4 TEXT;
ALTER TABLE applicants ADD COLUMN wife_id_last4 TEXT;

-- Backfill last-4 digits for existing rows (safe: last4 is not sensitive alone).
UPDATE applicants
   SET husband_id_last4 = substr(husband_id, -4)
 WHERE husband_id IS NOT NULL AND husband_id != '' AND husband_id_last4 IS NULL;
UPDATE applicants
   SET wife_id_last4 = substr(wife_id, -4)
 WHERE wife_id IS NOT NULL AND wife_id != '' AND wife_id_last4 IS NULL;

-- Committee decisions: role='committee' users vote/decide on applicants.
CREATE TABLE IF NOT EXISTS committee_decisions (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  applicant_id    INTEGER NOT NULL REFERENCES applicants(id) ON DELETE CASCADE,
  user_id         INTEGER NOT NULL REFERENCES admins(id),
  decision        TEXT NOT NULL CHECK (decision IN ('approve','reject','abstain','question')),
  comment         TEXT,
  created_at      INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_cd_applicant ON committee_decisions(applicant_id);
CREATE UNIQUE INDEX IF NOT EXISTS ux_cd_applicant_user ON committee_decisions(applicant_id, user_id);

-- Track uploaded signed PDFs (or any file) per form. file_key is R2 object key.
CREATE TABLE IF NOT EXISTS form_uploads (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  form_id         INTEGER NOT NULL REFERENCES application_forms(id) ON DELETE CASCADE,
  filename        TEXT NOT NULL,
  content_type    TEXT NOT NULL,
  size_bytes      INTEGER NOT NULL,
  file_key        TEXT NOT NULL,
  uploaded_by     INTEGER NOT NULL REFERENCES admins(id),
  uploaded_at     INTEGER NOT NULL DEFAULT (unixepoch())
);
CREATE INDEX IF NOT EXISTS idx_form_uploads_form ON form_uploads(form_id);

-- Backfill password_changed_at for any admin row where it's still 0 or NULL
-- so getSession's gen>0 requirement doesn't lock legacy users out.
UPDATE admins
   SET password_changed_at = unixepoch()
 WHERE password_changed_at IS NULL OR password_changed_at = 0;
