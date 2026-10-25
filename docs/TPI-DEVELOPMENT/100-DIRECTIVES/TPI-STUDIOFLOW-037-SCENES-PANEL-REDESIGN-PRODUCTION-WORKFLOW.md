# TPI-STUDIOFLOW-037 — Scenes Panel Redesign & Production Workflow Refinement

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-24 22:04.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-24-TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN.md](../300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN.md), [2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md](../300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md)
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
## TPI-STUDIOFLOW-037
### Scenes Panel Redesign & Production Workflow Refinement

**Project:** StudioFlow  
**Directive:** TPI-STUDIOFLOW-037  
**Priority:** HIGH  
**Classification:** User Interface / User Experience / Existing Workflow Refinement  
**Status:** AUTHORIZED FOR IMPLEMENTATION  
**Implementation Approach:** Preserve existing production architecture. Modify the Scenes interface and necessary interaction behavior only.

---

# 0. MANDATORY GOVERNING DOCUMENTATION

**STOP. READ BEFORE MAKING ANY MODIFICATIONS.**

The development agent MUST read the following documents completely:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

These documents govern development, testing, documentation, deployment, and production safety.

Additional required references, where present:

- TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md
- TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md
- TPI-CURRENT-DEVELOPMENT-STATUS.md
- TPI-DEVELOPMENT-AGENT-HANDOFF.md
- DIRECTIVE-INDEX.md
- 009-TESTING-AND-VERIFICATION.md
- Relevant completion records for Directives 028–036.

**Authoritative StudioFlow development source:**

`/Users/toddknipple/Documents/StudioFlow/web`

The website repository remains the staging, integration, testing, and deployment destination under the established source-to-live workflow.

The agent MUST inspect the current implementation before making changes.

---

# 1. CRITICAL SCOPE CLARIFICATION

**STUDIOFLOW ALREADY SUPPORTS AUTOMATIC INTRO AND OUTRO PLAYBACK.**

This directive does NOT authorize rebuilding the existing production automation system.

StudioFlow already has functioning systems for:

- Intro video playback.
- Outro video playback.
- Countdown timers.
- Scene selection.
- Background music.
- Livestreaming.
- Recording.
- Media assets.
- Program output.
- Per-Studio configuration.

These systems must be preserved.

The objective of Directive 037 is to improve the Scenes panel's appearance, organization, and interaction behavior while integrating with the existing production functionality.

### DO NOT:

1. Rebuild the Intro/Outro engine.
2. Replace the countdown timer engine.
3. Create another program-output compositor.
4. Replace the recording architecture.
5. Replace the livestream architecture.
6. Introduce competing playback state management.
7. Duplicate the Background Music player.
8. Rewrite working functionality unnecessarily.
9. Modify unrelated StudioFlow components.

**Reuse the existing implementation wherever possible.**

Any behavioral changes must be narrowly scoped, justified, tested, and backward-compatible.

---

# 2. PRIMARY OBJECTIVE

Redesign StudioFlow's Scenes panel so it no longer closely resembles StreamYard's presentation.

The redesigned panel must provide:

1. A distinctive StudioFlow visual identity.
2. Uniform production-item buttons.
3. Consistent button sizing.
4. Brighter theme-colored button outlines.
5. Drag-and-drop organization.
6. Per-Studio arrangement persistence.
7. Right-click context menus.
8. Clear selection and playback indicators.
9. Independent preview behavior.
10. A Play Sequence rehearsal control.
11. Easy access to existing Intro, Outro, Countdown, Scene, and Video Clip functionality.

The redesign must remain visually consistent with the rest of StudioFlow.

**Do not redesign the entire application.**

---

# 3. VISUAL DESIGN — UNIFORM SCENE BUTTONS

The current Scenes panel contains production elements with inconsistent visual presentation.

Replace this with a clean, consistent arrangement of production-item buttons.

### Required design

Every production-item button must use:

- The same width.
- The same height.
- The same corner radius.
- Consistent spacing.
- Consistent typography.
- Consistent icon sizing.
- A subtle but clearly visible border.
- A slightly brighter outline matching the current StudioFlow theme.
- A drag handle.
- A context-menu control.

The visual design should be professional, modern, and unmistakably StudioFlow.

### Suggested structure

```text
┌───────────────────────────────┐
│           SCENES              │
├───────────────────────────────┤
│                               │
│ ≡  INTRO VIDEO            ⋮   │
│                               │
│ ≡  MAIN PODCAST           ⋮   │
│                               │
│ ≡  GUEST INTERVIEW        ⋮   │
│                               │
│ ≡  INVESTIGATION SCENE    ⋮   │
│                               │
│ ≡  OUTRO VIDEO            ⋮   │
│                               │
├───────────────────────────────┤
│ + ADD PRODUCTION ITEM         │
│                               │
│ ▶ PLAY SEQUENCE               │
└───────────────────────────────┘
```

This is a conceptual layout, not a requirement to reproduce the ASCII illustration literally.

The agent should adapt it to StudioFlow's existing design system.

### Visual states

Buttons must clearly distinguish:

- Idle.
- Selected.
- Previewing.
- Currently on program.
- Skipped in an automated sequence.
- Unavailable or missing media.

Use appropriate icons or labels in addition to color.

Do not introduce excessive animation or visual clutter.

---

# 4. SCENES AND PRODUCTION ITEMS

The panel should present the creator's available production elements consistently.

Supported types include:

**Intro Video:** Existing opening video functionality.

**Countdown Timer:** Existing nine cinematic countdown timers.

**Scene:** Existing camera, guest, and layout configurations.

**Video Clip:** Existing prerecorded video functionality.

**Outro Video:** Existing closing video functionality.

These items must use the same general button design.

However, their actions and configuration menus may differ according to their purpose.

### Important distinction

Background Music is not a visual scene.

Preserve the existing Background Music system and controls.

Do not force background music into the Scenes list as a full-size production item.

---

# 5. DRAG-AND-DROP SCENE ORGANIZATION

Creators must be able to rearrange items in the Scenes panel.

### Required behavior

1. Click and hold the drag handle.
2. Move the item to the desired position.
3. Display a clear insertion indicator.
4. Release to place the item.
5. Update the displayed order.
6. Save the arrangement automatically.
7. Restore the arrangement when the Studio is reopened.

The arrangement must remain independent for each Studio.

### Example

**Crossroads of the Unknown**

Intro Video  
Main Podcast  
Guest Interview  
Outro Video

**TPI Learning Studio**

Countdown Timer  
Teaching Scene  
Demonstration Scene  
Outro Video

Each Studio retains its own arrangement.

### Important safety rule

**Rearranging items must not unexpectedly change existing live production behavior.**

The visual arrangement and the configured automatic opening/closing sequence must remain distinguishable.

If a user changes the order of items assigned to an automated sequence, StudioFlow should update that sequence only through an explicit, understandable interaction.

Do not silently change existing Intro/Outro assignments merely because a scene button was moved.

Dragging an item must not trigger playback.

Reordering must not interrupt an active livestream or recording.

Provide Move Up and Move Down actions for keyboard accessibility.

---

# 6. RIGHT-CLICK CONTEXT MENUS

Right-clicking any production-item button must open a floating menu containing actions relevant to that item.

The same actions must be accessible through a visible three-dot button.

Menus must be positioned correctly within the viewport and must not be clipped by the Scenes panel.

## 6.1 Intro Video

Available actions should include:

- Preview.
- Configure Opening.
- Skip in Opening.
- Replace Video.
- Rename.
- Move Up.
- Move Down.
- Remove from Panel.

## 6.2 Countdown Timer

Available actions should include:

- Preview.
- Configure Timer.
- Select Timer Design.
- Select Duration.
- Use in Opening.
- Use in Closing.
- Skip in Sequence.
- Rename.
- Move Up.
- Move Down.
- Remove from Panel.

## 6.3 Scene

Available actions should include:

- Preview.
- Set as Starting Scene.
- Edit Scene.
- Edit Layout.
- Rename.
- Duplicate.
- Move Up.
- Move Down.
- Remove Scene.

## 6.4 Video Clip

Available actions should include:

- Preview.
- Replace Video.
- Configure Playback.
- Rename.
- Move Up.
- Move Down.
- Remove from Panel.

## 6.5 Outro Video

Available actions should include:

- Preview.
- Configure Closing.
- Skip in Closing.
- Replace Video.
- Rename.
- Move Up.
- Move Down.
- Remove from Panel.

### Implementation requirement

Use existing actions, configuration controls, and playback services wherever available.

Do not create duplicate functionality.

If an action does not exist in the current application, implement only the minimum necessary integration.

Do not expose nonfunctional menu options.

---

# 7. SKIP FUNCTIONALITY

Creators must be able to skip optional opening and closing items.

Examples:

A creator has an Intro Video configured but wants to begin directly with a countdown.

They can right-click the Intro and select:

**Skip in Opening**

The Intro remains configured and available for future use.

It is simply bypassed during the automated opening.

The same principle applies to optional closing media.

### Requirements

- Skipping does not delete media.
- Skipping does not remove the item from the panel.
- Skipped items remain available for manual preview.
- Skipped status is visually identifiable.
- Skipped status persists per Studio.
- Re-enabling an item restores its previous configuration.

Do not introduce new automation architecture to implement skipping.

Integrate with the existing opening and closing configuration.

---

# 8. PRESERVE EXISTING INTRO AND OUTRO AUTOMATION

StudioFlow already performs automatic opening and closing playback.

**Preserve that functionality.**

The existing Go Live, Record, End Broadcast, and End Session controls must continue operating according to their established behavior.

The redesign must not require creators to manually play their Intro or Outro if automatic playback is already configured.

### Supported creator workflows

The interface must accommodate:

**Workflow A**

Intro Video → Main Scene → Outro Video

**Workflow B**

Countdown Timer → Main Scene → Countdown Timer

**Workflow C**

Countdown Timer → Intro Video → Main Scene → Outro Video

**Workflow D**

Intro Video → Countdown Timer → Main Scene → Outro Video

**Workflow E**

Main Scene Only

Opening and closing media remain optional.

The agent must first determine which combinations the existing implementation already supports.

Preserve those combinations without modification.

Where an additional combination requires a small configuration or ordering adjustment, implement it through the existing playback system.

Do not expand this directive into a general-purpose broadcast automation rebuild.

### Production timing

Preserve the existing delay and start/end behavior.

Verify that opening media is not lost before livestream or recording capture begins.

Verify that closing media finishes before the relevant output is finalized.

Correct an identified defect if necessary, but do not replace the working lifecycle.

---

# 9. MANUAL SCENE SWITCHING

During the main broadcast or recording, scene selection remains manual.

Example:

Scene 1 — Main Podcast  
Scene 2 — Guest Interview  
Scene 3 — Investigation Footage

Clicking Scene 2 switches directly to Scene 2.

Clicking Scene 3 switches directly to Scene 3.

**Do not automatically advance through scenes.**

Do not insert countdown timers between scene changes unless explicitly requested by the creator.

The Scenes panel should function as an immediate production-control interface.

Manual scene switching must preserve existing camera, guest, layout, and compositor behavior.

---

# 10. CRITICAL PREVIEW BEHAVIOR CORRECTION

The owner has identified an existing preview behavior that must be corrected.

Currently, stopping an Intro preview may trigger Background Music or advance to the next production element.

**This must not happen during individual preview.**

### Required behavior

When the creator clicks an individual item to preview it:

1. Only that item plays.
2. Stop stops that item.
3. No other item automatically starts.
4. No automatic sequence progression occurs.
5. Existing saved production settings remain unchanged.

### Intro example

Click Intro.

Intro previews.

Click Stop.

Intro stops.

**Nothing else plays.**

### Countdown example

Click Countdown.

Countdown previews.

Countdown reaches zero or is stopped.

**Nothing else plays.**

### Outro example

Click Outro.

Outro previews.

Outro finishes.

**Nothing else plays.**

### Background Music example

Preview a music track.

Stop playback.

**Do not automatically activate a scene or another media item.**

### Architectural requirement

The agent must identify the existing callback or state transition responsible for unwanted advancement.

Correct it at the appropriate interaction boundary.

Do not disable automatic advancement during actual opening or closing playback.

**Automatic progression belongs to production automation and sequence rehearsal—not isolated previews.**

---

# 11. PLAY SEQUENCE — REHEARSAL CONTROL

Add a **PLAY SEQUENCE** control at the bottom of the Scenes panel.

This feature allows creators to rehearse their configured production flow without going live or starting a recording.

It must use existing media playback and preview capabilities wherever possible.

### Required behavior

When Play Sequence is selected:

1. Begin the configured opening sequence.
2. Play enabled opening items in their saved order.
3. Automatically advance between opening media.
4. Transition to the configured starting scene.
5. Remain on that scene until the creator manually selects another scene or requests the closing sequence.
6. Allow the creator to preview the configured closing sequence.
7. End rehearsal after the closing media finishes.

### Controls

Provide:

- Play Sequence.
- Stop Rehearsal.
- Preview Closing or an equivalent clearly labeled action.

The exact presentation may be adapted to the existing interface.

### Critical restrictions

Rehearsal must not:

- Start a real livestream.
- Start a recording.
- Terminate an active broadcast.
- Finalize a recording.
- Modify saved sequence settings.
- Trigger unrelated production actions.

If a live broadcast or recording is already active, the interface must prevent rehearsal actions from unintentionally affecting program output.

### Scope restriction

Do not create a second production engine.

Implement rehearsal as a controlled preview mode using the existing sequence and media systems.

---

# 12. OPTIONAL OPENING AND CLOSING CONFIGURATIONS

The owner has confirmed that some creators use videos, some use timers, some use both, and some use neither.

StudioFlow must accommodate those choices.

### Opening examples

- Intro → Scene.
- Countdown → Scene.
- Countdown → Intro → Scene.
- Intro → Countdown → Scene.
- Scene Only.

### Closing examples

- Scene → Outro.
- Scene → Countdown.
- Scene → Countdown → Outro.
- Scene → Outro → Countdown.
- Scene → End.

The interface should make these choices easy to understand.

### Implementation guidance

First reuse existing Intro, Outro, and Timer assignments.

Where supported, expose configuration through the new context menus.

Do not introduce a new sequence database or independent playback service.

Any necessary configuration additions must remain compatible with existing Studio data.

---

# 13. BACKGROUND MUSIC

Preserve the existing Background Music system developed in previous directives.

The owner may use subtle background music during a podcast to avoid complete silence between conversations.

Example:

**Crossroads of the Unknown**

Intro Video → Main Podcast → Outro Video

During Main Podcast:

- Optional background music.
- Very low volume.
- Looping enabled.
- Existing track selection.
- Existing playback controls.

### Desired refinement

Where compatible with the current implementation, allow:

- Fade in when the Main Scene begins.
- Fade out when the closing sequence begins.

Reuse the current audio playback infrastructure.

Do not introduce another audio player.

Do not change the behavior of existing Studios without accounting for their saved settings.

### Important

Background music for the podcast is separate from future cinematic soundtracks for countdown timers.

No new timer music is authorized.

---

# 14. PRESERVE ALL NINE CINEMATIC COUNTDOWN TIMERS

Directive 036 has already delivered nine cinematic countdown designs.

They must remain intact:

1. Classic Countdown.
2. Stargate Portal.
3. Alien Transmission.
4. Haunted Clock.
5. Spirit Manifestation.
6. EVP Signal.
7. ITC Communication.
8. Paranormal Energy Vortex.
9. Ghostly Countdown.

Supported durations remain:

- 10 seconds.
- 20 seconds.
- 30 seconds.
- 60 seconds.

The timers must remain silent.

Do not redesign the timers.

Do not recreate their animation engines.

Do not introduce audio tracks or music-generation functionality.

The new Scenes panel should reference and control the existing timers.

---

# 15. ADD PRODUCTION ITEM

Provide an **ADD PRODUCTION ITEM** control within the redesigned Scenes panel.

It should allow creators to access supported production elements, including:

- Scene.
- Intro Video.
- Countdown Timer.
- Video Clip.
- Outro Video.

Use the existing StudioFlow media library and scene-management functionality.

Do not duplicate uploaded assets.

Do not create another video library.

Where an item type is already managed elsewhere in the interface, the new control should open or reuse the existing configuration workflow.

---

# 16. PER-STUDIO PERSISTENCE

The redesigned Scenes panel must preserve configuration independently for each Studio.

Persist:

- Item ordering.
- Item names.
- Scene references.
- Media references.
- Skip settings.
- Opening assignments.
- Closing assignments.
- Timer selections.
- Timer durations.
- Starting scene.
- Relevant existing music settings.

Do not overwrite existing configuration fields unnecessarily.

Do not introduce a competing persistence system.

Use the established Studio configuration mechanism.

### Studio switching

Switching between Studios must:

1. Save pending changes according to the existing persistence contract.
2. Load the selected Studio's configuration.
3. Restore its Scenes panel arrangement.
4. Restore its production-item settings.
5. Preserve the current Studio's saved configuration.

Do not allow settings to leak between Studios.

---

# 17. PERFORMANCE AND RESOURCE SAFETY

Directive 034 corrected a serious DOM mutation problem.

The redesigned Scenes panel must not reintroduce it.

### Requirements

- Avoid self-triggering DOM observers.
- Avoid unnecessary component remounting.
- Avoid repeated event-handler registration.
- Clean up drag-and-drop listeners.
- Clean up preview timers.
- Clean up media listeners.
- Avoid duplicated playback callbacks.
- Preserve existing timer performance.

The interface should remain responsive during countdown animations, scene switching, and media playback.

---

# 18. EXISTING SYSTEMS THAT MUST REMAIN INTACT

Preserve all completed work from Directives 028–036.

Particularly:

**028:** Intro/Outro playback and automatic music behavior.

**029:** Playback contract and documentation.

**030:** Sound Effects functionality.

**031:** Background Music functionality.

**032:** Soundboard visual assets.

**033:** Per-Studio video clip and orientation persistence.

**034:** DOM mutation storm correction.

**035:** Recording & Storage and Teleprompter integration.

**036:** Nine cinematic countdown timers.

Also preserve:

- Camera and microphone controls.
- Guest management.
- Existing scene layouts.
- Recording controls.
- Livestreaming controls.
- Media Assets.
- Video Clips.
- Sound Effects.
- Voice FX.
- Banners.
- Notes.
- Teleprompter.
- Private chat.
- Recording storage.

No unrelated functionality should be removed or rewritten.

---

# 19. REQUIRED TESTING

The agent must run the existing StudioFlow regression suites and add targeted tests for Directive 037.

## 19.1 Visual Interface

Verify:

- Uniform button dimensions.
- Consistent spacing.
- Correct theme-colored borders.
- Visible selected state.
- Visible preview state.
- Visible active-program state.
- Responsive layout.
- Context-menu positioning.

## 19.2 Drag-and-Drop

Verify:

- Items can be reordered.
- Reordering persists.
- Reordering does not trigger playback.
- Reordering does not interrupt a live session.
- Studio switching restores the correct order.
- Keyboard movement works.

## 19.3 Context Menus

Verify:

- Right-click opens the correct menu.
- Three-dot controls open the same menu.
- Skip works.
- Rename works.
- Configure actions use existing systems.
- Disabled or unavailable actions are handled correctly.

## 19.4 Preview Isolation

Verify:

- Intro preview stops without advancing.
- Countdown preview stops without advancing.
- Outro preview stops without advancing.
- Background Music preview stops without advancing.
- Individual preview completion does not start unrelated media.
- Preview does not accidentally alter active program output.

## 19.5 Existing Automation

Verify:

- Existing automatic Intro playback still works.
- Existing automatic Outro playback still works.
- Existing countdown playback still works.
- Existing recording automation still works.
- Existing livestream automation still works.
- Closing media is not cut off prematurely.
- Optional opening and closing items are handled correctly.

## 19.6 Rehearsal

Verify:

- Play Sequence previews the configured opening.
- Opening items advance in the correct order.
- Live scenes do not auto-advance.
- Closing preview works.
- Stop Rehearsal stops playback.
- Rehearsal does not start or stop real outputs.

## 19.7 Persistence

Verify:

- Studio A retains its configuration.
- Studio B retains a different configuration.
- Reordering survives reload.
- Skip settings survive reload.
- Existing Studio settings remain compatible.

## 19.8 Regression

Run all applicable existing regression suites.

Specifically include:

- Directive 034 DOM mutation protections.
- Directive 035 recording and storage tests.
- Directive 036 timer regression tests.
- Existing playback and persistence tests.

Document all results.

---

# 20. IMPLEMENTATION BOUNDARIES

This directive is primarily a **UI and interaction refinement**.

The development agent should favor:

- Reusing existing React components.
- Reusing existing media controls.
- Reusing existing scene-management functions.
- Reusing existing persistence.
- Reusing existing playback state.
- Adding small, targeted components where necessary.
- Correcting identified preview behavior.
- Implementing a lightweight rehearsal interface.

### Avoid

- Large-scale architecture changes.
- New production engines.
- Unnecessary database migrations.
- Replacing the compositor.
- Rebuilding Intro/Outro automation.
- Reimplementing the timer designs.
- Duplicating media services.
- Introducing unrelated features.

If an existing subsystem cannot support a requested interaction without significant architectural changes, document the limitation and propose the smallest safe solution before expanding the scope.

---

# 21. PRODUCTION DEPLOYMENT SAFETY

Follow the established source-to-live workflow.

Required:

1. Inspect the current source.
2. Confirm the authoritative implementation.
3. Implement changes in the correct development source.
4. Run local tests.
5. Build the staged application.
6. Run integration tests.
7. Run release-safety checks.
8. Complete documentation.
9. Deploy through the authorized release process.
10. Verify the live deployment safely.
11. Record the production Worker identifier and rollback identifier.

Do not:

- Delete production Studios.
- Reset production D1 data.
- Delete R2 media.
- Modify owner recordings.
- Perform destructive migrations.
- Start public livestreams during testing.
- Modify unrelated projects.

Preserve the existing rollback process.

---

# 22. MANDATORY MARKDOWN DOCUMENTATION GATE

Directive 037 is not complete until the required Markdown documentation is updated.

Update relevant documents, including:

- TPI-CURRENT-DEVELOPMENT-STATUS.md
- TPI-DEVELOPMENT-AGENT-HANDOFF.md
- DIRECTIVE-INDEX.md
- TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md, if behavior changes.
- StudioFlow workspace/configuration documentation, if applicable.
- Testing and verification records.
- Relevant README files.
- A dated Directive 037 completion record.

The completion record must include:

**WHO:** Implementing agent.

**WHAT:** Changes completed.

**WHERE:** Source files and components.

**WHEN:** Implementation and deployment timestamps.

**WHY:** Visual differentiation and workflow improvements.

**HOW:** Implementation approach and integration with existing systems.

Also include:

- Tests performed.
- Pass/fail results.
- Known limitations.
- Source commit.
- Application/staging commit.
- Documentation commit.
- Production Worker identifier.
- Rollback Worker identifier.

Preserve historical documentation.

Commit and push changes according to the governing workflow.

---

# 23. ACCEPTANCE CRITERIA

Directive 037 is complete when:

1. The Scenes panel has a distinctive StudioFlow appearance.
2. Production buttons have consistent dimensions.
3. Buttons have brighter theme-colored outlines.
4. Items can be reordered through drag-and-drop.
5. Item ordering persists per Studio.
6. Right-click menus work.
7. Three-dot menus provide equivalent access.
8. Skip functionality works without deleting media.
9. Existing scene selection continues working.
10. Manual scene switching remains immediate.
11. Individual previews never automatically advance.
12. Play Sequence rehearsal works.
13. Existing Intro automation remains functional.
14. Existing Outro automation remains functional.
15. Countdown-only workflows remain supported.
16. Video-only workflows remain supported.
17. Creators can operate without Intro, Outro, or Countdown media.
18. Existing Background Music functionality remains intact.
19. All nine cinematic timers remain functional and silent.
20. Existing recording and livestream systems remain functional.
21. Existing per-Studio configuration remains intact.
22. Directive 034 performance protections remain effective.
23. Regression tests pass.
24. Documentation is completed and pushed.
25. Production deployment and verification are completed according to the governing workflow.

---

# 24. REQUIRED FINAL AGENT REPORT

Provide:

**TPI-STUDIOFLOW-037 — COMPLETION REPORT**

Include:

1. Implementation status.
2. Scenes panel visual changes.
3. Drag-and-drop functionality.
4. Context-menu functionality.
5. Preview behavior correction.
6. Play Sequence rehearsal.
7. Existing automation verification.
8. Background Music compatibility.
9. Timer compatibility.
10. Per-Studio persistence verification.
11. Regression test results.
12. Performance test results.
13. Deployment status.
14. Production Worker identifier.
15. Rollback Worker identifier.
16. Source commit.
17. Application commit.
18. Documentation commit.
19. Remaining limitations.

Do not claim DEPLOYED_AND_VERIFIED unless the actual deployment and required verification have succeeded.

---

# FINAL DIRECTIVE

**StudioFlow already has the production functionality. We are improving how creators see it, organize it, and control it.**

Do not rebuild working systems.

The redesigned Scenes panel must be visually distinctive, organized, intuitive, and flexible.

Creators should be able to arrange their production items, preview them independently, and control their shows without unnecessary automatic scene transitions.

Existing Intro, Outro, Countdown, Background Music, Recording, and Livestream functionality must remain intact.

**Our goal is not to recreate StreamYard or OBS Studio. Our goal is to make StudioFlow its own professional production environment.**

**END OF DIRECTIVE TPI-STUDIOFLOW-037**
