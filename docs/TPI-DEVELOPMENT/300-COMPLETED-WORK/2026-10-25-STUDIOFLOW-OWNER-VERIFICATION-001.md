# TPI-STUDIOFLOW-OWNER-VERIFICATION-001 — Post-Deployment Studio Management Verification & Owner Workflow Recovery

Directive: [`TPI-STUDIOFLOW-OWNER-VERIFICATION-001-POST-DEPLOYMENT-STUDIO-MANAGEMENT.md`](../100-DIRECTIVES/TPI-STUDIOFLOW-OWNER-VERIFICATION-001-POST-DEPLOYMENT-STUDIO-MANAGEMENT.md)
Date: 2026-10-25
Status: `AGENT VERIFIED — OWNER ACCEPTANCE PENDING`

This record answers the directive's required completion report (§14 A–J).
Automated success does not constitute owner acceptance; only the owner can
grant final acceptance.

---

## A. Production version

Verified against the live deployment records and authenticated production
fetches (isolated QA account), 2026-10-25 after 19:09 EDT:

- Deployed Worker (latest deployment, created 22:16Z): `9d3aa40c-9a44-4bf9-bcf1-8efcbf837683` — matches the reported release.
- Rollback checkpoint (previous deployment, 18:06Z): `7bddac9c-bda3-41c1-95d2-13aacc09cb28` — still present as the prior version.
- No subsequent deployment has replaced or reverted the repair
  (`wrangler deployments list` shows `9d3aa40c` as the active 100% version).
- Active production assets are byte-identical to the website integration:
  - `/studio/assets/index-Drm85nEM.js` — 890,963 B, sha256 `35ded7937218e237…` — MATCH
  - `/studio/assets/index-8wAEEeJ8.css` — 104,951 B, sha256 `c788bff8dfc8abd0…` — MATCH
  - All five maintained bridge/override files (`workspace-bridge.js`,
    `workspace-asset-state-bridge.js`, `production-lock-bridge.js`,
    `audio-soundboard-bridge.js`, `studioflow-012-overrides.css`) — MATCH.
- The live `/studio/` HTML differs from `studio/index.html` only by the
  intentional Worker theme-bootstrap injection (`data-tpi-theme-bootstrap`
  style/script block), the same explained platform difference as the October 25
  parity investigation. All application content lines match.
- Repair presence confirmed in the deployed bundle: `studioflow.tpiActiveStudioId.v1`,
  `studioflow:configuration-changed`, failed-save messaging ("could not be
  saved"), and in the deployed bridge: missing-snapshot recovery
  (`openLocalSnapshot`/`persistLocalSnapshot` with the visible notice "No saved
  configuration was found for this Studio. It opened with the default Studio
  configuration.").
- Canonical source `44f9478` ("keep Studio configuration isolated per Studio")
  remains the head of the StudioFlow source repository with a clean tree;
  website application commit `161d03d`, documentation commit `3779f1a`.

Conclusion: the production application contains the Studio Management
recovery; the deployment discrepancy check in §5 passed.

## B. Studio creation

Both creation workflows were exercised against **authenticated production**
with the isolated QA account (`qa-17927…`) in Firefox Developer Edition, in the
maintained lifecycle suite (`npm run verify:studioflow-studio-lifecycle` with
`TPI_REPRO_BASE_URL=https://paranormalinitiative.com`):

- **My Studios creation** (Tests 1–2): each new Studio gets a unique workspace
  ID and exactly four default production items (Intro Video, Scene 1, Scene 2,
  Outro Video); no previous Studio configuration or media assignments are
  inherited; a second Studio is fully independent; the displayed name matches
  the active Studio ID.
- **Home-screen creation** (owner workflow H1, "Record without going live" →
  "Continue to setup"): opens with the clean default configuration — exactly
  four items, zero inherited music slots, zero inherited clip slots.

Both paths produce the same clean result. The correct configuration survives a
browser refresh (Test 6). Result: **PASS — both creation workflows produce
independent Studios.**

## C. Studio switching

Verified on authenticated production (Tests 3, 4, 5, 6, 7, 8a–c, 9, H2a–b):

- Studio A → Studio B → Studio A activates the selected Studio's persisted ID
  (`studioflow.tpiActiveStudioId.v1`) and renders that Studio's own scenes,
  media assignments, and name at every transition (Tests 3a, 3b, 3c).
- Scene isolation and media isolation: Studio A edits/assignments never appear
  in Studio B (Tests 4, 5).
- Refresh restores the selected Studio and its configuration (Test 6).
- Unsaved changes are saved before switching and restore on return (Test 7).
- A switch blocked by a failed save keeps the current Studio active, explains
  the failure ("The current Studio could not be saved. It remains active;
  retry the save before switching."), and never overwrites the target Studio's
  configuration (Tests 8a–c).
- Rapid switching settles on the last selection with its own workspace (Test 9).
- A browser-local Studio without a historical snapshot activates and opens with
  the default configuration plus a visible notice instead of silently reverting
  to the previous Studio (H2a, H2b).

Result: **PASS — switching activates the correct Studio and configuration;
no silent reverts observed.**

## D. Owner Studio investigation (Testing 123, Browser Only Crossroads)

Read-only inspection only (SELECT statements against production D1 via the
project's authenticated Wrangler access; no writes, no mutations). Full record:
[`evidence/2026-10-25-owner-verification-001/owner-studio-readonly-inspection.md`](evidence/2026-10-25-owner-verification-001/owner-studio-readonly-inspection.md).

Established:

- **Testing 123** exists as server workspace `a75afc38-c7a6-452d-9460-5d746712d411`
  (owner `5d9e7ec6…`), created 2026-10-25T16:37:36Z — **before** the repair
  deployed (22:16Z). Its saved `scenePanelItems` contains exactly the eight
  rows the owner reported (Intro Video, Background Music — After Intro,
  Countdown Timer, Demo scene 2, Background Music, Two-person split, Background
  Music, Outro Video), with Crossroads-era media assignments (`COTU INTRO.mp4`,
  "The Valley of RA…", "Nefertari's Dream…", custom image background).
  Testing 123 therefore contains historically persisted configuration produced
  by the pre-repair creation-inheritance defect.
- **Browser Only Crossroads** has no server workspace record. It is a
  browser-local Studio whose broadcast entry and snapshot live in the owner's
  own browser storage. The agent has no access to the owner's browser profile
  and did not attempt to obtain any; whether that Studio's local snapshot is
  present or invalid cannot be determined from the server side (explicit
  limitation). The failure mode the owner experienced (missing snapshot causing
  a silent revert) is the defect repaired in `44f9478` and now covered by H2a/H2b
  live verification.
- **Crossroads of the Unknown** is not present as a server workspace row under
  the owner account; nothing read, wrote, or altered it.

## E. Historical data / remediation status

**No existing Studio data was modified.** The current repair initializes new
Studios correctly but, by design and per owner-data protection, does not
rewrite previously saved configuration. Testing 123 will continue to display
its historically inherited eight-item configuration until separately
remediated.

**Proposed remediation — awaiting explicit owner authorization** (per §9):

1. Affected Studio ID: `a75afc38-c7a6-452d-9460-5d746712d411` ("Testing 123").
2. Current saved state: eight Crossroads-like panel rows with Crossroads-era
   media assignments (see D).
3. Proposed changes (owner chooses one):
   - (a) Reset Testing 123's `scenePanelItems`/`studioScenes` to the four clean
     defaults (Intro Video, Scene 1, Scene 2, Outro Video), leaving media
     library assets untouched; or
   - (b) Archive/delete Testing 123 entirely (it is a disposable test Studio);
     or
   - (c) Leave it unchanged.
4. Backup/rollback: export the full `state_json` of `a75afc38-…` to a dated
   backup file before any write; rollback restores that exact JSON.
5. Expected outcome (option a): Testing 123 opens with the four default items
   and no inherited configuration.
6. Risks: overwriting a deliberately saved state if the owner has since edited
   Testing 123 intentionally; mitigated by the pre-change export and by
   requiring the owner's explicit choice first.

## F. Local versus production (four items vs eight items)

Verified explanation — this is **workspace data**, not an application or
deployment mismatch:

- **Application code parity: MATCH.** Production assets are byte-identical to
  the website integration (see A), which is a build of canonical source
  `44f9478`. The same implementation runs locally and in production.
- **Workspace data parity: NOT EXPECTED.** Local and production environments
  hold different saved Studio records. The owner's local Studio showed the four
  default items because it was created (locally) after the repair with clean
  initialization. The production "Testing 123" record displays eight items
  because it was **created at 16:37Z under the pre-repair build** and its saved
  `state_json` persisted the inherited Crossroads-like configuration (D).
- **Persistence scope:** Testing 123 is a server-backed Studio (D1
  `studio_workspaces`). Browser-only Studios persist in creator-local storage.
  The eight-item display comes from Testing 123's own saved state — the
  displayed name matches the active Studio ID.
- Live production verification (B, C) confirms that Studios created **now** on
  production get four clean items — matching the owner's local observation.

Different Studio data is therefore not labeled a deployment mismatch; the
evidence supports saved-data inheritance from the pre-repair defect.

## G. Tests

All executed 2026-10-25; result JSON preserved under
[`evidence/2026-10-25-owner-verification-001/`](evidence/2026-10-25-owner-verification-001/).

| Suite | Environment | Result |
|---|---|---|
| `verify:studioflow-studio-lifecycle` (Directive Tests 1–10 + owner flows H1–H2) | Authenticated production, isolated QA account | **PASS 25/25** |
| `verify:studioflow-studio-lifecycle` | Local (`127.0.0.1:8787`) | **PASS 25/25** |
| `verify:release-safety` | Local | **PASS** (now includes the lifecycle-suite contract check) |

Known failures — documented, **not** marked resolved (§11):

- `tpi-studioflow-048-project-persistence` — fails (2 checks) on stale
  static expectations (autosave debounce literal); pre-existing baseline.
- `tpi-studioflow-049-portable-backups` — fails (2 checks) on the same stale
  autosave literal; pre-existing baseline.
- `tpi-dev-024-offline` — fails "bridge only appears for server-derived Studio
  access" (expects `creatorStudioAccess === true`); pre-existing baseline.
- `tpi-dev-037-offline` — fails "configuration is allow-listed" (forbids
  `customLogo`); pre-existing baseline.
- `tpi-studioflow-022-media-organization` — fails 2 timer-bridge literal
  checks; pre-existing baseline.
- `verify:studioflow-030-browser` rapid-upload step — timing-sensitive; one
  flaky failure observed in four runs historically; passes on re-run. Not
  silently marked resolved.

These five static-contract suites assert older source literals and were left
untouched rather than rewritten to pass; reconciling them with the maintained
code remains an open item.

## H. Changes in this directive

Application code: **none** (no new application defect was found; no repair was
needed beyond the already-deployed recovery).

Verification tooling (§11 gap closure):

- [`scripts/tpi-release.mjs`](../../scripts/tpi-release.mjs) — `release:preflight`
  now runs `verify:studioflow-studio-lifecycle` (local, `test_admin`) so Studio
  creation/switching/isolation/persistence regressions block a release.
- [`scripts/verify/tpi-release-safety.mjs`](../../scripts/verify/tpi-release-safety.mjs)
  — contract check that the lifecycle suite remains in preflight.

Documentation:

- [`docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-STUDIOFLOW-OWNER-VERIFICATION-001-POST-DEPLOYMENT-STUDIO-MANAGEMENT.md`](../100-DIRECTIVES/TPI-STUDIOFLOW-OWNER-VERIFICATION-001-POST-DEPLOYMENT-STUDIO-MANAGEMENT.md) — directive archived verbatim.
- `DIRECTIVE-INDEX.md` — archive entry added.
- This completion record and its evidence directory.
- Current-state Markdown synchronization (status, handoff, testing doc).

## I. Deployment

**No new deployment was necessary** — no application code changed. The
verified deployment remains:

- Source commit: `44f9478` (StudioFlow canonical repository, local-only)
- Website application commit: `161d03d` (pushed)
- Documentation commits: `3779f1a` (prior) plus this documentation commit
- Deployed Worker: `9d3aa40c-9a44-4bf9-bcf1-8efcbf837683`
- Rollback checkpoint: `7bddac9c-bda3-41c1-95d2-13aacc09cb28`
- Production URL: <https://paranormalinitiative.com/studio/>

## J. Owner acceptance

**AGENT VERIFIED — OWNER ACCEPTANCE PENDING**

The full owner workflow (§15) has been demonstrated against authenticated
production with the isolated QA account: independent Studio creation with four
default items, immediate activation, switching to and from other Studios with
correct scenes and media, unsaved-change safety, failed-save protection,
missing-snapshot recovery, refresh persistence, and no modification of
Crossroads or other owner Studios. The owner's specific Studios (Testing 123,
Browser Only Crossroads) hold pre-repair saved data and owner-browser-local
data respectively; Testing 123 requires the separately authorized remediation
in E (or acceptance of its historical contents).

Final acceptance rests with the owner's verification in their own production
account.
