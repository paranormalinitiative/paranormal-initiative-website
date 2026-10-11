# TPI-VIDEOS-002 Security Repairs

## F-001 — authored draft exposure

Repaired in `functions/api/[[path]].js`. Anonymous and ordinary-member catalog
and detail reads now expose only published videos allowed by `viewing_access`.
Draft, removed, and private authored records are owner/admin-only. Create,
update, lifecycle, and delete routes require an authenticated contributor and
enforce creator ownership server-side. Delete is a soft removal to preserve
history and media references.

## F-002 — unsafe provider/embed handling

Repaired with `lib/video-providers.js`. Provider URLs and embed URLs must be
HTTPS, cannot contain credentials, ports, fragments, or arbitrary hosts, and
must match the reviewed YouTube, Rumble, Odysee, Dailymotion, or Internet
Archive rules. YouTube and Rumble embeds are canonicalized to approved hosts;
unsupported sources remain external-link playback rather than arbitrary
iframes. Thumbnail hosts are separately constrained.

## Boundary preservation

No stream keys, private recordings, R2 recording uploads, StudioFlow assets,
or `/live-video` behavior were changed. The automated local security suite
passed 171/171 assertions, including anonymous draft exclusion, cross-owner
edit denial, malicious URL rejection, publish/unpublish, and soft removal.
