#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const source = fs.readFileSync(path.join(root, "member-settings.js"), "utf8");

// A unary + before an HTML card coerces the card string to NaN. Keep this
// focused guard beside the repaired Settings panel so the visible content
// cannot silently regress while the broader browser harness is unavailable.
assert.doesNotMatch(
  source,
  /\n\s*\+card\(/,
  "Settings panels must concatenate card markup, not coerce it with unary +"
);

const ownershipStart = source.indexOf("'content-ownership':");
const ownershipEnd = source.indexOf("'blocked-users':", ownershipStart);
assert(ownershipStart >= 0 && ownershipEnd > ownershipStart, "Content ownership panel is present");
const ownershipPanel = source.slice(ownershipStart, ownershipEnd);
for (const title of ["My Videos", "Published Content", "Content Visibility", "Connected Platforms", "Data Export", "Content Removal"]) {
  assert(ownershipPanel.includes(`card('${title}'`), `Content ownership card remains: ${title}`);
}

console.log("PASS Settings Content Ownership panel regression: six cards remain string-concatenated without NaN coercion.");
