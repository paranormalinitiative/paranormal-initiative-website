# Messenger Chat List Truncation and Layout Repair

## Incident record

- **Date:** 2026-11-14
- **Time reported:** 15:00:11 ET, shown in the supplied Messenger screenshot
- **Reported by:** Todd Wayne, Owner/Founder/CEO
- **Area:** Site-wide Messenger, Members roster, Chats list, conversation preview
- **Scope:** Every signed-in member using Messenger
- **Protected applications changed:** None. StudioFlow, Nova Workspace, and
  Creator Studio were not modified.

## What happened

As a conversation became longer, Messenger placed too much of the latest
message into the left Chats section. The full message preview expanded instead
of remaining a compact list item. The Members roster and Chats list then shared
an unstable height boundary, so long text could visually run into the member
rows and make the conversation panel appear truncated or corrupted.

The Chats section is a conversation picker, not the conversation itself. It
should identify the person or room, show a short latest-message preview, show
the time/unread state, and leave the complete message history in the thread
pane.

## Confirmed root cause

The chat-list renderer used the complete latest message body as the visible
preview. The contacts column also used a grid whose Members and Chats children
did not have independent flex and overflow boundaries. A long message could
therefore grow the Chats item and paint into the roster area.

## Repair applied

- Added a shared chat-list preview formatter that collapses whitespace and
  limits the visible preview to 88 characters.
- Applied a single-line ellipsis treatment to the Chats preview, while keeping
  the complete message available in the active conversation.
- Converted the contacts column to a bounded vertical flex layout.
- Gave the Members roster and Chats list independent scroll-safe boundaries.
- Prevented chat-list rows and preview text from overflowing their own column.
- Added source-contract coverage for concise previews and protected layout
  rules.
- Added Firefox acceptance coverage that injects a deliberately long preview
  and verifies one-line ellipsis, bounded overflow, and non-overlapping rows.

## Verification record

- Member interaction source contracts: **21/21 passed**.
- Focused local Firefox Messenger acceptance: **19/19 passed**.
- Local authentication lifecycle: **38/38 passed**.
- Targeted profile/feed Firefox regression: **53/53 passed**.
- Guarded preflight: **CERTIFIED**, applicable website gates passed in **31.7
  seconds**.
- Production anonymous smoke: **10/10 passed**.
- Live production read-only Firefox Messenger probe:
  - Messenger opened at usable desktop dimensions;
  - Members rows remained non-overlapping;
  - Chats rows remained non-overlapping;
  - Members and Chats retained separate bounds and scrolling;
  - visible chat previews used `nowrap`, hidden overflow, and ellipsis;
  - no message or conversation was created by the probe.

## Release record

- **Source branch:** `codex/tpi-development`
- **Source commit:** `29cc0582b4d6a086655ed4cded1078b0764a37f5`
- **Certified release:** `rel-29cc0582b4d6-dbb9db88ce25`
- **Production Worker version:** `48af4946-75e1-4624-a522-b6202928ba27`
- **Rollback version:** `4049b58d-9410-42cc-b649-7d3a117f5010`
- **Production status:** **Deployed and live verified**.
- **Deployment duration:** **20.7 seconds** after certification.
- **Release profile:** Website. The protected-application integrity guard
  passed; no StudioFlow, Nova, or Creator Studio source was changed.

## Reusable lesson

A conversation list must never become a second conversation pane. Keep list
previews intentionally small, keep complete history in the thread, and give
each scrollable region its own layout boundary. Long-message acceptance is now
part of the maintained Messenger regression.

## Source references

- [`member-shell.js`](../../../member-shell.js) — chat-list preview formatting
- [`member-shell.css`](../../../member-shell.css) — Messenger column and overflow layout
- [`tpi-member-interactions.mjs`](../../../scripts/verify/tpi-member-interactions.mjs) — source contract
- [`tpi-member-messenger.mjs`](../../../scripts/verify/tpi-member-messenger.mjs) — browser regression
- [`TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md`](../TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md) — living incident reference
