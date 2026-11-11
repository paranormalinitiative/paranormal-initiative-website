#!/usr/bin/env node

// Firefox acceptance for the shared member profile/feed surface.
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const root = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_PROFILE_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentials = JSON.parse(readFileSync(resolve(root, ".local-dev/local-auth-credentials.json"), "utf8"));
const account = credentials.accounts.local_member;
const target = credentials.accounts.test_admin;
if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) throw new Error("This acceptance is local-only.");
for (const file of [firefoxBinary, geckodriver]) if (!existsSync(file)) throw new Error(`Required browser input is unavailable: ${file}`);

const results = [];
const check = (name, passed, detail = "") => {
  results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
const safe = error => error instanceof Error ? error.message : String(error);
let driver;

async function waitFor(description, predicate, timeout = 20_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try { if (await predicate()) return; } catch {}
    await sleep(200);
  }
  throw new Error(`${description} timed out`);
}

async function loginOnOrigin() {
  return driver.executeAsyncScript(`var done=arguments[arguments.length-1], username=arguments[0], password=arguments[1];
    fetch('/api/auth/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username,password:password})})
      .then(function(response){return response.json().catch(function(){return {};}).then(function(body){done({status:response.status,user:body.user||null});});})
      .catch(function(error){done({status:0,error:String(error)});});`, account.username, account.password);
}

try {
  const profile = mkdtempSync(join(tmpdir(), "tpi-member-profile-firefox-"));
  const options = new firefox.Options().setBinary(firefoxBinary).addArguments("-profile", profile, "-no-remote", "-new-instance");
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 30_000 });
  await driver.manage().window().setRect({ width: 1280, height: 900 });
  await driver.get(`${base}/member-login.html`);
  const login = await loginOnOrigin();
  check("Firefox authenticates the synthetic member", login?.status === 200 && Boolean(login?.user));
  await driver.executeAsyncScript(`var done=arguments[arguments.length-1], targetUsername=arguments[0];
    Promise.all([
      fetch('/api/friends/unfollow',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({targetUsername:targetUsername})}),
      fetch('/api/friends/request/cancel',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({targetUsername:targetUsername})})
    ]).then(function(){done(true);}).catch(function(){done(false);});`, target.username);

  await driver.get(`${base}/member-home?username=${encodeURIComponent(target.username)}`);
  await waitFor("profile mode", async () => driver.executeScript("return document.body.classList.contains('member-profile-mode') && !document.querySelector('[data-member-profile-view]').hidden"));
  await waitFor("Messenger shell", async () => driver.executeScript("return Boolean(document.querySelector('[data-member-floating-chat]'))"));
  await driver.executeScript("var minimize=document.querySelector('[data-chat-minimize]'); if (minimize) minimize.click();");
  await waitFor("Messenger hide before profile actions", async () => driver.executeScript("var chat=document.querySelector('[data-member-floating-chat]'); return !chat || chat.classList.contains('is-hidden')"));
  const profileState = await driver.executeScript(`var identity=document.querySelector('[data-member-profile-view]'), feed=document.querySelector('[data-member-feed]'), tab=document.querySelector('[data-feed-tab]'), cards=document.querySelectorAll('.feed-card'), main=document.querySelector('.member-home-main'), rect=main.getBoundingClientRect();
    return {identity:Boolean(identity&&!identity.hidden),feed:Boolean(feed),tab:tab&&tab.textContent.trim(),cards:cards.length,profileMode:document.body.classList.contains('member-profile-mode'),scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth,mainWidth:rect.width};`);
  check("profile mode renders the identity section", profileState.identity && profileState.profileMode, JSON.stringify(profileState));
  check("profile mode labels the shared feed as Profile Feed", profileState.tab === "Profile Feed", JSON.stringify(profileState));
  check("profile mode keeps the page within the viewport", profileState.scrollWidth <= profileState.innerWidth + 1, JSON.stringify(profileState));

  const followButton = await driver.findElement(By.css("[data-profile-follow]"));
  check("profile exposes Follow", await followButton.isDisplayed());
  await followButton.click();
  await sleep(800);
  const followedState = await driver.executeScript("var button=document.querySelector('[data-profile-follow]'); return {text:button&&button.textContent.trim(),disabled:button&&button.disabled,following:window.TPIApi&&typeof window.TPIApi.followMember==='function'};");
  check("Follow changes to Following", followedState.text === "Following", JSON.stringify(followedState));
  await followButton.click();
  await sleep(800);
  const unfollowedState = await driver.executeScript("var button=document.querySelector('[data-profile-follow]'); return {text:button&&button.textContent.trim(),disabled:button&&button.disabled};");
  check("Following can be reversed", unfollowedState.text === "Follow", JSON.stringify(unfollowedState));

  const friendButton = await driver.findElement(By.css("[data-profile-friend]"));
  const friendInitial = await driver.executeScript("var button=document.querySelector('[data-profile-friend]'); return {text:button&&button.textContent.trim(),hidden:button&&button.hidden,display:button&&getComputedStyle(button).display,disabled:button&&button.disabled};");
  check("profile exposes Add Friend", await friendButton.isDisplayed() && friendInitial.text === "Add Friend", JSON.stringify(friendInitial));
  await friendButton.click();
  await sleep(800);
  const friendPendingState = await driver.executeScript("var button=document.querySelector('[data-profile-friend]'); return {text:button&&button.textContent.trim(),disabled:button&&button.disabled};");
  check("Add Friend changes to Request Sent", friendPendingState.text === "Request Sent", JSON.stringify(friendPendingState));
  await driver.executeAsyncScript(`var done=arguments[arguments.length-1]; fetch('/api/friends/request/cancel',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({targetUsername:arguments[0]})}).then(function(r){done(r.status);}).catch(function(){done(0);});`, target.username);

  await driver.get(`${base}/member-home`);
  await waitFor("community home", async () => driver.executeScript("return !document.body.classList.contains('member-profile-mode') && document.querySelector('[data-feed-tab]')?.textContent.trim()==='Community Feed'"));
  const homeState = await driver.executeScript("var composer=document.querySelector('[data-member-composer]'), discovery=document.querySelector('[data-member-discovery]'); return {composer:!!composer&&!composer.hidden,discovery:!!discovery&&!discovery.hidden};");
  check("community home keeps the composer and discovery controls", homeState.composer && homeState.discovery, JSON.stringify(homeState));
} catch (error) {
  check("focused Firefox profile/feed acceptance completes", false, safe(error));
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter(item => !item.passed);
console.log(JSON.stringify({ suite: "TPI-MEMBER-PROFILE-FEED", status: failed.length ? "FAIL" : "PASS", browser: "Firefox Developer Edition", environment: base, passed: results.length - failed.length, total: results.length, failed }, null, 2));
if (failed.length) process.exit(1);
