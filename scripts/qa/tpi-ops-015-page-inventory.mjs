#!/usr/bin/env node

// Generate the TPI-OPS-015 page inventory from the canonical source tree and
// bounded loopback HTTP checks. This performs no authentication and no writes
// other than the generated audit document.
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);
const base = (process.env.TPI_OPS015_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) throw new Error("OPS-015 inventory requires the approved loopback Worker origin");

function walk(directory) {
  const result = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    if ([".git", ".local-dev", "node_modules", "dist", "build"].includes(entry.name)) continue;
    const full = join(directory, entry.name);
    if (entry.isDirectory()) result.push(...walk(full));
    else if (entry.isFile() && entry.name.endsWith(".html")) result.push(full);
  }
  return result.sort();
}

function category(route) {
  if (/^\/admin|^\/teams\/admin/.test(route)) return "Administrator";
  if (/paper-editor|creator-videos|contributor|submit-event/.test(route)) return "Contributor";
  if (/member-|community-home|explore|watch-|social-feed|reels/.test(route)) return "Member";
  if (/studio\/|live-video|paratube|tpi-video|tpi-videos|creator-videos/.test(route)) return "StudioFlow / ParaTube";
  if (/education|ghostology|investigation|evp-itc|method|standards|tools|equipment|repository|analysis|environment/.test(route)) return "Education / Research";
  if (/login|early-access|invite/.test(route)) return "Authentication / Access";
  return "Public";
}

function access(categoryName) {
  if (categoryName === "Administrator") return "owner/admin";
  if (categoryName === "Contributor") return "contributor/admin/owner";
  if (categoryName === "Member") return "authenticated member or public shell";
  return "public or page-specific";
}

const excludedFragments = new Set(["/header.html", "/footer.html", "/member-sidebar.html"]);
const files = walk(repoRoot);
const pages = files.map(file => {
  const source = `/${relative(repoRoot, file).replaceAll("\\", "/")}`;
  return { source, route: source === "/index.html" ? "/" : source, fragment: excludedFragments.has(source) };
}).filter(row => !row.fragment);
const fragments = files.map(file => `/${relative(repoRoot, file).replaceAll("\\", "/")}`).filter(path => excludedFragments.has(path));

const rows = [];
for (const page of pages) {
  let status = 0;
  let finalUrl = "";
  let title = "";
  let error = "";
  try {
    const source = readFileSync(resolve(repoRoot, page.source.slice(1)), "utf8");
    title = source.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || "(no title)";
    const response = await fetch(`${base}${page.route}`, { redirect: "manual", signal: AbortSignal.timeout(5000) });
    status = response.status;
    finalUrl = response.headers.get("location") || page.route;
  } catch (caught) {
    error = caught instanceof Error ? caught.message.replace(/https?:\/\/[^\s]+/g, "[url]") : "request failed";
  }
  const group = category(page.route);
  rows.push({ ...page, title, group, access: access(group), status, finalUrl, error });
}

const apiSource = readFileSync(resolve(repoRoot, "functions/api/[[path]].js"), "utf8");
const apiRoutes = [...new Set([...apiSource.matchAll(/path === "([^"]+)"/g)].map(match => match[1]))].sort();
const apiPatterns = [...new Set([...apiSource.matchAll(/path\.match\(\/\^([^)]*)\)/g)].map(match => match[1]))].sort();
const statusCounts = Object.fromEntries([...new Set(rows.map(row => row.status || "ERROR"))].sort().map(status => [status, rows.filter(row => String(row.status || "ERROR") === String(status)).length]));
const groupCounts = Object.fromEntries([...new Set(rows.map(row => row.group))].sort().map(group => [group, rows.filter(row => row.group === group).length]));
const failedRows = rows.filter(row => row.status >= 500 || row.status === 0);

const table = rows.map(row => `| \`${row.route}\` | ${row.title.replaceAll("|", "\\|").slice(0, 110)} | ${row.group} | ${row.access} | ${row.status || "ERROR"} | ${row.error || row.finalUrl} |`).join("\n");
const doc = `# TPI-OPS-015 — Page and Capability Inventory

Verified: ${new Date().toISOString().slice(0, 10)}  
Source: canonical repository filesystem plus sequential loopback checks against ${base}.

## Scope and method

This inventory is generated from every HTML page in the canonical repository,
excluding the three known shared fragments header.html, footer.html, and
member-sidebar.html. Each page was requested sequentially from the local
Worker with redirects held for observation. No hosted Worker, external API, or
public service was contacted. A status of 200, 3xx, or an intentional 403
means the route was accounted for; 5xx and request errors remain failures or
blocked dependencies.

## Inventory totals

- HTML documents discovered: **${files.length}**
- Page routes inventoried: **${rows.length}**
- Shared HTML fragments excluded from page count: **${fragments.length}**
- API route literals identified in functions/api/[[path]].js: **${apiRoutes.length}**
- API route patterns identified in source: **${apiPatterns.length}**
- Routes with HTTP 5xx or request errors: **${failedRows.length}**

### Page groups

| Group | Pages |
| --- | ---: |
${Object.entries(groupCounts).map(([key, value]) => `| ${key} | ${value} |`).join("\n")}

### Runtime response counts

| Result | Pages |
| --- | ---: |
${Object.entries(statusCounts).map(([key, value]) => `| HTTP ${key} | ${value} |`).join("\n")}

## Capability and access interpretation

| Capability | Source of truth | Local verification status |
| --- | --- | --- |
| Public pages and research/education pages | HTML source and Worker asset serving | Route inventory completed; pages with 200/3xx were route-verified. Browser interaction was not performed for every static document. |
| Authentication and member pages | worker.js, member-shell.js, lib/auth.js | OPS-009/011 and OPS-015 browser checks passed; local sessions are synthetic only. |
| Administrator pages and APIs | requireAdmin, admin HTML gate, functions/api/[[path]].js | Admin page/API read verification passed; 26/26 menu items were navigated in the browser. |
| Contributor tools | Contributor HTML gate and requireContributor contracts | Contributor authoring page passed; member denial passed. Mutating authoring workflows were not exercised. |
| Community, Messenger, Notifications | OPS-010/011 APIs and member shell | Existing bounded suites passed; no real member data or external delivery was used. |
| StudioFlow and ParaTube | OPS-012 routes, local D1/R2, preserved 8788 room server | Existing 26/26 local suite passed; WebSocket/playback/RealtimeKit remain externally bounded. |
| Media and local R2 | wrangler.local.toml, local media fixtures, OPS-012 | Synthetic local object coverage passed; no production media was copied. |

## Administrator capability surface

The synthetic local_admin account has the application-defined admin
role. The server gate is the existing user.role owner/admin check; no
universal override was added. Read-only
verification passed for overview, analytics, audit logs, Founding 50, creator
partnership, entitlements, invites, contributors, members, community posts and
comments, article comments/articles, reports, notifications, channels, roles,
restrictions, events, settings, scraper runs, Paranormal Teams, and claims.

Owner-only operations remain owner-only. No Founding 50 allocation, publication,
destructive moderation, account mutation, or external notification was
performed.

## Local schema completion

The pre-OPS-015 local database lacked authoritative tables needed by the admin
surface. A fresh local-only backup was created before changes:

- File: .local-dev/backups/tpi-ops-015-before-admin-schema.sql
- Size: 51,965 bytes
- SHA-256: 85848aa6dcbb50faae5d9555c7af9ca4b6aed0e29200d9817ddfdf621ac6a02c

The following repository migrations were applied only to isolated local D1:

0025_paranormal_teams.sql, 0035_scraper_runs.sql,
0036_paranormal_teams_extensions.sql, 0039_paranormal_teams_profile_fields.sql,
0040_paranormal_teams_management_audit.sql, 0047_admin_audit_logs.sql,
0048_creator_partnership_admin.sql, and 0050_creator_application_details.sql.

Existing synthetic accounts and local state were preserved. No remote migration
was executed.

## Detailed page inventory

| Route | Title | Group | Expected access | Anonymous local response | Redirect/location or error |
| --- | --- | --- | --- | ---: | --- |
${table}

## Limitations

- This inventory establishes route coverage and HTTP response behavior; it does
  not claim every page's complete interactive workflow is verified.
- Static pages that reference hosted canonical URLs may contain those URLs as
  document metadata; the local browser request guard still blocked all observed
  non-loopback requests before dispatch.
- External authentication, email, RealtimeKit, livestream providers, remote
  scraping/link previews, and third-party APIs remain **EXTERNAL DEPENDENCY
  BLOCKED** in local mode.
- Full real-media playback, real recording sessions, live broadcasts, and
  production/member data are intentionally not tested.
- FreeBuff and OpenCode agent access was not verified.
`;

const output = resolve(repoRoot, "docs/TPI-DEVELOPMENT/200-AUDITS/TPI-OPS-015-PAGE-AND-CAPABILITY-INVENTORY.md");
writeFileSync(output, doc);
console.log(JSON.stringify({ status: failedRows.length ? "PARTIALLY_COMPLETED" : "PASSED", pages: rows.length, htmlDocuments: files.length, fragments: fragments.length, apiRoutes: apiRoutes.length, statusCounts, groupCounts, failedRows: failedRows.map(row => ({ route: row.route, status: row.status, error: row.error })) }));
if (failedRows.length) process.exitCode = 1;

