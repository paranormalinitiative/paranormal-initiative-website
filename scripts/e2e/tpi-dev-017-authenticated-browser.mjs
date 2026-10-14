import { createRequire } from "node:module";
import { readFileSync, statSync } from "node:fs";

const baseUrl = (process.env.TPI_DEV017_BASE_URL || "https://theparanormalinitiative-dev.paranormalsomerset.workers.dev").replace(/\/$/, "");
const credentialPath = process.env.TPI_DEV017_CREDENTIALS_FILE || "/Users/toddknipple/.config/tpi/dev-014/credentials.json";
const browserPath = process.env.TPI_DEV017_CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const viewports = [
  [1280, 800], [1440, 900], [1920, 1080],
  [375, 812], [390, 844], [430, 932],
];
const expected = {
  "tpi-dev014-member": { role: "member", admin: false, studio: false },
  "tpi-dev014-contributor": { role: "contributor", admin: false, studio: false },
  "tpi-dev014-admin": { role: "admin", admin: true, studio: true },
  "tpi-dev014-owner": { role: "owner", admin: true, studio: true },
  "tpi-dev014-creator": { role: "member", admin: false, studio: false },
  "tpi-dev014-revoked": { role: "member", admin: false, studio: false },
};

const result = [];
const record = (check, passed, detail = "") => result.push({ check, passed, detail });
const safeError = (error) => error instanceof Error ? error.message.replace(/https?:\/\/[^\s]+/g, "[url]") : "browser check failed";

let credentials;
try {
  const mode = statSync(credentialPath).mode & 0o777;
  if (mode !== 0o600) throw new Error("credential file permissions must be 0600");
  credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
} catch (error) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `credential store unavailable: ${safeError(error)}` }));
  process.exit(0);
}

let chromium;
try {
  const require = createRequire(import.meta.url);
  ({ chromium } = require(process.env.TPI_DEV017_PLAYWRIGHT || "playwright"));
} catch (error) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `Playwright unavailable: ${safeError(error)}` }));
  process.exit(0);
}

const accounts = Object.fromEntries((credentials.accounts || []).map((account) => [account.username, account]));
const missing = Object.keys(expected).filter((username) => !accounts[username]);
if (missing.length) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `missing approved synthetic identities: ${missing.join(", ")}` }));
  process.exit(0);
}

async function apiJson(page, path, init = {}) {
  return page.evaluate(async ({ path, init }) => {
    const response = await fetch(path, { credentials: "same-origin", ...init });
    let body = null;
    try { body = await response.json(); } catch { body = null; }
    return { status: response.status, body };
  }, { path, init });
}

async function login(page, account) {
  await page.goto(`${baseUrl}/member-login`, { waitUntil: "domcontentloaded", timeout: 30000 });
  await page.locator('form[data-member-login] input[name="username"]').fill(account.username);
  await page.locator('form[data-member-login] input[name="password"]').fill(account.password);
  await page.locator('form[data-member-login] button[type="submit"]').click();
  await page.waitForTimeout(600);
  const session = await apiJson(page, "/api/auth/me");
  record(`${account.username} login`, session.status === 200 && session.body?.user?.username === account.username, `HTTP ${session.status}`);
  record(`${account.username} role`, session.body?.user?.role === expected[account.username].role, `role=${session.body?.user?.role || "missing"}`);
}

async function checkRoute(page, account, path, shouldAllow, label) {
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: "domcontentloaded", timeout: 30000 });
  const allowed = response?.status() === 200;
  record(`${account.username} ${label}`, allowed === shouldAllow, `HTTP ${response?.status() ?? "unknown"}`);
}

let browser;
try {
  browser = await chromium.launch({
    executablePath: browserPath,
    headless: process.env.TPI_DEV017_HEADLESS !== "0",
  });
} catch {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Chrome could not launch in this execution environment" }));
  process.exit(0);
}

try {
  for (const username of Object.keys(expected)) {
    const account = accounts[username];
    const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();
    try {
      await login(page, account);
      for (const [width, height] of viewports) {
        await page.setViewportSize({ width, height });
        await checkRoute(page, account, "/member-home", true, `${width}x${height} member home`);
        await checkRoute(page, account, "/admin-center-preview/", expected[username].admin, `${width}x${height} admin boundary`);
        await checkRoute(page, account, "/studio/", expected[username].studio, `${width}x${height} Studio boundary`);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
        record(`${account.username} ${width}x${height} no horizontal overflow`, !overflow, overflow ? "document wider than viewport" : "none");
      }
      const logout = await apiJson(page, "/api/auth/logout", { method: "POST" });
      record(`${account.username} logout`, logout.status === 200, `HTTP ${logout.status}`);
      const afterLogout = await apiJson(page, "/api/auth/me");
      record(`${account.username} session cleared`, afterLogout.status === 401, `HTTP ${afterLogout.status}`);
    } catch (error) {
      record(`${account.username} browser flow`, false, safeError(error));
    } finally {
      await context.close();
    }
  }
} finally {
  await browser.close();
}

const failed = result.filter((entry) => !entry.passed);
for (const entry of result) console.log(`${entry.passed ? "PASS" : "FAIL"} ${entry.check}${entry.detail ? ` — ${entry.detail}` : ""}`);
console.log(JSON.stringify({ status: failed.length ? "FAILED" : "PASSED", checks: result.length, passed: result.length - failed.length, failed: failed.length, baseUrl }));
if (failed.length) process.exit(1);
