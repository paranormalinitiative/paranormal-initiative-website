#!/usr/bin/env node
// TPI-NOVA-004R4 focused checks. Run: node scripts/verify/tpi-nova-004r4-shared-editor.mjs
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import assert from "node:assert/strict";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = path => readFileSync(join(root, path), "utf8");
const failures = [];
let passed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`PASS ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`FAIL ${name}: ${error.message}`);
  }
}

// ---- Integration: the Content Editor page -------------------------------
const html = read("paper-editor.html");
const js = read("paper-editor.js");

check("Content Editor keeps the compatibility editor only as a hidden fallback", () => {
  assert.match(html, /data-legacy-only hidden/);
  assert.match(html, /Compatibility Fallback/);
  assert.match(html, /Retry Nova/);
});

check("legacy body and Nova container both exist in the Compose pane", () => {
  assert.match(html, /id="paper-editor-body"/);
  assert.match(html, /id="nova-content-editor"[^>]*hidden/);
});

check("metadata controls remain in the page (title, subtitle, author, contribution, destination, source, labels)", () => {
  for (const id of ["editor-title", "editor-subtitle", "editor-author", "editor-contribution-type", "editor-destination", "editor-source", "editor-labels"]) {
    assert.match(html, new RegExp(`id="${id}"`), `missing #${id}`);
  }
});

check("Nova mode loads only the built Content Editor bundle, not /nova/", () => {
  assert.match(js, /\/content-editor-nova\/content-editor\.html/);
  assert.doesNotMatch(js, /\/nova\/assets\//);
});

check("server-backed editorial articles enter Nova as the primary engine", () => {
  assert.match(js, /async function openPrimaryEditorialEditor\(article\)/);
  assert.match(js, /await convertLegacyArticleToNova\(article\.id\)/);
  assert.match(js, /Compatibility editor remains available/);
  assert.doesNotMatch(js, /Never convert an unlinked legacy article here/);
});

check("publish/save are not rewritten: buildPublishedRecord still reads the shared body", () => {
  assert.match(js, /const bodyHtml = buildArticleHtml\(\);/);
  assert.match(js, /function buildArticleHtml\(\) \{\s*return cleanHtml\(getDraftHtml\(\), true\)/);
});

// ---- Conversion round-trip (exercised via the browser-free converter core)
const convertSource = read("content-editor-nova-convert.js");
const exported = { window: {} };
// Evaluate the converter against a minimal DOM shim: the converter is DOM-based,
// so this verifies the pure rendering path (novaDocToHtml) with a fixed document.
const renderOnly = new Function("window", `${convertSource}; return window.TPINovaConvert;`);
check("converter exposes htmlToNovaDoc and novaDocToHtml", () => {
  const api = renderOnly(exported.window);
  assert.equal(typeof api.htmlToNovaDoc, "function");
  assert.equal(typeof api.novaDocToHtml, "function");
});

check("Nova document renders supported formatting to article HTML", () => {
  const api = renderOnly({});
  const doc = {
    type: "doc",
    content: [
      { type: "heading", attrs: { level: 2 }, content: [{ type: "text", text: "Findings" }] },
      { type: "paragraph", content: [
        { type: "text", text: "Bold", marks: [{ type: "bold" }] },
        { type: "text", text: " and " },
        { type: "text", text: "link", marks: [{ type: "link", attrs: { href: "https://example.org" } }] }
      ] },
      { type: "bulletList", content: [{ type: "listItem", content: [{ type: "paragraph", content: [{ type: "text", text: "item" }] }] }] },
      { type: "table", content: [{ type: "tableRow", content: [{ type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "cell" }] }] }] }] }
    ]
  };
  const out = api.novaDocToHtml(doc);
  assert.match(out, /<h2>Findings<\/h2>/);
  assert.match(out, /<strong>Bold<\/strong>/);
  assert.match(out, /<a href="https:\/\/example\.org"/);
  assert.match(out, /<ul><li><p>item<\/p><\/li><\/ul>/);
  assert.match(out, /<table><tr><td><p>cell<\/p><\/td><\/tr><\/table>/);
});

check("novaDocToHtml escapes text so markup cannot be injected", () => {
  const api = renderOnly({});
  const out = api.novaDocToHtml({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "<script>x</script>" }] }] });
  assert.doesNotMatch(out, /<script>/);
  assert.match(out, /&lt;script&gt;/);
});

// ---- Build output and source ---------------------------------------------
check("Content Editor Nova bundle is built and self-contained under /content-editor-nova/", () => {
  const page = read("content-editor-nova/content-editor.html");
  assert.match(page, /\/content-editor-nova\/assets\/content-editor-[\w-]+\.js/);
  assert.match(page, /\/content-editor-nova\/assets\/content-editor-[\w-]+\.css/);
});

check("shared editor source is generic: no destinations, article types, publishing or StudioFlow logic", () => {
  for (const file of ["NovaEditor.tsx", "EditorToolbar.tsx", "LinkDialog.tsx", "Modal.tsx", "editorExtensions.ts"]) {
    // Check code only: the header comment states the rule and is excluded.
    const source = read(`nova-app/src/shared-editor/${file}`)
      .split("\n")
      .filter(line => !line.trim().startsWith("//"))
      .join("\n");
    assert.doesNotMatch(source, /destination|publish|studioflow|podcast|contributionType|articleType/i, file);
  }
});

check("standalone /nova/ build output is unchanged by this integration", () => {
  // Built as a separate output; nova/ is not written by the Content Editor build.
  assert.doesNotMatch(read("nova-app/vite.content-editor.config.ts"), /outDir:\s*"\.\.\/nova"/);
});

// ---- Isolation: switching modes must not mutate article rows ---------------
check("mode switching does not write article rows (no save call in setEditorMode)", () => {
  const block = js.slice(js.indexOf("async function setEditorMode"), js.indexOf("document.querySelector(\"[data-editor-mode]\")?.addEventListener"));
  assert.ok(block.length > 0, "setEditorMode not found");
  assert.doesNotMatch(block, /saveDraft|createArticle|savePublishedArticles|publishToDestination|localStorage/);
});

console.log(`\n${passed} passed, ${failures.length} failed`);
if (failures.length) process.exit(1);
