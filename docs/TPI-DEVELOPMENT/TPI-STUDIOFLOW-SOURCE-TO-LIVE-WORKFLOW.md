# StudioFlow Source-to-Live Workflow

Status: ACTIVE / CANONICAL

Last verified: 2026-11-01

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

## MANDATORY SOURCE-LINEAGE CHECK — TPI-STUDIOFLOW-134 (2026-11-01)

The StudioFlow repository contains **two live lineages** that both branch from
`main` (`9f85f9d`). Selecting a source revision from the wrong one silently
removes approved features from the shipped bundle:

| Lineage | Head | Contains |
| --- | --- | --- |
| Development | `codex/studioflow-122-notes` (`a6784cf`) | Notes workspace, podcast project export, local project folder sync, private stage Teleprompter reader, TPI-125 Teleprompter scene items, TPI-126A production-item colors |
| **Release** | `codex/tpi-133` (`e608ca9`) | `main` + TPI-130/131/132R deletion work + TPI-133 menu anchoring. **None of the development line.** |

Every build from TPI-130 through TPI-133 came from the release lineage, which is
why production-item colors, icons, highlighting and Teleprompter-to-Scenes drag
were reported missing: they were absent from the artifact, not mis-rendered.

Before recording a new `approvedCommit` in
`scripts/studioflow-release-baseline.json`, verify the feature you are releasing
is actually reachable from that commit. `git merge-base --is-ancestor <feature>
<approved>` returning non-zero means the feature is **not** in the release and
will silently disappear.

A full merge of the two lineages is not a safe default: it conflicts in 22 places
across `src/App.tsx`, concentrated in the hardened deletion subsystem.

## Current approved source and release baseline — TPI-STUDIOFLOW-137 (2026-11-02)

The approved StudioFlow source is now
`cd5e88b03bd364a3a3d4ffe376f2915f19bd0f19` on branch
`codex/tpi-137-notes-restoration`, worktree
`/Users/toddknipple/Documents/StudioFlow/web-137`, descending from the released
lineage head `f44f3a0`. It restores the complete Notes workspace that the
TPI-STUDIOFLOW-130 baseline silently dropped by pinning a sibling lineage.

Exact staged assets, served by the authoritative `8787` Worker:

- `/studio/assets/index-LICdWePz.js` — SHA-256
  `7e7406463a7ba7ff52966e3aa0a001e0990f63d69d3febdbfe3fdedfe67a3e82`
- `/studio/assets/index-8ILYgVKI.css` — SHA-256
  `bd696c76980940ad5c121b801055ced1d015d1c005e9b8a3adb283e0f3f70184`

Both builds of the approved commit were byte-identical, matched the recorded
baseline, and staged with all eleven maintained bridge files preserved.
Firefox Developer Edition acceptance passes 36/36; maintained Firefox 64/64,
TPI-133 44/44, TPI-134 43/43, TPI-135 30/30, TPI-087 40, TPI-088 32,
TPI-089 26, Notes continuity 14/14 and release safety all pass.

### This baseline does not deploy

`scripts/studioflow-release-baseline.json` records
`productionSchemaRequirements`. `release:production` runs
`scripts/verify/tpi-studioflow-137-production-schema.mjs` before any upload and
**refuses to deploy** while a required table is missing. Production D1
`tpi_contributor_portal` currently has no `studio_note_*` table, so the restored
Notes interface could not persist there. Migrations `0055`, `0056` and `0057`
must first be authorized and applied once each, in order, under a migration
release. `0055` is idempotent; `0056` and `0057` are not, because SQLite has no
`ALTER TABLE ... ADD COLUMN IF NOT EXISTS`.

The production `d1_migrations` ledger is not authoritative (two rows against 60
migration files, and `studio_media_assets` from 0054 exists without
`studioflow_workspaces` from 0051). Do not run a blanket
`wrangler d1 migrations apply` against production.

### New release guards

- `scripts/verify/tpi-studioflow-137-notes-continuity.mjs` (runs in
  `release:preflight`): the approved commit must descend from
  `source.previousApprovedCommit`, and the approved source and staged bundle must
  still contain the Notes entry points and markers. A deliberate sibling-lineage
  port requires `TPI_RELEASE_LINEAGE_OVERRIDE` with a written justification.
- `scripts/verify/tpi-studioflow-137-notes-restoration.mjs`: the Firefox
  acceptance suite for the workspace, its two entry points and its
  account-backed persistence across a refresh.

## Current local echo of the released build — TPI-STUDIOFLOW-135

The authoritative `8787` Worker serves the TPI-134R build **plus** the
TPI-STUDIOFLOW-135 persistence correction. Only the unbundled
`studio/workspace-bridge.js` changed, so the hashed bundle identity is
unchanged (`index-D9yljEwa.js` `e317fc07…`, `index-D6ZhUVW1.css` `1baa338c…`)
and `scripts/studioflow-release-baseline.json` needs no update. Restage with
`stageStudioAssets()` and restart the managed local Worker after editing a
bridge, then confirm the served file contains the change before testing.

The correction adds `teleprompter-script` and `teleprompterScriptId` to the
bridge's Scene panel normalizer and to the server's
`normalizeStudioConfiguration()`; a new kind added to only one of them is
silently discarded. That correction is live: TPI-STUDIOFLOW-135R deployed
2026-11-02T01:14:50Z as Worker `3082475b-80ad-4557-82d6-32618e3f7079` from
website commit `44c707f`, with `4de115db` retained as the rollback target. The
bundle identity is unchanged, so this is the TPI-134R application plus the fixed
server normalizer and bridge.

## Current released StudioFlow build — TPI-STUDIOFLOW-134R

This candidate was released on 2026-11-01T22:37:19Z as Worker
`4de115db-6537-41b5-9bf7-ae99cb0e20fc` from website commit `ea2ca6a`, with
`71a5293d` retained as the rollback target. Live verification confirmed the
served bundle is byte-identical to the hashes below, the five production colors
render with full-perimeter borders, and a Scene Teleprompter item cues the live
presenter teleprompter paused at the beginning with Play, Pause and Reset
working. Live limitation carried into the next directive: a dropped Scene script
row does not survive a page reload in an account-backed Studio because the
workspace snapshot never stores `scenePanelItems`. That limitation was corrected
and released in
[TPI-STUDIOFLOW-135R](100-DIRECTIVES/TPI-STUDIOFLOW-135R-PRODUCTION-RELEASE.md).
See also the
[TPI-STUDIOFLOW-134R release record](100-DIRECTIVES/TPI-STUDIOFLOW-134R-PRODUCTION-RELEASE.md).

The authoritative `8787` Worker serves the TPI-STUDIOFLOW-134 restoration of
production-item colors and Teleprompter-to-Scenes drag-and-drop from clean
StudioFlow source commit `f44f3a08cfc0efa271385125c6780557aaa85fb9` on branch
`codex/tpi-134` (worktree `.local-dev/worktrees/source-134`, built from the
released lineage `e608ca9`). Exact staged assets are:

- `/studio/assets/index-D9yljEwa.js` — SHA-256
  `e317fc071f4968e375f8b11970d862692a3fe28fa1cc55140d3471d884f55246`
- `/studio/assets/index-D6ZhUVW1.css` — SHA-256
  `1baa338c09f29395f292cf1fed415baa700c1544e79b0d723c4c60988e6b3cb6`

The Scene Teleprompter item is a production action, not a preview: selecting it
cues the existing live presenter teleprompter (`prompterOverlayOpen`) by the
script's persisted id, rewinds it to the start and leaves it paused. The reader
dialog (`teleprompterOpen`) remains the explicit Teleprompter control surface and
is never opened by a Scene item.

The source was built twice by the provenance workflow, verified reproducible,
matched against the recorded hashes, and staged with all eleven bridge files
preserved. Firefox Developer Edition acceptance passes 64/64 maintained and
43/43 focused (all five approved colors, full-perimeter borders, selected and
dragging states, drop-target highlighting, assignment, persistence, plus
Scene-to-live-teleprompter cueing, Play/Pause/Reset scrolling, script switching,
refresh recollection and deleted-script handling); Scenes panel passes 20/20,
provenance passes 20/20 and release safety passes. Deletion, Studio management,
storage, Notes and bridge files are unchanged. Production runs this bundle
identity with the TPI-135 scene-item persistence correction (Worker
`3082475b-80ad-4557-82d6-32618e3f7079`, website commit `44c707f`); the previous
Worker `4de115db-6537-41b5-9bf7-ae99cb0e20fc` is the verified rollback target.
`verify:studioflow-035` cannot pass on this lineage because it asserts the
unreleased private Teleprompter reader.

## Historical local development candidate — TPI-STUDIOFLOW-122F.4A

The authoritative `8787` Worker serves the Notes Trash restoration and
attachment-safe permanent-deletion correction from clean StudioFlow source
commit `9703b087e91e85e0f791f618a90f9b2c4eeb5160`. Exact staged assets are:

- `/studio/assets/index-2zeoh76e.js` — SHA-256
  `bbe0e82636bf2c80d9fd5a720590343f32895d2d79ddede86c432d684ead2912`
- `/studio/assets/index-Y3KKfVMj.css` — SHA-256
  `b60d93eb648c49585d5c57200a99313334a2ff390422e71cc0396365d02aae18`

The source was built twice from the exact clean commit and staged with matching
hashes. Attachment-bearing permanent deletion audits cross-note and revision
references, fails closed when shared, and retains private R2 bytes because the
current architecture has no atomic D1/R2 cleanup ledger. Maintained Notes
regression and release safety pass. The rendered Firefox missing-folder notice
remains unverified because the isolated browser harness intermittently fails
to select the disposable Trash card. This candidate is development-only;
production remains unchanged.

## Current local development candidate — TPI-STUDIOFLOW-122F.4

The authoritative `8787` Worker serves Notes Trash, restore, deletion metadata,
and explicitly confirmed permanent deletion from clean StudioFlow source commit
`ddc8eed4321510a86da35d7a1bb35f0cf8b8a50e`. Exact staged assets are:

- `/studio/assets/index-C7r7gqow.js` — SHA-256
  `5c5ba8b78bc638b0258b2f1fa1d5c85fcdcd934d4e51c424d8e318074b38982a`
- `/studio/assets/index-Y3KKfVMj.css` — SHA-256
  `b60d93eb648c49585d5c57200a99313334a2ff390422e71cc0396365d02aae18`

The source was built twice from the exact clean commit and staged with matching
hashes. Focused Firefox core Trash acceptance, maintained Notes regression, and
release safety pass. The server safely falls back to All Notes when a deleted
folder is unavailable; the browser-only visible notice observation remains
unverified. This candidate is development-only; production remains unchanged.

## Current local development candidate — TPI-STUDIOFLOW-122F.3

The authoritative `8787` Worker serves the Notes organization-panel sizing
correction from clean StudioFlow source commit
`7f3a3e37850163d78a97e97fce05693fdf48ea84` in the isolated
`codex/studioflow-122-notes` worktree. Project and folder names wrap within a
bounded organization track, action menus remain visible, and a container query
activates the existing stacked layout when the available Notes content width is
narrow. The browser acceptance also verifies the existing collapse/expand rail,
Note Library resize preference, Focus Mode, editor continuity, and no narrow
toolbar overflow.

Exact staged assets:

- `/studio/assets/index-HFCjseSC.js` — SHA-256
  `89f744d4ca0a889001acb94f2afd6826609a8c64cee02ad23508f0f4da8a14b3`
- `/studio/assets/index-CIEmHEyE.css` — SHA-256
  `a0e6c7c29f3f72eb3d5ad58110f5d8cc352216ea5efd12766b2c7c7d1761aca8`

The source was built twice from the exact clean commit and passed staging
verification. Real Firefox Notes acceptance passes, maintained Firefox passes
64/64, and release safety passes 21/21. This is development only; production
remains unchanged.

## Historical local development candidate — TPI-STUDIOFLOW-122F.2D

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

## Current verified live baseline — TPI-STUDIOFLOW-133 (2026-11-01)

- Website release commit: `b2868f6d1f1203d03143d6f9edd008dea3b7cf36`
  (implementation `f182bc5`)
- Active production Worker version:
  `71a5293d-fef4-4643-bf50-e9dfc7327eb5` (100% traffic)
- Immediate rollback version: `cd37afb8-cc82-406a-9e15-e84b3dffa234`
- Authoritative StudioFlow source commit:
  `e608ca9414d27f96058503c53865a8b03993ab7a` (StudioFlow branch
  `codex/tpi-133`, descending from the 131/132R baseline
  `fb95c43ce79dd0dfcf3f880eb34555d746c5c8ce`)
- Live JavaScript: `/studio/assets/index-mYnRoDcA.js` — SHA-256
  `03802154c34011f58bd5313af24d6bcebda1cf0c413f7c91ff699ad36fe2522f`
- Live CSS: `/studio/assets/index-B-jk8V4i.css` — SHA-256
  `c64c8f9d996c6632af4e067b088abe3d9db6ba9f4d31128165f1a24139a17d65`
- Maintained Studio workspace bridge `studio/workspace-bridge.js` remains
  `9e69ee7064a9314be1026646f3d6d34ff1e123695ff996e3edd208d2911ac573`
  (this release stages no bridge change)

This release changes only the StudioFlow application bundle and the release
baseline: the Studio card **More Actions** menu is anchored to the card that
opened it instead of the top-right corner of the viewport. Studio creation,
switching, persistence, renaming, archiving, permanent deletion and every
server authorization and safety guard are unchanged. The website-side
regression is `scripts/verify/tpi-studioflow-133-floating-studio-menu.mjs`
(44/44, including eight checks in a genuine 390 px phone viewport), now part of
`release:preflight`. Verified live: anonymous smoke, live
isolated Firefox acceptance 64/64, and a focused non-destructive production
acceptance 16/16 confirming the menu opens beneath its own More Actions button
and stays inside the viewport on the live site.

## Prior verified live baseline — TPI-STUDIOFLOW-132R (2026-11-01)

- Website release commit: `d9af9024506e792221a111c7ec8c4016f7f69112`
- Authoritative StudioFlow source commit (unchanged by this release):
  `fb95c43ce79dd0dfcf3f880eb34555d746c5c8ce`
- Active production Worker version:
  `cd37afb8-cc82-406a-9e15-e84b3dffa234` (100% traffic)
- Immediate rollback version: `f4be38fb-9d26-45cb-9c48-5223a1d4c12c`
- Live JavaScript: `/studio/assets/index-B_8Inyh0.js` — SHA-256
  `e250a5e41376be2861c1fe0747165a189da193ca2f180c596d49b19750fd1abe`
- Live CSS: `/studio/assets/index-C_oD8YSH.css` — SHA-256
  `5bdc30cfd0945a8978cfff024af30af71886de0be8b13875b1abed3147f62040`
- Staged entrypoint file `studio/index.html` — SHA-256
  `ba80f8b040b6411b8d46cf1908a04a7a4a657834e479197d81c6d07508d79c64`
  (the served document hashes differently because the Worker injects its theme
  bootstrap at serve time)
- Maintained Studio workspace bridge `studio/workspace-bridge.js` — SHA-256
  `9e69ee7064a9314be1026646f3d6d34ff1e123695ff996e3edd208d2911ac573`
  (identical on the live site, verified authenticated after deployment)

This release changed only the maintained TPI bridge layer, not StudioFlow
source or generated bundle assets. It corrects permanent Studio deletion for
browser-local Studios carrying recovery snapshots, and normalizes server
deletion guards so blocked Studios explain themselves. Preflight, the local
authentication lifecycle (38 checks per phase), StudioFlow staging
verification, deletion/archive 32/32, deletion safety 26/26, Studio lifecycle
29/29, ownership 40/40, isolated Firefox release acceptance 64/64, production
smoke 10/10, live isolated Firefox acceptance 64/64, and a focused production
deletion acceptance 18/18 passed. No production D1 migration, reset, R2
cleanup or owner-data change occurred. Owner confirmation that the deletion
button activates in the owner's own production session remains pending.

## Prior verified live baseline — TPI-STUDIOFLOW-119 (historical)

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
