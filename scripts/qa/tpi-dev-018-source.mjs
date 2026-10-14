import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const app = read("admin-center-app/src/app.tsx");
const api = read("admin-center-app/src/lib/api.ts");
const workerApi = read("functions/api/[[path]].js");

const checks = [
  ["dashboard exposes real review queues", app.includes("Pending creator applications") && app.includes("Content awaiting review") && app.includes("Pending moderation") && workerApi.includes("pendingCreatorApplications") && workerApi.includes("pendingModeration")],
  ["creator application details use persisted fields", app.includes("ApplicationDetail") && app.includes("application.reviewedAt") && app.includes("application.administrativeNotes")],
  ["creator review requires confirmation and sends notes", app.includes("reviewConfirm") && app.includes("reviewNotes.trim()") && app.includes("founding-50/applications/${encodeURIComponent(application.id)}/status")],
  ["creator approval remains separate from activation", app.includes("does not activate a membership or Creator Studio entitlement") && workerApi.includes("Founding 50 activation is owner-gated")],
  ["team administration has detail and confirmation", app.includes("TeamDetail") && app.includes("teamConfirm") && app.includes("No research records or authoritative team data are imported")],
  ["team claim review remains protected", app.includes("/admin/teams/claims?status=") && app.includes("reviewNotes") && workerApi.includes("handleAdminReviewClaim")],
  ["video detail uses existing protected GET", app.includes("VideoDetail") && app.includes("/tpi-videos/${encodeURIComponent(video.slug)}") && workerApi.includes('path.match(/^\\/tpi-videos\\/[^/]+$/)')],
  ["video lifecycle remains confirmed and protected", app.includes("ConfirmDialog") && app.includes("confirm.action") && workerApi.includes("tpiVideoOwnerOrAdmin")],
  ["notifications remain internal and recipient-scoped", app.includes("Private content protected") && app.includes("Mark my notifications read") && workerApi.includes("privateContentBoundary") && workerApi.includes("Only the notification recipient can change its read state")],
  ["founding 50 activation gate remains closed", workerApi.includes('FOUNDING50_DEVELOPMENT_ACTIVATION || ""') && workerApi.includes("return json({ error: \"Founding 50 activation is owner-gated")],
  ["research workspace remains outside admin mutations", app.includes("Research workspace records remain separate") && !app.includes("authoritative-teams.csv")],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
console.log(`TPI-DEV-018 source checks: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);
