# TPI-STUDIOFLOW-028 — Restore Original Intro/Outro Production Workflow

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-23 15:20.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md](../300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-028
## RESTORE ORIGINAL STUDIOFLOW SCENE & MEDIA PLAYBACK WORKFLOW

**Project:** The Paranormal Initiative — StudioFlow  
**Priority:** CRITICAL — EXISTING FUNCTIONALITY REGRESSION  
**Assigned Agent:** Codex 5.6 / Luna  
**Reference:** Original StudioFlow implementation and historical directives  
**Production:** No deployment until validated and authorized

### 1. MANDATORY INSTRUCTIONS

Before modifying any source code, read:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

And:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

Follow all mandatory referenced documentation.

Next, review the original StudioFlow requirements and completed implementation records.

**Do not begin by redesigning or replacing the existing scene system.**

This functionality was previously implemented and working.

Your assignment is to identify what changed and restore the approved behavior.

---

## 2. HISTORICAL IMPLEMENTATION REVIEW

Search the project documentation, searchable archives, and Git history for the original Intro/Outro implementation.

Specifically locate:

- Original Intro/Outro playback directives.
- TPI-STUDIOFLOW-020 and its addenda, where applicable.
- Original scene switching implementation.
- Original media playback handlers.
- Scene restoration behavior.
- Previous working implementation by Codex 5.6 / Sol.
- Changes introduced during Directive 027.

Use the historical implementation as the reference.

Do not assume the current implementation is correct simply because recent automated tests passed.

If the archival RAG system is available, search it for these requirements and report the documents or records used.

Do not claim archival verification without actually performing it.

---

## 3. ORIGINAL INTRO VIDEO BEHAVIOR

The **Intro Video** control in My Scenes must operate as follows:

**First Click**

- Retrieve the assigned Intro Video from Video Clips.
- Start playback at 00:00.
- Display the video on the production stage.
- Play the corresponding video audio.
- Preserve the existing guest connections.

**Second Click**

- Stop the Intro Video immediately.
- Stop its audio immediately.
- Reset playback to 00:00.
- Restore the appropriate previous production scene.

**Every Subsequent Playback**

- Always start at 00:00.
- Never resume from a previous stopping position.
- Never unintentionally loop.

**Natural Completion**

- Stop the completed Intro Video.
- Reset the playback controls.
- Restore the appropriate production scene according to the original implementation.

The Intro Video must not unintentionally activate the After Intro control.

---

## 4. ORIGINAL OUTRO VIDEO BEHAVIOR

The **Outro Video** control in My Scenes must operate as follows:

**First Click**

- Retrieve the assigned Outro Video from Video Clips.
- Start playback at 00:00.
- Display the video on the production stage.
- Play its corresponding audio.

**Second Click**

- Stop the Outro Video immediately.
- Stop its audio immediately.
- Reset playback to 00:00.
- Restore the appropriate production scene.

**Every Subsequent Playback**

- Always begin at 00:00.
- Never resume from a previous position.
- Never unintentionally loop.

**Natural Completion**

- Stop playback.
- Reset the controls.
- Restore the appropriate scene.

Stopping an Outro Video must not automatically stop the podcast recording or livestream.

These are separate production operations.

---

## 5. INTRO AND OUTRO MUTUAL EXCLUSION

Intro Video and Outro Video must not play simultaneously.

Activating one while the other is playing must follow the approved existing scene-switching behavior.

Prevent:

- Overlapping video playback.
- Overlapping video audio.
- Duplicate playback instances.
- Incorrect scene restoration.
- Stale playback state.
- Unintended automatic transitions.

---

## 6. AFTER INTRO MUST REMAIN INDEPENDENT

The user reports that Intro Video and After Intro appear incorrectly connected.

Investigate the original After Intro implementation.

Determine its intended purpose from historical documentation and working code.

Verify that it does not incorrectly share the Intro Video's:

- Playback handler.
- Scene identifier.
- Media assignment.
- State variable.
- Activation callback.

**Do not invent new behavior for After Intro.**

Restore its previously approved behavior.

If historical documentation does not establish a particular behavior, report that uncertainty rather than guessing.

---

## 7. BACKGROUND MUSIC CONNECTION

The Background Music control must use the existing Background Music section.

Preserve:

- Assigned music selection.
- Playback behavior.
- Looping configuration.
- Volume.
- Program audio routing.
- Monitoring audio routing.
- Independent control behavior.

Do not build another audio player.

Do not connect Background Music to Intro Video or After Intro unless a previously approved explicit configuration requires that relationship.

---

## 8. PRESERVE EXISTING VIDEO CLIPS SYSTEM

The Video Clips section remains the source for assigned Intro and Outro videos.

My Scenes must use those existing assignments and the approved playback architecture.

Preserve the authenticated media URL resolution introduced in Directive 027.

Do not recreate media files, duplicate media records, or introduce competing playback mechanisms.

---

## 9. IDENTIFY THE ACTUAL REGRESSION

Compare the current source against the last verified working implementation.

Inspect relevant Git commits, including:

- The original working scene implementation.
- Subsequent scene and media changes.
- Directive 027 changes.
- Current production source.

Determine:

1. Which code previously controlled Intro playback?
2. Which code previously controlled Outro playback?
3. Which code restored the previous scene?
4. Which code prevented overlapping playback?
5. Which change altered this behavior?
6. Why did existing automated tests fail to detect the regression?

Do not claim a root cause without supporting code evidence.

---

## 10. REQUIRED REGRESSION TESTS

Add or update tests covering the original behavior.

Verify:

1. Intro starts on first click.
2. Intro stops on second click.
3. Intro always restarts at 00:00.
4. Intro audio stops with video.
5. Outro starts on first click.
6. Outro stops on second click.
7. Outro always restarts at 00:00.
8. Outro audio stops with video.
9. Intro and Outro cannot overlap.
10. Previous scenes restore correctly.
11. Natural completion resets controls.
12. After Intro remains independent.
13. Background Music uses its intended media assignment.
14. Guest connections remain unaffected.
15. Recording and livestream controls remain independent.
16. Studio switching preserves correct media assignments.
17. Reloading restores the correct studio configuration.
18. Existing Video Clips playback remains functional.

Use actual browser interaction tests in addition to unit tests.

Do not count a successful media URL request as proof that the scene workflow works.

---

## 11. STRICT CHANGE CONTROL

This is a regression repair.

Do not:

- Redesign My Scenes.
- Replace the scene architecture.
- Create new media storage.
- Modify Voice FX.
- Modify unrelated WebRTC functionality.
- Modify SMART Pads.
- Reset studio configurations.
- Delete or replace user media.
- Change unrelated playback controls.

Make the smallest necessary correction.

Preserve all previously working functionality.

---

## 12. PRODUCTION SAFETY

Follow `AGENTS.md` and the StudioFlow Source-to-Live Workflow.

Validate locally before considering deployment.

Do not directly edit production files.

Do not modify production D1 or R2 data.

Do not deploy until the required checks and authorization are satisfied.

---

## 13. COMPLETION REPORT

Report:

1. Historical directives reviewed.
2. Archival records consulted.
3. Last known working implementation.
4. Exact regression identified.
5. Git commit or code change responsible, if established.
6. Files modified.
7. Playback behavior restored.
8. After Intro independence verification.
9. Background Music verification.
10. Browser test results.
11. Regression test results.
12. Source commit.
13. Production deployment status.
14. Remaining limitations.

If the original behavior cannot be established from available evidence, stop and report the unresolved details before changing that behavior.

---

## FINAL INSTRUCTION

**This is not a request to create a new StudioFlow scene system.**

The original workflow was already designed, implemented, and approved.

Your responsibility is to recover that implementation, identify what disrupted it, and restore it without breaking other features.

The original requirements take precedence over assumptions introduced during recent repairs.

**END DIRECTIVE — TPI-STUDIOFLOW-028**
