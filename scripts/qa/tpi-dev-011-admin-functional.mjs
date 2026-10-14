import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../admin-center-app/src/app.tsx", import.meta.url), "utf8");
const apiTypes = readFileSync(new URL("../../admin-center-app/src/lib/api.ts", import.meta.url), "utf8");
const api = readFileSync(new URL("../../functions/api/[[path]].js", import.meta.url), "utf8");
const worker = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");
const devConfig = readFileSync(new URL("../../wrangler.dev.toml", import.meta.url), "utf8");

const checks = [
  ["development bindings remain isolated", devConfig.includes('name = "theparanormalinitiative-dev"') && devConfig.includes("tpi_contributor_portal_dev") && devConfig.includes("tpi-contributor-media-dev") && devConfig.includes('TPI_DISABLE_OUTBOUND = "1"')],
  ["protected preview route remains server gated", worker.includes("/admin-center-preview") && worker.includes("hasAdminAccess")],
  ["member capability controls use existing protected endpoints", source.includes("MemberAccountManagement") && source.includes("/admin/members/${encodeURIComponent(member.username)}/access") && api.includes('path.match(/^\\/admin\\/members\\/[^/]+\\/access$/)')],
  ["member notification control is in-app and protected", source.includes("Send development notification") && source.includes("/admin/members/${encodeURIComponent(member.username)}/notifications") && api.includes('path.match(/^\\/admin\\/members\\/[^/]+\\/notifications$/)')],
  ["Education Center queue reads real article records", source.includes("Article review queue") && source.includes("/admin/articles?") && api.includes("handleAdminArticles")],
  ["Education publication status is validated server-side", source.includes("/admin/articles/") && source.includes("confirm.status") && api.includes("Article status must be draft or published") && api.includes("article.${status}")],
  ["TPI Videos queue uses existing lifecycle handlers", source.includes("Creator video queue") && source.includes("/tpi-videos/") && source.includes("confirm.action") && api.includes("handleTpiVideoLifecycle")],
  ["TPI Videos lifecycle remains contributor-or-admin authorized", api.includes('requireContributor(request, env, user => handleTpiVideoLifecycle') && api.includes("tpiVideoOwnerOrAdmin(existing, user)")],
  ["private StudioFlow data remains excluded", source.includes("Private StudioFlow recordings, stream credentials, and unpublished media remain outside this administrative surface") && !source.includes("stream_key") && !source.includes("private_recording")],
  ["Founding 50 awards remain gated", source.includes("Awards remain gated") && api.includes("handleAdminAllocateFounding50")],
  ["no production worker target introduced", !source.includes("theparanormalinitiative\"") && !devConfig.includes('name = "theparanormalinitiative"')],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
if (failed.length) process.exit(1);
console.log(`TPI-DEV-011 focused checks: ${checks.length}/${checks.length} passed`);
