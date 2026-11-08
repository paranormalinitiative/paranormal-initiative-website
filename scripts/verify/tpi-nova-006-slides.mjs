import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const read = file => readFileSync(resolve(root, file), "utf8");
const model = read("nova-app/src/slides/model.ts");
const surface = read("nova-app/src/slides/SlidesSurface.tsx");
const ribbon = read("nova-app/src/slides/GenOfficeRibbon.tsx");
const styles = read("nova-app/src/styles.css");
const canvas = read("nova-app/src/slides/SlideCanvas.tsx");
const shell = read("nova-app/src/shell/App.tsx");
const api = read("nova-app/src/lib/api.ts");
const contentEntry = read("nova-app/src/content-editor-entry.tsx");
const contentVite = read("nova-app/vite.content-editor.config.ts");
const contentShell = read("paper-editor.html");
const contentScript = read("paper-editor.js");
const packageJson = JSON.parse(read("nova-app/package.json"));

const checks = [
  ["presentation envelope is structured Nova content", /NOVA_SLIDES_FORMAT = "nova-presentation"/.test(model) && /presentation: Presentation/.test(model)],
  ["slide model keeps view state out of persisted data", /updateElement/.test(model) && !/selection|transformer|zoom/.test(model.split("export function envelope")[0])],
  ["slide operations cover create, duplicate, reorder and delete", ["addSlide", "duplicateSlide", "reorderSlide", "deleteSlide"].every(name => new RegExp(`function ${name}`).test(model))],
  ["canvas adapter writes geometry back to the model", /onDragEnd/.test(canvas) && /onTransformEnd/.test(canvas) && /onUpdateElement/.test(canvas)],
  ["Slides is lazy-loaded and routed from the Nova shell", /lazy\(\(\) => import\("\.\.\/slides\/SlidesSurface"\)\)/.test(shell) && /#\/slides/.test(shell)],
  ["Slides uses the Nova presentation API with optimistic versioning", /type: "nova-presentation"/.test(surface) && /expectedVersion: versionRef\.current/.test(surface) && /content: envelope\(latestPresentation\)/.test(surface)],
  ["API supports presentation filtering and content envelopes", /type\?: "nova-document" \| "nova-presentation" \| "all"/.test(api) && /NovaContentEnvelope/.test(api)],
  ["Konva dependencies are pinned", packageJson.dependencies?.konva === "^10.9.1" && packageJson.dependencies?.["react-konva"] === "^19.3.2"],
  ["Content Editor mounts the existing Slides surface", /mountNovaSlidesWorkspace/.test(contentEntry) && /<SlidesSurface/.test(contentEntry)],
  ["Content Editor bundle includes the Slides canvas vendor chunk", /node_modules\/konva/.test(contentVite) && /nova-vendor-slides/.test(contentVite)],
  ["Content Editor exposes an active Slides workspace control", /data-workspace-mode="slides"/.test(contentShell) && /id="nova-slides-workspace"/.test(contentShell) && /setWorkspaceMode/.test(contentScript)],
  ["Slides provides professional templates", /SlideTemplateKey/.test(model) && /field-report/.test(model) && /evidence-brief/.test(model) && /lecture/.test(model) && /Presentation template/.test(surface)],
  ["Slide text is editable after insertion", /SlideInspector/.test(surface) && /Edit this text/.test(surface) && /element\.text/.test(surface)],
  ["Slides support real image sources", /imageFileToDataUrl/.test(surface) && /Upload image/.test(ribbon) && /src\?: string/.test(model) && /KonvaImage/.test(canvas)],
  ["Slides use the full-width GenOffice ribbon and live slide thumbnails", /Ribbon\.tsx/.test(ribbon) && /nova-genoffice-ribbon/.test(ribbon) && /\.nova-genoffice-ribbon \{[^}]*width: 100%/.test(styles) && /\.nova-ribbon-body \{[^}]*width: 100%/.test(styles) && /legacy global `section` rule/.test(styles) && /animation: none/.test(styles) && /PresentationThumbnail/.test(surface) && /data-testid=\"slide-thumbnail\"/.test(surface)],
  ["Slides workspace and presentation survive host refresh", /persistWorkspaceMode/.test(contentScript) && /restoreRequestedWorkspaceMode/.test(contentScript) && /workspace.*slides/.test(contentScript) && /initialPresentationId/.test(contentEntry) && /presentation/.test(contentScript)],
  ["All Slides ribbon tabs expose real editing controls", /activeTab === "draw"/.test(ribbon) && /activeTab === "design"/.test(ribbon) && /activeTab === "transitions"/.test(ribbon) && /activeTab === "animations"/.test(ribbon) && /activeTab === "review"/.test(ribbon) && /activeTab === "view"/.test(ribbon) && /onAddLine/.test(ribbon) && /onSetTransition/.test(ribbon) && /onSetAnimation/.test(ribbon)],
  ["Slides persist themes, transitions, review notes, and sorter view", /SlideTransition/.test(model) && /reviewNotes/.test(model) && /nova-slide-sorter/.test(styles) && /onReviewNoteChange/.test(surface) && /viewMode/.test(surface)],
  ["Presenter mode includes navigation and notes", /PresenterMode/.test(surface) && /Presenter mode/.test(surface) && /Speaker notes/.test(surface) && /PageDown/.test(surface)]
];

let failed = 0;
for (const [label, pass] of checks) {
  try { assert.equal(pass, true); console.log(`  ok   ${label}`); }
  catch { failed += 1; console.log(`  fail ${label}`); }
}
console.log(`TPI-NOVA-006 Slides verifier: ${checks.length - failed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
