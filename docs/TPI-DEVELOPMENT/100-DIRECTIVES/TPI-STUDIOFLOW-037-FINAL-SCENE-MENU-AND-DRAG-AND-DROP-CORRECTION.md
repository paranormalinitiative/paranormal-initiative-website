# TPI-STUDIOFLOW-037 — Final Scene Menu and Drag-and-Drop Correction

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-25 12:30.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-24-TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN.md](../300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN.md), [2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md](../300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md)
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
## TPI-STUDIOFLOW-037 — SCENE MANAGEMENT CORRECTION

**Project:** StudioFlow  
**Priority:** HIGH — Existing Production Defect  
**Directive:** 037 — Continuing Recovery  
**Status:** OWNER ACCEPTANCE FAILED  
**Classification:** Integrated UI Correction and Production Verification

---

# 1. OBJECTIVE

Correct the existing StudioFlow Scenes panel so that:

1. All context menus open completely and remain visible.
2. Move Up and Move Down commands are eliminated.
3. Drag-and-drop is the exclusive method for manually reordering production items.
4. All scene-management actions remain functional.
5. Scene ordering and configuration persist independently for each Studio.
6. The corrected functionality is verified in the actual production application.

**This is a continuation of Directive 037, not a new directive or addendum.**

Do not introduce unrelated features or redesign the application.

---

# 2. MANDATORY PROJECT DOCUMENTATION

Before making changes, read these files completely:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

Then inventory and review all applicable Markdown documentation, including:

- Directive 037 and all its addenda.
- Current development status.
- Directive index.
- StudioFlow architecture.
- Scene and workspace configuration.
- Playback contract.
- Testing and verification procedures.
- Development agent handoff.
- Previous completion and recovery records.

Follow the established source-to-production workflow.

Do not rely on previous completion claims without verifying their accuracy.

---

# 3. CONFIRMED PRODUCTION FAILURE

The owner tested the live application:

`https://paranormalinitiative.com/studio/`

Studio:

**Crossroads of the Unknown**

The three-dot context menu now opens, but portions of the menu are clipped outside the left edge of the Scenes panel.

The current implementation does not satisfy the visibility requirements.

The previous recovery report identified an earlier positioning defect involving:

`right: -204px`

and an ancestor container using:

`overflow: hidden`

The latest positioning adjustment did not fully resolve the problem.

### Required correction

Do not apply another arbitrary CSS offset.

Investigate the existing menu architecture and implement a reliable positioning solution.

A portal-based menu rendered outside clipping containers, with viewport-aware positioning, is an acceptable approach if appropriate for the existing application.

The implementation must account for:

- Left and right viewport boundaries.
- Top and bottom viewport boundaries.
- Parent-container clipping.
- Menu width and height.
- Scrolling.
- Window resizing.
- Stacking contexts.
- Pointer interaction.
- Keyboard dismissal.

Every menu option must remain fully visible and clickable.

The menu must be positioned relative to the correct three-dot button.

Clicking outside the menu or pressing Escape must close it.

Opening a menu must not activate the underlying production item.

---

# 4. REMOVE MOVE UP AND MOVE DOWN

Remove these commands from every Scenes panel context menu:

**Move Up**

**Move Down**

Remove associated menu-only handlers and obsolete code where safe.

Do not remove or damage the underlying scene-order persistence system.

Do not replace these commands with another manual ordering menu.

### Design rule

**Drag handles control ordering.**

**Three-dot menus control actions.**

This distinction must remain consistent throughout the Scenes panel.

---

# 5. DRAG-AND-DROP REQUIREMENTS

Every reorderable production item must have a clearly identifiable drag handle.

This includes:

- Intro Video.
- Outro Video.
- Production scenes.
- Background Music shortcuts.
- Countdown Timer shortcuts.
- Video Clip shortcuts.
- Other reorderable production items supported by the existing system.

### Required behavior

When the creator begins dragging an item:

1. The selected item visibly enters a dragging state.
2. Other items react as the dragged item moves.
3. A clear insertion position is displayed.
4. The creator can move the item upward or downward.
5. The creator can drop it at the desired position.
6. The new order is reflected immediately.
7. The new order is saved automatically.
8. The arrangement survives a browser refresh.
9. Switching to another Studio does not alter the original Studio's order.
10. Returning to the original Studio restores its saved arrangement.

### Important

Do not implement a drag system that only changes the order after dropping without showing the intended insertion position.

The user must be able to see where the item will land.

Drag handles must not interfere with:

- Three-dot menus.
- Playback buttons.
- Scene activation.
- Rename actions.
- Removal actions.
- Scrolling the Scenes panel.

Support pointer and keyboard interaction appropriately, preserving accessible controls.

---

# 6. SIMPLIFY CONTEXT MENUS

Menus must display actions appropriate to the selected item.

Do not present irrelevant actions.

### Production scenes

Expected actions:

- Preview, where supported.
- Rename Scene.
- Remove from Scenes.

Preserve other necessary scene-specific configuration actions already supported by the application.

### Intro Video

Expected actions:

- Preview.
- Configure Opening.
- Skip Opening.
- Rename, where supported.
- Remove from Scenes.

### Outro Video

Expected actions:

- Preview.
- Configure Closing.
- Rename, where supported.
- Remove from Scenes.

### Background Music

Expected actions:

- Preview, where supported.
- Configure Music.
- Remove from Scenes.

### Countdown Timer

Expected actions:

- Preview, where supported.
- Configure Timer.
- Remove from Scenes.

### Video Clips

Expected actions:

- Preview, where supported.
- Configure Clip.
- Remove from Scenes.

These examples establish the expected separation of responsibilities. Preserve genuinely necessary existing actions, but eliminate redundant ordering commands.

Do not introduce placeholder menu items.

Every displayed action must perform its intended function.

---

# 7. PRESERVE SCENE AND MEDIA BEHAVIOR

Do not confuse production scenes with production media.

### Production scenes

These represent configurable camera, guest, or presentation layouts.

They must retain:

- Stable identifiers.
- Editable names.
- Layout configuration.
- Per-Studio persistence.

### Production media

These include:

- Intro Video.
- Outro Video.
- Background Music.
- Countdown Timers.
- Video Clips.

They are production items and must retain their existing playback behavior.

### Playback regression protection

An individual Intro Video preview must stop without automatically starting Background Music.

Play Sequence must remain independently controllable through Stop Sequence.

Do not modify working broadcast automation unnecessarily.

---

# 8. REMOVE FROM SCENES

The Remove from Scenes action must:

1. Remove the selected shortcut or scene from the current production arrangement.
2. Update the visible panel immediately.
3. Persist the change.
4. Remain removed after refresh.
5. Remain removed after switching Studios.
6. Preserve uploaded media and unrelated production assets.
7. Avoid recreating removed items during configuration normalization.

Do not delete the underlying media asset when removing its production shortcut.

Use disposable test Studios when validating destructive or persistent actions.

Do not modify the owner's Crossroads of the Unknown configuration during testing.

---

# 9. REQUIRED LOCAL TESTING

Start the authoritative local StudioFlow application.

Source:

`/Users/toddknipple/Documents/StudioFlow/web`

Open the running application in Firefox.

Test the actual rendered interface using genuine pointer interactions.

### Context-menu tests

For every supported production-item type:

- Open the three-dot menu.
- Verify the complete menu is visible.
- Verify no menu content is clipped.
- Verify Move Up is absent.
- Verify Move Down is absent.
- Verify each remaining action is clickable.
- Verify outside-click dismissal.
- Verify Escape dismissal.

### Drag-and-drop tests

Perform:

**Drag → Visible Insertion → Drop → Save → Refresh → Confirm Order**

Test upward and downward movement.

Test moving an item across several positions.

Test the first and last positions.

Test drag cancellation.

Test Studio switching.

### Persistence tests

Verify that changes belong only to the selected Studio.

### Regression tests

Run all applicable existing tests for:

- Scenes.
- Media playback.
- Intro/Outro.
- Background Music.
- Countdown Timers.
- Workspace switching.
- Configuration persistence.
- Mutation protection.
- Recording and Storage.

Do not treat a passing automated test as proof of visible correctness.

---

# 10. CORRECT THE VISIBILITY TESTS

The previous automated tests produced false passes because they did not adequately verify what the user could see.

Correct this weakness.

### Required assertions

The test must verify:

1. The menu is rendered.
2. The menu is visibly displayed.
3. Its full rectangle is inside the usable viewport.
4. No clipping ancestor obscures its contents.
5. Every menu action is visible.
6. Every action can receive real pointer interaction.
7. The selected action produces the expected result.

Use browser-level hit testing and actual interaction where appropriate.

Include screenshots of the open menu.

A menu that exists in the DOM but is visually clipped **must fail the test**.

A menu whose text is cut off **must fail the test**.

A menu that opens but cannot be clicked **must fail the test**.

A drag operation without visible insertion feedback **must fail the drag-and-drop acceptance test**.

---

# 11. PRODUCTION DEPLOYMENT AND VERIFICATION

After successful local testing, follow the documented guarded deployment workflow.

Production application:

`https://paranormalinitiative.com/studio/`

Previously reported Worker:

`871c0ae7-33c5-46ae-b635-19ec3100c989`

Previously reported JavaScript:

`index-BfmRc0ua.js`

Previously reported CSS:

`index-DB0QL1ns.css`

These identifiers are references for investigating the currently deployed version.

Verify the new deployed application actually contains the corrections.

### Required live testing

Open the production website in Firefox.

Using a disposable Studio, demonstrate:

1. A fully visible context menu.
2. All menu options readable.
3. Move Up and Move Down absent.
4. Rename Scene functioning.
5. Remove from Scenes functioning.
6. Dragging an item to a different position.
7. Visible insertion feedback.
8. Order persistence after refresh.
9. Correct isolation between Studios.
10. No regression in media playback.

Capture evidence from the actual production application.

Do not claim live verification if the production application was not accessed.

Do not initiate an unauthorized public livestream.

---

# 12. PERMANENT EVIDENCE

Do not leave verification screenshots exclusively in temporary macOS directories such as:

`/var/folders/.../T/`

Copy relevant evidence into an appropriate permanent project documentation location.

Reference the evidence from the completion record.

Preserve:

- Context-menu screenshot.
- Dragging screenshot.
- Insertion-position screenshot.
- Final reordered arrangement.
- Persistence verification.
- Production build identification.

Ensure that evidence does not expose credentials, private tokens, or sensitive owner information.

---

# 13. MARKDOWN KNOWLEDGE-BASE SYNCHRONIZATION

After implementation and verification:

1. Review all applicable Markdown files.
2. Update every affected current-state document.
3. Preserve historical completion records.
4. Document the context-menu architecture.
5. Document the drag-and-drop ordering contract.
6. Document per-Studio persistence.
7. Update verification requirements.
8. Update Directive 037's actual status.
9. Update the directive index.
10. Update the development agent handoff.
11. Commit and push the changes.

Produce a Markdown audit identifying which files were reviewed, updated, or left unchanged.

The documentation must describe the implementation that actually exists.

Do not document unverified behavior as completed.

---

# 14. REQUIRED COMPLETION REPORT

Provide the following information.

### A. Root cause

Explain why the context menu remained clipped after the previous correction.

### B. Architecture correction

Explain how menu positioning now avoids clipping.

### C. Ordering system

Explain how drag-and-drop works and persists.

### D. Removed functionality

Confirm Move Up and Move Down have been removed from all relevant menus.

### E. Local verification

Provide browser-level results and evidence.

### F. Production verification

Provide browser-level results and evidence.

### G. Regression testing

Report all relevant test results and failures.

### H. Documentation synchronization

List the Markdown files reviewed and updated.

### I. Release identifiers

Provide source commit, application commit, documentation commit, production Worker identifier, and rollback identifier.

### J. Remaining limitations

Disclose anything not tested or not functioning.

---

# 15. ACCEPTANCE STANDARD

The directive is not complete merely because code was committed or deployed.

The implementation must demonstrate:

**Open Menu → Entire Menu Visible → Select Action → Correct Result**

And:

**Drag Item → Visible Reordering → Drop → Automatic Save → Refresh → Same Arrangement**

Both workflows must function in the actual production application.

The agent may report:

**DEPLOYED AND VISUALLY VERIFIED — OWNER ACCEPTANCE PENDING**

only after completing genuine live-browser verification.

Final acceptance remains with the owner.

---

## FINAL INSTRUCTION

Correct the existing system as a complete, integrated scene-management capability.

Do not add another numbered directive.

Do not perform another superficial positioning adjustment.

Do not replace drag-and-drop with ordering buttons.

Do not close Directive 037 until the production interface behaves correctly.

**END OF DIRECTIVE**
