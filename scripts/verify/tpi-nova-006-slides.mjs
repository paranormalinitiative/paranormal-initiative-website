import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const read = file => readFileSync(resolve(root, file), "utf8");
const model = read("nova-app/src/slides/model.ts");
const surface = read("nova-app/src/slides/SlidesSurface.tsx");
const canvas = read("nova-app/src/slides/SlideCanvas.tsx");
const shell = read("nova-app/src/shell/App.tsx");
const api = read("nova-app/src/lib/api.ts");
const packageJson = JSON.parse(read("nova-app/package.json"));

const checks = [
  ["presentation envelope is structured Nova content", /NOVA_SLIDES_FORMAT = "nova-presentation"/.test(model) && /presentation: Presentation/.test(model)],
  ["slide model keeps view state out of persisted data", /updateElement/.test(model) && !/selection|transformer|zoom/.test(model.split("export function envelope")[0])],
  ["slide operations cover create, duplicate, reorder and delete", ["addSlide", "duplicateSlide", "reorderSlide", "deleteSlide"].every(name => new RegExp(`function ${name}`).test(model))],
  ["canvas adapter writes geometry back to the model", /onDragEnd/.test(canvas) && /onTransformEnd/.test(canvas) && /onUpdateElement/.test(canvas)],
  ["Slides is lazy-loaded and routed from the Nova shell", /lazy\(\(\) => import\("\.\.\/slides\/SlidesSurface"\)\)/.test(shell) && /#\/slides/.test(shell)],
  ["Slides uses the Nova presentation API with optimistic versioning", /type: "nova-presentation"/.test(surface) && /expectedVersion: versionRef\.current/.test(surface) && /content: envelope\(presentation\)/.test(surface)],
  ["API supports presentation filtering and content envelopes", /type\?: "nova-document" \| "nova-presentation" \| "all"/.test(api) && /NovaContentEnvelope/.test(api)],
  ["Konva dependencies are pinned", packageJson.dependencies?.konva === "^10.9.1" && packageJson.dependencies?.["react-konva"] === "^19.3.2"]
];

let failed = 0;
for (const [label, pass] of checks) {
  try { assert.equal(pass, true); console.log(`  ok   ${label}`); }
  catch { failed += 1; console.log(`  fail ${label}`); }
}
console.log(`TPI-NOVA-006 Slides verifier: ${checks.length - failed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
