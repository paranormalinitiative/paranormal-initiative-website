# TPI-VIDEOS-009 Feature Matrix

Status values: **WORKING**, **PARTIAL**, **MISSING**, **BLOCKED**, **UNVERIFIED**.

| Area | Current status | Evidence / limitation | 009 direction |
| --- | --- | --- | --- |
| Catalog and filters | WORKING | Existing API and browser surface; provider-aware actions from 008 | Preserve and extend format controls without removing filters |
| Featured section | PARTIAL | Present and prominent when data exists, but deterministic selection | Add eligible rotation with a stable last-item guard |
| Desktop grid | PARTIAL | Responsive auto-fill grid; no explicit four-column desktop contract | Define four-column desktop and narrower responsive fallbacks |
| Homepage cleanup | PARTIAL | Continue Exploring and Community & Research cards remain | Remove only those legacy cards |
| Regular vs Shorts/Reels | MISSING | No format controls or persisted Reel catalog | Add safe format classification; keep unknown records in Regular |
| External routing | PARTIAL | 008 action links are provider-aware; primary card routing is inconsistent | Make external card/share destinations original-provider URLs |
| Internal creator playback | PARTIAL | Watch page and resolver exist; no published creator inventory in production | Preserve and test authored path |
| Creator channels | PARTIAL | Public channel and Creator Studio CRUD exist | Improve video/channel linking without duplicating identity |
| Reels | MISSING | `reels.html` is a static demo with no API/schema | Integrate only what can be safely backed by existing data; leave unsupported creation explicit |
| Catalog refresh | MISSING | No five-minute polling or availability indicator | Add visibility-aware, cancelable polling and a manual refresh indicator |
| Community link previews | BROKEN | Client path exists; production Worker throws undefined-function 500 | Add bounded SSRF-safe metadata resolver and regression tests |
| Comments/reactions/follows | WORKING/PARTIAL | Existing routes and UI; authenticated production mutation not part of anonymous baseline | Preserve APIs and test read-only boundaries |
| Watch Later | PARTIAL | Authored saves exist; discovered external rows are not returned by current join | Add additive unified saved-item support |
| Watch History | MISSING | No table/API/page found | Add privacy-conscious member-owned history with clear/delete controls |
| Scheduling/live | PARTIAL | Broadcast identity integration exists; `/live-video` remains Coming Soon | Preserve access boundary and do not launch public live UI |
| Storage/R2 | UNVERIFIED | No creator recording storage migration authorized | No R2 changes; preserve creator-owned storage policy |
| Accessibility | PARTIAL | Existing semantic controls and member shell; full 009 audit pending | Check labels, focus, keyboard, reduced motion, contrast |
| Responsive behavior | PARTIAL | Existing responsive CSS; four-column and mobile Reels behavior pending | Verify desktop/tablet/phone layouts |
| Performance | PARTIAL | Existing paginated catalog; no refresh lifecycle | Bound polling, avoid duplicate loops, preserve scroll position |
| Security | PARTIAL | Existing access boundaries; link preview SSRF defect confirmed | Add URL validation/redirect/size limits and production boundary checks |

## Evidence classification

This matrix distinguishes source inspection, local regression, local integration, production endpoint checks, authenticated production checks, external-provider checks, physical-device checks, and long-duration checks. A source implementation is not a production verification result. Rows remain PARTIAL or UNVERIFIED where the required environment was not exercised.
