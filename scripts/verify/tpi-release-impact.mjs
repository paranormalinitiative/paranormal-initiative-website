#!/usr/bin/env node

// TPI-OPS-006 — release-impact classifier regression.

import { classifyReleaseImpact, protectedApplicationDifferences, protectedApplicationScope } from "../release-impact.mjs";

const cases = [
  ["website HTML stays website-only", ["member-home.html"], "website"],
  ["website-specific verification stays website-only", ["scripts/verify/tpi-member-profile-feed-firefox.mjs"], "website"],
  ["StudioFlow asset selects StudioFlow profile", ["studio/index.html", "studio/assets/index.js"], "studioflow"],
  ["shared API selects the shared-api profile", ["functions/api/[[path]].js"], "shared-api"],
  ["shared API plus member UI stays shared-api", ["functions/api/[[path]].js", "member-home.html"], "shared-api"],
  ["authentication library escalates to full platform", ["lib/auth.js"], "full"],
  ["Nova source escalates to full platform", ["nova-app/src/App.tsx"], "full"],
  ["release tooling escalates to full platform", ["scripts/tpi-release.mjs"], "full"],
  ["Administration Center source selects the admin-center profile", ["admin-center-app/src/app.tsx", "admin-center-preview/index.html"], "admin-center"],
  ["Administration Center browser verification selects the admin-center profile", ["scripts/e2e/tpi-ops-015-local-browser.mjs"], "admin-center"],
  ["Administration Center plus shared Worker code escalates to full platform", ["admin-center-app/src/app.tsx", "worker.js"], "full"],
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

const lockedWebsite = protectedApplicationScope(["member-home.html", "scripts/verify/tpi-paper-editor-to-feed-firefox.mjs"]);
if (lockedWebsite.verify) {
  failures += 1;
  console.error("FAIL website/test-only changes reopen protected application verification");
} else {
  console.log("PASS website/test-only changes keep StudioFlow and Nova in maintenance lock");
}
const sharedRuntime = protectedApplicationScope(["functions/api/[[path]].js"]);
if (!sharedRuntime.verify || !sharedRuntime.runtimeFiles.includes("functions/api/[[path]].js")) {
  failures += 1;
  console.error("FAIL shared Worker runtime changes do not reopen protected application verification");
} else {
  console.log("PASS shared Worker runtime changes reopen protected application verification");
}
const directApplication = protectedApplicationScope(["nova-app/src/App.tsx"]);
if (!directApplication.verify || !directApplication.sourceFiles.includes("nova-app/src/App.tsx")) {
  failures += 1;
  console.error("FAIL direct Nova source changes do not reopen protected application verification");
} else {
  console.log("PASS direct Nova source changes reopen protected application verification");
}

const protectedBaseline = [
  { path: "studio/index.html", bytes: 10, sha256: "studio-old" },
  { path: "nova/index.html", bytes: 10, sha256: "nova-old" },
  { path: "content-editor-nova/content-editor.html", bytes: 10, sha256: "content-editor-old" },
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
const contentEditorChanged = protectedApplicationDifferences(protectedBaseline, protectedBaseline.map(entry => entry.path === "content-editor-nova/content-editor.html" ? { ...entry, sha256: "content-editor-new" } : entry));
if (!contentEditorChanged.includes("content-editor-nova/content-editor.html")) {
  failures += 1;
  console.error("FAIL protected Nova Editorial Workspace bytes are not guarded");
} else {
  console.log("PASS protected Nova Editorial Workspace bytes are guarded");
}
const allowedAdminChange = protectedApplicationDifferences(protectedBaseline, protectedBaseline.map(entry => entry.path === "admin-center-preview/index.html" ? { ...entry, sha256: "admin-new" } : entry), { allowedPrefixes: ["admin-center-preview/"] });
if (allowedAdminChange.length) {
  failures += 1;
  console.error(`FAIL admin-center guard permits its explicitly changed preview bytes: ${allowedAdminChange.join(", ")}`);
} else {
  console.log("PASS admin-center guard permits only its explicitly changed preview bytes");
}

if (failures) process.exit(1);
console.log(`Release-impact classifier: PASS (${cases.length + 3} checks)`);

