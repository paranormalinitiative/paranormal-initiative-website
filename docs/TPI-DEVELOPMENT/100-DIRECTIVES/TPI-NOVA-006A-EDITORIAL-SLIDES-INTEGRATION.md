# TPI-NOVA-006A — GenOffice Slides in the Content Editor

**Date:** 2026-11-08  
**Status:** IMPLEMENTED — VERIFIED IN LOCAL DEVELOPMENT  
**Production deployment:** Not yet performed in this execution record

## Objective

Bring the existing GenOffice/Nova Slides workspace into the existing Content
Editor so Documents and Slides are available from one editorial workspace. This
extends the existing Slides implementation; it does not create a second slide
engine and does not place Nova Edit in StudioFlow.

## Implementation

- Activated the existing Content Editor `Slides` workspace control.
- Mounted the existing `SlidesSurface` and `nova-presentation` persistence path
  from the Content Editor shell.
- Added a dedicated Slides host that is isolated from the document editor DOM
  while the workspace is active.
- Added the existing Konva/React-Konva dependencies to the Content Editor's
  vendor split so the slide canvas is loaded with the Content Editor bundle.
- Preserved the Documents editor, article metadata, autosave and compatibility
  fallback paths.

## Verification

Source and build checks:

| Check | Result |
|---|---:|
| `npm run verify:nova-006-slides` | 11 passed, 0 failed |
| `npm --prefix nova-app run typecheck` | PASS |
| `npm run build:content-editor-nova` | PASS |
| `git diff --check` | PASS |

Firefox development acceptance on `http://127.0.0.1:8787/paper-editor.html`:

1. The Content Editor displayed Documents and an active Slides workspace
   control.
2. A disposable presentation was created through the Slides workspace.
3. The presentation title was changed to `Disposable Slides Integration Check
   2026-11-08` and showed `Saved`.
4. A text element was added to the slide and rendered in the slide canvas.
5. Returning to the Slides library showed the renamed presentation.
6. Refreshing the page and reopening Slides showed the same presentation and
   saved title, proving server-backed persistence through the integrated route.

The verification used the existing local Firefox session and a disposable test
presentation. No production article, StudioFlow data, or production deployment
was changed by this verification.

## Scope boundary

Slides are now available inside the Content Editor. The separate future
StudioFlow “Add to Production” bridge, presenter mode, PDF/PPTX export, and
advanced asset upload remain outside this focused integration.

## Files changed

- `nova-app/src/content-editor-entry.tsx`
- `nova-app/vite.content-editor.config.ts`
- `paper-editor.html`
- `paper-editor.js`
- `style.css`
- `scripts/verify/tpi-nova-006-slides.mjs`
- `content-editor-nova/content-editor.html`
- generated `content-editor-nova/assets/*` from the Content Editor build

