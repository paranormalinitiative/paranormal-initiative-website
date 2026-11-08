import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const read = file => readFileSync(resolve(root, file), "utf8");
const types = read("nova-app/src/lib/types.ts");
const documents = read("nova-app/src/documents/DocumentEditor.tsx");
const comments = read("nova-app/src/documents/DocumentCommentsPanel.tsx");
const pageSetup = read("nova-app/src/documents/PageSetupPanel.tsx");
const documentRibbon = read("nova-app/src/shared-editor/OfficeRibbon.tsx");
const slidesModel = read("nova-app/src/slides/model.ts");
const slideCanvas = read("nova-app/src/slides/SlideCanvas.tsx");
const slidesRibbon = read("nova-app/src/slides/OfficeRibbon.tsx");
const slidesSurface = read("nova-app/src/slides/SlidesSurface.tsx");
const styles = read("nova-app/src/styles.css");

const checks = [
  ["Document layout metadata is persisted", /NovaDocumentMeta/.test(types) && /meta\?: NovaDocumentMeta/.test(types) && /documentMetaState/.test(documents) && /pageSize/.test(documents)],
  ["Page setup exposes paper, orientation, margins, header, footer and numbering", /Page setup/.test(pageSetup) && /Paper size/.test(pageSetup) && /Orientation/.test(pageSetup) && /Margins/.test(pageSetup) && /Show page numbers/.test(pageSetup)],
  ["Document comments are persisted with resolve and delete actions", /NovaDocumentComment/.test(types) && /DocumentCommentsPanel/.test(documents) && /onResolve/.test(comments) && /onDelete/.test(comments)],
  ["Print layout has a real browser print path", /onPrint=\{\(\) => window\.print\(\)\}/.test(documents) && /@media print/.test(styles) && /Print/.test(documentRibbon)],
  ["Merge fields use the structured field command", /insertField\(editor, "FILENAME"/.test(documentRibbon) && /insertField\(editor, "DATE"/.test(documentRibbon)],
  ["Slides have an editable chart model", /kind: "chart"/.test(slidesModel) && /chartType/.test(slidesModel) && /addChartToSlide/.test(slidesModel)],
  ["Charts render in the actual Konva canvas", /element\.kind === "chart"/.test(slideCanvas) && /chartType/.test(slideCanvas) && /element\.data/.test(slideCanvas)],
  ["Charts are available from the Insert ribbon and inspector", /onAddChart/.test(slidesRibbon) && /label="Chart"/.test(slidesRibbon) && /element\.kind === "chart"/.test(slidesSurface)],
  ["Document and slide lifecycle controls remain present", /permanentlyDelete/.test(documents) && /permanentlyDelete/.test(slidesSurface) && /Restore/.test(documents) && /Restore/.test(slidesSurface)]
];

let failed = 0;
for (const [label, pass] of checks) {
  try { assert.equal(pass, true); console.log(`  ok   ${label}`); }
  catch { failed += 1; console.log(`  fail ${label}`); }
}
console.log(`TPI-NOVA-007 workstation verifier: ${checks.length - failed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
