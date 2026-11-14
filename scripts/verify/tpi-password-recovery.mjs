import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { passwordResetEmail } from "../../lib/email.js";
import { onRequest } from "../../functions/api/[[path]].js";

const root = resolve(import.meta.dirname, "../..");
const api = readFileSync(resolve(root, "functions/api/[[path]].js"), "utf8");
const login = readFileSync(resolve(root, "member-login.html"), "utf8");
const footer = readFileSync(resolve(root, "footer.html"), "utf8");

const checks = [
  ["password reset request sends through the configured email helper", api.includes("sendEmail(env") && api.includes("passwordResetEmail(token)")],
  ["password reset uses a short-lived numeric code", api.includes("randomCode()") && api.includes("1000 * 60 * 30")],
  ["password reset confirmation route is registered", api.includes('path === "/auth/password-reset/confirm"')],
  ["confirmation rejects used or expired codes", api.includes("prt.used = 0") && api.includes("prt.expires_at > CURRENT_TIMESTAMP")],
  ["confirmation invalidates existing sessions", api.includes("DELETE FROM sessions WHERE contributor_id = ?")],
  ["login card is labeled for members", login.includes("<h2>Member Login</h2>") && !login.includes("<h2>Contributor Access</h2>")],
  ["footer link is labeled Member Login", footer.includes('href="member-login.html">Member Login</a>') && !footer.includes("Contributor Login")],
  ["reset email has the expected subject", passwordResetEmail("12345678").subject === "Reset your password — The Paranormal Initiative"],
];

const resetUser = { id: "reset-user", username: "Todd_Wayne", correspondence: "todd@example.com", active: 1 };
let issuedCode = "";
const batchStatements = [];
const mockDb = {
  prepare(sql) {
    return {
      bind(...args) {
        return {
          async first() {
            if (sql.includes("lower(correspondence)")) return resetUser;
            if (sql.includes("FROM password_reset_tokens")) {
              return args[0] === issuedCode ? { token: issuedCode, contributorId: resetUser.id } : null;
            }
            return null;
          },
          async run() {
            if (sql.includes("INSERT INTO password_reset_tokens")) issuedCode = args[0];
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
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }),
  env: { TPI_DB: mockDb, TPI_DISABLE_OUTBOUND: "1" },
  params: { path: path.slice(1).split("/") },
});

const requestResponse = await onRequest(requestContext("/auth/password-reset/request", { email: resetUser.correspondence }));
const requestBody = await requestResponse.json();
checks.push(["reset request returns a generic success response", requestResponse.status === 200 && requestBody.ok === true && issuedCode.length === 8]);

const confirmResponse = await onRequest(requestContext("/auth/password-reset/confirm", { code: issuedCode, password: "new-password-123" }));
const confirmBody = await confirmResponse.json();
checks.push(["reset confirmation updates the password and clears sessions", confirmResponse.status === 200 && confirmBody.ok === true && batchStatements.length === 3]);

const invalidResponse = await onRequest(requestContext("/auth/password-reset/confirm", { code: "00000000", password: "new-password-123" }));
checks.push(["invalid reset codes are rejected", invalidResponse.status === 400]);

for (const [label, passed] of checks) {
  if (!passed) throw new Error(`FAIL: ${label}`);
  console.log(`PASS: ${label}`);
}
console.log(`Password recovery checks: ${checks.length}/${checks.length} passed`);
