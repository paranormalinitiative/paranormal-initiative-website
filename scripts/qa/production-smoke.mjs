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
const transientStatuses = new Set([502, 503, 504]);
const sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds));
async function fetchSmokeCheck(url, check) {
  let lastError;
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch(url, { redirect: "manual", signal: AbortSignal.timeout(8_000) });
      const body = await response.text();
      if (transientStatuses.has(response.status) && attempt < 3) {
        await sleep(1_000 * attempt);
        continue;
      }
      return { response, body };
    } catch (error) {
      lastError = error;
      if (attempt < 3) await sleep(1_000 * attempt);
    }
  }
  throw lastError;
}
console.log(`Read-only production smoke: ${base}`);
for (const check of checks) {
  const url = `${base}${check.path}`;
  try {
    const { response, body } = await fetchSmokeCheck(url, check);
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
