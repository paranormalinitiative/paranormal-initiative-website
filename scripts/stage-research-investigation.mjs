#!/usr/bin/env node

import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const sourceRoot = resolve(
  process.env.TPI_RESEARCH_SOURCE ||
    "/Users/toddknipple/Documents/GitHub/TPI-Research-and-Investigation-/.worktrees/web-021b-owner-review",
);
const appPath = "/apps/paranormal-initiative/";
const sourceDist = join(sourceRoot, "dist");
const targetDist = join(repoRoot, appPath);

function fail(message) {
  console.error(`Research & Investigation staging failed: ${message}`);
  process.exit(1);
}

if (!existsSync(join(sourceRoot, "package.json"))) {
  fail(`source checkout was not found at ${sourceRoot}`);
}

console.log(`Building Research & Investigation Studio from ${sourceRoot}`);
execFileSync("npm", ["run", "build", "--", `--base=${appPath}`], {
  cwd: sourceRoot,
  stdio: "inherit",
});

if (!existsSync(join(sourceDist, "index.html"))) {
  fail(`the source build did not produce ${sourceDist}/index.html`);
}

rmSync(targetDist, { recursive: true, force: true });
mkdirSync(targetDist, { recursive: true });
cpSync(sourceDist, targetDist, { recursive: true });

// The reviewed source build predates nested website hosting and contains a
// few intentionally absolute browser paths. Keep the source checkout intact
// while making the deployed copy self-contained under its Apps URL. This is a
// deterministic promotion boundary, not a second application implementation.
const replacements = [
  ["/sw.js", `${appPath}sw.js`],
  ["/assets/mystic/PPGhostBrand.png", `${appPath}assets/mystic/PPGhostBrand.png`],
];

const rewriteText = filePath => {
  let text = readFileSync(filePath, "utf8");
  for (const [from, to] of replacements) text = text.split(from).join(to);
  writeFileSync(filePath, text.replace(/[ \t]+$/gm, ""));
};

const textFiles = [];
const collectTextFiles = directory => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const filePath = join(directory, entry.name);
    if (entry.isDirectory()) collectTextFiles(filePath);
    else if (/\.(?:css|html|js|json|mjs|webmanifest)$/i.test(entry.name)) textFiles.push(filePath);
  }
};
collectTextFiles(targetDist);
for (const filePath of textFiles) rewriteText(filePath);

for (const fileName of ["manifest.webmanifest", "sw.js"]) {
  const filePath = join(targetDist, fileName);
  if (!existsSync(filePath)) continue;
  let text = readFileSync(filePath, "utf8");
  text = text
    .replaceAll('"/"', `"${appPath}"`)
    .replaceAll('"/index.html"', `"${appPath}index.html"`)
    .replaceAll('"/manifest.webmanifest"', `"${appPath}manifest.webmanifest"`)
    .replaceAll('"/favicon.svg"', `"${appPath}favicon.svg"`)
    .replaceAll('"/assets/"', `"${appPath}assets/"`);
  writeFileSync(filePath, text);
}

console.log(`Staged Research & Investigation Studio at ${appPath}`);
