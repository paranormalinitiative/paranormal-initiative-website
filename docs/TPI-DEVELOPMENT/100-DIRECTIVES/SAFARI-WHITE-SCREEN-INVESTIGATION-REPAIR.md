# SAFARI WHITE SCREEN INVESTIGATION & REPAIR

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 13:39.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-037
SAFARI WHITE SCREEN INVESTIGATION & REPAIR
=====================================================================

PROJECT: The Paranormal Initiative
APPLICATION: StudioFlow / TPI Development Website
PRIORITY: HIGH
ENVIRONMENT: LOCAL DEVELOPMENT ONLY
STATUS: AUTHORIZED FOR INVESTIGATION AND SAFE REPAIR

PROJECT DIRECTORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

=====================================================================
1. OBJECTIVE
=====================================================================

Investigate and permanently resolve the Safari white-screen problem
affecting The Paranormal Initiative's local development website.

CURRENT BEHAVIOR:

Google Chrome successfully opens the local development website.

Safari connects to the local development server and proceeds through
login, but displays a completely white screen at:

http://localhost:8787/member-home?username=todd_wayne

Opening StudioFlow directly also produces a white screen:

http://localhost:8787/studio/

Safari previously experienced connection problems when using
127.0.0.1, while localhost successfully connected.

PRIMARY OBJECTIVE:

Restore reliable Safari access to the development website,
Member Home, and StudioFlow without disrupting Chrome, Opera,
or existing StudioFlow data.

DO NOT rebuild the development environment.
DO NOT migrate development to Cloudflare.
DO NOT change hosting architecture.

=====================================================================
2. PHASE ONE — IDENTIFY THE ACTUAL FAILURE
=====================================================================

Before modifying application code:

1. Verify the local development Worker is responding on port 8787.
2. Confirm Chrome continues to access the website successfully.
3. Investigate Safari's Member Home loading process.
4. Investigate Safari's StudioFlow loading process.
5. Inspect Safari JavaScript errors where browser access permits.
6. Inspect failed network requests.
7. Check for uncaught initialization exceptions.
8. Compare Safari and Chrome HTTP responses.

Investigate:

- JavaScript compatibility.
- Unsupported browser APIs.
- Module loading failures.
- Authentication and session handling.
- Cookie restrictions.
- LocalStorage access.
- IndexedDB initialization.
- Content Security Policy.
- Redirect loops.
- Incorrect asset paths.
- Safari rendering failures.

Do not assume HTTP 200 means the application rendered correctly.

If Safari cannot be inspected directly, clearly report that limitation.

=====================================================================
3. PHASE TWO — LOCALHOST ORIGIN INVESTIGATION
=====================================================================

Investigate the differences between:

http://localhost:8787/

AND

http://127.0.0.1:8787/

Check:

- Authentication cookies.
- Cookie domain and path.
- SameSite behavior.
- Session persistence.
- Login redirects.
- LocalStorage keys.
- IndexedDB availability.
- Origin-dependent configuration.

These are separate browser origins.

Do not merge, reset, overwrite, or delete existing browser storage.

Determine whether Safari's white screen results from missing
session state, failed initialization, or browser compatibility.

=====================================================================
4. PHASE THREE — MEMBER HOME INVESTIGATION
=====================================================================

Investigate:

/member-home?username=todd_wayne

Trace:

LOGIN
  |
  v
AUTHENTICATION
  |
  v
SESSION CREATION
  |
  v
MEMBER HOME REDIRECT
  |
  v
PAGE INITIALIZATION
  |
  v
RENDERING

Identify the exact failure point.

Verify:

- Route exists.
- Correct HTML is returned.
- Required scripts load.
- Authentication is recognized.
- Initialization completes.
- Safari supports required JavaScript.
- No redirect loop occurs.

Do not reset credentials.

Do not expose passwords, tokens, or session secrets.

=====================================================================
5. PHASE FOUR — STUDIOFLOW INVESTIGATION
=====================================================================

Investigate:

http://localhost:8787/studio/

Determine whether StudioFlow fails because of:

- Authentication dependencies.
- Member Home initialization.
- Missing browser-specific configuration.
- Unsupported Safari APIs.
- IndexedDB exceptions.
- Missing media references.
- Failed module imports.
- JavaScript initialization errors.

IMPORTANT:

StudioFlow must not display a blank white screen simply because
an optional browser capability or media asset is unavailable.

Where appropriate, implement graceful error handling.

Never overwrite an existing Studio configuration because browser-local
media cannot be loaded.

=====================================================================
6. PHASE FIVE — PROTECT CROSSROADS OF THE UNKNOWN
=====================================================================

OWNER STUDIO:
Crossroads of the Unknown

WORKSPACE ID:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST ID:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

PRESERVE:

- Studio identity.
- Workspace ID.
- Broadcast ID.
- Scenes and scene ordering.
- Intro video.
- Outro video.
- Background media.
- Logos and branding.
- Audio references.
- Guest settings.
- Recording references.
- Existing backups.

Safari does not automatically share Opera's or Chrome's IndexedDB.

Do not assume media stored in another browser is available in Safari.

Do not automatically replace missing media.
Do not remove existing media references.
Do not overwrite owner Studio data.
Do not activate automatic backups without authorization.

=====================================================================
7. PHASE SIX — APPLY THE SMALLEST SAFE REPAIR
=====================================================================

After identifying the confirmed root cause:

1. Document the failure.
2. Identify the responsible files and functions.
3. Apply the smallest necessary correction.
4. Preserve Chrome functionality.
5. Preserve Opera functionality.
6. Preserve authentication security.
7. Preserve local database contents.
8. Avoid additional startup services.
9. Avoid unnecessary architecture changes.

Do not implement speculative fixes.

Do not rewrite the authentication system without verified necessity.

=====================================================================
8. PHASE SEVEN — TESTING
=====================================================================

REQUIRED TESTS:

[ ] Local Worker responds on port 8787.
[ ] Chrome homepage loads.
[ ] Chrome Member Home loads.
[ ] Chrome StudioFlow loads.
[ ] Safari homepage loads.
[ ] Safari login succeeds.
[ ] Safari Member Home renders.
[ ] Safari StudioFlow renders.
[ ] Missing browser-local media does not corrupt Studio data.
[ ] Authentication remains secure.
[ ] Existing Studio configuration remains unchanged.
[ ] Existing local D1 data remains intact.
[ ] No production Cloudflare traffic is generated.

Use synthetic accounts and Studios for write-based testing.

Do not modify the owner's existing Studio during verification.

If direct Safari testing is unavailable, report:

NOT YET VERIFIED IN SAFARI

Do not claim successful Safari verification based solely on
automated source checks or Chrome testing.

=====================================================================
9. MANDATORY SAFETY RESTRICTIONS
=====================================================================

ABSOLUTELY PROHIBITED:

- Production deployment.
- Cloudflare production requests.
- Cloudflare database modifications.
- Local D1 reset.
- Clearing Safari website data.
- Clearing Chrome website data.
- Clearing Opera website data.
- Deleting IndexedDB databases.
- Deleting recordings or media.
- Deleting Crossroads of the Unknown.
- Overwriting owner Studio configurations.
- Changing master administrator credentials.
- Disabling authentication.
- Bypassing authorization.
- Creating unnecessary development services.
- Modifying the temporary guest tunnel.
- Git commits.
- Git pushes.
- Discarding unrelated working-tree changes.

All work must remain local.

Preserve the existing automatic development server startup system
unless a verified defect requires a minimal correction.

=====================================================================
10. REQUIRED FINAL REPORT
=====================================================================

Provide:

TPI-STUDIOFLOW-037 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. ROOT CAUSE
Explain precisely why Safari displayed a white screen.

B. BROWSER DIFFERENCES
Explain why Chrome worked while Safari failed.

C. REPAIRS
List modified files and corrections.

D. VERIFICATION
Report actual tests and distinguish automated verification
from real Safari browser testing.

E. DATA PROTECTION
Confirm Crossroads, local D1, browser storage, and media
were preserved.

F. REMAINING ISSUES
Identify unresolved problems.

G. OWNER INSTRUCTIONS
Provide exact local addresses without tracking parameters:

http://localhost:8787/

http://localhost:8787/studio/

=====================================================================
FINAL INSTRUCTION
=====================================================================

The local development website already works in Google Chrome.

Your responsibility is to identify why Safari fails to render
Member Home and StudioFlow, repair the confirmed defect,
and restore reliable Safari access.

Do not redesign StudioFlow.
Do not rebuild the development environment.
Do not move development to Cloudflare.

Protect all existing owner-created content.

Do not declare the task complete until the root cause is identified
and the repair is verified.

If Safari cannot be directly tested, clearly report the remaining
verification requirement.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-037
=====================================================================
