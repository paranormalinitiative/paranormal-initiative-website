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
const mysticKnowledge = read("mystic-public-knowledge.js");
const memberShell = read("member-shell.js");
const mysticCss = read("mystic-help-center.css");
const nova = read("nova-help-center.js");
const novaCss = read("nova-help-center.css");
const wrangler = read("wrangler.toml");
const memberSidebar = read("member-sidebar.html");
const adminCenter = read("admin-center-app/src/app.tsx");
const publicHelpPages = [
  "help-center.html",
  "help-center-category.html",
  "help-center-article.html",
  "help-center-search.html",
  "help-center-contact.html"
];
const internalHelpPages = [
  "internal-help-center.html",
  "internal-help-center-category.html",
  "internal-help-center-article.html",
  "internal-help-center-search.html",
  "internal-help-center-contact.html"
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
check("Ask Mystic is available across public Help Center pages", publicHelpPages.every((file) => read(file).includes('src="mystic-public-knowledge.js?v=2"') && read(file).includes('src="mystic-help-center.js?v=6"')) && sharedShell.includes("TPIMysticHelpCenter"));
check("Ask Nova is available across public Help Center pages", publicHelpPages.every((file) => read(file).includes('src="nova-help-center.js?v=2"') && read(file).includes('nova-help-center.css?v=2')) && sharedShell.includes("TPINovaHelpCenter"));
check("Mystic and Nova have distinct public identities", mystic.includes("Paranormal research assistant") && mystic.includes("For using TPI, ask Nova") && nova.includes("TPI Help Center Assistant") && nova.includes("Ask Mystic for paranormal research") && sharedShell.includes("Choose the right TPI assistant") && sharedShell.includes("data-open-assistant"));
check("Mystic public knowledge is explicitly member-facing", mysticKnowledge.includes('audience: "public-member"') && mysticKnowledge.includes('id: "ghost-definition"') && mysticKnowledge.includes("TPI_Field_Encyclopedia.html") && mysticKnowledge.includes("TPI_Investigation_Compendium.html") && mysticKnowledge.includes("ghostology-101.html") && mysticKnowledge.includes("haunted-locations.html"));
check("Mystic covers the core public research question families", ["emf-meter-basics", "weather-and-investigation-data", "investigation-intake-basics", "investigation-walkthrough-basics", "emf-equipment", "weather-environment", "walkthrough-guide"].every((id) => mysticKnowledge.includes(`id: "${id}"`)) && mysticKnowledge.includes("A spike is data to explain") && mysticKnowledge.includes("do not treat a weather-linked change as proof"));
check("Ask Mystic searches only public member content and sources", mystic.includes("window.TPI_HELP_CENTER") && mystic.includes("TPI_MYSTIC_PUBLIC_KNOWLEDGE") && mystic.includes("findDirectAnswer") && mystic.includes("directAnswerMessage") && mystic.includes("findSourceMatches") && mystic.includes("sourceResultMessage") && mystic.includes("verified public TPI source") && !mystic.includes("TPI_INTERNAL_HELP_CENTER") && !mystic.includes("internal-help-center-data.js"));
check("Internal Help Desk pages do not mount Ask Mystic", [
  "internal-help-center.html",
  "internal-help-center-category.html",
  "internal-help-center-article.html",
  "internal-help-center-search.html",
  "internal-help-center-contact.html"
].every((file) => !read(file).includes("mystic-help-center.js") && !read(file).includes("mystic-public-knowledge.js")) && sharedShell.includes("!INTERNAL"));
check("Mystic is available from the shared member/community shell", memberShell.includes("initMysticAssistant") && memberShell.includes('mystic-help-center.js?v=6') && memberShell.includes('mystic-help-center.css?v=2') && memberShell.includes('help-center-data.js?v=4') && memberShell.includes('mystic-public-knowledge.js?v=2'));
check("Nova is available from the shared member/community shell", memberShell.includes("initNovaAssistant") && memberShell.includes('nova-help-center.js?v=2') && memberShell.includes('nova-help-center.css?v=2') && nova.includes("TPI_HELP_CENTER"));
check("Mystic is connected to the protected public-only Cloudflare AI Search instance", wrangler.includes('binding = "AI_SEARCH"') && wrangler.includes('namespace = "default"') && api.includes('path === "/mystic/ask"') && api.includes('tpi-mystic-public') && api.includes('chatCompletions') && api.includes('MYSTIC_PUBLIC_ORIGIN') && api.includes('MYSTIC_PRIVATE_PATHS') && mystic.includes('fetch("/api/mystic/ask"') && mystic.includes("aiResultMessage"));
check("Mystic uses the approved image asset and pulse treatment", existsSync(join(root, "assets/mystic-ghost.png")) && mystic.includes("assets/mystic-ghost.png") && mysticCss.includes("mystic-pulse"));
check("Mystic sends bug reports through the existing Administration Center path", mystic.includes("bug-report.html") && mystic.includes("Administration Center") && api.includes('path === "/bug-reports"') && api.includes('path === "/admin/reports'));
const helpIndex = memberSidebar.indexOf('data-nav="help-center"');
const logoutIndex = memberSidebar.indexOf('data-nav="logout"');
check("Member Help Center sits immediately above Log Out", helpIndex >= 0 && logoutIndex > helpIndex && memberSidebar.slice(helpIndex, logoutIndex).includes("Help Center"));
check("Internal Help Desk is located in Administration Center", !memberSidebar.includes("data-nav=\"internal-help-center\"") && adminCenter.includes('id: "help-desk"') && adminCenter.includes("<InternalHelpDesk />"));
check("Nova has separate public and protected retrieval boundaries", nova.includes('audience: INTERNAL ? "internal" : "public"') && nova.includes("/api/nova/ask") && nova.includes("TPI_INTERNAL_HELP_CENTER") && api.includes('path === "/nova/ask"') && api.includes("NOVA_INTERNAL_INSTANCE = \"tpi-nova-internal\"") && api.includes("hasNovaInternalAccess") && !mystic.includes("TPI_INTERNAL_HELP_CENTER"));
check("Nova is mounted on every protected Help Desk page", internalHelpPages.every((file) => read(file).includes('src="nova-help-center.js?v=2"') && read(file).includes('nova-help-center.css?v=2')) && sharedShell.includes("INTERNAL") && nova.includes("internal-help-center-article.html"));
check("Nova public pages do not load internal Help Desk data", publicHelpPages.every((file) => !read(file).includes("internal-help-center-data.js")) && novaCss.includes("hc-nova"));
const includes = read("includes.js");
check("Nova and Mystic load through the shared sitewide include", includes.includes("initGlobalAssistants") && includes.includes("isInternalAssistantSurface") && includes.includes("mystic-help-center.js") && includes.includes("nova-help-center.js") && includes.includes("document.body.dataset.tpiAssistantAudience"));
const publicAssistantBranch = includes.slice(includes.indexOf('ensureAssistantStylesheet("mystic-help-center.css"'));
check("Sitewide public assistant loading never loads internal Help Desk data", includes.includes("if (internal)") && includes.includes("internal-help-center-data.js") && includes.includes("if (window.TPIMysticHelpCenter)") && !publicAssistantBranch.includes("internal-help-center-data.js"));
check("Administration Center links directly to Nova Help Desk", adminCenter.includes('href="/internal-help-center"') && adminCenter.includes("Ask Nova") && adminCenter.includes("Help Desk"));
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
