#!/usr/bin/env node

import assert from "node:assert/strict";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const root = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_COMMUNITY_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentials = JSON.parse(readFileSync(resolve(root, ".local-dev/local-auth-credentials.json"), "utf8"));
const account = credentials.accounts.local_member;
const urls = ["https://youtu.be/qB3dMpROEdE", "https://youtu.be/nXyaLOYIZso"];

if (!/^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base)) throw new Error("This acceptance is local-only.");
for (const file of [firefoxBinary, geckodriver]) if (!existsSync(file)) throw new Error(`Required browser input is unavailable: ${file}`);

const profile = mkdtempSync(join(tmpdir(), "tpi-community-youtube-firefox-"));
const options = new firefox.Options()
  .setBinary(firefoxBinary)
  .addArguments("-profile", profile, "-no-remote", "-new-instance", "-headless")
  .setPreference("permissions.default.image", 2);
const driver = await new Builder()
  .forBrowser("firefox")
  .setFirefoxOptions(options)
  .setFirefoxService(new firefox.ServiceBuilder(geckodriver))
  .build();

let postId = "";
try {
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 30_000 });
  await driver.manage().window().setRect({ width: 1280, height: 900 });
  await driver.get(`${base}/member-login.html`);
  const login = await driver.executeAsyncScript(`var done=arguments[arguments.length-1], username=arguments[0], password=arguments[1];
    fetch('/api/auth/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username,password:password})})
      .then(function(response){return response.json().catch(function(){return {};}).then(function(body){done({status:response.status,user:body.user||null});});})
      .catch(function(error){done({status:0,error:String(error)});});`, account.username, account.password);
  assert.equal(login.status, 200, JSON.stringify(login));

  const created = await driver.executeAsyncScript(`var done=arguments[arguments.length-1], urls=arguments[0];
    fetch('/api/community/posts',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({
      categoryId:'general',title:'Synthetic YouTube preview acceptance',body:'Disposable browser verification post.',
      attachments:urls.map(function(url){return {url:url,name:'youtu.be',contentType:'text/html',mediaType:'link'};})
    })}).then(function(response){return response.json().catch(function(){return {};}).then(function(body){done({status:response.status,body:body});});})
      .catch(function(error){done({status:0,error:String(error)});});`, urls);
  assert.equal(created.status, 200, JSON.stringify(created));
  postId = created.body.postId || created.body.post?.id || "";
  assert.ok(postId);

  await driver.get(`${base}/member-home?member=1&post=${encodeURIComponent(postId)}#post-${encodeURIComponent(postId)}`);
  await driver.wait(async () => (await driver.findElements(By.css(`#post-${postId} [data-youtube-preview]`))).length === 2, 20_000);
  // Desktop member pages may mount Messenger open by default. It is unrelated
  // to this feed interaction, so apply the component's existing hidden state
  // before the real Play-button click if that fixed surface is mounted.
  const messenger = await driver.findElements(By.css(".member-floating-chat"));
  if (messenger.length) {
    // A member page can restore more than one chat frame from browser-local
    // layout state. Hide every restored frame so Messenger cannot intercept
    // the feed's Play control during this unrelated acceptance.
    await driver.executeScript("Array.from(document.querySelectorAll('.member-floating-chat, .member-chat-list')).forEach(function(node){ node.classList.add('is-hidden'); node.style.setProperty('display','none','important'); node.style.setProperty('pointer-events','none','important'); });");
  }
  const state = await driver.executeScript(`var card=document.getElementById('post-'+arguments[0]); return {
    previews:Array.from(card.querySelectorAll('[data-youtube-preview]')).map(function(node){return {
      id:node.getAttribute('data-youtube-preview'), title:node.querySelector('.link-preview-title')?.textContent.trim(),
      image:node.querySelector('img')?.getAttribute('src'), playLabel:node.querySelector('[data-youtube-play]')?.getAttribute('aria-label'),
      external:node.querySelector('.youtube-preview-external')?.getAttribute('href')
    }}), links:card.querySelectorAll('.feed-link-chip').length
  };`, postId);
  assert.equal(state.previews.length, 2);
  assert.deepEqual(state.previews.map(item => item.id), ["qB3dMpROEdE", "nXyaLOYIZso"]);
  assert.deepEqual(state.previews.map(item => item.image), [
    "https://i.ytimg.com/vi/qB3dMpROEdE/hqdefault.jpg",
    "https://i.ytimg.com/vi/nXyaLOYIZso/hqdefault.jpg"
  ]);
  assert.ok(state.previews.every(item => /Play .* in the Community Feed/.test(item.playLabel || "")));
  assert.deepEqual(state.previews.map(item => item.external), urls);
  assert.equal(state.links, 2);

  await driver.executeScript(`var meta=document.createElement('meta'); meta.httpEquiv='Content-Security-Policy'; meta.content="frame-src 'none'"; document.head.appendChild(meta);`);
  // Re-apply the isolation immediately before the click because Messenger can
  // restore its list while the feed is finishing hydration.
  await driver.executeScript("Array.from(document.querySelectorAll('.member-floating-chat, .member-chat-list')).forEach(function(node){ node.classList.add('is-hidden'); node.style.setProperty('display','none','important'); node.style.setProperty('pointer-events','none','important'); });");
  await driver.findElement(By.css(`#post-${postId} [data-youtube-play="qB3dMpROEdE"]`)).click();
  await driver.wait(async () => (await driver.findElements(By.css(`#post-${postId} iframe.youtube-preview-frame`))).length === 1, 10_000);
  const player = await driver.executeScript(`var frame=document.querySelector('#post-'+arguments[0]+' iframe.youtube-preview-frame'); return {src:frame?.getAttribute('src'), title:frame?.getAttribute('title'), fullscreen:frame?.hasAttribute('allowfullscreen'), cardPresent:Boolean(frame?.closest('[data-youtube-preview="qB3dMpROEdE"]'))};`, postId);
  assert.equal(player.src, "https://www.youtube-nocookie.com/embed/qB3dMpROEdE?autoplay=1&rel=0");
  assert.equal(player.fullscreen, true);
  assert.equal(player.cardPresent, true);

  console.log(JSON.stringify({
    status: "PASS",
    suite: "TPI-COMMUNITY-YOUTUBE-PREVIEW",
    browser: "Firefox Developer Edition",
    postId,
    checks: [
      "two YouTube attachments render two ordered preview cards",
      "each preview preserves a direct YouTube fallback link",
      "Play opens a privacy-enhanced YouTube iframe inside the Community Feed card",
      "test used a disposable synthetic member post"
    ]
  }, null, 2));
} finally {
  if (postId) {
    try {
      await driver.executeAsyncScript(`var done=arguments[arguments.length-1], id=arguments[0]; fetch('/api/community/posts/'+encodeURIComponent(id),{method:'DELETE',credentials:'same-origin'}).then(function(response){done(response.status);}).catch(function(){done(0);});`, postId);
    } catch {}
  }
  await driver.quit();
}
