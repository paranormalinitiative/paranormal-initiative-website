# TPI-STUDIOFLOW-017A — Live Browser Acceptance

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-17 16:39.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# TPI-STUDIOFLOW-017A
## Live Browser Verification and Acceptance

**Objective:** Complete live browser verification of TPI-STUDIOFLOW-017 without modifying production infrastructure.

### Authorization

You are authorized to start or restart the appropriate LOCAL development Worker required for StudioFlow testing.

This authorization does not extend to production Workers, deployments, database migrations, or unrelated processes.

### Required Actions

1. Identify the correct local StudioFlow development Worker and its configuration.
2. Determine why port 8787 refused connections.
3. Start or restart the appropriate local development Worker.
4. Confirm that StudioFlow loads successfully.
5. Open My Studios and select an existing Studio.
6. Verify that the selected Studio opens directly without displaying the StudioFlow home screen.
7. Make a test modification and switch to another Studio.
8. Verify that the original Studio saves successfully before switching.
9. Return to the original Studio and confirm the modification persisted.
10. Refresh the browser and verify that the last active Studio is restored.
11. Test save-failure protection without risking existing Studio data.
12. Confirm that production-lock protections remain functional.

### Restrictions

- Do not deploy to production.
- Do not commit or push.
- Do not modify unrelated files.
- Do not delete existing Studios or recordings.
- Do not modify production databases.
- Do not start recording or livestreaming.
- Preserve the existing dirty worktree.

### Completion Requirements

Report:

- Local Worker status.
- Browser verification results.
- Studio switching behavior.
- Automatic save verification.
- Last Studio restoration results.
- Any remaining failures.

**Acceptance:** TPI-STUDIOFLOW-017 may be marked complete only after successful live browser verification.

If authentication, configuration, or another blocker prevents testing, report the exact blocker rather than claiming acceptance.
