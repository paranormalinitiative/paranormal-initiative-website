#!/usr/bin/env node
import { existsSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { chromium } from "playwright";

const repoRoot = resolve(import.meta.dirname, "../..");
const base = (process.env.TPI_CHROME_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const chromePath = process.env.TPI_CHROME_BINARY || chromium.executablePath();
const chromeProcess = process.env.TPI_CHROME_PROCESS || "Google Chrome for Testing";
const chromePid = Number(process.env.TPI_CHROME_PID || 0);
const credentialsFile = process.env.TPI_CHROME_CREDENTIALS_FILE || join(repoRoot, ".local-dev/local-auth-credentials.json");
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail) });
const folderPath = mkdtempSync(join(tmpdir(), "tpi-122h1-local-project-"));
const profilePath = mkdtempSync(join(tmpdir(), "tpi-122h1-chrome-profile-"));
let browser;
let page;
let projectId = "";
let episodeId = "";
let noteId = "";

function chooseNativeFolder(path) {
  const processSelection = chromePid > 0
    ? `set targetProcess to first process whose unix id is ${chromePid}`
    : `set targetProcess to missing value
  repeat with candidateReference in (every process whose name is ${JSON.stringify(chromeProcess)})
    try
      set candidate to contents of candidateReference
      if (count of windows of candidate) > 0 and (name of window 1 of candidate contains "StudioFlow") then
        set targetProcess to candidate
        exit repeat
      end if
    end try
  end repeat
  if targetProcess is missing value then set targetProcess to first process whose name is ${JSON.stringify(chromeProcess)}`;
  const script = `tell application "System Events"
  ${processSelection}
  tell targetProcess
    set frontmost to true
    delay 0.4
    keystroke "g" using {command down, shift down}
    delay 0.4
    keystroke ${JSON.stringify(path)}
    key code 36
    delay 0.6
    if exists (button "Choose" of sheet 1 of window 1) then
      click button "Choose" of sheet 1 of window 1
    else
      key code 36
    end if
  end tell
end tell`;
  execFileSync("osascript", ["-e", script], { stdio: "ignore" });
}

function focusStudioFlowBrowser() {
  const script = `tell application "System Events"
  repeat with candidateReference in (every process whose name is ${JSON.stringify(chromeProcess)})
    try
      set candidate to contents of candidateReference
      if (count of (every window of candidate whose name contains "StudioFlow")) > 0 then
        set frontmost of candidate to true
        key code 53
        exit repeat
      end if
    end try
  end repeat
end tell`;
  execFileSync("osascript", ["-e", script], { stdio: "ignore" });
}

function listFiles(root, relative = "") {
  const entries = [];
  for (const name of readdirSync(root)) {
    const absolute = join(root, name);
    const childRelative = relative ? `${relative}/${name}` : name;
    if (statSync(absolute).isDirectory()) entries.push(...listFiles(absolute, childRelative));
    else entries.push(childRelative);
  }
  return entries.sort();
}

try {
  if (!existsSync(chromePath) || !existsSync(credentialsFile)) throw new Error("Chrome or the protected local credentials file is unavailable.");
  const credentials = JSON.parse(readFileSync(credentialsFile, "utf8"));
  const account = credentials.accounts?.test_admin ?? credentials;
  browser = await chromium.launchPersistentContext(profilePath, { headless: false, executablePath: chromePath, args: ["--no-first-run", "--no-default-browser-check", "--disable-save-password-bubble"], viewport: { width: 1440, height: 1050 } });
  page = await browser.newPage();
  await page.goto(`${base}/member-login.html`, { waitUntil: "domcontentloaded" });
  const loginForm = page.locator('form[data-member-login]');
  await loginForm.locator('input[name="username"]').fill(account.username);
  await loginForm.locator('input[name="password"]').fill(account.password);
  await loginForm.getByRole("button", { name: "Sign In" }).click();
  await page.waitForTimeout(1_000);
  await page.waitForFunction(() => fetch('/api/auth/me', { credentials: 'same-origin' }).then((response) => response.json()).then((body) => Boolean(body.user)).catch(() => false), null, { timeout: 20_000 });
  check("authenticated Chrome local session succeeds", true);
  const authenticatedUser = await page.evaluate(() => fetch('/api/auth/me', { credentials: 'same-origin' }).then((response) => response.json()).then((body) => body.user || null));
  check("authenticated user has local Studio access", Boolean(authenticatedUser && authenticatedUser.username), JSON.stringify(authenticatedUser));

  const projectName = `D122H1 local folder ${Date.now()}`;
  const created = await page.evaluate(async ({ projectName }) => {
    const projectResponse = await fetch('/api/notes', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'collection', name: projectName, collectionType: 'podcast' }) });
    const project = await projectResponse.json();
    if (!project.collection?.id) throw new Error(`Project creation failed (${projectResponse.status}): ${JSON.stringify(project)}`);
    const episodeResponse = await fetch('/api/notes', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kind: 'collection', name: 'Episode 001 — Local Folder Verification', collectionType: 'episode', parentId: project.collection.id }) });
    const episode = await episodeResponse.json();
    const noteResponse = await fetch('/api/notes', { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'Local Folder Research Note', titleMode: 'manual', bodyHtml: '<p>Local folder synchronization verification.</p>', collectionId: episode.collection.id }) });
    const note = await noteResponse.json();
    return { project, episode, note };
  }, { projectName });
  projectId = created.project.collection.id;
  episodeId = created.episode.collection.id;
  noteId = created.note.note.id;
  check("disposable podcast project created", Boolean(projectId));
  check("disposable episode and note are associated", created.episode.collection.parentId === projectId && created.note.note.collectionId === episodeId);

  await page.goto(`${base}/studio/`);
  await page.evaluate(() => { localStorage.setItem('studioflow.route', JSON.stringify('notes')); sessionStorage.setItem('studioflow.notesWorkspaceIntent.v1', '1'); });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByText("Research and production workspace").waitFor({ state: "visible", timeout: 20_000 });
  check("authoritative Notes workspace loads", true);
  await page.getByRole("button", { name: `Folder actions ${projectName}` }).click();
  await page.getByRole("menuitem", { name: "View Project Files" }).click();
  await page.getByRole("heading", { name: projectName }).waitFor({ state: "visible" });
  check("Project Files dialog opens", true);
  check("real folder support is advertised", await page.getByRole("button", { name: "Set Local Project Folder" }).count() === 1);

  await page.bringToFront();
  focusStudioFlowBrowser();
  await page.getByRole("button", { name: "Set Local Project Folder" }).click();
  chooseNativeFolder(folderPath);
  await page.getByText(new RegExp(`Connected to`)).waitFor({ state: "visible", timeout: 20_000 });
  check("native folder chooser connects a real folder", true);

  await page.getByRole("button", { name: "Sync Project to Local Folder" }).click();
  await page.getByText(new RegExp("Synced .* project files to")).waitFor({ state: "visible", timeout: 30_000 });
  const firstFiles = listFiles(folderPath);
  check("sync writes real project files", firstFiles.some((file) => file.endsWith("project-manifest.json")) && firstFiles.some((file) => file.endsWith("Local Folder Research Note.html")), firstFiles.join("\n"));
  const manifestPath = firstFiles.find((file) => file.endsWith("project-manifest.json"));
  check("manifest is independently readable", Boolean(manifestPath && /D122H1 local folder/.test(readFileSync(join(folderPath, manifestPath), "utf8"))));

  if (manifestPath) {
    writeFileSync(join(folderPath, manifestPath), "externally modified local project manifest\n");
    await page.getByRole("button", { name: "Sync Project to Local Folder" }).click();
    await page.getByText(new RegExp("conflict copy")).waitFor({ state: "visible", timeout: 30_000 });
    const secondFiles = listFiles(folderPath);
    check("external local changes are preserved", secondFiles.some((file) => file.includes("StudioFlow copy") && file.endsWith("project-manifest.json")), secondFiles.join("\n"));
  }

  await page.reload({ waitUntil: "domcontentloaded" });
  await page.getByText("Research and production workspace").waitFor({ state: "visible", timeout: 20_000 });
  await page.getByRole("button", { name: `Folder actions ${projectName}` }).click();
  await page.getByRole("menuitem", { name: "View Project Files" }).click();
  await page.getByText("Connected as a permission-based local copy").waitFor({ state: "visible", timeout: 10_000 });
  check("folder connection survives browser refresh", true);
  console.log(JSON.stringify({ status: results.every((result) => result.passed) ? "PASS" : "FAIL", suite: "TPI-STUDIOFLOW-122H.1", browser: "Google Chrome", environment: base, realFolder: folderPath, files: listFiles(folderPath), checks: results }, null, 2));
  process.exitCode = results.every((result) => result.passed) ? 0 : 1;
} catch (error) {
  check("real filesystem acceptance completed", false, error instanceof Error ? error.message : String(error));
  console.log(JSON.stringify({ status: "BLOCKED", suite: "TPI-STUDIOFLOW-122H.1", browser: "Google Chrome", environment: base, realFolder: folderPath, files: listFiles(folderPath), checks: results }, null, 2));
  process.exitCode = 1;
} finally {
  if (page) await page.evaluate(async ({ noteId, episodeId, projectId }) => {
    if (noteId) await fetch(`/api/notes/${encodeURIComponent(noteId)}/trash`, { method: 'POST', credentials: 'same-origin' }).catch(() => {});
    for (const id of [episodeId, projectId]) if (id) await fetch(`/api/notes/collections/${encodeURIComponent(id)}/delete`, { method: 'POST', credentials: 'same-origin' }).catch(() => {});
  }, { noteId, episodeId, projectId }).catch(() => {});
  await browser?.close().catch(() => {});
}
