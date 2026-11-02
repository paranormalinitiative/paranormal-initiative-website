-- TPI-CREATOR-INCENTIVE-001: Founding Membership registry and cumulative
-- entitlement foundation.
--
-- Additive only. This migration creates the permanent issuance registry for the
-- three Founding Membership classes (FC / FCT / FAA), the cumulative capability
-- ledger, membership lifecycle history, and Creator Incentive participation
-- tracking. It awards no membership, grants no entitlement, changes no account
-- role, and does not touch the existing Creator Partnership / Founding 50
-- tables from migration 0048.
--
-- Invariants encoded here:
--   * Membership numbers are permanent and never recycled. Suspended or revoked
--     rows stay in founding_memberships and keep consuming their class capacity.
--   * Each class issues at most 50 lifetime numbers (CHECK + UNIQUE constraint).
--   * A number is deterministic: prefix || '-' || zero-padded sequence.
--   * An account may hold at most one membership per class (UNIQUE), so a
--     duplicate assignment is refused rather than silently issuing a new number.
--   * Capabilities accumulate: member_entitlements is a many-row ledger keyed by
--     (contributor, capability, source), never a single mutually exclusive role.
--   * Issuance history is non-destructive: contributors referenced by a
--     membership cannot be deleted (ON DELETE RESTRICT).

CREATE TABLE IF NOT EXISTS founding_membership_classes (
  class_code TEXT PRIMARY KEY CHECK (class_code IN ('FC', 'FCT', 'FAA')),
  display_name TEXT NOT NULL,
  number_prefix TEXT NOT NULL,
  lifetime_capacity INTEGER NOT NULL CHECK (lifetime_capacity = 50),
  -- The capability set this class grants. All-Access is deliberately the union
  -- of the Creator and Contributor sets; it is not a third permission universe.
  capabilities_json TEXT NOT NULL,
  badge_key TEXT NOT NULL,
  badge_color TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO founding_membership_classes
  (class_code, display_name, number_prefix, lifetime_capacity, capabilities_json, badge_key, badge_color)
VALUES
  ('FC', 'Founding Creator', 'FC', 50, '["creator"]', 'founding_creator', 'green'),
  ('FCT', 'Founding Contributor', 'FCT', 50, '["contributor"]', 'founding_contributor', 'blue'),
  ('FAA', 'Founding All-Access', 'FAA', 50, '["creator","contributor"]', 'founding_all_access', 'purple');

CREATE TABLE IF NOT EXISTS founding_memberships (
  id TEXT PRIMARY KEY,
  contributor_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE RESTRICT,
  class_code TEXT NOT NULL REFERENCES founding_membership_classes(class_code) ON DELETE RESTRICT,
  sequence_number INTEGER NOT NULL CHECK (sequence_number BETWEEN 1 AND 50),
  membership_number TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'active'
    CHECK (state IN ('active', 'suspended', 'revoked')),
  issued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  issued_by TEXT REFERENCES contributors(id) ON DELETE SET NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  -- Storage-level proof of the prefix / zero-padding contract.
  CHECK (membership_number = class_code || '-' || substr('00' || sequence_number, -3)),
  UNIQUE (membership_number),
  UNIQUE (class_code, sequence_number),
  UNIQUE (class_code, contributor_id)
);

CREATE INDEX IF NOT EXISTS idx_founding_memberships_contributor
  ON founding_memberships(contributor_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_founding_memberships_class_state
  ON founding_memberships(class_code, state, sequence_number);

CREATE TABLE IF NOT EXISTS founding_membership_history (
  id TEXT PRIMARY KEY,
  membership_id TEXT NOT NULL REFERENCES founding_memberships(id) ON DELETE RESTRICT,
  contributor_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE RESTRICT,
  action TEXT NOT NULL,
  from_state TEXT,
  to_state TEXT,
  actor_id TEXT REFERENCES contributors(id) ON DELETE SET NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_founding_history_membership
  ON founding_membership_history(membership_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_founding_history_contributor
  ON founding_membership_history(contributor_id, created_at DESC);

-- Cumulative capability ledger. One account may hold several rows for the same
-- capability from different sources, and several capabilities at once. A new
-- grant never updates or deletes a row belonging to another source, which is
-- what makes "last role wins" structurally impossible here.
CREATE TABLE IF NOT EXISTS member_entitlements (
  id TEXT PRIMARY KEY,
  contributor_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  capability TEXT NOT NULL CHECK (capability IN ('creator', 'contributor')),
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

CREATE INDEX IF NOT EXISTS idx_member_entitlements_contributor
  ON member_entitlements(contributor_id, state);
CREATE INDEX IF NOT EXISTS idx_member_entitlements_capability
  ON member_entitlements(capability, state);

-- Creator Incentive participation tracking only. No incentive amount, payout
-- value, threshold, percentage, schedule, or reward rule is defined here: those
-- remain unresolved owner policy (TPI-CREATOR-INCENTIVE-001 section 2).
CREATE TABLE IF NOT EXISTS creator_incentive_participation (
  contributor_id TEXT PRIMARY KEY REFERENCES contributors(id) ON DELETE CASCADE,
  state TEXT NOT NULL DEFAULT 'not_enrolled'
    CHECK (state IN ('not_enrolled', 'enrolled', 'suspended', 'withdrawn')),
  enrolled_at TEXT,
  enrolled_by TEXT REFERENCES contributors(id) ON DELETE SET NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_creator_incentive_participation_state
  ON creator_incentive_participation(state, updated_at DESC);
