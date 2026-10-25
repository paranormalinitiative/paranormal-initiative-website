# STUDIOFLOW — INTEGRATED STUDIO MANAGEMENT & SCENE SYSTEM RECOVERY

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-25 12:43.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-25-STUDIOFLOW-INTEGRATED-RECOVERY.md](../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-INTEGRATED-RECOVERY.md)
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
# STUDIOFLOW — INTEGRATED STUDIO MANAGEMENT & SCENE SYSTEM RECOVERY

**Priority:** CRITICAL  
**Classification:** Architecture Repair / Production Recovery  
**Project:** StudioFlow  
**Affected Work:** TPI-STUDIOFLOW-033 through 037 and related dependencies  
**Current Status:** OWNER ACCEPTANCE FAILED  
**New Feature Development:** SUSPENDED

---

# 1. EXECUTIVE DIRECTIVE

StudioFlow must operate as a professional, multi-Studio livestreaming and podcast production application.

The owner has identified significant problems involving:

- Studio creation.
- Studio switching.
- Workspace isolation.
- Studio persistence.
- New Studio default configuration.
- Scene-management menus.
- Drag-and-drop ordering.
- Local development versus production behavior.
- Inaccurate completion verification.

These issues must be investigated and resolved as an integrated system.

**Do not approach this as a collection of unrelated button repairs.**

The objective is to deliver a reliable Studio Management and Production Scene Management architecture.

This work continues the existing recovery effort. Do not create another numbered StudioFlow feature directive.

---

# 2. MANDATORY PROJECT KNOWLEDGE REVIEW

Before modifying source code, read completely:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

Inventory and review every applicable Markdown file, including:

- StudioFlow architecture.
- Studio configuration and persistence.
- Workspace lifecycle.
- Current development status.
- Directive index.
- Directives 033–037 and their addenda.
- Playback contract.
- Testing and verification.
- Development agent handoff.
- Previous recovery and completion records.

Identify contradictions between documentation and actual source-code behavior.

The Markdown files are the project's agent-accessible knowledge base.

They must accurately describe the implementation.

---

# 3. PROTECT EXISTING OWNER DATA

The owner's primary production Studio is:

**Crossroads of the Unknown**

This Studio contains existing production media, scenes, and configuration.

Before modifying Studio identity, creation, loading, or persistence:

1. Identify the authoritative storage locations.
2. Determine whether Studio data is stored locally, remotely, or in both places.
3. Identify the relationship between Studio records and workspace configurations.
4. Establish a recoverable backup or rollback procedure.
5. Confirm that any required migration preserves existing owner data.

Do not:

- Delete existing Studios.
- Reset Crossroads of the Unknown.
- Delete uploaded media.
- Delete recordings.
- Perform destructive D1 or R2 operations.
- Overwrite owner configurations with test data.
- Replace saved scene arrangements without explicit authorization.

Use disposable test Studios for verification.

---

# 4. INVESTIGATE THE CURRENT ARCHITECTURE

Before implementing repairs, trace the complete Studio lifecycle:

**Create → Assign Identity → Initialize Workspace → Open → Edit → Save → Switch → Reload → Restore**

Determine:

- How Studio IDs are generated.
- Where Studio records are stored.
- How the active Studio is identified.
- How workspace configuration is associated with a Studio.
- How local and remote persistence interact.
- How Studio switching updates application state.
- How scene data is loaded.
- How media assignments are loaded.
- How the active Studio is restored after refresh.
- Whether older Studio configurations require migration.

Identify the actual causes of the owner's reported failures.

Do not assume that changing a Studio name is equivalent to creating an independent workspace.

---

# 5. MY STUDIOS — COMPLETE MANAGEMENT INTERFACE

The My Studios selector must be a fully functional workspace-management control.

### Required appearance

Display the currently active Studio clearly.

Example:

**My Studios: Crossroads of the Unknown ▾**

Clicking the selector must open a properly styled dropdown.

The dropdown should display:

**My Studios**

✓ Crossroads of the Unknown  
How to Ghost Hunt  
TPI Learning  

**+ Create New Studio**

The examples illustrate the intended interface; do not create these named Studios automatically.

### Required behavior

- Display all Studios available to the current user.
- Clearly identify the active Studio.
- Allow immediate selection of another Studio.
- Provide Create New Studio.
- Close when clicking outside.
- Close when pressing Escape.
- Remain usable at different screen sizes.
- Never render outside the visible viewport.
- Never be clipped by surrounding panels.

The selector must use StudioFlow's established visual design.

Do not copy StreamYard branding or proprietary artwork.

The owner-provided StreamYard screenshots are interaction references only.

---

# 6. CREATE NEW STUDIO — COMPLETE WORKFLOW

The current production implementation displays an inadequately styled Create New Studio form at the bottom of the application.

This is unacceptable.

### Required interface

Create New Studio must open a properly styled modal centered within the application viewport.

The modal must include:

**Create New Studio**

Studio Name

[Enter studio name]

[Cancel] [Create Studio]

### Visual requirements

- Centered dialog.
- Dimmed background.
- Consistent StudioFlow typography.
- Consistent button styling.
- Appropriate width.
- Proper spacing.
- Responsive layout.
- Correct stacking above the application.
- No clipping.
- No page-layout disruption.

### Interaction requirements

- Focus the Studio Name field automatically.
- Require a nonempty name.
- Trim leading and trailing whitespace.
- Support Enter to submit.
- Support Escape to cancel when safe.
- Disable duplicate submissions while creation is pending.
- Display actionable errors when creation fails.
- Do not create incomplete Studio records.
- Do not close the modal and falsely imply success after a failed operation.

### Successful creation

When Create Studio is selected:

1. Generate a unique, persistent Studio identity.
2. Create a genuinely independent workspace configuration.
3. Save the new Studio.
4. Set it as the active Studio.
5. Open it immediately.
6. Display its name in the interface.
7. Load its default Scenes panel.
8. Preserve the previous Studio unchanged.
9. Make the new Studio available in My Studios.
10. Restore the new Studio correctly after refresh.

**Creating a Studio must create a Studio—not merely rename the existing workspace.**

---

# 7. NEW STUDIO DEFAULT CONFIGURATION

Every newly created Studio must begin with this production arrangement:

**Intro Video**

**Scene 1**

**Scene 2**

**Outro Video**

These are the only default production items.

Do not automatically insert:

- Background Music.
- Countdown Timers.
- Additional scenes.
- Video Clips.
- Demo Scenes.

### Default names

Use:

**Scene 1**

**Scene 2**

Do not use:

**Demo scene 1**

**Demo scene 2**

### Media assignments

A newly created Studio must not automatically inherit another Studio's uploaded Intro, Outro, music assignments, or custom production settings.

Shared media libraries may remain accessible where the existing architecture intentionally supports them, but assignments to a production sequence must remain Studio-specific.

---

# 8. STUDIO SWITCHING — COMPLETE WORKFLOW

Selecting another Studio must immediately switch workspaces.

### Required sequence

**Save Current Studio → Change Active Studio → Load Selected Studio → Render Selected Workspace**

There must be no unnecessary return to the StudioFlow home screen.

### Example

The creator is working in:

**Crossroads of the Unknown**

They select:

**How to Ghost Hunt**

StudioFlow must:

1. Preserve the current Crossroads configuration.
2. Activate How to Ghost Hunt.
3. Load its scenes.
4. Load its media assignments.
5. Load its production settings.
6. Update the visible Studio name.
7. Display the selected Studio's workspace.
8. Remain in that Studio after refresh.

Switching back must restore Crossroads exactly as saved.

### Asynchronous safety

Prevent stale save or load operations from overwriting the newly selected Studio.

Handle rapid switching, failed saves, failed loads, and browser refreshes safely.

Never report a workspace as saved when its required persistence operation failed.

---

# 9. STUDIO WORKSPACE ISOLATION

Every Studio must maintain its own production configuration.

At minimum, isolate:

- Studio identity.
- Studio name.
- Production scenes.
- Scene names.
- Scene order.
- Scene layout configurations.
- Intro and Outro assignments.
- Background Music assignments.
- Countdown selections.
- Video Clip assignments.
- Workspace production settings.
- Other Studio-specific settings identified in the existing architecture.

Do not duplicate large media files unnecessarily when creating Studios.

Distinguish between a shared asset library and Studio-specific asset assignments.

### Mandatory isolation test

Create two disposable Studios.

**Studio A**
- Rename a scene.
- Reorder the production sequence.
- Assign disposable media.
- Save.

**Studio B**
- Use a different scene name.
- Use a different sequence order.
- Leave that media unassigned.
- Save.

Switch between them repeatedly.

Refresh the browser.

Restart the browser session.

Verify that each Studio retains only its own configuration.

**If Studio A's changes appear unexpectedly in Studio B, the test fails.**

---

# 10. EXISTING STUDIO COMPATIBILITY

Application updates must apply to every Studio when the updated application loads.

Existing Studios must receive:

- Updated interface components.
- Corrected context menus.
- Working drag-and-drop.
- Updated scene-management behavior.
- Compatible configuration handling.

They must not require recreation to receive application improvements.

### Configuration migrations

Investigate whether older Studio data structures require versioned migration.

Where necessary, implement safe, idempotent migrations.

Migrations must:

- Preserve unique Studio identities.
- Preserve owner-created scenes.
- Preserve custom scene names.
- Preserve uploaded media assignments.
- Preserve scene layouts.
- Avoid duplicate production items.
- Avoid resetting saved arrangements.
- Be safe to execute more than once.

Outdated default-generated names may be migrated only when they can be reliably distinguished from deliberate custom names.

Do not automatically replace an existing Studio's entire production sequence with the new-Studio default sequence.

---

# 11. SCENES PANEL — COMPLETE CORRECTION

After Studio identity, switching, and persistence are functioning, correct the Scenes panel.

### Floating menus

Every three-dot context menu must:

- Open beside the selected production item.
- Remain fully visible.
- Display all text without clipping.
- Remain within the usable viewport.
- Appear above surrounding interface elements.
- Support pointer interaction.
- Close on outside click.
- Close on Escape.
- Avoid activating the underlying production item.

Do not apply another arbitrary CSS offset.

Implement a reliable menu-positioning strategy that handles clipping containers and viewport boundaries.

### Remove redundant commands

Remove:

**Move Up**

**Move Down**

from all Scenes panel context menus.

Ordering is controlled through drag-and-drop.

### Drag-and-drop

Every reorderable production item must support:

**Drag → Visible Insertion Feedback → Drop → Save → Refresh → Restore**

Other items must visibly respond during dragging.

The final arrangement must persist within the correct Studio.

### Scene management

Preserve:

- Rename Scene.
- Remove from Scenes.
- Appropriate Preview actions.
- Relevant configuration actions.
- Existing media playback controls.

Removing a production shortcut must not delete its underlying uploaded media.

---

# 12. PRESERVE PRODUCTION PLAYBACK

Do not unnecessarily modify working media systems.

Verify:

- Intro Video play/stop.
- Outro Video play/stop.
- Background Music play/stop.
- Countdown Timer play/stop.
- Video Clip play/stop.
- Play Sequence.
- Stop Sequence.

Stopping an individual Intro preview must not automatically start Background Music.

Stopping rehearsal must cancel pending transitions.

Preserve existing real-broadcast automation.

Do not initiate unauthorized public livestreams.

---

# 13. LOCAL AND PRODUCTION PARITY

Authoritative source:

`/Users/toddknipple/Documents/StudioFlow/web`

Website repository:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

Production:

`https://paranormalinitiative.com/studio/`

Local development has previously been observed at:

`http://127.0.0.1:8787/studio/`

Verify the actual development-server address before testing.

### Required investigation

Trace:

**Source → Build → Integration → Deployment → Browser-Loaded Application**

Verify:

- Source commit.
- Build identifier.
- Production Worker.
- Production route.
- Loaded JavaScript.
- Loaded CSS.
- Browser caching behavior.

Do not compare different saved Studios and automatically conclude the application versions differ.

Instead, verify the same functionality using equivalent disposable Studio configurations in both environments.

---

# 14. MANDATORY END-TO-END TESTING

The following workflows must pass locally and in production.

### Test A — Create Studio

**Open My Studios → Create New Studio → Enter Name → Create → New Studio Opens**

### Test B — Default Scenes

**New Studio → Intro Video → Scene 1 → Scene 2 → Outro Video**

### Test C — Workspace Isolation

**Create Studio A → Configure → Create Studio B → Configure Differently → Switch → Confirm Isolation**

### Test D — Persistence

**Edit → Save → Refresh → Confirm Configuration**

### Test E — Studio Switching

**Studio A → Studio B → Studio A**

Each Studio must restore its own workspace.

### Test F — Context Menus

**Open Menu → Entire Menu Visible → Select Action → Correct Result**

### Test G — Drag-and-Drop

**Drag → Visible Reordering → Drop → Save → Refresh → Same Order**

### Test H — Media Playback

Verify existing playback behavior without unintended transitions.

### Test I — Existing Studio Compatibility

Confirm the updated interface works with an older Studio configuration without destroying its saved data.

Use a safe copy or representative fixture for tests that would otherwise modify owner data.

### Test J — Production Version

Confirm the public website actually loads the intended deployed application.

---

# 15. CORRECT THE AUTOMATED TESTING PROBLEM

Previous automated tests passed while context menus were visually clipped.

This must not happen again.

Tests must verify rendered behavior, not merely DOM existence.

Required browser-level checks include:

- Visible element geometry.
- Viewport boundaries.
- Ancestor clipping.
- Pointer hit testing.
- Actual click results.
- Modal positioning.
- Dropdown positioning.
- Drag feedback.
- Persistence after refresh.
- Independent Studio identity.

A test must fail if a modal renders at the bottom of the application instead of opening correctly.

A test must fail if creating a Studio leaves the user in the previous Studio.

A test must fail if two Studios share configuration unexpectedly.

A test must fail if a context menu is clipped.

A test must fail if a dragged item does not visibly indicate its insertion position.

Do not report a test as passed unless its actual acceptance condition was evaluated.

---

# 16. PRODUCTION SAFETY

Before deployment:

- Verify local functionality.
- Run relevant regression tests.
- Confirm the build is correct.
- Establish rollback information.
- Protect existing Studio records.
- Protect owner media.
- Protect D1 and R2 data.

After deployment:

- Open the public website.
- Confirm the deployed build.
- Repeat end-to-end verification.
- Capture screenshots or recordings.
- Document any limitations.

Do not use the owner's production Studio for destructive testing.

---

# 17. MARKDOWN DOCUMENTATION RECONCILIATION

Review every applicable Markdown document.

Update:

- Studio architecture.
- Studio identity and lifecycle.
- Workspace persistence.
- Configuration versioning and migrations.
- Scene-management behavior.
- Local-to-production workflow.
- Testing and verification requirements.
- Current development status.
- Directive index.
- Agent handoff.
- Relevant completion records.

Preserve historical records and document corrections transparently.

Create a permanent completion record with:

**WHO / WHAT / WHERE / WHEN / WHY / HOW**

Include:

- Root causes.
- Source files changed.
- Tests performed.
- Production evidence.
- Deployment identifiers.
- Rollback identifiers.
- Known limitations.
- Remaining work.

Store relevant screenshots in a permanent project location, not exclusively in temporary macOS directories.

Commit and push all applicable documentation updates.

---

# 18. REQUIRED FINAL REPORT

The final report must include:

### A. Root-cause findings

Why Studio creation and switching failed.

### B. Storage architecture

Where Studio identities and configurations are persisted.

### C. Studio lifecycle

How creation, loading, switching, saving, and restoration now work.

### D. Workspace isolation

Evidence that two Studios maintain independent configurations.

### E. Scene-management corrections

Evidence that floating menus, removal, renaming, and drag-and-drop work.

### F. Local verification

Actual browser interactions and results.

### G. Production verification

Actual browser interactions and results.

### H. Regression testing

Results for affected existing systems.

### I. Documentation reconciliation

Every applicable Markdown file reviewed and updated.

### J. Release information

Source commit, application commit, documentation commits, Worker identifier, and rollback identifier.

### K. Outstanding limitations

Anything not implemented or not verified must be identified.

---

# 19. COMPLETION STANDARD

The agent may report:

**DEPLOYED AND VISUALLY VERIFIED — OWNER ACCEPTANCE PENDING**

only after completing genuine production-browser verification.

Do not claim owner acceptance.

Do not mark this recovery complete while any required workflow remains broken.

---

# FINAL INSTRUCTION

StudioFlow must function as a coherent multi-Studio production application.

A creator must be able to:

**Create a Studio → Open It → Configure It → Save It → Create Another Studio → Switch Between Them → Refresh → Return to Exactly Where They Left Off**

The Scenes panel must operate correctly within that system.

The owner must not need to create a new Studio to receive application updates.

The owner must not need to manually repair configurations after ordinary deployments.

The owner must not have to discover basic interface failures after the agent reports successful testing.

**Deliver the complete working system, not another collection of isolated fixes.**

**END OF INTEGRATED RECOVERY DIRECTIVE**
