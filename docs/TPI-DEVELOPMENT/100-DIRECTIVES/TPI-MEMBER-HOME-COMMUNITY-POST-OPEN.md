# Community Feed Post Opening — Production Repair

Date: 2026-11-09  
Status: **COMPLETE — DEPLOYED AND VERIFIED**

## Problem

Community feed cards displayed a post, but there was no card-level open target. Existing share/deep links also used `#post-<id>` without a matching DOM `id` or hash-navigation behavior, so a creator could see Steve Glanz's post without being able to open or focus it.

## Correction

- Added a visible **Open post** action to community feed cards.
- Added stable `id="post-<id>"` anchors and keyboard focusability to rendered cards.
- Added hash navigation that scrolls to and briefly highlights the selected post.
- Preserved existing comment, reaction, share, edit, and delete controls.
- Added a maintained QA assertion covering the open target, anchor, and hash behavior.

Files:

- `member-home.html`
- `scripts/qa/tpi-ops-011-member-home.mjs`

## Verification

- Inline JavaScript parse: PASS.
- Feed navigation assertions: PASS.
- TPI-OPS-011 member-home QA: **38/38 PASS**.
- Local auth lifecycle: **38/38 PASS**; Firefox local acceptance **65/65 PASS**.
- Full guarded release preflight: **CERTIFIED**, 30 gates passed.
- Production anonymous smoke: **10/10 PASS**.
- Live isolated Firefox acceptance: **65/65 PASS**.
- Live production artifact check: `member-home.html` returned HTTP 200 and contained the open target, post anchor, and hash-target styling. Cache header: `public, max-age=0, must-revalidate`.

The final preflight also passed the maintained StudioFlow lifecycle, ownership, deletion, Teleprompter, Notes, mobile, and release-safety suites. Disposable test data only was used.

## Release

- Website source commit: `23e457e2f9dc503dbe92719db6b1dce5b06dc341`.
- Branch: `codex/tpi-development`.
- Release ID: `rel-23e457e2f9dc-b823f53ac601`.
- Production Worker: `bcb18b54-6841-46ef-9996-973ec061b251`.
- Previous/rollback Worker: `8ad865f0-14a5-402d-8349-fbe8c9b45cd2`.
- Traffic: 100% on the new Worker.
- Certification manifest digest: `ad85c0b5e593f000bf44bf23307ed0403f05c537b38886f3a85d56dbb18c724d`.
- Production deployment did not modify creator data, membership records, or databases.

If an already-open browser tab still shows the old card, open a fresh tab or hard-refresh it so the updated `member-home.html` is loaded.
