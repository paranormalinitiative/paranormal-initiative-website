#!/usr/bin/env node

// Focused authenticated Messenger acceptance. Every run uses a disposable
// Firefox Developer Edition profile and the synthetic local member account.
// No owner browser storage or production/member content is used.
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_MESSENGER_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const productionAcceptance = process.env.TPI_FIREFOX_ALLOW_PRODUCTION === "1" && process.env.TPI_FIREFOX_PRODUCTION_QA === "approved";
const accountKey = process.env.TPI_MESSENGER_ACCOUNT || (productionAcceptance ? "production_qa" : "local_member");
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || (productionAcceptance
  ? resolve(repoRoot, ".local-dev/qa-studioflow-prod.json")
  : resolve(repoRoot, ".local-dev/local-auth-credentials.json"));
const credentials = existsSync(credentialsFile) ? JSON.parse(readFileSync(credentialsFile, "utf8")) : null;
const account = productionAcceptance ? credentials : credentials?.accounts?.[accountKey];
const results = [];
const check = (name, passed, detail = "") => {
  results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
};
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const safe = (error) => error instanceof Error ? error.message : String(error);

const approvedLocalOrigin = /^http:\/\/(127\.0\.0\.1|localhost):8787$/.test(base);
const approvedProductionOrigin = base === "https://paranormalinitiative.com" && productionAcceptance && accountKey === "production_qa";
if (!approvedLocalOrigin && !approvedProductionOrigin) {
  console.log(JSON.stringify({ suite: "TPI-MEMBER-MESSENGER", status: "BLOCKED", reason: "The focused Messenger test requires the approved loopback origin or the guarded synthetic production acceptance settings." }));
  process.exit(1);
}
for (const file of [firefoxBinary, geckodriver, credentialsFile]) {
  if (!existsSync(file)) {
    console.log(JSON.stringify({ suite: "TPI-MEMBER-MESSENGER", status: "BLOCKED", reason: `Required verification input is unavailable: ${file}` }));
    process.exit(1);
  }
}
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ suite: "TPI-MEMBER-MESSENGER", status: "BLOCKED", reason: `The synthetic ${accountKey} account is unavailable.` }));
  process.exit(1);
}

let driver;
async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function waitFor(description, predicate, timeout = 20_000) {
  const started = Date.now();
  let detail = "";
  while (Date.now() - started < timeout) {
    try {
      const value = await predicate();
      if (value) return value;
      detail = String(value);
    } catch (error) {
      detail = safe(error);
    }
    await sleep(200);
  }
  throw new Error(`${description} timed out${detail ? `: ${detail}` : ""}`);
}
async function state() {
  return js(`var chat=document.querySelector('[data-member-floating-chat]'), nav=document.querySelector('[data-nav="chat"]');
    if(!chat||!nav) return null;
    var rect=chat.getBoundingClientRect(), style=getComputedStyle(chat);
    return {hidden:chat.classList.contains('is-hidden'), display:style.display, navExpanded:nav.getAttribute('aria-expanded'), hash:location.hash,
      left:Math.round(rect.left), top:Math.round(rect.top), width:Math.round(rect.width), height:Math.round(rect.height), viewportWidth:innerWidth, viewportHeight:innerHeight};`);
}
async function clickVisible(selector) {
  return js(`var nodes=Array.from(document.querySelectorAll(arguments[0]));
    var node=nodes.find(function(item){var r=item.getBoundingClientRect(),s=getComputedStyle(item); return s.display!=='none' && s.visibility!=='hidden' && r.width>0 && r.height>0;});
    if(!node) return false; node.click(); return true;`, selector);
}
async function loginOnOrigin() {
  return driver.executeAsyncScript(`var done=arguments[arguments.length-1], username=arguments[0], password=arguments[1];
    fetch('/api/auth/login',{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:username,password:password})})
      .then(function(response){return response.json().catch(function(){return {};}).then(function(body){done({status:response.status,user:body.user||null});});})
      .catch(function(error){done({status:0,error:String(error)});});`, account.username, account.password);
}

const profile = mkdtempSync(join(tmpdir(), "tpi-member-messenger-firefox-"));
try {
  const options = new firefox.Options().setBinary(firefoxBinary).addArguments("-profile", profile, "-no-remote", "-new-instance");
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 30_000 });
  await driver.manage().window().setRect({ width: 1280, height: 900 });
  await driver.get(`${base}/member-login.html`);
  const login = await loginOnOrigin();
  check("Firefox authenticates the synthetic member", login?.status === 200 && Boolean(login?.user));

  await js("localStorage.removeItem('tpiFloatingChatFrame');");
  await driver.get(`${base}/member-home`);
  await waitFor("desktop Messenger", async () => (await state())?.hidden === false);
  const initialDesktop = await state();
  check("desktop Messenger opens in a usable-width floating frame", initialDesktop?.hidden === false && initialDesktop.width >= 640, JSON.stringify(initialDesktop));
  check("Chat navigation reports the open Messenger", (await state())?.navExpanded === "true");

  const beforeDrag = await state();
  const header = await driver.findElement(By.css("[data-chat-drag]"));
  await driver.actions().move({ origin: header, x: 90, y: 12 }).press().move({ x: 120, y: 70 }).release().perform();
  await sleep(250);
  const afterDrag = await state();
  check("desktop Messenger remains movable by its header", afterDrag.left !== beforeDrag.left || afterDrag.top !== beforeDrag.top, JSON.stringify({ beforeDrag, afterDrag }));

  const defaultRosterState = await js("var list=document.querySelector('[data-chat-online]'), style=list&&getComputedStyle(list), first=list&&list.querySelector('[data-online-member]'), listRect=list&&list.getBoundingClientRect(), firstRect=first&&first.getBoundingClientRect(); return {label:document.querySelector('.member-chat-section-label')?.textContent.trim()||'', buttons:Array.from(document.querySelectorAll('[data-online-member]')).map(function(node){return node.getAttribute('data-chat-friend');}), alignContent:style&&style.alignContent, gridAutoRows:style&&style.gridAutoRows, firstTop:firstRect&&Math.round(firstRect.top), listTop:listRect&&Math.round(listRect.top)};");
  check("Messenger default roster is limited to friends", defaultRosterState.label === "Friends" && defaultRosterState.buttons.every(value => value === "true"), JSON.stringify(defaultRosterState));
  check("Messenger friends begin at the top of the contacts column", (defaultRosterState.alignContent === "start" || defaultRosterState.alignContent === "flex-start") && defaultRosterState.gridAutoRows === "max-content" && (!defaultRosterState.firstTop || defaultRosterState.firstTop <= defaultRosterState.listTop + 12), JSON.stringify(defaultRosterState));
  let memberButton = (await driver.findElements(By.css("[data-online-member]")))[0] || null;
  if (!memberButton) {
    const searchInput = await driver.findElement(By.css("[data-chat-member-search]"));
    const searchSeed = await js(`return fetch('/api/messenger/roster?search=a',{credentials:'same-origin'}).then(function(response){return response.json();}).then(function(body){var member=(body.members||[])[0]; return member ? String(member.displayName||member.username||'').slice(0,4) : '';}).catch(function(){return '';});`);
    await searchInput.sendKeys(searchSeed || "a");
    memberButton = await waitFor("searchable Messenger member", async () => {
      const nodes = await driver.findElements(By.css("[data-online-member]"));
      return nodes[0] || null;
    });
    check("Messenger search can find a non-friend for a new chat", await js("var node=document.querySelector('[data-online-member]'); return Boolean(node) && node.getAttribute('data-chat-friend') !== 'true';"));
  }
  await memberButton.click();
  await waitFor("selected Messenger conversation", async () => await js("var bar=document.querySelector('[data-chat-conversation-bar]'); return Boolean(bar && !bar.hidden);"));
  check("member selection opens a conversation", await js("var bar=document.querySelector('[data-chat-conversation-bar]'); return Boolean(bar && !bar.hidden);"));
  const textLayout = await js(`return ['.member-chat-online-person strong','.member-chat-online-person small','.member-chat-list-open strong','.member-chat-list-open .member-chat-presence','.member-chat-author-username']
    .map(function(selector){var node=document.querySelector(selector), style=node&&getComputedStyle(node); return {selector:selector,found:Boolean(node),whiteSpace:style&&style.whiteSpace,overflowWrap:style&&style.overflowWrap,wordBreak:style&&style.wordBreak,scrollWidth:node&&node.scrollWidth,clientWidth:node&&node.clientWidth};});`);
  check("member names, usernames, labels, previews, and authors use wrap-safe layout", textLayout.filter(function(item){return item.found;}).every(function(item){
    var isChatPreview = item.selector === ".member-chat-list-open .member-chat-presence";
    return isChatPreview
      ? item.whiteSpace === "nowrap" && item.overflowWrap === "anywhere" && item.scrollWidth >= item.clientWidth
      : item.whiteSpace === "normal" && (item.overflowWrap === "anywhere" || item.wordBreak === "break-word") && item.scrollWidth <= item.clientWidth + 1;
  }), JSON.stringify(textLayout));
  const chatPreviewLayout = await js(`var list=document.querySelector('[data-chat-list]');
    if(!list) return {found:false};
    var previous=list.innerHTML;
    list.innerHTML='<article class="member-chat-list-item"><button class="member-chat-list-open" type="button"><span class="member-chat-avatar"><span>B</span></span><span class="member-chat-person-copy"><strong>Bill Heiland</strong><span class="member-chat-presence">This is a deliberately long conversation preview that must remain one concise line and never paint over the Members list.</span></span><span class="member-chat-unread-badge">1</span></button></article>';
    var item=list.querySelector('.member-chat-list-item'), preview=list.querySelector('.member-chat-list-open .member-chat-presence');
    var itemRect=item.getBoundingClientRect(), previewRect=preview.getBoundingClientRect(), style=getComputedStyle(preview);
    var result={found:true,itemHeight:Math.round(itemRect.height),previewHeight:Math.round(previewRect.height),previewScrollWidth:preview.scrollWidth,previewClientWidth:preview.clientWidth,whiteSpace:style.whiteSpace,overflow:style.overflow,textOverflow:style.textOverflow,listOverflow:getComputedStyle(list).overflowY};
    list.innerHTML=previous;
    return result;`);
  check("long chat previews stay on one line without overflowing the Chats list", chatPreviewLayout.found && chatPreviewLayout.previewHeight <= 18 && chatPreviewLayout.previewScrollWidth >= chatPreviewLayout.previewClientWidth && chatPreviewLayout.whiteSpace === "nowrap" && chatPreviewLayout.overflow === "hidden" && chatPreviewLayout.textOverflow === "ellipsis" && chatPreviewLayout.listOverflow === "auto", JSON.stringify(chatPreviewLayout));

  const composer = await driver.findElement(By.css("[data-chat-input]"));
  const attachmentPickerState = await js(`var media=document.querySelector('[data-chat-media-input]'), files=document.querySelector('[data-chat-file-input]');
    return {mediaAccept:media&&media.getAttribute('accept')||'', fileAccept:files&&files.getAttribute('accept')||''};`);
  check("Messenger pickers expose MP4 and ZIP formats", attachmentPickerState.mediaAccept.includes(".mp4") && attachmentPickerState.fileAccept.includes(".zip") && attachmentPickerState.fileAccept.includes("application/zip"), JSON.stringify(attachmentPickerState));
  await composer.sendKeys("Disposable Messenger composer check");
  check("message composer accepts input", await composer.getAttribute("value") === "Disposable Messenger composer check");
  await composer.clear();
  const messengerPaste = await js(`var input=document.querySelector('[data-chat-input]');
    input.focus(); input.value='';
    var transfer=new DataTransfer(); transfer.setData('text/plain','Pasted Messenger text');
    var event=new Event('paste',{bubbles:true,cancelable:true}); Object.defineProperty(event,'clipboardData',{value:transfer});
    input.dispatchEvent(event);
    return input.value;`);
  check("Messenger composer accepts pasted text", messengerPaste === "Pasted Messenger text", JSON.stringify(messengerPaste));
  const feedPaste = await js(`var textarea=document.querySelector('[data-composer-body]');
    if(!textarea) return null;
    textarea.focus(); textarea.value='';
    var transfer=new DataTransfer(); transfer.setData('text/plain','Pasted feed text');
    var event=new Event('paste',{bubbles:true,cancelable:true}); Object.defineProperty(event,'clipboardData',{value:transfer});
    textarea.dispatchEvent(event);
    return textarea.value;`);
  check("Community composer accepts pasted text", feedPaste === "Pasted feed text", JSON.stringify(feedPaste));

  await driver.findElement(By.css("[data-chat-minimize]")).click();
  await waitFor("Messenger hide", async () => (await state())?.hidden === true);
  const hiddenDesktop = await state();
  check("Hide closes the floating Messenger", hiddenDesktop.hidden === true && hiddenDesktop.display === "none");
  check("Hide returns focus state to Chat navigation", hiddenDesktop.navExpanded === "false" && hiddenDesktop.hash !== "#messenger");

  await clickVisible('[data-nav="chat"]');
  await waitFor("Chat navigation restore", async () => (await state())?.hidden === false);
  const restoredDesktop = await state();
  check("Chat navigation restores the floating Messenger", restoredDesktop.hidden === false && restoredDesktop.navExpanded === "true");
  check("dragged frame position survives reopen", Math.abs(restoredDesktop.left - afterDrag.left) <= 2 && Math.abs(restoredDesktop.top - afterDrag.top) <= 2, JSON.stringify({ restoredDesktop, afterDrag }));

  await driver.navigate().refresh();
  await waitFor("desktop Messenger after refresh", async () => (await state())?.hidden === false);
  check("open Messenger persists across refresh", (await state())?.hidden === false);

  await driver.manage().window().setSize({ width: 390, height: 844 });
  await js("localStorage.removeItem('tpiFloatingChatFrame');");
  await driver.get(`${base}/member-home`);
  await waitFor("mobile Messenger shell", async () => Boolean(await state()));
  const mobileClosed = await state();
  check("narrow Messenger starts closed until Chat is chosen", mobileClosed.hidden === true && mobileClosed.navExpanded === "false");
  const mobileChatClicked = await clickVisible('[data-nav="chat"]');
  const mobileAfterClick = await state();
  check("mobile Chat control is clickable", mobileChatClicked === true && mobileAfterClick !== null, JSON.stringify(mobileAfterClick));
  await waitFor("mobile Chat navigation restore", async () => (await state())?.hidden === false);
  const mobileOpen = await state();
  const mobileBoundsOk = mobileOpen.hidden === false && mobileOpen.viewportWidth <= 760 && mobileOpen.width <= mobileOpen.viewportWidth - 22 && mobileOpen.left >= 0 && mobileOpen.left + mobileOpen.width <= mobileOpen.viewportWidth + 2;
  check("mobile Chat navigation opens Messenger", mobileBoundsOk, JSON.stringify({ mobileOpen, mobileBoundsOk }));
  await driver.findElement(By.css("[data-chat-minimize]")).click();
  await waitFor("mobile Messenger hide", async () => (await state())?.hidden === true);
  check("mobile Hide returns to Chat navigation", (await state())?.navExpanded === "false");
  await driver.navigate().refresh();
  await waitFor("mobile Messenger after refresh", async () => Boolean(await state()));
  check("mobile closed state persists across refresh", (await state())?.hidden === true);
  await clickVisible('[data-nav="chat"]');
  await waitFor("final mobile Messenger restore", async () => (await state())?.hidden === false);
  check("mobile Chat navigation can reopen after refresh", (await state())?.hidden === false);
} catch (error) {
  check("focused Firefox Messenger acceptance completes", false, safe(error));
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter((item) => !item.passed);
console.log(JSON.stringify({ suite: "TPI-MEMBER-MESSENGER", status: failed.length ? "FAIL" : "PASS", browser: "Firefox Developer Edition", environment: base, passed: results.length - failed.length, total: results.length, failed }, null, 2));
if (failed.length) process.exit(1);
