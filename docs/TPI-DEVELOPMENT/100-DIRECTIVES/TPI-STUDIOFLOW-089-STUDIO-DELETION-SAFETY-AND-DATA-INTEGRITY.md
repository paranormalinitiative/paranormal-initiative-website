THE PARANORMAL INITIATIVE

STUDIOFLOW SUPPLEMENTAL DEVELOPMENT DIRECTIVE

STUDIO DELETION SAFETY AND DATA INTEGRITY

Assigned Agent: MiMo 2.6 Pro / FreeBuff
Priority: HIGH
Related Directive: Permanent Studio Deletion and Archive Management
Status: REQUESTED

Directive Number: Allocate the next available number from the authoritative directive register.

This directive supplements the Studio Deletion directive. It does not replace it.

1. PRIMARY REQUIREMENT

The owner wants to permanently delete approximately five unwanted test Studios.

StudioFlow must support permanent deletion without risking another Studio's recordings, media, configuration, or identity.

Do not delete any existing owner Studio automatically.

The owner will select and confirm each Studio to delete.

2. PRE-DELETION INVENTORY

Before deleting a Studio, the application must identify:

* Studio name and immutable ID.
* Storage location: server-backed, browser-local, or both.
* Associated livestreams.
* Associated recordings.
* Associated webinars.
* Studio-specific media.
* Scheduled productions.
* Existing recovery snapshots.
* Any data shared with other Studios.

The confirmation dialog must distinguish between data that will be deleted and data that will be retained.

If ownership cannot be established reliably, block destructive deletion of the ambiguous data.

3. TWO DISTINCT DELETE OPTIONS

Where supported safely, offer:

Delete Studio Only

Permanently remove the Studio identity and configuration while preserving its existing recordings and other production outputs in a clearly identified, accessible location.

Delete Studio and Its Contents

Permanently remove the Studio and its exclusively owned productions and media, after additional confirmation.

These operations must never be confused.

If the current architecture cannot safely preserve recordings after removing their parent Studio, do not implement Delete Studio Only until an explicit preservation model exists.

If exclusive media ownership cannot be proven, do not delete the media.

Do not introduce an orphaned-record problem merely to provide two buttons.

4. DELETION MUST NOT BE CONFUSED WITH ARCHIVING

Archive remains reversible.

Permanent deletion must not simply change the Studio's status to archived.

If the existing system uses soft deletion, clearly identify whether the action is recoverable or permanent.

The user interface must describe the actual behavior.

Never label a reversible operation as permanent deletion.

5. DELETION AND ACTIVE STUDIO HANDLING

If the owner deletes the currently active Studio:

1. Finish or safely stop any active production according to existing recording safeguards.
2. Block deletion while an active recording or livestream cannot be safely finalized.
3. Clear the deleted Studio's active selection.
4. Return to a safe homepage state.
5. Refresh the My Studios dropdown.
6. Preserve all remaining Studios.
7. Never automatically create a replacement Studio.

Deleting one Studio must not reset another.

6. BROWSER-LOCAL AND SERVER-BACKED RECORDS

MiMo must account for both storage systems.

A server-backed Studio must not reappear because an old browser-local entry remains.

A browser-local Studio must not reappear because a stale menu cache recreates it.

However, deletion must not indiscriminately clear all browser storage.

Remove only records whose identity is proven to belong to the selected Studio.

Preserve unrelated recovery snapshots.

7. CONCURRENCY AND FAILURE RECOVERY

Deletion must handle:

* Multiple open browser tabs.
* Stale Studio selections.
* Failed API requests.
* Interrupted operations.
* Browser refreshes.
* Network disconnections.
* Duplicate deletion requests.

A failed deletion must not leave the interface claiming success.

Use existing authorization and concurrency protections.

Where permanent deletion spans multiple storage systems, provide a verified recovery or reconciliation procedure for partial failures.

8. REQUIRED QA SCENARIOS

Use disposable QA Studios.

Test:

1. Cancel deletion.
2. Delete an empty Studio.
3. Delete a Studio with recordings.
4. Delete a Studio with media.
5. Delete a browser-local Studio.
6. Delete an archived Studio.
7. Attempt deletion during an active recording.
8. Attempt deletion from a stale browser tab.
9. Refresh after deletion.
10. Verify all unrelated Studios remain unchanged.
11. Verify no deleted Studio is silently recreated.
12. Verify the interface accurately reports failures.

Use synthetic recordings and media only.

Do not delete existing owner data during QA.

9. DOCUMENTATION AND RELEASE

Archive this supplemental directive verbatim.

Update the existing authoritative documentation with the actual implemented deletion semantics.

Preserve the established source-to-live deployment procedure.

Do not deploy an incomplete destructive workflow.

If permanent deletion cannot be made safe within the current architecture, report the limitation and request approval for the necessary changes.

10. COMPLETION REQUIREMENT

MiMo must report:

* Which deletion options were implemented.
* Which records each option affects.
* How recordings and media are protected.
* How browser-local records are handled.
* How partial failures are recovered.
* What was tested locally.
* What was verified in production.
* Which operations remain blocked or require owner approval.

Do not mark this work OWNER ACCEPTED until the owner verifies deletion through the live interface.

FINAL INSTRUCTION

Implement deletion as a controlled, identity-specific operation.

Protect every unrelated Studio and its productions.

The owner must be able to remove unwanted test Studios confidently without risking Crossroads of the Unknown or any other production environment.
