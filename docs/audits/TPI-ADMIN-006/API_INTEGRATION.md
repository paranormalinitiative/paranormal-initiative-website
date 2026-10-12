# API integration

Integrated calls: `/admin/overview`, `/admin/members`,
`/admin/members/:username/activity`, member block/unblock,
`/admin/community/posts`, community post status, `/admin/comments`, and
`/admin/audit-logs`. All calls are same-origin and include credentials.

Unsupported preview actions fail closed or link to the existing protected
surface. No duplicate API routes were added and no API accepts browser-supplied
identity as authority.
