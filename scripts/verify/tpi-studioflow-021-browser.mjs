#!/usr/bin/env node
import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../..");
const credentials = JSON.parse(readFileSync(resolve(repoRoot, ".local-dev/local-auth-credentials.json"), "utf8"));
const account = credentials.accounts?.local_admin;
const base = process.env.TPI_021_BASE_URL || "http://127.0.0.1:8787";
const browserPath = process.env.TPI_021_CHROME || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const soundFile = process.env.TPI_021_SOUND_FILE || "/private/tmp/tpi-021-sound.wav";
const musicFile = process.env.TPI_021_MUSIC_FILE || "/private/tmp/tpi-021-music.wav";
const results = [];
let chromium;
const runtimeErrors = [];

function check(name, passed, detail = "") {
  results.push({ name, passed: Boolean(passed), detail: passed ? "" : detail });
}

try {
  ({ chromium } = createRequire(import.meta.url)("playwright"));
} catch (error) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: `Playwright unavailable: ${error.message}` }));
  process.exit(0);
}

if (!account || !existsSync(soundFile) || !existsSync(musicFile)) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Synthetic account or audio fixture is unavailable." }));
  process.exit(0);
}

const browser = await chromium.launch({ executablePath: browserPath, headless: true, args: ["--no-sandbox", "--autoplay-policy=no-user-gesture-required"] });
const context = await browser.newContext({ viewport: { width: 1280, height: 1000 }, acceptDownloads: true });
const page = await context.newPage();
const consoleErrors = [];
page.on("console", message => { if (message.type() === "error") consoleErrors.push(message.text()); });
page.on("pageerror", error => runtimeErrors.push(error.message));

try {
  const login = await page.goto(`${base}/member-login.html`, { waitUntil: "domcontentloaded", timeout: 30000 });
  check("local login page renders", login?.status() === 200, `HTTP ${login?.status() ?? "unknown"}`);
  await page.locator('form[data-member-login] input[name="username"]').fill(account.username);
  await page.locator('form[data-member-login] input[name="password"]').fill(account.password);
  await page.locator('form[data-member-login] button[type="submit"]').click();
  await page.waitForTimeout(250);
  const session = await page.request.get(`${base}/api/auth/me`);
  check("synthetic local_admin login succeeds", session.ok() && Boolean((await session.json()).user), `HTTP ${session.status()}`);

  await page.goto(`${base}/studio/`, { waitUntil: "domcontentloaded", timeout: 30000 });
  const libraryNav = page.getByRole("button", { name: "Library", exact: true });
  if (await libraryNav.count()) { await libraryNav.click(); await page.waitForTimeout(700); }
  if (!(await page.locator("[data-tpi-audio-soundboards]").count())) {
    const homeNav = page.getByRole("button", { name: "Home", exact: true });
    if (await homeNav.count()) { await homeNav.click(); await page.waitForTimeout(500); }
    const recordControl = page.getByRole("button", { name: /Record without going live/i }).first();
    if (await recordControl.count()) {
      await recordControl.click();
      await page.waitForTimeout(400);
      const continueControl = page.getByRole("button", { name: /Continue to setup/i }).first();
      if (await continueControl.count()) await continueControl.click();
      await page.waitForTimeout(900);
      const enterControl = page.getByRole("button", { name: /Enter studio/i }).first();
      if (await enterControl.count()) await enterControl.click();
      await page.waitForTimeout(1000);
    }
  }
  if (!(await page.locator("[data-tpi-audio-soundboards]").count())) {
    const createControl = page.getByText("Create", { exact: true }).first();
    if (await createControl.count()) { await createControl.click(); await page.waitForTimeout(700); }
  }
  await page.locator("[data-tpi-audio-soundboards]").waitFor({ state: "visible", timeout: 30000 });
  const soundBoard = page.locator('[data-tpi-audio-board="sound"]');
  const musicBoard = page.locator('[data-tpi-audio-board="music"]');
  check("sound-effects board renders", await soundBoard.count() === 1);
  check("background-music board renders", await musicBoard.count() === 1);
  check("nine sound-effect slots render", await soundBoard.locator(".tpi-audio-slot").count() === 9);
  check("nine background-music slots render", await musicBoard.locator(".tpi-audio-slot").count() === 9);
  const heartbeat = page.locator('[data-tpi-audio-soundboards]').getByText("Heartbeat Fast", { exact: true });
  let heartbeatVisible = false;
  for (const item of await heartbeat.all()) heartbeatVisible = heartbeatVisible || await item.isVisible();
  check("Heartbeat Fast is not required or shown", !heartbeatVisible, heartbeatVisible ? await heartbeat.first().evaluate(element => element.outerHTML) : "");

  const soundUpload = soundBoard.locator(".tpi-audio-upload");
  let chooser = page.waitForEvent("filechooser"); await soundUpload.click(); await (await chooser).setFiles(soundFile);
  await page.waitForTimeout(450);
  check("sound upload fills first slot", (await soundBoard.locator(".tpi-audio-slot.assigned").count()) === 1 && (await soundBoard.locator(".tpi-audio-slot.assigned").first().innerText()).includes("tpi-021-sound"));

  const musicUpload = musicBoard.locator(".tpi-audio-upload");
  chooser = page.waitForEvent("filechooser"); await musicUpload.click(); await (await chooser).setFiles(musicFile);
  await page.waitForTimeout(450);
  check("music upload fills first slot", (await musicBoard.locator(".tpi-audio-slot.assigned").count()) === 1 && (await musicBoard.locator(".tpi-audio-slot.assigned").first().innerText()).includes("tpi-021-music"));

  await soundBoard.locator(".tpi-audio-slot.assigned").first().click();
  await page.waitForTimeout(500);
  check("sound playback marks the active card", await soundBoard.locator(".tpi-audio-slot.playing").count() === 1);
  await page.locator('[data-tpi-audio-stop="sound"]').click();
  check("sound stop clears the active card", await soundBoard.locator(".tpi-audio-slot.playing").count() === 0);

  await musicBoard.locator(".tpi-audio-slot.assigned").first().click();
  await page.waitForTimeout(300);
  check("music playback marks the active card", await musicBoard.locator(".tpi-audio-slot.playing").count() === 1);
  await page.locator('[data-tpi-audio-stop="music"]').click();
  check("music stop clears the active card", await musicBoard.locator(".tpi-audio-slot.playing").count() === 0);

  const persisted = await page.evaluate(() => ({ sounds: JSON.parse(localStorage.getItem("studioflow.customSounds") || "[]"), music: JSON.parse(localStorage.getItem("studioflow.backgroundMusicSlots") || "[]") }));
  check("audio metadata persists in workspace storage", persisted.sounds.length === 1 && persisted.music.length === 1);
  await page.reload({ waitUntil: "domcontentloaded" });
  if (!(await page.getByRole("button", { name: /Enter studio/i }).count())) {
    const libraryAfterRefresh = page.getByRole("button", { name: "Library", exact: true });
    if (await libraryAfterRefresh.count()) { await libraryAfterRefresh.click(); await page.waitForTimeout(600); }
  }
  const enterAfterRefresh = page.getByRole("button", { name: /Enter studio/i }).first();
  if (await enterAfterRefresh.count()) { await enterAfterRefresh.click(); await page.waitForTimeout(800); }
  const secondEnterAfterRefresh = page.getByRole("button", { name: /Enter studio/i }).first();
  if (await secondEnterAfterRefresh.count() && !(await page.locator("[data-tpi-audio-soundboards]").count())) { await secondEnterAfterRefresh.click(); await page.waitForTimeout(900); }
  await page.locator("[data-tpi-audio-soundboards]").waitFor({ state: "visible", timeout: 30000 });
  check("sound assignment survives refresh", await page.locator('[data-tpi-audio-board="sound"] .tpi-audio-slot.assigned').count() === 1);
  check("music assignment survives refresh", await page.locator('[data-tpi-audio-board="music"] .tpi-audio-slot.assigned').count() === 1);
} catch (error) {
  check("browser acceptance completed", false, `${error.message}; url=${page.url()}; runtime=${runtimeErrors.join(" | ")}`);
} finally {
  check("no soundboard runtime errors", runtimeErrors.filter(error => /audio-soundboard|tpi-audio/i.test(error)).length === 0, runtimeErrors.slice(0, 3).join(" | "));
  await browser.close();
}

const failed = results.filter(result => !result.passed);
console.log(JSON.stringify({ status: failed.length ? "FAIL" : "PASS", checks: results, passed: results.length - failed.length, failed: failed.length }));
process.exit(failed.length ? 1 : 0);
