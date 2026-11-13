# TPI-OPS-017 — Education Center Banner

Date: 2026-11-13
Status: **DEPLOYED AND LIVE VERIFIED — 2026-11-13**

## Change

Added the owner-provided Education Center banner at
`assets/education-center-banner.png` and placed it above the Education Center
introductory copy. It scales to the available content width while preserving
the artwork's full 3:1 composition, including on phone-sized screens.

## Verification

The isolated Firefox Developer Edition Education Center suite passed 31/31 on
both the official local Worker and production. The banner loaded at its expected
2172 x 724 source dimensions and preserved its 3:1 ratio at desktop and phone
widths. All 18 subject shelves, subject destinations, Ghostology navigation,
and existing spacing checks passed. The local authentication lifecycle passed
38/38 checks. Guarded preflight certified the exact source commit and passed
all release gates; production anonymous smoke passed 10/10 and isolated Firefox
release acceptance passed 65/65. The deployed Worker remained at 100% traffic.

Release: `rel-35617bb613c0-a02a95e5044a`

Source commit: `35617bb613c0ea562a8070620f3baf825c6b8404`

Worker version: `c53f719e-ba9a-4c2e-95ae-cde5dc1a0172`

Rollback version: `c3ce48e0-d289-4309-bf35-518ef4c3b6aa`

## Scope and release

The application change is limited to `education-center.html` and the new banner
asset. The Education Center directory and article content are unchanged. No
Haunted Location books, standalone Repository books, member data, or production
data were modified. The guarded release reported `DEPLOYED_AND_VERIFIED`; no
rollback was required.
