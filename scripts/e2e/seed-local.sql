-- LOCAL E2E SEED ONLY — never applied to production.
-- Test identities covering every role + session tokens for direct API testing.
-- Password hash = sha256('e2e-password') (login itself unused; auth via session tokens).

DELETE FROM sessions WHERE token LIKE 'tok-%';
DELETE FROM contributors WHERE username LIKE 'e2e-%';

INSERT INTO contributors (id, username, password_hash, display_name, title, role, correspondence, active)
VALUES
  ('e2e-user-a', 'e2e_user_a', 'a71bc7b59280c43b37f64e49feeaf2481cda80f8a799d79031ffa12a76d288fd', 'E2E User A', 'Test Member', 'member', 'e2e-a@example.invalid', 1),
  ('e2e-user-b', 'e2e_user_b', 'a71bc7b59280c43b37f64e49feeaf2481cda80f8a799d79031ffa12a76d288fd', 'E2E User B', 'Test Member', 'member', 'e2e-b@example.invalid', 1),
  ('e2e-user-c', 'e2e_user_c', 'a71bc7b59280c43b37f64e49feeaf2481cda80f8a799d79031ffa12a76d288fd', 'E2E User C', 'Test Member', 'member', 'e2e-c@example.invalid', 1),
  ('e2e-contrib', 'e2e_contrib', 'a71bc7b59280c43b37f64e49feeaf2481cda80f8a799d79031ffa12a76d288fd', 'E2E Contributor', 'Field Researcher', 'contributor', 'e2e-contrib@example.invalid', 1),
  ('e2e-admin', 'e2e_admin', 'a71bc7b59280c43b37f64e49feeaf2481cda80f8a799d79031ffa12a76d288fd', 'E2E Admin', 'Administrator', 'admin', 'e2e-admin@example.invalid', 1),
  ('e2e-owner', 'e2e_owner', 'a71bc7b59280c43b37f64e49feeaf2481cda80f8a799d79031ffa12a76d288fd', 'E2E Owner', 'Director', 'owner', 'e2e-owner@example.invalid', 1);

-- A member with all actions disabled (authorization-matrix test target)
INSERT INTO contributors (id, username, password_hash, display_name, title, role, correspondence, active, can_post, can_comment, can_message)
VALUES
  ('e2e-muted', 'e2e_muted', 'a71bc7b59280c43b37f64e49feeaf2481cda80f8a799d79031ffa12a76d288fd', 'E2E Restricted Member', 'Test Member', 'member', 'e2e-muted@example.invalid', 1, 0, 0, 0);

INSERT INTO sessions (token, contributor_id, expires_at) VALUES
  ('tok-a',      'e2e-user-a',  '2030-01-01T00:00:00Z'),
  ('tok-b',      'e2e-user-b',  '2030-01-01T00:00:00Z'),
  ('tok-c',      'e2e-user-c',  '2030-01-01T00:00:00Z'),
  ('tok-contrib','e2e-contrib', '2030-01-01T00:00:00Z'),
  ('tok-admin',  'e2e-admin',   '2030-01-01T00:00:00Z'),
  ('tok-owner',  'e2e-owner',   '2030-01-01T00:00:00Z'),
  ('tok-muted',  'e2e-muted',   '2030-01-01T00:00:00Z');
