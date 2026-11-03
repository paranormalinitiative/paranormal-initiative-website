#!/usr/bin/env node

// TPI-CREATOR-INCENTIVE-001 — prepare the owner's local review accounts.
//
// Creates (or reuses) five synthetic, clearly labelled review accounts in the
// isolated local environment, then issues the representative memberships
// through the real local Worker API as the local administrator. That means the
// owner can log in at http://127.0.0.1:8787/ and inspect real assignments,
// badges, capabilities and the dual-access account without touching SQL.
//
// Guarded: --local-only is required, the base URL must be loopback, the
// Wrangler config must be the local-only configuration, and the Worker must
// itself confirm a local environment before any fixture is created. Every
// generated credential stays inside the gitignored .local-dev directory.

import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { resolve } from "node:path";
import {
  assertLocalOnlyConfig,
  assertLocalServerData,
  assertLoopbackReviewTarget,
} from "./lib/local-review-guard.mjs";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const localDir = resolve(repoRoot, ".local-dev");
const configPath = resolve(repoRoot, "wrangler.local.toml");
const adminCredentialPath = resolve(localDir, "local-auth-credentials.json");
const reviewCredentialPath = resolve(localDir, "creator-incentive-review.json");
const baseUrl = "http://127.0.0.1:8787";

function fail(message) {
  console.error(`Creator Incentive reviewer setup aborted: ${message}`);
  process.exit(1);
}

if (!process.argv.includes("--local-only")) fail("pass --local-only to confirm only the isolated local environment is changed");
if (!existsSync(configPath)) fail("wrangler.local.toml is missing");
if (!existsSync(adminCredentialPath)) fail("local administrator credentials are missing; run the maintained local setup first");
const config = readFileSync(configPath, "utf8");
try {
  assertLoopbackReviewTarget(baseUrl);
  assertLocalOnlyConfig(config);
} catch (error) {
  fail(error.message);
}

const REVIEW_ACCOUNTS = [
  { key: "creator", username: "tpi_review_creator", displayName: "Review — Founding Creator", classCode: "FC" },
  { key: "contributor", username: "tpi_review_contributor", displayName: "Review — Founding Contributor", classCode: "FCT" },
  { key: "allaccess", username: "tpi_review_allaccess", displayName: "Review — Founding All-Access", classCode: "FAA" },
  { key: "dual", username: "tpi_review_dual", displayName: "Review — Dual Access (Creator + Contributor)", classCode: "FC", dualContributor: true },
];

function generatePassword() {
  return `Tpi-${randomBytes(12).toString("base64url")}`;
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

const adminCredential = readJson(adminCredentialPath)?.accounts?.local_admin;
if (!adminCredential?.username || !adminCredential?.password) fail("local administrator credential entry is incomplete");

const existingReview = readJson(reviewCredentialPath) || { version: 1, accounts: {} };
const passwords = {};
for (const account of REVIEW_ACCOUNTS) {
  passwords[account.key] = existingReview.accounts?.[account.key]?.password || generatePassword();
}

async function api(path, { method = "GET", body, cookie } = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers: {
      Accept: "application/json",
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: "manual",
  });
  const text = await response.text();
  let payload = {};
  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = { raw: text.slice(0, 200) };
  }
  return { status: response.status, payload, setCookie: response.headers.get("set-cookie") || "" };
}

async function login(username, password) {
  const result = await api("/api/auth/login", { method: "POST", body: { username, password } });
  if (result.status !== 200) return null;
  const cookie = result.setCookie.split(";")[0];
  return cookie || null;
}

const adminCookie = await login(adminCredential.username, adminCredential.password);
if (!adminCookie) fail("the local administrator could not log in; the maintained local environment may need to be started first");
console.log(`Local administrator session established (${adminCredential.username}).`);

// Probe the registry before creating anything. The Worker only reports
// localReviewData from a local environment, so this refuses to seed fixtures
// into a remote or production target even if the config were tampered with.
const probe = await api("/api/admin/founding-memberships?pageSize=1", { cookie: adminCookie });
if (probe.status !== 200) fail(`the local registry probe failed (${probe.status})`);
try {
  assertLocalServerData(probe.payload);
} catch (error) {
  fail(error.message);
}
console.log("Worker confirmed a local review environment; fixtures are local-only.");

const summary = [];
for (const account of REVIEW_ACCOUNTS) {
  const password = passwords[account.key];
  let cookie = await login(account.username, password);
  if (!cookie) {
    const registration = await api("/api/members/register", {
      method: "POST",
      body: {
        username: account.username,
        password,
        displayName: account.displayName,
        email: `${account.username}@example.test`,
      },
    });
    if (registration.status !== 200 && registration.status !== 201) {
      fail(`review account ${account.username} could not be created (${registration.status}: ${registration.payload.error || "unknown error"})`);
    }
    cookie = await login(account.username, password);
    if (!cookie) fail(`review account ${account.username} was created but cannot log in`);
    console.log(`Created review account ${account.username}.`);
  } else {
    console.log(`Reused existing review account ${account.username}.`);
  }

  const assignment = await api("/api/admin/founding-memberships/assign", {
    method: "POST",
    cookie: adminCookie,
    body: { username: account.username, classCode: account.classCode, notes: "Local owner review fixture (TPI-CREATOR-INCENTIVE-001)" },
  });
  let membershipNumber = assignment.payload?.membership?.membershipNumber || null;
  if (assignment.status === 409 && assignment.payload?.code === "duplicate_assignment") {
    membershipNumber = assignment.payload?.detail?.membershipNumber || null;
    console.log(`  ${account.username} already holds ${membershipNumber}.`);
  } else if (assignment.status !== 201) {
    fail(`membership assignment for ${account.username} failed (${assignment.status}: ${assignment.payload.error || "unknown error"})`);
  } else {
    console.log(`  Issued ${membershipNumber} to ${account.username}.`);
  }

  if (account.dualContributor) {
    const grant = await api(`/api/admin/members/${encodeURIComponent(account.username)}/entitlements`, {
      method: "POST",
      cookie: adminCookie,
      body: { capability: "contributor", notes: "Local owner review: cumulative dual access" },
    });
    if (grant.status === 201) console.log("  Granted the additional Contributor capability.");
    else if (grant.status === 409) console.log("  Additional Contributor capability already present.");
    else fail(`dual-access grant for ${account.username} failed (${grant.status}: ${grant.payload.error || "unknown error"})`);
  }

  const entitlements = await api("/api/me/entitlements", { cookie });
  if (entitlements.status !== 200) fail(`could not read entitlements for ${account.username}`);
  summary.push({
    key: account.key,
    username: account.username,
    password,
    membershipNumber,
    capabilities: entitlements.payload.capabilities,
    badge: entitlements.payload.badge,
    creatorStudioAccess: entitlements.payload.entitled?.studioFlowNovaEdit === true,
    editorialAccess: entitlements.payload.entitled?.novaEditorialWorkspace === true,
    creatorIncentiveEligible: entitlements.payload.creatorIncentive?.eligible === true,
  });
}

mkdirSync(localDir, { recursive: true });
writeFileSync(reviewCredentialPath, `${JSON.stringify({ version: 1, generatedAt: new Date().toISOString(), accounts: Object.fromEntries(summary.map((row) => [row.key, { username: row.username, password: row.password }])) }, null, 2)}\n`, { mode: 0o600 });
chmodSync(reviewCredentialPath, 0o600);

console.log("\n== LOCAL REVIEW ACCOUNTS ==");
for (const row of summary) {
  console.log(`${row.membershipNumber || "(capability only)"}  ${row.username.padEnd(22)} capabilities: ${(row.capabilities || []).join(" + ") || "none"} · badge: ${row.badge?.label || "none"} · creator studio: ${row.creatorStudioAccess} · editorial: ${row.editorialAccess} · incentive eligible: ${row.creatorIncentiveEligible}`);
}
console.log(`\nPasswords and usernames: ${reviewCredentialPath} (gitignored, mode 600)`);
console.log(`Admin workflow: ${baseUrl}/admin-panel#founding-memberships (sign in as ${adminCredential.username})`);
console.log("Ordinary-member control account remains: local_member (no membership, no capability).");
