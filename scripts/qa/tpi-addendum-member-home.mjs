import { readFileSync } from "node:fs";

const read = (file) => readFileSync(new URL(`../../${file}`, import.meta.url), "utf8");
const app = read("admin-center-app/src/app.tsx");
const bridge = read("studio/navigation-bridge.js");
const sidebar = read("member-sidebar.html");
const shell = read("member-shell.js");
const worker = read("worker.js");
const explore = read("explore.js");
const checks = [
  ["Admin Center return controls use member home", (app.match(/admin-return-link[^\n]*href=\"\/member-home\"/g) || []).length >= 2 && app.includes("Return to Member Home")],
  ["Admin Center mobile return uses member home", app.includes('className="admin-mobile-nav-link" href="/member-home"') && app.includes("<span>Member Home</span>" )],
  ["Admin Center has no authenticated root return control", !app.includes('admin-return-link" href="/"')],
  ["StudioFlow return bridge uses member home", bridge.includes('var MEMBER_HOME = "/member-home"') && !bridge.includes("/explore")],
  ["Member sidebar home uses canonical route", sidebar.includes('href="/member-home" data-nav="home"')],
  ["Member mobile home uses canonical route", shell.includes('href="/member-home" data-nav="home"')],
  ["Forum retirement preserves authenticated member destination", worker.includes('new URL("/member-home?member=1", url.origin)')],
  ["Public homepage remains available", worker.includes('href="/"')],
  ["Community Feed remains on explore", explore.includes("communityFeed(40, 0)")],
  ["No legacy member-home filename remains in focused controls", !["admin-panel.html", "member-dashboard.html", "member-sidebar.html", "studio/navigation-bridge.js"].some((file) => /(?:href=\"|href=')member-home\.html|MEMBER_HOME\s*=\s*[\"']\/member-home\.html/.test(read(file))) && !/href=\"member-home\.html\" data-nav=\"home\"/.test(shell)],
];
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
const failed = checks.filter(([, passed]) => !passed);
console.log(`TPI member-home addendum checks: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);
