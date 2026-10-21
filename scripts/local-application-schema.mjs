#!/usr/bin/env node

// Apply only the verified local application schema needed by OPS-010/011/012.
// This deliberately does not walk or execute the historical migration
// directory wholesale. Additive ALTER migrations are checked against the
// actual local SQLite state before their authoritative SQL file is run.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { execFileSync, spawnSync } from "node:child_process";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const localState = resolve(repoRoot, ".local-dev/state");
const configPath = resolve(repoRoot, "wrangler.local.toml");
const backupPath = resolve(repoRoot, ".local-dev/backups/tpi-ops-012-before-schema.sql");
const database = "tpi-local-foundation";

function fail(message) {
  console.error(`Local application schema aborted: ${message}`);
  process.exit(1);
}

if (!process.argv.includes("--local-only")) fail("pass --local-only to confirm isolated local D1 execution");
if (!existsSync(configPath) || !existsSync(localState)) fail("local Wrangler configuration or state is missing");
if (!existsSync(backupPath) || readFileSync(backupPath, "utf8").length < 1000) fail("verified local backup is missing or too small");
const config = readFileSync(configPath, "utf8");
for (const required of ['name = "tpi-local"', 'TPI_ENV = "local"', 'TPI_LOCAL_ONLY = "1"', 'database_name = "tpi-local-foundation"']) {
  if (!config.includes(required)) fail(`required local setting is missing: ${required}`);
}
for (const forbidden of ["theparanormalinitiative-dev", "tpi_contributor_portal_dev", "paranormalinitiative.com", "tpi_contributor_portal\""]) {
  if (config.includes(forbidden)) fail(`remote or production value found: ${forbidden}`);
}

const dbCandidates = execFileSync("find", [resolve(localState, "v3/d1"), "-maxdepth", "2", "-type", "f", "-name", "*.sqlite", "!", "-name", "metadata.sqlite"], { encoding: "utf8" })
  .trim().split("\n").filter(Boolean);
if (!dbCandidates.length) fail("local D1 SQLite database was not found");
const dbPath = dbCandidates.find(candidate => {
  try { return execFileSync("sqlite3", [candidate, "SELECT 1 FROM sqlite_master WHERE type='table' AND name='contributors' LIMIT 1;"], { encoding: "utf8" }).trim() === "1"; } catch { return false; }
});
if (!dbPath) fail("local D1 contributors table was not found");

function sqlite(sql) {
  return execFileSync("sqlite3", [dbPath, sql], { encoding: "utf8" }).trim();
}
function sqlLiteral(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}
function tableExists(name) {
  return sqlite(`SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name=${sqlLiteral(name)};`) === "1";
}
function columnExists(table, column) {
  return sqlite(`SELECT COUNT(*) FROM pragma_table_info(${sqlLiteral(table)}) WHERE name=${sqlLiteral(column)};`) === "1";
}

const migrations = [
  { file: "migrations/0002_contributor_profiles.sql", columns: ["bio", "photo_url"] },
  { file: "migrations/0002_article_type.sql", columns: ["article_type"], table: "articles" },
  { file: "migrations/0009_member_chat_color.sql", columns: ["chat_color"] },
  { file: "migrations/0011_article_reactions.sql", tables: ["article_reactions"] },
  { file: "migrations/0013_video_comments.sql", tables: ["video_comments"] },
  { file: "migrations/0014_tpi_videos_content.sql", tables: ["tpi_videos"] },
  { file: "migrations/0015_video_reactions_saves_reports.sql", columns: ["viewing_access"], table: "tpi_videos", tables: ["video_reactions", "video_saves", "video_reports"] },
  { file: "migrations/0016_member_contact_fields.sql", columns: ["contact_name", "phone", "address_line1", "address_line2", "city", "state", "postal_code", "email_verified", "phone_verified"] },
  { file: "migrations/0017_member_notifications.sql", tables: ["member_notifications"] },
  { file: "migrations/0018_member_access_controls.sql", columns: ["can_post", "can_comment", "can_message"], tables: ["site_settings"] },
  { file: "migrations/0019_messenger_d1_sync.sql", tables: ["conversations", "conversation_participants", "messages", "message_read_state"] },
  { file: "migrations/0020_messenger_retention_hidden_state.sql", columns: ["hidden_at", "archived_at"], table: "conversation_participants" },
  { file: "migrations/0021_messenger_conversation_controls.sql", columns: ["theme", "quick_emoji", "muted_until", "read_receipts_enabled"], table: "conversation_participants", tables: ["conversation_nicknames", "member_blocks", "member_restrictions", "messenger_reports"] },
  { file: "migrations/0022_messenger_presence.sql", tables: ["member_presence"] },
  { file: "migrations/0027_contributor_theme.sql", columns: ["theme"] },
  { file: "migrations/0028_notification_prefs.sql", columns: ["notification_prefs"] },
  { file: "migrations/0032_community_feed.sql", tables: ["community_categories", "community_posts", "community_comments", "community_reactions", "community_attachments"] },
  { file: "migrations/0038_member_personalization.sql", tables: ["member_personalization"] },
  { file: "migrations/0029_news_articles.sql", tables: ["news_articles"] },
  { file: "migrations/0030_videos.sql", tables: ["videos"] },
  { file: "migrations/004_events.sql", tables: ["events", "event_rsvps"] },
  { file: "migrations/0037_member_media_library.sql", tables: ["member_media_albums", "member_media_library"] },
  { file: "migrations/0023_studioflow_realtimekit.sql", tables: ["studio_rooms"] },
  { file: "migrations/0024_studioflow_invite_codes.sql", tables: ["studio_room_codes"] },
  { file: "migrations/0025_paranormal_teams.sql", tables: ["paranormal_teams"] },
  { file: "migrations/0041_live_interaction.sql", tables: ["live_broadcasts", "live_comments", "live_reactions"] },
  { file: "migrations/0042_tpi_video_channels.sql", columns: ["channel_id"], table: "tpi_videos", tables: ["tpi_video_channels"] },
  { file: "migrations/0043_tpi_video_discovery_social.sql", columns: ["parent_id"], table: "video_comments", tables: ["tpi_video_follows"] },
  { file: "migrations/0044_tpi_broadcast_integration.sql", columnsByTable: {
    live_broadcasts: ["scheduled_at", "scheduled_timezone", "visibility", "playback_provider", "playback_url", "playback_verified", "replay_url", "replay_published", "moderation_status", "sync_version", "last_sync_at"],
    tpi_videos: ["broadcast_id", "broadcast_status", "scheduled_at", "scheduled_timezone", "playback_provider", "playback_url", "playback_verified", "replay_url", "replay_published", "actual_started_at", "actual_ended_at", "sync_version", "last_sync_at"]
  } },
  { file: "migrations/0045_tpi_video_member_history.sql", tables: ["tpi_video_saved_items", "tpi_video_watch_history"] },
  { file: "migrations/0046_tpi_video_formats.sql", columns: ["format"], table: "tpi_videos" },
  { file: "migrations/0035_scraper_runs.sql", tables: ["scraper_runs"] },
  { file: "migrations/0036_paranormal_teams_extensions.sql", columns: ["record_type", "external_id", "external_source", "imported_at", "import_batch", "claimed_at", "claimed_by", "verification_status", "verified_at", "last_verified_at"], table: "paranormal_teams", tables: ["organization_links", "team_verification_events", "team_claims", "team_members", "team_imports"] },
  { file: "migrations/0039_paranormal_teams_profile_fields.sql", columns: ["description"], table: "paranormal_teams" },
  { file: "migrations/0040_paranormal_teams_management_audit.sql", tables: ["team_edit_events"] },
  { file: "migrations/0047_admin_audit_logs.sql", tables: ["admin_audit_logs"] },
  { file: "migrations/0048_creator_partnership_admin.sql", tables: ["creator_partnership_memberships", "founding50_allocations", "creator_studio_entitlements", "creator_partnership_membership_history", "founding50_applications"] },
  { file: "migrations/0050_creator_application_details.sql", columns: ["contact_email", "website_url", "social_channels", "video_channels", "creator_description"], table: "founding50_applications", columnsByTable: { creator_partnership_memberships: ["application_id"] } },
  { file: "migrations/0049_studioflow_room_relay.sql", tables: ["studio_room_guests", "studio_room_signals"] },
  { file: "migrations/0051_studioflow_workspaces.sql", tables: ["studio_workspaces"] },
  { file: "migrations/0052_my_studios.sql", columns: ["studio_number", "deleted_at"], table: "studio_workspaces", tables: ["studio_number_allocations"] },
];

function missingParts(migration) {
  const missingColumns = (migration.columns || []).filter(column => !columnExists(migration.table || "contributors", column));
  const missingColumnsByTable = Object.fromEntries(Object.entries(migration.columnsByTable || {}).map(([table, columns]) => [
    table,
    columns.filter(column => !columnExists(table, column))
  ]));
  const missingTables = (migration.tables || []).filter(table => !tableExists(table));
  return { missingColumns, missingColumnsByTable, missingTables };
}

function partialParts(migration) {
  const missing = missingParts(migration);
  const expectedColumns = migration.columns?.length || 0;
  const presentColumns = expectedColumns - missing.missingColumns.length;
  const expectedTables = migration.tables?.length || 0;
  const presentTables = expectedTables - missing.missingTables.length;
  const partialColumnsByTable = Object.entries(migration.columnsByTable || {}).some(([table, columns]) => {
    const missingColumns = missing.missingColumnsByTable[table] || [];
    return missingColumns.length > 0 && missingColumns.length < columns.length;
  });
  return (expectedColumns > 0 && presentColumns > 0 && missing.missingColumns.length > 0)
    || (expectedTables > 0 && presentTables > 0 && missing.missingTables.length > 0)
    || partialColumnsByTable;
}

function applyMigration(file) {
  const wrangler = process.env.WRANGLER_BIN || "wrangler";
  const result = spawnSync(wrangler, [
    "d1", "execute", database,
    "--config", configPath,
    "--local",
    "--persist-to", localState,
    "--file", resolve(repoRoot, file),
    "--yes",
  ], { cwd: repoRoot, env: { ...process.env, TPI_ENV: "local", TPI_LOCAL_ONLY: "1" }, stdio: "inherit" });
  if (result.error) fail(result.error.message);
  if (result.status !== 0) fail(`${file} failed with exit code ${result.status}`);
}

const results = [];
for (const migration of migrations) {
  const missing = missingParts(migration);
  const missingColumnsByTable = Object.values(missing.missingColumnsByTable || {}).some(columns => columns.length > 0);
  if (!missing.missingColumns.length && !missing.missingTables.length && !missingColumnsByTable) {
    results.push({ file: migration.file, status: "ALREADY_PRESENT" });
    continue;
  }
  if (partialParts(migration)) fail(`${migration.file} is partially applied; manual local review is required before continuing`);
  applyMigration(migration.file);
  const after = missingParts(migration);
  if (after.missingColumns.length || after.missingTables.length || Object.values(after.missingColumnsByTable || {}).some(columns => columns.length > 0)) fail(`${migration.file} completed without establishing its declared schema`);
  results.push({ file: migration.file, status: "APPLIED" });
}

console.log(JSON.stringify({ status: "READY", database, backupPath: ".local-dev/backups/tpi-ops-012-before-schema.sql", migrations: results }));
