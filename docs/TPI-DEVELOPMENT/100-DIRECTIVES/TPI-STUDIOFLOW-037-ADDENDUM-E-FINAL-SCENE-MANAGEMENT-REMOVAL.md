# TPI-STUDIOFLOW-037 — Addendum E: Final Scene Management, Removal, Naming & Live Verification

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-25 11:44.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-E.md](../300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-E.md), [2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md](../300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md)
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
## TPI-STUDIOFLOW-037
### ADDENDUM E — SCENE MANAGEMENT, REMOVAL, DEFAULT LAYOUT, RENAMING & LIVE VERIFICATION

**Project:** StudioFlow  
**Priority:** HIGH  
**Status:** IMPLEMENTATION AND LIVE VERIFICATION REQUIRED  
**Classification:** Scenes Panel — Functional Corrections  
**Assigned Development Agent:** Luna  
**Supersedes:** Earlier drafts of Addendum E  
**Scope:** Existing Scenes panel and its associated configuration and preview interactions.

---

# 0. MANDATORY GOVERNING DOCUMENTATION

**STOP. READ BEFORE MODIFYING CODE.**

Read the following documents completely:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

Also review the relevant documentation and completion records for:

- TPI-STUDIOFLOW-028 — Intro/Outro playback.
- TPI-STUDIOFLOW-031 — Background Music.
- TPI-STUDIOFLOW-033 — Per-Studio persistence.
- TPI-STUDIOFLOW-034 — DOM mutation protection.
- TPI-STUDIOFLOW-035 — Recording and Storage.
- TPI-STUDIOFLOW-036 — Cinematic countdown timers.
- TPI-STUDIOFLOW-037 — Scenes panel redesign.
- TPI-STUDIOFLOW-037 Addenda A, B, C, and D.

**Authoritative StudioFlow source:**

`/Users/toddknipple/Documents/StudioFlow/web`

Follow the established source-to-live workflow.

Do not modify generated deployment files as the authoritative source.

---

# 1. DIRECTIVE OBJECTIVE

The owner has tested StudioFlow and identified several remaining problems.

Although Addendum D was reported as deployed and verified, the live Scenes panel does not yet satisfy the owner's requirements.

This directive must resolve the following:

1. Every production-item button must have a working three-dot menu.
2. Every removable production item must offer **Remove from Scenes**.
3. New Studios must use the correct default scene arrangement.
4. New scenes must be named Scene 1, Scene 2, Scene 3, etc.
5. Creators must be able to rename their scenes.
6. Scene names must display correctly within the existing button dimensions.
7. Individual Intro previews must stop without automatically starting Background Music.
8. All changes must persist correctly within their respective Studios.
9. All requirements must be verified on the actual live website.
10. All required Markdown documentation must be updated, committed, and pushed.

**Do not report completion based solely on unit tests.**

---

# 2. REQUIRED DEFAULT SCENES

When a creator establishes a brand-new Studio, the default Scenes panel must contain:

**Intro Video**

**Scene 1**

**Scene 2**

**Outro Video**

This is the authoritative default arrangement.

Do not create scenes named:

- Demo Scene.
- Demo Scene 1.
- Demo Scene 2.
- Two-Person Demo.
- Sample Scene.

### Important

Intro Video and Outro Video are optional production items.

Their presence in the default panel must not require an uploaded video.

An unconfigured item should display an appropriate setup or empty state.

Do not automatically play missing media.

### Existing Studios

Do not overwrite existing Studio configurations.

Do not rename or delete the owner's existing scenes.

Do not reset existing media assignments.

The new default arrangement applies to newly created Studios.

Existing Studios must receive the ability to rename, remove, and reorganize their own items.

---

# 3. AUTOMATIC SCENE NUMBERING

Newly created scenes must receive simple sequential names.

Examples:

- Scene 1
- Scene 2
- Scene 3
- Scene 4

When a creator adds another scene, StudioFlow must assign the next available scene number.

### Requirements

1. Scene numbering is independent for each Studio.
2. Do not create duplicate default names.
3. Do not rename existing custom-named scenes.
4. Do not change scene identifiers when changing display names.
5. Preserve scene layouts and media references.
6. Save newly created scenes using the existing persistence system.

If Scene 2 is removed, StudioFlow must not unexpectedly rename Scene 3.

Existing scene names remain stable unless the creator explicitly changes them.

---

# 4. CREATOR-EDITABLE SCENE NAMES

Every scene must support custom naming.

### Required interaction

1. Creator opens the scene's three-dot menu.
2. Selects **Rename Scene**.
3. An editable text field appears.
4. Creator enters the desired name.
5. Creator confirms the change.
6. The new name appears on the scene button.
7. The name is saved automatically to the current Studio.

Examples:

**Scene 1 → Main Podcast**

**Scene 2 → Guest Interview**

**Scene 3 → Investigation Footage**

### Text field requirements

- Use the existing StudioFlow visual theme.
- Allow normal typing, editing, and selection.
- Enter saves.
- Escape cancels.
- Empty names must not be saved.
- Trim unnecessary leading and trailing whitespace.
- Provide an appropriate maximum length.
- Prevent the input from overflowing the interface.
- Preserve the previous name if the operation is canceled.

### Button display requirements

All scene buttons must retain the same dimensions as Intro Video.

Custom scene names must not change button height or width.

Names that fit should display completely.

Long names may be truncated with an ellipsis.

The full saved name must remain accessible through a tooltip, accessible label, or scene configuration.

**Do not unnecessarily truncate short names such as Intro Video, Scene 1, Scene 2, and Outro Video.**

---

# 5. THREE-DOT MENUS — EVERY BUTTON

Every production-item button must have a functional three-dot menu.

This includes:

1. Intro Video.
2. Scene 1.
3. Scene 2.
4. Additional scenes.
5. Outro Video.
6. Countdown Timer.
7. Background Music.
8. Video Clips.
9. Any additional removable production item.

### Required behavior

Clicking the three-dot menu must:

- Open the correct menu.
- Display the available actions.
- Not start playback.
- Not stop playback unintentionally.
- Not initiate dragging.
- Not change the selected scene.
- Not trigger another production item.

Right-clicking the button should open the same context menu.

### Investigation requirement

Some three-dot menus currently work while others do not.

Identify the actual cause.

Inspect:

- Event propagation.
- Pointer and click handlers.
- Drag-handle interference.
- Element stacking.
- CSS pointer-events.
- Menu rendering.
- Item-type conditions.
- Disabled-state logic.
- Incorrect item identifiers.

Correct the underlying problem rather than implementing separate temporary workarounds.

---

# 6. REMOVE FROM SCENES — REQUIRED ON EVERY ITEM

**EVERY REMOVABLE PRODUCTION ITEM MUST OFFER:**

### Remove from Scenes

This action must appear in the item's three-dot menu.

It must work consistently across all supported production-item types.

### Intro Video

Remove the Intro Video button from the current Studio's Scenes panel.

Do not delete the uploaded Intro video.

Clear or disable its current production assignment safely.

### Outro Video

Remove the Outro Video button from the current Studio's Scenes panel.

Do not delete the uploaded Outro video.

Clear or disable its current production assignment safely.

### Countdown Timer

Remove the selected countdown production item.

Do not delete or modify the nine cinematic countdown designs.

### Background Music

Remove the selected Background Music production item from the Scenes panel.

Do not delete the underlying audio track.

Preserve unrelated Background Music configurations.

### Video Clip

Remove the Video Clip production item.

Do not delete the uploaded video from Media Assets.

### Scene

Allow the creator to remove an unwanted scene.

If removal deletes the scene's saved layout configuration, provide a confirmation explaining that consequence.

Do not delete unrelated media assets or recordings.

### Safety rules

1. Remove only the selected item.
2. Do not remove unrelated items.
3. Do not delete uploaded media.
4. Do not modify another Studio.
5. Do not leave broken production references.
6. Do not automatically recreate the removed item after reload.
7. Preserve the remaining item's order.
8. Persist the removal.

### Active scene protection

If the creator attempts to remove a scene currently on program during a livestream or recording, prevent unsafe removal or require a safe transition to another scene first.

Never unexpectedly blank the live program.

### Last remaining scene

Do not allow the creator to remove the final usable live scene without providing a safe replacement or an explicit supported empty-state workflow.

---

# 7. REMOVAL PERSISTENCE

Removing a production item must remain effective after:

- Refreshing the browser.
- Leaving the Studio.
- Returning to the Studio.
- Switching to another Studio.
- Switching back.
- Starting a new recording.
- Starting a new livestream.

### Critical requirement

The new default scene initialization must not recreate intentionally removed items.

Default scenes should be initialized only when creating a new Studio or when performing an explicitly authorized reset.

Do not regenerate default items every time the Scenes panel loads.

Use the existing per-Studio configuration persistence system.

---

# 8. INTRO VIDEO STOPPING BACKGROUND MUSIC

The owner reports that stopping an individual Intro Video preview still automatically starts Background Music.

This is incorrect.

### Required behavior

**First click on Intro Video:**

Play the Intro preview.

**Second click on Intro Video:**

Stop the Intro preview.

**Expected result:**

Nothing else plays.

No Background Music.

No Countdown Timer.

No automatic scene advancement.

### Required investigation

Inspect the existing Intro playback completion and cancellation handlers.

Determine whether stopping the Intro incorrectly triggers the same callback used when the Intro naturally finishes during a real broadcast.

### Required correction

Separate the following contexts:

**Individual Preview**

Only the selected item plays.

Stopping it must not advance.

**Play Sequence Rehearsal**

The configured opening sequence may advance automatically.

Stopping rehearsal must cancel pending transitions.

**Actual Livestream or Recording**

Preserve existing automatic Intro/Outro and After Intro Background Music behavior.

Do not disable legitimate production automation.

### Additional safety

A canceled preview must not leave stale callbacks capable of starting Background Music later.

Verify that no delayed playback begins after the preview has stopped.

---

# 9. PLAY SEQUENCE COMPATIBILITY

Preserve the Play Sequence / Stop Sequence toggle delivered under Addendum D.

Required behavior:

- Click Play Sequence to start rehearsal.
- Button changes to Stop Sequence.
- Click Stop Sequence to stop rehearsal.
- Active rehearsal playback stops.
- Pending transitions are canceled.
- No additional media begins.
- The button returns to Play Sequence.

Do not rebuild the rehearsal system.

Correct only the necessary interaction defects.

---

# 10. PRESERVE UNIFORM BUTTON STYLING

The Scenes panel has already received substantial visual improvements.

Preserve them.

All production-item buttons must continue matching the Intro Video button's dimensions.

Maintain:

- Consistent height.
- Consistent width.
- Consistent corner radius.
- Consistent icon size.
- Consistent typography.
- Brighter StudioFlow-themed outlines.
- Drag handles.
- Three-dot menus.
- Active playback indicators.

Do not reintroduce the old dashed Background Music button.

Do not create inconsistent button sizes.

---

# 11. PRESERVE DRAG-AND-DROP

Preserve the existing drag-and-drop implementation.

Creators must be able to rearrange scene and production-item buttons.

Continue supporting:

- Drag handles.
- Insertion indicators.
- Reactive repositioning.
- Escape cancellation.
- Edge auto-scroll.
- Per-Studio autosave.

Do not allow context-menu clicks or rename operations to initiate dragging.

Do not allow dragging to initiate playback.

If the existing reactive movement remains defective, document the observed behavior rather than falsely reporting it as verified.

---

# 12. PER-STUDIO ISOLATION

Every Studio must retain its own:

- Scene names.
- Scene ordering.
- Removed items.
- Media assignments.
- Intro/Outro configuration.
- Countdown configuration.
- Background Music assignments.
- Production settings.

### Example

**Crossroads of the Unknown**

Intro Video  
Main Podcast  
Guest Interview  
Outro Video

**TPI Learning Studio**

Intro Video  
Scene 1  
Scene 2  
Outro Video

Renaming or removing a scene in one Studio must not affect the other.

Do not modify the broader Studio creation or recording-session architecture under this directive.

That work will be addressed separately.

---

# 13. REQUIRED TESTING — ACTUAL USER INTERACTIONS

The agent must test the following in a real browser.

## Test 1 — Default Studio

Create a new test Studio.

Confirm the default Scenes panel displays exactly:

1. Intro Video.
2. Scene 1.
3. Scene 2.
4. Outro Video.

Confirm no Demo Scene names appear.

Do not use or alter the owner's existing Studios for this test.

## Test 2 — Rename Scene

Open Scene 1's three-dot menu.

Select Rename Scene.

Change its name to Main Podcast.

Save.

Refresh.

Confirm Main Podcast remains displayed.

## Test 3 — Context Menus

Open the three-dot menu on every production-item type.

Confirm each menu opens.

Confirm Remove from Scenes appears where required.

Confirm clicking the menu does not activate playback.

## Test 4 — Remove Scene

Create a temporary Scene 3.

Remove it through the three-dot menu.

Refresh.

Confirm it remains removed.

Confirm Scene 1 and Scene 2 remain unchanged.

## Test 5 — Remove Intro

In a disposable test Studio, remove Intro Video.

Refresh.

Confirm it remains removed.

Confirm the underlying video asset remains intact.

## Test 6 — Remove Background Music

Add a temporary Background Music item.

Remove it.

Confirm the music asset remains available.

Confirm unrelated music assignments are unchanged.

## Test 7 — Remove Countdown

Add a Countdown Timer.

Remove it.

Confirm the timer designs remain available.

## Test 8 — Remove Outro

Remove Outro Video from a disposable test Studio.

Refresh.

Confirm it remains removed.

Confirm no uploaded media was deleted.

## Test 9 — Intro Preview

Play Intro Video.

Stop it using the same button.

Confirm Background Music does not begin.

Wait long enough to detect delayed callbacks.

Confirm no other media begins.

## Test 10 — Studio Isolation

Create two disposable test Studios.

Give them different scene names and arrangements.

Switch between them.

Confirm neither configuration overwrites the other.

## Test 11 — Rehearsal

Start Play Sequence.

Stop it during Intro playback.

Confirm no subsequent media starts.

## Test 12 — Regression

Verify:

- Intro/Outro production automation.
- Background Music playback.
- Countdown playback.
- Drag-and-drop.
- Scene switching.
- Recording compatibility.
- Livestream compatibility.
- Per-Studio persistence.
- DOM mutation protection.

---

# 14. LIVE DEPLOYMENT VERIFICATION

**The owner specifically requires confirmation that these changes reach the live website.**

Local testing alone is insufficient.

Follow the established guarded release process.

After deployment:

1. Confirm the production Worker version.
2. Load the actual live StudioFlow application.
3. Confirm the new default scene arrangement in a disposable test Studio.
4. Confirm Rename Scene works.
5. Confirm Remove from Scenes works.
6. Confirm removed items remain removed after reload.
7. Confirm the Intro preview no longer starts Background Music when stopped.
8. Confirm existing production controls remain operational.
9. Confirm no production data was damaged.

Do not claim live verification based solely on a successful build or deployment command.

### Production safety

Do not:

- Delete owner Studios.
- Delete owner recordings.
- Delete production R2 assets.
- Reset production D1 data.
- Run destructive migrations.
- Start unauthorized public livestreams.
- Modify unrelated applications.

Use isolated test fixtures and clean them up safely.

---

# 15. MANDATORY MARKDOWN DOCUMENTATION

The owner specifically requires the Markdown documentation to be updated.

Update all relevant records, including:

- TPI-CURRENT-DEVELOPMENT-STATUS.md
- TPI-DEVELOPMENT-AGENT-HANDOFF.md
- DIRECTIVE-INDEX.md
- TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md, where applicable.
- StudioFlow workspace/configuration documentation.
- Relevant testing documentation.
- A dated Addendum E completion record.

### Completion record must include

**WHO:** Implementing agent.

**WHAT:** Features and repairs completed.

**WHERE:** Files and components changed.

**WHEN:** Implementation and deployment timestamps.

**WHY:** Owner-reported functional requirements.

**HOW:** Technical implementation and verification.

Also include:

- Root causes.
- Tests performed.
- Pass/fail results.
- Browser verification.
- Source commit.
- Application commit.
- Documentation commit.
- Production Worker identifier.
- Rollback Worker identifier.
- Remaining limitations.

Preserve historical records.

Do not overwrite previous completion documentation.

Commit and push the Markdown updates.

---

# 16. REQUIRED FINAL REPORT

Luna must provide:

## TPI-STUDIOFLOW-037 ADDENDUM E — COMPLETION REPORT

Answer each question explicitly.

**1. Was Addendum E deployed to the live website?**

YES / NO

**2. Does every production-item three-dot menu work?**

YES / NO

**3. Does every removable production item have Remove from Scenes?**

YES / NO

**4. Do removed items stay removed after refresh?**

YES / NO

**5. Do new Studios default to Intro Video, Scene 1, Scene 2, Outro Video?**

YES / NO

**6. Can creators rename scenes using an editable text field?**

YES / NO

**7. Do custom scene names persist after refresh?**

YES / NO

**8. Does stopping an Intro preview leave Background Music stopped?**

YES / NO

**9. Does Play Sequence still start and stop correctly?**

YES / NO

**10. Were all required Markdown files updated, committed, and pushed?**

YES / NO

Then provide:

- Root cause summary.
- Files changed.
- Test results.
- Production Worker identifier.
- Rollback Worker identifier.
- Source commit.
- Application commit.
- Documentation commit.
- Known limitations.

If any required answer is NO, report the directive as incomplete.

---

# 17. ACCEPTANCE CRITERIA

Addendum E is complete only when:

1. All three-dot menus work.
2. All removable items offer Remove from Scenes.
3. Removal works without deleting underlying media.
4. Removed items remain removed.
5. New Studios use the four-item default arrangement.
6. Demo Scene is no longer used as a default name.
7. Creators can rename scenes.
8. Custom names persist.
9. Button dimensions remain consistent.
10. Stopping Intro preview does not trigger Background Music.
11. Play Sequence / Stop Sequence remains functional.
12. Drag-and-drop remains functional.
13. Per-Studio configuration remains isolated.
14. Existing playback automation remains intact.
15. Required regression tests pass.
16. The changes are deployed to the live website.
17. Live browser verification succeeds.
18. Markdown documentation is updated and pushed.

**Owner acceptance remains pending until the owner confirms the live interface behaves as intended.**

---

# FINAL INSTRUCTION TO LUNA

**Do not rebuild StudioFlow. Fix the remaining Scenes panel problems.**

The owner wants a simple, reliable default:

**Intro Video → Scene 1 → Scene 2 → Outro Video**

Every production-item button must have a working three-dot menu.

Every removable item must offer **Remove from Scenes**.

Creators must be able to rename their scenes.

Stopping an individual Intro preview must not start Background Music.

All changes must persist correctly.

**Deploy the corrections, verify them on the live website, and update the Markdown documentation.**

Do not report completion until these requirements have been demonstrated.

**END OF TPI-STUDIOFLOW-037 — ADDENDUM E**
