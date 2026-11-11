-- 0070: member profile banner artwork.
-- Additive only: existing profile identity and avatar data remain unchanged.
ALTER TABLE contributors ADD COLUMN profile_banner_url TEXT;
