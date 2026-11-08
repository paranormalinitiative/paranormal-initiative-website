# TPI-NOVA-006A — GenOffice Slides in the Content Editor

**Date:** 2026-11-08  
**Status:** COMPLETE — DEPLOYED AND VERIFIED
**Production deployment:** Verified on 2026-11-08 through the guarded release path

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

## Production release

The approved Content Editor Slides integration was deployed as release
`rel-ae6854fcec4e-fe465822e352`.

- Website/source commit: `ae6854fcec4e7c6275c3cedc57b1f9a443042dea`.
- Production Worker: `0e9c8080-4a2d-4451-9a37-464c69301baf` at 100% traffic.
- Rollback Worker: `1c063a9c-0c23-4592-ab53-351467442f80`.
- Approved StudioFlow bundle commit: `eefb7de9518809d98726062aee478a4111c921a5`.
- Release manifest digest: `304e89fed310004363d093668e2d07d0d6043f351ec84b082bab9a0ed0cdfdf9`.

Live production assets were served and verified as follows:

- `content-editor-BUsnGZAY.js` — SHA-256
  `a7012364ec0cf04022d4871370305eee16b9d5945137b65d99cb641310329ec4`.
- `nova-vendor-slides-LHxyabHn.js` — SHA-256
  `5088061b4e4ea01177ffe57424516ae06ce7432dbe9bb9e72ebb79ae48f9017a`.
- `nova-vendor-react-CGTtH4Z4.js` — SHA-256
  `545c447f8ad7447272f70a69be1a53afe690984ab8975c5c0e14610821147d04`.
- `nova-vendor-tiptap-Cwg8JWgs.js` — SHA-256
  `e77f3a86abd0498cc143d7e7f27ae5ca99220e19b3d81e620c5d852576d216fc`.
- `rolldown-runtime-XKyaHtl9.js` — SHA-256
  `548d1dbf321e7d2ae804fcc158b588706a7c52f8ca175de1490c6ccb4dbe55b7`.
- `content-editor-CRrU71X0.css` — SHA-256
  `44012e8049c14ad32abee0e732c7ddcda3affe8df1ba61909b8a224d4fc7a060`.
- Redirected bootstrap HTML — SHA-256
  `2eb5ebdbf9a69aef51e52218010c58a576939785c2047bc6fc62700ea02c4a85`.

Release gates passed: certification 30/30, anonymous production smoke 10/10,
isolated Firefox production acceptance 65/65, and focused Slides integration
verification 11/11. Owner Firefox live verification opened the production
Content Editor, switched to Slides, and rendered the Slides workspace without
creating production content. The existing NDE draft remained unchanged.

The authoritative production location is the existing Content Editor route
`/paper-editor` (with `/paper-editor.html` redirecting there), not StudioFlow
`/studio/`.

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

