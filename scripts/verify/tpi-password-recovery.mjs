import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { DatabaseSync } from "node:sqlite";
import { passwordResetEmail } from "../../lib/email.js";
import { SESSION_COOKIE } from "../../lib/auth.js";
import { onRequest } from "../../functions/api/[[path]].js";

const root = resolve(import.meta.dirname, "../..");
const api = readFileSync(resolve(root, "functions/api/[[path]].js"), "utf8");
const auth = readFileSync(resolve(root, "lib/auth.js"), "utf8");
const login = readFileSync(resolve(root, "member-login.html"), "utf8");
const footer = readFileSync(resolve(root, "footer.html"), "utf8");

const checks = [
  ["password reset request sends through the configured email helper", api.includes("sendEmail(env") && api.includes("passwordResetEmail(token)")],
  ["password reset uses a short-lived numeric code", api.includes("randomCode()") && api.includes("1000 * 60 * 30")],
  ["password reset confirmation route is registered", api.includes('path === "/auth/password-reset/confirm"')],
  ["confirmation atomically consumes an unexpired active code", api.includes("UPDATE password_reset_tokens SET used = 1") && api.includes("used = 0 AND datetime(expires_at) > CURRENT_TIMESTAMP") && api.includes("RETURNING contributor_id AS contributorId")],
  ["confirmation invalidates existing sessions", api.includes("DELETE FROM sessions WHERE contributor_id = ?")],
  ["session expiration compares normalized timestamps", auth.includes("datetime(s.expires_at) > CURRENT_TIMESTAMP")],
  ["login card is labeled for members", login.includes("<h2>Member Login</h2>") && !login.includes("<h2>Contributor Access</h2>")],
  ["footer link is labeled Member Login", footer.includes('href="member-login.html">Member Login</a>') && !footer.includes("Contributor Login")],
  ["password recovery has separate request and always available confirmation forms", login.includes('<form data-password-reset-request>') && login.includes('<form data-password-reset-confirm>') && login.includes('<button type="submit">Save New Password</button>')],
  ["reset email has the expected subject", passwordResetEmail("12345678").subject === "Reset your password — The Paranormal Initiative"],
];

const clockDb = new DatabaseSync(":memory:");
const expiryQuery = clockDb.prepare("SELECT datetime(?) > CURRENT_TIMESTAMP AS valid");
const expiredCodeTime = new Date(Date.now() - 60_000).toISOString();
const validCodeTime = new Date(Date.now() + 30 * 60_000).toISOString();
checks.push(["expired ISO code is rejected on the same UTC day", expiryQuery.get(expiredCodeTime).valid === 0]);
checks.push(["unexpired ISO code remains valid", expiryQuery.get(validCodeTime).valid === 1]);
clockDb.exec("CREATE TABLE contributors (id TEXT PRIMARY KEY, active INTEGER); CREATE TABLE password_reset_tokens (token TEXT PRIMARY KEY, contributor_id TEXT, expires_at TEXT, used INTEGER DEFAULT 0); INSERT INTO contributors VALUES ('reset-user', 1)");
clockDb.prepare("INSERT INTO password_reset_tokens (token, contributor_id, expires_at) VALUES (?, ?, ?)").run("12345678", "reset-user", validCodeTime);
const claim = clockDb.prepare("UPDATE password_reset_tokens SET used = 1 WHERE token = ? AND used = 0 AND datetime(expires_at) > CURRENT_TIMESTAMP AND EXISTS (SELECT 1 FROM contributors c WHERE c.id = contributor_id AND c.active = 1) RETURNING contributor_id AS contributorId");
checks.push(["valid code can be claimed only once", claim.get("12345678")?.contributorId === "reset-user" && claim.get("12345678") === undefined]);
clockDb.close();

const resetUser = { id: "reset-user", username: "Todd_Wayne", correspondence: "todd@example.com", active: 1 };
let issuedCode = "";
let codeUsed = false;
let rateAllowed = true;
let recentCount = 0;
let insertedTokens = 0;
const rateCalls = [];
const batchStatements = [];
const mockDb = {
  prepare(sql) {
    return {
      bind(...args) {
        return {
          sql,
          args,
          async first() {
            if (sql.includes("lower(correspondence)")) return resetUser;
            if (sql.includes("SELECT COUNT(*) AS count FROM password_reset_tokens")) return { count: recentCount };
            if (sql.includes("UPDATE password_reset_tokens SET used = 1")) {
              if (args[0] !== issuedCode || codeUsed) return null;
              codeUsed = true;
              return { contributorId: resetUser.id };
            }
            return null;
          },
          async run() {
            if (sql.includes("INSERT INTO password_reset_tokens")) { issuedCode = args[0]; codeUsed = false; insertedTokens += 1; }
            return { success: true };
          },
        };
      },
    };
  },
  async batch(statements) {
    batchStatements.push(...statements);
    return { success: true };
  },
};

const requestContext = (path, body) => ({
  request: new Request(`http://127.0.0.1:8787/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": "203.0.113.12" },
    body: JSON.stringify(body),
  }),
  env: { TPI_DB: mockDb, TPI_DISABLE_OUTBOUND: "1", TPI_AUTH_RATE_LIMITER: { async limit({ key }) { rateCalls.push(key); return { success: rateAllowed }; } } },
  params: { path: path.slice(1).split("/") },
});

const requestResponse = await onRequest(requestContext("/auth/password-reset/request", { email: resetUser.correspondence }));
const requestBody = await requestResponse.json();
checks.push(["reset request returns a generic success response", requestResponse.status === 200 && requestBody.ok === true && issuedCode.length === 8]);
rateAllowed = false;
const limitedRequest = await onRequest(requestContext("/auth/password-reset/request", { email: resetUser.correspondence }));
checks.push(["request throttling is generic and does not mint another code", limitedRequest.status === 200 && (await limitedRequest.json()).ok === true && issuedCode.length === 8]);
rateAllowed = true;
recentCount = 6;
const hourlyLimitedRequest = await onRequest(requestContext("/auth/password-reset/request", { email: resetUser.correspondence }));
checks.push(["hourly account cap prevents email floods", hourlyLimitedRequest.status === 200 && insertedTokens === 1]);
recentCount = 0;
const missingLimiterContext = requestContext("/auth/password-reset/request", { email: resetUser.correspondence });
delete missingLimiterContext.env.TPI_AUTH_RATE_LIMITER;
const missingLimiterResponse = await onRequest(missingLimiterContext);
checks.push(["hosted recovery fails closed without rate protection", missingLimiterResponse.status === 503]);

const confirmResponse = await onRequest(requestContext("/auth/password-reset/confirm", { code: issuedCode, password: "new-password-123" }));
const confirmBody = await confirmResponse.json();
checks.push(["reset confirmation updates the password and clears old sessions", confirmResponse.status === 200 && confirmBody.ok === true && batchStatements[1]?.sql === "DELETE FROM sessions WHERE contributor_id = ?"]);
checks.push(["reset confirmation signs in with a fresh session cookie", confirmBody.signedIn === true && batchStatements.length === 3 && batchStatements[2]?.sql.startsWith("INSERT INTO sessions") && confirmResponse.headers.get("set-cookie")?.startsWith(`${SESSION_COOKIE}=${batchStatements[2].args[0]};`)]);

const reusedResponse = await onRequest(requestContext("/auth/password-reset/confirm", { code: issuedCode, password: "new-password-123" }));
checks.push(["consumed reset code cannot be reused", reusedResponse.status === 400]);

const invalidResponse = await onRequest(requestContext("/auth/password-reset/confirm", { code: "00000000", password: "new-password-123" }));
checks.push(["invalid reset codes are rejected", invalidResponse.status === 400]);
rateAllowed = false;
const limitedConfirm = await onRequest(requestContext("/auth/password-reset/confirm", { code: "00000000", password: "new-password-123" }));
checks.push(["confirmation attempts are throttled", limitedConfirm.status === 429]);
checks.push(["rate limiter checks both request dimensions and confirmation", rateCalls.length >= 5]);

for (const [label, passed] of checks) {
  if (!passed) throw new Error(`FAIL: ${label}`);
  console.log(`PASS: ${label}`);
}
console.log(`Password recovery checks: ${checks.length}/${checks.length} passed`);
