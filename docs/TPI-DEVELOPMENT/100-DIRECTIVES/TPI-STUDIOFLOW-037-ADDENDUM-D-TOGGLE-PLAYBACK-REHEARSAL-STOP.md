# TPI-STUDIOFLOW-037 — Addendum D: Toggle Playback, Rehearsal Stop & Scene Item Removal

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-25 10:33.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md](../300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md), [2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-E.md](../300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-E.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-037
## ADDENDUM D — PRODUCTION BUTTON PLAYBACK & REHEARSAL CONTROLS

**Priority:** HIGH  
**Scope:** Scenes panel interactions and playback controls  
**Status:** CORRECTION REQUIRED

### 0. MANDATORY DOCUMENTATION

Before making changes, read:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

Review the existing playback contract and Directive 037 implementation before modifying functionality.

**Do not rebuild the existing playback engine.**

---

### 1. CLICK-TO-PLAY / CLICK-TO-STOP

All playable production-item buttons must support toggle playback.

**First click: PLAY**

**Second click: STOP**

This applies to:

- Intro Video.
- Outro Video.
- Countdown Timer.
- Background Music.
- Video Clips.

Example:

1. Click Intro Video.
2. Intro Video begins playing.
3. Click Intro Video again.
4. Intro Video stops immediately.
5. Nothing else starts automatically.

The same behavior applies to Background Music, Countdown Timers, Outro Videos, and Video Clips.

If playback finishes naturally, the button returns to its idle state.

**Important:** Stopping an individual preview must never trigger the next production item.

### 2. SCENE BUTTONS

Scene buttons operate differently from media buttons.

Clicking a scene selects or activates that scene.

Clicking the same scene again must not unexpectedly remove it from the program output.

Preserve the existing manual scene-switching behavior.

---

### 3. PLAY SEQUENCE TOGGLE

The existing Play Sequence button must also operate as a toggle.

**First click:** Start rehearsal.

**Second click:** Stop rehearsal.

When rehearsal starts, the button label changes from:

**▶ Play Sequence**

to:

**■ Stop Sequence**

When rehearsal stops:

1. Stop active rehearsal media.
2. Cancel pending rehearsal transitions.
3. Clear rehearsal timers.
4. Return the button to Play Sequence.
5. Prevent any additional production item from starting.
6. Preserve saved production settings.

The creator must be able to stop rehearsal at any point, including during an Intro Video, Countdown Timer, or Outro Video.

Stopping rehearsal must not end an actual livestream or recording.

### 4. REHEARSAL PLAYBACK ISOLATION

The rehearsal system must remain separate from active broadcast and recording controls.

Individual preview playback must not advance through the sequence.

Sequence rehearsal may advance through configured opening and closing items according to the existing playback contract.

Stopping either an individual preview or rehearsal must cancel its own pending callbacks.

Do not leave timers or event listeners running after playback stops.

---

### 5. REMOVE PRODUCTION ITEMS

Every removable production item must provide a removal option through its three-dot context menu.

Use the label:

**Remove from Scenes**

This applies to:

- Optional Intro items.
- Optional Outro items.
- Countdown items.
- Background Music items.
- Video Clip items.
- User-created Scenes.

Removing an item from the Scenes panel must not automatically delete its underlying media asset.

For example:

Removing a Video Clip button must not delete the uploaded video from Media Assets.

Removing a Background Music button must not delete the audio track.

For an assigned opening, closing, or scene-associated item, update the relevant assignment safely and clearly.

Do not leave broken references.

For destructive scene deletion, require appropriate confirmation and clearly distinguish deleting the scene configuration from removing a panel item.

### 6. VISUAL PLAYBACK INDICATORS

When an item is playing:

- Highlight its button.
- Display an appropriate playing indicator.
- Preserve the assigned SmartPad color for Background Music.
- Clearly distinguish playing from merely selected.

When playback stops, return to the appropriate idle or selected appearance.

The Play Sequence button must visibly indicate whether rehearsal is active.

---

### 7. INTERACTION SAFETY

Ensure that:

- Clicking a drag handle does not start playback.
- Clicking the three-dot menu does not start playback.
- Right-clicking does not start playback.
- Dragging does not start playback.
- Clicking the button body performs the intended action.
- Rapid repeated clicks cannot create duplicate playback instances.
- Switching Studios stops or safely cleans up Studio-specific previews.
- Individual previews cannot unexpectedly interrupt an active livestream or recording.

Preserve existing production automation.

Do not change automatic Intro/Outro behavior during real broadcasts.

---

### 8. REQUIRED TESTING

Verify:

1. Intro click → Play.
2. Intro second click → Stop.
3. Background Music click → Play.
4. Background Music second click → Stop.
5. Countdown click → Play.
6. Countdown second click → Stop.
7. Outro click → Play.
8. Outro second click → Stop.
9. Video Clip click → Play.
10. Video Clip second click → Stop.
11. Play Sequence click → Start rehearsal.
12. Stop Sequence click → Stop rehearsal.
13. Rehearsal can stop during any media item.
14. Stopping does not trigger the next item.
15. Media completion resets the button state.
16. Remove from Scenes works.
17. Removing an item does not delete its underlying asset.
18. Drag handles and context menus do not trigger playback.
19. Per-Studio persistence remains intact.
20. Existing livestream and recording automation remains intact.

Run applicable existing regression suites, including Directives 028–037.

### 9. DOCUMENTATION AND DEPLOYMENT

Follow the established StudioFlow source-to-live workflow.

Update Directive 037 documentation with:

- The reported playback problems.
- Root causes.
- Implemented corrections.
- Regression results.
- Source and application commits.
- Deployment Worker identifier.
- Rollback identifier.

Preserve historical completion records.

Do not mark this addendum complete until the actual playback and stop behavior has been verified.

---

## FINAL REQUIREMENT

**StudioFlow's production controls must be intuitive.**

Click a media button to play it.

Click the same button again to stop it.

Click Play Sequence to begin rehearsal.

Click Stop Sequence to end rehearsal.

Remove unwanted production items without deleting their underlying media assets.

**END OF ADDENDUM D**
