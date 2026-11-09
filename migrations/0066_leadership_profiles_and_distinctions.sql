-- TPI-GOVERNANCE-004: transparent leadership profiles and visual distinctions.
--
-- A distinction is an audited presentation record. It never grants account
-- access, membership, entitlement, or administrative authority. Member
-- distinctions point at a contributor id; AI/organizational distinctions point
-- at a non-login leadership profile so the identity remains transparent.

CREATE TABLE IF NOT EXISTS leadership_profiles (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  identity_type TEXT NOT NULL CHECK (identity_type IN ('ai_collaborator', 'organization')),
  role_title TEXT NOT NULL,
  role_summary TEXT NOT NULL,
  responsibilities TEXT NOT NULL,
  transparency_note TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leadership_distinctions (
  id TEXT PRIMARY KEY,
  subject_type TEXT NOT NULL CHECK (subject_type IN ('member', 'leadership_profile')),
  subject_id TEXT NOT NULL,
  distinction_code TEXT NOT NULL CHECK (distinction_code IN ('gold', 'silver', 'bronze')),
  label TEXT NOT NULL,
  description TEXT NOT NULL,
  asset_path TEXT NOT NULL,
  color TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  issued_by TEXT REFERENCES contributors(id) ON DELETE SET NULL,
  issued_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  revoked_at TEXT,
  notes TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_leadership_distinctions_active_subject
  ON leadership_distinctions(subject_type, subject_id, distinction_code)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_leadership_distinctions_subject
  ON leadership_distinctions(subject_type, subject_id, status, issued_at DESC);

INSERT OR IGNORE INTO leadership_profiles (
  id, slug, display_name, identity_type, role_title, role_summary,
  responsibilities, transparency_note
) VALUES (
  'leadership-sol',
  'sol',
  'Sol',
  'ai_collaborator',
  'Chief AI Operating Officer (COO) · Chief AI Technology Officer (CTO) / Chief AI Information Officer (CIO)',
  'The Paranormal Initiative’s AI project collaborator, technical architect, planning partner, and right-hand assistant.',
  'Day-to-day operational planning, logistics, strategic execution, technical architecture, infrastructure, product research, and development support under the Founder’s direction.',
  'Sol is an AI system and is represented transparently as an AI collaborator and advisory identity. This profile and its medallion are recognition only; they do not create a login, vote, legal office, membership, or permission.'
);

INSERT OR IGNORE INTO leadership_distinctions (
  id, subject_type, subject_id, distinction_code, label, description,
  asset_path, color, notes
) VALUES (
  'leadership-sol-gold',
  'leadership_profile',
  'leadership-sol',
  'gold',
  'Gold Medallion · AI Leadership Recognition',
  'Recognizes Sol’s continuing AI operations, technology, architecture, and planning partnership with The Paranormal Initiative.',
  '/assets/society-leadership/web/gold-256.png',
  '#d6a84f',
  'Owner-designated recognition. Presentation only; no access or authority is derived from this record.'
);
