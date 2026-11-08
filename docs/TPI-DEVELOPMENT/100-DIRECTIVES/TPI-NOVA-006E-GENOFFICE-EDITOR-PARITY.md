# TPI-NOVA-006E — GenOffice Editor Parity and Workspace Persistence

**Date:** 2026-11-08  
**Status:** IMPLEMENTED — RELEASE VERIFICATION PENDING  
**Scope:** Nova Documents and Slides inside the existing Content Editor

## Objective

Bring the web editor's active Documents and Slides workflows closer to the
inspected GenOffice reference architecture and ensure the selected Slides
workspace survives refresh.

## Findings

The Slides workspace was mounted by `paper-editor.js` without recording the
selected workspace in the URL. A refresh therefore rebuilt the host page's
default Documents state. The Slides ribbon also contained explicit placeholder
panels for Draw, Transitions, Animations, and Review. Documents had planned
placeholder panels for Draw, Design, Layout, References, Mailings, and Review.

## Implementation

- Persist the Nova workspace as `workspace=slides` in the Content Editor URL.
- Persist the open presentation as `presentation=<id>` so refresh reopens the
  same deck.
- Add Slides actions for undo/redo, drawing marks, themes, slide transitions,
  selected-element fade animation, review notes, slide sorter, and reading view.
- Add a line element to the existing presentation model and render it through
  the existing Konva canvas.
- Replace Documents' planned Draw, Design, Layout, References, Mailings, and
  Review panels with actions backed by the existing TipTap document model.
- Preserve the existing server-backed Nova item API, optimistic versioning,
  autosave, templates, image insertion, thumbnails, and Presenter Mode.

GenOffice remains the inspected reference for ribbon grouping, tab behavior,
slide thumbnails, and presentation workflows. The implementation remains
Nova-owned web code; Electron-only GenOffice internals are not imported.

## Verification

- `npm run verify:nova-006-slides` — pending final release commit
- `npm --prefix nova-app run typecheck` — PASS
- `npm run build:content-editor-nova` — PASS
- Firefox local Slides refresh — PASS; Slides remained active and the same
  presentation reopened after refresh.
- Firefox local Documents ribbon — PASS; Draw, Design, Layout, References,
  Mailings, Review, and View exposed working controls.

Production deployment and live acceptance are recorded below after the guarded
release completes.
