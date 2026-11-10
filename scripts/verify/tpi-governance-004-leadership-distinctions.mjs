import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const read = file => readFileSync(resolve(root, file), "utf8");
const checks = [];
function check(label, pass, detail = "") {
  checks.push({ label, pass: Boolean(pass), detail });
  console.log(`${pass ? "PASS" : "FAIL"} ${label}${detail ? ` — ${detail}` : ""}`);
}

const migration = read("migrations/0066_leadership_profiles_and_distinctions.sql");
const rankMigration = read("migrations/0068_governance_role_rank_metadata.sql");
const api = read("functions/api/[[path]].js");
const library = read("lib/leadership-distinctions.js");
const admin = read("admin-center.js");
const profile = read("member-login.js");
const ignore = read(".assetsignore");

check("additive leadership migration exists", existsSync(resolve(root, "migrations/0066_leadership_profiles_and_distinctions.sql")));
check("member and AI/profile distinction subjects are separate", migration.includes("subject_type TEXT NOT NULL CHECK (subject_type IN ('member', 'leadership_profile'))"));
check("Gold/Silver/Bronze are constrained", migration.includes("distinction_code TEXT NOT NULL CHECK (distinction_code IN ('gold', 'silver', 'bronze'))"));
check("active duplicate distinctions are blocked", migration.includes("idx_leadership_distinctions_active_subject") && migration.includes("WHERE status = 'active'"));
check("Sol is transparent AI profile data", migration.includes("'ai_collaborator'") && migration.includes("Sol is an AI system"));
check("Sol Gold recognition is seeded without access", migration.includes("leadership-sol-gold") && migration.includes("Presentation only; no access or authority"));
check("authenticated owner/admin assignment route exists", api.includes('path === "/admin/leadership/distinctions") return requireAdmin') && api.includes("handleAdminAssignLeadershipDistinction"));
check("revocation is authenticated owner/admin-gated", api.includes("handleAdminRevokeLeadershipDistinction") && api.includes("leadership.distinction_revoked") && api.includes("requireAdmin"));
check("profile APIs expose server-resolved distinctions", api.includes("leadershipDistinctions: await listLeadershipDistinctions"));
check("public AI leadership profile API exists", api.includes("/leadership/profiles") && api.includes("handleLeadershipProfile"));
check("published web derivatives are allowed", !ignore.includes("assets/society-leadership/**") && ignore.includes("assets/society-leadership/masters/**"));
check("profile UI renders distinction artwork", profile.includes("renderLeadershipDistinctions") && profile.includes("item.assetPath"));
check("Admin Center exposes assignment and revoke controls", admin.includes("data-admin-leadership-assign-form") && admin.includes("data-admin-leadership-revoke"));
check("distinction library is shared by API", library.includes("DISTINCTION_CATALOG") && library.includes("listLeadershipDistinctions"));
check("leadership profile page exists", existsSync(resolve(root, "leadership-profile.html")));
check("role metadata migration is additive", rankMigration.includes("ALTER TABLE leadership_distinctions ADD COLUMN role_code"));
check("leadership roles own the medallion rank", library.includes("LEADERSHIP_ROLE_CATALOG") && library.includes("leadershipRolePayload") && library.includes('chief-executive-officer') && library.includes('medallionCode: "gold"'));
check("leadership API derives rank from selected role", api.includes("leadershipRolePayload(data.roleCode)") && api.includes("role_code") && api.includes("Its medallion is assigned automatically"));

const failed = checks.filter(item => !item.pass);
console.log(`\nLeadership distinction contract: ${checks.length - failed.length}/${checks.length} PASS`);
if (failed.length) process.exitCode = 1;
