# TPI-STUDIOFLOW-037 — Addendum B: Final Scenes Panel Uniformity

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-24 22:40.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-24-TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN.md](../300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN.md), [2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md](../300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-037
## ADDENDUM B — FINAL SCENES PANEL UNIFORMITY

**Priority:** HIGH  
**Scope:** Scenes panel visual corrections only  
**Status:** Required correction before Directive 037 completion

### MANDATORY DOCUMENTATION

Before making changes, read:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

Follow the established StudioFlow source-to-live development process.

### OBJECTIVE

Correct the remaining inconsistencies in the Scenes panel.

**The existing Intro Video button is the authoritative visual reference.**

### REQUIRED CHANGES

**1. Uniform dimensions**

All production-item buttons must have exactly the same outer width and height as the Intro Video button.

This includes:

- Intro Video.
- Background Music.
- Countdown Timer.
- Scene buttons.
- Video Clip buttons.
- Outro Video.
- Add Production Item.
- Play Sequence.

Use consistent padding, border radius, border thickness, and spacing.

**2. Background Music buttons**

Replace long track titles and scene-specific descriptive labels with the primary label:

**Background Music**

Use the same blue music-note icon styling as the other production-item icons.

Keep the selected track name and associated scene information accessible through the existing configuration controls or context menu.

Do not delete or change the underlying track assignments.

Do not merge separate music configurations merely because their visible labels are identical.

**3. Countdown Timer buttons**

Use the primary label:

**Countdown Timer**

Keep the selected design and duration accessible through the existing configuration controls.

**4. Scene buttons**

Preserve the creator's scene names.

Ensure the layout handles longer names without increasing button height or disrupting alignment.

Use controlled text truncation or a tooltip where necessary.

**5. Add Production Item**

Match the Intro Video button's exact outer dimensions.

Preserve the plus icon and existing functionality.

**6. Play Sequence**

Match the Intro Video button's exact outer dimensions.

Preserve the play icon and existing rehearsal functionality.

**7. Consistent visual styling**

Use the same:

- Background color.
- Border color.
- Border thickness.
- Corner radius.
- Icon sizing.
- Typography.
- Internal alignment.
- Hover behavior.
- Focus behavior.

Preserve appropriate visual differences for selected, previewing, and active production states.

### STRICT SCOPE LIMIT

This is a visual correction.

Do not rebuild:

- Scenes management.
- Intro/Outro playback.
- Countdown timers.
- Background Music playback.
- Recording.
- Livestreaming.
- Production sequencing.

Do not change saved Studio configurations or media assignments.

### VALIDATION

Verify that:

1. Every button has identical outer dimensions.
2. Background Music buttons display the correct simplified label.
3. Countdown buttons display the correct simplified label.
4. Scene names remain accessible.
5. Add Production Item matches the standard button size.
6. Play Sequence matches the standard button size.
7. Drag-and-drop still works.
8. Context menus still work.
9. Existing media assignments remain intact.
10. No playback or persistence regressions occur.

Update Directive 037 documentation and testing records.

**END OF ADDENDUM B**
