#!/usr/bin/env node

// TPI-OPS-006 — change-impact release profiles.
//
// The existing release tier describes risk, but it does not decide which
// verification gates are relevant. This module makes that decision from the
// actual changed paths. Ambiguous or shared-platform changes escalate to the
// full platform profile; ordinary website-only changes stay small.

export const RELEASE_PROFILES = {
  website: { name: "WEBSITE ONLY", rank: 1 },
  studioflow: { name: "STUDIOFLOW APPLICATION", rank: 2 },
  full: { name: "FULL PLATFORM", rank: 3 },
};

export const PROTECTED_APPLICATION_PREFIXES = ["studio/", "nova/", "admin-center-preview/"];

const FULL_PATTERNS = [
  /^migrations\//,
  /^functions\//,
  /^lib\//,
  /^worker\.js$/,
  /^wrangler\.(?:toml|jsonc)$/,
  /^package(?:-lock)?\.json$/,
  /^\.assetsignore$/,
  /^admin-center-app\//,
  /^admin-center-preview\//,
  /^nova\//,
  /^nova-app\//,
  /^scripts\/(?:tpi-release|deploy-production-guarded|release-certification|release-tier|release-impact|stage-local|stage-studioflow|local-dev-service)/,
  /^scripts\/(?:e2e|qa\/run-qa|verify\/tpi-ops-)/,
  /^scripts\/verify\/tpi-release-/,
  /^scripts\/verify\/tpi-website-surface-smoke/,
  /^scripts\/verify\/tpi-(?:nova|admin)-/,
];

const STUDIOFLOW_PATTERNS = [
  /^studio\//,
  /^scripts\/verify\/tpi-studioflow-/,
  /^scripts\/studioflow-/,
];

const WEBSITE_TEST_PATTERNS = [
  /^scripts\/verify\/tpi-member-/,
  /^scripts\/verify\/tpi-help-center-/,
  /^scripts\/verify\/tpi-education-/,
  /^scripts\/qa\/tpi-link-preview-/,
];

function matchesAny(path, patterns) {
  return patterns.some(pattern => pattern.test(path));
}

/**
 * @returns {{profile:"website"|"studioflow"|"full", reasons:string[], changedFiles:string[], forced:boolean}}
 */
export function classifyReleaseImpact({ changedFiles = [], requestedProfile = null } = {}) {
  const files = [...new Set(changedFiles.filter(Boolean))].sort();
  const requested = requestedProfile ? String(requestedProfile).trim().toLowerCase() : null;
  if (requested && !Object.hasOwn(RELEASE_PROFILES, requested)) {
    throw new Error(`TPI_RELEASE_PROFILE must be website, studioflow, or full; received ${requestedProfile}`);
  }

  let profile = "website";
  const reasons = [];
  const fullHits = files.filter(path => matchesAny(path, FULL_PATTERNS));
  const studioHits = files.filter(path => matchesAny(path, STUDIOFLOW_PATTERNS));
  const websiteTestHits = files.filter(path => matchesAny(path, WEBSITE_TEST_PATTERNS));

  if (!files.length) {
    profile = "full";
    reasons.push("changed files could not be established");
  } else if (fullHits.length) {
    profile = "full";
    reasons.push(`shared, release, or protected application paths changed: ${fullHits.slice(0, 8).join(", ")}${fullHits.length > 8 ? `, +${fullHits.length - 8} more` : ""}`);
  } else if (studioHits.length) {
    profile = "studioflow";
    reasons.push(`StudioFlow paths changed: ${studioHits.slice(0, 8).join(", ")}${studioHits.length > 8 ? `, +${studioHits.length - 8} more` : ""}`);
  } else {
    reasons.push("only website assets or website-specific verification paths changed");
  }

  if (websiteTestHits.length) reasons.push(`targeted website verification changed: ${websiteTestHits.slice(0, 8).join(", ")}${websiteTestHits.length > 8 ? `, +${websiteTestHits.length - 8} more` : ""}`);

  if (requested === "full" && profile !== "full") {
    profile = "full";
    reasons.push("full platform certification was explicitly requested");
  } else if (requested && requested !== profile) {
    const requestedRank = RELEASE_PROFILES[requested].rank;
    const computedRank = RELEASE_PROFILES[profile].rank;
    if (requestedRank < computedRank) {
      throw new Error(`TPI_RELEASE_PROFILE cannot reduce the computed ${profile} profile to ${requested}`);
    }
    profile = requested;
    reasons.push(`release profile explicitly raised to ${requested}`);
  }

  return { profile, reasons, changedFiles: files, forced: requested === "full" };
}

export function isWebsiteOnlyImpact(impact) {
  return impact?.profile === "website";
}

export function protectedApplicationDifferences(previousAssets = [], currentAssets = []) {
  // The Admin Center release manifest is generated during candidate staging
  // and intentionally changes its source commit/timestamp on every release.
  // Protect the actual preview application bytes, but do not mistake this
  // deployment metadata for an Admin Center application change.
  const isProtected = entry => entry.path !== "admin-center-preview/release.json"
    && PROTECTED_APPLICATION_PREFIXES.some(prefix => entry.path.startsWith(prefix));
  const previous = new Map(previousAssets.filter(isProtected).map(entry => [entry.path, `${entry.bytes}:${entry.sha256}`]));
  const current = new Map(currentAssets.filter(isProtected).map(entry => [entry.path, `${entry.bytes}:${entry.sha256}`]));
  const paths = [...new Set([...previous.keys(), ...current.keys()])].sort();
  return paths.filter(path => previous.get(path) !== current.get(path));
}

