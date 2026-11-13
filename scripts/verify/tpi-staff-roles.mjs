#!/usr/bin/env node

// TPI staff appointments: policy mapping, durable role records, protected API
// paths, profile recognition, and the staff-facing controls.
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { effectiveStaffRole, mayUseAdminRoute, STAFF_ROLE_CATALOG } from "../../lib/staff-roles.js";

const root = resolve(import.meta.dirname, "../..");
const read = file => readFileSync(resolve(root, file), "utf8");
const checks = [];
function check(label, pass) {
  checks.push({ label, pass: Boolean(pass) });
  console.log(`${pass ? "PASS" : "FAIL"} ${label}`);
}

const migration = read("migrations/0071_staff_role_appointments.sql");
const api = read("functions/api/[[path]].js");
const profile = read("member-home.html");
const admin = read("admin-panel.html");
const adminJs = read("admin-center.js");
const moderation = read("moderation.html");
const worker = read("worker.js");

check("migration stores explicit staff appointments and preserves revoked history", migration.includes("staff_role_appointments") && migration.includes("status TEXT NOT NULL DEFAULT 'active'") && migration.includes("'revoked'"));
check("one active staff appointment per account prevents stacking", migration.includes("UNIQUE INDEX") && migration.includes("WHERE status = 'active'"));
check("supported appointment types match the adopted role model", ["executive", "full_administrator", "administrator", "moderator"].every(role => migration.includes(`'${role}'`) && STAFF_ROLE_CATALOG[role]));

const owner = { id: "owner", role: "owner" };
const legacyAdmin = { id: "legacy-admin", role: "admin" };
const member = { id: "member", role: "member" };
const assignments = new Map([["executive", { roleCode: "executive" }], ["full", { roleCode: "full_administrator" }], ["moderator", { roleCode: "moderator" }]]);
const mockDb = { TPI_DB: { prepare: () => ({ bind: id => ({ first: async () => assignments.get(id) || null }) }) } };
check("existing Owner and Admin account roles remain mapped safely", await effectiveStaffRole(mockDb, owner) === "owner" && await effectiveStaffRole(mockDb, legacyAdmin) === "administrator");
check("appointed Executive, Full Administrator, and Moderator resolve server-side", await effectiveStaffRole(mockDb, { id: "executive", role: "member" }) === "executive" && await effectiveStaffRole(mockDb, { id: "full", role: "member" }) === "full_administrator" && await effectiveStaffRole(mockDb, { id: "moderator", role: "member" }) === "moderator");
check("admin route matrix protects high-impact controls and separates staff tiers", mayUseAdminRoute("administrator", "/admin/community/posts", "GET") && !mayUseAdminRoute("administrator", "/admin/settings", "GET") && !mayUseAdminRoute("administrator", "/admin/members/123/entitlements", "POST") && mayUseAdminRoute("full_administrator", "/admin/community/posts", "GET") && !mayUseAdminRoute("full_administrator", "/admin/founding-memberships/assign", "POST") && !mayUseAdminRoute("full_administrator", "/admin/staff-roles", "POST") && mayUseAdminRoute("executive", "/admin/staff-roles", "POST") && !mayUseAdminRoute("moderator", "/admin/community/posts", "GET"));
check("only executive-level appointments can manage staff assignments", api.includes('path === "/admin/staff-roles"') && api.includes("requireExecutive(request, env") && api.includes("Only the Owner can appoint an Executive or Full Administrator."));
check("role changes are audited and require a reason", api.includes('"staff_role.appointed"') && api.includes('"staff_role.revoked"') && api.includes("reason.length < 8"));
check("account access controls protect Owner, Executive, and staff peers", api.includes("The Owner account is protected from staff account changes.") && api.includes("Only the Owner or Executive leadership can change a staff account.") && api.includes("Only the Owner can change an Executive account."));
check("Moderator content actions require a reason and retain audit history", api.includes("handleModerationStatus") && api.includes("community.${kind.slice(0, -1)}_moderated") && api.includes("Moderators may hide or remove content."));
check("member profiles show badges from server staff identity", api.includes("staffIdentity: await publicStaffIdentity(env, target)") && profile.includes("staffIdentity.role") && profile.includes("(isModerator ? \"moderator\" : \"administrator\")") && existsSync(resolve(root, "assets/operational-roles/web/moderator-256.png")) && existsSync(resolve(root, "assets/operational-roles/web/administrator-256.png")));
check("Admin Center provides a protected appointment form and audit-aware history", admin.includes("data-admin-staff-form") && admin.includes("Staff Roles &amp; Authority") && adminJs.includes("/api/admin/staff-roles"));
check("Moderators receive a narrow moderation console, not the Admin Center", existsSync(resolve(root, "moderation.html")) && moderation.includes("/api/moderation/queue") && moderation.includes("/api/moderation/") && worker.includes("/moderation.html"));
check("owner-supplied Moderator and Administrator derivatives exist", existsSync(resolve(root, "assets/operational-roles/web/moderator-256.png")) && existsSync(resolve(root, "assets/operational-roles/web/administrator-256.png")));

const failed = checks.filter(row => !row.pass);
console.log(`\nStaff roles verification: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exitCode = 1;
