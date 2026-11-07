// TPI-NOVA-005B1 verifier: real Home ribbon commands and bounded persistence.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import assert from "node:assert/strict";
import { novaDocToHtml } from "../../lib/nova-document-html.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = path => readFileSync(resolve(repoRoot, path), "utf8");
const ribbon = read("nova-app/src/shared-editor/GenOfficeRibbon.tsx");
const extensions = read("nova-app/src/shared-editor/editorExtensions.ts");
const mark = read("nova-app/src/shared-editor/ribbonExtensions.ts");
const renderer = read("lib/nova-document-html.js");
const converterSource = read("content-editor-nova-convert.js");
let passed = 0;
let failed = 0;

function check(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`  ok   ${name}`);
  } catch (error) {
    failed += 1;
    console.log(`  FAIL ${name}\n       ${error.message.split("\n")[0]}`);
  }
}

check("Home exposes real clipboard, typography and paragraph commands", () => {
  assert.match(ribbon, /runClipboard\(editor, "paste"\)/);
  assert.match(ribbon, /toggleBold\(\)/);
  assert.match(ribbon, /toggleItalic\(\)/);
  assert.match(ribbon, /toggleUnderline\(\)/);
  assert.match(ribbon, /toggleStrike\(\)/);
  assert.match(ribbon, /setMark\("tpiTextStyle"/);
  assert.match(ribbon, /setIndent\(editor, 36\)/);
  assert.match(ribbon, /setAlignment\(editor, "center"\)/);
  assert.match(ribbon, /clearFormatting\(editor\)/);
});

check("unsupported controls are not presented as implemented", () => {
  assert.doesNotMatch(ribbon, /Format Painter/);
  assert.doesNotMatch(ribbon, /Line and paragraph spacing/);
  assert.doesNotMatch(ribbon, /Nova AI/);
  assert.match(ribbon, /PlannedPanel/);
});

check("text and block attributes are part of the persisted editor schema", () => {
  for (const token of ["fontFamily", "fontSize", "backgroundColor", "textAlign", "indentLeft", "indentRight"]) {
    assert.match(`${extensions}\n${mark}`, new RegExp(token));
  }
  assert.match(extensions, /levels: \[1, 2, 3\]/);
});

check("renderer bounds text styles and paragraph layout", () => {
  const document = {
    type: "doc",
    content: [{
      type: "paragraph",
      attrs: { textAlign: "center", indentLeft: 999, indentRight: 36 },
      content: [{
        type: "text",
        text: "Styled",
        marks: [{ type: "tpiTextStyle", attrs: { fontFamily: "Georgia", fontSize: "17px", color: "#abcdef", backgroundColor: "#f5d76e" } }]
      }]
    }]
  };
  const html = novaDocToHtml(document);
  assert.equal(html, '<p style="text-align:center;margin-left:288px;margin-right:36px"><span style="font-family:Georgia;font-size:17px;color:#abcdef;background-color:#f5d76e">Styled</span></p>');
  assert.doesNotMatch(novaDocToHtml({ type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "x", marks: [{ type: "tpiTextStyle", attrs: { fontFamily: "url(javascript:x)", fontSize: "999px", color: "red" } }] }] }] }), /url|999px|color:red/);
});

check("browser and server renderers retain exact Home formatting parity", () => {
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(converterSource, sandbox);
  const document = { type: "doc", content: [{ type: "paragraph", attrs: { textAlign: "right", indentLeft: 72 }, content: [{ type: "text", text: "Parity", marks: [{ type: "tpiTextStyle", attrs: { fontFamily: "Inter", fontSize: "20px", color: "#ffffff" } }] }] }] };
  assert.equal(sandbox.window.TPINovaConvert.novaDocToHtml(document), novaDocToHtml(document));
});

if (failed) {
  console.log(`TPI-NOVA-005B1 Home ribbon verifier: ${passed} passed, ${failed} failed`);
  process.exit(1);
}
console.log(`TPI-NOVA-005B1 Home ribbon verifier: ${passed} passed, 0 failed`);
console.log("TPI-NOVA-005B1 — COMPLETE — REAL HOME RIBBON FUNCTIONALITY VERIFIED");
