import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);
const sql = readFileSync(resolve(repoRoot, "scripts/sql/tpi-nova-editorial-production-reconciliation.sql"), "utf8");

const required = [
  "CREATE TABLE IF NOT EXISTS nova_collections",
  "CREATE TABLE IF NOT EXISTS nova_items",
  "CREATE TABLE IF NOT EXISTS nova_revisions",
  "ALTER TABLE articles ADD COLUMN nova_item_id TEXT",
  "ALTER TABLE articles ADD COLUMN editorial_status TEXT NOT NULL DEFAULT 'legacy'",
  "ALTER TABLE articles ADD COLUMN affiliation TEXT",
  "CREATE TABLE IF NOT EXISTS article_editorial_submissions",
  "CREATE TABLE IF NOT EXISTS article_editorial_events",
  "revision_started",
  "trg_article_editorial_events_no_update",
  "trg_article_editorial_events_no_delete"
];
for (const fragment of required) assert.match(sql, new RegExp(fragment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), fragment);
assert.doesNotMatch(sql, /\b(DROP|DELETE\s+FROM|UPDATE\s+articles)\b/i, "production reconciliation must not drop or rewrite data");

console.log(`Nova Editorial production schema contract: ${required.length + 1} passed, 0 failed`);
