# TPI-STUDIOFLOW-026 — Addendum A: Development Administrator Authentication

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 01:03.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** [TPI-STUDIOFLOW-026-ADDENDUM-A-LOCAL-ADMIN.md](TPI-STUDIOFLOW-026-ADDENDUM-A-LOCAL-ADMIN.md)

---

# TPI-STUDIOFLOW-026 — ADDENDUM A
## PERMANENT DEVELOPMENT ADMINISTRATOR AUTHENTICATION REPAIR

**PRIORITY: CRITICAL**

**ASSIGNED TO:** FreeBuff — GPT-6 Luna

### OBJECTIVE

Permanently repair development-site authentication so the owner's existing `local_admin` account can reliably log in.

This is a recurring problem and must be resolved at the architectural and environment-configuration level.

The owner must not have to repeatedly recreate administrator accounts or reset passwords after development changes.

### 1. INVESTIGATE THE EXISTING AUTHENTICATION SYSTEM

Identify:

- Where the development administrator account is stored.
- Which database the development site uses.
- How administrator passwords are hashed and verified.
- How development sessions and authentication cookies work.
- Whether the local development server uses persistent or disposable database storage.
- Whether restarting Wrangler changes the authentication database.
- Whether development database seeding overwrites administrator credentials.
- Whether development and production authentication configurations are being confused.

Determine the actual cause of the recurring login failures.

Do not assume the password is incorrect.

### 2. ESTABLISH A RELIABLE DEVELOPMENT ADMINISTRATOR

Ensure the existing development account:

`local_admin`

remains available across:

- Development server restarts.
- Application rebuilds.
- Git commits and pulls.
- StudioFlow updates.
- Local Worker restarts.
- Test execution.
- Normal development database initialization.

Preserve the owner's existing password wherever possible.

If credentials must be reset, provide a secure reset procedure that allows the owner to establish a new password privately.

**Never display, log, commit, or hardcode the password.**

### 3. SEPARATE DEVELOPMENT AND TEST DATABASES

Ensure that:

- The normal development administrator uses persistent development storage.
- Automated tests use isolated disposable databases.
- Test fixtures cannot overwrite the development administrator.
- Database seeding is idempotent and does not reset existing passwords.
- Production authentication data remains completely separate.

Never copy production passwords or authentication secrets into development.

### 4. FIX SESSION AND COOKIE HANDLING

Verify that authentication works correctly when:

- Logging in.
- Refreshing the page.
- Navigating to StudioFlow.
- Returning to the Admin Panel.
- Restarting the development server.
- Reopening the browser.

Check for incorrect cookie domains, ports, secure-cookie settings, session signing keys, and inconsistent development URLs.

Preserve normal authentication security.

Do not disable password verification or introduce authentication bypasses.

### 5. ADD PERMANENT LOGIN REGRESSION TESTS

Create automated tests confirming that:

1. The development administrator exists.
2. The correct password authenticates.
3. Incorrect passwords are rejected.
4. Authenticated sessions work.
5. Restarting the development server does not erase the account.
6. Rebuilding StudioFlow does not affect authentication.
7. Running automated tests does not modify the persistent development administrator.
8. Production and development authentication remain isolated.

Use temporary test credentials for automated verification.

Do not place the owner's real password in test fixtures.

### 6. PROVIDE A RELIABLE RECOVERY PROCEDURE

Document a secure, repeatable administrator recovery process.

If the development administrator becomes inaccessible, FreeBuff must be able to diagnose and repair the account without deleting the development database or disturbing other users.

The procedure must preserve existing development data.

### 7. FINAL ACCEPTANCE

This task is complete only when:

- The `local_admin` account is available.
- The owner can successfully authenticate using their established credentials, or securely reset them if necessary.
- Login survives normal development restarts.
- StudioFlow and Admin Panel access work.
- Automated tests cannot overwrite the account.
- Production authentication remains unaffected.
- Authentication regression tests pass.

**Do not report completion based solely on confirming that the account exists.**

Actual successful authentication must be verified.

If final verification requires the owner's private password, request that the owner perform the login rather than disclose the password.

### FINAL INSTRUCTION

Make development administrator authentication reliable and persistent.

Fix the cause, not the symptom.

**END ADDENDUM A**
