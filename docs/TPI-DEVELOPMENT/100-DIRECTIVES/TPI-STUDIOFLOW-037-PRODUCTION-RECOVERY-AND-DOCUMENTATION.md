# TPI-STUDIOFLOW-037 — Production Recovery and Documentation Reconciliation

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-25 12:07.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-24-TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN.md](../300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN.md), [2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md](../300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md)
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
## TPI-STUDIOFLOW-037 — PRODUCTION RECOVERY DIRECTIVE

**Project:** StudioFlow  
**Priority:** CRITICAL  
**Classification:** Production investigation, defect correction, and documentation reconciliation  
**Status:** OWNER ACCEPTANCE FAILED  
**Scope:** Existing Directive 037 — no new feature development

### PRIMARY OBJECTIVE

Restore confidence in the StudioFlow development and deployment process.

The owner reports that previously declared fixes are not functioning on the actual production website.

The agent must establish the cause, correct verified defects, demonstrate the results, and synchronize the project's Markdown knowledge base.

**Do not declare success based on automated tests alone.**

---

## PHASE 1 — READ THE PROJECT DOCUMENTATION

Before modifying any code, read completely:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

### Documentation discovery

Inventory the applicable Markdown documentation, including:

- Development architecture.
- Current development status.
- Directive index.
- Directive 037 and its addenda.
- StudioFlow playback contract.
- StudioFlow workspace configuration.
- Testing and verification procedures.
- Deployment workflow.
- Agent handoff.
- Completion records.

Identify which documents establish the current implementation and which are historical.

**Do not assume a previous completion report is proof of correct behavior.**

Inspect the source code and deployment configuration to verify documented claims.

---

## PHASE 2 — VERIFY THE SOURCE-TO-PRODUCTION CHAIN

### Authoritative source

`/Users/toddknipple/Documents/StudioFlow/web`

### Website repository

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`

### Production application

`https://paranormalinitiative.com/studio/`

The last reported deployment was:

**Production Worker:** `d58d7e1e-5f86-4c87-93b3-110999d200a9`

**Source commit:** `8fdabf4`

**Application commit:** `b1c21a085be679eb156c1c83277119c861068921`

These identifiers are investigation references, not proof that the browser loaded the correct application.

### Required investigation

Trace the entire deployment chain:

1. Authoritative source files.
2. Build output.
3. Website integration.
4. Deployment configuration.
5. Cloudflare Worker.
6. Production HTML entry point.
7. JavaScript and CSS assets.
8. Browser-loaded application version.

Determine whether the current production website is actually serving the code containing Addendum E.

Inspect caching, asset references, deployment routes, and any stale build artifacts.

Do not assume a successful Worker deployment means the correct application bundle is live.

### Required evidence

Record:

- Source commit.
- Build identifier.
- Deployed Worker identifier.
- Actual production route.
- Loaded JavaScript asset identifiers.
- Evidence linking the deployed assets to the intended source commit.

If the build does not already expose a reliable identifier, implement a minimal, non-sensitive diagnostic mechanism that can establish which application version is loaded.

Do not introduce an unrelated application redesign.

---

## PHASE 3 — REPRODUCE THE OWNER'S FAILURE

The owner reports that three-dot menus in the Scenes panel do not respond.

### Required procedure

Start the local StudioFlow application using the documented development workflow.

Open the actual local application in Firefox.

Interact with the Scenes panel using real pointer events.

Then open the public production application.

Perform the same interactions.

### Required checks

Click the three-dot menu on:

- Intro Video.
- Background Music.
- Countdown Timer.
- Existing camera-layout scenes.
- Outro Video.

Verify that the menu visibly opens.

Verify that the appropriate actions are present.

Verify that clicking the menu does not activate playback.

### Important

A passing JavaScript assertion does not prove the menu visibly opened.

Inspect the actual rendered interface.

Investigate:

- Pointer-event interception.
- Event propagation.
- Drag handlers.
- CSS stacking.
- Overlay positioning.
- Menu clipping.
- Incorrect item identifiers.
- React state changes.
- Stale JavaScript bundles.

If the problem cannot be reproduced, report the exact browser environment, account state, Studio configuration, and limitations.

Do not falsely claim the owner's problem is resolved.

---

## PHASE 4 — VERIFY WHAT A SCENE ACTUALLY IS

StudioFlow must distinguish between two concepts.

### A. Production scenes

These are creator-configurable program layouts.

Examples:

- Solo camera.
- Two-person interview.
- Screen sharing.
- Custom production layout.

Each scene has a stable identifier and an editable display name.

### B. Production media items

These include:

- Intro Video.
- Outro Video.
- Background Music.
- Countdown Timer.
- Video Clips.

These are not camera-layout scenes.

They may appear in the same Scenes panel as production shortcuts, but their behavior and persistence requirements differ.

Do not confuse a media shortcut with an actual production scene.

Document the existing data model and any discovered inconsistencies.

---

## PHASE 5 — VERIFY THE REQUIRED DEFAULT ARRANGEMENT

New Studios must initialize with:

**Intro Video**

**Scene 1**

**Scene 2**

**Outro Video**

No automatically inserted Demo Scenes.

No automatically inserted Background Music shortcuts.

No automatically inserted Countdown Timer.

Additional items are creator-selected.

### Existing Studios

Preserve existing owner configurations.

Do not overwrite Crossroads of the Unknown.

Do not silently rename or remove existing scenes.

The owner must be able to edit and remove unwanted items manually.

---

## PHASE 6 — REPAIR SCENE MANAGEMENT

Every removable production item must have a working three-dot menu.

The menu must contain:

**Remove from Scenes**

Removing an item must:

1. Remove it from the panel.
2. Preserve underlying uploaded media.
3. Save the change to the correct Studio.
4. Remain removed after refresh.
5. Remain removed after switching Studios.
6. Avoid modifying unrelated scenes or assets.

### Rename Scene

Every production scene must support:

**Rename Scene**

The creator must be able to enter a custom name.

The editable field must support:

- Enter to save.
- Escape to cancel.
- Empty-name protection.
- Persistent saving.
- Stable scene identifiers.
- Proper text display within the existing button dimensions.

Do not use browser prompts if the existing StudioFlow modal is available and functional.

---

## PHASE 7 — VERIFY PLAYBACK ISOLATION

Test the reported Intro Video problem.

### Individual preview

Click Intro Video once.

Playback starts.

Click Intro Video again.

Playback stops.

**Background Music must not start.**

No other production item may automatically advance.

### Sequence rehearsal

Click Play Sequence.

Rehearsal begins.

Click Stop Sequence.

Rehearsal stops.

Pending transitions are canceled.

### Live production

Preserve existing automatic Intro/Outro and After Intro Background Music behavior.

Do not rebuild the playback engine.

Do not initiate a public livestream for testing.

---

## PHASE 8 — FIX ONLY VERIFIED DEFECTS

After reproducing the failures, identify their root causes.

Make the smallest safe corrections that resolve them.

Do not:

- Rebuild the Scenes panel.
- Replace working playback systems.
- Introduce new production features.
- Change unrelated UI.
- Modify owner recordings.
- Delete owner Studios.
- Delete production media.
- Perform destructive D1 or R2 operations.

Preserve working functionality from Directives 028–036.

---

## PHASE 9 — PROVE THE FIX WORKS

### Local verification

Demonstrate the corrected behavior in the local StudioFlow application.

### Production verification

Deploy through the documented guarded workflow.

Then open:

`https://paranormalinitiative.com/studio/`

Verify the deployed application version.

Repeat the same browser interactions.

### Required evidence

Provide screenshots or a short recording demonstrating:

1. A three-dot menu opening.
2. Remove from Scenes being available.
3. A scene being renamed.
4. The renamed scene after refresh.
5. A temporary item remaining removed after refresh.
6. Intro Video stopping without starting Background Music.
7. The loaded production build identifier.

Capture intermediate states, not just final test summaries.

Use disposable test Studios.

Do not modify the owner's existing production data.

If authenticated production verification is unavailable, state that explicitly and mark the corresponding verification incomplete.

---

## PHASE 10 — RECONCILE THE MARKDOWN KNOWLEDGE BASE

This phase is mandatory.

The project's Markdown documentation serves as the development knowledge base for future agents.

### Required procedure

1. Inventory all applicable `.md` files.
2. Review each file for relevance and accuracy.
3. Update every affected document.
4. Preserve historical completion records.
5. Correct outdated current-state claims.
6. Document the verified production architecture.
7. Document the actual Scenes data model.
8. Document the verified deployment workflow.
9. Update testing procedures to require visible UI verification.
10. Update current status and agent handoff.
11. Commit and push documentation changes.

Do not blindly rewrite unrelated historical documents.

### Required documentation audit

Provide a table identifying:

- Every applicable Markdown file reviewed.
- Whether it required changes.
- Changes made, where applicable.
- Any unresolved discrepancies.

**The next agent must be able to understand the verified system without reading this conversation.**

---

## PHASE 11 — REQUIRED COMPLETION REPORT

Provide:

### A. Deployment findings

What source code is actually running on the production website?

### B. Root cause

Why did the owner's three-dot menus fail despite passing tests?

### C. Corrective action

What was changed, and why?

### D. Local evidence

What interactions were performed in the local browser?

### E. Production evidence

What interactions were performed on the public website?

### F. Documentation reconciliation

Which Markdown files were reviewed and updated?

### G. Release information

Provide:

- Source commit.
- Application commit.
- Documentation commit.
- Production Worker identifier.
- Rollback identifier.
- Test results.
- Known limitations.

### H. Final status

Use one of these statuses:

**INVESTIGATION COMPLETE — DEFECT NOT YET RESOLVED**

**FIXED LOCALLY — PRODUCTION VERIFICATION PENDING**

**DEPLOYED — PRODUCTION VERIFICATION PENDING**

**DEPLOYED AND VISUALLY VERIFIED — OWNER ACCEPTANCE PENDING**

Do not use COMPLETE or OWNER ACCEPTED without explicit owner confirmation.

---

# FINAL DIRECTIVE

The purpose of this recovery operation is to restore a reliable relationship between:

**Source Code → Local Application → Production Deployment → Browser Behavior → Markdown Documentation**

Every stage must agree.

Do not create another Addendum F.

Do not add unrelated features.

Do not close Directive 037 until the owner's actual production-interface problems have been resolved.

**END OF TPI-STUDIOFLOW-037 PRODUCTION RECOVERY DIRECTIVE**
