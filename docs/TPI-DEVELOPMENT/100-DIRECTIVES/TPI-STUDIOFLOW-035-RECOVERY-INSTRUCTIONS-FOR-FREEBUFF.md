# TPI-STUDIOFLOW-035 — Recovery Instructions for FreeBuff

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 11:34.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md](../300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-035
## CONTINUATION — COMPLETE MEDIA ASSETS RESTORATION

**PRIORITY: CRITICAL**

FreeBuff, continue Directive 035.

The owner has already selected commit `7b3f488` as the restoration reference.

Do not request that decision again.

**THE ONLY AUTHORIZED TARGET IS STUDIOFLOW → MEDIA ASSETS.**

### 1. CORRECT THE PARTIAL RESTORATION

Before continuing, inspect the current Git index and working tree.

The previous attempt left:

- Modified `studio/index.html`.
- Modified `scripts/stage-local-studio-assets.mjs`.
- Staged deletions of both Media Assets bridge scripts.
- A staged deletion of `studio/studioflow-012-overrides.css`.
- An unrelated untracked QA script.

Preserve unrelated work.

Do not perform a repository-wide reset.

**Restore `studio/studioflow-012-overrides.css` from its current pre-restoration version.**

Then identify and remove ONLY the CSS rules introduced for the unwanted Media Assets organization.

Preserve every CSS rule needed by other StudioFlow sections.

### 2. USE THE APPROVED REFERENCE

Use commit:

`7b3f488`

Compare its Media Assets implementation with the current version.

Restore the original Media Assets appearance and functionality.

Do not replace the complete StudioFlow application or revert shared backup, persistence, workspace, or authentication changes.

### 3. RESTORE MEDIA ASSETS ONLY

Restore the original presentation of:

- Video Clips.
- Video Timers.
- Sounds.
- Background Music.
- Backgrounds and Motion Backgrounds.

Remove the recently introduced organization overlays and duplicate controls.

Preserve the original working functionality.

Do not introduce any new features.

### 4. PRESERVE EXISTING MEDIA

Removing a presentation bridge must not delete its stored data.

Protect:

- All uploaded media.
- Existing video assignments.
- Sound assignments.
- Music assignments.
- Crossroads of the Unknown.
- Other studio configurations.

Do not delete production D1, R2, or IndexedDB records.

### 5. RESOLVE BROWSER ACCESS AUTONOMOUSLY

Do not request the owner's password.

Investigate why the isolated Chromium test session reached StudioFlow setup but could not enter a studio.

Use the existing isolated QA authentication infrastructure.

If necessary, create a disposable test studio in isolated development data.

Do not alter the owner's actual studio or account.

Confirm that the browser can enter the test studio and open Media Assets.

### 6. VERIFY THE ORIGINAL INTERFACE

Compare the restored Media Assets interface against the selected Git reference.

Verify:

- Original sections and controls are present.
- Sounds playback and volume work.
- Background Music playback and volume work.
- Video playback works.
- Timers work.
- Background selection works.
- No duplicate controls remain.
- No overlapping elements.
- No horizontal overflow.

Capture actual browser screenshots.

Test in Chromium and Firefox Developer Edition.

### 7. UPDATE OBSOLETE TESTS

Identify tests that specifically require the removed Media Assets organization bridges.

Do not report their failures as successful verification.

Determine whether those tests should be retired or replaced with restoration-specific regression tests.

Preserve unrelated test coverage.

### 8. RELEASE ONLY AFTER VERIFICATION

Once restoration is verified:

1. Review the complete Git diff.
2. Confirm every code change is necessary for Media Assets restoration.
3. Run relevant regression tests.
4. Commit only authorized restoration changes.
5. Push to GitHub.
6. Deploy using the established guarded Cloudflare process.
7. Verify the restored Media Assets interface on production using an authorized account.
8. Confirm the working tree contains no restoration-related uncommitted changes.

Do not bypass deployment guards.

If a genuine blocker remains, report the exact technical blocker and the evidence. Do not repeatedly request decisions already provided.

### 9. STOP AFTER RESTORATION

Do not proceed with nine-slot audio integration, video redesigns, animated timers, placards, or any other new features.

Wait for the owner's inspection.

## FINAL INSTRUCTION

**RESTORE MEDIA ASSETS ONLY.**

**PRESERVE THE REST OF STUDIOFLOW.**

**NO NEW FEATURES.**

**NO FULL STYLESHEET DELETION.**

**NO UNVERIFIED PRODUCTION DEPLOYMENT.**

Complete the restoration, verify it, and stop.

**END DIRECTIVE**
