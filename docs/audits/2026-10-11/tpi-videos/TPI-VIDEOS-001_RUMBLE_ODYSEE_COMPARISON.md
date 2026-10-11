# TPI-VIDEOS-001 Rumble/Odysee Comparison

Research date: 2026-10-11. Official public material only; no code or branding is copied.

## Rumble

Official Rumble Studio guidance describes stream setup, metadata, destination selection, Go Live, and a pre-live video entity. Rumble’s current Studio help also documents custom RTMP destinations and says one Rumble channel/account is supported directly, with additional destinations added as custom RTMP. The Rumble Creator Program page describes multi-destination streaming, aggregated chat, guest tools, and monetization as Rumble capabilities.

TPI implication: use the ideas as comparison points for creator workflow, destination status, guest preparation, and live readiness. Do not claim a Rumble API integration or ingest Rumble content automatically. Current TPI behavior is manual authored URL/embed entry; the scraper marks Rumble `not_configured`.

Official references:

- https://studio.rumble.com/help/guides/streaming
- https://studio.rumble.com/help/faqs
- https://studio.rumble.com/creator-program

## Odysee

Official Odysee help describes creator channels, channel tags, subscriptions, playlists/comments, live streaming, and content categories. Odysee’s sync documentation describes optional YouTube-to-Odysee mirroring; that does not authorize TPI to add a YouTube API or sync integration. TPI’s current Odysee adapter uses public claim-search metadata and production currently returns Odysee records in the scraped directory.

TPI implication: channel identity, source labels, creator ownership, category navigation, and external playback are useful planning references. TPI should not imply ownership of Odysee media or mirror provider bytes without a separate approved policy.

Official references:

- https://help.odysee.tv/category-channels/firstchannel/
- https://help.odysee.tv/category-channels/settings/
- https://help.odysee.tv/category-categories/howdocategorieswork/
- https://help.odysee.tv/category-syncprogram/whatisyoutubesync/

## Decision

Rumble and Odysee are inspiration/reference platforms, not permission to copy UI, branding, terms, or provider integrations. YouTube API work remains out of scope pending explicit approval.
