-- LOCAL E2E SEED ONLY — never applied to production.
-- Test identities covering every role + session tokens for direct API testing.
-- Password hash = sha256('e2e-password') (login itself unused; auth via session tokens).

DELETE FROM sessions WHERE token LIKE 'tok-%';
DELETE FROM contributors WHERE username LIKE 'e2e-%';

INSERT INTO contributors (id, username, password_hash, display_name, title, role, correspondence, active)
VALUES
  ('e2e-user-a', 'e2e_user_a', '7b7a2d33a3593a49e04b0b7ea2c39ec88ea555e3e0e28d3d8b77f2d0a3d3a1f2', 'E2E User A', 'Test Member', 'member', 'e2e-a@example.invalid', 1),
  ('e2e-user-b', 'e2e_user_b', '7b7a2d33a3593a49e04b0b7ea2c39ec88ea555e3e0e28d3d8b77f2d0a3d3a1f2', 'E2E User B', 'Test Member', 'member', 'e2e-b@example.invalid', 1),
  ('e2e-user-c', 'e2e_user_c', '7b7a2d33a3593a49e04b0b7ea2c39ec88ea555e3e0e28d3d8b77f2d0a3d3a1f2', 'E2E User C', 'Test Member', 'member', 'e2e-c@example.invalid', 1),
  ('e2e-contrib', 'e2e_contrib', '7b7a2d33a3593a49e04b0b7ea2c39ec88ea555e3e0e28d3d8b77f2d0a3d3a1f2', 'E2E Contributor', 'Field Researcher', 'contributor', 'e2e-contrib@example.invalid', 1),
  ('e2e-admin', 'e2e_admin', '7b7a2d33a3593a49e04b0b7ea2c39ec88ea555e3e0e28d3d8b77f2d0a3d3a1f2', 'E2E Admin', 'Administrator', 'admin', 'e2e-admin@example.invalid', 1),
  ('e2e-owner', 'e2e_owner', '7b7a2d33a3593a49e04b0b7ea2c39ec88ea555e3e0e28d3d8b77f2d0a3d3a1f2', 'E2E Owner', 'Director', 'owner', 'e2e-owner@example.invalid', 1);

-- A member with all actions disabled (authorization-matrix test target)
INSERT INTO contributors (id, username, password_hash, display_name, title, role, correspondence, active, can_post, can_comment, can_message)
VALUES
  ('e2e-muted', 'e2e_muted', '7b7a2d33a3593a49e04b0b7ea2c39ec88ea555e3e0e28d3d8b77f2d0a3d3a1f2', 'E2E Restricted Member', 'Test Member', 'member', 'e2e-muted@example.invalid', 1, 0, 0, 0);

INSERT INTO sessions (token, contributor_id, expires_at) VALUES
  ('tok-a',      'e2e-user-a',  '2030-01-01T00:00:00Z'),
  ('tok-b',      'e2e-user-b',  '2030-01-01T00:00:00Z'),
  ('tok-c',      'e2e-user-c',  '2030-01-01T00:00:00Z'),
  ('tok-contrib','e2e-contrib', '2030-01-01T00:00:00Z'),
  ('tok-admin',  'e2e-admin',   '2030-01-01T00:00:00Z'),
  ('tok-owner',  'e2e-owner',   '2030-01-01T00:00:00Z'),
  ('tok-muted',  'e2e-muted',   '2030-01-01T00:00:00Z');
