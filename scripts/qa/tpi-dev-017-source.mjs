import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const app = read("admin-center-app/src/app.tsx");
const api = read("admin-center-app/src/lib/api.ts");
const browser = read("scripts/e2e/tpi-dev-017-authenticated-browser.mjs");
const worker = read("worker.js");
const checks = [
  ["browser runner uses external credential file", browser.includes("TPI_DEV017_CREDENTIALS_FILE") && browser.includes("/Users/toddknipple/.config/tpi/dev-014/credentials.json")],
  ["browser runner enforces 0600 credential permissions", browser.includes("mode !== 0o600")],
  ["browser runner does not print passwords", !browser.includes("account.password") || browser.includes("fill(account.password)")],
  ["browser runner uses real same-origin authentication", browser.includes("/api/auth/me") && browser.includes("/api/auth/logout") && browser.includes("credentials: \"same-origin\"" )],
  ["browser runner covers all required viewport sizes", ["1280, 800", "1440, 900", "1920, 1080", "375, 812", "390, 844", "430, 932"].every((size) => browser.includes(size))],
  ["team claim type is present", api.includes("export type AdminTeamClaim")],
  ["team claim queue uses protected API", app.includes("/admin/teams/claims?status=") && app.includes("/admin/teams/claims/${encodeURIComponent")],
  ["team claim review preserves confirmation flow", app.includes("team claim?") && app.includes("reviewNotes")],
  ["preview remains server-gated", worker.includes("/admin-center-preview") && worker.includes("hasAdminAccess")],
];
const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
console.log(`TPI-DEV-017 source checks: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);
