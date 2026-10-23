# TPI Local Development to Production Runbook

Status: MANDATORY / MAINTAINED

This is the exact release procedure for The Paranormal Initiative. Every agent
must follow it. Do not improvise a second deployment path, deploy a dirty tree,
manually copy an old bundle, or skip Firefox Developer Edition acceptance.

## Fixed identities

- Canonical repository:
  `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Release branch: `codex/tpi-development`
- GitHub remote: `origin`
- Local site: `http://127.0.0.1:8787/`
- Local login: `http://127.0.0.1:8787/member-login.html`
- Production site: `https://paranormalinitiative.com/`
- Production StudioFlow: `https://paranormalinitiative.com/studio/`
- Production Worker: `theparanormalinitiative`
- Cloudflare account: `221ea5479876fd303ddc87002b9e892d`
- Production D1: `tpi_contributor_portal`
- Production R2: `tpi-contributor-media`
- Default acceptance browser: Firefox Developer Edition

For StudioFlow source ownership and the distinction between source commits,
website commits, GitHub pushes, development previews, and production deploys,
also follow `TPI-STUDIOFLOW-SOURCE-TO-LIVE-WORKFLOW.md`.

Use `127.0.0.1` consistently for authenticated local work. Do not alternate
between it and `localhost` while diagnosing cookies.

## Exact copy-and-paste release sequence

This is the single maintained local-development-to-production procedure. An
agent must run it from the canonical checkout in this order; do not substitute
an improvised Wrangler command or deploy a generated folder directly.

```sh
cd /Users/toddknipple/Documents/GitHub/paranormal-initiative-website

# 1. Prove the intended clean Git source is checked out and pushed.
git branch --show-current
git status --short --untracked-files=all
git rev-parse HEAD
git fetch origin codex/tpi-development
git rev-list --left-right --count HEAD...origin/codex/tpi-development

# 2. Prove permanent local development authentication survives a managed
#    Worker restart and a StudioFlow source build.
npm run verify:local-auth-lifecycle

# 3. Run the complete clean-tree, GitHub-parity, isolated D1/R2, 225-API-E2E,
#    Firefox, reproducible-build, Cloudflare, rollback, and dry-run gates.
npm run release:preflight

# 4. Only after preflight prints READY, deploy that exact commit. This repeats
#    every gate, records the active version, deploys, verifies live, and rolls
#    back automatically if critical acceptance fails.
TPI_PRODUCTION_DEPLOY=approved npm run release:production

# 5. After DEPLOYED_AND_VERIFIED, prove the tree and GitHub remain identical.
git status --short --untracked-files=all
git rev-parse HEAD
git rev-parse origin/codex/tpi-development
```

Expected Git requirements are: branch `codex/tpi-development`, empty status,
divergence `0 0`, and matching local/remote hashes. `release:preflight` must
finish with `READY`. `release:production` must finish with
`DEPLOYED_AND_VERIFIED`; any other result is not a completed release.

## Latest verified release record

The latest successful application deployment used website source commit
`cb9746411398df16282c305101cb0b41425bcd39` and authoritative StudioFlow source
commit `ce7c389d23db65bd5ebb92597695d9854d21c7ab` (unchanged; the Addendum A
release is bridge-only). It deployed Worker version
`21ea05f7-588d-4b5a-b039-c6063f7fd248` on 2026-10-23. The immediate rollback
reference is `210f4610-ff8a-4192-a944-4668892dd669`. The detailed record is
`300-COMPLETED-WORK/2026-10-23-TPI-STUDIOFLOW-028-SCENE-MEDIA-SHORTCUT-REPAIR.md`
(including its Addendum A section preserving Sol's After Intro Background
Music workflow).

That release passed anonymous live smoke 10/10, isolated Firefox Developer
Edition acceptance 60/60, the TPI-STUDIOFLOW-028 scene playback,
cross-scene independence, and Addendum-A handoff checks 33/33, local
authentication lifecycle 38/38, reproducible StudioFlow integration, and the
guarded Wrangler dry-run. It made no D1 migration, R2 mutation, Crossroads
mutation, or owner-browser storage change. The owner production tab was used
only for non-destructive final confirmation. Every future release must execute
the commands above again.

The production command opens a new isolated Firefox Developer Edition profile
and authenticates with the dedicated synthetic `qa-studioflow-*` member account
stored in `.local-dev/qa-studioflow-prod.json` (mode `0600`). The password is
never printed, committed, or placed in this document. The release runner must
set `TPI_FIREFOX_PRODUCTION_QA=approved`, use account key `production_qa`, and
pass the credential-file path explicitly. Production acceptance must reject
`local_admin`, local fixture accounts, and owner accounts. The temporary profile
is disposable; the owner's existing Firefox tabs and browser storage are never
opened, reused, or cleared. If the synthetic credential file is missing or the
username does not begin with `qa-studioflow-`, acceptance stops before launch.

The account was provisioned through the double-gated
`scripts/qa/tpi-ops-033-qa-accounts.mjs` tool as a regular member with the
`creator_studio_lifetime` entitlement. It is used only for authenticated
production smoke/acceptance. It does not grant administration and must not be
elevated. If the account must be recreated or revoked, use that tool's explicit
production-D1 safety gates; never edit production rows ad hoc.

The Cloudflare Workers Paid plan is active as of 2026-10-22. That removes the
Free-plan daily request cutoff, but it does not authorize wasteful polling.
The request-budget regression remains mandatory, and StudioFlow room polling
must remain non-overlapping and visibility-aware.

The maintained preflight stages `.local-dev/assets` before restarting the local
Worker. Do not reverse this order: replacing the watched asset directory after
Wrangler starts can leave HTML and the local asset manifest out of sync, which
renders a blank StudioFlow shell. If an isolated Firefox run still receives a
completely empty document during a transient local reload, the maintained
runner retries that one navigation once. It does not retry a rendered
application error and does not weaken any functional assertion. If the second
navigation fails, the release stops before deployment. Confirm
`npm run dev:local:status`, repair the local runtime, and rerun the complete
preflight rather than bypassing Firefox.

## 1. Enter and inspect the repository

```sh
cd /Users/toddknipple/Documents/GitHub/paranormal-initiative-website
git branch --show-current
git status --short
git rev-parse HEAD
git fetch origin codex/tpi-development
git rev-list --left-right --count HEAD...origin/codex/tpi-development
```

The branch must be `codex/tpi-development`. Before new work, the status should
be empty and the divergence should be `0 0`. If the local branch is only
behind and the tree is clean, update with:

```sh
git pull --ff-only origin codex/tpi-development
```

Never run `git reset --hard`, `git clean -fd`, force-push, or delete unknown
files to manufacture a clean status.

## 2. Resolve every existing working-tree file

If `git status --short` is not empty, inspect every path before development:

```sh
git diff --check
git diff
git diff --cached
git status --short --untracked-files=all
```

Every path receives one outcome:

1. Required application work: verify it and include it in a focused commit.
2. Required test, tooling, or documentation: verify it and commit it separately
   when practical.
3. Known generated cache/build output: remove only the exact regenerable path.
4. Unknown or unique material: preserve it outside the repository, verify the
   copy, then remove the repository copy only when its disposition is proven.

Do not stage everything blindly. Do not leave old modifications, untracked
files, `.DS_Store`, obsolete bundles, temporary reports, or generated caches in
the active tree. Do not begin release preflight until `git status --short` is
empty after the approved commits.

## 3. Verify the permanent local administrator

```sh
npm run dev:local:status
node scripts/qa/tpi-ops-009-authentication.mjs
```

The authentication suite must pass 38 checks. It proves that the persistent
`local_admin` D1 row matches the protected credential store and that login,
sessions, Admin Panel, StudioFlow, wrong-password rejection, and logout work.

The owner can privately view the established local-only credentials in an
interactive Terminal:

```sh
npm run local:credentials
# Equivalent direct command:
zsh scripts/show-local-admin-credentials.sh
```

Never paste that password into chat, logs, screenshots, commits, or the
production website.

If the protected credential and D1 row drift, restore the row without changing
the password:

```sh
TPI_LOCAL_OWNER_CONTROL=1 node scripts/reset-local-master-admin.mjs --restore-protected-local-admin
```

If the owner wants a new private local password, run this only in the owner's
interactive Terminal:

```sh
TPI_LOCAL_OWNER_CONTROL=1 node scripts/reset-local-master-admin.mjs --target-username local_admin
```

Then rerun the 38-check authentication suite. Automated E2E must never use
`.local-dev/state`; it uses disposable port-8789 D1/R2 state.

## 4. Develop and verify locally

Make only the changes required by the current directive. Preserve unrelated
systems and use disposable Studios and synthetic media.

If maintained local assets changed, restage them:

```sh
node scripts/stage-local-assets.mjs
```

If authoritative StudioFlow React source changed, build and integrate it with:

```sh
node scripts/stage-studioflow-authoritative.mjs --apply
```

This command preserves the maintained TPI bridge layer. Never edit a generated
StudioFlow JavaScript or CSS bundle manually and never put different bytes
under an unchanged hashed filename.

Open local development in Firefox Developer Edition and verify the actual
workflow. Do not use or modify Crossroads for destructive testing.

Run focused tests for the changed feature, followed by:

```sh
npm run verify:release-safety
npm run verify:local-auth-lifecycle
```

The lifecycle check verifies `local_admin` before and after a managed Worker
restart, after a StudioFlow build, and in an isolated Firefox Developer Edition
profile.

## 5. Review, stage, commit, and push

```sh
git diff --check
git status --short --untracked-files=all
git diff
```

Stage exact files, not the entire repository without review:

```sh
git add path/to/approved-file another/approved-file
git diff --cached --check
git diff --cached
git commit -m "type(scope): describe the verified change"
git push origin codex/tpi-development
```

Then prove local/GitHub parity and cleanliness:

```sh
git status --short
git rev-parse HEAD
git rev-parse origin/codex/tpi-development
```

Status must be empty and both commit hashes must match exactly.

## 6. Run the complete release preflight

```sh
npm run release:preflight
```

Do not reproduce its steps with ad hoc commands. The maintained preflight
enforces:

- correct branch, clean tree, and exact GitHub parity;
- persistent `local_admin` lifecycle verification;
- isolated disposable D1/R2 E2E;
- complete QA and API E2E;
- StudioFlow build and reproducible asset integration;
- isolated Firefox Developer Edition acceptance;
- Cloudflare account, Worker, binding, and rollback checks;
- current production version capture;
- guarded Wrangler dry-run;
- a final Git cleanliness/parity check after staging and verification.

The final output must be `READY`. If any gate fails, repair the cause, commit
and push the repair, and rerun preflight. Do not weaken or skip the gate.

## 7. Deploy every completed application directive

After preflight reports `READY`, deploy the exact verified commit:

```sh
TPI_PRODUCTION_DEPLOY=approved npm run release:production
```

The command repeats preflight, records the current Worker as rollback target,
deploys through the guarded Wrangler package, runs live public smoke, opens an
isolated Firefox Developer Edition profile for authenticated production
acceptance, verifies the new Worker at 100% traffic, and automatically rolls
back on a critical acceptance failure.

The production acceptance runner authenticates automatically inside the isolated
disposable profile with the approved synthetic QA account. Manual sign-in is
not part of the maintained production release path. The synthetic account is
loaded only from the protected credential file; local fixture and owner
accounts are rejected. The disposable profile does not share cookies or
storage with any existing Firefox window, and the owner's tabs are never
closed or repurposed.

The production acceptance runner performs authenticated checks after login. It
must never poll a production API while waiting for manual input. StudioFlow
production-room polling must remain non-overlapping and visibility-aware so an
inactive browser tab cannot consume the Worker request allowance.

Application directives are not complete until this guarded deployment and live
acceptance pass. Documentation-only or local-tooling-only commits are pushed to
GitHub but do not require a no-op Worker deployment because those files are
excluded from the production package.

Never run production D1 migrations, delete D1 rows, delete R2 objects, clear
browser storage, or modify Crossroads as an incidental part of deployment.

## 8. Record the release and leave no leftovers

Record the exact source commit, previous Worker version, new Worker version,
deployment time, live Firefox results, rollback status, and any genuinely
unverified behavior in the applicable directive/status records.

Commit and push those records, then finish with:

```sh
git status --short
git rev-parse HEAD
git rev-parse origin/codex/tpi-development
```

The final tree must be empty and local/remote hashes must match. A directive is
not complete while unexplained files, unpushed commits, failed gates, or an
unverified production deployment remain.

## Never substitute these shortcuts

- Never deploy directly with an improvised `wrangler deploy` command.
- Never deploy the dirty working tree.
- Never use an older branch because it looks cleaner.
- Never edit generated hashed bundles manually.
- Never use production data as test fixtures.
- Never suppress a failing test, save error, or deployment guard.
- Never report a local pass as a production pass.
- Never leave an unexplained modified or untracked file for the next agent.
