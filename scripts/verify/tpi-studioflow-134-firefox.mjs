#!/usr/bin/env node
// TPI-STUDIOFLOW-134 — Firefox Developer Edition acceptance for the restored
// production-item color system and Teleprompter-to-Scenes drag-and-drop.
//
// TPI-STUDIOFLOW-125 and TPI-STUDIOFLOW-126A were developed on a StudioFlow
// source lineage that never reached the TPI-130..133 release lineage, so the
// shipped bundle carried neither the teleprompter-script production kind nor
// any --production-item-* token. This suite fails if either regresses again.
//
// Every run uses a brand-new disposable Firefox Developer Edition profile and a
// disposable Studio. It never opens, reuses, or clears the owner's profile and
// never touches Crossroads of the Unknown.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_FIREFOX_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const binary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const productionMode = process.env.TPI_FIREFOX_134_PRODUCTION === "approved";
const credentialsFile = productionMode
  ? (process.env.TPI_FIREFOX_PRODUCTION_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/qa-studioflow-prod.json"))
  : (process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json"));
// Screenshots may be retained; the browser profile never is. A reused profile
// would carry previous-run localStorage and make the run non-disposable.
// Evidence defaults to a disposable directory: this suite runs inside
// `release:preflight`, which asserts the working tree is unchanged at the end,
// so rewriting the tracked evidence PNGs mid-run would fail a clean release.
// Pass TPI_FIREFOX_134_EVIDENCE=docs/TPI-DEVELOPMENT/100-DIRECTIVES/evidence/
// TPI-STUDIOFLOW-134 to deliberately refresh the recorded screenshots.
const evidenceRoot = process.env.TPI_FIREFOX_134_EVIDENCE
  ? resolve(repoRoot, process.env.TPI_FIREFOX_134_EVIDENCE)
  : mkdtempSync(join(tmpdir(), "tpi-134-firefox-"));
const profile = mkdtempSync(join(tmpdir(), "tpi-134-profile-"));
mkdirSync(evidenceRoot, { recursive: true });
const expectedJavaScriptAsset = process.env.TPI_FIREFOX_EXPECTED_JS || "index-CmUjeYcC.js";
const expectedCssAsset = process.env.TPI_FIREFOX_EXPECTED_CSS || "index-D6ZhUVW1.css";

const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
const sleep = (ms) => new Promise((resolvePromise) => setTimeout(resolvePromise, ms));
const safe = (error) => (error instanceof Error ? error.message : String(error));
const waitFor = async (description, predicate, timeout = 30_000, interval = 200) => {
  const started = Date.now();
  let last = "";
  while (Date.now() - started < timeout) {
    try {
      const value = await predicate();
      if (value) return value;
      last = String(value);
    } catch (error) {
      last = safe(error);
    }
    await sleep(interval);
  }
  throw new Error(`${description} timed out${last ? `: ${last}` : ""}`);
};

// Alpha-tolerant color comparison: `rgb()` and `rgba()` are compared by channel.
const parseColor = (value) => {
  const raw = String(value || "").trim();
  // Custom properties are returned as authored, so both `#rrggbb` and `rgb()/rgba()` occur.
  const hex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(raw);
  if (hex) {
    const digits = hex[1].length === 3 ? hex[1].split("").map((d) => d + d).join("") : hex[1];
    return { r: parseInt(digits.slice(0, 2), 16), g: parseInt(digits.slice(2, 4), 16), b: parseInt(digits.slice(4, 6), 16), a: 1 };
  }
  const match = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/i.exec(raw);
  if (!match) return null;
  return { r: Number(match[1]), g: Number(match[2]), b: Number(match[3]), a: match[4] === undefined ? 1 : Number(match[4]) };
};
const sameRgb = (actual, expected) => {
  const a = parseColor(actual);
  const b = parseColor(expected);
  return Boolean(a && b && a.r === b.r && a.g === b.g && a.b === b.b);
};

// Transition suppression makes border measurements settled instead of sampling
// an in-flight 160ms border-color transition. It changes no final style value.
const settleStyles = () => driver.executeScript(
  "if(!document.getElementById('tpi134-settled')){var s=document.createElement('style');s.id='tpi134-settled';"
  + "s.textContent='.scene-panel-item,.scene-panel-drop-placeholder{transition:none !important;}';document.head.appendChild(s);} return true;"
);

// Approved production-item colors (TPI-STUDIOFLOW-126A).
const TYPES = {
  "intro":            { table: "video",         color: "rgb(249, 115, 22)", normal: "rgba(249, 115, 22, 0.72)", selected: "rgb(251, 146, 60)", icon: "rgb(249, 115, 22)", selectedApplies: true },
  "outro":            { table: "video",         color: "rgb(249, 115, 22)", normal: "rgba(249, 115, 22, 0.72)", selected: "rgb(251, 146, 60)", icon: "rgb(249, 115, 22)", selectedApplies: true },
  "teleprompter-script": { table: "teleprompter", color: "rgb(168, 85, 247)", normal: "rgba(168, 85, 247, 0.74)", selected: "rgb(192, 132, 252)", icon: "rgb(168, 85, 247)", selectedApplies: true },
  "scene":            { table: "scene",         color: "rgb(59, 130, 246)", normal: "rgba(59, 130, 246, 0.72)", selected: "rgb(96, 165, 250)", icon: "rgb(59, 130, 246)", selectedApplies: true },
  "timer":            { table: "timer",         color: "rgb(234, 179, 8)", normal: "rgba(234, 179, 8, 0.72)", selected: "rgb(250, 204, 21)", icon: "rgb(234, 179, 8)", selectedApplies: true },
  // The Background Music row keeps its maintained bridge-owned glyph and its
  // selection is driven by the audio bridge, not by the card click.
  "music":            { table: "music",         color: "rgb(34, 197, 94)", normal: "rgba(34, 197, 94, 0.7)", selected: "rgb(74, 222, 128)", icon: "rgb(117, 213, 255)", selectedApplies: false }
};
const PURPLE = "rgb(168, 85, 247)";

if (productionMode && !/^https:\/\/paranormalinitiative\.com$/.test(base)) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-134", reason: "Production mode requires the approved paranormalinitiative.com base URL.", evidenceRoot }, null, 2));
  process.exit(1);
}
if (!existsSync(binary) || !existsSync(geckodriver) || !existsSync(credentialsFile)) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-134", reason: "Firefox binary, geckodriver, or disposable credentials are unavailable.", evidenceRoot }, null, 2));
  process.exit(1);
}

const rawCredentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
const accountKey = productionMode ? "production_qa" : (process.env.TPI_FIREFOX_ACCOUNT || "test_admin");
const account = rawCredentials.accounts?.[accountKey] ?? rawCredentials;
if (!account?.username || !account?.password) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-134", reason: `The ${accountKey} account is unavailable.`, evidenceRoot }, null, 2));
  process.exit(1);
}
if (productionMode && !String(account.username).startsWith("qa-studioflow-")) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-134", reason: "Production mode accepts only the synthetic qa-studioflow account.", evidenceRoot }, null, 2));
  process.exit(1);
}

const stamp = Date.now();
const studioId = `tpi-134-firefox-${stamp}`;
const studioTitle = `TPI 134 Firefox ${stamp}`;
const scripts = [{
  id: `${studioId}-script`,
  studioId,
  title: "Scene Drag Verification Script",
  body: "Disposable script used to verify Teleprompter-to-Scenes drag and drop.",
  updatedAt: "TPI 134",
  createdAt: 1
}];
const scenes = [{ id: "scene-1", kind: "demo", title: "Disposable Scene", layout: "Speaker view" }];
// Deliberately seeded WITHOUT a teleprompter-script row: the drag under test is
// what must create it.
const seedPanelItems = [
  { id: "intro", kind: "intro", title: "Intro Video", sceneId: "scene-1", opening: true },
  { id: "scene:scene-1", kind: "scene", title: "Disposable Scene", sceneId: "scene-1" },
  { id: "timer", kind: "timer", title: "Countdown Timer", opening: true },
  { id: "music:after-intro", kind: "music", title: "Background Music", sceneId: "after-intro" },
  { id: "outro", kind: "outro", title: "Outro Video", sceneId: "scene-1", closing: true }
];

let driver;
try {
  const options = new firefox.Options()
    .setBinary(binary)
    .setProfile(profile)
    .addArguments("-no-remote", "-new-instance")
    .setPreference("media.autoplay.default", 0)
    .setPreference("media.autoplay.blocking_policy", 0)
    .setPreference("media.navigator.streams.fake", true)
    .setPreference("media.navigator.audio.fake", true)
    .setPreference("media.navigator.permission.disabled", true);
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 30_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1000, x: 40, y: 40 });

  // ---- 1. Isolated disposable Firefox session -----------------------------
  await driver.get(`${base}/member-login.html`);
  check("isolated Firefox Developer Edition login form renders", (await driver.findElements(By.css("form[data-member-login]"))).length === 1);
  await driver.executeScript("var form=document.querySelector('form[data-member-login]'),u=form&&form.querySelector('input[name=\"username\"]'),p=form&&form.querySelector('input[name=\"password\"]'); if(!form||!u||!p)return false; u.value=arguments[0]; p.value=arguments[1]; ['input','change'].forEach(function(t){u.dispatchEvent(new Event(t,{bubbles:true}));p.dispatchEvent(new Event(t,{bubbles:true}));}); form.querySelector('button[type=submit]').click(); return true;", account.username, account.password);
  await waitFor("authenticated session", async () => Boolean(await driver.executeAsyncScript("var done=arguments[arguments.length-1]; fetch('/api/auth/me',{credentials:'same-origin'}).then(function(r){return r.ok?r.json():{user:null};}).then(function(b){done(Boolean(b&&b.user));}).catch(function(){done(false);});")));
  check("isolated Firefox Developer Edition authentication succeeds", true);

  // ---- 2. Disposable Studio only -----------------------------------------
  await driver.get(`${base}/studio/`);
  await driver.executeScript("var id=arguments[0],title=arguments[1],scripts=arguments[2],scenes=arguments[3],items=arguments[4]; localStorage.setItem('studioflow.broadcasts',JSON.stringify([{id:id,title:title,description:'Disposable TPI 134 acceptance Studio',status:'draft',kind:'live'}])); localStorage.setItem('studioflow.activeBroadcastId',JSON.stringify(id)); localStorage.setItem('studioflow.route',JSON.stringify('studio')); localStorage.removeItem('studioflow.tpiActiveStudioId.v1'); localStorage.setItem('studioflow.studioScenes',JSON.stringify(scenes)); localStorage.setItem('studioflow.activeSceneId',JSON.stringify('scene-1')); localStorage.setItem('studioflow.scenePanelItems',JSON.stringify(items)); localStorage.setItem('studioflow.teleprompterScripts',JSON.stringify(scripts));", studioId, studioTitle, scripts, scenes, seedPanelItems);
  await driver.navigate().refresh();
  await waitFor("seeded My Scenes rows", async () => (await driver.findElements(By.css("[data-tpi-scene-panel-item]"))).length === seedPanelItems.length);
  await settleStyles();

  const cardData = async () => driver.executeScript("return Array.from(document.querySelectorAll('[data-tpi-scene-panel-item]')).map(function(n){var s=getComputedStyle(n),icon=n.querySelector('.scene-panel-item-icon'),iconStyle=icon&&getComputedStyle(icon);return {id:n.getAttribute('data-tpi-scene-panel-item'),kind:n.getAttribute('data-production-kind'),text:(n.textContent||'').replace(/\\s+/g,' ').trim(),colorVar:s.getPropertyValue('--production-item-color').trim(),borderVar:s.getPropertyValue('--production-item-border').trim(),selectedVar:s.getPropertyValue('--production-item-selected-border').trim(),borderTop:s.borderTopColor,borderRight:s.borderRightColor,borderBottom:s.borderBottomColor,borderLeft:s.borderLeftColor,borderStyle:s.borderTopStyle,iconColor:iconStyle?iconStyle.color:null,iconClass:icon?icon.className:null,selected:n.classList.contains('selected')};});");

  // ---- 3. Served assets are the approved build ---------------------------
  const assetRefs = await driver.executeScript("return {scripts:Array.from(document.querySelectorAll('script[src]')).map(function(s){return new URL(s.src,location.href).pathname;}),styles:Array.from(document.querySelectorAll('link[rel=stylesheet]')).map(function(s){return new URL(s.href,location.href).pathname;})};");
  check(
    "Firefox serves the intended hashed production assets",
    assetRefs.scripts.includes(`/studio/assets/${expectedJavaScriptAsset}`) && assetRefs.styles.includes(`/studio/assets/${expectedCssAsset}`),
    JSON.stringify({ expectedJavaScriptAsset, expectedCssAsset, assetRefs })
  );

  // ---- 4. Approved production item colors -------------------------------
  const seeded = await cardData();
  const kindsPresent = new Set(seeded.map((card) => card.kind));
  const seededTables = new Set([...kindsPresent].map((kind) => TYPES[kind]?.table).filter(Boolean));
  check(
    "video, scene, timer, and music production cards render with type tokens",
    ["video", "scene", "timer", "music"].every((table) => seededTables.has(table)),
    JSON.stringify([...kindsPresent])
  );
  const normalBorderMismatches = seeded.filter((card) => card.selected === false && !sameRgb(card.borderTop, TYPES[card.kind]?.normal));
  check(
    "every unselected production card border matches its approved type color",
    normalBorderMismatches.length === 0,
    JSON.stringify(normalBorderMismatches)
  );
  const perimeterMismatches = seeded.filter((card) => {
    const expected = card.selected ? TYPES[card.kind]?.selected : TYPES[card.kind]?.normal;
    return card.borderStyle !== "solid" || !sameRgb(card.borderTop, expected) || !sameRgb(card.borderRight, expected)
      || !sameRgb(card.borderBottom, expected) || !sameRgb(card.borderLeft, expected);
  });
  check("every production card shows a full-perimeter solid border (all four sides)", perimeterMismatches.length === 0, JSON.stringify(perimeterMismatches));
  const colorTokenMismatches = seeded.filter((card) => !sameRgb(card.colorVar, TYPES[card.kind]?.color));
  check("every production card carries its approved type color token", colorTokenMismatches.length === 0, JSON.stringify(colorTokenMismatches));
  const iconMismatches = seeded.filter((card) => !sameRgb(card.iconColor, TYPES[card.kind]?.icon));
  check("production item icons render in their approved color", iconMismatches.length === 0, JSON.stringify(iconMismatches));
  const musicGlyph = seeded.find((card) => card.kind === "music");
  check(
    "Background Music keeps its maintained bridge-owned glyph color",
    Boolean(musicGlyph && String(musicGlyph.iconClass).includes("tpi-scene-music-icon") && sameRgb(musicGlyph.iconColor, "rgb(117, 213, 255)")),
    JSON.stringify(musicGlyph)
  );
  await driver.takeScreenshot().then((data) => writeFileSync(join(evidenceRoot, "all-production-item-colors.png"), data, "base64"));

  // ---- 5. Selected-state colors -----------------------------------------
  // Forced class measurement verifies the approved selected rule for each type
  // without depending on which card happens to be active.
  const forcedSelected = await driver.executeScript(
    "var out=[];document.querySelectorAll('[data-tpi-scene-panel-item]').forEach(function(n){var s=getComputedStyle(n);var kind=n.getAttribute('data-production-kind');"
    + "var before=s.borderTopColor; n.classList.add('selected'); var after=getComputedStyle(n);"
    + "out.push({kind:kind,before:before,selectedBorder:after.borderTopColor}); n.classList.remove('selected');});return out;"
  );
  const selectedMismatches = forcedSelected
    .filter((entry) => TYPES[entry.kind]?.selectedApplies)
    .filter((entry) => !sameRgb(entry.selectedBorder, TYPES[entry.kind]?.selected));
  check(
    "selected production cards use their approved brighter type color",
    selectedMismatches.length === 0 && forcedSelected.length >= 5,
    JSON.stringify({ mismatches: selectedMismatches, forcedSelected })
  );
  await driver.takeScreenshot().then((data) => writeFileSync(join(evidenceRoot, "selected-state-colors.png"), data, "base64"));

  // ---- 6. Dragging-state colors -----------------------------------------
  const forcedDragging = await driver.executeScript(
    "var out=[];document.querySelectorAll('[data-tpi-scene-panel-item]').forEach(function(n){var kind=n.getAttribute('data-production-kind');"
    + "n.classList.add('dragging'); var s=getComputedStyle(n); out.push({kind:kind,border:s.borderTopColor,style:s.borderTopStyle}); n.classList.remove('dragging');});return out;"
  );
  const draggingMismatches = forcedDragging.filter((entry) => {
    const spec = TYPES[entry.kind];
    if (!spec) return true;
    return !(sameRgb(entry.border, spec.selected) || sameRgb(entry.border, spec.normal));
  });
  check("dragging production cards keep their approved type color", draggingMismatches.length === 0 && forcedDragging.length >= 5, JSON.stringify({ mismatches: draggingMismatches, forcedDragging }));

  // ---- 7. Scene drop-target highlighting during a script drag -----------
  check("Teleprompter right-rail tab is available", Boolean(await driver.executeScript("return Boolean(document.querySelector('[data-studio-panel-tab=\"Teleprompter\"]'));")));
  await driver.executeScript("var tab=document.querySelector('[data-studio-panel-tab=\"Teleprompter\"]'); if(tab) tab.click(); return true;");
  await waitFor("Teleprompter script rail", async () => (await driver.findElements(By.css("[data-teleprompter-script-id]"))).length >= 1);
  check("saved Teleprompter scripts render in the right rail", true);
  const railDraggable = await driver.executeScript("var n=document.querySelector('[data-teleprompter-script-id]'); return n?{draggable:n.draggable,id:n.getAttribute('data-teleprompter-script-id')}:null;");
  check("Teleprompter scripts are draggable", Boolean(railDraggable?.draggable), JSON.stringify(railDraggable));

  const dragPayload = await driver.executeScript(
    "window.__tpi134 = window.__tpi134 || {}; var dt = new DataTransfer(); window.__tpi134.dt = dt;"
    + " var src = document.querySelector('[data-teleprompter-script-id]'); if (!src) return {error:'no source'};"
    + " src.dispatchEvent(new DragEvent('dragstart',{bubbles:true,cancelable:true,dataTransfer:dt}));"
    + " var panel = document.querySelector('[data-tpi-scenes-panel]'); if (!panel) return {error:'no panel'};"
    + " var rows = panel.querySelectorAll('[data-tpi-scene-panel-item]');"
    + " var y = rows.length > 1 ? rows[1].getBoundingClientRect().top + 4 : panel.getBoundingClientRect().top + 10;"
    + " panel.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer:dt,clientY:y}));"
    + " return {types:Array.from(dt.types),payload:dt.getData('application/x-studioflow-teleprompter-script')};"
  );
  check(
    "Teleprompter drag publishes the approved script payload",
    Array.isArray(dragPayload?.types) && dragPayload.types.includes("application/x-studioflow-teleprompter-script") && Boolean(dragPayload.payload),
    JSON.stringify(dragPayload)
  );
  await sleep(250);
  await settleStyles();
  const highlightState = await driver.executeScript(
    "var n=document.querySelector('.scene-panel-drop-placeholder.script-drop-placeholder'); if(!n) return {present:false};"
    + " var s=getComputedStyle(n), r=n.getBoundingClientRect();"
    + " return {present:true, visible: s.visibility!=='hidden' && s.display!=='none' && Number(s.opacity)>0,"
    + " width:Math.round(r.width), height:Math.round(r.height),"
    + " inViewport: r.top>=0 && r.left>=0 && r.bottom<=window.innerHeight && r.right<=window.innerWidth,"
    + " text:(n.textContent||'').trim(), borderColor:s.borderTopColor, borderStyle:s.borderTopStyle};"
  );
  check(
    "My Scenes highlights a valid script drop target",
    Boolean(highlightState?.present && highlightState.visible && highlightState.width > 0 && highlightState.height > 0 && highlightState.inViewport),
    JSON.stringify(highlightState)
  );
  check("the script drop target uses the purple Teleprompter color", sameRgb(highlightState?.borderColor, PURPLE), JSON.stringify(highlightState));
  await driver.takeScreenshot().then((data) => writeFileSync(join(evidenceRoot, "scene-drop-target-highlight.png"), data, "base64"));

  // ---- 8. Drop assigns the script ---------------------------------------
  await driver.executeScript(
    "var dt = window.__tpi134 && window.__tpi134.dt; if(!dt) return false;"
    + " var panel = document.querySelector('[data-tpi-scenes-panel]');"
    + " var rows = panel.querySelectorAll('[data-tpi-scene-panel-item]');"
    + " var y = rows.length > 1 ? rows[1].getBoundingClientRect().top + 4 : panel.getBoundingClientRect().top + 10;"
    + " panel.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer:dt,clientY:y})); return true;"
  );
  await waitFor("teleprompter-script production card", async () => (await driver.findElements(By.css('[data-production-kind="teleprompter-script"]'))).length === 1);
  await settleStyles();
  const afterDrop = await cardData();
  const droppedCard = afterDrop.find((card) => card.kind === "teleprompter-script");
  check(
    "dropping a script creates a Teleprompter Script production item",
    afterDrop.length === seedPanelItems.length + 1 && Boolean(droppedCard),
    JSON.stringify({ count: afterDrop.length, cards: afterDrop })
  );
  check(
    "the dropped Teleprompter Script card is purple",
    sameRgb(droppedCard?.colorVar, PURPLE) && (sameRgb(droppedCard?.borderTop, TYPES["teleprompter-script"].normal) || sameRgb(droppedCard?.borderTop, TYPES["teleprompter-script"].selected)),
    JSON.stringify(droppedCard)
  );
  check("the drop placeholder clears after the drop", (await driver.findElements(By.css(".scene-panel-drop-placeholder.script-drop-placeholder"))).length === 0);
  check("the dropped script row is labelled for the creator", /Teleprompter/.test(String(droppedCard?.text || "")), JSON.stringify(droppedCard?.text));
  await driver.takeScreenshot().then((data) => writeFileSync(join(evidenceRoot, "teleprompter-script-in-scenes.png"), data, "base64"));

  // ---- 9. Real interaction: selecting the dropped card -----------------
  await driver.executeScript("var n=document.querySelector('[data-production-kind=\"teleprompter-script\"] .scene-panel-item-button'); if(n) n.click(); return true;");
  await sleep(250);
  await settleStyles();
  const clickedCard = (await cardData()).find((card) => card.kind === "teleprompter-script");
  check(
    "clicking the Teleprompter Script card selects it in its purple state",
    clickedCard?.selected === true && sameRgb(clickedCard?.borderTop, TYPES["teleprompter-script"].selected),
    JSON.stringify(clickedCard)
  );

  // ---- 10. Persistence --------------------------------------------------
  await driver.navigate().refresh();
  await waitFor("production cards after refresh", async () => (await driver.findElements(By.css("[data-tpi-scene-panel-item]"))).length === seedPanelItems.length + 1);
  await settleStyles();
  const restored = await cardData();
  const restoredScript = restored.find((card) => card.kind === "teleprompter-script");
  check("the Teleprompter Script assignment persists after refresh", Boolean(restoredScript) && restored.length === seedPanelItems.length + 1, JSON.stringify(restored));
  check(
    "type colors persist after refresh",
    restored.every((card) => sameRgb(card.borderTop, card.selected ? TYPES[card.kind]?.selected : TYPES[card.kind]?.normal)),
    JSON.stringify(restored)
  );
  const persistedRaw = await driver.executeScript("return localStorage.getItem('studioflow.scenePanelItems');");
  check(
    "the persisted manifest keeps the Teleprompter script reference",
    typeof persistedRaw === "string" && persistedRaw.includes(scripts[0].id),
    persistedRaw
  );

  // ---- 11. No regression to the seeded rows ----------------------------
  const seedIds = seedPanelItems.map((item) => item.id);
  const survivingIds = restored.map((card) => card.id);
  check("the pre-existing production rows are preserved", seedIds.every((id) => survivingIds.includes(id)), JSON.stringify({ seedIds, survivingIds }));
  check(
    "no duplicate or unexpected production rows were created",
    restored.length === seedPanelItems.length + 1 && new Set(survivingIds).size === survivingIds.length,
    JSON.stringify(survivingIds)
  );
} catch (error) {
  check("Firefox TPI-134 acceptance completed", false, safe(error));
  if (driver) {
    try { writeFileSync(join(evidenceRoot, "failure.png"), await driver.takeScreenshot(), "base64"); } catch { /* best effort */ }
  }
} finally {
  if (driver) await driver.quit().catch(() => {});
}

const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({
  status: failed.length ? "FAIL" : "PASS",
  suite: "TPI-STUDIOFLOW-134",
  browser: "Firefox Developer Edition",
  environment: base,
  evidenceRoot,
  studioId,
  checks: results,
  passed: results.length - failed.length,
  failed: failed.length
}, null, 2));
process.exit(failed.length ? 1 : 0);
