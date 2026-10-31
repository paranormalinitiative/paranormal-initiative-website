# TPI-STUDIOFLOW-121 — Controlled Production Deployment — Enhanced Screen Sharing

Date: 2026-10-31
Status: **COMPLETE / DEPLOYED_AND_VERIFIED**
Owner authorization: **CONFIRMED**
Production deployment: **AUTHORIZED AND COMPLETED**

## Result

The owner-approved Directive 120 Enhanced Screen Sharing implementation was
deployed to `https://paranormalinitiative.com/studio/` through the maintained
guarded release workflow. The deployment completed without rollback.

## Release provenance

| Item | Verified value |
| --- | --- |
| StudioFlow source commit | `a8a7d11759905ae4bf8043005e0c2259b1fd6a81` |
| Website/release baseline commit | `cbf652d5c5546f1c1b7e1c2e0fc9b8d25b3fe023` |
| JavaScript | `index-CgmAxo34.js` |
| JavaScript SHA-256 | `f4bd273c8fe8f60ef6025389b0738b03f392a9d3d618fe3433b819083e1a3595` |
| CSS | `index-DpwwYG6_.css` |
| CSS SHA-256 | `869e46025ce505491069a596af277bdacdd9df6a3493ac1e8db0c03a58a6b619` |
| Previous production Worker | `f5af1836-8cf8-4a3c-9db7-18c53ff9ded2` |
| New production Worker | `a8709be8-6cec-4e99-a904-0f0e8877f00f` |
| Traffic allocation | 100% |
| Rollback target | `f5af1836-8cf8-4a3c-9db7-18c53ff9ded2` |
| Deployment timestamp | `2026-10-31T14:09Z` |

The release manifest was updated before deployment to identify the approved
D120 candidate and was committed and pushed on `codex/tpi-development`. The
production deployment used the exact reproducible assets above; no unrelated
StudioFlow feature, schema migration, D1 reset, R2 change, credential change,
or permanent-deletion change was included.

## Verification

- Source provenance and reproducible asset verification: **PASS**.
- Release isolation and guarded Wrangler dry-run: **PASS**.
- Local authenticated lifecycle and regression gates: **PASS**.
- Studio lifecycle: **29/29 PASS**.
- Studio ownership: **40/40 PASS**.
- Permanent-deletion safety: **31/31 and 32/32 PASS**; deletion remains disabled.
- Live anonymous production smoke: **10/10 PASS**.
- Isolated Firefox Developer Edition production acceptance: **64/64 PASS**.
- Owner-confirmed Chrome screen sharing: **PASS**.
- Existing StudioFlow tools, authentication, and production data: **PRESERVED**.
- Rollback: **NOT REQUIRED**.

The isolated Firefox acceptance used a disposable profile and synthetic QA
account; it did not access the owner profile or modify owner Studios. No public
livestream was initiated.

## Deferred verification

Per the owner’s explicit D121 authorization, the following remain deferred to
the final StudioFlow acceptance phase:

- shared video in saved recordings;
- shared audio in saved recordings;
- complete Chrome, Firefox and Safari compatibility coverage;
- full end-to-end screen-sharing recording, termination and cleanup coverage.

These items are not reported as passed by this directive. The release is
production-ready for owner review with those known acceptance obligations
remaining.

## Production protection

Production D1/R2 data, existing Studios, recordings, scripts, Notes, Scenes,
Media Assets, authentication, and browser-local owner data were not reset,
migrated, deleted or overwritten. The original mixed StudioFlow checkout was
not modified. Port 5192 was not restarted. Production remains on the new D120
baseline; rollback is available through the verified previous Worker target.

## Final status

**DEPLOYED_AND_VERIFIED.** The next directive should complete the deferred
screen-sharing recording and browser-compatibility acceptance as part of the
owner’s final StudioFlow test. Do not expand this release record into unrelated
feature development.
