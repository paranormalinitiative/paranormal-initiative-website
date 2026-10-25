# TPI-STUDIOFLOW-026 — FREEBUFF DEVELOPMENT HANDOVER — STUDIOFLOW MEDIA INTERFACE RECONSTRUCTION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-21 23:15.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** [TPI-STUDIOFLOW-026-ADDENDUM-A-LOCAL-ADMIN.md](TPI-STUDIOFLOW-026-ADDENDUM-A-LOCAL-ADMIN.md)

---

# THE PARANORMAL INITIATIVE
## TPI-STUDIOFLOW-026
### FREEBUFF DEVELOPMENT HANDOVER — STUDIOFLOW MEDIA INTERFACE RECONSTRUCTION

**PRIORITY:** CRITICAL  
**DEVELOPMENT AUTHORITY:** FREEBUFF  
**PROJECT:** The Paranormal Initiative — StudioFlow  
**OBJECTIVE:** Correct the existing StudioFlow media interface, eliminate duplicated systems, integrate media management into the original controls, and restore a professional podcast-production workflow.

---

# PART 1 — PROJECT LOCATION AND ENVIRONMENT

The existing website repository is:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

GitHub repository:

`paranormalinitiative/paranormal-initiative-website`

Development branch:

`codex/tpi-development`

StudioFlow application:

`studio/`

Primary application entry point:

`studio/index.html`

Cloudflare production Worker:

`theparanormalinitiative`

Production website:

`https://paranormalinitiative.com/studio/`

Last confirmed production Worker version:

`55f865aa-68f4-48b5-bcab-29b878bc4c42`

Last confirmed pushed development commit:

`c48ad81d06614297bc533a46d5025f025f0aff46`

**IMPORTANT:** These are handover reference points, not proof of the current state. Inspect the repository, branch, working tree, recent commits, and production deployment status before beginning.

Codex was also implementing a Firefox-compatible media-inclusive portable backup. That work may be newer than the last confirmed commit.

Preserve it.

Do not assume the working tree is clean.

Do not reset or discard changes.

---

# PART 2 — UNDERSTAND THE EXISTING APPLICATION

StudioFlow is an existing browser-based podcast production studio.

It already contains:

- Studio creation and management
- My Studios selection and switching
- Video Clips
- Video Timers
- Motion Backgrounds
- Sounds
- Background Music
- Studio scenes
- Media playback
- Audio controls
- Studio-specific persistence
- Portable backup and restoration

The application is not being rebuilt from scratch.

**Your responsibility is to correct and integrate the existing systems.**

Before editing, inspect the existing application and determine:

1. Which components are original.
2. Which components were introduced by Codex.
3. Which controls are connected to the production playback engine.
4. Which controls are only visual additions.
5. Where uploaded media is stored.
6. How media is associated with individual studios.
7. How scenes access media.
8. How portable backups include media.
9. Which systems are duplicated.
10. Which implementations should be consolidated.

Use the existing authoritative development documentation and prior directives to understand the intended behavior.

Do not create another competing media-management system.

---

# PART 3 — THE CURRENT PROBLEM

The owner has identified several significant interface problems.

### Problem A — Video Clips

The current nine-card Video Clips interface contains:

- Very dark thumbnail boxes.
- Generic "Assigned video" messages.
- Truncated video titles.
- Truncated filenames.
- Multiple vertically stacked action buttons.
- Poor visual hierarchy.
- Excessively crowded cards.

This is not the intended design.

The interface should look like a professional media library.

### Problem B — Video Timers

The existing countdown controls are not properly integrated into the new six-card timer interface.

The owner reports that an existing video timer is not appearing where expected.

The interface currently contains separate timer cards, additional timer controls, and other buttons whose relationships are unclear.

This must be investigated and corrected.

### Problem C — Sound Effects

StudioFlow already had a **Sounds** section.

Codex created another section labeled **Sound Effects**, containing nine separate slots.

The original Sounds controls remain elsewhere.

This creates two interfaces for what should be one system.

### Problem D — Background Music

StudioFlow already had a Background Music section.

Codex added another Background Music grid farther down the interface.

The new slots are not integrated into the original music controls.

This creates duplicated functionality and unnecessary navigation.

### Problem E — Fragmented Controls

Media uploading, media selection, playback, volume, and stopping are distributed across separate sections.

The owner should not have to search through StudioFlow to find the controls for media that was just uploaded.

**The solution is consolidation, not another redesign layered on top of the existing interface.**

---

# PART 4 — VIDEO CLIPS: REQUIRED DESIGN

Retain nine video slots arranged in a three-column grid.

The permanent positions are:

1. Intro Video
2. Outro Video
3. Thank You
4. Be Right Back
5. Video 5
6. Video 6
7. Video 7
8. Video 8
9. Video 9

## Empty video slots

When no video is assigned, the card should display a clean, attractive empty state.

Do not display:

- Fake video thumbnails.
- Generic dark rectangles that resemble broken previews.
- "Assigned video" when no video exists.
- Unnecessary controls for nonexistent media.

An empty slot should contain:

- Its slot name.
- A simple video icon or understated placeholder.
- A clear Upload action.

Keep the design visually consistent with StudioFlow.

## Assigned video slots

When a video has been uploaded, display:

- A representative thumbnail from the actual video.
- The assigned video name.
- A readable filename.
- A clear indication that the media is ready.
- Access to preview, replace, and remove actions.

Do not permanently stack three or four large buttons inside every card.

Use a compact action menu or another professional control arrangement.

The thumbnail should be bright enough to recognize the video.

Do not alter the actual video's brightness.

If thumbnail extraction fails, show a clear assigned-media state rather than a misleading black preview.

## Intro and Outro protection

Intro and Outro are permanent podcast-identity slots.

They must retain their existing scene connections.

They must not be automatically reassigned, deleted, or overwritten.

Replacing or removing either requires explicit user confirmation.

Their media and assignments must survive:

- Saving
- Refreshing
- Studio switching
- Browser reopening
- Portable backup
- Restore-as-new

---

# PART 5 — VIDEO TIMERS: CONSOLIDATE EXISTING FUNCTIONALITY

Retain the six-card Video Timers section.

The intended initial durations are:

1. 10 seconds
2. 20 seconds
3. 30 seconds
4. 60 seconds
5. Custom Timer 1
6. Custom Timer 2

However, these must use the existing StudioFlow timer engine.

Do not create independent countdown engines for individual cards.

Investigate the existing timer controls and identify why the owner's existing video timer is not represented correctly.

The timer interface must provide:

- Timer selection
- Duration selection
- Start
- Pause
- Resume
- Stop
- Reset
- Visible countdown
- Correct broadcast output

Where existing duration buttons are retained, they must operate the selected timer rather than create a second competing countdown.

Preserve existing timer graphics and functional media.

Do not remove an existing countdown animation merely because the new card system does not currently display it.

**Do not implement the six new animated timer themes yet.**

That is a separate upcoming development phase.

---

# PART 6 — SOUNDS: REBUILD THE EXISTING SECTION

This is a major correction.

StudioFlow already contains a section labeled:

**Sounds**

That section currently includes existing audio controls and an example sound.

The new nine-slot Sound Effects system must be integrated into this original Sounds section.

Do not leave a second independent Sound Effects section elsewhere.

## Required Sounds layout

Inside the existing Sounds section:

- Retain the existing section heading.
- Retain the existing sound playback functionality.
- Retain the sound-volume control.
- Retain the Stop Sound control.
- Provide nine user-configurable sound slots.
- Arrange the slots in a three-column grid.
- Support uploading sound files.
- Show uploaded track names.
- Support play, stop, replace, and remove.
- Preserve studio-specific media assignments.

The existing Heartbeat Fast example should not occupy a required user slot unless the owner explicitly assigns it.

It may remain as an optional example if appropriate.

## Playback behavior

Sound effects should be independently playable.

Playing a sound effect must not stop background music.

Sound effects must use the existing audio routing and volume controls.

Avoid creating duplicate volume sliders or duplicate stop controls unless there is a demonstrated functional requirement.

---

# PART 7 — BACKGROUND MUSIC: REBUILD THE EXISTING SECTION

StudioFlow already contains a Background Music section.

Integrate the nine new music slots into that original section.

Do not retain a second independent Background Music library elsewhere.

## Required Background Music layout

Inside the existing Background Music section:

- Retain the existing heading.
- Retain existing music playback functionality.
- Retain the existing music-volume control.
- Retain the Stop Music control.
- Display nine configurable music slots.
- Arrange the slots in a three-column grid.
- Support upload, play, stop, replace, and remove.
- Display assigned music filenames.
- Preserve studio-specific media assignments.

## Playback behavior

Background music must remain independent from sound effects.

Playing a sound effect must not interrupt music.

Music playback must continue according to the existing studio playback rules.

The existing Background Music section must become the single authoritative interface for music management.

---

# PART 8 — MOTION BACKGROUNDS

Inspect the existing Motion Backgrounds section.

Do not remove or relocate it unnecessarily.

Verify that:

- Existing motion backgrounds remain available.
- Uploaded backgrounds appear in the correct section.
- Existing scene assignments remain intact.
- Playback and preview function correctly.
- Backgrounds remain studio-specific where intended.

Motion Backgrounds are not Video Clips.

Do not combine them unless the existing architecture explicitly requires shared underlying media storage.

They may share infrastructure, but their user-facing functions remain distinct.

---

# PART 9 — VISUAL DESIGN REQUIREMENTS

The current screenshots show that the interface has become too crowded.

Correct the presentation without replacing StudioFlow's established visual identity.

Use:

- Clean cards.
- Consistent spacing.
- Readable media titles.
- Clear empty states.
- Recognizable previews.
- Compact controls.
- Consistent button styles.
- Proper alignment.
- Responsive layouts.

Avoid:

- Truncated headings that make slots unrecognizable.
- Unnecessary repeated labels.
- Oversized button stacks.
- Duplicate upload buttons serving the same function.
- Dark thumbnails with unreadable content.
- Extra sections that duplicate existing functionality.
- Excessive vertical scrolling caused by redundant controls.

The three-column layout must work at the existing studio sidebar width.

On narrow screens, adjust responsibly rather than forcing unreadable cards.

Test actual rendered layouts.

Do not rely exclusively on static code inspection.

---

# PART 10 — MEDIA PERSISTENCE AND MIGRATION

Existing media must not be lost during consolidation.

Inspect the storage introduced by Directives 020, 021, and 022.

Determine whether media references exist in:

- Browser storage
- IndexedDB
- Workspace metadata
- Studio-specific configuration
- Portable backup manifests
- Existing server-side workspace storage

Preserve existing media references and assignments.

If a schema or metadata migration is necessary, make it backward-compatible and test it with disposable data.

Do not delete old data simply because the UI is changing.

Ensure the consolidated controls recognize media assigned through the previous interface.

Never silently orphan media.

---

# PART 11 — FIREFOX BACKUP WORK

Codex recently identified that Firefox could export configuration without reliably including the referenced media.

It began implementing a browser-compatible portable backup containing the studio snapshot and referenced media.

Preserve this work.

Verify:

- Media-inclusive backup creation.
- File download.
- Backup integrity validation.
- Restore-as-new.
- Restored media playback.
- Failed-restore rollback.
- Chromium folder-backup compatibility.

Do not replace the existing Chromium implementation merely to accommodate Firefox.

Both browsers must have a working media-inclusive backup option.

Use disposable test studios only.

---

# PART 12 — TESTING REQUIREMENTS

Use the established working testing environment.

The LaunchAgent-backed Worker previously passed:

225/225 API E2E tests.

OPS-012 previously passed:

26/26 tests.

Chromium acceptance previously passed:

17/17 soundboard checks.

Chromium video/timer/layout acceptance previously passed:

16/16 checks.

These are historical results, not substitutes for testing the modified application.

Run current verification after implementation.

Use isolated Firefox Developer Edition testing through geckodriver where available.

Never access the owner's existing browser profile.

Test:

- Empty media cards.
- Assigned media cards.
- Video thumbnails.
- Intro and Outro protection.
- Video playback.
- Timer controls.
- Existing timer media.
- Sounds integration.
- Background Music integration.
- Independent audio playback.
- Volume controls.
- Motion Backgrounds.
- Studio switching.
- Refresh persistence.
- Backup and restore.
- Responsive layout.
- Asset integrity.
- API regressions.

Fix discovered problems rather than stopping at the first routine failure.

---

# PART 13 — GITHUB AND DEPLOYMENT

FreeBuff is authorized to perform development repairs within this directive.

Before making changes:

1. Inspect the current branch.
2. Inspect Git status.
3. Inspect recent commits.
4. Identify any Codex work not yet committed.
5. Preserve all existing changes.

Coordinate ownership of the repository.

Do not allow Codex and FreeBuff to write to the same working tree simultaneously.

Prefer an isolated Git worktree or dedicated feature branch for FreeBuff's changes, then integrate the verified result into the authoritative release branch.

After verification:

- Commit completed changes.
- Push to GitHub.
- Confirm the exact remote commit.
- Verify the release build.
- Run the guarded Wrangler dry-run.

Production deployment is authorized only after critical safety and acceptance gates pass.

Use the existing guarded Wrangler deployment process.

Record the active Worker version before deployment.

Verify rollback capability.

Do not modify production D1/R2 data.

Do not apply destructive migrations.

Do not touch Crossroads of the Unknown.

If production acceptance reveals a critical regression, roll back to the recorded previous Worker version.

---

# PART 14 — AUTONOMOUS REPAIR AUTHORITY

You are authorized to investigate and correct problems encountered during implementation.

Do not stop for ordinary development issues.

Do not return BLOCKED merely because:

- A script needs correction.
- A test fixture is missing.
- A UI component needs refactoring.
- An existing control needs integration.
- A browser test needs an alternate execution method.
- A build asset needs regeneration.

Investigate, repair, and retest.

Only request owner intervention when a required action involves:

- Protected owner data.
- Irreversible production changes.
- Missing account authorization.
- Operating-system permissions requiring direct approval.
- An unresolved critical security or rollback risk.

Do not fabricate successful tests or bypass required safety checks.

---

# PART 15 — REQUIRED FINAL RESULT

StudioFlow must have one coherent media interface.

The intended organization is:

**VIDEO CLIPS**

Nine configurable video slots, including protected Intro and Outro identity slots.

**VIDEO TIMERS**

Six timer selections connected to the existing countdown functionality.

**MOTION BACKGROUNDS**

The existing motion-background system, preserved and functioning.

**SOUNDS**

The original Sounds section, expanded to contain nine configurable sound-effect slots.

**BACKGROUND MUSIC**

The original Background Music section, expanded to contain nine configurable music slots.

There must not be duplicate competing sound or music sections.

There must not be disconnected media controls.

There must not be fake assigned-media states.

Existing media must remain available.

---

# PART 16 — FINAL REPORT

Report:

1. Repository and branch used.
2. Existing Codex changes discovered.
3. Duplicate components identified.
4. Video Clips corrections.
5. Video Timers corrections.
6. Sounds integration.
7. Background Music integration.
8. Motion Backgrounds verification.
9. Media migration and preservation.
10. Firefox backup compatibility.
11. Chromium acceptance.
12. Firefox acceptance.
13. API E2E results.
14. Git commit SHA.
15. GitHub push confirmation.
16. Wrangler deployment status.
17. Production Worker version.
18. Live acceptance results.

**FINAL OBJECTIVE:**

Restore StudioFlow to a clean, integrated, professional podcast-production interface.

Correct the existing architecture instead of adding more duplicate systems.

Preserve all existing creator data.

Complete the work and verify the result.

**END DIRECTIVE — TPI-STUDIOFLOW-026**
