# TPI-STUDIOFLOW-OWNER-VERIFICATION-001 — Post-Deployment Studio Management Verification & Owner Workflow Recovery

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation (FreeBuff working thread).
> Issued: October 25, 2026.
> Archived: 2026-10-25 19:09 EDT under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original wording is preserved below without edits.

**Related completion records:**
[`../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-STUDIO-LIFECYCLE-RECOVERY.md`](../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-STUDIO-LIFECYCLE-RECOVERY.md),
[`../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-INTEGRATED-RECOVERY.md`](../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-INTEGRATED-RECOVERY.md),
[`../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-PRODUCTION-PARITY-INVESTIGATION.md`](../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-PRODUCTION-PARITY-INVESTIGATION.md)

**Cross-referenced historical directives:**
[STUDIOFLOW-CRITICAL-STUDIO-CREATION-SWITCHING-WORKSPACE-ISOLATION-RECOVERY.md](STUDIOFLOW-CRITICAL-STUDIO-CREATION-SWITCHING-WORKSPACE-ISOLATION-RECOVERY.md),
[STUDIOFLOW-PRODUCTION-PARITY-INVESTIGATION-AUTHORIZATION.md](STUDIOFLOW-PRODUCTION-PARITY-INVESTIGATION-AUTHORIZATION.md),
[STUDIOFLOW-EMERGENCY-DEVELOPMENT-PRODUCTION-PARITY.md](STUDIOFLOW-EMERGENCY-DEVELOPMENT-PRODUCTION-PARITY.md),
[STUDIOFLOW-INTEGRATED-STUDIO-MANAGEMENT-SCENE.md](STUDIOFLOW-INTEGRATED-STUDIO-MANAGEMENT-SCENE.md)

---

THE PARANORMAL INITIATIVE

TPI-STUDIOFLOW-OWNER-VERIFICATION-001

POST-DEPLOYMENT STUDIO MANAGEMENT VERIFICATION & OWNER WORKFLOW RECOVERY

Assigned Agent: FreeBuff
Priority: CRITICAL
System: StudioFlow — Studio Management
Date: October 25, 2026
Classification: Production Verification / Owner Acceptance Pending
Current Status: DEPLOYED AND AGENT-VERIFIED — NOT OWNER ACCEPTED

⸻

1. OBJECTIVE

FreeBuff, you have reported completing the StudioFlow Studio Creation, Switching, and Workspace Isolation Recovery.

Your report identifies two root causes:

1. New Studios created from the home screen inherited configuration from the previously active Studio.
2. Browser-only Studio switching could silently revert when the selected Studio lacked a saved configuration snapshot.

You reported correcting both defects and deploying the changes.

However, the owner has not yet verified that the repair works in their actual production account.

Your next assignment is to verify the repaired workflow, investigate any remaining account-specific problems, and establish whether StudioFlow is ready for owner acceptance.

Do not treat your previous automated test results as final owner acceptance.

⸻

2. REQUIRED DOCUMENTATION

Before beginning, read:

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md

Also review:

* TPI-CURRENT-DEVELOPMENT-STATUS.md
* TPI-DEVELOPMENT-AGENT-HANDOFF.md
* 009-TESTING-AND-VERIFICATION.md
* DIRECTIVE-INDEX.md
* The latest Studio Management Recovery completion record.
* The October 25 production parity investigation.
* The StudioFlow workspace persistence documentation.
* The StudioFlow lifecycle regression suite.

Follow the existing authoritative documentation.

Archive this directive verbatim in the existing directive archive before implementation or verification work.

Do not overwrite historical directives.

⸻

3. CURRENT REPORTED DEPLOYMENT

The previous recovery reported:

Canonical source commit: 44f9478

Website application commit: 161d03d

Documentation commit: 3779f1a

Production Worker:

9d3aa40c-9a44-4bf9-bcf1-8efcbf837683

Rollback Worker:

7bddac9c-bda3-41c1-95d2-13aacc09cb28

Production URL:

https://paranormalinitiative.com/studio/

Verify these identifiers against the current deployment records.

Do not assume they remain current if another agent has deployed changes.

⸻

4. OWNER-OBSERVED PROBLEMS

The owner previously reported:

Testing 123

A newly created Studio displayed eight Scenes items resembling the Crossroads configuration instead of the four required defaults.

Browser Only Crossroads

Selecting Browser Only Crossroads did not activate that Studio.

The application continued displaying Testing 123.

Local Versus Production

The owner observed four default Scenes items locally and eight items in production.

The previous parity investigation established matching application bundles, but this did not establish matching saved Studio configurations or correct switching behavior.

These observations remain the basis of owner acceptance testing.

⸻

5. VERIFY THE CURRENT PRODUCTION BUILD

Before conducting workflow tests:

1. Identify the current deployed Worker.
2. Verify the active JavaScript and CSS assets.
3. Compare them with the authoritative integrated build.
4. Confirm the Studio Management recovery is actually present.
5. Verify that no subsequent deployment has replaced or reverted the repair.

If production does not contain the repaired implementation, stop and report the deployment discrepancy.

Do not begin modifying owner data.

⸻

6. VERIFY STUDIO CREATION

Using an authorized isolated QA account, create a new disposable Studio through the same home-screen workflow the owner used.

Verify:

* A unique Studio ID is created.
* The new Studio activates immediately.
* It receives exactly four default Scenes items.
* The four items are Intro Video, Scene 1, Scene 2, and Outro Video.
* No previous Studio configuration is inherited.
* No existing media assignments are inherited.
* The selected Studio name matches the active Studio ID.
* The correct configuration survives a browser refresh.

Repeat using the My Studios creation workflow.

Both creation paths must produce the same clean result.

⸻

7. VERIFY STUDIO SWITCHING

Create two disposable Studios with different configurations.

Test:

Studio A → Studio B → Studio A

At every transition, verify:

* Selected Studio ID.
* Active Studio ID.
* Rendered Studio name.
* Loaded scene configuration.
* Media assignments.
* Persisted configuration ownership.

Verify that the application does not retain the previous Studio’s state under the newly selected Studio’s identity.

Repeat after refreshing the browser.

Repeat with unsaved changes.

Repeat with a browser-only Studio that lacks a historical snapshot.

The application must not silently revert to the previous Studio.

⸻

8. INVESTIGATE TESTING 123 AND BROWSER ONLY CROSSROADS

These are existing owner Studios and must be protected.

Determine whether the owner-account issue can be investigated through authorized read-only access.

If access is available, inspect:

* Studio IDs.
* Workspace ownership.
* Creation timestamps.
* Saved configuration references.
* Scene ownership.
* Browser-local snapshot references, where legitimately accessible.
* Active Studio selection state.
* Any saved configuration inherited from another Studio.

Determine whether Testing 123 contains historically persisted configuration from the old creation defect.

Determine whether Browser Only Crossroads has a missing or invalid browser-local snapshot.

Do not assume the current repair automatically corrects previously saved data.

If direct owner-account inspection is unavailable, explicitly report that limitation.

Do not claim that the owner-account issue has been verified based solely on the QA account.

⸻

9. OWNER DATA PROTECTION

The following Studios are protected:

* Crossroads of the Unknown.
* Testing 123.
* Browser Only Crossroads.
* All other existing owner Studios.

Do not delete, reset, rename, migrate, or overwrite these Studios.

Do not remove scenes or media assignments.

Do not perform a destructive cleanup.

Do not bypass authentication.

If historical configuration requires repair, prepare a separate proposed remediation with:

1. The exact affected Studio ID.
2. The current saved state.
3. The proposed changes.
4. The backup and rollback procedure.
5. The expected outcome.
6. The risks.

Wait for explicit owner authorization before modifying existing Studio data.

⸻

10. VERIFY LOCAL-TO-PRODUCTION CONSISTENCY

Confirm that the local development environment and production use the same intended StudioFlow implementation.

However, distinguish:

Application Code Parity

Whether the deployed application matches the authoritative source.

Workspace Data Parity

Whether the two environments are displaying the same Studio configuration.

Studio Identity

Whether the selected Studio is actually the active Studio.

Persistence Scope

Whether the configuration is stored in D1 or browser-local storage.

Explain why a local Studio can display four default items while a production Studio displays eight saved items.

Do not label different Studio data as a deployment mismatch unless evidence supports that conclusion.

⸻

11. REQUIRED REGRESSION PROTECTION

Preserve the newly added lifecycle tests covering:

* Clean home-screen Studio creation.
* Clean My Studios creation.
* Browser-only switching.
* Missing snapshot recovery.
* Failed-save handling.
* Studio configuration isolation.
* Scene isolation.
* Media isolation.
* Refresh persistence.
* Rapid switching.

Verify that these tests are included in the maintained release verification process.

Do not rely on a test suite that can pass while the owner’s documented workflows fail.

Also document the five previously reported static-contract failures and the intermittent rapid-upload test failure.

Do not silently mark these as resolved.

⸻

12. IF A NEW DEFECT IS FOUND

If verification identifies another application defect:

1. Reproduce it.
2. Identify the exact root cause.
3. Document the affected files.
4. Implement the smallest correct repair.
5. Run the required regression suites.
6. Follow the authoritative source-to-live deployment playbook.
7. Verify the new deployment using the isolated QA account.
8. Preserve the rollback checkpoint.
9. Update the current-state documentation.

Coordinate repository and deployment ownership with any concurrently active coding agent.

Do not overwrite uncommitted changes from another agent.

Do not deploy unrelated work.

⸻

13. REQUIRED EVIDENCE

Preserve durable evidence demonstrating:

* The production Worker and application version.
* Successful home-screen Studio creation.
* Successful My Studios creation.
* Four clean default Scenes items.
* Successful Studio switching.
* Correct active Studio IDs.
* Correct scene and media ownership.
* Refresh persistence.
* Browser-only missing-snapshot recovery.
* Protection of existing owner data.

Evidence must distinguish local testing from authenticated production testing.

⸻

14. REQUIRED COMPLETION REPORT

Provide the following:

A. Production Version

Identify the exact application and Worker currently deployed.

B. Studio Creation

Confirm whether both creation workflows produce independent Studios.

C. Studio Switching

Confirm whether switching activates the correct Studio and configuration.

D. Owner Studio Investigation

Report what can actually be established about Testing 123 and Browser Only Crossroads.

E. Historical Data

Identify whether any existing Studio configurations require separate remediation.

F. Local Versus Production

Explain the observed four-item versus eight-item difference using verified evidence.

G. Tests

Provide exact test results and any remaining failures.

H. Changes

List any application, test, or documentation files modified.

I. Deployment

If another deployment was necessary, provide the new deployment and rollback identifiers.

J. Owner Acceptance

Report the status as:

AGENT VERIFIED — OWNER ACCEPTANCE PENDING

Do not mark the recovery owner accepted.

⸻

15. FINAL REQUIREMENT

The owner must be able to:

1. Create a completely independent Studio.
2. Open that Studio immediately.
3. See exactly four default Scenes items.
4. Switch to another existing Studio.
5. See that Studio’s own scenes and media.
6. Switch back without losing configuration.
7. Refresh without losing the selected Studio.
8. Continue using Crossroads without unintended changes.

Do not close this recovery solely because the automated tests pass.

The purpose of this directive is to establish that StudioFlow works correctly in the actual workflow that previously failed.

END OF DIRECTIVE
