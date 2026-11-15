# Messenger Friends Roster and Searchable Direct Chat Repair

## Incident record

- **Date:** 2026-11-14
- **Time requested:** 21:20 ET, owner Messenger direction
- **Time documented:** 21:33 ET
- **Reported by:** Todd Wayne, Owner/Founder/CEO
- **Area:** Site-wide Messenger member picker and Chats list
- **Scope:** Every signed-in member using Messenger
- **Protected applications changed:** None. StudioFlow, Nova Workspace, and Creator Studio were not modified.

## What happened

Messenger used a full active-member directory as its default list. The desired
member experience is narrower: people should normally start from friends, while
still being able to intentionally search for another member and begin a direct
conversation. A conversation started with a non-friend must remain available in
Chats so it can be revisited without searching again.

## Repair applied

- Added a dedicated authenticated `/api/messenger/roster` boundary.
- Default roster results are limited to accounts with an **accepted** friend
  request in either direction.
- Search results can include active members outside the friend list, excluding
  the signed-in account, so an intentional new direct chat remains possible.
- Added friend-status metadata to the roster so the shared shell can preserve
  the distinction between Friends and searched members.
- Updated the Messenger navigation language and empty state to say **Friends**
  instead of presenting an all-member directory.
- Kept the existing conversation source authoritative for **Chats**. Existing
  conversations and newly created non-friend conversations continue to render
  with the person's avatar and remain revisitable.
- Added stale-search protection so an older search response cannot overwrite a
  newer query's results.

## Verification record

- Member interaction source contracts: **28/28 passed**.
- Focused Firefox Messenger acceptance: **24/24 passed**.
- Default local fixture state showed **Friends** with no accepted friends.
- Intentional search found a non-friend and opened a direct conversation.
- Existing conversation rendering, avatar display, chat-list bounds, MP4/ZIP
  controls, and clipboard behavior continued to pass.
- No StudioFlow, Nova Workspace, or Creator Studio source or deployed asset was
  changed by this repair.

## Release record

- **Source branch:** `codex/tpi-development`
- **Source commit:** `a1d030af3b2cb5336fd1a0d98e80ff6000c6fbd5`
- **Certified release:** `rel-a1d030af3b2c-5152a1d5c14e`
- **Production Worker version:** `d1d8b5ee-f195-4ca9-ab86-ccaa8925e2cb`
- **Rollback version:** `c914a5a5-6cfd-460a-8856-3a0397a87498`
- **Production status:** **Deployed and live verified**.
- **Deployment duration:** **17.3 seconds**, including production smoke.
- **Release profile:** Shared API / Tier 1 because the authenticated Worker API and release verification changed.

## Permanent protection

Future Messenger changes now have explicit regression coverage for the privacy
boundary: the default roster must remain friends-only, search must remain an
intentional path to a non-friend direct chat, and existing conversations must
remain in Chats with the correct avatar. The source contracts also fail if the
authenticated roster route, search affordance, or friend classification is
removed. Protected-application byte checks continue to prevent unrelated
Messenger work from replacing StudioFlow, Nova Workspace, or Creator Studio.

## Reusable lesson

The people a member can discover by default and the people with whom a member
already has a conversation are different sets. Keep the default discovery list
privacy-preserving, provide an explicit search path for intentional outreach,
and treat the conversation list as durable history rather than a copy of the
friend directory.

## Source references

- [`functions/api/[[path]].js`](../../../functions/api/[[path]].js) — authenticated roster route and accepted-friend query
- [`member-shell.js`](../../../member-shell.js) — Friends/search UI, friend classification, and existing Chats rendering
- [`tpi-member-interactions.mjs`](../../../scripts/verify/tpi-member-interactions.mjs) — source contracts
- [`tpi-member-messenger.mjs`](../../../scripts/verify/tpi-member-messenger.mjs) — Firefox Messenger regression
- [`TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md`](../TPI-PROBLEMS-FIXES-AND-FEATURED-PRODUCTS.md) — living incident reference
