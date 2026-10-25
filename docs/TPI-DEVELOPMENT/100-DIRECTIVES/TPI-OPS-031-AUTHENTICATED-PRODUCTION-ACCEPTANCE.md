# TPI-OPS-031 — Authenticated Production Acceptance

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 10:58.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
## TPI-OPS-031
### FINAL AUTHENTICATED PRODUCTION ACCEPTANCE

**PRIORITY: HIGH — COMPLETE CURRENT RELEASE**

**ASSIGNED TO:** FreeBuff

**OWNER AUTHORIZATION: GRANTED**

### OBJECTIVE

Complete the remaining authenticated production acceptance checks for the StudioFlow release deployed on October 22, 2026.

Expected production Worker version:

`7c5ea692-e2e9-41f1-9b34-651230e03997`

Verify the current deployed version before testing.

### 1. PRODUCTION TEST AUTHORIZATION

The owner authorizes authenticated, non-destructive production verification.

Use a dedicated synthetic test account with only the permissions necessary for the checks.

Do not use the owner's personal administrator credentials.

Do not modify existing production users, studios, media, or databases.

If a suitable test account does not exist, use the established safe account-provisioning procedure. Do not bypass authentication or introduce permanent test credentials.

### 2. VERIFY ACCESS CONTROL

The public `/studio/` route currently returns HTTP 403 to non-entitled visitors.

This is intentional.

Verify that:

- Unauthorized visitors remain restricted.
- Authorized users can access StudioFlow.
- Authentication redirects work.
- Sessions remain valid.
- StudioFlow loads correctly for entitled accounts.

Do not remove the production access restriction.

### 3. AUTHENTICATED STUDIOFLOW ACCEPTANCE

Using the synthetic account, verify:

- StudioFlow loads.
- Navigation works.
- Studio selection works.
- Existing functionality is available.
- Video Clip controls render.
- Timer controls render.
- Sounds render.
- Background Music renders.
- Motion Backgrounds render.
- Backup controls are accessible.
- Browser console has no critical application errors.

Use read-only interactions wherever possible.

If disposable test data is required, create only explicitly isolated test records and remove only those records after verification.

### 4. PROTECT OWNER DATA

Do not access, edit, overwrite, or delete the owner's Crossroads of the Unknown studio.

Do not perform destructive media operations.

Do not run production database resets, seeds, or migrations.

Do not modify production secrets.

### 5. VERIFY RELEASE TRACEABILITY

Confirm:

- Production Worker version.
- Release commit `db7e1c5`.
- Documentation commit `065b480`.
- Current GitHub branch.
- Clean working tree.
- Rollback readiness.

Update the existing release status document with the actual acceptance results.

### 6. FINAL REPORT

Report:

1. Authenticated access result.
2. StudioFlow loading result.
3. Feature availability.
4. Browser console findings.
5. Production Worker version.
6. GitHub status.
7. Remaining limitations.
8. Whether the release qualifies for STATE A.

Do not claim that editing, media persistence, or backup restoration passed unless those operations were actually tested.

If a required test cannot be performed safely, identify it as NOT TESTED rather than treating it as passed.

### FINAL OBJECTIVE

Complete production acceptance and establish the verified release status.

**END DIRECTIVE — TPI-OPS-031**
