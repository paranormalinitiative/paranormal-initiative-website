# TPI-STUDIOFLOW-071 — EXISTING LIVE GUEST INTEGRATION VERIFICATION

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: unknown date.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
THE PARANORMAL INITIATIVE
DIRECTIVE: TPI-STUDIOFLOW-071
EXISTING LIVE GUEST INTEGRATION VERIFICATION
=====================================================================

PRIORITY: CRITICAL
ACTIVE MISSION: STUDIOFLOW PRODUCTION RELEASE

OWNER CONFIRMATION:
StudioFlow already supports live guests.

Do not treat live guest functionality as a missing
feature requiring new development.

OBJECTIVE:
Identify and verify the existing live guest integration
and determine why the isolated release candidate
cannot complete guest acceptance.

AUTHORITATIVE CANDIDATE:
/Users/toddknipple/Documents/GitHub/
tpi-studioflow-release-candidate

AUTHORITATIVE STUDIOFLOW SOURCE:
/Users/toddknipple/Documents/StudioFlow/web

TASK 1 — TRACE EXISTING GUEST FUNCTIONALITY

Inspect the existing implementation.

Identify:

- RealtimeKit integration.
- Room creation.
- Guest invitations.
- Guest access.
- Guest admission.
- Guest removal.
- Room closure.
- Camera and microphone integration.
- Relevant API routes.
- Environment variable names.
- Guest gateway dependencies.

Determine which components are implemented,
which have been verified, and which remain untested.

TASK 2 — CONFIGURATION INVESTIGATION

Inspect configuration structure and variable names
in the existing local development environments.

Do not display, copy, or export secret values.

Determine whether required RealtimeKit variables
are configured in an existing environment.

Identify why the isolated release candidate
cannot access its required test configuration.

Do not assume missing disposable credentials
means the production integration is absent.

Do not access production secrets or services.

TASK 3 — COMPARE SOURCE AND RELEASE CANDIDATE

Compare existing live guest implementation
against the isolated release candidate.

Identify:

- Missing guest-related files.
- Missing API routes.
- Missing Worker configuration.
- Missing environment bindings.
- Missing gateway dependencies.
- Incorrect guest URLs.
- Differences introduced during extraction.

Do not modify the authoritative StudioFlow source.

TASK 4 — SAFE TEST STRATEGY

Determine whether live guest acceptance can be
performed using an existing isolated test setup.

Do not use production credentials without
separate owner authorization.

Do not create or modify production rooms.

If an isolated test environment is unavailable,
identify exactly what must be provisioned.

Do not repeat blocked tests without resolving
their prerequisites.

TASK 5 — RELEASE CANDIDATE REVIEW

Perform final hunk-level review of:

functions/api/[[path]].js
worker.js
lib/auth.js

Verify StudioFlow changes remain isolated.

Identify any remaining unrelated changes.

Do not stage or commit.

TASK 6 — VERIFICATION

Run available local guest integration contracts,
authentication tests, Worker routing tests,
and StudioFlow regressions.

Report actual pass/fail results.

Do not substitute mocks for verified live connections.

TASK 7 — DOCUMENTATION

Create:

docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/
TPI-STUDIOFLOW-071-RESULT.md

Update the directive index and current
development status.

Do not reorganize unrelated development documents.

STRICT PROHIBITIONS:

- No production deployment.
- No production migration.
- No Git staging, commit, or push.
- No production credential access.
- No modification of owner workspaces.
- No modification of owner recordings.
- No changes to unrelated website systems.

REQUIRED RESULT:

A. EXISTING LIVE GUEST ARCHITECTURE
B. CURRENT REALTIMEKIT INTEGRATION
C. CONFIGURATION FINDINGS
D. SOURCE/CANDIDATE DIFFERENCES
E. GUEST ACCEPTANCE REQUIREMENTS
F. SHARED BACKEND REVIEW
G. REGRESSION RESULTS
H. REMAINING BLOCKERS
I. NEXT RECOMMENDED ACTION

END DIRECTIVE — TPI-STUDIOFLOW-071
