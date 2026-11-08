# TPI-NOVA-006C — GenOffice Ribbon and Live Slide Thumbnails

**Date:** 2026-11-08  
**Status:** IMPLEMENTED — VERIFIED LOCALLY; RELEASE READY  
**Production target:** Existing Content Editor at `/paper-editor`, not StudioFlow `/studio/`

## Objective

Bring the Nova Slides authoring surface closer to the professional GenOffice
presentation workflow by adding a real ribbon command band and live slide
previews. Preserve Nova's existing presentation model, image handling,
speaker notes, autosave, and Presenter Mode.

## GenOffice source inspection

The reference repository is `/Users/toddknipple/Documents/GitHub/genoffice` at
the local checkout HEAD `968d7d23` (`Sync snapshot (2026-09-28) (#1469)`). The
relevant source was inspected in:

- `apps/slides/src/renderer/components/Ribbon.tsx`
- `apps/slides/src/renderer/components/ribbon-shared.tsx`
- `apps/slides/src/renderer/SlideThumb.tsx`
- `apps/slides/src/renderer/use-visible-thumbs.ts`
- `apps/slides/src/renderer/App.tsx`

GenOffice's useful architecture is a tab strip plus grouped command band, with
live read-only thumbnails rendered from the same slide model as the editor.
Nova adopts that interaction and rendering pattern in Nova-owned web code. It
does not import Electron-only GenOffice modules, GenOffice branding, or a
second presentation engine, consistent with the existing reuse boundary.

## Implementation

- Added `nova-app/src/slides/GenOfficeRibbon.tsx` with Home, Insert, Draw,
  Design, Transitions, Animations, Slide Show, Review, and View tabs.
- Wired the existing Nova commands into the ribbon: new/duplicate/delete
  slide, text, shape, upload image, image URL, background, reorder, Present,
  and Save.
- Added `nova-app/src/slides/PresentationThumbnail.tsx`, a read-only wrapper
  around the existing Konva `SlideCanvas`.
- Replaced text-only Slides library cards with live first-slide previews.
- Replaced text-only left-rail slide boxes with live rendered thumbnails that
  update when the selected slide changes.
- Reconciled stale stored presentation titles against the authoritative Nova
  item title before rendering or migrating the deck, preventing a stale
  `Untitled Presentation` cover from appearing beside a renamed deck.
- Added a regression check proving the GenOffice ribbon reference and live
  thumbnail path are present.

## Verification

| Check | Result |
|---|---:|
| `npm run verify:nova-006-slides` | 16 passed, 0 failed |
| `npm --prefix nova-app run typecheck` | PASS |
| `npm run verify:nova-004r6b` | 47 passed, 0 failed |
| `npm run verify:release-safety` | 27 passed, 0 failed |
| `npm run build:content-editor-nova` | PASS |
| `git diff --check` | PASS |
| Local Firefox ribbon visible | PASS |
| Local Firefox real thumbnails visible | PASS |
| Local Firefox slide selection changes the main canvas | PASS |
| Local Firefox Insert tab exposes image upload and URL controls | PASS |

## Release artifact

The current build generated these assets:

- JavaScript: `content-editor-DAsDA1XK.js`
  - SHA-256: `c73457c0b4e4bdb6f7ead642c9fd8aeb1a4c7b07aa94d7e2facfcc075a71f473`
- CSS: `content-editor-Bh4YyWwB.css`
  - SHA-256: `fcb0f6315677a5535d92021983378beab149adfe282d3117cbf137a8971a5afe`
- Entrypoint: `content-editor.html`
  - SHA-256: `888efbbc9af94443050edaaaf3c045ab82cc997c7f9e3564a2f0c281484a3f67`

## Scope and known limitation

This change is scoped to Nova Slides in the existing Content Editor. The
additional ribbon tabs now provide the professional navigation surface; tabs
whose advanced commands are not yet part of Nova's web model show a clear
state message rather than pretending to provide GenOffice feature parity.
PPTX/PDF export, collaboration, and advanced transitions/animations remain
separate future work.

Production deployment follows the canonical guarded Content Editor release
path after the documentation commit and live production acceptance gates pass.
