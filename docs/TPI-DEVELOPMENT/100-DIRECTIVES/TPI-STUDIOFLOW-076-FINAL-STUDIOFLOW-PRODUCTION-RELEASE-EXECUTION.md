# TPI-STUDIOFLOW-076 — FINAL STUDIOFLOW PRODUCTION RELEASE EXECUTION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 22:22.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE: TPI-STUDIOFLOW-076
FINAL STUDIOFLOW PRODUCTION RELEASE EXECUTION
=====================================================================

PRIORITY: CRITICAL
MISSION: COMPLETE STUDIOFLOW PRODUCTION UPDATE

OWNER DIRECTION:

We have completed StudioFlow development.

We have completed release isolation.

We have completed the local Git checkpoint.

We are not starting another development cycle.

The objective is to finish the release process
and update the existing live TPI website.

Resolve the remaining release blockers through
actual execution wherever safely authorized.

Do not repeat completed investigations.

Do not rebuild working systems.

=====================================================================
1. VERIFIED RELEASE CHECKPOINT
=====================================================================

Repository:

/Users/toddknipple/Documents/GitHub/
tpi-studioflow-release-candidate

Branch:

codex/studioflow-release-candidate

Approved checkpoint:

ebcd0122e8099418fa99ed07c32d0f9d8c1d31a0

Expected release:

37 approved files.

Verify checkpoint identity.

Do not recreate the release package.

Do not include unrelated development.

=====================================================================
2. PRODUCTION READ-ONLY AUTHORIZATION
=====================================================================

OWNER AUTHORIZES:

Bounded, read-only inspection of the existing
production deployment and migration state.

Permitted:

- Identify current deployed Worker version.
- Identify current production Git revision,
  where deployment metadata permits.
- Inspect Cloudflare deployment configuration.
- Inspect D1 migration ledger.
- Inspect D1 table and column structure.
- Inspect required R2 binding configuration.
- Inspect current Wrangler deployment settings.
- Fetch current GitHub branch metadata.

Do not retrieve member records or media contents.

Do not display credentials or secrets.

Do not modify production data.

Do not create or delete production resources.

If authentication or access is unavailable,
report the exact missing permission.

=====================================================================
3. REFRESH GITHUB STATE
=====================================================================

Repository:

github.com/paranormalinitiative/
paranormal-initiative-website

Fetch current remote branch references.

Identify:

- Current origin/main.
- Current production promotion branch.
- Candidate relationship to main.
- Commits missing from local references.
- Shared backend changes introduced since
  the candidate baseline.

Do not force-push.

Do not rewrite remote history.

Do not push unrelated website changes.

=====================================================================
4. RESOLVE RELEASE INTEGRATION
=====================================================================

Create a separate local release integration
branch or worktree from the verified current
production promotion branch.

Integrate only the approved StudioFlow update.

Preserve:

- Existing website.
- Live Bridge.
- Authentication.
- Community.
- Administration.
- Member profiles.
- Existing content.
- Existing database behavior.

Resolve conflicts through file- and hunk-level
review.

Do not blindly overwrite shared backend files.

Do not merge the dirty website development branch.

Do not include excluded candidate files.

If the integration requires changes beyond the
approved StudioFlow scope, document them and
stop that portion for owner review.

=====================================================================
5. RESOLVE WRANGLER BRANCH POLICY
=====================================================================

TPI-075 identified a conflict between the
documented main-branch promotion process
and the guarded Wrangler deployment script.

Determine the intended production policy.

Correct the local release configuration
to support that policy without weakening
production safety guards.

Do not disable deployment protection.

Do not deploy from an unverified branch.

Document the final deployment command.

=====================================================================
6. RECONCILE PRODUCTION DATABASE STATE
=====================================================================

Production D1:

tpi_contributor_portal

Required migrations:

0053_studioflow_creator_production_lock.sql

0054_studioflow_media_assets.sql

Perform authorized READ-ONLY inspection.

Determine:

- Which migrations are recorded.
- Which required columns already exist.
- Which required tables already exist.
- Whether ledger and physical schema agree.
- Whether older pending migrations are unsafe.
- Whether migration 0053 is already partially
  represented in production.

DO NOT run blanket migration apply.

DO NOT execute schema changes.

DO NOT modify the migration ledger.

Prepare only the exact missing changes.

If schema and ledger disagree, produce a
specific reconciliation plan.

Do not guess.

=====================================================================
7. PREPARE VERIFIED RECOVERY
=====================================================================

Identify the current deployed Worker version.

Document the exact rollback target.

Prepare:

- D1 backup command.
- Backup integrity verification.
- R2 preservation procedure.
- Worker rollback command.
- Post-rollback validation.

Do not overwrite existing backups.

Do not modify owner media.

Do not execute production restoration.

A rollback plan must not depend on dropping
production columns or deleting user data.

=====================================================================
8. BUILD FINAL INTEGRATED RELEASE
=====================================================================

Use the verified production promotion baseline.

Apply only required StudioFlow changes.

Verify:

- StudioFlow runtime.
- StudioFlow bridges.
- Workspace persistence.
- Studio switching.
- Scene management.
- Background assets.
- Custom media persistence.
- Production controls.
- Existing Live Bridge compatibility.
- Existing authentication behavior.
- Existing website navigation.

Build the release from the integrated branch.

Confirm the correct production compatibility
settings are used.

Exclude wrangler.local.toml.

Do not silently change the production
compatibility date.

=====================================================================
9. EXECUTE FULL LOCAL VERIFICATION
=====================================================================

Run all maintained StudioFlow verification
scripts and relevant website regressions.

Required:

- StudioFlow tests.
- Guest-code contracts.
- Live Bridge route preservation.
- Authentication tests.
- Worker routing tests.
- Workspace persistence.
- Media persistence.
- Migration tests using disposable D1.
- Website navigation.
- Build reproducibility.
- JavaScript syntax.
- git diff --check.

Report exact results.

Do not claim production or live WebRTC testing
was performed when it was not.

=====================================================================
10. PREPARE FINAL RELEASE COMMIT
=====================================================================

Once the integrated release passes verification:

Create a local Git commit on the isolated
release integration branch.

Use a clear StudioFlow release message.

Record:

- Commit SHA.
- Parent SHA.
- Exact file list.
- Exact migration dependencies.
- Test results.
- Production baseline.

Do not include unrelated files.

Do not push yet.

=====================================================================
11. PRODUCTION RELEASE APPROVAL GATE
=====================================================================

STOP BEFORE:

- GitHub push.
- Production D1 backup execution.
- Production schema or ledger changes.
- Cloudflare production deployment.
- Production rollback operations.

Present one concise release approval request.

The request must include:

A. CURRENT PRODUCTION VERSION

B. FINAL INTEGRATED COMMIT SHA

C. EXACT FILES TO BE RELEASED

D. REQUIRED DATABASE CHANGES

E. BACKUP AND RECOVERY PROCEDURE

F. EXACT GITHUB PUSH TARGET

G. EXACT CLOUDFLARE DEPLOYMENT TARGET

H. FINAL TEST RESULTS

I. REMAINING RISKS

J. GO / NO-GO RECOMMENDATION

Do not request repeated approvals for
read-only checks already authorized here.

Do not deploy without explicit final
owner authorization.

=====================================================================
12. POST-APPROVAL RELEASE SEQUENCE
=====================================================================

After separate explicit owner approval:

1. Confirm production revision has not changed.

2. Create and verify required production backups.

3. Confirm the database migration ledger.

4. Apply only approved missing migrations.

5. Verify production schema.

6. Push the approved release commit to the
   approved GitHub target.

7. Deploy using the approved Cloudflare
   production procedure.

8. Verify production Worker health.

9. Verify existing public website routes.

10. Verify StudioFlow loads correctly.

11. Verify workspace persistence.

12. Verify custom media retrieval.

13. Verify existing Live Bridge compatibility.

14. Verify no unrelated website functionality
    has regressed.

15. Record final deployment version.

16. Update the TPI Master Release Register.

If any critical step fails, STOP and use
the approved recovery procedure.

Do not improvise destructive rollback actions.

=====================================================================
13. DEVELOPMENT DOCUMENTATION
=====================================================================

Update:

docs/TPI-DEVELOPMENT/
TPI-CURRENT-DEVELOPMENT-STATUS.md

docs/TPI-MASTER-DEVELOPMENT/
03-TPI-CREATOR-SYSTEMS/
01-TPI-CREATOR-STUDIO.md

docs/TPI-MASTER-DEVELOPMENT/
00-MASTER-DEVELOPMENT-CONTROL/
05-RELEASE-REGISTER.md

Create:

docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/
TPI-STUDIOFLOW-076-RESULT.md

Record actual completed operations.

Do not mark StudioFlow deployed until
production verification succeeds.

Preserve the exact numbered
TPI Master Development System hierarchy.

=====================================================================
14. STRICT SCOPE
=====================================================================

DO NOT:

- Rebuild StudioFlow.
- Rebuild Live Bridge.
- Introduce unrelated features.
- Modify unrelated community systems.
- Modify unrelated Administration systems.
- Access private member content.
- Delete owner workspaces.
- Delete owner recordings.
- Delete R2 objects.
- Run blanket database migrations.
- Force-push Git branches.
- Bypass authentication.
- Disable production safety controls.
- Deploy before final owner approval.

=====================================================================
15. REQUIRED RESULT
=====================================================================

TPI-STUDIOFLOW-076 RESULT

A. CURRENT PRODUCTION BASELINE
B. GITHUB SYNCHRONIZATION
C. RELEASE INTEGRATION
D. WRANGLER POLICY RESOLUTION
E. PRODUCTION DATABASE FINDINGS
F. BACKUP AND RECOVERY READINESS
G. FINAL REGRESSION RESULTS
H. INTEGRATED RELEASE COMMIT
I. EXACT PRODUCTION RELEASE PLAN
J. OWNER APPROVAL REQUEST

=====================================================================
SUCCESS CONDITION
=====================================================================

The StudioFlow release is fully integrated,
locally verified, and ready for one final
owner-approved production operation.

Do not return another general investigation
report unless a specific technical blocker
makes integration impossible.

Identify exact blockers and resolve all
other independently actionable tasks.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-076
=====================================================================
