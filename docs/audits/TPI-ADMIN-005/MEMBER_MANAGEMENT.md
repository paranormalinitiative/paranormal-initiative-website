# Member management

The first member-management slice uses existing protected APIs:

- Search/browse through `GET /api/admin/members`.
- Select a member and load `GET /api/admin/members/:username/activity`.
- Reactivate/deactivate through the existing block/unblock endpoints.
- Preserve server-side owner/admin checks and self-account protections.

The preview does not add role editing, password changes, private-message
inspection, or a new member database. The existing legacy controls remain
available through `/admin-panel.html` while the owner reviews this slice.
