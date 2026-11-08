# TPI-NOVA-006D — Slides Ribbon Layout Correction

**Date:** 2026-11-08  
**Status:** DEPLOYED AND VERIFIED IN PRODUCTION
**Scope:** Existing Nova Slides ribbon in the Content Editor only

## Root cause

The host `style.css` contains a legacy global `section` rule that applies
`max-width: 1200px`, large vertical padding, auto margins, opacity, and an
entrance animation to every `section` element. The GenOffice-derived ribbon and
its command groups intentionally use `section` elements, so the unrelated host
rule narrowed the ribbon into a centered floating panel and added the large
vertical gap visible in Firefox.

## Correction

- Scoped the reset to `.paper-editor-page .nova-genoffice-ribbon` and its
  `.nova-ribbon-group` children.
- Removed the inherited max-width, margin, opacity, transform, animation, and
  section padding only for those Slides ribbon elements.
- Kept the ribbon full-width with the Documents editor's flat toolbar geometry.
- Preserved the existing ribbon commands, tab structure, slide thumbnails,
  canvas, speaker notes, autosave, image controls, and Presenter Mode.

## Verification

- `npm run verify:nova-006-slides` — 16 passed, 0 failed
- `npm --prefix nova-app run typecheck` — PASS
- `npm run build:content-editor-nova` — PASS
- Firefox Developer Edition local visual verification — PASS
- Ribbon spans the editor width beneath the document header — PASS
- Live rendered slide previews remain visible — PASS
- Main slide canvas and speaker notes remain visible — PASS

## Release artifacts

- JavaScript: `content-editor-CVloghjo.js`
  - SHA-256: `c73457c0b4e4bdb6f7ead642c9fd8aeb1a4c7b07aa94d7e2facfcc075a71f473`
- CSS: `content-editor-D2RQC9aA.css`
  - SHA-256: `84d01e88dc9b9309815a7ca3125fa2de4f4f3ee3aacf267c5f091024501d6bc9`
- Entrypoint: `content-editor.html`
  - SHA-256: `aa2d9467357256e98fc56e326de8b40aedf5a7e381f82bd3d0b8a27a2fa23272`

## Production verification

The guarded production release completed from website commit
`52be2e9f41fa34ee4d21c042b7e131f99853cd48` as release
`rel-52be2e9f41fa-b1264f456c60`.

- Production Worker: `8bbae63d-bf43-4209-9fa3-b0f789ad0073`
- Rollback Worker: `8a0a324c-d666-4d69-afe4-30c636a392e9`
- Traffic: 100%
- Release manifest digest: `8e5bdd712563b942058d66fd935478189ba7e40d05a5d4948e95ddffd317dba0`
- Anonymous production smoke: 10/10 PASS
- Isolated Firefox Developer Edition acceptance: 65/65 PASS
- Owner-facing Firefox verification: PASS; the live `/paper-editor` Slides
  workspace now renders a full-width ribbon directly beneath the document
  header, with left-aligned command groups, live slide previews, the canvas,
  and speaker notes intact.

The release did not create, delete, or modify production content. The target is
the existing Content Editor at `/paper-editor`, not StudioFlow `/studio`.
