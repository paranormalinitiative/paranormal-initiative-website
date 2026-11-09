# TPI-NOVA-009 — Editorial Document Surface Centering

Status: IMPLEMENTED — LOCAL BUILD VERIFIED; LIVE FIREFOX ACCEPTANCE PENDING RELEASE

## Scope

This is a focused correction to the Nova Editorial Workspace document writing
surface at `/paper-editor`. It does not modify StudioFlow, document content,
authentication, the editor model, or Slides.

## Root cause

The editable document surface was allowed to behave as a full-width child of the
editor canvas. The live appearance therefore presented the writing area against
the canvas edge instead of as a centered document page. The editor was still
using normal text flow; the caret position reflected the document content and
was not a separate positioning system.

## Correction

`nova-app/src/styles.css` now gives Print Layout's `.nova-prose` a bounded width
based on the selected page size, centers it with `margin-inline: auto`, and
applies the same page width to document header and footer surfaces. The rule is
responsive: on narrow screens the width collapses to the available canvas width,
while the existing internal padding and editable text flow remain intact.

The generated Content Editor bundle was rebuilt from the source. No document
records were edited and no StudioFlow code was changed.

## Verification

- `npm run verify:nova-006-editor-parity`: **10 passed, 0 failed**.
- `npm run verify:nova-007-workstation`: **9 passed, 0 failed**.
- `npm run build:content-editor-nova`: **PASS**.
- `git diff --check`: **PASS**.
- Local Firefox automation was not used for this focused visual measurement
  because the local synthetic accounts are correctly denied `/paper-editor`
  without the contributor entitlement. No access gate was weakened.
- Live Firefox visual acceptance must verify the centered page surface after the
  guarded release build is served.

## Files

- `nova-app/src/styles.css`
- `scripts/verify/tpi-nova-006-editor-parity.mjs`
- `content-editor-nova/content-editor.html`
- generated `content-editor-nova/assets/content-editor-*.js`
- generated `content-editor-nova/assets/content-editor-*.css`

## Production

No production deployment is recorded in this implementation note. The live
acceptance result and release identifiers must be appended after the guarded
release workflow completes.
