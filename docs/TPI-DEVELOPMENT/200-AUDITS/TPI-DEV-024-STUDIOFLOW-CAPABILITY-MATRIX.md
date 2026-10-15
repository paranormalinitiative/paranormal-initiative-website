# TPI-DEV-024 — StudioFlow Capability Matrix

Date: 2026-10-14
Repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
Branch: `codex/tpi-development`

## Scope decision

DEV-023 established that the existing generated StudioFlow bundle is the
source of truth for the editor and that this checkout should not invent a
second project architecture. DEV-024 therefore adds a narrow server-backed
workspace metadata boundary around the existing local broadcast state. It does
not replace the editor, upload recordings, or move IndexedDB/file handles to
the server.

| Capability | Result | Evidence |
| --- | --- | --- |
| Existing StudioFlow room and entitlement routes | PRESERVED | Existing Worker route set; DEV-022/023 regressions |
| Saved workspace metadata | IMPLEMENTED | `migrations/0051_studioflow_workspaces.sql`, `/api/studio/workspaces` |
| Save current workspace | IMPLEMENTED | Bridge POST/PATCH and live owner QA |
| Restore workspace metadata | IMPLEMENTED | Bridge GET, local broadcast/settings rehydration, live QA |
| Archive workspace | IMPLEMENTED | Non-destructive status transition and live QA |
| Optimistic concurrency | IMPLEMENTED | `expectedVersion`, HTTP 409 conflict response |
| Cross-account private workspace isolation | VERIFIED | Owner/admin reciprocal 404 checks, exact `owner_id` query |
| Revoked Studio access | VERIFIED | Synthetic revoked account received HTTP 403 |
| Recording blob persistence | INTENTIONALLY NOT MOVED | Existing browser IndexedDB/File System Access behavior preserved |
| Automatic recording upload | NOT IMPLEMENTED BY DESIGN | Bridge contains no upload endpoint or upload trigger |
| Recording deletion | NOT IMPLEMENTED BY DESIGN | Archive and restore do not delete browser recordings |
| New project types or project architecture | NOT IMPLEMENTED | `workspace_type` is intentionally limited to `broadcast` |
| Browser visual acceptance | NOT TESTED | Requires owner/browser acceptance |
| Positive ordinary entitled-creator session | NOT TESTED | Existing local fixture was revoked; no entitlement was created |
| Production deployment/import | PROHIBITED AND NOT PERFORMED | Guarded development deployment only |

## Source files

- `functions/api/[[path]].js` — owner-scoped routes and state allow-list.
- `migrations/0051_studioflow_workspaces.sql` — additive development schema.
- `studio/workspace-bridge.js` — minimal UI bridge for save/open/archive.
- `studio/index.html` — loads the bridge without replacing the generated app.
- `scripts/verify/tpi-dev-024-offline.mjs` — offline boundary checks.
- `scripts/qa/tpi-dev-024-workspaces.mjs` — guarded development QA.
