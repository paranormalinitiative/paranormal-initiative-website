#!/usr/bin/env node

// Local-only authenticated regression for the member submission and protected
// Administration Center review path. It creates one synthetic local row and
// removes that exact row in a finally block; it never contacts production.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";

const base = (process.env.TPI_LOCATION_SUBMISSION_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "This regression is local-only and requires the maintained loopback Worker." }));
  process.exit(0);
}

const credentials = JSON.parse(readFileSync(".local-dev/local-auth-credentials.json", "utf8"));
const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), detail });

async function request(path, options = {}, cookie = "") {
  const headers = new Headers(options.headers || {});
  if (cookie) headers.set("cookie", cookie);
  const response = await fetch(`${base}${path}`, { ...options, headers, redirect: "manual" });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text.slice(0, 500); }
  return { response, body };
}

async function login(key) {
  const account = credentials.accounts?.[key];
  if (!account?.username || !account?.password) return { cookie: "", status: 0 };
  const result = await request("/api/auth/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username: account.username, password: account.password }),
  });
  return { cookie: (result.response.headers.get("set-cookie") || "").split(";")[0], status: result.response.status };
}

const member = await login("local_member");
check("synthetic member login", member.status === 200 && Boolean(member.cookie));
const invalid = await request("/api/haunted-location-submissions", {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({
    locationName: "Test", state: "MI", city: "Test", county: "Test", address: "123 Test",
    description: "Too short", historicalContext: "Too short", reportedClaims: "Too short",
    investigationZones: "Too short", accessDetails: "Public", sourceReferences: "Test", consent: false,
  }),
}, member.cookie);
check("invalid submission is rejected", invalid.response.status === 400, `HTTP ${invalid.response.status}`);

const syntheticId = randomUUID();
const payload = {
  locationName: `Codex Local Verification ${syntheticId.slice(0, 8)}`,
  state: "Michigan",
  city: "Testville",
  county: "Test County",
  address: "Public test reference only",
  coordinates: "42.0000, -84.0000",
  accessDetails: "Public test data; no visit requested.",
  description: "A synthetic candidate used only to verify the protected member submission route.",
  historicalContext: "Synthetic historical context used only for local route verification.",
  reportedClaims: "Synthetic reported activity tied to the test location for route verification.",
  investigationZones: "Test entrance; test interior; test exterior zone.",
  sourceReferences: "TPI local verification fixture; no external claim.",
  submitterNotes: "Delete this local verification row after the test.",
  consent: true,
};

let submissionId = "";
try {
  const created = await request("/api/haunted-location-submissions", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  }, member.cookie);
  submissionId = created.body?.submissionId || "";
  check("member submission is accepted", created.response.status === 201 && Boolean(submissionId), `HTTP ${created.response.status}`);

  const admin = await login("local_admin");
  check("synthetic administrator login", admin.status === 200 && Boolean(admin.cookie));
  const queue = await request("/api/admin/reports?type=location&status=all&page=1&pageSize=50", {}, admin.cookie);
  check("administrator queue returns the candidate", queue.response.status === 200 && queue.body?.reports?.some(row => row.id === submissionId));
  const detail = await request(`/api/admin/reports/location/${encodeURIComponent(submissionId)}`, {}, admin.cookie);
  check("administrator detail returns submitted research fields", detail.response.status === 200 && detail.body?.report?.description?.includes(payload.locationName) && detail.body?.metadataOnly === false);
  const triage = await request(`/api/admin/reports/location/${encodeURIComponent(submissionId)}/status`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status: "reviewed", reason: "Local verification only; candidate remains unpublished." }),
  }, admin.cookie);
  check("administrator can record candidate triage", triage.response.status === 200 && triage.body?.report?.status === "reviewed");
} finally {
  if (submissionId) {
    const db = execFileSync("find", [".local-dev/state/v3/d1", "-maxdepth", "2", "-type", "f", "-name", "*.sqlite", "!", "-name", "metadata.sqlite"], { encoding: "utf8" }).trim().split("\n").find(Boolean);
    if (db) execFileSync("sqlite3", [db, `DELETE FROM haunted_location_submissions WHERE id = '${submissionId.replaceAll("'", "''")}';`]);
  }
}

for (const result of checks) console.log(`${result.passed ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = checks.filter(result => !result.passed);
console.log(JSON.stringify({ status: failed.length ? "FAILED" : "PASSED", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, productionContacted: false, syntheticRowCleaned: Boolean(submissionId) }));
if (failed.length) process.exit(1);
