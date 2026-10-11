# TPI-STUDIOFLOW-016 — Pre-Recorded Live Broadcasting

Status: IMPLEMENTED LOCALLY; PROTECTED PRODUCTION PREVIEW DEPLOYED; PUBLIC PROVIDER DELIVERY NOT VERIFIED

This continuation preserves the existing StudioFlow broadcast engine and adds
the remaining creator-facing surfaces around the local pre-recorded source.
The detailed architecture and initial local RTMP evidence remain in
`TPI-STUDIOFLOW-016_PRERECORDED_BROADCASTING.md`; this record documents the
continuation without duplicating that report.

## Implemented

- Scheduled pre-recorded broadcasts appear in the existing Library with source,
  format, destination, schedule, and manual-start status.
- The existing edit flow can replace a selected pre-recorded video. The new
  local file is inspected before it replaces the IndexedDB source entry.
- Studio includes a Live interaction panel with explicit READY, LIVE, and
  ENDED state, destination status, and a clean End broadcast action.
- A destination may store an optional creator-provided HTTPS live-chat URL.
  StudioFlow opens that URL only when it exists; it does not invent a chat URL,
  simulate messages, expose stream keys, or claim native provider chat.
- RTMP destinations remain video/audio transport. Native YouTube and Twitch
  chat require separate authenticated provider APIs and are not implemented in
  this batch.

## Verification

Passed locally on 2026-10-10:

- `npx tsc --noEmit`
- `npm run build` (existing large-chunk warning only)
- `npm run check:rtmp`
- `git diff --check`
- Real isolated H.264/AAC MP4 selection, metadata, preview, local source
  persistence, compositor playback, clean end-of-media behavior, and local
  RTMP receiver capture.

Not verified:

- Authenticated owner interaction in production Creator Studio.
- External YouTube/Facebook/Rumble/Twitch/other-provider delivery.
- Provider chat-link validity for a real external destination.
- Device sleep, browser interruption, destination failure, long-session
  recovery, and unattended scheduling.

## Storage and release boundary

Selected creator video remains local browser data in the existing IndexedDB
recording store. No TPI-hosted recording storage, Cloudflare R2 recording
bucket, D1 schema, OAuth token store, or paid infrastructure was added.
Public `/live-video` remains Coming Soon and the owner-only Creator Studio
gate remains in force.

Release evidence is recorded in the preceding 016 report and the current TPI
release records. The protected TPI integration used commit `a86c9d7` and
Cloudflare deployments `2cff61b2-a8ce-43b6-9414-4611e83aaf36` (code) and
`45b58281-9937-4f45-ae99-ee462e93127b` (documentation sync). No production
database, R2 recording storage, or unrelated TPI work was changed.

## Official capability references

- [YouTube Live Chat Messages API](https://developers.google.com/youtube/v3/live/docs/liveChatMessages)
- [Twitch EventSub subscription types](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types)

These references support the release classification: provider chat is an
authenticated API integration, not an automatic capability of an RTMP URL.
