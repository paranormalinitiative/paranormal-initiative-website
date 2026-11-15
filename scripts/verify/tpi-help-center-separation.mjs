#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
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
const api = read("functions/api/[[path]].js");
const sharedShell = read("help-center.js");
const mystic = read("mystic-help-center.js");
const memberShell = read("member-shell.js");
const mysticCss = read("mystic-help-center.css");
const memberSidebar = read("member-sidebar.html");
const adminCenter = read("admin-center-app/src/app.tsx");
const publicHelpPages = [
  "help-center.html",
  "help-center-category.html",
  "help-center-article.html",
  "help-center-search.html",
  "help-center-contact.html"
];

check("member Help Center keeps public support content", publicData.includes("Privacy, safety, policies & reporting") && publicData.includes("report-bug-community-issue") && publicData.toLowerCase().includes("member support"));
check("member Help Center covers the core member guide topics", [
  "Creating an account",
  "Your profile",
  "Friending",
  "Home Page and Member Home",
  "Messaging",
  "Reels",
  "Stories",
  "Photos",
  "Videos",
  "Accessibility",
  "Login, recovery & security",
  "Managing your account",
  "Privacy and safety",
  "Policies and community standards",
  "Reporting a bug or community issue",
  "Report abuse, harmful content, or a privacy concern"
].every((topic) => publicData.includes(`title: "${topic}"`)));
check("Pages and Groups remain intentionally deferred", !publicData.includes('id: "pages"') && !publicData.includes('id: "groups"'));
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
check("Ask Mystic is available across public Help Center pages", publicHelpPages.every((file) => read(file).includes('src="mystic-help-center.js?v=2"')) && sharedShell.includes("TPIMysticHelpCenter"));
check("Ask Mystic searches only public member articles", mystic.includes("window.TPI_HELP_CENTER") && !mystic.includes("TPI_INTERNAL_HELP_CENTER") && !mystic.includes("internal-help-center-data.js"));
check("Internal Help Desk pages do not mount Ask Mystic", [
  "internal-help-center.html",
  "internal-help-center-category.html",
  "internal-help-center-article.html",
  "internal-help-center-search.html",
  "internal-help-center-contact.html"
].every((file) => !read(file).includes("mystic-help-center.js")) && sharedShell.includes("!INTERNAL"));
check("Mystic is available from the shared member/community shell", memberShell.includes("initMysticAssistant") && memberShell.includes('mystic-help-center.js?v=2') && memberShell.includes('mystic-help-center.css?v=1') && memberShell.includes('help-center-data.js?v=4'));
check("Mystic uses the approved image asset and pulse treatment", existsSync(join(root, "assets/mystic-ghost.png")) && mystic.includes("assets/mystic-ghost.png") && mysticCss.includes("mystic-pulse"));
check("Mystic sends bug reports through the existing Administration Center path", mystic.includes("bug-report.html") && mystic.includes("Administration Center") && api.includes('path === "/bug-reports"') && api.includes('path === "/admin/reports'));
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
