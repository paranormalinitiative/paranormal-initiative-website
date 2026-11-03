-- TPI-NOVA-003: Nova Core owner-scoped storage foundation.
--
-- Additive only. Nova documents and presentations deliberately do not reuse
-- studio_notes: Notes content is HTML plus attachment rows, while Nova content
-- is a versioned structured-JSON envelope shared by Nova Edit and the Nova
-- Editorial Workspace. Both products read and write these three tables.
--
-- The envelope's own format version is stored separately from the record
-- concurrency version:
--   format_version  the shape of content_json (nova-document/nova-presentation vN)
--   version         optimistic-concurrency counter for this row
CREATE TABLE IF NOT EXISTS nova_collections (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES nova_collections(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS nova_items (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('nova-document', 'nova-presentation')),
  title TEXT NOT NULL DEFAULT 'Untitled',
  collection_id TEXT REFERENCES nova_collections(id) ON DELETE SET NULL,
  trash_collection_id TEXT REFERENCES nova_collections(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'trash')),
  format_version INTEGER NOT NULL DEFAULT 1 CHECK (format_version > 0),
  content_json TEXT NOT NULL,
  content_bytes INTEGER NOT NULL CHECK (content_bytes > 0),
  version INTEGER NOT NULL DEFAULT 1 CHECK (version > 0),
  template_key TEXT,
  source_kind TEXT,
  source_ref TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TEXT
);

-- Revisions are content snapshots. revision_number equals the record version
-- the snapshot belongs to, so a restore that creates version N also records
-- revision N. Retention is enforced by the API (latest 50 content versions);
-- the unique constraint guarantees a version can never be rewritten in place.
CREATE TABLE IF NOT EXISTS nova_revisions (
  id TEXT PRIMARY KEY,
  item_id TEXT NOT NULL REFERENCES nova_items(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  revision_number INTEGER NOT NULL CHECK (revision_number > 0),
  title TEXT NOT NULL,
  format_version INTEGER NOT NULL CHECK (format_version > 0),
  content_json TEXT NOT NULL,
  content_bytes INTEGER NOT NULL CHECK (content_bytes > 0),
  restored_from_revision INTEGER,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(item_id, revision_number)
);

-- Listing is always owner-scoped first; these indexes cover the item browser's
-- status/type/collection filters and the collection tree.
CREATE INDEX IF NOT EXISTS idx_nova_collections_owner_parent
  ON nova_collections(owner_id, parent_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_nova_items_owner_status_updated
  ON nova_items(owner_id, status, updated_at DESC, id ASC);
CREATE INDEX IF NOT EXISTS idx_nova_items_owner_type_status_updated
  ON nova_items(owner_id, type, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_nova_items_owner_collection_status
  ON nova_items(owner_id, collection_id, status, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_nova_items_owner_title
  ON nova_items(owner_id, title, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_nova_revisions_item_number
  ON nova_revisions(item_id, revision_number DESC);
CREATE INDEX IF NOT EXISTS idx_nova_revisions_owner_created
  ON nova_revisions(owner_id, created_at DESC);
