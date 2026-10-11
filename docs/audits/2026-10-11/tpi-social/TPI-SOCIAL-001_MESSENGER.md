# Messenger

Existing Messenger supports direct/group conversations, participant membership,
messages, editing/deletion ownership, read state, notifications, mute/archive/
hide, nicknames, blocks, restrictions, reports, directory discovery, and media
attachment metadata.

The full local API suite verifies A/B messaging, C outsider denial, room member
add/remove, block/restrict behavior, notification state, and preference
persistence. The focused media test additionally verifies object delivery to
participants and denial to a nonparticipant.

Status: **PASS locally after the focused authorization repair**. Browser media
preview and real R2 object upload were not exercised here.
