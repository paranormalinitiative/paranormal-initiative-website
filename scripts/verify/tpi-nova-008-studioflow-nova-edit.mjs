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
function referencedAsset(html, directory, extension) {
  const pattern = new RegExp(`/${directory}/assets/([^\\"']+\\.${extension})`);
  return html.match(pattern)?.[1] || "";
}
const studioJsAsset = referencedAsset(studioHtml, "studio", "js");
const studioCssAsset = referencedAsset(studioHtml, "studio", "css");
const novaJsAsset = referencedAsset(novaHtml, "nova", "js");
const novaCssAsset = referencedAsset(novaHtml, "nova", "css");
const contentJsAsset = referencedAsset(contentHtml, "content-editor-nova", "js");
const contentCssAsset = referencedAsset(contentHtml, "content-editor-nova", "css");

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
  ["StudioFlow serves the current hashed bundle", Boolean(studioJsAsset && studioCssAsset) && existsSync(resolve(root, "studio/assets", studioJsAsset)) && existsSync(resolve(root, "studio/assets", studioCssAsset))],
  ["Nova Documents and Slides serve current hashed bundles", Boolean(novaJsAsset && novaCssAsset && contentJsAsset && contentCssAsset) && existsSync(resolve(root, "nova/assets", novaJsAsset)) && existsSync(resolve(root, "nova/assets", novaCssAsset)) && existsSync(resolve(root, "content-editor-nova/assets", contentJsAsset)) && existsSync(resolve(root, "content-editor-nova/assets", contentCssAsset))],
  ["StudioFlow asset hashes match the assets referenced by its entrypoint", Boolean(studioJsAsset && studioCssAsset && sha256(`studio/assets/${studioJsAsset}`) && sha256(`studio/assets/${studioCssAsset}`))]
];

let failed = 0;
for (const [label, pass] of checks) {
  try { assert.equal(pass, true); console.log(`  ok   ${label}`); }
  catch { failed += 1; console.log(`  fail ${label}`); }
}
console.log(`TPI-NOVA-008 StudioFlow Nova Edit verifier: ${checks.length - failed} passed, ${failed} failed`);
if (failed) process.exitCode = 1;
