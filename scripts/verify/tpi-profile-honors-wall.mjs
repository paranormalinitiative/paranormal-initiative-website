#!/usr/bin/env node

// Focused, read-only profile acceptance. Uses an isolated Firefox Developer
// Edition profile and a local synthetic public profile; it never mutates D1/R2.
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, until } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const baseUrl = process.env.TPI_REVIEW_BASE_URL || "http://127.0.0.1:8787";
const username = process.env.TPI_PROFILE_REVIEW_USERNAME || "tpi_review_allaccess";
const binary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const checks = [];
const check = (name, passed, detail = "") => { checks.push({ name, passed: Boolean(passed), detail }); console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`); };

if (!existsSync(binary) || !existsSync(geckodriver)) {
  console.log(JSON.stringify({ status: "UNVERIFIED", reason: "Firefox Developer Edition or geckodriver unavailable.", checks }, null, 2));
  process.exit(2);
}

const apiResponse = await fetch(`${baseUrl}/api/contributors/profile?username=${encodeURIComponent(username)}`);
const api = await apiResponse.json();
check("public profile API responds", apiResponse.ok, `status ${apiResponse.status}`);
check("profile API keeps Community Feed posts out of profiles", !Object.prototype.hasOwnProperty.call(api, "wallPosts"));
check("profile API resolves recognition data", Boolean(
  api.foundingMembership?.badge ||
  api.boardMembership?.badgePath ||
  (Array.isArray(api.leadershipDistinctions) && api.leadershipDistinctions.length)
));
const honorsExpected = Boolean(api.boardMembership?.badgePath || (Array.isArray(api.leadershipDistinctions) && api.leadershipDistinctions.length));

const profileDir = mkdtempSync(join(tmpdir(), "tpi-profile-firefox-"));
let driver;
try {
  const options = new firefox.Options().setBinary(binary).addArguments("-profile", profileDir).addArguments("-no-remote").addArguments("-headless");
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  // Use the canonical route. The legacy .html path redirects here, but Firefox
  // can retain the pre-redirect visibility state for the recognition trigger.
  await driver.get(`${baseUrl}/contributor-profile?username=${encodeURIComponent(username)}`);
  await driver.wait(until.elementLocated(By.css(".public-profile-card")), 20000);
  const trigger = await driver.wait(until.elementLocated(By.css(".public-profile-sidebar .profile-recognition-trigger")), 20000);
  const geometry = await trigger.getRect();
  check("recognition artwork renders as an accessible trigger", geometry.width > 0 && geometry.height > 0);
  check("recognition artwork has a usable rendered size", geometry.width >= 60 && geometry.height >= 60, `${Math.round(geometry.width)}x${Math.round(geometry.height)}`);
  await trigger.click();
  const modal = await driver.wait(until.elementLocated(By.css(".recognition-modal:not([hidden])")), 5000);
  check("recognition details modal opens from the profile", await modal.isDisplayed());
  const recognitionTitle = await trigger.getAttribute("data-recognition-title");
  const modalText = await modal.getText();
  check("modal identifies the recognition", recognitionTitle && modalText.includes(recognitionTitle), `${recognitionTitle || "missing title"}`);
  const modalImage = await modal.findElement(By.css("[data-recognition-modal-image]"));
  await driver.wait(async () => Number(await modalImage.getAttribute("naturalWidth")) > 0, 5000).catch(() => {});
  check("modal artwork loads", Number(await modalImage.getAttribute("naturalWidth")) > 0);
  await modal.findElement(By.css(".recognition-modal-close[data-recognition-close]")).click();
  check("recognition details modal closes", (await driver.findElements(By.css(".recognition-modal:not([hidden])"))).length === 0);
  check("honors shelf matches the member's recognition records", (await driver.findElements(By.css(".profile-recognition-shelf"))).length === (honorsExpected ? 1 : 0));
  check("recognition disclaimer is removed", !(await driver.findElement(By.css("body")).getText()).includes("Visual recognition only"));
  check("profile wall is removed", (await driver.findElements(By.css(".public-profile-wall"))).length === 0);
  const cards = await driver.findElements(By.css(".profile-recognition-card"));
  if (honorsExpected && cards.length >= 2) {
    const firstCardText = await cards[0].getText();
    const secondCardText = await cards[1].getText();
    check("honors shelf starts with the distinction", firstCardText.includes("Medallion"));
    check("board member follows the distinction", secondCardText.includes("Board Member"));
  }
  const boardTriggers = await driver.findElements(By.css(".board-member-badge-trigger"));
  if (boardTriggers.length) {
    check("board member uses one standalone badge", boardTriggers.length === 1, `${boardTriggers.length} badge images`);
    const boardImage = await boardTriggers[0].findElement(By.css("img"));
    await driver.wait(async () => Number(await boardImage.getAttribute("naturalWidth")) > 0, 5000).catch(() => {});
    check("board member badge artwork loads", Number(await boardImage.getAttribute("naturalWidth")) > 0);
    check("recognition artwork has no colored backing", await driver.executeScript(() => {
      const image = document.querySelector(".board-member-badge-trigger img");
      const trigger = image?.closest(".profile-recognition-trigger");
      return Boolean(image && trigger && getComputedStyle(trigger).backgroundColor === "rgba(0, 0, 0, 0)" && getComputedStyle(image).backgroundColor === "rgba(0, 0, 0, 0)");
    }));
  }
  check("board member does not render a second medallion", (await driver.findElements(By.css(".board-member-medallion-trigger"))).length === 0);
} finally {
  if (driver) await driver.quit().catch(() => {});
  rmSync(profileDir, { recursive: true, force: true });
}

const failed = checks.filter(item => !item.passed);
console.log(JSON.stringify({ suite: "TPI-PROFILE-HONORS-WALL", status: failed.length ? "FAIL" : "PASS", browser: "Firefox Developer Edition", baseUrl, checks, passed: checks.length - failed.length, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);
