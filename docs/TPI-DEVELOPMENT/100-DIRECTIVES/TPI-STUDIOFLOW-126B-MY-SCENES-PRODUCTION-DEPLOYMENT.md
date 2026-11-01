# TPI-STUDIOFLOW-126B — My Scenes Final Production Deployment & Verification

Date: 2026-11-01 (UTC deployment events; execution date 2026-10-31 America/New_York)  
Environment: `https://paranormalinitiative.com/studio/`  
Overall status: **ROLLED BACK**

## Result

The approved TPI-STUDIOFLOW-126A candidate was deployed through the guarded
release workflow, but the required live Firefox visual acceptance failed. The
production deployment was rolled back immediately to the previously verified
Worker. No production data, D1 schema, R2 object, binding, secret, or unrelated
website feature was changed.

The failed acceptance is a release blocker. The 126A correction remains
verified in development and preserved in GitHub; it is not verified in
production.

## Release identity

| Field | Value |
| --- | --- |
| Approved StudioFlow source | `a6784cfe490f57d413dce99135f148936f854c9f` |
| Website branch before release | `codex/tpi-development` |
| Website HEAD before release | `3356ee6ef4e64482f0da5c88d92d930efec34bcb` |
| Website integration base | `9e47096b8762052807ab4e6dc3a4bb3b73bb0d70` |
| Expected JavaScript | `studio/assets/index-CSTJXjG2.js` |
| JavaScript SHA-256 | `94d5ba564a6e358ac013f94dcc30bf78e49e1acd93db4e3a46e32dbab06505bc` |
| Expected CSS | `studio/assets/index-CphVaGhF.css` |
| CSS SHA-256 | `328a8c77587c1976c7a8e1ee3dd72c7e0e4a979216975b1be4e53f23997f3385` |
| Previous production Worker | `584f29db-1568-4ff4-a99e-b32b3b63a23e` |
| Attempted Worker | `fb780aae-8a1c-4dbf-b41a-c82cce96e8be` |
| Rollback Worker | `584f29db-1568-4ff4-a99e-b32b3b63a23e` |
| Attempted deployment time | `2026-11-01T03:50:12.538Z` |
| Rollback time | `2026-11-01T03:50:51.976Z` |
| Final traffic | 100% to `584f29db-1568-4ff4-a99e-b32b3b63a23e` |

## Release gates

| Requirement | Result |
| --- | --- |
| Approved change isolation | PASS |
| Reproducible build | PASS; two builds matched the approved JS/CSS hashes |
| Asset integrity | PASS in staging; 29 integrated files matched |
| Release safety | PASS; 21/21 |
| Local auth lifecycle | PASS; 38/38 per lifecycle run |
| Local Firefox acceptance | PASS; 64/64 |
| Studio lifecycle regression | PASS; 29/29 |
| Studio ownership regression | PASS; 40/40 |
| Studio deletion/archive regression | PASS; 31/31 |
| Studio deletion safety regression | PASS; 32/32 |
| Isolated QA/API E2E and smoke checks | PASS |
| Rollback readiness | PASS |
| Firefox production card-border acceptance | FAIL; 4/6 |
| Production deployment | ROLLED BACK |
| Production data preserved | YES |

## Live Firefox failure

The isolated Firefox Developer Edition production harness authenticated with the
synthetic `qa-studioflow-*` account and rendered all six disposable cards. The
type icon tokens were correct, but the computed outer borders in the deployed
candidate were generic blue rather than type-specific. The selected
Teleprompter Script also rendered a generic blue border instead of the required
brighter purple border.

Observed failure details:

- Intro Video selected: `rgb(84, 199, 255)` instead of orange.
- Teleprompter Script unselected: `rgba(105, 189, 255, 0.5)` instead of purple.
- Production Scene selected: `rgb(84, 199, 255)`.
- Countdown Timer unselected: `rgba(105, 189, 255, 0.5)`.
- Background Music unselected: `rgba(105, 189, 255, 0.5)`.
- Outro Video selected: `rgb(84, 199, 255)`.

The harness reported:

- `Icon and border tokens agree for every production type`: PASS.
- `Type-specific borders persist after refresh`: PASS relative to the rendered
  (but incorrect) production state.
- `Every production card border matches its type color`: FAIL.
- `Selected Teleprompter Script retains a purple border`: FAIL.

This establishes a production-runtime or promotion-parity defect, but does not
by itself establish which release asset or stylesheet rule caused it. No source
change was made under 126B to guess at the cause. A separate focused correction
and release candidate investigation is required before another deployment.

Evidence from the actual production Firefox run:

- [All production card borders](evidence/TPI-STUDIOFLOW-126B/all-production-card-borders.png)
- [Selected Teleprompter border failure](evidence/TPI-STUDIOFLOW-126B/selected-teleprompter-purple-border.png)

Evidence SHA-256:

- `all-production-card-borders.png`: `7557d3a5cf75b70475f0f361e81f3686a9ffafe6fb4c9b5ea745055aa9f2b082`
- `selected-teleprompter-purple-border.png`: `c9cd040f085413018f0f98aed699566ed0effe1533e832239bb45f59383086fc`

## Rollback verification

The attempted Worker was rolled back using the established Wrangler rollback
procedure to `584f29db-1568-4ff4-a99e-b32b3b63a23e`. Cloudflare confirmed that
the rollback Worker received 100% of traffic. The read-only production smoke
suite passed 10/10 after rollback:

- public shell: 200
- public live-video page: 200
- anonymous StudioFlow protection: 403
- anonymous auth/session and private API boundaries: PASS

The required My Scenes correction is not claimed as production-verified after
rollback; the final production Worker is the prior verified baseline.

## Preservation and worktree safety

- No application source files were modified by 126B.
- No database migration or production data operation was performed.
- The unrelated `flame.html` work was not staged, deleted, or deployed. The
  original and a later regenerated copy observed during preflight were preserved
  byte-for-byte under `/private/tmp/tpi-126b-preserved/` during release work.
- Firefox acceptance used an isolated profile and synthetic disposable data;
  the owner browser profile and owner Studios were not accessed.
- Production remains at the rollback baseline Worker above.

## Final determination

**TPI-STUDIOFLOW-126B — ROLLED BACK: production acceptance failed.**

TPI-STUDIOFLOW-126A remains **implemented and verified in development**. It is
not marked verified in production until the live border mismatch is corrected,
rebuilt, redeployed through the guarded workflow, and passed by Firefox.
