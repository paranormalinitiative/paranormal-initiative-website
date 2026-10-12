# Member management

The integrated preview uses Refine `getList` with server-side `search`,
`status`, `role`, `sort`, `direction`, `page`, and `pageSize` parameters. The
detail view calls `/admin/members/:username/activity` and provides overview,
profile, posts, comments, videos, articles, and account tabs.

The endpoint returns private conversation data for legacy consumers. ADMIN-006
does not render that field. Block/reactivate uses the existing protected
endpoints and a confirmation dialog; the existing audit writer records the
mutation. No new reason field or schema migration was invented.
