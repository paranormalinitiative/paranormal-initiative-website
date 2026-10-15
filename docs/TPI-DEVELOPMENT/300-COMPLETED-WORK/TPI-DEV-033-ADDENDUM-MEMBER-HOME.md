# TPI-DEV-033 Addendum — Member Home Navigation Correction

Date: 2026-10-14  
Branch: `codex/tpi-development`  
Implementation commit: `8a545a8` (`fix: route authenticated member returns to member home`)

## Scope

This addendum corrected authenticated member return destinations without creating a second homepage or changing the Community Feed.

- Administration Center return controls now use `/member-home` and the label `Return to Member Home`.
- StudioFlow’s return bridge now uses `/member-home` and no longer targets `/explore`.
- Existing member sidebar/mobile home controls, login completion, shared member greeting, Community Feed deep links, notifications, media return controls, and retired forum redirects now use the canonical member route.
- Public `/` navigation remains public and unchanged.
- `/explore` remains the existing Community Feed surface.

All routes are same-origin application paths; no production hostname is hardcoded.

## Verification

### Offline checks — PASSED

- Member-home addendum checks: 10/10.
- DEV-032 navigation checks: 13/13.
- DEV-033 StudioFlow checks: 16/16.
- Workspace layout regression: passed.
- TPI-UI-003 workspace regression: passed.
- JavaScript syntax checks for the changed Worker, member shell/login, Studio bridge, Explore, and API files: passed.
- Administration Center production build: passed.

### Development deployment — PASSED

- Worker: `theparanormalinitiative-dev`
- Source commit: `8a545a8bfc8c46f1d62d03b3b65d6d13089582a9`
- Version ID: `d5c2f55b-9f8b-4edd-847f-390aa5b8b115`
- Authenticated owner route smoke: login 200; `/admin-panel`, `/admin-center-preview/`, `/studio/`, `/member-home`, and `/explore` 200.
- Deployed Admin Center bundle contains `/member-home` and `Return to Member Home`.
- Deployed Studio bridge contains `/member-home` and no `/explore` target.
- DEV-024 workspace regression: 23/23 passed.
- DEV-025 creator/auth regression: 39/39 passed.

The existing DEV-024/DEV-025 QA harness used its established synthetic fixtures and mutated only its development test records; no production data was changed.

### Production deployment — PASSED

- Worker: `theparanormalinitiative`
- Source commit: `8a545a8bfc8c46f1d62d03b3b65d6d13089582a9`
- Version ID: `8f251d0d-d4d2-46e0-8be8-3ed3a960035a`
- Guarded deployment excluded `data`, `docs`, `migrations`, `scripts`, `functions`, and `admin-center-app` from the static asset package as designed.
- Public production smoke: 10/10 passed.
- `/` returned 200.
- `/explore` returned 200.
- `/member-home` returned 200.
- Anonymous `/admin-panel`, `/studio/`, and Admin Center preview access remained protected with 403 responses.
- Public Community Feed API remained available; private Messenger and admin API boundaries remained protected.

## Not tested

- Authenticated production click-through of Admin Center → Member Home and StudioFlow → Member Home was not run because no production authenticated session was used. Anonymous production route protection and the deployed source/build were verified instead.
- Desktop/mobile visual click acceptance was not automated; the existing responsive/offline navigation checks passed.

## Protection confirmation

- No database migrations, imports, D1 changes, R2 changes, deployments other than the authorized development and production Worker releases, or member/account/authentication changes were performed.
- No Tavily or other research requests were made.
- No commits were pushed or merged.
- Existing unrelated worktree changes remained unstaged and untouched.
- Existing Administration Center, StudioFlow, analytics, Community Feed, and workspace functionality was preserved.
