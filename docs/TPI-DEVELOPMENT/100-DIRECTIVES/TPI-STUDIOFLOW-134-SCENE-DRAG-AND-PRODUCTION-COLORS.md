# TPI-STUDIOFLOW-134 — Scene Drag-and-Drop, Production Colors, and Browser Environment Investigation

Date: 2026-11-01
Priority: High
Status: **CORRECTED AND VERIFIED IN LOCAL DEVELOPMENT — PRODUCTION NOT DEPLOYED (not authorized)**
Production deployment: **NOT AUTHORIZED / NOT PERFORMED**

## 1. Result

**The reported behavior was never a rendering or browser problem. It was a
missing-feature problem caused by divergent StudioFlow source lineages.**

TPI-STUDIOFLOW-125 (Teleprompter scripts as Scene production items) and
TPI-STUDIOFLOW-126A (the production-item color system) were committed only on
the `codex/studioflow-122-notes` lineage. The source revisions that produced the
TPI-130 through TPI-133 builds descend from `main` and never contained either
commit. The shipped bundle therefore had **no `teleprompter-script` production
kind and no `--production-item-*` custom property at all** — verified directly
in the served artifacts, not inferred from behavior.

Chrome was not involved and cannot explain the defect: a feature whose code is
absent from the bundle cannot render in any browser.

The correction ports both approved features onto the released lineage, restores
the approved five-color system and Teleprompter-to-Scenes drag-and-drop in the
authoritative local Worker, and adds the first automated gate that asserts them.

## 2. Current development environment (verified)

| Item | Verified value |
| --- | --- |
| Local URL | `http://127.0.0.1:8787/studio/` (anonymous `403`, session-protected) |
| Runtime | Local Cloudflare Worker (`workerd`), launcher-owned |
| Startup | `npm run dev:local` / `npm run dev:local:service:restart` |
| Persistence | `.local-dev/state/v3` (D1 + R2) |
| Repository | `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website` |
| Branch | `codex/tpi-development` |
| Pre-work HEAD | `208b873` (clean tree) |
| Post-work HEAD | `8e75a0e` (implementation commits `6dc1525`, `8e75a0e`), pushed with parity |
| Acceptance browser | Firefox Developer Edition, isolated disposable profile |

The local Worker was serving exactly what production serves for StudioFlow: the
133 asset pair `index-mYnRoDcA.js` / `index-B-jk8V4i.css`. Local development and
production were therefore in agreement, which is why the defect appeared in both.

## 3. Current production Worker (verified read-only)

`wrangler deployments list --name theparanormalinitiative` reports the active
100% traffic version as **`71a5293d-fef4-4643-bf50-e9dfc7327eb5`** (created
2026-11-01T19:25:03Z), matching the TPI-STUDIOFLOW-133 release record. Rollback
target remains `cd37afb8-cc82-406a-9e15-e84b3dffa234`.

**Limitation:** live production hashed assets are session-gated
(`GET /studio/assets/index-mYnRoDcA.js` returns `403` anonymously), so the
production asset bytes could not be hashed without signing in. Production asset
identity is therefore taken from the 133 release record, not independently
re-hashed in this directive.

## 4. Browser investigation — Chrome excluded as a cause

Evidence establishing that the browser switch did not contribute:

1. The maintained acceptance path never moved to Chrome. Every release gate in
   `scripts/tpi-release.mjs` invokes
   `scripts/verify/tpi-studioflow-firefox-acceptance.mjs`, which launches
   `Builder().forBrowser("firefox")` against
   `/Applications/Firefox Developer Edition.app/Contents/MacOS/firefox` through
   `geckodriver`. Firefox Developer Edition acceptance was reduced in **scope**,
   never replaced by Chrome.
2. The missing behavior is absent from the **artifact**, not the render. The
   pre-correction bundle contained `data-production-kind` **0 times** and
   `--production-item-*` **0 times**, and the source commit it was built from
   (`e608ca9`) contains no `data-production-kind` in `src/`. No browser can
   render code that was never compiled in.
3. The same defect reproduced identically in both local and production, which
   share the same asset pair — the signature of a build-source problem, not a
   browser-storage or CSS-ordering problem.
4. Chrome appears in the repository only as a compatibility baseline in
   unrelated harnesses (`scripts/verify/tpi-studioflow-02x`, `scripts/e2e/*`),
   never as the StudioFlow release acceptance browser.

**Verdict: EXCLUDED.** No origin change, profile change, storage divergence,
stylesheet divergence, or stale-build substitution was involved. The one real
environmental factor was **acceptance coverage**: no gate asserted colors,
icons, highlighting, or script drag, so a lineage loss could ship unnoticed.

## 5. Original feature implementation history

| Item | Commit | Lineage | Approved | In released lineage |
| --- | --- | --- | --- | --- |
| Teleprompter → Scene production items (D125) | `77f32d9` | `codex/studioflow-122-notes` | Yes | **No** |
| Production item colors (D126A) | `a6784cf` | `codex/studioflow-122-notes` | Yes | **No** |
| Scene drag reorder foundation | `322b132`, `d6b8f03` | shared ancestry | Yes | Yes |
| Released-lineage head (D133) | `e608ca9` | `codex/tpi-133` | Yes | Yes |

Graph evidence:

- Merge base of the two lineages is `9f85f9d` (`main`, "keep background Studio
  activations from hijacking the view").
- The release lineage is `9f85f9d` + `859febc` + `fb95c43` + `044ea8e` +
  `e608ca9` — four commits, all Studio deletion and menu anchoring.
- `a6784cf` is **not** an ancestor of `e608ca9`; `git merge-base --is-ancestor`
  returns false in both directions.
- `git show e608ca9:src/styles.css | grep -c -- '--production-item'` → `0`.
- `git show a6784cf:src/styles.css | grep -c -- '--production-item'` → `27`.

Classification per feature:

- **Teleprompter → Scene drag-and-drop:** implemented, approved, committed,
  **never included in any release build**, and additionally absent from the
  current source.
- **Production item colors / icons / selected / dragging:** implemented,
  approved, committed, documented as "PRODUCTION UNCHANGED" by 126A/126C,
  **never included in a release build**, absent from the current source.
- **Scene reorder drag-and-drop:** implemented and present; not the reported
  defect, and confirmed still working.
- Present-but-not-rendering and present-but-malfunctioning are both **excluded**
  for the reported symptoms.

### Related, larger loss discovered

The same divergence removed more than the reported items. `e608ca9` does not
contain `src/NotesView.tsx`, `src/projectExport.ts`, `src/projectFolderSync.ts`
or `src/localRecordingDeletion.ts`, and the shipped bundle contains no
`notes-rich-editor` and no `Download Project`. The 122-notes lineage — which
carried the Notes workspace, podcast project export, local project folder sync,
and the private stage Teleprompter reader — never reached the TPI-130+ release
lineage. This is recorded as a separate, larger finding (§15) because restoring
it re-ships a substantially larger surface than this directive authorized.

This also explains a pre-existing failing suite: the maintained
recording/storage regression (`tpi-studioflow-035`) waits for
`[data-private-teleprompter="true"]`, which exists only on the 122-notes
lineage. It cannot pass on the released lineage and did not pass before this
change either.

## 6. Source-to-production comparison (before correction)

| Question | Answer |
| --- | --- |
| Present in current source? | No — no `data-production-kind`, no `--production-item-*` |
| Present in current production assets? | No — same bundle bytes as local |
| Works in Firefox Developer Edition? | No — feature does not exist |
| Root classification | Implemented and later lost to a divergent release lineage |

## 7. Production item color findings

The approved system (TPI-STUDIOFLOW-126A) was not partially present; it was
entirely absent. The maintained bridge stylesheet
`studio/studioflow-012-overrides.css` already consumed the token correctly:

```css
border: 1px solid var(--production-item-border, rgba(105, 189, 255, 0.5));
```

Because the bundle never defined `--production-item-border`, every row fell
through to the generic blue fallback, and the source `.scene-panel-item.selected`
/ `.dragging` rules used the generic `#54c7ff`. That is exactly the reported
"missing production item colors" and "incorrect highlighting". The bridge was
correct; the missing token was the cause.

Approved colors restored:

| Item | Border token | Selected border | Icon |
| --- | --- | --- | --- |
| Video (Intro/Outro/Video Clip) | `rgba(249, 115, 22, 0.72)` | `#fb923c` | `#f97316` orange |
| Teleprompter | `rgba(168, 85, 247, 0.74)` | `#c084fc` | `#a855f7` purple |
| Scene | `rgba(59, 130, 246, 0.72)` | `#60a5fa` | `#3b82f6` blue |
| Timer | `rgba(234, 179, 8, 0.72)` | `#facc15` | `#eab308` yellow |
| Music | `rgba(34, 197, 94, 0.7)` | `#4ade80` | bridge-owned |

The card tint also derives from the same token family, so border, tint, icon and
selection can never disagree.

## 8. Icon color findings

The question "did the approved icons have their own colors?" is answered by the
approved implementation itself: **yes**. TPI-STUDIOFLOW-125 changed
`.scene-panel-item-icon` from the fixed `#75d5ff` to
`color: var(--production-item-color)`, giving each icon its type color, and
TPI-STUDIOFLOW-126A added the brighter `--production-item-selected-border`
family. That implementation was restored verbatim rather than invented.

One documented exception is preserved as approved: the **Background Music**
glyph carries `tpi-scene-music-icon`, which the maintained audio bridge owns and
tints to the assigned SmartPad color. The approved implementation never
replaced that glyph, and the maintained `tpi-studioflow-037` Scenes suite still
asserts its `rgb(117, 213, 255)` color. Only the music card's border, tint and
selected token are type-driven.

## 9. Drag-and-drop root cause

Not event handlers, not payloads, not pointer events, not overlays, not
persistence, and not browser behavior. The `teleprompter-script` production kind
and the external-script drop path **did not exist in the build**:

- `ScenePanelItemKind` lacked `"teleprompter-script"`.
- `ScenePanelItem` had no `teleprompterScriptId`, so a script shortcut could not
  survive normalization or persistence.
- `updateScenePanelDropPosition` returned immediately unless an internal row
  reorder was already in progress, so no external drag was ever accepted.
- No `onDrop` branch read the script payload; no drop placeholder existed.
- The Teleprompter rail script buttons were not `draggable` and published no
  payload.

The approved payload contract is
`application/x-studioflow-teleprompter-script` (script id) plus `text/plain`
(title), with `effectAllowed`/`dropEffect` of `copy`.

## 10. Corrections implemented

StudioFlow source, commit `820d680da23d2a262f02a8da55ac4cc3faa5dd52` on
`codex/tpi-134` (worktree `.local-dev/worktrees/source-134`, built from
`e608ca9`):

- Restored `"teleprompter-script"` in `ScenePanelItemKind`, the `validKinds`
  normalization allow-list, the `teleprompterScriptId` field and its
  normalization (blank/absent reference drops the row), and the
  "Teleprompter Script" default title.
- Restored `previewScenePanelItem` handling for the new kind: a shortcut opens
  the prompter on its script, and an unreachable script reports
  "This teleprompter script is unavailable in the current Studio" instead of
  failing silently. It uses the released lineage's own prompter
  (`StudioTeleprompterModal`) rather than importing the unreleased private
  reader.
- Restored external drag acceptance in `updateScenePanelDropPosition`,
  `dropExternalScenePanelItem`, the `scenePanelExternalDropIndex` state, the
  `onDrop` branch, the drag-end reset, and the "Place script here" placeholder
  in both insertion positions.
- Restored `addTeleprompterScriptPanelItem` (insertion-index aware),
  `addProductionItem("teleprompter-script")`, the Add-production-item entry, and
  the script picker.
- Restored the rail script buttons as drag sources with the approved payload.
- `ScenePanelCard` now emits `data-production-kind` for every card, renders a
  `FileText` icon and "Teleprompter" role for the new kind, and disables a
  shortcut whose script is gone.
- Restored the full approved CSS: `--production-item-color/-tint/-border/
  -selected-border`, the five `[data-production-kind]` blocks, type-aware
  `.selected` and `.dragging`, `color: var(--production-item-color)` on the
  icon, the production-menu icon colors, the script picker, and the purple
  `.script-drop-placeholder`.

No deletion, Studio management, storage, Notes, or bridge behavior was changed.
The hardened TPI-130/131/132R/133 deletion subsystem was deliberately left
untouched; a full lineage merge was evaluated and rejected because it produced
22 semantic conflicts concentrated in the owner's data-deletion code.

Website integration (branch `codex/tpi-development`):

- `scripts/studioflow-release-baseline.json` now records directive TPI-134,
  approved source `820d680d…`, JavaScript `index-CmUjeYcC.js`, CSS
  `index-D6ZhUVW1.css`.
- `studio/index.html` references the new verified hashed assets; the maintained
  bridge layer and its `tpi126c=production-item-border-v2` cache key are
  preserved.

## 11. Files modified

StudioFlow source (`/Users/toddknipple/Documents/StudioFlow/web-122`, worktree
`source-134`): `src/App.tsx`, `src/styles.css`.

Website repository:

- `studio/index.html`
- `studio/assets/index-CmUjeYcC.js` (new, generated)
- `studio/assets/index-D6ZhUVW1.css` (new, generated)
- `scripts/studioflow-release-baseline.json`
- `scripts/verify/tpi-studioflow-134-firefox.mjs` (new)
- `scripts/tpi-release.mjs` (gate wiring)
- `package.json` (`verify:studioflow-134-firefox`)
- `docs/TPI-DEVELOPMENT/100-DIRECTIVES/evidence/TPI-STUDIOFLOW-134/*.png`
- this record plus the status, handoff and workflow updates

## 12. Firefox Developer Edition visual acceptance

Isolated disposable profile, disposable Studio, real Firefox Developer Edition
through `geckodriver`. Evidence:
`evidence/TPI-STUDIOFLOW-134/all-production-item-colors.png`,
`selected-state-colors.png`, `scene-drop-target-highlight.png`,
`teleprompter-script-in-scenes.png`.

Observed in `all-production-item-colors.png`: orange Intro Video, blue
Disposable Scene, yellow Countdown Timer, green Background Music, orange Outro
Video. Computed styles confirmed full-perimeter solid borders on all four sides
for every row, plus the matching type color token and icon color.

`teleprompter-script-in-scenes.png` shows the dropped purple
"Scene Drag Verif…" card with its purple icon between the orange opening and the
blue scene. `scene-drop-target-highlight.png` shows the purple dashed "PLACE
SCRIPT HERE" placeholder inserted at the live insertion point while a script is
dragged.

Note: the Background Music row renders at 0.52 opacity with no track assigned,
which is existing maintained bridge behavior (`[data-tpi-music-disabled]`), not
a regression. Its border color is still the approved green.

## 13. Firefox drag-and-drop acceptance

`scripts/verify/tpi-studioflow-134-firefox.mjs` — **27/27 PASS**:

1. Isolated Firefox Developer Edition login form renders.
2. Isolated authentication succeeds.
3. Firefox serves the intended hashed production assets.
4. Video, scene, timer, and music cards render with type tokens.
5. Every unselected card border matches its approved type color.
6. Every card shows a full-perimeter solid border on all four sides.
7. Every card carries its approved type color token.
8. Icons render in their approved color.
9. Background Music keeps its bridge-owned glyph color.
10. Selected cards use their approved brighter type color (all five types).
11. Dragging cards keep their approved type color.
12. Teleprompter right-rail tab is available.
13. Saved scripts render in the rail.
14. Scripts are draggable.
15. Drag publishes the approved payload.
16. My Scenes highlights a valid script drop target (visible, non-zero,
    in-viewport bounding box).
17. The drop target uses the purple Teleprompter color.
18. Dropping creates a Teleprompter Script production item.
19. The dropped card is purple.
20. The drop placeholder clears after the drop.
21. The dropped row is labelled for the creator.
22. Clicking the card selects it in its purple state.
23. The assignment persists after refresh.
24. Type colors persist after refresh.
25. The persisted manifest keeps the script reference.
26. Pre-existing production rows are preserved.
27. No duplicate or unexpected rows were created.

Drag is driven by real `DragEvent` dispatch with a real `DataTransfer`, which
exercises the application's own handlers, payload, normalization and persistence.
Native OS pointer drag initiation is not automated; the drag source's
`draggable` attribute and `dragstart` payload are asserted instead.

## 14. Regression test results

| Suite | Result |
| --- | --- |
| Firefox Developer Edition release acceptance | **PASS — 64/64** |
| TPI-134 colors and script drag (new) | **PASS — 27/27** |
| Scenes panel regression (`verify:studioflow-037-scenes-panel`) | **PASS — 20/20** |
| Release safety contract (`verify:release-safety`) | **PASS** |
| Local auth lifecycle (`verify:local-auth-lifecycle`) | **PASS — 38/38** (before restart, after restart, after rebuild) |
| Recording/storage regression (`verify:studioflow-035`) | **PRE-EXISTING FAIL** — asserts `[data-private-teleprompter="true"]`, which exists only on the unreleased 122-notes lineage. Not caused by, and not fixable within, this directive. |
| StudioFlow staging verification | **PASS** — exact approved build reproduced |

The correction was staged through the provenance workflow, which built the
approved commit twice from a clean worktree, confirmed reproducibility, matched
the recorded hashes, and preserved all eleven bridge files.

### Full `release:preflight` run

`npm run release:preflight` was executed end to end with the new TPI-134 gate
wired in. **Every gate passed**, including the new one:

| Preflight gate | Result |
| --- | --- |
| Release workflow safety contract | PASSED |
| Stage local assets | PASSED |
| local_admin authentication (before restart / after restart / after rebuild) | PASSED — 38/38 each |
| Managed local Worker restart | PASSED |
| StudioFlow production build | PASSED — 1600 modules |
| Firefox Developer Edition local_admin acceptance | PASS |
| Persistent development authentication | PASSED — 38/38 |
| Disposable E2E service (stop / clean / start) | PASSED |
| Complete isolated QA and API E2E | PASS — 14/14 checksets |
| Firefox Developer Edition release acceptance | PASS |
| Studio Management lifecycle regression | PASS |
| Studio ownership and dashboard regression | PASS |
| Studio deletion and archive management regression | PASS |
| Studio deletion safety and data integrity regression | PASS |
| Floating Studio actions menu positioning regression | PASS |
| **Production item colors and Teleprompter scene drag regression (new)** | **PASS — 27/27** |
| Authoritative StudioFlow staging verification | PASSED — reproducible, 29/29 files matched |

The run then stopped at its final `assertGitReleaseState()` check with
`working tree is not clean`. That was **not** a product or test failure:

1. this directive's documentation was being written while the run was in
   flight, and
2. a genuine defect in the new gate: in local mode it wrote its four evidence
   PNGs into `docs/.../evidence/TPI-STUDIOFLOW-134/`, which are **tracked
   files**, so the gate dirtied the tree it was verifying.

Defect corrected: the suite now writes evidence to a disposable
`mkdtempSync(tmpdir())` directory unless `TPI_FIREFOX_134_EVIDENCE` is set
explicitly, so a release run cannot mutate tracked files. The recorded evidence
PNGs were restored to the reviewed versions and the run was repeated on a clean
tree to confirm the whole workflow reports success.

## 15. Documentation updates

- This record.
- `docs/TPI-DEVELOPMENT/TPI-CURRENT-DEVELOPMENT-STATUS.md`
- `docs/TPI-DEVELOPMENT/TPI-DEVELOPMENT-AGENT-HANDOFF.md`
- `docs/TPI-DEVELOPMENT/TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`

Historical records for 125, 126A, 126C and 127 are preserved unchanged.

## 16. Production deployment status

**NOT DEPLOYED.** Production remains Worker
`71a5293d-fef4-4643-bf50-e9dfc7327eb5` on the TPI-133 bundle. The correction is
committed and pushed to `origin/codex/tpi-development` with GitHub parity and is
staged in the authoritative local Worker for owner acceptance.

Deploying requires separate authorization and the maintained sequence:

```sh
npm run verify:local-auth-lifecycle
npm run release:preflight
TPI_PRODUCTION_DEPLOY=approved npm run release:production
```

## 17. Remaining blockers and open items

1. **Owner acceptance in Firefox Developer Edition is pending.** The automated
   acceptance passes, but the owner has not visually confirmed the restored
   colors and drag on `http://127.0.0.1:8787/studio/`.
2. **Production is unchanged.** The reported symptoms will persist live until a
   separately authorized release is run.
3. **Larger lineage loss requires an owner decision.** Notes, podcast project
   export, local project folder sync, recording-audio work, and the private stage
   Teleprompter reader are also absent from the released lineage. Restoring them
   means merging two lineages that conflict in 22 places inside the deletion
   subsystem, which needs explicit authorization and its own acceptance cycle.
4. **`verify:studioflow-035` cannot pass** on the released lineage until the
   private Teleprompter reader is restored or that suite is reconciled.
5. **Production asset hashes were not independently verified** — production
   StudioFlow assets are session-gated and return `403` anonymously.
6. **Native pointer drag initiation is not automated**; the payload and handlers
   are asserted with real `DragEvent`/`DataTransfer` objects.
7. **Background Music selected styling** is still bridge-owned; the card never
   receives `.selected`, so its brightest selected state is not exercised.

## 18. Commits and parity

- StudioFlow source: `820d680da23d2a262f02a8da55ac4cc3faa5dd52` (`codex/tpi-134`;
  the StudioFlow repository has no configured remote)
- Website implementation: `6dc1525`
- Website regression gate: `8e75a0e`
- Website preflight integrity fix: `fed57d5`
- Website documentation: `8cd8317` and the follow-up documentation commit on the
  same branch (`git log -- docs/TPI-DEVELOPMENT` is authoritative for the full set)
- Website branch: `codex/tpi-development`
- GitHub parity: **VERIFIED** — `origin/codex/tpi-development` equals the local
  HEAD before every preflight run, which `release:preflight` enforces as a
  hard precondition

## 19. Safety statement

Crossroads of the Unknown was not opened, renamed, archived, deleted, or
modified. No owner browser profile, cookie, or localStorage was read or cleared.
All acceptance ran in disposable Firefox profiles with disposable Studios. No
production D1 row, R2 object, migration, credential, or bridge file changed.
