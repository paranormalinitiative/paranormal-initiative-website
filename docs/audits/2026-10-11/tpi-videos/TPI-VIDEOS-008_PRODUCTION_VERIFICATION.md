# TPI-VIDEOS-008 Production Verification

Status before release: **PENDING DEPLOYMENT**.

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

The final Cloudflare version, commit, URLs, and exact results are appended to
this file after the clean release verification.
