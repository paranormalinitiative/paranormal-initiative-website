#!/usr/bin/env node

// Local-only Board Member integration check. It uses the disposable local
// fixtures and revokes the temporary appointment before returning.
import { existsSync, readFileSync } from "node:fs";

const base = process.env.TPI_LOCAL_ORIGIN || "http://127.0.0.1:8787";
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) throw new Error("Board Member local verification requires the approved loopback Worker");
if (!existsSync(".local-dev/local-auth-credentials.json")) throw new Error("local authentication fixtures are missing");
const credentials = JSON.parse(readFileSync(".local-dev/local-auth-credentials.json", "utf8"));
const checks = [];
const check = (name, pass) => { if (!pass) throw new Error(`${name} failed`); checks.push(name); };
async function request(path, options = {}) {
  const response = await fetch(`${base}${path}`, { redirect: "manual", ...options, headers: { ...(options.headers || {}) } });
  const text = await response.text();
  let body = null; try { body = JSON.parse(text); } catch { /* non-JSON response */ }
  return { response, body };
}
function sessionCookie(response) { return response.headers.get("set-cookie")?.match(/tpi_session=([^;]+)/)?.[1] || ""; }

const admin = credentials.accounts?.local_admin;
if (!admin?.username || !admin?.password) throw new Error("local administrator fixture is incomplete");
const login = await request("/api/auth/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username: admin.username, password: admin.password }) });
check("local administrator login", login.response.status === 200 && Boolean(login.body?.user));
const cookie = sessionCookie(login.response);
check("local administrator session cookie", Boolean(cookie));
check("anonymous Board Member access denied", (await request("/api/admin/board-members")).response.status === 403);

const headers = { Cookie: `tpi_session=${cookie}`, "Content-Type": "application/json" };
const existing = await request("/api/admin/board-members", { headers });
check("Board Member registry loads", existing.response.status === 200 && Array.isArray(existing.body?.boardMembers));
if ((existing.body?.boardMembers || []).some(row => row.username === "local_member")) throw new Error("local_member already has an active Board Member appointment; refusing to overwrite fixture state");

const assigned = await request("/api/admin/board-members", { method: "POST", headers, body: JSON.stringify({ username: "local_member", positionTitle: "Disposable Board Member", notes: "TPI-GOVERNANCE-005 local-only test" }) });
check("admin can appoint an existing member", assigned.response.status === 201 && assigned.body?.boardMember?.username === "local_member");
const id = assigned.body?.boardMember?.id;
check("appointment returns a stable id and badge", typeof id === "string" && id.length > 10 && assigned.body.boardMember.badgePath.endsWith("board-member-256.png"));

const profile = await request("/api/contributors/profile?username=local_member");
check("public profile exposes Board Member badge", profile.response.status === 200 && profile.body?.boardMembership?.status === "active");
const duplicate = await request("/api/admin/board-members", { method: "POST", headers, body: JSON.stringify({ username: "local_member" }) });
check("duplicate active appointment is refused", duplicate.response.status === 409);
const revoked = await request(`/api/admin/board-members/${encodeURIComponent(id)}/revoke`, { method: "POST", headers: { Cookie: `tpi_session=${cookie}` } });
check("admin can revoke the local test appointment", revoked.response.status === 200 && revoked.body?.status === "revoked");
const after = await request("/api/contributors/profile?username=local_member");
check("revoked appointment is absent from public profile", after.response.status === 200 && !after.body?.boardMembership);

console.log(`TPI-GOVERNANCE-005 local integration: ${checks.length}/${checks.length} PASS`);
for (const name of checks) console.log(`PASS ${name}`);
