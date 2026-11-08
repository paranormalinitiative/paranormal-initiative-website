// TPI-NOVA-005B2A verifier: publication-safe bookmarks, links and DATE/TIME/FILENAME
// fields in the deterministic renderer. It exercises lib/nova-document-html.js
// directly (the same module the publish pipeline uses) and checks the browser
// converter parity contract. Editor command behaviour is covered by the Firefox
// acceptance pass recorded in the implementation report.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import assert from "node:assert/strict";
import { novaDocToHtml, buildPublicationSnapshot, safeHref, bookmarkDomId } from "../../lib/nova-document-html.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = path => readFileSync(resolve(repoRoot, path), "utf8");
const commandSources = {
  validation: read("nova-app/src/shared-editor/commands/validation.ts"),
  bookmarks: read("nova-app/src/shared-editor/commands/bookmarks.ts"),
  links: read("nova-app/src/shared-editor/commands/links.ts"),
  fields: read("nova-app/src/shared-editor/commands/fields.ts"),
  insertTools: read("nova-app/src/shared-editor/InsertTools.tsx"),
  toolbar: read("nova-app/src/shared-editor/EditorToolbar.tsx"),
  editor: read("nova-app/src/documents/DocumentEditor.tsx"),
  extensions: read("nova-app/src/shared-editor/editorExtensions.ts")
};
let passed = 0;
let failed = 0;
const queue = [];
function check(name, fn) { queue.push({ name, fn }); }

const para = (text, marks) => ({ type: "paragraph", content: [{ type: "text", text, ...(marks ? { marks } : {}) }] });
const bookmark = name => ({ type: "tpiBookmark", attrs: { name } });
const field = fieldType => ({ type: "tpiField", attrs: { fieldType, format: "default", displayText: "cached" } });
const link = href => [{ type: "link", attrs: { href } }];
const doc = content => ({ type: "doc", content });

// Browser converter loaded in a sandbox, as the R6E suite does.
const sandbox = { window: {}, console };
vm.createContext(sandbox);
vm.runInContext(readFileSync(resolve(repoRoot, "content-editor-nova-convert.js"), "utf8"), sandbox);
const browser = sandbox.window.TPINovaConvert;

const FIXED = new Date("2026-11-07T10:30:00Z");

check("bookmark atom becomes an addressable anchor", () => {
  const html = novaDocToHtml(doc([{ type: "paragraph", content: [bookmark("Intro"), { type: "text", text: "Hello" }] }]));
  assert.equal(html, `<p><a id="${bookmarkDomId("Intro")}"></a>Hello</p>`);
});

check("multiple bookmarks in one block give distinct safe ids", () => {
  const html = novaDocToHtml(doc([{ type: "paragraph", content: [bookmark("Alpha"), bookmark("Beta"), { type: "text", text: "x" }] }]));
  assert.ok(html.includes('id="nova-bm-alpha"'));
  assert.ok(html.includes('id="nova-bm-beta"'));
  assert.equal(new Set(html.match(/id="[^"]+"/g)).size, 2);
});

check("bookmark DOM ids are deterministic, lowercased and free of raw text", () => {
  assert.equal(bookmarkDomId("Case_One"), bookmarkDomId("case_one"));
  assert.match(bookmarkDomId("名前"), /^nova-bm-[a-z0-9_\-]+$/);
});

check("bookmark names are validated before reaching the DOM", () => {
  const html = novaDocToHtml(doc([{ type: "paragraph", content: [{ type: "tpiBookmark", attrs: { name: '"><script>x</script>' } }] }]));
  assert.ok(!html.includes("<script"));
  assert.ok(!html.includes('id="">'));
});

check("internal #bookmark link resolves to the safe target id", () => {
  const html = novaDocToHtml(doc([para("Go", link("#Intro"))]));
  assert.ok(html.includes(`href="#${bookmarkDomId("Intro")}"`));
});

check("https, http, mailto and tel links keep their href", () => {
  for (const href of ["https://example.org/a", "http://example.org", "mailto:a@example.org", "tel:+15551234"]) {
    assert.ok(novaDocToHtml(doc([para("x", link(href))])).includes(`href="${href}"`), href);
  }
});

check("javascript: and unsafe data: never reach an href; text stays visible", () => {
  for (const href of ["javascript:alert(1)", "JaVaScRiPt:alert(1)", "data:text/html,<script>x</script>", "vbscript:x"]) {
    const html = novaDocToHtml(doc([para("Click me", link(href))]));
    assert.ok(!/href=/i.test(html), `unexpected href for ${href}: ${html}`);
    assert.ok(html.includes("Click me"));
  }
});

check("safeHref allows only the approved schemes", () => {
  assert.equal(safeHref("javascript:alert(1)"), null);
  assert.equal(safeHref("data:text/html,x"), null);
  assert.equal(safeHref("https://example.org"), "https://example.org");
});

check("DATE, TIME and FILENAME resolve to escaped text in the snapshot", () => {
  const html = novaDocToHtml(
    doc([para("", null)].map(() => ({ type: "paragraph", content: [field("DATE"), { type: "text", text: " " }, field("TIME"), { type: "text", text: " " }, field("FILENAME")] }))),
    { now: FIXED, title: "A <b>Title</b>" }
  );
  assert.ok(html.includes("2026-11-07"));
  assert.ok(html.includes("10:30 UTC"));
  assert.ok(html.includes("A &lt;b&gt;Title&lt;/b&gt;"));
  assert.ok(!html.includes("<b>Title"));
});

check("FILENAME falls back to Untitled for an empty title", () => {
  const html = novaDocToHtml(doc([{ type: "paragraph", content: [field("FILENAME")] }]), { now: FIXED, title: "   " });
  assert.ok(html.includes("<p>Untitled</p>"));
});

check("unknown field type fails safe as empty text", () => {
  const html = novaDocToHtml(doc([{ type: "paragraph", content: [{ type: "tpiField", attrs: { fieldType: "EVIL", format: "x", displayText: "<img src=x>" } }, { type: "text", text: "ok" }] }]), { now: FIXED, title: "T" });
  assert.equal(html, "<p>ok</p>");
});

check("publication snapshot freezes DATE/TIME/FILENAME values", () => {
  const document = doc([{ type: "paragraph", content: [field("DATE"), { type: "text", text: " | " }, field("TIME"), { type: "text", text: " | " }, field("FILENAME")] }]);
  const first = buildPublicationSnapshot({ doc: document, title: "005B2A Original Title", articleType: "Research Paper", destination: "education", now: FIXED });
  // Later title change and a later evaluation time must not alter the first snapshot.
  const later = buildPublicationSnapshot({ doc: document, title: "005B2A Renamed Title", articleType: "Research Paper", destination: "education", now: new Date("2026-11-08T09:00:00Z") });
  assert.ok(JSON.stringify(first).includes("2026-11-07"));
  assert.ok(JSON.stringify(first).includes("005B2A Original Title"));
  assert.ok(!JSON.stringify(first).includes("Renamed"));
  assert.ok(JSON.stringify(later).includes("2026-11-08"));
});

check("draft JSON keeps field semantics; publication does not mutate the document", () => {
  const document = doc([{ type: "paragraph", content: [field("DATE")] }]);
  const before = JSON.stringify(document);
  novaDocToHtml(document, { now: FIXED, title: "T" });
  assert.equal(JSON.stringify(document), before);
  assert.equal(document.content[0].content[0].attrs.fieldType, "DATE");
});

check("browser converter matches the deterministic renderer", () => {
  const document = doc([
    { type: "paragraph", content: [bookmark("Intro"), { type: "text", text: "A " }, field("FILENAME"), { type: "text", text: " " }, field("DATE")] },
    { type: "paragraph", content: [{ type: "text", text: "Safe", marks: link("#Intro") }, { type: "text", text: " bad", marks: link("javascript:alert(1)") }] }
  ]);
  const ctx = { now: FIXED, title: "Parity" };
  assert.equal(browser.novaDocToHtml(document, ctx), novaDocToHtml(document, ctx));
});

check("bookmark command validates names and rejects case-insensitive duplicates", () => {
  assert.match(commandSources.validation, /validateBookmarkName/);
  assert.match(commandSources.bookmarks, /toLowerCase\(\)/);
  assert.match(commandSources.bookmarks, /already exists/);
});

check("bookmark create/remove are one-transaction commands", () => {
  assert.match(commandSources.bookmarks, /One transaction/);
  assert.match(commandSources.bookmarks, /tr\.insert\(start, atom\)/);
  assert.match(commandSources.bookmarks, /tr\.delete\(found\.pos, found\.pos \+ 1\)/);
});

check("bookmark navigation stays inside the editor and scrolls to the target", () => {
  assert.match(commandSources.bookmarks, /scrollIntoView\(\)/);
  assert.match(commandSources.extensions, /InternalBookmarkLinks/);
  assert.match(commandSources.extensions, /event\.preventDefault\(\)/);
});

check("link commands and dialog share the same safe URL validator", () => {
  assert.match(commandSources.links, /validateLinkHref/);
  assert.match(read("nova-app/src/shared-editor/LinkDialog.tsx"), /validateLinkHref/);
  assert.match(commandSources.validation, /javascript|data:/i);
});

check("field commands preserve semantic identity and refresh labels without rewriting JSON", () => {
  assert.match(commandSources.fields, /fieldType: type/);
  assert.match(commandSources.fields, /displayText/);
  assert.match(commandSources.fields, /refreshFieldDisplays/);
  assert.doesNotMatch(commandSources.fields, /setNodeMarkup/);
});

check("Insert controls are wired into the shared toolbar and honor read-only state", () => {
  assert.match(commandSources.toolbar + read("nova-app/src/shared-editor/OfficeRibbon.tsx"), /<InsertTools/);
  assert.match(commandSources.insertTools, /disabled=\{disabled\}/);
  assert.match(commandSources.insertTools, /navigateBookmark/);
  assert.match(commandSources.editor, /readOnly \|\| !editor/);
});

check("autosave keeps the existing expectedVersion and no-op body comparison", () => {
  assert.match(commandSources.editor, /expectedVersion: versionRef\.current/);
  assert.match(commandSources.editor, /contentJson === savedContentRef\.current && nextTitle === savedTitleRef\.current/);
  assert.match(commandSources.editor, /conflictRef\.current/);
});

check("verifier defaults use free ephemeral ports and never fixed 8792", () => {
  for (const file of ["scripts/verify/tpi-nova-004-editor.mjs", "scripts/verify/tpi-nova-004r5-persistence.mjs"]) {
    const source = read(file);
    assert.match(source, /freePort\(\)/, file);
    assert.doesNotMatch(source, /8792/, file);
  }
});

check("GenOffice attribution boundary is documented and no source import is present", () => {
  const plan = read("docs/TPI-DEVELOPMENT/400-FUTURE-DEVELOPMENT/TPI-NOVA-005B2-IMPLEMENTATION-PLAN.md");
  const architecture = read("docs/TPI-DEVELOPMENT/400-FUTURE-DEVELOPMENT/TPI-NOVA-005B0C-INSERT-TABLE-OBJECT-ARCHITECTURE.md");
  const notices = read("THIRD-PARTY-NOTICES.md");
  assert.match(plan, /No GenOffice source is copied/);
  assert.match(`${plan}\n${architecture}`, /reference snapshot|frozen SHA/);
  assert.doesNotMatch(notices, /GenOffice source code|genspark-ai\/genoffice/);
});

async function run() {
  for (const item of queue) {
    try {
      await item.fn();
      passed += 1;
      console.log(`  ok   ${item.name}`);
    } catch (error) {
      failed += 1;
      console.log(`  FAIL ${item.name}\n       ${error.message.split("\n")[0]}`);
    }
  }
  console.log(`TPI-NOVA-005B2A foundation verifier: ${passed} passed, ${failed} failed`);
  process.exit(failed === 0 ? 0 : 1);
}
run();
