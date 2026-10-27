# TPI Current Development Status

## TPI-STUDIOFLOW-101 — BLOCKED (2026-10-26)

Partial local deletion repairs committed in isolated source `0a10451997e19a09ef2aae94bb9b25395603bfac`.
Local injected fixture tests 22/22, TypeScript, production build and unchanged 093 VM regression pass.
Existing ownership writers and older tabs do not coordinate with deletion locks; a last-moment
localStorage read is not atomic with IndexedDB deletion. **Content deletion now fails closed
before any mutation**; Studio-only retains blobs. This is an intentional blocked-development
behavior change, not safety completion or release readiness. Actual browser/IndexedDB and
cross-tab acceptance remain unverified. No 091/092 code, original-tree edits, push, merge or deployment.
Resolve all-writer coordination and old-tab handling before enabling cleanup. See
[Directive 101 evidence](100-DIRECTIVES/TPI-STUDIOFLOW-101-LOCAL-RECORDING-DELETION-SAFETY.md).

## TPI-STUDIOFLOW-100 — SOURCE ISOLATED (2026-10-26)

Deletion source is isolated on `codex/studioflow-100-deletion-isolation`, source commit
`8b72de811cf1623ac7d6caa5642a43e418d69924`. Paired website server branch:
`codex/studioflow-100-deletion-server`. The website commit is the commit introducing
[the Directive 100 execution record](100-DIRECTIVES/TPI-STUDIOFLOW-100-DELETION-ISOLATION.md).
Both worktrees are under the original website checkout's ignored `.local-dev/worktrees/`.
Original development file bytes and statuses were fingerprinted and verified unchanged.
TypeScript/build/isolation checks and 093 VM purge regression passed. 088 and 089 were
attempted but blocked before browser launch by missing isolated `test_admin` credentials.
No generated website assets, push, merge, deployment, or production mutation occurred.
No 091 or 092 code is included. This is not implementation-complete, safety-verified,
deployed, or owner-accepted. Preserve browser-local recordings; no new ownership DB.
The existing browser bridge already constructs local/shared blob lists; earlier claims
that the server must return them omitted that layer. Local error swallowing, reference
ambiguity, cross-tab races and dialog overflow remain for subsequent implementation.
See the execution record for exact files, build hashes, evidence and next actions.


Last verified: 2026-10-26

## Current source-to-live workflow

`TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md` is the canonical map for moving
StudioFlow from `/Users/toddknipple/Documents/StudioFlow/web` into the website
repository, committing and pushing the deployable checkpoint, running the
guarded production release, and verifying the live site in Firefox Developer
Edition. Source saves, local tests, Git pushes, development-Worker deployments,
and production deployments are separate events and must not be reported as if
they automatically synchronize.

## TPI-STUDIOFLOW-088 Deletion & Archive — Production Verification and Production Repairs — 2026-10-26

Status: `DEPLOYED / LIVE VERIFIED (agent) / OWNER ACCEPTANCE PENDING`.
Authenticated production verification of the Studio deletion suite reproduced
two production-only defects and both were repaired through the maintained
release path. (1) The boot-time Studio replay and identity convergence called
the React activation bridge, whose callback unconditionally opened the studio
view; on production latency the replay landed seconds after load and yanked
the owner (and the QA suite) out of Home mid-flow (`route: "studio"`, empty
card grid). Activations now carry a `background` flag: they restore Studio
state but never navigate after the owner has touched the interface, and
activation resolution is keyed on identity rather than route so bridge switch
bookkeeping cannot jam. (2) Archive/restore sent the menu's cached
`expectedVersion` with no retry and swallowed `workspace_conflict` (409)
failures silently — an autosave racing the request left the owner with a
ignored click. Archive/restore now retry once with the fresh version the
conflict response carries and report every failure in the panel status.
Verified: 088 deletion suite 39/39 including the new Test 11 view-guard
checks, on authenticated production with disposable QA Studios (evidence:
`300-COMPLETED-WORK/evidence/2026-10-26-studioflow-088-production-suite.json`)
and locally 39/39, 087 40/40, lifecycle 29/29, auth lifecycle 64/64. Three
guarded releases: source `9f85f9d` (StudioFlow repo); website commits
`5e206a7`, `6d9facb`, `7da1fb5` (pushed); live production Worker
`fb9ffdb9-137f-4e9e-b5a3-6c5c5fe1e91b`, rollback checkpoints `25f3d4ea` →
`d0dc37a5` → `5ee8b6d2` preserved. No database or storage changes; Crossroads
and all owner Studios untouched. Full record:
`300-COMPLETED-WORK/2026-10-26-TPI-STUDIOFLOW-088-DELETION-PRODUCTION-VERIFICATION.md`.

## TPI-STUDIOFLOW-087 Independent Studios, Studio Dashboards & Production Ownership — 2026-10-26

Status: `IMPLEMENTED / LOCAL TESTED / DEPLOYED / LIVE VERIFIED / OWNER
ACCEPTANCE PENDING`. The homepage listed non-ended Broadcast records while
My Studios listed Studio identities, so production titles masqueraded as
Studios and a server-backed Studio like Crossroads with no local Broadcast
record could never appear on the homepage. The Home page now shows a My
Studios card section built from the same authorized Studio collection as the
My Studios selector (server + browser-local, via
`window.__tpiStudioWorkspace.listStudios()`), and every Studio has its own
dashboard (Enter Studio, Create Livestream/Recording/Webinar, My Productions,
Recordings, Studio Settings). Studio and production creation are separate;
production creation offers an Owning Studio selector and every
livestream/recording/webinar is stamped with its Studio's stable host key at
creation (never from the dropdown selection or a title match). Rename,
Archive, and Restore Archived Studio work end to end (the server restore route
was missing and is now added). Permanent Studio deletion is deferred for
owner approval; historical productions without reliable ownership remain
preserved and unassigned. Verified: 087 suite 40/40 local and 40/40 on
authenticated production (isolated QA account; durable evidence in
`300-COMPLETED-WORK/evidence/2026-10-26-studioflow-087-production-suite.json`),
lifecycle 29/29, 033 26/26, local auth lifecycle 64/64. Source `db3aab4`;
integration `37803f3` + `815fb85` (pushed); production Worker
`b4605f5f-f33e-4f1d-8082-b12fc8bf5bdf`; rollback `6bbdae3d` preserved. The
five pre-existing static-contract suite failures and the timing-sensitive 030
rapid-upload step remain documented and open. Crossroads, Testing 123, and
Browser Only Crossroads were not modified. Full record:
`300-COMPLETED-WORK/2026-10-26-TPI-STUDIOFLOW-087-INDEPENDENT-STUDIOS.md`.

## Emergency Live Production Repair 001 — 2026-10-25/26

Status: `DEPLOYED AND AGENT-VERIFIED — OWNER ACCEPTANCE PENDING`. Four Studio
Management defects were repaired in `studio/workspace-bridge.js`: malformed
browser-local snapshot records (and a corrupt snapshot store) were silently
overwritten instead of preserved for recovery; the My Studios menu could hide
an existing browser-local Studio until an unrelated re-render; a stale menu
selection did nothing and said nothing; and a title conflict silently
disarmed the save integrity gate so a blocked switch fell through to the
browser-local save path and switched anyway. The cache-buster advanced to
`tpi-recovery=preserve-v1`. The owner-approved Testing 123 reset was executed
(one guarded UPDATE on `a75afc38-c7a6-452d-9460-5d746712d411`, full backup and
rollback SQL in `backups/`) and re-verified post-deploy: the stored row and
its live rendering are exactly the four clean default items with no inherited
Crossroads media. Verified with the maintained lifecycle suite 29/29 locally
and 29/29 on authenticated production (including the new H3/H4 preservation
checks), plus the Testing 123 render check 6/6. Deployed Worker
`6bbdae3d-f424-4373-87ff-84030df50a49`, rollback checkpoint `9d3aa40c`.
"Browser Only Crossroads" remains browser-local-only; a read-only owner
diagnostic procedure is in the completion record. Full record:
`300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001.md`.

## Owner Verification 001 — post-deployment Studio Management verification — 2026-10-25

Status: `AGENT VERIFIED — OWNER ACCEPTANCE PENDING`. The deployed Studio
lifecycle recovery was independently re-verified against authenticated
production with the isolated QA account: deployed Worker `9d3aa40c` confirmed
as the active 100% version (rollback `7bddac9c` intact), live application and
bridge assets byte-identical to the website integration, and the maintained
`verify:studioflow-studio-lifecycle` suite passing 25/25 on production and
25/25 locally (both creation workflows, A→B→A switching, isolation, refresh,
unsaved changes, failed-save handling, rapid switching, missing-snapshot
recovery). Read-only D1 inspection established that the owner's "Testing 123"
workspace (`a75afc38-c7a6-452d-9460-5d746712d411`) was created at 16:37Z
before the repair deployed and its saved state retains the historically
inherited eight-item Crossroads-like configuration (proposed remediation
awaiting owner authorization; nothing modified); "Browser Only Crossroads" is
browser-local with no server record and cannot be inspected from the server
side. The four-item vs eight-item difference is workspace data, not an
application mismatch. §11 gap closed: `release:preflight` now runs the
lifecycle suite, enforced by a release-safety contract check. The five
pre-existing static-contract suite failures (048/049/dev-024/dev-037/022) and
the timing-sensitive 030 rapid-upload step remain documented and open. No new
deployment was necessary. Full record:
`300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-OWNER-VERIFICATION-001.md`.

## Studio Creation, Switching & Workspace Isolation Recovery — 2026-10-25

The owner-observed Studio Management failures (new Studio inheriting the
active Studio's configuration; Studio switching silently failing; workspace
identity confusion) are repaired, deployed, and live-verified. Source commit
`44f9478` (StudioFlow canonical repository), application commit `161d03d`
(website integration, pushed), production Worker
`9d3aa40c-9a44-4bf9-bcf1-8efcbf837683` with rollback checkpoint
`7bddac9c-bda3-41c1-95d2-13aacc09cb28`; the live application serves
`/studio/assets/index-Drm85nEM.js` and `/studio/assets/index-8wAEEeJ8.css`.
Root causes: home-screen creation never reset per-Studio configuration;
browser-local Studios without snapshots made `openLocalWorkspace` silently
revert; failed pre-switch saves blocked switching with only a transient
message; only scene slices re-hydrated on switches. Repairs live in
`/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx` (clean creation
reset, complete per-Studio re-hydration, outgoing-Studio preservation) and
`studio/workspace-bridge.js` (per-broadcast configuration sync,
missing-snapshot recovery with visible notice, local recovery copies on save
failure, sticky truthful messaging). The maintained suite
`npm run verify:studioflow-studio-lifecycle` (Directive Tests 1–10 plus
owner-flow checks) passes locally and against production with the isolated QA
account; disposable Studios only, Crossroads untouched. Owner acceptance
remains pending. Full record:
`300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-STUDIO-LIFECYCLE-RECOVERY.md`.

## Production parity investigation — 2026-10-25

Read-only investigation under the archived parity-investigation
authorization. Authenticated production asset parity is verified three ways
(live ↔ website integration ↔ reproducible source build; all
byte-identical), so the owner's Studio symptoms are not caused by stale or
mixed deployments. The production Studio "Testing 123" discrepancy is a
pre-recovery create-path data condition: before the Studio Management
recovery, workspace creation merged the active Studio's localStorage asset
configuration into the new workspace, and the deployed bridge now creates
Studios from explicit clean defaults. "Testing 123" is owner-account data
whose stored state was not inspected; remediation requires owner
authorization. Reported deployments and suite counts remain labeled as
reported where they were not independently re-verified. Full evidence and
the proposed repair plan:
`300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-PRODUCTION-PARITY-INVESTIGATION.md`.

## Integrated Studio Management & Scene System Recovery — 2026-10-25

The integrated recovery is deployed and live-verified, with owner acceptance
pending. The confirmed source/application checkpoints are `657f80e` and
`e83b732` (website application/verification commit).
Local Firefox Developer Edition verification passed the new 21-check recovery
suite plus TPI-027 (12/12), TPI-028 (33/33), TPI-030 (25/25), TPI-031 (34/34),
TPI-033 (26/26), TPI-034 mutation regression, TPI-036 (28/28), TPI-037
(20/20), Addendum D (10/10), and Addendum E (20/20). The recording/storage
suite initially exposed a stale denied production-lock state after recording
finalization. The lock bridge now leaves denied reservations unlocked, and the
corrected Firefox suite passes 33/33.

Confirmed repairs include clean independent Studio creation, immediate
activation of the returned Studio identity, generation-guarded switching,
fixed in-viewport scene menus, removal of legacy Move Up/Move Down commands,
and meaningful scene configuration change notifications for autosave. The
canonical source build is reproducible and the staged entry point references
`/studio/assets/index-BZ_tF0DV.js` and `/studio/assets/index-8wAEEeJ8.css`.

The guarded release deployed Worker
`7bddac9c-bda3-41c1-95d2-13aacc09cb28` and reported 10/10 anonymous
production smoke and 64/64 isolated Firefox Developer Edition live checks,
with rollback `871c0ae7-33c5-46ae-b635-19ec3100c989`. (An earlier draft of
this paragraph claimed production "remains on the previously recorded
Worker" pending the release; that sentence predated the deploy and is
corrected here. The suite counts are the releasing agent's reported results
and were not re-run during the 2026-10-25 parity investigation.)

Independently verified 2026-10-25 (production parity investigation): an
authenticated isolated-QA session on production loads
`/studio/assets/index-BZ_tF0DV.js` and `/studio/assets/index-8wAEEeJ8.css`
byte-identical to the GitHub website integration, and
`stage-studioflow-authoritative.mjs --verify-only` reports
`generatedAssetsMatchIntegratedCandidate: true` with reproducible source
builds — original source, website integration, and production run the same
implementation. All eleven maintained bridge/override files are
byte-identical live versus the repository; the live HTML differs from
`studio/index.html` only by the intentional Worker theme bootstrap
(`worker.js`, `EARLY_THEME_BOOTSTRAP`) and the Cloudflare analytics beacon.
See `300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-PRODUCTION-PARITY-INVESTIGATION.md`.
No production D1, R2, owner Studio, recording, livestream, or media data was
changed under this recovery.

## TPI-STUDIOFLOW-037 Addendum E deployed repair — 2026-10-25

The owner-reported Scenes-panel failures are repaired in the canonical source
and verified locally. New Studios use Intro Video → Scene 1 → Scene 2 → Outro
Video; every production item has a working context menu; `Remove from Scenes`
persists without deleting media or saved scene configuration; new scenes use
the next available sequential name; and saved scene-layout deletion is
confirmation-backed. An individual Intro preview stop no longer starts After
Intro music. Natural Intro completion and sequence rehearsal retain the
configured production handoff.

- Source commit: `8fdabf4`
- Website application commit: `b1c21a0`
- Local Firefox Addendum E: 20/20
- Regressions: TPI-037 20/20; Addendum C 26/26; Addendum D 10/10; TPI-028
  33/33; TPI-030 25/25; TPI-031 34/34; TPI-033 26/26; TPI-034 PASS; TPI-035
  33/33; TPI-036 28/28; TPI-021 31/31
- Production status: superseded by the integrated recovery deployment in Worker
  `7bddac9c-bda3-41c1-95d2-13aacc09cb28`
- Rollback: `871c0ae7-33c5-46ae-b635-19ec3100c989`
- Guarded release: 17/17 safety contract, 10/10 anonymous smoke, and 64/64
  isolated Firefox Developer Edition checks passed
- Focused live Addendum E Firefox workflow: 20/20 with disposable production
  QA workspace archived after verification
- Owner acceptance: pending
- Completion record: `300-COMPLETED-WORK/2026-10-25-STUDIOFLOW-INTEGRATED-RECOVERY.md`

## TPI-STUDIOFLOW-037 production recovery reconciliation — 2026-10-25

The prior Addendum E release was serving the intended application bundle, but
its automated menu assertion only checked DOM existence. Firefox evidence
showed the React scene menu positioned outside the left rail and clipped by
the ancestor `.studio { overflow: hidden; }`. The canonical CSS now keeps the
menu inside the rail, and the maintained test requires a real Firefox click
plus a visible, in-viewport bounding rectangle.

- Source commit: `eff6b69`
- Website application/test commit: `877efb3`
- Loaded production assets: `/studio/assets/index-BfmRc0ua.js` and
  `/studio/assets/index-DB0QL1ns.css`
- Production Worker: `871c0ae7-33c5-46ae-b635-19ec3100c989`
- Rollback: `d58d7e1e-5f86-4c87-93b3-110999d200a9`
- Local focused Firefox Addendum E: 20/20 with visible-menu assertions
- Live focused Firefox Addendum E: 20/20 with disposable production QA
  workspace archived after verification
- Guarded release: `DEPLOYED_AND_VERIFIED`; smoke 10/10; live acceptance 64/64
- Owner acceptance: pending

## TPI-STUDIOFLOW-037 verified production release — 2026-10-24

The Scenes panel redesign, Addenda A/B visual corrections, Addendum B
reactive drag-and-drop repair, and the Addendum C visual-consistency and drag
interaction corrections are deployed and live-verified. The uniform
shortcut layer preserves the existing timer, Video Clips, scene, and
Background Music owners; its panel manifest is validated and saved through
the established per-Studio workspace configuration. TPI-037 passed 20/20 and
the maintained TPI-031 suite passed 34/34.

Addendum A corrected the injected Add Background Music / After Intro shortcut
to use the same 56px solid production surface, blue icon treatment, readable
two-line labels, and non-truncated standard labels as the other production
items. The extended TPI-037 suite passed 13/13 and the existing Background
Music suite remained 34/34.

Addendum B standardizes the exact Intro Video outer dimensions across
Background Music, Countdown Timer, Add Production Item, and Play Sequence;
keeps `Background Music` and `Countdown Timer` as stable visible labels;
preserves creator scene names with fixed-height controlled truncation/tooltips;
and leaves all saved assignments and playback architecture unchanged. Its
reactive drag repair adds live blue insertion feedback, surrounding-item
movement, Escape cancellation, edge auto-scroll, no-playback drag handling,
and autosave through the existing workspace configuration.

Addendum C corrects the owner-reported issues: single-line production labels
(`Intro Video`, `Countdown Timer`, `Background Music`, `Outro Video`) with
full-name tooltips instead of inconsistent wrapping/truncation, Background
Music buttons tinted with their assigned SmartPad track color (neutral when
unassigned), the same drag handle on every movable item, and a reactive drag
where surrounding rows visibly reposition around a live `Move here` gap that
follows the pointer before release. The Addendum C Firefox acceptance suite
passes 26/26 locally and 26/26 against the deployed interface using the
approved synthetic production QA account. Owner acceptance of the corrected
interface remains pending.

- Source commit: `d6b8f03` (Addendum C; prior `322b132`)
- Website application commit: `8a954ad` (Addendum C; test commit `dd22fc5`)
- Active production Worker: `5536bcc5-8c50-4851-b6e4-4a660eb1b0fb`
- Rollback: `1c752f3f-8af3-461f-8082-3dd8a447fd3d` (Addendum B release)
- Acceptance: TPI-037 20/20; Addendum C 26/26 local and production;
  TPI-020–036 suites pass; production smoke 10/10;
  isolated Firefox live acceptance 64/64;
  owner profile access false; release preflight and auth lifecycle PASS
- Completion record: `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-037-SCENES-PANEL-REDESIGN.md`

## TPI-STUDIOFLOW-037 Addendum D verified production release — 2026-10-25

Addendum D repairs production-item playback controls without replacing the
existing timer, Video Clips, Background Music, or rehearsal engines. Playable
media shortcuts now toggle their own existing preview on first and second
click; Play Sequence toggles rehearsal and Stop Sequence cancels pending
rehearsal transitions and active rehearsal media. The context menu now uses
the non-destructive `Remove from Scenes` action; underlying media assets are
never deleted.

The root causes were missing same-item toggle handling in the Video Clips and
Background Music bridges, a timer shortcut that only started the shared ring
engine, and rehearsal advancement that used uncancellable delayed callbacks.
The repair adds generation/token cancellation guards and reuses the existing
stop paths, so individual previews cannot advance rehearsal or create a second
player.

- StudioFlow source commit: `5186e28` (local authoritative source)
- Website application/test commit: `8d46a45`
- Active production Worker: `3a9b090f-78b5-43d6-bb11-17a1ba54d41b`
- Rollback: `5536bcc5-8c50-4851-b6e4-4a660eb1b0fb`
- Validation: Addendum D 10/10 locally; TPI-037 20/20; TPI-028 33/33;
  TPI-031 34/34; TPI-034 mutation regression PASS; local/live isolated
  Firefox acceptance 64/64; production smoke 10/10; release preflight PASS
- Completion record: `300-COMPLETED-WORK/2026-10-25-TPI-STUDIOFLOW-037-ADDENDUM-D.md`
- Owner acceptance: pending

## Latest verified production release — 2026-10-24 (TPI-STUDIOFLOW-036 cinematic video timers)

TPI-STUDIOFLOW-036 is deployed and live-verified. The supplied owner-approved
Spectacular Cinematic Edition was integrated into the existing Video Timers
engine as nine silent selectable themes in a three-column desktop grid. The
existing Classic Countdown remains the native renderer; the other eight themes
share the same countdown engine, duration state, program-output path, and
cleanup lifecycle. Timer design and duration now round-trip through the
existing per-Studio workspace configuration without a competing persistence or
playback system.

- Directive: TPI-STUDIOFLOW-036
- Application commit: `7bd8c4606660c959c6b3409b4a46a319fc11ec8a`
- StudioFlow source commit: `37c6598`
- Active production Worker: `076c9614-9251-4efd-b047-0e7033f4ad9c`
- Rollback: `aa9bff15-6252-4ae5-9422-17d63b99ab5a` (TPI-035)
- Validation: TPI-036 timer regression 28/28; local Firefox 64/64; live
  Firefox 64/64; production smoke 10/10; release safety 17/17; local auth
  lifecycle PASS; complete isolated QA/API E2E PASS; reproducible staging
  PASS; prior 020/021/027/028/030/031/032/033/034/035 coverage retained
- Data protection: no owner Studio, Crossroads data, production D1 records,
  R2 objects, recordings, or production media were mutated for testing
- Completion record: `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-036-CINEMATIC-VIDEO-TIMERS.md`

## Prior verified production release — 2026-10-24 (TPI-STUDIOFLOW-035 Recording & Storage consolidation)

TPI-STUDIOFLOW-035 is deployed and live-verified. The far-right production
navigation was cleaned up (Live interaction, Comments, and Widgets removed;
Teleprompter placed directly beneath Notes and reusing the existing studio
teleprompter reader), and a first-class Recording & Storage rail section now
hosts every recording/storage setting with truthful save status and honest
destination capability reporting. Settings > Recording and Settings >
Recording & Storage redirect to that section instead of keeping duplicate
controls. Recording saves now report confirmed outcomes with the destination
actually used, an unavailable folder destination requires explicit fallback
confirmation (declining leaves the recording in the awaiting-action state),
and cloud providers are presented only as "Not connected" until verified
OAuth integration exists. Four partially connected workspace recording-
settings defects were repaired (wrong save fields, wrong hydration keys, and
stale React state on Studio activation). The maintained 035 suite passed
33/33 with disposable Firefox and fake media devices.

- Directive: TPI-STUDIOFLOW-035
- Application commit: `d0b1f70da86e6c5490bb89a644f07c5f50a53a1e`
- StudioFlow source commit: `60af530db1d53536975ac910b9501526c54c7600`
- Active production Worker: `aa9bff15-6252-4ae5-9422-17d63b99ab5a`
- Rollback: `5c8e78b5-f920-4335-940f-a5e4d6df0e49` (TPI-033)
- Validation: 035 suite 33/33; 033 round-trip 26/26; 034 mutation regression
  twice; 021 browser 31/31; 028 browser 33/33; 030 browser 25/25; 031
  music pads 34/34; static contracts (021 86/86, 020 14/14 and 13/13, 027
  12/12, 031 overlays 12/12); release safety 17/17; local auth lifecycle
  PASS; local Firefox acceptance 63/63; production smoke PASS; guarded live
  Firefox acceptance 63/63; live artifact verification 200s
- Data protection: no D1, R2, Crossroads, owner-recording, or owner-browser
  mutation; live acceptance non-destructive
- Completion record: `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-035-RECORDING-STORAGE-CONSOLIDATION.md`

## Prior verified production release — 2026-10-24 (TPI-STUDIOFLOW-034 DOM mutation repair)

The idle StudioFlow mutation storm was reproduced and resolved in the maintained
bridge layer. The root cycle was an audio soundboard observer responding to its
own unchanged scene-label text-node replacement; redundant visibility writes and
unguarded studio-menu rendering amplified the churn. The repair preserves the
existing playback, persistence, studio-switching, and panel architecture. The
maintained mutation regression passed twice consecutively: settled idle windows
had 0 child-list churn, 0 redundant writes, and only 5 expected checkbox
attribute updates over 5 seconds and 35 over 30 seconds.

- Directive: TPI-STUDIOFLOW-034
- Application commit: `8d7185b`
- StudioFlow source commit: `ce7c389` (website bridge-only release; source unchanged)
- Active production Worker: `0c0a8660-21cf-47e1-ac66-98c91b26972c`
- Rollback: `7029c6c5-3994-42a1-9570-d6119a5792f3`
- Validation: mutation regression twice; local auth lifecycle; complete QA/API
  E2E; focused 020/021/027/028/030/031/032 checks; release safety; production
  smoke 10/10; production Firefox acceptance 64/64
- Data protection: no D1, R2, Crossroads, owner-browser, or user-media mutation
- Completion record: `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-034-DOM-MUTATION-REPAIR.md`

## Prior verified production release — 2026-10-24 (TPI-STUDIOFLOW-033 configuration persistence)

TPI-STUDIOFLOW-033 is deployed and live-verified. The API normalizer preserves
Video Clips assignments and validated pad slots, the bridges serialize scalar
program orientation, and StudioFlow rehydrates program-output state on Studio
activation. The focused local API/Firefox round-trip passed 26/26. The guarded
production release also passed the complete local auth/QA gates, production
smoke 10/10, and isolated live Firefox acceptance 64/64.

- Application commit: `cb38061656565d8e4bd7702a7d627335fe2d4993`
- Documentation checkpoint: this post-deployment synchronization commit
- StudioFlow source commit: `53bf8dc`
- Worker: `theparanormalinitiative`
- Active production Worker: `5c8e78b5-f920-4335-940f-a5e4d6df0e49`
- Rollback: `0c0a8660-21cf-47e1-ac66-98c91b26972c`
- Release source checkpoint: `d51d9de7f86f1b64c80bbcfd427f9c206a120cba`
- Data protection: no D1 migration, R2 mutation, Crossroads mutation, or
  owner-browser access
- Completion record: `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-033-WORKSPACE-CONFIGURATION-PERSISTENCE.md`

## Latest verified production release — 2026-10-24 (TPI-STUDIOFLOW-032 pad artwork replacement)

StudioFlow's audio pads now show distinct, approved per-category artwork
inside the unchanged circular icon container: the Waveform image on
Background Music pads and the Microphone image on Sound Effects pads,
replacing the music-note glyphs. The two approved PNGs
(`/studio/Waveform.png`, `/studio/Microphone.png`) are maintained StudioFlow
assets delivered through the established staging and cache-tag pipeline;
the artwork keeps its proportions, never captures pointer events, and the
pad layout, colors, labels, playback, drag-and-drop, context menus, and
persistence are all unchanged. Both files serve byte-identical on
production (authenticated fetch, SHA-256 compared).

One test-harness repair accompanied the release: the 021 browser suite's
home-screen entry was obsolete (StudioFlow now boots straight into the
active Studio and its Home nav exists only during the boot route
transition), leaving the suite hanging on a transient nav click. Each run
now seeds a fresh browser-local recording broadcast — the same empty-state
studio the home "Record without going live" flow creates — so the suite's
31 assertions run against a clean studio and no longer leave server-side
test studios behind. All assertions are unchanged.

- Directive: TPI-STUDIOFLOW-032
- Application commit: `6a1f8ad` (feature `02056c1`)
- StudioFlow source commit: `ce7c389` (website-only release; source unchanged)
- Worker: `theparanormalinitiative`
- Active production Worker version: `7029c6c5-3994-42a1-9570-d6119a5792f3`
- Immediate rollback reference: `48cdb81d-efcc-4f03-8717-eaa5a51e45d5`
  (the TPI-STUDIOFLOW-031 release)
- Reported validation, verified against the guarded release records:
  021 browser interactions 31/31 (two consecutive runs); 028 browser
  33/33 (two consecutive runs); 030 sound effects browser 25/25 (two
  consecutive runs); 031 music pad browser 34/34 (two consecutive runs);
  021 static contracts 86/86; 020 contracts 14/14; 020 video clips 13/13;
  027 contracts 12/12; 031 overlays 12/12; release safety 17/17; local
  auth lifecycle PASS (isolated Firefox acceptance 64/64); guarded live
  acceptance against production 64/64; live asset verification (icons
  byte-identical on production)
- No D1 migration, R2 mutation, Crossroads mutation, or owner-browser access
- Current release record:
  `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-032-PAD-ARTWORK-REPLACEMENT.md`

## Prior production release — 2026-10-24 (TPI-STUDIOFLOW-031 Background Music pad reordering)

Superseded as the current baseline by the TPI-STUDIOFLOW-032 release above;
retained as deployment history. StudioFlow's Background Music pads now match the Sound Effects experience:
the permanent three-dot menu buttons are gone (the unchanged options menu
opens on right-click, Shift+F10 / the ContextMenu key, or touch long-press),
and creators can arrange their music pads by drag-and-drop or Alt+Arrow
keys. The new order saves automatically per studio with no Save button, and
each studio restores its own arrangement on switching. Pad reordering moves
the complete configuration — media assignment and pad metadata — and never
starts, stops, or restarts playback. Sol's After Intro Background Music
assignment is tracked by stable asset identifier and is verified unchanged
across reorders, with the approved automatic post-Intro transition intact.

Two pre-existing persistence defects were repaired to make this possible:
the API workspace normalizer silently dropped `backgroundMusicSlots`,
`backgroundMusicLoop`, and `sceneMusicAssignments` (music never survived a
studio switch), and the asset-state bridge matched uploaded media
replacements by visit position instead of by asset, cross-wiring the music
and sound lists on save. The TPI-030 Sound Effects improvements are intact.

- Directive: TPI-STUDIOFLOW-031
- Application commit: `4cacb3a`
- StudioFlow source commit: `ce7c389` (website-only release; source unchanged)
- Worker: `theparanormalinitiative`
- Active production Worker version: `48cdb81d-efcc-4f03-8717-eaa5a51e45d5`
- Immediate rollback reference: `9e7cf4ba-1262-4c8d-9b3a-249670eb6a78`
  (the TPI-STUDIOFLOW-030 release)
- Reported validation, verified against the guarded release records:
  031 music pad browser interactions 34/34 (two consecutive runs); 030
  sound effects browser 25/25; 028 browser 33/33; 021 browser 31/31;
  021 static contracts 78/78; 020 contracts 14/14; 027 contracts 12/12;
  031 video overlays 12/12; release safety 17/17; local auth lifecycle
  (Node 38/38, isolated Firefox acceptance 64/64); guarded live acceptance
  against production 64/64
- No D1 migration, R2 mutation, Crossroads mutation, or owner-browser access
- Current release record:
  `300-COMPLETED-WORK/2026-10-24-TPI-STUDIOFLOW-031-BACKGROUND-MUSIC-PAD-REORDERING.md`

## Prior production release — 2026-10-23 (TPI-STUDIOFLOW-030 Sound Effects pad reordering)

Superseded as the current baseline by the TPI-STUDIOFLOW-031 release above;
retained as deployment history. StudioFlow's Sound Effects panel is cleaner and the sound pads are
organizable by the creator. The Stop Sound button is removed from the sound
controls (the volume slider, playback, and routing are unchanged; Background
Music keeps its own stop control), the permanent three-dot menu buttons are
removed from pads while the existing options menu (Rename, Change color,
Replace audio, Remove) stays available on right-click and on Shift+F10 or
the ContextMenu key, and pads can be reordered by drag-and-drop or by
Alt+ArrowLeft/Alt+ArrowRight. The new order saves automatically per studio
through the existing workspace configuration — no Save button — and each
studio restores its own arrangement on switching.

- Directive: TPI-STUDIOFLOW-030
- Application commit: `e18d327` (feature `8f6035a`)
- StudioFlow source commit: `ce7c389` (bridge-only release; source unchanged)
- Worker: `theparanormalinitiative`
- Active production Worker version: `9e7cf4ba-1262-4c8d-9b3a-249670eb6a78`
- Immediate rollback reference: `21ea05f7-588d-4b5a-b039-c6063f7fd248`
  (the TPI-STUDIOFLOW-028 Addendum A release)
- Reported validation, verified against the guarded release records:
  030 sound effects browser interactions 25/25 (two consecutive runs);
  021 static contracts 69/69; 021 browser interactions 31/31; 028 browser
  interactions 33/33; 020 contracts 14/14; 031 overlays 12/12; release
  safety 17/17; local auth lifecycle (Node) 38/38 and isolated Firefox
  acceptance 61/61; guarded live acceptance against production 61/61
- No D1 migration, R2 mutation, Crossroads mutation, or owner-browser access
- Current release record:
  `300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-030-SOUND-EFFECTS-PAD-REORDERING.md`

## Prior production release — 2026-10-23 (TPI-STUDIOFLOW-028 Addendum A)

Superseded as the current baseline by the TPI-STUDIOFLOW-030 release above;
retained as deployment history. StudioFlow's My Scenes controls again operate as independent production
shortcuts: Intro Video and Outro Video play their assigned Video Clips from
00:00 with Play/Stop toggles and scene restoration, and Sol's original After
Intro Background Music automatic transition is preserved. The current
approved playback contract and the verified regression history are recorded
in `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`.

- Directive: TPI-STUDIOFLOW-028 Addendum A, following TPI-STUDIOFLOW-027
  (authenticated media resolution, application commit `eee0cff`) and
  TPI-STUDIOFLOW-028 (scene playback and restoration, application commit
  `592028a`) the same day
- Application commit: `cb97464`
- Documentation commit: `89baade`
- Worker: `theparanormalinitiative`
- Active production Worker version: `21ea05f7-588d-4b5a-b039-c6063f7fd248`
- Immediate rollback reference: `210f4610-ff8a-4192-a944-4668892dd669`
  (the TPI-STUDIOFLOW-028 release; its own rollback reference is
  `d6ee132b-59f6-4694-a64b-09d6de37d3e5`, the TPI-STUDIOFLOW-027 release)
- Reported validation, verified against the guarded release records:
  028 browser interactions 33/33; 021 static contracts 58/58; 021 browser
  interactions 29/29; 020 contracts 14/14; release safety 17/17; live smoke
  10/10; live isolated Firefox Developer Edition acceptance 60/60
- No D1 migration, R2 mutation, Crossroads mutation, or owner-browser access
- Current release record:
  `300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md`
  (including its Addendum A section)

## Prior production release — 2026-10-23 (countdown timer deduplication)

StudioFlow's Video Timers controls now render one duration row containing
exactly `10s`, `20s`, `30s`, and `60s`. The maintained media bridge previously
moved each React-created row without removing the stale row retained from the
prior render, causing the four choices to repeat. The bridge now scopes timer
controls to the canonical container and removes stale duration rows before
attaching the current row.

- Superseded as the current baseline by the TPI-STUDIOFLOW-028 Addendum A
  release above; retained as deployment history.
- Release commit: `b922102ae59e6e01738f86ca1c8991c2598966f5`
- Functional fix commit: `aabbb48`
- Worker: `theparanormalinitiative`
- Active production Worker version: `dcb6ad62-d496-44fc-bfa2-20be076f0617`
- Immediate rollback reference: `0862ff17-3003-4e27-8ab3-dc7218dbbff3`
- Live anonymous smoke: PASS, 10/10
- Live isolated Firefox Developer Edition acceptance: PASS, 60/60
- Countdown row: PASS initially and after uploads, Studio switching, and refresh
- No D1 migration, R2 mutation, Crossroads mutation, or owner-browser access
- Current release record:
  `300-COMPLETED-WORK/2026-10-23-STUDIOFLOW-COUNTDOWN-TIMER-DEDUPLICATION.md`

## Prior production release — 2026-10-23 (live panel display repair)

The latest release fixes the actual production cause of the cumulative
StudioFlow right rail. The bridges set their injected media elements to
`hidden`, but production grid styles kept those elements visibly rendered.
The bridges and stylesheet now enforce a true rendered `display: none` outside
Media Assets, and the acceptance harness checks computed layout rather than
trusting the hidden property alone.

- Release commit: f1603710545447b072fbe6160acc3bccbcf456e4
- Worker: theparanormalinitiative
- Active production Worker version: 0862ff17-3003-4e27-8ab3-dc7218dbbff3 at 100%
- Immediate rollback reference: a4e1f565-21fb-449d-878a-388beabac36c
- Live anonymous smoke: PASS, 10/10
- Live isolated Firefox Developer Edition acceptance: PASS, 59/59
- Authenticated owner Firefox production verification: PASS for all 11 tabs
- Every non-media tab omitted rendered Video Timers, Sounds, and Background Music
- Media Assets retained video, timer, sound, and music controls
- Bridge and stylesheet cache identifier: exclusive-v3
- Owner production browser storage was not changed; the owner profile was used
  only for non-destructive live tab verification.
- No rollback required; protected resources were untouched.
- Current release record:
  300-COMPLETED-WORK/2026-10-23-STUDIOFLOW-LIVE-PANEL-DISPLAY-REPAIR.md

## Prior production release — 2026-10-23 (historical)

This earlier release attempted the exclusive StudioFlow right-rail panel
repair. It is retained as deployment history and is superseded by the live
panel display repair above.

- Release branch: codex/tpi-development
- Deployment commit: 0ce8774ff62b437e7a7862e47e60f3302d306d37
- Worker: theparanormalinitiative
- Active production Worker version: 41c7c0bf-5b46-4fd7-b2af-4bdf3f101bc3 at 100%
- Immediate rollback reference: 78693444-4f7b-4115-b77b-5039be40db3f
- Anonymous live smoke: PASS, 10/10
- Isolated production Firefox Developer Edition acceptance: PASS, 59/59
- Exclusive right-rail panel checks: PASS for all 11 panels
- Release preflight, API E2E, build, staging, request-budget guard, and guarded
  Wrangler dry-run: PASS
- Current StudioFlow release record:
  300-COMPLETED-WORK/2026-10-23-STUDIOFLOW-EXCLUSIVE-PANEL-REPAIR.md
- Protected resources: Crossroads of the Unknown untouched; no D1 migration,
  R2 mutation, or owner-browser storage access.

## Earlier StudioFlow panel-navigation and program-cue release (historical)

This earlier release repaired StudioFlow panel navigation and program cues. It
is retained as deployment history and is superseded by the live panel display
repair above.

- Release branch: codex/tpi-development
- Source commit: 17bbd4a in /Users/toddknipple/Documents/StudioFlow/web
- Deployment commit: ee679bcd2d29b83659dbcdc4fc6ccc1c6862dd47
- Worker: theparanormalinitiative
- Active production Worker version: 5a092da4-cab0-4551-bb60-4ce0f40f6573 at 100%
- Immediate rollback reference: e04b6691-6f35-453b-8780-1015e5a55cb5
- Anonymous live smoke: PASS, 10/10
- Isolated production Firefox Developer Edition acceptance: PASS, 37/37
- Right-rail panels: PASS, 11/11
- Release preflight, local authentication lifecycle, API E2E, build, staging,
  request-budget guard, room/RTMP syntax, and guarded Wrangler dry-run: PASS
- Program cue behavior: Intro, Outro, and assigned scene music remain idle
  until Live or Record is engaged; explicit pad playback remains available.
  (Historical record of this release only: the program-state playback gating
  and scene-music gating were later identified as regressions of the
  TPI-STUDIOFLOW-020 click-to-play contract and Sol's approved After Intro
  music transition, and were repaired by TPI-STUDIOFLOW-028 and its Addendum
  A. See `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`.)
- Current StudioFlow release record:
  300-COMPLETED-WORK/2026-10-23-STUDIOFLOW-PANEL-AND-PROGRAM-CUE-REPAIR.md
- Protected resources: Crossroads of the Unknown untouched; no D1 migration,
  R2 mutation, or owner-browser storage access.

## Earlier production baseline record (historical)

The release below is retained as historical provenance and must not be
interpreted as the active production state.

- Release branch: `codex/tpi-development`
- Source commit: `68e44b7ff0c294db72aaef1bc1f21307af8c765d`
- Worker: `theparanormalinitiative`
- Active production Worker version: `e04b6691-6f35-453b-8780-1015e5a55cb5` at 100%
- Deployment date: `2026-10-23`
- Immediate rollback reference: `ad3b6211-ca07-4156-9cef-e99ab9484035`
- Anonymous live smoke: PASS, 10/10
- Isolated production Firefox Developer Edition acceptance: PASS, 26/26
- Video Clips focused checks: PASS, 13/13
- Media organization focused checks: PASS, 22/22
- Release safety checks: PASS, 15/15
- Authoritative StudioFlow build: PASS, reproducible twice
- Guarded Wrangler dry-run: PASS
- Intro/Outro card behavior: PASS — assigned cards are display-only, omit card
  Preview, have no fullscreen controls, and defer playback to the left-side
  Intro/Outro scene cards; visible thumbnails or control-free stored-video
  previews confirm that a clip is loaded; general Video Clips remain
  stage-playable.
- Protected resources: Crossroads of the Unknown untouched; no D1 migration, R2
  mutation, or owner-browser storage access
- Current StudioFlow release record:
  `300-COMPLETED-WORK/2026-10-23-STUDIOFLOW-GHOST-PRESET-REPAIR.md`
- Workflow repair: the acceptance runner now labels and foregrounds the exact
  disposable Firefox window `TPI ISOLATED LIVE ACCEPTANCE — SIGN IN HERE` and
  rejects other Firefox windows as evidence for production acceptance.

## Controlling agent authority

`100-DIRECTIVES/TPI-MASTER-AUTONOMOUS-AGENT-AUTHORITY.md` is the active
operations policy. Every capable agent has standing authority to carry an
active TPI directive through investigation, repair, testing, focused commit,
GitHub push, guarded production deployment, live Firefox Developer Edition
verification, and rollback. Routine repairable blockers are not reasons to
stop or request another directive.

Older `no deploy`, `owner approval required`, `stop after reporting`, and
similar statements remain accurate records of their original task. They do not
override a newer directive or create permanent repository-wide restrictions.
A current task that is explicitly read-only or says not to deploy remains
limited for that task.

The mandatory implementation procedure is
`TPI-LOCAL-TO-PRODUCTION-RUNBOOK.md`. It requires permanent local-admin
verification, exact disposition of every working-tree file, focused staging,
commit and GitHub parity, complete release preflight, guarded production
deployment for every completed application directive, live Firefox Developer
Edition acceptance, automatic rollback on critical failure, and a clean final
tree.

## Project identity

- Canonical repository: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Branch: `codex/tpi-development`
- Last fully verified release-workflow source: `cb9746411398df16282c305101cb0b41425bcd39`
- Current verified production release source: `cb9746411398df16282c305101cb0b41425bcd39`
- Development Worker: `theparanormalinitiative-dev`
- Development URL: `https://theparanormalinitiative-dev.paranormalsomerset.workers.dev`
- Development version: cf58029d-62be-409f-98ff-58591b020641
- Production version: `21ea05f7-588d-4b5a-b039-c6063f7fd248`
- Production: the verified release includes the existing TPI-DEV-037 and later
  StudioFlow functionality, the completed StudioFlow 020–023 release scope,
  and the 2026-10-23 scene-media release scope (TPI-STUDIOFLOW-027, 028, and
  028 Addendum A; see `TPI-STUDIOFLOW-PLAYBACK-CONTRACT.md`). Live Firefox
  acceptance verified the StudioFlow shell, video cards, timers, soundboards,
  My Studios layout, browser-local save, portable media-inclusive backup,
  restore-as-new, switching, and persistence with disposable data.

The development and production deployment records report the verified branch
and application source commit above.

## Release traceability (TPI-OPS-030)

| Directive | Git commit | Branch | Cloudflare Worker version | Production verification |
| --- | --- | --- | --- | --- |
| TPI-STUDIOFLOW-026 to 029 release (isolated E2E harness, synthetic admin seed, configuration integrity, studio bridge fixes) | `db7e1c5` | `codex/tpi-development` (pushed; local and remote match) | `7c5ea692-e2e9-41f1-9b34-651230e03997` at 100%, deployed 2026-10-22 05:43 UTC | Read-only HTTP only: `/` and `/api/auth/me` return 200 on the Worker host and `paranormalinitiative.com`; `/studio/` returns 403 Coming Soon page. Browser and authenticated production acceptance not yet run. |
| Worker request-budget repair | `0657ab0` | `codex/tpi-development` (pushed; local and remote match) | Not deployed; rollback baseline `7c5ea692-e2e9-41f1-9b34-651230e03997` remains at 100% | Local Firefox 23/23, API E2E 225/225, focused StudioFlow regressions, reproducible build, and guarded Wrangler dry-run passed. Production release waits for the Cloudflare daily request allowance to reset. |

Current rollback target: `7c5ea692-e2e9-41f1-9b34-651230e03997`. The guarded
release workflow records and verifies the active version immediately before
each later deployment and restores it automatically if critical live acceptance
fails.

### Worker request-budget incident and permanent repair — 2026-10-22

- Cloudflare recorded 160,573 successful Worker events in the preceding 24
  hours while static asset requests accounted for only about 2,400 requests.
  This was automated API traffic, not traffic from the five registered members.
- The isolated production Firefox acceptance runner called `/api/auth/me`
  every 200 milliseconds while waiting as long as ten minutes for manual login.
  It now waits on browser-local navigation or DOM state and performs one final
  authenticated-session confirmation.
- The maintained StudioFlow React source also polled production room signals
  every 900 milliseconds and guests plus status every two seconds. Source
  commit `9f0e24e` replaces those fixed intervals with non-overlapping,
  visibility-aware scheduling: visible signal polling every two seconds,
  visible guest/status refresh every ten seconds, and substantially slower
  background-tab polling. The request-budget regression is mandatory in the
  authoritative build and complete QA gate.
- Canonical implementation commit `0657ab0` also excludes Markdown files from
  production asset packages and repairs authoritative staging so Video Clips,
  Soundboards, cache tags, and the verified existing CSS remain preserved.
- Verification: API E2E 225/225, isolated Firefox Developer Edition 23/23,
  local authentication 38/38, focused StudioFlow regression suites passed,
  source builds were reproducible, and the guarded Wrangler dry-run passed.
- Production remained safely rolled back to
  `7c5ea692-e2e9-41f1-9b34-651230e03997` at 100%. No D1 rows, R2 objects,
  Crossroads data, or owner browser storage were changed. Deployment and live
  acceptance must occur only after the Cloudflare allowance resets and the
  full guarded preflight succeeds.

### TPI-STUDIOFLOW-026 Addendum A — permanent local authentication and release workflow

- Implementation commit: `7aae32a` on `codex/tpi-development`.
- Root cause confirmed: the persistent D1 `local_admin` password hash had
  drifted from the protected mode-0600 credential store. The active admin row
  was restored in place; its identity and role were preserved and only its
  prior sessions were invalidated.
- Permanent boundary: API E2E can no longer seed `.local-dev/state`; the
  former reuse mode fails closed and full E2E uses disposable port 8789 state.
- Lifecycle acceptance: OPS-009 38/38 before restart, 38/38 after the managed
  restart, 38/38 after a StudioFlow build, and isolated Firefox Developer
  Edition 23/23. Credential and D1 fingerprints remained unchanged.
- Maintained commands: `npm run verify:local-auth-lifecycle`,
  `npm run release:preflight`, and owner-authorized
  `TPI_PRODUCTION_DEPLOY=approved npm run release:production`.
- The release command enforces clean Git/GitHub parity, Cloudflare account and
  rollback checks, isolated E2E, Firefox acceptance, guarded dry-run, guarded
  deployment, live smoke, and automatic Worker rollback. It contains no D1
  migration or R2 deletion step.
- No production deployment or production-data mutation was performed by this
  addendum.

### TPI-OPS-031 final authenticated acceptance — 2026-10-22 (BLOCKED)

- Production version re-verified: `7c5ea692-e2e9-41f1-9b34-651230e03997` at 100%.
- Git: `codex/tpi-development` local and remote at `065b480`; working tree clean.
- Access control, sign-in, StudioFlow load, feature controls, backup controls, and console checks: NOT TESTED.
- Blocker: no safe, supported way was found to provision a synthetic production account with a Creator Studio entitlement. Public member registration (`/members/register`) creates a plain member with no `creator_studio_entitlements` row, and no admin session was used. The existing owner-authorized fixtures `TPI Acceptance Test A/B` (TPI-STUDIOFLOW-081) are not in the repository and their credentials are not available.
- Release status: STATE B for authenticated acceptance. The release is deployed and unauthenticated checks pass, but it does not qualify for STATE A.
- No production data, secrets, Crossroads studio, or migrations were changed.

### TPI-OPS-032 account recovery and entitlement check — 2026-10-22 (BLOCKED)

- Read-only production D1 query: no contributor row matches `TPI Acceptance Test A` or `B` (by username or display name). They do not exist under those names, so their StudioFlow entitlement state cannot be confirmed.
- Supported entitlement path: the only admin route that writes `creator_studio_entitlements` is the Founding 50 award (`handleAdminAllocateFounding50`). It returns 423 unless `FOUNDING50_PRODUCTION_ACTIVATION` is `approved`, and the Admin Panel award button is disabled pending owner approval. Invitations and public registration grant no StudioFlow entitlement.
- Account recovery: not possible without the existing credentials or an owner-authorized path. No password was reset.
- Owner action required: either approve the Founding 50 activation gate for one synthetic acceptance account, or provide an existing StudioFlow-entitled synthetic account. Then authenticated acceptance can run.
- Authenticated acceptance: NOT TESTED. Release remains STATE B.

Isolated release-gate results for this release were run against the local isolated Worker on 127.0.0.1:8789, not production: API E2E 225/225, Firefox acceptance 23/23, Chromium 021 17/17, Chromium 022 16/16, backup and restore 13/13, configuration integrity 6/6.

TPI-MASTER-001C is active under the mandatory completion policy. The current production-facing repair is the deployed
My Studios dropdown clipping correction recorded in
`docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-MASTER-001-RESULT.md`. No
database migration or owner-data operation was performed. Authenticated editor
interaction remains the final verification limitation; the exact handoff
requirement is recorded in `300-COMPLETED-WORK/TPI-MASTER-001C-RESULT.md`.

Chronological production execution under TPI-MASTER-001A has reconciled
TPI-DEV-001 through TPI-DEV-037 in source order, preserving explicit archive
gaps for DEV-006, DEV-029, and DEV-033. DEV-001 is blocked as
non-production infrastructure work; DEV-002 and DEV-003 are superseded for
the current production-target mission; DEV-004 is verified documentation-only;
DEV-010's reviewed member-login repair is deployed, with authenticated-state
verification passed and signed-out submission/recovery branches still pending;
DEV-013 remains blocked on migration-ledger reconciliation because the
physical creator/StudioFlow schema is ahead of the recorded ledger. The
next available source sequence is the StudioFlow directive archive beginning
at TPI-STUDIOFLOW-013. The available StudioFlow sequence has now been
reconciled against the current production release lineage through
TPI-STUDIOFLOW-082; the remaining live gates are authenticated save/switch/
refresh and media/guest acceptance, not an untracked local development copy.
See `300-COMPLETED-WORK/TPI-MASTER-001A-PROGRESS-2026-10-20.md`.

## Status vocabulary

- **VERIFIED COMPLETE**: current source and executed evidence support the claim.
- **IMPLEMENTED, VISUAL ACCEPTANCE PENDING**: source and non-visual tests exist,
  but authenticated browser inspection remains open.
- **IMPLEMENTED, EXTERNAL ACCEPTANCE PENDING**: local integration exists, but a
  separately authorized provider or external service test has not occurred.
- **PARTIALLY COMPLETE**: only a defined subset is verified.
- **NOT IMPLEMENTED**: no current implementation evidence.
- **BLOCKED**: a required safe prerequisite prevents verification.
- **NOT TESTED**: no current execution evidence for the specific claim.

## Documentation synchronization policy

Every completed TPI development directive must update the affected Markdown
records before its status is marked COMPLETE. The record must include the source
files changed, verification results, known limitations, current development
status, and the corresponding directive-index entry. Historical reports remain
immutable records; corrections belong in a dated addendum or a later result.
Documentation must distinguish COMPLETE, PARTIAL, BLOCKED, NOT VERIFIED, and NOT
DEPLOYED. Local tests alone must never be described as proof of production
readiness.

## Current feature matrix

| Area | Current status | Evidence / limitation |
| --- | --- | --- |
| Public homepage, navigation, content, authentication entry points | VERIFIED COMPLETE | Development runtime and prior website integration evidence; visual scope remains subject to owner review where noted below |
| Member Home, profiles, feed, comments, reactions, messaging, notifications, settings, privacy | IMPLEMENTED, VISUAL ACCEPTANCE PENDING | DEV-021 integration evidence and focused API regressions; no claim of complete owner visual acceptance |
| Education Center | IMPLEMENTED, VISUAL ACCEPTANCE PENDING | Existing development source and prior integration evidence; production publication is outside scope |
| Paranormal Teams | IMPLEMENTED, IMPORT NOT AUTHORIZED | Research remains separate; no research import or publication was performed |
| TPI Videos | VERIFIED COMPLETE WITH REGRESSION LIMITATIONS | Video player: 22 assertions passed; format/date, navigation, and media-grid regressions passed |
| Media uploads and retrieval | IMPLEMENTED, VISUAL ACCEPTANCE PENDING | DEV-022 offline privacy contracts and media regression passed; no production media changes |
| Search | VERIFIED COMPLETE AT CONTRACT LEVEL | DEV-022 offline search contracts passed; broad visual acceptance remains owner work |
| Events | VERIFIED COMPLETE AT DEVELOPMENT RUNTIME LEVEL | Browser inspection rendered the development Events page, filters, cards, RSVP controls, and submit-event navigation; authenticated administration UI remains owner acceptance |
| Administration Center | IMPLEMENTED, DEVELOPMENT AND PRODUCTION DEPLOYED / VISUAL ACCEPTANCE PENDING | DEV-032 navigation correction and DEV-031 analytics are deployed to both environments; anonymous protection, public routes, private-source exclusion, and development authenticated authorization passed; authenticated production owner inspection remains open |
| Public landing and authenticated home routing | IMPLEMENTED AND DEPLOYED / AUTHENTICATED ACCEPTANCE PENDING | TPI-DEV-035 uses the existing shared shell for guest navigation, makes hosted /api/auth/me authoritative, redirects authenticated / server-side to /member-home, and marks anonymous root HTML private/no-store. Anonymous development and production checks passed; authenticated browser acceptance remains open. |
| Creator applications and entitlement enforcement | VERIFIED COMPLETE WITH LIMITATIONS | DEV-014 and DEV-025 authenticated synthetic tests passed; real membership activation remains disabled |
| Founding 50 activation/allocation | VERIFIED PROTECTED | Development activation is `disabled`; protected mutation remains expected HTTP 423 |
| StudioFlow creator access | VERIFIED COMPLETE WITH LIMITATIONS | Positive entitled creator access and revoked denial passed; visual acceptance remains open |
| StudioFlow workspaces and My Studios | IMPLEMENTED AND DEPLOYED / DEVELOPMENT FINAL ACCEPTANCE PASSED / AUTHENTICATED EDITOR CLICK VERIFICATION PENDING | DEV-037 correction commit `7385f0c`; development `cf58029d-62be-409f-98ff-58591b020641`; production `37cdf44a-3ef9-4095-b95e-543017d77e74`; 37/37 final acceptance, concurrent-save conflict repair, numbered allocation, rename, duplicate, soft-delete/recovery, autosave, owner isolation, active/scheduled guards, deployed selector portal repair, production schema, and public protection passed; editor automation still times out after media-heavy editor entry |
| StudioFlow JSON configuration backup/import | VERIFIED COMPLETE AT API/OFFLINE LEVEL | Export structure and import validation passed; browser download/file-picker interaction remains owner acceptance |
| StudioFlow recording recovery | IMPLEMENTED, BROWSER RESTART ACCEPTANCE PENDING | Existing browser-local recovery and download behavior preserved; session restart and playback were not manually verified in DEV-026 |
| RealtimeKit rooms/livestreams | IMPLEMENTED, EXTERNAL ACCEPTANCE PENDING | Integration path and protections are documented; no external room or livestream was created |

## Administration Center and creator boundaries

Creator Studio entitlement does not grant Administration Center access. The
current tests verify owner-scoped workspace access and cross-account isolation.
Private recordings, stream credentials, unpublished media, and provider tokens
remain outside the administration preview surface.

## Database and migration status

Development D1 is `tpi_contributor_portal_dev` (`4948ecc5-35de-4782-8f6b-b07fa1782b66`).
The `studio_workspaces` table exists in both remote environments and supports
the deployed workspace routes. Development contains the exact table and two
indexes from `0051_studioflow_workspaces.sql`. Production received that exact
targeted schema correction under TPI-DEV-036 after a verified private D1 export;
the production table is currently empty. The production `d1_migrations` ledger
still contains only its original `0001` and `0002` rows and was intentionally
not fabricated or advanced because the historical backlog is incomplete.

TPI-DEV-036 backup: `/Users/toddknipple/Documents/TPI-DEV-036-backups/2026-10-15/tpi_contributor_portal.sql`
(SHA-256 `bf85cce8cfb16dd2042e6141c5b496a8c583877ef1b0cb333a0a4c14032a1760`).
Authenticated production workspace mutation remains not tested because no
authorized production test identity was available.

DEV-037 adds `studio_number`, `deleted_at`, the
`studio_number_allocations` table, and two indexes through
`migrations/0052_my_studios.sql`. Development preserves all 17 existing
workspace rows. Production received only this authorized migration after a
fresh private backup; existing production counts and the original two-entry
migration ledger remain unchanged.

## Backup and restore policy

Cloudflare D1 and R2 are application-storage services, not backup destinations.
The approved backup destinations are local storage, personal cloud drives, and
external/removable storage. StudioFlow currently exports/imports workspace
configuration JSON locally. Recording binaries are not included in that JSON;
existing browser-local recordings remain in browser storage until the creator
explicitly downloads or exports them. No automatic upload, deletion, or cloud
drive OAuth was introduced.

## Verified test evidence

- DEV-025 creator acceptance: 39/39 passed.
- DEV-037 My Studios development acceptance: 32/32 passed; final acceptance: 37/37 passed; offline contracts: 12/12 passed. The final acceptance found and repaired one concurrent-save response defect before promotion.
- DEV-024 offline workspace/backup boundaries: 17/17 passed.
- DEV-022 offline media/search/Events contracts: 15/15 passed.
- DEV-014 authenticated authorization: 57/57 passed.
- DEV-020 acceptance: 39/39 passed.
- DEV-021 integration: 116/116 passed.
- Video player regression: 22 assertions passed.
- Video format/date regression: passed.
- Media grid regression: passed.
- TPI Videos navigation regression: passed after a stale assertion was repaired.

Historical totals are not added together as unique coverage.

## Remaining owner and release decisions

1. Perform authenticated StudioFlow browser acceptance at desktop, tablet, and
   mobile sizes.
2. Verify browser download/import dialogs and browser session-restart recording
   recovery with a synthetic recording.
3. Decide whether to authorize a separate bounded RealtimeKit test, including any
   provider cost and cleanup approval.
4. Reconcile the development D1 migration ledger before future migration work.
5. Complete authenticated production StudioFlow workspace acceptance only with
   an authorized production test identity; no Worker release is required for
   the TPI-DEV-036 schema repair.
6. Complete authenticated production My Studios acceptance only with a
   dedicated authorized production test identity; no real member workspace was
   mutated during DEV-037 promotion. Production read-only routes, schema, and
   preservation counts passed after the correction release.

See [TPI-DEV-026 implementation report](300-COMPLETED-WORK/TPI-DEV-026-IMPLEMENTATION-REPORT.md)
and [TPI-DEV-026 production readiness gap analysis](200-AUDITS/TPI-DEV-026-PRODUCTION-READINESS-GAP-ANALYSIS.md).

## TPI-OPS-004 Cloudflare Worker inventory and traffic forensics

The current Cloudflare account inventory returned exactly four Workers. The TPI
Workers are `theparanormalinitiative` (production) and
`theparanormalinitiative-dev` (development); the other two are separate
projects. No older similarly named TPI development Worker was found in the
current account inventory. The development Worker was created on 2026-10-12
and uses the isolated development D1/R2 resources, outbound guard variables,
and no scheduled trigger. The production Worker retains the production custom
domain, production D1/R2 resources, and six-hour scraper cron.

The reconciled Wrangler deployment history shows active development version
`cf58029d-62be-409f-98ff-58591b020641` and active production version
`05c5d075-8d28-4f72-a4c8-a8edba01bb10`. The earlier `c181...` and `f89...`
values were retained historical deployments, not the active versions. No
deployment was performed by OPS-004.

The previously measured 116,223 development requests on 2026-10-16 remain
partially unexplained: the aggregate and a bounded 41,852-request window are
confirmed, but complete endpoint, user-agent, hourly, and caller attribution
was unavailable. OPS-003 found no active local TPI runaway process, and the
current source/configuration audit found no TPI Worker-to-TPI Worker loop.

OPS-002 local traffic-protection checks remain **CONDITIONALLY READY FOR A
SEPARATE CONTROLLED DEPLOYMENT**. OPS-004 performed no deployment, Worker
traffic, database/R2 change, billing change, commit, or push. See [the
OPS-004 inventory](100-DIRECTIVES/TPI-OPS-004-CLOUDFLARE-WORKER-INVENTORY.md),
[traffic forensics](200-AUDITS/TPI-OPS-004-WORKER-TRAFFIC-FORENSICS.md), and
[completion record](300-COMPLETED-WORK/TPI-OPS-004-CLOUDFLARE-WORKER-INVENTORY.md).

## TPI-OPS-005 controlled development deployment and request baseline

The OPS-002 runtime protections were deployed once to development from an
isolated snapshot based on canonical HEAD `7385f0c`, with only
`member-shell.js` and `tpi-video.html` overlaid. The active development Worker
is now `802425a6-e7d0-4ff4-917f-12fff09d147f` at 100%. The deployed provenance
payload matches the isolated source snapshot and `codex/tpi-development`.

Static analysis confirms that normal multi-tab development activity can
plausibly generate tens of thousands of requests through visible notification,
Messenger, and live-video polling, but the historical 116,223-request source
remains **INSUFFICIENT EVIDENCE** rather than proven causation. StudioFlow's
one-second timer is local state/fingerprint work, not a one-second network
poll.

The bounded post-deployment verification used 13 of 30 authorized development
requests. Root and Member Home returned 200; anonymous Administration Center,
notifications, Messenger, and StudioFlow protections returned expected 403/401
responses; provenance matched. Authenticated multi-hour traffic and recording
recovery were not tested. Production remained unchanged. See the [OPS-005
baseline](200-AUDITS/TPI-OPS-005-DEVELOPMENT-REQUEST-BASELINE.md) and
[deployment verification](300-COMPLETED-WORK/TPI-OPS-005-DEPLOYMENT-VERIFICATION.md).

## TPI-OPS-006 local development environment assessment

OPS-006 was completed as a read-only assessment. The canonical Worker entry,
production/development Wrangler separation, D1/R2 binding usage, authentication
cookie and entitlement model, external-service paths, StudioFlow loopback room
server, and agent/browser access boundaries were inventoried. No local Worker
was started and no local configuration, schema, fixture, application behavior,
database, R2 object, deployment, account, or worktree change outside the
required documentation was performed.

Cloudflare’s current platform documentation confirms that `wrangler dev` can
run the Worker locally with local D1 and R2 simulations and persistent local
state. The repository is not yet operationally ready for that workflow: it
needs a separate local config, reviewed schema bootstrap, synthetic fixtures,
local media state, an outbound fail-closed guard, and a local HTTPS/cookie
decision. The existing StudioFlow room service remains a separate loopback
dependency on port 8788 and is in-memory only. Port 8787 was free; no server
was started. See the [OPS-006 assessment](100-DIRECTIVES/TPI-OPS-006-LOCAL-DEVELOPMENT-ASSESSMENT.md),
[architecture audit](200-AUDITS/TPI-OPS-006-LOCAL-ENVIRONMENT-ARCHITECTURE.md),
and [future implementation plan](400-FUTURE-DEVELOPMENT/TPI-LOCAL-DEVELOPMENT-IMPLEMENTATION-PLAN.md).

The current readiness classification is **ASSESSMENT COMPLETE / LOCAL
ENVIRONMENT NOT OPERATIONALLY VERIFIED**. The next step requires a separate
implementation authorization; OPS-006 itself did not authorize implementation.

## TPI-OPS-007 local development server foundation

OPS-007 implemented the first local-only foundation using the actual Worker
source. `wrangler.local.toml` selects a loopback Worker at `127.0.0.1:8787`,
local D1 `tpi-local-foundation`, local R2 `tpi-local-media`, no cron, no remote
bindings, and `.local-dev/state` persistence. `scripts/local-dev.mjs` is the
guarded startup command. Local browser/server request guards block production,
hosted-development, and unapproved external targets in local mode; scrapers,
link previews, RealtimeKit, and email remain blocked locally. A local indicator
reads `TPI — LOCAL DEVELOPMENT`.

The initial local D1 schema was applied from `migrations/0001_contributor_portal.sql`
without copying accounts or data. The local R2 state directory was initialized
without objects. JavaScript syntax, `git diff --check`, OPS-002 (11/11), and the
new OPS-007 guard regression (8/8) passed.

At the time of OPS-007, the actual Worker could not remain running because
Wrangler/esbuild raised `spawn EBADF` before binding to localhost. OPS-008
repaired that blocker by staging a sanitized asset directory, selecting the
runtime-supported local compatibility date, and preventing automatic loading of
the repository `.dev.vars` file. The OPS-007 record remains historical; current
local runtime status is recorded below.

## TPI-OPS-008 local runtime startup repair

OPS-008 is **COMPLETE / LOCAL HTTP VERIFIED**. The actual TPI Worker starts via
`node scripts/local-dev.mjs` on `127.0.0.1:8787`, using local D1/R2 simulation
and 532 staged runtime asset files. Homepage HTTP 200, expected TPI content,
the local banner, browser request-guard marker, static asset HTTP 200, local
D1-backed `/api/auth/me`, R2 route behavior, Wrangler request logs, and clean
shutdown all passed. The existing StudioFlow room server on `127.0.0.1:8788`
remained untouched.

The confirmed original failure was Miniflare runtime reconfiguration after
processing the repository root as `assets.directory="."`; the installed local
workerd also rejected compatibility date `2026-07-18`, so the local-only config
uses `2026-07-15`. The launcher now selects a secret-free `scripts/local-dev.env`
instead of auto-loading `.dev.vars`. OPS-002 passed 11/11, OPS-007 passed
10/10, syntax checks and `git diff --check` passed. No deployment, remote D1/R2
change, public Worker traffic, production change, hosted-development change,
or StudioFlow restart occurred. See the [OPS-008 directive](100-DIRECTIVES/TPI-OPS-008-LOCAL-RUNTIME-STARTUP-REPAIR.md),
[diagnostics](200-AUDITS/TPI-OPS-008-WRANGLER-STARTUP-DIAGNOSTICS.md), and
[completion report](300-COMPLETED-WORK/TPI-OPS-008-LOCAL-RUNTIME-REPAIR-RESULT.md).

## TPI-OPS-009 local authentication and synthetic session isolation

OPS-009 is **PARTIALLY COMPLETED / LOCAL AUTH VERIFIED WITH BOUNDARIES**. The
existing authentication implementation remains the source of truth. A
fail-closed HTTP-loopback cookie exception was added for the isolated local
Worker, while hosted cookies remain Secure. A repeatable local-only fixture
process creates fictional admin, contributor, member, and disabled accounts
with generated credentials stored mode `0600` under ignored `.local-dev/`.

The bounded localhost suite passed 27 checks: anonymous state, login,
HttpOnly/SameSite cookie behavior, authenticated `/api/auth/me`, admin
authorization, contributor/member denial, invalid and disabled credentials,
expiration, logout invalidation, local banner, authenticated root redirect to
`/member-home`, and member-home availability. The local D1 foundation tables
were confirmed and OPS-002/OPS-007 regressions passed. No deployment, remote
database/storage change, public Worker request, real account/credential copy,
commit, or push occurred. The minimal local schema does not include later
capability columns used by some admin routes, and no browser visual session was
run; those limits remain documented in the [OPS-009 verification](200-AUDITS/TPI-OPS-009-LOCAL-AUTHENTICATION-VERIFICATION.md)
and [completion result](300-COMPLETED-WORK/TPI-OPS-009-LOCAL-AUTHENTICATION-RESULT.md).

## TPI-DEV-031 interactive visual analytics

DEV-031 extends the existing protected Administration Center with member-growth,
community-engagement, membership-distribution, creator-activity, moderation,
and content-overview charts. The development Worker version is
`893f373b-8fa8-48ed-bd2b-f46e73142f57` from source commit `863387e`.
Analytics queries are read-only and bounded. Website traffic is shown as
unavailable because no reliable first-party visits/page-views source exists in
the current schema; no synthetic traffic is displayed. Membership distribution
is limited to actual creator-partnership membership categories where available,
with an explicit unavailable state when a general plan table is absent.

The DEV-031 focused checks pass 11/11, existing authorization regression passes
57/57, the React build passes, and authenticated development API verification
returns the expected analytics series. Production was not deployed or modified.
Owner authenticated browser inspection of the protected chart view remains an
acceptance item.

## TPI-DEV-032 navigation correction

The Administration Center now follows the existing member-shell navigation
patterns rather than maintaining a separate navigation design. The desktop and
iPad rail is fixed and independently scrollable; the main content scrolls in its
own viewport; active items use page-current semantics; the mobile layout uses a
drawer and bottom navigation; and `Return to Main Site` uses the current host's
`/` route. Existing menu groups and DEV-031 analytics remain present.

The final application source is `51236c3`. Development version
`c181a58d-005d-4c57-b188-24d3467fef78` and production version
`4f679573-fb15-4bf9-9541-2a85e70209a0` use the same built asset hashes. A
packaging-only corrective deployment removed private `lib/` and `functions/`
source files from the asset package; both environments now return 404 for
those paths. No database migrations, imports, or data writes were performed.

## TPI-DEV-027 production-release preparation

Production release preparation is currently `BLOCKED`. Read-only inspection
confirmed production Worker version `7e357215-2579-4c60-b27e-dd572a5656fe`, the
production D1 binding `tpi_contributor_portal`, and production R2 bucket
`tpi-contributor-media`. Production D1 contains many later application tables but
its Wrangler migration ledger records only `0001_contributor_portal.sql` and
`0002_contributor_profiles.sql`; `studio_workspaces` is absent.

The development D1 has the workspace table and five existing workspace rows, but
does not record migration 0051 in its ledger. Because both environments have
schema/history discrepancies, no migration was applied and no production backup
was exported. The release candidate and required approval procedure are recorded
in the TPI-DEV-027 reports. Production remains untouched.

## TPI-DEV-028 focused Administration Center release

TPI-DEV-028 was deployed after explicit owner approval. The
candidate source snapshot is `8dc0d45c8e0ab9dac2b7154f4458503d4a58bc44` on
`codex/tpi-development`; the production Worker version immediately before the
DEV-028 release was `7e357215-2579-4c60-b27e-dd572a5656fe`. Anonymous
read-only checks returned
HTTP 403 for `/admin-center-preview/`, `/admin-panel.html`, and
`/api/admin/overview`, confirming that the existing public boundary remains
protected.

The focused package is limited to the existing Administration Center preview
runtime, its protected admin API compatibility changes, and the already
present authentication/navigation boundary. It excludes StudioFlow, Events,
research, synthetic data, Founding 50 activation, database replacement, and
unapproved migrations. Dashboard, member management, community moderation,
notifications metadata, Education, video metadata/lifecycle, Paranormal Teams,
settings, roles/restrictions, and read-only creator/entitlement views passed
the local focused checks. Creator-application detail/create is deferred because
production does not have the additive `0050_creator_application_details.sql`
columns or the membership `application_id` column. No production write,
No production D1/R2 write, migration, export, data import, Founding 50
activation, or unrelated feature deployment was performed for DEV-028. The
final production Worker version is
`830aa684-d14e-4d39-b103-7fb7538fef84` at the time of the DEV-028 release;
an initial package version
`0f114a72-ccf0-46c7-aae2-ea53b79510de` was immediately corrected after its root
asset manifest exposed existing documentation paths. The final asset manifest
excludes `docs/`, and the checked documentation path now returns `404`.

## TPI-DEV-030 release workflow repair and deployment

The Administration Center source and route boundary has now been unified in
the development branch. `/admin-panel` is the canonical protected route, the
historical `/admin-center-preview/` path serves the same React package for
compatibility, and authenticated `/admin-panel.html` bookmarks redirect to the
canonical route. Desktop and mobile Administration navigation now use
`/admin-panel`. The shared React application hydrates the signed-in member's
saved theme and typography from the existing personalization APIs. The guarded
development staging script records an Administration Center package manifest
with source identity and SHA-256 file hashes. TPI-DEV-030 implementation checks
pass. The owner-approved release was deployed to development as Worker
`85a142a1-026e-4658-b8f1-a7924ba30062` and to production as Worker
`f89c0971-b3e5-40be-9b20-abfa9a132dcd` from final source commit
`ef7182e77d7966dacff49e21701580ba189103ae`. The first production version
`40e6b45d-7f85-40ec-acc3-0cd1edac490c` was immediately corrected after a
non-destructive source-path check found `/lib/auth.js` publicly readable; the
corrected asset manifest excludes `lib/`, and the path now returns 404. The
production package was assembled against the production baseline and uses the
production D1/R2 bindings; no migrations, imports, secret changes, or data
writes were made. Anonymous protection and public smoke routes passed, and the
deployed source and documentation paths are not publicly exposed. Authenticated
owner/admin browser rendering, dashboard data loading, and production
personalization acceptance remain pending because no owner production session
was available.

## TPI-DEV-034 unified ParaNews and ParaTube layout

TPI-DEV-034 unified the canonical `/news` and `/paratube` content hubs with
the existing TPI member shell. The implementation reuses the established
sidebar, independent scrolling, mobile navigation, authentication boundary,
theme variables, typography, and member-home conventions. Existing news/video
APIs, cards, search/category controls, links, scrapers, and the distinct `/`,
`/member-home`, and `/explore` destinations were preserved.

The original implementation source is `50cedea2bd5e9f7e2f0bad1bcbfd9a9761cc5ee0`.
The addendum source is `41de90a98fac0747fe19c376e463c70a578cee36`.
Development deployment `264e5ea5-b165-4b6e-adc0-1bc41f7bebcc` and production
deployment `80cc9aa2-c2a2-4fc8-99c7-989e523e4654` use the addendum source.
Focused source checks passed 16/16; member-home, DEV-032, DEV-033,
DEV-030, workspace-layout, syntax, and diff checks passed; development
runtime verification passed, including authenticated development root routing;
and the anonymous production smoke suite passed 10/10. No D1/R2 writes,
migrations, imports, authentication changes, or
unrelated feature changes were made. Authenticated production browser visual
acceptance remains pending because no production owner session was available.

The root routing correction uses the Worker session boundary to redirect
authenticated `/` requests to `/member-home` while preserving the public home
for signed-out visitors. The early theme bootstrap applies the existing local
theme before first paint, and the member shell now synchronizes with the
include-ready event instead of waiting a fixed 150 ms. The production rollback
target was `a2cbde12-0c39-4eeb-ac75-269e66c6dcea`.

## TPI-DEV-035 public landing and authenticated home routing

TPI-DEV-035 corrected the remaining public/authenticated mismatch. Hosted
/api/auth/me is authoritative, while localStorage identities are accepted only
for local preview origins. This prevents stale preview state from showing a
member greeting when the Worker correctly has no session. Anonymous root
responses are private, no-store, and authenticated root requests continue to
redirect to /member-home.

The public landing page retains the established TPI visual system and content
assets while adding clear entry cards for ParaNews, ParaTube, Our Apps, and
Contact & Links. The existing shared sidebar is populated for guests with
public route destinations and remains unchanged for authenticated members.
Because the deployed Cloudflare asset configuration returned 500 for the
standalone clean URLs /member-sidebar and /footer, the guarded staging
scripts emit .txt aliases containing the exact canonical source markup.

Development deployment 20031a3d-1c35-4621-a1b4-b74842256a95 and production
deployment adc6e8d7-1950-49a7-8127-54f0a2acd634 use source commit d127bd3.
Source checks and public runtime checks passed. The broad authenticated browser
runner was blocked by its own safety gate because it would create six
development session records; authenticated production acceptance remains
pending and is not represented as passed.

## TPI-DEV-036 StudioFlow saved-workspace production schema repair

TPI-DEV-036 repaired the missing production `studio_workspaces` table using the
exact development-verified table definition and its two required indexes. A
complete production D1 export was created and verified outside the repository
before the write. The operation executed only the targeted workspace schema;
the historical production migration backlog and migration ledger were not
run or changed.

Development synthetic workspace QA passed 23/23, including owner isolation,
conflict protection, archive behavior, and recording-sensitive-state exclusion.
Production read-only checks confirmed the new schema, required foreign keys,
constraints, indexes, unchanged existing row counts, and unchanged migration
ledger. Public routes remained reachable, `/studio/` remained protected, and
the unauthenticated workspace API returned 401. No Worker deployment was
needed because production already ran the verified workspace API source.

Authenticated production workspace mutation and browser-level StudioFlow
acceptance remain not tested without an authorized production test identity.

## TPI-OPS-002 development traffic protection

The current-day Cloudflare aggregate measured 116,223 requests for the
development Worker and 9,088 for production. Exact development request paths
remain unverified because the available analytics dimensions did not expose
them and the Worker was rate-limited during safety probing. Development has no
cron trigger and retains `TPI_DISABLE_OUTBOUND="1"`.

TPI-OPS-002 added fail-closed request budgets to remote QA/browser verification
and reduced unnecessary authenticated polling for guests, hidden tabs, and
in-flight duplicate requests. The focused 11-check traffic-protection
regression and source checks pass. Deployment is blocked until Cloudflare
capacity recovers; no live post-change reduction is claimed, and no production,
D1, R2, billing, membership, commit, or push change was made. See
`docs/TPI-DEVELOPMENT/200-AUDITS/TPI-OPS-002-REQUEST-FORENSICS.md` and
`docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-OPS-002-DEVELOPMENT-TRAFFIC-PROTECTION.md`.

## TPI-OPS-003 agent and development traffic investigation

The local process, scheduler, workspace, browser-automation, and source audit
found no currently running old website-copying agent, TPI crawler, remote QA
loop, Wrangler/Vite server, Playwright/Puppeteer process, or TPI LaunchAgent.
The historical Freebuff reconstruction thread was completed and idle with
auto-run disabled, and its documented target was the separate Parapost local
clone rather than a production-to-development TPI synchronizer. No process was
stopped because no runaway TPI process was confirmed.

The source of the prior 116,223 development requests remains unverified: the
available Cloudflare analytics did not provide a current process correlation,
and additional analytics queries were not repeated while rate-limited. OPS-002
protections remain present locally but are not deployed. See
`docs/TPI-DEVELOPMENT/200-AUDITS/TPI-OPS-003-AGENT-TRAFFIC-INVESTIGATION.md`.

## TPI-OPS-010 local Community Feed, Messenger, Notifications, and member data

TPI-OPS-010 extended only the isolated local Wrangler/D1 state with the
authoritative schema required by the existing Community Feed, Messenger,
Notifications, member directory, and personalization routes. A verified
4,708-byte local SQLite backup was created before schema work and restored
successfully into a temporary database. The narrow migration set was applied
without executing the historical migration backlog; only
`0038_member_personalization.sql` was newly applied after the other selected
definitions were confirmed present.

Repeatable fictional fixtures were added for one community category/post/
comment/reaction, two conversations, two messages, two notifications, and one
personalization row. The loopback service suite passed 38/38 checks, including
authentication, anonymous write denial, community ownership, comments,
reactions, Messenger participant isolation, read state, notification
preferences, personalization, and authenticated `/member-home` routing. The
existing OPS-009 authentication regression passed 27/27. The repository QA
runner reported 9 passed, 0 failed, and 3 unrelated optional checks blocked.

The local browser could reach the Worker and was correctly redirected to Member
Login without a browser session. Authenticated browser visual acceptance was
not claimed. Loading the broader member-home asset graph exposed pre-existing
out-of-scope local gaps for `events`, `news_articles`, `videos`, and
`articles.article_type`; no unrelated schemas were applied to mask them. No
deployment, remote D1/R2 change, external request, real-member data copy,
commit, push, or StudioFlow room-server interruption occurred. See
`docs/TPI-DEVELOPMENT/200-AUDITS/TPI-OPS-010-LOCAL-APPLICATION-DATA-AUDIT.md`
and `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-OPS-010-LOCAL-COMMUNITY-RESULT.md`.

## TPI-OPS-011 local website completion

TPI-OPS-011 added only the verified local D1 dependencies required by the
existing member-home implementation: article classification and reactions,
video comments/content/reactions/saves/reports, news articles, video listings,
and events. A fresh 17,275-byte local D1 backup was created and restored before
the additive schema pass. The historical migration backlog was not executed.

The repeatable local fixture set now includes one clearly fictional record for
each dashboard content type: a published classified article, TPI video, news
article, video listing, and event, alongside the stable OPS-010 Community Feed,
Messenger, notification, and personalization fixtures. Reapplication leaves
the stable counts unchanged and removes only known transient community-test
notifications.

The focused member-home suite passed 37/37 with zero remote requests and no
credential output. OPS-009 passed 27/27, OPS-010 passed 41/41, and the
repository QA gate reported 9 passed, 0 failed, and 3 unrelated optional checks
blocked. The authoritative Paranormal Teams CSV remains 4,935 records with
SHA-256 `b802fb97dbfe142e85df8bd55e6f3182e80ec35966b06671598e5bdd1fdd4490`.

The local browser reached the expected Member Login shell from `/member-home`
and showed the local banner and member navigation. Authenticated browser visual
acceptance is explicitly blocked because the secure browser bridge cannot enter
the ignored synthetic password without exposing it. The local Worker was
stopped after verification; StudioFlow's `127.0.0.1:8788` room server remained
untouched. No hosted environment, deployment, import, commit, or push occurred.

## TPI-OPS-012 local StudioFlow and ParaTube integration

TPI-OPS-012 extended the existing local-only schema runner with the
authoritative StudioFlow/ParaTube dependencies required by the current code:
member media library, StudioFlow rooms/invites/relay/workspaces, creator video
channels/social metadata, live-interaction metadata, video formats, and saved/
watch-history tables. A fresh 27,933-byte local D1 backup was verified and
restored before schema changes; rerunning the schema runner reported every
selected definition as already present.

The existing fixture mechanism now references one deterministic 480-byte
fictional SVG thumbnail stored only at `ops012/thumbnail.svg` in local R2.
No recording or video upload was performed. The focused OPS-012 suite passed
26/26 with zero external requests, no RealtimeKit use, no livestream start,
and no recording upload. It verified authenticated StudioFlow workspace
create/read/update/archive, role and owner isolation, room relay guest
metadata, ParaTube listings/details/comments/reactions, local R2 retrieval,
missing-object behavior, and bounded HTTP connectivity to the preserved
`127.0.0.1:8788` room server.

Required regressions also passed: OPS-002 11/11, OPS-007 10/10, OPS-009
27/27, OPS-010 41/41, OPS-011 37/37, DEV-024 offline 17/17, DEV-033 offline
16/16, DEV-037 offline 12/12, DEV-022 offline 15/15, TPI video player 22
assertions, and video navigation/duration regressions. The repository QA gate
reported 9 passed, 0 failed, and 3 unrelated optional checks blocked.

ParaTube rendered in the local browser with the local banner and synthetic
video card. Anonymous StudioFlow correctly showed its protected surface.
Authenticated browser interaction, WebSocket transport, actual media playback,
recording/recovery/autosave, livestream, and RealtimeKit remain unverified by
design. The local Worker was stopped after verification; port 8788 remained
running and untouched. No hosted environment, public traffic, deployment,
import, commit, or push occurred.

## TPI-OPS-013 shared local development environment

TPI-OPS-013 extended the existing local Wrangler launcher with one
authoritative local control surface. `npm run dev:local` starts the loopback
Worker at `http://127.0.0.1:8787/`; `npm run dev:local:status` reports the
Worker, local D1/R2 persistence, preserved `127.0.0.1:8788` StudioFlow room
server, branch, and HEAD; and `npm run dev:local:stop` signals only a verified
launcher-owned Worker. An occupied or ambiguous 8787 fails closed, and no
control path targets 8788.

OPS-013 control checks passed 16/16. The bounded local authenticated browser
harness passed 12/12 using a fresh Playwright context and ignored mode-0600
synthetic credentials. It verified the real login form, Member Home,
Messenger, Notifications, Profile, logout, and session clearing. It blocked
Google Fonts before dispatch and sent no external browser request. Existing
OPS-002/007/009/010/011/012 regressions passed 11/11, 10/10, 27/27, 41/41,
37/37, and 26/26 respectively.

The preferred daily browser origin is `127.0.0.1:8787`; localhost also reached
the same anonymous local Worker, but authenticated cookie sharing is not
assumed. Codex local access is verified. FreeBuff and OpenCode were not
connected to an agent session and remain **NOT VERIFIED** for repository,
Node, browser, localhost, and log reachability. WebSocket, playback,
recording-recovery restart, RealtimeKit, and livestream behavior remain outside
OPS-013. No deployment, remote D1/R2 mutation, public traffic, commit, push, or
StudioFlow room-server interruption occurred. See the
[OPS-013 access audit](200-AUDITS/TPI-OPS-013-AGENT-AND-BROWSER-ACCESS.md) and
[completion record](300-COMPLETED-WORK/TPI-OPS-013-LOCAL-DEVELOPMENT-RESULT.md).

## TPI-OPS-014 automatic local server startup

The existing local Worker now runs through the owner-controlled macOS user
LaunchAgent `com.tpi.local-development` at
`/Users/toddknipple/Library/LaunchAgents/com.tpi.local-development.plist`.
The service reuses `scripts/local-dev.mjs`, binds only to
`http://127.0.0.1:8787/`, uses the existing local-only Wrangler configuration,
and leaves the independent StudioFlow room server at `127.0.0.1:8788` running
and untouched. Owner state changes require `TPI_LOCAL_OWNER_CONTROL=1`; status
is read-only. Logs are bounded and redacted under `.local-dev/logs/`.

The LaunchAgent is installed and loaded with `RunAtLoad`, `KeepAlive`, and a
10-second throttle. Owner stop/start/restart, the repaired loopback readiness
check, intentional-stop suppression, and a bounded exact-wrapper crash-recovery
test passed. The Worker and 8788 room server were both running at final
verification. OPS-014 focused QA passed 20/20; OPS-002/007/009/011/012 and
OPS-013 regressions passed; the local authenticated browser harness passed
12/12 with zero external requests.

Codex local repository/Node/browser/log reachability is verified. FreeBuff and
OpenCode were not connected to an agent session and remain **NOT VERIFIED**.
A full macOS logout/reboot startup test was not performed. No deployment,
remote D1/R2 change, public exposure, commit, push, or StudioFlow interruption
occurred. See the [OPS-014 audit](200-AUDITS/TPI-OPS-014-LAUNCHAGENT-VERIFICATION.md)
and [completion record](300-COMPLETED-WORK/TPI-OPS-014-AUTOMATIC-SERVER-RESULT.md).

## TPI-OPS-015 complete local website access

OPS-015 established the current local page and capability inventory without
rebuilding or redesigning the website. The canonical source tree contains 287
HTML documents; after excluding three shared fragments, 284 page routes were
inventoried against the loopback Worker. The inventory records 109 public, 15
member, 5 contributor, 6 administrator, 141 education/research, 7
StudioFlow/ParaTube, and 1 authentication/access page. There were zero
unexpected 5xx or request failures. Four 404s are explicitly accounted for as
the unserved React source entry and three local Paranormal Teams review
artifacts.

The isolated local D1 was backed up before applying only the authoritative
admin/team dependencies 0025, 0035, 0036, 0039, 0040, 0047, 0048, and 0050.
The backup is `.local-dev/backups/tpi-ops-015-before-admin-schema.sql`,
51,965 bytes, SHA-256
`85848aa6dcbb50faae5d9555c7af9ca4b6aed0e29200d9817ddfdf621ac6a02c`.
The existing `local_admin`, `local_contributor`, and `local_member` roles and
fictional fixtures were preserved.

OPS-015 administrator/API QA passed 62/62. The Codex browser harness passed
51/51: all 26 Administration Center menu items navigated with active
indicators, administrator return controls rendered, contributor authoring
access worked, and member/contributor administrator denial worked. The browser
request guard blocked Google Fonts and Refine telemetry before dispatch.
OPS-002/007/009/010/011/012/013/014 regressions passed 11/11, 10/10, 27/27,
41/41, 37/37, 26/26, 16/16, and 20/20 respectively.

Overall OPS-015 status is **PARTIALLY COMPLETED** because all-page interactive
parity, real media/external integrations, and alternate-agent access remain
unverified or intentionally blocked. Production, public development, remote
D1/R2, 8788, real member data, and deployments remained untouched. See the
[OPS-015 inventory](200-AUDITS/TPI-OPS-015-PAGE-AND-CAPABILITY-INVENTORY.md)
and [completion record](300-COMPLETED-WORK/TPI-OPS-015-LOCAL-WEBSITE-VERIFICATION.md).

## TPI-OPS-016 complete local browser verification

OPS-016 continued from the OPS-015 inventory and preserved all 284 inventoried
routes. The owner-controlled `com.tpi.local-development` LaunchAgent was
confirmed read-only through `launchctl`, with the canonical repository,
loopback-only flags, local Worker, and preserved `127.0.0.1:8788` room server.
OPS-017 then enabled the existing Playwright harness from local npm cache
artifacts and reused installed Google Chrome without a browser download.

The complete matrix is recorded in
[TPI-OPS-016-BROWSER-ACCEPTANCE-MATRIX.md](200-AUDITS/TPI-OPS-016-BROWSER-ACCEPTANCE-MATRIX.md).
All 284 routes are now browser-accounted: 278 PASS, 6 PASS WITH LIMITATIONS,
zero FAIL, and 54/54 focused checks passed. Non-loopback browser requests were
blocked before dispatch.

Targeted local regressions passed: OPS-002 11/11, OPS-007 10/10, OPS-009
27/27, OPS-011 37/37, OPS-012 26/26, OPS-014 20/20, and OPS-015 admin/API
QA 62/62. OPS-015's authenticated role-browser result of 51/51 remains
preserved. Overall OPS-016/017 is **COMPLETED WITH LIMITATIONS**; OPS-018
repaired the published-article fragment paths. No production/public-development
request, deployment, remote D1/R2 change, import, commit, push, or 8788
interruption occurred. See
the [OPS-016 completion record](300-COMPLETED-WORK/TPI-OPS-016-LOCAL-BROWSER-RESULT.md)
and [OPS-017 result](300-COMPLETED-WORK/TPI-OPS-017-BROWSER-TESTING-RESULT.md).

## TPI-OPS-018 published article route repair

OPS-018 repaired the single browser-route failure found by OPS-017. The shared
`includes.js` fragment URLs are now root-relative, so the clean nested route
`/published-article/` loads `/header.html` and `/footer.txt` instead of looking
under `/published-article/`. The local asset staging script was run manually;
the owner-controlled Worker was not restarted.

The focused article check passed with HTTP 200, header and footer present, zero
console errors, zero failed local requests, and zero external requests. The
existing 284-route browser matrix then passed 278 routes, classified six as
expected limitations, and recorded zero failures, blocked routes, or
unverified routes. Focused browser checks passed 54/54.

The six limitations are four preserved source/research artifacts that are not
Worker application routes and two expected anonymous ITC Visual Studio access
gates. OPS-002/007/009/011/012/014 and OPS-015 administrator/API regressions
passed. Production, public development, remote D1/R2, StudioFlow 8788,
external services, commits, and pushes remained untouched. See the
[OPS-018 result](300-COMPLETED-WORK/TPI-OPS-018-ARTICLE-REPAIR-RESULT.md) and
[updated browser matrix](200-AUDITS/TPI-OPS-016-BROWSER-ACCEPTANCE-MATRIX.md).

## TPI-STUDIOFLOW-013 local production-lock validation

TPI-STUDIOFLOW-013 applied the additive StudioFlow production-lock migration
only to the isolated local D1 after a verified private backup. The authorized
single Worker restart restored the LaunchAgent-owned Worker on 8787 while the
independent room server on 8788 remained running. Two temporary Studios proved
independent schedule persistence, creator-scoped production locking, matching
heartbeat/stop behavior, and concurrent-start serialization in 15/15 local
API checks. Synthetic rows were removed after validation; existing Studio
fixtures remained available and the local D1 integrity and foreign-key checks
passed.

The restarted StudioFlow browser surface retained the saved Studio selector,
scene/media controls, connected room bridge, and `/member-home` return target;
the local-development banner remained absent and browser error logs were empty.
The floating Messenger surface was visible on authenticated ParaTube, but a
direct `/messenger` browser navigation was blocked before inspection and is
therefore not claimed as verified. TPI-STUDIOFLOW-013 is **PARTIALLY COMPLETE /
CONDITIONALLY READY** for a future separately authorized local or development
validation batch. No production, hosted development, external provider,
deployment, commit, push, recording, livestream, or database import occurred.
See the [TPI-STUDIOFLOW-013 validation result](300-COMPLETED-WORK/TPI-STUDIOFLOW-013-VALIDATION-RESULT.md).

## TPI-STUDIOFLOW-014 podcast production readiness

TPI-STUDIOFLOW-014 inspected the existing StudioFlow readiness boundary for
future owner podcast productions without creating real Studios or assets. The
workspace model correctly separates owner-scoped Studio configuration and
asset references from browser-local recording bytes, recording chunks,
recovery state, and optional File System Access folder handles. Existing
synthetic Studios retain distinct scenes and backgrounds; local schedules and
the creator production lock remain compatible.

A repeatable SPA transition defect was found and corrected in
`studio/workspace-bridge.js`: a detached asset-panel reference prevented the
bridge from reattaching `My Studios` after opening an existing Studio from the
StudioFlow home screen. The correction is staged locally and passes focused
offline checks 10/10, but live verification is blocked because this directive
prohibits a Worker restart. Real camera/microphone recording, interruption
recovery, external-drive writes, provider livestreaming, and external
destinations remain owner/provider testing requirements. TPI-STUDIOFLOW-014 is
**PARTIALLY COMPLETE / CONDITIONALLY READY**. See the
[TPI-STUDIOFLOW-014 readiness result](300-COMPLETED-WORK/TPI-STUDIOFLOW-014-READINESS-RESULT.md).

## TPI-STUDIOFLOW-017 seamless Studio switching

TPI-STUDIOFLOW-017 corrected the existing My Studios bridge so an owned saved
Studio is persisted and restored through StudioFlow's existing internal
`studio` route without falling back to Home. In-flight saves are awaited,
failed saves keep the current Studio active, the remembered Studio is restored
only after the authenticated workspace API confirms it is still available, and
the creator production lock continues to block unsafe switching.

Focused offline checks passed 14/14, the TPI-STUDIOFLOW-014 regression passed
10/10, the TPI-STUDIOFLOW-012 regression passed 14/14, bridge syntax checks
passed, and `git diff --check` passed. The owner-authorized live browser
verification then passed direct Studio opening, save-before-switch,
studio-specific persistence, scene restoration, and last-active-Studio
restoration. Live recording/livestream and injected save-failure tests were
not performed by design. No deployment or production database change
occurred; local synthetic workspace autosaves were exercised as required by
the test. No commit or push occurred. See the
[TPI-STUDIOFLOW-017 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-017-RESULT.md).

## TPI-STUDIOFLOW-017 SMART Pads addendum

The existing Sound Effects and Background Music libraries now have reusable
colored SMART Pads. Sound-effect clicks dispatch through the maintained React
program audio bus so they can be heard in the live stage/program path; music
uses the existing background-music path and loop setting. Pad names and colors
persist with each studio, MP3 title metadata is used when available, and scene
cards can assign music with an optional Start after Intro handoff. Focused
build, isolated E2E, bridge, media, release-safety, production smoke, guarded
deployment, and Firefox live scene-control checks passed. Worker
`115a9bd2-e462-407f-8ca7-47736ef07fe4` is active. Disposable authenticated audio
playback was not exercised against protected Crossroads media.
See the [SMART Pads implementation record](300-COMPLETED-WORK/2026-10-22-STUDIOFLOW-SMART-PADS-RESULT.md).

## TPI-STUDIOFLOW-019 intro/outro full-stage video rendering

TPI-STUDIOFLOW-019 added an explicit full-frame rule for the shared
prerecorded intro/outro video path. The production stage remains a 16:9 box;
direct stage videos now have explicit zero insets, dimensions, margins,
padding, borders, and `object-fit: contain`. This lets 1920 × 1080 clips fill
the stage while preserving 4:3 and 9:16 media without distortion or cropping.

The live local browser measured the stage at 855 × 480.9375 pixels (16:9),
loaded the patched stylesheet, and reported no console errors. Focused checks
passed 7/7; TPI-STUDIOFLOW-012, -014, -017, and TPI-DEV-033 regressions also
passed. No media bytes, studio records, databases, deployments, commits, or
pushes were changed. The owner’s `/Users/toddknipple/Desktop/COTU INTRO.mp4`
was inspected without alteration and matches H.264 1920 × 1080, 30 fps,
BT.709. A temporary browser-local copy was loaded into synthetic Studio 10
for direct runtime measurement, rendered at the exact 16:9 stage dimensions
with no generated side borders, and was then removed. No separate Outro
fixture was available, so actual outro playback, audio synchronization,
recording, and livestream acceptance remain pending. See the
[TPI-STUDIOFLOW-019 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-019-RESULT.md).

## TPI-STUDIOFLOW-020 playback toggles and Opera compatibility

TPI-STUDIOFLOW-020 added a local reset bridge around the existing Intro and
Outro scene controls. Selected clips now toggle between Play and Stop, each
activation resets playback to `00:00`, scene changes stop the prior clip, and
recording/Go Live controls clear preview state without starting a clip. The
compiled production compositor no longer loops prerecorded clips, and natural
Outro completion no longer stops recording or livestream state.

Codex live toggle checks passed for Intro, Outro, cross-playback, scene
restoration, and fresh-start behavior. Opera Air was directly inspected: its
pre-patch stage was stretched to approximately 1086 × 578 pixels (about
1.88:1), while the local correction restored an approximately 1029 × 578
pixel 16:9 stage and removed the visible side-area defect. Focused playback
checks passed 11/11, with the TPI-STUDIOFLOW-012, -014, -017, -019, and
DEV-033 regressions still passing. Full natural completion and recording or
livestream startup were not activated and remain owner-controlled acceptance
items. No deployment, database mutation, service restart, commit, or push
occurred. See the [TPI-STUDIOFLOW-020 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-020-RESULT.md).

## TPI-OPS-019 multi-browser development workflow

The active local agent browser is Codex In-App Browser. Codex opened the
canonical loopback homepage, verified the local-development banner and
navigation, and captured a screenshot. Retained Playwright evidence covers
synthetic admin, member, and contributor sessions, role boundaries,
console/request inspection, and local-only request guarding: 278 PASS, 6
expected limitations, 0 FAIL across 284 routes, with 54/54 focused checks.

FreeBuff remains standby and **NOT VERIFIED** for agent QA. Opera is available
for the owner to review the same `http://127.0.0.1:8787/` origin, but no Opera
agent acceptance is claimed. The launchd-owned Worker on 8787 and independent
StudioFlow room server on 8788 were read-only verified running. No service
restart, deployment, external request, database/R2 mutation, import, commit, or
push occurred. See the [OPS-019 directive](100-DIRECTIVES/TPI-OPS-019-MULTI-BROWSER-WORKFLOW.md),
[result](300-COMPLETED-WORK/TPI-OPS-019-BROWSER-WORKFLOW-RESULT.md), and
[agent handoff](TPI-DEVELOPMENT-AGENT-HANDOFF.md).

### OPS-019 Addendum A — local administrator fixture

The existing OPS-009 `local_admin` fixture is active in isolated local D1 with
the legitimate `admin` role. OPS-009 authentication passed 27/27 and OPS-015
administrator/role-boundary QA passed 62/62 with zero external requests and no
credentials printed. The owner-only terminal viewer is
`scripts/show-local-admin-credentials.sh`; it requires an interactive terminal,
checks the Git-ignored credential file remains mode 0600, and does not reset,
log, HTTP-serve, or clipboard-copy the password. Production and hosted
development remain untouched.

## TPI-OPS-021 local development banner removal

The visible local banner was centrally injected by `worker.js` after local HTML
asset responses and was removed without changing the local request guard,
authentication, D1/R2 isolation, or production/public-development safeguards.
The single owner-authorized Worker restart loaded the fix. Codex verified `/`,
`/admin-panel`, `/member-home`, Messenger, `/paratube`, and `/studio/` with no
banner or layout obstruction. StudioFlow Home, Library, Destinations, and
Teleprompter controls were interactively reached; no broadcast, recording, or
configuration action was invoked. Focused browser and local regressions passed
with zero external requests. See the
[OPS-021 result](300-COMPLETED-WORK/TPI-OPS-021-BANNER-REMOVAL-RESULT.md).

## TPI-STUDIOFLOW-021 unified Opera development browser workflow

Opera Air is now the authoritative browser for live local StudioFlow
verification at `http://127.0.0.1:8787/studio/`. Source inspection confirms
that workspace names, scenes, configuration snapshots, guest settings, and
asset metadata are shared through the authenticated local workspace API and
local development D1, while localStorage, browser IndexedDB media/recording
data, avatar data, session cookies, and ephemeral BroadcastChannel state are
browser-specific. Opera's existing workspace was directly inspected without
clearing or changing storage. The Codex browser remains an isolated synthetic
test surface and its Studios must not be treated as the owner's workspace.

The local Worker and room server were verified running on ports 8787 and 8788.
No Studio, scene, media asset, guest setting, preference, database, production
resource, deployment, commit, push, or tunnel service was modified. Direct
Opera storage-inspector enumeration remains not tested because the available
automation surface exposes the page and screenshot but not browser-private
storage tools. The canonical shell asset references are known, but Opera's
network inspector was not exposed by the available automation surface. See the
[TPI-STUDIOFLOW-021 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-021-RESULT.md).

## TPI-STUDIOFLOW-022 development Studio backup and recovery investigation

TPI-STUDIOFLOW-022 is **INVESTIGATION COMPLETE / BACKUP IMPLEMENTATION
DEFERRED**. Read-only source inspection confirms that authenticated Studio
identity, normalized workspace configuration, scenes, guest settings, ownership,
versions, and asset metadata are shared through the local Worker and development
D1. Opera-specific localStorage mirrors active context and preferences, while
the browser-local IndexedDB database `studioflow-recordings` stores uploaded
media blobs, recordings, chunks, recovery checkpoints, and storage handles.
The separate `studioflow-avatars` database stores avatar bytes. Existing JSON
configuration backup is not a complete media backup because it preserves
`blobKey` references without the referenced browser-local bytes.

The investigation recommends a future versioned application-level package that
combines validated Studio configuration, a checksum-backed media manifest/media
pack, and a separately authorized development D1 export. Restore should be
previewed, version-aware, non-destructive, and new-copy by default. Browser
profile copying is not recommended because it can expose credentials and private
session state. Exact Wrangler/local-D1 export syntax, blob-to-Studio ownership
mapping, browser quota limits, and file-system-handle recovery remain future
implementation questions.

No Opera storage, D1 record, media byte, migration, R2 object, production
resource, or service was modified. No backup, export, restore, or destructive
test was performed. See the [TPI-STUDIOFLOW-022 investigation](100-DIRECTIVES/TPI-STUDIOFLOW-022-BACKUP-RECOVERY-INVESTIGATION.md)
and [completion report](300-COMPLETED-WORK/TPI-STUDIOFLOW-022-RESULT.md).

## TPI-STUDIOFLOW-023 active Studio name in navigation

TPI-STUDIOFLOW-023 is **COMPLETE / OPERA VERIFIED / LOCAL DEVELOPMENT ONLY**.
The selector derives its label from the active Studio title and retains the
`My Studios` fallback. The development shell references a versioned bridge URL
so Opera can revalidate the bridge without clearing browser state. The bridge
now parses the app's JSON active-broadcast ID, reconciles after host hydration,
and avoids autosaving a local-only Crossroads broadcast into an unrelated
synthetic server workspace. Existing switching, production lock, scene, media,
and restoration logic remains intact.

The existing Opera StudioFlow tab was refreshed only; the exact visible label
was `Crossroads of the Unknown ▾` and the accessibility label was
`Select Studio: Crossroads of the Unknown`. Focused TPI-023 checks passed
14/14 and TPI-STUDIOFLOW-017 passed 14/14. No browser storage, cookies, cache,
deployment, migration, commit, or push occurred. Earlier authorized refreshes
did issue existing autosave PATCH requests, which are documented rather than
reported as zero database activity. Crossroads remains local-only until a
separate approved server-workspace mapping is made. See the [TPI-STUDIOFLOW-023
result](300-COMPLETED-WORK/TPI-STUDIOFLOW-023-RESULT.md).

## TPI-STUDIOFLOW-024 automatic local backup system — Phase 2

TPI-STUDIOFLOW-024 Phase 2 is **CONDITIONALLY COMPLETE / SYNTHETIC VALIDATION
PASSED / OWNER ACTIVATION DEFERRED**. Phase 1 mapped the split StudioFlow model:
authenticated server-backed workspaces and normalized state are stored through
the local Worker and D1, while browser-local localStorage and IndexedDB hold
active context, media bytes, recordings, recovery chunks, and filesystem
handles. Phase 2 adds a source-kind-aware backup core, strict manifest
validation, actual-byte media collection through an injected resolver, staged
verified publication, preserved history, change detection, destination-error
handling, and a guarded desktop folder adapter.

The TPI-023 historical record described Crossroads as local-only. A current
read-only D1 snapshot now contains a matching active Crossroads workspace, so
the future backup format must support both local-broadcast and
server-workspace source kinds without rewriting the historical report. A
versioned manifest package with verified media bytes, staged writes, retained
history, destination-loss handling, and restore-as-new is recommended. Desktop
automatic folder backup is a future Opera/Chromium target; iPhone, iPad, and
Android require a clearly labeled manual package/share fallback until their
runtime capabilities are separately tested.

The Phase 2 suite passed 23/23 synthetic checks with zero external requests and
no owner-data access. TPI-017 passed 14/14, TPI-023 passed 14/14, TPI-DEV-022
passed 15/15, TPI-012 passed 14/14, syntax checks passed 3/3, and
`git diff --check` passed. Automatic backup remains off, the Backup Now/history/
restore controls remain unavailable, and no folder permission was requested.
The local Worker was not restarted, so Opera runtime verification of the new
card is pending. No owner Studio, scene, media byte, browser-storage item, D1
record, R2 object, service, production resource, or public environment was
modified. No backup, export, restore, permission request, migration,
deployment, commit, or push was performed. See the [TPI-STUDIOFLOW-024
architecture](100-DIRECTIVES/TPI-STUDIOFLOW-024-LOCAL-BACKUP-ARCHITECTURE.md)
and [Phase 2 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-024-PHASE-2-RESULT.md).

## TPI-STUDIOFLOW-025 active workspace reconciliation and safe test-Studio cleanup

TPI-STUDIOFLOW-025 is **COMPLETE / LOCAL OPERA VERIFIED / PRODUCTION NOT
TOUCHED**. The bridge now reconciles the active Opera broadcast with a unique
server workspace using verified identity and title matching, preserves the
selected workspace identity during saves, and avoids duplicate workspace
creation. The owner-authorized Studio 8 and Studio 9 records were archived
through StudioFlow's supported deletion action; Crossroads of the Unknown
workspace `43b20614-69da-4d82-af9d-063cace4b6cc` remains active and intact.

Opera was refreshed only on the StudioFlow tab. The final selector showed
`Crossroads of the Unknown ▾`, and the list contained only `Studio 10:
Crossroads of the Unknown`, `Create New Studio`, and the expected Recently
Deleted control. TPI-025 passed 11/11, TPI-017 passed 14/14, TPI-023 passed
14/14, TPI-024 Phase 2 passed 23/23, syntax checks passed, and `git diff
--check` passed. No Worker or room-server restart, production access,
deployment, migration, commit, or push occurred. See the [TPI-STUDIOFLOW-025
result](300-COMPLETED-WORK/TPI-STUDIOFLOW-025-RESULT.md).

## TPI-STUDIOFLOW-025 Opera persistence diagnostic

The read-only Opera diagnostic is **CONDITIONALLY COMPLETE / IMPLEMENTATION
DEFERRED**. Opera's current settings show JavaScript enabled, third-party
cookies allowed, ad/tracker blocking disabled, and localhost camera/microphone
permission allowed. The existing StudioFlow tab remains on
`http://127.0.0.1:8787/studio/`; no refresh or storage operation was performed.

Read-only D1 evidence confirms Crossroads workspace
`43b20614-69da-4d82-af9d-063cace4b6cc` is active at version 152 with correct
workspace metadata, but its saved `state_json.broadcast.title` is empty. The
visible Crossroads label therefore does not prove that the saved broadcast
state is complete. The primary classification is a StudioFlow reconciliation
defect, with browser-local active-broadcast state a contributing risk. No
Opera setting, origin mismatch, IndexedDB identity mismatch, service worker,
or stale-cache cause was confirmed. TPI-017 14/14, TPI-023 14/14, TPI-024
Phase 2 23/23, and `git diff --check` passed. No application code or owner data
was modified. See the [diagnostic result](300-COMPLETED-WORK/TPI-STUDIOFLOW-025-DIAGNOSTIC-RESULT.md).

## TPI-STUDIOFLOW-026 Crossroads configuration integrity

The read-only integrity review is **CONDITIONALLY COMPLETE / CORRECTION
DEFERRED**. Crossroads workspace `43b20614-69da-4d82-af9d-063cace4b6cc` remains
active at version 152, with matching `local_broadcast_id` and saved broadcast
ID. Its top-level workspace title is `Crossroads of the Unknown`, but the
nested `state_json.broadcast.title` remains empty. Source inspection confirms
that the current save shape preserves the saved broadcast ID without
backfilling that empty nested title from workspace metadata. This is a
confirmed persistence-integrity defect/risk; it does not establish that scenes
or media were lost.

Four scenes and the current intro, outro, and background references remain
present in the valid D1 snapshot. Logo, overlay, and audio fields are absent or
empty in that snapshot and were not classified as corruption because browser
local media state was not enumerated. Synthetic integrity checks passed 10/10;
TPI-017 passed 14/14, TPI-023 14/14, TPI-024 Phase 2 23/23, TPI-025 11/11,
syntax checks passed, and `git diff --check` passed. No Opera refresh, storage
change, D1 write, owner save, media export, service restart, deployment,
migration, commit, or push occurred. See the [TPI-STUDIOFLOW-026 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-026-RESULT.md).

## TPI-STUDIOFLOW-027 Studio title persistence correction

The targeted application correction is **CONDITIONALLY COMPLETE / OWNER REPAIR
DEFERRED**. `studio/workspace-bridge.js` now validates the selected workspace
and broadcast identities, fills only empty nested broadcast titles from
verified workspace metadata, rejects conflicting titles before PATCH, and keeps
explicit Studio renames synchronized in both title fields. Workspace version
guards, switching, restoration, save-in-flight handling, and production locks
remain intact.

Synthetic integrity coverage passed 21/21. TPI-017 passed 14/14, TPI-023
14/14, TPI-024 Phase 2 23/23, TPI-025 11/11, syntax checks passed, and
`git diff --check` passed. Read-only D1 verification confirms Crossroads is
still active at version 152 with the same identity and the pre-existing empty
nested title; no owner repair was executed. Opera was not refreshed. No owner
data, browser storage, D1 records, media, services, production resources,
deployment, migration, commit, or push was touched. See the
[TPI-STUDIOFLOW-027 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-027-RESULT.md).

## TPI-STUDIOFLOW-028 / 029 Crossroads workspace repair

TPI-STUDIOFLOW-028 is **CONDITIONALLY COMPLETE** under TPI-STUDIOFLOW-029.
The local Worker was staged and restarted once through the owned LaunchAgent;
the corrected bridge was served, and Opera’s authorized StudioFlow refresh
completed the supported restore/autosave path. Crossroads now reports version
154 with matching workspace and nested broadcast titles. Its IDs, scenes,
media references, guest settings, and other configuration remain intact;
Studios 8 and 9 remain archived.

A verified post-repair configuration snapshot exists outside Git. Because the
authorized refresh triggered the save immediately, a pre-write snapshot was
not materialized before the application write; this is the remaining
limitation. No production resource, deployment, migration, commit, or push was
used. See the [TPI-STUDIOFLOW-029 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-029-RESULT.md).

## TPI-STUDIOFLOW-030 automatic backup integration

TPI-STUDIOFLOW-030 is **CONDITIONALLY COMPLETE**. The local backup core now
preserves complete supported configuration, includes broadcast identity,
collects actual supported media bytes from the existing recording Blob store,
and verifies written manifests, configuration, media hashes, and completion
markers by reading the destination back. The browser bridge supports explicit
folder selection, guarded manual backup, destination reconnection, status and
history, and debounced automatic scheduling after a confirmed workspace save.

Synthetic real-filesystem verification passed 13/13, and the prior Phase 2
suite passed 23/23. Opera remains the authoritative browser, but no owner
folder permission was requested and Crossroads automatic backups remain OFF.
Full restore, mobile/tablet automatic folder writes, retention cleanup, and
owner activation remain deferred. No owner data or media was modified or
exported; production was not accessed; no deployment, commit, or push occurred.
See the [TPI-STUDIOFLOW-030 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-030-RESULT.md).

## TPI-STUDIOFLOW-031 video overlay cleanup

The source correction is **CONDITIONALLY COMPLETE / OPERA VERIFICATION
BLOCKED**. The production preview stage uses bare HTML video elements and does
not render the reported pop-out/skip controls as StudioFlow buttons. Opera's
browser-level Video Popout/Video Skip overlay is avoided for the production
background and direct Intro/Outro stage clips with a stage-only canvas mirror;
the underlying video elements remain mounted for audio, looping, playback
events, and compositor compatibility. Native PiP/remote-playback hints remain
in place, and the bridge URL is cache-busted for the local Worker. The focused
overlay checks pass 12/12 and the combined TPI-017/019/020/023/025/027/030/031
regression checks pass 103/103, with syntax and `git diff --check` passing. The
remaining evidence is a fresh Opera check after the authorized local Worker
refresh across three loops, scene switching, Intro, Outro, and return to the
normal scene. The
existing Opera tab remains in a loading state with the pre-change render, and
the direct cache-busted bridge request returns the site access gate rather than
the bridge, so those live checks are not credited. No recording or livestream
was started, and Crossroads was not modified. See the
[TPI-STUDIOFLOW-031 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-031-RESULT.md).

## TPI-STUDIOFLOW-032 Backup & Recovery completion

TPI-STUDIOFLOW-032 is **CONDITIONALLY COMPLETE**. The local backup system now
supports verified, staged media-inclusive packages and restore-as-new with new
workspace/broadcast identities, media Blob-key remapping, required-media
validation, corruption rejection, duplicate-click protection, and cleanup on
failed workspace creation. Backup settings are scoped by Studio, automatic
backups remain off by default, and selected custom backgrounds are treated as
required media when active. The focused TPI-032 restore suite passed 11/11;
the combined TPI-017/023/024/025/027/030/031/032 set passed 119/119, with
syntax and `git diff --check` passing.

Opera remains the authoritative local browser at
`http://127.0.0.1:8787/studio/`; Crossroads is active and visually intact. No
owner folder was selected, no filesystem permission was requested, no owner
backup or restore was run, and automatic backups remain OFF. Real Opera folder
permission, cross-device recovery, mobile fallback, recording-byte backup,
retention cleanup, and rich inline backup history remain follow-up work. See
the [TPI-STUDIOFLOW-032 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-032-RESULT.md).

## TPI-STUDIOFLOW-033 real Opera backup and restore verification

TPI-STUDIOFLOW-033 is **CONDITIONALLY COMPLETE / REAL SYNTHETIC OPERA
WORKFLOW VERIFIED**. Opera selected and granted edit permission for a dedicated
synthetic folder, wrote a verified six-media package, read the files and
SHA-256 hashes back from disk, completed a debounced automatic backup, and
restored the package as a new synthetic workspace with new workspace and
broadcast identities. The backup bridge mutation-loop defect and restore media
accumulator defect found during live verification were corrected. Focused and
prior regression suites pass 129/129 across TPI-017, 023, 024 Phase 2, 025,
027, 030, 031, 032, and 033; syntax checks and `git diff --check` pass.

The test used an isolated Opera fixture and did not access Crossroads, owner
browser storage, owner media, or shared D1 for writes. Crossroads automatic
backups remain OFF and no permanent owner destination is configured. Full
disaster recovery into an empty D1, physical cross-device recovery, mobile
unattended folder writes, and recording-byte backup remain unverified or
deferred. See the [TPI-STUDIOFLOW-033 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-033-RESULT.md).

## TPI-STUDIOFLOW-034 automatic server startup and local runtime reliability

TPI-STUDIOFLOW-034 is **CONDITIONALLY COMPLETE / STARTUP AND RECOVERY
VERIFIED**. The existing `com.tpi.local-development` LaunchAgent remains the
startup architecture. Its generated plist now uses stable `/opt/homebrew/bin/node`
instead of a versioned Cellar path, installation waits for launchd unload
completion, and the Worker launcher exits when 8787 readiness is lost so
LaunchAgent `KeepAlive` can recover the service. A controlled 8787-only Worker
termination recovered automatically; the focused startup suite passed 10/10.

Host-level requests reached the Worker. Anonymous `/studio/` requests returned
the intentional local Creator Studio 403 access boundary, so no authentication
or production protection was weakened. Opera's current tab still showed a
browser error document after refresh, preventing authenticated owner UI
acceptance. Ports 8788 and 8789 were not restarted or modified and were not
listening during this check. The combined StudioFlow regression set remains
129/129, with syntax and `git diff --check` passing. See the
[TPI-STUDIOFLOW-034 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-034-RESULT.md).

## TPI-STUDIOFLOW-037 Safari white-screen repair

TPI-STUDIOFLOW-037 is **COMPLETE / LOCAL DEVELOPMENT**. Safari's white screen was
caused by the local Worker returning empty 404 documents for clean page URLs even
though the corresponding `.html` assets existed. `worker.js` now performs a narrow
clean-URL fallback while preserving the existing Creator Studio authentication gate.
Safari directly rendered the clean homepage, Member Home, and `/studio/` routes.
The focused route checks passed 7/7; no browser storage, D1 data, owner media, or
credentials were changed. See the [TPI-STUDIOFLOW-037 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-037-RESULT.md).

## TPI-STUDIOFLOW-047 development recovery and release readiness

TPI-STUDIOFLOW-047 is **PARTIAL / LOCAL INTEGRATION COMPLETE / PRODUCTION NOT
READY**. After the owner cleared Opera data, read-only local inspection confirmed
Crossroads remains active at version 228 with its expected workspace and broadcast
identities. The current D1 workspace has no persisted scene entries or owner
media bytes, so browser-local media recovery remains unverified and no old backup
was restored. The existing asset watcher and deterministic staging pipeline were
rebuilt and verified; the visible Room Bridge status card was removed from the
backstage row while diagnostics remain in People; guest waiting-room regressions
remain green. Production requires separate authenticated HTTPS/WebRTC, room,
storage, and owner-acceptance testing. See the [TPI-STUDIOFLOW-047 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-047-RESULT.md).

## TPI-STUDIOFLOW-048 persistent project saving, backups, and recovery

TPI-STUDIOFLOW-048 is **CONDITIONALLY COMPLETE / LOCAL IMPLEMENTATION AND SYNTHETIC
VERIFICATION**. Existing D1-backed My Studios workspaces remain the authoritative
project store. The project menu now exposes Save Project, project metadata
configuration export/import, and server-backed recovery snapshots stored in the
existing R2 binding. Autosave remains debounced and version checked; recovery
restoration always creates a new Studio. The focused suite passes 20/20, syntax
checks and `git diff --check` pass, Crossroads was not modified, and no owner
backup was activated. Authenticated browser snapshot round-trip remains a
follow-up acceptance item. See the [TPI-STUDIOFLOW-048 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-048-RESULT.md).

## TPI-STUDIOFLOW-049 portable project backups and save status

TPI-STUDIOFLOW-049 is **CONDITIONALLY COMPLETE / LOCAL IMPLEMENTATION AND
SYNTHETIC VERIFICATION**. My Studios now distinguishes server-confirmed
`UNSAVED CHANGES`, `SAVING...`, `PROJECT SAVED`, and `SAVE FAILED` states from
portable-backup state. Configuration export reports `BACKUP PREPARED — CONFIRM
FILE SAVED` until the user confirms a browser download; complete project backup
uses the existing verified media-inclusive folder writer and tracks
`BACKUP CURRENT`, `BACKUP OUTDATED`, and `BACKUP FAILED` by workspace version.
R2 recovery snapshots remain a separate server-backed recovery layer. The
focused suite and syntax checks pass locally; authenticated browser/download
acceptance remains follow-up work. See the
[TPI-STUDIOFLOW-049 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-049-RESULT.md).

## TPI-STUDIOFLOW-050 Studio interface flicker / reload-loop repair

TPI-STUDIOFLOW-050 is **PARTIAL / SOURCE REPAIR COMPLETE / AUTHENTICATED
BROWSER VERIFICATION PENDING**. The confirmed cause was three document reload
paths in the generated workspace reconciliation bridge. Workspace selection and
route reconciliation now apply state in place without navigation; save gating,
version checks, production lock, asset staging, and guest-audio paths remain
intact. Focused stability checks pass 10/10 and the broader StudioFlow set
passes 170/170. The visible Opera page remained stable during the available
observation, but the authenticated owner Studio view was not available for the
required continuous runtime check. See the
[TPI-STUDIOFLOW-050 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-050-RESULT.md).

## TPI-STUDIOFLOW-051 production migration

TPI-STUDIOFLOW-051 is **BLOCKED / NO DEPLOYMENT**. The authoritative
StudioFlow source build passes, and the local StudioFlow regression suites are
green, but the canonical `StudioFlow/web/dist` output differs from the
repository `studio/` integration output. The worktree also contains
uncommitted application changes, which the guarded production deploy correctly
rejects. Read-only Cloudflare D1 verification failed with OAuth error `10000`,
so production D1/R2 bindings, authenticated acceptance, HTTPS/WebRTC signaling,
and rollback readiness remain unverified. No production resource was modified.
See the [TPI-STUDIOFLOW-051 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-051-RESULT.md).

## TPI-STUDIOFLOW-052 fresh-browser session and Home page flickering

TPI-STUDIOFLOW-052 is **BLOCKED / DATA-INTEGRITY INCIDENT REQUIRES OWNER
REVIEW**. The original authenticated trace reproduced a full-document reload
loop caused by a stale staged `workspace-bridge.js`; a second fresh-session
defect caused repeated autosave attempts because server workspace state was not
hydrated before fingerprinting. Staging, watcher coverage, and initialization
hydration were repaired. A mutation-blocked isolated browser run passed the
fresh unauthenticated gate, authenticated render/refresh, and the full
120-second stability window. The initial unguarded diagnostic unexpectedly
autosaved the protected Crossroads workspace; read-only inspection found its
expected identities but reported zero persisted scenes at version 240. No
rollback or backup restore was performed. TPI-STUDIOFLOW-051 remains blocked.
See the [TPI-STUDIOFLOW-052 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-052-RESULT.md).

## TPI-STUDIOFLOW-053 Crossroads data integrity and release recovery

TPI-STUDIOFLOW-053 is **COMPLETE / READ-ONLY / RECOVERY NOT PERFORMED**. The
investigation recorded the protected Crossroads workspace at version 240 with
the expected workspace and broadcast identities and zero persisted scenes. No
workspace save, restore, backup import, browser-storage change, D1 mutation, or
R2 mutation was performed. The owner subsequently decided to rebuild Crossroads,
so the investigation preserves the evidence without initiating recovery. See
the [TPI-STUDIOFLOW-053 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-053-RESULT.md).

## TPI-STUDIOFLOW-054 production release preparation and live migration

TPI-STUDIOFLOW-054 is **BLOCKED / NOT DEPLOYED**. Production resources remain
unchanged. Release gates still require an approved source/build checkpoint,
production schema review, authenticated acceptance, server-side media
persistence verification, HTTPS/WebRTC guest signaling, and a reviewed rollback
plan. The Crossroads rebuild decision does not authorize overwriting existing
records or bypassing these release gates. See the
[TPI-STUDIOFLOW-054 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-054-RESULT.md).

## TPI-STUDIOFLOW-055 source and website integration reconciliation

TPI-STUDIOFLOW-055 is **PARTIAL / LOCAL RECONCILIATION VERIFIED / RELEASE
CHECKPOINT PENDING**. The authoritative StudioFlow source at
`/Users/toddknipple/Documents/StudioFlow/web` builds twice with equivalent
artifacts. The integrated website candidate references the current generated
JavaScript and CSS, preserves the TPI bridge layer, and contains no obsolete
bundle references. The source worktree remains uncommitted, and mixed website
backend changes require hunk-level review before staging. See the
[TPI-STUDIOFLOW-055 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-055-RESULT.md).

## TPI-STUDIOFLOW-056 release checkpoint and documentation synchronization

TPI-STUDIOFLOW-056 is **COMPLETE / AUDIT COMPLETE / NO CHECKPOINT CREATED**.
The read-only audit classified 33 modified tracked files and 259 untracked
paths into release source, generated assets, TPI integration, tests, docs,
local-only data, unrelated work, and owner-review items. Nothing was staged,
committed, pushed, deployed, deleted, or reset. The proposed release manifest
and remaining questions are recorded in the
[TPI-STUDIOFLOW-056 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-056-RESULT.md).

## TPI-STUDIOFLOW-057 verification test reconciliation

TPI-STUDIOFLOW-057 is **COMPLETE / 107 OF 107 CHECKS PASS**. TPI-012's two
failures were outdated assertions for the current project-management menu:
the application intentionally exposes `Import Project Configuration`, `Save
Project`, and `Refresh Project Library` instead of the legacy action-row
labels. TPI-020 and TPI-031 had hardcoded references to retired generated
bundle names; those checks now resolve the current JavaScript asset from the
integrated entry point while retaining meaningful content and ordering checks.
The same current-asset correction was applied to TPI-045.

After the asset-name correction exposed the current generated code, TPI-020
also identified a real application regression: the authoritative compositor
created finite intro/outro clips with `loop = true`. The source now sets that
compositor clip to one-shot, and the website integration was regenerated as
`studio/assets/index-AccwBwcd.js`. The authoritative staging verifier passed
two equivalent builds, current generated asset matching, and preserved TPI
bridges. The new TPI-055 source-reconciliation verifier passes 12/12.

The final named-suite results are TPI-012 14/14, TPI-020 11/11, TPI-031 12/12,
TPI-043 14/14, TPI-045 14/14, TPI-048 20/20, TPI-050 10/10, and TPI-055 12/12.
These are local source/build checks; they do not constitute production
readiness or authenticated browser acceptance. No owner Studio, browser
storage, production resource, commit, push, or deployment was touched. See
the [TPI-STUDIOFLOW-057 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-057-RESULT.md).

## TPI-STUDIOFLOW-058 authoritative source checkpoint preparation

TPI-STUDIOFLOW-058 is **COMPLETE / PREPARED / OWNER AUTHORIZATION REQUIRED**.
The authoritative repository `/Users/toddknipple/Documents/StudioFlow/web` is
on `main` at `8437b071c2bf1eda3d9df44dca53f95f08e6b032`, with only
`src/App.tsx` and `src/styles.css` modified. The current diff is fingerprinted
as `8d07fdfd01b7745631bb91d374d1e7acc6bc590ef2efabd485ac0241c1b8edbd`.

The source build passes TypeScript and Vite validation, producing
`index-AccwBwcd.js` and `index-TsnuK4Ub.css`. Those files match the current
website integration byte-for-byte. The existing staging verifier also passes
two equivalent builds, current asset matching, bridge preservation, and no
obsolete bundle references. The current source changes are all attributable to
the reviewed StudioFlow feature work and TPI-057 compositor correction; no
unrelated or sensitive source files are present.

The proposed source checkpoint contains both modified source files, but has
not been staged or committed. Owner review is still required for the guest
audio/admission behavior, default recording preference, and the fact that the
website integration remains dependent on these uncommitted source changes.
The website integration checkpoint remains a separate follow-up. See the
[TPI-STUDIOFLOW-058 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-058-RESULT.md).

## TPI-STUDIOFLOW-059 source checkpoint staging and final review

TPI-STUDIOFLOW-059 is **COMPLETE / STAGED / AWAITING OWNER COMMIT
AUTHORIZATION**. The pre-staging repository state matched TPI-058 exactly:
`main`, HEAD `8437b071c2bf1eda3d9df44dca53f95f08e6b032`, no prior staged files,
and diff fingerprint
`8d07fdfd01b7745631bb91d374d1e7acc6bc590ef2efabd485ac0241c1b8edbd`.

Exactly these two source files are staged:

- `src/App.tsx`
- `src/styles.css`

The cached diff is 311 additions and 61 deletions across two files, passes
`git diff --cached --check`, and contains only the reviewed StudioFlow guest
audio/admission, recording-default, compositor, background, backstage, guest
messaging, and responsive-style changes. No other files are staged. The
proposed commit message is `feat(studioflow): complete guest stage audio and
studio UI integration`. No commit or push has occurred. See the
[TPI-STUDIOFLOW-059 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-059-RESULT.md).

## TPI-STUDIOFLOW-060 authorized source checkpoint commit

TPI-STUDIOFLOW-060 is **COMPLETE / LOCAL COMMIT CREATED / NOT PUSHED**. The
owner-authorized source checkpoint was committed in
`/Users/toddknipple/Documents/StudioFlow/web` on `main`.

- Previous HEAD: `8437b071c2bf1eda3d9df44dca53f95f08e6b032`
- New HEAD: `a919a881705c4f21dc184a6f2af8a5096d68e5f4`
- Commit: `feat(studioflow): complete guest stage audio and studio UI integration`
- Files: `src/App.tsx`, `src/styles.css` only
- Statistics: 311 insertions, 61 deletions

The post-commit source worktree is clean. The authoritative TypeScript/Vite
build passes, TPI-057 compositor correction remains present, and the website
integration verifier reports two equivalent builds, matching generated assets,
and preserved TPI bridges. No push, deployment, production change, or owner
data modification occurred. See the
[TPI-STUDIOFLOW-060 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-060-RESULT.md).

## TPI-STUDIOFLOW-061 website integration checkpoint audit

TPI-STUDIOFLOW-061 is **COMPLETE / AUDIT COMPLETE / NO CHECKPOINT CREATED**. The
website repository is on `codex/tpi-development` at
`7385f0cf24155f121bdc967a0985553daa8a05df`, with 37 modified tracked paths,
269 pre-audit untracked paths, and no staged files before this documentation-only update.
The authoritative StudioFlow source is clean at approved commit
`a919a881705c4f21dc184a6f2af8a5096d68e5f4`.

The integrated entry point references `index-AccwBwcd.js` and
`index-TsnuK4Ub.css`; both match the authoritative source build byte-for-byte.
The verify-only staging pipeline passed two equivalent builds, 1,597 transformed
modules per build, 14 generated files, 22 integration candidates, no obsolete
bundle references, and preserved TPI bridges. Focused local checks run for this
audit passed 115/115, including production-lock schema checks, persistence,
backup, guest-audio, stability, and source-reconciliation checks.

The proposed checkpoint is not staged. The backend files
`functions/api/[[path]].js`, `worker.js`, and `lib/auth.js` are mixed with
local-runtime, authentication, or unrelated website changes and require
hunk-level review. Migration `0053_studioflow_creator_production_lock.sql`
is additive but has no down migration and was not applied. Local configuration,
credentials, browser storage, owner media, recordings, snapshots, and ignored
state remain excluded. See the
[TPI-STUDIOFLOW-061 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-061-RESULT.md).

## TPI-STUDIOFLOW-062 website repository change inventory and change-control audit

TPI-STUDIOFLOW-062 is **COMPLETE / INVESTIGATION COMPLETE / NO CODE OR GIT
CHANGES**. The read-only audit found 37 modified tracked paths, 270 untracked
paths, and no staged paths at inventory time on branch
`codex/tpi-development`, HEAD
`7385f0cf24155f121bdc967a0985553daa8a05df`. The repository contains
interleaved Administration, StudioFlow, shared website/backend, local
operations, research, and documentation streams; untracked files cannot be
assigned to a historical task with certainty from Git alone.

The complete exact path inventory is in
[TPI-WEBSITE-REPOSITORY-CHANGE-INVENTORY.md](TPI-WEBSITE-REPOSITORY-CHANGE-INVENTORY.md).
The shared files `functions/api/[[path]].js`, `worker.js`, and `lib/auth.js`
require hunk-level review before any checkpoint. Migration
`0053_studioflow_creator_production_lock.sql` remains an owner-review item and
was not applied. No application code, Git state, production resource, owner
data, or browser storage was changed. See the
[TPI-STUDIOFLOW-062 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-062-RESULT.md).

## TPI-063 master development system foundation

TPI-063 is **COMPLETE / DOCUMENTATION FOUNDATION CREATED / NO CODE OR GIT
CHANGES**. A read-only architecture audit confirmed the public website,
Community, Creator Systems, Administration, Research/Education, Applications,
Shared Infrastructure, and Operations divisions. The numbered master tree is
in `docs/TPI-MASTER-DEVELOPMENT/`, with a control index, system map, active
mission record, shared dependency map, release register, Rabbit Hole backlog,
division masters, and stable module records.

StudioFlow remains the primary development mission. Its source checkpoint is
`a919a881705c4f21dc184a6f2af8a5096d68e5f4`; website integration remains pending
shared backend hunk review, migration 0053 approval, and production gates. The
TPI-062 exact inventory is connected to the new uncommitted-work map; unknown
and local-only paths remain explicitly marked rather than guessed or deleted.

No application code, StudioFlow source, runtime assets, Git staging, commit,
production resource, database, browser storage, owner data, media, recording,
branch, or worktree was modified. See the
[TPI-063 result](300-COMPLETED-WORK/TPI-063-RESULT.md) and the
[master development control](../TPI-MASTER-DEVELOPMENT/00-MASTER-DEVELOPMENT-CONTROL/00-MASTER-DEVELOPMENT-CONTROL.md).

## TPI-064 StudioFlow backend separation and release manifest

TPI-064 is **COMPLETE / READ-ONLY AUDIT / CHECKPOINT NOT STAGED**. The current
website repository remains on `codex/tpi-development` at
`7385f0cf24155f121bdc967a0985553daa8a05df`, with no staged files. The audit
classified changed hunks in `functions/api/[[path]].js`, `worker.js`, and
`lib/auth.js` rather than treating those shared files as StudioFlow-owned.

StudioFlow workspace, snapshot, production-lock, broadcast-linkage, and room
livestream hunks are identified as required candidates. Local request guards,
public link-preview behavior, shared routing, authentication, and unrelated
website behavior remain shared or local-only. The `localFetch` dependency and
migration `0053_studioflow_creator_production_lock.sql` remain release-review
blockers; the migration was not applied.

The proposed manifest keeps the current StudioFlow entry point, verified
assets, bridges, backup runtime, staging/versioning scripts, and focused
verification records as candidates while deferring whole shared files and
sensitive/local material. See the
[TPI-064 result](300-COMPLETED-WORK/TPI-064-RESULT.md), the updated
[Creator Studio record](../TPI-MASTER-DEVELOPMENT/03-TPI-CREATOR-SYSTEMS/01-TPI-CREATOR-STUDIO.md),
and the updated
[shared dependency map](../TPI-MASTER-DEVELOPMENT/00-MASTER-DEVELOPMENT-CONTROL/04-SHARED-DEPENDENCIES.md).

## TPI-065 StudioFlow production-safe backend extraction

TPI-065 is **PARTIAL / CONTROLLED LOCAL EXTRACTION / NO STAGE OR COMMIT**.
The API runtime dependency on the local-only request-guard path was separated
into `lib/outbound-fetch.js`; the original local guard remains as a re-export
for local tooling and its protections remain active. No changes were made to
`worker.js` or `lib/auth.js`.

The remaining StudioFlow backend changes are still mixed into
`functions/api/[[path]].js` and require a reviewed hunk-level checkpoint.
Migration `0053_studioflow_creator_production_lock.sql` remains additive,
unapplied, and production-gated. Offline/source checks passed, but the local
startup verification reported 8/10 because the LaunchAgent was running while
the loopback Worker HTTP probes returned no response. No production resource,
owner workspace, database, browser storage, staging area, commit, or push was
modified. See [TPI-065 result](300-COMPLETED-WORK/TPI-065-RESULT.md).

## TPI-066 isolated StudioFlow release candidate

TPI-066 is **PARTIAL / CANDIDATE PREPARED / NOT COMMITTED OR DEPLOYED**. The
isolated candidate is at
`/Users/toddknipple/Documents/GitHub/tpi-studioflow-release-candidate` on
`codex/studioflow-release-candidate`, based on website HEAD
`7385f0cf24155f121bdc967a0985553daa8a05df`. The original dirty worktree
remains preserved and unstaged.

The candidate includes the approved StudioFlow assets and bridge layer,
workspace/snapshot/production-lock backend hunks, the shared outbound-fetch
dependency, required verification/staging scripts, and unapplied migration
0053. The authoritative source build is reproducible with matching
`index-AccwBwcd.js` and `index-TsnuK4Ub.css`; focused candidate checks pass
285/285. A temporary local-only compatibility-date configuration allowed the
candidate Worker to start on port 8897: `/` returned 200 and unauthenticated
`/studio/` returned 403.

The repository's normal `2026-07-18` compatibility date exceeds the installed
local workerd support ceiling of `2026-07-15`; the production repository
configuration was not changed. Authenticated candidate acceptance, production
migration approval, HTTPS/WebRTC/media verification, and deployment remain
blocked. See [TPI-066 result](300-COMPLETED-WORK/TPI-066-RESULT.md).

## TPI-067 StudioFlow release candidate acceptance

TPI-067 is **PARTIAL / AUTHENTICATED STUDIOFLOW VERIFIED WITH RELEASE
BLOCKERS / NOT COMMITTED OR DEPLOYED**. The isolated candidate at
`/Users/toddknipple/Documents/GitHub/tpi-studioflow-release-candidate` remains
on `codex/studioflow-release-candidate` at the clean website baseline
`7385f0cf24155f121bdc967a0985553daa8a05df` plus the uncommitted candidate
manifest. No files are staged and no commit, push, deployment, migration, or
production access occurred.

Candidate verification passed 285/285 focused StudioFlow checks, JavaScript
syntax checks, migration structure checks, auth-cookie boundary checks,
`git diff --check`, synthetic authenticated browser loading, workspace list and
save, R2 recovery snapshot creation/retrieval, production start/heartbeat/stop,
and unauthorized route/asset protection. Chrome loaded the protected
`/studio/` route and retained the synthetic session after refresh. Physical
camera/microphone permission was declined, so hardware/WebRTC behavior was not
claimed.

Remaining blockers are the installed local workerd ceiling of `2026-07-15`
against the repository's `2026-07-18` compatibility date, the candidate's
synthetic login redirect returning 404 at `/member-home`, missing disposable
RealtimeKit credentials for room creation/invite/guest/close testing, and
unverified server-side persistence of browser-local Studio media. Migration
0053 remains unapplied and unapproved. See the
[TPI-067 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-067-RESULT.md).

## TPI-068 StudioFlow release blocker resolution

TPI-068 is **PARTIAL / ROUTE AND LOCAL RUNTIME REPAIRED / NOT DEPLOYED**. In
the isolated candidate, the `/member-home` 404 was traced to the Worker’s
default raw asset lookup: the existing `member-home.html` file was present,
but `/member-home` was not passed through the existing clean-URL fallback.
The candidate now routes only `/member-home` and `/member-home/` through
`servePageAsset`; no member page or authentication semantics were replaced.

The installed Wrangler `4.110.0`/workerd supports through compatibility date
`2026-07-15`, while the production and development configs remain at
`2026-07-18`. A candidate-scoped `wrangler.local.toml` uses `2026-07-15` for
local validation; production configuration was not changed and no global
tooling was changed.

Synthetic Chrome acceptance passed login to `/member-home`, browser refresh,
authenticated `/studio/` loading, logout, and unauthenticated `/studio/`
blocking. The 21-file focused suite remains **285/285**, syntax and
`git diff --check` pass, and the local Worker was ready on isolated port
8898. StudioFlow workspace saves and recovery snapshots are server-backed,
but recordings and custom Studio media remain browser-local; workspace
snapshots retain configuration/references rather than media bytes. Room
creation still fails closed until disposable RealtimeKit configuration is
provided. See the [TPI-068 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-068-RESULT.md).

## TPI-069 StudioFlow media persistence and guest readiness

TPI-069 is **PARTIAL / DISPOSABLE MEDIA PATH VERIFIED / NOT DEPLOYED**. The
isolated candidate adds a narrow server-side custom-media contract for supported
image, video, and audio assets: authenticated workspace-scoped upload, D1
metadata, private R2 objects, authorized retrieval, stable asset references,
content-type and size validation, and cleanup on failed metadata writes. The
existing browser-local media bridge now uploads eligible local media during
workspace save and replaces configuration references only after the server
returns a stable asset identity. Existing browser-local recordings remain
unchanged and are not treated as custom Studio media.

Disposable local testing passed upload (201), listing, authenticated retrieval,
unauthenticated denial, cross-owner denial, configuration persistence, and the
bridge contract (5/5). The existing 21-file StudioFlow regression set remains
285/285, and an isolated authenticated browser loaded the synthetic workspace
and StudioFlow interface. A separate browser-profile portability run was not
available, and live guest-room acceptance remains blocked because no disposable
RealtimeKit configuration was provided. Migration `0054_studioflow_media_assets.sql`
is unapplied; no production D1/R2 or owner data was accessed. See the
[TPI-069 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-069-RESULT.md).

## TPI-070 StudioFlow final release readiness gate

TPI-070 is **PARTIAL / RELEASE BLOCKED / NOT DEPLOYED**. The isolated
candidate remains on `codex/studioflow-release-candidate` at baseline
`7385f0cf24155f121bdc967a0985553daa8a05df` with the previously prepared,
unstaged candidate changes. The candidate was not staged, committed, pushed,
migrated, or deployed.

The complete StudioFlow verification set passed: 22 focused suites, **290/290
checks** including the TPI-069 media bridge contract. JavaScript syntax checks
and `git diff --check` passed. Migration review confirms 0053 must follow the
existing workspace/room/broadcast prerequisites before production-lock routes,
and 0054 must follow workspace/contributor prerequisites before media routes;
both require production backup, approval, and post-migration validation.

The release gate remains open for two reasons. The available browser automation
surface exposes only one in-app browser and cannot provide two genuinely
separate disposable profiles, so full cross-profile image/video/audio playback
acceptance is not claimed. No disposable RealtimeKit variables are configured,
so room creation, invitation, guest authentication, admission, removal, and
closure were not attempted or claimed. No production or owner data was
accessed. See the [TPI-070 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-070-RESULT.md).

## TPI-071 existing live guest integration verification

TPI-071 is **PARTIAL / EXISTING GUEST PATH CONFIRMED / PRODUCTION ACCEPTANCE
BLOCKED**. The authoritative StudioFlow source is clean at approved commit
`a919a881705c4f21dc184a6f2af8a5096d68e5f4` and contains the existing guest
experience: invite-code resolution, waiting-room presence, WebRTC peer
connections, camera/microphone tracks, host admission/removal signals, program
audio return, and guest status transitions. The candidate bundle contains the
same guest signaling and media path; no guest feature was added or treated as
missing.

The local development gateway is the existing
`/Users/toddknipple/Documents/StudioFlow/web/server/room-server.mjs` on
`127.0.0.1:8788`. Its synthetic health, guest presence, status, signal, and
removal contracts passed. The integrated candidate Worker also contains the
production `/api/rooms`, `/api/room-codes`, and `/api/studio/rooms` routes.

Two release boundaries remain. The candidate has no disposable RealtimeKit
configuration, so RealtimeKit-backed room creation and participant-token
acceptance were not attempted. Also, the production candidate's `/api/rooms`
and `/api/room-codes` wrappers use `requireAdmin`, while the guest UI resolves
production relay URLs as same-origin account-free guest links. This is an
unresolved authentication/integration boundary requiring review; it must not be
silently bypassed. The candidate does not contain the standalone local gateway,
which is appropriate for the integrated website but means localhost browser
acceptance requires the existing 8788 service.

Focused guest/audio checks passed 14/14, production-lock checks 16/16,
stability checks 10/10, source integration checks 12/12, media contract 5/5,
and syntax/diff checks passed. No production or owner data was accessed. See
the [TPI-071 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-071-RESULT.md).

## TPI-072 production update preparation and release manifest

TPI-072 is **PARTIAL / RELEASE UPDATE PREPARED FOR OWNER REVIEW / NOT
DEPLOYED**. The isolated candidate remains on
`codex/studioflow-release-candidate` at baseline
`7385f0cf24155f121bdc967a0985553daa8a05df`; the original website worktree and
authoritative StudioFlow source were preserved. No files were staged, committed,
pushed, migrated, or deployed.

The candidate JavaScript and CSS match the authoritative StudioFlow `dist`
artifacts byte-for-byte by SHA-256. The entry point references the current
assets and preserves the workspace, production-lock, backup, video, media-state,
and navigation bridges. Targeted candidate verification passed 71/71 checks:
TPI-012 14/14, production-lock 16/16, guest audio 14/14, flicker stability
10/10, source integration 12/12, and media 5/5. Syntax checks and
`git diff --check` also passed.

The release remains blocked. The production revision in the documentation is a
historical baseline and was not revalidated. Shared backend/authentication files
remain mixed and require hunk-level extraction; `/api/rooms` and
`/api/room-codes` still require explicit review because their candidate wrappers
use `requireAdmin` while the guest UI describes account-free invite links.
Migrations 0053 and 0054 are unapplied, disposable RealtimeKit configuration is
unavailable, two-profile media portability is not verified, and production
HTTPS/WebRTC, media, rollback, and live smoke acceptance remain open.

See the [TPI-072 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-072-RESULT.md).

## TPI-073 final release candidate isolation (checkpointed by TPI-074)

TPI-073 is **COMPLETE / RELEASE DIFF ISOLATED / UNSTAGED / NOT DEPLOYED**.
The isolated candidate remains at baseline
`7385f0cf24155f121bdc967a0985553daa8a05df`; the authoritative StudioFlow
source remains clean at approved commit
`a919a881705c4f21dc184a6f2af8a5096d68e5f4`. The original website worktree
was preserved. No files are staged, and no commit, push, production migration,
or deployment occurred.

The candidate's local login/logout cookie changes were removed; its auth module
matches baseline. Local no-store behavior was scoped to StudioFlow routes.
Existing guest-code and room-relay declarations/handlers compare byte-for-byte
with baseline, preserving the established Live Bridge access behavior. The
proposed checkpoint lists only StudioFlow runtime assets, bridges, selected
backend hunks, two migrations, build staging, and focused regression scripts;
candidate-only local configuration and watcher files are excluded.

The authoritative source staging command completed two equivalent builds
(1,597 modules each; 14 generated assets; 22 integrated files), and retained all
eight maintained bridge files. The complete StudioFlow suite passed 23/23
suites; the new API/Worker acceptance harness passed 21/21 using only
in-memory SQLite and synthetic R2. Existing website navigation smoke passed
13/13. Migrations 0053 and 0054 preserved synthetic records in the required
order and remain unapplied to production.

TPI-073's manifest was subsequently staged and committed exactly under
TPI-074. Production migration authorization and production
HTTPS/media/session validation remain separate release operations. See the
[TPI-073 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-073-RESULT.md) and
[TPI-074 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-074-RESULT.md).

## TPI-074 controlled StudioFlow Git checkpoint

TPI-074 is **COMPLETE / LOCAL COMMIT CREATED / NOT PUSHED / NOT DEPLOYED**.
The isolated candidate remains on `codex/studioflow-release-candidate`. Commit
`ebcd0122e8099418fa99ed07c32d0f9d8c1d31a0` has parent
`7385f0cf24155f121bdc967a0985553daa8a05df` and contains exactly the 37 paths
in the approved TPI-073 manifest. No other path was committed. Candidate-local
development configuration and cache-watcher files remain unstaged and
untouched; the original website worktree and StudioFlow source were preserved.

All 21 maintained verification scripts passed, including the 21-check
TPI-073 API/Worker isolation suite. The source staging verifier completed two
reproducible builds, matched the candidate JS/CSS assets, and preserved the
maintained bridge layer. Website navigation smoke passed 13/13. The staged
diff passed security-path/pattern review and `git diff --cached --check`.
Migrations 0053/0054 were tested only against disposable SQLite and were not
applied to production. No push, production access, migration, or deployment
occurred. Production readiness remains unestablished.

See the [TPI-074 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-074-RESULT.md).

## TPI-075 production release readiness

TPI-075 is **PARTIAL / NO-GO / NOT DEPLOYED**. The local release checkpoint
`ebcd0122e8099418fa99ed07c32d0f9d8c1d31a0` is verified at 37 files and its
approved StudioFlow assets reproduce from source. Offline verification passed:
21/21 maintained StudioFlow scripts, 13/13 website navigation checks, two
reproducible source builds, syntax checks, and staged/working-tree whitespace
checks. No remote or production service was contacted.

Repository documentation names `main` as the production promotion branch and
describes Wrangler deployment; the only checked-in GitHub workflow is QA. The
Cloudflare dashboard Git-integration setting and current deployed Worker
version remain unconfirmed. The local cached `origin/main` is at
`f09e4e63a325235c9378ce69c0a91855ae166daf`, an ancestor 71 commits behind the
candidate baseline, so blind cherry-pick/integration is not approved. Historical
production D1 migration records show a schema/ledger discrepancy. Migration
0053 adds columns without idempotent guards; 0054 is additive but requires its
workspace/contributor prerequisites and existing R2 binding. Both remain
unapplied to production. Production backup, migration, HTTPS/media/guest
acceptance, release integration, and deployment are **NO-GO** pending evidence
and separate authorization.

See the [TPI-075 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-075-RESULT.md).

## TPI-076 final release execution

TPI-076 is **BLOCKED / NO INTEGRATED COMMIT / NOT PUSHED / NOT DEPLOYED**.
Read-only Cloudflare inspection identified Worker version
`05c5d075-8d28-4f72-a4c8-a8edba01bb10` (deployment source SHA unavailable),
confirmed the configured production R2 bucket exists, and found production
D1 ledger/schema divergence. The workspace schema exists physically, but
0053's production-lock columns/table and 0054's media table do not.

The approved 37-path checkpoint conflicts when applied to refreshed
`origin/main`, the documented promotion branch. Required workspace API
handlers and `studio/workspace-bridge.js` are missing from that baseline. The
new isolated integration worktree is clean at `origin/main`; the original
dirty development worktree and candidate-local files were preserved. Synthetic
0053→0054 SQLite verification passed, but integrated suites were not run
because the release tree is incomplete.

No production backup, migration, push, or deployment occurred. Release remains
NO-GO pending owner review of a dependency-only manifest addendum and a safe
production D1 ledger reconciliation plan. See the
[TPI-076 result](300-COMPLETED-WORK/TPI-STUDIOFLOW-076-RESULT.md).

## TPI-STUDIOFLOW-079 production correction

TPI-STUDIOFLOW-079 is **PARTIAL / DEPLOYED WITH LIVE SMOKE PASS / OWNER SESSION ACCEPTANCE PENDING**. The clean StudioFlow release was redeployed as Worker version `cf85d853-9a6c-438e-aef9-fe031d6f068a` after restoring the established `serveAssets` fallback and public-root member redirect behavior. The deployment reused the existing `TPI_DB`, `TPI_MEDIA`, and `ASSETS` bindings; no production migration or data write was performed. Anonymous live checks passed for the public root (200), protected StudioFlow route (403), unauthenticated StudioFlow API (401), and protected StudioFlow assets (403). The TPI-073 isolated API/Worker contract passed 21/21. Authenticated owner-session verification after this final correction remains pending because the available isolated browser had no production session.

## Current live integration follow-on

The owner-authorized follow-on integration is **DEPLOYED / AUTHENTICATED ACCEPTANCE PENDING**.
Worker version `b3b9549e-8b21-4ccd-9f0b-8c16b1103117` now carries the current protected
Administration Center implementation together with the preserved StudioFlow release,
private StudioFlow media routes, workspace persistence, and existing Live Bridge paths.
The only production schema write was additive migration 0050, applied after a targeted
read-only check; 0053 and 0054 were not replayed because their physical structures were
already present. The public root remained 200, anonymous StudioFlow/Admin access remained
403, and protected APIs remained fail-closed at 401/403. Focused Admin source suites and
the isolated Worker smoke passed. Authenticated live screen acceptance still requires
the owner to sign in in the browser; no owner data was used or modified.

The subsequent public/member navigation batch is also deployed as Worker
`7c5562e8-e8cd-4b25-8d02-5aca4d0a92ed`. It includes the committed shared shell,
login routing, public landing navigation, ParaNews, ParaTube, and canonical
Admin navigation files. Live read-only checks returned 200 for `/`, `/news`,
`/paratube`, `/member-home`, and `/member-login`; protected Admin and StudioFlow
routes remained 403. Authenticated browser acceptance is still pending.

The subsequent production-safe runtime hardening batch is deployed as Worker
`f0477367-ea62-4e30-a7b7-22558b18a99b` from isolated commit `e7daf78`. It includes
root-relative shared fragments, hidden-tab polling pauses/request deduplication,
and local-only external-fetch guards. OPS traffic protection passed 11/11,
video regression passed 22/22, and bounded live anonymous smoke passed for the
public/member routes and protected StudioFlow/Admin boundaries. Authenticated
owner-session acceptance remains pending because the current browser session is
signed out.

## StudioFlow chronological catch-up verification — 2026-10-19

The archived StudioFlow directive search reaches TPI-STUDIOFLOW-079; no later
StudioFlow directive is present in the repository. The authoritative source is
`/Users/toddknipple/Documents/StudioFlow/web` at `main` commit `2e877a7`.
The production build passes (`tsc` plus Vite, 1,597 modules), and the generated
JS/CSS hashes match the website integration and the isolated release used by the
active Worker `f0477367-ea62-4e30-a7b7-22558b18a99b`.

The complete local StudioFlow verification inventory is 30 passing suites. The
only non-passing item is TPI-STUDIOFLOW-052, which reports `BLOCKED` because
Chrome cannot launch in this execution environment; it does not indicate a
StudioFlow assertion failure. Anonymous live checks remain correct and fail
closed (`/studio/` protected, workspace API `401`).

Read-only production schema inspection confirms the required StudioFlow tables,
columns, and indexes exist, including the 0053 production-session and 0054 media
structures. The production `d1_migrations` ledger still records only 0001 and
0002. This ledger/schema discrepancy is documented and has not been rewritten;
doing so requires explicit production migration-ledger authorization.

The current remaining release gate is an authenticated, non-destructive live
StudioFlow acceptance pass using an owner-signed browser session. No Crossroads
workspace, owner media, recordings, backups, or browser storage were modified.

## Authenticated live follow-up — 2026-10-19

The owner signed in successfully as `Todd_Wayne`. The live `/api/auth/me`
response confirms `creatorStudioAccess: true`, so the Creator Studio entitlement
and authentication boundary are working. The authenticated
`/api/studio/workspaces` response is `{"workspaces":[]}`. A bounded read-only
production D1 count confirms zero `studio_workspaces`, zero `live_broadcasts`,
and zero `studio_media_assets` rows. The missing live My Studios list is
therefore an empty production data state, not a missing route or entitlement.

The live StudioFlow shell, Library, Destinations, Teleprompter, and live-stream
creation UI load without a reload loop. No production workspace, broadcast,
media asset, recording, database row, R2 object, or browser storage was created
or changed during this check. Rebuilding or importing a production studio still
requires an explicit owner-supplied configuration and a separate authorization;
the protected Crossroads workspace was not touched.

## Member left-navigation production repair — 2026-10-19

The signed-in member screenshot exposed a separate integration defect: the live
`member-shell.js` requested `/member-sidebar.txt`, but that generated include
was absent from the deployed asset package, so the left sidebar rendered empty.
The existing source of truth remains `member-sidebar.html`; the production
staging convention generates the text copy for Cloudflare asset serving.

The current live Worker was redeployed as `44825c4d-e3f6-4619-8e47-7c35510f7c68`
with the current runtime/public package unchanged and only the generated
`member-sidebar.txt` asset added. Live checks returned 200 for `/`,
`/member-home`, and `/member-sidebar.txt`; protected `/studio/` remained 403
to anonymous requests and `/api/studio/workspaces` remained 401. The owner’s
authenticated browser visibly showed the restored left navigation, including
TPI Creator Studio. No D1/R2 data, owner workspace, recording, media, or
browser storage was modified.

## StudioFlow Brand 1 / My Studios lifecycle repair — 2026-10-19

Live authenticated browser verification showed the Crossroads editor retaining
the legacy `Brand 1` heading because the My Studios bridge stopped polling after
ten seconds, before the editor's asset panel mounted from StudioFlow Home. The
repair keeps a document mutation observer active for the editor lifecycle, so
the bridge attaches when the panel appears and reattaches after a remount.

The repair was deployed to the existing Worker as version
`a3b6d8a2-0afb-4d61-915e-eb18a3039177`. Wrangler reported one new or modified
static asset: `studio/workspace-bridge.js`; the existing D1, R2, and ASSETS
bindings were retained. Authenticated browser verification then showed
`Crossroads of the Unknown`, `My Studios`, the selected Crossroads control, and
the loaded Crossroads scenes, logo, intro/outro, motion background, and sound
assets. No save, delete, import, migration, D1 write, R2 write, recording
operation, or browser-storage reset was performed.

The production workspace API still reports no server-backed workspace records;
the visible Crossroads state is therefore not evidence of a new server save.
Preserving and migrating that owner configuration requires a separate explicit
data-save decision and was intentionally not performed in this UI repair.

## StudioFlow My Studios selector/menu visibility repair — 2026-10-19

The owner reported that the My Studios dropdown and its management menu were not
visible enough in the live editor. The existing bridge already contained both
controls, but the selector menu was implicit and, with no server-saved workspace
rows in production, exposed only the create action. The production bridge now
labels the selector as an explicit menu, shows the currently loaded browser
studio as a non-mutating status row, reports when no server-saved Studios exist,
and exposes `Open Studio Menu` inside the selector dropdown. The separate
management control is now visibly labeled `Menu` as well.

Worker version `641ed13e-7f4c-4a1d-88a3-9edd7ca1e4f7` deployed exactly one
modified static asset, `studio/workspace-bridge.js`; production D1, R2, and
ASSETS bindings were retained. Source syntax, `git diff --check`, Wrangler
dry-run, and authenticated browser loading of the StudioFlow editor passed.
Opening the selector was attempted in the browser, but the browser automation
session timed out while collecting the post-click tree; no production action,
save, import, delete, migration, or owner-data mutation was performed.

The production D1 read-only audit confirms that the StudioFlow workspace, media,
broadcast, and production-session tables and required columns already exist;
the migration ledger still records only 0001/0002. Current counts are zero for
`studio_workspaces`, `live_broadcasts`, and `studio_media_assets`. No migration
was required or executed. Worker version `46cbffe1-58e8-475d-b218-65ff800112e1`
adds a confirmation-backed `Save Current Studio to My Studios` action for a
browser-local studio, without automatically writing the protected Crossroads
configuration.

The media bridge now recognizes all ordinary workspace-creation requests,
including browser-local broadcast IDs that do not use the generated `studio-`
prefix. Backup restores remain excluded because their media package is already
handled explicitly. Worker `48e863ce-9b41-4793-ab10-776563523ebd` deployed the
modified `studio/workspace-asset-state-bridge.js` only.

## StudioFlow explicit My Studios dropdown — 2026-10-19

The live selector now visibly reads `My Studios: [current studio] ▾` and its
dropdown includes the `Studio Menu` action. The selector uses an explicit menu
contract (`aria-haspopup="menu"`, `aria-expanded`, and `aria-controls`) and the
menu layer is kept visible above the asset-panel layout. Source checks passed:
TPI-055 14/14, TPI-050 10/10, and TPI-069 5/5. Worker version
`d1018c32-88c5-4c20-a70d-03c7848a85ad` deployed only the updated
`studio/workspace-bridge.js`, retaining the existing D1/R2/ASSETS bindings.
The authenticated editor reloaded after deployment; post-click browser-tree
capture remains limited by the editor automation timeout. Production workspace
rows remain zero until the owner explicitly saves a browser-local Studio.

The StudioFlow entry point also received a cache-buster rotation for both
bridge scripts so signed-in browsers fetch the corrected selector. Worker
`63cd692e-b892-456c-b7c5-866deb165dec` uploaded only `studio/index.html`; no
database, R2, migration, or protected-workspace mutation occurred.

The subsequent selector-stability deployment is Worker
`fa84d720-2e0a-49e7-9986-611b3109741f`. It corrected the rendered-label
reconciliation loop, added immediate fallback labels, and bounded the panel
lifecycle watcher. TPI-048 (20/20), TPI-049 (12/12), TPI-050 (10/10), TPI-055
(17/17), and TPI-069 (5/5) passed. Live authenticated editor loading and the
Crossroads production surface passed; menu-open capture remains limited by the
browser automation timeout, and production workspace rows remain zero until an
explicit owner-controlled save.

The latest UI correction is deployed as Worker
`ef9e889d-05f6-4054-9885-70f9f449c77c`: My Studios is now one full-width
`My Studios: [current studio] ▾` dropdown, and its contents include `Studio
Menu` for the management actions. The adjacent standalone Menu button was
removed to make the dropdown unambiguous. TPI-055 source reconciliation remains
17/17, syntax and targeted diff checks pass, and no D1/R2/migration/protected
workspace mutation occurred. Live post-click browser capture remains limited
by the editor frame-tree timeout.

## StudioFlow live repair update — 2026-10-19

The latest local-to-production repair deployed Worker
`1a64e4bf-c783-425e-9bf3-d751ca7b79eb` with the cache-busted, lifecycle-safe
`My Studios` bridge. Local authenticated browser verification confirmed the
single dropdown, nested `Studio Menu`, and existing project-management actions.
The live StudioFlow home loaded, but the live editor's post-entry DOM capture
timed out in browser automation, so authenticated live-editor acceptance remains
NOT CONFIRMED. Production D1/R2 bindings were retained and no production
migration or owner-data write occurred. See
`docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/TPI-STUDIOFLOW-079-RESULT.md`.

## StudioFlow DOM insertion repair — 2026-10-20

The selector visibility defect was traced to the workspace bridge inserting
the My Studios panel relative to a nested Brand row as though it were a direct
child of the React asset-panel host. The bridge now resolves the host's direct
child before insertion. Focused local verification passed: TPI-STUDIOFLOW-012
14/14, 014 10/10, 017 14/14, 019 7/7, 020 11/11, TPI-DEV-037 12/12,
TPI-STUDIOFLOW-050 10/10, 055 17/17, and 069 5/5. Worker
`93e5acef-6dc2-4d2d-aeed-edb72dda1c3c` deployed `studio/index.html` and
`studio/workspace-bridge.js` only, with the `single-dropdown-v5` cache-buster.
The live authenticated shell referenced the new bridge. Live post-entry DOM
capture remains pending because the browser's WebRTC/media editor frame tree
times out; no production migration or owner-data write occurred.

## StudioFlow live asset correspondence recheck — 2026-10-20

A fresh authenticated live StudioFlow session reported the current bridge set
and bundle references from the live document: `workspace-asset-state-bridge.js`
(`media-sync-v2`), `production-lock-bridge.js`, `workspace-bridge.js`
(`single-dropdown-v5`), `brand-heading-bridge.js`,
`video-playback-reset-bridge.js`, `backup-bridge.js`,
`assets/index-Cvy0xcXe.js`, `navigation-bridge.js`, and
`assets/index-TsnuK4Ub.css`. These match the current local `studio/index.html`
and establish that the live shell is not pointing at the stale historical
`index-j2x9m9vI.js`/`index-DXjilBOR.css` references.

Read-only Wrangler deployment inspection also confirmed that Worker version
`93e5acef-6dc2-4d2d-aeed-edb72dda1c3c` is currently serving 100% of production;
no deployment or configuration write occurred during the inspection.

The live home displayed the protected Crossroads entry. Initial post-entry DOM
capture timed out during the editor's WebRTC/media frame initialization, but a
reconnect to the same editor tab subsequently confirmed the live selector/menu
and a 60-second stable observation. No production mutation was attempted. The
focused local contracts were rerun and passed: 012 14/14, 014 10/10, 017
14/14, 019 7/7, 020 11/11, DEV-037 12/12, 050 10/10, 055 17/17, and 069 5/5;
bridge syntax also passed.

## Fresh live editor acceptance — 2026-10-20

A fresh authenticated browser session then entered the live editor successfully.
The repaired `#tpi-my-studios-panel` was visible, the selector displayed
`My Studios: Crossroads of the Unknown ▾`, the dropdown opened, and the nested
Studio Menu exposed all 11 management actions. Scenes, Intro/Outro, background
and motion-background controls, media assets, recording, and production
controls were visible. A 60-second observation kept the panel mounted and the
selector stable without navigation or disappearance.

The live panel currently reports `No server-saved Studios yet` for the
browser-local Crossroads configuration. Crossroads remains protected, so no
save, create, delete, D1, or R2 mutation was performed. Server-backed
create/switch/autosave and media acceptance remain pending a disposable
production test identity/workspace or a separately approved owner-data action.

The historical offline verification recheck found one stale TPI-023 assertion,
not an application regression. Its maintained script still expected the old
`active-title-v3` and title-only `Select Studio` contract; it now asserts the
current `single-dropdown-v5` and explicit `My Studios: [current studio] ▾`
contract and passes 14/14. TPI-024, 025, 027, 030, 031, 032, 033, 041, 041A,
043, 045, 048, and 049 also passed their current offline contracts.

The current isolated development Worker also passed the authenticated synthetic
acceptance suites: TPI-DEV-025 Creator Studio 39/39, TPI-DEV-037 My Studios QA
32/32, and TPI-DEV-037 final acceptance 37/37. These covered workspace
creation/restoration, saves and version conflicts, import isolation, ownership
boundaries, numbering, rename, duplicate, archive/recovery, concurrent saves,
production deletion guards, and entitlement denial. Synthetic development rows
were archived by the harness; no production or RealtimeKit resource was used.

## StudioFlow master handoff — 2026-10-20

The consolidated handoff is maintained at
`docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-MASTER-HANDOFF.md`. It is the working
index for the archived directives, source and generated files, backend routes,
migrations, PDFs, verification commands, deployment history, protected-data
rules, completed work, and remaining acceptance gates. It does not replace the
numbered historical directive reports.

## Production D1 schema reconciliation read — 2026-10-20

A bounded read-only Wrangler query against `tpi_contributor_portal` confirmed
that the physical StudioFlow schema is present: workspaces, studio numbering,
production sessions, media assets, room tables, the workspace/broadcast
columns, and the required indexes all exist. The `d1_migrations` ledger still
contains only `0001_contributor_portal.sql` and `0002_contributor_profiles.sql`.
The physical schema is therefore ahead of the ledger. No migration was replayed,
no ledger row was inserted, no production D1/R2 write occurred, and no owner
workspace was changed. A ledger/schema reconciliation plan is required before
any future migration operation.

A follow-up read-only production count found zero rows in the StudioFlow
workspace, media, room, production-session, and live-broadcast tables. The
unauthenticated live API routes `/api/studio/workspaces`, `/api/studio/rooms`,
and workspace media each returned HTTP 401, confirming that the routes are
deployed and fail closed. No disposable production fixture currently exists
for authenticated mutation acceptance.

## TPI-STUDIOFLOW-081 — controlled production acceptance — 2026-10-20

The owner-authorized acceptance batch created two disposable production
fixtures without touching Crossroads: `TPI Acceptance Test A` and `TPI
Acceptance Test B`. Both are active, owner-isolated D1 rows at version 1; A was
created through the authenticated StudioFlow UI, while B was inserted through a
controlled additive fixture fallback after browser editor automation became
unstable. The refreshed authenticated workspace API returns both fixtures and a
read-only D1 check confirms zero Crossroads workspace rows.

The final non-destructive asset repair remains deployed as Worker
`4fc9bcda-4b17-4c3a-a1f4-cc6d213a07de`. The browser-local Crossroads export
fallback is deployed, but the browser automation surface did not independently
confirm the downloaded file path, so that backup is not marked externally
verified. Production save/autosave/switch/refresh isolation, synthetic media,
and guest acceptance remain unverified because the full editor tab became
unstable during media/frame initialization. Status remains **PARTIAL**, not
production acceptance complete.

See `300-COMPLETED-WORK/TPI-STUDIOFLOW-081-RESULT.md`.
## TPI-STUDIOFLOW-082 — production acceptance and browser test recovery — 2026-10-20

TPI-STUDIOFLOW-082 remains **PARTIAL / ACCEPTANCE BLOCKED**. The owner
reported that My Studios does not open in the live editor. Fresh live Home
navigation was stable, but editor DOM/AX and screenshot capture became
unavailable after editor entry. The same automation input did not activate
ordinary local editor controls, so this run did not establish an application
defect and did not deploy a speculative dropdown patch. The authoritative
bridge still contains the selector click listener and hidden-menu CSS.

No production code, D1/R2 data, Crossroads, acceptance fixtures, browser
storage, or Live Bridge resources were changed. A reliable manual or alternate
browser interaction is the next gate; after that, continue the required A/B
save/switch/refresh, media, backup-file, and guest acceptance tests.

See `300-COMPLETED-WORK/TPI-STUDIOFLOW-082-RESULT.md`.

## TPI-STUDIOFLOW-083 — scene-list production repair — 2026-10-20

The live StudioFlow left Scenes panel was missing the completed Intro, Demo
scene 1, Demo scene 2, and Outro entries because post-initialization workspace
hydration wrote an incomplete `studioScenes` list. The fix normalizes hydrated
scene writes in both `studio/workspace-asset-state-bridge.js` and
`studio/workspace-bridge.js`; `studio/index.html` references the cache-busted
`scene-normalization-v2` bridge assets. The final bounded deployment is Worker
`bcf91bac-c524-4f3e-aea1-a1e561f02413`, with `dd147e9d-1e6b-4e04-ad96-6df59cf70180`
retained as the rollback target. Opera authenticated live-editor verification
on disposable TPI Acceptance Test B showed Intro video, Default Scene, Demo
scene 1, Demo scene 2, and Outro video. No D1/R2 writes, migrations, owner
workspace changes, Crossroads changes, or Live Bridge changes occurred.

This closes the targeted scene-list defect only. Authenticated save/switch/
refresh persistence, media acceptance, backup-file verification, and guest
acceptance remain separate release gates.

See `300-COMPLETED-WORK/TPI-STUDIOFLOW-083-RESULT.md`.

## TPI-STUDIOFLOW-084 — Firefox login layout repair — 2026-10-20

Firefox Developer Edition exposed a live Member Login layout defect: the Sign
In button rendered directly against the password field. The production-safe
repair added explicit submit-button spacing in `style.css` and changed the
`member-login.html` stylesheet reference to `style.css?v=91`. Only those two
static assets were deployed as Worker
`8d240a53-7dc3-464d-8a86-e0ddcff191bd`. Firefox live visual verification shows
the separated, full-width Sign In control. Authentication logic, D1, R2,
StudioFlow data, Crossroads, and Live Bridge resources were not modified.

See `300-COMPLETED-WORK/TPI-STUDIOFLOW-084-RESULT.md`.

## TPI-MASTER-001E — Firefox production acceptance — 2026-10-20

The current live repair is deployed as Worker
`b8d85644-afd2-487e-b46b-2e698fa12deb`, from isolated source commit
`4c0b3973aa17c74d367de55761de340b405d89cb`. Firefox Developer Edition
verified the My Studios selector, direct Acceptance Test A/B switching,
save-before-switch behavior, independent server-backed settings, and refresh
restoration. A and B remained isolated: A retained `showLogo:false` and its
blue-waves/media references while B retained `showLogo:true`, default-black,
and no A custom media.

This closes the confirmed selector/direct-switch/refresh defect, but does not
close the entire production acceptance gate. A new synthetic R2 upload and
ownership test was not performed; existing A media references are browser-local
or reference-only (`serverAssetId:null`). The read-only backup search found
TPI-033 synthetic backup artifacts but no artifact conclusively identified as
the Crossroads backup. No disposable RealtimeKit gateway/credentials were
available, so live guest acceptance remains blocked. No production migration,
D1/R2 write, owner-workspace mutation, public broadcast, or Live Bridge change
occurred.

Status: **BLOCKED — OWNER ACTION REQUIRED**. See
`300-COMPLETED-WORK/TPI-MASTER-001E-RESULT.md`.

## TPI-STUDIOFLOW-084 media acceptance — 2026-10-20

Firefox Developer Edition completed a bounded production media run using only
TPI Acceptance Test A and B. Authenticated audio upload/retrieval and video
upload/playback passed; Acceptance Test B remained isolated with an empty media
listing. A valid `preview_frame.png` overlay remained visible in the browser UI
but did not appear in A's authenticated server media metadata after refresh,
save, and re-upload. The malformed 24-byte control image did create a metadata
row, so the result is recorded as an image-specific synchronization defect,
not a generic declaration that the media endpoint is broken.

No valid media-inclusive Crossroads backup artifact was found. Existing records
identify only synthetic backup artifacts and explicitly state that a complete
Crossroads media backup does not exist. No owner workspace, browser storage,
D1/R2 data, Live Bridge resource, or production code was modified, and no new
deployment was performed. TPI-STUDIOFLOW-084 media status is **PARTIAL — AUDIO/
VIDEO VERIFIED; IMAGE PERSISTENCE AND CROSSROADS BACKUP UNVERIFIED**.

See `300-COMPLETED-WORK/TPI-STUDIOFLOW-084-MEDIA-RESULT.md`.

## TPI-STUDIOFLOW-084A — image persistence repair — 2026-10-20

The stale server-reference defect was repaired in
`studio/workspace-asset-state-bridge.js` and deployed as Worker
`100ff967-a7f8-4b83-9aa9-1aeb3b3212fd`. Live Firefox verification confirms
synthetic PNG metadata creation, authenticated `200 image/png` retrieval after
save, refresh/reopen visibility, and A/B media isolation. Audio and video
retrieval remain passing. This is not a full owner asset-reload approval:
server-backed scene assignment was not verified and no real Crossroads backup
artifact was found. Crossroads and owner data were untouched.

See `300-COMPLETED-WORK/TPI-STUDIOFLOW-084A-RESULT.md`.

## TPI-STUDIOFLOW-084B — scene persistence repair — 2026-10-20

The server-backed scene image assignment defect is repaired and deployed as
Worker `17f9a096-0eb6-4c75-a889-71fb9a9d418d`. The existing asset-state bridge
now reconstructs the selected custom-background descriptor from the existing
browser blob when metadata is missing, allowing the established upload and
workspace-save path to persist the private R2/D1 media reference. Live Firefox
verification read back A's `customBackground` with asset ID, private media URL,
PNG content type, filename, and a stable five-scene configuration. A/B media
and scene state remain isolated; image, audio, video, refresh, and scene
hydration regressions remain passing.

The Crossroads backup gate remains blocked. The designated authenticated
Firefox profile contains only the disposable acceptance studios and recording
storage; it exposes no Crossroads title or protected workspace/broadcast ID.
The only inspected backup package is synthetic TPI-033 data, not Crossroads.
No owner data was accessed or modified. Status is **PARTIAL / BLOCKED — OWNER
DATA ACCESS REQUIRED**, and owner asset reload is not approved until Crossroads
is opened in the designated profile and a real backup artifact is independently
parsed and validated.

See `300-COMPLETED-WORK/TPI-STUDIOFLOW-084B-RESULT.md`.

## TPI-STUDIOFLOW-085 — editor performance and freeze repair — 2026-10-20

Firefox Profiler identified the confirmed freeze source: the former
`workspace-bridge.js` root-subtree mutation observer consumed 5,459 samples
(99%) in a 5.5-second live-editor profile. The final repair removes that
persistent observer, uses a frame-coalesced bootstrap observer that disconnects
after attachment, bounds later lifecycle checks, makes Brand heading
reconciliation idempotent, and stops paused-video canvas animation.

The final isolated deployment is Worker
`f3422853-8a81-4aa1-8412-27a14af234bd`. Firefox live verification confirmed
the My Studios dropdown, direct A/B switching, save-before-switch status,
scenes, synthetic-media listing, responsive panel interaction, and rendering
of a separately generated valid synthetic MP4 in Acceptance Test A. The
retained 1 KB synthetic MP4 is malformed and Firefox reported
`NS_ERROR_DOM_MEDIA_METADATA_ERR`; it was excluded from playback evidence.
The separately generated valid MP4 survived a full reload and reopening
Acceptance Test A, and remained listed after its scene assignment was changed
to Default black. The live disposable-asset delete confirmation was verified
and canceled. Crossroads and owner data were untouched.

Status: **VERIFIED COMPLETE — PRODUCTION VERIFIED**. See
`300-COMPLETED-WORK/TPI-STUDIOFLOW-085-RESULT.md`.

## TPI-MASTER-002 — historical archive and My Studios recovery — 2026-10-20

The unified historical archive was copied from the Desktop original into
`docs/TPI-MASTER-DEVELOPMENT/HISTORICAL-SOURCES/`, verified with SHA-256
`066f50d06c34362149e4e32b640dc6c27d5a6d9eb8bd2eda9a8187d64cb49d8c`, tested
with `unzip -t`, and extracted without overwriting an existing source file.
The searchable inventory is documented in
`HISTORICAL-SOURCES/HISTORICAL-SOURCE-INDEX.md`.

The recovered My Studios authority is documented in
`FEATURE-HISTORY/MY-STUDIOS-HISTORICAL-SPECIFICATION.md`. The key chain is
TPI-STUDIOFLOW-012 A–C (Brand 1 replacement, independent workspaces, create
flow, production lock), TPI-STUDIOFLOW-014 (SPA bridge lifecycle),
TPI-STUDIOFLOW-017/017A (save-before-switch/direct open/isolation),
TPI-STUDIOFLOW-023 (active-name restoration), TPI-STUDIOFLOW-024–033
(backup/identity protection), and TPI-DEV-037 (numbering/autosave/branding).

Read-only Firefox Developer Edition observation found an unresolved production
identity discrepancy: the editor title was `Crossroads of the Unknown`, while
the server-backed My Studios menu contained only TPI Acceptance Test A and B.
No Crossroads click, save, reset, import, media, scene, database, R2, commit,
push, or deployment operation was performed. Status:
**PARTIAL / OWNER-DATA IDENTITY BLOCKER**. A verified protected Crossroads
workspace identity and genuine backup artifact are required before any mapping
repair can be safely implemented.

See `300-COMPLETED-WORK/TPI-MASTER-002-RESULT.md`.
