# TPI-068 — STUDIOFLOW RELEASE BLOCKER RESOLUTION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 21:25.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE: TPI-068
STUDIOFLOW RELEASE BLOCKER RESOLUTION
=====================================================================

PRIORITY:
CRITICAL

ACTIVE MISSION:
TPI CREATOR STUDIO / STUDIOFLOW

STATUS:
AUTHORIZED — SCOPED LOCAL FIXES AND VERIFICATION

=====================================================================
1. OBJECTIVE
=====================================================================

Resolve the two confirmed release-candidate blockers:

1. /member-home returns 404 after normal login.
2. Installed workerd does not support the configured
   compatibility date.

Preserve the isolated StudioFlow release candidate.

Do not introduce unrelated features.

Do not deploy.

=====================================================================
2. AUTHORITATIVE WORKTREE
=====================================================================

/Users/toddknipple/Documents/GitHub/
tpi-studioflow-release-candidate

Expected branch:

codex/studioflow-release-candidate

Expected baseline:

7385f0cf24155f121bdc967a0985553daa8a05df

Verify branch, HEAD, and working-tree state.

Preserve the original website worktree and
authoritative StudioFlow source repository.

Do not stage, commit, push, or deploy.

=====================================================================
3. MEMBER-HOME REDIRECT INVESTIGATION
=====================================================================

Investigate why normal login redirects to:

/member-home

and receives HTTP 404.

Determine:

- Whether the route exists in the production baseline.
- Whether it requires a clean-URL rewrite.
- Whether it is handled by Worker routing.
- Whether authentication middleware interferes.
- Whether the isolated candidate omitted a
  required existing route.
- Whether the failure is specific to local testing.

Do not create a replacement member-home page.

Do not redirect users to an unrelated page
as a workaround.

Preserve the intended member experience.

=====================================================================
4. MEMBER-HOME FIX
=====================================================================

If the exact cause is established:

Implement the smallest necessary correction
inside the isolated release candidate.

Do not copy unrelated website changes.

Do not alter Administration or Community behavior
unless strictly required by the existing route.

Verify:

- Successful login.
- Correct member-home navigation.
- Browser refresh.
- Logout.
- Unauthorized access handling.
- StudioFlow navigation from member-home.
- Existing route regressions.

If the fix requires unrelated development,
report BLOCKED rather than expanding scope.

=====================================================================
5. WORKERD COMPATIBILITY
=====================================================================

Investigate:

Configured compatibility date:

2026-07-18

Installed runtime supports through:

2026-07-15

Determine:

- Installed Wrangler version.
- Installed workerd version.
- Repository tooling requirements.
- Supported upgrade path.
- Whether the mismatch is local-only.

Prefer a project-scoped tooling solution.

Do not downgrade the production
compatibility date merely to make tests pass.

Do not modify global tooling.

Do not modify production configuration.

If a project-scoped dependency update is
necessary, identify the exact package changes
and verify they are limited to tooling.

Do not perform a broad dependency upgrade.

=====================================================================
6. MEDIA PERSISTENCE CONTRACT
=====================================================================

Inspect existing StudioFlow media behavior.

Determine:

- Where uploaded media bytes are stored.
- Whether storage is browser-local.
- Whether media survives browser refresh.
- Whether media survives device changes.
- Whether workspace snapshots contain media bytes
  or only references.
- Whether R2 media persistence already exists.
- Whether the UI promises cloud persistence.

Document the actual behavior.

Do not build a new media-storage subsystem
under this directive.

Identify the minimum requirement for release.

=====================================================================
7. REALTIMEKIT READINESS
=====================================================================

Inspect existing guest-room integration.

Determine:

- Required disposable test credentials.
- Required gateway configuration.
- Existing local test facilities.
- Whether room creation requires live services.
- Whether a safe synthetic integration test
  can verify the contract.

Do not fabricate successful guest connections.

Do not use production credentials.

Do not modify production room services.

Document the exact remaining acceptance test.

=====================================================================
8. VERIFICATION
=====================================================================

Run applicable local checks:

- Authentication.
- Member-home routing.
- StudioFlow access.
- StudioFlow focused suite.
- Worker routing.
- Runtime compatibility.
- Production-session contracts.
- Backup/recovery.
- Syntax.
- git diff --check.

Report exact pass/fail counts.

If authenticated browser testing is possible,
repeat the affected acceptance workflow.

Use disposable test data.

=====================================================================
9. RELEASE MANIFEST UPDATE
=====================================================================

Update the isolated candidate manifest with:

- Exact files changed.
- Reason for each change.
- Dependency impact.
- Test evidence.
- Security implications.
- Remaining release blockers.

Confirm unrelated development remains excluded.

=====================================================================
10. DOCUMENTATION
=====================================================================

Create:

docs/TPI-DEVELOPMENT/
300-COMPLETED-WORK/
TPI-STUDIOFLOW-068-RESULT.md

Update:

docs/TPI-DEVELOPMENT/
100-DIRECTIVES/
DIRECTIVE-INDEX.md

docs/TPI-DEVELOPMENT/
TPI-CURRENT-DEVELOPMENT-STATUS.md

Update the Creator Studio module record in:

docs/TPI-MASTER-DEVELOPMENT/
03-TPI-CREATOR-SYSTEMS/
01-TPI-CREATOR-STUDIO.md

Documentation updates must reflect actual
verification evidence.

Do not mark production readiness complete.

=====================================================================
11. STRICT PROHIBITIONS
=====================================================================

DO NOT:

- Stage.
- Commit.
- Push.
- Deploy.
- Apply production migrations.
- Access production D1 or R2.
- Modify Cloudflare production settings.
- Modify owner workspaces.
- Modify owner media or recordings.
- Modify browser storage belonging to the owner.
- Reset or clean existing worktrees.
- Introduce unrelated features.
- Begin Master Development Tree reorganization.

=====================================================================
12. REQUIRED RESULT
=====================================================================

TPI-STUDIOFLOW-068 RESULT

A. REPOSITORY STATE

B. MEMBER-HOME ROOT CAUSE

C. MEMBER-HOME FIX

D. WORKERD COMPATIBILITY FINDINGS

E. TOOLING CHANGES

F. MEDIA PERSISTENCE CONTRACT

G. REALTIMEKIT REQUIREMENTS

H. VERIFICATION RESULTS

I. EXACT FILE CHANGES

J. REMAINING RELEASE BLOCKERS

K. NEXT RECOMMENDED ACTION

Provide exactly one recommended next action.

=====================================================================
COMPLETION CONDITIONS
=====================================================================

Mark COMPLETE only if:

- Member-home navigation works.
- Runtime compatibility is resolved.
- Focused regressions pass.
- Media behavior is documented accurately.
- Guest-room test requirements are identified.
- Unrelated development remains excluded.
- No staging, commit, push, or deployment occurred.

Otherwise report PARTIAL or BLOCKED.

=====================================================================
END DIRECTIVE — TPI-068
=====================================================================
