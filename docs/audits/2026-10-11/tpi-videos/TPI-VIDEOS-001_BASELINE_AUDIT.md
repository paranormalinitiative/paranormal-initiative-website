# TPI-VIDEOS-001 Baseline Audit

Date: 2026-10-11
Scope: read-only audit and planning; no feature rebuild and no production video mutation.

## Authority and baselines

- Canonical TPI source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`
- Creator Studio source: `/Users/toddknipple/Documents/StudioFlow/web`
- TPI baseline: `e7b6be2` (`Record StudioFlow 023 production verification`)
- StudioFlow baseline: `0622f27` (`Complete live comment overlay controls`)
- Reported production deployment: `5c1f0006-cce6-45ba-8ba0-628891c9f045`
- Public production: `https://paranormalinitiative.com`

The StudioFlow baseline remains owner-only and real-world acceptance remains deferred. This audit does not certify or freeze StudioFlow.

## Current runtime evidence

| Check | Result | Evidence |
|---|---|---|
| Scraped video directory | PASS | `GET /api/videos?limit=5` returned 200 and five Odysee records |
| Authored TPI catalog | PASS/EMPTY | `GET /api/tpi-videos` returned 200 with `videos: []` |
| Anonymous session | PASS | `GET /api/auth/me` returned `{"user":null}` |
| Public live page | PASS | `/live-video` remains Coming Soon |
| Creator Studio boundary | PASS | `/studio/` denied to anonymous access in the existing smoke suite |
| D1 schema | PASS | Remote read-only query found authored, scraped, live, interaction, and scraper tables; zero writes |
| TPI dry-run build | PASS | Wrangler read 9,258 assets; 327.45 KiB upload / 63.62 KiB gzip; no deployment |

## Baseline conclusion

TPI has an operational metadata discovery feed and an authored-video model, but no currently published authored TPI video in production. A future public video-platform release must first close the draft-access security gate, define creator-channel ownership, and establish an explicit relationship between StudioFlow live records and public playback pages. No large implementation should begin until the plan in `TPI-VIDEOS-001_MASTER_BUILD_PLAN.md` is accepted.

## Existing workspace state

The TPI checkout contains unrelated dirty files and prior audit documents. They were preserved and are not included in this audit commit unless explicitly staged by filename. StudioFlow source was inspected read-only and not modified.
