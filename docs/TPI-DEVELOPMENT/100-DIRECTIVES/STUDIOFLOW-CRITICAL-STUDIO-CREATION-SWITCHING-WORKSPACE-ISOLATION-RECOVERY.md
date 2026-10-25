# STUDIOFLOW — CRITICAL STUDIO CREATION, SWITCHING & WORKSPACE ISOLATION RECOVERY

- Issue date: October 25, 2026
- Archived: 2026-10-25 15:38 EDT (received in the directive conversation)
- Status at issue: OWNER ACCEPTANCE FAILED — REPAIR REQUIRED
- Identity: TPI-STUDIOFLOW (unnumbered continuation of the Integrated Studio
  Management & Scene System Recovery)
- Related records:
  [STUDIOFLOW-INTEGRATED-STUDIO-MANAGEMENT-SCENE.md](STUDIOFLOW-INTEGRATED-STUDIO-MANAGEMENT-SCENE.md),
  [STUDIOFLOW-EMERGENCY-DEVELOPMENT-PRODUCTION-PARITY.md](STUDIOFLOW-EMERGENCY-DEVELOPMENT-PRODUCTION-PARITY.md),
  [STUDIOFLOW-PRODUCTION-PARITY-INVESTIGATION-AUTHORIZATION.md](STUDIOFLOW-PRODUCTION-PARITY-INVESTIGATION-AUTHORIZATION.md),
  `../300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-PRODUCTION-PARITY-INVESTIGATION.md`

The text below is the directive as issued, preserved verbatim.

---

THE PARANORMAL INITIATIVE

TPI-STUDIOFLOW — CRITICAL STUDIO CREATION, SWITCHING & WORKSPACE ISOLATION RECOVERY

Assigned Agent: FreeBuff
Priority: CRITICAL
Classification: Production Functionality Failure / Previous Recovery Rejected
Affected System: StudioFlow — My Studios / Studio Management / Workspace Persistence
Date: October 25, 2026
Status: OWNER ACCEPTANCE FAILED — REPAIR REQUIRED

⸻

1. DIRECTIVE OBJECTIVE

FreeBuff, the owner has demonstrated that StudioFlow’s Studio Management system remains broken on the live production website.

Previous agents reported that Studio creation, switching, and workspace isolation had been repaired, tested, and deployed.

However, the owner has now demonstrated that these operations are still not functioning correctly.

This is not a new feature request. It is a continuation and correction of the previously reported Studio Management recovery.

Your assignment is to investigate the actual failure, repair its root cause, and demonstrate that the system works on production.

Do not issue another completion report based solely on automated tests.

⸻

2. MANDATORY PROJECT DOCUMENTATION

Before modifying application code, read completely:

Original Agent Instructions

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md

Authoritative Source-to-Live Playbook

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md

Additional Required Documentation

Review the authoritative versions of:

* 009-TESTING-AND-VERIFICATION.md
* TPI-CURRENT-DEVELOPMENT-STATUS.md
* TPI-DEVELOPMENT-AGENT-HANDOFF.md
* DIRECTIVE-INDEX.md
* StudioFlow architecture documentation.
* StudioFlow workspace configuration.
* StudioFlow persistence and switching contracts.
* StudioFlow playback contract.
* Directives 033–037 and related addenda.
* Integrated Studio Management and Scene System Recovery.
* Emergency Development / Production Parity Investigation.
* October 25 StudioFlow Production Parity Investigation report.
* Relevant completion and recovery records.

Locate these documents through the existing repository structure.

Do not create replacement documents because a file is not found at an assumed path.

The original Markdown documentation and source-to-live playbook govern this assignment.

⸻

3. VERIFIED OWNER-OBSERVED FAILURES

The owner is accessing:

https://paranormalinitiative.com/studio/

Failure A — New Studio Creation

The owner created a Studio named:

Testing 123

This Studio was created specifically to demonstrate that the application was not establishing an independent production workspace.

After creation, the application displayed configuration resembling the existing Crossroads Studio.

The Scenes panel contained eight production items:

1. Intro Video
2. Background Music — After Intro
3. Countdown Timer
4. Demo scene 2
5. Background Music
6. Two-person split
7. Background Music
8. Outro Video

The stage and media assignments also appeared to reflect Crossroads of the Unknown.

This is contrary to the required clean-Studio initialization behavior.

Failure B — Studio Switching

The owner subsequently attempted to switch from:

Testing 123

to:

Browser Only Crossroads

The application continued displaying Testing 123.

The selected Studio did not visibly activate.

The owner reports that switching Studios is not working.

Failure C — Workspace Identity

Because the Studio selector is not reliably activating the requested Studio, the application may be displaying workspace information belonging to the wrong Studio.

Until this is resolved, the reliability of scene ownership, media assignments, and persistence cannot be assumed.

⸻

4. IMPORTANT FINDINGS FROM THE PREVIOUS INVESTIGATION

FreeBuff previously verified that:

* The canonical StudioFlow source produces the expected integrated build.
* The website repository contains the expected application bundles.
* Authenticated production serves byte-identical versions of the checked bundles.
* Eleven maintained bridge and override files match production.
* The production HTML differences were explained by intentional Worker/platform injections.

Therefore:

Do not assume that this is a stale deployment problem.

The previous investigation also identified a historical defect where new Studio creation could inherit active Studio configuration.

However, the actual owner-account record for Testing 123 was not inspected.

The historical defect remains a possible contributing cause, not a confirmed explanation for the current switching failure.

The new investigation must focus on runtime behavior and workspace state.

⸻

5. PRIMARY INVESTIGATION — STUDIO SWITCHING

Trace the complete Studio switching process.

The expected workflow is:

Select Studio → Validate Selection → Save Current State Safely → Activate Selected Studio ID → Load Selected Workspace → Hydrate Configuration → Render Selected Studio

Inspect every stage.

Determine:

1. Whether the My Studios dropdown receives the selection event.
2. Whether the selected Studio ID is correct.
3. Whether the selected Studio exists in the appropriate account/workspace.
4. Whether the application attempts to activate that Studio.
5. Whether the activation request succeeds or fails.
6. Whether the backend returns the correct Studio configuration.
7. Whether the frontend accepts that configuration.
8. Whether stale state overrides the selection.
9. Whether localStorage or sessionStorage restores the previous Studio.
10. Whether the workspace bridge interferes with activation.
11. Whether asynchronous operations create a race condition.
12. Whether the UI displays a Studio name different from the actual active Studio ID.
13. Whether unsaved changes or recording locks prevent switching.
14. Whether a failure is silently swallowed instead of being shown to the user.

Identify the exact failing function, event, request, state transition, or persistence operation.

Do not repair this by merely changing the displayed Studio name.

⸻

6. INVESTIGATE THE UNSAVED CHANGES STATE

The owner’s production interface previously displayed:

UNSAVED CHANGES

Determine whether this state interferes with Studio switching.

Inspect:

* Dirty-state detection.
* Automatic save operations.
* Save failures.
* Workspace transition guards.
* Pending configuration writes.
* Recording or production locks.
* Stale dirty-state flags.
* Failed backend responses.

A Studio switch must not silently fail because the current Studio has unsaved changes.

If saving fails, the application must preserve the current state and clearly explain the failure.

Do not discard unsaved owner data.

Do not automatically overwrite another Studio’s configuration.

⸻

7. INVESTIGATE STUDIO CREATION

Trace:

Create Studio → Generate Unique ID → Initialize Clean State → Persist → Activate → Render

Verify that a newly created Studio receives:

1. Intro Video
2. Scene 1
3. Scene 2
4. Outro Video

Exactly four default production items.

No inherited Crossroads scenes.
No inherited Background Music shortcuts.
No inherited Countdown Timer.
No inherited custom layouts.
No inherited Intro/Outro media assignments.
No inherited stage background or production settings.

A shared media library is permitted.

Automatic inheritance of another Studio’s media assignments is not.

The new Studio must open immediately after successful creation.

⸻

8. INVESTIGATE WORKSPACE DATA ISOLATION

Inspect the complete relationship between:

* Account identity.
* Workspace identity.
* Studio identity.
* Scene identity.
* Media assignments.
* Active Studio selection.
* Persisted Studio configuration.
* Browser-local state.
* Backend workspace records.

Determine whether any of these systems use an incorrect or shared persistence key.

Verify that Studio A cannot accidentally write Studio B’s configuration.

Verify that switching Studios does not temporarily render the previous Studio’s production state as though it belongs to the selected Studio.

Pay particular attention to hydration, fallback behavior, and asynchronous request ordering.

⸻

9. PROTECT CROSSROADS OF THE UNKNOWN

Crossroads of the Unknown is protected owner production data.

Do not:

* Delete the Studio.
* Reset its scenes.
* Remove its media.
* Change its production settings.
* Overwrite its configuration.
* Use it as a disposable test fixture.
* Restore a backup over it without authorization.

Do not assume Testing 123 can safely be deleted or reset.

Before any owner-account remediation, produce a read-only comparison of the affected Studio identities and saved configuration ownership, using only authorized access.

If owner-account access is unavailable, report that limitation.

Do not bypass authentication or obtain credentials through unsupported methods.

Any destructive or owner-data migration requires separate owner approval.

⸻

10. REQUIRED APPLICATION REPAIR

After identifying the root cause, repair the actual Studio Management system.

The repair must ensure:

Studio Creation

New Studios are independent.

Studio Switching

Selecting a Studio activates that Studio.

Automatic Saving

The current Studio’s configuration is saved safely before switching, with appropriate failure handling.

Workspace Loading

The selected Studio’s own configuration is loaded.

Scene Rendering

The Scenes panel reflects the selected Studio.

Media Rendering

Media assignments reflect the selected Studio.

Active Studio Persistence

Refreshing the application restores the correct selected Studio.

Existing Studio Preservation

Previously customized Studios retain their deliberate configurations.

Error Handling

Failed activation, saving, or loading must produce actionable feedback instead of silently leaving the interface in an inconsistent state.

Do not use hardcoded Studio names, artificial UI refreshes, or forced resets as substitutes for a proper repair.

⸻

11. REQUIRED REGRESSION TESTING

Implement or update automated tests covering the full workflow.

Test 1 — Create New Studio

Create a disposable Studio.

Verify unique ID and four clean default items.

Test 2 — Create Second Studio

Create another disposable Studio.

Verify independent identity and configuration.

Test 3 — Switch Studios

Switch Studio A → Studio B → Studio A.

Verify the actual active Studio ID and displayed workspace at every step.

Test 4 — Scene Isolation

Modify scenes in Studio A.

Verify Studio B remains unchanged.

Test 5 — Media Isolation

Assign disposable media to Studio A.

Verify Studio B does not inherit the assignments.

Test 6 — Refresh

Refresh the browser.

Verify the correct Studio and configuration return.

Test 7 — Unsaved Changes

Modify a disposable Studio and switch away.

Verify safe saving and restoration.

Test 8 — Failed Save

Simulate a failed save.

Verify that the application does not silently switch or overwrite unrelated data.

Test 9 — Rapid Switching

Switch repeatedly between disposable Studios.

Verify stale asynchronous responses cannot activate or render the wrong Studio.

Test 10 — Existing Studio Compatibility

Verify that the repair does not reset or alter existing saved Studio configurations.

Tests must assert actual persisted IDs and scene ownership, not just visible labels.

⸻

12. REQUIRED LIVE PRODUCTION VERIFICATION

Local tests alone are insufficient.

After a guarded release, verify the actual production application using the maintained isolated QA account.

Demonstrate:

1. Creation of an independent Studio.
2. Exactly four default Scenes items.
3. Successful switching to another Studio.
4. Successful switching back.
5. Independent scene configurations.
6. Independent media assignments.
7. Correct persistence after refresh.
8. Correct active Studio identity.
9. No inherited Crossroads production configuration.
10. No silent switching failures.

Capture durable evidence.

Do not use temporary screenshots that disappear when the agent session ends.

Do not modify the owner’s Crossroads Studio.

⸻

13. SOURCE-TO-LIVE DEPLOYMENT REQUIREMENTS

Follow the authoritative StudioFlow Source-to-Live Playbook.

Use the canonical source:

/Users/toddknipple/Documents/StudioFlow/web

Use the established website integration:

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

Production:

https://paranormalinitiative.com/studio/

Before deployment:

* Verify the authoritative source.
* Verify the integration build.
* Run the required regression suites.
* Verify the production safety gates.
* Establish the rollback checkpoint.
* Confirm no conflicting agent changes are being overwritten.

After deployment:

* Verify the actual authenticated production assets.
* Verify the production behavior.
* Record source and deployment identifiers.

Do not treat deployment as proof of functional success.

⸻

14. MANDATORY HISTORICAL DIRECTIVE ARCHIVING

Archive this directive in full in the existing:

docs/TPI-DEVELOPMENT/100-DIRECTIVES/

Update:

DIRECTIVE-INDEX.md

Preserve:

* The complete directive text.
* Original issue date and time.
* Directive identity.
* Related recovery directives.
* Relevant completion records.
* Investigation findings.
* Implementation and verification status.

Do not overwrite historical directives.

Follow the Permanent Directive Archiving Standard.

⸻

15. MANDATORY MARKDOWN SYNCHRONIZATION

Review and update all affected current-state documentation.

At minimum:

* Current Development Status.
* Development Agent Handoff.
* StudioFlow architecture.
* Workspace configuration and persistence.
* Studio Management requirements.
* Testing and Verification.
* Directive Index.
* Relevant completion records.
* Source-to-Live Playbook, if the verified workflow changes.

Do not replace verified findings with assumptions.

Distinguish:

IMPLEMENTED

LOCAL TESTED

DEPLOYED

LIVE VERIFIED

OWNER ACCEPTED

Only the owner can grant final acceptance.

⸻

16. REQUIRED COMPLETION REPORT

Provide a report with the following sections.

A. Exact Root Cause

Why did selecting Browser Only Crossroads leave Testing 123 displayed?

B. Creation Failure

Why did Testing 123 appear to inherit Crossroads configuration?

C. Workspace State

How are Studio IDs, configurations, scenes, and media assignments stored and activated?

D. Files Modified

Identify every application file changed.

E. Tests

Provide actual test results and evidence.

F. Production Verification

Demonstrate creation, switching, isolation, and persistence on the live website.

G. Data Safety

Confirm that Crossroads and other owner Studios were preserved.

H. Documentation

List all Markdown files updated and the archived directive.

I. Deployment

Provide source commit, integration commit, deployed Worker identifier, asset hashes, and rollback checkpoint.

J. Remaining Issues

List any unresolved defects or unverified behavior.

⸻

17. ACCEPTANCE CRITERIA

The recovery is not complete until:

* A new Studio opens with four default production items.
* The new Studio has an independent identity.
* Selecting another Studio activates it.
* The displayed Studio name matches the active Studio ID.
* Scenes and media reflect the correct Studio.
* Switching preserves each Studio’s configuration.
* Refresh restores the selected Studio.
* Crossroads remains unchanged.
* The live production website demonstrates the corrected behavior.

Automated test success does not override an observed production failure.

Previous completion claims do not constitute owner acceptance.

⸻

FINAL INSTRUCTION

FreeBuff, investigate the Studio Management system as one integrated subsystem.

Do not perform another isolated Scenes-panel patch.

Do not assume that identical application bundles guarantee correct runtime behavior.

Find the cause of the failed Studio switching, repair it, verify it, and demonstrate the corrected behavior in production.

The owner has already demonstrated that the previous recovery did not satisfy the requirements.

This assignment remains open until the actual Studio creation and switching workflows function correctly.

END OF DIRECTIVE
