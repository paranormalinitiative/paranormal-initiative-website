# TPI-STUDIOFLOW-031 — Background Music Interface Cleanup and Drag-and-Drop Reordering

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-24 00:32.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-24-TPI-STUDIOFLOW-031-BACKGROUND-MUSIC-PAD-REORDERING.md](../300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-031-BACKGROUND-MUSIC-PAD-REORDERING.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-031
## BACKGROUND MUSIC INTERFACE CLEANUP AND DRAG-AND-DROP PAD REORDERING

**Project:** The Paranormal Initiative — StudioFlow  
**Priority:** HIGH  
**Development Agent:** FreeBuff / MiMO 2.6 Pro  
**Area:** StudioFlow — Background Music  
**Reference Implementation:** TPI-STUDIOFLOW-030 — Sound Effects  
**Objective:** Remove unnecessary pad menus and introduce customizable drag-and-drop ordering with automatic per-studio persistence.

---

# 1. MANDATORY DEVELOPMENT AUTHORITY

**PRIORITY: CRITICAL — NON-NEGOTIABLE**

Before investigating, modifying, repairing, testing, committing, or deploying any StudioFlow functionality, the development agent MUST read and follow both governing documents in their entirety.

### MASTER AGENT INSTRUCTIONS

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

### STUDIOFLOW SOURCE-TO-LIVE WORKFLOW

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

These documents are the governing authority for this assignment.

The agent must also review all relevant Markdown documentation, including:

- TPI-STUDIOFLOW-030 completion record.
- StudioFlow directive index.
- StudioFlow development status.
- StudioFlow playback contract.
- StudioFlow audio architecture documentation.
- Historical Background Music implementation records.
- TPI-STUDIOFLOW-028 and Addendum A.
- Relevant regression testing documentation.

**Do not begin implementation until the existing Background Music architecture and approved behavior have been identified.**

All existing approved functionality must be preserved.

---

# 2. OBJECTIVE

Improve the Background Music section of StudioFlow by applying the same successful interface improvements introduced under TPI-STUDIOFLOW-030.

This directive requires two primary changes:

1. Remove the visible three-dot menu buttons from Background Music pads.
2. Introduce drag-and-drop reordering of Background Music pads.

Additionally, the new ordering must save automatically and remain independent for each studio.

**This is a user-interface and organization improvement, not a redesign of the Background Music system.**

---

# 3. REMOVE THREE-DOT MENU BUTTONS

Background Music pads currently display three-dot menu buttons.

These are unnecessary because creators can already access the pad's menu by right-clicking.

### REQUIRED CHANGES

Remove the visible three-dot menu buttons from Background Music pads.

Preserve the existing context menu and all currently supported actions.

### EXPECTED BEHAVIOR

**Normal click:** Performs the pad's existing playback action.

**Right-click:** Opens the existing Background Music context menu.

**Keyboard:** Preserves accessible access to the context menu.

**Touch:** Provides an appropriate way to access the menu without requiring a permanent three-dot button.

Do not remove or change the actual menu functionality.

Do not introduce a new menu system.

Use the same established accessibility approach implemented for Sound Effects under Directive 030 wherever appropriate.

---

# 4. INTRODUCE DRAG-AND-DROP PAD REORDERING

Creators must be able to rearrange Background Music pads into any order they prefer.

The interaction should be consistent with the Sound Effects pad reordering implemented under TPI-STUDIOFLOW-030.

### REQUIRED BEHAVIOR

A creator must be able to:

1. Select an existing Background Music pad.
2. Drag it to another position within the Background Music grid.
3. Release it at the desired position.
4. Have the remaining pads automatically rearrange.
5. Immediately see the new arrangement.
6. Continue using the music pads normally.

### EXAMPLE

Original arrangement:

**Pad 1:** Intro Atmosphere  
**Pad 2:** Investigation Music  
**Pad 3:** Suspense Background  
**Pad 4:** Closing Theme  
**Pad 5:** Ambient Music  
**Pad 6:** Empty

The creator drags Closing Theme into the first position.

New arrangement:

**Pad 1:** Closing Theme  
**Pad 2:** Intro Atmosphere  
**Pad 3:** Investigation Music  
**Pad 4:** Suspense Background  
**Pad 5:** Ambient Music  
**Pad 6:** Empty

The change must occur without reloading the page.

### IMPORTANT

Reordering a music pad must move its complete configuration.

This includes its existing media assignment and any pad-specific metadata.

Do not move only the visible title while leaving the actual music assignment behind.

---

# 5. PRESERVE BACKGROUND MUSIC PLAYBACK

Background Music differs from Sound Effects because tracks may play for extended periods.

The existing playback system must remain unchanged.

### PRESERVE

- Music playback.
- Existing play/stop behavior.
- Music volume controls.
- Looping functionality.
- Program audio routing.
- Headphone monitoring.
- Recording audio integration.
- Livestream audio integration.
- Track assignments.
- Media asset references.
- Studio-specific configuration.

### DRAG SAFETY

Dragging a music pad must not accidentally start playback.

Dropping a music pad must not restart playback.

Reordering must not unintentionally stop an already playing track.

Normal clicking must continue to behave exactly as it did before this directive.

**Do not remove the Background Music Stop control.**

Unlike the short Sound Effects pads, Background Music may contain long-running tracks that creators need to stop manually.

The existing Background Music Stop functionality must remain available.

---

# 6. PROTECT AFTER INTRO BACKGROUND MUSIC

**PRIORITY: CRITICAL**

Sol's original After Intro Background Music functionality was recovered and restored under:

**TPI-STUDIOFLOW-028 — Addendum A**

This functionality must not be broken.

### REQUIRED PROTECTION

After Intro Background Music must continue to:

- Use its assigned track from the Background Music media system.
- Automatically activate according to Sol's approved post-Intro transition.
- Preserve its existing playback behavior.
- Preserve volume and looping behavior.
- Preserve program and monitoring audio routing.
- Preserve studio-specific assignments.
- Remain independent of Intro Video and Outro Video controls.

### IMPORTANT DISTINCTION

Background Music pad order and After Intro Background Music assignment are not the same thing.

Changing the visual position of a Background Music pad must not accidentally change which track is assigned to After Intro Background Music.

The agent must inspect how these assignments are represented before implementing reordering.

If the existing implementation references music by pad position rather than a stable asset identifier, the agent must identify and safely address that dependency without redesigning the music system.

### REQUIRED TEST

1. Assign a track to After Intro Background Music.
2. Reorder the Background Music pads.
3. Play the Intro Video.
4. Allow the Intro to finish naturally.
5. Confirm the originally assigned After Intro track starts.
6. Repeat with a manually stopped Intro.
7. Confirm the same assigned track starts.
8. Verify that changing pad order does not change the assigned track.

**This test is mandatory.**

---

# 7. AUTOMATIC PER-STUDIO PERSISTENCE

Every Background Music pad rearrangement must save automatically.

No Save button should be required.

### PERSISTENCE REQUIREMENTS

The arrangement must survive:

- Page refreshes.
- Closing and reopening StudioFlow.
- Leaving and returning to a studio.
- Switching between studios.
- Normal application restarts.

Each studio must retain its own Background Music arrangement.

### EXAMPLE

**Crossroads of the Unknown**

The creator places the opening theme in the first position.

**TPI Learning**

The creator places educational background music in the first position.

Switching between the studios must restore their respective arrangements.

### IMPLEMENTATION REQUIREMENTS

Use the existing StudioFlow workspace persistence architecture.

Review the persistence safeguards introduced under Directive 030.

In particular, preserve the protection against older workspace responses overwriting newer local changes.

Do not introduce a second persistence system.

Do not allow one studio's music arrangement to overwrite another studio's arrangement.

---

# 8. CONSISTENT DRAG-AND-DROP EXPERIENCE

The Background Music interaction should feel consistent with the Sound Effects interface.

### REQUIREMENTS

- Mouse drag support.
- Trackpad drag support.
- Touch support where available.
- Keyboard reordering.
- Clear visual feedback during dragging.
- Smooth rearrangement.
- No accidental playback.
- No accidental context-menu activation.
- No unexpected scrolling.
- No loss of music assignments.

Reuse the proven Directive 030 interaction patterns where appropriate.

Avoid duplicating large amounts of code if existing utilities can be safely reused.

However, do not introduce unnecessary shared dependencies that could destabilize the Sound Effects implementation.

---

# 9. PRESERVE THE EXISTING DESIGN

Do not redesign the Background Music section.

Preserve:

- Existing pad colors.
- Existing pad dimensions.
- Existing grid layout.
- Existing track titles.
- Existing upload functionality.
- Existing empty-pad behavior.
- Existing volume controls.
- Existing looping controls.
- Existing playback indicators.
- Existing audio settings.

The requested visual changes are limited to removing the three-dot buttons and adding the necessary drag-and-drop feedback.

Do not modify unrelated StudioFlow panels.

---

# 10. REGRESSION PROTECTION

Before implementation, inspect the original Background Music architecture.

Identify:

1. Background Music pad rendering.
2. Track playback handlers.
3. Context menu handlers.
4. Pad assignment storage.
5. Per-studio persistence.
6. After Intro Background Music references.
7. Existing audio routing.
8. Directive 030's drag-and-drop implementation.
9. Directive 030's workspace save-echo protection.

### SYSTEMS THAT MUST REMAIN FUNCTIONAL

- Sound Effects.
- Background Music.
- After Intro Background Music.
- Intro Video.
- Outro Video.
- My Scenes.
- Video Clips.
- Recording.
- Livestreaming.
- Guest connections.
- Audio monitoring.
- Studio switching.
- Media uploads and assignments.

**Do not modify the recently repaired Intro/Outro production workflow unless a verified dependency makes it necessary.**

Any changes outside the Background Music area must be justified in the completion report.

---

# 11. REQUIRED TESTING

Browser interaction testing is mandatory.

Verify:

1. Three-dot buttons are removed from Background Music pads.
2. Right-click menus remain functional.
3. Keyboard context-menu access works.
4. Touch-accessible menu behavior is preserved.
5. Normal clicking plays the correct music.
6. Dragging does not trigger playback.
7. Dropping does not restart or stop active music.
8. Pads can be moved forward.
9. Pads can be moved backward.
10. Empty pads remain functional.
11. Pad assignments move with their pads.
12. Reordered pads play the correct tracks.
13. The new order saves automatically.
14. Refreshing preserves the order.
15. Studio switching preserves separate arrangements.
16. Sound Effects ordering remains unchanged.
17. Background Music volume remains functional.
18. Background Music Stop remains functional.
19. Looping remains functional.
20. Program audio routing remains functional.
21. Monitoring audio routing remains functional.
22. After Intro Background Music retains its assigned track after reordering.
23. Automatic music activation after natural Intro completion still works.
24. Automatic music activation after manually stopping Intro still works.
25. Outro Video remains independent.
26. Recording and livestreaming remain unaffected.
27. Guest connections remain unaffected.

### ADDITIONAL TESTING

Run the existing regression suites for:

- TPI-STUDIOFLOW-020
- TPI-STUDIOFLOW-021
- TPI-STUDIOFLOW-027
- TPI-STUDIOFLOW-028
- TPI-STUDIOFLOW-030

Run all additional mandatory verification required by the governing workflow.

A successful build or static contract test alone is not sufficient.

---

# 12. DOCUMENTATION REQUIREMENTS

**PRIORITY: CRITICAL — MANDATORY**

When implementation and verification are complete, update all relevant Markdown documentation.

This is a required part of the directive.

The agent must not consider the assignment complete until the documentation is synchronized.

### REQUIRED DOCUMENTATION REVIEW

Review and update, where applicable:

1. `AGENTS.md`
2. `TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`
3. StudioFlow master directive index.
4. StudioFlow development status.
5. StudioFlow agent handoff.
6. StudioFlow development README.
7. StudioFlow playback contract.
8. StudioFlow audio architecture documentation.
9. StudioFlow testing and regression documentation.
10. StudioFlow production release records.
11. StudioFlow historical implementation references.
12. New TPI-STUDIOFLOW-031 completion record.

### DOCUMENTATION PRINCIPLES

The Markdown files must continue explaining:

**WHO** implemented or authorized functionality.

**WHAT** functionality exists.

**WHERE** its implementation and supporting resources are located.

**WHEN** changes were introduced.

**WHY** architectural and implementation decisions were made.

**HOW** the functionality operates, is maintained, tested, and deployed.

### IMPORTANT

Do not overwrite historical facts.

Do not delete older implementation records.

Do not invent missing documents or references.

Do not duplicate authoritative records unnecessarily.

Update current-state documents to reflect the verified implementation.

Preserve the original implementation history.

### REQUIRED DOCUMENTATION VALIDATION

- Verify Markdown formatting.
- Verify newly authored internal links.
- Check for contradictory current-state claims.
- Confirm the production baseline is accurate.
- Verify the directive index includes Directive 031.
- Verify the completion record identifies all relevant commits.
- Confirm the two mandatory governing documents remain authoritative.

**Documentation synchronization is a completion requirement, not an optional follow-up.**

---

# 13. DEVELOPMENT AND DEPLOYMENT WORKFLOW

Follow the governing Source-to-Live Workflow in its entirety.

Required activities include:

1. Historical implementation review.
2. Scoped development.
3. Regression testing.
4. Browser interaction verification.
5. Source and generated-asset validation.
6. Git review.
7. Required release preflight.
8. Guarded deployment, when authorized under the governing workflow.
9. Live verification.
10. Documentation synchronization.
11. Final completion report.

Do not bypass established safeguards.

Do not deploy an incomplete or failing implementation.

Do not modify production data unnecessarily.

Preserve rollback capability.

---

# 14. COMPLETION REPORT

Provide a detailed completion report covering:

1. Original Background Music implementation findings.
2. Historical directives and files reviewed.
3. Files modified.
4. Three-dot menu removal.
5. Drag-and-drop implementation.
6. Playback protection.
7. Automatic persistence.
8. Studio isolation.
9. After Intro Background Music regression verification.
10. Sound Effects regression verification.
11. Browser test results.
12. Audio routing and playback test results.
13. Documentation files updated.
14. Git commits.
15. Production deployment status.
16. Rollback reference.
17. Any unresolved issues or limitations.

### FINAL REQUIREMENT

StudioFlow creators must be able to arrange Background Music pads in whatever order best supports their productions.

The arrangement must save automatically, remain specific to each studio, and preserve every existing music playback feature.

**Sol's original After Intro Background Music functionality must remain intact.**

The Sound Effects improvements introduced under Directive 030 must also remain intact.

All relevant Markdown documentation must be updated before this directive is considered complete.

**END DIRECTIVE — TPI-STUDIOFLOW-031**
