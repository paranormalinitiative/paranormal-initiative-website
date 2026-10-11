#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(new URL("../..", import.meta.url).pathname);
const page = readFileSync(resolve(root, "tpi-videos.html"), "utf8");

assert.match(page, /body\.member-mode \.video-grid\s*\{\s*grid-template-columns:\s*repeat\(4, minmax\(0, 1fr\)\);/);
assert.match(page, /@media \(max-width: 1120px\) and \(min-width: 801px\)\s*\{\s*body\.member-mode \.video-grid\s*\{\s*grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\);/);
assert.match(page, /@media \(max-width: 800px\)\s*\{[\s\S]*?body\.member-mode \.video-grid\s*\{\s*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\);/);
assert.match(page, /@media \(max-width: 560px\)\s*\{\s*body\.member-mode \.video-grid\s*\{\s*grid-template-columns:\s*1fr;/);
assert.match(page, /member-shell\.css\?v=62/);

console.log("PASS TPI-MEDIA-001 grid regression: member-shell specificity is overridden with 4/3/2/1 responsive breakpoints.");
