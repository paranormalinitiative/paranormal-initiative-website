#!/usr/bin/env node

/** Read-only, anonymous production boundary smoke checks. */
const baseArg = process.argv.indexOf("--base");
const base = (baseArg >= 0 ? process.argv[baseArg + 1] : process.env.TPI_PRODUCTION_URL || "https://paranormalinitiative.com").replace(/\/$/, "");

const checks = [
  { path: "/", statuses: [200], note: "public shell" },
  { path: "/live-video", statuses: [200], includes: /coming\s+soon/i, note: "public live-video Coming Soon" },
  { path: "/studio/", statuses: [401, 403], note: "anonymous Creator Studio denied" },
  { path: "/api/auth/me", statuses: [200], includes: /"user"\s*:\s*null/, note: "anonymous session probe contains no user" },
  { path: "/api/conversations", statuses: [401, 403], note: "anonymous Messenger denied" },
  { path: "/api/notifications", statuses: [401, 403], note: "anonymous notifications denied" },
  { path: "/api/admin/members", statuses: [401, 403], note: "anonymous admin API denied" },
  { path: "/api/community/categories", statuses: [200], note: "public category discovery" },
  { path: "/api/community/posts", statuses: [200], note: "public feed boundary" },
  { path: "/api/media/messenger/qa-nonexistent-object", statuses: [401, 403, 404], note: "private Messenger media boundary" }
];

let failed = 0;
console.log(`Read-only production smoke: ${base}`);
for (const check of checks) {
  const url = `${base}${check.path}`;
  try {
    const response = await fetch(url, { redirect: "manual" });
    const body = await response.text();
    const statusOk = check.statuses.includes(response.status);
    const contentOk = !check.includes || check.includes.test(body);
    const ok = statusOk && contentOk;
    console.log(`${ok ? "PASS" : "FAIL"} ${check.note}: ${response.status} ${check.path}`);
    if (!ok) {
      failed += 1;
      console.log(`      expected status ${check.statuses.join("/")}${check.includes ? " and required content" : ""}`);
    }
  } catch (error) {
    failed += 1;
    console.log(`FAIL ${check.note}: ${error.message}`);
  }
}
console.log(`Production smoke result: ${failed ? "FAIL" : "PASS"} (${checks.length - failed}/${checks.length})`);
process.exitCode = failed ? 1 : 0;
