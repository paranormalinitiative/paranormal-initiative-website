import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const base = process.env.TPI_REGISTRATION_BASE_URL || "http://127.0.0.1:8787";
const profile = mkdtempSync(join(tmpdir(), "tpi-registration-firefox-"));
const username = `tpi_signup_${Date.now()}`;
const email = `${username}@example.test`;
const options = new firefox.Options()
  .setBinary(process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox")
  .setProfile(profile);
const service = new firefox.ServiceBuilder(process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver");
const driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(service).build();

function cleanupLocalProbe() {
  if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) return;
  const wrangler = process.env.WRANGLER_BIN || "wrangler";
  const sql = `DELETE FROM sessions WHERE contributor_id = (SELECT id FROM contributors WHERE username = '${username}'); DELETE FROM contributors WHERE username = '${username}';`;
  try {
    execFileSync(wrangler, [
      "d1", "execute", "tpi-local-foundation",
      "--config", "wrangler.local.toml",
      "--local", "--persist-to", ".local-dev/state",
      "--command", sql, "--yes", "--json"
    ], { cwd: process.cwd(), stdio: "ignore" });
  } catch (error) {
    console.warn(`Local registration probe cleanup did not complete for ${username}.`);
  }
}

try {
  await driver.get(`${base}/member-login.html#register`);
  await driver.wait(async () => {
    const form = await driver.findElements(By.css("[data-member-register]"));
    return form.length === 1 && await form[0].isDisplayed();
  }, 15000, "member registration form did not render");

  const fill = async (name, value) => {
    const input = await driver.findElement(By.css(`[data-member-register] input[name="${name}"]`));
    await input.sendKeys(value);
  };
  await fill("displayName", "TPI Signup Probe");
  await fill("email", email);
  await fill("username", username);
  await fill("password", "sample-password-123");
  await fill("confirmPassword", "sample-password-123");
  await driver.findElement(By.css('[data-member-register] button[type="submit"]')).click();

  await driver.wait(async () => /member-home/.test(await driver.getCurrentUrl()), 15000, "successful registration did not open Member Home");
  const session = await driver.executeAsyncScript((done) => {
    fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" })
      .then(response => response.json())
      .then(payload => done(payload?.user || null))
      .catch(() => done(null));
  });
  assert.equal(session?.username, username, "the signup response did not establish the member session");
  const verificationRoute = await driver.executeAsyncScript((done) => {
    fetch("/api/auth/verify-email/request", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: "{}"
    })
      .then(async response => ({ status: response.status, body: await response.json().catch(() => ({})) }))
      .then(done)
      .catch(() => done({ status: 0, body: null }));
  });
  assert.equal(verificationRoute.status, 503, "the authenticated verification route did not return the controlled local email-provider response");
  assert.notEqual(verificationRoute.body?.error, "Not found.", "the authenticated verification route is missing");
  const savedProfile = await driver.executeAsyncScript((profile, done) => {
    fetch("/api/contributors/me/profile", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    })
      .then(async response => ({ status: response.status, body: await response.json().catch(() => ({})) }))
      .then(done)
      .catch(() => done({ status: 0, body: null }));
  }, {
    displayName: "TPI Signup Probe Updated",
    title: "Member",
    correspondence: email,
    contactName: "TPI Signup Probe Updated",
    bio: "Signup profile persistence probe.",
    commentSignatureEnabled: true,
    photoUrl: "",
    profileBannerUrl: ""
  });
  assert.equal(savedProfile.status, 200, "the newly registered member could not save a profile");
  assert.equal(savedProfile.body?.user?.bio, "Signup profile persistence probe.", "the saved profile bio was not returned");
  const persistedProfile = await driver.executeAsyncScript((done) => {
    fetch("/api/auth/me", { credentials: "same-origin", cache: "no-store" })
      .then(response => response.json())
      .then(payload => done(payload?.user || null))
      .catch(() => done(null));
  });
  assert.equal(persistedProfile?.displayName, "TPI Signup Probe Updated", "the profile display name was not retained");
  assert.equal(persistedProfile?.bio, "Signup profile persistence probe.", "the profile bio was not retained after reload");
  console.log("PASS Firefox local member registration creates an account, establishes a session, opens Member Home, and retains profile edits");
} finally {
  try { await driver.quit(); } finally { cleanupLocalProbe(); }
}
