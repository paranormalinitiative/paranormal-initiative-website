-- TPI-STUDIOFLOW-122F.4: additive metadata for recoverable note trash.
-- The original folder is remembered separately so a restore can explain and
-- safely fall back to All Notes if that folder was deleted while the note was
-- in Trash. Existing notes remain unchanged until an action uses these fields.
ALTER TABLE studio_notes ADD COLUMN deleted_at TEXT;
ALTER TABLE studio_notes ADD COLUMN trash_collection_id TEXT;

CREATE INDEX IF NOT EXISTS idx_studio_notes_owner_status_deleted
  ON studio_notes(owner_id, status, deleted_at);
