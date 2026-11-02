#!/usr/bin/env node

// TPI-CREATOR-INCENTIVE-001 — admin membership workflow browser acceptance.
//
// Firefox Developer Edition is the authoritative browser (isolated disposable
// profile; the owner's windows and storage are never used). Chromium is a
// compatibility smoke test only: the authorization outcome must not differ.
//
// The workflow is the normal administrator path on the canonical
// Administration Center: sign in, open Founding Memberships, read real class
// capacity, issue a membership through the form, and resolve an account's
// capability set. Every state change goes through the real local Worker API.

import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, Select, until } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";
import { chromium } from "playwright";

const repoRoot = resolve(new URL("../..", import.meta.url).pathname);
const evidenceDir = resolve(repoRoot, "docs/audits/TPI-CREATOR-INCENTIVE-001");
const baseUrl = process.env.TPI_REVIEW_BASE_URL || "http://127.0.0.1:8787";
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialPath = resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const reviewPath = resolve(repoRoot, ".local-dev/creator-incentive-review.json");
const uiAccountUsername = "tpi_review_ui_check";

let passed = 0;
const failures = [];
function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    console.log(`PASS  ${name}`);
  } else {
    failures.push(`${name}${detail ? ` — ${detail}` : ""}`);
    console.log(`FAIL  ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

const admin = readJson(credentialPath)?.accounts?.local_admin;
const review = readJson(reviewPath)?.accounts || {};
if (!admin?.username || !admin?.password) {
  console.error("local administrator credentials are missing; run scripts/local-creator-incentive-review.mjs --local-only first");
  process.exit(1);
}
if (!existsSync(firefoxBinary)) {
  console.error(`Firefox Developer Edition was not found at ${firefoxBinary}`);
  process.exit(1);
}
mkdirSync(evidenceDir, { recursive: true });

const uiAccountPassword = `Tpi-${Math.random().toString(36).slice(2)}-${Date.now()}`;
const loginScript = `
  const [username, password, done] = arguments;
  fetch("/api/auth/login", {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  }).then(async response => done({ status: response.status }))
    .catch(() => done({ status: 0 }));
`;

async function ensureUiAccount() {
  const response = await fetch(`${baseUrl}/api/members/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ username: uiAccountUsername, password: uiAccountPassword, displayName: "Review — UI Issuance Check", email: `${uiAccountUsername}@example.test` }),
  });
  if (response.ok) return "created";
  if (response.status === 409) return "exists";
  throw new Error(`could not prepare the UI check account: ${response.status}`);
}

async function runFirefox() {
  console.log("\n== FIREFOX DEVELOPER EDITION (AUTHORITATIVE) ==");
  const profileDir = mkdtempSync(join(tmpdir(), "tpi-inc001-firefox-"));
  const downloadDir = mkdtempSync(join(tmpdir(), "tpi-inc001-downloads-"));
  const options = new firefox.Options()
    .setBinary(firefoxBinary)
    .addArguments("-profile", profileDir)
    .addArguments("-no-remote")
    .setPreference("browser.download.dir", downloadDir)
    .setPreference("browser.download.folderList", 2)
    .setPreference("browser.startup.homepage", "about:blank");
  const service = new firefox.ServiceBuilder(geckodriver);
  let driver;
  try {
    driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(service).build();
    await driver.manage().window().setRect({ width: 1440, height: 1000 });

    await driver.get(`${baseUrl}/`);
    const loginResult = await driver.executeAsyncScript(loginScript, admin.username, admin.password);
    check("Firefox: local administrator signs in", loginResult?.status === 200, `status ${loginResult?.status}`);

    await driver.get(`${baseUrl}/admin-panel#founding-memberships`);
    await driver.wait(until.elementLocated(By.css("h2")), 20000);
    const heading = await driver.wait(until.elementLocated(By.xpath("//h2[normalize-space()='Founding Memberships']")), 20000);
    check("Firefox: Founding Memberships is reachable from the canonical Administration Center", await heading.isDisplayed());
    check("Firefox: the deep link opens the view directly", (await driver.getCurrentUrl()).includes("#founding-memberships"));

    await driver.wait(async () => (await driver.findElement(By.tagName("body")).getText()).includes("FCT-001 to FCT-050"), 20000, "class capacity did not render");
    const bodyText = await driver.findElement(By.tagName("body")).getText();
    check("Firefox: all three classes render with their permanent ranges", bodyText.includes("FC-001 to FC-050") && bodyText.includes("FCT-001 to FCT-050") && bodyText.includes("FAA-001 to FAA-050"));
    check("Firefox: capacity shows lifetime issuance and remaining numbers", /issued/.test(bodyText) && /left/.test(bodyText));
    check("Firefox: the permanent registry lists real issued numbers", /FC-00\d/.test(bodyText) && /FCT-00\d/.test(bodyText) && /FAA-00\d/.test(bodyText));

    // Issue through the normal administrator form.
    const classSelect = await driver.findElement(By.css("select[aria-label='Founding Membership class']"));
    await new Select(classSelect).selectByValue("FC");
    const usernameInput = await driver.findElement(By.css("input[placeholder='existing account username']"));
    await usernameInput.clear();
    await usernameInput.sendKeys(uiAccountUsername);
    const notesInput = await driver.findElement(By.css("input[placeholder='optional administrative note']"));
    await notesInput.sendKeys("Firefox acceptance issuance");
    await driver.findElement(By.xpath("//button[normalize-space()='Issue membership']")).click();

    await driver.wait(async () => /(FC|FCT|FAA)-0\d\d/.test(await driver.findElement(By.css(".preview-notice")).getText().catch(() => "")), 20000, "issuance notice did not appear");
    const notice = await driver.findElement(By.css(".preview-notice")).getText();
    const repeatRun = /already holds/.test(notice);
    check(
      repeatRun
        ? "Firefox: a repeated submission is refused and the existing permanent number is reported"
        : "Firefox: the form issues a permanent number and reports the capability set",
      /(FC|FCT|FAA)-0\d\d/.test(notice) && (repeatRun || /creator/.test(notice)),
      notice,
    );

    await driver.wait(async () => (await driver.findElement(By.tagName("body")).getText()).includes(uiAccountUsername), 20000, "registry did not refresh");
    check("Firefox: the newly issued number appears in the permanent registry", (await driver.findElement(By.tagName("body")).getText()).includes(uiAccountUsername));

    // Resolve a Contributor-only account and prove capability separation.
    const inspectInput = await driver.findElement(By.css("input[aria-label='Account username to inspect']"));
    await inspectInput.clear();
    await inspectInput.sendKeys(review.contributor?.username || "tpi_review_contributor");
    await driver.findElement(By.xpath("//button[normalize-space()='Resolve capabilities']")).click();
    // Selenium returns rendered text, and the panel styles these labels as uppercase.
    await driver.wait(async () => /contributor capability/i.test(await driver.findElement(By.css(".detail-facts")).getText().catch(() => "")), 20000, "capability inspection did not render");
    const inspection = await driver.findElement(By.css(".detail-facts")).getText();
    check("Firefox: inspection reports Contributor capability without Creator", /Contributor capability\s*\n?\s*Yes/i.test(inspection) && /Creator capability\s*\n?\s*No/i.test(inspection), inspection.replace(/\n/g, " | ").slice(0, 240));
    check("Firefox: inspection shows the Contributor badge identity", /Founding Contributor/.test(inspection));
    check("Firefox: inspection shows Creator Incentive is not eligible for Contributor-only", /Not eligible/.test(inspection));
    check("Firefox: inspection states the financial policy is unresolved", /UNRESOLVED/.test(await driver.findElement(By.tagName("body")).getText()));

    const shot = await driver.takeScreenshot();
    writeFileSync(join(evidenceDir, "firefox-founding-memberships.png"), shot, "base64");
    console.log(`Evidence: ${join(evidenceDir, "firefox-founding-memberships.png")}`);

    // Authorization parity from an ordinary capability holder.
    await driver.executeAsyncScript(`const done = arguments[arguments.length - 1]; fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" }).then(() => done()).catch(() => done());`);
    const memberLogin = await driver.executeAsyncScript(loginScript, review.contributor?.username, review.contributor?.password);
    check("Firefox: a Contributor-only member can sign in normally", memberLogin?.status === 200, `status ${memberLogin?.status}`);
    const registryDenial = await driver.executeAsyncScript(`
      const done = arguments[arguments.length - 1];
      fetch("/api/admin/founding-memberships", { credentials: "same-origin" }).then(response => done({ status: response.status })).catch(() => done({ status: 0 }));
    `);
    check("Firefox: the Contributor-only member is refused the membership registry", registryDenial?.status === 403, `status ${registryDenial?.status}`);
    const assignDenial = await driver.executeAsyncScript(`
      const [username, done] = [arguments[0], arguments[arguments.length - 1]];
      fetch("/api/admin/founding-memberships/assign", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username, classCode: "FAA" })
      }).then(response => done({ status: response.status })).catch(() => done({ status: 0 }));
    `, review.contributor?.username);
    check("Firefox: the Contributor-only member cannot assign a membership", assignDenial?.status === 403, `status ${assignDenial?.status}`);
    const pageAttempt = await driver.executeAsyncScript(`
      const done = arguments[arguments.length - 1];
      fetch("/admin-panel", { credentials: "same-origin" }).then(response => done({ status: response.status })).catch(() => done({ status: 0 }));
    `);
    check("Firefox: the Administration Center HTML is refused to the member", pageAttempt?.status === 403, `status ${pageAttempt?.status}`);
  } finally {
    if (driver) await driver.quit().catch(() => {});
    rmSync(profileDir, { recursive: true, force: true });
    rmSync(downloadDir, { recursive: true, force: true });
  }
}

async function runChromium() {
  console.log("\n== CHROMIUM (COMPATIBILITY SMOKE) ==");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => { if (message.type() === "error") consoleErrors.push(message.text()); });
  try {
    await page.goto(`${baseUrl}/`, { waitUntil: "domcontentloaded" });
    const loginStatus = await page.evaluate(async ({ username, password }) => {
      const response = await fetch("/api/auth/login", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ username, password }) });
      return response.status;
    }, { username: admin.username, password: admin.password });
    check("Chromium: local administrator signs in", loginStatus === 200, `status ${loginStatus}`);

    await page.goto(`${baseUrl}/admin-panel#founding-memberships`, { waitUntil: "domcontentloaded" });
    await page.waitForSelector("text=FAA-001 to FAA-050", { timeout: 20000 });
    const bodyText = await page.locator("body").innerText();
    check("Chromium: class capacity and ranges render identically", bodyText.includes("FC-001 to FC-050") && bodyText.includes("FCT-001 to FCT-050") && bodyText.includes("FAA-001 to FAA-050"));
    check("Chromium: registry renders issued numbers", /FC-00\d/.test(bodyText));
    check("Chromium: no console errors on the membership view", consoleErrors.length === 0, consoleErrors.slice(0, 2).join(" | "));

    await page.selectOption("select[aria-label='Founding Membership class']", "FC");
    await page.fill("input[placeholder='existing account username']", uiAccountUsername);
    await page.fill("input[placeholder='optional administrative note']", "Chromium smoke issuance");
    await page.getByRole("button", { name: "Issue membership" }).click();
    await page.waitForFunction(() => /FC-0\d\d/.test(document.querySelector(".preview-notice")?.textContent || ""), { timeout: 20000 });
    const notice = await page.locator(".preview-notice").innerText();
    check("Chromium: duplicate issuance is refused with the existing number, never a new one", /already holds .*?(FC|FCT|FAA)-0\d\d/.test(notice), notice);

    await page.fill("input[aria-label='Account username to inspect']", review.contributor?.username || "tpi_review_contributor");
    await page.getByRole("button", { name: "Resolve capabilities" }).click();
    await page.waitForFunction(() => (document.body.textContent || "").includes("Contributor capability"), { timeout: 20000 });
    const inspection = await page.locator(".detail-facts").innerText();
    check("Chromium: capability inspection matches Firefox", /Contributor capability\s*\n?\s*Yes/i.test(inspection) && /Creator capability\s*\n?\s*No/i.test(inspection), inspection.replace(/\n/g, " | ").slice(0, 240));

    await page.screenshot({ path: join(evidenceDir, "chromium-founding-memberships.png") });
    console.log(`Evidence: ${join(evidenceDir, "chromium-founding-memberships.png")}`);
  } finally {
    await browser.close().catch(() => {});
  }
}

const accountState = await ensureUiAccount();
console.log(`UI check account ${uiAccountUsername}: ${accountState}`);
await runFirefox();
await runChromium();

console.log("\n==================================");
console.log(`PASS=${passed} FAIL=${failures.length}`);
if (failures.length) {
  console.log(`Failed: ${failures.join(" | ")}`);
  process.exit(1);
}
