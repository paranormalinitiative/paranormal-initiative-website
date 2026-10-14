-- TPI-DEV-013: additive creator application details.
-- Applications remain attached to an existing contributor account through
-- applicant_id. These fields contain applicant-provided development data;
-- they do not grant memberships or Creator Studio access.
ALTER TABLE founding50_applications ADD COLUMN contact_email TEXT NOT NULL DEFAULT '';
ALTER TABLE founding50_applications ADD COLUMN website_url TEXT NOT NULL DEFAULT '';
ALTER TABLE founding50_applications ADD COLUMN social_channels TEXT NOT NULL DEFAULT '[]';
ALTER TABLE founding50_applications ADD COLUMN video_channels TEXT NOT NULL DEFAULT '[]';
ALTER TABLE founding50_applications ADD COLUMN creator_description TEXT NOT NULL DEFAULT '';
ALTER TABLE creator_partnership_memberships ADD COLUMN application_id TEXT REFERENCES founding50_applications(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_founding50_applications_status_created
  ON founding50_applications(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_creator_partnership_memberships_application
  ON creator_partnership_memberships(application_id);
