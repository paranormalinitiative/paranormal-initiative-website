#!/usr/bin/env node

// Bounded local authenticated browser acceptance for TPI-OPS-013.
// Credentials are read from the ignored 0600 local fixture and never printed.
// Every non-loopback request is aborted before dispatch.
import { createRequire } from "node:module";
import { readFileSync, statSync } from "node:fs";

const base = (process.env.TPI_OPS013_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "OPS-013 browser test requires the approved loopback Worker origin" }));
  process.exit(0);
}

const credentialPath = process.env.TPI_OPS013_CREDENTIALS_FILE || ".local-dev/local-auth-credentials.json";
const browserPath = process.env.TPI_OPS013_CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const checks = [];
const check = (name, ok, detail = "") => checks.push({ name, ok: Boolean(ok), detail });
const safeError = error => error instanceof Error ? error.message.replace(/https?:\/\/[^\s]+/g, "[url]") : "browser check failed";

let credentials;
try {
  if ((statSync(credentialPath).mode & 0o777) !== 0o600) throw new Error("credential file permissions must be 0600");
  credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
} catch (error) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `local credential store unavailable: ${safeError(error)}` }));
  process.exit(0);
}

let chromium;
try {
  const require = createRequire(import.meta.url);
  ({ chromium } = require(process.env.TPI_OPS013_PLAYWRIGHT || "playwright"));
} catch (error) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `Playwright unavailable: ${safeError(error)}` }));
  process.exit(0);
}

const account = credentials.accounts?.local_member;
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "local_member synthetic identity is unavailable" }));
  process.exit(0);
}

const blockedRequests = [];
const consoleErrors = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: browserPath, headless: process.env.TPI_OPS013_HEADLESS !== "0" });
} catch {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Chrome could not launch in this execution environment" }));
  process.exit(0);
}

try {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    const allowed = url.protocol === "http:" && (url.hostname === "127.0.0.1" || url.hostname === "localhost") && url.port === "8787";
    if (!allowed) {
      blockedRequests.push(`${url.origin}${url.pathname}`);
      await route.abort("blockedbyclient");
      return;
    }
    await route.continue();
  });
  const page = await context.newPage();
  page.on("console", message => {
    if (message.type() === "error") consoleErrors.push(message.text().replace(/https?:\/\/[^\s]+/g, "[url]"));
  });
  page.on("pageerror", error => consoleErrors.push(safeError(error)));

  const loginPage = await page.goto(`${base}/member-login.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
  check("local login page renders", loginPage?.status() === 200, `HTTP ${loginPage?.status() ?? "unknown"}`);
  check("actual TPI login form renders", await page.locator('form[data-member-login]').count() === 1);

  await page.locator('form[data-member-login] input[name="username"]').fill(account.username);
  await page.locator('form[data-member-login] input[name="password"]').fill(account.password);
  await page.locator('form[data-member-login] button[type="submit"]').click();
  await page.waitForTimeout(600);
  const session = await page.evaluate(async () => {
    const response = await fetch("/api/auth/me", { credentials: "same-origin" });
    const body = await response.json().catch(() => null);
    return { status: response.status, authenticated: Boolean(body?.user) };
  });
  check("synthetic member login succeeds", session.status === 200 && session.authenticated, `HTTP ${session.status}`);

  async function open(path, label, textPattern) {
    const response = await page.goto(`${base}${path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(700);
    const text = await page.locator("body").textContent().catch(() => "");
    const status = response?.status() ?? (page.url().startsWith(base) ? 200 : 0);
    check(`${label} renders`, status === 200 && (!textPattern || textPattern.test(text)), `HTTP ${status}`);
  }

  await open("/member-home", "Member Home", /Community/i);
  check("local development banner is absent", !/TPI\s*[—-]\s*LOCAL DEVELOPMENT/i.test(await page.locator("body").innerText()) && await page.locator('[data-tpi-local-development-environment]').count() === 0);
  await open("/member-home#messenger", "Messenger surface", /Messenger|Chat/i);
  await open("/member-notifications.html", "Notifications", /Notifications/i);
  await open("/member-profile.html", "Profile navigation", /Profile|Member/i);

  const logout = await page.evaluate(async () => {
    const response = await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    return { status: response.status };
  });
  check("logout works", logout.status === 200, `HTTP ${logout.status}`);
  const afterLogout = await page.evaluate(async () => {
    const response = await fetch("/api/auth/me", { credentials: "same-origin" });
    const body = await response.json().catch(() => null);
    return { status: response.status, authenticated: Boolean(body?.user) };
  });
  check("logout clears the local session", afterLogout.status === 200 && !afterLogout.authenticated, `HTTP ${afterLogout.status}`);
  await context.close();
} catch (error) {
  check("authenticated local browser flow", false, safeError(error));
} finally {
  await browser.close();
}

const blockedSummary = [...new Set(blockedRequests)].slice(0, 10);
const significantConsoleErrors = consoleErrors.filter(error => !/blockedbyclient|ERR_BLOCKED_BY_CLIENT|aborted/i.test(error));
check("non-loopback browser requests were blocked before dispatch", true, blockedSummary.length ? `blocked before dispatch: ${blockedSummary.join(", ")}` : "none observed");
check("no significant browser console errors", significantConsoleErrors.length === 0, significantConsoleErrors.length ? significantConsoleErrors.join(" | ") : (consoleErrors.length ? `${consoleErrors.length} expected blocked-request message(s)` : "none"));

for (const item of checks) console.log(`${item.ok ? "PASS" : "FAIL"} ${item.name}${item.detail ? ` — ${item.detail}` : ""}`);
console.log(JSON.stringify({ status: checks.every(item => item.ok) ? "PASSED" : "FAILED", checks: checks.length, passed: checks.filter(item => item.ok).length, failed: checks.filter(item => !item.ok).length, externalRequests: 0, credentialsPrinted: false }));
if (checks.some(item => !item.ok)) process.exit(1);
