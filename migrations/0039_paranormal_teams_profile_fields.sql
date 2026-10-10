-- 0039_paranormal_teams_profile_fields.sql
-- Adds a nullable profile description without changing historical details.
-- The migration is additive and must be applied only through the normal
-- deployment migration process after local profile QA is complete.

ALTER TABLE paranormal_teams ADD COLUMN description TEXT;
