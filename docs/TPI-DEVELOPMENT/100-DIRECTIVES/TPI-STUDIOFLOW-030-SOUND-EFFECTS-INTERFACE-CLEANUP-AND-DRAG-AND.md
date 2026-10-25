# TPI-STUDIOFLOW-030 — Sound Effects Interface Cleanup and Drag-and-Drop Pad Reordering

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-23 21:20.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-23-TPI-STUDIOFLOW-030-SOUND-EFFECTS-PAD-REORDERING.md](../300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-030-SOUND-EFFECTS-PAD-REORDERING.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-030
## SOUND EFFECTS INTERFACE CLEANUP AND DRAG-AND-DROP PAD REORDERING

**Project:** The Paranormal Initiative — StudioFlow  
**Priority:** HIGH  
**Development Agent:** FreeBuff / MiMO 2.6 Pro  
**Area:** StudioFlow — Sounds / Sound Effects  
**Objective:** Simplify the Sound Effects interface and allow creators to customize sound pad positions.

---

## 1. MANDATORY DEVELOPMENT AUTHORITY

**PRIORITY: CRITICAL — NON-NEGOTIABLE**

Before investigating, modifying, repairing, testing, committing, or deploying any StudioFlow functionality, the development agent MUST read and follow both documents in their entirety.

### MASTER AGENT INSTRUCTIONS

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

### STUDIOFLOW SOURCE-TO-LIVE WORKFLOW

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

These documents are the governing authority for this assignment.

The agent must also identify and review relevant historical directives, completion records, architecture documentation, and approved implementations before making changes.

**Do not bypass the established workflow or replace working functionality unnecessarily.**

---

## 2. OBJECTIVE

Improve the usability of StudioFlow's existing Sound Effects panel.

The changes involve three specific improvements:

1. Remove the unnecessary Stop Sound button.
2. Remove the three-dot menu buttons from individual sound pads.
3. Introduce drag-and-drop sound pad reordering.

The existing sound effects system must remain intact.

This is an interface and usability improvement, not a sound engine redesign.

---

## 3. REMOVE STOP SOUND BUTTON

The Sounds panel currently displays:

- Sound effects volume slider.
- Stop Sound button.

Remove the Stop Sound button from the interface.

### Requirements

- Preserve the existing volume slider.
- Preserve sound effects playback.
- Preserve existing audio routing.
- Preserve recording and livestream audio integration.
- Preserve all existing sound assignments.

Do not remove or damage the underlying audio controls that other parts of StudioFlow may depend on.

The objective is to simplify the visible interface.

---

## 4. REMOVE THREE-DOT PAD MENUS

Each sound effects pad currently contains a three-dot menu button.

These buttons are unnecessary because the existing context menu is available through right-clicking a pad.

### Requirements

Remove the visible three-dot menu button from every sound effects pad.

Preserve the existing context menu functionality, including all currently supported actions.

Right-clicking a sound pad must continue to display its existing menu.

Do not remove, replace, or redesign the context menu.

Ensure menu access remains available for touch and keyboard users through an appropriate accessible interaction.

### Expected result

Sound pads display a cleaner interface with more room for sound names.

The existing menu functionality remains accessible without a permanent three-dot button on every pad.

---

## 5. INTRODUCE DRAG-AND-DROP SOUND PAD REORDERING

Creators must be able to arrange their sound effects pads in any order they prefer.

This should work similarly to the sound pad arrangement available in StreamYard.

### Required behavior

A creator can:

1. Select an existing sound pad.
2. Drag it to another position within the Sound Effects grid.
3. Release it at the desired position.
4. Have the other pads automatically rearrange around it.
5. Continue using the pads in their new order.

### Example

Suppose the current order is:

**Pad 1:** BRUH  
**Pad 2:** Fart with Reverb  
**Pad 3:** Pump Shotgun  
**Pad 4:** SpongeBob Fail  
**Pad 5:** Lagging Loading  
**Pad 6:** Empty

The creator should be able to drag Pump Shotgun into the first position.

The resulting order becomes:

**Pad 1:** Pump Shotgun  
**Pad 2:** BRUH  
**Pad 3:** Fart with Reverb  
**Pad 4:** SpongeBob Fail  
**Pad 5:** Lagging Loading  
**Pad 6:** Empty

The change must happen visually and immediately.

---

## 6. PRESERVE SOUND PAD FUNCTIONALITY

Drag-and-drop must not interfere with normal sound playback.

### Required behavior

**Normal click:**
Plays the assigned sound effect as it currently does.

**Right-click:**
Opens the existing sound pad context menu.

**Drag:**
Reorders the sound pad without accidentally triggering playback.

**Drop:**
Places the sound pad in its new position.

**Empty pads:**
Remain available for adding sounds.

The existing Add Audio functionality must remain operational.

Do not change how sound effects are uploaded, assigned, stored, or played.

---

## 7. AUTOMATIC ORDER PERSISTENCE

**This requirement is critical.**

When a creator rearranges sound pads, the new arrangement must automatically save.

The creator must not need to click a Save button.

### Persistence requirements

The custom order must survive:

- Page refreshes.
- Leaving and reopening StudioFlow.
- Switching between studios.
- Returning to a previously opened studio.
- Normal application restarts.

Each studio must preserve its own sound pad arrangement.

For example:

**Studio A** may place Pump Shotgun in the first position.

**Studio B** may place BRUH in the first position.

Switching between these studios must restore each studio's saved arrangement.

Do not allow one studio's pad order to overwrite another studio's configuration.

Use the existing StudioFlow persistence architecture.

Do not introduce a separate storage system unless the current architecture genuinely cannot support this functionality.

---

## 8. DRAG-AND-DROP USER EXPERIENCE

The interaction should feel natural and responsive.

### Visual requirements

- The dragged pad should visually indicate that it is being moved.
- Other pads should respond as the dragged pad changes position.
- The intended drop location should be clear.
- The grid should retain its existing styling.
- Sound pad colors and labels must remain intact.
- The panel should not jump, flicker, or unexpectedly scroll.

Preserve the existing three-column sound pad grid where appropriate for the available panel width.

### Input support

Support:

- Mouse dragging.
- Trackpad dragging.
- Touch interaction where supported.
- Accessible keyboard reordering.

Do not sacrifice normal sound playback to implement dragging.

---

## 9. PRESERVE THE EXISTING DESIGN

The Sound Effects panel already has an established visual design.

Do not redesign it.

Preserve:

- Existing sound pad colors.
- Existing grid appearance.
- Existing sound labels.
- Existing audio upload controls.
- Existing volume slider.
- Existing empty-pad behavior.
- Existing overall panel dimensions and styling.

The only requested visual changes are:

1. Removal of Stop Sound.
2. Removal of three-dot menu buttons.
3. Addition of drag-and-drop interaction and appropriate visual feedback.

---

## 10. REGRESSION PROTECTION

Before implementation, identify the current sound pad components, event handlers, and persistence mechanism.

Review relevant historical documentation and Git history.

Preserve all existing approved functionality.

Particular attention must be given to:

- Sound effects playback.
- Background Music.
- After Intro Background Music.
- Intro Video.
- Outro Video.
- Audio routing.
- Monitoring.
- Recording.
- Livestreaming.
- Studio switching.
- Media assignments.

**Do not modify the recently repaired TPI-STUDIOFLOW-028 playback workflow unless absolutely necessary.**

If a dependency requires changes outside the Sound Effects panel, document the reason before proceeding.

---

## 11. REQUIRED TESTING

Verify the following:

1. Stop Sound button is no longer visible.
2. Volume slider remains functional.
3. Three-dot buttons are no longer visible.
4. Right-click context menus still work.
5. Normal pad clicks play the correct sounds.
6. Dragging a pad does not play its sound.
7. Pads can be moved forward in the grid.
8. Pads can be moved backward in the grid.
9. Empty pads remain usable.
10. Pad order automatically saves.
11. Refreshing preserves the saved order.
12. Studio switching restores each studio's arrangement.
13. Sound assignments remain attached to the correct pads.
14. Sound playback continues working after reordering.
15. Touch and keyboard interactions remain usable.
16. Intro/Outro playback remains functional.
17. After Intro Background Music remains functional.
18. Recording and livestream audio remain unaffected.

Browser interaction testing is mandatory.

A successful build or static test alone is insufficient.

---

## 12. DOCUMENTATION REQUIREMENTS

After implementation, update the relevant Markdown documentation.

This includes the appropriate:

- Directive index.
- Development status.
- Completion record.
- Sound Effects architecture or feature documentation.
- Current implementation references.
- Regression testing documentation.

Preserve historical records.

Do not overwrite previous implementation history.

Follow the documentation requirements established under TPI-STUDIOFLOW-029.

---

## 13. DEPLOYMENT REQUIREMENTS

Follow the established Source-to-Live Workflow.

Do not bypass required validation, release safeguards, or rollback procedures.

Do not deploy an incomplete or failing implementation.

Respect any deployment authorization requirements contained in the governing documents.

---

## 14. COMPLETION REPORT

Provide:

1. Root implementation findings.
2. Files modified.
3. Stop Sound removal confirmation.
4. Three-dot menu removal confirmation.
5. Drag-and-drop implementation details.
6. Automatic persistence verification.
7. Multi-studio isolation verification.
8. Regression test results.
9. Documentation updates.
10. Git commits.
11. Deployment status, if authorized.
12. Any unresolved limitations.

### FINAL REQUIREMENT

StudioFlow creators must be able to organize their Sound Effects pads in whatever order works best for their production.

The interface must be cleaner, easier to operate, and fully persistent without sacrificing any existing audio functionality.

**END DIRECTIVE — TPI-STUDIOFLOW-030**
