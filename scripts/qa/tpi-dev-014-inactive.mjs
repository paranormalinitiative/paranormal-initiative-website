import { readFileSync } from "node:fs";
const baseUrl = (process.env.TPI_DEV014_BASE_URL || "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev").replace(/\/$/, "");
const credentials = JSON.parse(readFileSync(process.env.TPI_DEV014_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-014/credentials.json", "utf8"));
const owner = credentials.accounts.find(account => account.username === "tpi-dev014-owner");
const rejected = credentials.accounts.find(account => account.username === "tpi-dev014-rejected");
async function request(path, options = {}, cookie = "") {
  const headers = new Headers(options.headers || {});
  if (options.body != null) headers.set("content-type", "application/json");
  if (cookie) headers.set("cookie", cookie);
  const response = await fetch(`${baseUrl}${path}`, { ...options, headers });
  return response;
}
const ownerLogin = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username: owner.username, password: owner.password }) });
const ownerCookie = (ownerLogin.headers.get("set-cookie") || "").split(";")[0];
const rejectedLogin = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ username: rejected.username, password: rejected.password }) });
const application = await request("/api/admin/founding-50/applications", { method: "POST", body: JSON.stringify({ accountUsername: rejected.username }) }, ownerCookie);
const passed = ownerLogin.status === 200 && rejectedLogin.status === 401 && application.status === 400;
console.log(`Inactive login denied: ${rejectedLogin.status === 401 ? "PASS" : "FAIL"}`);
console.log(`Inactive application association rejected: ${application.status === 400 ? "PASS" : "FAIL"}`);
console.log(JSON.stringify({ baseUrl, ownerLogin: ownerLogin.status, inactiveLogin: rejectedLogin.status, applicationAssociation: application.status }));
if (!passed) process.exit(1);
