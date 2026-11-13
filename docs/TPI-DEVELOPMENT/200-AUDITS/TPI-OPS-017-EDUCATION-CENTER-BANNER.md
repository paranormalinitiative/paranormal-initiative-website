# TPI-OPS-017 — Education Center Banner

Date: 2026-11-13
Status: **LOCAL BROWSER ACCEPTANCE PASSED; GUARDED RELEASE PENDING**

## Change

Added the owner-provided Education Center banner at
`assets/education-center-banner.png` and placed it above the Education Center
introductory copy. It scales to the available content width while preserving
the artwork's full 3:1 composition, including on phone-sized screens.

## Verification

The isolated Firefox Developer Edition Education Center suite passed 31/31 on
the official local Worker. The banner loaded at its expected 2172 x 724 source
dimensions and preserved its 3:1 ratio at desktop and phone widths. All 18
subject shelves, subject destinations, Ghostology navigation, and existing
spacing checks passed. The local authentication lifecycle also passed 38/38
checks, including the isolated Firefox run.

## Scope and release

The application change is limited to `education-center.html` and the new banner
asset. The Education Center directory and article content are unchanged. No
Haunted Location books, standalone Repository books, member data, or production
data were modified. Guarded release and live verification results will be
recorded here after deployment.
