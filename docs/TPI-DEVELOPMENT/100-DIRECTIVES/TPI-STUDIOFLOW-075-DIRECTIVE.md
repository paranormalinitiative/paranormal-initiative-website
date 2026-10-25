# TPI-STUDIOFLOW-075 — DIRECTIVE: TPI-STUDIOFLOW-075

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 22:17.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE: TPI-STUDIOFLOW-075
PRODUCTION RELEASE READINESS
=====================================================================

PRIORITY: CRITICAL
ACTIVE MISSION: STUDIOFLOW PRODUCTION UPDATE

OWNER OBJECTIVE:

Deploy the completed StudioFlow improvements
to the existing live TPI website.

Preserve all existing production functionality.

DO NOT rebuild StudioFlow or Live Bridge.

=====================================================================
1. VERIFY RELEASE CHECKPOINT
=====================================================================

Release worktree:

/Users/toddknipple/Documents/GitHub/
tpi-studioflow-release-candidate

Branch:

codex/studioflow-release-candidate

Expected commit:

ebcd0122e8099418fa99ed07c32d0f9d8c1d31a0

Verify:

- Commit exists.
- Commit contains exactly 37 approved files.
- No unrelated changes were committed.
- Excluded local files remain excluded.
- StudioFlow assets match the approved source.

STOP if checkpoint identity differs.

=====================================================================
2. DETERMINE DEPLOYMENT SOURCE
=====================================================================

Inspect existing local Git configuration
and deployment documentation.

Determine:

- Which GitHub repository hosts the website.
- Which branch is used for production.
- Whether Cloudflare deploys automatically.
- Whether deployment uses Wrangler or Git integration.
- Whether the StudioFlow checkpoint can be
  integrated without unrelated changes.

Do not assume the development branch
is the production branch.

Do not merge or push.

=====================================================================
3. ESTABLISH PRODUCTION REVISION
=====================================================================

Review existing deployment records.

Known historical reference:

Production commit: 89e8bff

Worker version:
68ad3a56-459c-4ceb-80f2-6cef9f1887db

Determine whether newer deployment records exist.

If the actual deployed revision cannot be
verified without production access, report:

CURRENT PRODUCTION REVISION UNCONFIRMED

Do not substitute historical records
for current production verification.

=====================================================================
4. DATABASE MIGRATION READINESS
=====================================================================

Review:

0053_studioflow_creator_production_lock.sql

0054_studioflow_media_assets.sql

Determine:

- Required tables and columns.
- Dependencies.
- Migration order.
- Existing migration ledger requirements.
- Whether migrations are idempotent.
- Application compatibility before migration.
- Application compatibility after migration.
- Required R2 bindings.

Do not access or modify production D1.

Do not apply migrations.

Prepare exact read-only inspection commands
for a separately authorized production step.

=====================================================================
5. BACKUP AND RECOVERY PLAN
=====================================================================

Prepare an explicit production recovery plan.

Include:

- Current Worker version preservation.
- Current deployment revision recording.
- Production D1 backup procedure.
- Production R2 preservation strategy.
- Migration verification.
- Rollback procedure.
- Post-rollback checks.

Do not execute production backups yet.

Do not access owner media or recordings.

Explain which database changes cannot
be safely reversed automatically.

=====================================================================
6. RELEASE INTEGRATION PLAN
=====================================================================

Determine the safest way to integrate
the 37-file StudioFlow checkpoint.

Preserve:

- Current production website.
- Existing Live Bridge.
- Authentication.
- Community systems.
- Administration.
- Existing production data.

Document the exact Git commands required.

Do not execute merge, rebase, cherry-pick,
push, or deployment operations.

=====================================================================
7. FINAL LOCAL VERIFICATION
=====================================================================

Run:

- StudioFlow verification scripts.
- Live Bridge compatibility contracts.
- Authentication checks.
- Worker routing tests.
- Website navigation checks.
- Migration tests against disposable D1.
- JavaScript syntax checks.
- git diff --check.

Report actual results.

Do not repeat unavailable live RealtimeKit
tests without the necessary environment.

=====================================================================
8. RELEASE GATES
=====================================================================

Define explicit GO / NO-GO conditions for:

A. Git integration.

B. GitHub push.

C. Production database migration.

D. Cloudflare deployment.

E. Live website verification.

A completed local commit does not
automatically authorize production changes.

=====================================================================
9. DOCUMENTATION
=====================================================================

Create:

docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/
TPI-STUDIOFLOW-075-RESULT.md

Update:

- Directive index.
- Current development status.
- Creator Studio module record.
- Master release register.

Record the release checkpoint SHA.

Do not change the approved numbered
Master Development folder structure.

=====================================================================
10. STRICT PROHIBITIONS
=====================================================================

NO Git push.

NO production deployment.

NO production migrations.

NO production D1 or R2 access.

NO production credential access.

NO changes to owner workspaces.

NO changes to owner recordings.

NO Live Bridge redesign.

NO unrelated website development.

=====================================================================
11. REQUIRED RESULT
=====================================================================

TPI-STUDIOFLOW-075 RESULT

A. RELEASE CHECKPOINT VERIFICATION
B. PRODUCTION BRANCH AND DEPLOYMENT METHOD
C. CURRENT PRODUCTION REVISION STATUS
D. DATABASE MIGRATION PLAN
E. BACKUP AND RECOVERY PLAN
F. EXACT GIT INTEGRATION PLAN
G. LOCAL REGRESSION RESULTS
H. GO / NO-GO RELEASE GATES
I. REMAINING BLOCKERS
J. NEXT REQUIRED ACTION

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-075
=====================================================================
