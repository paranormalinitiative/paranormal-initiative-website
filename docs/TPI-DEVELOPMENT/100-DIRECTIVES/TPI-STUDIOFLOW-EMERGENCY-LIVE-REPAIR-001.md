# TPI-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001 — Emergency Live Production Repair

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation (FreeBuff working thread).
> Issued: October 25, 2026.
> Archived: 2026-10-25 19:45 EDT under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original wording is preserved below without edits.

**Related completion records:**
[`../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-OWNER-VERIFICATION-001.md`](../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-OWNER-VERIFICATION-001.md),
[`../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-STUDIO-LIFECYCLE-RECOVERY.md`](../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-STUDIO-LIFECYCLE-RECOVERY.md)

**Cross-referenced historical directives:**
[TPI-STUDIOFLOW-OWNER-VERIFICATION-001-POST-DEPLOYMENT-STUDIO-MANAGEMENT.md](TPI-STUDIOFLOW-OWNER-VERIFICATION-001-POST-DEPLOYMENT-STUDIO-MANAGEMENT.md),
[STUDIOFLOW-CRITICAL-STUDIO-CREATION-SWITCHING-WORKSPACE-ISOLATION-RECOVERY.md](STUDIOFLOW-CRITICAL-STUDIO-CREATION-SWITCHING-WORKSPACE-ISOLATION-RECOVERY.md),
[STUDIOFLOW-EMERGENCY-DEVELOPMENT-PRODUCTION-PARITY.md](STUDIOFLOW-EMERGENCY-DEVELOPMENT-PRODUCTION-PARITY.md)

---

THE PARANORMAL INITIATIVE

TPI-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001

Priority: CRITICAL — IMMEDIATE PRODUCTION REPAIR
Assigned Agent: FreeBuff
Affected System: StudioFlow — Live Production
Date: October 25, 2026
Status: REPAIR REQUIRED — OWNER ACCEPTANCE PENDING

⸻

1. PRIMARY OBJECTIVE

FreeBuff, we are finished investigating whether the application code matches production.

Your previous investigations have established the root causes of the Studio creation and switching failures.

The owner now requires the actual live StudioFlow environment to be corrected and made operational.

Production:

https://paranormalinitiative.com/studio/

The owner must be able to create independent Studios, switch between them, and have the correct scenes and media load.

Do not submit another investigation-only completion report.

Your assignment is to resolve the remaining production problems and demonstrate the corrected behavior.

⸻

2. MANDATORY GOVERNANCE

Before implementation, read:

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md

Also read the current development status, agent handoff, testing documentation, directive index, and the two most recent Studio Management recovery reports.

Archive this directive verbatim in the existing directive archive before proceeding.

Preserve historical documentation.

⸻

3. CONFIRMED PRODUCTION PROBLEM

The owner’s production Studio named:

Testing 123

Contains eight inherited Scenes items from the previous defective Studio creation process.

Its production database record is:

a75afc38-c7a6-452d-9460-5d746712d411

The previous read-only inspection established that this record contains historical configuration associated with Crossroads of the Unknown.

This is not the desired configuration for Testing 123.

The owner also reported that selecting:

Browser Only Crossroads

failed to activate the selected Studio.

The application remained on Testing 123.

The switching defect has reportedly been repaired in application code, but the owner’s browser-local Studio has not been verified directly.

⸻

4. REPAIR TESTING 123

The owner created Testing 123 as a temporary test Studio to demonstrate the original defect.

The intended configuration is the clean four-item Studio default:

1. Intro Video
2. Scene 1
3. Scene 2
4. Outro Video

Do not delete or overwrite this production record without explicit approval of the exact data-changing operation.

Prepare a targeted remediation for Testing 123 only.

Before executing it:

1. Verify the exact workspace ID and owner.
2. Export its complete existing configuration.
3. Preserve the backup in a durable location.
4. Document the rollback procedure.
5. Confirm the reset will not affect shared media assets or other Studios.
6. Present the precise reset operation for owner approval.

After approval, reset only Testing 123’s Studio-specific scene and media assignments to the clean default configuration.

Preserve the Studio identity and all unrelated account data.

Do not modify Crossroads of the Unknown.

⸻

5. REPAIR BROWSER-ONLY STUDIO SWITCHING

The owner previously selected Browser Only Crossroads, but StudioFlow remained on Testing 123.

The application repair reportedly handles missing browser-local snapshots.

Now establish whether the owner’s actual browser can activate this Studio.

Inspect the current browser-only Studio activation and snapshot recovery behavior using authorized access.

If the owner’s browser profile cannot be inspected remotely, provide a safe, narrowly scoped diagnostic procedure that the owner can execute without exposing credentials or destroying browser data.

Do not clear all browser storage.

Do not reset all Studios.

Do not delete browser-only Studio snapshots.

If a browser-local record is malformed or missing, preserve recoverable information and implement a targeted recovery.

The selected Studio must activate correctly and show the proper Studio identity.

⸻

6. VERIFY NEW STUDIO CREATION ON PRODUCTION

Using an isolated QA account, verify that a newly created Studio:

* Receives a unique identity.
* Opens immediately.
* Contains exactly four default Scenes items.
* Does not inherit another Studio’s configuration.
* Does not inherit media assignments.
* Persists correctly.
* Can be reopened after switching away.
* Survives browser refresh.

Verify both the home-screen and My Studios creation workflows.

⸻

7. VERIFY STUDIO SWITCHING ON PRODUCTION

Using isolated QA Studios, demonstrate:

Studio A → Studio B → Studio A

Verify the actual Studio IDs, scene configurations, and media assignments.

Repeat with a browser-only Studio.

Verify that unsaved changes are handled safely.

Verify that switching failures display clear errors rather than silently reverting.

⸻

8. PROTECT EXISTING PRODUCTION STUDIOS

The following must remain protected:

* Crossroads of the Unknown.
* Browser Only Crossroads.
* All other existing owner Studios.

Do not modify their scenes, recordings, media, or production configurations.

Do not use owner Studios as disposable testing fixtures.

Do not perform database-wide resets.

Do not perform destructive migrations.

Any owner-data changes beyond the specifically approved Testing 123 remediation require separate authorization.

⸻

9. DEPLOYMENT AND RELEASE

The currently reported production Worker is:

9d3aa40c-9a44-4bf9-bcf1-8efcbf837683

Verify the active Worker before making changes.

If application changes are necessary:

1. Modify the canonical StudioFlow source.
2. Build the authoritative integration.
3. Run all required regression suites.
4. Follow the Source-to-Live Playbook.
5. Preserve a rollback checkpoint.
6. Deploy through the guarded release process.
7. Verify authenticated production behavior.

Do not deploy unrelated changes.

Do not overwrite concurrent agent work.

⸻

10. REQUIRED FINAL VERIFICATION

The live website must demonstrate:

1. Independent Studio creation.
2. Four default Scenes items.
3. Correct Studio switching.
4. Correct Studio identity.
5. Independent scene configurations.
6. Independent media assignments.
7. Reliable persistence after refresh.
8. Safe recovery from missing browser-local snapshots.
9. Preservation of Crossroads.
10. No silent failures.

Provide evidence from the actual production environment.

⸻

11. COMPLETION REPORT

Report:

A. Production problems corrected

B. Testing 123 remediation status

C. Browser Only Crossroads recovery status

D. Studio creation verification

E. Studio switching verification

F. Files and data modified

G. Regression results

H. Deployment identifiers

I. Rollback and backup information

J. Remaining owner actions

Do not mark the project OWNER ACCEPTED until the owner personally confirms that the live StudioFlow interface functions correctly.

⸻

FINAL INSTRUCTION

FreeBuff, the objective is straightforward:

Make the live StudioFlow website function correctly.

The owner should be able to select a Studio and immediately enter that Studio with its own saved configuration.

New Studios must start clean.

Existing Studios must retain their intended configurations.

Do not substitute passing automated tests for working production behavior.

END OF DIRECTIVE
