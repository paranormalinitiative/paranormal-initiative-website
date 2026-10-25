# TPI-STUDIOFLOW-034 — Emergency StudioFlow Interface Recovery

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 11:20.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-24-TPI-STUDIOFLOW-034-DOM-MUTATION-REPAIR.md](../300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-034-DOM-MUTATION-REPAIR.md)
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
## TPI-STUDIOFLOW-034
### EMERGENCY STUDIOFLOW ASSET INTERFACE RECOVERY

**PRIORITY: CRITICAL**

**ASSIGNED TO:** FreeBuff

**OWNER AUTHORIZATION:** Full investigation, development, testing, commit, push, and guarded deployment.

### 1. IMMEDIATE OBJECTIVE

The owner has reviewed the production StudioFlow interface and found significant visual and structural defects.

The current interface does not meet the approved StudioFlow design requirements.

The purpose of this directive is to restore a clean, professional, unified media-management interface.

**Do not add new features during this directive.**

Repair the existing StudioFlow interface first.

### 2. PRODUCTION IS THE VISUAL SOURCE OF TRUTH

The owner has supplied four screenshots of the current StudioFlow interface.

Treat these screenshots as evidence of defects.

Inspect the actual deployed interface using the same narrow sidebar conditions shown in the screenshots.

Do not assume the interface is correct because automated tests pass.

Use the production layout as the acceptance target, but make and validate changes in an isolated environment before deploying.

### 3. VIDEO CLIPS — COMPLETE VISUAL REPAIR

Retain all nine video slots:

1. Intro
2. Outro
3. Thank You
4. Be Right Back
5. Video 5
6. Video 6
7. Video 7
8. Video 8
9. Video 9

Repair the layout so:

- Cards do not overlap.
- Preview areas remain inside their boundaries.
- Titles are readable.
- Filenames do not collide with neighboring cards.
- Empty slots have clean empty states.
- Assigned slots display recognizable video thumbnails.
- Actions are compact and accessible.
- Intro and Outro retain their protected status.

Use a responsive grid appropriate to the available sidebar width.

**Do not force three columns when the sidebar cannot accommodate readable cards.**

At narrow widths, use two columns or another layout that preserves usability.

### 4. VIDEO TIMERS — UNIFY THE INTERFACE

The current interface contains duplicated timer controls.

Consolidate these into one coherent timer-management section.

Retain:

- 10-second timer.
- 20-second timer.
- 30-second timer.
- 60-second timer.
- Custom Timer 1.
- Custom Timer 2.

Preserve the existing timer engine and scene integration.

Do not create competing timer states.

Remove redundant controls only after confirming that their functionality is available in the unified interface.

Verify timer selection, start, stop, reset, and countdown display.

### 5. SOUNDS — REMOVE DUPLICATION

The current interface contains two Sounds sections.

This is incorrect.

Create one unified Sounds section containing:

- Existing volume control.
- Existing Stop Sound control.
- Existing upload functionality.
- Existing sound assets, including Heartbeat Fast.
- Nine configurable sound-effect slots.

Do not duplicate volume controls, upload systems, or playback engines.

Use one coherent interface.

### 6. BACKGROUND MUSIC — REBUILD THE LAYOUT

Retain nine configurable music slots.

Preserve:

- Volume control.
- Stop Music control.
- Upload functionality.
- Existing assigned music.
- Independent playback behavior.

Redesign the cards so titles, media status, and controls remain readable.

Do not use a three-column layout if it produces truncated, unusable cards.

### 7. MOTION BACKGROUNDS

Preserve the existing Backgrounds section and all working motion-background functionality.

Do not remove or replace existing assets.

Confirm backgrounds remain selectable and persist correctly.

### 8. RESPONSIVE SIDEBAR

The sidebar must remain usable at the owner's actual working width.

Test multiple sidebar widths.

Verify:

- No horizontal overflow.
- No overlapping cards.
- No clipped action buttons.
- No unreadable labels.
- No competing sections.
- No controls extending beyond their containers.

Use screenshots to verify the final appearance.

### 9. PROTECT EXISTING MEDIA

Do not delete, overwrite, or migrate the owner's existing media without explicit authorization.

Preserve:

- Intro and Outro videos.
- Existing video assignments.
- Sound assets.
- Background music.
- Motion backgrounds.
- Studio configurations.
- Crossroads of the Unknown.

This is an interface-recovery directive, not a data-reset directive.

### 10. VISUAL ACCEPTANCE IS MANDATORY

Run actual browser tests in Firefox Developer Edition and Chromium.

Capture screenshots of:

- Video Clips.
- Video Timers.
- Sounds.
- Background Music.
- Backgrounds.

Compare the corrected interface against the defects visible in the owner's screenshots.

Do not mark this directive complete until the visual defects have been resolved.

### 11. TESTING AND DEPLOYMENT

Use the existing verified release workflow.

Complete relevant functional and visual tests.

Commit and push verified changes.

Deploy through the guarded Cloudflare workflow.

Confirm the new production Worker version.

Perform non-destructive production acceptance.

If the release introduces a critical regression, roll back to the previously verified Worker version.

### 12. FINAL REPORT

Provide:

1. Video Clips corrections.
2. Timer interface corrections.
3. Sounds consolidation.
4. Background Music redesign.
5. Background preservation.
6. Screenshots of the corrected interface.
7. Firefox results.
8. Chromium results.
9. Git commit SHA.
10. Push confirmation.
11. Cloudflare deployment version.
12. Live visual acceptance results.
13. Working-tree status.

**Do not declare success based solely on automated test counts.**

The actual interface must be visually correct.

### FINAL OBJECTIVE

Restore StudioFlow to a professional, functional, unified creator studio.

**END DIRECTIVE — TPI-STUDIOFLOW-034**
