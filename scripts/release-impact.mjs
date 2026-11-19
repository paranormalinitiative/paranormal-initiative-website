#!/usr/bin/env node

// TPI-OPS-006 — change-impact release profiles.
//
// The existing release tier describes risk, but it does not decide which
// verification gates are relevant. This module makes that decision from the
// actual changed paths. Ambiguous and security-sensitive changes escalate to
// the full platform profile; ordinary website and shared-API changes stay
// within their smallest safe verification boundary.

export const RELEASE_PROFILES = {
  website: { name: "WEBSITE ONLY", rank: 1 },
  "shared-api": { name: "SHARED API", rank: 2 },
  studioflow: { name: "STUDIOFLOW APPLICATION", rank: 2 },
  "admin-center": { name: "ADMINISTRATION CENTER", rank: 2 },
  full: { name: "FULL PLATFORM", rank: 3 },
};

export const PROTECTED_APPLICATION_PREFIXES = ["studio/", "nova/", "content-editor-nova/", "admin-center-preview/"];

// StudioFlow and Nova are maintained applications, not incidental build
// outputs. A release may still prove their bytes are unchanged, but it should
// not rebuild or reopen their browser acceptance merely because a website
// document, test, or release record changed. Only an application source change
// or a shared runtime boundary can justify reopening this maintenance lock.
const PROTECTED_APPLICATION_SOURCE_PATTERNS = [
  /^studio\//,
  /^nova\//,
  /^nova-app\//,
  /^content-editor-nova\//,
];

const PROTECTED_APPLICATION_RUNTIME_PATTERNS = [
  /^functions\//,
  /^lib\//,
  /^worker\.js$/,
  /^wrangler\.(?:toml|jsonc)$/,
];

const FULL_PATTERNS = [
  /^migrations\//,
  /^lib\/(?:auth|staff-roles)(?:\/|\.)/,
  /^worker\.js$/,
  /^wrangler\.(?:toml|jsonc)$/,
  /^package(?:-lock)?\.json$/,
  /^\.assetsignore$/,
  /^nova\//,
  /^nova-app\//,
  /^scripts\/(?:tpi-release|deploy-production-guarded|release-certification|release-tier|release-impact|stage-local|stage-studioflow|local-dev-service)/,
  /^scripts\/(?:e2e|qa\/run-qa|verify\/tpi-ops-)/,
  /^scripts\/verify\/tpi-release-/,
  /^scripts\/verify\/tpi-website-surface-smoke/,
  /^scripts\/verify\/tpi-(?:nova|admin)-/,
];

// Shared API changes need authenticated API and member-surface verification,
// but they do not rebuild or acceptance-test protected applications unless the
// application itself also changed. Keeping this separate from the full profile
// is the key release-time boundary for ordinary server-backed website work.
const SHARED_API_PATTERNS = [
  /^functions\//,
  /^lib\//,
];

const STUDIOFLOW_PATTERNS = [
  /^studio\//,
  /^scripts\/verify\/tpi-studioflow-/,
  /^scripts\/studioflow-/,
];

// Administration Center work has its own protected verification boundary. It
// may change the admin application and its generated preview, but it must not
// be treated as a StudioFlow or full-platform release unless it also changes a
// shared Worker, authentication, release, or other cross-application path.
const ADMIN_CENTER_PATTERNS = [
  /^admin-center-app\//,
  /^admin-center-preview\//,
  /^admin-center\.js$/,
  /^admin-center\.css$/,
  /^admin-panel\.html$/,
  /^admin-advanced-settings\.html$/,
  /^admin-events\.html$/,
  /^teams\/admin\.html$/,
  /^scripts\/(?:qa\/tpi-admin-|e2e\/tpi-ops-015-local-browser|verify\/tpi-admin-)/,
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
 * @returns {{profile:"website"|"shared-api"|"studioflow"|"admin-center"|"full", reasons:string[], changedFiles:string[], forced:boolean}}
 */
export function classifyReleaseImpact({ changedFiles = [], requestedProfile = null } = {}) {
  const files = [...new Set(changedFiles.filter(Boolean))].sort();
  const requested = requestedProfile ? String(requestedProfile).trim().toLowerCase() : null;
  if (requested && !Object.hasOwn(RELEASE_PROFILES, requested)) {
    throw new Error(`TPI_RELEASE_PROFILE must be website, shared-api, studioflow, admin-center, or full; received ${requestedProfile}`);
  }

  let profile = "website";
  const reasons = [];
  const fullHits = files.filter(path => matchesAny(path, FULL_PATTERNS));
  const studioHits = files.filter(path => matchesAny(path, STUDIOFLOW_PATTERNS));
  const adminHits = files.filter(path => matchesAny(path, ADMIN_CENTER_PATTERNS));
  const sharedApiHits = files.filter(path => matchesAny(path, SHARED_API_PATTERNS));
  const websiteTestHits = files.filter(path => matchesAny(path, WEBSITE_TEST_PATTERNS));
  const nonAdminFullHits = fullHits.filter(path => !matchesAny(path, ADMIN_CENTER_PATTERNS));

  if (!files.length) {
    profile = "full";
    reasons.push("changed files could not be established");
  } else if (adminHits.length && adminHits.length === files.length && !nonAdminFullHits.length) {
    profile = "admin-center";
    reasons.push(`Administration Center paths changed: ${adminHits.slice(0, 8).join(", ")}${adminHits.length > 8 ? `, +${adminHits.length - 8} more` : ""}`);
  } else if (fullHits.length) {
    profile = "full";
    reasons.push(`shared, release, or protected application paths changed: ${fullHits.slice(0, 8).join(", ")}${fullHits.length > 8 ? `, +${fullHits.length - 8} more` : ""}`);
  } else if (studioHits.length) {
    profile = "studioflow";
    reasons.push(`StudioFlow paths changed: ${studioHits.slice(0, 8).join(", ")}${studioHits.length > 8 ? `, +${studioHits.length - 8} more` : ""}`);
  } else if (sharedApiHits.length) {
    profile = "shared-api";
    reasons.push(`shared API paths changed: ${sharedApiHits.slice(0, 8).join(", ")}${sharedApiHits.length > 8 ? `, +${sharedApiHits.length - 8} more` : ""}`);
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

export function protectedApplicationScope(changedFiles = []) {
  const files = [...new Set(changedFiles.filter(Boolean))].sort();
  const sourceFiles = files.filter(path => matchesAny(path, PROTECTED_APPLICATION_SOURCE_PATTERNS));
  const runtimeFiles = files.filter(path => matchesAny(path, PROTECTED_APPLICATION_RUNTIME_PATTERNS));
  return {
    sourceFiles,
    runtimeFiles,
    verify: sourceFiles.length > 0 || runtimeFiles.length > 0,
  };
}

export function protectedApplicationDifferences(previousAssets = [], currentAssets = [], { allowedPrefixes = [] } = {}) {
  // The Admin Center release manifest is generated during candidate staging
  // and intentionally changes its source commit/timestamp on every release.
  // Protect the actual preview application bytes, but do not mistake this
  // deployment metadata for an Admin Center application change.
  const allowed = new Set(allowedPrefixes);
  const isProtected = entry => entry.path !== "admin-center-preview/release.json"
    && PROTECTED_APPLICATION_PREFIXES.some(prefix => entry.path.startsWith(prefix))
    && ![...allowed].some(prefix => entry.path.startsWith(prefix));
  const previous = new Map(previousAssets.filter(isProtected).map(entry => [entry.path, `${entry.bytes}:${entry.sha256}`]));
  const current = new Map(currentAssets.filter(isProtected).map(entry => [entry.path, `${entry.bytes}:${entry.sha256}`]));
  const paths = [...new Set([...previous.keys(), ...current.keys()])].sort();
  return paths.filter(path => previous.get(path) !== current.get(path));
}

