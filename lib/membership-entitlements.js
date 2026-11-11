// TPI-CREATOR-INCENTIVE-001 — Founding Membership entitlement engine.
//
// Membership determines entitlements; entitlements determine feature access.
// Nothing in this module should be replaced by a string comparison on a
// membership label, and no capability may be inferred from a single role field.
//
// Two properties are load-bearing:
//
//   1. Founding All-Access is the union of the Creator and Contributor
//      capability sets. It is derived from the same CAPABILITY_SETS table as
//      those two memberships, so a future Creator-only capability reaches
//      All-Access without a second permission list being edited.
//   2. Capabilities accumulate. Resolution reads every active source and unions
//      them; adding Contributor to a Creator never removes Creator.

// EDITORIAL_* identifiers exist for server-side editorial authority only. They
// are deliberately absent from CAPABILITY_SETS and from mergeCapabilities, so no
// membership, badge or legacy role grants them. Admin is not an implicit grant.
// The single legitimate source is an explicit, active member_entitlements row,
// which resolveMemberEntitlements appends separately (see EDITORIAL_CAPABILITIES).
export const CAPABILITY = Object.freeze({
  CREATOR: "creator",
  CONTRIBUTOR: "contributor",
  EDITORIAL_REVIEW: "editorial_review",
  EDITORIAL_PUBLISH: "editorial_publish",
});

// Editorial authority is never membership-derived. These identifiers are
// carried only by explicit ledger rows and are kept out of every membership
// union so a class, badge or legacy role can never imply them.
const EDITORIAL_CAPABILITIES = Object.freeze([CAPABILITY.EDITORIAL_REVIEW, CAPABILITY.EDITORIAL_PUBLISH]);
const EDITORIAL_CAPABILITY_SET = new Set(EDITORIAL_CAPABILITIES);

export const LIFETIME_CAPACITY = 50;

// The single authoritative capability sets. All-Access must be expressed as the
// union here rather than as its own duplicated list.
export const CAPABILITY_SETS = Object.freeze({
  creator: Object.freeze([CAPABILITY.CREATOR]),
  contributor: Object.freeze([CAPABILITY.CONTRIBUTOR]),
});

// Server-authoritative mapping from membership class to published badge art.
// Only optimized derivatives are referenced: the 1254px masters stay in Git and
// are excluded from the deployable asset package by .assetsignore. A badge is
// identification only; it never contributes capability.
const BADGE_ASSET_BASE = "/assets/founding-memberships/web";

function badgeAsset(slug) {
  return Object.freeze({
    png: `${BADGE_ASSET_BASE}/${slug}-256.png`,
    png2x: `${BADGE_ASSET_BASE}/${slug}-512.png`,
    webp: `${BADGE_ASSET_BASE}/${slug}-256.webp`,
    width: 256,
    height: 256,
  });
}

export const MEMBERSHIP_CLASSES = Object.freeze([
  Object.freeze({
    classCode: "FC",
    displayName: "Founding Creator",
    numberPrefix: "FC",
    capabilitySet: "creator",
    capabilities: CAPABILITY_SETS.creator,
    badgeKey: "founding_creator",
    badgeColor: "green",
    badgeAsset: badgeAsset("founding-creator"),
    primaryCapability: "Creator",
  }),
  Object.freeze({
    classCode: "FCT",
    displayName: "Founding Contributor",
    numberPrefix: "FCT",
    capabilitySet: "contributor",
    capabilities: CAPABILITY_SETS.contributor,
    badgeKey: "founding_contributor",
    badgeColor: "blue",
    badgeAsset: badgeAsset("founding-contributor"),
    primaryCapability: "Contributor / Editorial",
  }),
  Object.freeze({
    classCode: "FAA",
    displayName: "Founding All-Access",
    numberPrefix: "FAA",
    // Derived union — this is the architectural proof All-Access is not a
    // separate permission universe.
    capabilitySet: "all_access",
    capabilities: Object.freeze([...CAPABILITY_SETS.creator, ...CAPABILITY_SETS.contributor]),
    badgeKey: "founding_all_access",
    badgeColor: "purple",
    badgeAsset: badgeAsset("founding-all-access"),
    primaryCapability: "Creator + Contributor",
  }),
]);

export const MEMBERSHIP_CLASS_BY_CODE = Object.freeze(
  Object.fromEntries(MEMBERSHIP_CLASSES.map((entry) => [entry.classCode, entry])),
);

// Display precedence for profile badges. An All-Access member is presented with
// the All-Access identity rather than two unrelated badges, while internally
// still holding both capability sets.
const BADGE_PRECEDENCE = Object.freeze(["FAA", "FC", "FCT"]);

// Features the entitlement record already supports but that are NOT built yet.
// A future Nova tool must flip its own flag on only when the tool actually
// exists; holding the entitlement must not expose an unfinished surface.
export const FEATURE_AVAILABILITY = Object.freeze({
  studioflow_nova_edit: false,
  nova_edit_documents: false,
  nova_edit_slides: false,
  nova_editorial_workspace: false,
  nova_docs: false,
  nova_slides: false,
});

export function isValidClassCode(classCode) {
  return Object.prototype.hasOwnProperty.call(MEMBERSHIP_CLASS_BY_CODE, String(classCode || ""));
}

export function capabilitiesForClass(classCode) {
  return MEMBERSHIP_CLASS_BY_CODE[classCode]?.capabilities || [];
}

// Union of every supplied capability list. Order is stable and duplicates are
// removed, so callers can rely on the result for comparisons.
export function mergeCapabilities(...lists) {
  const merged = new Set();
  for (const list of lists) {
    for (const capability of list || []) {
      if (capability === CAPABILITY.CREATOR || capability === CAPABILITY.CONTRIBUTOR) merged.add(capability);
    }
  }
  return [...merged].sort();
}

export function hasCapability(capabilities, capability) {
  return Array.isArray(capabilities) && capabilities.includes(capability);
}

// Legacy compatibility: the pre-existing role column keeps working exactly as
// before. Leadership retains both capability sets because it already had
// Editorial access and Creator Studio access before this directive.
export function legacyRoleCapabilities(role) {
  switch (String(role || "")) {
    case "owner":
    case "admin":
      return [CAPABILITY.CREATOR, CAPABILITY.CONTRIBUTOR];
    case "creator":
      return [CAPABILITY.CREATOR];
    case "contributor":
      return [CAPABILITY.CONTRIBUTOR];
    default:
      return [];
  }
}

export function membershipNumber(classCode, sequenceNumber) {
  const klass = MEMBERSHIP_CLASS_BY_CODE[classCode];
  const sequence = Number(sequenceNumber);
  if (!klass || !Number.isInteger(sequence) || sequence < 1 || sequence > LIFETIME_CAPACITY) return null;
  return `${klass.numberPrefix}-${String(sequence).padStart(3, "0")}`;
}

export function parseMembershipNumber(number) {
  const match = String(number || "").match(/^(FC|FCT|FAA)-(\d{3})$/);
  if (!match) return null;
  const sequence = Number(match[2]);
  if (sequence < 1 || sequence > LIFETIME_CAPACITY) return null;
  if (membershipNumber(match[1], sequence) !== number) return null;
  return { classCode: match[1], sequenceNumber: sequence };
}

// Next issuance sequence. Monotonic: the highest sequence ever issued in the
// class plus one. Because suspended/revoked rows stay in the registry, a number
// is never returned to the pool, and after 050 the class reports exhaustion.
export function nextSequenceFromSequences(sequences) {
  const highest = (sequences || []).reduce((max, value) => {
    const sequence = Number(value);
    return Number.isInteger(sequence) && sequence > max ? sequence : max;
  }, 0);
  return highest + 1 <= LIFETIME_CAPACITY ? highest + 1 : null;
}

export function describeCapabilities(capabilities) {
  const normalized = mergeCapabilities(capabilities);
  const creator = hasCapability(normalized, CAPABILITY.CREATOR);
  const contributor = hasCapability(normalized, CAPABILITY.CONTRIBUTOR);
  const entitled = {
    studioFlowNovaEdit: creator,
    novaEditDocuments: creator,
    novaEditSlides: creator,
    novaEditorialWorkspace: contributor,
    novaDocs: contributor,
    novaSlides: contributor,
    educationContentSubmission: contributor,
    // Education Center publishing/administration is NOT implied by Contributor
    // capability. It stays a separate authorization decision.
    educationCenterPublishing: false,
    creatorIncentives: creator,
  };
  const availability = {
    studioflow_nova_edit: entitled.studioFlowNovaEdit && FEATURE_AVAILABILITY.studioflow_nova_edit,
    nova_edit_documents: entitled.novaEditDocuments && FEATURE_AVAILABILITY.nova_edit_documents,
    nova_edit_slides: entitled.novaEditSlides && FEATURE_AVAILABILITY.nova_edit_slides,
    nova_editorial_workspace: entitled.novaEditorialWorkspace && FEATURE_AVAILABILITY.nova_editorial_workspace,
    nova_docs: entitled.novaDocs && FEATURE_AVAILABILITY.nova_docs,
    nova_slides: entitled.novaSlides && FEATURE_AVAILABILITY.nova_slides,
  };
  return {
    capabilities: normalized,
    creator,
    contributor,
    entitled,
    available: availability,
  };
}

// Creator Incentive eligibility is a capability question, not a membership-label
// question. Financial policy is not defined by any authoritative directive, so
// it is reported as unresolved instead of being invented here.
export const CREATOR_INCENTIVE_POLICY_STATUS = "UNRESOLVED — OWNER DECISION REQUIRED";

export function incentiveEligibility({ capabilities, accountActive = true, participationState = "not_enrolled" }) {
  const creatorCapable = hasCapability(capabilities, CAPABILITY.CREATOR);
  return {
    creatorCapable,
    accountActive: Boolean(accountActive),
    participationState,
    eligible: creatorCapable && Boolean(accountActive) && !["suspended", "withdrawn"].includes(participationState),
    financialPolicyStatus: CREATOR_INCENTIVE_POLICY_STATUS,
  };
}

// One badge identity per class, including the published derivative paths and
// alt text. Every surface (registry, inspection, profile) renders this object,
// so a class can never be shown with another class's artwork.
export function badgeForClass(classCode) {
  const klass = MEMBERSHIP_CLASS_BY_CODE[classCode];
  if (!klass) return null;
  return {
    classCode,
    key: klass.badgeKey,
    label: klass.displayName,
    color: klass.badgeColor,
    alt: `${klass.displayName} badge`,
    asset: klass.badgeAsset,
  };
}

export function primaryBadge(classCodes) {
  const held = new Set(classCodes || []);
  const classCode = BADGE_PRECEDENCE.find((code) => held.has(code));
  if (!classCode) return null;
  return badgeForClass(classCode);
}

function safeJsonList(value) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

// Reads every active capability source for one account and unions them.
// Returns fail-closed (no capabilities) if the additive schema is missing, but
// also reports schemaPending so an administrator sees the real reason.
export async function resolveMemberEntitlements(env, user) {
  const empty = {
    contributorId: user?.id || null,
    capabilities: legacyRoleCapabilities(user?.role),
    sources: [],
    memberships: [],
    legacy: { role: user?.role || null, capabilities: legacyRoleCapabilities(user?.role) },
    schemaPending: false,
  };
  if (!env?.TPI_DB || !user?.id) return empty;

  let schemaPending = false;
  let membershipRows = [];
  let entitlementRows = [];
  let studioRows = [];

  try {
    const result = await env.TPI_DB.prepare(`
      SELECT fm.id, fm.class_code AS classCode, fm.sequence_number AS sequenceNumber,
             fm.membership_number AS membershipNumber, fm.state,
             fm.issued_at AS issuedAt, fm.issued_by AS issuedBy
      FROM founding_memberships fm
      WHERE fm.contributor_id = ?
      ORDER BY fm.sequence_number
    `).bind(user.id).all();
    membershipRows = result?.results || [];
  } catch {
    schemaPending = true;
  }

  try {
    const result = await env.TPI_DB.prepare(`
      SELECT id, capability, source_type AS sourceType, source_id AS sourceId,
             state, granted_at AS grantedAt
      FROM member_entitlements
      WHERE contributor_id = ?
      ORDER BY granted_at
    `).bind(user.id).all();
    entitlementRows = result?.results || [];
  } catch {
    schemaPending = true;
  }

  // Legacy compatibility with the pre-existing Creator Studio entitlement ledger
  // (migration 0048). A legitimate active record keeps granting Creator
  // capability; nothing is reset or migrated.
  try {
    const result = await env.TPI_DB.prepare(`
      SELECT cse.id, cse.entitlement_state AS state, cse.source_membership_id AS sourceId
      FROM creator_studio_entitlements cse
      LEFT JOIN creator_partnership_memberships cpm ON cpm.id = cse.source_membership_id
      WHERE cse.contributor_id = ?
        AND cse.entitlement_code = 'creator_studio_lifetime'
        AND cse.entitlement_state = 'active'
        AND (cse.source_membership_id IS NULL OR cpm.membership_state = 'active')
    `).bind(user.id).all();
    studioRows = result?.results || [];
  } catch {
    studioRows = [];
  }

  const activeMemberships = membershipRows.filter((row) => row.state === "active");
  const membershipCapabilities = activeMemberships.flatMap((row) => capabilitiesForClass(row.classCode));
  const activeLedgerCapabilities = entitlementRows
    .filter((row) => row.state === "active")
    .map((row) => row.capability);
  // Membership-derived ledger rows still flow through the union; editorial rows
  // are appended verbatim because mergeCapabilities intentionally drops them.
  const ledgerCapabilities = activeLedgerCapabilities.filter((capability) => !EDITORIAL_CAPABILITY_SET.has(capability));
  const editorialCapabilities = activeLedgerCapabilities.filter((capability) => EDITORIAL_CAPABILITY_SET.has(capability));
  const legacyStudioCapabilities = studioRows.length ? [CAPABILITY.CREATOR] : [];

  const sources = [
    ...activeMemberships.map((row) => ({
      type: "founding_membership",
      id: row.id,
      label: `${row.membershipNumber} ${MEMBERSHIP_CLASS_BY_CODE[row.classCode]?.displayName || row.classCode}`,
      capabilities: capabilitiesForClass(row.classCode),
    })),
    ...entitlementRows
      .filter((row) => row.state === "active")
      .map((row) => ({
        type: row.sourceType,
        id: row.id,
        label: row.sourceType === "admin_grant" ? `Administrative ${row.capability} grant` : `Membership ${row.sourceId}`,
        capabilities: [row.capability],
      })),
    ...studioRows.map((row) => ({
      type: "legacy_creator_studio",
      id: row.id,
      label: "Legacy Creator Studio entitlement",
      capabilities: [CAPABILITY.CREATOR],
    })),
    ...(legacyRoleCapabilities(user?.role).length
      ? [{
          type: "legacy_role",
          id: user.role,
          label: `Existing account role: ${user.role}`,
          capabilities: legacyRoleCapabilities(user?.role),
        }]
      : []),
  ];

  return {
    contributorId: user.id,
    capabilities: [
      ...mergeCapabilities(
        legacyRoleCapabilities(user?.role),
        membershipCapabilities,
        ledgerCapabilities,
        legacyStudioCapabilities,
      ),
      ...editorialCapabilities,
    ].sort(),
    sources,
    memberships: membershipRows.map((row) => ({
      id: row.id,
      classCode: row.classCode,
      displayName: MEMBERSHIP_CLASS_BY_CODE[row.classCode]?.displayName || row.classCode,
      sequenceNumber: Number(row.sequenceNumber),
      membershipNumber: row.membershipNumber,
      state: row.state,
      issuedAt: row.issuedAt,
      issuedBy: row.issuedBy,
      badge: MEMBERSHIP_CLASS_BY_CODE[row.classCode]
        ? {
            key: MEMBERSHIP_CLASS_BY_CODE[row.classCode].badgeKey,
            label: MEMBERSHIP_CLASS_BY_CODE[row.classCode].displayName,
            color: MEMBERSHIP_CLASS_BY_CODE[row.classCode].badgeColor,
          }
        : null,
    })),
    legacy: { role: user?.role || null, capabilities: legacyRoleCapabilities(user?.role) },
    schemaPending,
  };
}

export async function memberHasCapability(env, user, capability) {
  if (!user) return false;
  const resolved = await resolveMemberEntitlements(env, user);
  return hasCapability(resolved.capabilities, capability);
}

// Public-safe membership identity for profile and community surfaces.
// Account email, session data and administrative notes are never included.
export async function publicMembershipIdentity(env, contributorId) {
  if (!env?.TPI_DB || !contributorId) return null;
  try {
    const { results } = await env.TPI_DB.prepare(`
      SELECT class_code AS classCode, membership_number AS membershipNumber, state, issued_at AS issuedAt
      FROM founding_memberships
      WHERE contributor_id = ?
      ORDER BY sequence_number
    `).bind(contributorId).all();
    const rows = results || [];
    if (!rows.length) return null;
    const badge = primaryBadge(rows.filter((row) => row.state === "active").map((row) => row.classCode));
    return {
      badge,
      memberships: rows.map((row) => ({
        classCode: row.classCode,
        displayName: MEMBERSHIP_CLASS_BY_CODE[row.classCode]?.displayName || row.classCode,
        primaryCapability: MEMBERSHIP_CLASS_BY_CODE[row.classCode]?.primaryCapability || "Founding member",
        badge: badgeForClass(row.classCode),
        membershipNumber: row.membershipNumber,
        state: row.state,
        issuedAt: row.issuedAt,
      })),
    };
  } catch {
    return null;
  }
}
