# Conflict Resolution

Server revisions use the existing additive `sync_version` fields from migration 0044 and are exposed as `revision`/`syncVersion`. A stale update or action returns the current server snapshot and HTTP 409. StudioFlow marks the row **Conflict needs review** and offers **Refresh server** or the explicit **Use local & sync** path, which retries against the returned server revision.

The bridge never silently chooses local or server content after a conflict.
