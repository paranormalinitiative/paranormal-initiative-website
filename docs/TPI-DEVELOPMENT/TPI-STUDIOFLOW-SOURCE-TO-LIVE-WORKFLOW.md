# StudioFlow Source-to-Live Workflow

Status: ACTIVE / CANONICAL

Last verified: 2026-10-25

This document is the single operational explanation of how StudioFlow moves
from source code to the live website. It supplements the mandatory
`TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md`; it does not create a second release path.

## The four locations are not automatically synchronized

| Name | Exact location | Purpose | Does saving here update production? |
| --- | --- | --- | --- |
| StudioFlow source | `/Users/toddknipple/Documents/StudioFlow/web` | Authoritative React/TypeScript StudioFlow application | No |
| Website repository | `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website` | Deployable TPI Worker, website assets, and maintained StudioFlow bridge layer | No |
| Local website | `http://127.0.0.1:8787/` | Local integration and safety testing | No |
| Live production | `https://paranormalinitiative.com/studio/` | User-facing acceptance target | Only after the guarded production release succeeds |

The public development Worker at
`https://theparanormalinitiative-dev.paranormalsomerset.workers.dev/` is an
optional isolated preview target. It is not production, it does not update
automatically, and deploying it does not update `paranormalinitiative.com`.

## Which repository receives which change

Make core StudioFlow React, TypeScript, CSS, AudioWorklet, or public-asset
changes in `/Users/toddknipple/Documents/StudioFlow/web`. Commit them there so
the source revision is recoverable. That repository currently has no Git
remote, so its commit is local provenance and is not the deployment push.

Make TPI-only integration changes in the website repository. Examples are the
maintained `studio/*-bridge.js` files, `studio/studioflow-012-overrides.css`,
Worker/API integration, acceptance tests, and release tooling. Do not copy a
bridge repair back into generated StudioFlow bundles.

The only GitHub push that feeds the guarded TPI production release is the
website repository's `codex/tpi-development` branch.

## Required source-to-live sequence

1. Inspect both repositories and preserve unrelated work.
2. Change authoritative StudioFlow source when the defect belongs to the core
   application. Commit the verified source change in that repository.
3. From the website repository, build and integrate the exact source revision:

   ```sh
   cd /Users/toddknipple/Documents/GitHub/paranormal-initiative-website
   node scripts/stage-studioflow-authoritative.mjs --apply
   ```

   The staging tool builds the source twice, verifies reproducibility, copies
   generated assets into `studio/`, and preserves the maintained TPI bridge
   layer. It does not deploy.
4. If the change is bridge-only, edit and test the maintained bridge files in
   the website repository; do not rebuild unrelated source merely to create a
   new bundle.
5. Test the integrated local website in Firefox Developer Edition. A local pass
   is a safety gate, not proof that the live site changed.
6. Review and commit only the intended website-repository files. Push that
   exact commit to `origin/codex/tpi-development`.
7. Run the mandatory guarded release:

   ```sh
   npm run verify:local-auth-lifecycle
   npm run release:preflight
   TPI_PRODUCTION_DEPLOY=approved npm run release:production
   ```

8. Accept completion only after `release:production` prints
   `DEPLOYED_AND_VERIFIED` and the exact behavior is confirmed at
   `https://paranormalinitiative.com/studio/` in Firefox Developer Edition.
9. Record the website commit, StudioFlow source commit when applicable, new
   Worker version, rollback version, automated checks, and live result.
10. Commit and push the documentation update. Do not perform a second no-op
    Worker deployment for documentation-only changes.

### Visible acceptance requirement

For overlays, context menus, modals, and other interactive surfaces, a
successful DOM query is not sufficient evidence. The Firefox acceptance step
must perform the user interaction, confirm computed visibility and a non-zero
in-viewport bounding rectangle, and retain a screenshot or equivalent visible
evidence when reconciling a reported production failure. This guards against
ancestor clipping, stacking, pointer-event, and stale-bundle defects.

## What commit, push, and deploy mean

- A StudioFlow source commit preserves the core application revision. It does
  not update GitHub or the live site because that source repository currently
  has no configured remote.
- A website repository commit creates the exact deployable checkpoint.
- A website repository push copies that checkpoint to GitHub. Push alone does
  not update the live site.
- A development-Worker deployment updates only the isolated preview Worker.
- The guarded production deployment updates `paranormalinitiative.com` from
  the clean, pushed website commit after every preflight gate passes.
- A browser refresh, cache-busting query, local server restart, or successful
  local build is not a deployment.

## Current verified live baseline

- Website production source commit: `877efb3`
  (TPI-STUDIOFLOW-037 production recovery)
- Authoritative StudioFlow source commit: `eff6b69`
- Active production Worker version:
  `871c0ae7-33c5-46ae-b635-19ec3100c989`
- Immediate rollback version:
  `d58d7e1e-5f86-4c87-93b3-110999d200a9`
  (prior TPI-STUDIOFLOW-037 Addendum E release)

The production recovery established that the prior bundle was current but the
scene context menu was visually clipped. The corrected live entry point loads
`/studio/assets/index-BfmRc0ua.js` and
`/studio/assets/index-DB0QL1ns.css`. The focused Addendum E Firefox suite
passed 20/20 locally and 20/20 against production with disposable QA data;
owner acceptance remains pending.

## TPI-STUDIOFLOW-036 verified release

The 2026-10-24 release integrated the owner-supplied
`StudioFlow_Video_Timers_Spectacular.html` collection into the existing
Video Timers engine. The release contains nine silent selectable designs, the
existing four durations, one shared countdown engine, program-output
integration, and per-Studio workspace persistence. The guarded release
completed release safety 17/17, local auth lifecycle, complete isolated QA/API
E2E, production smoke 10/10, and isolated Firefox acceptance 64/64. Worker
`076c9614-9251-4efd-b047-0e7033f4ad9c` is active at 100% traffic; the prior
Worker `aa9bff15-6252-4ae5-9422-17d63b99ab5a` is the rollback reference.
The prototype SHA-256 is `26996bd0d1017ba00736f880930e2c01099af0cb1bcc14b9b3bc19252db59f4e`.
No production Studio configuration, D1 record, R2 object, recording, or
owner-browser data was mutated for acceptance.

## TPI-STUDIOFLOW-037 verified release — Addendum D playback and rehearsal controls

The guarded Addendum D release repaired independent production-button playback
and rehearsal cancellation. Source commit `5186e28` and website application
commit `8d46a45` passed the local build, reproducible staging, release
preflight, focused Addendum D regression 10/10, TPI-037 20/20, TPI-028 33/33,
TPI-031 34/34, and TPI-034 mutation regression. Production smoke passed
10/10 and isolated Firefox acceptance passed 64/64. Worker
`3a9b090f-78b5-43d6-bb11-17a1ba54d41b` is active at 100% traffic; rollback is
`5536bcc5-8c50-4851-b6e4-4a660eb1b0fb`.

The repair reused the existing playback engines and added only same-item
toggle handling, rehearsal cancellation tokens, stop events, and the
non-destructive `Remove from Scenes` context action. No D1, R2, recording,
livestream, or owner Studio data was changed. Documentation was committed
after deployment; per this workflow, no second no-op Worker deployment is
required for documentation-only changes. Owner acceptance remains pending.

## TPI-STUDIOFLOW-037 verified release — Addendum C visual consistency and drag repair

The Addendum C corrections are deployed and live-verified against the
production interface. Source commit `d6b8f03` and website application commit
`8a954ad` (test commit `dd22fc5`) passed the complete release sequence. The
Addendum C Firefox acceptance suite passed 26/26 locally and 26/26 against the
deployed interface in isolated Firefox Developer Edition using the approved
synthetic production QA account with disposable studios archived afterwards.
Worker `5536bcc5-8c50-4851-b6e4-4a660eb1b0fb` is active at 100% traffic;
rollback is `1c752f3f-8af3-461f-8082-3dd8a447fd3d`.

The repair standardizes single-line production labels with full-name tooltips,
shows the assigned SmartPad track color on Background Music buttons, gives
every movable item the same drag handle, and makes dragging visibly glide
surrounding rows around a live `Move here` gap that follows the pointer, with
Escape cancellation and edge auto-scroll. After Intro Background Music,
playback, recording, and livestreaming behavior are unchanged. Owner
acceptance of the corrected interface remains pending.

## TPI-STUDIOFLOW-037 verified release — Addendum B reactive drag

The reactive Scenes-panel drag repair is deployed and live-verified. Source
commit `322b132` and website application/test commit `da9bfab` passed the
complete release sequence. TPI-037 passed 20/20 and TPI-031 passed 34/34;
production smoke passed 10/10 and isolated Firefox Developer Edition live
acceptance passed 64/64. Worker
`1c752f3f-8af3-461f-8082-3dd8a447fd3d` is active at 100% traffic; rollback is
`9b3353a6-8f5d-4468-af89-1d71d8fcc39f`.

The release preserves the established source-to-live separation. The canonical
source was built and staged reproducibly, the website artifact was committed
and pushed, the guarded preflight completed, and Wrangler uploaded only the
intended StudioFlow bundles/HTML/CSS plus the release metadata. No production
D1/R2 data or owner Studio content was modified.

## TPI-STUDIOFLOW-035 verified release

The 2026-10-24 TPI-035 release cleaned the far-right production navigation
(removed Live interaction, Comments, and Widgets; placed Teleprompter beneath
Notes), added the authoritative Recording & Storage rail section, redirected
the Settings recording/storage tabs to it, added truthful recording save
status with explicit destination-fallback confirmation, and repaired the
workspace recording-settings save/hydrate mapping plus the React activation
re-read. The maintained 035 suite passed 33/33 in disposable Firefox with
fake media devices; the guarded release completed local auth lifecycle,
isolated QA/API E2E, local Firefox acceptance 63/63, production smoke, and
isolated live Firefox acceptance 63/63. Worker
`aa9bff15-6252-4ae5-9422-17d63b99ab5a` is active at 100% traffic;
`5c8e78b5-f920-4335-940f-a5e4d6df0e49` is the rollback reference. Live
acceptance is non-destructive; no production recordings or Studio
configuration were mutated for testing.

## Prior TPI-STUDIOFLOW-033 verified release

The 2026-10-24 TPI-033 release preserved `videoClipSlots`, validated slot
positions, and scalar program orientation through the existing workspace API and
bridges. The authoritative StudioFlow source commit is `53bf8dc`; the website
application commit is `cb38061`. The guarded release completed local auth,
complete QA/API E2E, production smoke 10/10, and isolated live Firefox
acceptance 64/64. Worker `5c8e78b5-f920-4335-940f-a5e4d6df0e49` is active at
100% traffic; `0c0a8660-21cf-47e1-ac66-98c91b26972c` is the rollback reference.
The new disposable configuration round-trip remains local evidence so that live
production Studio configuration was not mutated for testing.

## Prior TPI-STUDIOFLOW-034 verified release

The 2026-10-24 TPI-034 release was bridge-only: the authoritative StudioFlow
source remained at `ce7c389`; website checkpoint `8d7185b` carried the
idempotent bridge repair, maintained mutation regression, and `tpi034` cache
busters. Preflight, guarded deployment, production smoke, and isolated Firefox
acceptance completed successfully. Worker
`0c0a8660-21cf-47e1-ac66-98c91b26972c` is active at 100% traffic. The previous
Worker `7029c6c5-3994-42a1-9570-d6119a5792f3` is the rollback reference. No
source staging `--apply` was required because no authoritative source files
changed.

The website repository HEAD may be newer than the deployed application commit
when later commits contain only Markdown or local tooling. Those changes are
intentionally pushed without creating a no-op Worker release.

The current approved StudioFlow playback and scene-media behavior is recorded
in `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`. Keep that contract current when
approved behavior deliberately changes.

## Historical-document rule

Files under `100-DIRECTIVES`, `200-AUDITS`, `300-COMPLETED-WORK`, and
`400-FUTURE-DEVELOPMENT` preserve the conditions and evidence of their own
execution. Their old commit IDs, Worker versions, browser choices, deployment
restrictions, or pending statuses are not current commands. When a historical
record conflicts with this workflow, the standing authority, the mandatory
runbook, and this document control current operations.
