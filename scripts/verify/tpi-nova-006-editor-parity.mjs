import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const read = file => readFileSync(resolve(root, file), "utf8");
const ribbon = read("nova-app/src/shared-editor/OfficeRibbon.tsx");
const insert = read("nova-app/src/shared-editor/InsertTools.tsx");
const extensions = read("nova-app/src/shared-editor/editorExtensions.ts");
const toolbar = read("nova-app/src/shared-editor/EditorToolbar.tsx");
const documentEditor = read("nova-app/src/documents/DocumentEditor.tsx");
const findReplace = read("nova-app/src/shared-editor/FindReplacePanel.tsx");
const styles = read("nova-app/src/styles.css");
const hostStyles = read("style.css");

const checks = [
  ["Documents exposes the complete document tab strip", ["Home", "Insert", "Draw", "Design", "Layout", "References", "Mailings", "Review", "View"].every(tab => ribbon.includes(`"${tab}"`))],
  ["Documents has real editing controls on every main tab", ["renderHome", "renderInsert", "renderDraw", "renderDesign", "renderLayout", "renderReferences", "renderMailings", "renderReview", "renderView"].every(name => ribbon.includes(name)) && !/tab === "(Draw|References|Mailings)"[^]*PlannedPanel/.test(ribbon)],
  ["Documents supports portable image insertion", /NovaImage/.test(extensions) && /type: "novaImage"/.test(insert) && /Insert image from computer/.test(insert) && /Image URL/.test(insert) && /nova-prose img/.test(styles)],
  ["Documents supports find and replace", /FindReplacePanel/.test(documentEditor) && /replaceAll/.test(findReplace) && /Find and replace/.test(ribbon)],
  ["Documents supports document view modes", /DocumentViewMode/.test(ribbon) && /viewMode/.test(toolbar) && /setViewMode/.test(documentEditor) && /data-view-mode/.test(documentEditor) && /nova-canvas-web/.test(styles)],
  ["Print-layout document surface is centered and page-bounded", /\.nova-canvas-print \.nova-prose[\s\S]*width:\s*min\(100%,\s*var\(--nova-page-width/.test(styles) && /margin-inline:\s*auto/.test(styles)],
  ["Content Editor regular surface is centered with a visible native caret", /#nova-content-editor \.nova-shared-document-canvas[\s\S]*padding: 26px 18px 48px/.test(hostStyles) && /#nova-content-editor \.nova-prose[\s\S]*width: min\(100%, 816px\)[\s\S]*caret-color: #f8fff9/.test(hostStyles)],
  ["Documents preserves focus-safe ribbon integration", /onMouseDown=\{event => event\.preventDefault\(\)\}/.test(ribbon) && /onRequestLink/.test(toolbar)],
  ["Documents keeps structured table controls", /renderTableDesign/.test(ribbon) && /renderTableLayout/.test(ribbon) && /setNovaTableStyle/.test(ribbon) && /mergeNovaCells/.test(ribbon)],
  ["Documents keeps bookmarks, fields, and references", /InsertTools/.test(ribbon) && /createBookmark/.test(insert) && /insertField/.test(insert) && /Citation/.test(ribbon)]
  , ["Documents provide safe Trash restore and permanent deletion", /permanent-delete/.test(documentEditor) && /permanentlyDelete/.test(documentEditor) && /DELETE PERMANENTLY/.test(documentEditor) && /Restore/.test(documentEditor)]
];

let failed = 0;
for (const [label, pass] of checks) {
  try { assert.equal(pass, true); console.log(`  ok   ${label}`); }
  catch { failed += 1; console.log(`  fail ${label}`); }
}
console.log(`TPI-NOVA-006 editor parity verifier: ${checks.length - failed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
