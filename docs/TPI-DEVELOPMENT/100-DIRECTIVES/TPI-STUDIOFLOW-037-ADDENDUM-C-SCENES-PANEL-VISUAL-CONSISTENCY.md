# TPI-STUDIOFLOW-037 — ADDENDUM C — SCENES PANEL VISUAL CONSISTENCY & DRAG INTERACTION REPAIR

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-25 11:44.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-24-TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN.md](../300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN.md), [2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md](../300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-037
## ADDENDUM C — SCENES PANEL VISUAL CONSISTENCY & DRAG INTERACTION REPAIR

**Priority:** HIGH  
**Status:** OWNER ACCEPTANCE FAILED — CORRECTION REQUIRED  
**Scope:** Existing Scenes panel only

### 0. MANDATORY GOVERNING DOCUMENTATION

Read completely before modifying code:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

Review Directive 037, Addenda A and B, the latest completion record, and the current source implementation.

The previously reported deployment is:

**Production Worker:** `1c752f3f-8af3-461f-8082-3dd8a447fd3d`

**Source commit:** `322b132`

These identifiers are provided for investigation and comparison, not as authorization to overwrite newer changes.

### 1. OWNER-REPORTED PROBLEMS

The owner has confirmed that the deployed Scenes panel still has the following issues:

1. Production button labels wrap inconsistently.
2. Intro Video and Outro Video do not present their labels consistently.
3. Countdown Timer is unnecessarily truncated.
4. Some scene names wrap awkwardly.
5. Background Music buttons do not visually indicate their assigned SmartPad track color.
6. Background Music buttons lack consistent drag handles.
7. Drag-and-drop does not visibly reposition surrounding buttons during movement, despite the previous implementation report.
8. The drag destination is not sufficiently obvious to the owner.

These issues must be corrected before Directive 037 is considered owner-accepted.

### 2. BUTTON LABELS

Preserve the existing uniform button dimensions.

Improve internal layout so standard production labels fit consistently.

Required primary labels:

- Intro Video
- Countdown Timer
- Background Music
- Outro Video

Scene buttons must retain their actual scene names.

Use consistent secondary labels for production state or assignment.

Do not allow unnecessary wrapping of standard labels.

Long custom names may be truncated with a tooltip or accessible full-name display.

Do not increase individual button heights to accommodate longer text.

### 3. BACKGROUND MUSIC COLOR INDICATORS

Background Music buttons must reflect the color of their assigned SmartPad track where that color exists in the current data model.

Requirements:

1. Read the selected track's existing color.
2. Apply a subtle corresponding color treatment to the Background Music button.
3. Preserve StudioFlow's overall button styling.
4. Keep the track's full name accessible through configuration.
5. Use a neutral appearance when no track is assigned.
6. Clearly distinguish assigned, selected, and actively playing states.
7. Preserve existing track assignments and playback behavior.

Do not create a second color-assignment system.

Do not infer a color from a track name.

If the existing SmartPad color cannot be resolved, use a neutral fallback and document why.

### 4. CONSISTENT DRAG HANDLES

Every movable production item must expose the same drag-handle interaction.

This includes Background Music.

The handle must:

- Be visible.
- Be consistently positioned.
- Support pointer dragging.
- Not trigger playback.
- Not open a context menu.
- Not alter the item's underlying media assignment.

Dragging a music item must not silently change its associated scene or playback lifecycle.

### 5. REACTIVE DRAG-AND-DROP REPAIR

The previous Addendum B implementation was reported complete, but the owner cannot observe the required reactive movement.

Investigate the existing implementation before changing it.

Determine whether the problem involves:

- Native browser drag previews.
- Placeholder rendering.
- Incorrect drag-over state updates.
- CSS layout constraints.
- Animation not being applied.
- Event handling.
- Browser-specific behavior.
- Deployment or stale asset loading.

Do not assume the previous implementation is correct merely because automated tests passed.

### Required visible behavior

When dragging Intro Video downward:

1. Intro Video visibly enters a dragging state.
2. The surrounding buttons shift to create space.
3. The insertion location is clearly highlighted.
4. The gap follows the pointer as the intended position changes.
5. Releasing the item places it at that location.
6. The surrounding buttons settle smoothly.
7. Escape cancels the operation.
8. Auto-scroll works when the list exceeds the panel height.

The movement must be observable **before the item is dropped**.

A final reorder after mouse release is not sufficient.

### 6. REAL BROWSER ACCEPTANCE

Test the actual interaction in Firefox using the deployed interface.

A valid test must perform a genuine pointer drag across multiple positions and verify the intermediate visual states.

Do not rely exclusively on synthetic drag events or final-order assertions.

Capture screenshots or a short visual recording demonstrating:

- Initial button positions.
- Dragging in progress.
- Surrounding buttons displaced.
- Highlighted insertion position.
- Completed drop.

Also verify the behavior in other supported browsers where available.

If the required behavior cannot be reproduced, do not report the requirement as passed.

### 7. PRESERVE EXISTING SYSTEMS

Do not modify:

- Intro/Outro automation.
- Countdown animation engines.
- Background Music playback.
- Recording.
- Livestreaming.
- Media storage.
- Production compositor.
- Existing Studio configurations.

Preserve Directives 028–036 and the completed portions of Directive 037.

### 8. VALIDATION

Verify:

- Uniform button dimensions.
- Consistent label presentation.
- Correct music color association.
- Drag handles on every movable item.
- Visible reactive repositioning.
- Correct drop location.
- Escape cancellation.
- Auto-scroll.
- Per-Studio order persistence.
- No accidental playback during dragging.
- No DOM mutation regression.
- No audio or media playback regression.

Run the relevant existing regression suites and release-safety checks.

### 9. DOCUMENTATION AND DEPLOYMENT

Follow the mandatory source-to-live workflow.

Update the Directive 037 completion documentation with the owner-reported issues, root causes, repairs, and new verification results.

Do not erase the historical completion report.

Record source, application, and documentation commits.

If deployed, record the new production Worker identifier and rollback identifier.

Do not report owner acceptance until the owner confirms the interface behaves correctly.

### FINAL REQUIREMENT

**The Scenes panel must not merely save a new order. It must visibly show the creator where an item is going while it is being moved.**

**END OF ADDENDUM C**
