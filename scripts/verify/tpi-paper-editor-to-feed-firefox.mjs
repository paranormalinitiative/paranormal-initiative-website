#!/usr/bin/env node

// TPI-NOVA-EDITOR-FEED: prove the complete public author journey in one
// disposable Firefox session: Member Home -> Nova Editorial Workspace -> new
// paper -> Education Center publication -> Member Home feed. The legacy
// compatibility editor boundary is checked as a source contract and is never
// changed by this acceptance run.
import { execFileSync, spawn } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { Builder, By } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const root = resolve(import.meta.dirname, "../..");
const isolatedScript = resolve(root, "scripts/e2e/isolated-worker.mjs");
const base = "http://127.0.0.1:8789";
const workerRoot = resolve(tmpdir(), "tpi-isolated-e2e");
const workerConfig = resolve(workerRoot, "wrangler.isolated.toml");
const workerState = resolve(workerRoot, "state");
const database = "tpi-isolated-e2e-foundation";
const wrangler = process.env.WRANGLER_BIN || "wrangler";
const firefoxBinary = process.env.TPI_FIREFOX_BINARY || "/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox";
const geckodriver = process.env.TPI_GECKODRIVER || "/opt/homebrew/bin/geckodriver";
const author = { id: "combined-paper-author", username: "combined_paper_author", token: "combined-paper-author-session" };
const reader = { id: "combined-paper-reader", username: "combined_paper_reader", token: "combined-paper-reader-session" };
const runId = Date.now().toString(36);
const title = `Disposable Editor Feed Journey ${runId}`;
const destination = "education-area-investigation-science.html";
const bodyText = "Disposable browser journey body for the Nova publication and feed handoff.";

const results = [];
function check(name, passed, detail = "") {
  results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });
  console.log(`${passed ? "PASS" : "FAIL"} ${name}${detail ? ` — ${detail}` : ""}`);
}
const sleep = ms => new Promise(resolvePromise => setTimeout(resolvePromise, ms));
const sql = value => `'${String(value).replaceAll("'", "''")}'`;
let worker;
let driver;

function runD1(args) {
  return execFileSync(wrangler, ["d1", "execute", database, "--config", workerConfig, "--local", "--persist-to", workerState, ...args], {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 16 * 1024 * 1024
  });
}

function sqlFile(sqlText) {
  const path = join(mkdtempSync(join(tmpdir(), "tpi-paper-feed-seed-")), "seed.sql");
  writeFileSync(path, sqlText, "utf8");
  return path;
}

async function waitForWorker() {
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    if (worker?.exitCode !== null) throw new Error("isolated Worker exited before becoming ready");
    try {
      const response = await fetch(`${base}/api/community/categories`);
      if (response.status < 500) return;
    } catch {}
    await sleep(350);
  }
  throw new Error("isolated Worker did not become ready within 90 seconds");
}

async function startWorker() {
  worker = spawn(process.execPath, [isolatedScript, "start"], { cwd: root, stdio: ["ignore", "pipe", "pipe"] });
  worker.stdout.on("data", chunk => process.stdout.write(`[isolated-worker] ${chunk}`));
  worker.stderr.on("data", chunk => process.stderr.write(`[isolated-worker] ${chunk}`));
  await waitForWorker();
}

function stopWorker() {
  if (!worker || worker.exitCode !== null) return;
  worker.kill("SIGTERM");
}

async function stopWorkerAndClean() {
  if (worker && worker.exitCode === null) {
    const exited = new Promise(resolvePromise => worker.once("exit", resolvePromise));
    worker.kill("SIGTERM");
    await exited;
  }
  execFileSync(process.execPath, [isolatedScript, "clean"], { cwd: root, stdio: "ignore" });
}

async function prepareDatabase() {
  execFileSync(process.execPath, [isolatedScript, "clean"], { cwd: root, stdio: "ignore" });
  await startWorker();
  stopWorker();
  await new Promise(resolvePromise => worker.once("exit", resolvePromise));
  // The isolated Worker config is created in the temporary root, so Wrangler's
  // default migration lookup would otherwise search that root instead of the
  // repository migrations. Keep the source migrations authoritative while the
  // D1 state remains disposable.
  const configText = readFileSync(workerConfig, "utf8");
  if (!configText.includes(`migrations_dir = \"${root}/migrations\"`)) {
    writeFileSync(workerConfig, configText.replace("[[d1_databases]]", `migrations_dir = \"${root}/migrations\"\n\n[[d1_databases]]`), "utf8");
  }
  // Wrangler 4 resolves this setting relative to the config's directory for
  // the isolated command. Copy only the migration source into that disposable
  // root; no owner state or credentials are copied.
  cpSync(resolve(root, "migrations"), resolve(workerRoot, "migrations"), { recursive: true });
  try {
    execFileSync(wrangler, ["d1", "migrations", "apply", database, "--config", workerConfig, "--local", "--persist-to", workerState], {
      cwd: root, stdio: ["ignore", "pipe", "pipe"], encoding: "utf8", maxBuffer: 32 * 1024 * 1024
    });
  } catch (error) {
    throw new Error(`isolated migrations failed: ${String(error.stderr || error.stdout || error.message).trim().slice(-3000)}`);
  }
  const seed = sqlFile(`
    INSERT OR REPLACE INTO contributors (id, username, password_hash, display_name, role, active)
    VALUES (${sql(author.id)}, ${sql(author.username)}, 'synthetic-not-a-real-password', 'Combined Paper Author', 'contributor', 1);
    INSERT OR REPLACE INTO sessions (token, contributor_id, expires_at)
    VALUES (${sql(author.token)}, ${sql(author.id)}, '2099-01-01T00:00:00.000Z');
    INSERT OR REPLACE INTO contributors (id, username, password_hash, display_name, role, active)
    VALUES (${sql(reader.id)}, ${sql(reader.username)}, 'synthetic-not-a-real-password', 'Combined Paper Reader', 'member', 1);
    INSERT OR REPLACE INTO sessions (token, contributor_id, expires_at)
    VALUES (${sql(reader.token)}, ${sql(reader.id)}, '2099-01-01T00:00:00.000Z');
  `);
  runD1(["--file", seed, "--yes"]);
  rmSync(resolve(seed, ".."), { recursive: true, force: true });
  await startWorker();
}

async function setSession(token) {
  await driver.get(`${base}/`);
  await driver.manage().addCookie({ name: "tpi_session", value: token, path: "/" });
}

async function waitFor(condition, message, timeout = 30_000) {
  await driver.wait(async () => {
    try { return Boolean(await condition()); } catch { return false; }
  }, timeout, message);
}

async function text(selector) {
  return driver.findElement(By.css(selector)).getText().catch(() => "");
}

async function browserFetch(path, options = {}) {
  return driver.executeAsyncScript((requestPath, requestOptions, done) => {
    fetch(requestPath, { credentials: "same-origin", ...requestOptions })
      .then(async response => ({ status: response.status, body: await response.json().catch(() => ({})) }))
      .then(done)
      .catch(error => done({ status: 0, body: { error: String(error) } }));
  }, path, options);
}

async function cleanupArticle(articleId) {
  if (!articleId || !driver) return;
  await browserFetch(`/api/articles/${encodeURIComponent(articleId)}`, { method: "DELETE" }).catch(() => {});
}

let articleId = "";
try {
  const paperSource = readFileSync(resolve(root, "paper-editor.js"), "utf8");
  check("legacy compatibility editor remains explicitly protected", paperSource.includes("article.legacy") && paperSource.includes("article.contributionType !== \"TPI Video\"") && paperSource.includes("loadArticleIntoEditor(article)"));
  check("new normal documents still use the Nova-linked path", paperSource.includes("createNovaDocument") && paperSource.includes("/nova") && paperSource.includes("openLinkedNovaArticle"));

  await prepareDatabase();
  const profile = mkdtempSync(join(tmpdir(), "tpi-paper-editor-feed-firefox-"));
  const options = new firefox.Options().setBinary(firefoxBinary).addArguments("-profile", profile, "-no-remote", "-new-instance");
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).setFirefoxService(new firefox.ServiceBuilder(geckodriver)).build();
  await driver.manage().setTimeouts({ implicit: 0, pageLoad: 30_000, script: 30_000 });
  await driver.manage().window().setRect({ width: 1440, height: 1000 });
  await setSession(author.token);
  await driver.get(`${base}/member-home.html`);
  await waitFor(() => driver.findElements(By.css(".member-sidebar")).then(items => items.length === 1), "Member Home did not render the shared member shell");
  check("author begins in Member Home", /member-home/.test(await driver.getCurrentUrl()) && await driver.findElements(By.css(".member-sidebar")).then(items => items.length === 1));

  await driver.get(`${base}/paper-editor.html`);
  await waitFor(() => driver.findElements(By.css("[data-action='nova-new-document']")).then(items => items.length === 1), "Nova Editorial Workspace did not render");
  check("Nova Editorial Workspace opens for the contributor", await driver.findElements(By.css("[data-action='nova-new-document']")).then(items => items.length === 1));
  await driver.executeScript("document.querySelector(\"[data-action='nova-new-document']\")?.click();");
  await waitFor(async () => (await driver.findElements(By.css("#nova-content-editor:not([hidden])"))).length === 1 && await driver.executeScript("return document.body.classList.contains('nova-document-open')"), "new paper did not open as a Nova document");
  const draftList = await browserFetch("/api/contributors/me/articles");
  const draft = (draftList.body?.articles || []).find(item => item.title === "Untitled Content" && item.status === "draft" && item.novaItemId);
  articleId = draft?.id || "";
  check("new paper opens in Nova instead of the compatibility editor", Boolean(articleId) && await driver.executeScript("return document.body.dataset.legacyCompat === 'false' && document.body.classList.contains('nova-document-open');"), JSON.stringify({ articleId }));

  await driver.executeScript((value) => {
    const input = document.querySelector("#editor-title");
    input.value = value;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }, title);
  await driver.executeScript((value) => {
    const select = document.querySelector("#editor-destination");
    select.value = value;
    select.dispatchEvent(new Event("input", { bubbles: true }));
    select.dispatchEvent(new Event("change", { bubbles: true }));
  }, destination);
  const bodyState = await driver.executeScript((value) => {
    const host = document.querySelector("#nova-content-editor");
    const editable = host?.querySelector("[contenteditable='true']") || host;
    if (!editable) return { ok: false, reason: "Nova content editor not mounted" };
    editable.innerHTML = `<p>${value}</p>`;
    editable.dispatchEvent(new InputEvent("input", { bubbles: true, inputType: "insertText", data: value }));
    editable.dispatchEvent(new Event("keyup", { bubbles: true }));
    return { ok: true, tag: editable.tagName, text: editable.textContent.trim() };
  }, bodyText);
  check("paper title, Education Center destination, and Nova body are editable", bodyState.ok && bodyState.text === bodyText);

  await driver.findElement(By.css("[data-action='save-draft']")).click();
  await waitFor(async () => /saved/i.test(await text("#editor-status")), "Nova paper did not report a saved state");
  const savedApi = await browserFetch(`/api/contributors/me/articles`);
  const savedArticle = savedApi.body?.articles?.find(item => item.id === articleId);
  check("Nova save persists the paper metadata and linked document", savedApi.status === 200 && savedArticle?.title === title && savedArticle?.destination === destination && Boolean(savedArticle?.novaItemId));

  await driver.executeScript("window.open = function(){ return null; };");
  await driver.findElement(By.css("[data-action='publish']")).click();
  await waitFor(() => driver.findElements(By.css("#publish-modal:not([hidden])")).then(items => items.length === 1), "publish dialog did not open");
  check("publish dialog targets the selected Education Center destination", await driver.findElement(By.css("#publish-destination")).getAttribute("value") === destination);
  await driver.findElement(By.css("[data-action='publish-destination']")).click();
  await waitFor(async () => /published/i.test(await text("#editor-status")), "paper did not report publication");
  const publishedApi = await browserFetch(`/api/articles?destination=${encodeURIComponent(destination)}`);
  const publishedMatches = (publishedApi.body?.articles || []).filter(item => item.id === articleId && item.title === title && item.status === "published");
  check("publication writes one live Education Center article", publishedMatches.length === 1, JSON.stringify({ status: publishedApi.status, matches: publishedMatches.length }));

  await driver.get(`${base}/member-home.html`);
  await waitFor(async () => {
    const count = await driver.findElements(By.css(`[data-feed-type='article'][data-article-id='${articleId}']`));
    return count.length === 1;
  }, "published paper did not appear once in Member Home feed");
  const feedState = await driver.executeScript((id, expectedTitle) => {
    const cards = Array.from(document.querySelectorAll(`[data-feed-type='article'][data-article-id='${CSS.escape(id)}']`));
    return { count: cards.length, titleMatches: cards.filter(card => card.textContent.includes(expectedTitle)).length };
  }, articleId, title);
  check("returning to Member Home shows the published paper exactly once", feedState.count === 1 && feedState.titleMatches === 1, JSON.stringify(feedState));
  check("feed card points back to the published article", await driver.executeScript((id) => {
    const card = document.querySelector(`[data-feed-type='article'][data-article-id='${CSS.escape(id)}']`);
    return Boolean(card?.querySelector("a[href*='published-article.html']"));
  }, articleId));
} catch (error) {
  check("combined Nova editor-to-feed browser journey completes", false, error instanceof Error ? error.message : String(error));
} finally {
  await cleanupArticle(articleId);
  if (driver) await driver.quit().catch(() => {});
  await stopWorkerAndClean().catch(() => {});
}

const failed = results.filter(item => !item.passed);
console.log(JSON.stringify({ suite: "TPI-PAPER-EDITOR-TO-FEED-FIREFOX", status: failed.length ? "FAIL" : "PASS", passed: results.length - failed.length, total: results.length, failed }, null, 2));
if (failed.length) process.exit(1);
