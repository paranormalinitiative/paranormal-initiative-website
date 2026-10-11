# TPI-UI-002 Release Report

Status: implementation complete; owner visual review remains the final stop
gate.

Starting HEAD: `ddcf19a320e7c1bcf2c2dcc22f194cdba732af16`.

Runtime scope: `workspace-shell.css`, `member-shell.js`, and the focused
workspace regression script. Existing unrelated dirty files were preserved and
not staged.

Release checklist:

- Focused layout regression: PASS.
- Repository syntax checks: PASS.
- Settings API/auth harness: PASS for its real SQLite phase; browser phase blocked by missing Playwright.
- Combined local API runner: blocked by existing Wrangler/esbuild `spawn EBADF` startup failure before assertions.
- Wrangler dry-run: required before deployment.
- Git commit/push: required after verification.
- Cloudflare deployment and post-deployment smoke: required after release.

The first TPI-UI-002 deployment exposed a cache-versioning issue: direct
unversioned asset URLs still returned the prior cached files. A follow-up
cache-busting commit and deployment is required and is part of this directive,
not a new feature batch.

The authenticated visual review must stop for owner approval after deployment.
