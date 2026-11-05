-- TPI-NOVA-004R6D: editorial authority is a ledger capability, never a role.
--
-- 0058 constrained member_entitlements.capability to the two membership
-- capabilities, so an editorial grant had nowhere to live and no account could
-- ever hold EDITORIAL_REVIEW. The ledger keeps its meaning: one row is one
-- explicit, auditable grant from a named source. Editorial rows are granted and
-- revoked exactly like membership rows, and holding role 'admin' still grants
-- nothing here.
--
-- SQLite cannot widen a CHECK constraint in place, so the table is rebuilt with
-- the same shape and every existing row copied across unchanged.
CREATE TABLE member_entitlements_0062 (
  id TEXT PRIMARY KEY,
  contributor_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  capability TEXT NOT NULL
    CHECK (capability IN ('creator', 'contributor', 'editorial_review', 'editorial_publish')),
  source_type TEXT NOT NULL CHECK (source_type IN ('founding_membership', 'admin_grant')),
  source_id TEXT NOT NULL DEFAULT '',
  state TEXT NOT NULL DEFAULT 'active'
    CHECK (state IN ('active', 'suspended', 'revoked')),
  granted_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  granted_by TEXT REFERENCES contributors(id) ON DELETE SET NULL,
  revoked_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  UNIQUE (contributor_id, capability, source_type, source_id)
);

INSERT INTO member_entitlements_0062 (
  id, contributor_id, capability, source_type, source_id, state,
  granted_at, granted_by, revoked_at, notes
)
SELECT
  id, contributor_id, capability, source_type, source_id, state,
  granted_at, granted_by, revoked_at, notes
FROM member_entitlements;

DROP TABLE member_entitlements;

ALTER TABLE member_entitlements_0062 RENAME TO member_entitlements;

CREATE INDEX IF NOT EXISTS idx_member_entitlements_contributor
  ON member_entitlements(contributor_id, state);
CREATE INDEX IF NOT EXISTS idx_member_entitlements_capability
  ON member_entitlements(capability, state);
