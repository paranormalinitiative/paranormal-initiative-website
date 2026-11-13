import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "../..");
const read = (path) => readFileSync(resolve(root, path), "utf8");
const worker = read("worker.js");
const novaStyles = read("nova-app/src/styles.css");
const teamsStyles = read("teams/teams.css");
const themes = ["cryptid", "seance", "cosmic", "asylum", "fieldops", "gothicnight"];
const checks = [
  ["Worker applies the saved theme to static HTML and server-rendered access gates", worker.includes("const EARLY_THEME_BOOTSTRAP") && worker.includes("${EARLY_THEME_BOOTSTRAP}") && worker.includes("body = body.replace")],
  ["Access gate surfaces use theme-aware color tokens", worker.includes("var(--gate-bg)") && worker.includes("var(--gate-accent)") && themes.every((theme) => worker.includes(`html[data-theme=\"${theme}\"] { --gate-`))],
  ["Nova Editorial defines theme palettes for all six site themes", themes.every((theme) => novaStyles.includes(`html[data-theme=\"${theme}\"]`)) && ["--nova-bg", "--nova-panel", "--nova-text", "--nova-accent"].every((token) => novaStyles.includes(token))],
  ["Teams directory applies the saved theme and defines all six palettes", teamsStyles.includes("Site theme integration") && themes.every((theme) => teamsStyles.includes(`html[data-theme=\"${theme}\"]`))],
  ["Protected books remain outside the theme-audit scope", ["TPI_Evidence_Compendium.html", "TPI_Field_Encyclopedia.html", "TPI_Forensic_Analysis_Compendium.html", "TPI_Investigation_Compendium.html", "TPI_Terminology_Reference_Unified.html"].every((path) => !worker.includes(path))]
];

let failed = 0;
for (const [label, passed] of checks) {
  try { assert.equal(passed, true); console.log(`PASS ${label}`); }
  catch { failed += 1; console.log(`FAIL ${label}`); }
}
console.log(`TPI site theme consistency checks: ${checks.length - failed}/${checks.length} passed`);
if (failed) process.exitCode = 1;
