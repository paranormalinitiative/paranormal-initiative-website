#!/usr/bin/env node

// TPI-OPS-006 — small website-only release smoke.
//
// This deliberately checks only shared public surfaces and protected route
// boundaries. Feature-specific browser suites remain conditional on the files
// that changed; this is not a replacement for those suites.

import { execFileSync } from "node:child_process";

const baseUrl = (process.env.TPI_WEBSITE_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const checks = [
  ["public homepage", "/", 200],
  ["member login surface", "/member-login.html", 200],
  ["anonymous StudioFlow remains protected", "/studio/", 403],
  ["anonymous Nova remains protected", "/nova/", 403],
];

let failures = 0;
for (const [name, path, expected] of checks) {
  try {
    const status = Number(execFileSync("curl", ["-sS", "--max-time", "10", "-o", "/dev/null", "-w", "%{http_code}", `${baseUrl}${path}`], { encoding: "utf8" }).trim());
    if (status !== expected) {
      failures += 1;
      console.error(`FAIL ${name}: expected HTTP ${expected}, received ${status}`);
    } else {
      console.log(`PASS ${name}`);
    }
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

if (failures) process.exit(1);
console.log(`Website surface smoke: PASS (${checks.length} checks)`);

