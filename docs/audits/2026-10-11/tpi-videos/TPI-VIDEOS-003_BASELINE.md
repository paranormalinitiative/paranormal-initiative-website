# TPI-VIDEOS-003 Baseline

Date: 2026-10-11. Canonical source: `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website`. Baseline commit: `404cc8b`.

Production was read-only checked before this batch: `/api/tpi-videos` returned `200` with an empty authored catalog; `/studio/` remained protected; `/live-video` remained Coming Soon. The separate approved scraped `videos` table is populated and was available through `/api/videos`. No production video rows, recordings, R2 objects, or accounts were changed during baseline inspection.

Existing strengths were authored-video validation, publication lifecycle, channel ownership, provider-safe embeds, reactions, saves, comments, reports, and member-shell integration. Gaps were client-only discovery loading, no server-side pagination/source distinction, no channel-follow relationship, no Community Feed share action, and no threaded authored-video comment support.

Status at baseline: discovery and watch pages PARTIAL; creator publishing PARTIAL; follows NOT IMPLEMENTED; external provider playback NOT YET VERIFIED; authenticated production workflow NOT YET VERIFIED.
