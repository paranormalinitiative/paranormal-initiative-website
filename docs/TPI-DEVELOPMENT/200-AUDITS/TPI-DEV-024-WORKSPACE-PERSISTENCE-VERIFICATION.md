# TPI-DEV-024 — Workspace Persistence Verification

## Implementation

The additive `studio_workspaces` table stores an owner-scoped workspace record
with a local broadcast identifier, title, description, status, version, and a
bounded allow-listed JSON snapshot. The snapshot includes broadcast metadata,
supported recording/settings preferences, and counts/mode for local recording
storage. It never accepts recording blobs, file handles, stream keys, or auth
tokens.

Routes:

- `GET /api/studio/workspaces`
- `POST /api/studio/workspaces`
- `GET /api/studio/workspaces/:id`
- `PATCH /api/studio/workspaces/:id`
- `POST /api/studio/workspaces/:id/archive`

Every route uses the existing `requireStudioAccess` capability. Every read and
write also requires the exact workspace owner in D1. Leadership access to the
Studio page does not grant access to another creator's private workspace.
Mutations require same-origin requests and updates/archive use an optional
optimistic `expectedVersion` check.

## Live evidence

Development Worker: `theparanormalinitiative-dev`
Version: `493f4531-808b-47f8-a50a-16b6d14f9aba`
Database: `tpi_contributor_portal_dev`
Source commit: `53e8826`

The synthetic development QA passed 23/23 checks:

- owner and admin authenticated Studio access;
- revoked-account Studio denial;
- owner save/list/read/update/archive;
- sensitive state fields dropped by the server allow-list;
- stale version write rejected with HTTP 409;
- archived workspaces omitted from the active list but retained with
  `includeArchived=true`;
- admin could not read the owner's workspace;
- owner could not read the admin's workspace.

The QA left only archived synthetic workspace metadata in development D1. It
did not create accounts, entitlements, recordings, R2 objects, or production
records.

## Limitations

The existing generated bundle remains responsible for its own editor state.
The bridge restores supported metadata by updating the existing localStorage
keys and reloading the editor. It does not reconstruct scene media, IndexedDB
recording blobs, or file-system handles. Those remain local to the browser and
must still be explicitly exported/backed up by the creator.
