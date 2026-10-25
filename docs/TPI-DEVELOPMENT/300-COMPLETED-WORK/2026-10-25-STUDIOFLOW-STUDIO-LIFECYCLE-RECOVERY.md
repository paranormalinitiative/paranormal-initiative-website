# StudioFlow Studio Creation, Switching & Workspace Isolation Recovery — Completion Record

Date: October 25, 2026
Directive: TPI-STUDIOFLOW — CRITICAL STUDIO CREATION, SWITCHING & WORKSPACE ISOLATION RECOVERY
Status: IMPLEMENTED · LOCAL TESTED · DEPLOYED · LIVE VERIFIED · OWNER ACCEPTANCE PENDING
Archived directive: `docs/TPI-DEVELOPMENT/100-DIRECTIVES/STUDIOFLOW-CRITICAL-STUDIO-CREATION-SWITCHING-WORKSPACE-ISOLATION-RECOVERY.md`

## WHO

FreeBuff (development agent), working under `AGENTS.md` and the
`TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md` guarded release procedure.

## WHAT

Root-cause repair of the owner-observed Studio Management failures:

- **Failure A — new Studio creation inherited the active Studio's
  configuration.** The owner's "Testing 123" displayed the Crossroads-like
  eight-item Scenes panel after creation.
- **Failure B — Studio switching silently failed.** Selecting "Browser Only
  Crossroads" left "Testing 123" displayed with no clear explanation.
- **Failure C — workspace identity could display the wrong Studio's
  information** because switching paths rendered the outgoing Studio's state
  under the incoming Studio's identity.

## WHERE

| Layer | File | Change |
| --- | --- | --- |
| Canonical source | `/Users/toddknipple/Documents/StudioFlow/web/src/App.tsx` | Clean per-Studio reset on broadcast creation; complete per-Studio configuration re-hydration on workspace hydration; outgoing-Studio preservation on Home/Library entry; active-broadcast change notification |
| Bridge | `studio/workspace-bridge.js` | Per-broadcast configuration sync, missing-snapshot recovery, local recovery copies on save failure, sticky error/recovery notices, actionable switch-failure messages |
| Integration | `studio/index.html`, `studio/assets/index-Drm85nEM.js` | Staged authoritative build |
| Tests | `scripts/verify/tpi-studioflow-studio-lifecycle.mjs` | Maintained regression suite (Directive Tests 1–10 + owner-flow checks H1–H2) |
| Diagnostics | `scripts/verify/tpi-studioflow-studio-lifecycle-repro.mjs`, `scripts/verify/tpi-studioflow-creation-repro.mjs` | Runtime reproduction tooling used to establish root cause |
| Tooling | `package.json` | `verify:studioflow-studio-lifecycle` script |

## WHEN

- Investigation and runtime reproduction: October 25, 2026 (local worker,
  disposable Studios).
- Implementation and local verification: October 25, 2026.
- Source commit `44f9478` (StudioFlow canonical repository — local-only
  repository, no remote configured).
- Application commit `161d03d` (website integration, pushed to GitHub).
- Production deployment: October 25, 2026, Worker version
  `9d3aa40c-9a44-4bf9-bcf1-8efcbf837683`.
- Live production verification: October 25, 2026 (isolated QA account).

## WHY

The owner demonstrated on the live website that Studio creation and switching
still did not establish independent production workspaces, despite earlier
recovery reports. Automated suites passing while the owner-observable flows
failed showed the missing coverage: browser-driven creation-inheritance and
browser-local switching were never exercised.

## HOW

### Root causes

**A — Creation inheritance.** Home-screen broadcast creation
(`createLiveBroadcast`, `RecordingModal`) created a new identity but never
reset the per-Studio configuration in React state or the `studioflow.*`
configuration keys. The new Studio therefore displayed the previous Studio's
scene panel and media, and "Save Current Studio to My Studios" persisted that
inherited configuration as the new Studio record. (The My Studios "Create New
Studio" dialog path was already clean; the home-screen path was not.)

**B — Silent switch failure.** `openLocalWorkspace` required a pre-existing
per-broadcast snapshot; browser-local Studios created before snapshots (or
never successfully saved) caused the switch to throw and silently revert to
the previous Studio. Additionally, when the pre-switch save failed (for
example a Studio title/identity integrity conflict created by the
contaminated state from root cause A), `openWorkspace`/`openLocalWorkspace`
declined to switch with only a transient status line that the autosave loop
then overwrote with "UNSAVED CHANGES"/"SAVING..."/"SAVE FAILED".

**C — Workspace identity.** Home/Library entry (`onEnter`) switched only the
active broadcast ID. The outgoing Studio's configuration stayed on screen
under the incoming Studio's identity, and the autosave loop could then persist
the outgoing configuration into the incoming Studio's local snapshot. Only
scene slices were re-hydrated on workspace switches; backgrounds, overlays,
styling, sounds, music, and timer settings kept rendering the previously
active Studio's values.

### Repairs

1. **Clean initialization (App.tsx).** `resetStudioConfigurationForNewBroadcast`
   resets every per-Studio configuration key to the approved defaults
   (Intro Video, Scene 1, Scene 2, Outro Video — exactly four production
   items), preserves the outgoing Studio first, and registers the clean state
   as the new broadcast's browser-local snapshot through the bridge-owned
   `initializeLocalStudio` (derived media slot bookkeeping is reset
   bridge-side, preserving the TPI-STUDIOFLOW-027 architecture boundary).
2. **Complete per-Studio hydration (App.tsx).** A workspace-hydration listener
   re-applies every per-Studio slice (scenes, scene panel, active scene,
   backgrounds, logo, overlays, styling, widgets, sounds, background music,
   volumes, video clips, timer theme/duration) whenever a Studio hydration
   writes browser storage, keeping live preview object URLs and re-reading
   storage at commit time so bridge-owned sound/media writes are never
   clobbered. App-level settings (program output, general, guest permissions)
   refresh in the activation bridge.
3. **Switching integrity (workspace-bridge.js).** `preserveCurrentStudio`
   persists the outgoing Studio before Home/Library switches;
   `syncActiveBroadcastChange` loads the incoming Studio's own snapshot (or
   the default configuration with a visible notice when none exists) and
   reconciles the Studio selector; `openLocalWorkspace` recovers missing
   snapshots instead of silently reverting; failed saves keep a browser-local
   recovery copy before reporting.
4. **Truthful, durable messaging (workspace-bridge.js).** Save failures report
   their reason ("SAVE FAILED — …"), switch refusals state that the switch was
   not performed and the current Studio remains active, and error/recovery
   notices are sticky against autosave status noise.

### Original → final location of consolidated settings

No Settings sections were moved by this directive (that was TPI-035's scope).
This directive changed *when* per-Studio configuration is reset and re-loaded,
not where controls live.

### Functional repairs

| Behavior | Before | After |
| --- | --- | --- |
| Home-screen creation | Inherited active Studio's configuration | Clean four-item default Studio |
| Browser-local switch without snapshot | Silent revert to previous Studio | Opens with default configuration + visible notice |
| Switch with failed save | Silent no-op, transient message | Blocked with durable explanation + local recovery copy; never overwrites the target |
| Switch hydration | Scenes only | All per-Studio slices |
| Home/Library entry | Rendered previous Studio's state under new identity | Preserves outgoing, loads incoming configuration |

### Storage destinations

Unchanged by this directive (TPI-035 owns destination management). Local
browser storage snapshots (`studioflow.tpiLocalStudioSnapshots.v1`) remain the
per-broadcast configuration store for browser-local Studios; server-backed
Studios keep D1 `studio_workspaces` as authoritative.

### Save success/failure determination

Unchanged mechanisms, with truthful reporting: browser-local saves report
"PROJECT SAVED LOCALLY" only after `verifyLocalPersistence` + snapshot
verification; server saves report "PROJECT SAVED" only after the PATCH
response resolves; failures now carry the actual reason and keep a local
recovery copy.

## TESTS

Maintained suite `npm run verify:studioflow-studio-lifecycle` (Directive Tests
1–10 plus owner-flow checks), run both locally and against production:

| Test | Result (local) | Result (production) |
| --- | --- | --- |
| 1 Create New Studio (unique ID, four clean default items) | PASS | PASS |
| 2 Create Second Studio (independent identity/configuration) | PASS | PASS |
| 3 Switch A→B→A (persisted ID + displayed workspace each step) | PASS | PASS |
| 4 Scene isolation | PASS | PASS |
| 5 Media isolation | PASS | PASS |
| 6 Refresh restoration | PASS | PASS |
| 7 Unsaved changes (safe save + restoration) | PASS | PASS |
| 8 Failed save (no silent switch, no overwrite) | PASS | PASS |
| 9 Rapid switching (stale responses cannot win) | PASS | PASS |
| 10 Existing Studio compatibility (no resets) | PASS | PASS |
| H1 Home-created Studio opens clean | PASS | PASS |
| H2 Browser-local Studio without snapshot (defaults + notice) | PASS | PASS |

Existing regression suites (all run against the staged build):

- `verify:studioflow-integrated-recovery` — PASS (21/21)
- `verify:studioflow-033-roundtrip` — PASS (26 checks)
- `verify:studioflow-034-mutation` — PASS
- `verify:studioflow-027` — PASS (12/12)
- `verify:studioflow-028-browser` — PASS (33 checks)
- `verify:studioflow-030-browser` — PASS (25 checks; one observed flaky
  failure in four runs of the rapid Studio B upload sequence — timing-
  sensitive test step, passes on re-run, not a product regression)
- `verify:studioflow-031-music-pads` — PASS (34 checks)
- `verify:studioflow-036-video-timers` — PASS (28 checks)
- `verify:studioflow-037-scenes-panel` — PASS (20 checks)
- `verify:studioflow-035-recording-storage` — PASS (33 checks)
- `verify:release-safety` — PASSED
- `verify:local-auth-lifecycle` — PASS

Static-contract suites with **pre-existing baseline failures** (verified
identical at `git HEAD` before this change; expected literals are absent from
the committed bridge/source, so these are contract drift, not regressions):

- `tpi-studioflow-048-project-persistence`, `tpi-studioflow-049-portable-backups`
  — expect `window.setTimeout(function () { setMessage("SAVING...")` which the
  maintained debounce shape no longer contains (1 check each).
- `tpi-dev-024-offline` — expects `creatorStudioAccess === true` in the bridge
  (1 check).
- `tpi-dev-037-offline` — forbids `customLogo` in the bridge although
  `CONFIG_KEYS` has referenced it since the workspace schema landed (1 check).
- `tpi-studioflow-022-media-organization` — two timer-bridge literal checks
  against `studio/video-clip-management-bridge.js` (untouched by this work).

## PRODUCTION VERIFICATION

- Production: https://paranormalinitiative.com/studio/
- Deployed Worker version: `9d3aa40c-9a44-4bf9-bcf1-8efcbf837683`
- Rollback checkpoint: `7bddac9c-bda3-41c1-95d2-13aacc09cb28`
- Source commit: `161d03d` (website integration, GitHub
  `paranormal-initiative/paranormal-initiative-website`, branch
  `codex/tpi-development`); canonical StudioFlow source commit `44f9478`
  (local repository, no remote configured).
- Staged asset: `studio/assets/index-Drm85nEM.js` (+ `index-8wAEEeJ8.css`).
- Release tooling: `release:preflight` READY →
  `TPI_PRODUCTION_DEPLOY=approved release:production` →
  `DEPLOYED_AND_VERIFIED` with 64/64 live acceptance checks.
- Live QA run of the maintained lifecycle suite (isolated QA account,
  disposable Studios, all archived afterwards): all Tests 1–10 and H1–H2
  PASS. Evidence:
  `docs/TPI-DEVELOPMENT/300-COMPLETED-WORK/evidence/2026-10-25-studio-lifecycle-production/`.

## DATA SAFETY

- Crossroads of the Unknown was never loaded, modified, or used as a test
  fixture. All verification Studios were disposable synthetic records created
  under the isolated QA account and archived after each run.
- No production D1/R2 data was modified beyond those disposable QA workspace
  records. No owner recordings, media, or storage destinations were touched.
- Failed saves now keep an extra browser-local recovery copy; no data is
  discarded by the repair.

## DOCUMENTATION

- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/STUDIOFLOW-CRITICAL-STUDIO-CREATION-SWITCHING-WORKSPACE-ISOLATION-RECOVERY.md` (archived directive)
- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/DIRECTIVE-INDEX.md`
- This completion record
- `docs/TPI-DEVELOPMENT/TPI-CURRENT-DEVELOPMENT-STATUS.md`
- `docs/TPI-DEVELOPMENT/TPI-DEVELOPMENT-AGENT-HANDOFF.md`
- `docs/TPI-DEVELOPMENT/009-TESTING-AND-VERIFICATION.md`

## REMAINING LIMITATIONS

1. Owner acceptance is still required; only the owner can confirm the live
   interface behaves correctly in their workflow.
2. The five pre-existing static-contract suite failures listed under TESTS
   are contract drift from earlier eras; they fail identically without this
   change and were left untouched rather than rewritten to pass.
3. `verify:studioflow-030-browser`'s rapid Studio B upload step is
   timing-sensitive (observed one flaky failure in four runs); it passes on
   re-run and the product behavior is covered deterministically by the
   maintained lifecycle suite.
4. Cloud storage destinations remain TPI-035 scope with documented
   limitations; nothing about destinations changed here.
5. The StudioFlow canonical repository has no configured remote; the source
   commit exists locally and its verified build is what the website
   integration commit carries to GitHub.
