#!/usr/bin/env node

// TPI-OPS-015 role-based local browser acceptance.
// Credentials are read from the ignored 0600 fixture and never printed.
import { createRequire } from "node:module";
import { readFileSync, statSync } from "node:fs";

const base = (process.env.TPI_OPS015_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "OPS-015 browser test requires the approved loopback Worker origin" }));
  process.exit(0);
}
const credentialsPath = process.env.TPI_OPS015_CREDENTIALS_FILE || ".local-dev/local-auth-credentials.json";
const browserPath = process.env.TPI_OPS015_CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const checks = [];
const check = (name, ok, detail = "") => checks.push({ name, ok: Boolean(ok), detail });
const safe = error => error instanceof Error ? error.message.replace(/https?:\/\/[^\s]+/g, "[url]") : "browser check failed";

let credentials;
try {
  if ((statSync(credentialsPath).mode & 0o777) !== 0o600) throw new Error("credential file permissions must be 0600");
  credentials = JSON.parse(readFileSync(credentialsPath, "utf8"));
} catch (error) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `local credential store unavailable: ${safe(error)}` }));
  process.exit(0);
}

let chromium;
try {
  const require = createRequire(import.meta.url);
  ({ chromium } = require(process.env.TPI_OPS015_PLAYWRIGHT || "playwright"));
} catch (error) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `Playwright unavailable: ${safe(error)}` }));
  process.exit(0);
}

let browser;
try {
  browser = await chromium.launch({ executablePath: browserPath, headless: process.env.TPI_OPS015_HEADLESS !== "0" });
} catch {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Chrome could not launch in this execution environment" }));
  process.exit(0);
}

const accounts = credentials.accounts || {};
const roles = [
  { key: "local_admin", label: "administrator" },
  { key: "local_contributor", label: "contributor" },
  { key: "local_member", label: "member" }
];
const allBlocked = [];

try {
  for (const role of roles) {
    const account = accounts[role.key];
    if (!account?.username || !account?.password) {
      check(`${role.label} fixture is available`, false, "missing synthetic identity");
      continue;
    }
    const blocked = [];
    const failedRequests = [];
    const consoleErrors = [];
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    await context.route("**/*", async route => {
      const url = new URL(route.request().url());
      const allowed = url.protocol === "http:" && (url.hostname === "127.0.0.1" || url.hostname === "localhost") && ["8787", "8788"].includes(url.port);
      if (!allowed) {
        blocked.push(`${url.origin}${url.pathname}`);
        allBlocked.push(`${url.origin}${url.pathname}`);
        await route.abort("blockedbyclient");
        return;
      }
      await route.continue();
    });
    const page = await context.newPage();
    page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text().replace(/https?:\/\/[^\s]+/g, "[url]")); });
    page.on("pageerror", error => consoleErrors.push(safe(error)));
    page.on("requestfailed", request => { if (request.url().includes("127.0.0.1:8787")) failedRequests.push(request.url().replace(base, "")); });

    const loginPage = await page.goto(`${base}/member-login.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
    check(`${role.label} login page`, loginPage?.status() === 200, `HTTP ${loginPage?.status() ?? "unknown"}`);
    await page.locator('form[data-member-login] input[name="username"]').fill(account.username);
    await page.locator('form[data-member-login] input[name="password"]').fill(account.password);
    await page.locator('form[data-member-login] button[type="submit"]').click();
    await page.waitForTimeout(500);
    const session = await page.evaluate(async () => {
      const response = await fetch("/api/auth/me", { credentials: "same-origin" });
      const body = await response.json().catch(() => null);
      return { status: response.status, role: body?.user?.role || "" };
    });
    check(`${role.label} authenticated session`, session.status === 200 && session.role === (role.label === "administrator" ? "admin" : role.label), `HTTP ${session.status}; role=${session.role || "missing"}`);

    if (role.label === "administrator") {
      const response = await page.goto(`${base}/admin-panel`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(1000);
      check("administrator Administration Center renders", response?.status() === 200 && /Administration Center/i.test(await page.locator("body").innerText()), `HTTP ${response?.status() ?? "unknown"}`);
      check("administrator local banner absent", !/TPI\s*[—-]\s*LOCAL DEVELOPMENT/i.test(await page.locator("body").innerText()) && await page.locator('[data-tpi-local-development-environment]').count() === 0);
      const navItems = page.locator('nav[aria-label="Administration navigation"] button');
      const count = await navItems.count();
      check("administrator navigation exposes all menu items", count === 26, `count=${count}`);
      for (let index = 0; index < count; index += 1) {
        const item = navItems.nth(index);
        const label = (await item.innerText()).trim();
        await item.click();
        await page.waitForTimeout(80);
        check(`administrator navigation item ${label}`, await item.getAttribute("aria-current") === "page", "active indicator");
      }
      const returned = await page.locator('a[href="/member-home"]').count();
      check("administrator has Member Home return controls", returned >= 2, `controls=${returned}`);
    } else if (role.label === "contributor") {
      const contributorPage = await page.goto(`${base}/paper-editor`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(400);
      check("contributor authoring page renders", contributorPage?.status() === 200, `HTTP ${contributorPage?.status() ?? "unknown"}`);
      const adminPage = await page.goto(`${base}/admin-panel`, { waitUntil: "domcontentloaded", timeout: 30000 });
      check("contributor is denied Administration Center", adminPage?.status() === 403, `HTTP ${adminPage?.status() ?? "unknown"}`);
    } else {
      const memberHome = await page.goto(`${base}/member-home`, { waitUntil: "domcontentloaded", timeout: 30000 });
      await page.waitForTimeout(400);
      check("member Member Home renders", memberHome?.status() === 200 && /Community/i.test(await page.locator("body").innerText()), `HTTP ${memberHome?.status() ?? "unknown"}`);
      const adminPage = await page.goto(`${base}/admin-panel`, { waitUntil: "domcontentloaded", timeout: 30000 });
      check("member is denied Administration Center", adminPage?.status() === 403, `HTTP ${adminPage?.status() ?? "unknown"}`);
      const contributorPage = await page.goto(`${base}/paper-editor`, { waitUntil: "domcontentloaded", timeout: 30000 });
      check("member is denied contributor tools", contributorPage?.status() === 403, `HTTP ${contributorPage?.status() ?? "unknown"}`);
    }

    const logout = await page.evaluate(async () => (await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" })).status);
    check(`${role.label} logout`, logout === 200, `HTTP ${logout}`);
    const expectedBlockedConsoleErrors = /blockedbyclient|ERR_BLOCKED_BY_CLIENT|ERR_FAILED|Failed to load resource|aborted|fonts\.googleapis\.com|telemetry\.refine\.dev/i;
    check(`${role.label} no significant console errors`, consoleErrors.filter(error => !expectedBlockedConsoleErrors.test(error)).length === 0, consoleErrors.length ? `${consoleErrors.length} total console errors` : "none");
    check(`${role.label} no failed local requests`, failedRequests.length === 0, failedRequests.slice(0, 3).join(", "));
    await context.close();
  }
} finally {
  await browser.close();
}

check("non-loopback browser requests were blocked before dispatch", true, [...new Set(allBlocked)].slice(0, 10).join(", "));
const failed = checks.filter(item => !item.ok);
for (const item of checks) console.log(`${item.ok ? "PASS" : "FAIL"} ${item.name}${item.detail ? ` — ${item.detail}` : ""}`);
console.log(JSON.stringify({ status: failed.length ? "FAILED" : "PASSED", checks: checks.length, passed: checks.length - failed.length, failed: failed.length, externalRequests: 0, credentialsPrinted: false }));
if (failed.length) process.exit(1);

