import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const api = read("functions/api/[[path]].js");
const migration = read("migrations/0050_creator_application_details.sql");
const app = read("admin-center-app/src/app.tsx");
const types = read("admin-center-app/src/lib/api.ts");
const devConfig = read("wrangler.dev.toml");

const checks = [
  ["Application details migration is additive and development-neutral", migration.includes("ALTER TABLE founding50_applications ADD COLUMN contact_email") && migration.includes("ALTER TABLE creator_partnership_memberships ADD COLUMN application_id") && !migration.includes("tpi_contributor_portal")],
  ["Admin application creation is server-routed and protected", api.includes('path === "/admin/founding-50/applications"') && api.includes("requireAdmin(request, env, user => handleAdminCreateFounding50Application")],
  ["Applications link to active existing accounts", api.includes("getUserByUsername(env, username)") && api.includes("An active existing TPI account is required")],
  ["Application fields are validated before persistence", api.includes("normalizeApplicationUrlList") && api.includes("must contain only http or https URLs") && api.includes("creator_description")],
  ["Duplicate pending and approved applications are rejected", api.includes("status IN ('pending', 'approved')") && api.includes("already has a pending or approved Founding 50 application")],
  ["Application records expose review and activation readiness", api.includes("founderApplicationPayload") && api.includes("ready_for_owner_activation") && api.includes("entitlementState")],
  ["Founding 50 summary separates review from allocation", api.includes("approvedApplications") && api.includes("rejectedApplications") && api.includes("Only activated founding50 allocations consume one of the 50 slots")],
  ["Activation requires an approved linked application when supplied", api.includes("An approved Founding 50 application is required before activation") && api.includes("application?.id || null")],
  ["Development activation is separately owner-gated", api.includes("FOUNDING50_DEVELOPMENT_ACTIVATION") && api.includes("env.TPI_ENV === \"development\"")],
  ["Production activation remains separately gated", api.includes("FOUNDING50_PRODUCTION_ACTIVATION") && api.includes("No membership or Creator Studio entitlement was changed")],
  ["Activation remains concurrency-safe", api.includes("UNIQUE") || api.includes("concurrently")],
  ["Application and membership actions are audited", api.includes("founding50.application_created") && api.includes("founding50.application_${status}") && api.includes("founding50.membership_awarded")],
  ["Admin UI submits linked application fields", app.includes('adminFetch("/admin/founding-50/applications"') && app.includes("accountUsername") && app.includes("socialChannels") && app.includes("videoChannels")],
  ["Admin UI displays application readiness without granting access", app.includes("application.readiness") && app.includes("Awards remain gated") && app.includes("does not grant membership")],
  ["Creator Studio stays role/entitlement gated", app.includes("existing role and entitlement gate") && api.includes("requireStudioAccess")],
  ["Development deployment target remains isolated", devConfig.includes('name = "theparanormalinitiative-dev"') && devConfig.includes("tpi_contributor_portal_dev") && devConfig.includes("tpi-contributor-media-dev") && devConfig.includes('TPI_DISABLE_OUTBOUND = "1"')],
  ["No production deployment target is introduced", !devConfig.includes('name = "theparanormalinitiative"') && !app.includes("theparanormalinitiative")],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
if (failed.length) process.exit(1);
console.log(`TPI-DEV-013 partnership checks: ${checks.length}/${checks.length} passed`);
