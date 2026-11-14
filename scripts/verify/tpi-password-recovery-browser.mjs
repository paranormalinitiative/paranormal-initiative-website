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
    window.TPIApi.isAvailable = async () => false;
    window.TPIApi.me = async () => ({ user: { username: "synthetic_member" } });
    window.TPIApi.requestPasswordReset = async data => { window.__recoveryCalls.push({ type: "request", data }); return { message: "Code requested" }; };
    window.TPIApi.confirmPasswordReset = async data => {
      window.__recoveryCalls.push({ type: "confirm", data });
      if (data.code === "00000000") throw new Error("That reset code is invalid or expired.");
      return { ok: true, signedIn: true };
    };
    const originalSetTimeout = window.setTimeout;
    window.setTimeout = (fn, delay, ...args) => {
      if (delay === 1500) {
        window.__recoveryRedirect = { fn, delay };
        return 1;
      }
      return originalSetTimeout(fn, delay, ...args);
    };
  });
  const fill = async (name, value, form) => driver.findElement(By.css(`${form} input[name="${name}"]`)).sendKeys(value);
  await fill("email", "example@example.com", "[data-password-reset-request]");
  await driver.findElement(By.css('[data-password-reset-request] button[type="submit"]')).click();
  await driver.wait(async () => (await driver.executeScript(() => window.__recoveryCalls.length)) === 1, 10000, "reset request did not reach API");
  assert.deepEqual(await driver.executeScript(() => window.__recoveryCalls[0]), { type: "request", data: { email: "example@example.com" } });
  await driver.findElement(By.css('[data-password-reset-request] input[name="email"]')).clear();
  await fill("code", "00000000", "[data-password-reset-confirm]");
  await fill("password", "sample-password-123", "[data-password-reset-confirm]");
  await fill("confirmPassword", "sample-password-123", "[data-password-reset-confirm]");
  await driver.findElement(By.css('[data-password-reset-confirm] button[type="submit"]')).click();
  await driver.wait(async () => (await driver.executeScript(() => window.__recoveryCalls.length)) === 2, 10000, "invalid reset did not reach API");
  await driver.wait(async () => /invalid or expired/.test(await driver.findElement(By.css("[data-password-recovery-status]")).getText()), 10000);
  assert.equal(await driver.findElement(By.css("[data-password-recovery-home]")).isDisplayed(), false);
  const codeInput = driver.findElement(By.css('[data-password-reset-confirm] input[name="code"]'));
  await codeInput.clear();
  await codeInput.sendKeys("12345678");
  await driver.findElement(By.css('[data-password-reset-confirm] button[type="submit"]')).click();
  await driver.wait(async () => (await driver.executeScript(() => window.__recoveryCalls.length)) === 3, 10000, "valid reset did not reach API");
  assert.deepEqual(await driver.executeScript(() => window.__recoveryCalls[2]), { type: "confirm", data: { code: "12345678", password: "sample-password-123" } });
  await driver.wait(async () => /Password saved. Opening Member Home/.test(await driver.findElement(By.css("[data-password-recovery-status]")).getText()), 10000);
  assert.equal(await driver.findElement(By.css("[data-password-recovery-home]")).isDisplayed(), true);
  assert.equal(await driver.executeScript(() => window.__recoveryRedirect?.delay), 1500);
  const passwordInput = driver.findElement(By.css("#member-login-password"));
  const eye = driver.findElement(By.css("[data-toggle-password]"));
  assert.equal(await passwordInput.getAttribute("type"), "password");
  await eye.click();
  assert.equal(await passwordInput.getAttribute("type"), "text");
  assert.equal(await eye.getAttribute("aria-label"), "Hide password");
  await eye.click();
  assert.equal(await passwordInput.getAttribute("type"), "password");
  if (!["127.0.0.1", "localhost"].includes(new URL(base).hostname)) {
    await driver.executeScript(() => {
      window.__loginCalls = [];
      window.TPIApi.login = async (username, password) => {
        window.__loginCalls.push({ username, password });
        return new Promise(() => {});
      };
    });
    await fill("username", "synthetic_member", "[data-member-login]");
    await fill("password", "sample-password-123", "[data-member-login]");
    await driver.findElement(By.css('[data-member-login] button[type="submit"]')).click();
    await driver.wait(async () => (await driver.executeScript(() => window.__loginCalls.length)) === 1, 10000, "hosted login did not reach API");
    assert.deepEqual(await driver.executeScript(() => window.__loginCalls[0]), { username: "synthetic_member", password: "sample-password-123" });
    assert.match(await driver.findElement(By.css("[data-login-status]")).getText(), /Signing in/);
    await driver.executeScript(() => {
      window.__memberRegistrationCalls = [];
      window.TPIApi.registerMember = async data => {
        window.__memberRegistrationCalls.push(data);
        return new Promise(() => {});
      };
    });
    await fill("displayName", "Synthetic Member", "[data-member-register]");
    await fill("email", "synthetic@example.com", "[data-member-register]");
    await fill("username", "synthetic_member_2", "[data-member-register]");
    await fill("password", "sample-password-123", "[data-member-register]");
    await fill("confirmPassword", "sample-password-123", "[data-member-register]");
    await driver.findElement(By.css('[data-member-register] button[type="submit"]')).click();
    await driver.wait(async () => (await driver.executeScript(() => window.__memberRegistrationCalls.length)) === 1, 10000, "hosted registration did not reach API");
    assert.match(await driver.findElement(By.css("[data-member-register-status]")).getText(), /Creating your member account/);
  }
  console.log("PASS: Firefox recovery and password eye work; hosted sign-in and registration reach the live API when availability probing fails");
} finally {
  await driver.quit();
}
