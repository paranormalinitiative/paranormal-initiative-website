export const DISTINCTION_CATALOG = Object.freeze({
  gold: {
    code: "gold",
    label: "Gold Medallion",
    color: "#d6a84f",
    assetPath: "/assets/society-leadership/web/gold-256.png",
    defaultDescription: "A primary leadership and service distinction assigned by authorized TPI leadership.",
  },
  silver: {
    code: "silver",
    label: "Silver Medallion",
    color: "#c7d0da",
    assetPath: "/assets/society-leadership/web/silver-256.png",
    defaultDescription: "A recognized leadership and service distinction assigned by authorized TPI leadership.",
  },
  bronze: {
    code: "bronze",
    label: "Bronze Medallion",
    color: "#b9784f",
    assetPath: "/assets/society-leadership/web/bronze-256.png",
    defaultDescription: "A service and participation distinction assigned by authorized TPI leadership.",
  },
});

// A role owns its recognition tier. Administrators choose a role, never an
// unrelated medal, so a CEO or founder cannot accidentally receive Bronze.
export const LEADERSHIP_ROLE_CATALOG = Object.freeze({
  "founder-director": { code: "founder-director", label: "Founder / Director", medallionCode: "gold", description: "Founder and Director of The Paranormal Initiative." },
  "chief-executive-officer": { code: "chief-executive-officer", label: "Chief Executive Officer (CEO)", medallionCode: "gold", description: "Executive authority responsible for the organization's mission and governance." },
  "chief-ai-operating-officer": { code: "chief-ai-operating-officer", label: "Chief AI Operating Officer (COO)", medallionCode: "gold", description: "AI operations leadership responsible for day-to-day execution and logistics." },
  "chief-ai-technology-information-officer": { code: "chief-ai-technology-information-officer", label: "Chief AI Technology Officer (CTO) / Chief AI Information Officer (CIO)", medallionCode: "gold", description: "AI technology and information leadership responsible for infrastructure and product research." },
  "assistant-director": { code: "assistant-director", label: "Assistant Director", medallionCode: "silver", description: "Senior leadership support for operational and program direction." },
  "senior-advisor": { code: "senior-advisor", label: "Senior Advisor", medallionCode: "silver", description: "Senior advisory service to the organization's leadership." },
  "community-liaison": { code: "community-liaison", label: "Community Liaison", medallionCode: "bronze", description: "Service connecting members, contributors, and the wider community." },
  "research-fellow": { code: "research-fellow", label: "Research Fellow", medallionCode: "bronze", description: "Recognized research service within the paranormal umbrella." },
});

function rowToPayload(row) {
  return {
    id: row.id,
    subjectType: row.subject_type,
    subjectId: row.subject_id,
    code: row.distinction_code,
    label: row.label,
    description: row.description,
    assetPath: row.asset_path,
    color: row.color,
    status: row.status,
    issuedAt: row.issued_at,
    issuedBy: row.issued_by || null,
    notes: row.notes || "",
    roleCode: row.role_code || "legacy-recognition",
    roleLabel: row.role_label || "Legacy recognition",
  };
}

export async function listLeadershipDistinctions(env, subjectType, subjectId, includeRevoked = false) {
  if (!subjectType || !subjectId) return [];
  try {
    const stateClause = includeRevoked ? "" : " AND status = 'active'";
    const { results } = await env.TPI_DB.prepare(`
      SELECT id, subject_type, subject_id, distinction_code, label, description,
             asset_path, color, status, issued_at, issued_by, revoked_at, notes,
             role_code
      FROM leadership_distinctions
      WHERE subject_type = ? AND subject_id = ?${stateClause}
      ORDER BY CASE distinction_code WHEN 'gold' THEN 0 WHEN 'silver' THEN 1 ELSE 2 END, issued_at ASC
    `).bind(subjectType, subjectId).all();
    return (results || []).map((row) => rowToPayload({ ...row, role_label: LEADERSHIP_ROLE_CATALOG[row.role_code]?.label || "Legacy recognition" }));
  } catch {
    return [];
  }
}

export async function listLeadershipProfiles(env) {
  try {
    const { results } = await env.TPI_DB.prepare(`
      SELECT id, slug, display_name, identity_type, role_title, role_summary,
             responsibilities, transparency_note, active, created_at, updated_at
      FROM leadership_profiles
      WHERE active = 1
      ORDER BY display_name COLLATE NOCASE
    `).all();
    const profiles = [];
    for (const row of results || []) {
      profiles.push({
        id: row.id,
        slug: row.slug,
        displayName: row.display_name,
        identityType: row.identity_type,
        roleTitle: row.role_title,
        roleSummary: row.role_summary,
        responsibilities: row.responsibilities,
        transparencyNote: row.transparency_note,
        distinctions: await listLeadershipDistinctions(env, "leadership_profile", row.id),
      });
    }
    return profiles;
  } catch {
    return [];
  }
}

export function distinctionPayload(code, description = "") {
  const item = DISTINCTION_CATALOG[String(code || "").toLowerCase()];
  if (!item) return null;
  return {
    code: item.code,
    label: item.label,
    color: item.color,
    assetPath: item.assetPath,
    description: String(description || item.defaultDescription).trim().slice(0, 2000),
  };
}

export function leadershipRolePayload(roleCode) {
  const role = LEADERSHIP_ROLE_CATALOG[String(roleCode || "").trim()];
  if (!role) return null;
  const distinction = DISTINCTION_CATALOG[role.medallionCode];
  return {
    ...role,
    medallion: {
      code: distinction.code,
      label: distinction.label,
      color: distinction.color,
      assetPath: distinction.assetPath,
    },
  };
}
