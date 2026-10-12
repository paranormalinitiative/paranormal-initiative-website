# Security review

Status: **PARTIALLY WORKING / PASS WITH LIMITATIONS**.

The Worker server-gates `/admin-center-preview/` and its assets. Existing API
authorization remains the authority. The expanded member endpoint is still
`requireAdmin`, uses bounded queries, and omits private conversation/message
content. Anonymous production gates were previously verified. Authorized
member/contributor/moderator/admin/owner matrix testing remains BLOCKED without
test sessions. No role or entitlement was granted.
