-- 0036_paranormal_teams_extensions.sql
-- Extends paranormal_teams for import, verification, claiming, and multi-platform support.

-- Add import/provenance columns to paranormal_teams
ALTER TABLE paranormal_teams ADD COLUMN record_type TEXT NOT NULL DEFAULT 'REGISTERED_TEAM';
ALTER TABLE paranormal_teams ADD COLUMN external_id TEXT;
ALTER TABLE paranormal_teams ADD COLUMN external_source TEXT;
ALTER TABLE paranormal_teams ADD COLUMN imported_at TEXT;
ALTER TABLE paranormal_teams ADD COLUMN import_batch TEXT;
ALTER TABLE paranormal_teams ADD COLUMN claimed_at TEXT;
ALTER TABLE paranormal_teams ADD COLUMN claimed_by TEXT;
ALTER TABLE paranormal_teams ADD COLUMN verification_status TEXT NOT NULL DEFAULT 'UNVERIFIED';
ALTER TABLE paranormal_teams ADD COLUMN verified_at TEXT;
ALTER TABLE paranormal_teams ADD COLUMN last_verified_at TEXT;

CREATE INDEX IF NOT EXISTS idx_paranormal_teams_record_type ON paranormal_teams(record_type);
CREATE INDEX IF NOT EXISTS idx_paranormal_teams_external ON paranormal_teams(external_id, external_source);
CREATE INDEX IF NOT EXISTS idx_paranormal_teams_verification ON paranormal_teams(verification_status);

-- Organization links: normalized table for all online identities
CREATE TABLE IF NOT EXISTS organization_links (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  platform TEXT NOT NULL,
  url TEXT NOT NULL,
  link_type TEXT NOT NULL DEFAULT 'website',
  discovery_source TEXT,
  discovered_at TEXT NOT NULL DEFAULT (datetime('now')),
  last_checked_at TEXT,
  link_status TEXT NOT NULL DEFAULT 'active',
  verification_status TEXT NOT NULL DEFAULT 'unverified',
  evidence_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (team_id) REFERENCES paranormal_teams(id)
);

CREATE INDEX IF NOT EXISTS idx_org_links_team ON organization_links(team_id);
CREATE INDEX IF NOT EXISTS idx_org_links_platform ON organization_links(platform);
CREATE INDEX IF NOT EXISTS idx_org_links_url ON organization_links(url);

-- Organization verification events (append-only history)
CREATE TABLE IF NOT EXISTS team_verification_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id TEXT NOT NULL,
  status TEXT NOT NULL,
  evidence_url TEXT,
  evidence_type TEXT,
  evidence_description TEXT,
  last_apparent_activity TEXT,
  confidence TEXT,
  verifier TEXT,
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (team_id) REFERENCES paranormal_teams(id)
);

CREATE INDEX IF NOT EXISTS idx_team_verify_team ON team_verification_events(team_id);
CREATE INDEX IF NOT EXISTS idx_team_verify_status ON team_verification_events(status);

-- Team claims: ownership request tracking
CREATE TABLE IF NOT EXISTS team_claims (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  claimant_id TEXT NOT NULL,
  claimant_name TEXT NOT NULL,
  claimant_email TEXT NOT NULL,
  claimant_role TEXT,
  evidence_url TEXT,
  evidence_description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_at TEXT,
  reviewed_by TEXT,
  review_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (team_id) REFERENCES paranormal_teams(id),
  FOREIGN KEY (claimant_id) REFERENCES contributors(id)
);

CREATE INDEX IF NOT EXISTS idx_team_claims_team ON team_claims(team_id);
CREATE INDEX IF NOT EXISTS idx_team_claims_claimant ON team_claims(claimant_id);
CREATE INDEX IF NOT EXISTS idx_team_claims_status ON team_claims(status);

-- Team members: ownership/administrator relationships
CREATE TABLE IF NOT EXISTS team_members (
  id TEXT PRIMARY KEY,
  team_id TEXT NOT NULL,
  contributor_id TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (team_id) REFERENCES paranormal_teams(id),
  FOREIGN KEY (contributor_id) REFERENCES contributors(id),
  UNIQUE(team_id, contributor_id)
);

CREATE INDEX IF NOT EXISTS idx_team_members_team ON team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_contributor ON team_members(contributor_id);

-- Team imports: tracking import batches
CREATE TABLE IF NOT EXISTS team_imports (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  team_id TEXT NOT NULL,
  external_id TEXT NOT NULL,
  external_source TEXT NOT NULL,
  import_batch TEXT,
  import_status TEXT NOT NULL DEFAULT 'imported',
  imported_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (team_id) REFERENCES paranormal_teams(id),
  UNIQUE(external_id, external_source)
);

CREATE INDEX IF NOT EXISTS idx_team_imports_batch ON team_imports(import_batch);
CREATE INDEX IF NOT EXISTS idx_team_imports_external ON team_imports(external_id, external_source);
