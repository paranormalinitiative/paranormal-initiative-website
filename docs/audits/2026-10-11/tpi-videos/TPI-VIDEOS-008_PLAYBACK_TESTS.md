# TPI-VIDEOS-008 Playback Tests

## Focused regression

`node scripts/qa/tpi-video-player-regression.mjs` passed **22 assertions**.
Coverage includes direct media, published replay, approved YouTube embed,
Odysee external-by-design intent, Dailymotion external fallback, official
Dailymotion Player-ID embed, rejection of the no-Player-ID form, local/private
recordings, unsafe URLs, thumbnail-only records, catalog/watch-page markup,
and server-side provider validation.

## Production inventory

Read-only `/api/tpi-videos?pageSize=48` pagination passed across five pages and
returned 200 discovered records: 90 Odysee, 59 Dailymotion, and 51 Internet
Archive. Every row had a source URL; no row had an embed or direct playback URL.

## Evidence classification

| Test | Environment | Result |
|---|---|---|
| Resolver/provider policy | Local Node VM | PASS |
| Server provider validation | Local Node module test | PASS |
| Catalog/watch markup | Local source regression | PASS |
| Actual Odysee destination page | External provider browser session | PENDING RELEASE |
| Actual Dailymotion embedded playback | Production | NOT TESTABLE without approved Player ID |
| Actual Internet Archive media decode | Production | NOT VERIFIED; scraper has no selected media file |
| Creator-authored TPI playback | Authenticated production | NOT VERIFIED; no public creator rows |
| Physical devices / screen reader | Physical/device session | NOT TESTED |

No unperformed provider or creator playback behavior is classified as passing.
