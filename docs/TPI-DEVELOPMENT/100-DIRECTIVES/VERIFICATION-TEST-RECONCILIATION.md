# VERIFICATION TEST RECONCILIATION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 19:37.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-057
VERIFICATION TEST RECONCILIATION
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

PRIORITY:
HIGH

OBJECTIVE:
Resolve outdated or failing StudioFlow verification
tests before establishing the release checkpoint.

THIS DIRECTIVE HAS ONE PURPOSE:
Ensure the existing StudioFlow verification suites
accurately test the current integrated application.

=====================================================================
1. INVESTIGATE EXISTING FAILURES
=====================================================================

Investigate:

TPI-012:
12/14 passed

TPI-020:
9/11 passed

TPI-031:
11/12 passed

Determine whether each failure represents:

A. An outdated test assertion.

B. An actual application regression.

C. An intentional UI change.

D. A missing integration dependency.

Do not assume a failing test is obsolete.

=====================================================================
2. ASSET REFERENCE TESTS
=====================================================================

Update verification scripts that rely on
hardcoded historical JavaScript or CSS filenames.

Tests should identify current generated assets
through the authoritative build manifest or
integrated StudioFlow entry point.

Preserve meaningful asset-integrity checks.

Do not weaken verification to force a pass.

=====================================================================
3. UI CONTRACT VERIFICATION
=====================================================================

Investigate the TPI-012 failures involving:

- Import Project.
- Legacy action-row expectations.

Compare:

- Current StudioFlow UI.
- Current project-saving architecture.
- Existing documentation.
- Original TPI-012 requirements.

If behavior is intentionally superseded,
update the tests to reflect the documented
current contract.

If an actual regression exists, identify it
and perform only the minimal necessary repair.

Do not redesign the interface.

=====================================================================
4. REGRESSION VALIDATION
=====================================================================

Run:

- TPI-012
- TPI-020
- TPI-031
- TPI-043
- TPI-045
- TPI-048
- TPI-050
- TPI-055 integration checks

Verify:

- Current assets are correctly referenced.
- Required TPI bridges remain loaded.
- Save/autosave remains intact.
- Import/export remains available.
- Authentication remains protected.
- No obsolete reload behavior returns.

Use synthetic data only.

=====================================================================
5. DATA PROTECTION
=====================================================================

Do not modify:

- Crossroads of the Unknown.
- Owner studios.
- Owner media.
- Recordings.
- Recovery snapshots.
- Production D1.
- Production R2.

Do not clear browser storage.

=====================================================================
6. STRICT SCOPE
=====================================================================

DO NOT:

- Deploy.
- Commit.
- Push.
- Run production migrations.
- Implement media persistence.
- Modify unrelated website features.
- Delete existing development work.
- Reset or clean Git repositories.

Only correct verification issues and
minimal confirmed regressions.

=====================================================================
7. DOCUMENTATION
=====================================================================

Update the existing Markdown documentation.

Record:

- Root cause of each test failure.
- Files modified.
- Corrected test expectations.
- Actual regressions, if any.
- Verification results.
- Remaining limitations.

Update the directive index and current
development status.

Preserve historical reports.

=====================================================================
8. REQUIRED RESULT
=====================================================================

TPI-STUDIOFLOW-057 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. FAILURE ROOT CAUSES

B. TEST CORRECTIONS

C. APPLICATION REPAIRS, IF REQUIRED

D. REGRESSION RESULTS

E. BUILD/INTEGRATION VERIFICATION

F. DOCUMENTATION UPDATED

G. REMAINING ISSUES

H. NEXT RECOMMENDED ACTION

=====================================================================
FINAL INSTRUCTION
=====================================================================

Resolve the known verification failures.

Preserve the existing integrated application.

Do not expand scope.

Do not deploy or create Git commits.

Complete this task before beginning
the release checkpoint.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-057
=====================================================================
