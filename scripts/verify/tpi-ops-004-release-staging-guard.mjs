#!/usr/bin/env node
// TPI-OPS-004: release staging guard regression.
//
// The guarded production deployment copies the repository into a disposable
// staging directory and then lets Wrangler publish it through `.assetsignore`.
// Before TPI-OPS-004 that copy included `.local-dev`, the owner's disposable
// local runtime state (local D1/R2, staged assets, worktrees, logs and the
// protected QA credential files): ~32k files and ~2.1 GB per invocation that
// `.assetsignore` then discarded.
//
// This gate locks the correction down. It fails if:
//   1. the deployment guard stops excluding `.local-dev` from the copy, or
//   2. `.assetsignore` stops excluding `.local-dev` from the published manifest.
//
// Both must hold together. If (2) ever regressed, excluding the directory from
// the copy would silently remove published files instead of merely skipping
// discarded ones, so the pair is the actual safety property.
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";

const repoRoot = process.cwd();
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });

const guardSource = readFileSync(join(repoRoot, "scripts", "deploy-production-guarded.mjs"), "utf8");
const assetsIgnore = readFileSync(join(repoRoot, ".assetsignore"), "utf8");

// ---- 1. the guard must exclude the disposable local runtime directory ------
check(
  "deployment guard excludes .local-dev from the staging copy",
  /const excludedDirectories = new Set\(\[[^\]]*"\.local-dev"/.test(guardSource),
  "scripts/deploy-production-guarded.mjs no longer lists .local-dev in excludedDirectories"
);

// ---- 2. the published manifest must also exclude it ------------------------
const ignoreLines = assetsIgnore.split("\n").map((line) => line.trim()).filter(Boolean);
check(
  ".assetsignore excludes .local-dev from the published asset manifest",
  ignoreLines.some((line) => line === ".local-dev" || line === ".local-dev/**" || line === "/.local-dev"),
  ".assetsignore no longer ignores .local-dev, so it would be published if it were copied"
);

// ---- 3. the copy set must not contain any .local-dev path ------------------
// Replicates the guard's filter so the assertion tracks the real code path
// rather than a stale copy of the rules.
const excludedDirectories = new Set(
  (guardSource.match(/const excludedDirectories = new Set\(\[([^\]]*)\]\)/)?.[1] || "")
    .split(",")
    .map((value) => value.trim().replace(/^"|"$/g, ""))
    .filter(Boolean)
);
const excludedFiles = new Set(
  (guardSource.match(/const excludedFiles = new Set\(\[([^\]]*)\]\)/)?.[1] || "")
    .split(",")
    .map((value) => value.trim().replace(/^"|"$/g, ""))
    .filter(Boolean)
);
const guardFilter = (absolutePath) => {
  const rel = relative(repoRoot, absolutePath);
  if (!rel) return true;
  const parts = rel.split(sep);
  if (excludedDirectories.has(parts[0])) return false;
  const base = parts.at(-1);
  if (excludedFiles.has(base) || base.startsWith(".env.")) return false;
  if (base.toLowerCase().endsWith(".md")) return false;
  if (parts.some((part) => part === ".git" || part === ".wrangler")) return false;
  return true;
};

let copied = 0;
let copiedBytes = 0;
let leaked = 0;
const walk = (directory) => {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = join(directory, entry.name);
    if (!guardFilter(absolutePath)) continue;
    if (entry.isDirectory()) walk(absolutePath);
    else if (entry.isFile()) {
      copied += 1;
      copiedBytes += statSync(absolutePath).size;
      if (relative(repoRoot, absolutePath).split(sep)[0] === ".local-dev") leaked += 1;
    }
  }
};
walk(repoRoot);

check(
  "no file from the disposable local runtime directory enters the staging copy",
  leaked === 0,
  `${leaked} .local-dev file(s) would be copied into the production staging directory`
);

// ---- 4. the copy set is the small published set, not the owner's state -----
// A guard that silently copied everything would pass (1)-(3) but still be slow.
// This bound catches the original regression: the copy was ~32.6k files because
// it included local runtime state.
check(
  "staging copy stays within the published asset set",
  copied > 0 && copied < 4000,
  `${copied} files (${(copiedBytes / 1048576).toFixed(1)} MB) - the copy includes files that are not published assets`
);

const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({
  status: failed.length === 0 ? "PASS" : "FAIL",
  suite: "TPI-OPS-004-RELEASE-STAGING-GUARD",
  staging: { copiedFiles: copied, copiedMegabytes: Number((copiedBytes / 1048576).toFixed(1)), excludedDirectories: [...excludedDirectories] },
  passed: results.length - failed.length,
  total: results.length,
  results,
}, null, 2));
process.exit(failed.length === 0 ? 0 : 1);
