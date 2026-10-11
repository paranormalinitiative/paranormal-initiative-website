# TPI-ADMIN-001 Security

Security repairs in this batch:

1. Server-side Worker gates now cover the HTML and extensionless redirect
   variants of `admin-panel`, `admin-advanced-settings`, `admin-events`, and
   `teams/admin`.
2. Existing API `requireAdmin` checks remain the authority for data and actions.
3. Audit metadata is bounded and excludes private content and secrets.
4. `/studio/` and `/live-video` behavior is explicitly preserved.

Anonymous and ordinary-member direct page access must receive a 403 restricted
HTML response; authorized owner/admin access must receive the existing page.
