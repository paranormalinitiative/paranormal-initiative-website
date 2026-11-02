# Security and Permissions

## Current boundary

The existing Worker and production domain remain protected. The audit did not request credentials, cookies, or tokens and did not bypass authentication. Anonymous authenticated-feature acceptance is therefore not claimed.

Because the current workers.dev target maps to the same configured Worker and stateful bindings, development authentication cannot yet be considered independent. Treat session validation, cookies, APIs, and administrative permissions as production-sensitive until a separate environment is configured.

## Required checks for an isolated environment

- Separate cookie/session namespace and authentication configuration.
- Server-side authorization on every administrative API.
- Protected preview assets and direct URLs.
- No stream keys, private recordings, private messages, or tokens in logs or client payloads.
- Synthetic test accounts and fixtures.
- Explicit owner approval before granting new permissions or implementing new administrative roles.

Development authentication uses the separate development D1 session store, host-scoped `tpi_session` cookies without a Domain attribute, and development-only `tpi-dev-owner` / `tpi-dev-member` accounts. The current auth implementation uses random database-backed session tokens rather than a signing secret. Production credentials, cookies, private member data, and secrets were not copied into development. The development config has no Resend secrets and sets `TPI_DISABLE_OUTBOUND=1`.

Runtime checks passed: anonymous Admin Center access returned 403; the development owner logged in and received Admin Center/API access; the ordinary development member logged in but remained denied from Admin Center; `.dev.vars` and temporary deployment config probes returned 404.

## Current role policy

Future Owner, Assistant Administrator, and Moderator roles remain planning items. TPI-DEV-001 does not change role assignments or permissions.

## Membership entitlements and administrative permissions (recorded 2026-11-02)

Recorded by TPI-DOCS-ROADMAP-001. Planning only — no role, permission, or
membership behaviour changed.

**Membership entitlements and administrative permissions are separate.** Holding
a membership grants product capability; it does not grant administrative
authority over the site, other accounts, or the Education Center.

### Product access model

| Membership | Receives |
|---|---|
| Creator | Creator capabilities, StudioFlow access, StudioFlow Nova Edit, production-oriented document and presentation creation |
| Contributor / Editorial member | Nova Editorial Workspace, professional document and presentation capability, Education Center workflow appropriate to editorial permissions |
| Dual / All-Access | both of the above through one account |

**Cumulative entitlements are mandatory.** A dual account must hold Creator and
Contributor capability sets simultaneously. One membership must never overwrite
another, and combining access must not silently drop either set. This is a
permanent regression requirement for the Creator Incentive System work.

### Education Center permission layers

Nova access and publishing authority are not identical. The layers to evaluate
are: **Author** (create professional content), **Submitter** (submit for
Education Center consideration), **Editor** (review/edit authorized educational
content), **Publisher** (publish/unpublish official Education Center material),
and **Administrator** (manage broader editorial permissions and configuration).

A Dual / All-Access member receives Creator and Contributor capabilities. That
does not automatically grant unrestricted administrative authority over every
live Education Center item.

Every administrative and editorial API must continue to enforce authorization
server-side. No entitlement change may be implemented from client-side state
alone.
