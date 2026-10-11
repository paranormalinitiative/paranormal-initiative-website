# TPI-UI-002 Regression Results

## PASS

- `node scripts/verify/workspace-layout.mjs`
- `git diff --check`
- `node --check member-shell.js`
- Existing repository syntax/QA gate: 7 PASS checks.
- Existing Settings API/auth harness: real SQLite auth gates, owner isolation, theme persistence, and Messenger block-list checks PASS.
- Read-only production smoke: 10/10 PASS.
- Versioned workspace asset checks after final deployment: PASS; CSS `?v=2`
  contains the new route-scoped layout/docking rules and JS `?v=56` contains
  the workspace-aware collapsed-chat behavior.

## Explicit limitations

- Existing local multi-user API runner: BLOCKED/FAIL before assertions because Wrangler/esbuild returns `spawn EBADF` while starting the local service. No production state was touched.
- Existing Settings browser phase: BLOCKED because the Playwright module is not installed.
- StudioFlow checks: not run because this frontend-only directive did not modify StudioFlow.

No CSS-only result is treated as proof of authenticated visual acceptance.
The authenticated owner/member visual matrix remains the final owner review
gate because no approved signed-in browser session was available.
