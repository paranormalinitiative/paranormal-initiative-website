# TPI-STUDIOFLOW-119 — Controlled Production Deployment and Release Baseline

Date: 2026-10-30  
Status: **COMPLETE / DEPLOYED_AND_VERIFIED**  
Owner approval: **CONFIRMED**  
Environment: Production only after guarded release gates  
Production data migration: **NONE**

## Release identity

- Approved StudioFlow source: `244993beab7f9fbba7ee89376a3b3dea616fa62a`
- Website deployment candidate: `6d4c062ce0c3b647f39d3b5e3004531d692f62ba`
- Final documentation/parity commit: recorded after this execution record is
  committed and pushed
- Worker: `theparanormalinitiative`
- New production Worker version: `f5af1836-8cf8-4a3c-9db7-18c53ff9ded2`
- Traffic allocation: `100%`
- Previous Worker / rollback target:
  `91a8460e-1db1-440c-9643-a85b6e178fba`

## Assets

The approved build generated and served:

- JavaScript: `index-DG-_pPI_.js`
  - SHA-256: `66f9407e808f74c803491917efcb412566301f4feca6df20978cd64dc48d7560`
- CSS: `index-28KfU4BI.css`
  - SHA-256: `48b3b88702dde14713240d89a31e3057e58a53a1bea5356c0ba569aee77dea6f`

The isolated source-provenance workflow built the approved source twice,
confirmed reproducibility, verified the exact manifest hashes, and staged the
matching files. After deployment, an authenticated read-only production fetch
returned StudioFlow HTML 200 and the exact JavaScript and CSS hashes above.

## Safety gates and deployment

The release was not deployed until the guarded preflight reported `READY`.
The preflight covered release safety 21/21, authenticated local lifecycle
verification 38/38 before and after the approved build, local Firefox
acceptance 64/64, isolated QA/API E2E, request-budget and syntax checks,
Studio lifecycle 29/29, Studio ownership 40/40, deletion safeguards 31/31,
deletion/data-integrity safeguards 32/32, authoritative staging verification,
and the guarded Wrangler dry run. Permanent Studio deletion remained disabled.

The authorized command was:

```sh
STUDIOFLOW_ROOT=/Users/toddknipple/Documents/StudioFlow/web-109 \
TPI_PRODUCTION_DEPLOY=approved npm run release:production
```

The guarded release completed with `DEPLOYED_AND_VERIFIED`. It uploaded the
approved Worker and static assets only; no D1 migration, D1 reset, R2 deletion,
credential change, authentication migration, Studio deletion or recording
deletion occurred.

## Production verification

- Anonymous production smoke: **10/10 PASS**.
  - Public routes remained available.
  - Anonymous Studio and protected APIs remained restricted.
  - Private media remained protected.
- Isolated Firefox Developer Edition production acceptance: **64/64 PASS**.
  - Disposable authenticated QA profile only; `ownerProfileAccessed: false`.
  - StudioFlow authenticated access, Teleprompter sidebar/workstation flows,
    script selection/order and Studio isolation, recording/storage paths and
    preserved protected controls passed.
- Live HTML asset references: **PASS**.
- Live JavaScript/CSS SHA-256 comparison: **PASS**.
- Production traffic allocation: **100% to `f5af1836-8cf8-4a3c-9db7-18c53ff9ded2`**.
- Automatic rollback: **NO**; no failure condition occurred.

The saved-media, non-silent audio, playable-video and decoded-frame privacy
evidence was established against the exact approved candidate during the D118
acceptance gate and retained in the maintained release evidence. The live
production acceptance exercised the deployed authenticated workflow without a
public livestream or destructive write against owner content.

## Rollback

Rollback readiness is **PASS**. The previous Worker version is retained by
Cloudflare and was confirmed available by the guarded preflight. If a release
stop condition occurs, use the maintained guarded rollback command with the
recorded target `91a8460e-1db1-440c-9643-a85b6e178fba`, then rerun anonymous
smoke, authentication, Studio access, recording availability and isolated
Firefox acceptance. Do not substitute an unverified asset copy or repeatedly
redeploy a failing candidate.

## Baseline outcome

This deployment establishes the new approved StudioFlow production baseline:

- Source: `244993beab7f9fbba7ee89376a3b3dea616fa62a`
- Website candidate: `6d4c062ce0c3b647f39d3b5e3004531d692f62ba`
- Worker: `f5af1836-8cf8-4a3c-9db7-18c53ff9ded2`
- Rollback: `91a8460e-1db1-440c-9643-a85b6e178fba`
- JS: `index-DG-_pPI_.js` / `66f9407e808f74c803491917efcb412566301f4feca6df20978cd64dc48d7560`
- CSS: `index-28KfU4BI.css` / `48b3b88702dde14713240d89a31e3057e58a53a1bea5356c0ba569aee77dea6f`

No unrelated unfinished StudioFlow work was included. The original mixed
StudioFlow checkout remains preserved, the approved feature worktree remains
clean, and production remains isolated from local D1/R2 state. The next
StudioFlow release must derive from this verified baseline through the same
source-provenance and guarded release workflow.
