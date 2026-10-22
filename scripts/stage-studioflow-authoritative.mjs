#!/usr/bin/env node

/**
 * Build the authoritative StudioFlow source in an isolated copy and stage it
 * into the website repository without discarding the repository's maintained
 * TPI bridge layer.
 *
 * Default mode is verification-only. Pass --apply to copy the verified
 * generated application files into ./studio. Existing unreferenced files are
 * intentionally retained so this command cannot silently remove worktree
 * artifacts.
 */

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";

const repoRoot = path.resolve(new URL(".", import.meta.url).pathname, "..");
const sourceRoot = "/Users/toddknipple/Documents/StudioFlow/web";
const repoStudioRoot = path.join(repoRoot, "studio");
const applyChanges = process.argv.includes("--apply");

const buildCopyFiles = [
  "index.html",
  "package.json",
  "package-lock.json",
  "tsconfig.json",
  "tsconfig.node.json",
  "vite.config.ts"
];

const maintainedBridgeFiles = [
  "workspace-asset-state-bridge.js",
  "brand-heading-bridge.js",
  "production-lock-bridge.js",
  "workspace-bridge.js",
  "video-playback-reset-bridge.js",
  "video-clip-management-bridge.js",
  "audio-soundboard-bridge.js",
  "backup-bridge.js",
  "backup-core.mjs",
  "navigation-bridge.js",
  "studioflow-012-overrides.css"
];

const bridgeTags = [
  '<script src="/studio/workspace-asset-state-bridge.js?tpi080=scene-normalization-v2" defer></script>',
  '<script src="/studio/production-lock-bridge.js" defer></script>',
  '<script src="/studio/workspace-bridge.js?tpi080=scene-normalization-v2&tpi085=freeze-repair-v2&tpi-local-save-v1&tpi-portable-media=v1" defer></script>',
  '<script src="/studio/brand-heading-bridge.js?tpi074=legacy-brand-suppression-v1&tpi085=freeze-repair-v1" defer></script>',
  '<script src="/studio/video-playback-reset-bridge.js?tpi031=video-overlay-v1" defer></script>',
  '<script src="/studio/video-clip-management-bridge.js?tpi020=clip-management-v1&tpi022=video-organization-v10" defer></script>',
  '<script src="/studio/audio-soundboard-bridge.js?tpi021=soundboards-v2" defer></script>',
  '<script src="/studio/backup-bridge.js?tpi032=restore-v2-local-broadcast&tpi-portable-media=v1" defer></script>'
];

function assertExists(target, label) {
  if (!fs.existsSync(target)) {
    throw new Error(`${label} does not exist: ${target}`);
  }
}

function copyIfPresent(source, target, options = {}) {
  if (!fs.existsSync(source)) return false;
  fs.cpSync(source, target, { recursive: true, ...options });
  return true;
}

function listFiles(root) {
  const result = [];
  const visit = (current, relative = "") => {
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryRelative = relative ? path.join(relative, entry.name) : entry.name;
      const entryPath = path.join(current, entry.name);
      if (entry.isDirectory()) visit(entryPath, entryRelative);
      else if (entry.isFile()) result.push(entryRelative);
    }
  };
  visit(root);
  return result.sort();
}

function digestFile(filePath) {
  return crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function digestTree(root) {
  return Object.fromEntries(
    listFiles(root).map((relative) => [relative, digestFile(path.join(root, relative))])
  );
}

function sameDigestTree(left, right) {
  return JSON.stringify(digestTree(left)) === JSON.stringify(digestTree(right));
}

function copyBuildInput(buildRoot) {
  for (const file of buildCopyFiles) {
    const source = path.join(sourceRoot, file);
    if (fs.existsSync(source)) copyIfPresent(source, path.join(buildRoot, file));
  }
  copyIfPresent(path.join(sourceRoot, "src"), path.join(buildRoot, "src"));
  copyIfPresent(path.join(sourceRoot, "public"), path.join(buildRoot, "public"));
  const sourceNodeModules = path.join(sourceRoot, "node_modules");
  assertExists(sourceNodeModules, "authoritative source node_modules");
  fs.symlinkSync(sourceNodeModules, path.join(buildRoot, "node_modules"), "dir");
}

function buildAuthoritativeSource() {
  const buildRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tpi-studioflow-source-"));
  const outputRoot = path.join(buildRoot, "dist");
  try {
    copyBuildInput(buildRoot);
    execFileSync("npm", ["run", "build", "--", "--outDir", outputRoot, "--emptyOutDir"], {
      cwd: buildRoot,
      stdio: "inherit"
    });
    assertExists(path.join(outputRoot, "index.html"), "authoritative build entry point");
    return { buildRoot, outputRoot };
  } catch (error) {
    fs.rmSync(buildRoot, { recursive: true, force: true });
    throw error;
  }
}

function extractThemeBridge(currentIndexHtml) {
  const match = currentIndexHtml.match(/<script>\s*\/\* TPI site-theme bridge:[\s\S]*?<\/script>/);
  if (!match) {
    throw new Error("The maintained TPI site-theme bridge was not found in studio/index.html");
  }
  return match[0];
}

function extractMaintainedExternalScripts(currentIndexHtml) {
  return [...currentIndexHtml.matchAll(/<script\s+src="https?:\/\/[^\"]+"[^>]*><\/script>/g)]
    .map((match) => match[0]);
}

function mergeEntryPoint(generatedIndexHtml, maintainedIndexHtml) {
  const generatedModule = generatedIndexHtml.match(
    /<script type="module" crossorigin src="[^"]+"><\/script>/
  );
  if (!generatedModule) throw new Error("Generated StudioFlow index.html has no module entry point");

  const generatedCss = generatedIndexHtml.match(
    /<link rel="stylesheet" crossorigin href="[^"]+">/
  );
  if (!generatedCss) throw new Error("Generated StudioFlow index.html has no stylesheet entry point");

  const themeBridge = extractThemeBridge(maintainedIndexHtml);
  const integrations = [
    ...extractMaintainedExternalScripts(maintainedIndexHtml)
      .filter((tag) => !generatedIndexHtml.includes(tag)),
    themeBridge,
    ...bridgeTags,
    generatedModule[0],
    '<script src="/studio/navigation-bridge.js" defer></script>'
  ].join("\n    ");

  let merged = generatedIndexHtml.replace(generatedModule[0], integrations);
  merged = merged.replace(
    generatedCss[0],
    `${generatedCss[0]}\n    <link rel="stylesheet" href="/studio/studioflow-012-overrides.css?tpi022=video-organization-v10">`
  );
  return merged;
}

function createIntegratedCandidate(generatedRoot) {
  const candidateRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tpi-studioflow-integrated-"));
  fs.cpSync(generatedRoot, candidateRoot, { recursive: true });

  const maintainedIndexPath = path.join(repoStudioRoot, "index.html");
  assertExists(maintainedIndexPath, "maintained StudioFlow index.html");
  const mergedIndex = mergeEntryPoint(
    fs.readFileSync(path.join(candidateRoot, "index.html"), "utf8"),
    fs.readFileSync(maintainedIndexPath, "utf8")
  );
  fs.writeFileSync(path.join(candidateRoot, "index.html"), mergedIndex);

  for (const file of maintainedBridgeFiles) {
    const source = path.join(repoStudioRoot, file);
    assertExists(source, `maintained TPI integration file ${file}`);
    fs.cpSync(source, path.join(candidateRoot, file));
  }

  const stagedIndex = fs.readFileSync(path.join(candidateRoot, "index.html"), "utf8");
  if (stagedIndex.includes("index-j2x9m9vI.js") || stagedIndex.includes("index-DXjilBOR.css")) {
    throw new Error("Integrated entry point still references obsolete website bundle assets");
  }
  if (!stagedIndex.includes("workspace-bridge.js?tpi080=scene-normalization-v2&tpi085=freeze-repair-v2&tpi-local-save-v1&tpi-portable-media=v1")) {
    throw new Error("Integrated entry point is missing the workspace bridge");
  }
  if (!stagedIndex.includes("backup-bridge.js?tpi032=restore-v2-local-broadcast&tpi-portable-media=v1")) {
    throw new Error("Integrated entry point is missing the backup bridge");
  }
  if (!stagedIndex.includes("video-clip-management-bridge.js?tpi020=clip-management-v1&tpi022=video-organization-v10")) {
    throw new Error("Integrated entry point is missing the video clip management bridge");
  }
  if (!stagedIndex.includes("audio-soundboard-bridge.js?tpi021=soundboards-v2")) {
    throw new Error("Integrated entry point is missing the audio soundboard bridge");
  }

  return candidateRoot;
}

function stageCandidate(candidateRoot) {
  for (const relative of listFiles(candidateRoot)) {
    const source = path.join(candidateRoot, relative);
    const target = path.join(repoStudioRoot, relative);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.copyFileSync(source, target);
  }
}

function verifyGeneratedFiles(candidateRoot, generatedRoot) {
  for (const relative of listFiles(generatedRoot)) {
    const generated = path.join(generatedRoot, relative);
    const candidate = path.join(candidateRoot, relative);
    if (relative === "index.html") continue;
    if (!fs.existsSync(candidate) || digestFile(generated) !== digestFile(candidate)) {
      throw new Error(`Generated asset mismatch in integrated candidate: ${relative}`);
    }
  }
}

function printSummary({ generatedRoot, candidateRoot, reproducible }) {
  const generatedFiles = listFiles(generatedRoot);
  const candidateFiles = listFiles(candidateRoot);
  const generatedIndex = fs.readFileSync(path.join(generatedRoot, "index.html"), "utf8");
  const stagedIndex = fs.readFileSync(path.join(candidateRoot, "index.html"), "utf8");
  const jsReference = generatedIndex.match(/src="(\/studio\/assets\/[^\"]+\.js)"/);
  const cssReference = generatedIndex.match(/href="(\/studio\/assets\/[^\"]+\.css)"/);

  console.log(JSON.stringify({
    sourceRoot,
    repositoryStudioRoot: repoStudioRoot,
    mode: applyChanges ? "apply" : "verify-only",
    generatedFiles: generatedFiles.length,
    integratedFiles: candidateFiles.length,
    generatedJavaScript: jsReference?.[1] ?? null,
    generatedCss: cssReference?.[1] ?? null,
    integratedEntryPointSha256: digestFile(path.join(candidateRoot, "index.html")),
    generatedAssetsMatchIntegratedCandidate: true,
    reproducibleBuilds: reproducible,
    obsoleteBundleReferences: {
      oldJavaScript: stagedIndex.includes("index-j2x9m9vI.js"),
      oldCss: stagedIndex.includes("index-DXjilBOR.css")
    },
    preservedBridgeFiles: maintainedBridgeFiles,
    applied: applyChanges
  }, null, 2));
}

function main() {
  assertExists(sourceRoot, "authoritative StudioFlow source");
  assertExists(repoStudioRoot, "website StudioFlow directory");
  execFileSync(process.execPath, [path.join(sourceRoot, "scripts/check-request-budget.mjs")], {
    cwd: sourceRoot,
    stdio: "inherit"
  });

  const temporaryRoots = [];
  try {
    const first = buildAuthoritativeSource();
    temporaryRoots.push(first.buildRoot);
    const second = buildAuthoritativeSource();
    temporaryRoots.push(second.buildRoot);
    const reproducible = sameDigestTree(first.outputRoot, second.outputRoot);
    if (!reproducible) throw new Error("Two unchanged authoritative builds produced different artifacts");

    const candidateRoot = createIntegratedCandidate(second.outputRoot);
    temporaryRoots.push(candidateRoot);
    verifyGeneratedFiles(candidateRoot, second.outputRoot);
    if (applyChanges) stageCandidate(candidateRoot);

    printSummary({ generatedRoot: second.outputRoot, candidateRoot, reproducible });
  } finally {
    for (const temporaryRoot of temporaryRoots) {
      fs.rmSync(temporaryRoot, { recursive: true, force: true });
    }
  }
}

try {
  main();
} catch (error) {
  console.error(`StudioFlow authoritative staging failed: ${error.message}`);
  process.exitCode = 1;
}
