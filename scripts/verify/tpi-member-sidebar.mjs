#!/usr/bin/env node

// TPI member navigation regression: keep the shared sidebar order and its
// administrative visibility boundary explicit.

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(fileURLToPath(new URL("../..", import.meta.url)));
const sidebar = readFileSync(join(root, "member-sidebar.html"), "utf8");
const shell = readFileSync(join(root, "member-shell.js"), "utf8");
const failures = [];

const expectedOrder = [
  "profile",
  "admin-events",
  "watch-later",
  "watch-history",
  "settings",
  "admin-center",
  "help-center",
  "logout",
];
const indexes = expectedOrder.map(nav => sidebar.indexOf(`data-nav="${nav}"`));
for (let index = 0; index < indexes.length; index += 1) {
  if (indexes[index] < 0) failures.push(`missing shared sidebar item: ${expectedOrder[index]}`);
  if (index > 0 && indexes[index] <= indexes[index - 1]) failures.push(`sidebar order is incorrect near ${expectedOrder[index - 1]} → ${expectedOrder[index]}`);
}

if (!sidebar.includes('data-nav="watch-later"') || !sidebar.includes("Saved Items")) failures.push("Saved Items must have a clear label and navigation identity");
if (!sidebar.includes('aria-label="Manage community events"') || !sidebar.includes('aria-label="Saved Items: your saved videos, articles, and posts"') || !sidebar.includes('aria-label="Settings: account and site preferences"') || !sidebar.includes('aria-label="Help Center: site guidance, policies, and reporting"')) failures.push("member navigation labels must explain the destination to assistive technology");
if (!sidebar.includes('data-nav="admin-center" data-admin-only hidden')) failures.push("Administration Center must be hidden by the shared admin-only marker");
if (!sidebar.includes('data-nav="admin-events" data-admin-only hidden')) failures.push("Manage Events must remain restricted to administrative access");
if (!shell.includes('document.querySelectorAll("[data-admin-only]").forEach(function (element)')) failures.push("member shell must apply the server-derived admin visibility gate");
if (!shell.includes("element.hidden = !canUseAdminPanel")) failures.push("member shell must hide admin-only navigation for unauthorized users");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("PASS: shared member sidebar order and administration visibility are enforced.");

