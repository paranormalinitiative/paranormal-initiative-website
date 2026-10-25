# INTRO/OUTRO PLAYBACK TOGGLE, RECORDING SAFETY,

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 02:16.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** [TPI-STUDIOFLOW-020-INTRO-OUTRO-PLAYBACK.md](TPI-STUDIOFLOW-020-INTRO-OUTRO-PLAYBACK.md)

---

TPI-STUDIOFLOW-020
INTRO/OUTRO PLAYBACK TOGGLE, RECORDING SAFETY,
AND OPERA BROWSER VERIFICATION

PROJECT: The Paranormal Initiative — StudioFlow
STUDIO: Crossroads of the Unknown
PRIORITY: HIGH
ENVIRONMENT: LOCAL DEVELOPMENT ONLY

STATUS: AUTHORIZED FOR INVESTIGATION AND LOCAL CORRECTION

============================================================
OBJECTIVE
============================================================

Correct three related StudioFlow behaviors:

1. Intro and Outro buttons must function as true
   Play/Stop toggles.

2. Every new playback must begin at 00:00.

3. Investigate why Opera continues displaying vertical
   bands around the intro video while the Codex browser
   displays the corrected layout.

The correction must apply universally to all Studios.

Preserve existing Studio configurations, scenes, media,
guest connections, and development safeguards.

============================================================
PHASE 1 — INTRO PLAY/STOP TOGGLE
============================================================

The existing Intro button must alternate between
playing and stopping the intro video.

REQUIRED SEQUENCE:

CLICK 1:
- Start Intro.
- Begin playback at 00:00.
- Display Intro on the production stage.
- Play associated audio.
- Mark Intro as active.

CLICK 2:
- Stop Intro immediately.
- Stop associated audio.
- Reset playback position to 00:00.
- Restore the appropriate production scene.
- Mark Intro as inactive.

CLICK 3:
- Start Intro again.
- Begin playback at 00:00.
- Never resume from the previous stopping point.

CLICK 4:
- Stop Intro immediately.
- Reset playback to 00:00.

Repeat indefinitely.

The host must never be forced to wait until the
video finishes naturally.

============================================================
PHASE 2 — OUTRO PLAY/STOP TOGGLE
============================================================

Apply identical behavior to Outro.

CLICK 1:
Play Outro from 00:00.

CLICK 2:
Stop Outro immediately and reset to 00:00.

CLICK 3:
Replay Outro from 00:00.

CLICK 4:
Stop Outro immediately.

Continue alternating between Play and Stop.

Only one Intro or Outro may be active at a time.

Prevent overlapping audio and video.

============================================================
PHASE 3 — NATURAL PLAYBACK COMPLETION
============================================================

When Intro or Outro finishes naturally:

1. Stop playback.
2. Stop associated audio.
3. Reset playback position to 00:00.
4. Restore the appropriate production scene.
5. Reset the button's active state.
6. Allow immediate replay from the beginning.

Do not automatically loop the video.

Do not leave the button in an active state after
playback has finished.

============================================================
PHASE 4 — RECORDING AND LIVESTREAM SAFETY NET
============================================================

The host may preview Intro before starting a recording
or livestream.

This preview must not cause the recorded or streamed
Intro to begin partway through.

REQUIRED:

When recording begins:

- Ensure Intro playback is reset to 00:00.
- Clear stale Intro playback state.
- Preserve the original Intro media.
- Ensure the next Intro activation begins at 00:00.

When livestreaming begins:

- Apply the same reset behavior.
- Ensure the next Intro activation begins at 00:00.

IMPORTANT:

Do not automatically start Intro playback merely
because recording or livestreaming begins.

The host controls when Intro is played.

If recording or livestreaming is already active,
the host may press Intro and it must begin at 00:00.

Recording and livestream controls must remain
independent from Intro and Outro controls.

Stopping Intro or Outro must NOT stop recording
or livestreaming.

Do not activate recording or livestreaming
during this directive's testing.

If the reset behavior cannot be verified without
activating recording or livestreaming, report that
verification as pending.

============================================================
PHASE 5 — SCENE RESTORATION
============================================================

When Intro or Outro is stopped:

- Restore the appropriate previous production scene.
- Preserve guest connections.
- Preserve guest camera and microphone states.
- Preserve scene configuration.
- Preserve Studio settings.

If the host selects a different scene during playback,
honor that selection.

Do not restore an outdated scene.

Do not disconnect guests.

============================================================
PHASE 6 — INVESTIGATE OPERA DISPLAY DIFFERENCE
============================================================

IMPORTANT USER-REPORTED ISSUE:

The Crossroads of the Unknown Intro appears correct
in the Codex browser.

However, Opera continues displaying dark vertical
areas on both sides of the video.

The owner has already attempted a hard refresh.

Do not assume this is simply browser cache.

INVESTIGATE:

1. Confirm Opera and the Codex browser are accessing
   the exact same StudioFlow development URL.

2. Confirm both browsers are using the same Studio
   and the same Intro media asset.

3. Confirm both browsers receive the same current
   StudioFlow CSS and JavaScript versions.

4. Inspect whether Opera is loading stale cached
   stylesheets or scripts.

5. Check for service worker caching.

6. Check whether browser-specific CSS behavior
   affects video sizing.

7. Compare the actual stage container dimensions.

8. Compare the rendered video element dimensions.

9. Compare computed object-fit values.

10. Compare parent container padding and margins.

11. Check whether the stage uses different layout
    calculations at different browser widths.

12. Check whether Opera is displaying the same
    source video content as the Codex browser.

13. Determine whether the dark vertical areas are
    source imagery or actual unused stage space.

14. Inspect the complete CSS cascade and stylesheet
    loading order.

15. Verify that the TPI-STUDIOFLOW-019 correction
    is actually loaded in Opera.

Do not make speculative CSS changes.

Identify the cause using measurable evidence.

============================================================
PHASE 7 — OPERA CACHE AND VERSION VERIFICATION
============================================================

Determine whether the browser is loading stale assets.

If confirmed, implement an appropriate development-safe
cache invalidation correction.

Possible areas to investigate:

- CSS asset versioning.
- JavaScript asset versioning.
- Service worker caching.
- Browser cache headers.
- Stylesheet loading order.

Do not globally disable production caching.

Do not modify production cache configuration.

Do not deploy changes.

If Opera cannot be inspected directly, report the
specific browser-side measurements required.

Do not claim Opera verification passed without
testing Opera.

============================================================
PHASE 8 — PLAYBACK STATE SAFETY
============================================================

Prevent:

- Double playback.
- Overlapping Intro and Outro audio.
- Stale active button states.
- Playback continuing after Studio switching.
- Playback resuming after reload.
- Race conditions from rapid repeated clicks.
- Playback starting at a previous timestamp.
- Guest disconnections caused by scene restoration.

Handle missing media and playback failures gracefully.

============================================================
PHASE 9 — TESTING
============================================================

INTRO TEST:

1. Click Intro.
2. Confirm playback starts at 00:00.
3. Stop halfway through.
4. Confirm immediate stop.
5. Click Intro again.
6. Confirm restart at 00:00.
7. Stop again.
8. Replay and allow natural completion.
9. Confirm playback resets.
10. Replay again from 00:00.

OUTRO TEST:

Repeat the same sequence.

CROSS-PLAYBACK TEST:

1. Start Intro.
2. Select Outro.
3. Confirm Intro stops.
4. Confirm Outro starts at 00:00.
5. Confirm no overlapping audio.

SCENE TEST:

1. Start Intro.
2. Stop Intro.
3. Confirm scene restoration.
4. Repeat with Outro.
5. Verify guest state remains unchanged.

BROWSER TEST:

1. Verify in Codex browser.
2. Verify in Opera when accessible.
3. Compare actual stage and video dimensions.
4. Verify current CSS/JS versions.
5. Confirm no StudioFlow-generated vertical borders.
6. Confirm no distortion or cropping.

REGRESSION TESTS:

Run relevant tests for:

TPI-STUDIOFLOW-012
TPI-STUDIOFLOW-014
TPI-STUDIOFLOW-017
TPI-STUDIOFLOW-019
TPI-STUDIOFLOW-020

Run JavaScript syntax checks.

Run git diff --check.

============================================================
PHASE 10 — DEVELOPMENT RESTRICTIONS
============================================================

AUTHORIZED:

- Local playback-control corrections.
- Local media-state corrections.
- Local browser compatibility investigation.
- Development-safe asset cache corrections.
- Focused regression tests.
- Development documentation updates.

NOT AUTHORIZED:

- Production deployment.
- Production database changes.
- Production Worker changes.
- Git commit.
- Git push.
- Recording activation.
- Livestream activation.
- Original media modification.
- Studio deletion.
- Scene deletion.
- Unrelated interface redesign.

Preserve the existing dirty worktree.

Do not interfere with the temporary mobile guest
testing tunnel.

Do not restart unrelated development services.

============================================================
PHASE 11 — COMPLETION REPORT
============================================================

Report:

1. Root cause of playback toggle issue.
2. Intro toggle implementation.
3. Outro toggle implementation.
4. Fresh-start playback verification.
5. Audio stop verification.
6. Scene restoration verification.
7. Recording/livestream safety-net implementation.
8. Opera investigation findings.
9. Whether stale assets were detected.
10. Whether Opera was directly tested.
11. Files modified.
12. Regression results.
13. Remaining limitations.

Update the directive index and current development
status documentation.

============================================================
ACCEPTANCE CRITERIA
============================================================

The directive is complete when:

- Intro alternates Play/Stop correctly.
- Outro alternates Play/Stop correctly.
- Every new playback begins at 00:00.
- Stopping immediately silences video audio.
- Natural completion resets playback.
- Recording/livestream startup cannot cause
  the next Intro to resume partway through.
- Existing guest sessions remain unaffected.
- Scene restoration works correctly.
- No overlapping playback occurs.
- Opera rendering differences are identified.
- Any confirmed StudioFlow rendering defect is fixed.
- Relevant regression tests pass.

Opera verification must remain pending if Opera
cannot be directly inspected.

Recording/livestream verification must remain pending
if those features cannot be tested safely.

DO NOT DEPLOY TO PRODUCTION.

END DIRECTIVE — TPI-STUDIOFLOW-020
