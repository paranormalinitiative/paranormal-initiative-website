-- TPI-ADMIN-002: additive Creator Partnership and Founding 50 administration.
-- This migration creates the ownership records needed for future, explicitly
-- approved awards. It does not award memberships, create accounts, or open
-- Creator Studio access.

CREATE TABLE IF NOT EXISTS creator_partnership_memberships (
  id TEXT PRIMARY KEY,
  contributor_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  membership_type TEXT NOT NULL DEFAULT 'creator_partnership',
  membership_state TEXT NOT NULL DEFAULT 'pending'
    CHECK (membership_state IN ('pending', 'active', 'suspended', 'revoked')),
  entitlement_code TEXT NOT NULL DEFAULT 'creator_studio_lifetime',
  founding50_slot INTEGER,
  awarded_at TEXT,
  awarded_by TEXT REFERENCES contributors(id) ON DELETE SET NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_creator_partnership_founder_slot
  ON creator_partnership_memberships(founding50_slot)
  WHERE founding50_slot IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_creator_partnership_membership_state
  ON creator_partnership_memberships(membership_state, membership_type, updated_at DESC);

-- A bounded slot table makes the 50-place limit database-enforced. A failed
-- duplicate slot insert is safe to report and retry; no slot is recycled by
-- this migration or by the gated award handler.
CREATE TABLE IF NOT EXISTS founding50_allocations (
  slot_number INTEGER PRIMARY KEY CHECK (slot_number BETWEEN 1 AND 50),
  membership_id TEXT NOT NULL UNIQUE REFERENCES creator_partnership_memberships(id) ON DELETE RESTRICT,
  contributor_id TEXT NOT NULL UNIQUE REFERENCES contributors(id) ON DELETE RESTRICT,
  allocated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  allocated_by TEXT NOT NULL REFERENCES contributors(id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS creator_studio_entitlements (
  id TEXT PRIMARY KEY,
  contributor_id TEXT NOT NULL UNIQUE REFERENCES contributors(id) ON DELETE CASCADE,
  source_membership_id TEXT REFERENCES creator_partnership_memberships(id) ON DELETE SET NULL,
  entitlement_code TEXT NOT NULL DEFAULT 'creator_studio_lifetime',
  entitlement_state TEXT NOT NULL DEFAULT 'active'
    CHECK (entitlement_state IN ('active', 'suspended', 'revoked')),
  granted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  granted_by TEXT REFERENCES contributors(id) ON DELETE SET NULL,
  revoked_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_creator_studio_entitlements_state
  ON creator_studio_entitlements(entitlement_state, updated_at DESC);

CREATE TABLE IF NOT EXISTS creator_partnership_membership_history (
  id TEXT PRIMARY KEY,
  membership_id TEXT NOT NULL REFERENCES creator_partnership_memberships(id) ON DELETE CASCADE,
  contributor_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  from_state TEXT,
  to_state TEXT NOT NULL,
  action TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  actor_id TEXT REFERENCES contributors(id) ON DELETE SET NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_creator_partnership_history_membership
  ON creator_partnership_membership_history(membership_id, created_at DESC);

CREATE TABLE IF NOT EXISTS founding50_applications (
  id TEXT PRIMARY KEY,
  applicant_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'rejected')),
  administrative_notes TEXT NOT NULL DEFAULT '',
  reviewed_by TEXT REFERENCES contributors(id) ON DELETE SET NULL,
  reviewed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_founding50_applications_status
  ON founding50_applications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_founding50_applications_applicant
  ON founding50_applications(applicant_id, created_at DESC);
