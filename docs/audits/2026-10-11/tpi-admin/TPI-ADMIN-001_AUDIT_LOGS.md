# TPI-ADMIN-001 Audit Logs

Migration `0047_admin_audit_logs.sql` adds an append-only operational record
with actor username/role, action, target type/id, bounded JSON metadata, and
timestamp. The first instrumented actions are member role/title changes,
activation changes, access changes, member notifications, Community post status
changes, and general site-setting updates.

The read API is admin-only and bounded to 100 rows per request. Logging failures
do not roll back a completed admin action while older deployments lack the new
table; the release report must therefore record migration state separately.
