# TPI-STUDIOFLOW-028 — Release Completion Instruction

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 01:18.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** [2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md](../300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md)
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-028 — RELEASE COMPLETION INSTRUCTION

**PRIORITY: CRITICAL — COMPLETE THE RELEASE**

FreeBuff, the owner has already authorized you to complete development, testing, GitHub operations, and guarded Cloudflare deployment.

Stop requesting repeated confirmations for previously authorized work.

## 1. FIREFOX TESTING

The owner already has Firefox Developer Edition open.

Do not close, restart, or interfere with the owner's existing Firefox window, profile, tabs, authentication, or Crossroads studio.

You may launch and close a **separate automated Firefox Developer Edition instance using an isolated test profile**.

If you are currently using a separate Firefox instance for automation, continue doing so.

Do not use the owner's personal `local_admin` password for automated tests.

Create or repair a dedicated synthetic test administrator in an isolated development database.

Do not reset the owner's password again.

## 2. COMPLETE THE REMAINING TESTS

Finish Directive 028.

Resolve the stale credential fixture problem.

Use the established LaunchAgent-backed testing method to work around Wrangler `spawn EBADF`, ensuring test data is isolated from the owner's local D1 database.

Verify the two failing Directive 022 assertions through browser testing and repair outdated assertions where appropriate.

Complete:

- Firefox acceptance.
- Chromium acceptance.
- API E2E.
- Backup and restore.
- Production build.
- Asset integrity.
- Wrangler dry-run.
- Background request error classification.

Repair confirmed defects and rerun affected tests.

Do not mark unexecuted tests as passed.

## 3. COMMIT AND PUSH

The owner authorizes you to review and incorporate the existing 12 modified files and new verifier.

Once verified:

1. Commit the completed release.
2. Push to `codex/tpi-development`.
3. Confirm the remote commit matches the local commit.

Do not wait for another owner confirmation.

## 4. DEPLOY TO CLOUDFLARE

**The owner explicitly authorizes production deployment of the verified release.**

Before deployment, identify the currently deployed, healthy Worker version and confirm it can be restored.

The previously observed production version was:

`530d6f93-2a6a-4d6d-8441-b377b2062c14`

Do not assume it is still current.

Once critical release gates pass:

1. Execute the existing guarded Wrangler deployment workflow.
2. Confirm the new Worker version.
3. Perform non-destructive live acceptance testing.
4. Confirm StudioFlow and the rest of the website remain operational.
5. Roll back if a critical production regression is detected.

Do not alter the owner's Crossroads studio or production media.

## 5. AUTONOMOUS EXECUTION

Do not stop after investigating or planning.

Proceed through:

**FIX → TEST → COMMIT → PUSH → DEPLOY → VERIFY**

Resolve ordinary development and testing problems independently.

Only stop for an actual security boundary, unavailable permission, irreversible data operation, or critical release failure that cannot be safely resolved.

## 6. REQUIRED FINAL RESPONSE

Report:

- Tests passed and failed.
- Commit SHA.
- GitHub push confirmation.
- Cloudflare deployment confirmation.
- New production Worker version.
- Live acceptance results.
- Any remaining issues.

**The objective is a verified production release, not another investigation report.**

**END INSTRUCTION**
