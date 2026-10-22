#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../..");
const credentials = JSON.parse(readFileSync(process.env.TPI_022_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json"), "utf8"));
const account = credentials.accounts?.test_admin;
const base = process.env.TPI_022_BASE_URL || "http://127.0.0.1:8787";
const browserPath = process.env.TPI_022_CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const videoFile = process.env.TPI_022_VIDEO_FILE || "/private/tmp/tpi-022-video.mp4";
const results = [];
const runtimeErrors = [];
function check(name, passed, detail = "") { results.push({ name, passed: Boolean(passed), detail: passed ? "" : detail }); }

let chromium;
try { ({ chromium } = createRequire(import.meta.url)("playwright")); } catch (error) { console.log(JSON.stringify({ status: "BLOCKED", reason: `Playwright unavailable: ${error.message}` })); process.exit(0); }
if (!account || !existsSync(videoFile)) { console.log(JSON.stringify({ status: "BLOCKED", reason: "Synthetic test_admin account or video fixture is unavailable." })); process.exit(0); }

const browser = await chromium.launch({ executablePath: browserPath, headless: true, args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
page.on("pageerror", error => runtimeErrors.push(error.message));
page.on("console", message => { if (message.type() === "error") runtimeErrors.push(message.text()); });
const failedRequests = [];
page.on("requestfailed", request => failedRequests.push(`${request.method()} ${request.url()} ${request.failure()?.errorText ?? ""}`));
page.on("response", response => { if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.request().method()} ${response.url()}`); });

async function enterStudio() {
  await page.goto(`${base}/studio/`, { waitUntil: "domcontentloaded", timeout: 30000 });
  if (!(await page.locator("[data-tpi-video-organization]").count())) {
    const record = page.getByRole("button", { name: /Record without going live/i }).first();
    if (await record.count()) { await record.click(); await page.waitForTimeout(400); const next = page.getByRole("button", { name: /Continue to setup/i }).first(); if (await next.count()) await next.click(); await page.waitForTimeout(800); const enter = page.getByRole("button", { name: /Enter studio/i }).first(); if (await enter.count()) await enter.click(); await page.waitForTimeout(1000); }
  }
  await page.locator("[data-tpi-video-organization]").waitFor({ state: "visible", timeout: 30000 });
}

try {
  const login = await page.goto(`${base}/member-login.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
  check("local login page renders", login?.status() === 200, `HTTP ${login?.status() ?? "unknown"}`);
  await page.locator('form[data-member-login] input[name="username"]').fill(account.username);
  await page.locator('form[data-member-login] input[name="password"]').fill(account.password);
  await page.locator('form[data-member-login] button[type="submit"]').click();
  await page.waitForTimeout(250);
  const session = await page.request.get(`${base}/api/auth/me`);
  check("synthetic test_admin login succeeds", session.ok() && Boolean((await session.json()).user), `HTTP ${session.status()}`);
  await enterStudio();

  const cards = page.locator("[data-tpi-video-organization] [data-tpi-video-card]");
  check("seven visible video cards render", await cards.count() === 7);
  check("visible video card labels omit legacy placeholders", await page.locator("[data-tpi-video-card]").allTextContents().then(values => ["Intro Video", "Outro Video", "Video 5", "Video 6", "Video 7", "Video 8", "Video 9"].every(label => values.some(value => value.includes(label))) && !values.some(value => /Thank You|Be Right Back/i.test(value))));
  const timerSection = page.locator("[data-tpi-video-timer-section]");
  check("one native video timer has its own section", await timerSection.count() === 1 && await timerSection.locator(".countdown-duration-row button").count() >= 4 && await timerSection.locator('button[title*="golden ring countdown"]').count() === 1);

  let chooser = page.waitForEvent("filechooser"); await cards.nth(0).getByRole("button", { name: "Upload" }).click(); await (await chooser).setFiles(videoFile); await page.waitForTimeout(1000);
  await cards.nth(0).locator("button[data-tpi-video-menu-toggle]").click();
  check("Intro Video upload assigns slot one", await cards.nth(0).getByText("tpi-022-video.mp4", { exact: true }).count() === 1 && await cards.nth(0).getByRole("button", { name: "Preview" }).count() === 1);
  check("Intro Video gets a recognizable thumbnail or assigned fallback", await cards.nth(0).locator("img, .tpi-video-card-fallback").count() === 1);
  const persisted = await page.evaluate(async () => {
    const slots = JSON.parse(localStorage.getItem("studioflow.videoClipSlots") || "[]");
    const db = await new Promise((resolve, reject) => { const request = indexedDB.open("studioflow-recordings"); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
    const keys = slots.filter(Boolean).map(item => item.blobKey);
    const found = await new Promise((resolve, reject) => { const tx = db.transaction("recordingBlobs", "readonly"); const store = tx.objectStore("recordingBlobs"); const values = []; keys.forEach(key => { const request = store.get(key); request.onsuccess = () => values.push(Boolean(request.result)); request.onerror = () => reject(request.error); }); tx.oncomplete = () => resolve(values.every(Boolean)); tx.onerror = () => reject(tx.error); });
    db.close(); return { slots, found };
  });
  check("video metadata and media bytes persist locally", persisted.slots.filter(Boolean).length === 1 && persisted.found);
  const introToggle = cards.nth(0).locator("button[data-tpi-video-menu-toggle]");
  if (await introToggle.getAttribute("aria-expanded") !== "true") await introToggle.click();
  await cards.nth(0).getByRole("button", { name: "Preview" }).click(); await page.waitForTimeout(500);
  check("video preview loads from IndexedDB", await cards.nth(0).locator('video[data-tpi-preview]:not([hidden])').count() === 1);

  await page.getByRole("button", { name: "10s", exact: true }).click(); await page.waitForTimeout(200);
  check("native video timer changes to the selected duration", await timerSection.getByRole("button", { name: "10s", exact: true }).evaluate(button => button.classList.contains("active")) && await page.locator("[data-tpi-video-timer-section]").count() === 1);

  await page.reload({ waitUntil: "domcontentloaded" }); await enterStudio();
  check("video assignments survive refresh and reopening", await page.locator('[data-tpi-video-card="0"] .tpi-video-card-file').textContent() === "tpi-022-video.mp4" && await page.locator('[data-tpi-video-card="2"]').count() === 0);

  const selector = page.locator(".tpi-studio-selector");
  if (await selector.count()) {
    await selector.click(); await page.waitForTimeout(100);
    const layout = await page.evaluate(() => { const menu = document.querySelector(".tpi-studio-menu"); const status = document.querySelector(".tpi-studio-status"); const backup = document.querySelector(".tpi-studio-backup-status"); const m = menu?.getBoundingClientRect(); const s = status?.getBoundingClientRect(); const b = backup?.getBoundingClientRect(); const overlap = (a, c) => Boolean(a && c && a.left < c.right && a.right > c.left && a.top < c.bottom && a.bottom > c.top); return { visible: Boolean(menu && !menu.hidden), overlapsStatus: overlap(m, s) || overlap(m, b), width: m?.width || 0 }; });
    check("My Studios menu does not overlap save or backup status", layout.visible && !layout.overlapsStatus);
    await page.keyboard.press("Escape");
  }
  await page.setViewportSize({ width: 390, height: 844 });
  check("video grid adapts on a narrow browser", await page.locator(".tpi-video-grid").evaluate(element => getComputedStyle(element).gridTemplateColumns.split(" ").length === 2 || getComputedStyle(element).gridTemplateColumns === "1fr"));
} catch (error) {
  check("browser acceptance completed", false, `${error.message}; url=${page.url()}; runtime=${runtimeErrors.join(" | ")}`);
} finally {
  check("no TPI-022 runtime errors", runtimeErrors.filter(error => /video-organization|video-clip-management|tpi-video/i.test(error)).length === 0, runtimeErrors.slice(0, 3).join(" | "));
  await browser.close();
}

const failed = results.filter(result => !result.passed);  console.log(JSON.stringify({ status: failed.length ? "FAIL" : "PASS", checks: results, passed: results.length - failed.length, failed: failed.length, runtimeErrors, failedRequests }, null, 2));
process.exit(failed.length ? 1 : 0);
