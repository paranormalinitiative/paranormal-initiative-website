#!/usr/bin/env node
// TPI-STUDIOFLOW-137 — approved-feature continuity and release-lineage guard.
//
// TPI-STUDIOFLOW-130 shipped without the approved Notes workspace because the
// release baseline was pointed at a *sibling* source lineage that never
// contained it. Nothing failed: the build was reproducible, the tests passed,
// and the artefact simply did not have the feature. This gate makes that class
// of silent omission a release-blocking failure.
//
// Two independent checks run here:
//   1. Lineage — the approved commit must descend from the previously approved
//      commit. A deliberate compatibility port that legitimately changes
//      lineage must set TPI_RELEASE_LINEAGE_OVERRIDE to a written reason, which
//      is echoed into the release output and the record.
//   2. Feature continuity — the approved commit must still contain the approved
//      Notes entry points, and the staged bundle must still contain the
//      workspace. A stale or replaced asset fails here rather than shipping.
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const repoRoot = resolve(import.meta.dirname, "../..");
const baselinePath = join(repoRoot, "scripts", "studioflow-release-baseline.json");
const results = [];
const check = (name, passed, detail = "") => results.push({ name, passed: Boolean(passed), detail: passed ? "" : String(detail || "") });

function git(repository, args) {
  return execFileSync("git", args, { cwd: repository, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }).trim();
}

const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
const repository = baseline?.source?.repository;
const approved = String(baseline?.source?.approvedCommit || "");
const previous = String(baseline?.source?.previousApprovedCommit || "");

check("release baseline records a full approved source commit", /^[0-9a-f]{40}$/.test(approved), approved);

// ---- 1. lineage ------------------------------------------------------------
if (previous) {
  let isAncestor = false;
  try {
    git(repository, ["merge-base", "--is-ancestor", previous, approved]);
    isAncestor = true;
  } catch {
    isAncestor = false;
  }
  const override = String(process.env.TPI_RELEASE_LINEAGE_OVERRIDE || "").trim();
  if (isAncestor) {
    check("approved commit descends from the previously approved commit", true);
  } else if (override) {
    check("approved commit descends from the previously approved commit", true, "");
    results.push({ name: "documented lineage override accepted", passed: true, detail: "", note: override });
  } else {
    check(
      "approved commit descends from the previously approved commit",
      false,
      `${approved} does not descend from ${previous}. A sibling-lineage source change silently removes approved features. Set TPI_RELEASE_LINEAGE_OVERRIDE to a written justification if this port is deliberate.`
    );
  }
} else {
  check("release baseline records a previous approved commit", false, "source.previousApprovedCommit is missing, so lineage cannot be verified");
}

// ---- 2. approved feature continuity ---------------------------------------
function sourceFile(path) {
  return git(repository, ["show", `${approved}:${path}`]);
}

let appSource = "";
try {
  appSource = sourceFile("src/App.tsx");
  check("approved commit contains the StudioFlow application source", appSource.length > 0);
} catch (error) {
  check("approved commit contains the StudioFlow application source", false, String(error?.message || error));
}

const requiredSourceMarkers = [
  { name: "Notes route is a first-class application route", pattern: /"notes"/ },
  { name: "Home create grid renders the Notes card", pattern: /title="Notes" sub="Write, research, and organize notes"/ },
  { name: "main navigation renders the Notes entry", pattern: /<FileText size=\{18\} \/> Notes/ },
  { name: "Notes workspace component is mounted for its route", pattern: /route === "notes" && <NotesView/ },
  { name: "Notes workspace module is imported", pattern: /from "\.\/NotesView"/ }
];
for (const marker of requiredSourceMarkers) {
  check(marker.name, marker.pattern.test(appSource));
}

try {
  const notesModule = sourceFile("src/NotesView.tsx");
  check("approved commit contains the Notes workspace module", notesModule.includes("export function NotesView"));
} catch (error) {
  check("approved commit contains the Notes workspace module", false, String(error?.message || error));
}

// ---- 3. staged bundle continuity ------------------------------------------
const stagedScript = join(repoRoot, "studio", "assets", baseline?.expectedAssets?.javaScript?.name || "");
let bundle = "";
try {
  bundle = readFileSync(stagedScript, "utf8");
  check("staged production bundle is readable", bundle.length > 0);
} catch (error) {
  check("staged production bundle is readable", false, String(error?.message || error));
}
if (bundle) {
  const bundleMarkers = ["notesWorkspaceIntent", "notes-rich-editor", "studioflow.notes.layout"];
  for (const marker of bundleMarkers) {
    check(`staged bundle contains the Notes marker ${marker}`, bundle.includes(marker));
  }
  check("staged bundle still contains the older right-side Notes scratchpad", bundle.includes("Write private show notes"));
}

// ---- outcome --------------------------------------------------------------
const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({
  status: failed.length === 0 ? "PASS" : "FAIL",
  suite: "TPI-STUDIOFLOW-137-NOTES-CONTINUITY",
  approvedCommit: approved,
  previousApprovedCommit: previous,
  passed: results.length - failed.length,
  total: results.length,
  results
}, null, 2));
process.exit(failed.length === 0 ? 0 : 1);
