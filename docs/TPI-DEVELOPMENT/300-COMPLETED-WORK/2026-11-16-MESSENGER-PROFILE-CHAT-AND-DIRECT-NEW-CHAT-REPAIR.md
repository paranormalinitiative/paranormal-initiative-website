# Messenger Profile Chat and Direct New Chat Repair

Date: 2026-11-16 18:11 EST  
Incident: `TPI-MESSENGER-2026-11-16-PROFILE-TARGET`

Status: **REPAIRED LOCALLY; GUARDED PRODUCTION RELEASE PENDING**

## What happened

When a member clicked Chat on another member's profile, Messenger opened but
could keep the conversation that was already selected. That made a profile
for one person open another person's chat. The Messenger New Chat control also
looked and behaved too much like Create Room by showing the room-builder
workflow and requiring a room name.

## Root cause

The profile action navigated only to `#messenger`; it did not pass the target
member's username or identity to Messenger. The shared Messenger shell then
restored its active conversation, which could be a different member.

The same selection panel served direct chats and rooms. Although the client
could request a direct conversation, the New Chat presentation still exposed
room-oriented controls and did not make the one-to-one action immediate.

## Repair

- Added a sitewide `TPIMessenger.openDirectChat(member)` entry point.
- Updated profile Chat to pass the exact profile username, display name, and
  available identity details to that entry point.
- Added a readiness retry so a profile click remains reliable while the shared
  Messenger shell is finishing its asynchronous startup.
- Made Messenger resolve a profile target from the searchable roster when it
  is not already in the friends-only contacts list.
- Kept direct-conversation reuse on the server, so opening a profile chat does
  not create duplicate direct conversations.
- Changed New Chat to a direct-chat chooser with clear “Start a Chat” wording.
- Hid the room-name field and room-creation submit button in direct-chat mode.
- Made selecting a member from that chooser open the direct conversation
  immediately. Create Room remains available as a separate room workflow.

## Safeguards

The active direct-chat target is exposed as a non-sensitive DOM state for
browser acceptance, allowing the regression suite to verify the username—not
just a display label—before the release is considered valid.

The source-level interaction suite now checks profile target propagation and
ensures New Chat cannot present room-name controls. The focused Firefox suite
checks the real user flow with a disposable browser profile, including a
profile target, direct chooser, non-friend search, conversation opening,
clipboard paste, desktop navigation, and mobile behavior.

No authorization boundary was changed. The server still validates the target
member, block state, active account, and direct-chat participant count before
reusing or creating a conversation.

## Verification

- JavaScript syntax checks: **PASS**.
- Member interaction contracts: **31/31**.
- Focused Firefox Developer Edition Messenger acceptance: **27/27**.
- Local Worker asset refresh: **PASS** (`286` served paths refreshed).
- Existing Messenger media, paste, responsive, navigation, and friends-only
  roster checks remained passing.

## Release record

This record will be completed with the source commit, guarded preflight result,
production Worker version, live smoke result, and rollback reference after the
maintained release procedure completes.
