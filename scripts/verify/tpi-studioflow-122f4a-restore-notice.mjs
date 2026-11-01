#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { firefox } from "playwright";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_FIREFOX_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const binary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const credentialsFile = process.env.TPI_FIREFOX_CREDENTIALS_FILE || resolve(repoRoot, ".local-dev/local-auth-credentials.json");
if (!existsSync(binary) || !existsSync(credentialsFile)) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-122F.4A-restore-notice", reason: "Firefox Developer Edition or local credentials are unavailable." }));
  process.exit(1);
}
const credentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
const account = credentials.accounts?.test_admin;
if (!account) {
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-122F.4A-restore-notice", reason: "Synthetic test_admin credentials are unavailable." }));
  process.exit(1);
}

const browser = await firefox.launch({ executablePath: binary, headless: false });
const context = await browser.newContext({ viewport: { width: 1440, height: 1050 } });
const page = await context.newPage();
const checks = [];
const check = (name, passed, detail = "") => {
  const result = { name, passed: Boolean(passed), detail: passed ? "" : String(detail) };
  checks.push(result);
  console.error(`${result.passed ? "PASS" : "FAIL"} ${name}${result.detail ? ` — ${result.detail}` : ""}`);
};
let collectionId = "";
let noteId = "";
try {
  await page.goto(`${base}/member-login.html`, { waitUntil: "domcontentloaded" });
  await page.locator('form[data-member-login]').waitFor();
  await page.locator('form[data-member-login] input[name="username"]').fill(account.username);
  await page.locator('form[data-member-login] input[name="password"]').fill(account.password);
  await page.locator('form[data-member-login]').locator('button[type="submit"]').click();
  await page.waitForFunction(() => Boolean(document.cookie) && location.pathname !== "/member-login.html");
  check("Firefox login succeeds", true);

  const created = await page.evaluate(async (name) => {
    const response = await fetch("/api/notes", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind: "collection", name, collectionType: "folder" }) });
    return { status: response.status, body: await response.json() };
  }, `122F4A notice folder ${Date.now()}`);
  collectionId = created.body.collection?.id || "";
  check("disposable folder created", created.status === 201 && Boolean(collectionId), JSON.stringify(created));
  const createdNote = await page.evaluate(async ({ title, collectionId }) => {
    const response = await fetch("/api/notes", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, titleMode: "manual", bodyHtml: "<p>Missing folder notice candidate</p>", collectionId }) });
    return { status: response.status, body: await response.json() };
  }, { title: `122F4A missing folder ${Date.now()}`, collectionId });
  noteId = createdNote.body.note?.id || "";
  check("disposable note created", createdNote.status === 201 && Boolean(noteId), JSON.stringify(createdNote));
  await page.evaluate(async (id) => fetch(`/api/notes/${encodeURIComponent(id)}/trash`, { method: "POST", credentials: "same-origin" }), noteId);
  await page.evaluate(async (id) => fetch(`/api/notes/collections/${encodeURIComponent(id)}/delete`, { method: "POST", credentials: "same-origin" }), collectionId);

  await page.goto(`${base}/studio/`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Notes" }).waitFor();
  await page.getByRole("button", { name: /^Trash/ }).click();
  const noteCard = page.locator(".notes-library-card", { hasText: "122F4A missing folder" });
  await noteCard.waitFor();
  await noteCard.click();
  await page.locator(".notes-restore-action").waitFor();
  check("Firefox renders the trashed note Restore control", true);
  await page.locator(".notes-restore-action").click();
  const notice = page.locator(".notes-trash-status");
  await notice.waitFor({ state: "visible" });
  await expectText(notice, "Note restored to All Notes because its original folder no longer exists.");
  check("Firefox displays the exact missing-folder restoration notice", true);
  const restored = await page.evaluate(async (id) => {
    const response = await fetch("/api/notes?status=all", { credentials: "same-origin" });
    const body = await response.json();
    return (body.notes || []).find((note) => note.id === id);
  }, noteId);
  check("browser restore returns the note to All Notes", restored?.status === "active" && restored.collectionId === null, JSON.stringify(restored));
  console.log(JSON.stringify({ status: checks.every((result) => result.passed) ? "PASS" : "FAIL", suite: "TPI-STUDIOFLOW-122F.4A-restore-notice", browser: "Firefox Developer Edition", environment: base, checks }, null, 2));
  process.exitCode = checks.every((result) => result.passed) ? 0 : 1;
} catch (error) {
  check("Firefox restore-notice acceptance completed", false, error instanceof Error ? error.message : String(error));
  console.log(JSON.stringify({ status: "FAIL", suite: "TPI-STUDIOFLOW-122F.4A-restore-notice", browser: "Firefox Developer Edition", environment: base, checks }, null, 2));
  process.exitCode = 1;
} finally {
  if (noteId) await page.evaluate(async (id) => fetch(`/api/notes/${encodeURIComponent(id)}/permanent-delete`, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmation: "DELETE PERMANENTLY" }) }).catch(() => {}), noteId).catch(() => {});
  if (collectionId) await page.evaluate(async (id) => fetch(`/api/notes/collections/${encodeURIComponent(id)}/delete`, { method: "POST", credentials: "same-origin" }).catch(() => {}), collectionId).catch(() => {});
  await browser.close().catch(() => {});
}

async function expectText(locator, expected) {
  const actual = await locator.textContent();
  if (actual !== expected) throw new Error(`Expected ${JSON.stringify(expected)} but received ${JSON.stringify(actual)}`);
}
