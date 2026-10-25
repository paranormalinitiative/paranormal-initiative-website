# TPI-OPS-030 — Clean Working Tree and Continuous Deployment Policy

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 01:30.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
## TPI-OPS-030
### CLEAN WORKING TREE AND CONTINUOUS DEPLOYMENT POLICY

**PRIORITY: CRITICAL**

**ASSIGNED TO:** FreeBuff

**OWNER AUTHORIZATION: GRANTED**

### 1. PERMANENT DEVELOPMENT POLICY

The Paranormal Initiative is adopting a clean-working-tree and verified-deployment policy.

The objective is to prevent completed development work from accumulating as uncommitted files.

**Every completed and verified release must be committed, pushed, deployed, and confirmed operational.**

A temporarily dirty working tree is acceptable while actively developing. It must not become the normal resting state of the project.

### 2. IMMEDIATE WORKING TREE RECONCILIATION

The repository currently contains uncommitted changes from previous StudioFlow directives.

Before continuing new feature development:

1. Inspect `git status`.
2. Identify every modified, deleted, and untracked file.
3. Review the changes against the relevant directives.
4. Identify completed work, incomplete work, and unrelated changes.
5. Preserve all legitimate development work.
6. Repair any incomplete implementation.
7. Run the applicable tests.
8. Commit verified changes.

Do not discard, overwrite, or blindly stash existing work.

Do not create duplicate implementations.

### 3. COMPLETE THE CURRENT RELEASE

The current release includes outstanding work associated with Directives 026–029.

Finish the remaining requirements, including:

- StudioFlow interface corrections.
- Video Clips.
- Video Timers.
- Sound Effects.
- Background Music.
- Motion Backgrounds.
- Firefox acceptance.
- Chromium acceptance.
- Backup and restore.
- Configuration integrity.
- Authentication testing.
- Isolated E2E infrastructure.
- Production build and deployment verification.

Do not begin unrelated feature development until the current release has been reconciled.

### 4. COMMIT POLICY

After a coherent change has passed its relevant checks:

1. Create a descriptive Git commit.
2. Record the commit SHA.
3. Push to the approved GitHub branch.
4. Verify that the remote branch contains the commit.

Do not leave verified changes uncommitted simply because another task remains.

Do not commit secrets, credentials, local database files, temporary browser profiles, or test media.

If a change cannot yet be committed safely, document the specific blocker.

### 5. DEPLOYMENT POLICY

Once the complete release candidate passes its critical gates:

**Deploy it to production without requesting another routine authorization.**

Use the existing guarded Cloudflare deployment workflow.

Before deployment:

- Verify the current production Worker version.
- Confirm the exact release commit.
- Confirm rollback readiness.
- Verify the production bindings.
- Confirm there are no destructive data operations.
- Confirm critical tests passed.

After deployment:

- Verify the deployed Worker version.
- Verify website availability.
- Verify StudioFlow functionality.
- Verify the Admin Panel.
- Verify authentication.
- Verify media persistence.
- Perform non-destructive production acceptance.

If a critical regression occurs, roll back using the approved procedure.

### 6. NO PERMANENT UNCOMMITTED BACKLOG

At the end of each development directive, the repository should be in one of two clearly reported states.

**STATE A — RELEASE COMPLETE**

- Tests passed.
- Changes committed.
- GitHub push confirmed.
- Production deployment verified.
- Working tree clean.

**STATE B — RELEASE BLOCKED**

- Safe completed changes committed and pushed where appropriate.
- Unfinished changes identified.
- Blocking tests or dependencies documented.
- Production left in its last verified state.
- No owner data modified.

Do not describe State B as a completed release.

### 7. RELEASE TRACEABILITY

Maintain a record connecting:

**Directive → Git commit → GitHub branch → Cloudflare Worker version → Production verification**

This record must make it possible to determine which directives are actually deployed.

Update the existing release documentation rather than creating competing records.

### 8. PREVENT RECURRING TEST BLOCKERS

Complete the isolated E2E infrastructure work from Directive 029.

The testing environment must not modify:

- The owner's local development D1.
- The owner's local R2.
- The owner's Firefox profile.
- The owner's Crossroads studio.
- Production data.

If local infrastructure continues to prevent reliable testing, investigate Cloudflare staging as the primary release-validation environment.

Do not create staging infrastructure with production bindings or secrets.

### 9. AUTONOMOUS EXECUTION

The owner authorizes FreeBuff to:

- Reconcile existing changes.
- Repair defects.
- Run tests.
- Commit verified work.
- Push commits.
- Deploy verified releases.
- Perform non-destructive acceptance.
- Roll back failed deployments.

Do not repeatedly request permission for these routine operations.

Do not bypass critical release gates merely to produce a clean working tree.

### 10. FINAL REPORT

Report:

1. Initial modified and untracked files.
2. Changes reconciled.
3. Tests completed.
4. Remaining failures.
5. Commit SHA.
6. GitHub push status.
7. Working-tree status.
8. Production deployment status.
9. Cloudflare Worker version.
10. Live acceptance results.
11. Any remaining undeployed commits.

**FINAL OBJECTIVE:**

The Paranormal Initiative must maintain a reliable development process in which verified changes are committed promptly and complete releases are deployed without unnecessary delays.

**END DIRECTIVE — TPI-OPS-030**
