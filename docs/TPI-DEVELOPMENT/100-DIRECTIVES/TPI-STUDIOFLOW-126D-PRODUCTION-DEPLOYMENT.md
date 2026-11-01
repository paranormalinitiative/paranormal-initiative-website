# TPI-STUDIOFLOW-126D — Approved Production Deployment

Date: 2026-11-01  
Status: **BLOCKED — NOT DEPLOYED**

## Result

The exact TPI-STUDIOFLOW-126C release candidate was verified and reached the
guarded deployment workflow, but the workflow stopped before Cloudflare upload
because one current release-safety regression failed. Production remains on
the prior verified Worker; no rollback was required.

## Candidate and production baseline

| Item | Result |
| --- | --- |
| Website branch | `codex/tpi-development` |
| Candidate website HEAD | `b17e8cb692d458d864cc801bc1bd10bb1509b39b` |
| GitHub parity | Verified; remote branch matched candidate HEAD |
| StudioFlow source commit | `a6784cfe490f57d413dce99135f148936f854c9f` |
| JavaScript | `index-CSTJXjG2.js` |
| JavaScript SHA-256 | `94d5ba564a6e358ac013f94dcc30bf78e49e1acd93db4e3a46e32dbab06505bc` |
| CSS | `index-CphVaGhF.css` |
| CSS SHA-256 | `328a8c77587c1976c7a8e1ee3dd72c7e0e4a979216975b1be4e53f23997f3385` |
| Entrypoint SHA-256 | `c893fb35444f2fb1c17cb891d2987fddd8672c1657502e7f3423b73227c208ab` |
| Current production Worker | `584f29db-1568-4ff4-a99e-b32b3b63a23e` at 100% |
| Release rollback target | `584f29db-1568-4ff4-a99e-b32b3b63a23e` |

The unrelated untracked `flame.html` was preserved outside the release tree
during the clean preflight and restored byte-for-byte afterward. Its current
SHA-256 is `4e52d8c061769f0c5cca2437d48448d3789a669bb99376ea3769ae99f9c09e85`.
It remains untracked and was not staged, modified, or deployed.

## Release-gate results

| Gate | Result |
| --- | --- |
| Exact candidate and GitHub parity | PASS |
| Approved asset hashes and entrypoint | PASS |
| Reproducible authoritative build | PASS |
| Release-safety contract | PASS — 21/21 |
| Local authentication lifecycle | PASS — 38/38; isolated Firefox 64/64 |
| Disposable API/E2E quality gate | PASS |
| StudioFlow build/request-budget/bridge checks | PASS |
| Read-only production smoke checks in preflight | PASS |
| Studio lifecycle regression | PASS — 29/29 |
| Studio ownership regression | PASS — 40/40 |
| Studio deletion/archive regression | PASS — 31/31 |
| Studio deletion safety/data integrity regression | **FAIL — 31/32** |
| Cloudflare deployment | **NOT ATTEMPTED** |
| Post-deployment live Firefox acceptance | **NOT ATTEMPTED** |

## Blocking failure

The guarded command was:

```sh
TPI_PRODUCTION_DEPLOY=approved npm run release:production
```

It stopped during the current release-gate rerun at
`TPI-STUDIOFLOW-089-DELETION-SAFETY`:

> `TPI-104: with-contents leaves workspace unchanged` — FAIL

The regression reported that the disposable test record changed its version
and `updatedAt` during the blocked with-contents deletion scenario, even though
the record content remained otherwise equivalent. Because the release runbook
requires every mandatory gate to pass, deployment was not allowed to continue.
This is recorded as a release blocker; no application correction was made under
126D.

## Production and data safety

- Production was rechecked after the failed command and remained Worker
  `584f29db-1568-4ff4-a99e-b32b3b63a23e` at 100% traffic.
- No new Worker was created by 126D.
- No production database, R2 object, creator project, episode, note, script,
  recording, binding, secret, or domain was modified.
- No rollback command was required or executed.
- The live Firefox color, selected-state, dragging-state, and cache-header
  acceptance tests were not run because the release did not pass the
  pre-deployment gate.

## Final determination

**TPI-STUDIOFLOW-126D — BLOCKED: NOT DEPLOYED**

The candidate remains preserved and development-verified. The failed deletion
safety regression must be investigated and corrected or explicitly dispositioned
before another production deployment attempt.
