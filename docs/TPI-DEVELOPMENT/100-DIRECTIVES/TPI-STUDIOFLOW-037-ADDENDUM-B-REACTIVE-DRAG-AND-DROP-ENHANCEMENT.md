# TPI-STUDIOFLOW-037 — Addendum B: Reactive Drag-and-Drop Enhancement

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-24 22:42.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md](../300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md), [2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-E.md](../300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-E.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-037
## ADDENDUM B — SCENES PANEL UNIFORMITY & REACTIVE DRAG-AND-DROP

**Priority:** HIGH  
**Scope:** Scenes panel visual and interaction corrections

### MANDATORY DOCUMENTATION

Read and follow:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

### ADDITIONAL REQUIREMENT — REACTIVE DRAG-AND-DROP

The existing drag-and-drop implementation must provide clear, continuous visual feedback showing exactly where a production item will be placed.

#### Required behavior

1. When the user grabs a production item's drag handle, the item should visibly lift from its current position.

2. As the user moves it up or down, surrounding production items must smoothly shift to create space at the intended insertion position.

3. The insertion position must be highlighted using StudioFlow's existing blue theme.

4. The insertion area must update continuously as the dragged item moves between positions.

5. Releasing the item must place it at the currently indicated position.

6. The remaining items must smoothly settle into their new positions.

7. Pressing Escape must cancel the operation and restore the original order.

8. Dragging near the top or bottom of the Scenes panel must automatically scroll the list when additional items exist outside the visible area.

9. The drag operation must not activate or preview any media.

10. The new order must save automatically using the existing per-Studio persistence system.

#### Visual requirements

- Use subtle movement animations.
- Preserve the uniform button dimensions established in Addendum B.
- Keep the dragged item fully identifiable.
- Clearly distinguish the dragged item from the insertion placeholder.
- Avoid excessive animation or visual effects.
- Respect reduced-motion accessibility preferences.

#### Safety requirements

Do not rebuild the existing scene-management system.

Improve the existing drag-and-drop implementation.

Do not alter production playback, automatic Intro/Outro behavior, recording, livestreaming, or media assignments.

#### Validation

Confirm that:

- Users can clearly see where an item will be dropped.
- Surrounding buttons move reactively.
- Drag cancellation works.
- Auto-scrolling works.
- Items remain correctly ordered after reloading.
- Different Studios retain independent arrangements.
- Dragging does not trigger playback.
- Context menus and existing controls continue functioning.
- No DOM mutation or performance regressions occur.

**This requirement is part of Directive 037 and must be completed before the directive is closed.**

**END OF ADDENDUM B**
