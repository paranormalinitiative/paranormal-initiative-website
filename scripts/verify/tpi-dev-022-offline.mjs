import { readFileSync } from "node:fs";
import { readStudioAssetManifest } from "./studio-asset-manifest.mjs";

const checks = [];
const check = (name, ok, detail = "") => checks.push({ name, ok: Boolean(ok), detail });
const read = path => readFileSync(path, "utf8");

const api = read("functions/api/[[path]].js");
const eventsPage = read("admin-events.html");
const search = read("search.js");
const mediaLibrary = read("lib/member-library.js");
const studioBundle = read(readStudioAssetManifest().javascript.path);

check("media upload requires configured R2 binding", api.includes("if (!env.TPI_MEDIA) return json({ error: \"R2 media bucket binding TPI_MEDIA is not configured yet.\" }, 501)"));
check("private media retrieval requires authentication", api.includes("if (!user) return json({ error: \"Member login required.\" }, 401"));
check("private media retrieval enforces owner metadata", api.includes("customMetadata?.contributorId !== user.id"));
check("private media sends no-store cache policy", api.includes("private, no-store") || api.includes("key.startsWith(\"private-library/\")"));
check("member library listing is owner-scoped", mediaLibrary.includes("WHERE owner_id=? AND kind=?"));
check("search normalizes terms before scoring", search.includes("function normalize(value)") && search.includes("function scoreItem"));
check("search combines static and dynamic content", search.includes("window.TPI_SEARCH_INDEX") && search.includes("getPublishedArticles") && search.includes("getPublicProfiles"));
check("search escapes rendered result fields", search.includes("function escapeHtml(value)"));
check("event creation is protected by admin middleware", api.includes('path === "/events") return requireAdmin'));
check("event update is protected by admin middleware", api.includes('handleAdminEventUpdate(path, request, env, user)'));
check("event cancellation is soft and auditable", api.includes("SET status = 'cancelled'") && api.includes('"event.cancelled"'));
check("event form uses persisted API workflow", eventsPage.includes("/api/events") && eventsPage.includes("/api/admin/events") && !eventsPage.includes("TODO: Send to API"));
check("StudioFlow access fails closed without entitlement", api.includes("An active Creator Studio entitlement is required."));
check("StudioFlow UI documents browser-local recording storage", studioBundle.includes("Browser Storage") && studioBundle.includes("Browser Library"));
check("no project persistence API is claimed by current app", !api.includes("/studio/projects") && !api.includes("studio_projects"), "Current implementation exposes rooms/live broadcasts, not projects.");

const failed = checks.filter(item => !item.ok);
console.log(JSON.stringify({ passed: checks.length - failed.length, failed: failed.length, checks }, null, 2));
if (failed.length) process.exitCode = 1;
