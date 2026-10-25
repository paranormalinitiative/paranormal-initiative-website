# TPI-STUDIOFLOW-037 — Scenes Redesign, Production Sequencing & Automated Broadcast Control

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-24 22:01.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-24-TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN.md](../300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN.md), [2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md](../300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md)
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
## TPI-STUDIOFLOW-037
### Scenes Redesign, Production Sequencing & Automated Broadcast Control

**Project:** StudioFlow  
**Directive:** TPI-STUDIOFLOW-037  
**Priority:** HIGH  
**Classification:** Production UI / Playback Architecture / Broadcast Automation  
**Status:** AUTHORIZED FOR IMPLEMENTATION  
**Scope:** StudioFlow Scenes panel, production items, preview behavior, opening and closing automation, and background music integration.

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
- Directives 028–036 and their completion records.

The agent MUST inspect the current implementation and its relevant tests before changing behavior.

**Authoritative development source:**

`/Users/toddknipple/Documents/StudioFlow/web`

The website repository is the staging, integration, testing, and deployment destination according to the governing source-to-live workflow.

Do not implement conflicting changes directly in a staged or generated bundle.

---

# 1. DIRECTIVE OBJECTIVE

Redesign StudioFlow's existing Scenes panel and establish a flexible production workflow supporting:

1. Uniform production-item buttons.
2. Drag-and-drop reordering.
3. Context-sensitive right-click menus.
4. Independent media previews.
5. Manual scene switching.
6. Automated opening sequences.
7. Automated closing sequences.
8. Optional cinematic countdown timers.
9. Optional Intro and Outro videos.
10. Existing background music integration.
11. Production sequence rehearsal.
12. Per-Studio configuration persistence.

The system MUST accommodate different creator workflows.

**No creator is required to use Intro videos, Outro videos, countdown timers, or background music.**

A single functioning scene must be sufficient to conduct a recording or livestream.

---

# 2. STUDIOFLOW DESIGN IDENTITY

StudioFlow must establish a distinct visual and functional identity.

The existing Scenes interface currently resembles competing broadcasting platforms too closely.

The redesigned panel must NOT reproduce the distinctive layout, styling, artwork, or visual presentation of StreamYard or OBS Studio.

These products may be examined for general workflow concepts, but their interface designs must not be copied.

StudioFlow's identity will be:

**A creator-controlled production workspace with optional automated opening and closing sequences.**

The interface should emphasize:

- Simplicity.
- Consistent visual hierarchy.
- Easy navigation.
- Clear production states.
- Fast manual scene switching.
- Configurable opening and closing behavior.
- Minimal visual clutter.
- StudioFlow's existing visual theme.

Do not redesign unrelated portions of the application.

---

# 3. SCENES PANEL REDESIGN

## 3.1 Uniform Production Buttons

Replace the current inconsistent presentation of scene and production items with a unified button design.

All production-item buttons must have:

- Consistent width.
- Consistent height.
- Consistent spacing.
- Consistent corner radius.
- Consistent typography.
- Consistent interaction behavior.
- A visible item name.
- An appropriate type icon.
- A drag handle.
- A context-menu affordance.

Buttons must use the existing StudioFlow theme.

Their borders should be slightly brighter than the surrounding interface so individual items are clearly distinguishable.

Avoid excessive glow, flashing, or distracting animation.

## 3.2 Visual States

Each item must support distinct visual states:

**Idle:** Available but not selected.

**Selected:** Currently selected in the interface.

**Previewing:** Playing in the preview environment.

**On Program:** Currently visible or audible in the active broadcast/recording output.

**Skipped:** Configured to be bypassed during automated opening or closing playback.

**Disabled/Unavailable:** Cannot currently be played because required media or configuration is unavailable.

These states must be visually distinguishable without relying exclusively on color.

## 3.3 Responsive Behavior

Maintain usability across supported desktop and tablet viewport sizes.

Do not allow the redesigned panel to overflow or obscure essential broadcast controls.

Ensure that button names remain readable and that controls remain accessible.

---

# 4. PRODUCTION ITEM TYPES

The Scenes panel must support the following production item types.

## 4.1 Intro Video

An optional opening video selected from existing StudioFlow media assets.

## 4.2 Countdown Timer

An optional cinematic countdown using the existing nine StudioFlow timer designs.

## 4.3 Scene

A live production scene containing the configured camera, guests, layouts, and other supported scene elements.

## 4.4 Video Clip

An optional prerecorded video that may be selected manually or included in a configured opening or closing sequence.

Use the existing Media Assets and Video Clips infrastructure.

Do not create an unrelated media-storage system.

## 4.5 Outro Video

An optional closing video selected from existing StudioFlow media assets.

## 4.6 Background Music

Background Music remains an audio configuration and playback service.

It must NOT be forced into the production sequence as a full-screen scene.

It may be associated with scene activation and production lifecycle events.

Preserve the existing Background Music panel and capabilities.

---

# 5. DRAG-AND-DROP REORDERING

Creators must be able to rearrange production items.

Requirements:

1. Drag an item by its handle.
2. Display a clear insertion indicator.
3. Drop the item into the desired position.
4. Update its displayed order.
5. Save the new order automatically.
6. Restore the order when reopening the Studio.
7. Preserve the order when switching between Studios.

Reordering must not cause active media to restart or interrupt a live broadcast.

Dragging must not accidentally activate the item.

Support keyboard-accessible Move Up and Move Down actions.

### Important architectural distinction

**Display order and automated playback order must not be confused.**

The Scenes panel may contain multiple live scenes in a creator-defined order, but StudioFlow must not automatically advance through those scenes during a broadcast.

Opening and closing sequences must have their own explicit configuration.

Reordering a live scene must not silently change which Intro, Countdown, or Outro is configured for automatic playback.

If production items are assigned to opening or closing sequences, their ordering within those sequences must be visible and configurable.

---

# 6. RIGHT-CLICK CONTEXT MENUS

Right-clicking a production item must open a floating context menu.

The same menu must be accessible through a visible three-dot control for touch devices and accessibility.

Menus must be context-sensitive.

## 6.1 Intro Video Menu

Supported actions:

- Preview.
- Use in Opening.
- Skip in Opening.
- Replace Video.
- Rename.
- Move Up.
- Move Down.
- Remove from Production.

## 6.2 Countdown Timer Menu

Supported actions:

- Preview.
- Use in Opening.
- Use in Closing.
- Skip in Sequence.
- Select Timer Design.
- Select Duration.
- Rename.
- Move Up.
- Move Down.
- Remove from Production.

## 6.3 Scene Menu

Supported actions:

- Preview.
- Set as Starting Scene.
- Edit Layout.
- Rename.
- Duplicate.
- Move Up.
- Move Down.
- Remove Scene.

Preserve existing scene-editing capabilities.

## 6.4 Video Clip Menu

Supported actions:

- Preview.
- Replace Video.
- Rename.
- Assign to Opening or Closing, where supported.
- Skip in Sequence.
- Move Up.
- Move Down.
- Remove from Production.

## 6.5 Outro Video Menu

Supported actions:

- Preview.
- Use in Closing.
- Skip in Closing.
- Replace Video.
- Rename.
- Move Up.
- Move Down.
- Remove from Production.

### Skip Behavior

Skipping an item must never delete it.

Skipped items remain available for preview and later reactivation.

Skipping must be saved per Studio.

---

# 7. AUTOMATED OPENING CONFIGURATION

StudioFlow must support configurable opening sequences.

Creators may select any of the following:

**Configuration A**

Intro Video → Starting Scene

**Configuration B**

Countdown Timer → Starting Scene

**Configuration C**

Countdown Timer → Intro Video → Starting Scene

**Configuration D**

Intro Video → Countdown Timer → Starting Scene

**Configuration E**

Starting Scene Only

The system must not require either a video or a countdown.

An opening sequence must support explicitly ordered eligible items rather than relying on assumptions about their position in the Scenes panel.

If a configured opening item is missing or invalid, the system must display a clear warning and use a safe, documented fallback. It must not leave the creator broadcasting a blank or stalled program.

---

# 8. AUTOMATED LIVESTREAM START

When the creator selects **Go Live**, StudioFlow must:

1. Begin the existing livestream initialization process.
2. Wait until the broadcasting service confirms the stream is active.
3. Begin a short, configurable opening delay.
4. Play the configured opening sequence.
5. Advance automatically between completed opening items.
6. Transition to the configured starting scene.
7. Begin optional scene background music according to its saved settings.
8. Enter normal manual production mode.

The default opening delay should be approximately three seconds, subject to the existing streaming architecture and owner-adjustable configuration.

**Do not start the opening media merely because the Go Live button was clicked.**

The broadcast must actually be established first.

The opening media must be delivered through the real program-output path.

Do not implement a preview-only simulation and represent it as live output.

---

# 9. AUTOMATED RECORDING START

When the creator selects **Record**, StudioFlow must:

1. Initialize the existing recording system.
2. Confirm that the recording process is active.
3. Apply the configured opening delay.
4. Play the configured opening sequence.
5. Transition into the starting scene.
6. Activate optional background music.
7. Continue recording until the creator requests completion.

The Intro or Countdown must be captured in the actual recording.

If recording initialization fails, do not falsely report that recording has started or trigger the automated opening as though capture were active.

Preserve Directive 035 recording and storage functionality.

---

# 10. MANUAL SCENE CONTROL

Once the opening sequence has completed, scene selection becomes manual.

Example:

Scene 1 — Main Podcast  
Scene 2 — Guest Interview  
Scene 3 — Investigation Footage

Clicking Scene 2 must switch directly to Scene 2.

Clicking Scene 3 must switch directly to Scene 3.

**No countdown timer should automatically appear between scenes unless the creator explicitly triggers one.**

No forced scene progression.

No mandatory timers.

No automatic switching merely because a scene has remained active for a certain duration.

The creator remains in control throughout the main program.

---

# 11. AUTOMATED CLOSING CONFIGURATION

StudioFlow must support configurable closing sequences.

Supported configurations:

**Configuration A**

Current Scene → Outro Video → End

**Configuration B**

Current Scene → Countdown Timer → End

**Configuration C**

Current Scene → Countdown Timer → Outro Video → End

**Configuration D**

Current Scene → Outro Video → Countdown Timer → End

**Configuration E**

Current Scene → End Immediately After Normal Finalization

Creators may use a countdown without an Outro video.

Creators may use an Outro video without a countdown.

Creators may use both.

Creators may use neither.

The configured order must be respected.

Opening and closing timers must support independent theme and duration selections.

---

# 12. AUTOMATED LIVESTREAM ENDING

When the creator selects **End Broadcast**, StudioFlow must initiate the closing workflow rather than immediately terminating the broadcast.

Required behavior:

1. Register the end request.
2. Enter a clearly indicated closing state.
3. Apply the configured closing delay.
4. Fade out scene background music, if configured.
5. Play the configured closing items in order.
6. Wait for the final closing item to finish.
7. Terminate the livestream using the existing shutdown process.
8. Confirm that the broadcast has ended.

The livestream must remain active throughout the closing media.

The UI must clearly indicate:

**CLOSING SEQUENCE — BROADCAST STILL LIVE**

Do not allow repeated End Broadcast clicks to restart the closing sequence.

Provide a separate **End Immediately** emergency action with appropriate safeguards.

### Failure handling

If closing media cannot load or play, the system must not remain indefinitely live.

Implement a bounded timeout and safe termination path with a clear error message.

---

# 13. AUTOMATED RECORDING ENDING

When the creator selects **Stop Recording**, StudioFlow must:

1. Register the stop request.
2. Begin the configured closing sequence.
3. Keep the recording active.
4. Capture the closing media.
5. Wait until closing playback finishes.
6. Stop the recording.
7. Finalize the recording file.
8. Execute the existing recording-save workflow.
9. Display the correct success or failure status.

**Never finalize the recording before the Outro or closing Countdown has been captured.**

If media playback or recording finalization fails, display the actual failure rather than a false success notification.

Preserve existing recording storage, local backup, and download functionality.

---

# 14. COMBINED LIVESTREAM AND RECORDING SESSIONS

StudioFlow must correctly handle sessions where the creator is livestreaming and recording simultaneously.

A shared closing sequence must not be started twice.

The program-output compositor must remain synchronized.

The closing sequence must be captured by all active supported outputs.

When the closing sequence finishes, the appropriate broadcast and recording finalization operations must occur.

If only one output is being stopped while another remains active, the system must not automatically terminate the remaining output.

The agent must inspect existing controls and lifecycle semantics before implementing combined-session behavior.

Where existing End Session controls imply stopping multiple outputs, preserve their meaning and clearly display what will end.

---

# 15. INDEPENDENT PREVIEW BEHAVIOR

This is a critical requirement.

**Individual preview playback must never automatically advance to another production item.**

Examples:

### Intro Preview

Click Intro Video.

Preview plays.

Click Stop.

Preview stops.

Nothing else starts.

### Countdown Preview

Click Countdown Timer.

Preview plays.

Countdown reaches zero.

Preview ends.

Nothing else starts.

### Outro Preview

Click Outro Video.

Preview plays.

Preview finishes.

Nothing else starts.

### Scene Preview

Select a scene for preview.

The preview changes to that scene without starting unrelated media.

Preview actions must not unintentionally change the live program output.

The implementation must explicitly separate:

- Preview state.
- Program-output state.
- Automated opening state.
- Automated closing state.
- Rehearsal state.

Do not reuse an automatic-advance callback in ordinary preview mode.

---

# 16. PLAY SEQUENCE — PRODUCTION REHEARSAL

Add a clearly visible:

**PLAY SEQUENCE**

control at the bottom of the redesigned Scenes panel.

This is a rehearsal feature.

It must allow creators to inspect how their configured opening and closing production items will behave.

### Rehearsal behavior

1. Start a local rehearsal.
2. Play the configured opening items in order.
3. Transition into the starting scene.
4. Pause automatic progression at the live scene.
5. Allow the creator to preview or manually switch scenes.
6. Provide an explicit **Preview Closing** or **Next to Closing** action.
7. Play the configured closing sequence.
8. Stop the rehearsal when closing playback finishes.

The rehearsal must not start a real livestream or recording.

It must not invoke actual broadcast termination or recording finalization.

It must not alter saved production configuration.

Provide Stop Rehearsal at any point.

**Rehearsal and live production must share the same sequence interpretation while remaining operationally isolated.**

---

# 17. BACKGROUND MUSIC INTEGRATION

Preserve the Background Music functionality developed under earlier StudioFlow directives.

Do not build another music player.

Allow creators to configure optional scene background music.

For example:

**Crossroads of the Unknown**

Opening: Intro Video

Main Scene: Background Music Enabled

Closing: Outro Video

The creator may select an existing music track, set its volume, and enable looping.

When the Main Scene begins:

- Start the selected track if configured.
- Fade in smoothly.
- Maintain the saved volume.
- Continue looping according to existing settings.

When the closing sequence begins:

- Fade the music out smoothly.
- Prevent unwanted overlapping music and closing media.
- Continue into the configured closing sequence.

Suggested optional controls:

- Enable Background Music.
- Select Existing Track.
- Volume.
- Loop.
- Fade In Duration.
- Fade Out Duration.

A creator may choose very subtle background music, such as approximately 5–10% volume.

These values are preferences, not mandatory defaults.

### Compatibility

Preserve existing After Intro Background Music behavior.

If an existing Studio has music configured under the previous playback contract, do not silently discard or overwrite that configuration.

Define a compatible mapping between existing settings and the new lifecycle.

Avoid creating duplicate playback sources.

---

# 18. CINEMATIC COUNTDOWN TIMERS

Preserve all nine countdown timer designs completed under Directive 036:

1. Classic Countdown.
2. Stargate Portal.
3. Alien Transmission.
4. Haunted Clock.
5. Spirit Manifestation.
6. EVP Signal.
7. ITC Communication.
8. Paranormal Energy Vortex.
9. Ghostly Countdown.

Preserve supported durations:

- 10 seconds.
- 20 seconds.
- 30 seconds.
- 60 seconds.

Opening and closing sequences must be able to select different timers and durations.

All countdown timers remain **SILENT**.

### Explicitly Out of Scope

Do NOT:

- Create music for the countdowns.
- Add automatic soundtracks.
- Generate sound effects.
- Integrate external music services.
- Add audio-generation dependencies.
- Redesign the nine approved countdown animations.

Original cinematic music for the timers is reserved for a future directive.

---

# 19. ADD PRODUCTION ITEM

Provide a clear **Add Production Item** control.

Depending on supported existing capabilities, it should offer:

- Scene.
- Intro Video.
- Countdown Timer.
- Video Clip.
- Outro Video.

The user must be able to add and configure an item without losing existing scene or media settings.

Reuse the current media library.

Do not duplicate stored video files merely because an asset is assigned to multiple production items.

Provide clear handling for missing media, invalid assignments, and duplicate references.

---

# 20. PER-STUDIO PERSISTENCE

All new configuration must be saved independently for each Studio.

Persist:

- Production-item ordering.
- Production-item names.
- Item types.
- Scene references.
- Video references.
- Countdown theme selections.
- Countdown durations.
- Opening sequence configuration.
- Closing sequence configuration.
- Skip settings.
- Starting scene.
- Background music configuration.
- Opening delay.
- Closing delay.
- Fade preferences.

Switching between Studios must restore the correct configuration.

Example:

**Crossroads of the Unknown**

Intro → Main Scene → Outro

**Studio 9 TPI Learning Test**

Stargate Countdown → Teaching Scene → Ghostly Countdown

Switching between these Studios must not overwrite either workflow.

Save changes automatically using the existing Studio persistence architecture.

Do not create an unrelated persistence mechanism.

Use versioned, backward-compatible configuration changes.

Existing Studios must continue loading correctly.

---

# 21. PRODUCTION STATE MANAGEMENT

Implement a clear production lifecycle.

Suggested conceptual states:

- IDLE
- INITIALIZING
- OPENING_DELAY
- OPENING_PLAYBACK
- MAIN_PROGRAM
- CLOSING_DELAY
- CLOSING_PLAYBACK
- FINALIZING
- COMPLETED
- ERROR

Preview and rehearsal require independent states.

The agent must adapt these concepts to the existing architecture rather than introducing a competing state-management system.

### Required guarantees

- Opening runs once per start operation.
- Closing runs once per end operation.
- Duplicate clicks do not create duplicate playback.
- A failed start cannot falsely trigger a successful opening.
- A failed closing item cannot trap a broadcast indefinitely.
- Scene switching does not reset the production lifecycle.
- Preview playback does not mutate live production state.
- Studio switching does not leak configuration.
- Timers and event listeners are cleaned up.
- Existing DOM mutation protections remain intact.

---

# 22. TRANSITION BEHAVIOR

Transitions should be smooth and professional.

Use existing StudioFlow compositor and transition capabilities where possible.

Opening-to-scene and scene-to-closing transitions should avoid:

- Black flashes.
- Unintended frozen frames.
- Audio pops.
- Sudden volume spikes.
- Duplicate video playback.
- Incorrect overlays.
- Unintended exposure of backstage controls.

Do not introduce a second compositor.

Do not introduce a separate timer engine.

Do not duplicate the media playback infrastructure.

All live and recorded content must pass through the authoritative program-output path.

---

# 23. EXISTING FUNCTIONALITY MUST BE PRESERVED

The following previously completed capabilities must remain operational:

**Directive 028:** Intro/Outro playback and After Intro music.

**Directive 029:** Playback contract and documentation.

**Directive 030:** Sound Effects organization and persistence.

**Directive 031:** Background Music controls and persistence.

**Directive 032:** Soundboard icon integration.

**Directive 033:** Studio-specific video clip and orientation persistence.

**Directive 034:** DOM mutation storm prevention.

**Directive 035:** Recording & Storage consolidation and Teleprompter placement.

**Directive 036:** Nine cinematic countdown timers.

Also preserve:

- Guest management.
- Camera and microphone controls.
- Scene layouts.
- Existing overlays.
- Media assets.
- Voice effects.
- Banners.
- Notes.
- Private chat.
- Recording controls.
- Existing supported livestream destinations.

Do not remove unrelated functionality.

---

# 24. TESTING REQUIREMENTS

The agent must implement and execute regression tests covering the new behavior.

## 24.1 Scenes Panel

Verify:

- Uniform button styling.
- Drag-and-drop ordering.
- Keyboard reordering.
- Right-click menus.
- Three-dot menus.
- Selection highlighting.
- Live/preview indicators.
- Per-Studio persistence.

## 24.2 Opening Automation

Test every supported opening configuration.

Verify:

- No Intro required.
- No Countdown required.
- Intro-only opening.
- Timer-only opening.
- Timer followed by Intro.
- Intro followed by Timer.
- Direct-to-scene opening.
- Correct opening delay.
- Correct starting scene.

## 24.3 Closing Automation

Test every supported closing configuration.

Verify:

- Outro-only closing.
- Timer-only closing.
- Timer followed by Outro.
- Outro followed by Timer.
- Direct ending.
- Correct closing delay.
- Closing media completes before termination.
- Emergency immediate termination.

## 24.4 Preview Isolation

Verify:

- Stopping Intro preview does not start music.
- Stopping Intro preview does not start a scene.
- Countdown preview completion does not advance.
- Outro preview completion does not advance.
- Previewing does not interrupt live program output.
- Rehearsal does not create a real broadcast or recording.

## 24.5 Recording

Verify:

- Opening media appears in recording.
- Closing media appears in recording.
- Recording finalizes correctly.
- Save notifications reflect actual outcomes.
- Existing storage functionality remains intact.

## 24.6 Livestreaming

Verify, using safe test infrastructure:

- Opening begins only after confirmed stream initialization.
- Closing plays before broadcast termination.
- Duplicate end requests do not create duplicate sequences.
- Failed media playback follows a safe termination path.
- Stream failures do not produce false success messages.

Do not initiate a public production livestream without explicit owner authorization.

## 24.7 Background Music

Verify:

- Music fades in when configured.
- Music loops correctly.
- Music remains optional.
- Music fades out for closing.
- No duplicate music playback.
- Existing music settings remain compatible.

## 24.8 Timer Regression

Run the existing Directive 036 regression suite.

All nine timers must continue working.

All supported durations must remain functional.

## 24.9 Performance Regression

Run Directive 034 DOM mutation protection tests.

Verify that the redesigned Scenes panel does not recreate the previous self-sustaining mutation problem.

Check for:

- Excessive DOM mutation activity.
- Duplicate event listeners.
- Timer leaks.
- Audio playback leaks.
- Unnecessary React remounts.
- Excessive rendering during countdown playback.

---

# 25. DEPLOYMENT AND PRODUCTION SAFETY

Follow the governing source-to-live workflow without shortcuts.

Required:

1. Inspect the current source and working tree.
2. Identify the authoritative components.
3. Implement changes in the correct source repository.
4. Add or update automated tests.
5. Run local validation.
6. Produce the reproducible staged bundle.
7. Run integration and API tests.
8. Verify production safety checks.
9. Complete the Markdown documentation gate.
10. Deploy only through the authorized release process.
11. Run safe post-deployment verification.
12. Record the production Worker identifier and rollback identifier.

**Production data protection is mandatory.**

Do not:

- Delete production Studios.
- Modify owner recordings.
- Delete R2 media.
- Reset production D1 data.
- Run destructive migrations.
- Replace saved Studio configurations without migration compatibility.
- Start a public broadcast for testing.
- Modify unrelated applications.

If the release workflow requires an additional approval gate, stop at that gate.

---

# 26. MANDATORY MARKDOWN DOCUMENTATION GATE

This directive is NOT complete until all relevant documentation has been updated.

Required updates include, where applicable:

- TPI-CURRENT-DEVELOPMENT-STATUS.md
- TPI-DEVELOPMENT-AGENT-HANDOFF.md
- DIRECTIVE-INDEX.md
- TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md
- StudioFlow workspace/configuration documentation.
- Testing and verification records.
- Relevant README files.
- A dated Directive 037 completion record.

The completion record must explain:

**WHO:** Agent and implementation responsibility.

**WHAT:** Features implemented.

**WHERE:** Source files, tests, and affected components.

**WHEN:** Completion and deployment timestamps.

**WHY:** Product and workflow requirements.

**HOW:** Architecture, state management, persistence, and playback integration.

Also include:

- Tests executed.
- Pass/fail results.
- Known limitations.
- Source commit.
- Application/staging commit.
- Documentation commit.
- Production Worker identifier.
- Rollback Worker identifier.
- Confirmation of production data protection.

Preserve historical documentation.

Do not overwrite previous directive completion records.

Commit and push documentation according to the governing workflow.

---

# 27. ACCEPTANCE CRITERIA

Directive 037 is complete only when:

1. The Scenes panel uses a consistent StudioFlow-specific design.
2. Production items can be reordered.
3. Context menus work.
4. Existing scenes remain functional.
5. Opening videos are optional.
6. Closing videos are optional.
7. Countdown timers are optional.
8. Timer-only opening and closing workflows function.
9. Creators can start directly on a scene.
10. Creators can end without closing media.
11. Livestream opening automation works.
12. Recording opening automation works.
13. Livestream closing automation works.
14. Recording closing automation works.
15. Live scenes remain manually controlled.
16. Individual previews never auto-advance.
17. Play Sequence rehearsal works independently.
18. Background music integrates without duplication.
19. All nine timers remain silent and functional.
20. All settings persist independently per Studio.
21. Existing recording and storage behavior remains intact.
22. Existing performance protections remain intact.
23. Automated tests and release gates pass.
24. Documentation is completed and pushed.
25. Deployment and rollback information is recorded.

---

# 28. REQUIRED FINAL AGENT REPORT

When implementation is complete, provide:

**TPI-STUDIOFLOW-037 — IMPLEMENTATION REPORT**

Include:

1. Implementation status.
2. Scenes panel redesign summary.
3. Opening automation summary.
4. Closing automation summary.
5. Preview isolation results.
6. Background music integration results.
7. Per-Studio persistence results.
8. Regression test results.
9. Performance test results.
10. Deployment status.
11. Production Worker identifier.
12. Rollback Worker identifier.
13. Source commit.
14. Application commit.
15. Documentation commit.
16. Remaining limitations or follow-up work.

Do not report DEPLOYED_AND_VERIFIED unless deployment and required post-deployment verification have actually succeeded.

---

# FINAL DEVELOPMENT PRINCIPLE

**StudioFlow must adapt to the creator—not force the creator into a predetermined broadcast structure.**

A creator may use:

**Intro Video → Main Scene → Outro Video**

Another may use:

**Countdown → Main Scene → Countdown**

Another may use:

**Countdown → Intro → Main Scene → Outro**

And another may simply use:

**Main Scene**

All are valid StudioFlow productions.

Opening and closing automation should be intelligent, reliable, and optional.

During the main program, scene control belongs to the creator.

**Preserve what works. Improve what needs improvement. Build StudioFlow's own identity.**

**END OF DIRECTIVE TPI-STUDIOFLOW-037**
