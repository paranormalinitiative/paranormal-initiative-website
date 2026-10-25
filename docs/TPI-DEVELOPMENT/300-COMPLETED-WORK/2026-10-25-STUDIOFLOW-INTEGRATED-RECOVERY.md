# StudioFlow Integrated Studio Management & Scene System Recovery

Date: 2026-10-25  
Status: DEPLOYED AND VISUALLY VERIFIED — OWNER ACCEPTANCE PENDING
Directive: Owner integrated recovery order for TPI-STUDIOFLOW-033 through 037

## WHO

Implementing agent: Codex / GPT-5.6 Luna execution path. Authority: the
owner's integrated StudioFlow recovery order and the governing TPI agent and
source-to-live workflow documents.

## WHAT

The repair addresses the Studio lifecycle and Scenes panel as one system:

- New Studios start with a clean independent workspace and the exact default
  arrangement `Intro Video → Scene 1 → Scene 2 → Outro Video`.
- Creating a Studio activates the server-returned identity immediately.
- Studio switching is protected against stale asynchronous responses and
  pending saves.
- Scenes context menus use viewport-safe fixed overlays and dismiss correctly.
- Legacy `Move Up` and `Move Down` commands were removed; drag-and-drop is the
  ordering authority.
- Scene/panel localStorage writes now emit a configuration-change signal only
  when serialized state actually changes, preventing hydration feedback loops.
- The maintained browser test checks visible geometry and server round trips,
  not only DOM existence.

## ROOT CAUSES

1. `workspace-bridge.js` previously built a new Studio from the active state,
   copying scenes, media assignments, orientation, and production settings.
2. `workspace-asset-state-bridge.js` merged the active browser asset
   configuration into every create request, reintroducing cross-Studio asset
   contamination even when the client payload was clean.
3. The Create New Studio dialog was inserted into normal document flow without
   the fixed backdrop/modal contract, so it rendered at the bottom of the
   application rather than centered in the viewport.
4. Studio switching had no request-generation guard and did not consistently
   cancel pending save work before hydration, allowing stale responses to win.
5. React scene menus were positioned inside an ancestor with
   `overflow:hidden`; the separate audio bridge still carried legacy ordering
   commands.
6. Scene state writes were unconditional and did not provide a meaningful
   creator-change signal, allowing hydration and autosave observers to feed
   each other.
7. Earlier browser tests asserted element existence without checking computed
   visibility or viewport geometry. Some legacy fixtures also assumed a new
   Studio inherited media or that creation required a subsequent B-to-B
   switch; those assumptions were corrected in the maintained tests.
8. `production-lock-bridge.js` marked a denied production reservation as an
   owned active lock. After recording workflows this stale denial blocked
   legitimate Studio switching even after IndexedDB recording sessions were
   gone. The denial now remains visible to the recording gate without claiming
   ownership of the production lock.

## WHERE

Canonical source changes:

- `/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx`
- `/Users/toddknipple/Documents/StudioFlow/web/src/styles.css`

Website integration and verification changes:

- `studio/workspace-bridge.js`
- `studio/workspace-asset-state-bridge.js`
- `studio/production-lock-bridge.js`
- `studio/audio-soundboard-bridge.js`
- `studio/studioflow-012-overrides.css`
- `studio/index.html`
- generated `studio/assets/index-BZ_tF0DV.js`
- generated `studio/assets/index-8wAEEeJ8.css`
- `scripts/verify/tpi-studioflow-integrated-recovery.mjs`
- `scripts/verify/tpi-studioflow-012c-production-lock.mjs`
- maintained 030, 031, and 035 browser fixtures
- `package.json`

## HOW VERIFIED

Canonical build and staging were reproducible. The integrated Firefox suite
passed 21/21 with disposable workspaces. Additional local results:

| Suite | Result |
| --- | --- |
| TPI-027 | 12/12 |
| TPI-028 browser | 33/33 |
| TPI-030 browser | 25/25 |
| TPI-031 music pads | 34/34 |
| TPI-033 round trip | 26/26 |
| TPI-034 mutation regression | PASS; settled 5/30 second windows below threshold with zero redundant writes |
| TPI-035 recording/storage | 33/33 PASS after denied-lock switching repair |
| TPI-036 timers | 28/28 |
| TPI-037 Scenes | 20/20 |
| Addendum D | 10/10 |
| Addendum E | 20/20 |
| Auth lifecycle | 38/38 plus Firefox acceptance 64/64 |
| Release safety | 17/17 |

The local Worker was verified at `http://127.0.0.1:8787/` with the managed
room server at `127.0.0.1:8788`. Tests used Firefox Developer Edition isolated
profiles and disposable test-account Studios. Crossroads of the Unknown,
owner media, D1, R2, recordings, and livestreams were not modified.

## RELEASE

- Source commit: `657f80e`
- Website application/verification commit: `e83b732`
- Documentation checkpoint before deployment: `bae6ce0`
- Production status: deployed and live-verified
- Production Worker: `7bddac9c-bda3-41c1-95d2-13aacc09cb28`
- Rollback: `871c0ae7-33c5-46ae-b635-19ec3100c989`
- Current release status: `DEPLOYED AND VISUALLY VERIFIED — OWNER ACCEPTANCE PENDING`

The guarded release completed with the 17/17 safety contract, reproducible
source staging, isolated API/browser gates, 10/10 anonymous production smoke,
and 64/64 isolated Firefox Developer Edition live checks using the synthetic
production QA account. The live acceptance profile was isolated and did not
access the owner's browser profile. No owner acceptance claim is made.

The deployed application serves the verified StudioFlow bundles
`/studio/assets/index-BZ_tF0DV.js` and `/studio/assets/index-8wAEEeJ8.css`.
Documentation-only follow-up commit after deployment: pending.

## DOCUMENTATION AUDIT

Reviewed and updated for this checkpoint:

- `TPI-CURRENT-DEVELOPMENT-STATUS.md`
- `TPI-DEVELOPMENT-AGENT-HANDOFF.md`
- `100-DIRECTIVES/DIRECTIVE-INDEX.md`
- `TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md`
- `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`
- `009-TESTING-AND-VERIFICATION.md`
- this completion record

Historical directive and completion records remain historical evidence and are
not rewritten to claim this local checkpoint was deployed.
