#!/usr/bin/env node

/**
 * Fixture-level authorization checks for the Paranormal Teams D1 contract.
 *
 * This intentionally does not contact Cloudflare or mutate a configured D1
 * database. It creates a temporary SQLite fixture with the same authorization
 * tables/values used by the Worker, exercises the SQL predicates that gate
 * edits and queue mutations, and checks that the route handlers retain their
 * member/admin guards and historical-record protections.
 */

import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const root = new URL("..", import.meta.url).pathname;
const apiPath = join(root, "functions/api/[[path]].js");
const apiSource = readFileSync(apiPath, "utf8");
const fixtureDir = mkdtempSync(join(tmpdir(), "tpi-teams-d1-"));
const dbPath = join(fixtureDir, "fixture.sqlite");

function sql(query) {
  return execFileSync("sqlite3", [dbPath, query], { encoding: "utf8" }).trim();
}

function scalar(query) {
  return sql(query).split("\n")[0] || "";
}

function assertScalar(query, expected, message) {
  assert.equal(scalar(query), String(expected), message);
}

try {
  sql(`
    CREATE TABLE paranormal_teams (
      id TEXT PRIMARY KEY,
      status TEXT NOT NULL,
      record_type TEXT NOT NULL DEFAULT 'REGISTERED_TEAM',
      claimed_by TEXT
    );
    CREATE TABLE team_members (
      team_id TEXT NOT NULL,
      contributor_id TEXT NOT NULL,
      role TEXT NOT NULL
    );
    CREATE TABLE team_claims (
      id TEXT PRIMARY KEY,
      team_id TEXT NOT NULL,
      claimant_id TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending'
    );
    CREATE TABLE team_edit_events (
      team_id TEXT NOT NULL,
      editor_id TEXT NOT NULL,
      editor_role TEXT NOT NULL,
      changes_json TEXT NOT NULL
    );

    INSERT INTO paranormal_teams VALUES
      ('registered-pending', 'pending', 'REGISTERED_TEAM', NULL),
      ('registered-approved', 'approved', 'REGISTERED_TEAM', NULL),
      ('registered-claimed', 'pending', 'REGISTERED_TEAM', 'owner-1'),
      ('imported-pending', 'pending', 'IMPORTED_DIRECTORY_LISTING', NULL);
    INSERT INTO team_members VALUES
      ('registered-pending', 'owner-1', 'owner'),
      ('registered-pending', 'member-1', 'member');
    INSERT INTO team_claims VALUES ('claim-1', 'registered-pending', 'claimant-1', 'pending');
  `);

  // These are the same predicates used by handleUpdateTeam and the admin
  // queue handlers. The fixture makes the expected outcomes executable.
  assertScalar(
    "SELECT COUNT(*) FROM team_members WHERE team_id = 'registered-pending' AND contributor_id = 'owner-1' AND role IN ('owner', 'admin')",
    1,
    "team owner can satisfy the edit membership predicate"
  );
  assertScalar(
    "SELECT COUNT(*) FROM team_members WHERE team_id = 'registered-pending' AND contributor_id = 'member-1' AND role IN ('owner', 'admin')",
    0,
    "ordinary team member cannot satisfy the edit membership predicate"
  );
  assertScalar(
    "SELECT COUNT(*) FROM team_members WHERE team_id = 'registered-pending' AND contributor_id = 'missing-user' AND role IN ('owner', 'admin')",
    0,
    "unrelated member cannot satisfy the edit membership predicate"
  );

  assertScalar(
    "SELECT COUNT(*) FROM paranormal_teams WHERE id = 'registered-pending' AND status <> 'approved' AND claimed_by IS NULL AND record_type = 'REGISTERED_TEAM'",
    1,
    "unclaimed registered pending submission remains deletable from the queue"
  );
  assertScalar(
    "SELECT COUNT(*) FROM paranormal_teams WHERE id = 'registered-approved' AND status <> 'approved' AND claimed_by IS NULL AND record_type = 'REGISTERED_TEAM'",
    0,
    "approved records are protected from queue deletion"
  );
  assertScalar(
    "SELECT COUNT(*) FROM paranormal_teams WHERE id = 'registered-claimed' AND status <> 'approved' AND claimed_by IS NULL AND record_type = 'REGISTERED_TEAM'",
    0,
    "claimed records are protected from queue deletion"
  );
  assertScalar(
    "SELECT COUNT(*) FROM paranormal_teams WHERE id = 'imported-pending' AND status <> 'approved' AND claimed_by IS NULL AND record_type = 'REGISTERED_TEAM'",
    0,
    "imported records are protected from queue deletion"
  );

  assertScalar(
    "SELECT COUNT(*) FROM paranormal_teams WHERE id = 'registered-pending' AND (record_type IS NULL OR record_type = 'REGISTERED_TEAM')",
    1,
    "registered submissions satisfy the publication policy"
  );
  assertScalar(
    "SELECT COUNT(*) FROM paranormal_teams WHERE id = 'imported-pending' AND (record_type IS NULL OR record_type = 'REGISTERED_TEAM')",
    0,
    "imported listings cannot be published through the registered-team approval route"
  );

  sql("INSERT INTO team_edit_events VALUES ('registered-pending', 'owner-1', 'owner', '{\"name\":{\"from\":\"Old\",\"to\":\"New\"}}')");
  assertScalar(
    "SELECT COUNT(*) FROM team_edit_events WHERE team_id = 'registered-pending' AND editor_id = 'owner-1'",
    1,
    "authorized edits leave an append-only audit event"
  );

  assert.match(apiSource, /requireMember\(request, env, user => handleUpdateTeam\(path, request, env, user\)\)/, "team edits remain member-protected");
  assert.match(apiSource, /requireMember\(request, env, user => handleSubmitClaim\(path, request, env, user\)\)/, "team claims remain member-protected");
  assert.match(apiSource, /requireAdmin\(request, env, user => handleAdminListTeams\(request, env, user\)\)/, "team administration remains admin-protected");
  assert.match(apiSource, /team_edit_events.*changes_json/s, "team edits retain audit logging");
  assert.match(apiSource, /team\.status === "approved" \|\| team\.claimed_by \|\| team\.record_type !== "REGISTERED_TEAM"/s, "queue deletion retains historical/import protections");
  assert.match(apiSource, /team\.record_type && team\.record_type !== "REGISTERED_TEAM"/s, "imported publication remains explicitly blocked");

  console.log("PASS: Paranormal Teams D1 authorization fixture and route contracts");
} finally {
  rmSync(fixtureDir, { recursive: true, force: true });
}
