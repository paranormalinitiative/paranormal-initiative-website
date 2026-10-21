#!/usr/bin/env node

// TPI-STUDIOFLOW-052: disposable-browser evidence for the StudioFlow
// fresh-session flicker investigation. This script is local-only. It never
// prints credentials, never clears persistent browser data, and actively
// blocks StudioFlow mutation requests so a fresh context cannot autosave an
// owner workspace while the page is initializing.
import { createRequire } from "node:module";
import { readFileSync, statSync } from "node:fs";

const base = (process.env.TPI_052_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "TPI-052 requires the approved local Worker origin" }));
  process.exit(0);
}

const credentialPath = process.env.TPI_052_CREDENTIALS_FILE || ".local-dev/local-auth-credentials.json";
const browserPath = process.env.TPI_052_CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const stabilityMs = Number(process.env.TPI_052_STABILITY_MS || 120_000);
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

const account = credentials.accounts?.local_admin;
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "local_admin synthetic identity is unavailable" }));
  process.exit(0);
}

let chromium;
try {
  const require = createRequire(import.meta.url);
  ({ chromium } = require(process.env.TPI_052_PLAYWRIGHT || "playwright"));
} catch (error) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `Playwright unavailable: ${safeError(error)}` }));
  process.exit(0);
}

const significant = value => !/blockedbyclient|ERR_BLOCKED_BY_CLIENT|favicon/i.test(value);
const makeTrace = label => ({
  label,
  consoleErrors: [],
  pageErrors: [],
  requests: [],
  responses: [],
  navigations: [],
  navigationRequests: [],
  blockedMutations: [],
  samples: []
});

function attachTrace(page, trace) {
  page.on("console", message => {
    if (message.type() === "error") trace.consoleErrors.push(message.text().replace(/https?:\/\/[^\s]+/g, "[url]"));
  });
  page.on("pageerror", error => trace.pageErrors.push(safeError(error)));
  page.on("request", request => {
    const url = new URL(request.url());
    if (url.protocol === "http:" && (url.hostname === "127.0.0.1" || url.hostname === "localhost")) {
      trace.requests.push({ at: Date.now(), method: request.method(), path: `${url.pathname}${url.search}` });
    }
  });
  page.on("response", response => {
    const url = new URL(response.url());
    if (url.protocol === "http:" && (url.hostname === "127.0.0.1" || url.hostname === "localhost")) {
      trace.responses.push({ at: Date.now(), status: response.status(), path: `${url.pathname}${url.search}` });
    }
  });
  page.on("framenavigated", frame => {
    if (frame === page.mainFrame()) trace.navigations.push({ at: Date.now(), url: frame.url() });
  });
}

async function sample(page, trace, label) {
  const state = await page.evaluate(() => ({
    url: window.location.href,
    title: document.title,
    body: (document.body?.innerText || "").slice(0, 240),
    readyState: document.readyState,
    hasStudioShell: Boolean(document.querySelector("[data-studio-root], #root, .studio-shell")),
    localStorageKeys: Object.keys(localStorage).sort(),
    indexedDbAvailable: "indexedDB" in window
  })).catch(error => ({ error: safeError(error) }));
  trace.samples.push({ at: Date.now(), label, ...state });
  return state;
}

async function localPage(browser, label) {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const trace = makeTrace(label);
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    const allowed = url.protocol === "http:" && (url.hostname === "127.0.0.1" || url.hostname === "localhost") && (url.port === "8787" || url.port === "8788");
    if (!allowed) return route.abort("blockedbyclient");
    const isWorkspaceMutation = url.port === "8787" && url.pathname.startsWith("/api/studio/workspaces") && !["GET", "HEAD", "OPTIONS"].includes(route.request().method());
    if (isWorkspaceMutation) {
      trace.blockedMutations.push({ at: Date.now(), method: route.request().method(), path: `${url.pathname}${url.search}` });
      return route.abort("blockedbyclient");
    }
    return route.continue();
  });
  const page = await context.newPage();
  attachTrace(page, trace);
  const cdp = await context.newCDPSession(page);
  await cdp.send("Network.enable");
  cdp.on("Network.requestWillBeSent", event => {
    if (event.type === "Document" && event.request.url.startsWith(base)) {
      trace.navigationRequests.push({ at: Date.now(), url: event.request.url, documentURL: event.documentURL, initiator: event.initiator?.type || "unknown", stack: event.initiator?.stack?.callFrames?.slice(0, 4) || [] });
    }
  });
  return { context, page, trace };
}

let browser;
try {
  browser = await chromium.launch({ executablePath: browserPath, headless: process.env.TPI_052_HEADLESS !== "0" });
} catch {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Chrome could not launch in this execution environment" }));
  process.exit(0);
}

const result = { status: "FAILED", freshUnauthenticated: null, authenticated: null, stability: null };
let contexts = [];
try {
  // Test A/B: an entirely new context must get a stable auth gate, not an app
  // initialization loop. This does not mutate browser or Studio data.
  const fresh = await localPage(browser, "fresh-unauthenticated");
  contexts.push(fresh.context);
  const response = await fresh.page.goto(`${base}/studio/`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await fresh.page.waitForTimeout(3_000);
  const state = await sample(fresh.page, fresh.trace, "after-3s");
  const authResponses = fresh.trace.responses.filter(item => item.path.startsWith("/api/auth/"));
  const authGate = response?.status() === 403 || /authentication|sign in|access/i.test(state.body || "");
  check("fresh unauthenticated StudioFlow is stable", fresh.trace.navigations.length <= 1 && authGate, `HTTP ${response?.status() ?? "unknown"}; navigations=${fresh.trace.navigations.length}`);
  check("fresh unauthenticated session does not loop auth requests", authResponses.length <= 2, `auth requests=${authResponses.length}`);
  result.freshUnauthenticated = { status: response?.status() ?? null, trace: fresh.trace };

  // Test C: authenticate through the real local login form in another fresh
  // context, then open StudioFlow without any prior StudioFlow browser state.
  const auth = await localPage(browser, "authenticated-local-admin");
  contexts.push(auth.context);
  const loginResponse = await auth.page.goto(`${base}/member-login.html`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  check("local login page renders", loginResponse?.status() === 200, `HTTP ${loginResponse?.status() ?? "unknown"}`);
  await auth.page.locator('form[data-member-login] input[name="username"]').fill(account.username);
  await auth.page.locator('form[data-member-login] input[name="password"]').fill(account.password);
  await auth.page.locator('form[data-member-login] button[type="submit"]').click();
  await auth.page.waitForTimeout(700);
  const session = await auth.page.evaluate(async () => {
    const response = await fetch("/api/auth/me", { credentials: "same-origin" });
    const body = await response.json().catch(() => null);
    return { status: response.status, authenticated: Boolean(body?.user), role: body?.user?.role || null };
  });
  check("local admin authentication succeeds", session.status === 200 && session.authenticated, `HTTP ${session.status}`);
  const bridgeMetadata = await auth.page.evaluate(async () => {
    const response = await fetch("/studio/workspace-bridge.js");
    const source = await response.text();
    const lines = source.split("\n");
    return {
      status: response.status,
      length: source.length,
      lines: lines.length,
      hasReloadCall: /location\\.(reload|assign|replace)|window\\.location/.test(source),
      locationLines: lines.map((line, index) => /location|reload|replace|assign/.test(line) ? { line: index + 1, text: line.slice(0, 220) } : null).filter(Boolean).slice(0, 8)
    };
  }).catch(error => ({ error: safeError(error) }));

  const studioResponse = await auth.page.goto(`${base}/studio/`, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await auth.page.waitForTimeout(5_000);
  const initial = await sample(auth.page, auth.trace, "authenticated-after-5s");
  const studioVisible = /StudioFlow|Home|Library|Destinations/i.test(initial.body || "") && studioResponse?.status() === 200;
  check("authenticated StudioFlow renders", studioVisible, `HTTP ${studioResponse?.status() ?? "unknown"}`);
  const firstNavigationCount = auth.trace.navigations.length;
  const firstAuthRequestCount = auth.trace.requests.filter(item => item.path.startsWith("/api/auth/")).length;
  const firstWorkspaceRequestCount = auth.trace.requests.filter(item => item.path.startsWith("/api/studio/workspaces")).length;

  // Test F/J: one explicit refresh, then measure the app without any writes.
  await auth.page.reload({ waitUntil: "domcontentloaded", timeout: 30_000 });
  await auth.page.waitForTimeout(2_000);
  const afterRefresh = await sample(auth.page, auth.trace, "after-refresh");
  check("StudioFlow survives a normal refresh", /StudioFlow|Home|Library|Destinations/i.test(afterRefresh.body || ""), `url=${afterRefresh.url}`);

  const stabilityStarted = Date.now();
  while (Date.now() - stabilityStarted < stabilityMs) {
    await auth.page.waitForTimeout(Math.min(5_000, stabilityMs - (Date.now() - stabilityStarted)));
    await sample(auth.page, auth.trace, "stability");
  }
  const postRefreshNavigations = auth.trace.navigations.length - firstNavigationCount - 1;
  const postRefreshAuthRequests = auth.trace.requests.filter(item => item.path.startsWith("/api/auth/")).length - firstAuthRequestCount;
  const postRefreshWorkspaceRequests = auth.trace.requests.filter(item => item.path.startsWith("/api/studio/workspaces")).length - firstWorkspaceRequestCount;
  const stableUrl = auth.trace.samples.slice(-1)[0]?.url === `${base}/studio/`;
  const noLoopErrors = [...auth.trace.consoleErrors, ...auth.trace.pageErrors].filter(significant);
  check("authenticated StudioFlow remains stable for the requested window", stableUrl && postRefreshNavigations <= 1 && noLoopErrors.length === 0, `navigations after initial=${postRefreshNavigations}; errors=${noLoopErrors.length}`);
  check("authenticated session has no repeated auth/workspace loop", postRefreshAuthRequests <= 3 && postRefreshWorkspaceRequests <= 3, `auth=${postRefreshAuthRequests}; workspaces=${postRefreshWorkspaceRequests}`);
  result.authenticated = { session, bridgeMetadata, trace: auth.trace };
  result.stability = { durationMs: Date.now() - stabilityStarted, navigationsAfterRefresh: postRefreshNavigations, authRequestsAfterRefresh: postRefreshAuthRequests, workspaceRequestsAfterRefresh: postRefreshWorkspaceRequests };
} catch (error) {
  check("fresh-browser diagnostic completed", false, safeError(error));
} finally {
  for (const context of contexts) await context.close().catch(() => {});
  await browser.close().catch(() => {});
}

result.checks = checks;
result.passed = checks.filter(item => item.ok).length;
result.failed = checks.filter(item => !item.ok).length;
result.status = result.failed ? "FAILED" : "PASS";
result.credentialsPrinted = false;
result.ownerBrowserDataTouched = false;
console.log(JSON.stringify(result, null, 2));
if (result.failed) process.exit(1);
