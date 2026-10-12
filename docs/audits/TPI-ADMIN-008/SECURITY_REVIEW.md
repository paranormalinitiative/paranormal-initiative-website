# TPI-ADMIN-008 — Security review

The preview route and its generated assets remain server-gated by the existing
Worker owner/admin check. Admin API handlers continue to enforce server-side
authorization. The preview does not expose private conversation bodies,
recordings, stream keys, or Creator Studio storage.

The protected `/api/admin/reports` endpoint is metadata-only. It reads the
existing video and messenger report tables and returns status, reason, safe
subject identity, reporter identity, timestamps, and review metadata. It
deliberately omits report details, private conversation IDs and bodies, and
stream or recording data. The preview exposes no report-resolution mutation
until an authoritative safe contract is verified.

The protected `/api/admin/notifications` endpoint is also metadata-only. It
returns notification title, type, recipient/creator identity, read state, and
timestamps from `member_notifications`, while omitting notification bodies and
action URLs. The preview exposes no send, edit, read-state, or delete mutation.

The protected `/api/admin/channels` endpoint returns channel identity,
visibility, owner identity, timestamps, and published-video counts from the
existing channel table. It omits channel descriptions/artwork and exposes no
editing, ownership, visibility, or video lifecycle mutation.

The protected `/api/admin/roles` endpoint returns aggregate role, active-account,
and capability counts from `contributors`. It returns no password/session data
and exposes no role, title, capability, or restriction mutation.

The protected `/api/admin/restrictions` endpoint returns only accounts with an
inactive state or disabled posting/commenting/messaging flags. It does not
return password/session data, user-to-user restriction rows, or mutation
controls, and it explicitly distinguishes capability restrictions from
administrative suspension.

Source checks pass for the TPI theme, route ownership, deleted-content filter,
and protected-preview boundary. Authenticated role-matrix testing, session
expiry, and authorized production mutation testing remain BLOCKED without an
authorized session.

No D1 migration, R2 operation, credential change, membership activation, or
cross-project access occurred.

The preview Security view is a read-only source-defined summary of these
boundaries. It does not grant permissions, replace the Worker/API gates,
expose private data, or claim authenticated role-matrix and session-expiry
verification.

The protected `/api/admin/community/comments` endpoint is metadata-only. It
reads the existing public Community Feed comment records with status and
search filters, returns bounded comment previews plus author/post metadata,
and exposes no administrative comment mutation.

The protected `/api/admin/events` endpoint is metadata-only. It returns event
status, scheduling, location, organizer name, and source metadata from the
existing `events` table, excludes private submission fields, and exposes no
event mutation.
