#!/usr/bin/env node

// TPI-OPS-006 — release-impact classifier regression.

import { classifyReleaseImpact, protectedApplicationDifferences } from "../release-impact.mjs";

const cases = [
  ["website HTML stays website-only", ["member-home.html"], "website"],
  ["website-specific verification stays website-only", ["scripts/verify/tpi-member-profile-feed-firefox.mjs"], "website"],
  ["StudioFlow asset selects StudioFlow profile", ["studio/index.html", "studio/assets/index.js"], "studioflow"],
  ["shared API selects the shared-api profile", ["functions/api/[[path]].js"], "shared-api"],
  ["shared API plus member UI stays shared-api", ["functions/api/[[path]].js", "member-home.html"], "shared-api"],
  ["authentication library escalates to full platform", ["lib/auth.js"], "full"],
  ["Nova source escalates to full platform", ["nova-app/src/App.tsx"], "full"],
  ["release tooling escalates to full platform", ["scripts/tpi-release.mjs"], "full"],
  ["explicit full profile raises website-only work", ["index.html"], "full", "full"],
];

let failures = 0;
for (const [name, changedFiles, expected, requestedProfile] of cases) {
  try {
    const result = classifyReleaseImpact({ changedFiles, requestedProfile });
    if (result.profile !== expected) {
      failures += 1;
      console.error(`FAIL ${name}: expected ${expected}, received ${result.profile}`);
    } else {
      console.log(`PASS ${name}`);
    }
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

try {
  classifyReleaseImpact({ changedFiles: ["index.html"], requestedProfile: "website" });
  console.log("PASS weaker explicit profile is accepted when it matches computed impact");
} catch (error) {
  failures += 1;
  console.error(`FAIL matching explicit profile: ${error.message}`);
}

const protectedBaseline = [
  { path: "studio/index.html", bytes: 10, sha256: "studio-old" },
  { path: "nova/index.html", bytes: 10, sha256: "nova-old" },
  { path: "admin-center-preview/index.html", bytes: 10, sha256: "admin-old" },
  { path: "admin-center-preview/release.json", bytes: 10, sha256: "admin-release-old" },
];
const protectedUnchanged = protectedApplicationDifferences(protectedBaseline, [
  ...protectedBaseline.map(entry => entry.path === "admin-center-preview/release.json" ? { ...entry, sha256: "admin-release-new" } : entry),
  { path: "index.html", bytes: 2, sha256: "website-new" },
]);
if (protectedUnchanged.length) {
  failures += 1;
  console.error(`FAIL protected app guard rejects an unrelated website byte: ${protectedUnchanged.join(", ")}`);
} else {
  console.log("PASS protected app guard ignores unrelated website bytes");
}
const protectedChanged = protectedApplicationDifferences(protectedBaseline, protectedBaseline.map(entry => entry.path === "studio/index.html" ? { ...entry, sha256: "studio-new" } : entry));
if (!protectedChanged.includes("studio/index.html")) {
  failures += 1;
  console.error("FAIL protected app guard detects changed StudioFlow bytes");
} else {
  console.log("PASS protected app guard detects changed StudioFlow bytes");
}

if (failures) process.exit(1);
console.log(`Release-impact classifier: PASS (${cases.length + 3} checks)`);

