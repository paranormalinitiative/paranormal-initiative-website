import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../admin-center-app/src/app.tsx", import.meta.url), "utf8");
const main = readFileSync(new URL("../../admin-center-app/src/main.tsx", import.meta.url), "utf8");
const worker = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");
const legacy = readFileSync(new URL("../../admin-panel.html", import.meta.url), "utf8");
const legacyScript = readFileSync(new URL("../../admin-center.js", import.meta.url), "utf8");
const memberLogin = readFileSync(new URL("../../member-login.js", import.meta.url), "utf8");
const legacySectionBlocks = [...legacy.matchAll(/<section\b[^>]*data-admin-view="([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)];
const sectionWith = (marker) => legacySectionBlocks.filter(([, , block]) => block.includes(marker));

const checks = [
  ["complete navigation groups", ["Dashboard", "Members", "Community", "Creators", "Content & Publishing", "System"].every((value) => source.includes(`label: \"${value}\"`))],
  ["server member filters", ["search", "status", "role", "pageSize", "direction"].every((value) => main.includes(value))],
  ["protected preview route", worker.includes("/admin-center-preview") && worker.includes("hasAdminAccess")],
  ["real dashboard API", source.includes("/admin/overview?range=")],
  ["member detail excludes private conversations", source.includes("No private messenger conversation data is exposed") && !source.includes("activity.conversations")],
  ["member activity tabs", ["reactions", "reports", "Moderation History", "Account Management"].every((value) => source.includes(value))],
  ["community moderation API", source.includes("/admin/community/posts") && source.includes("/admin/comments")],
  ["legacy admin resources are isolated", sectionWith("Invite Access Control").length === 1 && sectionWith("Paranormal Teams Directory").length === 1 && sectionWith("Comment Moderation").length === 1 && legacy.includes('data-admin-view="contributors"') && legacy.includes('data-admin-view="teams"') && legacy.includes('data-admin-view="article-comments"')],
  ["legacy analytics has no relocated panels", !sectionWith("Invite Access Control").some(([, view]) => view === "analytics") && !sectionWith("Paranormal Teams Directory").some(([, view]) => view === "analytics") && !sectionWith("Comment Moderation").some(([, view]) => view === "analytics")],
  ["legacy auth refresh preserves view isolation", memberLogin.includes("adminAuthorized") && memberLogin.includes("TPIAdminCenter?.refreshView") && legacyScript.includes("adminActiveView") && legacyScript.includes("MutationObserver")],
  ["admin navigation ownership", ["Contributor Management", "Paranormal Teams", "Education Center", "Article Comment Moderation", "Reports &amp; Moderation"].every((value) => legacy.includes(value)) && ["Contributor Management", "Paranormal Teams", "Article Comment Moderation", "Reports & Moderation"].every((value) => source.includes(value))],
  ["confirmation dialog", source.includes("role=\"dialog\"") && source.includes("ConfirmDialog")],
  ["no production admin replacement in source", !source.includes("admin-panel.html\" replace")],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
if (failed.length) process.exit(1);
console.log(`TPI-ADMIN-007A administration isolation checks: ${checks.length}/${checks.length} passed`);
