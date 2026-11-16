import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const api = readFileSync(join(root, "functions/api/[[path]].js"), "utf8");
const module = readFileSync(join(root, "lib/social-destinations.js"), "utf8");
const migration = readFileSync(join(root, "migrations/0073_social_destination_connections.sql"), "utf8");
const app = readFileSync(join(root, "admin-center-app/src/app.tsx"), "utf8");
const types = readFileSync(join(root, "admin-center-app/src/lib/api.ts"), "utf8");

const checks = [
  ["encrypted destination token columns exist", migration.includes("access_token_ciphertext") && migration.includes("refresh_token_ciphertext")],
  ["OAuth state has an expiry boundary", migration.includes("social_oauth_states") && migration.includes("expires_at")],
  ["Facebook and YouTube are the only first-party providers", migration.includes("CHECK (provider IN ('facebook', 'youtube'))")],
  ["provider authorization URLs are built centrally", module.includes("buildAuthorizationUrl") && module.includes("oauthRedirectUri")],
  ["OAuth callbacks consume state records", api.includes("social_oauth_states") && api.includes("expired_callback")],
  ["provider tokens never appear in safe connection payloads", (() => { const match = module.match(/export function destinationPayload[\s\S]*?\n}\n/); return Boolean(match && match[0].includes("return {") && !match[0].includes("accessToken") && !match[0].includes("refreshToken")); })()],
  ["destination APIs require an administration role", api.includes("requireDestinationAdmin") && api.includes("hasAdministrationCenterRole")],
  ["Facebook publishing is server-side", api.includes("/social/share/facebook") && module.includes("publishFacebookLink")],
  ["disconnect clears encrypted credentials", module.includes("access_token_ciphertext = ''") && module.includes("refresh_token_ciphertext = NULL")],
  ["Admin Center exposes connected destinations", app.includes('id: "destinations"') && app.includes("ConnectedDestinations") && types.includes("SocialDestinations")],
  ["hosted relay and Rumble limits are explicit", api.includes("hostedRelay") && api.includes("provider_controlled")],
];

let failed = 0;
for (const [label, ok] of checks) {
  console.log(`${ok ? "PASS" : "FAIL"} ${label}`);
  if (!ok) failed += 1;
}
if (failed) process.exit(1);
console.log(`TPI social destination verification passed: ${checks.length} checks.`);
