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
const memberShell = read("member-shell.js");
const ordinary = read("member-home.html");

for (const [name, html, bodyClass, title] of [
  ["Administration", admin, "workspace-admin-page", "TPI Administration Center"],
  ["Settings", settings, "workspace-settings-page", "TPI Settings Center"],
]) {
  check(html.includes(`class="workspace-page ${bodyClass}"`), `${name}: route scope missing`);
  check(html.includes("workspace-shell.css?v=3"), `${name}: workspace stylesheet cache version missing`);
  check(html.includes("member-shell.js?v=57"), `${name}: member shell cache version missing`);
  check(html.includes("class=\"workspace-account-slot\" data-workspace-chat-slot role=\"group\""), `${name}: reserved account slot missing`);
  check(html.includes(title), `${name}: title missing`);
  check(html.includes('class="workspace-back-link" href="member-home.html">Back to TPI</a>'), `${name}: Back to TPI missing`);
}

check(shell.includes("grid-template-columns: minmax(0, 1fr) auto auto"), "workspace header does not reserve account and action columns");
check(shell.includes("workspace-account-slot > .member-floating-chat.is-collapsed"), "workspace account slot does not own the collapsed Messenger control");
check(shell.includes("settings-layout"), "workspace settings layout selector missing");
check(shell.includes("body.workspace-settings-page .settings-sidebar"), "Settings sidebar alignment is not route scoped");
check(shell.includes("width: 100%;\n    margin: 0;"), "Settings workspace still uses a centered narrow wrapper");
check(shell.includes("admin-center-main > *"), "Administration main content does not share one width rule");
check(memberShell.includes("mountWorkspaceCollapsedChat"), "workspace account mounting behavior is missing");
check(memberShell.includes("unmountWorkspaceCollapsedChat"), "workspace account unmount behavior is missing");
check(memberShell.includes('data-workspace-chat-slot'), "workspace account slot integration is missing");
check(!ordinary.includes("workspace-page"), "ordinary member page was changed into a workspace route");

if (failures.length) {
  console.error(`TPI-UI-003 workspace regression: ${failures.length} failure(s)`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("TPI-UI-003 workspace regression: PASS (header reservation, Settings sidebar geometry, admin width rules, and ordinary-page preservation)");
