-- TPI-STUDIOFLOW-122: owner-scoped Notes workspace.
-- This is additive. Notes are independent of Studio workspaces; attachments
-- live in the existing private TPI_MEDIA R2 bucket and are never public URLs.
CREATE TABLE IF NOT EXISTS studio_note_collections (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES studio_note_collections(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  collection_type TEXT NOT NULL DEFAULT 'folder' CHECK (collection_type IN ('folder', 'podcast', 'episode', 'research')),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS studio_notes (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  collection_id TEXT REFERENCES studio_note_collections(id) ON DELETE SET NULL,
  title TEXT NOT NULL DEFAULT 'Untitled note',
  body_html TEXT NOT NULL DEFAULT '',
  body_text TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'trash')),
  is_favorite INTEGER NOT NULL DEFAULT 0 CHECK (is_favorite IN (0, 1)),
  is_pinned INTEGER NOT NULL DEFAULT 0 CHECK (is_pinned IN (0, 1)),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS studio_note_revisions (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL REFERENCES studio_notes(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL CHECK (revision_number > 0),
  title TEXT NOT NULL,
  body_html TEXT NOT NULL DEFAULT '',
  body_text TEXT NOT NULL DEFAULT '',
  attachment_ids_json TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(note_id, revision_number)
);

CREATE TABLE IF NOT EXISTS studio_note_attachments (
  id TEXT PRIMARY KEY,
  note_id TEXT NOT NULL REFERENCES studio_notes(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  object_key TEXT NOT NULL UNIQUE,
  original_name TEXT NOT NULL,
  content_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL CHECK (size_bytes >= 0),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_studio_note_collections_owner_parent
  ON studio_note_collections(owner_id, parent_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_notes_owner_collection_status
  ON studio_notes(owner_id, collection_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_notes_owner_search
  ON studio_notes(owner_id, title, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_note_revisions_note_created
  ON studio_note_revisions(note_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_note_attachments_note
  ON studio_note_attachments(note_id, created_at ASC);
