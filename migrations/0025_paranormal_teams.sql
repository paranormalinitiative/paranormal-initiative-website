-- 0025_paranormal_teams.sql
-- Paranormal Teams Directory: public "Add a Team" submissions land here as
-- `pending` rows; leadership approves them (mirrors the comment moderation
-- flow) and approved rows power the state / country / alphabetical listings.
-- scope 'us' uses `state`; scope 'international' uses `country`.

CREATE TABLE IF NOT EXISTS paranormal_teams (
  id TEXT PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'pending',
  scope TEXT NOT NULL DEFAULT 'us',
  name TEXT NOT NULL,
  acronym TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  country TEXT,
  zip TEXT,
  contact_name TEXT,
  phone TEXT,
  phone_alt TEXT,
  fax TEXT,
  email TEXT,
  email_alt TEXT,
  website TEXT,
  facebook TEXT,
  twitter TEXT,
  youtube TEXT,
  founder TEXT,
  year_founded TEXT,
  members TEXT,
  areas_served TEXT,
  specialties TEXT,
  details TEXT,
  additional_states TEXT,
  submitter_name TEXT,
  submitter_email TEXT,
  heard_about TEXT,
  submitted_ip TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  reviewed_at TEXT,
  reviewed_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_paranormal_teams_status_scope ON paranormal_teams(status, scope);
CREATE INDEX IF NOT EXISTS idx_paranormal_teams_state ON paranormal_teams(status, state);
CREATE INDEX IF NOT EXISTS idx_paranormal_teams_country ON paranormal_teams(status, country);
