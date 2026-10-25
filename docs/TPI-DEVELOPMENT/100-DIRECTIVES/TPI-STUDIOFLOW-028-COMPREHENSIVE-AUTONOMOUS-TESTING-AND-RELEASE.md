# TPI-STUDIOFLOW-028 — Comprehensive Autonomous Testing and Release Completion

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 01:08.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md](../300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md)
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
## TPI-STUDIOFLOW-028
### COMPREHENSIVE AUTONOMOUS TESTING AND RELEASE COMPLETION

**PRIORITY: CRITICAL**

**ASSIGNED TO:** FreeBuff — Claude Haiku 5.5

**STATUS:** EXECUTE

### 1. OWNER CONFIRMATIONS

The owner has successfully reset the `local_admin` password and logged into the development website.

**The owner login acceptance requirement is satisfied.**

Do not request another password reset unless a new, independently verified authentication failure occurs.

The owner also authorizes FreeBuff to investigate, validate, and incorporate the existing uncommitted StudioFlow work into the release.

This includes the 12 modified files and the untracked configuration-integrity verifier identified during the previous investigation.

Authorization to investigate and commit does not mean every change is automatically accepted. Review the changes, preserve valid work, and repair defects before committing.

Do not discard existing work without establishing what it contains.

### 2. PRIMARY OBJECTIVE

FreeBuff must be capable of independently testing the complete StudioFlow application.

**Passing static verification scripts is not sufficient.**

The application must be tested through actual browser interactions and backend verification.

The objective is to establish a repeatable testing system that can verify the application's functionality after future changes.

### 3. BROWSER AUTOMATION REQUIREMENTS

Use the available browser automation infrastructure.

Test using:

- Chromium.
- Firefox Developer Edition.

Use isolated browser profiles and disposable testing data.

The automation must be capable of:

1. Opening the development website.
2. Logging in with a dedicated synthetic test account.
3. Navigating between application sections.
4. Clicking buttons and menus.
5. Uploading synthetic media.
6. Operating video and audio controls.
7. Creating and modifying studios.
8. Saving and reloading studios.
9. Switching between studios.
10. Exporting and restoring backups.
11. Detecting visible interface failures.
12. Capturing screenshots and diagnostic logs.

Do not use the owner's private password in automated tests.

Do not alter the owner's existing browser profile.

### 4. COMPLETE STUDIOFLOW FUNCTIONAL TESTING

Build or extend browser acceptance tests covering the following areas.

**A. STUDIO MANAGEMENT**

- Create a studio.
- Rename a studio.
- Save a studio.
- Switch between studios.
- Confirm automatic saving.
- Confirm the selected studio opens directly.
- Reload the browser.
- Confirm workspace persistence.
- Verify studio isolation.
- Verify conflicting workspace identities are rejected.

**B. VIDEO CLIPS**

Test all nine video slots.

Verify:

- Empty-state appearance.
- Upload and assignment.
- Media preview.
- Thumbnail display.
- Filename display.
- Replace.
- Remove.
- Persistence after reload.
- Intro protection.
- Outro protection.
- Protected-slot confirmation behavior.

**C. VIDEO TIMERS**

Test all six timer slots.

Verify:

- Timer selection.
- Start.
- Pause, resume, and stop where supported.
- Reset.
- Countdown accuracy.
- Custom durations.
- Visual countdown display.
- Switching between timer slots.
- Prevention of duplicate running timers.
- Correct behavior when a timer completes.

Specifically verify the recently repaired Start-button behavior.

**D. SOUND EFFECTS**

Test all nine sound-effect slots.

Verify:

- Media assignment.
- Playback.
- Stop.
- Volume.
- Replacement.
- Removal.
- Persistence.
- Existing Sounds interface integration.

Confirm no duplicate competing soundboard exists.

**E. BACKGROUND MUSIC**

Test all nine music slots.

Verify:

- Upload.
- Playback.
- Stop.
- Volume.
- Replacement.
- Removal.
- Persistence.
- Existing Background Music interface integration.

Confirm music controls operate independently from sound effects.

**F. MOTION BACKGROUNDS**

Verify the original motion-background functionality remains operational.

Test selection, preview, scene assignment, and persistence where supported.

**G. BACKUP AND RESTORE**

Test:

- Studio configuration export.
- Media-inclusive export.
- Backup validation.
- Missing optional assets.
- Missing required assets.
- Corrupt backup rejection.
- Restore as a new studio.
- Media restoration.
- Rollback after failed restoration.
- Chromium folder backup.
- Firefox portable backup.

**H. ADMINISTRATION AND AUTHENTICATION**

Test:

- Development login.
- Invalid-password rejection.
- Session persistence.
- Logout.
- Session expiration.
- Administrative access controls.
- Worker restart persistence.

Use synthetic credentials for automated testing.

### 5. VISUAL ACCEPTANCE TESTING

Functional correctness is not enough.

Capture screenshots of the relevant StudioFlow sections and inspect them for:

- Overlapping elements.
- Truncated labels.
- Broken thumbnails.
- Missing controls.
- Duplicated sections.
- Incorrect empty states.
- Unreadable text.
- Sidebar overflow.
- Mobile and tablet layout problems.
- Inconsistent button behavior.

Verify representative desktop, tablet, and mobile viewport sizes.

Where practical, use stable screenshot comparisons.

Do not approve a visually broken interface simply because a click test passes.

### 6. ERROR DETECTION

Investigate the previously reported:

- ERR_CONNECTION_REFUSED.
- HTTP 503.
- HTTP 404.

Capture the failing request URL, initiator, status, and application impact.

Classify each as:

- Expected development-only behavior.
- Optional unavailable resource.
- Test infrastructure issue.
- Application defect.
- Production-relevant defect.

Repair genuine application defects.

Do not suppress errors to make tests pass.

### 7. TEST RELIABILITY

Investigate the two failing Directive 022 static assertions.

Determine whether they are stale assertions or genuine behavioral regressions.

Use browser tests to establish the correct behavior before updating them.

Tests must validate outcomes, not merely search for particular source-code strings.

Do not weaken meaningful assertions.

Where possible, add regression coverage for defects already discovered during development.

### 8. AUTOMATED TESTING SYSTEM

Create or extend a documented testing command that runs the appropriate StudioFlow release checks.

The testing system should:

- Verify prerequisites.
- Start or connect to the isolated development Worker.
- Use disposable test data.
- Execute backend tests.
- Execute browser tests.
- Collect screenshots.
- Collect console and network errors.
- Produce machine-readable results.
- Produce a human-readable summary.
- Return a nonzero exit code for critical failures.
- Clean up only its own temporary data.

Do not clear production or owner data.

The test runner should be reusable for future directives.

### 9. RELEASE GATES

Before production deployment, complete the applicable release checks:

- API E2E.
- Configuration integrity.
- StudioFlow stability.
- Video management.
- Timer functionality.
- Audio management.
- Media organization.
- Firefox acceptance.
- Chromium acceptance.
- Backup and restore.
- Authentication.
- Production build.
- Asset integrity.
- Guarded Wrangler dry-run.

If a critical gate fails, repair the defect and rerun the affected checks.

### 10. GIT AND PRODUCTION DEPLOYMENT

After verification:

1. Review the working-tree changes.
2. Commit the verified release.
3. Push to the approved development branch.
4. Confirm the remote commit.
5. Confirm the current production Worker version.
6. Identify and verify a viable rollback target.
7. Execute the existing guarded deployment process.
8. Perform non-destructive production acceptance.
9. Confirm the deployed Worker version.

The previously observed production version was:

`530d6f93-2a6a-4d6d-8441-b377b2062c14`

Verify that this is still current before deployment.

If a critical production regression occurs, use the approved rollback procedure.

### 11. OWNER DATA PROTECTION

Never modify or delete:

- The owner's Crossroads of the Unknown studio.
- Existing production studio media.
- Production D1 records.
- Production R2 objects.
- Owner browser profiles.
- Production secrets.

Use isolated testing environments and disposable test studios.

Do not conduct destructive testing against production.

### 12. AUTONOMOUS EXECUTION

FreeBuff is authorized to investigate and resolve routine development issues independently.

Do not repeatedly request permission for:

- Running tests.
- Fixing test infrastructure.
- Repairing application bugs.
- Updating stale tests after behavioral verification.
- Committing verified work.
- Pushing approved changes.
- Performing guarded deployment.
- Running non-destructive production acceptance.

Stop only when a genuine security, credential, irreversible-data, or infrastructure permission boundary requires owner involvement.

### 13. FINAL REPORT

Provide a comprehensive report containing:

1. Functional areas tested.
2. Browser automation results.
3. Visual acceptance results.
4. Firefox results.
5. Chromium results.
6. API E2E results.
7. Authentication results.
8. Backup and restore results.
9. Background network error findings.
10. Defects discovered and repaired.
11. Remaining failures.
12. Git commit SHA.
13. Push confirmation.
14. Production deployment status.
15. Production Worker version.
16. Live acceptance results.
17. Rollback readiness.

Clearly distinguish:

**PASSED — FAILED — NOT TESTED — BLOCKED**

Never report an unexecuted test as passed.

### FINAL OBJECTIVE

Establish a reliable testing system that allows FreeBuff to independently verify StudioFlow functionality before future releases.

**Do not stop after planning or running static verification. Execute the functional tests, repair confirmed defects, and complete the guarded release process when all critical requirements are satisfied.**

**END DIRECTIVE — TPI-STUDIOFLOW-028**
