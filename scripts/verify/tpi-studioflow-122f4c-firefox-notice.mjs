#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { Builder, By, until } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_FIREFOX_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const binary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
const evidenceRoot = process.env.TPI_FIREFOX_122F4C_EVIDENCE || mkdtempSync(`${tmpdir()}/tpi-122f4c-firefox-`);
mkdirSync(evidenceRoot, { recursive: true });

if (![binary, geckodriver, credentialsFile].every(existsSync)) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Firefox, Geckodriver, or local credentials unavailable.", evidenceRoot }));
  process.exit(1);
}

const account = JSON.parse(readFileSync(credentialsFile, "utf8")).accounts?.test_admin;
if (!account) {
  console.log(JSON.stringify({ status: "BLOCKED", reason: "Synthetic test_admin credentials unavailable.", evidenceRoot }));
  process.exit(1);
}

const profile = `${evidenceRoot}/profile`;
mkdirSync(profile, { recursive: true });
const options = new firefox.Options().setBinary(binary).setProfile(profile).addArguments("-no-remote", "-new-instance");
const driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 60_000 });
await driver.manage().window().setRect({ width: 1440, height: 1050, x: 40, y: 40 });

const checks = [];
const check = (name, passed, detail = "") => {
  const result = { name, passed: Boolean(passed), detail: passed ? "" : String(detail) };
  checks.push(result);
  console.error(`${result.passed ? "PASS" : "FAIL"} ${name}${result.detail ? ` — ${result.detail}` : ""}`);
};
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
async function js(script, ...args) { return driver.executeScript(script, ...args); }
async function waitFor(predicate, timeout = 20_000) {
  const started = Date.now();
  while (Date.now() - started < timeout) {
    if (await predicate()) return true;
    await sleep(250);
  }
  return false;
}
async function bodyText() { return String(await js("return document.body?.innerText || '';")); }
async function api(path, options = {}) {
  return js("return fetch(arguments[0], Object.assign({ credentials: 'same-origin' }, arguments[1] || {})).then(async r => ({ status: r.status, body: await r.json().catch(() => ({})) }));", path, options);
}
async function visibleCard(title) {
  const cards = await driver.findElements(By.css("button.notes-library-card"));
  for (const card of cards) {
    if (String(await card.getText()).includes(title)) return card;
  }
  return null;
}
async function clickNotesNavigation() {
  const button = await driver.findElement(By.xpath("//button[normalize-space()='Notes']"));
  await button.click();
}
async function clickTrashNavigation() {
  const button = await driver.findElement(By.xpath("//button[contains(@class,'notes-nav-item') and normalize-space()='Trash']"));
  await button.click();
  return driver.wait(async () => Boolean(await js("return document.querySelector('button.notes-nav-item.selected')?.textContent?.trim() === 'Trash';")), 20_000);
}
async function screenshot(name) {
  const path = resolve(evidenceRoot, name);
  writeFileSync(path, await driver.takeScreenshot(), "base64");
  return path;
}

let folderId = "";
let noteId = "";
let otherNoteId = "";
let status = "FAIL";
try {
  await driver.get(`${base}/member-login.html`);
  await driver.wait(until.elementLocated(By.css("form[data-member-login]")), 20_000);
  await driver.executeScript("const f=document.querySelector('form[data-member-login]'); f.querySelector('input[name=username]').value=arguments[0]; f.querySelector('input[name=password]').value=arguments[1]; f.requestSubmit();", account.username, account.password);
  check("Firefox authentication", await waitFor(async () => Boolean((await api("/api/auth/me")).body?.user)));

  const stamp = Date.now();
  const folder = await api("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "collection", name: `122F4C missing folder ${stamp}`, collectionType: "folder" }) });
  folderId = folder.body?.collection?.id || "";
  const note = await api("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: `122F4C target ${stamp}`, titleMode: "manual", bodyHtml: "<p>122F4C preserved content</p>", collectionId: folderId }) });
  noteId = note.body?.note?.id || "";
  const other = await api("/api/notes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: `122F4C clear target ${stamp}`, titleMode: "manual", bodyHtml: "<p>Clear notice target</p>", collectionId: null }) });
  otherNoteId = other.body?.note?.id || "";
  check("disposable fixture created", Boolean(folderId && noteId && otherNoteId), JSON.stringify({ folderId, noteId, otherNoteId }));

  await api(`/api/notes/${encodeURIComponent(noteId)}/trash`, { method: "POST" });
  await api(`/api/notes/collections/${encodeURIComponent(folderId)}/delete`, { method: "POST" });
  const prepared = await api("/api/notes?status=all");
  const preparedNote = (prepared.body?.notes || []).find(noteRecord => noteRecord.id === noteId);
  check("missing-folder fixture is confirmed by API", preparedNote?.status === "trash" && preparedNote?.collectionId === null && preparedNote?.trashCollectionId === folderId, JSON.stringify(preparedNote));

  await driver.get(`${base}/studio/`);
  await driver.wait(until.elementLocated(By.xpath("//button[normalize-space()='Notes']")), 20_000);
  await clickNotesNavigation();
  await driver.wait(until.elementLocated(By.xpath("//h1[normalize-space()='Notes']")), 20_000);
  check("Notes view renders", true);
  await js("window.scrollTo(0, 0);");
  await clickTrashNavigation();
  check("Trash collection renders", await waitFor(async () => Boolean(await visibleCard(`122F4C target ${stamp}`))));
  const card = await visibleCard(`122F4C target ${stamp}`);
  check("Trash note is selectable", Boolean(card));
  if (!card) throw new Error("Target Trash card was not present in the rendered card collection.");
  await card.click();
  check("intended Trash note is selected", await waitFor(async () => Boolean(await js("return document.querySelector('.notes-title-input')?.value === arguments[0];", `122F4C target ${stamp}`))));
  const beforePath = await screenshot("trash-before-restore.png");
  check("Restore action is rendered", await waitFor(async () => Boolean(await driver.findElements(By.css("button.notes-restore-action")).then(items => items.length))));
  await driver.findElement(By.css("button.notes-restore-action")).click();
  const expectedNotice = "Note restored to All Notes because its original folder no longer exists.";
  const noticeVisible = await waitFor(async () => Boolean(await js("const node=document.querySelector('.notes-trash-status'); const rect=node?.getBoundingClientRect(); return Boolean(node && rect && rect.width > 0 && rect.height > 0 && rect.top >= 0 && rect.bottom <= window.innerHeight && node.textContent === arguments[0]);", expectedNotice)));
  const afterPath = await screenshot("restore-notice-visible.png");
  check("exact fallback notification is visibly rendered in Firefox", noticeVisible, String(await js("return document.querySelector('.notes-trash-status')?.textContent || '';")));
  await sleep(3_000);
  check("fallback notification remains visible", Boolean(await js("const node=document.querySelector('.notes-trash-status'); return Boolean(node && node.textContent === arguments[0]);", expectedNotice)));
  const restored = await api("/api/notes?status=all");
  const restoredNote = (restored.body?.notes || []).find(noteRecord => noteRecord.id === noteId);
  check("note is restored to All Notes with content", restoredNote?.status === "active" && restoredNote?.collectionId === null && restoredNote?.bodyText === "122F4C preserved content", JSON.stringify(restoredNote));
  const nextActionCard = await visibleCard(`122F4C target ${stamp}`);
  if (nextActionCard) {
    await driver.executeScript("arguments[0].click();", nextActionCard);
  } else {
    await driver.findElement(By.xpath("//button[contains(@class,'notes-nav-item') and normalize-space()='All notes']")).click();
  }
  check("notification clears after the next note action", await waitFor(async () => !(await bodyText()).includes(expectedNotice)));
  status = checks.every(result => result.passed) ? "PASS" : "FAIL";
  console.log(JSON.stringify({ status, suite: "TPI-STUDIOFLOW-122F.4C", browser: "Firefox Developer Edition 160.0b3", account: account.username, noteId, folderId, evidenceRoot, screenshots: { beforePath, afterPath }, checks }, null, 2));
  process.exitCode = status === "PASS" ? 0 : 1;
} catch (error) {
  try { writeFileSync(resolve(evidenceRoot, "failure-state.png"), await driver.takeScreenshot(), "base64"); } catch { /* best effort */ }
  console.log(JSON.stringify({ status: "FAIL", suite: "TPI-STUDIOFLOW-122F.4C", browser: "Firefox Developer Edition 160.0b3", account: account.username, noteId, folderId, evidenceRoot, error: error instanceof Error ? error.message : String(error), checks }, null, 2));
  process.exitCode = 1;
} finally {
  if (noteId) await api(`/api/notes/${encodeURIComponent(noteId)}/trash`, { method: "POST" }).catch(() => {});
  if (noteId) await api(`/api/notes/${encodeURIComponent(noteId)}/permanent-delete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmation: "DELETE PERMANENTLY" }) }).catch(() => {});
  if (otherNoteId) await api(`/api/notes/${encodeURIComponent(otherNoteId)}/trash`, { method: "POST" }).catch(() => {});
  if (otherNoteId) await api(`/api/notes/${encodeURIComponent(otherNoteId)}/permanent-delete`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmation: "DELETE PERMANENTLY" }) }).catch(() => {});
  if (folderId) await api(`/api/notes/collections/${encodeURIComponent(folderId)}/delete`, { method: "POST" }).catch(() => {});
  await driver.quit().catch(() => {});
}
