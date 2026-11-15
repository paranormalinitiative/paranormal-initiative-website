# Messenger Friends Top Alignment Repair

## Incident record

- **Date:** 2026-11-14
- **Time reported:** 21:37:46 ET, shown in the supplied Messenger screenshot
- **Time documented:** 21:41 ET
- **Reported by:** Todd Wayne, Owner/Founder/CEO
- **Area:** Site-wide Messenger contacts column
- **Scope:** Desktop and mobile Messenger layouts
- **Protected applications changed:** None. StudioFlow, Nova Workspace, and Creator Studio were not modified.

## What happened

The Friends list was visible below its heading, but a small friend list appeared
vertically centered inside a reserved maximum-height region. This created an
unnecessary gap above or below the friend row and made Friends look like it was
in the middle of the Messenger column instead of at the top.

## Repair applied

- Changed the Friends list to natural content-sized flex behavior.
- Set the Friends grid rows to `max-content` and aligned them to the start.
- Preserved a bounded scrolling region when a member has enough friends to need
  it.
- Kept Chats as a separate independently scrolling region below Friends.
- Preserved the Friends-only default roster and intentional non-friend search
  behavior from the previous Messenger repair.

## Verification record

- Member interaction source contracts: **29/29 passed**.
- Focused Firefox Messenger acceptance: **25/25 passed**.
- Friends default roster remained limited to accepted friends.
- Computed Friends alignment was `start` with `max-content` rows.
- Non-friend search, direct-chat selection, chat previews, MP4/ZIP controls,
  clipboard behavior, desktop positioning, and mobile layout continued to pass.

## Release record

- **Source branch:** `codex/tpi-development`
- **Source commit:** `c83bedab898590d3b551e6422be8e50003913815`
- **Certified release:** `rel-c83bedab8985-f9f2fc14c24b`
- **Production Worker version:** `59cf78af-f9d1-4bc8-b7ef-4fd2d2294b00`
- **Rollback version:** `d1d8b5ee-f195-4ca9-ab86-ccaa8925e2cb`
- **Production status:** **Deployed and live verified**.
- **Deployment duration:** **18.3 seconds**, including production smoke.
- **Release profile:** Website / Tier 1 because verification tooling changed alongside the shared Messenger stylesheet.

## Permanent protection

Future Messenger layout changes now fail source verification if the Friends
list loses its content-sized rows or start alignment. The browser regression
also checks the actual computed layout, so a visually centered friend row is
detected rather than relying only on the stylesheet text. Protected-application
integrity checks remain active for every release.

## Reusable lesson

Flexible contact columns must size short sections to their content and reserve
scrolling for the section that actually overflows. A maximum-height region
should not cause a one-row Friends list to stretch or center itself.

## Source references

- [`member-shell.css`](../../../member-shell.css) — Friends/Chats contacts-column layout
- [`member-shell.js`](../../../member-shell.js) — Messenger Friends and Chats markup
- [`tpi-member-interactions.mjs`](../../../scripts/verify/tpi-member-interactions.mjs) — source contracts
- [`tpi-member-messenger.mjs`](../../../scripts/verify/tpi-member-messenger.mjs) — Firefox Messenger regression
- [`TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md`](../TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md) — living incident reference
