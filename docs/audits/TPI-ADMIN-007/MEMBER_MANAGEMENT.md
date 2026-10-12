# Member management

Status: **PARTIALLY WORKING**.

ADMIN-006 already provides server-side member search, role/status filters,
sorting, pagination, detail loading, and confirmed block/reactivate actions.
Batch A expands the detail view to Overview, Profile, Posts, Comments,
Reactions, Videos, Reports, Moderation History, and Account Management.

The detail API remains admin-protected and now requests bounded activity pages
(default 25, maximum 100). Posts and video records include links to the
original TPI content where a safe route exists. No private conversation body
is returned by the expanded member-activity response.
