import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const worker = read("worker.js");
const main = read("admin-center-app/src/main.tsx");
const app = read("admin-center-app/src/app.tsx");
const sidebar = read("member-sidebar.html");
const shell = read("member-shell.js");
const css = read("admin-center-app/src/index.css");
const checks = [
  ["canonical admin route is server-gated", worker.includes("serveCanonicalAdminCenter") && worker.includes('url.pathname === "/admin-panel"') && worker.includes('user.role === "owner" || user.role === "admin"')],
  ["legacy admin bookmark redirects to canonical route", worker.includes('url.pathname === "/admin-panel.html"') && worker.includes('Response.redirect(new URL(`/admin-panel${url.search}`')],
  ["preview and canonical route share the same static package", worker.includes('"/admin-center-preview/index.html"') && worker.includes("targetPath")],
  ["desktop navigation uses canonical route", sidebar.includes('href="/admin-panel" data-nav="admin-center"')],
  ["mobile navigation uses canonical route", shell.includes('href="/admin-panel" data-nav="admin-center"')],
  ["saved member theme is applied", main.includes("/api/auth/me") && main.includes("document.documentElement.dataset.theme")],
  ["saved member font is applied", main.includes("/api/me/personalization") && main.includes("dataset.profileFont") && css.includes("--tpi-admin-font")],
  ["legacy capability links resolve through the canonical route alias", app.includes('href: "/admin-panel.html#') && worker.includes('url.pathname === "/admin-panel.html"')],
  ["production and development bindings remain config-specific", read("wrangler.toml").includes('database_name = "tpi_contributor_portal"') && read("wrangler.dev.toml").includes('database_name = "tpi_contributor_portal_dev"')],
];
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
const failed = checks.filter(([, passed]) => !passed);
console.log(`TPI-DEV-030 source checks: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);
