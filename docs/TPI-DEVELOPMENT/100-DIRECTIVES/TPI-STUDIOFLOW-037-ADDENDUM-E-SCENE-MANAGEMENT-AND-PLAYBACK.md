# TPI-STUDIOFLOW-037 — Addendum E: Scene Management and Playback Corrections

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-25 11:03.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-E.md](../300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-E.md), [2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md](../300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md)
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
## TPI-STUDIOFLOW-037
### ADDENDUM E — SCENE MANAGEMENT, CONTEXT MENUS & PLAYBACK CORRECTIONS

**Priority:** CRITICAL  
**Status:** OWNER ACCEPTANCE FAILED — REPAIR REQUIRED  
**Scope:** Scenes panel functionality and existing playback integration

---

## 0. MANDATORY GOVERNING DOCUMENTATION

Before making modifications, read completely:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

Review:

- Directive 037 and Addenda A–D.
- TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md.
- Directive 028 Intro/Outro implementation.
- Directive 031 Background Music implementation.
- Directive 034 DOM mutation protections.
- Directive 037 completion records.
- Current scene persistence and playback code.

**Authoritative source:**

`/Users/toddknipple/Documents/StudioFlow/web`

Follow the established source-to-live workflow.

---

## 1. OWNER-REPORTED FAILURES

The owner has tested the deployed interface and identified four unresolved problems:

1. Production items cannot reliably be removed from the Scenes panel.
2. Stopping an Intro Video immediately starts Background Music.
3. Three-dot context menus work on some items but not others.
4. Existing scenes are still named Demo Scene instead of using a clean Scene 1, Scene 2 naming system.

These are functional acceptance failures.

Passing automated tests does not override the owner's observed behavior.

Investigate and correct the actual causes.

---

## 2. STANDARD SCENE ARRANGEMENT

The desired default production arrangement is:

**Intro Video**

**Scene 1**

**Scene 2**

**Outro Video**

This is the default for a new Studio, not a requirement to overwrite existing user configurations.

### Requirements

- New Studios should initialize with this simple arrangement.
- Intro and Outro remain optional production items.
- Creators can add additional scenes.
- Creators can add countdown timers.
- Creators can add background music.
- Creators can add video clips.
- Creators can rearrange their production items.
- Existing Studio configurations must be preserved.

Do not automatically delete or rename the owner's existing scenes.

Provide safe editing controls for existing scenes.

---

## 3. SCENE NAMING

Remove the use of Demo Scene as the default name for newly created scenes.

Use sequential names:

**Scene 1**

**Scene 2**

**Scene 3**

**Scene 4**

And so on.

### Custom naming

Creators must be able to rename any scene.

Examples:

- Main Podcast
- Guest Interview
- Investigation
- Camera One
- Screen Share
- Closing Discussion

### Naming rules

1. Scene names must be editable through the context menu.
2. Names must persist per Studio.
3. Names must remain visible within the fixed button dimensions.
4. Longer names should truncate gracefully rather than distort the button.
5. The full name must remain accessible through a tooltip or configuration menu.
6. Renaming must not alter scene IDs or break media assignments.
7. Newly created scenes must receive the next available sequential name.

Do not overwrite existing custom scene names.

---

## 4. REPAIR THREE-DOT CONTEXT MENUS

Every production-item button must have a functioning three-dot menu.

This includes:

- Intro Video.
- Outro Video.
- Countdown Timer.
- Background Music.
- Video Clips.
- Scene 1.
- Scene 2.
- Additional user-created scenes.

### Required behavior

Clicking the three-dot control must:

1. Open the correct context menu.
2. Not trigger playback.
3. Not activate the scene.
4. Not initiate dragging.
5. Display only actions appropriate for that item.
6. Allow the menu to close normally.
7. Work consistently in Firefox.

Right-clicking the button should open the same menu.

### Required investigation

Identify why the menu currently works on only some item types.

Inspect event propagation, element layering, pointer handlers, item identifiers, and context-menu rendering.

Correct the shared implementation rather than adding isolated workarounds for individual buttons.

---

## 5. REMOVE FROM SCENES

Creators must be able to remove unwanted production items.

Every removable item must provide:

**Remove from Scenes**

### Required behavior

When selected:

1. Remove the item from the Scenes panel.
2. Update the current Studio configuration.
3. Persist the change.
4. Leave the underlying uploaded media intact.
5. Do not affect other Studios.
6. Do not leave invalid references.

### Examples

Removing a Background Music button must not delete the audio track.

Removing a Countdown Timer button must not delete the timer design.

Removing a Video Clip button must not delete the uploaded video.

Removing an Intro or Outro button must not delete its media asset.

### Scene removal

For a user-created scene, provide a clear removal or deletion action.

If removing the scene would delete its saved layout configuration, explain that consequence and require confirmation.

Do not silently delete associated recordings, uploaded media, or shared assets.

If the scene is currently active, handle the transition safely before removal.

### Persistence

Removed items must not reappear after:

- Reloading the page.
- Leaving and returning to the Studio.
- Switching between Studios.
- Starting another recording session.

Do not let default scene initialization recreate an item the creator intentionally removed.

---

## 6. CRITICAL — INTRO PREVIEW MUST NOT ADVANCE

The owner reports:

**Intro Video → Stop → Background Music starts automatically.**

This behavior is incorrect during individual preview.

### Required behavior

Click Intro Video.

Intro begins playing.

Click Intro Video again.

Intro stops.

**Nothing else starts.**

No Background Music.

No Countdown Timer.

No Scene transition.

No Outro Video.

### Required investigation

Trace the existing playback lifecycle and identify the callback or state transition that starts Background Music after the Intro stops.

Investigate whether the cause is:

- An ended event being triggered during manual stop.
- An automatic After Intro transition.
- A stale playback callback.
- An event listener that cannot distinguish preview from production playback.
- A race condition between media cleanup and sequence advancement.

### Required correction

The existing playback implementation must distinguish between:

**Individual Preview:** Play or stop one selected item.

**Sequence Rehearsal:** Advance through configured opening items.

**Live Production:** Preserve automatic opening and closing behavior.

Stopping an individual preview must cancel its pending transitions.

Do not disable automatic Background Music during actual production if it is configured to play after the Intro.

Do not rebuild the existing playback engine.

---

## 7. BACKGROUND MUSIC PREVIEW

Apply the same playback isolation to Background Music.

Click once:

**Play selected track.**

Click again:

**Stop selected track.**

Stopping the track must not activate another production item.

Background Music must retain its existing volume, looping, fade, and assignment settings.

---

## 8. PRESERVE EXISTING FUNCTIONALITY

Do not modify or rebuild:

- Recording architecture.
- Livestream architecture.
- Intro/Outro production automation.
- Countdown timer engines.
- Audio soundboard architecture.
- Program compositor.
- Media storage.
- Per-Studio configuration infrastructure.

Preserve completed functionality from Directives 028–036 and the working portions of Directive 037.

---

## 9. REQUIRED REAL-BROWSER TESTING

Automated unit tests alone are insufficient.

Perform actual interaction testing in Firefox.

### Test A — Intro Preview

1. Open a Studio containing an Intro Video.
2. Click Intro Video.
3. Confirm playback starts.
4. Click Intro Video again.
5. Confirm playback stops.
6. Confirm Background Music does not start.
7. Confirm no automatic scene transition occurs.

### Test B — Context Menus

Open the three-dot menu on every supported item type.

Verify the correct actions appear and function.

### Test C — Removal

1. Add a temporary scene.
2. Remove it.
3. Reload the Studio.
4. Confirm it remains removed.
5. Confirm other scenes are unchanged.

Repeat with a temporary Background Music item, Countdown, and Video Clip where supported.

### Test D — Naming

1. Create a new scene.
2. Confirm it receives the next available Scene number.
3. Rename it.
4. Reload the Studio.
5. Confirm the custom name persists.

### Test E — Studio Isolation

Verify changes made in one Studio do not modify another Studio.

### Test F — Existing Production Automation

Verify actual production playback still uses the existing automatic Intro/Outro behavior.

Use safe test environments and avoid starting unauthorized public broadcasts.

---

## 10. TESTING AND REGRESSION

Run applicable tests for:

- Directive 028 playback.
- Directive 031 Background Music.
- Directive 033 persistence.
- Directive 034 DOM mutation regression.
- Directive 036 countdown timers.
- Directive 037 Scenes panel.
- Addenda A–E.

Include explicit assertions that stopping an individual Intro preview does not trigger Background Music.

Include context-menu tests for every production-item type.

Include removal persistence tests.

---

## 11. DOCUMENTATION AND DEPLOYMENT

Follow the mandatory source-to-live workflow.

Update the Directive 037 completion documentation with:

- Owner-reported failures.
- Root causes.
- Repairs.
- Browser verification.
- Regression results.
- Source commit.
- Application commit.
- Documentation commit.
- Production Worker identifier.
- Rollback Worker identifier.

Preserve previous completion records.

Do not claim owner acceptance until the owner confirms the live interface works correctly.

---

# FINAL REQUIREMENT

**The Scenes panel must be simple, reliable, and completely under the creator's control.**

The default arrangement is:

**Intro Video → Scene 1 → Scene 2 → Outro Video**

Creators can rename scenes, add production items, rearrange them, and remove unwanted items.

Every three-dot menu must work.

Stopping an individual preview must stop that item only.

**No unexpected playback transitions. No undeletable scene items. No Demo Scene defaults.**

**END OF TPI-STUDIOFLOW-037 — ADDENDUM E**
