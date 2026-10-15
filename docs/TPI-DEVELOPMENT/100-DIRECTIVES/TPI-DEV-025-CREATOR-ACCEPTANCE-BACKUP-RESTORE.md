# TPI-DEV-025 — Creator Acceptance and Backup/Restore

This directive continues DEV-024 in the canonical repository on
`codex/tpi-development`. It is development-only. Production deployment,
production D1/R2, Founding 50 activation, external RealtimeKit rooms, and
automatic recording uploads remain prohibited.

The approved backup boundary is user-controlled export to the browser's normal
download/file-picker flow. Cloudflare D1, R2, Workers, and other application
services are not backup destinations. A workspace backup is configuration JSON;
it does not contain recording binaries.

The implementation reuses the existing StudioFlow bundle and DEV-024 API. An
entitled member creator can now access the own channel and broadcast contracts
through the shared `requireContributorOrStudio` guard. The bridge adds local
JSON export/import as a new workspace, with format validation, protected-field
rejection, owner reassignment by the authenticated server session, and no
overwrite of existing workspaces.
