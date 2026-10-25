# TPI-STUDIOFLOW — Five-Directive Recovery and Verification Order

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-25 12:08.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
## STUDIOFLOW — FIVE-DIRECTIVE RECOVERY ORDER

**Priority:** CRITICAL  
**Classification:** Development recovery and verification  
**Status:** PREVIOUS COMPLETION CLAIMS REQUIRE REVALIDATION

### MISSION

Audit and repair the last five StudioFlow development directives.

The objective is not to implement another round of features. It is to establish which previously requested features actually work, correct those that do not, and restore confidence in the development process.

**No new feature development is authorized under this order.**

## 1. MANDATORY DOCUMENTATION REVIEW

Read completely:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

Inventory all applicable Markdown documentation.

Review the directive index, current development status, agent handoff, architecture documentation, testing procedures, and completion records.

Identify the five most recently executed development directives and their addenda from the authoritative records.

Do not assume a completion record proves functionality.

## 2. RECOVERY SCOPE

Begin with the following directive groups:

**TPI-STUDIOFLOW-033 — Per-Studio Configuration**

Verify that Studio-specific settings, video clip slots, and program orientation persist correctly.

**TPI-STUDIOFLOW-034 — DOM Mutation Protection**

Verify that the previous mutation-storm problem remains resolved and that current UI interactions do not recreate it.

**TPI-STUDIOFLOW-035 — Recording and Storage**

Verify the Recording and Storage panel, configuration persistence, and existing recording controls.

Do not claim unimplemented cloud integrations or participant-local recording capabilities are complete.

**TPI-STUDIOFLOW-036 — Countdown Timers**

Verify all nine countdown designs, durations, playback, stopping, rendering, and per-Studio persistence.

**TPI-STUDIOFLOW-037 — Scenes Panel**

Audit every requirement from the original directive and Addenda A–E, including:

- Uniform production-item buttons.
- Working three-dot menus.
- Remove from Scenes.
- Scene creation.
- Scene renaming.
- Scene removal.
- Drag-and-drop.
- Background Music controls.
- Intro/Outro playback.
- Countdown playback.
- Video Clip playback.
- Play Sequence / Stop Sequence.
- Per-Studio persistence.
- Correct default scene arrangement.

Inspect the authoritative directive index for any additional or more recent directive requiring inclusion.

## 3. VERIFY THE ACTUAL DEPLOYMENT

Authoritative source:

`/Users/toddknipple/Documents/StudioFlow/web`

Website repository:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

Production application:

`https://paranormalinitiative.com/studio/`

Determine whether the application being served publicly matches the latest intended source and deployment.

Verify:

1. Source commit.
2. Build output.
3. Website integration.
4. Production Worker.
5. Production route.
6. Loaded JavaScript and CSS.
7. Browser-loaded application version.

Investigate stale bundles, incorrect deployment targets, and caching.

**Do not deploy anything until the source-to-production discrepancy is understood.**

## 4. TEST THE ACTUAL APPLICATION

Start the local StudioFlow application.

Open it in a real browser.

Test the affected controls through actual pointer and keyboard interactions.

Repeat the applicable tests against the production website.

Record the exact address and application version tested.

Automated tests are supplementary evidence, not a substitute for verifying visible behavior.

If authentication or environment restrictions prevent testing, report that limitation.

Never mark an unperformed test as passed.

## 5. SCENES PANEL — REQUIRED FINAL BEHAVIOR

A newly created Studio must default to:

**Intro Video → Scene 1 → Scene 2 → Outro Video**

No Demo Scene defaults.

No automatically inserted Background Music shortcuts.

No automatically inserted Countdown Timer.

Creators may add those items when needed.

### Production scenes

Scenes represent configurable production layouts.

They must have stable identifiers and editable names.

### Production media

Intro Video, Outro Video, Countdown Timer, Background Music, and Video Clips are production items, not camera-layout scenes.

They may appear in the same production panel but must retain their appropriate behavior.

### Context menus

Every removable item must have a functioning three-dot menu containing:

**Remove from Scenes**

Scene items must also provide:

**Rename Scene**

### Removal

Removing a production item must not delete its underlying uploaded media.

Removal must persist after refresh.

Do not recreate intentionally removed items during configuration normalization.

### Playback

Click a media item once to play.

Click the same item again to stop.

Stopping an individual Intro preview must not start Background Music or advance the sequence.

Play Sequence must toggle to Stop Sequence.

Stopping rehearsal must cancel pending transitions.

Preserve existing real-production automation.

### Drag-and-drop

Dragging must visibly reposition items before release.

Do not accept tests that verify only the final saved order.

## 6. REPAIR VERIFIED FAILURES

For every failed requirement:

1. Reproduce the problem.
2. Identify its root cause.
3. Determine whether it is a source-code, integration, deployment, persistence, or browser problem.
4. Implement the smallest safe correction.
5. Verify the correction locally.
6. Run applicable regression tests.
7. Deploy through the documented guarded workflow.
8. Verify the result on the actual production website.

Do not rebuild working systems.

Do not modify unrelated applications.

Do not delete owner Studios, recordings, D1 data, or R2 assets.

Do not initiate unauthorized public livestreams.

## 7. COMPLETE MARKDOWN RECONCILIATION

The Markdown documentation is the project's agent-accessible knowledge base.

Inventory every applicable `.md` file.

For each document:

- Determine whether it remains accurate.
- Correct outdated current-state information.
- Preserve historical records.
- Update architecture descriptions where necessary.
- Update implementation details.
- Update test procedures.
- Update deployment information.
- Update directive indexes.
- Update current development status.
- Update agent handoff documentation.

Create a documentation audit identifying every reviewed file and whether changes were required.

Do not rewrite historical completion reports to conceal previous failures.

Instead, append or link corrective findings and preserve the development history.

Commit and push all affected Markdown files.

## 8. MANDATORY EVIDENCE

The completion report must contain:

**A. Directive audit**

A requirement-by-requirement matrix for all five directive groups.

**B. Initial findings**

Which features worked before repair and which failed.

**C. Root causes**

The actual technical causes of every reproduced failure.

**D. Repairs**

Source files changed and the reason for each change.

**E. Local verification**

Browser, application address, build identifier, interactions performed, and results.

**F. Production verification**

Public address, deployed build identifier, interactions performed, and results.

**G. Visual evidence**

Screenshots or recordings demonstrating the relevant interactions, especially context menus, removal, renaming, drag-and-drop, and playback stopping.

**H. Documentation audit**

Every applicable Markdown file reviewed, changed, or left unchanged.

**I. Release information**

Source commit, application commit, documentation commits, production Worker identifier, and rollback identifier.

**J. Remaining limitations**

Anything that could not be verified must be explicitly identified.

## 9. COMPLETION STATUS

Use accurate status classifications:

- NOT VERIFIED
- VERIFIED WORKING
- VERIFIED BROKEN
- FIXED LOCALLY
- DEPLOYED — VERIFICATION PENDING
- DEPLOYED AND VISUALLY VERIFIED
- OWNER ACCEPTED

Do not mark an entire directive complete while required functionality remains broken or unverified.

**Only the owner can provide final owner acceptance.**

## FINAL INSTRUCTION

This recovery order takes precedence over starting Directive 038.

The agent must repair and verify previously commissioned work before beginning additional development.

**The objective is five functioning directives—not five more completion reports.**

**END OF RECOVERY ORDER**
