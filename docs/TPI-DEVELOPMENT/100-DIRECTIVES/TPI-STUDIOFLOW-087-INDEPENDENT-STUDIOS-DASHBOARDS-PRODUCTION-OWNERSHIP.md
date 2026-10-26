# TPI-STUDIOFLOW-087 — Independent Studios, Studio Dashboards, and Production Ownership

## TPI-STUDIOFLOW-087

Directive identity: TPI-STUDIOFLOW-087 (number allocated from the authoritative
directive register; 086 was the highest previously allocated StudioFlow
identifier).

Issue date and time: October 25, 2026, 22:16 EDT.

Source: owner directive received in full in the FreeBuff agent channel. The
directive text below is preserved verbatim.

Cross-references: TPI-MASTER-002 (My Studios historical specification),
TPI-DEV-037 (My Studios bridge), TPI-STUDIOFLOW-033 (workspace configuration
persistence), TPI-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001 (October 25 Studio
creation/switching recovery — the protected working baseline),
TPI-STUDIOFLOW-OWNER-VERIFICATION-001, and
`docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001.md`.

The following directive text is preserved verbatim.

---

THE PARANORMAL INITIATIVE

STUDIOFLOW DEVELOPMENT DIRECTIVE

INDEPENDENT STUDIOS, STUDIO DASHBOARDS, AND PRODUCTION OWNERSHIP

Assigned Agent: MiMo 2.6 Pro / FreeBuff
Priority: HIGH
Directive Type: Architecture Investigation and Targeted Implementation
Status: REQUESTED
Scope: StudioFlow Homepage, My Studios, Studio Dashboards, Production Ownership, and Studio Management

Directive Number: Allocate the next available number from the authoritative directive register. Do not reuse a historical directive identifier.

⸻

1. OWNER'S AUTHORITATIVE DESIGN DECISION

The owner has approved a Riverside-inspired organizational model for StudioFlow.

This directive supersedes the previous proposed homepage architecture directive.

The intended structure is:

THE PARANORMAL INITIATIVE
         STUDIOFLOW
             |
             v
        HOMEPAGE
             |
             v
        MY STUDIOS
             |
     +-------+-------+
     |               |
     v               v
 CROSSROADS      TESTING 123
     |               |
     v               v
 STUDIO DASHBOARD  STUDIO DASHBOARD
     |               |
     +-- Enter Studio
     |
     +-- Livestreams
     |
     +-- Recordings
     |
     +-- Webinars
     |
     +-- Media
     |
     +-- Studio Settings

Every Studio is a permanent, independent production environment.

Every Studio contains its own productions and configuration.

We are NOT implementing StreamYard's Reusable Studios feature.

We are NOT introducing reusable Studio templates.

We are NOT creating a new Studio every time the owner records or livestreams.

We are NOT introducing Riverside's additional Projects or Business Production hierarchy.

The organizational model is:

STUDIO → ITS PRODUCTIONS, MEDIA, SCENES, BRANDING, AND SETTINGS.

⸻

2. THE CURRENT WORKING SYSTEM MUST BE PRESERVED

StudioFlow recently underwent a successful emergency recovery.

The following functionality is now working and must remain protected:

* Independent Studio identities.
* My Studios dropdown.
* Direct Studio switching.
* Studio-specific scenes.
* Studio-specific configuration.
* Browser-local Studio recovery.
* Missing-snapshot handling.
* Corrupted-snapshot preservation.
* Save-integrity protection.
* Unsaved-change protection.
* Clean Studio creation.

The owner personally verified switching between Crossroads and Testing 123 and their separate scene configurations before the most recent deployment.

The latest agent-reported production baseline is:

Application commit: af7fbc0

Production Worker:

6bbdae3d-f424-4373-87ff-84030df50a49

Documentation commit: 8d988e1

Reported lifecycle verification: 29/29 passing locally and on authenticated production.

Verify the current baseline before changing anything.

Do not assume these identifiers remain current if subsequent development occurred.

Do not replace the existing Studio identity or switching system.

⸻

3. FIRST — INVESTIGATE THE HOMEPAGE DISCREPANCY

The owner reports that the StudioFlow homepage displays entries including:

* New Test
* Testing
* Test
* Testing 123
* TPI
* Acceptance Test A

However, Crossroads of the Unknown is missing from the homepage, despite being accessible through My Studios.

This must be investigated.

Determine whether the homepage currently displays:

* Studio records.
* Broadcast records.
* Recording sessions.
* Browser-local entries.
* Server-backed workspaces.
* A mixture of different record types.

For each displayed item, identify its actual record type, stable identifier, owner, storage location, and relationship to My Studios.

Determine why Crossroads is missing.

Do not assume that it needs to be recreated.

Do not reset or modify Crossroads to make it appear.

The homepage and My Studios must ultimately resolve the same authorized Studio identities.

⸻

4. MY STUDIOS — HOMEPAGE ORGANIZATION

The StudioFlow homepage must have a clear My Studios section.

Each Studio must appear as an individual card.

Example:

CROSSROADS OF THE UNKNOWN

* Open Dashboard
* Enter Studio
* Manage Productions
* Studio Settings
* More Actions

TESTING 123

* Open Dashboard
* Enter Studio
* Manage Productions
* Studio Settings
* More Actions

TPI LEARNING

* Open Dashboard
* Enter Studio
* Manage Productions
* Studio Settings
* More Actions

The Studio cards must represent actual permanent Studios, not individual recordings or livestreams.

The homepage must not confuse production titles with Studio names.

The existing homepage entry points must remain available:

* Create Livestream
* Record
* On-Air Webinar
* Teleprompter

Teleprompter functionality is outside this directive.

The homepage should retain StudioFlow's established visual identity.

Do not perform an unrelated redesign.

⸻

5. INDIVIDUAL STUDIO DASHBOARDS

Each Studio must have its own dashboard.

This dashboard provides access to the Studio's productions without requiring the owner to enter the recording interface immediately.

Example: Crossroads of the Unknown

CROSSROADS OF THE UNKNOWN
------------------------------------
[ ENTER STUDIO ]
[ CREATE LIVESTREAM ]
[ START RECORDING ]
[ CREATE WEBINAR ]
------------------------------------
MY PRODUCTIONS
Episode 1
Episode 2
Guest Interview
Halloween Livestream
------------------------------------
RECORDINGS
Episode 1 Recording
Episode 2 Recording
------------------------------------
STUDIO SETTINGS

The dashboard must display only the productions and configuration associated with Crossroads.

Example: Testing 123

TESTING 123
------------------------------------
[ ENTER STUDIO ]
[ CREATE LIVESTREAM ]
[ START RECORDING ]
[ CREATE WEBINAR ]
------------------------------------
MY PRODUCTIONS
Camera Test
Microphone Test
Test Livestream
------------------------------------
RECORDINGS
Camera Test Recording
------------------------------------
STUDIO SETTINGS

Testing 123 must not display Crossroads productions as its own.

Reuse existing production-management components wherever possible.

Do not introduce duplicate storage systems merely to support the dashboard.

⸻

6. STUDIO OWNERSHIP — NON-NEGOTIABLE

Every livestream, recording, and webinar must have a stable association with its owning Studio.

Required behavior

When the owner enters Crossroads and starts recording:

That recording belongs to Crossroads.

When the owner enters Testing 123 and starts recording:

That recording belongs to Testing 123.

Switching the active Studio must never reassign previously created productions.

Production ownership must not depend solely on the current dropdown selection or a matching Studio title.

Use stable Studio identifiers and existing account authorization rules.

Existing productions

Investigate how existing production records are stored.

Do not automatically move historical recordings between Studios.

If an existing production's Studio ownership cannot be established reliably, preserve it and report the ambiguity.

Do not fabricate relationships.

Browser-local Studios

Investigate how browser-local Studios relate to production ownership.

Preserve their existing recovery mechanisms.

Do not silently migrate browser-local Studios into Cloudflare D1.

If a persistent server-side relationship requires migration, prepare a non-destructive plan and obtain approval before executing it.

⸻

7. HOMEPAGE AND MY STUDIOS DROPDOWN

The homepage and Studio dropdown must operate on the same logical Studio collection.

Scenario A — Homepage to Studio Dashboard

1. Open StudioFlow Home.
2. Select Crossroads of the Unknown.
3. Open the Crossroads dashboard.
4. View Crossroads productions.
5. Select Enter Studio.
6. Open Crossroads with its saved configuration.

Scenario B — Switching Inside StudioFlow

1. Enter Crossroads.
2. Open My Studios.
3. Select Testing 123.
4. Save or protect Crossroads changes.
5. Activate Testing 123 immediately.
6. Display Testing 123's saved configuration.

Do not redirect to Home during a normal Studio switch.

This existing behavior must remain intact.

Scenario C — Exit to Home

1. Enter Testing 123.
2. Select Exit to Home.
3. Return to the StudioFlow homepage.
4. Show all authorized Studios.
5. Preserve Testing 123 as the last active Studio where appropriate.
6. Allow direct entry into Crossroads or Testing 123.

Scenario D — Refresh

Refreshing must not mix Studio identities, configurations, or production records.

The last active Studio should remain identifiable through the existing persistence system.

⸻

8. CREATING STUDIOS AND PRODUCTIONS

There must be a clear distinction between:

Create New Studio

and

Create New Production

Create New Studio

Creates a new independent Studio with:

* A unique permanent identity.
* Its own configuration.
* Its own scenes.
* Its own production collection.
* Its own media associations.
* No inherited production history.

The established default scenes remain:

1. Intro Video
2. Scene 1
3. Scene 2
4. Outro Video

Create New Production

Creates a livestream, recording, or webinar inside an existing Studio.

It must not automatically create another permanent Studio.

When creating a production from the global homepage, the owner must be able to select the Studio that will own it.

When creating a production from a Studio dashboard or inside that Studio, the current Studio should already be selected as the owner.

Do not silently assign a production to an unrelated Studio.

⸻

9. STUDIO MANAGEMENT

The owner needs practical management of individual Studios.

Implement safe capabilities where supported by the existing architecture.

Required

Rename Studio

Change its name without changing its identity or disconnecting productions.

Enter Studio

Open its existing production environment.

Open Dashboard

View that Studio's productions.

Archive Studio

Hide an inactive Studio without deleting its configuration or recordings.

Restore Archived Studio

Return an archived Studio to the active listing.

Deleting Studios

The owner also wants a deletion capability.

Investigate the existing deletion architecture.

Determine:

* Whether Studio deletion is already supported.
* Whether deleting a Studio affects recordings.
* Whether media is shared.
* Whether archived Studios can be recovered.
* Whether deletion requires a database migration.
* How confirmation and rollback would work.

Do not implement or execute irreversible cascading deletion without explicit owner approval.

Do not delete existing test Studios merely because their names suggest they are disposable.

They are owner data unless confirmed otherwise.

⸻

10. RIVERSIDE REFERENCE

Use Riverside's Studio organization as a conceptual reference.

Official website:

https://riverside.com/

Relevant concepts:

* Multiple independent Studios.
* Studio selection.
* Studio dashboards.
* Studio-specific recordings.
* Studio-specific production management.
* Organized content libraries.

Do not copy Riverside's proprietary interface or code.

Do not introduce unnecessary organizational layers.

Do not implement StreamYard Reusable Studios.

TPI StudioFlow must retain its own branding, navigation, and terminology.

⸻

11. PROTECTED DATA AND SYSTEMS

Do not modify or reset existing owner Studios.

Specifically protect:

Crossroads of the Unknown

* Existing scenes.
* Existing media.
* Existing configuration.
* Existing recordings.
* Existing Studio identity.

Testing 123

* Existing four default scenes.
* Existing configuration.
* Existing Studio identity.
* Existing production data.

Also preserve:

* Browser-local snapshots.
* Recovery records.
* Production media.
* Recording files.
* Broadcast destinations.
* Existing account permissions.
* Optimistic concurrency protections.
* Save and switching integrity checks.

Do not use owner Studios for destructive testing.

⸻

12. IMPLEMENTATION PHASES

PHASE 1 — READ-ONLY ARCHITECTURE INVESTIGATION

Before making application changes:

1. Inspect homepage implementation.
2. Inspect My Studios selector.
3. Inspect Studio identity storage.
4. Inspect existing production records.
5. Inspect recording and livestream ownership.
6. Identify Crossroads' homepage omission.
7. Inspect browser-local Studio handling.
8. Identify relevant database tables and APIs.
9. Determine the smallest safe implementation.
10. Identify any required migration.

Produce an architecture report before implementation.

Approval gate

Proceed with non-destructive changes that extend the existing architecture.

Stop and request approval before:

* Destructive database migrations.
* Bulk historical production reassignment.
* Irreversible deletion.
* Replacement of the working Studio identity system.
* Destructive reconciliation of browser-local and server records.

PHASE 2 — HOMEPAGE AND DASHBOARDS

Implement:

* My Studios homepage cards.
* Studio dashboards.
* Direct Studio entry.
* Studio-specific production lists.
* Consistent homepage and dropdown identities.
* Clear Studio versus production creation.

PHASE 3 — PRODUCTION OWNERSHIP

Verify and implement stable parent-Studio associations for new productions.

Preserve existing production data.

Do not invent historical ownership.

PHASE 4 — MANAGEMENT

Implement supported rename, archive, and restore operations.

Report permanent deletion separately if additional approval is required.

PHASE 5 — REGRESSION AND LIVE VERIFICATION

Verify all existing Studio-switching and recovery functionality remains intact.

⸻

13. REQUIRED ACCEPTANCE TESTS

Test 1 — Homepage

Crossroads and Testing 123 appear as separate Studio cards.

Test 2 — Dashboard

Crossroads opens its own dashboard.

Test 3 — Direct Entry

Enter Studio opens Crossroads with its saved configuration.

Test 4 — Switching

Switch Crossroads → Testing 123 → Crossroads.

Configurations remain independent.

Test 5 — Exit to Home

Exit Testing 123.

Return to Home.

Both Studios remain available.

Test 6 — Recording Ownership

Create a disposable recording in an isolated QA Studio.

Verify it belongs to that Studio.

Test 7 — Production Isolation

Verify the recording does not appear as belonging to a different QA Studio.

Test 8 — Refresh

Refresh the browser.

Verify Studio identity and production ownership persist.

Test 9 — Rename

Rename a disposable QA Studio.

Verify its productions remain attached to the same Studio ID.

Test 10 — Archive and Restore

Archive and restore a disposable QA Studio without losing data.

Test 11 — Clean Creation

Create a disposable Studio.

Verify four default scenes and no inherited media or productions.

Test 12 — Browser-Local Recovery

Verify browser-local Studio visibility and snapshot protection.

Test 13 — Existing Studio Preservation

Confirm Crossroads and Testing 123 retain their established configurations.

Test 14 — Regression Suites

Run the maintained Studio lifecycle suite and relevant release checks.

The previous agent-reported lifecycle baseline was 29/29.

Do not remove existing checks to obtain a passing result.

Preserve documentation of unrelated known failing or flaky suites.

⸻

14. SOURCE-TO-LIVE DEPLOYMENT

Follow the authoritative development playbook.

Canonical source

/Users/toddknipple/Documents/StudioFlow/web

Website repository

/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

Production

https://paranormalinitiative.com/studio/

Governing document

docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md

Requirements:

1. Confirm source and deployment baseline.
2. Implement changes in the correct source.
3. Verify locally.
4. Run maintained regression suites.
5. Use the established staging process.
6. Run guarded release preflight.
7. Preserve rollback information.
8. Deploy through the maintained workflow.
9. Verify authenticated production behavior.
10. Report exact commit and Worker deployment identifiers.

Do not bypass production safety controls.

⸻

15. DOCUMENTATION AND DIRECTIVE ARCHIVE

Archive this directive verbatim before implementation.

Use the existing directive register and archive structure.

Do not create a competing master directive document.

After implementation, synchronize the applicable authoritative Markdown files.

Review:

* AGENTS.md
* docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md
* docs/TPI-DEVELOPMENT/009-TESTING-AND-VERIFICATION.md
* docs/TPI-DEVELOPMENT/TPI-CURRENT-DEVELOPMENT-STATUS.md
* docs/TPI-DEVELOPMENT/TPI-DEVELOPMENT-AGENT-HANDOFF.md
* docs/TPI-DEVELOPMENT/100-DIRECTIVES/DIRECTIVE-INDEX.md
* Existing StudioFlow architecture documentation.
* Existing StudioFlow persistence documentation.
* Relevant completion records.

Preserve historical directives and their exact wording.

Document the final Studio-to-production ownership model.

Preserve the established six-directive chat rotation and handoff requirements.

Distinguish agent verification from owner acceptance.

⸻

16. REQUIRED COMPLETION REPORT

Return:

A. Root cause of homepage and dropdown inconsistency.

B. Existing Studio and production data architecture.

C. Final Studio organization and ownership model.

D. Explanation and correction of Crossroads' missing homepage entry.

E. Homepage and dashboard implementation.

F. Recording, livestream, and webinar ownership.

G. Studio management functionality implemented.

H. Features deferred for owner approval.

I. Files and database changes.

J. Local and authenticated production verification.

K. Commits, Worker deployment, and rollback checkpoint.

L. Markdown documentation synchronization.

M. Remaining known issues.

⸻

17. OWNER ACCEPTANCE

The implementation is ready for owner acceptance when the owner can:

1. Open StudioFlow Home.
2. See Crossroads and Testing 123 as separate Studios.
3. Select Crossroads.
4. View its Studio dashboard.
5. Enter Crossroads.
6. See its existing scenes.
7. Return to Home.
8. Select Testing 123.
9. View its separate dashboard.
10. Enter Testing 123.
11. See its four default scenes.
12. Create a recording belonging to Testing 123.
13. Return to Crossroads.
14. Confirm Crossroads has not inherited Testing 123's recording or configuration.

The agent may report LIVE VERIFIED after authenticated production tests.

Only the owner can declare OWNER ACCEPTED.

⸻

FINAL INSTRUCTION TO MIMO

We are completing StudioFlow's existing independent Studio architecture.

Do not rebuild the application.

Do not introduce Reusable Studios.

Do not introduce unnecessary Projects or organizational layers.

The owner already has functioning independent Studios and direct Studio switching.

Finish connecting those Studios to the homepage.

Give each Studio its own dashboard and productions.

Make every recording, livestream, and webinar belong to its correct Studio.

Preserve Crossroads, Testing 123, and all existing owner data.

Maintain the working Studio-switching and recovery protections.

Use the smallest safe implementation that achieves the approved workflow.

One Studio. Its own productions. Its own settings. Its own identity.

Another Studio. Completely separate.

That is the required StudioFlow architecture.

END OF DIRECTIVE
