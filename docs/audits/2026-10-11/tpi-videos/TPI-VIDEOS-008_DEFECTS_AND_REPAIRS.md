# TPI-VIDEOS-008 Defects and Repairs

## Repaired: intentional Odysee viewing was labelled unavailable

Root cause: valid provider URLs without embeds shared the generic external
fallback state, while the watch-page status panel always used the heading
`Playback unavailable here`.

Repair: the resolver now records `EXTERNAL_BY_DESIGN` for Odysee, the watch
page explains that external viewing is intentional, and both catalog and watch
actions visibly say `WATCH ON ODYSEE`.

## Repaired: Dailymotion official player URLs were not recognized

Root cause: the client and server validators recognized Dailymotion video-page
paths but not the official `geo.dailymotion.com/player/{id}.html?video=...`
shape.

Repair: both validators now accept the official Player-ID shape and reject the
generic no-ID form. The current TPI catalog has no configured Player ID, so no
embedded Dailymotion playback is claimed.

## Preserved fallback behavior

Internet Archive and other valid provider pages continue to open externally
when a verified embed/direct media source is absent. Thumbnails remain metadata,
not playback. StudioFlow, storage, authentication, and public livestream
boundaries were not rebuilt or changed.
