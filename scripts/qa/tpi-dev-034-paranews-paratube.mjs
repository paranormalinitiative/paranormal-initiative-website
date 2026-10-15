import { readFileSync } from "node:fs";

const read = (file) => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
const news = read("news.html");
const tube = read("paratube.html");
const sidebar = read("member-sidebar.html");
const header = read("header.html");
const shellCss = read("member-shell.css");
const shellJs = read("member-shell.js");
const checks = [
  ["ParaNews uses the shared member shell", news.includes('member-shell.css?v=62') && news.includes('data-member-content hidden') && news.includes('member-shell.js?v=57')],
  ["ParaTube uses the shared member shell", tube.includes('member-shell.css?v=62') && tube.includes('data-member-content hidden') && tube.includes('member-shell.js?v=57')],
  ["ParaNews preserves its API and article content hooks", news.includes("/api/news?limit=") && news.includes("pn-feed") && news.includes("sourceUrl") && news.includes("pn-tabs")],
  ["ParaTube preserves its API and video content hooks", tube.includes("/api/videos?limit=") && tube.includes("pn-grid") && tube.includes("sourceUrl") && tube.includes("pn-tabs")],
  ["Shared navigation exposes canonical section destinations", sidebar.includes('href="/news" data-nav="news"') && sidebar.includes('href="/paratube" data-nav="paratube"') && header.includes('href="/news"') && header.includes('href="/paratube"')],
  ["Shared shell provides independent scrolling and responsive navigation", shellCss.includes(".member-sidebar") && shellCss.includes("overflow-y: auto") && shellCss.includes(".member-mobile-nav") && shellCss.includes("@media (max-width: 700px)" )],
  ["Shared shell preserves personalization and authentication", shellJs.includes("/api/contributors/me/theme") && shellJs.includes("quickSessionCheck") && shellJs.includes("setupRoleGatedNav")],
  ["ParaNews keeps one content title supplied by the shared page heading", news.includes('meta name="pp:title" content="ParaNews"') && !news.includes("<h1>ParaNews</h1>")],
  ["ParaTube keeps one content title supplied by the shared page heading", tube.includes('meta name="pp:title" content="ParaTube"') && !tube.includes("<h1>ParaTube</h1>")],
  ["ParaTube uses saved theme variables instead of a hardcoded purple accent", tube.includes("--pn-accent: var(--accent)") && !tube.includes("#a855f7")],
  ["Neither page adds legacy horizontal navigation", !news.includes('class="command-nav"') && !tube.includes('class="command-nav"')],
  ["Existing member destinations remain distinct", read("member-sidebar.html").includes('href="/member-home"') && read("explore.html").includes("data-explore-feed")],
];
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
const failed = checks.filter(([, passed]) => !passed);
console.log(`TPI-DEV-034 ParaNews/ParaTube checks: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);
