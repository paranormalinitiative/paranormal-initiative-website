export const STAFF_ROLE_CATALOG = Object.freeze({
  owner: { label: "Owner", badge: null, rank: 100, capabilities: ["all"] },
  executive: { label: "Executive", badge: null, rank: 90, capabilities: ["all_except_owner_transfer"] },
  full_administrator: { label: "Full Administrator", badge: "administrator", rank: 60, capabilities: ["broad_administration", "member_operations", "content_moderation", "reports"] },
  administrator: { label: "Administrator", badge: "administrator", rank: 50, capabilities: ["member_operations", "content_moderation", "reports", "routine_content"] },
  moderator: { label: "Moderator", badge: "moderator", rank: 30, capabilities: ["community_moderation", "reports"] },
  member: { label: "Member", badge: null, rank: 0, capabilities: ["participate", "report_content"] }
});

const OFFICE_TITLES = new Set(["CEO", "Founder", "Director", "Assistant Director"]);

export async function activeStaffAppointment(env, contributorId) {
  if (!contributorId) return null;
  return env.TPI_DB.prepare(`
    SELECT id, contributor_id AS contributorId, role_code AS roleCode,
           office_title AS officeTitle, status, reason, appointed_at AS appointedAt
    FROM staff_role_appointments
    WHERE contributor_id = ? AND status = 'active'
    LIMIT 1
  `).bind(contributorId).first();
}

export async function effectiveStaffRole(env, user) {
  if (!user) return "member";
  if (user.role === "owner") return "owner";
  try {
    const appointment = await activeStaffAppointment(env, user.id);
    if (appointment) return appointment.roleCode;
  } catch (error) {
    // A production database without the additive appointment table must not
    // break authentication/profile reads. Preserve only the legacy base role;
    // appointment-dependent permissions remain unavailable until the schema
    // is present.
  }
  return user.role === "admin" ? "administrator" : "member";
}

export async function publicStaffIdentity(env, user) {
  const role = await effectiveStaffRole(env, user);
  if (role === "member") return null;
  if (role === "owner") return { role, label: "Owner", badge: null };
  // Production may still have a legacy Admin account before the additive
  // appointment table is installed. Keep the server session readable there.
  let appointment = null;
  try {
    appointment = await activeStaffAppointment(env, user.id);
  } catch (error) {
    // The appointment-dependent label is unavailable; use the legacy role.
  }
  if (role === "executive") return { role, label: appointment?.officeTitle || "Executive", badge: null };
  const catalog = STAFF_ROLE_CATALOG[role];
  return catalog ? { role, label: catalog.label, badge: catalog.badge } : null;
}

export function validOfficeTitle(value) {
  return OFFICE_TITLES.has(String(value || "").trim());
}

export function mayUseAdminRoute(role, path, method) {
  if (["owner", "executive"].includes(role)) return true;
  if (role === "full_administrator") {
    if (/^\/admin\/(staff-roles|roles|founding-50|founding-memberships|leadership|board-members|creator-incentive|creator-partnership|settings|security|channels|restrictions|members\/(?:[^/]+\/entitlements|entitlements))(\/|$)/.test(path)) return false;
    if (path === "/admin/contributors/title" || path === "/invites" || path.startsWith("/invites/")) return false;
    return path.startsWith("/admin/");
  }
  if (role !== "administrator") return false;
  if (path === "/admin/roles" || path.startsWith("/admin/staff-roles")) return false;
  if (/^\/admin\/members\/(?:[^/]+\/entitlements|entitlements)(\/|$)/.test(path)) return false;
  if (/^\/admin\/(founding-50|founding-memberships|leadership|board-members|creator-incentive|creator-studio|settings|channels|restrictions)(\/|$)/.test(path)) return false;
  if (path === "/invites" || path.startsWith("/invites/")) return false;
  if (path === "/admin/contributors/title") return false;
  if (path === "/admin/overview" || path === "/admin/analytics" || path === "/admin/audit-logs") return true;
  if (/^\/admin\/(members|community|articles|comments|reports|notifications|events|contributors|teams)(\/|$)/.test(path)) return true;
  return false;
}
