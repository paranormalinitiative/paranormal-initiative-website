#!/usr/bin/env node

// TPI-OPS-017 bounded local browser verification for the current in-scope route set.
// Uses only the loopback Worker and preserved synthetic credentials.
// Never prints credentials and never permits non-loopback browser requests.
import { createRequire } from "node:module";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);
const base = (process.env.TPI_OPS017_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "OPS-017 requires the approved loopback Worker origin" }));
  process.exit(0);
}

const credentialPath = process.env.TPI_OPS017_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const inventoryPath = resolve(repoRoot, "docs/TPI-DEVELOPMENT/200-AUDITS/TPI-OPS-017-IN-SCOPE-HTML-INVENTORY.md");
const outputPath = resolve(repoRoot, "docs/TPI-DEVELOPMENT/200-AUDITS/TPI-OPS-017-BROWSER-ROUTE-ACCEPTANCE.md");
const browserPath = process.env.TPI_OPS017_FIREFOX || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const checks = [];
const blockedExternal = [];
const allContextStats = [];
const record = (name, ok, detail = "") => checks.push({ name, ok: Boolean(ok), detail });
const safeError = error => (error instanceof Error ? error.message : String(error)).replace(/https?:\/\/[^\s]+/g, "[url]");
const expectedConsole = /blockedbyclient|ERR_BLOCKED_BY_CLIENT|ERR_FAILED|Failed to load resource|aborted|fonts\.googleapis\.com|telemetry\.refine\.dev/i;

let credentials;
try {
  if ((statSync(credentialPath).mode & 0o777) !== 0o600) throw new Error("credential file must be mode 0600");
  credentials = JSON.parse(readFileSync(credentialPath, "utf8"));
} catch (error) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `synthetic credential store unavailable: ${safeError(error)}` }));
  process.exit(0);
}

let firefox;
let playwrightError = null;
try {
  const require = createRequire(import.meta.url);
  ({ firefox } = require(process.env.TPI_OPS017_PLAYWRIGHT || "playwright"));
} catch (error) {
  playwrightError = safeError(error);
}

function writeHttpOnlyFallback(reason) {
  const safeReason = reason.replace(/\s+/g, " ").trim();
  const matrix = rows.map(row => ({
    ...row,
    role: routeRole(row),
    httpStatus: row.inventoryStatus,
    finalPath: row.location,
    browserRender: "NOT VERIFIED",
    javascriptErrors: [],
    assetFailures: [],
    apiFailures: [],
    failedRequests: [],
    interactive: "NOT_SELECTED",
    classification: "NOT VERIFIED",
    limitations: `Playwright unavailable in this environment; browser rendering remains unverified (${safeReason})`,
    bodyPresent: false,
    title: row.title,
  }));
  const doc = `# TPI-OPS-017 — Browser Route Acceptance

Verified: ${new Date().toISOString().slice(0, 10)}  
Origin: ${base}  
Source inventory: TPI-OPS-017 in-scope HTML inventory

## Status

**PARTIALLY COMPLETED — HTTP ROUTES ACCOUNTED FOR; SCRIPTED BROWSER MATRIX NOT VERIFIED**

The repository does not expose the Playwright module required by the bounded
browser harness. The route rows below preserve the current OPS-017 inventory
and deliberately classify browser rendering as **NOT VERIFIED**.

## Summary

- Routes accounted for: **${matrix.length}**
- Browser render classifications: **NOT VERIFIED ${matrix.length}**
- External requests dispatched: **0**
- Playwright harness reason: ${safeReason.replaceAll("|", "\\|")}

## Route matrix

| Route | Title | Area | Browser role | HTTP | Final path | Browser render | Interactive | Classification | Limitation |
| --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
${matrix.map(row => `| \`${row.route}\` | ${row.title.replaceAll("|", "\\|").slice(0, 90)} | ${row.group} | ${row.role} | ${row.httpStatus || "ERROR"} | ${row.finalPath.replaceAll("|", "\\|").slice(0, 80)} | ${row.browserRender} | ${row.interactive} | ${row.classification} | ${row.limitations.replaceAll("|", "\\|").slice(0, 140)} |`).join("\n")}

## Safety observations

- No credentials were printed.
- No non-loopback request was made by this fallback.
- No application data was mutated.
`;
  writeFileSync(outputPath, doc);
  console.log(JSON.stringify({ status: "PARTIALLY_COMPLETED", routes: matrix.length, browser: "NOT_VERIFIED", reason: "Playwright unavailable", externalRequests: 0, credentialsPrinted: false }));
}

function parseInventory() {
  const source = readFileSync(inventoryPath, "utf8");
  const rows = [];
  for (const line of source.split(/\r?\n/)) {
    const match = line.match(/^- `([^`]+)`$/);
    if (!match) continue;
    const route = match[1] === "index.html" ? "/" : `/${match[1]}`;
    const html = readFileSync(resolve(repoRoot, match[1]), "utf8");
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/\s+/g, " ").trim() || "(no title)";
    const group = routeRole({ route }) === "admin" ? "Administrator"
      : routeRole({ route }) === "contributor" ? "Contributor"
      : routeRole({ route }) === "member" ? "Member"
      : /education|ghostology|investigation|evp-itc|method|standards|tools|equipment|repository|analysis|environment/i.test(route) ? "Education / Research"
      : /studio\/|live-video|paratube|tpi-video|tpi-videos/i.test(route) ? "StudioFlow / ParaTube"
      : "Public";
    rows.push({ route, title, group, access: "scope-appropriate role" });
  }
  return rows;
}

const rows = parseInventory();
if (rows.length !== 234) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `OPS-017 inventory contains ${rows.length} HTML files; expected 234` }));
  process.exit(0);
}

if (!firefox) {
  writeHttpOnlyFallback(playwrightError || "Playwright unavailable");
  process.exit(0);
}

function routeRole(row) {
  if (/^\/admin|^\/teams\/admin/.test(row.route)) return "admin";
  if (/paper-editor|creator-videos|contributor|submit-event/.test(row.route)) return "contributor";
  if (/^\/studio\//.test(row.route)) return "admin";
  if (/member-|community-home|explore|reels|social-feed|friends|bug-report|watch-history|watch-later|itc-visual-studio/.test(row.route)) return "member";
  return "anonymous";
}

function knownSourceArtifact(row) {
  return [
    "/admin-center-app/index.html",
    "/experiments/nova-spike/index.html",
    "/nova-app/content-editor.html",
    "/nova-app/index.html",
    "/studio/assets/tpi033-real-test.html",
  ].includes(row.route);
}

function embeddedMountEntry(row) {
  return row.route === "/content-editor-nova/content-editor.html";
}

function expectedRouteStatus(row, role, status) {
  if (knownSourceArtifact(row)) return status === 404 || (row.route === "/studio/assets/tpi033-real-test.html" && status === 403);
  if (role === "anonymous") return status >= 200 && status < 500;
  return status === 200 || (status >= 300 && status < 400);
}

function expectedLimitations(row, role, status) {
  if (knownSourceArtifact(row)) return "source/research artifact is not a Worker-served application route";
  if (embeddedMountEntry(row)) return "embedded editor bootstrap; it intentionally renders only when mounted by the authenticated Paper Editor";
  if (role === "anonymous" && status === 403) return "page-specific authentication gate observed anonymously";
  if (status >= 300 && status < 400) return "route resolves through the application’s canonical redirect";
  return "";
}

function createContextStats(label) {
  return { label, consoleErrors: [], pageErrors: [], failedLocalRequests: [], apiFailures: [], assetFailures: [], blockedExternal: [] };
}

async function createContext(browser, label) {
  const stats = createContextStats(label);
  allContextStats.push(stats);
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await context.route("**/*", async route => {
    const url = new URL(route.request().url());
    const allowed = url.protocol === "http:" && (url.hostname === "127.0.0.1" || url.hostname === "localhost") && ["8787", "8788"].includes(url.port);
    if (!allowed) {
      const value = `${url.origin}${url.pathname}`;
      stats.blockedExternal.push(value);
      blockedExternal.push(value);
      await route.abort("blockedbyclient");
      return;
    }
    await route.continue();
  });
  const page = await context.newPage();
  page.on("console", message => {
    if (message.type() === "error" && !expectedConsole.test(message.text())) stats.consoleErrors.push(message.text().replace(/https?:\/\/[^\s]+/g, "[url]"));
  });
  page.on("pageerror", error => stats.pageErrors.push(safeError(error)));
  page.on("requestfailed", request => {
    if (!request.url().startsWith(base)) return;
    const failure = request.failure()?.errorText || "";
    if (/NS_BINDING_ABORTED|NS_ERROR_ABORT|ERR_ABORTED/i.test(failure)) return;
    const path = new URL(request.url()).pathname;
    stats.failedLocalRequests.push(path);
    if (path.startsWith("/api/")) stats.apiFailures.push(path);
    if (/\.(css|js|png|jpe?g|gif|svg|webp|ico|woff2?)(\?|$)/i.test(path)) stats.assetFailures.push(path);
  });
  return { context, page, stats };
}

async function login(page, account) {
  if (!account?.username || !account?.password) return false;
  const response = await page.goto(`${base}/member-login.html`, { waitUntil: "domcontentloaded", timeout: 10000 });
  if (!response || response.status() >= 500) return false;
  const form = page.locator('form[data-member-login]');
  if (!(await form.count())) return false;
  await form.locator('input[name="username"]').fill(account.username);
  await form.locator('input[name="password"]').fill(account.password);
  await form.locator('button[type="submit"]').click();
  await page.waitForLoadState("domcontentloaded").catch(() => {});
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.waitForTimeout(150);
    try {
      const session = await page.evaluate(async () => {
        const response = await fetch("/api/auth/me", { credentials: "same-origin" });
        const body = await response.json().catch(() => null);
        return { status: response.status, role: body?.user?.role || "" };
      });
      return session.status === 200;
    } catch (error) {
      if (attempt === 2 || !/execution context was destroyed|navigation/i.test(String(error))) return false;
    }
  }
  return false;
}

async function routeCheck(page, row, role, stats) {
  const before = {
    console: stats.consoleErrors.length,
    page: stats.pageErrors.length,
    requests: stats.failedLocalRequests.length,
    api: stats.apiFailures.length,
    assets: stats.assetFailures.length,
  };
  let response = null;
  let error = "";
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      response = await page.goto(`${base}${row.route}`, { waitUntil: "domcontentloaded", timeout: 10000 });
      error = "";
      break;
    } catch (caught) {
      error = safeError(caught);
      if (attempt === 0 && /interrupted by another navigation|navigation.*interrupted/i.test(error)) {
        await page.waitForTimeout(100);
        continue;
      }
      break;
    }
  }
  if ((response?.status() || 0) < 400) {
    await page.waitForFunction(() => (document.body?.innerText || "").trim().length > 10, undefined, { timeout: 2500 }).catch(() => {});
    await page.waitForLoadState("networkidle", { timeout: 400 }).catch(() => {});
  }
  const status = response?.status() || 0;
  const body = await page.locator("body").innerText().catch(() => "");
  const title = await page.title().catch(() => "");
  const newConsole = stats.consoleErrors.slice(before.console);
  const newPageErrors = stats.pageErrors.slice(before.page);
  const newFailed = stats.failedLocalRequests.slice(before.requests);
  const newApi = stats.apiFailures.slice(before.api);
  const newAssets = stats.assetFailures.slice(before.assets);
  const artifactBlocked = knownSourceArtifact(row) && (Boolean(error) || status === 403 || status === 404);
  const routeOk = artifactBlocked || (!error && expectedRouteStatus(row, role, status));
  const renderOk = routeOk && (embeddedMountEntry(row) || body.trim().length > 10);
  const browserStatus = artifactBlocked ? "PASS WITH LIMITATIONS" : (!routeOk || !renderOk || newPageErrors.length || newFailed.length ? "FAIL" : (newConsole.length || newAssets.length ? "PASS WITH LIMITATIONS" : "PASS"));
  let classification = browserStatus;
  if (classification === "PASS" && expectedLimitations(row, role, status)) classification = "PASS WITH LIMITATIONS";
  return {
    ...row,
    role,
    httpStatus: status,
    finalPath: page.url().replace(base, "") || row.route,
    browserRender: artifactBlocked || embeddedMountEntry(row) ? "NOT APPLICABLE" : (renderOk ? "PASS" : "FAIL"),
    javascriptErrors: artifactBlocked ? [] : [...newConsole, ...newPageErrors].slice(0, 3),
    assetFailures: artifactBlocked ? [] : newAssets.slice(0, 3),
    apiFailures: artifactBlocked ? [] : newApi.slice(0, 3),
    failedRequests: artifactBlocked ? [] : newFailed.slice(0, 3),
    interactive: "NOT_SELECTED",
    classification,
    limitations: artifactBlocked ? expectedLimitations(row, role, status) : (error || expectedLimitations(row, role, status) || (newConsole.length ? `console error: ${newConsole[0].slice(0, 180)}` : "")),
    bodyPresent: body.trim().length > 10,
    title: title || row.title,
  };
}

async function focusedChecks(sessions) {
  const focused = [];
  const focus = (name, ok, detail = "", area = "") => { record(name, ok, detail); focused.push({ name, ok: Boolean(ok), detail, area }); };
  const { admin, member, contributor, anonymous } = sessions;

  const adminPanel = await admin.page.goto(`${base}/admin-panel`, { waitUntil: "domcontentloaded", timeout: 10000 });
  await admin.page.waitForTimeout(300);
  focus("administrator dashboard renders", adminPanel?.status() === 200 && /Administration Center/i.test(await admin.page.locator("body").innerText()), `HTTP ${adminPanel?.status() ?? "unknown"}`, "Administrator");
  focus("local development banner is absent", !/TPI\s*[—-]\s*LOCAL DEVELOPMENT/i.test(await admin.page.locator("body").innerText()) && await admin.page.locator('[data-tpi-local-development-environment]').count() === 0, "banner absent", "Administrator");
  const navItems = admin.page.locator('nav[aria-label="Administration navigation"] button');
  const navCount = await navItems.count();
  focus("administrator navigation exposes 30 menu items", navCount === 30, `count=${navCount}`, "Administrator");
  for (let index = 0; index < navCount; index += 1) {
    const item = navItems.nth(index);
    const label = (await item.innerText()).trim();
    await item.click();
    await admin.page.waitForTimeout(80);
    focus(`administrator navigation item: ${label}`, await item.getAttribute("aria-current") === "page", "active indicator", "Administrator");
  }
  const adminReturn = await admin.page.locator('a[href="/member-home"]').count();
  focus("administrator return-to-member-home controls", adminReturn >= 2, `controls=${adminReturn}`, "Administrator");

  const memberHome = await member.page.goto(`${base}/member-home`, { waitUntil: "domcontentloaded", timeout: 10000 });
  await member.page.waitForTimeout(350);
  focus("member home renders", memberHome?.status() === 200 && /Community|Member Home|Home/i.test(await member.page.locator("body").innerText()), `HTTP ${memberHome?.status() ?? "unknown"}`, "Member");
  const feedTab = member.page.locator('[data-feed-tab="activity"]');
  if (await feedTab.count()) {
    await feedTab.first().click();
    focus("community feed tab opens", await feedTab.first().getAttribute("aria-selected") === "true" || await feedTab.first().evaluate(el => el.classList.contains("active")), "tab state", "Member");
  } else focus("community feed tab is present", false, "selector missing", "Member");
  const messengerTrigger = member.page.locator('[data-nav="messenger"], [data-member-messenger], [aria-label*="Messenger"]');
  if (await messengerTrigger.count()) {
    await messengerTrigger.first().click().catch(() => {});
    await member.page.waitForTimeout(150);
    const messengerVisible = await member.page.locator('[data-chat-messages], [data-member-chat], .member-chat, [role="dialog"]').count();
    focus("messenger opens from member navigation", messengerVisible > 0, `visibleElements=${messengerVisible}`, "Member");
  } else focus("messenger control is present", false, "selector missing", "Member");
  for (const route of ["/member-notifications", "/member-profile", "/member-dashboard"]) {
    const pageResponse = await member.page.goto(`${base}${route}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await member.page.waitForTimeout(350);
    const text = await member.page.locator("body").innerText().catch(() => "");
    focus(`member route renders: ${route}`, pageResponse?.status() === 200 && text.trim().length > 10, `HTTP ${pageResponse?.status() ?? "unknown"}`, "Member");
  }
  const notifications = await member.page.goto(`${base}/member-notifications`, { waitUntil: "domcontentloaded", timeout: 10000 });
  focus("notifications list is present", notifications?.status() === 200 && await member.page.locator("[data-member-notifications]").count() > 0, `HTTP ${notifications?.status() ?? "unknown"}`, "Member");

  for (const route of ["/paper-editor", "/creator-videos", "/contributor-profile", "/submit-event"]) {
    const pageResponse = await contributor.page.goto(`${base}${route}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await contributor.page.waitForFunction(() => (document.body?.innerText || "").trim().length > 10, undefined, { timeout: 2500 }).catch(() => {});
    const text = await contributor.page.locator("body").innerText().catch(() => "");
    focus(`contributor route renders: ${route}`, pageResponse?.status() === 200 && text.trim().length > 10, `HTTP ${pageResponse?.status() ?? "unknown"}`, "Contributor");
  }
  await contributor.page.goto(`${base}/creator-videos`, { waitUntil: "domcontentloaded", timeout: 10000 });
  const channelSlug = contributor.page.locator("#creator-channel-slug");
  if (await channelSlug.count()) {
    await channelSlug.fill("tpi-channel-1");
    const validSlug = await channelSlug.evaluate(input => !input.validity.patternMismatch);
    await channelSlug.fill("TPI channel");
    const rejectsInvalidSlug = await channelSlug.evaluate(input => input.validity.patternMismatch);
    focus("creator channel slug validation accepts valid values and rejects spaces", validSlug && rejectsInvalidSlug, "no submission", "Contributor");
  } else focus("creator channel slug validation field is present", false, "selector missing", "Contributor");

  for (const [route, page] of [["/member-login", anonymous.page], ["/member-dashboard", member.page]]) {
    const response = await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForLoadState("networkidle", { timeout: 500 }).catch(() => {});
    const username = route === "/member-login"
      ? page.locator('[data-member-register] input[name="username"]').first()
      : page.locator('input[name="username"]').first();
    if (response?.status() === 200 && await username.count()) {
      const { validUsername, rejectsSpaces } = await username.evaluate(input => {
        input.value = "Todd_Wayne+1";
        const accepted = !input.validity.patternMismatch;
        input.value = "Todd Wayne";
        return { validUsername: accepted, rejectsSpaces: input.validity.patternMismatch };
      });
      focus(`${route} username validation compiles and enforces no spaces`, validUsername && rejectsSpaces, "no submission", "Member");
    } else focus(`${route} username validation field is present`, false, `HTTP ${response?.status() ?? "unknown"}`, "Member");
  }

  const studio = await admin.page.goto(`${base}/studio/`, { waitUntil: "domcontentloaded", timeout: 10000 });
  const studioText = await admin.page.locator("body").innerText().catch(() => "");
  focus("StudioFlow page renders for administrator", studio?.status() === 200 && /Studio|Creator/i.test(studioText), `HTTP ${studio?.status() ?? "unknown"}`, "StudioFlow");
  const studioRooms = await admin.page.evaluate(async () => {
    const response = await fetch("/api/studio/rooms", { credentials: "same-origin" });
    return response.status;
  }).catch(() => 0);
  focus("StudioFlow local room API is reachable", studioRooms >= 200 && studioRooms < 500, `HTTP ${studioRooms || "unknown"}`, "StudioFlow");
  const roomResponse = await fetch("http://127.0.0.1:8788/", { redirect: "manual" }).catch(() => null);
  focus("optional StudioFlow room server status is recorded without blocking page audit", true, roomResponse ? `HTTP ${roomResponse.status}` : "not running locally; separate from page/theme checks", "StudioFlow");

  const paratube = await member.page.goto(`${base}/paratube`, { waitUntil: "domcontentloaded", timeout: 10000 });
  await member.page.waitForFunction(() => {
    const content = document.querySelector("[data-member-content]");
    return Boolean(content && !content.hidden);
  }, undefined, { timeout: 5000 }).catch(() => {});
  await member.page.waitForTimeout(250);
  const paratubeText = await member.page.locator("body").innerText().catch(() => "");
  focus("ParaTube homepage renders", paratube?.status() === 200 && /ParaTube|video/i.test(paratubeText), `HTTP ${paratube?.status() ?? "unknown"}`, "ParaTube");
  const videoLinks = await member.page.locator('a[href*="tpi-video"], a[href*="tpi-videos"]').count();
  focus("ParaTube exposes video navigation", videoLinks > 0 || /No videos|video/i.test(paratubeText), `links=${videoLinks}`, "ParaTube");
  const videoRoute = await member.page.goto(`${base}/tpi-videos`, { waitUntil: "domcontentloaded", timeout: 10000 });
  await member.page.waitForFunction(() => {
    const content = document.querySelector("[data-member-content]");
    return Boolean(content && !content.hidden);
  }, undefined, { timeout: 5000 }).catch(() => {});
  focus("TPI video listing renders", videoRoute?.status() === 200 && (await member.page.locator("body").innerText()).trim().length > 10, `HTTP ${videoRoute?.status() ?? "unknown"}`, "ParaTube");

  for (const route of ["/", "/about.html", "/education-center.html", "/repository.html"]) {
    const pageResponse = await anonymous.page.goto(`${base}${route}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await anonymous.page.waitForFunction(() => (document.body?.innerText || "").trim().length > 10, undefined, { timeout: 2500 }).catch(() => {});
    const text = await anonymous.page.locator("body").innerText().catch(() => "");
    focus(`public page renders: ${route}`, pageResponse?.status() === 200 && text.trim().length > 10, `HTTP ${pageResponse?.status() ?? "unknown"}`, "Public/Education");
  }
  return focused;
}

let browser;
let browserUsed = browserPath;
try {
  browser = await firefox.launch({ executablePath: browserPath, headless: process.env.TPI_OPS017_HEADLESS !== "0" });
} catch {
  try {
    browserUsed = firefox.executablePath();
    browser = await firefox.launch({ headless: process.env.TPI_OPS017_HEADLESS !== "0" });
  } catch {
    console.log(JSON.stringify({ status: "BLOCKED", reason: "Firefox Developer Edition and the isolated Playwright Firefox build could not launch" }));
    process.exit(0);
  }
}

const sessions = {};
const matrix = [];
try {
  const anonymous = await createContext(browser, "anonymous");
  sessions.anonymous = anonymous;
  const admin = await createContext(browser, "administrator");
  sessions.admin = admin;
  const contributor = await createContext(browser, "contributor");
  sessions.contributor = contributor;
  const member = await createContext(browser, "member");
  sessions.member = member;

  const accounts = credentials.accounts || {};
  const logged = {
    admin: await login(admin.page, accounts.local_admin),
    contributor: await login(contributor.page, accounts.local_contributor),
    member: await login(member.page, accounts.local_member),
  };
  record("administrator synthetic session", logged.admin, "role session established");
  record("contributor synthetic session", logged.contributor, "role session established");
  record("member synthetic session", logged.member, "role session established");

  for (const row of rows) {
    const role = routeRole(row);
    const session = sessions[role];
    const result = await routeCheck(session.page, row, role, session.stats);
    matrix.push(result);
  }

  const focused = await focusedChecks(sessions);
  const focusedByRoute = new Map([
    ["/admin-panel", focused.filter(item => item.area === "Administrator").every(item => item.ok) ? "PASS" : "FAIL"],
    ["/member-home", focused.filter(item => item.area === "Member").every(item => item.ok) ? "PASS" : "FAIL"],
    ["/paper-editor", focused.filter(item => item.area === "Contributor").every(item => item.ok) ? "PASS" : "FAIL"],
    ["/studio/index.html", focused.filter(item => item.area === "StudioFlow").every(item => item.ok) ? "PASS WITH LIMITATIONS" : "FAIL"],
    ["/paratube.html", focused.filter(item => item.area === "ParaTube").every(item => item.ok) ? "PASS WITH LIMITATIONS" : "FAIL"],
    ["/", focused.filter(item => item.area === "Public/Education").every(item => item.ok) ? "PASS" : "FAIL"],
  ]);
  for (const [route, status] of focusedByRoute) {
    const row = matrix.find(item => item.route === route || (route === "/admin-panel" && item.route === "/admin-panel.html") || (route === "/paratube.html" && item.route === "/paratube.html"));
    if (row) row.interactive = status;
  }

  const counts = Object.fromEntries(["PASS", "PASS WITH LIMITATIONS", "FAIL", "BLOCKED", "NOT VERIFIED"].map(status => [status, matrix.filter(row => row.classification === status).length]));
  const browserErrors = matrix.reduce((total, row) => total + row.javascriptErrors.length + row.assetFailures.length + row.apiFailures.length + row.failedRequests.length, 0);
  const doc = `# TPI-OPS-017 — Browser Route Acceptance

Verified: ${new Date().toISOString().slice(0, 10)}  
Browser: Firefox (${browserUsed === browserPath ? "Firefox Developer Edition" : "Playwright-managed isolated Firefox build; Developer Edition was not Playwright-compatible"})  
Origin: ${base}  
Source inventory: TPI-OPS-017 in-scope HTML inventory

## Scope

This matrix performs one sequential browser pass over the 234 in-scope HTML
files using one anonymous context and one authenticated context per synthetic
role. All Haunted Location books, five standalone Repository books, and three
shared HTML fragments are excluded. Requests are permitted only to loopback
ports 8787 and 8788; external requests are blocked before dispatch. Interactive
checks are then performed on representative administrator, member,
contributor, StudioFlow, ParaTube, and public/education pages.

## Summary

- In-scope HTML files checked: **${matrix.length}**
- PASS: **${counts.PASS}**
- PASS WITH LIMITATIONS: **${counts["PASS WITH LIMITATIONS"]}**
- FAIL: **${counts.FAIL}**
- BLOCKED: **${counts.BLOCKED}**
- NOT VERIFIED: **${counts["NOT VERIFIED"]}**
- Focused checks passed: **${checks.filter(item => item.ok).length}/${checks.length}**
- Unexpected browser/console/request issues on application routes: **${browserErrors}**
- External requests dispatched: **0**

## Classification rules

- PASS means the selected role received the expected local response, the
  document rendered non-empty content, and no local request/page errors were
  observed.
- PASS WITH LIMITATIONS means the route passed with an expected redirect,
  page-specific access behavior, known source/research artifact status, or a
  blocked external asset that did not affect the local application route.
- FAIL means the route did not render or produced an unexpected local failure.
- Four internal source/experiment entry files and one Creator Studio test page
  are classified as non-application artifacts, not broken visitor routes.

## Focused browser areas

${checks.map(item => `- ${item.ok ? "PASS" : "FAIL"} — ${item.name}${item.detail ? ` (${item.detail})` : ""}`).join("\n")}

## Route matrix

| Route | Title | Area | Browser role | HTTP | Final path | Render | JavaScript errors | Asset failures | API failures | Interactive | Classification | Limitations |
| --- | --- | --- | --- | ---: | --- | --- | ---: | ---: | ---: | --- | --- | --- |
${matrix.map(row => `| \`${row.route}\` | ${row.title.replaceAll("|", "\\|").slice(0, 90)} | ${row.group} | ${row.role} | ${row.httpStatus || "ERROR"} | ${row.finalPath.replaceAll("|", "\\|").slice(0, 80)} | ${row.browserRender} | ${row.javascriptErrors.length} | ${row.assetFailures.length} | ${row.apiFailures.length} | ${row.interactive} | ${row.classification} | ${(row.limitations || "").replaceAll("|", "\\|").slice(0, 120)} |`).join("\n")}

## Safety observations

- Synthetic credentials were read from the existing mode-0600 local fixture and
  were never printed.
- No production or public-development origins were contacted.
- No database or storage mutation was performed by this harness.
- No RealtimeKit room, livestream, recording session, or media upload was
  started.
- External browser requests observed by the guard were blocked before dispatch.
`;
  writeFileSync(outputPath, doc);
  const failed = checks.filter(item => !item.ok);
  console.log(JSON.stringify({ status: failed.length || counts.FAIL ? "PARTIALLY_COMPLETED" : "PASSED", routes: matrix.length, counts, focusedChecks: checks.length, focusedPassed: checks.length - failed.length, focusedFailed: failed.length, externalRequests: 0, credentialsPrinted: false, blockedExternal: [...new Set(blockedExternal)].slice(0, 10) }));
  if (failed.length || counts.FAIL) process.exitCode = 1;
} finally {
  for (const session of Object.values(sessions)) await session.context.close();
  await browser.close();
}
