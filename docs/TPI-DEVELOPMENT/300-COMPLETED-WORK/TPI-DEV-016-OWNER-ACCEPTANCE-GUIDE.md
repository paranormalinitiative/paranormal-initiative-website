# TPI-DEV-016 — Owner Acceptance Guide

Status: **PENDING PRIVILEGED BROWSER SESSION**

This guide is for the development site only. It contains no passwords.

## Development access

Open:

`https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/member-login`

Use only the approved synthetic development identities from the existing
credential store. Do not use a real member password in a shared or unattended
browser.

## Administration Center

Open:

`https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/admin-center-preview/`

With the synthetic administrator or owner session, verify the dashboard,
sidebar, Members, Creators, Founding 50, Creator Studio access, Contributors,
content queues, reports, settings, and audit views. Confirm that disabled
mutations explain their locked state and that the Founding 50 activation gate
remains disabled.

## Creator Partnership review

From Administration Center, open the Creator/Founding 50 area. Confirm that
capacity counts distinguish allocations, active/revoked memberships, pending
applications, associated accounts, and readiness. Open an existing synthetic
application and confirm applicant, social, video, website, description, status,
history, account association, and review-note areas. Do not approve, activate,
invite, email, or mutate synthetic records during this acceptance pass.

## Creator Studio

Open:

`https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/studio/`

Use the authorized synthetic creator session. Confirm the Studio navigation,
identity, dashboard, project controls, and ownership boundaries. Then repeat
with an ordinary member, contributor without entitlement, and revoked creator;
those sessions must not receive Creator Studio access.

## Member and contributor restrictions

An ordinary member should see ordinary member navigation but no Administration
Center, Creator Studio, or contributor-management controls. A contributor may
see only the authorized contributor tools. Direct protected URLs must still be
denied by the server even when a navigation link is hidden.

## Responsive acceptance

Repeat the checks at:

- Desktop: 1280×800, 1440×900, 1920×1080.
- Mobile: 375×812, 390×844, 430×932.

Check scrolling, tables, dialogs, form controls, visible focus, error messages,
touch targets, loading states, and absence of horizontal overflow.

## Still locked

Founding 50 allocation, activation, suspension, revocation, reactivation, and
entitlement mutations must remain fail-closed while
`FOUNDING50_DEVELOPMENT_ACTIVATION` is disabled. The expected locked response
for the tested mutation paths is HTTP 423.

## Acceptance outcome

TPI-DEV-016 is not complete until the privileged browser matrix is executed and
the results are recorded in the TPI-DEV-016 audit and implementation report.
