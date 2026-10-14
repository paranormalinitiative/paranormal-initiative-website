import { readFileSync } from "node:fs";

const baseUrl = (process.env.TPI_DEV014_BASE_URL || "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev").replace(/\/$/, "");
const credentialPath = process.env.TPI_DEV014_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-014/credentials.json";
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
const accounts = Object.fromEntries(credentials.accounts.map(account => [account.username, account]));
const results = [];
const record = (name, ok, detail = "") => results.push({ name, ok, detail });

async function request(path, options = {}, cookie = "") {
  const headers = new Headers(options.headers || {});
  if (options.body != null && !headers.has("content-type")) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers, redirect: "manual" });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text.slice(0, 160); }
  return { response, body };
}

async function login(username) {
  const account = accounts[username];
  const result = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username, password: account.password }) });
  return { ...result, cookie: (result.response.headers.get("set-cookie") || "").split(";")[0] };
}

function expectStatus(name, response, expected) {
  record(name, response.status === expected, `HTTP ${response.status}; expected ${expected}`);
}

const owner = await login("tpi-dev014-owner");
const creatorBefore = await login("tpi-dev014-creator");
const contenderBefore = await login("tpi-dev014-contender");
expectStatus("capacity owner login", owner.response, 200);
expectStatus("capacity creator login", creatorBefore.response, 200);
expectStatus("capacity contender login", contenderBefore.response, 200);

const before = await request("/api/admin/founding-50", {}, owner.cookie);
expectStatus("capacity summary at 49", before.response, 200);
record("49 allocations leave one slot", before.body?.allocated === 49 && before.body?.remaining === 1, `allocated=${before.body?.allocated}; remaining=${before.body?.remaining}`);

const payload = username => ({ method: "POST", body: JSON.stringify({ username, applicationId: username === "tpi-dev014-creator" ? process.env.TPI_DEV014_CREATOR_APPLICATION_ID : process.env.TPI_DEV014_CONTENDER_APPLICATION_ID, notes: "TPI-DEV-014 simultaneous final-slot allocation test." }) });
if (!process.env.TPI_DEV014_CREATOR_APPLICATION_ID || !process.env.TPI_DEV014_CONTENDER_APPLICATION_ID) throw new Error("Provide the two approved application IDs from the lifecycle test.");
const [creatorAllocation, contenderAllocation] = await Promise.all([
  request("/api/admin/founding-50/allocate", payload("tpi-dev014-creator"), owner.cookie),
  request("/api/admin/founding-50/allocate", payload("tpi-dev014-contender"), owner.cookie)
]);
const outcomes = [creatorAllocation, contenderAllocation];
const successes = outcomes.filter(result => result.response.status === 201);
const conflicts = outcomes.filter(result => result.response.status === 409);
record("simultaneous final-slot allocation has one winner", successes.length === 1 && conflicts.length === 1, `successes=${successes.length}; conflicts=${conflicts.length}`);
const winner = creatorAllocation.response.status === 201 ? "tpi-dev014-creator" : contenderAllocation.response.status === 201 ? "tpi-dev014-contender" : null;
const loser = winner === "tpi-dev014-creator" ? "tpi-dev014-contender" : winner === "tpi-dev014-contender" ? "tpi-dev014-creator" : null;
record("winning account is identified", Boolean(winner));

const after = await request("/api/admin/founding-50", {}, owner.cookie);
expectStatus("capacity summary at 50", after.response, 200);
record("50 allocations leave zero slots", after.body?.allocated === 50 && after.body?.remaining === 0, `allocated=${after.body?.allocated}; remaining=${after.body?.remaining}`);

if (winner && loser) {
  const winnerDuplicate = await request("/api/admin/founding-50/allocate", payload(winner), owner.cookie);
  expectStatus("duplicate winner allocation rejected", winnerDuplicate.response, 409);
  const loserAttempt = await request("/api/admin/founding-50/allocate", payload(loser), owner.cookie);
  expectStatus("approved loser cannot become 51st allocation", loserAttempt.response, 409);
  const winnerSession = await login(winner);
  const loserSession = await login(loser);
  const winnerStudio = await request("/studio/", {}, winnerSession.cookie);
  const loserStudio = await request("/studio/", {}, loserSession.cookie);
  expectStatus("winning synthetic creator has Studio access", winnerStudio.response, 200);
  expectStatus("losing synthetic creator remains without Studio access", loserStudio.response, 403);

  const revoke = await request(`/api/admin/founding-50/memberships/${encodeURIComponent(successes[0].body?.membership?.id)}/status`, {
    method: "POST", body: JSON.stringify({ status: "revoked", notes: "Synthetic capacity winner cleanup state." })
  }, owner.cookie);
  expectStatus("capacity winner revocation preserves history", revoke.response, 200);
  const revokedStudio = await request("/studio/", {}, winnerSession.cookie);
  expectStatus("capacity winner loses Studio after revocation", revokedStudio.response, 403);
}

for (const result of results) console.log(`${result.ok ? "PASS" : "FAIL"} ${result.name}${result.detail ? ` — ${result.detail}` : ""}`);
const failed = results.filter(result => !result.ok);
console.log(JSON.stringify({ baseUrl, checks: results.length, passed: results.length - failed.length, failed: failed.length, winner, loser }));
if (failed.length) process.exit(1);
