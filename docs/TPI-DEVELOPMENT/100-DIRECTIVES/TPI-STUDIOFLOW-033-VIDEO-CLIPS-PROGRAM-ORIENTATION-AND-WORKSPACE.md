# TPI-STUDIOFLOW-033 — VIDEO CLIPS, PROGRAM ORIENTATION, AND WORKSPACE CONFIGURATION PERSISTENCE REPAIR

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-24 12:51.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-24-TPI-STUDIOFLOW-033-WORKSPACE-CONFIGURATION-PERSISTENCE.md](../300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-033-WORKSPACE-CONFIGURATION-PERSISTENCE.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-033
## VIDEO CLIPS, PROGRAM ORIENTATION, AND WORKSPACE CONFIGURATION PERSISTENCE REPAIR

**Project:** The Paranormal Initiative — StudioFlow  
**Assigned Development Agent:** GPT-5.6 Luna  
**Priority:** HIGH — Data Integrity and Workspace Reliability  
**Directive Type:** Root Cause Verification, Persistence Repair, Configuration Round-Trip Audit  
**Execution Order:** Following the completed TPI-STUDIOFLOW-034  
**Documentation Updates:** MANDATORY  
**Deployment:** Established Guarded Source-to-Live Workflow

---

# 1. MANDATORY GOVERNING DOCUMENTS

**CRITICAL — READ BEFORE ANY INVESTIGATION OR MODIFICATION**

Luna must read and follow both governing documents in their entirety.

### MASTER AGENT INSTRUCTIONS

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

### STUDIOFLOW SOURCE-TO-LIVE WORKFLOW

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

These documents are authoritative.

Their requirements take precedence over assumptions made during implementation.

If either document is unavailable, stop and report the issue.

### REQUIRED HISTORICAL REVIEW

Review the relevant implementation history, including:

- TPI-STUDIOFLOW-027.
- TPI-STUDIOFLOW-028 and Addendum A.
- TPI-STUDIOFLOW-029.
- TPI-STUDIOFLOW-030.
- TPI-STUDIOFLOW-031.
- TPI-STUDIOFLOW-032.
- TPI-STUDIOFLOW-034.
- StudioFlow Playback Contract.
- StudioFlow development status.
- StudioFlow directive index.
- StudioFlow agent handoff.
- Relevant persistence and asset management documentation.
- Relevant Git history.

Pay particular attention to the configuration normalization defects discovered during Directive 031 and the observer-loop corrections completed under Directive 034.

**Preserve all approved functionality and existing architectural protections.**

---

# 2. BACKGROUND

During TPI-STUDIOFLOW-031, FreeBuff identified a pre-existing persistence gap in StudioFlow's API workspace configuration normalizer.

The investigation found that certain configuration fields were not included in the server-side normalization process.

Three Background Music fields were repaired under Directive 031:

- `backgroundMusicSlots`
- `backgroundMusicLoop`
- `sceneMusicAssignments`

However, two additional fields were identified as potentially affected:

- `videoClipSlots`
- `programOrientation`

These were intentionally left for a future directive.

This directive addresses those findings.

### IMPORTANT

The original investigation is evidence, not a substitute for verifying the current implementation.

Luna must inspect the current production-aligned source and independently confirm whether these gaps still exist.

---

# 3. PRIMARY OBJECTIVES

This directive has three objectives.

### OBJECTIVE A — VIDEO CLIPS PERSISTENCE

Ensure Video Clips configuration is correctly saved, restored, and isolated by studio.

### OBJECTIVE B — PROGRAM ORIENTATION PERSISTENCE

Ensure each studio retains its selected program orientation across saves, refreshes, and studio switching.

### OBJECTIVE C — COMPLETE CONFIGURATION ROUND-TRIP AUDIT

Audit the workspace configuration serialization and normalization process to identify other legitimate configuration fields that may be silently discarded.

**The objective is to preserve valid studio configuration without introducing unrelated architectural changes.**

---

# 4. INVESTIGATE THE COMPLETE WORKSPACE PERSISTENCE PATH

Before modifying code, Luna must trace the full persistence lifecycle.

Investigate:

1. User changes a studio setting.
2. Client state is updated.
3. Workspace configuration is serialized.
4. Configuration is submitted to the API.
5. Server-side normalization processes the configuration.
6. The configuration is persisted.
7. The API returns the saved configuration.
8. The client hydrates the saved configuration.
9. StudioFlow renders the restored state.
10. The configuration survives refresh and studio switching.

Identify the authoritative implementation at each stage.

### REQUIRED INVESTIGATION AREAS

- Workspace configuration schema.
- API normalization.
- Client serialization.
- Workspace save requests.
- Workspace load requests.
- Hydration.
- Local storage.
- Server persistence.
- Asset references.
- Studio switching.
- Stale-response protections.
- Configuration defaults.

Do not assume that localStorage persistence proves server persistence.

**Verify actual server-side round trips.**

---

# 5. VIDEO CLIPS PERSISTENCE

**PRIORITY: HIGH**

Investigate the `videoClipSlots` configuration field.

### REQUIRED BEHAVIOR

Video Clips assignments must:

1. Save automatically using the existing workspace system.
2. Preserve the correct video asset references.
3. Preserve the correct pad assignments.
4. Preserve the correct slot arrangement where supported.
5. Survive browser refresh.
6. Survive leaving and reopening a studio.
7. Survive switching between different studios.
8. Remain independent for each studio.
9. Restore without duplicating video assets.
10. Restore without moving videos into unrelated media categories.

### STABLE ASSET REFERENCES

Preserve the existing asset identity system.

Do not replace stable asset identifiers with slot-position references.

Do not alter existing video asset records unnecessarily.

Do not introduce positional media replacement logic.

### REQUIRED TEST

Create two disposable studios.

**Studio A:**

Assign at least two distinct test videos to different Video Clips slots.

**Studio B:**

Assign a different test video or a different arrangement.

Then:

1. Save Studio A.
2. Switch to Studio B.
3. Save Studio B.
4. Switch back to Studio A.
5. Verify Studio A's assignments.
6. Refresh the browser.
7. Verify Studio A again.
8. Switch to Studio B.
9. Verify Studio B's assignments.
10. Inspect the actual server-persisted configuration.

The saved server data must match the intended studio configuration.

---

# 6. PROGRAM ORIENTATION PERSISTENCE

**PRIORITY: HIGH**

Investigate the `programOrientation` configuration field.

Determine the authoritative supported orientation values and how they are represented internally.

Do not invent new orientation values.

### REQUIRED BEHAVIOR

The selected program orientation must:

1. Save correctly.
2. Survive browser refresh.
3. Survive studio switching.
4. Restore when reopening a studio.
5. Remain independent for each studio.
6. Remain synchronized with the existing program output.
7. Preserve the existing preview behavior.
8. Preserve the existing recording behavior.
9. Preserve the existing livestream behavior.

### REQUIRED TEST

Create two disposable studios.

Configure each studio with a different supported orientation.

Verify:

- Studio A retains its selected orientation.
- Studio B retains its selected orientation.
- Switching between studios restores the appropriate setting.
- Refreshing restores the correct setting.
- The API preserves the orientation value.
- No unexpected orientation changes occur during hydration.

### IMPORTANT

Do not redesign the orientation controls.

Do not introduce new output formats.

Do not modify recording or livestream encoding unless an actual defect requires a separately justified change.

This directive concerns persistence of existing orientation settings.

---

# 7. COMPLETE CONFIGURATION ROUND-TRIP AUDIT

**PRIORITY: CRITICAL**

The Background Music persistence problem revealed a broader architectural risk.

The API normalizer may silently discard legitimate configuration fields that are not included in its allow-list.

Luna must audit this behavior.

### REQUIRED INVENTORY

Identify all configuration fields currently written by StudioFlow.

For each field, determine:

1. Where it originates.
2. Which component owns it.
3. Whether it belongs in workspace configuration.
4. Whether it is serialized.
5. Whether the API accepts it.
6. Whether normalization preserves it.
7. Whether the server stores it.
8. Whether the client hydrates it.
9. Whether it survives a complete round trip.
10. Whether it is studio-specific or global.

### REQUIRED OUTPUT

Produce a configuration inventory table.

Example:

| Configuration Field | Client Writes | API Preserves | Server Stores | Hydrates | Result |
|---|---|---|---|---|---|
| `videoClipSlots` | Verify | Verify | Verify | Verify | Pass/Fail |
| `programOrientation` | Verify | Verify | Verify | Verify | Pass/Fail |
| `backgroundMusicSlots` | Verify | Verify | Verify | Verify | Pass/Fail |
| `sceneMusicAssignments` | Verify | Verify | Verify | Verify | Pass/Fail |

Include all other legitimate configuration fields discovered.

### SCOPE CONTROL

Do not blindly add every client-side key to the server schema.

Some fields may be temporary, sensitive, global, or intentionally excluded.

Classify each field before making changes.

If additional confirmed persistence gaps are found, repair them only when they are clearly within the same configuration-normalization mechanism and can be safely covered by tests.

Document larger or unrelated defects for a future directive.

---

# 8. PRESERVE WORKSPACE DATA INTEGRITY

**NON-NEGOTIABLE**

Previous directives corrected several serious persistence problems.

These protections must remain intact.

### PRESERVE DIRECTIVE 030

Do not allow stale workspace responses to overwrite newer local changes.

### PRESERVE DIRECTIVE 031

Do not reintroduce positional asset replacement.

Media replacements must continue to resolve through stable asset identifiers.

Preserve the corrected Background Music fields:

- `backgroundMusicSlots`
- `backgroundMusicLoop`
- `sceneMusicAssignments`

### PRESERVE DIRECTIVE 034

Do not reintroduce redundant rendering or self-sustaining MutationObserver cycles.

### ADDITIONAL REQUIREMENTS

- Do not duplicate assets during hydration.
- Do not mix Video Clips with Sound Effects or Background Music.
- Do not overwrite one studio's configuration with another's.
- Do not discard valid settings during normalization.
- Do not allow stale API responses to revert recent changes.
- Do not create unnecessary repeated save requests.

---

# 9. API NORMALIZER REPAIR

Once the root cause is confirmed, implement the smallest safe correction.

Inspect the authoritative workspace normalization function.

The repair should preserve supported configuration fields while maintaining the existing validation and security boundaries.

### REQUIRED

- Preserve valid `videoClipSlots` data.
- Preserve valid `programOrientation` values.
- Preserve existing Background Music configuration fields.
- Preserve supported asset metadata.
- Preserve stable asset references.
- Preserve legitimate defaults.
- Preserve backward compatibility with existing studios.
- Preserve API validation.

### DO NOT

- Replace the entire configuration schema unnecessarily.
- Accept arbitrary unvalidated configuration data.
- Remove server-side validation.
- Rewrite media storage.
- Change D1 schemas without demonstrated necessity.
- Modify R2 assets.
- Migrate production records without explicit justification and authorization.

**The preferred repair is a focused correction to the established normalization and hydration contract.**

---

# 10. BACKWARD COMPATIBILITY

Existing studios may already contain configurations saved before this repair.

Luna must account for that possibility.

### VERIFY

1. Existing studios continue loading correctly.
2. Missing configuration fields use established defaults.
3. Valid existing configuration remains intact.
4. New fields do not corrupt older records.
5. The repair does not invent lost assignments.
6. Existing media references remain unchanged.
7. No unnecessary data migration occurs.

### IMPORTANT

If earlier saves discarded configuration values, those values may not be recoverable from server storage.

Do not claim that previously lost data has been restored unless an actual recoverable source exists.

Document this limitation clearly.

---

# 11. REGRESSION TESTING

Run all applicable maintained regression suites.

At minimum, verify the existing functionality covered by:

- TPI-STUDIOFLOW-020.
- TPI-STUDIOFLOW-021.
- TPI-STUDIOFLOW-027.
- TPI-STUDIOFLOW-028.
- TPI-STUDIOFLOW-030.
- TPI-STUDIOFLOW-031.
- TPI-STUDIOFLOW-032.
- TPI-STUDIOFLOW-034.

### REQUIRED FUNCTIONAL TESTS

**Video Clips**

- Upload.
- Assignment.
- Playback.
- Slot persistence.
- Refresh.
- Studio switching.

**Program Orientation**

- Selection.
- Save.
- Refresh.
- Studio switching.
- Preview consistency.

**Background Music**

- Playback.
- Reordering.
- Per-studio persistence.
- After Intro assignment.

**Sound Effects**

- Playback.
- Reordering.
- Per-studio persistence.

**Intro/Outro**

- Playback.
- Manual stopping.
- Natural completion.
- After Intro music transition.

**Performance**

- Mutation storm regression remains green.
- No new idle rendering loop.
- No excessive workspace saves.

---

# 12. NEW CONFIGURATION ROUND-TRIP REGRESSION TEST

Create maintained automated regression coverage for the workspace configuration contract.

### REQUIRED TEST DESIGN

1. Create a disposable workspace.
2. Populate representative supported configuration fields.
3. Save through the real API.
4. Read the configuration back through the real API.
5. Compare the persisted values against the intended values.
6. Verify valid fields are preserved.
7. Verify invalid values are handled according to the existing schema.
8. Verify omitted fields follow established default behavior.
9. Verify no unrelated fields are silently discarded.
10. Verify studio isolation.
11. Verify stale-save protections.
12. Clean up disposable test data.

### IMPORTANT

The test must exercise the actual server normalization path.

A localStorage-only test is insufficient.

### REQUIRED REGRESSION PROTECTION

The maintained test should fail if a future change accidentally removes a supported configuration field from the normalizer.

Integrate it into the appropriate existing test workflow.

---

# 13. REAL BROWSER VERIFICATION

Luna must verify the repair through actual browser interaction.

### REQUIRED

1. Open StudioFlow.
2. Create or open a disposable test studio.
3. Assign Video Clips.
4. Change program orientation.
5. Save the studio.
6. Refresh.
7. Verify both settings.
8. Switch to another studio.
9. Configure different values.
10. Switch back.
11. Verify original values.
12. Repeat in the opposite direction.
13. Confirm no cross-studio contamination.
14. Verify the server-persisted configuration.
15. Confirm normal playback and navigation remain functional.

Do not rely exclusively on API tests.

---

# 14. PROTECT ALL EXISTING STUDIOFLOW FUNCTIONALITY

This directive must not alter approved functionality outside its intended scope.

### PRESERVE

- My Studios.
- Automatic studio switching.
- Studio restoration.
- My Scenes.
- Intro Video.
- Outro Video.
- After Intro Background Music.
- Video Clips playback.
- Sound Effects.
- Background Music.
- Drag-and-drop reordering.
- Context menus.
- Waveform and microphone icons.
- Recording.
- Livestreaming.
- Guest connections.
- Program monitoring.
- Audio routing.
- Existing media assignments.
- Existing asset storage.

### SPECIAL PROTECTION

The approved StudioFlow interface must remain visually unchanged.

No redesign is authorized.

---

# 15. PRODUCTION AND TEST DATA SAFETY

Use disposable test studios and controlled test assets.

Do not:

- Modify owner-created studios.
- Delete production user data.
- Modify Crossroads of the Unknown assets.
- Initiate an actual livestream.
- Initiate an actual recording without authorization.
- Change production D1 records manually.
- Modify production R2 objects.
- Run unapproved migrations.
- Access the owner's browser profile.

Follow the governing workflow's requirements for test accounts and cleanup.

---

# 16. MANDATORY MARKDOWN DOCUMENTATION

**CRITICAL — REQUIRED FOR COMPLETION**

All relevant Markdown documentation must be reviewed and updated.

### REQUIRED REVIEW

1. StudioFlow master directive index.
2. StudioFlow development status.
3. StudioFlow agent handoff.
4. StudioFlow development README.
5. StudioFlow Source-to-Live Workflow.
6. StudioFlow Playback Contract.
7. Workspace persistence documentation.
8. API configuration documentation.
9. Video Clips documentation.
10. Program orientation documentation.
11. Regression testing documentation.
12. Production release records.
13. New TPI-STUDIOFLOW-033 completion record.

### COMPLETION RECORD MUST INCLUDE

**WHO:** GPT-5.6 Luna.

**WHAT:** The confirmed persistence defects and repairs.

**WHERE:** The exact files, configuration fields, API functions, and hydration paths involved.

**WHEN:** Investigation, implementation, testing, and deployment dates.

**WHY:** The configuration fields were being discarded.

**HOW:** The corrected round-trip mechanism preserves supported fields.

### HISTORICAL PRESERVATION

Do not rewrite historical completion records.

Do not remove the original Directive 031 findings.

Preserve Directive 034's mutation repair documentation.

Add dated resolution references where appropriate.

### VALIDATION

Verify:

- Markdown formatting.
- Newly authored internal links.
- Directive index entries.
- Configuration inventory documentation.
- Current development status.
- Current production baseline.
- Updated agent handoff.
- Regression test documentation.

**The directive is not complete until the Markdown documentation is synchronized.**

---

# 17. GIT AND GUARDED DEPLOYMENT

Follow the authoritative Source-to-Live Workflow.

### REQUIRED SEQUENCE

1. Verify the correct repository and branch.
2. Record the starting commit.
3. Record the current production Worker.
4. Review the relevant history.
5. Reproduce the persistence failures.
6. Trace the complete configuration lifecycle.
7. Inventory supported configuration fields.
8. Implement the smallest justified repair.
9. Review the complete diff.
10. Run syntax and static checks.
11. Run the configuration round-trip regression.
12. Run browser interaction tests.
13. Run the complete required regression battery.
14. Verify Directive 034's mutation regression remains green.
15. Commit and push verified changes.
16. Complete guarded release preflight.
17. Deploy according to the established workflow.
18. Verify production using approved non-destructive methods.
19. Record the production Worker version.
20. Preserve rollback information.
21. Update all relevant Markdown documentation.
22. Commit and push documentation changes.
23. Confirm final repository parity.

Do not bypass required release gates.

Do not deploy failing changes.

---

# 18. REQUIRED COMPLETION REPORT

Luna must provide a detailed completion report.

### A. INVESTIGATION

- Governing documents reviewed.
- Historical records reviewed.
- Starting Git state.
- Starting production Worker.
- Confirmed persistence defects.
- Exact root causes.
- Full configuration inventory.

### B. IMPLEMENTATION

- Files modified.
- Functions modified.
- Fields added or corrected.
- Validation behavior.
- Backward compatibility.
- Data integrity protections.

### C. CONFIGURATION ROUND-TRIP RESULTS

Provide a table showing:

| Field | Before | After | Verified |
|---|---|---|---|
| `videoClipSlots` | Measured | Measured | Yes/No |
| `programOrientation` | Measured | Measured | Yes/No |
| `backgroundMusicSlots` | Measured | Measured | Yes/No |
| `sceneMusicAssignments` | Measured | Measured | Yes/No |
| Other supported fields | Measured | Measured | Yes/No |

Include the actual server-side verification results.

### D. REGRESSION TESTING

Report:

- Configuration round-trip tests.
- Video Clips tests.
- Program orientation tests.
- Studio switching tests.
- Sound Effects tests.
- Background Music tests.
- Intro/Outro tests.
- After Intro Background Music tests.
- Mutation storm regression.
- Production acceptance tests.

### E. DOCUMENTATION

List every Markdown file updated.

Identify the new Directive 033 completion record.

Confirm historical records remain intact.

### F. DEPLOYMENT

Provide:

- Application commit.
- Documentation commit.
- Production deployment status.
- Production Worker version.
- Rollback reference.
- Remaining limitations.

---

# 19. FINAL ACCEPTANCE CRITERIA

TPI-STUDIOFLOW-033 is complete only when:

1. The current persistence gaps are independently confirmed.
2. Video Clips assignments survive server-side saves.
3. Video Clips assignments survive refresh.
4. Video Clips assignments survive studio switching.
5. Program orientation survives server-side saves.
6. Program orientation survives refresh.
7. Program orientation survives studio switching.
8. Studio configurations remain isolated.
9. Stable media identifiers remain intact.
10. Existing Background Music persistence remains intact.
11. Existing stale-save protections remain intact.
12. Directive 034's mutation repair remains intact.
13. A complete supported-configuration inventory is documented.
14. A maintained server round-trip regression test exists.
15. All applicable browser and API regression tests pass.
16. The guarded production release process is completed successfully, if deployment proceeds.
17. All relevant Markdown documentation is updated.
18. The completion report provides verifiable evidence.

---

# 20. FINAL INSTRUCTION TO LUNA

**StudioFlow must reliably remember each creator's studio configuration.**

A creator should be able to arrange Video Clips, select a program orientation, switch studios, refresh the application, and return later without losing those settings.

Do not redesign StudioFlow.

Do not replace its workspace architecture.

Do not introduce unnecessary migrations.

Identify the actual persistence gaps, repair the authoritative configuration path, and verify the complete server round trip.

Preserve the improvements completed under Directives 028–032 and the performance repair completed under Directive 034.

Maintain all relevant Markdown documentation.

Follow the guarded Source-to-Live Workflow.

**The objective is reliable, predictable, studio-specific configuration persistence without regressions.**

**END DIRECTIVE — TPI-STUDIOFLOW-033**
