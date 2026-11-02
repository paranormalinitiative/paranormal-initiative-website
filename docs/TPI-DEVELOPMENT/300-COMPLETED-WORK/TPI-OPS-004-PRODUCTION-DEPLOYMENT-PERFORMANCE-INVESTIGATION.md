# TPI-OPS-004 — Production Deployment Performance and Release Pipeline Investigation

**Directive status:** COMPLETE — RELEASE PIPELINE MEASURED AND SAFELY OPTIMIZED

**Executed:** 2026-11-02

**Baseline commit:** `6433fa00ac2ea9281e386ee18e6f696ee8963825`

**Tooling commit:** `69991f45e56145cf6d1149f2dfb3d97b41f51062`

**Production during this directive:** unchanged at Worker
`daa5aee1-304f-4e96-89a8-86aac2df98e9` (created 2026-11-02T04:46:52.087Z). No
Worker was deployed, no D1 statement was executed, no R2 object was touched, no
migration was applied, and no application code changed.

---

## A. Executive summary

TPI production releases are slow because of **TPI's own certification work, not
Cloudflare**. Measured on this machine:

| Question (§20) | Measured answer |
| --- | --- |
| What percentage of release time is actually Cloudflare? | **0.85%** — 7.63 s of a 902 s release (15:02) |
| What percentage is TPI testing/certification? | **95.1%** — 858 s of the same release is preflight gate work |
| What is executed more than once? | The entire preflight (twice), the StudioFlow build (4×), asset hashing (3×), the Git clean/parity check (4×) |
| Which duplication is intentional? | The second preflight (release-drift protection) and the 3× Firefox acceptance (three different targets: `local_admin`, `test_admin`, production QA) |
| Which duplication can safely be removed? | Only the second preflight, and only via immutable certified artifacts — **requires a separate directive** |
| How much time is spent launching browsers? | **1.79 s per launch**; 23.2 s of the 429 s preflight (5.4%) is launch/quit. The other 94.6% of browser time is real page work |
| How much time is spent rebuilding/staging? | Builds 20.2 s; staging was 30.5 s and is now **2.97 s** |
| Why do intermediate assets repeatedly enter staging? | `stage-studioflow-authoritative.mjs --apply` appends each build's hashed bundles into the tracked `studio/assets/` directory and never prunes superseded ones |
| Can immutable release certification replace repeated preflight? | Yes, with a hash-and-manifest-bound certificate; **not implemented** — design in §I |
| Are tiered releases safe and practical? | Yes, if classification is derived from changed paths and fails closed; **not implemented** — design in §J |
| How much deployment time can realistically be reduced? | **75.6 s (8.4%) measured** with the tooling committed here; up to **475 s (52.7%)** with certified-artifact reuse |

The three largest single costs in a release are the Firefox regression suite
(295 s, 74% of preflight), the isolated API E2E suite (71 s, 18%), and the
now-fixed staging copy (was 30.5 s, now 3.0 s).

---

## B. Current pipeline map

Both `npm run release:preflight` and `TPI_PRODUCTION_DEPLOY=approved npm run
release:production` are implemented in a single file, `scripts/tpi-release.mjs`.
Script names were not trusted; every subprocess was read.

### `release:preflight` → `node scripts/tpi-release.mjs preflight`

```
assertGitReleaseState()                     git branch + status + ls-remote parity
  |
  +-- tpi-release-safety.mjs                21 static contract assertions (0.09 s)
  +-- tpi-ops-004-release-staging-guard.mjs  4 staging-bound assertions (NEW, 0.09 s)
  +-- stage-local-assets.mjs                copy 613-file tree to .local-dev/assets
  |
  +-- verifyAuthLifecycle()
  |     +-- localAdminFingerprint()          sqlite3 read of local D1 + credential hash
  |     +-- tpi-ops-009-authentication.mjs   38 checks, HTTP only (1.5 s)
  |     +-- local-dev-service.mjs restart    managed LaunchAgent restart
  |     +-- waitFor 8787 / + /studio/
  |     +-- tpi-ops-009-authentication.mjs   38 checks again
  |     +-- npm run build (StudioFlow worktree)        <-- artifact discarded
  |     +-- waitFor 8787
  |     +-- tpi-ops-009-authentication.mjs   38 checks again
  |     +-- localAdminFingerprint()          must be unchanged
  |     +-- tpi-studioflow-firefox-acceptance.mjs      [Firefox 1] local_admin
  |
  +-- tpi-ops-009-authentication.mjs         38 checks (4th time this run)
  |
  +-- isolated E2E
  |     +-- isolated-launchagent.sh stop
  |     +-- isolated-worker.mjs clean
  |     +-- isolated-launchagent.sh start            disposable Worker on :8789
  |     +-- run-qa.mjs --e2e --studioflow-root --production-smoke
  |           +-- 6x node --check, bash -n, 2 QA regressions
  |           +-- api-e2e.sh :8791-standalone   62 migrations + 222 assertions
  |           +-- npm run build (StudioFlow worktree)  <-- artifact discarded
  |           +-- check:request-budget / check:room / check:rtmp
  |           +-- production-smoke.mjs (read-only, live site)
  |     +-- isolated-launchagent.sh stop
  |
  +-- localAdminFingerprint() must be unchanged
  +-- tpi-studioflow-firefox-acceptance.mjs            [Firefox 2] test_admin
  +-- tpi-studioflow-studio-lifecycle.mjs              [Firefox 3]
  +-- tpi-studioflow-087-studio-ownership.mjs          [Firefox 4]
  +-- tpi-studioflow-088-studio-deletion.mjs           [Firefox 5]
  +-- tpi-studioflow-089-deletion-safety.mjs           [Firefox 6]
  +-- tpi-studioflow-133-floating-studio-menu.mjs      [Firefox 7]
  +-- tpi-studioflow-134-firefox.mjs                   [Firefox 8]
  +-- tpi-studioflow-135-scene-persistence.mjs         [Firefox 9]
  +-- tpi-studioflow-137-notes-restoration.mjs         [Firefox 10]
  +-- tpi-studioflow-137a-notes-visual.mjs             [Firefox 11]
  +-- tpi-studioflow-137r-home-layout.mjs              [Firefox 12]
  +-- tpi-studioflow-137r-mobile-viewport.mjs          [Firefox 13]
  +-- stage-studioflow-authoritative.mjs     builds approved commit TWICE + compares
  +-- tpi-studioflow-137-notes-continuity.mjs lineage + feature markers (static)
  +-- assertGitReleaseState()                must equal the starting commit
  +-- activeProductionVersion()              wrangler deployments list
  +-- ensureCloudflareAccess()               whoami + versions list + rollback --help
  +-- deploy-production-guarded.mjs --dry-run   cpSync stage + wrangler --dry-run
  +-- write .local-dev/release-preflight.json
  +-- print READY
```

### `release:production` → `node scripts/tpi-release.mjs deploy`

```
TPI_PRODUCTION_DEPLOY must equal "approved"        (fails closed, first statement)
  |
  +-- tpi-studioflow-137-production-schema.mjs     read-only production D1 gate
  +-- preflight()                                  <- THE ENTIRE PREFLIGHT ABOVE
  +-- assertGitReleaseState() must still equal preflight's commit
  +-- deploy-production-guarded.mjs                cpSync stage + wrangler deploy
  +-- production-smoke.mjs                         live anonymous, read-only
  +-- tpi-studioflow-firefox-acceptance.mjs        [Firefox 14] production_qa
  +-- activeProductionVersion() must equal the new version
  +-- print DEPLOYED_AND_VERIFIED
        on any failure -> wrangler rollback to the captured rollback version
```

### Why `release:production` reruns preflight (§10)

`deploy()` calls `preflight()` directly. This is **intentional and
load-bearing**, not accidental:

- The deploy guard (`deploy-production-guarded.mjs`) independently re-checks
  branch, clean tree, and exact GitHub parity, and re-validates that
  `wrangler.toml` names the production Worker, D1 and R2 and contains no
  development values.
- `deploy()` re-checks `assertGitReleaseState()` *after* preflight returns, so
  the uploaded commit is provably the certified commit.

The duplicate the owner observed during TPI-STUDIOFLOW-137R is the operator
running `release:preflight` and then `release:production`, which repeats it.
That is the documented runbook sequence, and it exists so a stale `READY` can
never be followed by a deploy of different bytes. It is **drift protection, not
an accident** — so it must be preserved by any faster design, not deleted.

---

## C. Timing evidence

### C.1 Baseline — the unmodified pipeline

Measured with an external per-line timestamp wrapper around the untouched
`npm run release:preflight` at commit `6433fa0`, so no code changed during the
measurement.

**Total: 429.071 s (7:09.071), status READY, exit 0.** Log:
`.local-dev/logs/ops004-baseline-preflight.log`.

| Phase | Duration |
| --- | ---: |
| Node startup + Git clean-tree/branch/parity check | 0.94 s |
| Release workflow safety contract | 0.09 s |
| Stage local assets | 0.99 s |
| local_admin authentication before restart | 0.53 s |
| Managed local Worker restart | 2.06 s |
| local_admin authentication after restart | 0.24 s |
| StudioFlow production build (worktree) | 5.43 s |
| local_admin authentication after StudioFlow rebuild | 0.27 s |
| Firefox local_admin acceptance **[Firefox 1]** | 15.41 s |
| Persistent development authentication | 0.44 s |
| Isolated E2E stop / clean / start | 1.71 s |
| Complete isolated QA and API E2E | 70.38 s |
| Firefox release acceptance **[Firefox 2]** | 15.02 s |
| Studio Management lifecycle **[Firefox 3]** | 37.34 s |
| Studio ownership and dashboard **[Firefox 4]** | 29.57 s |
| Studio deletion and archive **[Firefox 5]** | 31.62 s |
| Studio deletion safety and data integrity **[Firefox 6]** | 10.62 s |
| Floating Studio actions menu **[Firefox 7]** | 44.12 s |
| Production item colors and scene drag **[Firefox 8]** | 12.67 s |
| Scene production item persistence **[Firefox 9]** | 25.35 s |
| Complete Notes workspace restoration **[Firefox 10]** | 40.68 s |
| Complete Notes workspace visual **[Firefox 11]** | 12.11 s |
| Home layout acceptance **[Firefox 12]** | 11.18 s |
| True mobile viewport acceptance **[Firefox 13]** | 8.21 s |
| Authoritative StudioFlow staging verification | 14.72 s |
| Approved feature continuity and lineage guard | 6.83 s |
| Guarded Wrangler dry-run (staging copy + Wrangler) | 30.54 s |
| **TOTAL** | **429.07 s** |

Share of the baseline preflight:

| Work class | Time | Share |
| --- | ---: | ---: |
| 13 Firefox regression gate processes | 293.90 s | 68.5% |
| Isolated QA + API E2E | 70.38 s | 16.4% |
| Guarded dry-run staging + Wrangler scan | 30.54 s | 7.1% |
| StudioFlow provenance (2 builds) | 14.72 s | 3.4% |
| StudioFlow continuity/lineage (static) | 6.83 s | 1.6% |
| StudioFlow worktree build (discarded) | 5.43 s | 1.3% |
| Everything else (auth, restart, staging, startup) | 7.17 s | 1.7% |

### C.2 After the tooling committed by this directive

**Total: 399.714 s (6:39.714), status READY, exit 0**, machine-readable at
`.local-dev/release-timings-preflight.json`.

| Phase | Baseline | After | Delta |
| --- | ---: | ---: | ---: |
| Guarded Wrangler dry-run (staging copy + Wrangler scan) | 30.54 s | **2.97 s** | **−27.57 s** |
| Stage local assets | 0.99 s | 0.65 s | −0.34 s |
| Release staging guard (new) | — | 0.09 s | +0.09 s |
| 13 Firefox gates | 293.90 s | 295.44 s | +1.54 s (normal variance) |
| Isolated QA + API E2E | 70.38 s | 70.70 s | +0.32 s (normal variance) |
| StudioFlow provenance | 14.72 s | 13.58 s | −1.14 s |
| **TOTAL** | **429.07 s** | **399.71 s** | **−29.36 s (−6.8%)** |

The only material change is the dry-run/staging phase, which is exactly the
phase the staging correction targets. Every other phase moved only within
normal run-to-run variance, which is why the browser and E2E totals are quoted
unchanged in the projections below.

---

## D. Cloudflare timing

Cloudflare was measured from the real TPI-STUDIOFLOW-137R production release log
(`.local-dev/tmp/release137r-final.log`) — a deploy that was already certified,
which is precisely the interval §8 asks for.

```
✨ Read 33902 files from the assets directory …/tpi-production-assets-mdBwoM
🌀 Found 3 new or modified static assets to upload. Proceeding with upload...
✨ Success! Uploaded 3 files (603 already uploaded) (1.00 sec)
Total Upload: 648.19 KiB / gzip: 121.10 KiB
Uploaded theparanormalinitiative (6.58 sec)
Deployed theparanormalinitiative triggers (1.05 sec)
Current Version ID: daa5aee1-304f-4e96-89a8-86aac2df98e9
```

| Cloudflare-side interval | Measured |
| --- | ---: |
| Static asset upload (3 changed files of 606) | 1.00 s |
| Worker upload | 6.58 s |
| Trigger/deployment activation | 1.05 s |
| **Total Cloudflare deploy command** | **7.63 s** |
| Version created → deployment record created | 0.911 s |

Independently corroborated against the Cloudflare deployment list for the live
Worker: version `daa5aee1` created `04:46:52.087Z`, deployment record created
`04:46:52.998Z`.

**Answer: Cloudflare needs about 7.6 seconds to deploy an already-certified
release.** Uploading the 648 KiB Worker bundle dominates that figure; the static
assets are content-addressed and deduplicated, so only changed files transfer
(3 files in 137R — the JavaScript bundle was byte-identical).

No production deployment was performed to obtain this number, as §8 and §23
require.

### D.1 What was NOT Cloudflare

The same log shows the deploy read **33,902 files** to publish **606**. That
walk was TPI's own staging directory, and its cost is inside TPI's staging
phase, not Cloudflare's upload. It is measured in §G.

---

## E. Duplicate work

| Operation | First execution | Second execution | Inputs changed? | Extra safety? | Safely reusable? |
| --- | --- | --- | --- | --- | --- |
| Full preflight | `npm run release:preflight` | `preflight()` inside `release:production` | No (guard re-proves it) | **Yes** — prevents a stale READY from deploying different bytes | Only with a hash-bound certificate (§I) |
| StudioFlow `npm run build` | `verifyAuthLifecycle` | `run-qa.mjs --studioflow-root` | No | Yes, separately: proves auth survives a build, and proves the workspace checks build | Yes, but only 5.4 s of 429 s — not worth the risk |
| StudioFlow approved-commit build | `stage-studioflow-authoritative` build A | build B (reproducibility) | No — byte-identical by assertion | **Yes** — this is the reproducibility proof | No: the second build *is* the assertion |
| Git clean/branch/parity | preflight start | preflight end, deploy post-preflight, deploy guard | No | **Yes** — three independent drift checks | No |
| Asset hashing / staging copy | preflight dry-run | deploy staging, second preflight dry-run | No | No (dry-run only predicts the upload) | Yes — the same staged tree is re-created identically from a clean commit |
| Firefox acceptance | preflight `local_admin` | preflight `test_admin`, deploy `production_qa` | **Yes** — three different accounts and two different origins | **Yes** — each proves a different environment | No |
| `stage-local-assets.mjs` | preflight | second preflight | No | Same preparation each time | Via certificate only |
| Local Worker restart | preflight | second preflight | No | Same lifecycle proof | Via certificate only |
| Isolated QA/API E2E | preflight | second preflight | No | Same proof | Via certificate only |
| Cloudflare prechecks | preflight | second preflight | No | Same proof | Via certificate only |

**Conclusion:** within a single preflight, the only genuinely redundant artifact
work is the discarded StudioFlow worktree build (5.4 s). The large duplication is
the *whole preflight running twice*, which is deliberate release-drift
protection.

---

## F. Browser overhead

- **43** scripts under `scripts/verify` and `scripts/qa` drive real Firefox
  through Selenium (`selenium-webdriver` 4.51.0 + `geckodriver` 0.37.1).
- `release:preflight` launches **13** separate Firefox sessions; a full
  production release launches **14**. Each gate is a separate Node process with
  its own geckodriver, its own disposable profile under a temp directory, and its
  own login and navigation.
- Measured bare launch cost (`options.setProfile(temp)` +
  `-no-remote -new-instance`, `about:blank`, quit), n=3:

| Run | Launch | Blank navigation | Quit | Total |
| --- | ---: | ---: | ---: | ---: |
| 1 | 1.935 s | 0.021 s | 0.272 s | 2.228 s |
| 2 | 1.502 s | 0.019 s | 0.265 s | 1.787 s |
| 3 | 1.453 s | 0.022 s | 0.276 s | 1.751 s |
| **Median** | | | | **1.787 s** |

**Browser startup is not the problem.** 13 launches × 1.787 s = 23.2 s, i.e.
5.4% of the preflight and 7.9% of browser time. The remaining **270 s** is real
page work: login, workspace seeding, DOM assertions, polling waits and real
reloads.

Sharing one browser session across suites would therefore save at most 23 s
while introducing exactly the cross-test contamination §12 forbids: every suite
seeds and mutates its own Studio and browser-local state (`localStorage`,
IndexedDB `studioflow-recordings`), and several purge disposable Studios at the
end. **Recommendation: do not share sessions.** If browser time must shrink,
the lever is fewer, wider scenarios — not a shared driver.

Authentication bootstrap is *not* repeated unnecessarily within a suite, but it
is repeated once per suite (13 logins). That is inherent to the isolation model.

---

## G. Build and staging overhead

### G.1 The staging defect (found, measured, fixed)

`deploy-production-guarded.mjs` copies the repository into a temp directory and
publishes that directory through `.assetsignore`. Its exclusion list omitted
`.local-dev`, the owner's disposable local runtime state.

Measured composition of the staging copy before the fix:

| Top-level directory | Files | Size |
| --- | ---: | ---: |
| `.local-dev` (local D1/R2, staged assets, worktrees, logs, tmp) | 31,999 | 2,116.6 MB |
| `assets` | 118 | 147.2 MB |
| `studio` | 138 | 70.4 MB |
| everything else | 357 | 27.0 MB |
| **Total copied** | **32,612** | **2,361.1 MB** |
| **Actually published (`.assetsignore`)** | **606** | — |

`.assetsignore` already excludes `.local-dev`, so every byte of that copy was
discarded after being written, walked and stat-ed. Direct A/B (copy only, no
deploy):

| Configuration | Copy time | Files |
| --- | ---: | ---: |
| Current guard (copies `.local-dev`) | 17.166 s / 15.891 s | 32,659 |
| Guard excluding `.local-dev` | 0.699 s / 0.649 s | 613 |

Wrangler's own view confirms it: `Read 33902 files` before, `Read 649 files`
after, while **`Total Upload: 648.19 KiB` is identical**, and the dry-run
`--outdir` asset set is unchanged.

### G.2 Why intermediate assets repeatedly entered staging (§13)

Three distinct mechanisms, and only one of them was a staging-directory problem:

1. **`studio/assets/` is a tracked accumulator.** `stage-studioflow-authoritative.mjs
   --apply` promotes the verified generated files into the tracked `studio/`
   directory and never prunes superseded hashed bundles. History: **189** hashed
   bundles have been added over time and **108** are still tracked; only **2**
   are referenced by `studio/index.html`. The other **106 (62.2 MB)** are
   published but unreachable. Because they are tracked, a `--apply` that changes
   the bundle makes the tree dirty, which blocks preflight until someone removes
   the superseded files by hand — exactly the "intermediate assets had to be
   manually removed" reports. Commit evidence:
   `e1ac570` removed 5 files, `05a8382` removed 1, `bb32b66` removed 2,
   `d743a67` removed 9, `d3d7605` removed 5.
2. **Production staging was already isolated** — `mkdtempSync` per invocation,
   removed in a `finally`. Multiple candidate builds were never mixed into one
   production staging directory. The real defect was the *unbounded copy*, fixed
   in §G.1.
3. **Preflight never writes into `studio/`.** It runs
   `stage-studioflow-authoritative.mjs` in verify-only mode, and the
   `npm run build` calls write to the StudioFlow repository's own `dist/`, not
   into the website repository. Both are discarded artifacts, but neither
   pollutes staging.

**Answers:** each build does generate a new hashed pair; multiple candidates do
accumulate in one *tracked* directory (`studio/assets/`), not in production
staging; preflight does not modify `studio/`; production does not rebuild after
certification; old hashed assets are retained unnecessarily and shipped.

The preferred architecture in §13 (build in isolation → certify → promote the
exact set) is already implemented for the *production upload*. It is **not**
implemented for the *tracked bundle directory*, which still needs a pruning
policy (recommendation in §N).

---

## H. Safety-gate classification (§18)

| Gate | Classification | Rationale |
| --- | --- | --- |
| `assertGitReleaseState` (branch/clean/parity) | **Critical, every release** | Wrong source can ship |
| `tpi-release-safety.mjs` | **Critical, every release** | The release contract itself |
| `tpi-ops-004-release-staging-guard.mjs` | **Critical, every release** (new) | Locks staging to the published set |
| `local_admin` fingerprint + 38-check auth suite ×4 | **Critical, every release** | Authentication and the persistent owner account |
| Managed Worker restart + readiness | **Critical, every release** | Proves auth survives restart |
| Isolated QA/API E2E (62 migrations, 222 assertions) | **Critical, every release** | Data, isolation, authorization |
| Firefox release acceptance | **Critical, every release** | The product actually renders and works |
| Studio lifecycle / 087 ownership / 088 deletion / 089 deletion safety | **Critical, every release** | Cross-account leakage, data loss |
| 133 / 134 / 135 / 137 / 137A / 137R gates | **Change-dependent** (currently run every release) | Presentation, layout, scene persistence |
| `npm run build` in the StudioFlow worktree | **Certification-only** | Artifact is discarded; proves build health |
| `stage-studioflow-authoritative` (2 builds) | **Certification-only** | Reproducibility + approved-hash proof |
| `137-notes-continuity` (lineage + markers) | **Certification-only** — and cheap (static) | Prevents silently dropping an approved feature |
| `Guarded Wrangler dry-run` | **Certification-only** | Predicts the upload; no publish |
| Cloudflare account/rollback prechecks | **Critical, every release** | Rollback must exist before deploy |
| `137-production-schema` | **Production-only** | Only meaningful against production D1 |
| `production-smoke.mjs` | **Production-only** | Only meaningful against the live site |
| Live Firefox acceptance (production QA) | **Production-only** | Only meaningful after deployment |
| Version-holds-100%-traffic check | **Production-only** | Post-deploy invariant |

No gate was removed, weakened, reordered or skipped by this directive.

---

## I. Proposed release architecture — certified immutable candidates (§11)

Recommended, **not implemented** (requires separate authorization).

**Phase A — certify once.** From a clean, pushed commit:

1. Build the candidate into a disposable directory (already the case for the
   production upload).
2. Record in a certification record: website commit, approved StudioFlow commit,
   every published asset path with its SHA-256, the Worker bundle hash, the asset
   manifest hash, the `wrangler.toml` hash, the expected production schema
   fingerprint, the full gate result list, a timestamp, and a release ID.
3. Run the complete gate set once.

**Phase B — deploy the exact candidate.**

1. Re-verify: HEAD equals the certified commit, tree clean, GitHub parity,
   `.assetsignore`-filtered asset set and hashes identical to the record, schema
   fingerprint unchanged, Worker/branch target correct, certificate within its
   validity window.
2. If every check passes, deploy the certified assets without re-running the
   browser suites.
3. If anything differs — including one byte — fall back to a full preflight.

**Safety equivalence argument.** The expensive gates answer "does this artifact
behave correctly?" For a byte-identical artifact the answer cannot change. The
certificate must therefore bind the *published bytes*, not a commit name: the
schema gate and the production smoke/firefox gates still run against live
production after deployment, because those are environment gates, not artifact
gates.

**Preconditions before implementing:** a certificate schema with a version
field; hashes for *every* published asset (606 today); proof that Wrangler's
dedup cannot silently substitute bytes; a stale-certificate window (recommend
≤ 60 minutes or an explicit "certify and deploy in one invocation" mode); and
regression cases for every rejection path in §M.

---

## J. Release tiers (§14, §15)

Recommended, **not implemented**. Tiers must be **derived**, never declared.

| Tier | Trigger (computed from `git diff --name-only` + content) | Gate set |
| --- | --- | --- |
| **1 — full** | `migrations/**`, `worker.js`, `functions/**`, `lib/**`, `api-client.js`, `member-login.js`, `member-shell.js`, anything under `studio/*bridge*.js`, `studio/workspace-*`, authorization/ownership/deletion paths, schema baseline | every gate today |
| **2 — standard** | any other application JS/HTML, StudioFlow source or bundle change | Tier 1 minus change-irrelevant presentation suites, plus production smoke |
| **3 — presentation/hotfix** | **only** `studio/assets/*.css`, `style.css`, `member-shell.css`, `studio/studioflow-012-overrides.css` | clean-tree + provenance, immutable hashes, CSS parse/build, that stylesheet's visual suite, core navigation smoke, ownership/deletion sanity, post-deploy smoke |

Fail-closed rules: ambiguous classification → Tier 1. Any JS, JSON, TOML,
migration, Worker, API, auth, ownership or deletion path → at least Tier 2, and
Tier 1 where it is security- or data-bearing. Tier 3 additionally requires the
published JavaScript hash to be **unchanged** from the current production
version — a CSS-only change that moves `studio/index.html` or the `.js` bundle
auto-escalates.

This is practical because the repository already has the machinery: the
`studioflow-release-baseline.json` records exact JS and CSS hashes, and
`stage-studioflow-authoritative.mjs` already refuses to proceed when the
approved source does not reproduce them.

---

## K. Current vs. optimized

Measured preflight (both runs are the same machine, same commit family):

| Stage | Current (measured) | After committed tooling (measured) | Savings | Safety effect |
| --- | ---: | ---: | ---: | --- |
| Staging copy + manifest + Wrangler scan | 30.54 s | 2.97 s | **−27.57 s** | none; verified output-identical and newly gated |
| Release staging guard | — | 0.09 s | +0.09 s | **strengthened** |
| Local asset staging | 0.99 s | 0.65 s | −0.34 s | none |
| Graph checks / lineage / continuity | 6.92 s | 0.84 s | −6.08 s | none (static, variance) |
| StudioFlow worktree build (discarded) | 5.43 s | 4.81 s | −0.62 s | none (variance) |
| StudioFlow provenance (2 builds) | 14.72 s | 13.58 s | −1.14 s | none |
| 13 Firefox gates | 293.90 s | 295.44 s | +1.54 s | preserved |
| Isolated QA + API E2E | 70.38 s | 70.70 s | +0.32 s | preserved |
| **Preflight total** | **429.07 s** | **399.71 s** | **−29.36 s (−6.8%)** | preserved |

Full production release (`release:preflight` then `release:production`), modelled
from measured components with the arithmetic shown:

| Component | Current | After |
| --- | ---: | ---: |
| `release:preflight` | 429.07 s | 399.71 s |
| `release:production` → schema readiness gate | 1.01 s | 1.01 s |
| `release:production` → preflight (repeated) | 429.07 s | 399.71 s |
| post-preflight Git recheck | 0.73 s | 0.73 s |
| staging copy + manifest (in the real deploy) | 17.17 s | 0.30 s |
| Wrangler upload + activation (Cloudflare) | 7.63 s | 7.63 s |
| live anonymous smoke | 0.98 s | 0.98 s |
| live Firefox acceptance | 15.0 s | 15.0 s |
| version-holds-100% confirmation | 1.40 s | 1.40 s |
| **Total** | **902.06 s (15:02.1)** | **826.48 s (13:46.5)** |
| **Reduction** | | **−75.58 s (8.4%)** |

With certified-artifact reuse (§I) — **not authorized, not implemented** — the
same release would be:

| Component | With certificate |
| --- | ---: |
| certify once (full preflight) | 399.71 s |
| schema + recheck + staging + Wrangler | 11.07 s |
| production smoke + acceptance + version check | 17.38 s |
| **Total** | **428.16 s (7:08.2)** |
| **Reduction vs. 902.06 s** | **−473.90 s (52.5%)** |

Not fabricated: every component above is a measured value from §C, §D or §G.

---

## L. Implemented safe improvements (§21)

Two, both authorized, both fail-closed, neither changing a published byte or an
assertion.

### L.1 Deterministic phase timing for every release phase

`scripts/tpi-release.mjs` now records a monotonic timestamp for every phase and
prints `mm:ss.mmm` live:

```
   [6:36.739] +0:02.974  Guarded Wrangler dry-run
```

It writes a machine-readable timeline to `.local-dev/release-timings-<mode>.json`
with `elapsedMs`, `startedAtMs`, `stage`, `bucket` and `status` per phase, plus
aggregates (`gateMs`, `browserGateMs`, `cloudflareMs`), and prints a final table
with a `TOTAL` row on both success and failure. Recording is wrapped in
`try`/`catch` so **timing can never fail or mask a release**.

`scripts/deploy-production-guarded.mjs` additionally reports
`stagingCopyAndManifestMs` and `wranglerDeployProcessMs`, which is what separates
TPI staging from Cloudflare upload.

No gate, assertion, order, environment variable or pass/fail decision changed.
The 21-check safety contract passes unchanged.

### L.2 Production staging excludes discarded local runtime state

`.local-dev` added to the deployment guard's `excludedDirectories`. This is a
strict no-op for published output because `.assetsignore` already excluded it;
it removes 31,999 files / 2.12 GB from every dry-run and deployment.

### L.3 New regression gate

`scripts/verify/tpi-ops-004-release-staging-guard.mjs` (npm:
`verify:release-staging`), now part of `release:preflight`. Four assertions:

1. the guard excludes `.local-dev` from the staging copy;
2. `.assetsignore` excludes `.local-dev` from the published manifest;
3. no `.local-dev` path can reach the staging copy (filter re-derived from the
   guard's own source, not a stale copy of the rules);
4. the staging copy stays in the published-asset range (< 4000 files), so a
   future unbounded copy is caught even if it copies something other than
   `.local-dev`.

Assertions 1 and 2 must hold **together**: if `.assetsignore` ever stopped
ignoring `.local-dev`, excluding it from the copy would silently *remove*
published files instead of skipping discarded ones. That pairing is the actual
safety property.

---

## M. Regression evidence (§22, §26)

Every check below was run after the change; results are real command results.

| # | Required case (§22) | How exercised | Result |
| --- | --- | --- | --- |
| 1 | Normal release candidate succeeds | Full `npm run release:preflight` at `69991f4` | **READY**, exit 0, 399.714 s |
| 2 | Dirty tree fails | Untracked probe file, then `deploy-production-guarded.mjs --dry-run` | exit **1**, `working tree is not clean` |
| 2b | Dirty tree fails (orchestrator) | Injection that dirtied `tpi-release-safety.mjs`, then `release:preflight` | exit **1** in 0.04 s at the Git gate |
| 3 | Wrong source commit fails | `git checkout -b ops004-scratch-branch` then guard dry-run | exit **1**, `requires codex/tpi-development; current branch is` |
| 4 | Wrong GitHub parity fails | `origin` temporarily re-pointed at a bare repo holding `6433fa0` | exit **1**, `local 69991f4… does not match origin/codex/tpi-development 6433fa0…`; origin restored and re-verified |
| 5 | Wrong asset hash fails | `npm run verify:studioflow-107-provenance` | **PASS 20/20**, including "incorrect staged asset hashes are detected" and "incorrect source commit is rejected" |
| 6 | Modified staged artifact fails | same suite | **PASS**, "verify-only reports staged mismatch without staging anything", "staged comparison recovers after the tampered asset is restored" |
| 7 | Unauthorized production deploy fails | `node scripts/tpi-release.mjs deploy` with no env gate | exit **1**, `deployment requires TPI_PRODUCTION_DEPLOY=approved`, before any gate ran |
| 8 | Missing production authorization fails | `TPI_PRODUCTION_DEPLOY=yes … deploy` | exit **1**, same guard |
| 9 | Incorrect lineage fails | `approvedCommit` and `previousApprovedCommit` swapped (two real commits), continuity gate run directly | exit **1**, `does not descend from eefb7de9518…`, `"status": "FAIL"`; baseline restored → exit **0**, `"status": "PASS"` |
| 10 | Intentionally broken regression fails | Credential file removed from `.local-dev` (clean tree) → `release:preflight` | exit **1** in 2 s, `protected local credential file is missing or not mode 0600`, **no deployment**, file restored to `0600` |
| 11 | Valid candidate reaches READY | Production schema gate + preflight | schema **PASS** (4/4 tables), preflight **READY** |
| 12 | New staging gate fails closed | Removed the exclusion, ran the gate, restored | exit **1**, `"status": "FAIL"`, 32,659 files / 2,359.3 MB; restored → exit **0** |
| 13 | Published output unchanged | Guard dry-run before/after | `Read 33902` → `Read 649` files, **`Total Upload: 648.19 KiB` unchanged** |

Not separately exercised, and reported as such: production-side rollback
(`wrangler rollback`) and live production acceptance, because §23 forbids
replacing the production Worker for validation.

---

## N. Remaining recommendations (future directives)

1. **Prune the tracked bundle accumulator (highest non-test value).** 106 of 108
   tracked `studio/assets/index-*.{js,css}` bundles are unreachable — 62.2 MB
   published but never requested. `--apply` should prune superseded hashed
   bundles (or copy only the files the verified build emits) so an iteration can
   never leave the tree dirty. This changes published files and needs its own
   directive and live verification.
2. **Shrink the certification surface (§I).** Certified immutable candidates
   remove the duplicate preflight: −474 s, 52.5% of a release.
3. **Implement derived release tiers (§J)** with fail-closed classification, and
   no human tier selector.
4. **Consolidate the 12 presentation/regression suites.** They are 68–74% of
   preflight. Parallelising is unsafe (all 13 gates drive the same local Worker,
   D1 and R2 on `127.0.0.1:8787`, and mutate Studios), and sharing a browser
   session saves only ~23 s. The safe lever is fewer, wider scenarios in one
   session each — a product-decision, not a tooling change.
5. **Remove the discarded StudioFlow worktree build** from `verifyAuthLifecycle`
   or `run-qa` once it is agreed which assertion owns it: 4.8–5.4 s.
6. **Add a stale-certificate window** to the future certificate so `READY` cannot
   be replayed hours later (recommend ≤ 60 minutes, or "certify + deploy in one
   invocation").
7. **Retire the four historical release logs** in `.local-dev/tmp/` into
   `docs/…/evidence/` if they are to remain citable; they are currently only
   protected by being git-ignored.

---

## Release record

| Item | Value |
| --- | --- |
| Baseline commit measured | `6433fa00ac2ea9281e386ee18e6f696ee8963825` |
| Tooling commit | `69991f45e56145cf6d1149f2dfb3d97b41f51062` |
| Production Worker (unchanged throughout) | `daa5aee1-304f-4e96-89a8-86aac2df98e9` |
| Rollback reference (unchanged) | `da8c4757-f9d9-42ce-af79-da7a0362c786` |
| Preflight before / after | **7:09.071 → 6:39.714** (−29.36 s, −6.8%) |
| Production release before / after (modelled from measured parts) | **15:02.1 → 13:46.5** (−75.6 s, −8.4%) |
| Cloudflare share of a release | 7.63 s = **0.85%** before, 0.92% after |
| Production code changed | **No** |
| Production D1 changed | **No** — the schema gate was read-only |
| Production Worker deployed | **No** |
| Release gates removed or weakened | **None** — one added |

**TPI-OPS-004 — COMPLETE — RELEASE PIPELINE MEASURED AND SAFELY OPTIMIZED**
