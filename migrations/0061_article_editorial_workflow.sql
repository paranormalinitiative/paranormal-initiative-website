-- TPI-NOVA-004R6B: editorial workflow foundation (additive only).
--
-- articles.status remains the publication-visibility authority ('draft' or
-- 'published'). articles.editorial_status is the only current workflow state.
-- Existing rows are backfilled by the column default to 'legacy', so no article
-- is enrolled in the workflow and no existing row is rewritten.
--
-- No DROP, no UPDATE, no cascade. Deleting an article or a Nova item never
-- deletes editorial submissions or events: the foreign keys below carry no
-- ON DELETE clause, so SQLite refuses the delete while history exists.

ALTER TABLE articles ADD COLUMN editorial_status TEXT NOT NULL DEFAULT 'legacy'
  CHECK (editorial_status IN ('legacy', 'draft', 'submitted', 'in_review', 'changes_requested', 'approved'));

-- One row per submission round. Identity and version columns are immutable once
-- set; the workflow module is the only writer. 'published' is not an editorial
-- state; publication is recorded here and in the event log.
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

-- Append-only. The workflow module writes events in the same D1 batch as the
-- state change they describe. Events are historical evidence and are never used
-- to derive the current state.
CREATE TABLE IF NOT EXISTS article_editorial_events (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES articles(id),
  submission_id TEXT REFERENCES article_editorial_submissions(id),
  actor_id TEXT NOT NULL REFERENCES contributors(id),
  event_type TEXT NOT NULL
    CHECK (event_type IN ('submitted', 'withdrawn', 'review_started', 'changes_requested', 'resubmitted', 'approved', 'reopened', 'stale', 'publication_started', 'published', 'unpublished', 'destination_corrected', 'entered_workflow')),
  from_state TEXT,
  to_state TEXT NOT NULL,
  nova_version INTEGER,
  note TEXT,
  visible_to_contributor INTEGER NOT NULL DEFAULT 1 CHECK (visible_to_contributor IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_article_editorial_events_article
  ON article_editorial_events(article_id, created_at);

-- Append-only enforcement: the database itself refuses rewrites and deletes.
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
