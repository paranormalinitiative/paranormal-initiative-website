# TPI-ADMIN-001 Roles and Permissions

| Role | Administration Center |
|---|---|
| owner | Allowed; may change leadership access under existing rules |
| admin | Allowed; cannot change owner/admin access |
| contributor | Denied |
| member | Denied |
| anonymous | Denied |

The server-side `requireAdmin` helper remains authoritative for APIs. Worker
HTML gates prevent direct loading of the admin entry pages by non-admin users.
Client-side visibility is retained as usability behavior, never as the security
boundary.
