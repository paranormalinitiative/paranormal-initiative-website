# TPI-STUDIOFLOW-029 — Documentation Synchronization and Historical Preservation

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-23 20:44.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-23-TPI-STUDIOFLOW-029-DOCUMENTATION-SYNCHRONIZATION.md](../300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-029-DOCUMENTATION-SYNCHRONIZATION.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-029
## DOCUMENTATION SYNCHRONIZATION — DIRECTIVES 027, 028 & ADDENDUM A

**Project:** The Paranormal Initiative — StudioFlow  
**Priority:** HIGH  
**Assignment:** Documentation maintenance only  
**Agent:** FreeBuff / MiMO 2.6 Pro  
**Production deployment:** NOT AUTHORIZED

### 1. MANDATORY INSTRUCTIONS

Before beginning, read and follow:

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/AGENTS.md`

`/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

Follow all additional mandatory documentation referenced by these files.

### 2. OBJECTIVE

Synchronize StudioFlow's maintained Markdown documentation with the completed and deployed work from:

- TPI-STUDIOFLOW-027
- TPI-STUDIOFLOW-028
- TPI-STUDIOFLOW-028 Addendum A

This is a documentation-only assignment.

**Do not modify application source code or production infrastructure.**

### 3. AUDIT EXISTING DOCUMENTATION

Locate and review:

- Master directive index.
- Current development status.
- Completed work records.
- StudioFlow Source-to-Live Workflow.
- Production release runbook.
- Scene and media architecture documentation.
- Relevant regression test documentation.
- Historical implementation references.

Identify any records that still describe the previous broken behavior or incorrectly identify the current production baseline.

Do not create duplicate documentation when an authoritative record already exists.

### 4. RECORD THE APPROVED PLAYBACK CONTRACT

Document the following as the current approved StudioFlow behavior.

**Intro Video**

- Uses the assigned Intro Video from Video Clips.
- First click starts playback.
- Second click stops playback.
- Every playback starts at 00:00.
- Video and audio stop together.
- Appropriate scene restoration occurs.
- Natural completion resets playback.
- Guest connections remain unaffected.

**Outro Video**

- Uses the assigned Outro Video from Video Clips.
- First click starts playback.
- Second click stops playback.
- Every playback starts at 00:00.
- Video and audio stop together.
- Appropriate scene restoration occurs.
- Natural completion resets playback.
- Outro completion does not automatically terminate recording or livestreaming.

**After Intro Background Music**

- Uses its assigned track from Background Music.
- Remains independently controllable.
- Automatically activates when leaving the Intro scene, including natural completion and manual stop, as implemented by Sol.
- Does not unintentionally trigger Intro Video playback.
- Preserves existing volume, looping, routing, and studio-specific persistence.

**My Scenes**

- Uses the existing media assignments.
- Maintains independent scene identifiers and handlers.
- Does not create duplicate playback systems.
- Preserves the existing production scene workflow.

### 5. DOCUMENT THE REGRESSION HISTORY

Record the verified historical findings from Directive 028.

Include:

- Original playback behavior established under Directive 020.
- Sol's After Intro Background Music implementation.
- Commit `d262867` as the identified original music implementation.
- Commit `17bbd4a` as the identified source of the click-to-play regression.
- Commit `0241dc7` as the identified program-state gating regression.
- Directive 027's authenticated media-resolution repair.
- Directive 028's scene playback and restoration repair.
- Addendum A's restoration of Sol's automatic music transition.

Distinguish verified code history from assumptions.

### 6. UPDATE THE CURRENT PRODUCTION BASELINE

Record the latest reported successful production deployment:

**Directive:** TPI-STUDIOFLOW-028 Addendum A

**Application commit:** `cb97464`

**Documentation commit:** `89baade`

**Worker version:** `21ea05f7-588d-4b5a-b039-c6063f7fd248`

**Previous Worker version:** `210f4610`

**Reported validation:**
- 028 browser interactions: 33/33
- 021 static contracts: 58/58
- 021 browser interactions: 29/29
- 020 contracts: 14/14
- Release safety: 17/17
- Live smoke: 10/10
- Live Firefox acceptance: 60/60

Verify these details against existing release records before updating the baseline.

Do not replace a newer production baseline if another deployment has occurred since these reports.

### 7. PRESERVE HISTORICAL RECORDS

Do not delete, rewrite, or overwrite previous completion reports.

Add corrections or references where necessary.

Historical documents should continue to show what was implemented at the time.

Current-status documents should identify the latest approved behavior.

### 8. PREVENT FUTURE REGRESSIONS

Update the appropriate agent-facing documentation to require:

1. Historical directive review before changing existing functionality.
2. Git history comparison when repairing regressions.
3. Identification of the last known working implementation.
4. Preservation of previously approved behavior.
5. Browser interaction testing for user-facing controls.
6. Regression tests covering restored functionality.
7. Explicit reporting of intentional behavior changes.

Do not replace or weaken existing instructions in `AGENTS.md`.

Add these requirements only in a manner consistent with its existing structure and authority.

### 9. DOCUMENTATION CONSISTENCY

Check for contradictions between:

- `AGENTS.md`
- StudioFlow workflow documentation.
- Current development status.
- Directive index.
- Completion reports.
- Release records.
- Scene and media documentation.

Resolve outdated current-state references without altering historical facts.

### 10. VALIDATION

Perform:

- Markdown formatting checks.
- Internal link verification.
- Documentation reference verification.
- Git diff review.
- Confirmation that no application code changed.
- Confirmation that no production deployment occurred.

### 11. COMPLETION REPORT

Provide:

1. Markdown files reviewed.
2. Markdown files updated.
3. Documentation inconsistencies discovered.
4. Historical references added.
5. Current production baseline recorded.
6. Regression-prevention requirements added.
7. Validation results.
8. Documentation commit, if authorized.
9. Confirmation that application source and production were untouched.

### FINAL REQUIREMENT

The next development agent must be able to open the project's Markdown documentation and determine:

**What StudioFlow is supposed to do, how the original functionality was implemented, what broke it, how it was repaired, and what must never be broken again.**

This documentation must preserve the approved implementation rather than reinterpret it.

**END DIRECTIVE — TPI-STUDIOFLOW-029**
