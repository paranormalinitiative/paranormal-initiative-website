# TPI-VIDEOS-008 Production Verification

Deployment verified: **2026-10-11**, Cloudflare Version
`c24e1576-9f4f-499d-9352-0cc3c70ca51e`, from pushed commit `5e588db`.

Required post-deployment checks:

- production TPI Videos catalog exposes provider-labelled actions;
- Odysee watch page says external viewing is intentional and opens the original
  Odysee URL in a safe new tab;
- Dailymotion records without a configured Player ID use external fallback;
- Internet Archive records preserve original item links;
- `/live-video` remains Coming Soon;
- anonymous `/studio/` remains denied;
- anonymous private APIs remain denied;
- no StudioFlow, D1, R2, recording, stream-key, or access-control behavior is
  changed.

## Results

| Check | Result | Evidence |
|---|---|---|
| Deployed resolver asset | PASS | `GET /tpi-video-player.js?v=2` returned 200 JavaScript |
| Public catalog API | PASS | `/api/tpi-videos?pageSize=3&page=1` returned 3 provider records |
| Odysee watch page | PASS | `scraped-3033` rendered `Watch this video on Odysee` and `WATCH ON ODYSEE`; no native player |
| Odysee action safety | PASS | Original URL, `target=_blank`, `rel=noopener noreferrer` |
| Odysee destination | PASS | External browser tab loaded the selected Odysee page and exposed its Play control |
| Dailymotion watch page | PASS | `scraped-2` rendered `Watch this video on Dailymotion` and `WATCH ON DAILYMOTION` external fallback |
| Catalog actions | PASS | Catalog rendered `WATCH ON ODYSEE` actions linking to original provider URLs |
| Public `/live-video` | PASS | HTTP 200 and Coming Soon content |
| Anonymous `/studio/` | PASS | HTTP 403 |
| Anonymous private APIs | PASS | Messenger 401, notifications 401, admin 403 |

The production catalog inventory remains 200 discovered records: 90 Odysee,
59 Dailymotion, and 51 Internet Archive. No creator-authored public rows,
configured Dailymotion Player ID, or selected Internet Archive media file were
present, so those playback paths remain explicitly unverified rather than
inferred.
