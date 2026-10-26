# TPI-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001 — Completion Record

Date: 2026-10-25/26
Directive: [`100-DIRECTIVES/TPI-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001.md`](../100-DIRECTIVES/TPI-STUDIOFLOW-EMERGENCY-LIVE-REPAIR-001.md)
Status: `DEPLOYED AND AGENT-VERIFIED — OWNER ACCEPTANCE PENDING`

Automated and agent-run verification passing does not constitute owner
acceptance. Only the owner can grant final acceptance.

Evidence directory:
[`evidence/2026-10-25-emergency-live-repair-001/`](evidence/2026-10-25-emergency-live-repair-001/)

---

## A. Production problems corrected

Four application defects were found and repaired in the maintained
`studio/workspace-bridge.js` (the TPI integration bridge, not the generated
StudioFlow bundle):

1. **Malformed browser-local snapshot records were silently overwritten.**
   When a browser-local Studio's snapshot record in
   `studioflow.tpiLocalStudioSnapshots.v1` was unreadable or had a mismatched
   broadcast identity, reopening the Studio replaced the record without
   preserving it. Recoverable owner data could be destroyed by the recovery
   path itself. Repair: `preserveUnusableSnapshotRecord()` copies any unusable
   record into `studioflow.tpiLocalStudioSnapshots.recovery.v1` (first copy
   wins, never overwritten) before anything can replace it — including a fully
   corrupt snapshot store (preserved raw under the `__store__` key).

2. **The studio menu could hide an existing browser-local Studio.** Menu
   contents were only rebuilt on API refresh or a bridge action, so a Studio
   present in browser storage could be absent from the My Studios menu until
   an unrelated re-render. Repair: the selector re-renders the menu contents
   whenever it opens.

3. **Selecting a Studio that was no longer available did nothing and said
   nothing.** A stale menu button whose Studio was gone fell through to a
   silent no-op. Repair: both `open` and `open-local` now explain the failure
   ("That Studio is no longer available in My Studios…", "That browser-local
   Studio is no longer available in this browser…") and refresh the list.

4. **A title conflict silently disarmed the save integrity gate.** The
   selector label reconciler set `selectedWorkspace = null` on any title
   mismatch between the local broadcast entry and the workspace record. A
   save that should have been blocked with "Studio titles conflict. Resolve
   the Studio name before saving." instead fell through to the browser-local
   save path, and the switch proceeded silently — exactly the "silent
   switching failure / discard unsaved owner data" the directive forbids.
   Repair: the reconciler only unbinds when the broadcast **identity** is
   unmatched; an identity-matched workspace stays bound so the integrity
   coupling blocks the save with its actionable error.

The bridge cache-buster advanced to `tpi-recovery=preserve-v1` so browsers
fetch the repaired bridge.

## B. Testing 123 remediation status

Owner approved the exact guarded reset of `Testing 123`
(`a75afc38-c7a6-452d-9460-5d746712d411`) and a DB + live UI verification.

- Executed: one guarded UPDATE on that single row (`AND version = 1`,
  matched exactly 1 row), replacing the inherited Crossroads scene/media
  assignments with the application's own clean defaults. Studio identity,
  title "Testing 123", style/timer/sound settings and all account data were
  preserved; the shared media library was untouched.
- Pre-change backup: `backups/testing123-pre-remediation-2026-10-25.json`
  (full 13.6 KB state, sha256 `2da865f3…`), rollback script
  `backups/testing123-rollback.sql`.
- Post-deploy read-only verification (2026-10-26): row `version 17`,
  `scenePanelItems` and `studioScenes` are exactly
  `[Intro Video, Scene 1, Scene 2, Outro Video]`, background music slots 0,
  video clip slots 0, custom sounds 0, custom background null, scene-music
  assignments 0. (Version advanced from 2 to 17 through normal application
  saves; content unchanged and clean.)
- Live UI render check: the exact stored state was seeded into a disposable QA
  workspace and rendered through the authenticated production interface —
  exactly the four clean default rows render, with zero media assignments
  (`tpi-studioflow-testing123-render-check.mjs`, 6/6 PASS including cleanup;
  screenshot `testing123-clean-state-render.png`).

## C. Browser Only Crossroads recovery status

"Browser Only Crossroads" is browser-local: it has no server workspace record,
so no server-side state exists to inspect or repair. Its data lives only in
the owner's browser profile.

- The application repair covers its failure modes: missing snapshots open
  with the four-item default plus a visible explanation (no silent revert),
  and malformed snapshot records are preserved under the recovery key before
  any replacement (verified live on production, lifecycle checks H2–H4).
- The owner's actual browser state cannot be inspected remotely. A safe,
  read-only diagnostic procedure for the owner is in section J. It exposes no
  credentials and destroys nothing.

## D. Studio creation verification

Verified on authenticated production with the isolated QA account (and again
locally):

- Home-screen recording creation (the owner's exact flow) opens with exactly
  the clean four-item configuration (H1).
- My Studios creation produces a unique identity and exactly four default
  items (Tests 1–2), independent across two Studios.

## E. Studio switching verification

Verified on authenticated production and locally:

- A→B→A switching activates the selected Studio with its own persisted ID,
  scenes and media at every step (Tests 3–5), after refresh (Test 6), with
  unsaved changes saved before the switch (Test 7), and under rapid switching
  with stale responses unable to win (Test 9).
- A failed save blocks the switch: the current Studio stays active, the
  failure is explained, and the target Studio's configuration is never
  overwritten (Tests 8a–8c — this is the check that exposed defect A.4).
- Missing browser-local snapshot recovery (H2) and malformed/corrupt snapshot
  preservation (H3/H4) pass live, with the preserved records observed in the
  recovery key.
- Existing Studio configurations are never reset (Test 10).

## F. Files and data modified

Application (deployed):

- `studio/workspace-bridge.js` — defects A.1–A.4.
- `studio/index.html` — workspace-bridge cache-buster `tpi-recovery=preserve-v1`.
- `scripts/stage-studioflow-authoritative.mjs` — bridge tag + staging
  assertion updated with the new cache-buster.

Tests and verification:

- `scripts/verify/tpi-studioflow-studio-lifecycle.mjs` — new H3/H4
  preservation checks; `switchTo` waits for hydration settlement; all menu
  interactions are stale-safe.
- `scripts/verify/tpi-studioflow-025-reconciliation.mjs` — new contract: a
  title-only conflict must keep the workspace bound so saving stays
  integrity-gated.
- `scripts/verify/tpi-studioflow-malformed-snapshot-repro.mjs` — targeted
  diagnostic repro used to isolate defects A.2/A.3.
- `scripts/verify/tpi-studioflow-testing123-render-check.mjs` — approved
  Testing 123 live render check with self-cleanup.

Data (owner-approved, one row only): `Testing 123`
(`a75afc38-c7a6-452d-9460-5d746712d411`) reset to the clean default
configuration per section B. No other owner data was modified. Crossroads of
the Unknown and every other Studio were untouched.

## G. Regression results

- `npm run verify:local-auth-lifecycle` — PASS (64/64, local_admin preserved
  across managed Worker restart).
- `npm run verify:studioflow-studio-lifecycle` — **29/29 PASS locally**
  (`local-lifecycle-suite.json`) and **29/29 PASS on authenticated
  production** `https://paranormalinitiative.com`
  (`production-lifecycle-suite.json`, `production-lifecycle-final.png`).
- Static contracts: `tpi-studioflow-025-reconciliation` 12/12,
  `tpi-studioflow-023-active-studio` 16/16, `tpi-studioflow-local-save`
  12/12.
- `tpi-studioflow-testing123-render-check` — 6/6 PASS on production.
- The release's own production verification — 64/64 PASS.

Known pre-existing failures remain open and unchanged (not silently marked
resolved): the five static-contract suites (048/049/dev-024/dev-037/022) and
the timing-sensitive 031 rapid-upload step.

## H. Deployment

- Source commit: `af7fbc0` (`fix(studioflow): preserve browser-local recovery
  data and keep switching integrity-gated`), pushed to
  `codex/tpi-development`.
- Production Worker (new): `6bbdae3d-f424-4373-87ff-84030df50a49`
  (`theparanormalinitiative`), deployed through
  `TPI_PRODUCTION_DEPLOY=approved npm run release:production`.
- Live verified on `https://paranormalinitiative.com/studio/` with the
  isolated QA account after deployment.

## I. Rollback and backup information

- Rollback Worker checkpoint: `9d3aa40c-9a44-4bf9-bcf1-8efcbf837683` (the
  previous production version). `scripts/tpi-release.mjs` records it in
  `.local-dev/release-preflight.json`; `npm run release:rollback` restores it.
- Testing 123 backup + rollback SQL: `backups/testing123-pre-remediation-2026-10-25.json`
  (sha256 `2da865f3…`), `backups/testing123-rollback.sql`, plus
  `backups/testing123-reset.sql` (the executed operation).

## J. Remaining owner actions

1. **Owner acceptance** of the live StudioFlow behavior (creation, switching,
   persistence) — the recovery remains `OWNER ACCEPTANCE PENDING` until the
   owner confirms in their own account.
2. **Confirm Testing 123** now shows the four clean default items.
3. **Run the safe diagnostic below** in the browser profile that holds
   "Browser Only Crossroads", and paste the output back.

### Browser Only Crossroads — owner diagnostic (read-only)

Open `https://paranormalinitiative.com/studio/`, open the browser developer
console (Firefox: Tools → Browser Tools → Web Developer Tools → Console), and
paste:

```js
(() => {
  const read = (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return "__UNPARSEABLE__: " + localStorage.getItem(k); } };
  const broadcasts = read("studioflow.broadcasts");
  const snapshots = read("studioflow.tpiLocalStudioSnapshots.v1");
  const recovery = read("studioflow.tpiLocalStudioSnapshots.recovery.v1");
  return {
    activeBroadcastId: JSON.parse(localStorage.getItem("studioflow.activeBroadcastId") || "null"),
    activeStudioId: localStorage.getItem("studioflow.tpiActiveStudioId.v1"),
    broadcasts: Array.isArray(broadcasts) ? broadcasts.map((b) => ({ id: b.id, title: b.title })) : broadcasts,
    snapshots: snapshots && typeof snapshots === "object" && !Array.isArray(snapshots)
      ? Object.keys(snapshots).map((id) => ({
          id,
          savedAt: snapshots[id] && snapshots[id].savedAt,
          stateBroadcastId: snapshots[id] && snapshots[id].state && snapshots[id].state.broadcast && snapshots[id].state.broadcast.id,
          matchesKey: !!(snapshots[id] && snapshots[id].state && snapshots[id].state.broadcast && snapshots[id].state.broadcast.id === id)
        }))
      : snapshots,
    recoveryKeys: recovery && typeof recovery === "object" && !Array.isArray(recovery) ? Object.keys(recovery) : recovery
  };
})();
```

This only reads storage — it changes nothing and exposes no credentials. Send
back the printed object.

Interpretation and targeted recovery:

- If "Browser Only Crossroads" appears in `broadcasts` with a snapshot whose
  `matchesKey` is true: open it from the My Studios menu — it activates with
  its own saved configuration (selecting it now always activates it or
  explains exactly why not).
- If it has **no snapshot**: opening it now shows "No saved configuration was
  found for this Studio. It opened with the default Studio configuration." —
  it opens clean instead of silently reverting; the previous configuration
  cannot be recovered from this browser because none was saved.
- If its snapshot is listed with `matchesKey: false`, or `snapshots` reads
  `__UNPARSEABLE__`: the record is preserved automatically under
  `recoveryKeys` and nothing is destroyed — send back the output and the
  preserved record can be inspected and restored specifically. Do not clear
  browser storage; do not delete other Studios' snapshots.

## Intentional behavior changes

1. A Studio switch whose pre-switch save fails now **always** stays on the
   current Studio and explains the failure. Previously a title conflict could
   silently fall through to a browser-local save and switch anyway.
2. Browser-local Studios with missing snapshots open with defaults and a
   visible notice (unchanged from the previous recovery); malformed or corrupt
   snapshot records are now preserved under
   `studioflow.tpiLocalStudioSnapshots.recovery.v1` before replacement.
3. The My Studios menu refreshes its entries each time it opens.
