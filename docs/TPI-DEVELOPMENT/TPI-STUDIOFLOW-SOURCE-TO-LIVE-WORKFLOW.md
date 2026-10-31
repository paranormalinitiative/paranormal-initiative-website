# StudioFlow Source-to-Live Workflow

Status: ACTIVE / CANONICAL

Last verified: 2026-10-29

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

## AUTHORITATIVE STUDIOFLOW LOCAL DEVELOPMENT ENVIRONMENT

The authoritative owner-used StudioFlow development entry point is:

| Field | Verified value |
| --- | --- |
| Primary local development URL | `http://127.0.0.1:8787/studio/` |
| Purpose | Owner-used StudioFlow development environment and local integration target |
| Source repository | `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website` for the local Worker, bridge layer and staged website assets; core StudioFlow source remains `/Users/toddknipple/Documents/StudioFlow/web` |
| Source branch | `codex/tpi-development` |
| Server startup | `npm run dev:local` (`node scripts/local-dev.mjs`) |
| Server type | Loopback-bound Cloudflare Worker running in local `workerd`, not Vite |
| Backend | `wrangler.local.toml`; local-only D1 `tpi-local-foundation`, local R2 `tpi-local-media`, outbound services disabled |
| Durable state | `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/.local-dev/state/v3` |
| Browser origin | `http://127.0.0.1:8787`; use this exact origin for authenticated local work |
| Authentication | Worker session authentication; anonymous `/api/auth/me` returns no user and protected Studio APIs return `401` |
| Studio and media persistence | Server Studio workspace/media records in local D1/R2, with the existing StudioFlow browser-local broadcast/library/IndexedDB layers retained by the app |
| Production relationship | Development only; it does not update production and no production deployment is implied |

The current local Worker serves the latest explicitly staged development
candidate recorded below. A source revision is not present on this localhost
merely because it exists in an isolated StudioFlow worktree or preview. Every
candidate must be built from a clean source worktree, verified reproducible,
and staged through the provenance-checked workflow. Historical candidate
records remain below for release traceability.

## Current local development candidate — TPI-STUDIOFLOW-122F.2D

The authoritative `8787` Worker serves the Notes document-padding correction
from clean StudioFlow source commit
`6af7b1089fbe38fb85a72590c0017086ff65f6b1` in the isolated
`codex/studioflow-122-notes` worktree. The editable surface uses 22px desktop
horizontal padding, 18px at medium widths, and 14px on narrow layouts; existing
focus, caret, formatting, attachment and autosave behavior is unchanged.

Exact staged assets:

- `/studio/assets/index-DMqbydAn.js` — SHA-256
  `89f744d4ca0a889001acb94f2afd6826609a8c64cee02ad23508f0f4da8a14b3`
- `/studio/assets/index-CeIVL89B.css` — SHA-256
  `35f10a284e564ea006e9bf44831618cc3b6bf38754a6868239cadd253b104f2c`

The source was built twice from the exact clean commit and passed staging
verification. Firefox computed-padding and Notes acceptance pass, maintained
Firefox passes 64/64, and release safety passes 21/21. This is development
only; production remains unchanged.

## TPI-STUDIOFLOW-127 release baseline — 2026-10-31

The preserved and deployed StudioFlow candidate was built from source commit
`ded5a3d73c5838d56f3c5e1cb0a32534acdab44f` in the clean isolated
`codex/studioflow-122-notes` worktree. Website integration and release
documentation were carried on `codex/tpi-development` at website commit
`a648f0b6a2744af489e0a9357952ac6dd9de6de5` before the post-deployment
documentation update. The guarded workflow deployed Worker version
`4108a0d7-5833-435f-8a0b-f6be8c1c8b27`; rollback is
`a8709be8-6cec-4e99-a904-0f0e8877f00f`.

The exact deployed StudioFlow assets are:

- `/studio/assets/index-CZ1q5Q9d.js` — SHA-256
  `89f744d4ca0a889001acb94f2afd6826609a8c64cee02ad23508f0f4da8a14b3`
- `/studio/assets/index-DtHLNYVn.css` — SHA-256
  `720b9f58e86b2006281120234b4cb9a4bf7e2f2b7388b04badd4e2d3808eb668`

Preflight, local authentication lifecycle, reproducible staging, release
safety, isolated Firefox, ownership, deletion-safety, and read-only production
smoke gates passed. Production had no D1/R2 migration or destructive data
operation. The native 122H.2 local-folder filesystem test remains partial and
is explicitly not represented as a passed native synchronization capability.

## Current local development candidate — TPI-STUDIOFLOW-122H

The authoritative `8787` Worker serves the development-only podcast project
export candidate from isolated StudioFlow source commit
`56f8ad7cc403560e22388e907b2000ee9f49c0db`. Existing Notes podcast project
collections expose read-only `View Project Files` and `Download Project`
actions. The browser generates a bounded standard ZIP containing only verified
project-associated collections, notes, episode metadata, and private
attachments that can be fetched through the authenticated Notes endpoint.

Exact staged assets:

- `/studio/assets/index-D_rpm-10.js` — SHA-256
  `c029b5099fa67fff2220e823544b19b4ea816679088817244d1de796525cc349`
- `/studio/assets/index-kIGdvrxS.css` — SHA-256
  `9506b740f488255323852f2e43e95c463b81b66b155cd38d5a32105704cfaee8`

The export includes a checksum manifest and relative offline HTML references,
sanitizes names, prevents collisions, and enforces 50 MB/resource and 512 MB
total bounds. Scripts, recordings/media, artwork, guest information, and
scenes are explicit manifest omissions because their current Studio/browser-
local records have no verified podcast-project or episode association. The
Notes list attachment lookup was chunked at 80 IDs per D1 query to prevent a
large existing library from producing a false 503. Final Firefox export
acceptance passes 17/17; maintained Firefox passes 64/64; release safety passes
21/21; reproducible staging and asset comparison pass. Production remains
unchanged and no deployment is authorized under D122H.

## Current local development candidate — TPI-STUDIOFLOW-122F.2C

The authoritative `8787` Worker serves the development-only final Notes editor
focus-styling correction from isolated StudioFlow source commit
`eb6d09d991d851d8f92853e60a2ecb8c0f934e87`. The bottom-only
`.notes-rich-editor:focus-visible` inset shadow is removed; the editor keeps a
subtle shared-token surface tint, caret, and scoped keyboard focus indication.

Exact staged assets:

- `/studio/assets/index-BZJV5-la.js` — SHA-256
  `a06403c49de188a6e5d534f00512e05da58271dde48f74bafe4598ae6d1306af`
- `/studio/assets/index-CfXSYfAg.css` — SHA-256
  `ca4a20d0bbf23696f0baad2bdbe2c7f6f1961f1190b654457eccc4adcd33f415`

Live Firefox computed-style verification passes for no box shadow, no bottom
border, no outline, and a visible caret color. Maintained Firefox passes
64/64, release safety passes 21/21, and exact reproducible staging passes.
The broader disposable Notes harness stalled and remains unverified. This is
a development-only candidate; production was not modified or deployed.

## Historical local development candidate — TPI-STUDIOFLOW-122F.2B

The authoritative `8787` Worker now serves the D122F.2B individual embedded
image-removal correction from isolated StudioFlow source commit
`a9f0207876944b37c234e16b73d9e6a6863a9c8a`. Selecting an embedded figure shows
a contextual Delete Image control; deletion targets only the selected figure
and uses the browser editing undo stack. Stored attachment IDs and objects are
preserved.

Exact staged assets:

- `/studio/assets/index-iWHM28jf.js` — SHA-256
  `a06403c49de188a6e5d534f00512e05da58271dde48f74bafe4598ae6d1306af`
- `/studio/assets/index-Py1pkkT-.css` — SHA-256
  `11e1a67b3cd18447de5691edaca14b5a103df2c3e7151260ec542c78de98c4a2`

Image-specific Firefox checks pass; maintained Firefox passes 64/64, release
safety passes 21/21, and the provenance workflow verifies reproducible builds
and exact staged assets. The broader Notes harness has a repeated disposable
fixture hydration failure, so image autosave/refresh and trusted keyboard
actions remain unverified. This is a development-only candidate; production
was not modified or deployed.

## Historical local development candidate — TPI-STUDIOFLOW-122B

The authoritative `8787` Worker currently serves the development-only D122B
automatic Notes title refinement from isolated StudioFlow source commit
`8a68c677fa8c29cd2dffe3fc7edb29ef1a9919a5`. Its exact staged assets are:

- `/studio/assets/index-BkV9BhfI.js` — SHA-256
  `140141d76481fa3288fea1560ba564e59887e7e0c9a0c93952b7b0624adc6040`
- `/studio/assets/index-DCzHEnai.css` — SHA-256
  `c0a544549f0d440a3c017a3c4098158e62610b8cc36d7222b71cbeaaba9ece2c`

The candidate was built twice from the exact clean source commit, matched the
maintained release baseline, and passed real Firefox D122B acceptance 40/40,
maintained Firefox regression 64/64 and release-safety 21/21. It is not a
production release. No production deployment is authorized by D122B.

## Current local development candidate — TPI-STUDIOFLOW-122D

The authoritative `8787` Worker now serves the D122D user-created folder
refinement from isolated StudioFlow source commit
`bf93bb58a72eb0f5b0e47f401af0ebd97daa77ef`. Its exact staged assets are:

- `/studio/assets/index-BjXZX1EX.js` — SHA-256
  `3568f459649e1b5f9ec01faa1440bb273121cedfaded88f6d32ff600750d7e47`
- `/studio/assets/index-CbVCorKW.css` — SHA-256
  `fafd2c34bac71f309a2656d959892cbff992535be9d5327387d070b43e89cbf9`

The candidate was built twice from the exact clean source commit and passed
real Firefox acceptance 57/57. No database migration was required because the
existing migration 0055 `parent_id` relationship already supports nested
collections. This is a development-only candidate; production is unchanged.

## Current local development candidate — TPI-STUDIOFLOW-122F.2

The authoritative `8787` Worker now serves the D122F.2 Notes attachment
control cleanup from isolated StudioFlow source commit
`009211f13a1dd8ef6c7caed7fa94840eba7337b1`. The toolbar photograph and
paperclip controls are the retained chooser actions; the duplicate
above-toolbar Attach Files control and permanent footer chooser are removed.
Editor drag/drop and clipboard insertion remain available.

Exact staged assets:

- `/studio/assets/index-52sL-vjB.js` — SHA-256
  `6c7d5871f41bc1d3e30d56648e73d39a372e3acf1f90df507c266e4a34a641e5`
- `/studio/assets/index-ChghdUBo.css` — SHA-256
  `b7d6b2e0c427c3a79857268926ceeb2613fa4edd0eb140934e460aace57e8e2d`

The exact source-provenance workflow built the clean source twice and passed
`--verify-only` after staging. Focused Notes acceptance passes, the
D122F.1 rail verifier passes 13/13, maintained Firefox passes 64/64 and
release safety passes 21/21. This is a development-only candidate; production
was not modified or deployed.

## Historical local development candidate — TPI-STUDIOFLOW-122F.1

The authoritative `8787` Worker now serves the D122F.1 Notes organization rail
correction from isolated StudioFlow source commit
`b9a7772fec70ceb4143deaa03963b89072a56564`. Its exact staged assets are:

- `/studio/assets/index-lCAgDCwK.js` — SHA-256
  `240717548162c54cdbad49289b375e6c17e9c85e058f012ab46cf01cbed5ed48`
- `/studio/assets/index-D9akxKCz.css` — SHA-256
  `bc541f62a96352584b811fdc308bf4f4b71888fd7d586b4285887fbc2839f980`

The source-provenance workflow built the clean source twice and passed
`--verify-only` after staging. Focused rail geometry checks pass 13/13,
maintained Firefox passes 64/64 and release safety passes 21/21. This is a
development-only candidate; production was not modified or deployed.

## Historical local development candidate — TPI-STUDIOFLOW-122F

The authoritative `8787` Worker now serves the D122F Notes completion candidate
from isolated StudioFlow source commit
`ef2377f8b92b278bdab67c18d51a44c5a63c3dd9`. Its exact staged assets are:

- `/studio/assets/index-B0cx-IId.js` — SHA-256
  `240717548162c54cdbad49289b375e6c17e9c85e058f012ab46cf01cbed5ed48`
- `/studio/assets/index-DNQBejED.css` — SHA-256
  `75f2a65407810b92b9baea6fb0694bb3f5f802b67154e1044dbc3b9d8d7a3261`

The exact source-provenance workflow built the clean source twice and passed
`--verify-only` after staging. Focused D122F Firefox Notes checks pass 11/11;
maintained Notes acceptance passes, maintained Firefox passes 64/64 and
release safety passes 21/21. This candidate is development-only and remains
PARTIAL pending native attachment/recovery, interruption/concurrency, full
revision-restore, all-theme, Chrome/Safari and device acceptance. Production
was not modified or deployed.

## Historical local development candidate — TPI-STUDIOFLOW-122E.1

The authoritative `8787` Worker now serves the D122E.1 Home Create section
layout correction from isolated StudioFlow source commit
`1e08da2b651136ea19a654ad03b97ddd45ca4457`. Its exact staged assets are:

- `/studio/assets/index-DmaCJVhN.js` — SHA-256
  `e0a7d71aa44da90ab2db5c15b1e4deba89562e4059d1e83475a8a4efcb2dde2d`
- `/studio/assets/index-DLIu5icU.css` — SHA-256
  `e09191f0e7f94bacea4e63876cf3d5e407c9b7076d7f4ab35203e71992e0ea13`

The candidate was built twice from the exact clean source commit and staged
through the provenance-checked workflow. Focused D122E.1 Firefox acceptance
passes 19/19 across wide desktop, medium desktop, tablet and mobile layouts;
maintained Firefox passes 64/64 and release-safety passes 21/21. This is a
development-only candidate. Production was not modified or deployed.

## Historical local development candidate — TPI-STUDIOFLOW-122E

The authoritative `8787` Worker now serves the D122E Home navigation and
deletion-dialog usability correction from isolated StudioFlow source commit
`046ae3aaeebf9945597ce7373f5a9ada8a00cd37`. Its exact staged assets are:

- `/studio/assets/index-CAngUv37.js` — SHA-256
  `e0a7d71aa44da90ab2db5c15b1e4deba89562e4059d1e83475a8a4efcb2dde2d`
- `/studio/assets/index-CxtEcOJP.css` — SHA-256
  `c4a34d03e42c981b2168e6287e232552ba1cdcb0676b2067ff33cbe573487254`

The source was built twice from the exact clean commit and staged through the
provenance-checked workflow. Focused D122E Firefox acceptance passes 22/22;
maintained Notes acceptance passes 57/57, maintained Firefox passes 64/64 and
release-safety passes 21/21. This is a development-only candidate. Production
was not modified or deployed.

## Historical local development candidate record — TPI-STUDIOFLOW-118

The authoritative `8787` Worker currently serves the exact isolated source
revision `244993beab7f9fbba7ee89376a3b3dea616fa62a`, whose parent is the D117
private stage reader commit and whose history includes the verified Teleprompter
092 commit `05a9aa5cd7b4ccb94d11162f244d2281fcd572bb`.
The candidate assets are:

- `/studio/assets/index-DG-_pPI_.js` — SHA-256
  `66f9407e808f74c803491917efcb412566301f4feca6df20978cd64dc48d7560`
- `/studio/assets/index-28KfU4BI.css` — SHA-256
  `48b3b88702dde14713240d89a31e3057e58a53a1bea5356c0ba569aee77dea6f`

The exact source-provenance workflow built the clean source twice, verified
reproducibility, applied the generated assets, and compared the staged files
with the Worker watcher output. The candidate was then verified on the actual
`8787` Worker in disposable Firefox Developer Edition acceptance, including
toolbar/sidebar behavior, UI-created script ordering, all right-sidebar panels,
saved-script selection, transparent private stage reader controls, decoded
non-silent recording audio, playable video and frame-level canary privacy. It is
a development candidate for owner testing, not a production release.

## Historical local development candidate record — TPI-STUDIOFLOW-122A

The authoritative `8787` Worker currently serves the D122A Notes refinement
from isolated StudioFlow source commit
`fd4d2758f689f4731516055887cbac4df5c1f3dd`. The candidate is development-only;
it does not change the D121 production Worker or release baseline. Its assets
are:

- `/studio/assets/index-6-25XtSS.js` — SHA-256
  `70d7b5124a134765e606b493710f06316410157ef790702a38d8bd85004e4b2e`
- `/studio/assets/index-DCzHEnai.css` — SHA-256
  `c0a544549f0d440a3c017a3c4098158e62610b8cc36d7222b71cbeaaba9ece2c`

The candidate preserves the D122 Notes data model and adds connected panels,
persistent collapse/resize state, Focus Mode and the accessible icon toolbar.
The source-provenance workflow built the clean source twice and matched all
staged files. Real Firefox acceptance passes 33/33. Native file chooser,
pointer-drag, full theme and Chrome/Safari/device checks remain open. Do not
deploy this candidate under D122A.

## Prior local development candidate — TPI-STUDIOFLOW-122

The authoritative `8787` Worker currently serves the additive D122 Notes
candidate from isolated StudioFlow source commit
`96e28a3de4129fb248a32fe0a7f0e0527409ebc9`. The candidate is development-only;
it does not change the D121 production Worker or release baseline. Its assets
are:

- `/studio/assets/index-C48-jDnZ.js` — SHA-256
  `2b24c5295c7457f948fdf0109a5453c760cd103b7d6a642c4d69676d19a96314`
- `/studio/assets/index-D6SZajag.css` — SHA-256
  `340a54faf4f643d668dbecffe2d26883d94b9983616f7d195d9551a6feb2765c`

The candidate includes the independent Notes workspace, local D1 Notes schema,
private attachment routes and Studio sidebar. Source provenance built the clean
approved source twice and matched the staged files. The D122 execution record
lists the focused acceptance and the remaining unverified scope. Do not deploy
this candidate under D122.

## Prior local development candidate — TPI-STUDIOFLOW-120

The D120 candidate is built from isolated StudioFlow source commit
`a8a7d11759905ae4bf8043005e0c2259b1fd6a81` in
`/Users/toddknipple/Documents/StudioFlow/web-120`, branch
`codex/studioflow-120-screen-share`, and staged into the existing local Worker
through the disposable `.local-dev/tpi-studioflow-120-baseline.json` manifest.
The production release manifest was not changed. The staged assets are:

- `/studio/assets/index-CgmAxo34.js` — SHA-256
  `f4bd273c8fe8f60ef6025389b0738b03f392a9d3d618fe3433b819083e1a3595`
- `/studio/assets/index-DpwwYG6_.css` — SHA-256
  `869e46025ce505491069a596af277bdacdd9df6a3493ac1e8db0c03a58a6b619`

The staging tool built the candidate twice, verified matching hashes, and
confirmed the integrated entry point. The D120 panel and its Firefox UI
acceptance are staged on port 8787. Native browser picker selection and actual
captured-media recording are still pending manual acceptance; this candidate
must not be called a production release or used as evidence that Chrome,
Firefox native capture, or Safari capture has passed.

## STUDIOFLOW LOCAL DEVELOPMENT ENVIRONMENT POLICY

The Paranormal Initiative maintains one authoritative owner-facing StudioFlow
local development environment.

| Policy item | Official value |
| --- | --- |
| Official URL | `http://127.0.0.1:8787/studio/` |
| Official runtime | Local Cloudflare Worker (`workerd`) |
| Official startup | `npm run dev:local` |
| Local backend | Cloudflare Worker development runtime with local D1 and local R2 |
| Local persistent data | Repository-relative `.local-dev/state/v3`; absolute path `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/.local-dev/state/v3` |
| Environment type | Local development; production is separate and explicitly authorized |

All StudioFlow feature development intended for owner acceptance must
ultimately be verified through port 8787. Temporary isolated environments may
be used for automated engineering verification when necessary, but:

1. They are not authoritative.
2. They must not replace port 8787.
3. They must not be presented as the owner's primary development application.
4. They must not become permanent competing development servers.
5. Owner acceptance occurs through port 8787 unless the owner explicitly
   authorizes an exception.
6. Existing Studio data and recordings must be preserved.
7. Changes to the official localhost require explicit owner authorization.

Changing localhost ports creates separate browser-storage origins. An isolated
preview therefore does not automatically contain the owner's existing Studios,
recordings, scripts or preferences. Port 5192 is retired Directive 113 test
infrastructure and must not be recreated.

## TEMPORARY TEST AND PREVIEW ENVIRONMENTS

Directive 113 historically used `http://127.0.0.1:5192/studio/` as a temporary, local-only
Vite production preview of Teleprompter 092 from detached commit
`05a9aa5cd7b4ccb94d11162f244d2281fcd572bb`. It had no Cloudflare Worker, D1,
R2, or authenticated backend and used a separate browser storage origin. It
was suitable for isolated feature acceptance, not for the owner's existing
Studio environment. The preview was retired after Directive 114 verified that
no active test depended on it. Its clean generated staging worktree was removed
under the mandatory amendment; the approved commit and evidence remain
preserved.

Temporary previews must always be labeled as temporary and must never be used
interchangeably with the authoritative owner localhost or production. Port 5192
is retired and must not be restarted or recreated as a competing StudioFlow
environment.

## MANDATORY ENVIRONMENT IDENTIFICATION CHECK

Before staging or accepting any StudioFlow change, record all of the following:

1. The exact URL and port being tested.
2. The process, working directory, repository, branch and source commit.
3. Whether the runtime is the authoritative local Worker, a temporary preview,
   a remote development Worker, or production.
4. The backend bindings, browser storage origin, and locations of Studio,
   script, preference and recording state.
5. Whether the environment is allowed to access owner data.

Do not call a temporary preview "development" without this classification. Do
not clear, migrate, recreate or overwrite owner browser/D1/R2 state to make two
origins appear equivalent. Do not stage an unapproved feature into the owner
localhost by changing the production release baseline; use a separate reviewed
development candidate and the normal source-provenance workflow.

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
3. From the website repository, build and integrate the exact approved source
   revision:

   ```sh
   cd /Users/toddknipple/Documents/GitHub/paranormal-initiative-website
   node scripts/stage-studioflow-authoritative.mjs --verify-only
   node scripts/stage-studioflow-authoritative.mjs --apply
   ```

   The staging tool builds exactly the approved source commit recorded in
   `scripts/studioflow-release-baseline.json`, twice, from an isolated clean
   worktree of that commit — never from a working tree. It verifies
   reproducibility, compares the generated JavaScript and CSS against the
   recorded known-good hashes, compares the result against the staged website
   assets, and preserves the maintained TPI bridge layer. `--verify-only` never
   writes; `--apply` is the only way to copy the verified generated files into
   `studio/`. It does not deploy.
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

## Approved source selection and staging verification (TPI-STUDIOFLOW-107)

The release source identity is recorded in
`scripts/studioflow-release-baseline.json`: the approved source repository, the
exact approved source commit, and the known-good production asset hashes. The
staging workflow builds exactly that commit and refuses everything else:

- A `--source-repo`, `--source-commit` or `--source-worktree` statement is
  accepted only when it matches the recorded identity. Unauthorized source
  paths, missing commits, unexpected commits, foreign worktrees, worktrees not
  at the approved commit, and dirty worktrees are rejected before any build.
  There are no bypass flags.
- Build inputs are the tracked files of the approved commit, taken from a
  disposable detached worktree of that commit or a provided clean worktree
  pinned at it. The mixed development checkout is never a build source.
- The build runs twice in clean conditions; both artifact trees must be
  identical, and the generated JavaScript and CSS must reproduce the recorded
  hashes exactly. A difference is reported, never repaired by editing code.
- `--verify-only` (the default, and what `release:preflight` runs) rebuilds and
  compares against the staged website assets and never writes. `--apply` stages
  only the verified generated files into `studio/` and re-verifies afterwards.
- To release a new source revision, record its approved commit and asset hashes
  in the baseline inside the release commit, then verify and apply.

Regression coverage: `npm run verify:studioflow-107-provenance` (disposable
fixture rejection cases plus the real baseline reproduction).

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

## Current verified live baseline — TPI-STUDIOFLOW-119

- Website production release commit: `6d4c062ce0c3b647f39d3b5e3004531d692f62ba`
- Authoritative StudioFlow source commit: `244993beab7f9fbba7ee89376a3b3dea616fa62a`
- Active production Worker version:
  `f5af1836-8cf8-4a3c-9db7-18c53ff9ded2` (100% traffic)
- Immediate rollback version:
  `91a8460e-1db1-440c-9643-a85b6e178fba`
- Live JavaScript: `/studio/assets/index-DG-_pPI_.js` (SHA-256
  `66f9407e808f74c803491917efcb412566301f4feca6df20978cd64dc48d7560`)
- Live CSS: `/studio/assets/index-28KfU4BI.css` (SHA-256
  `48b3b88702dde14713240d89a31e3057e58a53a1bea5356c0ba569aee77dea6f`)

The guarded release passed source-provenance and release-safety checks, local
authenticated lifecycle verification, live anonymous smoke 10/10, and isolated
Firefox production acceptance 64/64. No D1/R2 migration, reset, deletion or
credential change occurred. Permanent Studio deletion remains disabled.

The rollback procedure is the maintained guarded Wrangler rollback to
`91a8460e-1db1-440c-9643-a85b6e178fba`, followed by the same authentication,
Studio access, smoke and Firefox acceptance checks. The previous baseline is
preserved as historical evidence below.

## Previous verified live baseline — TPI-STUDIOFLOW-106 (historical)

- Website production source commit: `9b3f033`
  (TPI-STUDIOFLOW-106 production release; application byte-identical to `81a234a`)
- Authoritative StudioFlow source commit: `6b9c3c4`
- Active production Worker version:
  `91a8460e-1db1-440c-9643-a85b6e178fba`
  (deployed 2026-10-27T20:41:35Z)
- Immediate rollback version:
  `17b9f9d5-717e-42a9-92d1-14b0dd717ef6`
  (prior TPI-STUDIOFLOW-105-era release)

The current live entry point loads `/studio/assets/index-D1h4nSZd.js` and
`/studio/assets/index-CcFjA_0p.css` (SHA-256 `4eed57a4…` / `850186…`). The
TPI-STUDIOFLOW-106 guarded release passed local auth lifecycle, complete preflight
(lifecycle/ownership/deletion/safety, reproducible staging, Cloudflare, dry-run),
live smoke 10/10, isolated Firefox production acceptance 64/0, and Video Setup 091
9/0 on the byte-identical candidate. Both permanent deletion modes remain disabled.
Physical-device and owner acceptance remain pending. Prior release baselines are
recorded in the per-release sections below.

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

## Local podcast project folders (TPI-STUDIOFLOW-122H.1)

Local-folder synchronization is an opt-in browser capability layered on the
read-only 122H project export. It must be verified and staged through the same
authoritative port 8787 workflow. The application may persist an explicitly
authorized `FileSystemDirectoryHandle` and sync metadata in browser IndexedDB,
but it must never write in the background, require a connected folder to run,
or use local files as the authoritative project store. `Download Project` is
the required fallback when the browser lacks File System Access API support.

Before reporting completion, a supported browser must select a real temporary
folder through its native permission UI, synchronize a disposable project,
inspect the resulting files outside StudioFlow, and verify that an externally
modified file is preserved rather than silently overwritten. Native picker or
Finder/File Explorer inspection that cannot be completed is UNVERIFIED.
