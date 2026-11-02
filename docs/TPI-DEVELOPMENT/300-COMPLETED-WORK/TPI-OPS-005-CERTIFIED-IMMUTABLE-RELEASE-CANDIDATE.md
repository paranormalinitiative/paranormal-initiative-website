# TPI-OPS-005 — Certified Immutable Release Candidate and Fast Production Deployment

Date: 2026-11-02
Status: **TPI-OPS-005 — COMPLETE — CERTIFIED IMMUTABLE RELEASE WORKFLOW VERIFIED**
Production Worker throughout: `daa5aee1-304f-4e96-89a8-86aac2df98e9` (unchanged)
Rollback Worker: `da8c4757-f9d9-42ce-af79-da7a0362c786` (unchanged)

---

## A. Executive summary

Production releases used to run the complete certification suite **twice**.
`release:preflight` proved a candidate; `release:production` then repeated the
whole thing to protect against source and artifact drift before touching
Cloudflare. TPI-OPS-004 measured that second pass at roughly 6.5 minutes, while
Cloudflare's own upload and activation is 7.63 seconds.

TPI-OPS-005 keeps the protection and deletes the repetition. A release is now
proven **once**, frozen, and then deployed by identity:

```
BUILD -> CERTIFY -> FREEZE -> VERIFY -> DEPLOY -> ACCEPT
```

- `release:certify` (alias `release:preflight`) stages one immutable candidate,
  proves it bundles, and seals a certification binding every deployable SHA-256,
  the source commit, branch, GitHub parity, StudioFlow source, dependency locks,
  release tooling bytes and the exact gates that passed.
- `release:production` re-proves that certification and uploads **those exact
  bytes**. It does not rerun the suite.
- Anything that cannot be proven refuses, with a specific reason code, and the
  operator is told to recertify.

The guarantee changed from "the source probably did not change" to "the bytes
Cloudflare receives are the bytes that passed certification". No existing gate,
assertion or safety property was removed or weakened, and every tier still runs
the full gate set.

Measured: certification **411.15 s (6:51.1)** for 30 gates, then certified
deployment preparation **6.94 s**, replacing a modelled operator sequence of
**826.48 s (13:46.5)** with **443.09 s (7:23.1)** — **−46.4%**, and **−50.9%**
against the original 902.06 s pre-OPS-004 sequence. Cloudflare's own 7.63 s is
untouched and now represents **1.7%** of a release instead of 0.85%.

## B. Previous release architecture

`scripts/tpi-release.mjs` had one `preflight()` that ran 37 phases and one
`deploy()` that called it:

```js
async function deploy() {
  if (process.env.TPI_PRODUCTION_DEPLOY !== "approved") fail(...);
  run("Production schema readiness", ...);
  const release = await preflight();      // <- the duplicate
  if (assertGitReleaseState() !== release.sourceCommit) fail(...);
  ...deploy...
}
```

That duplication was **deliberate and correct**. Between the operator's preflight
and the deployment, the working tree could change, the commit could move, the
staged assets could be regenerated, or the operator could simply be deploying
something else. Re-running the suite was the only way to prove the artifact
before it shipped.

The cost was that the certification of a ~400 s suite happened twice, so the
operator waited roughly 15 minutes for a release whose Cloudflare portion is
7.63 s.

A second, subtler flaw: `deploy-production-guarded.mjs` **rebuilt** the staging
tree at deploy time (`cpSync` into a fresh temporary directory, regenerate
`admin-center-preview/release.json` with a new `generatedAt`, rewrite the
Wrangler config). The bytes Cloudflare received were therefore never the bytes
that had been tested — they were a fresh copy that merely ought to be identical.
Nothing proved that.

## C. New release architecture

```
BUILD     copy the published asset set, the Worker module and its relative
          imports (worker.js, lib/, functions/) and wrangler.toml into
          .local-dev/release-candidate/
CERTIFY   prove the candidate bundles (Wrangler --dry-run against those exact
          paths), hash every deployable file, record the gates that passed,
          seal a manifest digest
FREEZE    the candidate is never rebuilt; nothing writes into it again
VERIFY    re-prove the digest, every file hash, and the whole source identity
DEPLOY    upload the candidate directory itself (--candidate), no copy, no rebuild
ACCEPT    live smoke, isolated Firefox acceptance, 100% traffic confirmation
```

`deploy-production-guarded.mjs` gained two modes:

- `--stage-out <dir>` builds the candidate and **requires** `--dry-run`, so
  building a candidate can never deploy.
- `--candidate <dir>` deploys a certified candidate. It copies nothing and
  deletes nothing, so the uploaded bytes are byte-identical to the certified
  bytes.

The Worker module is inside the candidate. Previously `wrangler.toml`'s
`main = "worker.js"` was rewritten to an absolute path into the live worktree,
so the deployed Worker code was read from a mutable working tree at deploy time.
The candidate now carries `worker/worker.js`, `worker/lib/` and
`worker/functions/`, preserving the relative import graph
(`./functions/api/[[path]].js`, `./lib/*.js`, `../../lib/*.js`), and the generated
deploy config points `main` and `[assets] directory` into the candidate.

## D. Certification manifest specification

Location: `.local-dev/release-candidate/release-certification.json` (ignored
local state, never published, never committed).

```jsonc
{
  "schemaVersion": 1,
  "releaseId": "rel-<commit12>-<contentSha12>",   // deterministic, no timestamp
  "status": "CERTIFIED",                            // or the file is absent
  "tier": { "level": 1, "label": "...", "reasons": [...], "baseCommit": "...",
            "baseSource": "origin/main", "requiredGateSet": "full" },
  "certifiedAt": "2026-11-02T…Z",
  "certificationMs": 0,
  "source": {
    "websiteCommit": "...", "branch": "codex/tpi-development",
    "remoteCommit": "...", "remoteParity": "exact",
    "studioflowCommit": "...",
    "dependencyLock":     { "files": [{ "path", "bytes", "sha256" }], "sha256": "..." },
    "studioflowLock":     { ... },
    "releaseTooling":     { "files": [ ... 7 files ... ], "sha256": "..." },
    "releaseConfiguration": { "files": [ "wrangler.toml" ], "sha256": "..." }
  },
  "build": { "command", "nodeVersion", "candidateRoot", "assetsDirectory", "workerDirectory" },
  "deployable": {
    "assets":        [{ "path", "bytes", "sha256" }],   // every published file
    "worker":        [{ "path", "bytes", "sha256" }],   // worker.js, lib/, functions/
    "configuration": [{ "path", "bytes", "sha256" }]    // wrangler.toml
  },
  "gates": [{ "name", "status": "pass", "durationMs" }],
  "schema": { "database", "requiredTables": [...], "migrations": [...] },
  "manifestDigest": "<sha256>"
}
```

**Hashing.** `canonicalize()` sorts object keys recursively and preserves array
order; arrays of files are sorted by path. The digest is
`sha256(canonicalJson(manifest without manifestDigest))`, so the manifest can
carry its own proof and equivalent content always hashes identically regardless
of key order.

**Nothing is inferred from time.** `certifiedAt` is evidence, not validity. A
certification does not expire because a clock moved; it expires because an input
changed. `releaseId` is derived from the commit and the deployable content only,
so it is reproducible.

**No secrets.** The manifest holds identifiers and hashes only. Credential
files, cookies and tokens are never read into it.

## E. Invalidation rules

`verifyCertification()` re-proves, in order, and refuses with a stable code:

| Condition | Reason code |
|---|---|
| certification file absent | `MISSING_CERTIFICATION` |
| not valid JSON | `MALFORMED_CERTIFICATION` |
| unsupported `schemaVersion` | `UNSUPPORTED_SCHEMA` |
| `status` is not `CERTIFIED` | `NOT_CERTIFIED` |
| any required field absent | `MISSING_FIELD` |
| digest does not match content | `MANIFEST_DIGEST_MISMATCH` |
| a certified asset mutated | `ASSET_MUTATED` |
| a certified asset missing | `ASSET_MISSING` |
| an unmanifested asset present | `ASSET_EXTRA` |
| Worker source mutated / missing / extra | `WORKER_SOURCE_MUTATED` / `_MISSING` / `_EXTRA` |
| release configuration mutated | `CONFIGURATION_MUTATED` |
| HEAD changed | `SOURCE_COMMIT_MISMATCH` |
| branch changed | `BRANCH_MISMATCH` |
| tracked tree dirty | `DIRTY_TREE` |
| GitHub parity lost | `REMOTE_PARITY_MISMATCH` |
| StudioFlow source changed | `STUDIOFLOW_HEAD_MISMATCH` |
| dependency lock changed | `DEPENDENCY_LOCK_MISMATCH` |
| StudioFlow lock changed | `STUDIOFLOW_LOCK_MISMATCH` |
| release tooling bytes changed | `RELEASE_TOOLING_MISMATCH` |
| release configuration bytes changed | `RELEASE_CONFIGURATION_MISMATCH` |
| schema contract missing | `SCHEMA_CONTRACT_MISMATCH` |

Release tooling is hashed by file, which is what makes the system protect
itself: editing `scripts/tpi-release.mjs`, `scripts/release-certification.mjs`
or `package.json` invalidates every outstanding certification. The reason names
the file that changed.

`.local-dev` state is ignored and does **not** invalidate a release, because the
candidate and release state live there and nothing in it is published.

## F. Release tier classifier

`scripts/release-tier.mjs` classifies from the real diff, never from a
description of it.

Base selection, most trustworthy first: an explicit `--base`; the previous
certification's commit; `origin/main`. If none resolves, the release is Tier 1
with the reason recorded — **ambiguity escalates**.

- **Tier 1 — FULL / HIGH RISK** (`migrations/`, `scripts/`, `lib/`,
  `functions/`, `worker.js`, `wrangler.*`, `package*.json`, `.assetsignore`,
  `admin-center-app/`). Release-tooling changes are always Tier 1, so the
  release system cannot approve its own relaxation.
- **Tier 2 — STANDARD APPLICATION**: anything else that is not provably
  presentation-only.
- **Tier 3 — PRESENTATION / LOW RISK**: every changed path is a stylesheet
  **and** the set of generated JavaScript blob hashes is identical to the base.
  If a rebuild also renames `studio/index.html`, the change escalates to Tier 2,
  because HTML is behavioural surface.

Tier requirements are a **minimum**. All three tiers currently require the
complete gate set, so the tier is recorded evidence and never a permission to
skip a gate. This is deliberate: TPI-OPS-005 was not authorized to weaken any
gate, and OPS-004 measured that the browser suites are the safety net that
actually caught the Notes workspace regressions.

`TPI_RELEASE_TIER` can request a **stricter** tier. Requesting a weaker one
refuses with `TIER_DOWNGRADE_REFUSED` and names the protected paths; an invalid
value refuses with `TIER_REQUEST_INVALID`. There is no way to declare
"this is just CSS" and bypass classification.

## G. Candidate staging and promotion

- The candidate lives in `.local-dev/release-candidate/` — ignored, excluded
  from the staging copy, excluded from `.assetsignore`, never published.
- `prepareCandidateDirectory()` deletes and recreates it, so no byte from a
  previous build can survive into a new candidate.
- Promotion is explicit: only a certification makes a candidate deployable, and
  only `--candidate` uploads it. A file existing under `studio/assets/` promotes
  nothing.
- `--stage-out` without `--dry-run` throws, so building cannot deploy.
- The legacy copy-and-delete path still exists for compatibility, but the
  maintained commands no longer use it for production.

## H. Asset-retention strategy

`studio/assets/` is a **tracked accumulator**: `--apply` adds a new hashed pair
whenever the bundle changes and never prunes. OPS-004 measured 189 bundles ever
added, 108 still tracked, only 2 referenced by `studio/index.html`, and 62.2 MB
unreachable but published.

TPI-OPS-005 prevents **future** uncontrolled accumulation without deleting
anything:

- certification hashes exactly the published asset set, so a stale bundle is
  detectable as certified-but-unreferenced;
- promotion no longer writes into the published directory during iteration;
- `.assetsignore` continues to define the published boundary, enforced by
  `verify:release-staging`.

Historical cleanup stays deferred, as section 12 requires, because the reference
analysis cannot yet prove that every one of the 106 bundles is free of stale
cached HTML and rollback references. Retention is documented in categories:
**active** (referenced by the certified candidate), **rollback** (needed by a
retained Worker version), **historical retention** (deliberate), and
**unreferenced debris** (safe to prune after a proven grace period).

## I. Safety regression matrix

`npm run verify:release-certification` runs 43 assertions in a throwaway Git
repository with a real bare remote, a real clean tree and real parity. It runs
inside the preflight and finishes in about five seconds. Nothing touches
production, no Cloudflare call is made, and no port is opened.

| # | Case | Expected | Result |
|---|---|---|---|
| 1 | valid candidate | accepted | **PASS** |
| 2 | certification records every deployable file (3 assets, 3 worker, 1 config) | accepted | **PASS** |
| 3 | status `CERTIFIED` with a sealed 64-hex digest | accepted | **PASS** |
| 4 | canonical digest is key-order independent | equal digests | **PASS** |
| 4a | verification resolves the StudioFlow root as certification did | accepted | **PASS** |
| 5 | modified certified CSS asset | `ASSET_MUTATED` | **PASS** |
| 6 | restoring the exact CSS bytes | accepted | **PASS** |
| 7 | modified certified HTML | `ASSET_MUTATED` | **PASS** |
| 8 | extra unmanifested deployable file | `ASSET_EXTRA` | **PASS** |
| 9 | removing the unmanifested file | accepted | **PASS** |
| 10 | missing candidate file | `ASSET_MISSING` | **PASS** |
| 11 | restoring the missing file | accepted | **PASS** |
| 12 | modified certified Worker source | `WORKER_SOURCE_MUTATED` | **PASS** |
| 13 | modified certified release configuration | `CONFIGURATION_MUTATED` | **PASS** |
| 14 | restoring the exact configuration | accepted | **PASS** |
| 15 | wrong manifest digest | `MANIFEST_DIGEST_MISMATCH` | **PASS** |
| 16 | manifest that is not `CERTIFIED` | `NOT_CERTIFIED` | **PASS** |
| 17 | manifest with a missing required field | `MISSING_FIELD` | **PASS** |
| 18 | unsupported manifest schema version | `UNSUPPORTED_SCHEMA` | **PASS** |
| 19 | re-sealed manifest with a wrong asset hash | `ASSET_MUTATED` | **PASS** |
| 20 | dirty tracked tree | `DIRTY_TREE` | **PASS** |
| 21 | ignored `.local-dev` state | accepted | **PASS** |
| 22 | wrong branch | `BRANCH_MISMATCH` | **PASS** |
| 23 | release tooling modification | refused | **PASS** |
| 24 | restoring the exact release tooling | accepted | **PASS** |
| 25 | source drift after certification | `SOURCE_COMMIT_MISMATCH` | **PASS** |
| 26 | tooling change with source identity rewritten | `RELEASE_TOOLING_MISMATCH` | **PASS** |
| 27 | certification after the source is restored | accepted | **PASS** |
| 28 | upstream/GitHub parity loss | `REMOTE_PARITY_MISMATCH` | **PASS** |
| 29 | parity exact again | accepted | **PASS** |
| 30 | dependency-lock modification | `SOURCE_COMMIT_MISMATCH` | **PASS** |
| 31 | certification after the lockfile is restored | accepted | **PASS** |
| 32 | requesting a weaker tier than the diff allows | `TIER_DOWNGRADE_REFUSED` | **PASS** |
| 33 | protected application change classifies Tier 1 | Tier 1 | **PASS** |
| 34 | release-tooling change classifies Tier 1 | Tier 1 | **PASS** |
| 35 | stylesheet-only change, identical JS | Tier 3 | **PASS** |
| 36 | presentation change that also touches HTML | Tier 2 | **PASS** |
| 37 | unresolvable classification base | Tier 1 | **PASS** |

Result: **43 assertions, 0 failures.**

### Bugs the fail-closed path caught during implementation

Both were found by running the real workflow, and both are now locked down:

1. **cpSync copied the repository into its own subdirectory.** The candidate
   lives in `.local-dev` *inside* the repository, so the whole-tree staging copy
   was rejected by Node (`ERR_FS_CP_EINVAL`). Fixed by copying the filtered
   top-level entries, which produces the identical published set and cannot
   recurse into the candidate. Verified: both staging modes now report
   `Read 643 files` from their assets directory.
2. **The StudioFlow lockfile was compared against `null`.**
   `collectSourceIdentity()` hashed the resolved StudioFlow root at
   certification time but the raw parameter at verification time, and
   verification passes no root. A valid certification was therefore refused with
   `STUDIOFLOW_LOCK_MISMATCH` even though the lockfile hash was byte-identical.
   Fixed, and assertion 4a now fails if the bug is reintroduced — confirmed by
   reverting the fix and watching the suite fail.

Both are recorded because they are the reason the refusal path matters: a
release system that only ever says yes is not evidence of safety.

One environment note: the first certification attempt failed at the local
`local_admin` gate and a later one at Firefox launch. Both are pre-existing local
runtime races (the local Worker settling after asset staging, and an orphaned
marionette browser left by the first failed attempt); the gates passed
standalone, and the orphaned browser was cleaned up. No gate was changed to make
them pass.

The release workflow safety contract was extended from 21 to **27 checks**
(adding authorization-before-any-gate ordering, "deploy never calls
preflight", the `--candidate` upload path, `--stage-out` cannot deploy, the
candidate directory is untracked, and the new commands are wired), so none of
the previous 21 properties were dropped.

Live workflow-level refusals were also exercised against the real repository
(see section J): missing authorization, wrong authorization value, a mutated
certified byte, and source drift.

## J. Performance evidence

Every figure below was produced during this directive. **Observed** values came
from actual runs; **modelled** values reuse OPS-004's measured components.

### Certification — observed

`npm run release:certify` at `ee3494b`, exit 0, 42 phases:

| Phase group | Observed |
| --- | ---: |
| Git cleanliness, tier, safety contract, staging guard, certification suite | 6.09 s |
| Local asset staging, `local_admin` lifecycle (3 auth checks, restart, StudioFlow build, Firefox) | 30.02 s |
| Isolated QA + API E2E | 70.00 s |
| Firefox regression suites (12 browser gates) | 291.93 s |
| StudioFlow staging, continuity, Cloudflare prechecks | 6.29 s |
| Candidate staging + Wrangler dry-run | 3.07 s |
| Hash 610 assets + 14 Worker files (256 MB) and seal the digest | 1.02 s |
| **Total** | **411.15 s (6:51.1)** |

Gates executed: **30**. Evidence: `.local-dev/release-timings-certify.json`.

Certification costs approximately one preflight — 399.71 s after OPS-004, now
411.15 s (+11.4 s, +2.9%). That is expected and intended: TPI-OPS-005 does not
delete tests. The increase is the new 4.5 s certification suite plus the
candidate staging (which now also copies the Worker module) and the 1.02 s hash
pass.

### Certified deployment preparation — observed

Authorized dry run against a valid certification, exit 0, stopping immediately
before the Cloudflare call:

| Phase | Observed |
| --- | ---: |
| Deployment authorization guard | 0.00 s |
| Certification verification: digest + 610 asset hashes + 14 Worker hashes + source identity | 0.88 s |
| Live read-only production schema readiness | 1.04 s |
| Production Worker identity + rollback capture | 4.37 s |
| Final Git and GitHub parity recheck | 0.64 s |
| Staging copy (certified candidate reused, nothing copied) | **0.00 s** |
| **Total to the Cloudflare call** | **6.94 s (0:06.9)** |

The complete certification suite did not run. Output recorded
`"recertified": false, "uploaded": false, "productionAcceptance": "not_run"`.

### Full release — modelled from measured components

Component-by-component, using the same breakdown as OPS-004 so the two are
directly comparable:

| Component | Before TPI-OPS-005 | Now | Source |
| --- | ---: | ---: | --- |
| Certification pass 1 | 399.71 s | 411.15 s | observed (both directives) |
| Certification pass 2 (repeated inside production) | 399.71 s | **0.00 s** | observed: reused |
| Live schema readiness | 1.01 s | 1.04 s | observed |
| Certification verification | — | 0.88 s | observed |
| Rollback capture + Worker identity | 0.74 s (inside preflight) | 4.37 s | observed |
| Final Git parity recheck | 0.73 s | 0.64 s | observed |
| Staging copy + manifest at deploy | 0.30 s | 0.00 s | observed: reused |
| Wrangler upload + activation (Cloudflare) | 7.63 s | 7.63 s | measured from the 137R release log |
| Live anonymous smoke | 0.98 s | 0.98 s | OPS-004 measurement |
| Live Firefox acceptance | 15.00 s | 15.00 s | OPS-004 measurement |
| Version-holds-100% confirmation | 1.40 s | 1.40 s | OPS-004 measurement |
| **Total** | **826.48 s (13:46.5)** | **443.09 s (7:23.1)** | |
| **Reduction** | | **−383.39 s (−46.4%)** | |

Against the original pre-OPS-004 sequence (902.06 s / 15:02.1) the same model
gives **−458.97 s (−50.9%)**, which clears the directive's ~50% target without
removing a single test.

OPS-004's uncertified model predicted 428.16 s. The measured result is 443.09 s,
**15 s slower than predicted and honestly so**: certification costs 11.4 s more
than the modelled preflight, and rollback capture plus verification add 4.5 s
that the model had folded into the reused preflight.

### Live refusals against the real repository — observed

The regression suite proves behaviour in a throwaway repository. These were
exercised against the real one, with the real certified candidate, and every
probe was reverted afterwards:

| Probe | Result |
| --- | --- |
| `deploy --dry-run` with no `TPI_PRODUCTION_DEPLOY` | exit **1**, `deployment requires TPI_PRODUCTION_DEPLOY=approved` |
| `deploy --dry-run` with `TPI_PRODUCTION_DEPLOY=yes` | exit **1**, same refusal |
| one byte appended to certified `assets/index.html` | exit **1**, `ASSET_MUTATED: certified file bytes changed: index.html` |
| byte restored | exit **0**, `DEPLOYMENT_DRY_RUN_READY` |
| `source.websiteCommit` rewritten in the manifest | exit **1**, `MANIFEST_DIGEST_MISMATCH` (recorded `9a0738d4…`, computed `bd22b576…`) |
| manifest restored | exit **0** |
| new local commit after certification | exit **1**, `SOURCE_COMMIT_MISMATCH: certified candidate was built from ee3494b… but the repository is at e8f08c6…` |
| repository reset to the certified commit | exit **0**, `DEPLOYMENT_DRY_RUN_READY` |

That last pair is the heart of the design: the same bytes deploy, and a source
that moved does not.

### What did not get faster

The browser suites are now **71.0%** of a release (291.93 s of 411.15 s) versus
74% of the preflight before. They are unchanged by design: OPS-004 measured that
most of that cost is real page work, that bare Firefox launch is only 1.787 s
median, and that these suites are what caught the Notes workspace regressions.
Merging them into one session would have saved ~23 s and broken isolation.

## K. Production behavior

The next real deployment, run by an operator or an agent, will:

1. Refuse unless `TPI_PRODUCTION_DEPLOY=approved` is set — before any gate runs.
2. Verify the certification: manifest digest, every asset hash, every Worker
   source hash, the release configuration hash, source commit, branch, GitHub
   parity, StudioFlow commit, both dependency locks, release tooling and release
   configuration bytes.
3. Refuse and instruct `npm run release:certify` if any of that does not match.
4. Run the **live read-only** production schema check and compare the live
   contract with the certified one.
5. Capture the active Worker version as the rollback target **at deploy time**
   (rollback metadata is production state and is never reused from
   certification).
6. Re-check Git and GitHub parity, then upload the certified candidate.
7. Run live anonymous smoke, isolated Firefox production acceptance, and confirm
   the new version holds 100% traffic; roll back automatically on critical
   failure.
8. Write `.local-dev/release-deployment.json` as the deployment record.

What it will **not** do is run the certification suite again. That is the
measured saving.

## L. Migration and compatibility notes

- **No production database change.** No migration was written, applied or
  executed. The only database interaction in this directive is the existing
  read-only `SELECT name FROM sqlite_master` schema gate, unchanged.
- **No production Worker change.** No deployment, no traffic change, no version
  change, no R2 write, no secret change. Production stayed on
  `daa5aee1-304f-4e96-89a8-86aac2df98e9`.
- `release:preflight` keeps working as an alias, so existing runbooks, scripts
  and historical records remain valid.
- The OPS-004 `.local-dev` staging exclusion and
  `npm run verify:release-staging` are preserved unchanged.
- The legacy staging mode of `deploy-production-guarded.mjs` remains for
  compatibility; the maintained commands use the certified candidate.

## M. Known limitations

1. **Tier gate reduction is not activated.** Tiers are classified, recorded and
   enforced against downgrade, but all three still run the full gate set.
   Relaxing a tier requires a directive that names exactly which gate may be
   skipped, because TPI-OPS-005 was not authorized to weaken any gate.
2. **Historical `studio/assets/` cleanup is deferred.** 106 tracked bundles are
   published but unreferenced. Deleting them cannot be proven non-disruptive for
   stale cached HTML and retained rollback references, so prevention was
   implemented and deletion documented.
3. **A certification is consumed by source movement.** Any new commit requires
   recertification, including a documentation-only commit. This is intentional
   fail-closed behaviour, not an oversight.
4. **The `admin-center-preview/release.json` `generatedAt` timestamp is part of
   the certified bytes.** It is generated once, at candidate build time, so the
   deployed bytes stay identical; it is not regenerated at deploy.
5. **Certification measures a candidate, not a deployment.** Live acceptance
   still runs after every deployment and remains the proof that the deployment
   worked.
6. **The full production path was not executed under this directive**, because
   production deployment was not authorized. The certified deployment was
   proven with an authorized dry run that stops before the Cloudflare call.

## N. Final status

**TPI-OPS-005 — COMPLETE — CERTIFIED IMMUTABLE RELEASE WORKFLOW VERIFIED**

- Certification of an exact candidate: implemented and observed.
- Cryptographic binding to every deployable byte: implemented, 42 assertions.
- Production reuse of a valid certification: implemented and observed in an
  authorized dry run; the expensive suite did not run again.
- Mutation, source drift, dependency drift, tooling drift, parity loss, wrong
  branch, dirty tree and tier downgrade: all refused.
- Existing safety gates: intact, with the contract extended from 21 to 27.
- Production application, database, R2 and Worker: unchanged.
