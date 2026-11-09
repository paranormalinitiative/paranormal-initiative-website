import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const read = file => readFileSync(resolve(root, file), "utf8");
const sha256 = file => createHash("sha256").update(readFileSync(resolve(root, file))).digest("hex");

const sourceRoot = "/Users/toddknipple/Documents/StudioFlow/web";
const readSource = file => readFileSync(resolve(sourceRoot, file), "utf8");
const studioView = readSource("src/NovaEditView.tsx");
const studioStyles = readSource("src/styles.css");
const app = read("nova-app/src/shell/App.tsx");
const fonts = read("nova-app/src/lib/fonts.ts");
const fontLibrary = read("nova-app/src/shared-editor/FontLibrary.tsx");
const documentRibbon = read("nova-app/src/shared-editor/OfficeRibbon.tsx");
const slideRibbon = read("nova-app/src/slides/OfficeRibbon.tsx");
const contentEntry = read("nova-app/src/content-editor-entry.tsx");
const studioHtml = read("studio/index.html");
const novaHtml = read("nova/index.html");
const contentHtml = read("content-editor-nova/content-editor.html");

const checks = [
  ["StudioFlow exposes Documents and Slides without leaving the workspace", /setSurface\(\"documents\"\)/.test(studioView) && /setSurface\(\"slides\"\)/.test(studioView) && /nova-edit-frame/.test(studioView) && /mode=studioflow&embedded=1/.test(studioView)],
  ["Embedded Nova surfaces have a local return control", /Back to Nova Edit/.test(studioView) && /nova-edit-embedded/.test(studioStyles)],
  ["Nova Edit route and selected surface survive refresh", /studioflow\.route/.test(readSource("src/App.tsx")) && /view=nova-edit/.test(readSource("src/App.tsx")) && /studioflow\.nova-edit\.surface/.test(studioView)],
  ["Studio mode is visibly branded as Nova Edit", /studioflowMode/.test(app) && /data-product-mode/.test(app) && /Nova Edit/.test(app)],
  ["Custom fonts accept WOFF2, WOFF, TTF and OTF", /woff2/.test(fonts) && /woff/.test(fonts) && /truetype/.test(fonts) && /opentype/.test(fonts)],
  ["Custom fonts persist in an isolated IndexedDB library", /tpi-nova-brand-fonts/.test(fonts) && /indexedDB\.open/.test(fonts) && /storeRequest/.test(fonts)],
  ["The font library installs fonts through FontFace", /new FontFace/.test(fonts) && /document\.fonts\.add/.test(fonts)],
  ["Documents exposes the shared Brand fonts control and font menu", /useFontLibrary/.test(documentRibbon) && /FontLibraryButton/.test(documentRibbon) && /fonts\.map/.test(documentRibbon)],
  ["Slides exposes the shared Brand fonts control and font menu", /useFontLibrary/.test(slideRibbon) && /FontLibraryButton/.test(slideRibbon) && /fonts\.map/.test(slideRibbon)],
  ["Flagship Content Editor uses the same font library", /FontLibraryProvider/.test(contentEntry) && /NovaEditor/.test(contentEntry)],
  ["StudioFlow serves the current source bundle", /index-Bj1VLcW4\.js/.test(studioHtml) && /index-DtqNaHu6\.css/.test(studioHtml) && existsSync(resolve(root, "studio/assets/index-Bj1VLcW4.js")) && existsSync(resolve(root, "studio/assets/index-DtqNaHu6.css"))],
  ["Nova Documents and Slides serve their current bundles", /index-SVZK6erJ\.js/.test(novaHtml) && /index-DxJAbMPh\.css/.test(novaHtml) && /content-editor-JgQ0wXKS\.js/.test(contentHtml) && /content-editor-DxJAbMPh\.css/.test(contentHtml)],
  ["StudioFlow asset hashes match the staged release baseline", sha256("studio/assets/index-Bj1VLcW4.js") === "4844d55113cf9bb4f97275f8268a7df04dd0abf730878ede3843380abea47af4" && sha256("studio/assets/index-DtqNaHu6.css") === "1e4cae07240dafe0152bc944f71073163845d08ab348c0e86d3e7e21821a6a29"]
];

let failed = 0;
for (const [label, pass] of checks) {
  try { assert.equal(pass, true); console.log(`  ok   ${label}`); }
  catch { failed += 1; console.log(`  fail ${label}`); }
}
console.log(`TPI-NOVA-008 StudioFlow Nova Edit verifier: ${checks.length - failed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
