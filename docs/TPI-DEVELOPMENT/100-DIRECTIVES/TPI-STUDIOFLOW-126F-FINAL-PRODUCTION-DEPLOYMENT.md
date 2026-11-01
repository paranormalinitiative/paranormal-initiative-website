# TPI-STUDIOFLOW-126F — Final Production Deployment and Firefox Acceptance

Date: 2026-11-01
Project: The Paranormal Initiative — StudioFlow
Production target: `https://paranormalinitiative.com/studio/`

## Final status

**DEPLOYED AND VERIFIED.**

The verified 126C release candidate, including the 126E verification-harness
correction, was deployed through the guarded production workflow. Live
anonymous smoke and isolated Firefox Developer Edition acceptance passed. No
production database, storage object, creator project, recording, Note, episode,
or script was modified.

## Deployment

| Field | Result |
| --- | --- |
| Previous Worker | `584f29db-1568-4ff4-a99e-b32b3b63a23e` |
| New Worker | `1a6a2ab5-db20-4e43-9d10-18a0a1edc784` |
| Traffic | 100% to the new Worker |
| Deployment time | `2026-11-01T04:54:30.803Z` |
| Website release commit | `0bdd7428666f65a6df46e0825808970af7f7ba24` |
| StudioFlow source commit | `a6784cfe490f57d413dce99135f148936f854c9f` |
| Rollback target | `584f29db-1568-4ff4-a99e-b32b3b63a23e` |
| Production data preserved | Yes |

The website commit contains the verified 126C website integration and the
126E test-harness/documentation correction. The StudioFlow application source
and production card-border implementation were not changed by 126E.

## Release artifacts

Reproducible staging built the approved source twice with identical output:

- JavaScript: `index-CSTJXjG2.js`
  - SHA-256: `94d5ba564a6e358ac013f94dcc30bf78e49e1acd93db4e3a46e32dbab06505bc`
- CSS: `index-CphVaGhF.css`
  - SHA-256: `328a8c77587c1976c7a8e1ee3dd72c7e0e4a979216975b1be4e53f23997f3385`
- Entrypoint: `studio/index.html`
  - SHA-256: `c893fb35444f2fb1c17cb891d2987fddd8672c1657502e7f3423b73227c208ab`

Artifact integrity, source-to-live staging, stylesheet ordering, and obsolete
bundle detection passed. The authenticated Firefox session loaded the exact
hashed JavaScript and CSS paths. An anonymous HTTP request to `/studio/`
returned the expected protected `403` together with `Cache-Control: no-store`.

## Verification results

| Requirement | Result |
| --- | --- |
| Deletion safety | **PASS — 32/32** |
| Release safety | **PASS — 21/21** |
| Authentication lifecycle | **PASS — 38/38** before restart, after restart, and after rebuild |
| Recording/storage regression | **PASS — 33/33** |
| TPI-125 Firefox integration | **PASS — 21/21** |
| Reproducible candidate staging | **PASS** |
| Production smoke | **PASS — 10/10** |
| Broad live Firefox acceptance | **PASS — 64/64** |
| Focused live border/asset Firefox acceptance | **PASS — 8/8** |
| Worker traffic verification | **PASS — 100% on `1a6a2ab5-db20-4e43-9d10-18a0a1edc784`** |
| Rollback readiness | **PASS** |

## Focused live Firefox acceptance

The isolated production Firefox run used the synthetic `production_qa` account,
not the owner profile. It verified:

- exact hashed asset references;
- orange Video Clip borders;
- purple Teleprompter Script borders;
- blue Production Scene borders;
- yellow Countdown Timer borders;
- green Background Music borders;
- selected Teleprompter Script remains purple;
- dragging Teleprompter Script remains purple;
- type-specific borders persist after refresh.

Evidence screenshots:

- [All production card borders](evidence/TPI-STUDIOFLOW-126F/all-production-card-borders.png)
- [Selected Teleprompter purple border](evidence/TPI-STUDIOFLOW-126F/selected-teleprompter-purple-border.png)

Temporary run evidence root: `/tmp/tpi-126f-firefox-evidence`.

## Safety and repository status

- Cloudflare account and Worker target matched the approved production
  configuration.
- No migrations, D1 writes, R2 mutations, credential changes, or unrelated
  production routes were introduced.
- The maintained deployment command completed with
  `DEPLOYED_AND_VERIFIED`; automatic rollback was not invoked.
- GitHub parity was verified by the guarded workflow before deployment.
- `flame.html` was preserved exactly and restored to its original untracked
  location after deployment.
- The active branch remains `codex/tpi-development`; the only remaining
  worktree item is the intentionally preserved untracked `flame.html`.

## Final determination

**TPI-STUDIOFLOW-126F — COMPLETE: DEPLOYED AND VERIFIED.**
