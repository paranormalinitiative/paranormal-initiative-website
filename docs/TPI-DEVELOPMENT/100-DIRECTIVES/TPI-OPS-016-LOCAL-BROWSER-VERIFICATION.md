# TPI-OPS-016 — Complete Local Browser Verification

## Scope

This directive continues OPS-015 using the existing local-only website at
`http://127.0.0.1:8787/`. It covers bounded route verification, representative
browser acceptance, local service identification, authorization boundaries, and
documentation. It does not redesign the website or contact hosted TPI.

## Safety boundaries

- No deployment, commit, push, production request, public-development request,
  remote D1/R2 change, import, publication, livestream, recording, or
  RealtimeKit operation is authorized by this directive.
- The owner-controlled `com.tpi.local-development` LaunchAgent was not
  restarted or stopped.
- The preserved StudioFlow room server on `127.0.0.1:8788` was not interrupted.
- Existing synthetic credentials and local fixtures were used only through
  bounded tests; credentials were not printed.

## Required deliverables

- Complete route/browser matrix: `200-AUDITS/TPI-OPS-016-BROWSER-ACCEPTANCE-MATRIX.md`
- Completion result: `300-COMPLETED-WORK/TPI-OPS-016-LOCAL-BROWSER-RESULT.md`
- Updated directive index and current development status.
- Bounded browser harness: `scripts/e2e/tpi-ops-016-browser.mjs`

## Completion rule

OPS-016 is reported as **PARTIALLY COMPLETED** unless all route browser
rendering and the required role-based interactive surfaces are demonstrated.
HTTP availability is not treated as browser or functional parity.
