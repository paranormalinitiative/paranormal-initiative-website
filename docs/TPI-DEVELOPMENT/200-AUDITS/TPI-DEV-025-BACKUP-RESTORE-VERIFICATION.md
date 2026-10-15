# TPI-DEV-025 — Backup and Restore Verification

## Capability inventory

| Capability | Status | Evidence / limitation |
| --- | --- | --- |
| Workspace configuration export | IMPLEMENTED BUT NOT BROWSER-VERIFIED | Bridge downloads versioned JSON through standard browser behavior |
| Workspace configuration import | IMPLEMENTED AND API-VERIFIED | Validated format/version/required fields; imports as a new owner-scoped workspace |
| Backup version validation | IMPLEMENTED AND OFFLINE-VERIFIED | Only format version 1 accepted |
| Protected owner/server-field handling | IMPLEMENTED AND OFFLINE-VERIFIED | Owner/server IDs rejected; `tpiSync` removed on import |
| Duplicate import protection | LIVE VERIFIED | Existing local broadcast ID returns HTTP 409 |
| Recording download/export | EXISTING IMPLEMENTATION / NOT MANUALLY BROWSER-VERIFIED | Existing StudioFlow Library Download/Save-to-device path preserved |
| Recording metadata export | NOT IMPLEMENTED | Not required for configuration backup |
| Local recording recovery | EXISTING IMPLEMENTATION / NOT BROWSER-SESSION-VERIFIED | Existing IndexedDB recovery remains in generated bundle |
| Backup restore preview | NOT IMPLEMENTED | Import confirmation is provided before persistence |
| Cloud-drive integration | NOT REQUIRED | User chooses Downloads, synced folder, or external storage through browser behavior |

## Safety

Backups are JSON configuration files. They contain no authentication tokens,
session cookies, API keys, stream credentials, private media, or recording
binaries. Imported data is parsed as data, never executed, and is assigned to
the currently authenticated creator by the server. Existing workspace records
are never overwritten by import.

Cloudflare is not used as a backup host. No R2 upload endpoint is called by the
bridge, and no automatic recording upload was added.
