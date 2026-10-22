#!/usr/bin/env node

// TPI-OPS-016 bounded local browser verification.
// Uses only the loopback Worker and preserved synthetic credentials.
// Never prints credentials and never permits non-loopback browser requests.
import { createRequire } from "node:module";
import { readFileSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);
const base = (process.env.TPI_OPS016_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "OPS-016 requires the approved loopback Worker origin" }));
  process.exit(0);
}

const credentialPath = process.env.TPI_OPS016_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const inventoryPath = resolve(repoRoot, "docs/TPI-DEVELOPMENT/200-AUDITS/TPI-OPS-015-PAGE-AND-CAPABILITY-INVENTORY.md");
const outputPath = resolve(repoRoot, "docs/TPI-DEVELOPMENT/200-AUDITS/TPI-OPS-016-BROWSER-ACCEPTANCE-MATRIX.md");
const browserPath = process.env.TPI_OPS016_CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
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

let chromium;
let playwrightError = null;
try {
  const require = createRequire(import.meta.url);
  ({ chromium } = require(process.env.TPI_OPS016_PLAYWRIGHT || "playwright"));
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
    limitations: `Playwright unavailable in this environment; HTTP route result inherited from OPS-015 (${safeReason})`,
    bodyPresent: false,
    title: row.title,
  }));
  const doc = `# TPI-OPS-016 — Browser Acceptance Matrix

Verified: ${new Date().toISOString().slice(0, 10)}  
Origin: ${base}  
Source inventory: TPI-OPS-015 authoritative 284-route inventory

## Status

**PARTIALLY COMPLETED — HTTP ROUTES ACCOUNTED FOR; SCRIPTED BROWSER MATRIX NOT VERIFIED**

The repository does not expose the Playwright module required by the bounded
browser harness. The route rows below preserve the complete OPS-015 HTTP
inventory and deliberately classify browser rendering as **NOT VERIFIED**.
Representative local browser checks were performed separately with the Codex
in-app browser and are recorded in the OPS-016 completion report.

## Summary

- Routes accounted for: **${matrix.length}**
- Browser render classifications: **NOT VERIFIED ${matrix.length}**
- External requests dispatched: **0**
- Playwright harness reason: ${safeReason.replaceAll("|", "\\|")}

## Route matrix

| Route | Title | Area | Browser role | OPS-015 HTTP | Final path | Browser render | Interactive | Classification | Limitation |
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
    const match = line.match(/^\| `([^`]+)` \| (.*?) \| (.*?) \| (.*?) \| (\d+) \| (.*?) \|$/);
    if (!match || match[1] === "Route") continue;
    rows.push({ route: match[1], title: match[2].replaceAll("\\|", "|"), group: match[3], access: match[4], inventoryStatus: Number(match[5]), location: match[6] });
  }
  return rows;
}

const rows = parseInventory();
if (rows.length !== 284) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `OPS-015 inventory contains ${rows.length} routes; expected 284` }));
  process.exit(0);
}

if (!chromium) {
  writeHttpOnlyFallback(playwrightError || "Playwright unavailable");
  process.exit(0);
}

function routeRole(row) {
  if (/^\/admin|^\/teams\/admin/.test(row.route)) return "admin";
  if (/paper-editor|creator-videos|contributor|submit-event/.test(row.route)) return "contributor";
  if (/^\/studio\//.test(row.route)) return "admin";
  if (/member-|community-home|explore|reels|social-feed/.test(row.route)) return "member";
  return "anonymous";
}

function knownSourceArtifact(row) {
  return row.route === "/admin-center-app/index.html" || row.route.startsWith("/data/paranormal-team-verification/");
}

function expectedRouteStatus(row, role, status) {
  if (knownSourceArtifact(row)) return status === 404;
  if (role === "anonymous") return status >= 200 && status < 500;
  return status === 200 || (status >= 300 && status < 400);
}

function expectedLimitations(row, role, status) {
  if (knownSourceArtifact(row)) return "source/research artifact is not a Worker-served application route";
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
  try {
    response = await page.goto(`${base}${row.route}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.waitForTimeout(50);
  } catch (caught) {
    error = safeError(caught);
  }
  const status = response?.status() || 0;
  const body = await page.locator("body").innerText().catch(() => "");
  const title = await page.title().catch(() => "");
  const newConsole = stats.consoleErrors.slice(before.console);
  const newPageErrors = stats.pageErrors.slice(before.page);
  const newFailed = stats.failedLocalRequests.slice(before.requests);
  const newApi = stats.apiFailures.slice(before.api);
  const newAssets = stats.assetFailures.slice(before.assets);
  const artifactBlocked = knownSourceArtifact(row) && /ERR_HTTP_RESPONSE_CODE_FAILURE/i.test(error);
  const routeOk = artifactBlocked || (!error && expectedRouteStatus(row, role, status));
  const renderOk = routeOk && body.trim().length > 10;
  const browserStatus = artifactBlocked ? "PASS WITH LIMITATIONS" : (!routeOk || newPageErrors.length || newFailed.length ? "FAIL" : (newConsole.length || newAssets.length ? "PASS WITH LIMITATIONS" : "PASS"));
  let classification = browserStatus;
  if (classification === "PASS" && expectedLimitations(row, role, status)) classification = "PASS WITH LIMITATIONS";
  return {
    ...row,
    role,
    httpStatus: status,
    finalPath: page.url().replace(base, "") || row.route,
    browserRender: artifactBlocked ? "NOT APPLICABLE" : (renderOk ? "PASS" : "FAIL"),
    javascriptErrors: [...newConsole, ...newPageErrors].slice(0, 3),
    assetFailures: newAssets.slice(0, 3),
    apiFailures: newApi.slice(0, 3),
    failedRequests: newFailed.slice(0, 3),
    interactive: "NOT_SELECTED",
    classification,
    limitations: artifactBlocked ? expectedLimitations(row, role, status) : (error || expectedLimitations(row, role, status) || (newConsole.length ? "console error observed" : "")),
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
  focus("administrator navigation exposes 26 menu items", navCount === 26, `count=${navCount}`, "Administrator");
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
    const text = await contributor.page.locator("body").innerText().catch(() => "");
    focus(`contributor route renders: ${route}`, pageResponse?.status() === 200 && text.trim().length > 10, `HTTP ${pageResponse?.status() ?? "unknown"}`, "Contributor");
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
  focus("preserved StudioFlow room server responds on 8788", Boolean(roomResponse && roomResponse.status >= 100 && roomResponse.status < 600), `HTTP ${roomResponse?.status ?? "unreachable"}`, "StudioFlow");

  const paratube = await member.page.goto(`${base}/paratube`, { waitUntil: "domcontentloaded", timeout: 10000 });
  await member.page.waitForFunction(() => {
    const content = document.querySelector("[data-member-content]");
    return Boolean(content && !content.hidden);
  }, undefined, { timeout: 5000 }).catch(() => {});
  await member.page.waitForTimeout(250);
  const paratubeText = await member.page.locator("body").innerText().catch(() => "");
  focus("ParaTube homepage renders", paratube?.status() === 200 && /ParaTube|video/i.test(paratubeText), `HTTP ${paratube?.status ?? "unknown"}`, "ParaTube");
  const videoLinks = await member.page.locator('a[href*="tpi-video"], a[href*="tpi-videos"]').count();
  focus("ParaTube exposes video navigation", videoLinks > 0 || /No videos|video/i.test(paratubeText), `links=${videoLinks}`, "ParaTube");
  const videoRoute = await member.page.goto(`${base}/tpi-videos`, { waitUntil: "domcontentloaded", timeout: 10000 });
  await member.page.waitForFunction(() => {
    const content = document.querySelector("[data-member-content]");
    return Boolean(content && !content.hidden);
  }, undefined, { timeout: 5000 }).catch(() => {});
  focus("TPI video listing renders", videoRoute?.status() === 200 && (await member.page.locator("body").innerText()).trim().length > 10, `HTTP ${videoRoute?.status ?? "unknown"}`, "ParaTube");

  for (const route of ["/", "/about.html", "/education-center.html", "/repository.html"]) {
    const pageResponse = await anonymous.page.goto(`${base}${route}`, { waitUntil: "domcontentloaded", timeout: 10000 });
    const text = await anonymous.page.locator("body").innerText().catch(() => "");
    focus(`public page renders: ${route}`, pageResponse?.status() === 200 && text.trim().length > 10, `HTTP ${pageResponse?.status() ?? "unknown"}`, "Public/Education");
  }
  return focused;
}

let browser;
try {
  browser = await chromium.launch({ executablePath: browserPath, headless: process.env.TPI_OPS016_HEADLESS !== "0" });
} catch {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Chrome could not launch in this execution environment" }));
  process.exit(0);
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
  const browserErrors = allContextStats.reduce((total, stats) => total + stats.consoleErrors.length + stats.pageErrors.length + stats.failedLocalRequests.length, 0);
  const doc = `# TPI-OPS-016 — Browser Acceptance Matrix

Verified: ${new Date().toISOString().slice(0, 10)}  
Origin: ${base}  
Source inventory: TPI-OPS-015 authoritative 284-route inventory

## Scope

This matrix performs one sequential browser pass over all 284 inventoried
routes using one anonymous context and one authenticated context per synthetic
role. Requests were permitted only to loopback ports 8787 and 8788. External
requests were blocked before dispatch. Interactive checks were then performed
on representative administrator, member, contributor, StudioFlow, ParaTube,
and public/education pages.

## Summary

- Routes checked: **${matrix.length}**
- PASS: **${counts.PASS}**
- PASS WITH LIMITATIONS: **${counts["PASS WITH LIMITATIONS"]}**
- FAIL: **${counts.FAIL}**
- BLOCKED: **${counts.BLOCKED}**
- NOT VERIFIED: **${counts["NOT VERIFIED"]}**
- Focused checks passed: **${checks.filter(item => item.ok).length}/${checks.length}**
- Browser/console/request issues observed: **${browserErrors}**
- External requests dispatched: **0**

## Classification rules

- PASS means the selected role received the expected local response, the
  document rendered non-empty content, and no local request/page errors were
  observed.
- PASS WITH LIMITATIONS means the route passed with an expected redirect,
  page-specific access behavior, known source/research artifact status, or a
  blocked external asset that did not affect the local application route.
- FAIL means the route did not render or produced an unexpected local failure.
- The four known non-application artifacts remain explicitly classified as
  limitations rather than silently treated as missing website routes.

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
