#!/usr/bin/env node

// TPI-GOVERNANCE-005 — Board Member badge and audited appointment contract.
// This contract is source/build verification only; destructive appointment
// tests use the existing disposable local auth harness separately.

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const read = file => readFileSync(resolve(root, file), "utf8");
const checks = [];
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
function check(label, pass, detail = "") {
  checks.push({ label, pass: Boolean(pass), detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
}

const migration = read("migrations/0067_board_members_and_badge.sql");
const rankMigration = read("migrations/0068_governance_role_rank_metadata.sql");
const api = read("functions/api/[[path]].js");
const library = read("lib/board-members.js");
const admin = read("admin-center-app/src/app.tsx");
const profile = read("member-login.js");
const css = read("profile-style.css");
const ignore = read(".assetsignore");
const badge256 = resolve(root, "assets/board-members/web/board-member-256.png");
const badge512 = resolve(root, "assets/board-members/web/board-member-512.png");

check("Board Members migration exists", existsSync(resolve(root, "migrations/0067_board_members_and_badge.sql")));
check("appointment history is retained with active/revoked states", migration.includes("status TEXT NOT NULL DEFAULT 'active'") && migration.includes("revoked_at TEXT"));
check("duplicate active appointments are blocked", migration.includes("idx_board_members_active_contributor") && migration.includes("WHERE status = 'active'"));
check("Board Member badge paths are published derivatives", migration.includes("/assets/board-members/web/board-member-256.png") && migration.includes("/assets/board-members/web/board-member-512.png"));
check("admin Board Members routes are protected", api.includes('path === "/admin/board-members"') && api.includes("requireAdmin"));
check("appointment and revoke handlers exist", api.includes("handleAdminAssignBoardMember") && api.includes("handleAdminRevokeBoardMember"));
check("member profiles receive Board Member data", api.includes("boardMembership: await getBoardMembership(env, user.id)"));
check("Board Member library is server-resolved", library.includes("getBoardMembership") && library.includes("listBoardMembers"));
check("Admin Center includes appointment form", admin.includes("Appoint a Board Member") && admin.includes("/admin/board-members"));
check("Admin Center includes revoke control", admin.includes("/admin/board-members/${encodeURIComponent(row.id)}/revoke"));
check("Admin Center keeps authority boundaries visible", admin.includes("does not grant account access or Founding Membership benefits") || admin.includes("Free-text rank assignments are not permitted"));
check("profile UI renders Board Member artwork", profile.includes("renderBoardMembership") && profile.includes("boardMembership.badgePath"));
check("profile styling includes Board Member badge", css.includes(".board-member-badge-chip"));
check("Board Member master is excluded from public package", /^assets\/board-members\/masters\/$/m.test(ignore));
check("256px derivative is a real PNG", existsSync(badge256) && readFileSync(badge256).subarray(0, 8).equals(PNG_SIGNATURE));
check("512px derivative is a real PNG", existsSync(badge512) && readFileSync(badge512).subarray(0, 8).equals(PNG_SIGNATURE));
check("rank metadata migration is additive", rankMigration.includes("ALTER TABLE board_members ADD COLUMN role_code") && rankMigration.includes("ALTER TABLE board_members ADD COLUMN medallion_code"));
check("board role catalog derives medallion rank", library.includes("BOARD_ROLE_CATALOG") && library.includes("boardRolePayload") && library.includes('medallionCode: "gold"'));
check("board domains cover paranormal umbrella", library.includes("research-investigation") && library.includes("ethics-professional-conduct") && library.includes("community-outreach"));
check("board API rejects free-text rank assignment", api.includes("Choose an approved Board role") && api.includes("boardRolePayload(data.roleCode, data.domainCode)"));

const failed = checks.filter(item => !item.pass);
console.log(`\nBoard Member contract: ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exitCode = 1;
