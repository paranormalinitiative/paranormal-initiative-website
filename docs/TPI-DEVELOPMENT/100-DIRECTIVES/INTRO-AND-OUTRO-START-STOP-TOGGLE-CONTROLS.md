# INTRO AND OUTRO — START/STOP TOGGLE CONTROLS

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 02:07.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-020
## INTRO AND OUTRO — START/STOP TOGGLE CONTROLS

PROJECT: The Paranormal Initiative — StudioFlow
PRIORITY: HIGH
ENVIRONMENT: LOCAL DEVELOPMENT ONLY
STATUS: AUTHORIZED FOR LOCAL IMPLEMENTATION

---

## OBJECTIVE

Modify StudioFlow's existing Intro and Outro buttons
so that each button functions as a Start/Stop toggle.

Currently, clicking Intro or Outro starts video playback,
but the owner must wait until the video finishes before
the playback stops.

This behavior is unacceptable for live podcast production.

The host must have immediate control over intro and
outro playback.

The correction must apply universally to all Studios.

---

## PHASE 1 — INVESTIGATE EXISTING CONTROLS

Identify:

1. How the Intro button starts playback.
2. How the Outro button starts playback.
3. How StudioFlow tracks active media playback.
4. How intro and outro playback affects the stage.
5. What happens when playback finishes naturally.
6. How StudioFlow restores the previous scene.
7. Whether playback audio is routed to the
   production output.
8. Whether playback state is synchronized with
   the stage rendering system.

Determine the current playback lifecycle before
making modifications.

---

## PHASE 2 — INTRO BUTTON TOGGLE

Implement the following behavior:

FIRST CLICK:

- Start the Intro video.
- Display the Intro on the production stage.
- Play the Intro audio.
- Change the button's active state.
- Display the button label "Stop Intro".

SECOND CLICK:

- Immediately stop Intro playback.
- Stop Intro audio.
- Reset the video playback position.
- Restore the appropriate previous stage scene.
- Return the button to its inactive state.
- Display the button label "Play Intro".

The host must not be required to wait for the
video to finish.

---

## PHASE 3 — OUTRO BUTTON TOGGLE

Implement identical behavior for Outro.

FIRST CLICK:

- Start the Outro video.
- Display the Outro on the production stage.
- Play the Outro audio.
- Change the button's active state.
- Display the button label "Stop Outro".

SECOND CLICK:

- Immediately stop Outro playback.
- Stop Outro audio.
- Reset the playback position.
- Restore the appropriate previous stage scene.
- Return the button to its inactive state.
- Display the button label "Play Outro".

---

## PHASE 4 — PLAYBACK COMPLETION

When an Intro or Outro finishes naturally:

1. Stop playback.
2. Stop associated audio.
3. Reset the playback position.
4. Restore the appropriate stage scene.
5. Reset the button to its inactive state.

The button must never remain stuck in
"Stop Intro" or "Stop Outro" after playback ends.

---

## PHASE 5 — PREVENT CONFLICTING PLAYBACK

Only one Intro or Outro may play at a time.

If Intro is playing and the host selects Outro:

1. Stop Intro immediately.
2. Stop Intro audio.
3. Reset Intro playback.
4. Start Outro playback.
5. Update both button states.

If Outro is playing and the host selects Intro:

Apply the reverse behavior.

Prevent overlapping audio or video playback.

---

## PHASE 6 — SCENE RESTORATION

When playback is manually stopped or completes:

- Restore the scene that was active before playback.
- Preserve existing guest connections.
- Preserve guest audio/video state.
- Preserve camera selections.
- Preserve scene configuration.
- Do not reset the Studio workspace.
- Do not interrupt an active guest session.

If the host changes scenes during playback,
honor the newly selected scene rather than
restoring an outdated scene.

---

## PHASE 7 — BUTTON STATE AND FEEDBACK

The controls must clearly indicate playback state.

INACTIVE:
Play Intro
Play Outro

ACTIVE:
Stop Intro
Stop Outro

The active state must be visually distinguishable.

Button state must accurately reflect actual
media playback.

Do not redesign unrelated StudioFlow controls.

---

## PHASE 8 — PLAYBACK SAFETY

Verify:

1. Intro starts on first click.
2. Intro stops immediately on second click.
3. Outro starts on first click.
4. Outro stops immediately on second click.
5. Audio stops when video stops.
6. Playback resets to the beginning.
7. Natural completion resets button state.
8. Switching between Intro and Outro works.
9. No overlapping playback occurs.
10. Previous scene restores correctly.
11. Guest connections remain unaffected.
12. Rapid repeated clicks do not break playback.
13. Missing media is handled gracefully.
14. Failed playback does not leave controls stuck.
15. Studio switching does not leave media playing.
16. Studio reload does not restore stale playback state.

---

## PHASE 9 — TESTING

Run focused tests for TPI-STUDIOFLOW-020.

Also run relevant regression tests for:

- TPI-STUDIOFLOW-012
- TPI-STUDIOFLOW-014
- TPI-STUDIOFLOW-017
- TPI-STUDIOFLOW-019
- Production-lock protections
- Studio scene isolation
- Media persistence

Run JavaScript syntax checks.

Run git diff --check.

Perform local browser verification when possible.

Do not activate recording or livestreaming
during testing.

---

## PHASE 10 — DEVELOPMENT RESTRICTIONS

AUTHORIZED:

- Investigate existing playback controls.
- Modify local playback state management.
- Modify Intro and Outro button behavior.
- Add focused regression tests.
- Perform local browser verification.
- Update development documentation.

NOT AUTHORIZED:

- Production deployment.
- Production Worker modification.
- Production database changes.
- Database migrations.
- Git commit.
- Git push.
- Recording activation.
- Livestream activation.
- Modification of original media assets.
- Deletion of Studios or scenes.
- Unrelated UI redesign.

Preserve the existing dirty worktree.

Do not interfere with the temporary mobile
guest testing tunnel.

---

## PHASE 11 — COMPLETION REPORT

Document:

1. Root cause of existing playback behavior.
2. Files modified.
3. Intro toggle implementation.
4. Outro toggle implementation.
5. Audio stop behavior.
6. Scene restoration behavior.
7. Natural playback completion behavior.
8. Rapid-click protection.
9. Browser verification results.
10. Regression test results.
11. Remaining limitations.

Update:

- TPI directive index.
- Current development status.
- Completed work documentation.

---

## ACCEPTANCE CRITERIA

TPI-STUDIOFLOW-020 is complete when:

- Intro starts on first click.
- Intro stops immediately on second click.
- Outro starts on first click.
- Outro stops immediately on second click.
- Audio and video stop together.
- Playback resets correctly.
- Previous scenes restore correctly.
- Natural completion resets controls.
- Guest connections remain unaffected.
- No overlapping Intro/Outro playback occurs.
- Relevant tests pass.
- Live browser verification succeeds.

DO NOT DEPLOY TO PRODUCTION.

END DIRECTIVE — TPI-STUDIOFLOW-020
