# EXISTING LOCAL ADMINISTRATOR PASSWORD RECOVERY

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-18 13:27.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

=====================================================================
TPI-STUDIOFLOW-039
EXISTING LOCAL ADMINISTRATOR PASSWORD RECOVERY
=====================================================================

PROJECT:
The Paranormal Initiative

APPLICATION:
StudioFlow / Local Development Website

PRIORITY:
HIGH

ENVIRONMENT:
LOCAL DEVELOPMENT ONLY

PROJECT DIRECTORY:
/Users/toddknipple/Documents/GitHub/paranormal-initiative-website

=====================================================================
1. OBJECTIVE
=====================================================================

The owner needs to reset the password for the existing local
development account:

USERNAME: local_admin

The owner does not know the current password.

The existing reset utility was executed:

TPI_LOCAL_OWNER_CONTROL=1 node scripts/reset-local-master-admin.mjs

It returned:

"Local master credential reset aborted: that username is
already assigned to another local account"

This indicates the requested username conflicts with an existing
local account.

DO NOT delete, rename, merge, or replace any account.

Investigate the existing local_admin account and implement a safe,
targeted password-reset procedure if the account is verified.

=====================================================================
2. INVESTIGATE LOCAL AUTHENTICATION
=====================================================================

Inspect the existing local authentication implementation.

Determine:

1. Where local accounts are stored.
2. Which account currently owns the username local_admin.
3. Whether local_admin is an administrator account.
4. Whether the account is active.
5. Whether it uses the same password hashing mechanism as
   the current master administrator.
6. Whether a supported account-specific password-reset
   mechanism already exists.

Inspect the existing reset utility:

scripts/reset-local-master-admin.mjs

Determine why it rejects local_admin.

Do not modify credentials during this investigation.

Do not expose password hashes, session tokens, or secrets.

=====================================================================
3. ACCOUNT IDENTITY PROTECTION
=====================================================================

IMPORTANT:

The owner previously used the username todd_wayne.

The owner now needs access to the existing account local_admin.

DO NOT assume these accounts are interchangeable.

DO NOT:

- Merge accounts.
- Rename accounts.
- Delete accounts.
- Transfer account ownership.
- Change account roles.
- Replace the master administrator.
- Modify unrelated account credentials.

Verify that local_admin is an existing local account.

If account ownership or authorization cannot be established,
STOP and report the issue.

=====================================================================
4. IMPLEMENT TARGETED PASSWORD RESET
=====================================================================

If local_admin is verified as an existing local administrator,
provide a secure password-reset procedure for that account.

Prefer extending the existing reset utility with an explicit
target-account option rather than creating another independent
authentication system.

REQUIREMENTS:

1. Local development database only.
2. Explicit owner authorization required.
3. Exact username matching.
4. Verify the account exists.
5. Verify the account is eligible for password recovery.
6. Use the application's existing password hashing mechanism.
7. Prompt privately for the new password.
8. Require password confirmation.
9. Never print the password.
10. Never log password hashes.
11. Never write credentials into Git-tracked files.
12. Preserve account identity and role.
13. Modify only the targeted account's password credential.
14. Verify that exactly one intended account was updated.

If the existing utility cannot safely support targeted resets,
create a separate narrowly scoped local-only reset command.

Do not introduce authentication bypasses or hardcoded passwords.

=====================================================================
5. PRESERVE STUDIOFLOW DATA
=====================================================================

The owner's Studio is:

Crossroads of the Unknown

WORKSPACE ID:
43b20614-69da-4d82-af9d-063cace4b6cc

BROADCAST ID:
studio-0ec3848f-5500-462c-a1da-f711d3148d49

PRESERVE:

- Studio identity.
- Studio configuration.
- Scenes.
- Scene ordering.
- Intro video.
- Outro video.
- Background media.
- Logos.
- Audio.
- Recordings.
- Guest settings.
- Existing backups.
- Browser-local media.
- IndexedDB.
- Local D1 data.

Do not modify StudioFlow content as part of password recovery.

=====================================================================
6. TESTING
=====================================================================

Use a synthetic local database to test the password-reset logic.

Verify:

[ ] Existing account can be targeted.
[ ] Incorrect username is rejected.
[ ] Missing account is rejected.
[ ] Password confirmation is required.
[ ] Existing hashing mechanism is preserved.
[ ] Exactly one credential is updated.
[ ] Account ID remains unchanged.
[ ] Account role remains unchanged.
[ ] Other accounts remain unchanged.
[ ] Studio records remain unchanged.
[ ] No credentials appear in logs.
[ ] Temporary sensitive files are securely cleaned up.

After synthetic testing, provide the owner with the exact
command for the real local_admin password reset.

The owner must enter the password privately.

Do not invent or choose a password for the owner.

=====================================================================
7. MANDATORY SAFETY RESTRICTIONS
=====================================================================

PROHIBITED:

- Production access.
- Cloudflare deployment.
- Production database changes.
- Local D1 reset.
- Browser storage clearing.
- Account deletion.
- Account merging.
- Account renaming.
- Role modifications.
- Hardcoded passwords.
- Authentication bypasses.
- Owner Studio modifications.
- Media deletion.
- Recording deletion.
- Git commits.
- Git pushes.
- Discarding unrelated changes.

Preserve the current local development server configuration.

Do not modify the temporary guest tunnel.

=====================================================================
8. REQUIRED FINAL REPORT
=====================================================================

TPI-STUDIOFLOW-039 RESULT

STATUS:
COMPLETE / PARTIAL / BLOCKED

A. ACCOUNT IDENTIFICATION

Confirm whether local_admin exists and identify its role.

B. ROOT CAUSE

Explain why the previous reset utility rejected the username.

C. REPAIR

Describe the targeted password-reset mechanism.

D. TESTING

Report synthetic test results.

E. DATA PROTECTION

Confirm Crossroads of the Unknown and all other accounts
remain unchanged.

F. OWNER INSTRUCTIONS

Provide the exact Terminal command to reset the password
for local_admin.

Do not display or request the password in Codex chat.

=====================================================================
FINAL INSTRUCTION
=====================================================================

The owner needs access to the EXISTING local_admin account.

Do not replace it with another account.

Do not rename the master administrator.

Do not create duplicate accounts.

Implement a secure, local-only, account-specific password-reset
procedure that preserves all existing account identities and
StudioFlow data.

=====================================================================
END DIRECTIVE — TPI-STUDIOFLOW-039
=====================================================================
