# TPI-OPS-032 — Production Test Account Recovery and StudioFlow Entitlement

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 11:04.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# TPI-OPS-032
## PRODUCTION TEST ACCOUNT RECOVERY AND ENTITLEMENT VERIFICATION

**PRIORITY: HIGH**

FreeBuff, the production release is deployed. The remaining task is authenticated production acceptance.

Do not repeat the deployment process unnecessarily.

### 1. INVESTIGATE EXISTING TEST ACCOUNTS

Production documentation identifies two owner-authorized accounts:

- TPI Acceptance Test A
- TPI Acceptance Test B

Determine whether these accounts still exist and whether they have active StudioFlow entitlements.

Inspect the existing account-management and entitlement-management code.

Do not print, expose, or modify existing credentials.

### 2. IDENTIFY THE SUPPORTED ADMINISTRATIVE PATH

Investigate how the application normally grants access through:

`creator_studio_entitlements`

Determine whether the existing Admin Panel, invitation system, or account-management API supports granting StudioFlow access.

Do not assume that directly inserting an entitlement row is the correct procedure.

Prefer the application's established administrative workflow.

### 3. ACCOUNT RECOVERY

If an existing test account can be recovered through a supported administrative procedure, document the steps.

Do not reset an existing account's password without explicit authorization.

If recovery is unavailable, determine the minimum safe procedure for creating a dedicated acceptance account and granting StudioFlow access.

### 4. PRODUCTION DATA PROTECTION

Do not modify:

- The owner's administrator account.
- Crossroads of the Unknown.
- Existing studios or media.
- Production authentication secrets.
- Unrelated member accounts.

Any production write must be limited to an explicitly authorized synthetic account and its required entitlement.

### 5. COMPLETE ACCEPTANCE

Once an authorized test account is available:

- Verify authenticated StudioFlow access.
- Verify the production access restrictions.
- Verify interface functionality.
- Check browser errors.
- Confirm the deployed Worker version.
- Update the existing release status document.

Keep tests non-destructive unless separate authorization is provided.

### 6. FINAL REPORT

Identify:

1. Whether Test A and B exist.
2. Whether their StudioFlow entitlements are active.
3. The supported entitlement-granting procedure.
4. Whether account recovery is possible.
5. What owner action, if any, is required.
6. Authenticated production acceptance results.

**Do not create duplicate test accounts unnecessarily.**

**END DIRECTIVE**
