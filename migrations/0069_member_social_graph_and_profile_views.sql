-- 0069: Member social graph and private profile-view history.
-- Additive only. Existing accounts, follows, conversations, posts, and
-- moderation records remain intact.

CREATE TABLE IF NOT EXISTS member_friend_requests (
  id TEXT PRIMARY KEY,
  requester_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  recipient_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending', -- pending | accepted | declined | cancelled
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (requester_id <> recipient_id),
  UNIQUE (requester_id, recipient_id)
);

CREATE INDEX IF NOT EXISTS idx_member_friend_requests_recipient
  ON member_friend_requests(recipient_id, status, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_member_friend_requests_requester
  ON member_friend_requests(requester_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS member_profile_views (
  viewer_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  viewed_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  first_viewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_viewed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK (viewer_id <> viewed_id),
  PRIMARY KEY (viewer_id, viewed_id)
);

CREATE INDEX IF NOT EXISTS idx_member_profile_views_viewer
  ON member_profile_views(viewer_id, last_viewed_at DESC);
