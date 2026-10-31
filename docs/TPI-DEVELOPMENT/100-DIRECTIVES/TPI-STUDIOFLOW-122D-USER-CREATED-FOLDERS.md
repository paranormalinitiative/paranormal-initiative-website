# TPI-STUDIOFLOW-122D — User-Created Folders and Nested Organization

Status: **COMPLETE / AUTHORITATIVE LOCAL DEVELOPMENT / NOT DEPLOYED**  
Date: 2026-10-31

## Root cause and existing functionality

The Notes backend already had an owner-scoped `studio_note_collections` table
with `parent_id`, and the API already accepted collection creation, rename,
note assignment and safe collection deletion. The missing behavior was primarily
in the workspace presentation: the existing folder control was an icon-only
prompt, collections were rendered as a flat list, and there was no discoverable
per-folder action menu or persistent tree state. The backend also accepted
arbitrary parent identifiers and did not reject hierarchy cycles.

This refinement reuses the existing Notes collection API, `parent_id` data
model, note `collectionId` assignment, owner authorization boundary and
existing autosave/revision system. No parallel folder store was created.

## Implemented behavior

- A labeled **New Folder** control with FolderPlus icon, tooltip and accessible
  name is visible in the Organization panel.
- A global New Folder control remains available when Organization is collapsed.
- New folders are created without a page refresh, selected immediately and
  persisted in the existing collection table.
- Collections render as an expandable/collapsible tree with persisted expanded
  state and selected-folder state.
- Folder actions provide Create subfolder, Rename folder and Delete folder.
- Existing notes can be created in, filtered by and moved between folders using
  the existing editor collection control.
- Folder deletion explicitly confirms handling, preserves notes, promotes
  child folders to the top level, refreshes the tree and never deletes note
  content or attachments.
- The API now validates that parents belong to the authenticated owner and
  rejects self/descendant cycles.
- Focus Mode, the collapsible Organization panel, automatic note titles,
  autosave, revisions, attachments and podcast/episode collection types remain
  on the existing data paths.

## Schema and source

No database migration was required. Migration 0055 already provides the
recursive `parent_id` relationship. The final isolated StudioFlow source is:

- Worktree: `/Users/toddknipple/Documents/StudioFlow/web-122`
- Branch: `codex/studioflow-122-notes`
- Source commit: `bf93bb58a72eb0f5b0e47f401af0ebd97daa77ef`
- Website branch: `codex/tpi-development`
- Local URL: `http://127.0.0.1:8787/studio/`
- Persistence: `.local-dev/state/v3` using local D1/R2
- Production: unchanged; no deployment command was run

The provenance-checked staging workflow built the exact source commit twice,
confirmed reproducibility and staged:

- JavaScript: `studio/assets/index-BjXZX1EX.js`
  - SHA-256: `3568f459649e1b5f9ec01faa1440bb273121cedfaded88f6d32ff600750d7e47`
- CSS: `studio/assets/index-CbVCorKW.css`
  - SHA-256: `fafd2c34bac71f309a2656d959892cbff992535be9d5327387d070b43e89cbf9`

## Acceptance evidence

The disposable authenticated Firefox Developer Edition verifier
`scripts/verify/tpi-studioflow-122-notes.mjs` passed **57/57** on the actual
8787 Worker. It covered the existing Notes suite plus:

- visible New Folder and collapsed-panel access
- create, immediate selection and refresh persistence
- nested folder creation and parent retention
- expand/collapse and rename
- unowned-parent rejection and hierarchy-cycle rejection
- note creation inside a folder
- selected-folder filtering
- moving a note to another folder
- deletion confirmation, note preservation and child-folder promotion
- Focus Mode and responsive toolbar regression

The disposable test created and cleaned only D122D-named folders, notes and
collections. Existing owner data remained intact.
