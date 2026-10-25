# TPI-OPS-029 — Permanent E2E Infrastructure Repair and Release Unblocking

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 01:25.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
## TPI-OPS-029
### PERMANENT E2E TESTING INFRASTRUCTURE REPAIR

**PRIORITY: CRITICAL — EXECUTE IMMEDIATELY**

**ASSIGNED TO:** FreeBuff

**OWNER AUTHORIZATION: GRANTED**

### 1. OWNER DECISION

The owner explicitly authorizes you to create and use a completely isolated, disposable development testing environment.

You may create a dedicated test directory under `/tmp` or another appropriate temporary location.

You are authorized to:

- Create isolated Wrangler state directories.
- Create isolated D1 test databases.
- Create isolated R2 test storage.
- Seed synthetic test accounts.
- Generate synthetic test media.
- Start and stop dedicated test Workers.
- Create and manage a dedicated test LaunchAgent.
- Repair test infrastructure.
- Update test scripts.
- Run complete E2E verification.
- Remove temporary resources created exclusively for testing.

**You are not authorized to modify the owner's existing development database or media.**

### 2. PROTECTED DEVELOPMENT ENVIRONMENT

The following existing environment must remain untouched:

**LaunchAgent:**

`com.tpi.local-development`

**Development Worker:**

`http://127.0.0.1:8787`

**Protected development state:**

`.local-dev/state`

**Protected owner credentials:**

`.local-dev/local-auth-credentials.json`

Do not reseed, reset, migrate destructively, overwrite, or clear these resources.

Do not restart or unload the owner's existing LaunchAgent as part of testing.

### 3. ROOT CAUSE INVESTIGATION

Investigate the `spawn EBADF` failure.

Determine why Wrangler/esbuild fails when launched from FreeBuff's execution environment but succeeds when started through the existing macOS LaunchAgent.

Inspect:

- Standard input, output, and error descriptors.
- Shell execution environment.
- Process inheritance.
- Wrangler execution.
- esbuild subprocess creation.
- Node.js runtime.
- LaunchAgent execution differences.
- Working directories.
- Environment variables.

Do not immediately upgrade Wrangler, esbuild, or Node.js without establishing that an upgrade is necessary.

Avoid unnecessary dependency changes.

### 4. IMPLEMENT AN ISOLATED TEST WORKER

Create a dedicated test Worker using the existing application source.

Requirements:

- Separate port, preferably `8789`.
- Separate disposable D1 database.
- Separate disposable R2 storage.
- Separate Wrangler persistence directory.
- Synthetic authentication credentials.
- No production bindings.
- No access to owner development state.
- No access to production data.

Verify that all bindings resolve to disposable test resources before running any seeds or migrations.

### 5. LAUNCHAGENT EXECUTION

If Wrangler cannot launch directly from FreeBuff's shell, implement a dedicated LaunchAgent-backed testing method.

Use a distinct service identifier, such as:

`com.tpi.isolated-e2e`

This service must be independent of:

`com.tpi.local-development`

The test service must:

1. Start the isolated Worker.
2. Use the dedicated test port.
3. Use the disposable persistence directory.
4. Write logs to test-specific files.
5. Report readiness.
6. Support clean shutdown.
7. Never terminate the owner's Worker.
8. Never share the owner's D1 or R2 state.

Confirm that the test Worker is actually using the isolated database before seeding.

### 6. REPAIR THE API E2E HARNESS

Update the E2E harness to support the isolated Worker.

The harness must:

- Detect the test environment.
- Verify the correct Worker endpoint.
- Verify the disposable database location.
- Refuse to seed protected owner state.
- Refuse to target production.
- Seed only synthetic accounts and data.
- Run the complete API E2E suite.
- Report actual test results.
- Clean up only its own temporary resources.

The default automated E2E workflow should be safe without requiring repeated owner intervention.

### 7. FIREFOX AUTHENTICATION

Do not use the owner's `local_admin` password in automated browser tests.

Create a dedicated synthetic administrator in the isolated test database.

Update Firefox acceptance to authenticate using that account.

Use Firefox Developer Edition with an isolated automation profile.

Do not close or modify the owner's existing Firefox window.

### 8. RUN THE COMPLETE RELEASE TESTS

Once the infrastructure works, resume Directive 028.

Complete:

- API E2E.
- Firefox acceptance.
- Chromium acceptance.
- Video Clips.
- Video Timers.
- Sounds.
- Background Music.
- Motion Backgrounds.
- Studio persistence.
- Backup and restore.
- Configuration integrity.
- Production build.
- Asset integrity.
- Wrangler dry-run.

Investigate the previously reported network errors.

Repair genuine application defects.

### 9. GITHUB COMMIT AND PUSH

After all critical tests pass:

1. Review existing uncommitted work.
2. Include verified testing infrastructure repairs.
3. Commit the release.
4. Push to `codex/tpi-development`.
5. Confirm the remote commit matches.

Do not request another confirmation for ordinary verified changes.

### 10. CLOUDFLARE PRODUCTION DEPLOYMENT

The owner has already authorized guarded production deployment.

Before deploying:

- Confirm the current production Worker version.
- Confirm the release commit.
- Confirm rollback availability.
- Confirm production bindings.
- Confirm critical release gates passed.
- Confirm no destructive data operations are included.

Then deploy using the existing guarded Wrangler workflow.

Perform non-destructive production acceptance.

Roll back if a critical production regression occurs.

### 11. PERMANENT SOLUTION

This must not be a one-time workaround.

Document and implement a reusable testing system that future coding agents can execute without encountering the same Wrangler startup blocker.

Future directives should be able to run the complete test suite without touching the owner's development environment.

### 12. FINAL REPORT

Report:

1. Root cause of `spawn EBADF`.
2. Isolated test Worker location and port.
3. Isolated D1 and R2 paths.
4. LaunchAgent configuration.
5. API E2E results.
6. Firefox results.
7. Chromium results.
8. Backup and restore results.
9. Production build results.
10. Git commit SHA.
11. GitHub push confirmation.
12. Cloudflare deployment result.
13. Production Worker version.
14. Live acceptance results.

**Do not stop after creating the isolated environment.**

**Complete the release workflow once all critical gates pass.**

**END DIRECTIVE — TPI-OPS-029**
