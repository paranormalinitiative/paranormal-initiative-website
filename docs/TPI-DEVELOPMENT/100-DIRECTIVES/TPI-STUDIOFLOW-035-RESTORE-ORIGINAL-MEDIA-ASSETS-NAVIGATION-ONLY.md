# TPI-STUDIOFLOW-035 — Restore Original Media Assets Navigation ONLY

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 11:22.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md](../300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md)
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
## TPI-STUDIOFLOW-035
### EMERGENCY RESTORATION — MEDIA ASSETS NAVIGATION ONLY

**PRIORITY: CRITICAL**

**ASSIGNED TO:** FreeBuff

**STATUS:** OWNER-DIRECTED RESTORATION

### OBJECTIVE

Restore StudioFlow's **Media Assets navigation section ONLY** to its last known working appearance and functionality, before the recent Media Assets modifications.

This directive supersedes all previous instructions to redesign, expand, or improve Media Assets.

The owner has explicitly requested restoration, not reconstruction.

---

### 1. STRICT SCOPE

The ONLY authorized area for modification is:

**StudioFlow → Media Assets**

Restore the original Media Assets interface, including its original sections, controls, layout, and behavior.

Do not modify any other StudioFlow navigation item, screen, feature, or website component.

### 2. IDENTIFY THE ORIGINAL WORKING VERSION

Inspect Git history and previous implementations to locate the last working version of Media Assets before the recent modifications.

Compare that implementation against the current code.

Identify the exact files, components, and changes responsible for the Media Assets interface.

**Do not revert the entire repository or StudioFlow application.**

Restore only the affected Media Assets code.

If the original working version cannot be established confidently, stop and report the available candidates rather than guessing.

### 3. RESTORE THE ORIGINAL MEDIA ASSETS INTERFACE

Restore the original:

- Navigation layout.
- Video Clips presentation.
- Video Timers presentation.
- Sounds section.
- Background Music section.
- Backgrounds and Motion Backgrounds presentation.
- Upload controls.
- Playback controls.
- Volume controls.
- Stop controls.
- Original styling, spacing, and organization.

Remove recently introduced duplicate controls, redundant panels, and broken layouts where they did not exist in the original working implementation.

**Do not retain newer interface elements merely because they were recently developed.**

The goal is to reproduce the original working Media Assets navigation, not create a hybrid interface.

### 4. NO NEW DEVELOPMENT

The following are explicitly prohibited during this directive:

- Adding nine-slot sound-effect interfaces.
- Adding nine-slot music interfaces.
- Redesigning video cards.
- Introducing new timer designs.
- Creating placards.
- Adding new settings.
- Changing the Media Assets navigation structure.
- Making unrelated improvements.

These features will be reviewed individually with the owner after restoration.

### 5. PROTECT ALL EXISTING DATA

Do not delete, overwrite, or reset:

- Crossroads of the Unknown.
- Any other existing studio.
- Uploaded videos.
- Uploaded sounds.
- Uploaded music.
- Existing media assignments.
- Studio configurations.
- Production D1 or R2 data.

If newer Media Assets records exist, preserve their underlying data even if the original interface does not display them.

No destructive database migrations.

### 6. PROTECT EVERYTHING OUTSIDE MEDIA ASSETS

Do not modify:

- StudioFlow Home.
- My Studios.
- Studio switching.
- Automatic saving.
- Recording.
- Scenes.
- Broadcast controls.
- Podcast settings.
- Authentication.
- Admin Panel.
- Feed.
- Community.
- Other website pages.

No unrelated code cleanup or refactoring.

If restoration requires changing shared code that could affect another section, stop and report the dependency before proceeding.

### 7. VERIFY THE RESTORATION

Using an isolated browser session, compare the restored Media Assets navigation against the identified original working implementation.

Verify:

- Original layout is restored.
- Original controls are present.
- Original functionality works.
- No duplicate panels remain.
- No overlapping elements.
- No broken or unreadable labels.
- No horizontal overflow.
- Existing media remains intact.

Test using Firefox Developer Edition and Chromium.

Automated tests alone are not sufficient. Visual verification is mandatory.

### 8. RELEASE THE RESTORATION

After verification:

1. Commit only the Media Assets restoration.
2. Push the verified changes to GitHub.
3. Deploy using the established guarded Cloudflare workflow.
4. Verify the live Media Assets navigation.
5. Confirm no unrelated StudioFlow functionality changed.
6. Confirm the working tree is clean.

If safe deployment cannot be verified, do not force production changes.

### 9. FINAL REPORT

Provide:

- Git commit used as the original Media Assets reference.
- Exact files restored.
- Confirmation that no unrelated components were changed.
- Screenshots comparing the original and restored Media Assets.
- Functional test results.
- Confirmation that all media and studio data were preserved.
- New commit SHA.
- Production Worker version.
- Live verification results.

### 10. STOP AFTER RESTORATION

**Once Media Assets is restored, STOP.**

Do not proceed with additional Media Assets development.

Wait for the owner's next instructions.

We will review each section individually before authorizing any changes.

---

## FINAL OWNER INSTRUCTION

**RESTORE MEDIA ASSETS NAVIGATION ONLY.**

**DO NOT REDESIGN IT.**

**DO NOT ADD FEATURES.**

**DO NOT CHANGE ANYTHING ELSE.**

Return it to its last known working state and stop.

**END DIRECTIVE — TPI-STUDIOFLOW-035**
