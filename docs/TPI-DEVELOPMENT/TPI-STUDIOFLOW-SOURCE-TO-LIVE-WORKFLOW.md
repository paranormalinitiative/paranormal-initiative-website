# StudioFlow Source-to-Live Workflow

Status: ACTIVE / CANONICAL

Last verified: 2026-10-23

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
3. From the website repository, build and integrate the exact source revision:

   ```sh
   cd /Users/toddknipple/Documents/GitHub/paranormal-initiative-website
   node scripts/stage-studioflow-authoritative.mjs --apply
   ```

   The staging tool builds the source twice, verifies reproducibility, copies
   generated assets into `studio/`, and preserves the maintained TPI bridge
   layer. It does not deploy.
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

## Current verified live baseline

- Website production source commit:
  `4cacb3aac1b28e9159e2511108956776f931b0e3`
  (TPI-STUDIOFLOW-031)
- Authoritative StudioFlow source commit:
  `ce7c389d23db65bd5ebb92597695d9854d21c7ab`
  (website-only release; source unchanged)
- Active production Worker version:
  `48cdb81d-efcc-4f03-8717-eaa5a51e45d5`
- Immediate rollback version:
  `9e7cf4ba-1262-4c8d-9b3a-249670eb6a78`

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
