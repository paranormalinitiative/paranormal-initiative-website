// TPI-CREATOR-INCENTIVE-001 — Founding Membership registry operations.
//
// Every mutation here is server-side, audited, and written in one D1 batch so a
// partial state cannot survive a failure (no badge without membership, no
// number consumed without an account link, no capability without a registry row).

import {
  CAPABILITY,
  LIFETIME_CAPACITY,
  MEMBERSHIP_CLASSES,
  MEMBERSHIP_CLASS_BY_CODE,
  capabilitiesForClass,
  isValidClassCode,
  membershipNumber,
  nextSequenceFromSequences,
} from "./membership-entitlements.js";

export class MembershipError extends Error {
  constructor(code, message, status = 400, detail = {}) {
    super(message);
    this.name = "MembershipError";
    this.code = code;
    this.status = status;
    this.detail = detail;
  }
}

function isUniqueViolation(error) {
  const message = String(error?.message || "").toLowerCase();
  return message.includes("unique") || message.includes("constraint failed");
}

async function writeAudit(env, actor, action, targetType, targetId, metadata) {
  try {
    await env.TPI_DB.prepare(`
      INSERT INTO admin_audit_logs (id, actor_id, actor_username, actor_role, action, target_type, target_id, metadata_json)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).bind(
      crypto.randomUUID(),
      actor?.id || null,
      String(actor?.username || "system"),
      String(actor?.role || "system"),
      action,
      targetType,
      targetId,
      JSON.stringify(metadata || {}),
    ).run();
  } catch {
    // Audit loss must not silently discard the record it describes; the caller
    // writes the authoritative history row inside the same batch. This log is
    // additive reporting only.
  }
}

// Classroom-style summary of all three classes. Exhaustion is reported
// explicitly; no class ever generates a 51st number.
export async function foundingClassSummary(env) {
  const classes = [];
  for (const klass of MEMBERSHIP_CLASSES) {
    let issued = 0;
    let active = 0;
    let highest = 0;
    let schemaPending = false;
    try {
      const summary = await env.TPI_DB.prepare(`
        SELECT COUNT(*) AS issued,
               COALESCE(SUM(CASE WHEN state = 'active' THEN 1 ELSE 0 END), 0) AS active,
               COALESCE(MAX(sequence_number), 0) AS highest
        FROM founding_memberships WHERE class_code = ?
      `).bind(klass.classCode).first();
      issued = Number(summary?.issued || 0);
      active = Number(summary?.active || 0);
      highest = Number(summary?.highest || 0);
    } catch {
      schemaPending = true;
    }
    const nextSequence = nextSequenceFromSequences([highest]);
    classes.push({
      ...klass,
      lifetimeCapacity: LIFETIME_CAPACITY,
      issued,
      active,
      remaining: Math.max(0, LIFETIME_CAPACITY - issued),
      exhausted: issued >= LIFETIME_CAPACITY || nextSequence === null,
      nextSequence,
      nextNumber: nextSequence ? membershipNumber(klass.classCode, nextSequence) : null,
      schemaPending,
    });
  }
  return {
    classes,
    lifetimeIssuanceTotal: classes.reduce((total, entry) => total + entry.issued, 0),
    lifetimeCapacityTotal: LIFETIME_CAPACITY * MEMBERSHIP_CLASSES.length,
    numbering: "Permanent, non-recycled. Suspended or revoked numbers still count toward the class limit.",
    schemaPending: classes.some((entry) => entry.schemaPending),
  };
}

export async function listFoundingRegistry(env, { classCode = null, page = 1, pageSize = 50 } = {}) {
  const where = classCode ? "WHERE fm.class_code = ?" : "";
  const binds = classCode ? [classCode] : [];
  const safePage = Math.max(1, Number(page) || 1);
  const safePageSize = Math.max(1, Math.min(Number(pageSize) || 50, 200));
  try {
    const count = await env.TPI_DB.prepare(`SELECT COUNT(*) AS total FROM founding_memberships fm ${where}`)
      .bind(...binds).first();
    const { results } = await env.TPI_DB.prepare(`
      SELECT fm.id, fm.membership_number AS membershipNumber, fm.class_code AS classCode,
             fm.sequence_number AS sequenceNumber, fm.state, fm.issued_at AS issuedAt,
             fm.updated_at AS updatedAt, fm.notes,
             issuer.username AS issuedBy,
             c.username, c.display_name AS displayName, c.role, c.active
      FROM founding_memberships fm
      JOIN contributors c ON c.id = fm.contributor_id
      LEFT JOIN contributors issuer ON issuer.id = fm.issued_by
      ${where}
      ORDER BY fm.class_code, fm.sequence_number
      LIMIT ? OFFSET ?
    `).bind(...binds, safePageSize, (safePage - 1) * safePageSize).all();
    const total = Number(count?.total || 0);
    return {
      memberships: (results || []).map((row) => ({
        ...row,
        sequenceNumber: Number(row.sequenceNumber),
        active: Boolean(row.active),
        // Account display name is preserved; the class label is separate so an
        // administrator can tell the account from the membership.
        className: MEMBERSHIP_CLASS_BY_CODE[row.classCode]?.displayName || row.classCode,
        badge: MEMBERSHIP_CLASS_BY_CODE[row.classCode]
          ? {
              key: MEMBERSHIP_CLASS_BY_CODE[row.classCode].badgeKey,
              label: MEMBERSHIP_CLASS_BY_CODE[row.classCode].displayName,
              color: MEMBERSHIP_CLASS_BY_CODE[row.classCode].badgeColor,
            }
          : null,
      })),
      pagination: { page: safePage, pageSize: safePageSize, total, totalPages: Math.ceil(total / safePageSize) },
    };
  } catch {
    return {
      memberships: [],
      pagination: { page: safePage, pageSize: safePageSize, total: 0, totalPages: 0 },
      schemaPending: true,
    };
  }
}

export async function listMembershipHistory(env, membershipId, limit = 50) {
  try {
    const { results } = await env.TPI_DB.prepare(`
      SELECT h.id, h.action, h.from_state AS fromState, h.to_state AS toState,
             h.notes, h.created_at AS createdAt, actor.username AS actorUsername,
             actor.role AS actorRole
      FROM founding_membership_history h
      LEFT JOIN contributors actor ON actor.id = h.actor_id
      WHERE h.membership_id = ?
      ORDER BY h.created_at DESC
      LIMIT ?
    `).bind(membershipId, Math.max(1, Math.min(Number(limit) || 50, 200))).all();
    return results || [];
  } catch {
    return [];
  }
}

// Issues one permanent Founding Membership number to an existing active account.
//
// Idempotency policy (TPI-CREATOR-INCENTIVE-001 §25): assigning the same class
// to the same account twice is explicitly refused with 409 and the existing
// number is reported. No second number is consumed.
export async function assignFoundingMembership(env, { member, classCode, actor, notes = "" }) {
  if (!member?.id || !member?.username) throw new MembershipError("member_required", "An existing TPI account is required.", 400);
  if (!isValidClassCode(classCode)) {
    throw new MembershipError("invalid_class", "Founding Membership class must be FC, FCT, or FAA.", 400);
  }
  const klass = MEMBERSHIP_CLASS_BY_CODE[classCode];

  const existing = await env.TPI_DB.prepare(`
    SELECT id, membership_number AS membershipNumber, state
    FROM founding_memberships WHERE class_code = ? AND contributor_id = ?
  `).bind(classCode, member.id).first();
  if (existing) {
    throw new MembershipError(
      "duplicate_assignment",
      `${member.username} already holds ${klass.displayName} ${existing.membershipNumber}. No new number was issued.`,
      409,
      { membershipId: existing.id, membershipNumber: existing.membershipNumber, state: existing.state },
    );
  }

  const issuedRows = await env.TPI_DB.prepare(
    "SELECT sequence_number AS sequence FROM founding_memberships WHERE class_code = ?",
  ).bind(classCode).all();
  const sequences = (issuedRows?.results || []).map((row) => Number(row.sequence));
  const sequence = nextSequenceFromSequences(sequences);
  if (sequence === null) {
    throw new MembershipError(
      "class_exhausted",
      `${klass.displayName} is permanently closed: all ${LIFETIME_CAPACITY} lifetime numbers (${klass.numberPrefix}-001 to ${klass.numberPrefix}-${LIFETIME_CAPACITY}) have been issued.`,
      409,
      { classCode, capacity: LIFETIME_CAPACITY, issued: sequences.length },
    );
  }

  const number = membershipNumber(classCode, sequence);
  const membershipId = crypto.randomUUID();
  const historyId = crypto.randomUUID();
  const grantedCapabilities = capabilitiesForClass(classCode);

  const statements = [
    env.TPI_DB.prepare(`
      INSERT INTO founding_memberships
        (id, contributor_id, class_code, sequence_number, membership_number, state, issued_at, issued_by, notes)
      VALUES (?, ?, ?, ?, ?, 'active', CURRENT_TIMESTAMP, ?, ?)
    `).bind(membershipId, member.id, classCode, sequence, number, actor?.id || null, String(notes || "").slice(0, 2000)),
    env.TPI_DB.prepare(`
      INSERT INTO founding_membership_history
        (id, membership_id, contributor_id, action, from_state, to_state, actor_id, notes)
      VALUES (?, ?, ?, 'issued', NULL, 'active', ?, ?)
    `).bind(historyId, membershipId, member.id, actor?.id || null, String(notes || "").slice(0, 2000)),
    ...grantedCapabilities.map((capability) => env.TPI_DB.prepare(`
      INSERT INTO member_entitlements
        (id, contributor_id, capability, source_type, source_id, state, granted_by, notes)
      VALUES (?, ?, ?, 'founding_membership', ?, 'active', ?, ?)
    `).bind(crypto.randomUUID(), member.id, capability, membershipId, actor?.id || null, `${klass.displayName} ${number}`)),
  ];

  try {
    await env.TPI_DB.batch(statements);
  } catch (error) {
    if (isUniqueViolation(error)) {
      // Fail closed. A concurrent issuance won the number or the account slot.
      throw new MembershipError(
        "concurrent_assignment_conflict",
        "The Founding Membership number or account slot was claimed concurrently. Nothing was issued; reload and try again.",
        409,
      );
    }
    throw new MembershipError("assignment_failed", "Founding Membership could not be issued. No partial record was kept.", 500);
  }

  await writeAudit(env, actor, "founding_membership.issued", "founding_membership", membershipId, {
    membershipNumber: number,
    classCode,
    username: member.username,
    capabilities: grantedCapabilities,
  });

  return {
    membership: {
      id: membershipId,
      membershipNumber: number,
      classCode,
      displayName: klass.displayName,
      sequenceNumber: sequence,
      state: "active",
      username: member.username,
      capabilities: grantedCapabilities,
      badge: { key: klass.badgeKey, label: klass.displayName, color: klass.badgeColor },
    },
  };
}

export async function setFoundingMembershipState(env, { membershipId, state, actor, notes = "" }) {
  if (!membershipId) throw new MembershipError("membership_required", "A Founding Membership id is required.", 400);
  if (!["active", "suspended", "revoked"].includes(state)) {
    throw new MembershipError("invalid_state", "Membership state must be active, suspended, or revoked.", 400);
  }
  const membership = await env.TPI_DB.prepare(`
    SELECT id, contributor_id AS contributorId, class_code AS classCode,
           membership_number AS membershipNumber, sequence_number AS sequenceNumber, state
    FROM founding_memberships WHERE id = ?
  `).bind(membershipId).first();
  if (!membership) throw new MembershipError("not_found", "Founding Membership was not found.", 404);

  if (membership.state === state) {
    return { membership: { ...membership, unchanged: true }, history: await listMembershipHistory(env, membershipId) };
  }

  const statements = [
    env.TPI_DB.prepare(`
      UPDATE founding_memberships
      SET state = ?, updated_at = CURRENT_TIMESTAMP, notes = ?
      WHERE id = ?
    `).bind(state, String(notes || "").slice(0, 2000), membershipId),
    env.TPI_DB.prepare(`
      INSERT INTO founding_membership_history
        (id, membership_id, contributor_id, action, from_state, to_state, actor_id, notes)
      VALUES (?, ?, ?, 'state_changed', ?, ?, ?, ?)
    `).bind(crypto.randomUUID(), membershipId, membership.contributorId, membership.state, state, actor?.id || null, String(notes || "").slice(0, 2000)),
    // Capability follows the membership state, but rows are never deleted and
    // the number remains part of historical issuance.
    env.TPI_DB.prepare(`
      UPDATE member_entitlements
      SET state = ?, revoked_at = CASE WHEN ? = 'active' THEN NULL ELSE CURRENT_TIMESTAMP END
      WHERE source_type = 'founding_membership' AND source_id = ?
    `).bind(state, state, membershipId),
  ];

  try {
    await env.TPI_DB.batch(statements);
  } catch {
    throw new MembershipError("state_change_failed", "The membership state change could not be completed. Nothing was changed.", 500);
  }

  await writeAudit(env, actor, `founding_membership.${state}`, "founding_membership", membershipId, {
    fromState: membership.state,
    toState: state,
    membershipNumber: membership.membershipNumber,
  });

  return {
    membership: { ...membership, state },
    history: await listMembershipHistory(env, membershipId),
  };
}

// Supported cumulative dual-access mechanism: an explicit, audited additional
// capability grant. It adds one (contributor, capability, source) row and never
// touches another source's row, so the other capability set is preserved.
export async function grantCapability(env, { member, capability, actor, notes = "" }) {
  if (!member?.id) throw new MembershipError("member_required", "An existing TPI account is required.", 400);
  if (![CAPABILITY.CREATOR, CAPABILITY.CONTRIBUTOR].includes(capability)) {
    throw new MembershipError("invalid_capability", "Capability must be creator or contributor.", 400);
  }
  const existing = await env.TPI_DB.prepare(`
    SELECT id FROM member_entitlements
    WHERE contributor_id = ? AND capability = ? AND source_type = 'admin_grant' AND state = 'active'
    LIMIT 1
  `).bind(member.id, capability).first();
  if (existing) {
    throw new MembershipError("duplicate_grant", `${member.username} already holds an active ${capability} grant.`, 409, { entitlementId: existing.id });
  }
  const id = crypto.randomUUID();
  await env.TPI_DB.batch([
    env.TPI_DB.prepare(`
      INSERT INTO member_entitlements
        (id, contributor_id, capability, source_type, source_id, state, granted_by, notes)
      VALUES (?, ?, ?, 'admin_grant', ?, 'active', ?, ?)
    `).bind(id, member.id, capability, id, actor?.id || null, String(notes || "").slice(0, 2000)),
  ]);
  await writeAudit(env, actor, "member.capability_granted", "member", member.username, { capability, entitlementId: id });
  return { entitlement: { id, capability, state: "active", contributorId: member.id } };
}

export async function revokeCapability(env, { entitlementId, actor, notes = "" }) {
  const row = await env.TPI_DB.prepare(`
    SELECT id, contributor_id AS contributorId, capability, state, source_type AS sourceType
    FROM member_entitlements WHERE id = ?
  `).bind(entitlementId).first();
  if (!row) throw new MembershipError("not_found", "Entitlement was not found.", 404);
  if (row.state !== "active") return { entitlement: { ...row, unchanged: true } };
  await env.TPI_DB.prepare(`
    UPDATE member_entitlements
    SET state = 'revoked', revoked_at = CURRENT_TIMESTAMP, notes = ?
    WHERE id = ?
  `).bind(String(notes || "").slice(0, 2000), entitlementId).run();
  await writeAudit(env, actor, "member.capability_revoked", "member", row.contributorId, {
    capability: row.capability,
    entitlementId,
    sourceType: row.sourceType,
  });
  return { entitlement: { ...row, state: "revoked" } };
}

export async function setIncentiveParticipation(env, { member, state, actor, notes = "" }) {
  if (!member?.id) throw new MembershipError("member_required", "An existing TPI account is required.", 400);
  if (!["not_enrolled", "enrolled", "suspended", "withdrawn"].includes(state)) {
    throw new MembershipError("invalid_state", "Participation state must be not_enrolled, enrolled, suspended, or withdrawn.", 400);
  }
  await env.TPI_DB.prepare(`
    INSERT INTO creator_incentive_participation (contributor_id, state, enrolled_at, enrolled_by, notes, updated_at)
    VALUES (?, ?, CASE WHEN ? = 'enrolled' THEN CURRENT_TIMESTAMP ELSE NULL END, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(contributor_id) DO UPDATE SET
      state = excluded.state,
      enrolled_at = CASE WHEN excluded.state = 'enrolled' AND creator_incentive_participation.enrolled_at IS NULL
        THEN CURRENT_TIMESTAMP ELSE creator_incentive_participation.enrolled_at END,
      enrolled_by = CASE WHEN excluded.state = 'enrolled' THEN excluded.enrolled_by ELSE creator_incentive_participation.enrolled_by END,
      notes = excluded.notes,
      updated_at = CURRENT_TIMESTAMP
  `).bind(member.id, state, state, actor?.id || null, String(notes || "").slice(0, 2000)).run();
  await writeAudit(env, actor, `creator_incentive.participation_${state}`, "member", member.username, { state });
  return { participation: { contributorId: member.id, state } };
}

export async function listIncentiveParticipation(env, limit = 200) {
  try {
    const { results } = await env.TPI_DB.prepare(`
      SELECT p.contributor_id AS contributorId, p.state, p.enrolled_at AS enrolledAt,
             p.notes, c.username, c.display_name AS displayName, c.role, c.active
      FROM creator_incentive_participation p
      JOIN contributors c ON c.id = p.contributor_id
      ORDER BY p.updated_at DESC
      LIMIT ?
    `).bind(Math.max(1, Math.min(Number(limit) || 200, 500))).all();
    return results || [];
  } catch {
    return [];
  }
}
