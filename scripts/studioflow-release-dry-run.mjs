#!/usr/bin/env node

/**
 * Read-only StudioFlow release inspection.
 *
 * This utility never builds, copies, deletes, stages, commits, pushes, or
 * deploys. Pass --candidate <directory> to compare an isolated candidate
 * output with the existing TPI generated bundle.
 */

import { createHash } from "node:crypto";
import { existsSync, lstatSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const sourceRoot = "/Users/toddknipple/Documents/StudioFlow/web";
const tpiRoot = "/Users/toddknipple/Documents/GitHub/paranormal-initiative-website";
const tpiStudio = join(tpiRoot, "studio");
const candidateFlag = process.argv.indexOf("--candidate");
const candidateRoot = candidateFlag >= 0 ? resolve(process.argv[candidateFlag + 1] || "") : null;

function gitStatus(root) {
  const result = spawnSync("git", ["-C", root, "status", "--short", "--branch"], { encoding: "utf8" });
  return result.error ? `UNAVAILABLE: ${result.error.message}` : result.stdout.trim();
}
function filesUnder(root) {
  if (!existsSync(root)) return [];
  const files = [];
  function visit(directory) {
    for (const entry of readdirSync(directory, { withFileTypes: true })) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) visit(path);
      else if (entry.isFile()) files.push(relative(root, path));
    }
  }
  visit(root);
  return files.sort();
}

function digest(root, path) {
  const absolute = join(root, path);
  const bytes = readFileSync(absolute);
  return {
    bytes: bytes.length,
    sha256: createHash("sha256").update(bytes).digest("hex")
  };
}

function manifest(root) {
  return Object.fromEntries(filesUnder(root).map((path) => [path, digest(root, path)]));
}

function compare(left, right) {
  const paths = [...new Set([...Object.keys(left), ...Object.keys(right)])].sort();
  return paths.filter((path) => {
    if (!left[path] || !right[path]) return true;
    return left[path].sha256 !== right[path].sha256 || left[path].bytes !== right[path].bytes;
  });
}

function printManifest(name, value) {
  console.log(`\n${name}: ${Object.keys(value).length} files`);
  for (const [path, info] of Object.entries(value)) console.log(`${info.sha256}  ${info.bytes}  ${path}`);
}

if (candidateFlag >= 0 && !candidateRoot) {
  console.error("--candidate requires a directory path");
  process.exitCode = 2;
} else {
  const sourceManifest = manifest(join(sourceRoot, "dist"));
  const tpiManifest = manifest(tpiStudio);
  const report = {
    mode: "DRY RUN / READ ONLY",
    sourceRoot,
    tpiRoot,
    sourceGitStatus: gitStatus(sourceRoot),
    tpiGitStatus: gitStatus(tpiRoot),
    distFiles: Object.keys(sourceManifest).length,
    tpiStudioFiles: Object.keys(tpiManifest).length,
    distVsTpiDifferences: compare(sourceManifest, tpiManifest),
    candidate: candidateRoot || null
  };

  console.log(JSON.stringify(report, null, 2));
  printManifest("Existing StudioFlow/web/dist", sourceManifest);
  printManifest("Existing TPI/studio", tpiManifest);

  if (candidateRoot) {
    const candidateManifest = manifest(candidateRoot);
    report.candidateFiles = Object.keys(candidateManifest).length;
    report.candidateVsDistDifferences = compare(candidateManifest, sourceManifest);
    report.candidateVsTpiDifferences = compare(candidateManifest, tpiManifest);
    printManifest("Candidate", candidateManifest);
    console.log("\nCandidate comparison:");
    console.log(JSON.stringify({
      candidateVsDistDifferences: report.candidateVsDistDifferences,
      candidateVsTpiDifferences: report.candidateVsTpiDifferences
    }, null, 2));
  }
}

