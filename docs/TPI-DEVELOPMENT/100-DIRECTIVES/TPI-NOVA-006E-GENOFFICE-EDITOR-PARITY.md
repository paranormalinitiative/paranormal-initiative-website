# TPI-NOVA-006E — GenOffice Editor Parity and Workspace Persistence

**Date:** 2026-11-08  
**Status:** DEPLOYED AND VERIFIED IN PRODUCTION
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

- `npm run verify:nova-006-slides` — PASS (19/19)
- `npm --prefix nova-app run typecheck` — PASS
- `npm run build:content-editor-nova` — PASS
- Firefox local Slides refresh — PASS; Slides remained active and the same
  presentation reopened after refresh.
- Firefox local Documents ribbon — PASS; Draw, Design, Layout, References,
  Mailings, Review, and View exposed working controls.

## Production release

The guarded release completed successfully on 2026-11-08.

- Website/source commit: `b64510defa5af60edc4d89cc33cffe38a8f90cdb`
- Release ID: `rel-b64510defa5a-a5958c7afcd7`
- Production Worker version: `df85737f-5dda-4a81-89fd-76853b7d1d75`
- Rollback Worker version: `8bbae63d-bf43-4209-9fa3-b0f789ad0073`
- Traffic: 100%
- Release manifest digest: `9a9d7dea58fa322660a627b005667a082943002c416f964b8e877486a67afabd`
- Production smoke: PASS (10/10)
- Isolated Firefox production acceptance: PASS (65/65)
- Live Firefox owner-facing route: PASS; `/paper-editor?workspace=slides&presentation=...` reopened the same presentation after refresh and exposed the full Slides ribbon, Draw controls, and View modes.
- Existing production data: unchanged; no production document or presentation content was edited.

Release assets:

| Asset | SHA-256 |
| --- | --- |
| `content-editor-nova/assets/content-editor-DiDnM5OU.js` | `ef0d82c6cb21c379c5aa6ae9fd40ee0c0fabadbfd8d53052c1abeb308eb26833` |
| `content-editor-nova/assets/content-editor-Cj7Gd54c.css` | `c2ddacba7fc49ac43dce8883f9ae498a7163272a9632ec351adf203e4e7fe5c2` |
| `content-editor-nova/assets/nova-vendor-slides-aqTzaHqm.js` | `a08e7cdb91087696ab1f170dc0863312ec999775de15c93ba75d82d0e33efa9e` |
| `paper-editor.js` | `9a199458f53e7505bca3f8cb54fe98b6313bcb1d8eaaa5ffcb2e989ee78ce7cb` |

The current source remains Nova-owned web code. GenOffice local reference
checkout `968d7d23` was used for the ribbon grouping, tab behavior, slide
thumbnail, and presenter workflow patterns; Electron-only GenOffice internals
were not copied into the website.
