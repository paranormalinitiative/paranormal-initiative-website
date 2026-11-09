#!/usr/bin/env node

// Local-only integration check for the leadership distinction workflow.
// It uses the synthetic local_admin/local_member fixtures and never contacts
// a hosted Worker or prints credentials. The member distinction is revoked at
// the end so the fixture account has no active recognition left behind.
import { existsSync, readFileSync } from "node:fs";

const base = process.env.TPI_LOCAL_ORIGIN || "http://127.0.0.1:8787";
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) {
  throw new Error("TPI-GOVERNANCE-004 local verification requires the approved loopback Worker");
}
const credentialPath = ".local-dev/local-auth-credentials.json";
if (!existsSync(credentialPath)) throw new Error("local authentication fixtures are missing");
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
const checks = [];
const check = (name, condition) => {
  if (!condition) throw new Error(`${name} failed`);
  checks.push(name);
};

async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, { redirect: "manual", ...options, headers: { ...(options.headers || {}) } });
  const text = await response.text();
  let body = null;
  try { body = JSON.parse(text); } catch { /* non-JSON response */ }
  return { response, body };
}

function sessionCookie(response) {
  const value = response.headers.get("set-cookie") || "";
  return value.match(/tpi_session=([^;]+)/)?.[1] || "";
}

const adminAccount = credentials.accounts?.local_admin;
if (!adminAccount?.username || !adminAccount?.password) throw new Error("local administrator fixture is incomplete");
const login = await request("/api/auth/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ username: adminAccount.username, password: adminAccount.password }),
});
check("local administrator login", login.response.status === 200 && Boolean(login.body?.user));
const cookie = sessionCookie(login.response);
check("local administrator session cookie", Boolean(cookie));

const unauthenticated = await request("/api/admin/leadership/distinctions");
check("anonymous admin access denied", unauthenticated.response.status === 403);

const existing = await request("/api/admin/leadership/distinctions", { headers: { Cookie: `tpi_session=${cookie}` } });
check("admin distinction registry loads", existing.response.status === 200 && Array.isArray(existing.body?.profiles));
const existingMemberRow = (existing.body?.distinctions || []).find(row => row.username === "local_member" && row.code === "gold" && row.status === "active");
if (existingMemberRow) {
  throw new Error("local_member already has an active Gold distinction; refusing to overwrite fixture state");
}

const assigned = await request("/api/admin/leadership/distinctions", {
  method: "POST",
  headers: { Cookie: `tpi_session=${cookie}`, "Content-Type": "application/json" },
  body: JSON.stringify({ username: "local_member", code: "gold", description: "Disposable local verification distinction", notes: "TPI-GOVERNANCE-004 local-only test" }),
});
check("admin can assign Gold to an existing member", assigned.response.status === 201 && assigned.body?.account?.username === "local_member");
const distinctionId = assigned.body?.distinction?.id;
check("assignment returns a stable distinction id", typeof distinctionId === "string" && distinctionId.length > 10);

const profile = await request("/api/contributors/profile?username=local_member");
check("public profile exposes active distinction", profile.response.status === 200 && profile.body?.leadershipDistinctions?.some(item => item.code === "gold"));

const duplicate = await request("/api/admin/leadership/distinctions", {
  method: "POST",
  headers: { Cookie: `tpi_session=${cookie}`, "Content-Type": "application/json" },
  body: JSON.stringify({ username: "local_member", code: "gold" }),
});
check("duplicate active distinction is refused", duplicate.response.status === 409);

const revoked = await request(`/api/admin/leadership/distinctions/${encodeURIComponent(distinctionId)}/revoke`, {
  method: "POST",
  headers: { Cookie: `tpi_session=${cookie}` },
});
check("admin can revoke the local test distinction", revoked.response.status === 200 && revoked.body?.status === "revoked");

const afterRevoke = await request("/api/contributors/profile?username=local_member");
check("revoked distinction is absent from public profile", afterRevoke.response.status === 200 && !(afterRevoke.body?.leadershipDistinctions || []).some(item => item.code === "gold"));

console.log(`TPI-GOVERNANCE-004 local integration: ${checks.length}/${checks.length} PASS`);
for (const name of checks) console.log(`PASS ${name}`);
