# TPI-UI-002 Release Report

Status: runtime implementation complete and deployed; owner visual review
remains the final stop gate.

Starting HEAD: `ddcf19a320e7c1bcf2c2dcc22f194cdba732af16`.

Runtime scope: `workspace-shell.css`, `member-shell.js`, and the focused
workspace regression script. Existing unrelated dirty files were preserved and
not staged.

Release checklist:

- Focused layout regression: PASS.
- Repository syntax checks: PASS.
- Settings API/auth harness: PASS for its real SQLite phase; browser phase blocked by missing Playwright.
- Combined local API runner: blocked by existing Wrangler/esbuild `spawn EBADF` startup failure before assertions.
- Wrangler dry-run: PASS before deployment.
- Git commit/push: PASS for `8e8c0e9` and `450b446` to `origin/main`.
- Initial Cloudflare deployment: PASS, version
  `b8edafb5-9c5d-46fb-ab49-fb5dafe3fcbf`.
- Final Cloudflare deployment: PASS, version
  `ddddbb45-d518-46fa-b1e6-4c3f0d530f71`.
- Post-deployment read-only production smoke: PASS 10/10.
- Final versioned asset checks: PASS for `workspace-shell.css?v=2` and
  `member-shell.js?v=56`.

The first TPI-UI-002 deployment exposed a cache-versioning issue: direct
unversioned asset URLs still returned the prior cached files. A follow-up
cache-busting commit `450b446` corrected the stale asset response and was
deployed as the final version above. Documentation-only updates after that
deployment are recorded in GitHub and do not change runtime behavior.

No database, R2, recording-storage, authentication, or unrelated production
systems were modified.

The authenticated visual review must stop for owner approval after deployment.
