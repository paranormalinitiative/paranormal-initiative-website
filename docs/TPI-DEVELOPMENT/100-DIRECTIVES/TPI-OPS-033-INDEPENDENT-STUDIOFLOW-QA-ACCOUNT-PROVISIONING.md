# TPI-OPS-033 — Independent StudioFlow QA Account Provisioning

> **Archived original directive — verbatim.**
> Source: TPI owner directive conversation ("The Paranormal Initiative" GPT,
> [shared thread](https://chatgpt.com/share/6ade378a-5b54-83e9-bc22-5b1709b51c19)).
> Issued: 2026-10-22 11:06.
> Archived: 2026-10-25 under the
> [TPI Permanent Directive Archiving Standard](TPI-PERMANENT-DIRECTIVE-ARCHIVING-STANDARD.md).
> Original text is preserved below without edits.

**Related completion records:** none located
**Previously archived variant(s):** none

---

# THE PARANORMAL INITIATIVE
## TPI-OPS-033
### INDEPENDENT STUDIOFLOW QA ACCOUNT PROVISIONING

**PRIORITY: CRITICAL**

**ASSIGNED TO:** FreeBuff

**OWNER AUTHORIZATION: GRANTED FOR DESIGN AND IMPLEMENTATION**

### 1. OBJECTIVE

Establish a secure, independent procedure for provisioning synthetic StudioFlow acceptance-test accounts.

The testing system must not depend on:

- The owner's personal administrator account.
- Founding 50 membership.
- Public registration.
- Existing production member credentials.
- Manual password resets.

### 2. PRESERVE FOUNDING 50

The Founding 50 production activation gate must remain unchanged.

Do not enable:

`FOUNDING50_PRODUCTION_ACTIVATION`

Do not modify the Founding 50 award process.

Do not create Founding 50 memberships for testing purposes.

StudioFlow QA access must be independent of this program.

### 3. INVESTIGATE THE EXISTING ENTITLEMENT SYSTEM

Inspect:

- `creator_studio_entitlements`
- Existing StudioFlow authorization checks.
- Contributor account creation.
- Administrative account-management procedures.
- Session handling.
- Existing database constraints.

Determine the safest supported way to create a dedicated QA account with StudioFlow access.

Prefer existing application mechanisms where possible.

### 4. IMPLEMENT A RESTRICTED QA PROVISIONING PROCEDURE

Create an explicit, auditable, owner-controlled procedure for synthetic StudioFlow test accounts.

Requirements:

- Separate from Founding 50.
- Disabled by default for general users.
- Restricted to authorized administrative execution.
- No public entitlement-granting endpoint.
- No authentication bypass.
- No hardcoded credentials.
- No production secrets in source control.
- No modification of existing member accounts.
- No access to other users' studios.

Use the existing entitlement schema where appropriate, but preserve its integrity and business rules.

If schema changes are required, use a reviewed, non-destructive migration.

### 5. ACCOUNT LIFECYCLE

The procedure must support:

1. Creating a synthetic QA account.
2. Granting the minimum StudioFlow entitlement required.
3. Authenticating through the normal login process.
4. Running isolated acceptance tests.
5. Revoking the entitlement.
6. Disabling or deleting only the synthetic account through a verified safe procedure.

All actions must be auditable.

### 6. TESTING

Verify:

- Ordinary members remain restricted.
- QA accounts can access StudioFlow.
- QA accounts cannot access other users' studios.
- Founding 50 remains gated.
- Invalid credentials are rejected.
- Entitlement revocation removes StudioFlow access.
- Existing production accounts remain unaffected.

Run these tests against isolated development or staging data before any production provisioning.

### 7. GIT AND DEPLOYMENT

Once implementation and critical tests pass:

- Commit the changes.
- Push to the approved branch.
- Deploy through the existing guarded Cloudflare workflow.
- Verify production access restrictions remain intact.

Do not perform production account creation until the procedure has been verified.

### 8. PRODUCTION ACCEPTANCE

After the secure provisioning procedure is deployed and verified, create one dedicated synthetic QA account using that procedure.

Use it for non-destructive authenticated production acceptance.

Do not access or modify Crossroads of the Unknown or any existing owner data.

### 9. FINAL REPORT

Report:

1. Provisioning procedure implemented.
2. Security controls.
3. Founding 50 isolation.
4. Tests completed.
5. Git commit.
6. Deployment version.
7. Synthetic account provisioning result.
8. Authenticated StudioFlow acceptance results.
9. Working-tree status.

**FINAL OBJECTIVE:**

Provide a permanent, secure way to test StudioFlow in production without using owner credentials or interfering with Founding 50.

**END DIRECTIVE — TPI-OPS-033**
