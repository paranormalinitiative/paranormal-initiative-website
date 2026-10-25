# TPI-STUDIOFLOW-035 — RIGHT NAVIGATION CLEANUP, TELEPROMPTER PLACEMENT, AND RECORDING & STORAGE CONSOLIDATION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-24 12:53.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md](../300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-035
## RIGHT NAVIGATION CLEANUP, TELEPROMPTER PLACEMENT, AND RECORDING & STORAGE CONSOLIDATION

**Assigned Agent:** NiMo 2.6 Pro  
**Project:** The Paranormal Initiative — StudioFlow  
**Priority:** High  
**Classification:** UI Consolidation / Recording & Storage Integration / Functionality Repair  
**Status:** AUTHORIZED FOR INVESTIGATION AND IMPLEMENTATION

---

# 1. MANDATORY GOVERNING DOCUMENTS

Before making any changes, read these two files in their entirety:

**Governing development instructions:**

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

**Authoritative source-to-live workflow:**

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

These documents govern implementation, testing, deployment, and documentation.

Also review:

- StudioFlow's current architecture and component organization.
- The authoritative React source and production-aligned website bundle.
- Existing Recording & Storage implementation.
- Existing Settings panels.
- Existing Audio settings.
- Existing Recording settings.
- Current right-side navigation and panel architecture.
- TPI-STUDIOFLOW-028 through TPI-STUDIOFLOW-034.
- StudioFlow workspace configuration inventory.
- StudioFlow playback contract.
- Directive index, development status, agent handoff, and relevant completion records.

**Do not modify code until the existing functionality and storage architecture have been investigated.**

---

# 2. PROJECT OBJECTIVE

StudioFlow needs a cleaner, more organized production workspace.

Currently, several recording, saving, and storage-related controls are distributed across different Settings sections.

Some are reportedly disconnected or only partially implemented.

This creates unnecessary confusion for creators.

A creator should not have to search through multiple settings menus to determine:

- Where a recording will be saved.
- Whether a recording was saved.
- Which storage destination is selected.
- Whether external storage is connected.
- Whether cloud storage is configured.
- Whether a recording is still being processed.
- Whether a recording failed to save.
- How to change the recording destination.

We need one centralized, understandable, functional interface.

**The right-side StudioFlow navigation will become the primary location for Recording & Storage management.**

---

# 3. RIGHT-SIDE NAVIGATION CLEANUP

Locate the existing far-right StudioFlow navigation containing items such as:

- Banners
- Media Assets
- Voice FX
- Notes
- Other production tools

Preserve its existing visual design, spacing, icons, panel behavior, and navigation conventions.

### REMOVE THESE NAVIGATION ITEMS

Remove:

1. Live Interaction
2. Comments
3. Widgets

These items are no longer required in the right-side navigation.

### Important restriction

Do not blindly delete underlying components, database records, APIs, or shared services.

First determine whether these entries are simply navigation destinations or whether they are connected to other functionality.

Remove the unwanted navigation entries and their unused presentation code only when safe.

Do not damage unrelated production tools.

---

# 4. TELEPROMPTER PLACEMENT

The right-side navigation must include:

**Teleprompter**

Position it directly beneath:

**Notes**

Expected navigation relationship:

Notes  
Teleprompter

### Investigation requirements

Determine whether a Teleprompter implementation already exists.

If it exists:

- Reuse the existing implementation.
- Preserve existing functionality.
- Ensure the navigation opens the correct panel.
- Preserve teleprompter content and existing persistence behavior.
- Avoid creating a duplicate teleprompter.

If no working implementation exists, document that finding before building anything.

The objective is to make the Teleprompter accessible from the correct location without introducing competing implementations.

---

# 5. NEW RIGHT-SIDE SECTION: RECORDING & STORAGE

Add a new navigation item:

# Recording & Storage

This must be a first-class section of the far-right StudioFlow navigation.

It should use the existing StudioFlow design language.

The section must be organized, easy to understand, and consistent with the other right-side panels.

**This is not merely a shortcut to the Settings menu.**

It must provide a unified interface containing the relevant recording and storage controls.

---

# 6. COMPLETE SETTINGS INVENTORY — REQUIRED BEFORE IMPLEMENTATION

StudioFlow currently contains recording and storage-related controls in multiple locations.

Known locations include:

1. Settings → Audio
2. Settings → Recording
3. Existing Recording & Storage area
4. Any additional recording or storage configuration discovered during investigation

NiMo must inspect all of these locations.

For every setting, identify:

- Its current location.
- Its purpose.
- Its controlling component.
- Its stored configuration field.
- Whether it is functional.
- Whether it persists correctly.
- Whether it is connected to actual recording behavior.
- Whether it is duplicated elsewhere.
- Whether it is only a visual placeholder.
- Whether changing it has any real effect.

Create a complete inventory before consolidating the interface.

### Critical requirement

**Do not assume a setting works simply because it appears in the interface.**

Trace the complete behavior from user interaction to actual recording or storage functionality.

---

# 7. CONSOLIDATE RECORDING & STORAGE CONTROLS

Move the relevant recording and storage controls into the new right-side Recording & Storage section.

The creator must be able to manage all applicable recording and storage settings from this one location.

This includes existing controls discovered under:

- Audio settings.
- Recording settings.
- Recording & Storage settings.
- Other relevant configuration panels.

### Consolidation rules

1. Preserve each setting's existing meaning.
2. Preserve valid saved configuration values.
3. Eliminate confusing duplicate controls.
4. Avoid creating separate competing sources of truth.
5. Keep all relevant recording and storage settings together.
6. Ensure settings changes are reflected throughout StudioFlow.
7. Preserve per-studio configuration where applicable.
8. Do not move unrelated audio controls such as microphone processing or Voice FX unless they specifically control recording or storage.

If an existing Settings page must retain a reference to these controls, use a clear link directing the creator to Recording & Storage rather than maintaining two independent sets of controls.

**The right-side Recording & Storage section must be the authoritative management interface.**

---

# 8. RECORDING DESTINATION MANAGEMENT

Creators need to choose where their recordings are stored.

The interface must support three destination categories:

### A. LOCAL STORAGE

Storage on the creator's computer or device.

Investigate the existing browser recording and download architecture.

Where browser capabilities permit, allow the creator to select a destination using an appropriate native file or directory picker.

Respect browser security restrictions.

Do not claim that StudioFlow can write directly to an arbitrary local folder unless the browser actually permits it.

If the browser only supports downloads, communicate that clearly.

### B. EXTERNAL STORAGE

Support external storage destinations where technically available.

Examples include:

- External hard drives.
- USB storage.
- Other removable storage devices.

Investigate whether the existing recording workflow can save through a browser-supported directory picker.

Do not invent direct filesystem access.

External destinations may be accessible through the same native picker as local folders, depending on the browser and operating system.

The interface must accurately communicate whether direct saving is supported.

### C. CLOUD STORAGE

Creators should have the ability to configure cloud-based recording storage.

Investigate the existing infrastructure and integrations before selecting an implementation.

Potential providers may include:

- Google Drive
- Dropbox
- Other supported cloud storage providers

**Do not assume these integrations already exist.**

Any cloud integration must use a supported authorization and upload workflow.

Never request or store a creator's cloud account password.

Do not introduce undocumented cloud uploads or transmit recordings without explicit creator authorization.

If a provider cannot be safely implemented within the existing architecture, document the limitation rather than presenting a nonfunctional destination as available.

### Destination management requirements

Where supported, creators must be able to:

- Select a storage destination.
- Change the destination.
- See the currently selected destination.
- Understand whether the destination is available.
- Know whether authorization is required.
- Receive a warning when a destination becomes unavailable.
- Understand what happens when saving fails.

Do not silently switch storage destinations.

If a fallback is necessary, obtain appropriate user confirmation and clearly identify the actual destination used.

---

# 9. RECORDING SAVE STATUS AND NOTIFICATIONS

This is a critical requirement.

**Creators must know whether their recordings were saved and where they were saved.**

A recording must never appear successfully saved merely because recording has stopped.

StudioFlow must distinguish between:

- Recording in progress.
- Recording stopped.
- Recording being prepared or processed.
- Save or upload in progress.
- Recording saved successfully.
- Recording save failed.
- Recording awaiting user action.

### Successful save notification

After confirmed successful saving, display a clear notification.

Example:

**Recording Saved Successfully**

Recording: Crossroads of the Unknown  
Destination: Local Storage  
File: Crossroads-Episode-01.webm  
Status: Saved

Only display success after the relevant save or upload operation has actually completed.

### Failed save notification

Example:

**Recording Could Not Be Saved**

Destination: External Storage  
Reason: Destination unavailable

Provide an appropriate recovery action when possible.

### Important distinction

Browser downloads, direct filesystem writes, server-side uploads, and cloud uploads have different confirmation capabilities.

Use the strongest truthful confirmation available for each destination.

Do not claim that a file exists at a particular filesystem location unless StudioFlow has reliable evidence.

### Additional requirements

- Prevent silent recording loss.
- Preserve recoverable recordings when a destination fails, where technically possible.
- Do not discard recording data prematurely.
- Avoid duplicate uploads.
- Avoid duplicate success notifications.
- Provide meaningful error messages.
- Never report success before completion.
- Preserve recording state during unrelated UI navigation.

---

# 10. RECORDING & STORAGE PANEL ORGANIZATION

The new panel should be clean and logically organized.

Use the following conceptual structure, adjusting only when the existing architecture requires it.

## Recording & Storage

### Recording Configuration
All existing recording-related settings that belong together.

### Save Destination
Current destination and available destination options.

### Local & External Storage
Supported local and removable storage controls.

### Cloud Storage
Supported cloud destinations, connection status, and configuration.

### Save Status
Current recording's save or upload progress and confirmed outcome.

### Recording Information
Relevant information about the current or most recently completed recording, where available.

### Errors & Recovery
Actionable information when saving or uploading fails.

Do not add decorative settings that are not connected to real functionality.

**A smaller fully working panel is preferable to a larger panel filled with placeholders.**

---

# 11. FIX DISCONNECTED OR PARTIALLY CONNECTED SETTINGS

The user reports that some existing recording and storage controls are not connected or are only partially implemented.

NiMo must investigate this.

For each affected setting:

1. Identify the expected behavior.
2. Trace its current implementation.
3. Identify the missing connection.
4. Repair the behavior when it falls within the approved scope.
5. Verify that changing the setting affects the intended functionality.
6. Verify that saved settings survive refresh and studio switching where applicable.

Do not simply relocate a broken setting into the new panel.

**The purpose of consolidation is to make recording and storage management functional, not merely better organized.**

If a discovered repair requires significant new infrastructure, identify and document that dependency rather than implementing an unsafe shortcut.

---

# 12. PRESERVE STUDIO CONFIGURATION PERSISTENCE

TPI-STUDIOFLOW-033 repaired important workspace configuration problems.

These repairs must remain intact.

Preserve:

- Per-studio configuration isolation.
- Video Clips slot assignments.
- Stable asset identifiers.
- Program orientation.
- Workspace save-version protection.
- Existing configuration hydration.
- Existing studio-switching behavior.

Recording and storage settings must follow the appropriate persistence model.

Distinguish between:

**Per-studio preferences:** settings that belong to a specific studio.

**Creator-level preferences:** settings that should apply across the creator's studios.

**Session-specific state:** temporary recording or destination authorization information.

Do not assume all settings belong in the same persistence location.

Do not store sensitive cloud credentials in ordinary studio configuration.

---

# 13. PRESERVE ALL PREVIOUS STUDIOFLOW REPAIRS

This directive must not regress previous work.

Specifically preserve:

### TPI-028
Intro/Outro playback and automatic After Intro Background Music.

### TPI-030
Sound Effects behavior, drag-and-drop ordering, and stale-save protections.

### TPI-031
Background Music ordering, looping, volume, persistence, and stable media references.

### TPI-032
Waveform and microphone pad artwork.

### TPI-033
Workspace configuration and orientation persistence.

### TPI-034
DOM mutation storm repair and idempotent bridge behavior.

Also preserve:

- Live broadcasting.
- Existing recording functionality.
- Media Assets.
- Banners.
- Voice FX.
- Notes.
- Existing Teleprompter functionality, if present.
- Studio switching.
- Production output and preview.
- Crossroads of the Unknown assets and content.

---

# 14. SAFETY AND DATA PROTECTION

Do not delete, overwrite, or migrate production user recordings.

Do not modify production D1 or R2 data without separately approved, documented necessity.

Do not change existing owner recordings or storage destinations without authorization.

Do not access or modify the owner's browser profile.

Use disposable studios, disposable recording files, and isolated test data.

Do not trigger real cloud uploads to a personal account during testing without explicit authorization.

Any new backend capability must include appropriate authentication, authorization, validation, and storage isolation.

Never expose private recording URLs, cloud tokens, or filesystem handles to unauthorized users.

---

# 15. REQUIRED TESTING

Create maintained regression coverage for TPI-STUDIOFLOW-035.

At minimum, verify:

### Navigation
- Live Interaction removed.
- Comments removed.
- Widgets removed.
- Notes preserved.
- Teleprompter directly beneath Notes.
- Recording & Storage visible.
- Other navigation items unaffected.

### Settings consolidation
- All relevant settings inventoried.
- Correct settings moved.
- Duplicate controls eliminated or redirected.
- No competing configuration state.
- Settings persist correctly.

### Recording
- Recording starts and stops normally.
- Existing output is preserved.
- Saving uses the selected supported destination.
- Save failures are handled.
- Successful saves generate accurate notifications.
- Destination information is displayed accurately.
- No recording data is silently discarded.

### Storage
- Local destination behavior verified.
- External destination behavior verified where supported.
- Cloud connection and upload behavior verified where implemented.
- Unsupported capabilities are not falsely represented as working.

### Studio lifecycle
- Refresh restoration.
- Studio switching.
- Per-studio isolation.
- Existing workspace persistence protections.

### Regression coverage
Run the relevant maintained suites from TPI-028 through TPI-034.

Specifically rerun the TPI-033 configuration round-trip and TPI-034 mutation regression.

The right-side panel must not reintroduce excessive DOM mutations or unnecessary rerenders.

---

# 16. MANDATORY MARKDOWN DOCUMENTATION

**DOCUMENTATION COMPLETION GATE — NON-NEGOTIABLE**

This directive is not complete until the relevant Markdown files are updated, validated, committed, and pushed.

At minimum, inspect and update where applicable:

- `AGENTS.md` — only if governing instructions genuinely require amendment.
- `TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`
- `TPI-STUDIOFLOW-WORKSPACE-CONFIGURATION.md`
- StudioFlow playback contract, if affected.
- `TPI-CURRENT-DEVELOPMENT-STATUS.md`
- `TPI-DEVELOPMENT-AGENT-HANDOFF.md`
- `100-DIRECTIVES/DIRECTIVE-INDEX.md`
- `009-TESTING-AND-VERIFICATION.md`
- `README.md`
- Relevant recording/storage technical documentation.

Create a new completion record:

`2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md`

Place it under:

`docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/`

The completion record must explain:

**WHO:** Agent responsible.

**WHAT:** Navigation, recording, storage, and settings changes.

**WHERE:** Source files, components, bridges, APIs, and documentation.

**WHEN:** Implementation, verification, and deployment dates.

**WHY:** Consolidation and functional repair requirements.

**HOW:** Architecture, persistence, save operations, validation, and testing.

Also document:

- The original locations of every consolidated setting.
- The final location of every setting.
- Which controls were previously disconnected.
- Which controls were repaired.
- Which storage destinations are fully functional.
- Which destinations have technical limitations.
- How save success and failure are determined.
- How recording recovery works.
- Any remaining dependencies.
- Application and documentation commits.
- Production Worker version.
- Rollback Worker version.

Preserve all historical documentation.

Never silently rewrite previous directive records.

---

# 17. GUARDED RELEASE PROCESS

Follow the authoritative Source-to-Live Workflow.

Required sequence:

1. Complete investigation.
2. Record baseline behavior.
3. Implement minimal, controlled changes.
4. Build authoritative source.
5. Stage the production-aligned bundle.
6. Run focused regressions.
7. Run complete required regression coverage.
8. Verify configuration persistence.
9. Verify recording and storage behavior.
10. Verify mutation performance.
11. Complete local authentication and browser acceptance.
12. Complete release-safety and preflight checks.
13. Commit and push verified application changes.
14. Deploy only through the approved guarded production process.
15. Verify production smoke and browser acceptance.
16. Update final Markdown documentation with actual release facts.
17. Commit and push final documentation.
18. Report the final verified status.

Do not bypass safety gates or deploy a partially verified implementation.

If a major storage-provider integration cannot be completed safely, do not misrepresent it as complete.

Report the dependency and obtain direction before introducing significant infrastructure or production data changes.

---

# 18. REQUIRED COMPLETION REPORT

NiMo must provide a final report containing:

1. **Directive status:** Complete, partially complete, or blocked.
2. **Navigation changes:** Items removed and added.
3. **Teleprompter:** Existing implementation reused or new implementation required.
4. **Settings inventory:** All recording/storage controls discovered.
5. **Settings consolidation:** Where each control now lives.
6. **Functional repairs:** Previously disconnected behavior that was repaired.
7. **Storage destinations:** Local, external, and cloud capabilities actually implemented.
8. **Save notifications:** Success, failure, and destination reporting.
9. **Persistence:** Refresh and studio-switch verification.
10. **Regression results:** Including TPI-033 and TPI-034.
11. **Documentation:** Exact Markdown files updated.
12. **Commits:** Source, application, and documentation.
13. **Production:** Worker ID, deployment result, and rollback.
14. **Remaining limitations:** Clearly identified, without claiming unfinished capabilities are complete.

---

# 19. ACCEPTANCE CRITERIA

TPI-STUDIOFLOW-035 may be declared complete only when:

- The three unwanted right-navigation items are removed.
- Teleprompter appears directly beneath Notes.
- Recording & Storage appears in the far-right navigation.
- Existing recording and storage settings are inventoried and consolidated.
- The consolidated controls are connected to real functionality.
- Creators can identify and change supported recording destinations.
- Save status and actual destination are clearly communicated.
- Save failures are not silently treated as successes.
- Existing StudioFlow functionality remains intact.
- All required regression tests pass.
- Production deployment is verified.
- All affected Markdown documentation is updated, committed, and pushed.

**The objective is one clean, reliable Recording & Storage management location—not another layer of disconnected settings.**

**END DIRECTIVE TPI-STUDIOFLOW-035**
