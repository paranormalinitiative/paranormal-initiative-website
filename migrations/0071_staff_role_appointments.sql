-- TPI staff role appointments are separate from membership, profile titles,
-- Founding identities, and honors. Revocation/suspension preserves history.
CREATE TABLE IF NOT EXISTS staff_role_appointments (
  id TEXT PRIMARY KEY,
  contributor_id TEXT NOT NULL REFERENCES contributors(id),
  role_code TEXT NOT NULL CHECK (role_code IN ('executive', 'full_administrator', 'administrator', 'moderator')),
  office_title TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'revoked')),
  reason TEXT NOT NULL DEFAULT '',
  appointed_by TEXT NOT NULL REFERENCES contributors(id),
  appointed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by TEXT REFERENCES contributors(id),
  changed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  change_note TEXT NOT NULL DEFAULT ''
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_role_one_active_per_member
  ON staff_role_appointments(contributor_id) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_staff_role_status_code
  ON staff_role_appointments(status, role_code, appointed_at DESC);
