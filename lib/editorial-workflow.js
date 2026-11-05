// TPI-NOVA-004R6B — centralized editorial workflow engine.
//
// This module is the only place that decides whether an editorial transition is
// legal. Route handlers must call these functions and must not carry transition
// logic of their own. The module is pure: it validates and describes a
// transition; the caller persists it in one D1 batch together with the event row.
//
// Authority model (TPI-NOVA-004R6A):
//   articles.status            publication visibility ('draft' | 'published')
//   articles.editorial_status  the only current workflow state
//   article_editorial_submissions  one row per review round
//   article_editorial_events       append-only history, never used to derive state

import { CAPABILITY, hasCapability } from "./membership-entitlements.js";

export const EDITORIAL_STATES = Object.freeze([
  "legacy",
  "draft",
  "submitted",
  "in_review",
  "changes_requested",
  "approved",
]);

// Every legal transition, keyed "from>to". Anything absent is refused.
// `actor` names the authority required; `reviewerOnly` and `ownerOnly` add the
// separation-of-duties checks that apply to the same transition.
export const TRANSITIONS = Object.freeze({
  "legacy>draft": Object.freeze({ event: "entered_workflow", actor: "owner" }),
  "draft>submitted": Object.freeze({ event: "submitted", actor: "owner" }),
  "submitted>draft": Object.freeze({ event: "withdrawn", actor: "owner" }),
  "submitted>in_review": Object.freeze({ event: "review_started", actor: "reviewer", notSubmitter: true }),
  "in_review>changes_requested": Object.freeze({ event: "changes_requested", actor: "reviewer", notSubmitter: true, noteRequired: true }),
  "changes_requested>submitted": Object.freeze({ event: "resubmitted", actor: "owner" }),
  "in_review>approved": Object.freeze({ event: "approved", actor: "reviewer", notSubmitter: true }),
});

// Publication is not an editorial state. It is a separate, Publisher-only
// primitive that requires an approved submission and an exact version match.
export const PUBLISH_PRIMITIVE = Object.freeze({ event: "published", actor: "publisher", notSubmitter: true });

// Editorial states in which the Nova working document is locked for the owner.
export const LOCKED_STATES = Object.freeze(["submitted", "in_review", "approved"]);

export function isEditorialState(value) {
  return EDITORIAL_STATES.includes(value);
}

export function isNovaLocked(editorialStatus) {
  return LOCKED_STATES.includes(editorialStatus);
}

// Capability helpers. `capabilities` is the caller's resolved capability list.
// Admin role and membership never imply editorial authority.
export function hasEditorialReview(capabilities) {
  return hasCapability(capabilities, CAPABILITY.EDITORIAL_REVIEW);
}

export function hasEditorialPublish(capabilities) {
  return hasCapability(capabilities, CAPABILITY.EDITORIAL_PUBLISH);
}

export function requireEditorialReview(capabilities) {
  if (!hasEditorialReview(capabilities)) return refuse(403, "editorial_review_required");
  return null;
}

export function requireEditorialPublish(capabilities) {
  if (!hasEditorialPublish(capabilities)) return refuse(403, "editorial_publish_required");
  return null;
}

function refuse(status, code, detail) {
  return { ok: false, status, code, detail: detail || null };
}

// Validates one transition. Returns { ok: true, event, to, from } or a refusal.
//   from, to           editorial states
//   actorId            authenticated caller id (never from the request body)
//   capabilities       caller's resolved capabilities
//   isOwner            caller owns the article
//   submitterId        submitted_by of the current open submission, if any
//   note               reviewer note, if supplied
export function validateTransition({ from, to, actorId, capabilities, isOwner, submitterId, note }) {
  if (!isEditorialState(from) || !isEditorialState(to)) return refuse(409, "unknown_state");
  const rule = TRANSITIONS[`${from}>${to}`];
  if (!rule) return refuse(409, "illegal_transition", `${from} -> ${to}`);

  if (rule.actor === "owner") {
    if (!isOwner) return refuse(403, "not_owner");
    // Contributor ownership is required; the capability is checked on the actor.
    if (!hasCapability(capabilities, CAPABILITY.CONTRIBUTOR) && !hasCapability(capabilities, CAPABILITY.CREATOR)) {
      return refuse(403, "contributor_required");
    }
  } else if (rule.actor === "reviewer") {
    const denied = requireEditorialReview(capabilities);
    if (denied) return denied;
    if (rule.notSubmitter && actorId && actorId === submitterId) return refuse(403, "self_review_refused");
  }

  if (rule.noteRequired && !String(note || "").trim()) return refuse(422, "note_required");

  return { ok: true, from, to, event: rule.event };
}

// Verifies that a submitted or approved version matches the owned, linked Nova
// item. `novaItem` is the row read by the caller with owner_id = article owner.
// The client never supplies the version; it is read from the row here.
export function verifyNovaItemForSubmission({ novaItem, articleOwnerId, articleNovaItemId }) {
  if (!articleNovaItemId) return refuse(409, "no_nova_item");
  if (!novaItem) return refuse(404, "nova_item_missing");
  if (novaItem.id !== articleNovaItemId) return refuse(409, "nova_item_mismatch");
  if (novaItem.owner_id !== articleOwnerId) return refuse(403, "nova_item_foreign_owner");
  if (novaItem.deleted_at || novaItem.status === "trash") return refuse(409, "nova_item_unusable");
  if (!Number.isInteger(novaItem.version) || novaItem.version < 1) return refuse(409, "nova_version_invalid");
  return { ok: true, version: novaItem.version };
}

// Stale-version guard. A submitted or approved version must equal the current
// Nova version exactly. Equal values pass; anything else is stale.
export function checkVersionCurrent({ recordedVersion, currentVersion }) {
  if (!Number.isInteger(recordedVersion) || !Number.isInteger(currentVersion)) return refuse(409, "version_invalid");
  if (recordedVersion !== currentVersion) return refuse(409, "stale_version", `recorded ${recordedVersion}, current ${currentVersion}`);
  return { ok: true };
}

// Approval integrity: approved_nova_version must equal submitted_nova_version of
// the submission being approved. An unreviewed newer version is never approved.
export function checkApprovalMatchesSubmission({ submission, approvedNovaVersion }) {
  if (!submission) return refuse(409, "no_submission");
  if (submission.outcome !== "open") return refuse(409, "submission_not_open");
  if (approvedNovaVersion !== submission.submitted_nova_version) {
    return refuse(409, "approval_version_mismatch");
  }
  return { ok: true };
}

// Reviewed metadata that must not change after submission. A change returns the
// article to an editable state for resubmission instead of silently altering the
// reviewed target.
export function detectReviewedMetadataChange({ submission, destination, articleType }) {
  if (!submission) return refuse(409, "no_submission");
  const changed = [];
  if (destination !== submission.submitted_destination) changed.push("destination");
  if (articleType !== submission.submitted_article_type) changed.push("article_type");
  return { changed: changed.length > 0, fields: changed };
}

// Publication primitive. Used by the later publish route; tested now.
// Requires: EDITORIAL_PUBLISH, not the submitter, approved article, an approved
// submission, the approved version equal to the current Nova version, and the
// reviewed metadata unchanged.
export function validatePublication({
  capabilities,
  actorId,
  submitterId,
  editorialStatus,
  submission,
  currentNovaVersion,
  destination,
  articleType,
}) {
  const denied = requireEditorialPublish(capabilities);
  if (denied) return denied;
  if (actorId && actorId === submitterId) return refuse(403, "self_publication_refused");
  if (editorialStatus !== "approved") return refuse(409, "not_approved");
  if (!submission || submission.outcome !== "open" || !Number.isInteger(submission.approved_nova_version)) {
    return refuse(409, "no_approved_submission");
  }
  const version = checkVersionCurrent({
    recordedVersion: submission.approved_nova_version,
    currentVersion: currentNovaVersion,
  });
  if (!version.ok) return version;
  const meta = detectReviewedMetadataChange({ submission, destination, articleType });
  if (meta.changed) return refuse(409, "reviewed_metadata_changed", meta.fields.join(","));
  return { ok: true, event: PUBLISH_PRIMITIVE.event, approvedNovaVersion: submission.approved_nova_version };
}

// Event row for a transition. The caller inserts it in the same D1 batch as the
// article and submission updates. Notes are stored here and nowhere else.
export function buildEvent({ id, articleId, submissionId, actorId, transition, novaVersion, note, createdAt }) {
  return {
    id,
    article_id: articleId,
    submission_id: submissionId || null,
    actor_id: actorId,
    event_type: transition.event,
    from_state: transition.from,
    to_state: transition.to,
    nova_version: Number.isInteger(novaVersion) ? novaVersion : null,
    note: note ? String(note).slice(0, 4000) : null,
    visible_to_contributor: transition.event === "approved" ? 0 : 1,
    created_at: createdAt,
  };
}
