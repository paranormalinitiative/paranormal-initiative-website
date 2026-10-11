# TPI-ADMIN-002 Members

`GET /api/admin/members` now supports server-side search, active/inactive
status, role filtering, sorting, page size, and pagination metadata. Existing
member detail, access, notification, and activate/deactivate workflows remain
in place and continue to require owner/admin authorization. Private contact
fields are only returned by the existing protected member-detail flow.

Limitation: the current page still uses the established member detail surface;
advanced bulk actions and a separate route-level detail page are not added.
