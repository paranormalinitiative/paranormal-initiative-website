-- TPI-STUDIOFLOW-122B: automatic titles for newly created Notes.
-- Existing rows remain manual so no stored owner title changes during migration.
ALTER TABLE studio_notes ADD COLUMN title_mode TEXT NOT NULL DEFAULT 'manual'
  CHECK (title_mode IN ('automatic', 'manual'));

CREATE INDEX IF NOT EXISTS idx_studio_notes_owner_title_mode
  ON studio_notes(owner_id, title_mode, updated_at DESC);
