import { readFileSync } from "node:fs";

const read = path => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const api = read("functions/api/[[path]].js");
const auth = read("lib/auth.js");
const devConfig = read("wrangler.dev.toml");
const checks = [
  ["synthetic lifecycle status route is protected by owner authorization", api.includes("handleAdminFounding50MembershipStatus") && api.includes("requireOwner(request, env, user => handleAdminFounding50MembershipStatus")],
  ["status transitions update membership and entitlement together", api.includes("UPDATE creator_partnership_memberships") && api.includes("UPDATE creator_studio_entitlements") && api.includes("creator_partnership_membership_history")],
  ["revocation removes entitlement-based Studio access", auth.includes("cpm.membership_state = 'active'") && auth.includes("cse.entitlement_state = 'active'")],
  ["activation remains explicitly development-gated", api.includes("FOUNDING50_DEVELOPMENT_ACTIVATION") && api.includes("TPI_ENV === \"development\"" )],
  ["production activation uses a separate gate", api.includes("FOUNDING50_PRODUCTION_ACTIVATION")],
  ["allocated slots are explicitly non-recycled", api.includes("allocated_slots_are_not_recycled")],
  ["development target remains isolated", devConfig.includes('name = "theparanormalinitiative-dev"') && devConfig.includes("tpi_contributor_portal_dev") && devConfig.includes("tpi-contributor-media-dev")],
  ["development outbound side effects remain disabled", devConfig.includes('TPI_DISABLE_OUTBOUND = "1"')],
  ["no production target is in development config", !devConfig.includes('name = "theparanormalinitiative"')]
];
const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
console.log(`TPI-DEV-014 source checks: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);
