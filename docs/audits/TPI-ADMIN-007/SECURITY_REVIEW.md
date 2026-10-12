# Security review

Status: **PARTIALLY WORKING / PASS WITH LIMITATIONS**.

The Worker server-gates `/admin-center-preview/` and its assets. Existing API
authorization remains the authority. The expanded member endpoint is still
`requireAdmin`, uses bounded queries, and omits private conversation/message
content. Anonymous production gates were previously verified. Authorized
member/contributor/moderator/admin/owner matrix testing remains BLOCKED without
test sessions. No role or entitlement was granted.

ADMIN-007A isolation review:

- The legacy invite, team, and article-comment resources remain inside the
  existing server-gated member content shell.
- Owner/admin authorization is preserved; it no longer overrides the active
  `data-admin-view` route when revealing Contributor Management.
- No invitation code, team record, comment record, D1 row, R2 object, stream
  key, or production membership was changed during this repair.
