# TPI-STUDIOFLOW-019 — INTRO AND OUTRO VIDEO — FULL-STAGE DISPLAY CORRECTION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 13:39.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** [TPI-STUDIOFLOW-019-INTRO-OUTRO-STAGE.md](TPI-STUDIOFLOW-019-INTRO-OUTRO-STAGE.md)

---

# TPI-STUDIOFLOW-019
## INTRO AND OUTRO VIDEO — FULL-STAGE DISPLAY CORRECTION

PROJECT: The Paranormal Initiative — StudioFlow
STUDIO: Crossroads of the Unknown
PRIORITY: HIGH
ENVIRONMENT: LOCAL DEVELOPMENT ONLY
STATUS: AUTHORIZED FOR INVESTIGATION AND LOCAL CORRECTION

---

## OBJECTIVE

Correct StudioFlow's intro and outro video rendering so that properly formatted 16:9 videos fill the entire 16:9 production stage.

The correction must apply universally to ALL Studios, not just Crossroads of the Unknown.

The owner has confirmed that the Crossroads of the Unknown intro video displays dark vertical bands on BOTH sides of the production stage.

The video was exported using the following specifications:

- Format: MP4
- Codec: H.264
- Resolution: 1920 × 1080
- Aspect Ratio: 16:9
- Frame Rate: 30 FPS
- Bitrate: 10,000 kbps
- Quality: High
- Color Space: SDR Rec.709

A correctly formatted 1920 × 1080 video should fill the entire 16:9 production stage without artificial borders, unnecessary padding, distortion, or cropping.

Do not assume the source video is responsible.

Investigate the actual rendering implementation and establish the root cause before modifying code.

---

## PHASE 1 — INVESTIGATE CURRENT VIDEO RENDERING

Identify and document:

1. How StudioFlow renders uploaded intro videos.
2. How StudioFlow renders uploaded outro videos.
3. How the production stage determines its dimensions.
4. Whether videos use CSS object-fit, canvas rendering, or another method.
5. Whether video containers introduce unnecessary padding or margins.
6. Whether scene layouts constrain video dimensions.
7. Whether uploaded video dimensions are correctly detected.
8. Whether intro/outro scenes use different rendering rules from regular scenes.
9. Whether the preview and production rendering paths use the same sizing calculations.
10. Whether any parent container limits the video to less than the full stage width.

Inspect the actual DOM structure, computed styles, video dimensions, and stage container dimensions.

Determine the exact cause before implementing a correction.

---

## PHASE 2 — VERIFY SOURCE VIDEO DIMENSIONS

Inspect the actual uploaded Crossroads of the Unknown intro video.

Confirm:

- Encoded width and height.
- Display aspect ratio.
- Pixel aspect ratio, if available.
- Whether black borders are embedded in the video.
- Whether the visible image extends to the encoded frame boundaries.

Compare the source video against the rendered StudioFlow preview.

IMPORTANT:

The export settings indicate 1920 × 1080, but this alone does not prove that the video contains no embedded borders.

If the source contains embedded black borders, report this separately.

Do not crop the video to conceal embedded borders.

Do not modify or re-encode the original media.

---

## PHASE 3 — CORRECT FULL-STAGE VIDEO DISPLAY

For videos matching the stage's 16:9 aspect ratio:

REQUIRED:

- Fill the complete stage width.
- Fill the complete stage height.
- No StudioFlow-generated black borders.
- No unnecessary letterboxing.
- No unnecessary pillarboxing.
- No unwanted padding.
- No unwanted margins.
- No distortion.
- No cropping of correctly formatted 16:9 content.

A 1920 × 1080 video must display correctly within a 1920 × 1080 production stage.

The browser preview may scale proportionally according to available screen space.

However, the entire production frame must remain visible.

Do not simply apply object-fit: cover to conceal an underlying layout problem.

Correct the actual sizing or container issue.

---

## PHASE 4 — INTRO AND OUTRO SCENE BEHAVIOR

Intro and outro scenes must use full-stage video rendering.

When an intro scene is selected:

1. The video occupies the complete production stage.
2. Scene layout elements do not reduce video dimensions.
3. Guest placeholders do not interfere with video rendering.
4. The video retains its original aspect ratio.
5. The video remains correctly positioned.
6. No artificial side borders appear.

Apply identical requirements to outro scenes.

The correction must work regardless of which Studio is active.

---

## PHASE 5 — SUPPORT DIFFERENT VIDEO ASPECT RATIOS

StudioFlow must preserve video proportions.

16:9 VIDEOS:
Fill the 16:9 stage without cropping or distortion.

4:3 VIDEOS:
Preserve the original aspect ratio with appropriate framing.

9:16 VERTICAL VIDEOS:
Preserve the original aspect ratio without stretching.

For mismatched aspect ratios, preserve or provide an appropriate fit/fill behavior.

Do not silently crop important content.

Do not stretch videos to force them into a 16:9 frame.

---

## PHASE 6 — PRESERVE VIDEO PLAYBACK INTEGRITY

The correction must not interfere with:

- Video playback.
- Audio synchronization.
- Intro transitions.
- Outro transitions.
- Scene switching.
- Playback controls.
- Existing uploaded media.
- Studio saving.
- Studio restoration.
- Guest video feeds.
- Production stage rendering.
- Future recording output.
- Future livestream output.

Do not modify existing media files.

Do not re-encode uploaded videos.

---

## PHASE 7 — BROWSER AND PRODUCTION-STAGE VERIFICATION

Use the Crossroads of the Unknown intro as the primary reference.

Verify:

1. The video fills the entire stage horizontally.
2. The video fills the entire stage vertically.
3. The video retains its original proportions.
4. No StudioFlow-generated vertical borders appear.
5. No StudioFlow-generated horizontal borders appear.
6. Full-screen preview displays correctly.
7. Intro playback functions correctly.
8. Outro playback functions correctly.
9. Switching between intro and regular scenes works.
10. Switching between regular scenes and outro works.
11. Reloading StudioFlow preserves correct rendering.
12. Switching between Studios preserves correct rendering.
13. Other Studios remain unaffected.
14. Existing media assets remain unchanged.

IMPORTANT:

Verify BOTH:

A. The browser preview rendering.

B. The actual production-stage rendering path used for recording and livestreaming.

Do not assume that correcting the browser preview automatically corrects the production output.

If recording or livestream rendering cannot be verified without activating those features, report that limitation.

Do not activate recording or livestreaming.

---

## PHASE 8 — REGRESSION TESTING

Run relevant StudioFlow regression tests.

Include verification of:

- Studio switching.
- Automatic saving.
- Last-active Studio restoration.
- Scene isolation.
- Media persistence.
- Production-lock protections.
- Existing guest invitation functionality.

Run JavaScript syntax checks.

Run git diff --check.

Do not introduce unrelated changes.

---

## PHASE 9 — DEVELOPMENT SAFETY REQUIREMENTS

AUTHORIZED:

- Investigate StudioFlow rendering.
- Inspect local media metadata.
- Modify development rendering code.
- Add focused regression tests.
- Run local browser verification.
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

Do not interfere with the temporary mobile guest testing tunnel.

Do not restart unrelated development services.

If a required restart could interrupt an active guest testing session, stop and request authorization.

---

## PHASE 10 — DOCUMENTATION AND COMPLETION REPORT

Create or update the appropriate development documentation.

DIRECTIVE:
TPI-STUDIOFLOW-019

TITLE:
Intro and Outro Video — Full-Stage Display Correction

Report:

1. Exact root cause.
2. Whether the source video contains embedded borders.
3. Files modified.
4. Rendering correction implemented.
5. Intro video verification results.
6. Outro video verification results.
7. Stage aspect-ratio verification.
8. Browser preview verification.
9. Production-stage rendering verification.
10. Regression test results.
11. Remaining limitations.
12. Final acceptance status.

Update the directive index and current development status.

---

## ACCEPTANCE CRITERIA

TPI-STUDIOFLOW-019 may be marked COMPLETE only when:

- Properly formatted 1920 × 1080 intro videos fill the entire 16:9 production stage.
- Properly formatted 1920 × 1080 outro videos fill the entire 16:9 production stage.
- No StudioFlow-generated side borders remain.
- No unnecessary padding or margins remain.
- Video proportions remain correct.
- Video playback remains functional.
- Scene switching remains functional.
- Existing Studios remain unaffected.
- Relevant regression tests pass.
- Live browser verification confirms the correction.

If the source video contains embedded borders, distinguish that issue from StudioFlow rendering and report the result accurately.

If production-stage output cannot be verified without recording or livestreaming, mark that verification as pending.

Do not claim full acceptance without the required evidence.

---

## FINAL INSTRUCTION

Investigate first.

Identify the actual source of the vertical borders.

Implement the smallest reliable correction.

Verify the results.

Preserve all existing StudioFlow functionality.

DO NOT DEPLOY TO PRODUCTION.

END DIRECTIVE — TPI-STUDIOFLOW-019
