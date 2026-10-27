# TPI-STUDIOFLOW-101 — Browser-local recording deletion safety repairs

Date: 2026-10-26. Owner directive: implementation and verification on the isolated Directive 100 branches; no push, merge or deployment. Preserve browser-local recording architecture, shared/ambiguous recordings, both deletion scopes, and Directive 093 safeguards. Repair swallowed cleanup failures and stale-tab races; add independent local tests without production access.

## Result: BLOCKED

Partial implementation is committed and independently buildable. **Not implementation complete, not safety verified, not deployed, not owner accepted.**

- Source branch: `codex/studioflow-100-deletion-isolation`.
- Source baseline: `8b72de8`; candidate: `0a10451997e19a09ef2aae94bb9b25395603bfac`.
- Website branch: `codex/studioflow-100-deletion-server`, server implementation unchanged from `5180872`. The documentation commit introducing this record is the website commit for this execution (`git log -1 --format=%H -- docs/TPI-DEVELOPMENT/100-DIRECTIVES/TPI-STUDIOFLOW-101-LOCAL-RECORDING-DELETION-SAFETY.md`).
- Worktrees remain `.local-dev/worktrees/source-100` and `.local-dev/worktrees/website-100` within the original website checkout.
- Files: source `src/App.tsx`, `src/localRecordingDeletion.ts`, `scripts/check-local-recording-deletion.mjs`; website authoritative directive/index/status/handoff documentation only. No generated website assets staged.

## Implemented partial repairs

Conservative library reference classifier protects duplicate blob references, duplicate item IDs, missing/unassigned ownership, unknown candidates, malformed metadata and external-file handles. Reads persisted metadata rather than a stale React closure. Existing browser bridge remains the source of cached other-Studio reference checks; no server recording ownership fields/tables were invented.

Cleanup workflow awaits removal, persists a per-Studio scope/error journal, refuses changed retry modes and retains server-complete state for retry. App IndexedDB batch waits for transaction completion and rejects abort/error. Unit fixtures inject deletion and partial cleanup failures; no actual owner storage was accessed.

**Intentional temporary behavior change:** Delete Studio and Contents always fails closed before server or local deletion. The UI discloses this block. Delete Studio Only retains blobs. This is a blocked development checkpoint, not an approved functional replacement or production release.

## Precise safety blocker

Existing library persistence (`App.tsx` libraryItems effect), recording/blob writers, workspace snapshot/cache writers and older tabs do not participate in a common lock. An exclusive Web Lock/presence lock used only by new deletion code cannot prove the absence of those writers. Re-reading localStorage immediately before asynchronous IndexedDB deletion does not make ownership validation and deletion atomic. A writer can introduce another Studio reference after the last check and before transaction commit. Existing bridge parsing also tolerates missing/malformed cached reference metadata; it is not complete authoritative proof.

The candidate therefore refuses destructive content deletion even if Web Locks exists and no cooperating tab is visible. This prevents the identified race rather than declaring it solved. Removing that refusal without coordinated ownership writes would be unsafe. Do not enable the independently testable cleanup helper directly.

Remaining implementation work includes an enforceable protocol for all relevant writers/older tabs, trustworthy fresh reference validation, crash/reload retry UI reconciliation, and real IndexedDB/browser acceptance. The retained journal is evidence, not a demonstrated complete post-reload recovery experience. Storage write failures can also interrupt journal persistence and require reconciliation. Stop condition reached: reliable cross-tab coordination not established.

## Verification

- Node `v25.9.0`, existing TypeScript/Vite dependencies; no new dependency.
- `node scripts/check-local-recording-deletion.mjs`: **22/22 PASS**. Tests cover exclusive/shared/ambiguous ownership, missing/malformed metadata, duplicate keys/IDs, failures and partial cleanup, both helper modes, changed retry mode, stale metadata, late shared references, unrelated recordings, missing blobs, and fail-closed coordinator paths. These are injected local fixtures, **not real concurrent browser or IndexedDB tests**.
- `./node_modules/.bin/tsc --noEmit`: **PASS**.
- `npm run build`: **PASS**, existing >500 kB chunk warning only.
- `node scripts/verify/tpi-studioflow-093-purge-safety.mjs` in isolated website: **PASS** (scope pinning, legacy rejection, R2 failure and retry; actual handler extracted into VM with mocked storage/auth helpers).
- `git diff --check`: **PASS** for source.
- No 088/089 browser run in this directive; Directive 100 recorded missing isolated QA credentials. Real Firefox/IndexedDB, cross-tab, full management and integrated acceptance remain unverified. No production endpoint contacted.
- No 091/092 source, CSS or server changes included; originals were not edited, reset, cleaned, staged or committed by this execution.

Generated, unstaged source build hashes:

| Asset | SHA-256 |
| --- | --- |
| index-B6B4DYbl.js | 0e08ecade9761c118fe5cf37e95d86bc95205ace9a7acafdc0c55dddfab45f95 |
| index-Bs-R9tef.css | 94679ff576c2e34b1bb666a99bd83dd86f08bea6c1d05ddb8fb1e9a1d9876338 |

## Next action

Resolve writer coordination and old-tab compatibility on the isolated branches, then exercise actual IndexedDB rollback, reload/retry and two-tab stale ownership in disposable Firefox profiles before enabling content deletion. Rerun 093 and local tests. Do not push, merge, stage for release, deploy or mark owner accepted from this checkpoint.
