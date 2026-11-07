// TPI-NOVA-005B2B verifier: professional table schema, commands and renderer parity.
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";
import assert from "node:assert/strict";
import { novaDocToHtml } from "../../lib/nova-document-html.js";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..", "..");
const read = path => readFileSync(resolve(repoRoot, path), "utf8");
const extensions = read("nova-app/src/shared-editor/editorExtensions.ts");
const attributes = read("nova-app/src/shared-editor/tableAttributes.ts");
const commands = read("nova-app/src/shared-editor/commands/tables.ts");
const ribbon = read("nova-app/src/shared-editor/GenOfficeRibbon.tsx");
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

const tableDocument = {
  type: "doc",
  content: [{
    type: "table",
    attrs: {
      widthPct: 80,
      autoFit: "fixed",
      alignment: "center",
      stylePreset: "accent",
      borderStyle: "solid",
      borderWidth: 2,
      borderColor: "#abcdef"
    },
    content: [{
      type: "tableRow",
      attrs: { heightPx: 48 },
      content: [{
        type: "tableHeader",
        attrs: { colspan: 2, verticalAlign: "middle", fill: "#112233" },
        content: [{ type: "paragraph", content: [{ type: "text", text: "Header" }] }]
      }]
    }, {
      type: "tableRow",
      content: [{
        type: "tableCell",
        attrs: { rowspan: 2, verticalAlign: "bottom", borderStyle: "dashed", borderWidth: 1, borderColor: "#445566" },
        content: [{ type: "paragraph", content: [{ type: "text", text: "Body" }] }]
      }, {
        type: "tableCell",
        content: [{ type: "paragraph", content: [{ type: "text", text: "Value" }] }]
      }]
    }]
  }]
};

check("table schema adds bounded table, row and cell attributes", () => {
  for (const token of ["widthPx", "widthPct", "autoFit", "stylePreset", "borderStyle", "borderWidth", "borderColor", "heightPx", "verticalAlign", "fill"]) {
    assert.match(attributes, new RegExp(token));
  }
  assert.match(extensions, /resizable: true/);
  assert.doesNotMatch(extensions, /TableAttributeDOMSync/);
});

check("table commands are centralized and cover the 005B2B dependency order", () => {
  for (const token of ["insertNovaTable", "addNovaRow", "deleteNovaRow", "addNovaColumn", "deleteNovaColumn", "mergeNovaCells", "splitNovaCell", "setNovaTableAutoFit", "setNovaTableBorder", "setNovaCellFill"]) {
    assert.match(commands, new RegExp(`function ${token}`));
  }
  assert.match(ribbon, /renderTableDesign/);
  assert.match(ribbon, /renderTableLayout/);
  assert.match(ribbon, /mergeNovaCells\(editor\)/);
  assert.match(ribbon, /splitNovaCell\(editor\)/);
});

check("legacy simple tables keep their exact publication shape", () => {
  const legacy = { type: "doc", content: [{ type: "table", content: [{ type: "tableRow", content: [{ type: "tableCell", content: [{ type: "paragraph", content: [{ type: "text", text: "cell" }] }] }] }] }] };
  assert.equal(novaDocToHtml(legacy), "<table><tr><td><p>cell</p></td></tr></table>");
});

check("professional table attributes render with bounded HTML", () => {
  const html = novaDocToHtml(tableDocument);
  assert.equal(html, '<table data-tpi-width-pct="80" data-tpi-autofit="fixed" data-tpi-alignment="center" data-tpi-style="accent" data-tpi-border-style="solid" data-tpi-border-width="2" data-tpi-border-color="#abcdef" style="width:80%;table-layout:fixed;margin-left:auto;margin-right:auto;border-collapse:collapse;border-style:solid;border-width:2px;border-color:#abcdef"><tr data-tpi-height-px="48" style="height:48px"><th colspan="2" data-tpi-vertical-align="middle" data-tpi-fill="#112233" style="vertical-align:middle;background-color:#112233"><p>Header</p></th></tr><tr><td rowspan="2" data-tpi-vertical-align="bottom" data-tpi-cell-border-style="dashed" data-tpi-cell-border-width="1" data-tpi-cell-border-color="#445566" style="vertical-align:bottom;border-style:dashed;border-width:1px;border-color:#445566"><p>Body</p></td><td><p>Value</p></td></tr></table>');
});

check("unsafe table values never reach publication HTML", () => {
  const unsafe = { type: "doc", content: [{ type: "table", attrs: { widthPx: 999999, borderColor: "red", borderStyle: "expression(alert(1))", autoFit: "url(javascript:x)" }, content: [{ type: "tableRow", content: [{ type: "tableCell", attrs: { fill: "url(javascript:x)", verticalAlign: "middle; color:red" }, content: [{ type: "paragraph" }] }] }] }] };
  const html = novaDocToHtml(unsafe);
  assert.doesNotMatch(html, /expression|javascript|url\(|color:red/);
  assert.match(html, /width:1600px/);
});

check("browser and server renderers retain exact table parity", () => {
  const sandbox = { window: {}, console };
  vm.createContext(sandbox);
  vm.runInContext(converterSource, sandbox);
  assert.equal(sandbox.window.TPINovaConvert.novaDocToHtml(tableDocument), novaDocToHtml(tableDocument));
});

if (failed) {
  console.log(`TPI-NOVA-005B2B table verifier: ${passed} passed, ${failed} failed`);
  process.exit(1);
}
console.log(`TPI-NOVA-005B2B table verifier: ${passed} passed, 0 failed`);
