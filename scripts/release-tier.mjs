#!/usr/bin/env node

// TPI-OPS-005 — fail-closed release tier classification.
//
// The tier answers one question: how much risk does this change carry? It is
// computed from the actual diff, never from an operator's description of it.
//
// Two rules make the classification safe:
//
//   1. Ambiguity escalates. If the base commit cannot be established, if the
//      diff cannot be read, or if anything about the change is unexplained, the
//      result is Tier 1.
//   2. Tier may be raised by request but never lowered. `TPI_RELEASE_TIER` can
//      only ask for a stricter classification; asking for a weaker one refuses
//      outright rather than being silently ignored.
//
// Tier 3 is deliberately narrow: only stylesheet bytes may change, and every
// generated JavaScript blob must be byte-identical to the base release. A
// stylesheet-only source change that renames generated bundles also renames the
// StudioFlow entry HTML, which this classifier escalates to Tier 2 because HTML
// is behavioural surface.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const TIER_DEFINITIONS = {
  1: { level: 1, label: "FULL / HIGH RISK" },
  2: { level: 2, label: "STANDARD APPLICATION" },
  3: { level: 3, label: "PRESENTATION / LOW RISK" },
};

// Paths that can change behaviour, security, data shape or the release system
// itself. Any one of these forces Tier 1.
const PROTECTED_PATTERNS = [
  { pattern: /^migrations\//, reason: "database migration" },
  { pattern: /^scripts\//, reason: "release or verification tooling" },
  { pattern: /^lib\//, reason: "Worker shared library (authentication, API, security)" },
  { pattern: /^functions\//, reason: "Worker API surface" },
  { pattern: /^worker\.js$/, reason: "Worker entry point" },
  { pattern: /^wrangler\.(?:toml|jsonc)$/, reason: "release configuration / bindings" },
  { pattern: /^package(?:-lock)?\.json$/, reason: "dependencies and release commands" },
  { pattern: /^\.assetsignore$/, reason: "published asset boundary" },
  { pattern: /^admin-center-app\//, reason: "administration application" },
  { pattern: /^scripts\/e2e\//, reason: "release harness" },
];

// Paths whose change can only affect presentation, and only when the generated
// JavaScript bytes are unchanged.
const PRESENTATION_PATTERNS = [/\.css$/];

export class TierError extends Error {
  constructor(code, message, detail = {}) {
    super(`${code}: ${message}`);
    this.name = "TierError";
    this.code = code;
    this.detail = detail;
  }
}

function git(repoRoot, args) {
  return execFileSync("git", args, { cwd: repoRoot, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], maxBuffer: 64 * 1024 * 1024 }).trim();
}
function gitMaybe(repoRoot, args) {
  try {
    return git(repoRoot, args);
  } catch {
    return null;
  }
}
function isAncestor(repoRoot, candidate, descendant) {
  if (!candidate) return false;
  try {
    execFileSync("git", ["merge-base", "--is-ancestor", candidate, descendant], { cwd: repoRoot, stdio: ["ignore", "pipe", "pipe"] });
    return true;
  } catch {
    return false;
  }
}

/**
 * Base selection, most trustworthy first. Anything unresolved is reported so
 * the caller can escalate rather than guess.
 */
export function resolveClassificationBase({ repoRoot, head, explicitBase, certifiedCommit }) {
  if (explicitBase) {
    if (!isAncestor(repoRoot, explicitBase, head)) return { base: null, source: "explicit", resolved: false, reason: `explicit base ${explicitBase} is not an ancestor of ${head}` };
    return { base: explicitBase, source: "explicit", resolved: true, reason: "operator-supplied base" };
  }
  if (certifiedCommit && certifiedCommit !== head && isAncestor(repoRoot, certifiedCommit, head)) {
    return { base: certifiedCommit, source: "previous-certification", resolved: true, reason: "previous certified release" };
  }
  const main = gitMaybe(repoRoot, ["rev-parse", "refs/remotes/origin/main"]);
  if (main && main !== head && isAncestor(repoRoot, main, head)) {
    return { base: main, source: "origin/main", resolved: true, reason: "origin/main" };
  }
  return { base: null, source: "unresolved", resolved: false, reason: "no trustworthy base commit could be established" };
}

/** Distinct blob hashes of every tracked generated JavaScript bundle at `rev`. */
function generatedJavaScriptBlobs(repoRoot, rev) {
  const rows = gitMaybe(repoRoot, ["ls-tree", "-r", rev, "--", "studio/assets"]);
  if (rows === null) return null;
  const blobs = rows
    .split("\n")
    .filter(Boolean)
    .map((row) => row.split("\t").pop().split(/\s+/))
    .filter((columns) => columns.length >= 3 && columns[columns.length - 1].endsWith(".js"))
    .map((columns) => columns[columns.length - 2]);
  return [...new Set(blobs)].sort();
}

/**
 * Classify a release.
 *
 * @returns {{level:number,label:string,reasons:string[],baseCommit:string|null,baseSource:string,changedFiles:string[],escalated:boolean,requiredGateSet:string}}
 */
export function classifyReleaseTier({ repoRoot, head, explicitBase = null, certifiedCommit = null, requestedTier = null }) {
  const resolved = resolveClassificationBase({ repoRoot, head, explicitBase, certifiedCommit });
  const request = requestedTier === null || requestedTier === undefined || requestedTier === "" ? null : Number(requestedTier);

  const escalate = (level, label, reasons, extra = {}) => {
    const result = {
      level,
      label,
      reasons,
      baseCommit: resolved.base,
      baseSource: resolved.source,
      changedFiles: extra.changedFiles || [],
      escalated: extra.escalated ?? true,
      requiredGateSet: "full",
      requestedTier: request,
    };
    // Tier 1 is the strictest. A request for a weaker tier is a larger number,
    // so `request > level` is a downgrade attempt and always refuses. A request
    // for a stricter tier (smaller number) is allowed.
    if (request !== null) {
      if (!Number.isInteger(request) || request < 1 || request > 3) {
        throw new TierError("TIER_REQUEST_INVALID", `TPI_RELEASE_TIER must be 1, 2 or 3; received ${requestedTier}`, { requestedTier });
      }
      if (request > level) {
        throw new TierError("TIER_DOWNGRADE_REFUSED", `a Tier ${request} release was requested but the change classifies as Tier ${level}: ${reasons.join("; ")}`, { requestedTier: request, computedTier: level, reasons });
      }
    }
    return result;
  };

  if (!resolved.resolved) {
    return escalate(1, TIER_DEFINITIONS[1].label, [`classification base unresolved: ${resolved.reason}`]);
  }

  const changedFiles = (gitMaybe(repoRoot, ["diff", "--name-only", `${resolved.base}..${head}`]) || "").split("\n").filter(Boolean);
  if (!changedFiles.length) {
    return escalate(1, TIER_DEFINITIONS[1].label, ["no changed files could be established between the base and HEAD"]);
  }

  const protectedHits = [];
  for (const path of changedFiles) {
    for (const { pattern, reason } of PROTECTED_PATTERNS) {
      if (pattern.test(path)) protectedHits.push(`${path} (${reason})`);
    }
  }
  if (protectedHits.length) {
    return escalate(1, TIER_DEFINITIONS[1].label, [`protected paths changed: ${protectedHits.slice(0, 12).join(", ")}${protectedHits.length > 12 ? `, +${protectedHits.length - 12} more` : ""}`], { changedFiles });
  }

  const nonPresentation = changedFiles.filter((path) => !PRESENTATION_PATTERNS.some((pattern) => pattern.test(path)));
  if (nonPresentation.length) {
    return escalate(2, TIER_DEFINITIONS[2].label, [`application files changed: ${nonPresentation.slice(0, 12).join(", ")}${nonPresentation.length > 12 ? `, +${nonPresentation.length - 12} more` : ""}`], { changedFiles });
  }

  // Stylesheet-only. The generated JavaScript must still be byte-identical, so a
  // change that silently alters behaviour cannot claim the presentation tier.
  const baseJavaScript = generatedJavaScriptBlobs(repoRoot, resolved.base);
  const headJavaScript = generatedJavaScriptBlobs(repoRoot, head);
  if (!baseJavaScript || !headJavaScript) {
    return escalate(2, TIER_DEFINITIONS[2].label, ["generated JavaScript could not be compared between base and HEAD"], { changedFiles });
  }
  if (baseJavaScript.join(",") !== headJavaScript.join(",")) {
    return escalate(2, TIER_DEFINITIONS[2].label, ["generated JavaScript bytes changed, so the change is not presentation-only"], { changedFiles });
  }

  const result = {
    level: 3,
    label: TIER_DEFINITIONS[3].label,
    reasons: [`stylesheet-only change across ${changedFiles.length} file(s) with byte-identical generated JavaScript`],
    baseCommit: resolved.base,
    baseSource: resolved.source,
    changedFiles,
    escalated: false,
    requiredGateSet: "full",
    requestedTier: request,
  };
  return result;
}

/** Read the source commit of the last certification, if any. */
export function previousCertifiedCommit(candidateRoot) {
  const path = join(candidateRoot, "release-certification.json");
  if (!existsSync(path)) return null;
  try {
    const manifest = JSON.parse(readFileSync(path, "utf8"));
    return manifest?.source?.websiteCommit || null;
  } catch {
    return null;
  }
}
