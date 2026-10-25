# TPI-STUDIOFLOW-037 Addendum D — Production Button Playback & Rehearsal Controls

Date: 2026-10-25  
Agent: GPT-5.6 Luna  
Status: DEPLOYED AND LIVE-VERIFIED / OWNER ACCEPTANCE PENDING

## Who, what, when, why, and how

GPT-5.6 Luna completed this authorized correction on 2026-10-25 under the
standing TPI agent authority. The repair makes Intro Video, Outro Video,
Countdown Timer, Background Music, and Video Clip shortcuts independent
first-click play/second-click stop controls. Play Sequence now visibly toggles
to Stop Sequence and cancels its rehearsal at any point. `Remove from Scenes`
removes a panel shortcut without deleting its underlying media asset.

The root cause was incomplete toggle wiring around existing playback owners:
the Video Clips and Background Music bridges did not stop the same active item
on a repeated click, the timer shortcut only started the shared ring engine,
and rehearsal delayed callbacks were not invalidated when rehearsal stopped.
The correction reuses the established engines, stage player, music stop path,
and workspace configuration. Generation/token guards prevent stale async loads
and delayed rehearsal transitions from starting later media.

## Files and functions

- Authoritative source: `/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx`
  (`selectScene`, `previewScenePanelItem`, `finishVideoClipPlayback`,
  `startSceneRehearsal`, `advanceSceneRehearsal`, `stopSceneRehearsal`, and
  scene context actions).
- Website bridge: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/studio/audio-soundboard-bridge.js`
  (`activateSceneMusicButton` and rehearsal stop listener).
- Website bridge: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/studio/video-clip-management-bridge.js`
  (`playAssetOnStage`, `clearStagePlayback`, playing-state and stop-event
  handling).
- Maintained test: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/scripts/verify/tpi-studioflow-037-addendum-d.mjs`.

The existing media assignment mechanisms remain authoritative. No duplicate
asset records, alternate persistence keys, separate music player, or separate
video player was introduced. Required fixed Intro/Outro assignment rows remain
protected; optional shortcuts and user-created scene entries use the existing
panel-removal path.

## Verification

| Check | Result |
| --- | --- |
| Addendum D focused browser regression | 10/10 PASS |
| TPI-037 Scenes regression | 20/20 PASS |
| TPI-028 playback regression | 33/33 PASS |
| TPI-031 Background Music regression | 34/34 PASS |
| TPI-034 mutation regression | PASS |
| Local/live isolated Firefox acceptance | 64/64 PASS |
| Production smoke | 10/10 PASS |
| Guarded release preflight | PASS |

The focused Addendum D suite verified timer, Background Music, and Video Clips
play/stop toggles, Play Sequence/Stop Sequence cancellation, the context-menu
label, and preservation of the underlying Video Clips asset after shortcut
removal. It used disposable local browser state and synthetic media. The live
acceptance used the governed isolated production QA suite and did not mutate
the owner's Studio or media.

## Release evidence

- Source commit: `5186e28` in the authoritative StudioFlow source repository
  (no configured source remote).
- Website application/test commit: `8d46a45`, pushed to
  `codex/tpi-development`.
- Production Worker: `3a9b090f-78b5-43d6-bb11-17a1ba54d41b`.
- Rollback reference: `5536bcc5-8c50-4851-b6e4-4a660eb1b0fb`.
- Production result: `DEPLOYED_AND_VERIFIED`.
- Documentation follow-up: committed after deployment; documentation-only and
  intentionally not redeployed as a no-op Worker release.

No unrelated StudioFlow systems were modified. Owner acceptance of the
production behavior remains the final pending confirmation.
