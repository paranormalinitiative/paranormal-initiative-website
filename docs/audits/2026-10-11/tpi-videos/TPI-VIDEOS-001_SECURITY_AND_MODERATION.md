# TPI-VIDEOS-001 Security and Moderation

## Verified protections

- Anonymous production `/studio/` access is denied.
- Anonymous `/api/auth/me` returns no user.
- Member-required write routes protect comments, reactions, saves, and reports.
- Private library media checks a signed-in user and object owner metadata.
- Scraper refresh is admin-protected; scheduled scraping is not an HTTP public trigger.
- No production test video, private recording, or stream credential was created or changed.

## Findings requiring action

1. **P1 pre-publication API exposure:** authored detail and collection routes can return non-published rows without server-side authorization. Add a server-side published/public/member policy before the first authored draft is inserted into production.
2. **Embed trust boundary:** the authored model accepts `embed_url` and the watch page renders it as an iframe after HTML escaping, but there is no visible server-side provider allowlist. Define and enforce an allowlist or a reviewed embed policy.
3. **Moderation fragmentation:** authored reports, live moderation, community attachments, and scraped approval are separate workflows. Define one case/audit model before scaling public video intake.
4. **External-content availability:** a valid URL is not proof of copyright authorization, uptime, safe content, or accessible playback.

## Release gate

No public authored-video publication, creator-channel launch, or StudioFlow-to-public-video automation should ship until the P1 API issue, embed policy, takedown path, and authenticated/unauthenticated tests are complete.
