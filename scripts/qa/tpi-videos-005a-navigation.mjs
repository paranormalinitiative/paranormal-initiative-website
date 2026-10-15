#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("../..", import.meta.url).pathname);
const sidebar = readFileSync(resolve(root, "member-sidebar.html"), "utf8");
const shell = readFileSync(resolve(root, "member-shell.js"), "utf8");

assert.match(sidebar, /href="\/studio\/" data-nav="studio"[\s\S]*?TPI Creator Studio/);
assert.doesNotMatch(sidebar, /href="\/studio\/" data-nav="studio"[\s\S]*?>\s*Creator Studio\b/);
assert.match(shell, /href="\/studio\/" data-nav="studio"[\s\S]*?aria-label="TPI Creator Studio"/);
assert.match(shell, /mobile-nav-icon[^<]*<\/span>TPI Creator Studio<\/a>/);
assert.match(sidebar, /data-nav="studio" data-studio-only hidden/);
assert.match(sidebar, /data-coming-soon/);
assert.equal((sidebar.match(/href="\/studio\/"/g) || []).length, 1);
assert.equal((shell.match(/href="\/studio\/"/g) || []).length, 1);

console.log("PASS TPI-VIDEOS-005-A navigation branding: desktop and mobile labels point to /studio/.");
