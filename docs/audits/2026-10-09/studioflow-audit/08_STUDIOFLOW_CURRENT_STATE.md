# StudioFlow Current State

> **Status correction — October 10, 2026:** This snapshot records the TPI-STUDIOFLOW-002 baseline. The active implementation and verification record is [TPI-STUDIOFLOW-003 progress](13_TPI_STUDIOFLOW_003_PROGRESS.md), which supersedes the historical “working tree clean” and “no source app files changed” statements below. The TPI generated `studio/` copy remains intentionally unmodified.

> **Owner verification — October 10, 2026:** Camera functionality, microphone functionality, and creation of a local video recording are **OWNER VERIFIED — WORKING**. Live video broadcasting, webinar functionality, and the four repaired General settings remain **NOT YET VERIFIED**. Export, recovery, and related recording durability remain unverified.

## The Paranormal Initiative
## StudioFlow Build & Release Workflow

### CANONICAL SOURCE:

`/Users/toddknipple/Documents/StudioFlow/web`

### SOURCE GIT STATUS:

Git repository confirmed. Branch `main`; HEAD `130275ca0b168847a49a80896c77488416c2970f`. Working tree is dirty.

### CURRENT SOURCE CHANGES:

Modified tracked files: `server/room-server.mjs`, `server/rtmp-bridge.mjs`, `src/App.tsx`, `src/styles.css`, and `src/useMediaDevices.ts`. Untracked development assets: `src/assets/`. These changes remain intact.

### EXISTING DIST STATUS:

`StudioFlow/web/dist` exists and was not modified. A fresh isolated build from a temporary copy of the current source matched the existing `dist` byte-for-byte for HTML, JavaScript, CSS, and image assets.

### TPI STUDIO COPY STATUS:

`paranormal-initiative-website/studio` exists and was not modified. Its generated JS, CSS, and image assets match the existing `dist` and isolated candidate. Its `index.html` includes the TPI-specific theme bridge and differs from raw Vite output as intended. `.DS_Store` is present and unrelated.

### SOURCE BUILD:

PASS — TypeScript validation passed. The first direct Vite attempt was correctly stopped by `EPERM` when Vite tried to write beside the real config. The safe temporary-source build then passed and transformed 1,592 modules.

### RELEASE VALIDATION:

PARTIAL — static checks and isolated production build passed. Browser startup, camera/microphone permissions, scene controls, recording/playback/export, authenticated owner/admin behavior, and failure handling were not run under this directive.

### CURRENT BUILD COMPARISON:

Candidate equals existing `StudioFlow/web/dist`. Existing `dist` equals TPI `studio` for generated JS/CSS/image assets. TPI `index.html` is a deliberate integration wrapper with the theme bridge. No copy or replacement occurred.

### TPI INTEGRATION:

The Worker preserves owner/admin host access, public guest asset loading, and the private-build gate. `/live-video` remains a Coming Soon entry point. `worker.js`, permissions, navigation, and production behavior were not modified.

### PROMOTION TOOLING:

Created a read-only dry-run utility:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/scripts/studioflow-release-dry-run.mjs`

It inspects source/TPI Git state, manifests, hashes, and optional candidate output. It does not build, copy, delete, commit, push, or deploy.

### ROLLBACK PROCEDURE:

Documented in `07_STUDIOFLOW_ROLLBACK_PLAN.md`; no rollback performed.

### FILES CHANGED:

Added only:

- `docs/audits/2026-10-09/studioflow-audit/01_STUDIOFLOW_SOURCE_OF_TRUTH.md`
- `docs/audits/2026-10-09/studioflow-audit/02_STUDIOFLOW_BUILD_PIPELINE.md`
- `docs/audits/2026-10-09/studioflow-audit/03_STUDIOFLOW_RELEASE_VALIDATION.md`
- `docs/audits/2026-10-09/studioflow-audit/04_STUDIOFLOW_BUILD_COMPARISON.md`
- `docs/audits/2026-10-09/studioflow-audit/05_STUDIOFLOW_PROMOTION_PROCEDURE.md`
- `docs/audits/2026-10-09/studioflow-audit/06_STUDIOFLOW_TPI_INTEGRATION.md`
- `docs/audits/2026-10-09/studioflow-audit/07_STUDIOFLOW_ROLLBACK_PLAN.md`
- `docs/audits/2026-10-09/studioflow-audit/08_STUDIOFLOW_CURRENT_STATE.md`
- `scripts/studioflow-release-dry-run.mjs`

Existing TPI changes were preserved and are not attributed to this directive.

### PRODUCTION CHANGES:

NONE

### TPI/STUDIO CHANGES:

NONE

### DEPLOYMENT:

NOT PERFORMED

### RECOMMENDED NEXT ACTION:

Keep the current StudioFlow source protected. Review the new dry-run report and source diff, then separately authorize browser/runtime acceptance testing. Do not promote or deploy until those tests pass and the owner explicitly approves a candidate.

