# TPI-STUDIOFLOW-032 — Background Music and Sound Effects Icon Replacement

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-24 01:41.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-24-TPI-STUDIOFLOW-032-PAD-ARTWORK-REPLACEMENT.md](../300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-032-PAD-ARTWORK-REPLACEMENT.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-032
## BACKGROUND MUSIC AND SOUND EFFECTS ICON REPLACEMENT

**Project:** The Paranormal Initiative — StudioFlow  
**Priority:** HIGH  
**Development Agent:** FreeBuff / MiMO 2.6 Pro  
**Assignment Type:** Existing interface asset replacement  
**Affected Areas:** Background Music and Sound Effects  
**Reference Directives:** TPI-STUDIOFLOW-030 and TPI-STUDIOFLOW-031  
**Documentation Updates:** MANDATORY  
**Deployment:** Follow the established guarded Source-to-Live Workflow.

---

# 1. MANDATORY DEVELOPMENT AUTHORITY

**PRIORITY: CRITICAL — NON-NEGOTIABLE**

Before investigating, modifying, repairing, testing, committing, or deploying any StudioFlow functionality, the development agent MUST read and follow both governing documents in their entirety.

### 1.1 MASTER AGENT INSTRUCTIONS

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

### 1.2 STUDIOFLOW SOURCE-TO-LIVE WORKFLOW

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

These documents are the governing authority for this assignment.

Their requirements take precedence over assumptions made during implementation.

If either document is unavailable, stop and report the issue before proceeding.

### 1.3 ADDITIONAL REQUIRED DOCUMENTATION

Review the relevant project Markdown documentation, including:

- StudioFlow master directive index.
- StudioFlow development status.
- StudioFlow agent handoff.
- StudioFlow playback contract.
- TPI-STUDIOFLOW-030 completion record.
- TPI-STUDIOFLOW-031 completion record.
- TPI-STUDIOFLOW-028 and Addendum A.
- Existing audio and soundboard architecture documentation.
- Relevant asset management documentation.
- Relevant testing and regression documentation.

Identify the current approved implementation before making modifications.

**Do not replace working functionality or introduce unnecessary architectural changes.**

---

# 2. OBJECTIVE

Replace the existing music-note icons displayed inside the circular icon containers on StudioFlow's Background Music and Sound Effects pads.

Two custom image assets have already been created and approved.

The objective is to give each audio category a distinct visual identity.

### REQUIRED ICON ASSIGNMENTS

| StudioFlow Section | Replacement Icon |
|---|---|
| Background Music | Waveform.png |
| Sound Effects | Microphone.png |

The existing circular icon containers must remain intact.

**This directive is an icon replacement, not an interface redesign.**

---

# 3. SOURCE IMAGE FILES

The approved images are located on the owner's computer.

### BACKGROUND MUSIC ICON

`/Users/toddknipple/Desktop/Music Icons/Waveform.png`

### SOUND EFFECTS ICON

`/Users/toddknipple/Desktop/Music Icons/Microphone.png`

These are the authoritative source files for this assignment.

### MANDATORY INSTRUCTIONS

1. Verify both files exist.
2. Inspect their dimensions and image properties.
3. Verify their transparency.
4. Determine whether any image preparation is necessary.
5. Preserve the original image appearance.
6. Copy the files into the appropriate StudioFlow assets directory.
7. Leave the original desktop files untouched.

**Do not move, rename, overwrite, or delete the owner's original desktop files.**

Do not generate replacement artwork.

Do not substitute generic icons.

Do not download third-party icons.

Use the two approved images.

If an image requires transparency correction, create a derived copy in the project's asset directory while preserving the original source file.

Do not remove intentional white artwork while preparing transparency.

---

# 4. LOCATE THE EXISTING STUDIOFLOW ASSET DIRECTORY

Before copying the images, locate the existing StudioFlow assets directory.

Review:

- Current asset organization.
- Existing image naming conventions.
- Static asset serving.
- Build and staging procedures.
- Production asset routing.
- Cache versioning.
- Relevant Markdown documentation.

Use the established project structure.

Do not create an unrelated asset directory.

Do not introduce an external image hosting dependency.

### EXPECTED RESULT

Both icons become maintained StudioFlow assets.

They must be available through the existing application asset-serving system.

Their paths must remain valid after production deployment.

---

# 5. BACKGROUND MUSIC ICON REPLACEMENT

The Background Music pads currently display a music-note symbol inside a small circular background.

Replace the existing music-note symbol with:

**Waveform.png**

### REQUIRED BEHAVIOR

The waveform must:

1. Appear inside the existing circular icon container.
2. Be centered horizontally and vertically.
3. Fit comfortably within the circle.
4. Maintain its original proportions.
5. Remain visually recognizable at the existing icon size.
6. Use its intended white/light appearance.
7. Display without an unwanted rectangular background.
8. Remain visible against the existing colored pad backgrounds.

### PRESERVE

- Circular icon container.
- Container background color.
- Pad background color.
- Pad dimensions.
- Track title.
- Filename.
- Existing typography.
- Existing spacing.
- Existing grid layout.
- Existing playback indicators.
- Existing hover behavior.

**Do not enlarge the circular container or change the pad layout to accommodate the image.**

Scale the image to fit the existing design.

---

# 6. SOUND EFFECTS ICON REPLACEMENT

The Sound Effects pads currently display a music-note symbol inside a small circular background.

Replace the existing music-note symbol with:

**Microphone.png**

### REQUIRED BEHAVIOR

The microphone must:

1. Appear inside the existing circular icon container.
2. Be centered horizontally and vertically.
3. Fit comfortably within the circle.
4. Maintain its original proportions.
5. Remain visually recognizable at the existing icon size.
6. Use its intended white/light appearance.
7. Display without an unwanted rectangular background.
8. Remain visible against the existing colored pad backgrounds.

### PRESERVE

- Circular icon container.
- Container background color.
- Pad background color.
- Pad dimensions.
- Sound title.
- Filename.
- Existing typography.
- Existing spacing.
- Existing grid layout.
- Existing playback indicators.
- Existing hover behavior.

**Do not redesign the Sound Effects pads.**

Only replace the existing music-note symbol.

---

# 7. ICON CONSISTENCY

Both icons must follow the same visual presentation standards.

### REQUIREMENTS

- Consistent displayed dimensions.
- Consistent visual weight.
- Consistent centering.
- Transparent image backgrounds.
- No stretching.
- No cropping of essential artwork.
- No unexpected shadows.
- No new borders.
- No new gradients.
- No changes to the existing circular containers.

The waveform and microphone do not need identical internal artwork dimensions, but they should appear visually balanced.

### IMPORTANT

Do not apply styling that causes one icon to appear significantly larger or smaller than the other.

Inspect both icons at their actual rendered sizes.

The final result should look like the icons were originally designed for StudioFlow.

---

# 8. PRESERVE DIRECTIVE 030 — SOUND EFFECTS

**PRIORITY: CRITICAL**

TPI-STUDIOFLOW-030 introduced approved improvements to the Sound Effects panel.

These must remain functional.

### PRESERVE

1. Drag-and-drop sound pad reordering.
2. Automatic pad-order saving.
3. Per-studio sound pad arrangements.
4. Right-click context menus.
5. Keyboard context-menu access.
6. Touch-accessible context menus.
7. Keyboard pad reordering.
8. Sound playback.
9. Sound uploads.
10. Existing sound assignments.
11. Volume controls.
12. Existing audio routing.
13. Existing recording and livestream integration.

Do not reintroduce the removed three-dot menu buttons.

Do not reintroduce the removed Stop Sound button.

The new microphone icon must not interfere with clicking, dragging, or right-clicking a sound pad.

### EVENT HANDLING

The icon must not capture pointer events in a way that prevents the pad's existing controls from operating.

A creator should be able to initiate the existing drag interaction from the appropriate pad area without the image interfering.

---

# 9. PRESERVE DIRECTIVE 031 — BACKGROUND MUSIC

**PRIORITY: CRITICAL**

TPI-STUDIOFLOW-031 introduced approved improvements to Background Music.

These must remain functional.

### PRESERVE

1. Drag-and-drop music pad reordering.
2. Automatic pad-order saving.
3. Per-studio music pad arrangements.
4. Right-click context menus.
5. Keyboard context-menu access.
6. Touch-accessible context menus.
7. Keyboard pad reordering.
8. Background Music playback.
9. Background Music Stop control.
10. Music uploads.
11. Existing music assignments.
12. Music volume controls.
13. Looping.
14. Program audio routing.
15. Monitoring audio routing.
16. Recording and livestream integration.
17. Existing workspace persistence protections.

Do not reintroduce the removed three-dot menu buttons.

**Do not remove the Background Music Stop control.**

The waveform icon must not interfere with normal pad interactions.

---

# 10. PROTECT AFTER INTRO BACKGROUND MUSIC

**PRIORITY: CRITICAL — EXISTING APPROVED FUNCTIONALITY**

Sol's original After Intro Background Music implementation was recovered and preserved under:

**TPI-STUDIOFLOW-028 — Addendum A**

This functionality must remain untouched.

### REQUIRED PROTECTION

- Existing music assignments remain intact.
- Automatic post-Intro activation remains intact.
- Natural Intro completion activates the assigned music.
- Manually stopping the Intro preserves the approved music transition.
- Background Music pad reordering does not change the After Intro assignment.
- Music volume and looping remain intact.
- Program and monitoring audio routing remain intact.
- Studio-specific persistence remains intact.

Do not modify the existing After Intro Background Music playback architecture.

Do not alter Intro Video or Outro Video playback behavior.

Do not introduce new media players.

Do not change media assignment identifiers.

**The icon replacement must remain independent of the audio playback system.**

---

# 11. PRESERVE ALL OTHER STUDIOFLOW FUNCTIONALITY

This assignment must not alter:

- My Scenes.
- Intro Video.
- Outro Video.
- After Intro Background Music.
- Video Clips.
- Sound Effects playback.
- Background Music playback.
- Audio monitoring.
- Guest connections.
- Recording.
- Livestreaming.
- Studio switching.
- Workspace persistence.
- Media uploads.
- Media assignments.
- Production scene composition.

Avoid modifying unrelated application components.

If an existing shared component renders both categories, a minimal shared icon-selection change is acceptable.

However, the change must not affect unrelated media categories.

---

# 12. REQUIRED IMPLEMENTATION APPROACH

Use the smallest safe implementation that accomplishes the requested result.

### REQUIRED STEPS

1. Locate the current music-note icon implementation.
2. Identify whether the symbol is rendered using SVG, HTML, CSS, or another existing mechanism.
3. Locate the existing circular icon container.
4. Inspect the existing asset-serving architecture.
5. Copy the approved image assets into StudioFlow.
6. Replace the Background Music symbol with the waveform.
7. Replace the Sound Effects symbol with the microphone.
8. Preserve the existing container dimensions and styling.
9. Verify both icons render correctly.
10. Verify no event handlers or playback behavior changed.
11. Run regression tests.
12. Update documentation.
13. Follow the established release workflow.

### DO NOT

- Rebuild the soundboard.
- Replace the audio engine.
- Modify media storage.
- Change music assignments.
- Change pad ordering logic.
- Change drag-and-drop behavior.
- Change context-menu behavior.
- Redesign the panel.
- Add unnecessary dependencies.

**This is a focused visual improvement.**

---

# 13. REQUIRED VISUAL VERIFICATION

Browser verification is mandatory.

### BACKGROUND MUSIC

Verify:

1. The waveform icon appears on populated music pads.
2. The waveform icon appears consistently wherever the standard music-pad icon is intended.
3. The previous music-note symbol is no longer displayed in those positions.
4. The circular background remains unchanged.
5. The icon is centered.
6. The icon is not stretched or clipped.
7. The icon remains visible on different pad colors.
8. Track titles and filenames remain readable.

### SOUND EFFECTS

Verify:

1. The microphone icon appears on populated sound pads.
2. The microphone icon appears consistently wherever the standard sound-pad icon is intended.
3. The previous music-note symbol is no longer displayed in those positions.
4. The circular background remains unchanged.
5. The icon is centered.
6. The icon is not stretched or clipped.
7. The icon remains visible on different pad colors.
8. Sound titles and filenames remain readable.

### RESPONSIVE VERIFICATION

Check the icons at the supported desktop and mobile/tablet viewport sizes.

Do not change responsive layouts unless a verified rendering defect requires a minimal correction.

### VISUAL EVIDENCE

Capture browser screenshots showing:

- Background Music pads with the waveform icon.
- Sound Effects pads with the microphone icon.
- Both icons at their actual displayed sizes.

The agent must visually inspect the screenshots.

A successful asset request alone does not prove the icons render correctly.

---

# 14. REQUIRED FUNCTIONAL TESTING

Run the existing browser interaction and regression suites.

### SOUND EFFECTS

Verify:

1. Clicking a sound pad plays its assigned sound.
2. Dragging a pad still works.
3. Dragging does not accidentally trigger playback.
4. Reordered pads retain their assignments.
5. Pad order persists after refresh.
6. Right-click menus remain functional.
7. Keyboard interactions remain functional.

### BACKGROUND MUSIC

Verify:

1. Clicking a music pad plays its assigned track.
2. Dragging a pad still works.
3. Dragging does not accidentally trigger playback.
4. Reordering does not interrupt an active track.
5. Pad order persists after refresh.
6. Right-click menus remain functional.
7. Background Music Stop remains functional.
8. Looping and volume controls remain functional.

### PRODUCTION WORKFLOW

Verify:

1. Intro Video playback remains functional.
2. Outro Video playback remains functional.
3. After Intro Background Music remains functional.
4. Automatic post-Intro music activation remains functional.
5. Recording controls remain functional.
6. Livestream controls remain functional.
7. Guest connections remain unaffected.

### REGRESSION SUITES

Run the applicable maintained tests for:

- TPI-STUDIOFLOW-020
- TPI-STUDIOFLOW-021
- TPI-STUDIOFLOW-027
- TPI-STUDIOFLOW-028
- TPI-STUDIOFLOW-030
- TPI-STUDIOFLOW-031

Run all additional verification required by the governing workflow.

**Do not consider static checks sufficient. Real browser interaction testing is required.**

---

# 15. ASSET AND DEPLOYMENT VERIFICATION

The new icons must be served reliably by StudioFlow.

### VERIFY

- Both assets exist in the maintained project directory.
- Both assets are included in the appropriate Git commit.
- Both assets are available in the staged application.
- Asset URLs resolve correctly.
- Production paths match the established deployment architecture.
- Browser caching does not retain the previous icons.
- No missing-image placeholders appear.
- The existing asset pipeline remains intact.

Use the established cache-versioning mechanism if necessary.

Do not introduce unnecessary cache-busting systems.

Follow the complete guarded deployment process described in:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

Do not bypass required preflight, validation, or rollback safeguards.

---

# 16. MANDATORY MARKDOWN DOCUMENTATION UPDATES

**PRIORITY: CRITICAL — REQUIRED FOR COMPLETION**

All relevant Markdown documentation must be reviewed and updated to reflect this work.

This requirement is mandatory.

### REQUIRED DOCUMENTATION REVIEW

Review and update where applicable:

1. StudioFlow master directive index.
2. StudioFlow development status.
3. StudioFlow agent handoff.
4. StudioFlow development README.
5. StudioFlow Source-to-Live Workflow.
6. StudioFlow playback contract.
7. StudioFlow audio interface documentation.
8. StudioFlow asset documentation.
9. StudioFlow regression testing documentation.
10. StudioFlow production release records.
11. TPI-STUDIOFLOW-030 references, where a current-state clarification is necessary.
12. TPI-STUDIOFLOW-031 references, where a current-state clarification is necessary.
13. New TPI-STUDIOFLOW-032 completion record.

Review `AGENTS.md` for consistency, but do not modify it unless an actual documentation requirement justifies the change.

### DOCUMENTATION MUST ESTABLISH

**WHO:** Which agent implemented the change and under whose directive.

**WHAT:** Which icons were replaced and which new assets were introduced.

**WHERE:** Where the original files, maintained assets, and rendering code are located.

**WHEN:** When the implementation and production deployment occurred.

**WHY:** Why separate icons were introduced for Background Music and Sound Effects.

**HOW:** How the icons are loaded, displayed, tested, maintained, and deployed.

### HISTORICAL PRESERVATION

Do not rewrite historical completion records.

Do not remove previous implementation history.

Do not invent missing documentation.

Do not replace authoritative references with guesses.

Update current-state documentation to reflect the verified implementation.

### REQUIRED VALIDATION

- Verify Markdown formatting.
- Verify newly authored internal links.
- Verify the directive index includes TPI-STUDIOFLOW-032.
- Verify the completion record identifies the asset locations.
- Verify the completion record identifies implementation commits.
- Verify the current production baseline is accurate.
- Verify no contradictory current-state references remain in the relevant maintained documents.
- Confirm the governing documents remain authoritative.

**The assignment is not complete until the Markdown documentation is synchronized.**

---

# 17. GIT AND RELEASE REQUIREMENTS

Follow the established Source-to-Live Workflow.

### REQUIRED

1. Review the initial Git state.
2. Confirm the correct repository and branch.
3. Identify all files requiring modification.
4. Make the smallest necessary changes.
5. Review the complete diff.
6. Verify the new image assets are tracked.
7. Run required tests.
8. Follow the established commit and push procedures.
9. Complete required release preflight.
10. Perform guarded deployment when authorized under the governing workflow.
11. Verify the live application.
12. Preserve rollback information.
13. Update the Markdown documentation.
14. Commit and push the documentation changes.
15. Confirm final repository parity.

Do not deploy failing changes.

Do not modify unrelated production data.

Do not modify the owner's original desktop image files.

---

# 18. COMPLETION REPORT

Provide a detailed completion report containing:

1. Governing documents reviewed.
2. Historical implementation records reviewed.
3. Original image files verified.
4. Original image dimensions and transparency findings.
5. Final StudioFlow asset directory.
6. Exact asset filenames.
7. Background Music icon implementation.
8. Sound Effects icon implementation.
9. Visual verification results.
10. Browser screenshots or their saved locations.
11. Sound Effects regression results.
12. Background Music regression results.
13. After Intro Background Music regression results.
14. All other relevant regression results.
15. Files modified.
16. Markdown documentation updated.
17. Git commits.
18. Production deployment status.
19. Production Worker version, if deployed.
20. Rollback reference, if deployed.
21. Any unresolved limitations.

---

# 19. FINAL ACCEPTANCE CRITERIA

The directive is complete only when all of the following are true:

**BACKGROUND MUSIC**

The existing music-note symbol has been replaced by the approved waveform icon.

**SOUND EFFECTS**

The existing music-note symbol has been replaced by the approved microphone icon.

**VISUAL DESIGN**

Both icons fit inside their existing circular backgrounds without changing pad layouts or colors.

**FUNCTIONALITY**

All existing playback, drag-and-drop, context-menu, persistence, and production functionality remains intact.

**ASSETS**

Both approved images are maintained within StudioFlow's established asset directory, and the desktop originals remain untouched.

**DOCUMENTATION**

All relevant Markdown files reflect the completed implementation and current verified production baseline.

**DEPLOYMENT**

All applicable Source-to-Live Workflow requirements have been satisfied.

### FINAL INSTRUCTION

Do not redesign StudioFlow.

Do not rebuild the soundboard.

Do not alter existing audio functionality.

**Replace the two existing music-note icons with the approved custom images, preserve everything that already works, verify the results, and update the project's Markdown documentation.**

**END DIRECTIVE — TPI-STUDIOFLOW-032**
