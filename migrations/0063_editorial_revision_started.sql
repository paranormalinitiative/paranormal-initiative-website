-- TPI-NOVA-004R6F: published revision lifecycle (additive, table rebuild only).
--
-- Adds the 'revision_started' event type, which records the controlled
-- approved -> draft transition that opens a new revision of a published article.
-- SQLite cannot alter a CHECK constraint in place, so the append-only event table
-- is rebuilt with every existing row copied unchanged, then its triggers and
-- index are recreated. No row is rewritten or deleted; history is preserved.

CREATE TABLE article_editorial_events_r6f (
  id TEXT PRIMARY KEY,
  article_id TEXT NOT NULL REFERENCES articles(id),
  submission_id TEXT REFERENCES article_editorial_submissions(id),
  actor_id TEXT NOT NULL REFERENCES contributors(id),
  event_type TEXT NOT NULL
    CHECK (event_type IN ('submitted', 'withdrawn', 'review_started', 'changes_requested', 'resubmitted', 'approved', 'reopened', 'stale', 'publication_started', 'published', 'unpublished', 'destination_corrected', 'entered_workflow', 'revision_started')),
  from_state TEXT,
  to_state TEXT NOT NULL,
  nova_version INTEGER,
  note TEXT,
  visible_to_contributor INTEGER NOT NULL DEFAULT 1 CHECK (visible_to_contributor IN (0, 1)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO article_editorial_events_r6f
  (id, article_id, submission_id, actor_id, event_type, from_state, to_state, nova_version, note, visible_to_contributor, created_at)
  SELECT id, article_id, submission_id, actor_id, event_type, from_state, to_state, nova_version, note, visible_to_contributor, created_at
  FROM article_editorial_events;

DROP TABLE article_editorial_events;

ALTER TABLE article_editorial_events_r6f RENAME TO article_editorial_events;

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
