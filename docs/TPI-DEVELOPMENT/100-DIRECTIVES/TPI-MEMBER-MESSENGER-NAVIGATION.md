# TPI Member Messenger Navigation Repair

Date: 2026-11-09
Status: **COMPLETE — DEPLOYED AND LIVE VERIFIED**

## Objective

Restore the authenticated member Messenger as a floating panel owned by the
member navigation **Chat** control. Chat must open or restore the panel, while
Messenger **Hide** must close it and return the user to the Chat navigation
state. Existing frame movement, resizing, conversation selection, composer,
and frame persistence must remain available.

## Required behavior

- Chat is an authenticated navigation control with an explicit open/closed
  state.
- Hide removes the floating panel from the page rather than leaving a second
  collapsed Messenger control behind.
- Chat restores the saved floating frame position and size.
- Long member names, usernames, room labels, and message previews wrap safely
  without clipping or overlap.
- Desktop and narrow/mobile layouts preserve the same navigation contract.

## Verification gates

1. Focused source checks and JavaScript syntax validation.
2. Disposable Firefox Developer Edition acceptance on the maintained local
   Worker at `http://127.0.0.1:8787/`.
3. `npm run verify:release-safety` and
   `npm run verify:local-auth-lifecycle`.
4. Clean-tree commit and push to `codex/tpi-development`.
5. `npm run release:preflight` followed only by the guarded production
   command, then isolated Firefox live acceptance.

No owner browser storage, owner Studio, Crossroads data, production D1 rows,
or production R2 objects are in scope for this repair.

## Confirmed root cause

The desktop Chat link existed, but Hide previously used the floating
collapsed-widget path. That left the control spatially detached from
navigation, and the mobile bottom navigation had no Chat control at all. The
member roster also applied single-line ellipsis styling to names, while
conversation previews were shortened in JavaScript with `slice(0, 38)`.

## Implemented correction

- Chat now has an explicit navigation home with `aria-controls` and open/closed
  state on desktop and mobile.
- Hide stores the current frame, hides the floating panel, clears the transient
  `#messenger` hash, and returns the user to Chat in navigation.
- Chat restores the saved position and dimensions, preserving movement and
  resizing.
- Names, usernames, room labels, and previews wrap with safe word breaking;
  JavaScript no longer truncates the conversation preview.
- No API, database, authentication, membership, recording, or storage changes
  were made.

## Verification results

- `npm run verify:community-workstation`: **19/19 PASS**.
- `node --check member-shell.js`: **PASS**.
- `git diff --check`: **PASS**.
- Isolated Firefox Developer Edition acceptance against
  `http://127.0.0.1:8787`: **18/18 PASS** using
  `scripts/verify/tpi-member-messenger.mjs` and a disposable profile/account.
- Guarded disposable API E2E: **294/294 PASS** after changing isolated D1
  setup to one ordered Wrangler migration operation.
- `npm run verify:release-safety`: **28/28 PASS**.
- `npm run release:preflight`: **CERTIFIED — 30/30 gates PASS**.
- Live anonymous production smoke: **10/10 PASS**.
- Isolated production Firefox Developer Edition acceptance:
  **18/18 PASS** for Messenger using the synthetic production QA account.

Firefox verified authentication, desktop and narrow viewport rendering, Chat
navigation, real header dragging, stored position persistence, roster
selection, composer input, Hide-to-navigation, Chat reopen, and refresh
persistence. No owner Firefox profile, production data, or real creator
content was used.

## Release state

Website commit `99bac3bb4a5f8fdc19a615ff2e72b74150809c80` is pushed on
`codex/tpi-development` and deployed as release
`rel-99bac3bb4a5f-66c24136e926`. Worker version
`ce3a569c-a29e-4868-af75-10b9614fe033` is receiving 100% production traffic.
The guarded rollback target is `f9bb5d31-4636-40d9-a3fd-474021559169`.
The focused Messenger verifier now supports the same explicit synthetic
production QA guard as the maintained release acceptance; it does not permit
owner credentials or an arbitrary hosted origin.

## Broader continuation queue

These remain separate tasks and are not silently marked complete by this
Messenger repair:

1. Community Feed: collapsed long-post cards, a working in-place Open Post
   action, Education Center destination links, and an active-user refresh
   notice/refresh flow.
2. Nova Editorial Workspace: finish GenOffice-parity Documents and Slides
   ribbon, preview, presenter, templates, images, font/custom-font handling,
   delete actions, and refresh persistence.
3. Nova Edit in StudioFlow: provide the intentionally slimmed Nova-styled
   Documents and Slides experience, including fonts/custom fonts and the
   content-editor essentials.
4. Founding Membership issuance: complete authenticated administrator lookup,
   selection, confirmation, atomic issuance, and capability verification for
   all three founding classes using disposable development accounts.

Profile honors/medallion details, Profile Wall, admin profile editing,
rank-safe Leadership and Board assignment, and the Education subject index are
already recorded separately as accepted work and are not reopened here.
