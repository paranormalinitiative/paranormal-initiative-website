#!/usr/bin/env node

// Focused local verification for the Founding Membership issuance repair.
// This uses the existing disposable local review account and a duplicate
// assignment request, so it cannot consume another permanent number.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const baseUrl = process.env.TPI_REVIEW_BASE_URL || "http://127.0.0.1:8787";
if (!/^http:\/\/127\.0\.0\.1(?::\d+)?$/.test(baseUrl)) throw new Error("Refusing a non-loopback Founding Membership verification target.");

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);
const credentials = JSON.parse(readFileSync(resolve(repoRoot, ".local-dev/local-auth-credentials.json"), "utf8"));
const review = JSON.parse(readFileSync(resolve(repoRoot, ".local-dev/creator-incentive-review.json"), "utf8"));
const admin = credentials.accounts.local_admin;
const uiAccount = "tpi_review_ui_check";
let passed = 0;
const failures = [];

function check(label, condition, detail = "") {
  if (condition) { passed += 1; console.log(`PASS ${label}`); }
  else { failures.push(`${label}${detail ? ` — ${detail}` : ""}`); console.log(`FAIL ${label}${detail ? ` — ${detail}` : ""}`); }
}

async function request(path, { method = "GET", cookie = "", body } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: { Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}), ...(cookie ? { Cookie: cookie } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  return { status: response.status, payload, cookie: response.headers.get("set-cookie")?.split(";")[0] || "" };
}

const login = await request("/api/auth/login", { method: "POST", body: admin });
check("local administrator can authenticate", login.status === 200, `status ${login.status}`);
const adminCookie = login.cookie;

const searchAt = await request(`/api/admin/founding-memberships/members?search=${encodeURIComponent(`@${uiAccount}`)}`, { cookie: adminCookie });
check("leading @ username search resolves the existing account", searchAt.status === 200 && searchAt.payload.members?.some((row) => row.username === uiAccount), JSON.stringify(searchAt.payload).slice(0, 240));

const searchName = await request("/api/admin/founding-memberships/members?search=Review%20%E2%80%94%20UI%20Issuance%20Check", { cookie: adminCookie });
check("display-name search resolves the existing account", searchName.status === 200 && searchName.payload.members?.some((row) => row.username === uiAccount), JSON.stringify(searchName.payload).slice(0, 240));

const searchEmail = await request(`/api/admin/founding-memberships/members?search=${encodeURIComponent(`${uiAccount}@example.test`)}`, { cookie: adminCookie });
check("registered-email search resolves the existing account", searchEmail.status === 200 && searchEmail.payload.members?.some((row) => row.username === uiAccount), JSON.stringify(searchEmail.payload).slice(0, 240));
check("member search masks returned email data", searchEmail.payload.members?.every((row) => !row.email && (!row.maskedEmail || row.maskedEmail.includes("***"))), JSON.stringify(searchEmail.payload).slice(0, 240));

const duplicate = await request("/api/admin/founding-memberships/assign", { method: "POST", cookie: adminCookie, body: { username: `@${uiAccount}`, classCode: "FC", notes: "Focused @username normalization verification" } });
check("leading @ assignment resolves the account and reaches duplicate protection", duplicate.status === 409 && duplicate.payload.code === "duplicate_assignment", JSON.stringify(duplicate.payload).slice(0, 240));
check("duplicate protection reports the already-issued permanent number", Boolean(duplicate.payload.detail?.membershipNumber), JSON.stringify(duplicate.payload).slice(0, 240));

const memberLogin = await request("/api/auth/login", { method: "POST", body: { username: credentials.accounts.local_member.username, password: credentials.accounts.local_member.password } });
const memberCookie = memberLogin.cookie;
const denied = await request("/api/admin/founding-memberships/members?search=tpi_review", { cookie: memberCookie });
check("ordinary member cannot search founding-membership accounts", denied.status === 403, `status ${denied.status}`);

console.log(`PASS=${passed} FAIL=${failures.length}`);
if (failures.length) { console.error(failures.join("\n")); process.exit(1); }
