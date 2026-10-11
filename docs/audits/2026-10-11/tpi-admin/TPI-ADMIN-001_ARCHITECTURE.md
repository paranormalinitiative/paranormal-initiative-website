# TPI-ADMIN-001 Architecture

The Administration Center is an authorized view over the existing TPI stack:

`Worker -> session authentication -> requireAdmin -> existing D1/R2-backed handlers`

`admin-panel.html` remains the entry point. `admin-center.js` owns the new
overview presentation and calls only owner/admin endpoints. `worker.js` now
protects the legacy admin HTML entry points before static assets are served.

The later TPI-UI-001 correction gives this entry point a route-scoped dedicated
workspace shell. It suppresses the generic member sidebar and public chrome
only for the Administration Center while preserving this authentication and
authorization path.

The new read endpoints are:

- `GET /api/admin/overview` — live counts from existing tables.
- `GET /api/admin/founding-50` — explicit not-activated program status.
- `GET /api/admin/audit-logs` — bounded audit rows from `admin_audit_logs`.

Migration `0047_admin_audit_logs.sql` is additive and has no destructive or
data-moving statements. Founding 50 entitlement tables and Creator Studio gate
changes are intentionally not part of this batch.
