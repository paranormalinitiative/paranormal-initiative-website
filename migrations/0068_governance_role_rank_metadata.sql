-- TPI-GOVERNANCE-006: role-owned leadership and board medallion metadata.
-- Additive only. Existing recognition and appointment history is retained.

ALTER TABLE leadership_distinctions ADD COLUMN role_code TEXT NOT NULL DEFAULT 'legacy-recognition';
ALTER TABLE board_members ADD COLUMN role_code TEXT NOT NULL DEFAULT 'board-member';
ALTER TABLE board_members ADD COLUMN domain_code TEXT NOT NULL DEFAULT '';
ALTER TABLE board_members ADD COLUMN medallion_code TEXT NOT NULL DEFAULT 'bronze';

CREATE INDEX IF NOT EXISTS idx_leadership_distinctions_role_code
  ON leadership_distinctions(role_code, distinction_code, status);

CREATE INDEX IF NOT EXISTS idx_board_members_role_domain
  ON board_members(role_code, domain_code, status);

UPDATE leadership_distinctions
SET role_code = 'chief-ai-operating-officer'
WHERE id = 'leadership-sol-gold' AND role_code = 'legacy-recognition';
