import { DISTINCTION_CATALOG } from "./leadership-distinctions.js";

export const BOARD_MEMBER_BADGE = Object.freeze({
  label: "Board Member",
  color: "#d6a84f",
  assetPath: "/assets/board-members/web/board-member-256.png",
  assetPath2x: "/assets/board-members/web/board-member-512.png",
  alt: "Board Member badge",
});

export const BOARD_DOMAIN_CATALOG = Object.freeze({
  "research-investigation": "Research & Investigation",
  "evidence-analysis": "Evidence & Analysis",
  "instrumentation-technology": "Instrumentation & Technology",
  "education-standards": "Education & Standards",
  "ethics-professional-conduct": "Ethics & Professional Conduct",
  "community-outreach": "Community & Outreach",
  "operations-governance": "Operations & Governance",
});

export const BOARD_ROLE_CATALOG = Object.freeze({
  "board-chair": { code: "board-chair", label: "Board Chair", medallionCode: "gold", domainRequired: false },
  "board-vice-chair": { code: "board-vice-chair", label: "Board Vice Chair", medallionCode: "silver", domainRequired: false },
  "committee-chair": { code: "committee-chair", label: "Committee Chair", medallionCode: "silver", domainRequired: true },
  "board-member": { code: "board-member", label: "Board Member", medallionCode: "bronze", domainRequired: true },
  "advisory-board-member": { code: "advisory-board-member", label: "Advisory Board Member", medallionCode: "bronze", domainRequired: true },
});

export function boardRolePayload(roleCode, domainCode = "") {
  const role = BOARD_ROLE_CATALOG[String(roleCode || "").trim()];
  if (!role) return null;
  const domainLabel = BOARD_DOMAIN_CATALOG[String(domainCode || "").trim()] || "";
  if (role.domainRequired && !domainLabel) return null;
  const medallion = DISTINCTION_CATALOG[role.medallionCode];
  return {
    ...role,
    domainCode: String(domainCode || "").trim(),
    domainLabel,
    positionTitle: domainLabel ? `${role.label} — ${domainLabel}` : role.label,
    medallion: {
      code: medallion.code,
      label: medallion.label,
      color: medallion.color,
      assetPath: medallion.assetPath,
    },
  };
}

function rowToPayload(row) {
  if (!row) return null;
  return {
    id: row.id,
    contributorId: row.contributor_id,
    username: row.username || null,
    displayName: row.display_name || row.username || "Member",
    positionTitle: row.position_title || "Board Member",
    label: BOARD_MEMBER_BADGE.label,
    badgePath: row.badge_path || BOARD_MEMBER_BADGE.assetPath,
    badgePath2x: row.badge_path_2x || BOARD_MEMBER_BADGE.assetPath2x,
    badgeAlt: BOARD_MEMBER_BADGE.alt,
    color: BOARD_MEMBER_BADGE.color,
    status: row.status,
    appointedBy: row.appointed_by || null,
    appointedAt: row.appointed_at || null,
    revokedAt: row.revoked_at || null,
    notes: row.notes || "",
    roleCode: row.role_code || "board-member",
    domainCode: row.domain_code || "",
    domainLabel: BOARD_DOMAIN_CATALOG[row.domain_code] || "",
    medallionCode: row.medallion_code || "bronze",
    medallion: DISTINCTION_CATALOG[row.medallion_code || "bronze"] || DISTINCTION_CATALOG.bronze,
  };
}

export async function getBoardMembership(env, contributorId, includeRevoked = false) {
  if (!contributorId) return null;
  try {
    const stateClause = includeRevoked ? "" : " AND bm.status = 'active'";
    const row = await env.TPI_DB.prepare(`
      SELECT bm.id, bm.contributor_id, bm.position_title, bm.badge_path,
             bm.badge_path_2x, bm.status, bm.appointed_by, bm.appointed_at,
             bm.revoked_at, bm.notes, bm.role_code, bm.domain_code, bm.medallion_code,
             c.username, c.display_name
      FROM board_members bm
      LEFT JOIN contributors c ON c.id = bm.contributor_id
      WHERE bm.contributor_id = ?${stateClause}
      ORDER BY bm.appointed_at DESC
      LIMIT 1
    `).bind(contributorId).first();
    return rowToPayload(row);
  } catch {
    return null;
  }
}

export async function listBoardMembers(env, search = "", includeRevoked = false) {
  try {
    const query = String(search || "").trim();
    const like = `%${query}%`;
    const stateClause = includeRevoked ? "" : " AND bm.status = 'active'";
    const { results } = await env.TPI_DB.prepare(`
      SELECT bm.id, bm.contributor_id, bm.position_title, bm.badge_path,
             bm.badge_path_2x, bm.status, bm.appointed_by, bm.appointed_at,
             bm.revoked_at, bm.notes, bm.role_code, bm.domain_code, bm.medallion_code,
             c.username, c.display_name
      FROM board_members bm
      JOIN contributors c ON c.id = bm.contributor_id
      WHERE (? = '' OR lower(c.username) LIKE lower(?) OR lower(c.display_name) LIKE lower(?)
             OR lower(bm.position_title) LIKE lower(?))${stateClause}
      ORDER BY bm.status ASC, bm.appointed_at DESC, c.display_name COLLATE NOCASE
    `).bind(query, like, like, like).all();
    return (results || []).map(rowToPayload);
  } catch {
    return [];
  }
}
