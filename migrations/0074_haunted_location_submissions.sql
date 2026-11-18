-- TPI location research workflow: member-submitted haunted-location candidates.
-- Additive only. Submissions remain private to the Administration Center until
-- an authorized reviewer verifies and publishes a directory entry.

CREATE TABLE IF NOT EXISTS haunted_location_submissions (
  id TEXT PRIMARY KEY,
  submitter_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  location_name TEXT NOT NULL,
  city TEXT NOT NULL,
  county TEXT NOT NULL,
  state TEXT NOT NULL,
  address TEXT NOT NULL,
  coordinates TEXT,
  description TEXT NOT NULL,
  historical_context TEXT NOT NULL,
  reported_claims TEXT NOT NULL,
  investigation_zones TEXT NOT NULL,
  access_details TEXT NOT NULL,
  source_references TEXT NOT NULL,
  submitter_notes TEXT,
  consent INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TEXT,
  reviewed_by TEXT REFERENCES contributors(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_haunted_location_submissions_status
  ON haunted_location_submissions(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_haunted_location_submissions_submitter
  ON haunted_location_submissions(submitter_id, created_at DESC);
