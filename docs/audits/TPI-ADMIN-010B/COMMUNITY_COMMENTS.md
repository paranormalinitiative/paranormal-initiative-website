# Community Comments

Status: **WORKING WITH LIMITATIONS**.

Implemented in the protected preview:

- Real comment listing with bounded pagination.
- Search across comment text, post title, and author.
- Author filtering.
- Visible/deleted/all status filtering.
- Created/updated sorting and direction.
- Date range filters.
- Protected comment detail view.
- Parent post title/body/status context.
- Supported comment reaction attribution.

No comment mutation was added because the existing Community Feed backend does
not expose an authorized moderation mutation contract for these records.
