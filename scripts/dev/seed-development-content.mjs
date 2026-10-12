import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";
import { tmpdir } from "node:os";

const repoRoot = process.cwd();
const config = readFileSync(join(repoRoot, "wrangler.dev.toml"), "utf8");
const requiredConfig = [
  'name = "theparanormalinitiative-dev"',
  'database_name = "tpi_contributor_portal_dev"',
  'database_id = "4948ecc5-35de-4782-8f6b-b07fa1782b66"',
  'bucket_name = "tpi-contributor-media-dev"',
  'TPI_ENV = "development"',
  'TPI_DISABLE_OUTBOUND = "1"'
];
for (const value of requiredConfig) {
  if (!config.includes(value)) throw new Error(`Development config guard failed: ${value}`);
}
for (const forbidden of [
  'name = "theparanormalinitiative"',
  'database_name = "tpi_contributor_portal"',
  'database_id = "f36b9161-b517-4634-9857-bef4147cefe3"',
  'bucket_name = "tpi-contributor-media"',
  'paranormalinitiative.com'
]) {
  if (config.includes(forbidden)) throw new Error(`Production value found in development config: ${forbidden}`);
}

const branch = execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
if (branch !== "codex/tpi-development") {
  throw new Error(`Development content seed requires codex/tpi-development; current branch is ${branch || "detached"}`);
}

const value = input => `'${String(input).replaceAll("'", "''")}'`;
const seedPostIds = [
  "tpi-dev-seed-post-methodology",
  "tpi-dev-seed-post-evidence",
  "tpi-dev-seed-post-equipment"
];
const seedCommentIds = [
  "tpi-dev-seed-comment-methodology",
  "tpi-dev-seed-comment-evidence"
];
const seedReactionIds = [
  "tpi-dev-seed-reaction-methodology",
  "tpi-dev-seed-reaction-evidence"
];
const seedVideoIds = [
  "900001",
  "900002",
  "900003"
];

const cleanup = process.argv.includes("--cleanup");
const postIdList = seedPostIds.map(value).join(", ");
const commentIdList = seedCommentIds.map(value).join(", ");
const reactionIdList = seedReactionIds.map(value).join(", ");
const videoIdList = seedVideoIds.map(value).join(", ");

const sql = cleanup ? `
DELETE FROM community_attachments WHERE target_id IN (${postIdList}, ${commentIdList});
DELETE FROM community_reactions WHERE id IN (${reactionIdList});
DELETE FROM community_comments WHERE id IN (${commentIdList});
DELETE FROM community_posts WHERE id IN (${postIdList});
DELETE FROM videos WHERE id IN (${videoIdList});
` : `
-- Development-only synthetic records. No production records or private media are copied.
INSERT OR IGNORE INTO community_posts (id, category_id, author_id, title, body, status, created_at, updated_at)
VALUES
  (${value(seedPostIds[0])}, 'investigation', (SELECT id FROM contributors WHERE username = 'tpi-dev-member'), '[DEVELOPMENT TEST CONTENT] Investigation method check', 'Development-only QA record. Use this post to verify Feed rendering, editing, comments, reactions, and pagination without touching production data.', 'visible', '2026-10-12T20:03:00Z', '2026-10-12T20:03:00Z'),
  (${value(seedPostIds[1])}, 'evidence-science', (SELECT id FROM contributors WHERE username = 'tpi-dev-owner'), '[DEVELOPMENT TEST CONTENT] Evidence review checklist', 'Development-only QA record. This synthetic discussion checks long-form text rendering and the visible Evidence Science category.', 'visible', '2026-10-12T20:02:00Z', '2026-10-12T20:02:00Z'),
  (${value(seedPostIds[2])}, 'equipment', (SELECT id FROM contributors WHERE username = 'tpi-dev-member'), '[DEVELOPMENT TEST CONTENT] Equipment baseline notes', 'Development-only QA record. Synthetic content for checking category filters and responsive Feed cards.', 'visible', '2026-10-12T20:01:00Z', '2026-10-12T20:01:00Z');

INSERT OR IGNORE INTO community_comments (id, post_id, author_id, body, status, created_at, updated_at)
VALUES
  (${value(seedCommentIds[0])}, ${value(seedPostIds[0])}, (SELECT id FROM contributors WHERE username = 'tpi-dev-owner'), 'Development-only comment: the isolated owner account can read and respond to this post.', 'visible', '2026-10-12T20:04:00Z', '2026-10-12T20:04:00Z'),
  (${value(seedCommentIds[1])}, ${value(seedPostIds[1])}, (SELECT id FROM contributors WHERE username = 'tpi-dev-member'), 'Development-only comment: this verifies the member account can load the comment panel.', 'visible', '2026-10-12T20:05:00Z', '2026-10-12T20:05:00Z');

INSERT OR IGNORE INTO community_reactions (id, target_type, target_id, contributor_id, reaction, created_at)
VALUES
  (${value(seedReactionIds[0])}, 'post', ${value(seedPostIds[0])}, (SELECT id FROM contributors WHERE username = 'tpi-dev-owner'), 'like', '2026-10-12T20:06:00Z'),
  (${value(seedReactionIds[1])}, 'comment', ${value(seedCommentIds[0])}, (SELECT id FROM contributors WHERE username = 'tpi-dev-member'), 'wow', '2026-10-12T20:07:00Z');

-- Publicly accessible open-media sample pages, clearly labeled as development QA.
-- These are links only; no production media or R2 objects are copied.
INSERT OR IGNORE INTO videos (id, external_id, title, description, source_url, source_name, channel_name, duration_seconds, category, published_at, status)
VALUES
  (${value(seedVideoIds[0])}, 'tpi-dev-openmovie-elephants-dream', '[DEVELOPMENT TEST CONTENT] Elephants Dream playback check', 'Development-only external playback check using the Blender Open Movie project.', 'https://archive.org/details/ElephantsDream', 'Development Test Source', 'Blender Open Movies', 654, 'development-test', '2026-10-12T20:00:00Z', 'approved'),
  (${value(seedVideoIds[1])}, 'tpi-dev-openmovie-sintel', '[DEVELOPMENT TEST CONTENT] Sintel playback check', 'Development-only external playback check using the Blender Open Movie project.', 'https://archive.org/details/Sintel', 'Development Test Source', 'Blender Open Movies', 888, 'development-test', '2026-10-12T19:59:00Z', 'approved'),
  (${value(seedVideoIds[2])}, 'tpi-dev-openmovie-big-buck-bunny', '[DEVELOPMENT TEST CONTENT] Big Buck Bunny playback check', 'Development-only external playback check using the Blender Open Movie project.', 'https://archive.org/details/BigBuckBunny_328', 'Development Test Source', 'Blender Open Movies', 596, 'development-test', '2026-10-12T19:58:00Z', 'approved');
`;

const tempDir = mkdtempSync(join(tmpdir(), "tpi-dev-content-seed-"));
const sqlPath = join(tempDir, cleanup ? "cleanup.sql" : "seed.sql");
try {
  writeFileSync(sqlPath, sql, { mode: 0o600 });
  execFileSync("npx", ["wrangler@4.149.0", "d1", "execute", "TPI_DB", "--remote", "--config", "wrangler.dev.toml", "--file", sqlPath], { stdio: "inherit" });
  console.log(JSON.stringify({
    ok: true,
    mode: cleanup ? "cleanup" : "seed",
    database: "tpi_contributor_portal_dev",
    content: cleanup ? "disposable development records removed" : "synthetic Feed records and public open-media sample links added"
  }));
} finally {
  rmSync(tempDir, { recursive: true, force: true });
}
