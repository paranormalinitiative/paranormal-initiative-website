#!/usr/bin/env node

// Firefox acceptance for the shared member profile/feed surface.
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By, until } from "selenium-webdriver";
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

  await driver.get(`${base}/member-profile`);
  await waitFor("own profile mode", async () => driver.executeScript("return document.body.classList.contains('member-profile-mode') && !document.querySelector('[data-member-profile-view]').hidden"));
  const ownProfileState = await driver.executeScript("var banner=document.querySelector('[data-member-profile-banner]'), composer=document.querySelector('[data-member-composer]'), options=document.querySelector('[data-profile-options]'), setup=document.querySelector('[data-profile-setup]'), about=document.querySelector('[data-profile-about]'), aboutToggle=document.querySelector('[data-profile-about-toggle]'), menu=document.querySelector('[data-profile-options-panel]'), tab=document.querySelector('[data-feed-tab]'), rail=document.querySelector('[data-home-rail]'), pulse=document.querySelector('[data-rail-pulse]'), pulseLink=document.querySelector('.rail-pulse-link'), recognition=document.querySelector('[data-rail-recognition]'), news=document.querySelector('[data-rail-news]'), copy=document.querySelector('.member-profile-copy'), name=document.querySelector('[data-member-name]'), username=document.querySelector('[data-member-username]'), title=document.querySelector('[data-member-title]'), role=document.querySelector('[data-member-role]'), headingRow=document.querySelector('.member-profile-heading-row'); return {banner:!!banner&&banner.getAttribute('src').includes('tpi-banner.png'),composer:!!composer&&!composer.hidden,options:!!options&&!options.hidden,setupAbsent:!setup,identityOrder:Boolean(copy&&name&&username&&title&&role&&copy.contains(name)&&copy.contains(username)&&copy.contains(title)&&copy.contains(role)&&name.compareDocumentPosition(username)&Node.DOCUMENT_POSITION_FOLLOWING&&username.compareDocumentPosition(title)&Node.DOCUMENT_POSITION_FOLLOWING&&title.compareDocumentPosition(role)&Node.DOCUMENT_POSITION_FOLLOWING),headingPadding:headingRow&&getComputedStyle(headingRow).paddingTop,roleBadgePadding:role&&getComputedStyle(role).padding,aboutInitiallyHidden:!!about&&about.hidden,aboutToggleVisible:!!aboutToggle&&!aboutToggle.hidden,editMenuRemoved:!!menu&&!menu.querySelector('[data-profile-option-edit]'),tab:tab&&tab.textContent.trim(),pulseHref:pulseLink&&pulseLink.getAttribute('href'),recognitionShell:Boolean(recognition),recognitionBetweenPulseAndNews:Boolean(rail&&pulse&&recognition&&news&&pulse.nextElementSibling===recognition&&recognition.nextElementSibling===news),recognitionTriggers:document.querySelectorAll('[data-recognition-trigger]').length};");
  check("a member's saved banner remains visible on their own profile", ownProfileState.banner && ownProfileState.options, JSON.stringify(ownProfileState));
  check("redundant Profile Setup card is removed", ownProfileState.setupAbsent, JSON.stringify(ownProfileState));
  check("name, handle, title, and access badge are nested in order", ownProfileState.identityOrder, JSON.stringify(ownProfileState));
  check("profile name block sits lower beneath the banner", ownProfileState.headingPadding === "108px", JSON.stringify(ownProfileState));
  check("access role displays as a neat badge beneath the title", ownProfileState.roleBadgePadding === "7px 10px", JSON.stringify(ownProfileState));
  check("About starts hidden behind its profile tab", ownProfileState.aboutInitiallyHidden && ownProfileState.aboutToggleVisible, JSON.stringify(ownProfileState));
  check("profile options no longer expose a second edit-profile entry", ownProfileState.editMenuRemoved, JSON.stringify(ownProfileState));
  check("own profile keeps the post composer", ownProfileState.composer, JSON.stringify(ownProfileState));
  check("own profile labels the feed as Profile Feed", ownProfileState.tab === "Profile Feed", JSON.stringify(ownProfileState));
  check("My Pulse View Profile opens the member home profile", ownProfileState.pulseHref === `/member-home?username=${encodeURIComponent(account.username)}`, JSON.stringify(ownProfileState));
  check("own profile includes the Honors & Distinctions rail position", ownProfileState.recognitionShell && ownProfileState.recognitionBetweenPulseAndNews, JSON.stringify(ownProfileState));

  const aboutToggle = await driver.findElement(By.css('[data-profile-about-toggle]'));
  await aboutToggle.click();
  const aboutOpen = await driver.executeScript("var about=document.querySelector('[data-profile-about]'), toggle=document.querySelector('[data-profile-about-toggle]'); return {hidden:about.hidden,expanded:toggle.getAttribute('aria-expanded'),paragraphs:about.querySelectorAll('.member-profile-bio p').length};");
  check("About tab opens the biography panel", !aboutOpen.hidden && aboutOpen.expanded === "true", JSON.stringify(aboutOpen));
  await aboutToggle.click();
  check("clicking About again hides the biography", await driver.executeScript("return document.querySelector('[data-profile-about]').hidden && document.querySelector('[data-profile-about-toggle]').getAttribute('aria-expanded')==='false'"));

  await driver.get(`${base}/member-profile?username=${encodeURIComponent(target.username)}`);
  await waitFor("profile mode", async () => driver.executeScript("return document.body.classList.contains('member-profile-mode') && !document.querySelector('[data-member-profile-view]').hidden"));
  await waitFor("Messenger shell", async () => driver.executeScript("return Boolean(document.querySelector('[data-member-floating-chat]'))"));
  await driver.executeScript("var minimize=document.querySelector('[data-chat-minimize]'); if (minimize) minimize.click();");
  await waitFor("Messenger hide before profile actions", async () => driver.executeScript("var chat=document.querySelector('[data-member-floating-chat]'); return !chat || chat.classList.contains('is-hidden')"));
  const profileState = await driver.executeScript(`var identity=document.querySelector('[data-member-profile-view]'), feed=document.querySelector('[data-member-feed]'), tab=document.querySelector('[data-feed-tab]'), cards=document.querySelectorAll('.feed-card'), main=document.querySelector('.member-home-main'), rect=main.getBoundingClientRect();
    return {identity:Boolean(identity&&!identity.hidden),feed:Boolean(feed),tab:tab&&tab.textContent.trim(),cards:cards.length,profileMode:document.body.classList.contains('member-profile-mode'),scrollWidth:document.documentElement.scrollWidth,innerWidth:innerWidth,mainWidth:rect.width};`);
  check("profile mode renders the identity section", profileState.identity && profileState.profileMode, JSON.stringify(profileState));
  check("profile mode labels the shared feed as Profile Feed", profileState.tab === "Profile Feed", JSON.stringify(profileState));
  check("profile mode keeps the page within the viewport", profileState.scrollWidth <= profileState.innerWidth + 1, JSON.stringify(profileState));
  const visitorRailState = await driver.executeScript("var rail=document.querySelector('[data-home-rail]'), pulse=document.querySelector('[data-rail-pulse]'), news=document.querySelector('[data-rail-news]'); return {visible:!!rail&&!rail.hidden&&getComputedStyle(rail).display!=='none',pulse:!!pulse&&!pulse.hidden,news:!!news&&!news.hidden};");
  check("visiting another member keeps the shared right rail visible", visitorRailState.visible && visitorRailState.pulse && visitorRailState.news, JSON.stringify(visitorRailState));
  const blankBannerState = await driver.executeScript("var banner=document.querySelector('[data-member-profile-banner]'), cover=document.querySelector('.member-profile-cover'); return {hidden:banner&&banner.hidden,src:banner&&banner.getAttribute('src'),hasBanner:cover&&cover.getAttribute('data-has-banner')};");
  check("profiles without a chosen banner show an empty banner area", blankBannerState.hidden && !blankBannerState.src && blankBannerState.hasBanner === "false", JSON.stringify(blankBannerState));

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

  const allAccessUsername = "tpi_review_allaccess";
  await driver.get(`${base}/member-home?username=${encodeURIComponent(allAccessUsername)}`);
  await waitFor("Founding All-Access profile", async () => driver.executeScript("return document.body.classList.contains('member-profile-mode') && !document.querySelector('[data-member-profile-view]').hidden && !document.querySelector('[data-member-membership]').hidden"));
  await driver.wait(async () => Number(await driver.findElement(By.css("[data-member-membership-badge]")).getAttribute("naturalWidth")) > 0, 8000);
  const membershipState = await driver.executeScript("var badge=document.querySelector('[data-member-membership]'), image=document.querySelector('[data-member-membership-badge]'), role=document.querySelector('[data-member-role]'), label=document.querySelector('[data-member-membership-label]'), number=document.querySelector('[data-member-membership-number]'); return {visible:!!badge&&!badge.hidden,label:label&&label.textContent.trim(),number:number&&number.textContent.trim(),alt:image&&image.alt,loaded:image&&image.naturalWidth>0,cacheVersion:image&&new URL(image.src).searchParams.get('tpi-recognition'),roleHidden:role&&role.hidden};");
  check("Founding All-Access renders one badge with its number", membershipState.visible && membershipState.label === "Founding All-Access" && /^FAA-\d{3}$/.test(membershipState.number), JSON.stringify(membershipState));
  check("All-Access badge artwork loads from the current cache version and replaces the legacy Member Access label", membershipState.loaded && membershipState.alt === "Founding All-Access badge" && membershipState.cacheVersion === "20261111" && membershipState.roleHidden, JSON.stringify(membershipState));
  const honorsState = await driver.executeScript("var profile=document.querySelector('[data-member-profile-view]'), tabs=profile&&profile.querySelector('.member-profile-tabs'), wall=profile&&profile.querySelector('[data-member-profile-honors]'), cards=wall&&wall.querySelectorAll('.profile-recognition-item'), rail=document.querySelector('[data-rail-recognition]'), railCards=rail&&rail.querySelectorAll('[data-recognition-trigger]'), image=cards&&cards[0]&&cards[0].querySelector('img'); return {visible:!!wall&&!wall.hidden,afterTabs:!!(tabs&&wall&&tabs.compareDocumentPosition(wall)&Node.DOCUMENT_POSITION_FOLLOWING),cards:cards?cards.length:0,cardTitle:cards&&cards[0]&&cards[0].querySelector('.rail-recognition-title')?.textContent.trim(),cardNumber:cards&&cards[0]&&cards[0].querySelector('.rail-recognition-detail')?.textContent.trim(),imageWidth:image&&getComputedStyle(image).width,imageHeight:image&&getComputedStyle(image).height,described:!!(cards&&cards[0]&&cards[0].dataset.recognitionDescription),railVisible:!!rail&&!rail.hidden,railCards:railCards?railCards.length:0,railTitle:railCards&&railCards[0]&&railCards[0].querySelector('.rail-recognition-title')?.textContent.trim()};");
  check("member profile shows one compact matching honors tile below its profile tabs", honorsState.visible && honorsState.afterTabs && honorsState.cards === 1 && honorsState.cardTitle === "Founding All-Access" && honorsState.cardNumber === "FAA-001" && honorsState.described && honorsState.imageWidth === "72px" && honorsState.imageHeight === "72px", JSON.stringify(honorsState));
  check("the right rail also shows this profile's Honors & Distinctions", honorsState.railVisible && honorsState.railCards === 1 && honorsState.railTitle === "Founding All-Access", JSON.stringify(honorsState));
  const memberBadge = await driver.findElement(By.css("[data-member-membership]"));
  await memberBadge.click();
  const membershipModal = await driver.wait(until.elementLocated(By.css(".recognition-modal:not([hidden])")), 5000);
  const membershipModalText = await membershipModal.getText();
  check("the membership badge explains its dual Creator + Contributor class", membershipModalText.includes("Founding All-Access") && membershipModalText.includes("FAA-001") && membershipModalText.includes("Creator + Contributor") && !membershipModalText.includes("Founding Founding"), membershipModalText);
  await membershipModal.findElement(By.css(".recognition-modal-close[data-recognition-close]")).click();
  const wallBadge = await driver.findElement(By.css("[data-member-profile-honors] [data-recognition-trigger]"));
  await wallBadge.click();
  const wallModal = await driver.wait(until.elementLocated(By.css(".recognition-modal:not([hidden])")), 5000);
  check("the honors wall medallion opens the same details", (await wallModal.getText()).includes("Founding All-Access") && (await wallModal.getText()).includes("FAA-001"));
  await wallModal.findElement(By.css(".recognition-modal-close[data-recognition-close]")).click();
  const profileTitleState = await driver.executeScript("var title=document.querySelector('[data-member-title]'); return {text:title&&title.textContent.trim(),hidden:title&&title.hidden};");
  check("generic Member text does not remain as a misleading profile title", profileTitleState.text !== "Member" || profileTitleState.hidden, JSON.stringify(profileTitleState));

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
