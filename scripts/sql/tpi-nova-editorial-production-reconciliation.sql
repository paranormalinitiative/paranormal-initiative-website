-- TPI-NOVA-EDITORIAL-PRODUCTION: focused production reconciliation.
--
-- Production D1 already contains the physical schema through the existing
-- contributor/StudioFlow work, but its d1_migrations ledger is behind. Do not
-- replay the entire historical ledger here: that would include unrelated
-- table rebuilds and drops. This file is the additive Nova Editorial
-- Workspace bootstrap for the existing articles table.
--
-- Apply once after the release backup and schema preflight. The release record
-- must retain the pre-apply export and the post-apply verification query.

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

ALTER TABLE articles ADD COLUMN nova_item_id TEXT;
ALTER TABLE articles ADD COLUMN editorial_status TEXT NOT NULL DEFAULT 'legacy'
  CHECK (editorial_status IN ('legacy', 'draft', 'submitted', 'in_review', 'changes_requested', 'approved'));
ALTER TABLE articles ADD COLUMN affiliation TEXT;
ALTER TABLE articles ADD COLUMN organization TEXT;
ALTER TABLE articles ADD COLUMN correspondence TEXT;
ALTER TABLE articles ADD COLUMN website TEXT;

CREATE TABLE IF NOT EXISTS article_editorial_submissions (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES articles(id),
  nova_item_id TEXT NOT NULL REFERENCES nova_items(id),
  submitted_by TEXT NOT NULL REFERENCES contributors(id),
  submitted_at TEXT NOT NULL,
  submitted_nova_version INTEGER NOT NULL CHECK (submitted_nova_version > 0),
  submitted_destination TEXT NOT NULL,
  submitted_article_type TEXT NOT NULL,
  reviewer_id TEXT REFERENCES contributors(id),
  review_started_at TEXT,
  approved_by TEXT REFERENCES contributors(id),
  approved_at TEXT,
  approved_nova_version INTEGER CHECK (approved_nova_version IS NULL OR approved_nova_version > 0),
  published_by TEXT REFERENCES contributors(id),
  published_at TEXT,
  outcome TEXT NOT NULL DEFAULT 'open'
    CHECK (outcome IN ('open', 'withdrawn', 'superseded', 'approved', 'stale', 'published')),
  superseded_by TEXT REFERENCES article_editorial_submissions(id),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_article_editorial_submissions_article
  ON article_editorial_submissions(article_id, created_at);

CREATE TABLE IF NOT EXISTS article_editorial_events (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES articles(id),
  submission_id TEXT REFERENCES article_editorial_submissions(id),
  actor_id TEXT NOT NULL REFERENCES contributors(id),
  event_type TEXT NOT NULL CHECK (event_type IN (
    'submitted', 'withdrawn', 'review_started', 'changes_requested',
    'resubmitted', 'approved', 'reopened', 'stale', 'publication_started',
    'published', 'unpublished', 'destination_corrected', 'entered_workflow',
    'revision_started'
  )),
  from_state TEXT,
  to_state TEXT NOT NULL,
  nova_version INTEGER,
  note TEXT,
  visible_to_contributor INTEGER NOT NULL DEFAULT 1 CHECK (visible_to_contributor IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_article_editorial_events_article
  ON article_editorial_events(article_id, created_at);

CREATE TRIGGER IF NOT EXISTS trg_article_editorial_events_no_update
  BEFORE UPDATE ON article_editorial_events
  BEGIN
    SELECT RAISE(ABORT, 'article_editorial_events is append-only');
  END;

CREATE TRIGGER IF NOT EXISTS trg_article_editorial_events_no_delete
  BEFORE DELETE ON article_editorial_events
  BEGIN
    SELECT RAISE(ABORT, 'article_editorial_events is append-only');
  END;
