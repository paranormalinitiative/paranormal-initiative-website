import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../admin-center-app/src/app.tsx", import.meta.url), "utf8");
const main = readFileSync(new URL("../../admin-center-app/src/main.tsx", import.meta.url), "utf8");
const worker = readFileSync(new URL("../../worker.js", import.meta.url), "utf8");

const checks = [
  ["complete navigation groups", ["Dashboard", "Members", "Community", "Creators", "Content & Publishing", "System"].every((value) => source.includes(`label: \"${value}\"`))],
  ["server member filters", ["search", "status", "role", "pageSize", "direction"].every((value) => main.includes(value))],
  ["protected preview route", worker.includes("/admin-center-preview") && worker.includes("hasAdminAccess")],
  ["real dashboard API", source.includes("/admin/overview?range=")],
  ["member detail excludes private conversations", source.includes("No private messenger conversation data is exposed") && !source.includes("activity.conversations")],
  ["community moderation API", source.includes("/admin/community/posts") && source.includes("/admin/comments")],
  ["confirmation dialog", source.includes("role=\"dialog\"") && source.includes("ConfirmDialog")],
  ["no production admin replacement in source", !source.includes("admin-panel.html\" replace")],
];

const failed = checks.filter(([, passed]) => !passed);
for (const [label, passed] of checks) console.log(`${passed ? "PASS" : "FAIL"} ${label}`);
if (failed.length) process.exit(1);
console.log(`TPI-ADMIN-006 preview checks: ${checks.length}/${checks.length} passed`);
