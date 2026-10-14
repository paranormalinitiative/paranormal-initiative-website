import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const repoRoot = process.cwd();
const sqlValue = value => `'${String(value).replaceAll("'", "''")}'`;
const fixturePasswordHash = createHash("sha256").update("TPI-DEV-020-unused-fixture-marker").digest("hex");

const creatorId = "tpi-dev020-creator-id";
const categoryId = "tpi-dev020-category-001";
const postId = "tpi-dev020-post-001";
const commentId = "tpi-dev020-comment-001";
const articleId = "tpi-dev020-article-001";
const notificationId = "tpi-dev020-notification-001";
const approveTeamId = "tpi-dev020-team-approve-001";
const rejectTeamId = "tpi-dev020-team-reject-001";
const approveClaimId = "tpi-dev020-claim-approve-001";
const rejectClaimId = "tpi-dev020-claim-reject-001";

const sql = `
INSERT INTO contributors
  (id, username, password_hash, display_name, title, role, correspondence, organization, website, bio, comment_signature_enabled, active)
VALUES
  (${sqlValue(creatorId)}, 'tpi-dev020-creator', ${sqlValue(fixturePasswordHash)}, 'TPI-DEV-020 Creator Fixture', 'Synthetic acceptance fixture', 'member', 'tpi-dev020-creator@example.invalid', 'TPI-DEV-020 synthetic fixture', 'https://example.invalid/tpi-dev-020', 'Development-only additive fixture. This account is not used for login.', 1, 1)
ON CONFLICT(id) DO NOTHING;

INSERT INTO community_categories (id, title, description, sort_order, active)
VALUES (${sqlValue(categoryId)}, 'TPI-DEV-020 Fixture', 'Development-only acceptance fixture category.', 9999, 1)
ON CONFLICT(id) DO NOTHING;

INSERT INTO community_posts (id, category_id, author_id, title, body, status)
VALUES (${sqlValue(postId)}, ${sqlValue(categoryId)}, ${sqlValue(creatorId)}, '[TPI-DEV-020] Synthetic moderation post', 'Development-only additive fixture for authenticated moderation persistence verification.', 'visible')
ON CONFLICT(id) DO NOTHING;

INSERT INTO community_comments (id, post_id, author_id, body, status)
VALUES (${sqlValue(commentId)}, ${sqlValue(postId)}, ${sqlValue(creatorId)}, 'Development-only synthetic comment for moderation detail verification.', 'visible')
ON CONFLICT(id) DO NOTHING;

INSERT INTO articles
  (id, destination, href, title, subtitle, article_type, author, source, body_html, article_html, labels, status, created_by)
VALUES
  (${sqlValue(articleId)}, 'tpi-dev020-fixture', 'published-article.html?id=${articleId}', '[TPI-DEV-020] Synthetic acceptance article', 'Development-only article fixture', 'article', 'TPI-DEV-020 Fixture', 'https://example.invalid/tpi-dev-020', '<p>Development-only additive fixture for article persistence verification.</p>', '<p>Development-only article fixture.</p>', 'tpi-dev020,synthetic', 'draft', (SELECT id FROM contributors WHERE username = 'tpi-dev014-admin'))
ON CONFLICT(id) DO NOTHING;

INSERT INTO member_notifications
  (id, contributor_id, title, body, action_href, type, created_by)
VALUES
  (${sqlValue(notificationId)}, (SELECT id FROM contributors WHERE username = 'tpi-dev014-admin'), '[TPI-DEV-020] Synthetic notification', 'Development-only notification fixture for read-state persistence verification.', '/admin-center-preview/', 'tpi-dev-020', (SELECT id FROM contributors WHERE username = 'tpi-dev014-admin'))
ON CONFLICT(id) DO NOTHING;

INSERT INTO paranormal_teams
  (id, status, scope, name, city, state, country, email, website, facebook, details, description, submitter_name, submitter_email, submitted_ip, record_type, verification_status)
VALUES
  (${sqlValue(approveTeamId)}, 'pending', 'us', '[TPI-DEV-020] Claim Approval Fixture', 'Somerset', 'PA', 'United States', 'approve@example.invalid', 'https://example.invalid/tpi-dev020-approve', 'https://facebook.com/tpi-dev020-approve', 'Development-only claim approval fixture.', 'Development-only claim approval fixture.', 'TPI-DEV-020', 'tpi-dev020@example.invalid', 'tpi-dev020-fixture', 'REGISTERED_TEAM', 'UNVERIFIED'),
  (${sqlValue(rejectTeamId)}, 'pending', 'us', '[TPI-DEV-020] Claim Rejection Fixture', 'Somerset', 'PA', 'United States', 'reject@example.invalid', 'https://example.invalid/tpi-dev020-reject', 'https://facebook.com/tpi-dev020-reject', 'Development-only claim rejection fixture.', 'Development-only claim rejection fixture.', 'TPI-DEV-020', 'tpi-dev020@example.invalid', 'tpi-dev020-fixture', 'REGISTERED_TEAM', 'UNVERIFIED')
ON CONFLICT(id) DO NOTHING;

INSERT INTO team_claims
  (id, team_id, claimant_id, claimant_name, claimant_email, claimant_role, evidence_url, evidence_description, status)
VALUES
  (${sqlValue(approveClaimId)}, ${sqlValue(approveTeamId)}, ${sqlValue(creatorId)}, 'TPI-DEV-020 Creator Fixture', 'tpi-dev020-creator@example.invalid', 'Owner', 'https://example.invalid/tpi-dev020-approve', 'Development-only approval fixture evidence.', 'pending'),
  (${sqlValue(rejectClaimId)}, ${sqlValue(rejectTeamId)}, ${sqlValue(creatorId)}, 'TPI-DEV-020 Creator Fixture', 'tpi-dev020-creator@example.invalid', 'Owner', 'https://example.invalid/tpi-dev020-reject', 'Development-only rejection fixture evidence.', 'pending')
ON CONFLICT(id) DO NOTHING;
`;

const tempDir = mkdtempSync(join(tmpdir(), "tpi-dev020-seed-"));
const sqlPath = join(tempDir, "fixtures.sql");
try {
  writeFileSync(sqlPath, sql, { mode: 0o600 });
  execFileSync("/opt/homebrew/bin/wrangler", [
    "d1", "execute", "tpi_contributor_portal_dev", "--remote",
    "--config", join(repoRoot, "wrangler.dev.toml"), "--file", sqlPath
  ], { stdio: "inherit", cwd: repoRoot });
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}

console.log(JSON.stringify({
  ok: true,
  directive: "TPI-DEV-020",
  database: "tpi_contributor_portal_dev",
  fixtureIds: { creatorId, categoryId, postId, commentId, articleId, notificationId, approveTeamId, rejectTeamId, approveClaimId, rejectClaimId }
}));
