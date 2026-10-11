# TPI-VIDEOS-008 Release Report

Status: **RELEASED AND VERIFIED** — 2026-10-11.

## Implemented

- Provider-aware external intent in the existing playback resolver.
- Odysee `WATCH ON ODYSEE` behavior on catalog and watch page.
- Dailymotion official Player-ID embed recognition and server validation.
- Provider-labelled external fallback for valid non-embedded sources.
- Focused 22-assertion client/server regression.
- Baseline, provider, resolver, scraper, Odysee, security, test, defect, and
  production evidence documents.

## Release boundary

No StudioFlow source was changed. No production database or R2 mutation was
performed. No migration, public livestream launch, stream-key change, or
authentication change was performed.

## Release identifiers

- GitHub commit: `5e588dba8c9abb7df8b728c37e113e56e2deab91`, pushed to
  `origin/main`.
- Cloudflare account: `Paranormalsomerset@gmail.com's Account`
  (`221ea5479876fd303ddc87002b9e892d`).
- Cloudflare Version ID: `c24e1576-9f4f-499d-9352-0cc3c70ca51e`.

## Verification

- Focused resolver/server regression: PASS, 22 assertions.
- Syntax and `git diff --check`: PASS.
- Wrangler dry-run: PASS; 9,898 assets read, 386.73 KiB upload / 74.79 KiB
  gzip; no mutation during dry-run.
- Anonymous production boundary smoke: PASS, 10/10.
- Production catalog API: PASS; 200 discovered records inventoried.
- Production Odysee watch page/catalog action: PASS; external destination
  loaded in a separate browser tab.
- Production Dailymotion action: PASS; provider-labelled external fallback.
- `/live-video` Coming Soon and anonymous `/studio/` 403: PASS.

The local D1 API E2E runner was attempted twice. One run stopped at migration
bootstrap and the second local Worker started but the runner stalled on its
loopback health wait before assertions. This is recorded as an environment
limitation, not a passing assertion suite; the focused 008 regression and
read-only production boundary suite passed.

## Explicit limitations

No public creator-authored row was available for authenticated publication or
StudioFlow recording playback. No approved Dailymotion Player ID was configured,
so embedded Dailymotion playback was not claimed. Internet Archive direct media
selection and decode remain unverified because the existing scraper stores only
the item URL. Physical-device and full screen-reader acceptance remain outside
this run. No production database, R2 object, StudioFlow source, stream key,
authentication rule, or `/live-video` behavior was changed.
