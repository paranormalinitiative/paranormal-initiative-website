import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
const app = read("admin-center-app/src/app.tsx");
const css = read("admin-center-app/src/index.css");
const main = read("admin-center-app/src/main.tsx");
const sidebar = read("member-sidebar.html");
const memberCss = read("member-shell.css");
const checks = [
  ["existing member navigation remains the source reference", sidebar.includes("member-sidebar") && sidebar.includes("member-nav-link") && memberCss.includes("position: fixed")],
  ["administration keeps every existing navigation group", ["Dashboard", "Members", "Community", "Creators", "Content & Publishing", "System"].every((label) => app.includes(`label: \"${label}\"`))],
  ["administration navigation uses established active semantics", app.includes('className="member-nav-section nav-group"') && app.includes('aria-current={view === item.id ? "page" : undefined}') && css.includes('.nav-item[aria-current="page"]')],
  ["sidebar has independent vertical scrolling", css.includes("position: fixed") && css.includes("overflow-y: auto") && css.includes(".admin-preview-nav")],
  ["main content has independent scrolling", css.includes(".admin-preview-main") && css.includes("height: 100vh") && css.includes("overflow-y: auto")],
  ["mobile navigation exposes key destinations and full menu", app.includes("admin-mobile-nav") && app.includes("Open full administration menu") && css.includes(".admin-mobile-nav")],
  ["authenticated administration returns to member home", app.includes('href="/member-home"') && app.includes("Return to Member Home") && !app.includes('admin-return-link" href="/"')],
  ["public home remains available to unauthenticated visitors", read("worker.js").includes('href="/"')],
  ["saved theme and typography remain loaded", main.includes("/api/auth/me") && main.includes("/api/me/personalization") && css.includes("--tpi-admin-font")],
  ["member banner branding is reused", app.includes('src="/assets/tpi-banner.png"') && sidebar.includes("assets/tpi-banner.png")],
  ["analytics route remains present", app.includes('view === "analytics"') && app.includes("Analytics range")],
  ["responsive tablet/mobile behavior is defined", css.includes("@media (max-width: 720px)") && css.includes("@media (max-width: 480px)")],
  ["existing authorization route remains protected", read("worker.js").includes('url.pathname === "/admin-panel"') && read("worker.js").includes('user.role === "owner" || user.role === "admin"')],
];
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
const failed = checks.filter(([, passed]) => !passed);
console.log(`TPI-DEV-032 navigation checks: ${checks.length - failed.length}/${checks.length} passed`);
if (failed.length) process.exit(1);
