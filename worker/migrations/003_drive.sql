-- Migration 003 — Google Drive storage (2026-07-09)
-- Apply after `wrangler login`:
--   wrangler d1 execute maale-amos --remote --file=migrations/003_drive.sql

-- Drive folder per applicant family. NULL until Drive is configured and the
-- registration handler successfully creates the sub-folder.
ALTER TABLE applicants ADD COLUMN drive_folder_id TEXT;
ALTER TABLE applicants ADD COLUMN drive_folder_link TEXT;

-- form_uploads: replace KV-backed storage. `file_key` becomes optional (legacy
-- KV path); `drive_file_id` is the new authoritative reference.
ALTER TABLE form_uploads ADD COLUMN drive_file_id TEXT;
ALTER TABLE form_uploads ADD COLUMN drive_web_view_link TEXT;
ALTER TABLE form_uploads ADD COLUMN storage TEXT NOT NULL DEFAULT 'drive'
  CHECK (storage IN ('drive','kv'));

CREATE INDEX IF NOT EXISTS idx_form_uploads_storage ON form_uploads(storage);
