# TPI-STUDIOFLOW-037 Addendum E — Scene Management, Context Menus & Playback Corrections

Status: DEPLOYED AND LIVE-VERIFIED / OWNER ACCEPTANCE PENDING

Date: 2026-10-25

## Authority and scope

This record documents the Addendum E repair requested after owner acceptance
failed on the deployed Scenes panel. The governing authority was reviewed
before implementation: `AGENTS.md`, the master autonomous-agent authority,
the local-to-production runbook, the StudioFlow Source-to-Live Workflow, the
Playback Contract, Directives 028, 031, 034, and 037 with Addenda A-D. The
authoritative application source was `/Users/toddknipple/Documents/StudioFlow/web`;
the deployable integration is the canonical website repository.

No owner Studio, Crossroads of the Unknown data, production D1 record, R2
object, recording, or public broadcast was used or modified for verification.

## Who, what, where, when, why, how

Who: the assigned development agent under the TPI standing autonomous-agent
authority.

What: repaired Scenes-panel shortcut ownership, removal persistence, context
menus, sequential scene naming, and individual Intro preview isolation.

Where: the authoritative React scene panel in `StudioFlow/web/src/App.tsx`,
the integrated `studio/audio-soundboard-bridge.js` and
`studio/video-clip-management-bridge.js`, workspace default bridges, and the
maintained Firefox verification scripts.

When: investigated, implemented, and locally validated 2026-10-25; deployed and
live-verified 2026-10-25.

Why: the panel normalizer recreated missing Intro/Outro/music rows, fixed
Intro/Outro cards were protected from removal, Background Music used a
separate bridge menu without the shared removal action, and the music bridge
treated a later scheduled sync after a manual Intro stop as a real transition.
New scenes also inherited layout names rather than sequential creator-facing
names.

How: the normalizer now distinguishes a missing panel manifest from an
intentional empty one and preserves explicit creator shortcuts. The default
manifest is Intro Video → Scene 1 → Scene 2 → Outro Video; optional music and
timer shortcuts are added explicitly. All shortcut rows expose removal while
leaving media assets and saved scene configuration intact. The music bridge
now has the same removal action and records the preview baseline; Intro entry
clears currently previewing music, manual stop stays isolated, and natural
completion/rehearsal keeps the production handoff. Video stop events are
scoped to their slot. Saved scene-layout deletion now asks for confirmation.

## Root causes and corrected mappings

1. Removal failure: `normalizeScenePanelItems()` reinserted required Intro,
   Outro, and per-owner music rows on hydration, so a removed shortcut came
   back. It now preserves explicit manifests and only supplies defaults when
   the field is absent.
2. Context-menu failure: React-owned rows used the shared menu, while music
   rows were decorated by `audio-soundboard-bridge.js` and its menu did not
   dispatch a panel removal action. The bridge now dispatches the same
   `studioflow:scene-panel-remove` event.
3. Intro-stop music failure: the preview `scene-changed` event returned early,
   but the later observer sync saw the changed active scene and interpreted it
   as leaving Intro. Preview synchronization now updates its baseline; manual
   stop is marked preview-only, while natural completion is marked as a real
   production transition.
4. Naming failure: `addScene()` used the selected layout as the scene title.
   It now selects the smallest unused sequential `Scene N` name without
   renaming existing custom scenes. The panel Rename action also previously
   used a browser prompt and did not synchronize the panel row through the
   scene-editor rename path. It now opens the existing editable modal, supports
   Enter save and Escape cancel, rejects empty names, limits names to 120
   characters, and updates the stable scene ID and panel title together. The
   timer shortcut uses the stable `timer` identifier.

The authoritative assignments remain unchanged:

- Intro Video → the active Studio's Intro slot in Video Clips.
- Outro Video → the active Studio's Outro slot in Video Clips.
- Background Music / After Intro → the active Studio's stable assignment in
  `sceneMusicAssignments`, resolved through the existing Background Music
  board.
- Timer, Video Clip, and Scene → their existing shared engines and stable
  shortcut/scene identifiers.

No duplicate asset record, media player, assignment store, or playback engine
was introduced.

## Files modified

Authoritative source:

- `/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx`

Website integration and verification:

- `studio/audio-soundboard-bridge.js`
- `studio/video-clip-management-bridge.js`
- `studio/workspace-asset-state-bridge.js`
- `studio/workspace-bridge.js`
- `studio/index.html` and the staged generated StudioFlow bundle
- `package.json`
- `scripts/verify/tpi-studioflow-021-browser.mjs`
- `scripts/verify/tpi-studioflow-028-browser.mjs`
- `scripts/verify/tpi-studioflow-030-browser.mjs`
- `scripts/verify/tpi-studioflow-031-music-pads.mjs`
- `scripts/verify/tpi-studioflow-037-scenes-panel.mjs`
- `scripts/verify/tpi-studioflow-037-addendum-c.mjs`
- `scripts/verify/tpi-studioflow-037-addendum-d.mjs`
- `scripts/verify/tpi-studioflow-037-addendum-e.mjs`

## Validation

| Coverage | Result |
| --- | --- |
| Addendum E Firefox interaction suite | 20/20 |
| TPI-037 Scenes panel regression | 20/20 |
| Addendum C uniformity and reactive drag | 26/26 |
| Addendum D playback/removal | 10/10 |
| TPI-028 Intro/Outro and After Intro | 33/33 |
| TPI-030 Sound Effects / Background Music | 25/25 |
| TPI-031 Background Music | 34/34 |
| TPI-033 workspace round-trip | 26/26 |
| TPI-034 mutation regression | PASS; settled idle 5s/30s windows below threshold, zero child-list churn |
| TPI-035 recording/storage | 33/33 |
| TPI-036 cinematic timers | 28/28 |
| TPI-021 browser audio coverage | 31/31 |
| Source TypeScript/Vite build and reproducible staging | PASS |

The Addendum E browser run used Firefox Developer Edition, an isolated
profile, a disposable authenticated workspace, and synthetic media. It
verified all supported context menus, right-click, durable shortcut removal,
rename persistence without changing scene IDs, next-available naming, and
Intro play/stop without After Intro activation. Natural completion still
triggered After Intro music. Studio-specific workspace state remained
isolated.

## Git and release state

- Source commit: `8fdabf4` (`fix(studioflow): make scene renaming editable`)
- Website application commit: `b1c21a085be679eb156c1c83277119c861068921`
- Documentation commit: `c19c029ac62d9ecd47bc717bd120b052a071c463`
- Production Worker: `d58d7e1e-5f86-4c87-93b3-110999d200a9`, deployed at 100%
- Rollback reference: `4b44e41d-7fb1-43a8-b9d9-510a90672cb0`
- Production deployment: `DEPLOYED_AND_VERIFIED`; anonymous smoke 10/10 and
  isolated Firefox Developer Edition acceptance 64/64
- Owner acceptance: pending; this record must not claim owner acceptance

The next release steps are the governed `verify:local-auth-lifecycle`,
`release:preflight`, application commit/push, and
`TPI_PRODUCTION_DEPLOY=approved npm run release:production`, followed by
non-destructive live Firefox acceptance and a final documentation commit.
