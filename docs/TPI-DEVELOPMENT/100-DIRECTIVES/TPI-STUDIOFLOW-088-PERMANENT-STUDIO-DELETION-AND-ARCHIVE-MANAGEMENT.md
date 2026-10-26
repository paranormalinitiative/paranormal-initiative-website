# TPI-STUDIOFLOW-088 — PERMANENT STUDIO DELETION AND ARCHIVE MANAGEMENT

Archived verbatim per the Permanent Directive Archiving Standard. Original
issue: 2026-10-26, via owner directive to FreeBuff (assigned agent: MiMo 2.6
Pro / FreeBuff). Register: `DIRECTIVE-INDEX.md`. Related directives:
TPI-STUDIOFLOW-087 (Independent Studios, Studio Dashboards, and Production
Ownership — implemented 2026-10-26, owner acceptance pending).

---

THE PARANORMAL INITIATIVE

STUDIOFLOW DEVELOPMENT DIRECTIVE

PERMANENT STUDIO DELETION AND ARCHIVE MANAGEMENT

Assigned Agent: MiMo 2.6 Pro / FreeBuff
Priority: HIGH
Status: REQUESTED
Scope: Studio Management Only

Directive ID: Allocate the next available identifier from the authoritative directive register.

1. Objective

Complete StudioFlow’s Studio Management system by supporting both:

1. Archive Studio — Preserve a Studio and its data while removing it from the active Studio list.
2. Delete Studio — Permanently delete a Studio after explicit confirmation.

The owner currently has approximately five test Studios they wish to remove.

Do not automatically delete those Studios during implementation. The owner will choose which Studios to delete using the finished interface.

2. Preserve Existing Functionality

The previous Studio architecture directive, TPI-STUDIOFLOW-087, has been implemented and reportedly verified on production.

Current reported production Worker:

b4605f5f-f33e-4f1d-8082-b12fc8bf5bdf

Preserve:

* Independent Studio identities.
* Homepage Studio cards.
* Studio dashboards.
* Studio-specific productions.
* My Studios switching.
* Studio configurations and scenes.
* Existing Archive and Restore functionality.
* Browser-local recovery.
* Recording and livestream functionality.

Do not redesign the homepage or replace the existing Studio system.

3. Studio Actions Menu

Every Studio card should provide:

More Actions (⋯)

Options:

* Rename Studio
* Archive Studio
* Delete Studio

Archived Studios should retain their existing Restore action.

Use the established StudioFlow design system.

4. Delete Confirmation

Selecting Delete Studio must open a confirmation dialog.

Display:

* Exact Studio name.
* Number of associated productions.
* Number of associated recordings, where available.
* Whether deletion affects stored media.
* A clear warning that deletion is permanent.

Require the owner to confirm the specific Studio being deleted.

Prefer requiring the Studio name to be typed before enabling permanent deletion.

The action must not execute when the user simply opens the menu.

5. Deletion Semantics and Data Safety

Before implementation, inspect the existing Studio database schema, storage relationships, browser-local records, and API deletion endpoints.

Determine exactly what constitutes Studio-owned data.

Never cascade-delete unrelated or shared assets.

Deletion must:

1. Identify the Studio by its immutable ID.
2. Verify ownership and authorization.
3. Check associated productions and recordings.
4. Determine which assets are exclusive to that Studio.
5. Preserve data belonging to other Studios.
6. Prevent stale browser-local snapshots from recreating the deleted Studio.
7. Remove the deleted Studio from homepage and dropdown listings.
8. Handle deletion of the currently active Studio safely.
9. Return a clear success or failure message.
10. Keep remaining Studios operational.

If permanent deletion requires destructive schema changes, bulk media deletion, or ambiguous ownership decisions, stop and request owner approval before proceeding.

Do not treat an existing soft-delete endpoint as permanent deletion without verifying its actual behavior.

6. Browser-Local Studios

Some Studios may exist only in browser-local storage.

Determine how these Studios can be deleted safely.

Deleting a browser-local Studio should remove its active listing and associated local configuration without affecting other Studios.

Preserve unrelated recovery snapshots.

Do not silently convert browser-local Studios into server-backed records.

7. Archived Studios

Archive must remain distinct from Delete.

Archived Studios should:

* Be excluded from the normal active Studio listing.
* Remain available through an Archived Studios view.
* Retain their configuration and productions.
* Support Restore.
* Support permanent deletion with confirmation.

8. Testing

Use disposable QA Studios only.

Verify:

1. Delete confirmation opens without deleting anything.
2. Cancel leaves the Studio untouched.
3. Deleting a QA Studio removes it from Home.
4. Deleted Studio disappears from My Studios.
5. Other Studios remain unchanged.
6. Deleted Studio does not reappear after refresh.
7. Deleting the active Studio selects a safe destination.
8. Browser-local deletion works without damaging other snapshots.
9. Archive and Restore still work.
10. Existing Studio lifecycle and production ownership tests remain passing.

Do not delete Crossroads, Testing 123, or any existing owner Studio during testing.

9. Deployment

Follow the authoritative source-to-live playbook.

Use the maintained release pipeline, regression checks, and rollback protections.

Verify the result on authenticated production using disposable QA Studios.

Do not bypass release safeguards.

10. Documentation

Archive this directive verbatim.

Update the relevant authoritative Markdown documentation, including:

* Current development status.
* Agent handoff.
* Studio architecture.
* Studio management behavior.
* Testing and verification.
* Directive index.
* Source-to-live playbook where applicable.

Distinguish agent verification from owner acceptance.

11. Completion Report

Report:

* Existing deletion behavior discovered.
* Final Archive versus Delete semantics.
* Database and storage changes.
* Browser-local deletion behavior.
* Confirmation safeguards.
* Regression results.
* Production verification.
* Deployment and rollback identifiers.
* Remaining risks or limitations.

FINAL INSTRUCTION

Complete Studio Management without rebuilding StudioFlow.

The owner must be able to keep Studios, archive Studios, restore Studios, and permanently delete unwanted Studios.

Archive means preserve. Delete means remove permanently.

Implement both safely while protecting every other Studio and its productions.

END OF DIRECTIVE
