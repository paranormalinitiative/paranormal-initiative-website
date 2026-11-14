import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const base = process.env.TPI_RECOVERY_BASE_URL || "http://127.0.0.1:8787";
const profile = mkdtempSync(join(tmpdir(), "tpi-recovery-firefox-"));
const options = new firefox.Options().setBinary(process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox").setProfile(profile);
const service = new firefox.ServiceBuilder(process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver");
const driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(service).build();
try {
  await driver.get(`${base}/member-login.html`);
  await driver.wait(async () => {
    const elements = await driver.findElements(By.css("[data-forgot-password-toggle]"));
    return elements.length === 1 && await elements[0].isDisplayed();
  }, 15000);
  await driver.findElement(By.css("[data-forgot-password-toggle]")).click();
  const state = await driver.executeScript(() => {
    const recovery = document.querySelector("[data-password-recovery]");
    const request = recovery?.querySelector("[data-password-reset-request]");
    const confirm = recovery?.querySelector("[data-password-reset-confirm]");
    const button = confirm?.querySelector('button[type="submit"]');
    const email = request?.querySelector('input[name="email"]');
    const rect = button?.getBoundingClientRect();
    return { recoveryVisible: Boolean(recovery && !recovery.hidden), buttonVisible: Boolean(button && getComputedStyle(button).display !== "none" && rect.height > 0), buttonText: button?.textContent.trim(), emailRequiredOnlyForRequest: Boolean(email?.required && !confirm?.contains(email)) };
  });
  assert.deepEqual(state, { recoveryVisible: true, buttonVisible: true, buttonText: "Save New Password", emailRequiredOnlyForRequest: true });

  await driver.executeScript(() => {
    window.__recoveryCalls = [];
    window.TPIApi.isAvailable = async () => true;
    window.TPIApi.requestPasswordReset = async data => { window.__recoveryCalls.push({ type: "request", data }); return { message: "Code requested" }; };
    window.TPIApi.confirmPasswordReset = async data => { window.__recoveryCalls.push({ type: "confirm", data }); return { ok: true }; };
  });
  const fill = async (name, value, form) => driver.findElement(By.css(`${form} input[name="${name}"]`)).sendKeys(value);
  await fill("code", "12345678", "[data-password-reset-confirm]");
  await fill("password", "sample-password-123", "[data-password-reset-confirm]");
  await fill("confirmPassword", "sample-password-123", "[data-password-reset-confirm]");
  await driver.findElement(By.css('[data-password-reset-confirm] button[type="submit"]')).click();
  await driver.wait(async () => (await driver.executeScript(() => window.__recoveryCalls.length)) === 1, 10000);
  assert.deepEqual(await driver.executeScript(() => window.__recoveryCalls[0]), { type: "confirm", data: { code: "12345678", password: "sample-password-123" } });
  assert.match(await driver.findElement(By.css("#member-login-status")).getText(), /Password updated/);
  console.log("PASS: Firefox shows the save action and confirms a code without requiring an email field");
} finally {
  await driver.quit();
}
