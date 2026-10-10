# StudioFlow Release Validation

## Owner verification update — October 10, 2026

Owner verification is recorded separately from automated validation. The owner directly verified camera functionality, microphone functionality, and creation of a local video recording. This does not verify recording export, playback acceptance, crash recovery, long-session durability, or cloud persistence.

Live video broadcasting and webinar functionality remain **NOT YET VERIFIED**. The four recently repaired General settings also remain **NOT YET VERIFIED** at runtime.

## Validation status

| Check | Status | Evidence or limitation |
|---|---|---|
| Canonical source identified | PASS | `/Users/toddknipple/Documents/StudioFlow/web` confirmed as Git repo and source path |
| Source working-tree inventory | PASS | Five modified tracked files and untracked `src/assets/` recorded |
| TypeScript validation | PASS | `tsc --noEmit` completed with no output |
| Room-server syntax | PASS | `npm run check:room` completed successfully |
| RTMP-bridge syntax | PASS | `npm run check:rtmp` completed successfully |
| TPI worker/API syntax | PASS | `node --check` completed for `worker.js` and `functions/api/[[path]].js` |
| Isolated production build | PASS | Vite build succeeded from a temporary source copy; 1,592 modules transformed |
| Candidate manifest | PASS | 13 files: HTML, JS, CSS, and ten image assets |
| Candidate asset references | PASS | Referenced hashed assets were present in candidate output |
| Development-host string scan | PASS | No `localhost`, `127.0.0.1`, or local room/RTMP port strings found in candidate entry/JS scan |
| Browser startup | NOT TESTED | No local server was started under this directive |
| Camera functionality | **OWNER VERIFIED — WORKING** | Direct owner verification; automated permission-flow test not run here |
| Microphone functionality | **OWNER VERIFIED — WORKING** | Direct owner verification; automated permission-flow test not run here |
| Scene/layout controls | NOT TESTED | Source/build validation only |
| Branding controls | NOT TESTED | Source/build validation only |
| Local video recording creation | **OWNER VERIFIED — WORKING** | Direct owner verification; automated recording operation not run here |
| Recording export/recovery/durability | NOT TESTED | Not covered by the owner verification update |
| Live video broadcasting | **NOT YET VERIFIED** | No owner or automated live acceptance evidence recorded |
| Webinar functionality | **NOT YET VERIFIED** | No owner or automated webinar acceptance evidence recorded |
| Four repaired General settings | **NOT YET VERIFIED** | Runtime interaction still requires a separate Studio test |
| Owner/admin authorization | PARTIAL | Worker route logic inspected; authenticated browser test not run |
| Protected route behavior | PASS/PARTIAL | Worker logic requires owner/admin; live anonymous behavior was previously observed as protected; no authenticated test here |
| Error handling | NOT TESTED | No failure-injection run |

## Validation policy

The following are release gates for a future promotion:

1. Isolated TypeScript and production build pass.
2. Candidate manifest and hashes are recorded.
3. Browser startup and initialization succeed from the candidate.
4. Camera/microphone permission and device recovery are tested.
5. Scenes, layouts, branding, recording, playback, and export are exercised.
6. Unauthorized `/studio/` access remains blocked and owner/admin access is tested separately.
7. TPI integration and asset paths are checked after staging, before any deployment decision.

Unfinished livestreaming or guest capabilities may remain gated, but gated or unverified capabilities must not be represented as production-ready.

