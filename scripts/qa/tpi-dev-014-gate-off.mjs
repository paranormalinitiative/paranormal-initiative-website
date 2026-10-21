import { readFileSync } from "node:fs";
import { createRequestBudget } from "./request-budget.mjs";

const baseUrl = (process.env.TPI_DEV014_BASE_URL || "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev").replace(/\/$/, "");
const requestBudget = createRequestBudget({ baseUrl, label: "TPI-DEV-014 activation-gate QA" });
const credentialPath = process.env.TPI_DEV014_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-014/credentials.json";
const credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
const owner = credentials.accounts.find(account => account.username === "tpi-dev014-owner");
if (!owner) throw new Error("Synthetic owner credential is missing.");
const hash = value => value;
async function request(path, options = {}, cookie = "") {
  const headers = new Headers(options.headers || {});
  if (options.body != null) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  const response = await requestBudget.fetch(`${baseUrl}${path}`, { ...options, headers, redirect: "manual" });
  const text = await response.text();
  let body = null;
  try { body = text ? JSON.parse(text) : null; } catch { body = text; }
  return { response, body };
}
const login = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username: owner.username, password: hash(owner.password) }) });
const cookie = (login.response.headers.get("set-cookie") || "").split(";")[0];
if (login.response.status !== 200) throw new Error(`Owner login failed with HTTP ${login.response.status}.`);
const before = await request("/api/admin/founding-50", {}, cookie);
const allocation = await request("/api/admin/founding-50/allocate", { method: "POST", body: JSON.stringify({ username: "tpi-dev014-contender", applicationId: process.env.TPI_DEV014_CONTENDER_APPLICATION_ID || "3f905a80-5194-4b56-9249-cd2537d975a0" }) }, cookie);
const status = await request("/api/admin/founding-50/memberships/fb963bcb-5bb4-4dac-8769-c1c77935f5b5/status", { method: "POST", body: JSON.stringify({ status: "active" }) }, cookie);
const after = await request("/api/admin/founding-50", {}, cookie);
const passed = before.response.status === 200 && allocation.response.status === 423 && status.response.status === 423 && after.response.status === 200 && before.body?.allocated === after.body?.allocated && before.body?.remaining === after.body?.remaining;
console.log(`Gate-off allocation: ${allocation.response.status === 423 ? "PASS" : "FAIL"} (expected 423)`);
console.log(`Gate-off status transition: ${status.response.status === 423 ? "PASS" : "FAIL"} (expected 423)`);
console.log(`Gate-off state unchanged: ${before.body?.allocated === after.body?.allocated && before.body?.remaining === after.body?.remaining ? "PASS" : "FAIL"}`);
console.log(JSON.stringify({ baseUrl, activationGate: "disabled", allocationStatus: allocation.response.status, statusTransition: status.response.status, allocated: after.body?.allocated, remaining: after.body?.remaining }));
if (!passed) process.exit(1);
