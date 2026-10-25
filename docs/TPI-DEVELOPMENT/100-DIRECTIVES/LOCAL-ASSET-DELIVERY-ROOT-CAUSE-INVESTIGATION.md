# LOCAL ASSET DELIVERY — ROOT CAUSE INVESTIGATION & REPAIR

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 14:49.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-046
LOCAL ASSET DELIVERY — ROOT CAUSE INVESTIGATION & REPAIR
=====================================================================

PROJECT:
The Paranormal Initiative — StudioFlow

DIRECTORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

ENVIRONMENT:
LOCAL DEVELOPMENT ONLY

AUTHORITY:
FULL AUTONOMOUS IMPLEMENTATION WITHIN PROJECT SAFETY BOUNDARIES

PRIORITY:
HIGH

=====================================================================
1. PROBLEM
=====================================================================

TPI-STUDIOFLOW-043 implemented:

- SHA-256 content-based asset versioning.
- Automatic local asset staging.
- File watching.
- Debounced updates.
- Atomic asset replacement.

Automated tests passed.

However, the owner reports that the cache-busting system
did not resolve the stale StudioFlow interface in Opera.

The actual cause remains unconfirmed.

Do not assume Opera caching is responsible.

Do not assume TPI-043 is functioning correctly merely
because its automated tests passed.

Investigate the real development delivery pipeline.

=====================================================================
2. OBJECTIVE
=====================================================================

Ensure changes made to StudioFlow's local JavaScript,
CSS, and HTML reliably appear in the existing Opera
development session.

The owner should not need to:

- Clear browser caches.
- Delete website data.
- Delete IndexedDB.
- Log out.
- Open private windows.
- Change browser origins.
- Restart unrelated services.
- Perform repeated hard refreshes.

A normal page reload should retrieve the current
StudioFlow application.

=====================================================================
3. TRACE THE COMPLETE ASSET PIPELINE
=====================================================================

Investigate:

SOURCE FILE
    |
    v
LOCAL ASSET WATCHER
    |
    v
STAGING PROCESS
    |
    v
.local-dev/assets
    |
    v
LOCAL CLOUDFLARE WORKER
    |
    v
HTTP RESPONSE
    |
    v
OPERA BROWSER
    |
    v
EXECUTED JAVASCRIPT / APPLIED CSS

Verify every stage independently.

Identify exactly where source changes stop propagating.

=====================================================================
4. SOURCE AND STAGING VERIFICATION
=====================================================================

Inspect:

scripts/local-dev.mjs

scripts/stage-local-assets.mjs

scripts/stage-local-studio-assets.mjs

scripts/studioflow-asset-version.mjs

studio/index.html

studio/assets/

.local-dev/assets/

worker.js

wrangler.local.toml

Determine:

1. Which directory Codex actually edits.
2. Which directory the watcher monitors.
3. Which directory the staging process copies.
4. Which directory the Worker serves.
5. Whether watcher events are missed.
6. Whether atomic replacement interrupts watching.
7. Whether old staged files survive updates.
8. Whether version hashes represent the served bytes.
9. Whether HTML references the correct asset versions.
10. Whether another process overwrites staged assets.

Do not modify owner media or database files.

=====================================================================
5. RUNNING PROCESS INVESTIGATION
=====================================================================

Identify the actual process listening on port 8787.

Determine:

- Which Worker configuration it uses.
- Its working directory.
- Its asset directory.
- Its startup command.
- Whether multiple local launchers exist.
- Whether an outdated Worker process remains active.
- Whether the LaunchAgent runs the current code.

Inspect existing process management before restarting.

Do not create duplicate development servers.

Do not kill unrelated processes.

=====================================================================
6. HTTP DELIVERY VERIFICATION
=====================================================================

Using authenticated, non-destructive local requests
where available, verify:

- StudioFlow HTML response.
- JavaScript response.
- CSS response.
- Versioned asset URLs.
- Content hashes.
- Cache-Control headers.
- ETag behavior.
- Service Worker interception, if present.
- Redirects.
- Asset MIME types.

Compare actual HTTP response bytes against the
intended staged asset bytes.

Do not bypass authentication.

Do not expose credentials.

Do not switch the owner's existing browser origin.

=====================================================================
7. OPERA VERIFICATION
=====================================================================

Investigate whether Opera is receiving and executing
the latest StudioFlow assets.

Where browser inspection is available:

- Inspect the actual loaded script URL.
- Inspect the actual loaded stylesheet URL.
- Compare loaded versions with staged versions.
- Inspect Network responses.
- Inspect active Service Workers.
- Verify whether the expected UI changes are present.

Use read-only inspection of the owner's existing session.

Do not clear Opera storage.

Do not delete cookies.

Do not reset IndexedDB.

Do not disable existing browser protections.

If direct Opera inspection is unavailable, explicitly
report that limitation.

Do not substitute synthetic tests for proof of live
Opera behavior.

=====================================================================
8. CONTROLLED REPRODUCTION
=====================================================================

Create a harmless, isolated development fixture.

Modify the fixture source.

Verify that:

1. The watcher detects the change.
2. The staging process updates the correct file.
3. The asset version changes.
4. The Worker serves the updated bytes.
5. A browser reload retrieves the updated asset.
6. The browser executes or applies the updated content.

Repeat for:

- JavaScript.
- CSS.
- HTML.

Do not make destructive test changes to the owner's
actual Studio configuration.

Do not leave test markers in production assets.

=====================================================================
9. IMPLEMENT PERMANENT REPAIR
=====================================================================

Once the failure is identified, implement the
smallest reliable correction.

Possible areas include:

- Watcher reliability.
- Staging synchronization.
- Asset path resolution.
- Worker asset routing.
- HTML shell versioning.
- Local process lifecycle.
- Browser asset invalidation.

Do not add random query strings as a workaround.

Do not add unnecessary background services.

Do not redesign StudioFlow.

Do not modify production caching.

The fix must address the confirmed failure.

=====================================================================
10. AUTOMATED REGRESSION PROTECTION
=====================================================================

Add tests that verify the complete local delivery chain.

Tests must catch cases where:

- Source changes but staging does not.
- Staging changes but the Worker serves old bytes.
- HTML references obsolete versions.
- JavaScript and CSS versions do not match served bytes.
- A normal reload receives outdated assets.

Use isolated fixtures.

Do not modify owner data.

=====================================================================
11. DATA PROTECTION
=====================================================================

PRESERVE:

Crossroads of the Unknown

WORKSPACE:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

DO NOT MODIFY:

- Studio scenes.
- Backgrounds.
- Motion backgrounds.
- Intro/outro.
- Recordings.
- Browser IndexedDB.
- Local D1.
- Authentication credentials.
- Backup settings.

=====================================================================
12. AUTHORITY
=====================================================================

Codex may autonomously:

- Inspect source files.
- Inspect local processes.
- Run local diagnostics.
- Modify development scripts.
- Correct asset staging.
- Repair local Worker routing.
- Restart the existing local development service.
- Add regression tests.
- Perform isolated browser verification.

No additional approval is needed for routine work
within this directive.

Do not perform production operations.

Do not change the temporary guest tunnel.

Do not commit or push.

=====================================================================
13. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-046 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. CONFIRMED ROOT CAUSE

Identify the precise failure.

B. DELIVERY PIPELINE

Report source, staging, Worker, and browser findings.

C. REPAIR

Explain what was changed and why.

D. LIVE ASSET VERIFICATION

Provide actual content-hash comparisons.

E. OPERA VERIFICATION

Confirm whether Opera executes the current assets.

F. TEST RESULTS

Provide regression test results.

G. FILES MODIFIED

List all changes.

H. DATA PROTECTION

Confirm owner data remains intact.

I. REMAINING LIMITATIONS

Report anything that could not be verified.

=====================================================================
FINAL INSTRUCTION
=====================================================================

Do not declare success based only on source-level tests.

The objective is to make the current StudioFlow changes
reliably appear in the owner's existing Opera session.

Find the actual cause and repair it.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-046
=====================================================================
