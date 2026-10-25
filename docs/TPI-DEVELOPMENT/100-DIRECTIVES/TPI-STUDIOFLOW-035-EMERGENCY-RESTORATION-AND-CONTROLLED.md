# TPI-STUDIOFLOW-035 — Emergency Restoration and Controlled Reconstruction

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 11:19.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md](../300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md)
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
## TPI-STUDIOFLOW-035
### EMERGENCY INTERFACE RESTORATION AND CONTROLLED RECONSTRUCTION

**PRIORITY: CRITICAL — OWNER DIRECTIVE**

**ASSIGNED TO:** FreeBuff

**OBJECTIVE:** Restore StudioFlow's original working interface before integrating additional media-management features.

## PHASE 1 — RESTORE THE WORKING STUDIO

### 1. STOP CURRENT INTERFACE EXPANSION

Immediately suspend additional StudioFlow asset-interface development.

Do not introduce new features, new card systems, or additional controls during restoration.

The current production interface contains unacceptable layout problems, duplicated functionality, and overlapping elements.

The owner has rejected the current presentation.

### 2. IDENTIFY THE LAST WORKING INTERFACE

Inspect Git history and identify the last version where the original StudioFlow asset controls were functioning correctly.

Specifically recover the original implementations of:

- Sounds.
- Background Music.
- Video playback controls.
- Timer controls.
- Motion Backgrounds.
- Sidebar layout.

Do not blindly revert the entire application or deploy an old Worker version without checking compatibility.

Use targeted restoration of the affected components.

### 3. RESTORE SOUNDS

Restore the original Sounds interface, including:

- Upload Sound.
- Volume control.
- Stop Sound.
- Playback.
- Existing uploaded sounds.
- Heartbeat Fast example.

Remove duplicate presentation controls.

Preserve the data and functionality associated with the newer nine-slot soundboard for later reintegration.

### 4. RESTORE BACKGROUND MUSIC

Restore the original Background Music interface, including:

- Upload Music.
- Volume control.
- Stop Music.
- Playback.
- Existing music assignments.

Remove duplicate presentation controls.

Preserve the nine-slot music data and functionality for later reintegration.

### 5. RESTORE VIDEO AND TIMER PRESENTATION

Repair the Video Clips layout so that nothing overlaps or extends beyond its card boundaries.

Preserve all nine video slots and existing assignments.

Keep Intro and Outro protected.

Remove the permanent Thank You and Be Right Back labels from Video Clips 3 and 4.

Preserve the six timer configurations and the existing timer engine.

Eliminate duplicate timer presentation controls without removing their underlying functionality.

### 6. PROTECT EXISTING STUDIO DATA

Do not modify or delete:

- Crossroads of the Unknown.
- Existing studio configurations.
- Intro and Outro assignments.
- Uploaded video.
- Uploaded sounds.
- Uploaded music.
- Motion backgrounds.
- Production D1 or R2 data.

Do not perform destructive migrations.

### 7. VERIFY RESTORATION VISUALLY

Test the restored interface at the actual sidebar width shown in the owner's screenshots.

Capture screenshots of:

- Sounds.
- Background Music.
- Video Clips.
- Video Timers.
- Backgrounds.

Verify that:

- No controls overlap.
- No labels are unreadable.
- No duplicate audio sections remain.
- No horizontal scrolling is required inside the sidebar.
- Existing controls work correctly.

Use Firefox Developer Edition and Chromium with isolated automation profiles.

### 8. COMPLETE PHASE 1 RELEASE

Once the restored interface passes functional and visual verification:

1. Commit the restoration.
2. Push to GitHub.
3. Deploy through the guarded Cloudflare workflow.
4. Verify the restored production interface.
5. Confirm the working tree is clean.

**Do not begin Phase 2 until Phase 1 has been successfully deployed and visually accepted.**

---

## PHASE 2 — CONTROLLED FEATURE REINTEGRATION

**This phase is authorized for planning only until the owner accepts Phase 1.**

### 9. SOUNDS — OPTION B

Integrate the nine sound-effect slots into the original Sounds section using compact horizontal rows.

Each row should provide:

- Readable sound name.
- Play control.
- Options menu.
- Replace and Remove actions.

Retain the original volume and Stop Sound controls.

There must be only one Sounds section.

### 10. BACKGROUND MUSIC — OPTION B

Integrate nine music slots into the original Background Music section using the same compact horizontal layout.

Retain the original volume and Stop Music controls.

Background Music must operate independently from Sound Effects.

There must be only one Background Music section.

### 11. VIDEO CLIPS

Retain nine video slots:

- Intro.
- Outro.
- Video 3–9.

Intro and Outro remain protected.

Use responsive cards with readable labels and thumbnails.

Do not force three columns into a narrow sidebar.

### 12. VIDEO TIMERS

Retain six timer configurations using one unified interface and one countdown engine.

Preserve existing scene integration.

Future animated timer designs are outside the scope of this restoration.

### 13. PLACARDS

Plan a separate Placards section for professional presentation graphics.

Examples include Starting Soon, Be Right Back, Thank You, and Technical Difficulties.

Placards must not permanently occupy Video Clip slots.

Do not implement the new Placards system during Phase 1.

### 14. FINAL REPORT

Provide separate results for:

**PHASE 1 — RESTORATION**

- Git version used as reference.
- Components restored.
- Data preserved.
- Visual screenshots.
- Functional tests.
- Commit SHA.
- Production Worker version.
- Live acceptance.
- Working-tree status.

**PHASE 2 — PLANNING**

- Proposed Sounds layout.
- Proposed Background Music layout.
- Video Clip layout.
- Timer integration approach.
- Placard architecture.

Do not report Phase 2 as implemented.

### FINAL REQUIREMENT

**Restore stability and usability before adding more functionality.**

The owner must be able to use StudioFlow comfortably again before additional media-interface development resumes.

**END DIRECTIVE — TPI-STUDIOFLOW-035**
