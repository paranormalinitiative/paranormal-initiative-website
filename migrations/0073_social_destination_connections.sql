-- TPI connected destination authorization. Tokens are encrypted application
-- secrets; this table intentionally exposes only safe metadata to the Admin UI.
CREATE TABLE IF NOT EXISTS social_destination_connections (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('facebook', 'youtube')),
  provider_account_id TEXT NOT NULL,
  display_name TEXT NOT NULL,
  access_token_ciphertext TEXT NOT NULL,
  refresh_token_ciphertext TEXT,
  scopes_json TEXT NOT NULL DEFAULT '[]',
  capabilities_json TEXT NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disconnected', 'error')),
  token_expires_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_social_destinations_owner_provider_account
  ON social_destination_connections(owner_id, provider, provider_account_id);
CREATE INDEX IF NOT EXISTS idx_social_destinations_owner_status
  ON social_destination_connections(owner_id, status, provider, updated_at DESC);

CREATE TABLE IF NOT EXISTS social_oauth_states (
  state TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES contributors(id) ON DELETE CASCADE,
  provider TEXT NOT NULL CHECK (provider IN ('facebook', 'youtube')),
  return_path TEXT NOT NULL DEFAULT '/admin-panel#destinations',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_social_oauth_states_expiry
  ON social_oauth_states(expires_at);
