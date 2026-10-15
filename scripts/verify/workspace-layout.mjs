import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const read = (file) => fs.readFileSync(path.join(repo, file), "utf8");
const failures = [];
const check = (condition, message) => {
  if (!condition) failures.push(message);
};

const admin = read("admin-panel.html");
const settings = read("member-dashboard.html");
const shell = read("workspace-shell.css");
const memberHome = read("member-home.html");
const normalPage = read("member-profile.html");

for (const [name, html, bodyClass, title, navLabel] of [
  ["Administration Center", admin, "workspace-admin-page", "TPI Administration Center", "Administration navigation"],
  ["Settings Center", settings, "workspace-settings-page", "TPI Settings Center", "Settings navigation"],
]) {
  check(html.includes(`class="workspace-page ${bodyClass}"`), `${name}: route-scoped workspace body class is missing`);
  check(html.includes("workspace-shell.css?v=3"), `${name}: dedicated workspace stylesheet is not loaded with the current cache-busting version`);
  check(html.includes("member-shell.js?v=57"), `${name}: shared member shell is not loaded with the current cache-busting version`);
  check(html.includes("class=\"workspace-header\""), `${name}: dedicated workspace header is missing`);
  check(html.includes(title), `${name}: dedicated workspace title is missing`);
  check(html.includes('class="workspace-back-link" href="/member-home">Back to TPI</a>'), `${name}: Back to TPI control is missing`);
  check(html.includes(`aria-label="${navLabel}"`), `${name}: workspace navigation landmark is missing`);
  check(html.includes('id="site-header"') && html.includes('id="site-footer"'), `${name}: shared include anchors must remain for auth/bootstrap compatibility`);
}

check(admin.includes('class="admin-center-shell"'), "Administration Center: existing internal navigation shell was removed");
check(admin.includes('data-admin-panel'), "Administration Center: existing admin behavior hook was removed");
check(settings.includes('class="settings-layout"'), "Settings Center: existing settings layout was removed");
check(settings.includes('data-settings-nav'), "Settings Center: existing settings navigation hook was removed");
check(shell.includes("body.workspace-page #site-header") && shell.includes("body.workspace-page #site-footer"), "workspace shell does not hide public chrome within the dedicated routes");
check(shell.includes("body.workspace-page .member-sidebar") && shell.includes("body.workspace-page .member-mobile-nav"), "generic member navigation is not scoped out of dedicated routes");
check(shell.includes("body.workspace-page .member-main") && shell.includes("margin-left: 0"), "dedicated workspace content is not full width");
check(shell.includes("workspace-account-slot > .member-floating-chat.is-collapsed"), "collapsed Messenger is not reserved in the workspace header");
check(shell.includes("grid-template-columns: minmax(220px, 248px) minmax(0, 1fr)"), "Administration Center does not define a flexible two-column grid");
check(shell.includes("grid-template-columns: minmax(220px, 248px) minmax(0, 1fr)"), "Settings Center does not define a flexible two-column grid");
check(shell.includes("@media (max-width: 900px)"), "workspace header does not define an intentional tablet reflow");
check(shell.includes("@media (max-width: 760px)"), "workspace layout does not define a mobile Messenger/card reflow");
check(!/^\.workspace-header\s*\{/m.test(shell), "workspace header styles are not route scoped");
check(!memberHome.includes("workspace-page"), "member home was accidentally converted into a dedicated workspace");
check(!normalPage.includes("workspace-page"), "ordinary member pages were accidentally converted into a dedicated workspace");

if (failures.length) {
  console.error(`Workspace layout regression: ${failures.length} failure(s)`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Workspace layout regression: PASS (route scope, dedicated headers, internal navigation, and ordinary-page preservation)");
