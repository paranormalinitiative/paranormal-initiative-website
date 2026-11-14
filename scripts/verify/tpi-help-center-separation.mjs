#!/usr/bin/env node

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("../..", import.meta.url)));
const baseUrl = process.env.TPI_HELP_CENTER_BASE_URL || "http://127.0.0.1:8787";
const checks = [];

function read(path) {
  return readFileSync(join(root, path), "utf8");
}

function check(name, passed, detail = "") {
  checks.push({ name, passed, detail });
}

const publicData = read("help-center-data.js");
const internalData = read("internal-help-center-data.js");
const worker = read("worker.js");
const sharedShell = read("help-center.js");
const memberSidebar = read("member-sidebar.html");
const adminCenter = read("admin-center-app/src/app.tsx");

check("member Help Center keeps public support content", publicData.includes("Policies, privacy, safety & reporting") && publicData.includes("report-bug-community-issue") && publicData.toLowerCase().includes("member support"));
check("member Help Center does not publish internal procedures", !publicData.includes("administration-center-overview") && !publicData.includes("block-or-restore-member") && !publicData.includes("staff-roles-and-appointments"));
check("Internal Help Desk contains staff procedures", internalData.includes("block-or-restore-member") && internalData.includes("review-abuse-report") && internalData.includes("staff-roles-and-appointments") && internalData.includes("security-incident-first-response"));
check("Help Center navigation exposes expandable guide lists", sharedShell.includes("hc-sidebar-group") && sharedShell.includes("hc-sidebar-subitem") && sharedShell.includes("<details"));
check("Internal pages identify the internal audience", [
  "internal-help-center.html",
  "internal-help-center-category.html",
  "internal-help-center-article.html",
  "internal-help-center-search.html",
  "internal-help-center-contact.html"
].every((file) => read(file).includes('data-hc-audience="internal"')));
check("Shared renderer switches to internal routes and labels", sharedShell.includes("TPI_INTERNAL_HELP_CENTER") && sharedShell.includes("internal-help-center-article.html") && sharedShell.includes("Help Desk") && sharedShell.includes("Member support"));
const helpIndex = memberSidebar.indexOf('data-nav="help-center"');
const logoutIndex = memberSidebar.indexOf('data-nav="logout"');
check("Member Help Center sits immediately above Log Out", helpIndex >= 0 && logoutIndex > helpIndex && memberSidebar.slice(helpIndex, logoutIndex).includes("Help Center"));
check("Internal Help Desk is located in Administration Center", !memberSidebar.includes("data-nav=\"internal-help-center\"") && adminCenter.includes('id: "help-desk"') && adminCenter.includes("<InternalHelpDesk />"));
check("Worker protects the complete internal namespace", worker.includes("hasInternalHelpCenterAccess") && worker.includes('url.pathname.startsWith("/internal-help-center.")') && worker.includes('url.pathname.startsWith("/internal-help-center-")'));

try {
  const anonymousMember = await fetch(`${baseUrl}/help-center.html`, { headers: { Cookie: "" } });
  const anonymousInternal = await fetch(`${baseUrl}/internal-help-center.html`, { headers: { Cookie: "" } });
  check("anonymous member Help Center remains public", anonymousMember.status === 200, `HTTP ${anonymousMember.status}`);
  check("anonymous Internal Help Center is denied", anonymousInternal.status === 403, `HTTP ${anonymousInternal.status}`);
} catch (error) {
  check("local Worker access-gate probe", false, error instanceof Error ? error.message : String(error));
}

const failed = checks.filter((entry) => !entry.passed);
console.log(JSON.stringify({
  status: failed.length ? "FAIL" : "PASS",
  suite: "TPI-HELP-CENTER-SEPARATION",
  baseUrl,
  passed: checks.length - failed.length,
  total: checks.length,
  results: checks
}, null, 2));
if (failed.length) process.exitCode = 1;
