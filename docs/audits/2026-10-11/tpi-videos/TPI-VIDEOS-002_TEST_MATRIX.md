# TPI-VIDEOS-002 Test Matrix

Date: 2026-10-11

| Area | Method | Status | Evidence / limitation |
|---|---|---|---|
| Migration replay | local Wrangler D1 migration application | PASS | migration 0042 applied in isolated local database |
| Authenticated creator publishing | local synthetic contributor sessions | PASS | draft, own-list, publish, unpublish, remove |
| Draft privacy | anonymous/member/cross-owner API reads | PASS | 404/empty responses for unauthorized records |
| Ownership | second synthetic contributor update/remove attempts | PASS | denied server-side |
| URL/embed safety | malicious and approved fixture requests | PASS | JS and unapproved origin rejected; YouTube canonicalized |
| Public catalog/channel | anonymous local API reads | PASS | only published public records returned |
| Existing social regression | `scripts/e2e/api-e2e.sh` | PASS — 171/171 | live scraper refreshes remain opt-in |
| Static/build checks | shell syntax, Wrangler dry run | PASS | no deployment mutation in dry run |
| Production anonymous boundary | read-only endpoint checks | PASS/after deploy | `/studio/` and `/live-video` protections retained |
| Production authenticated creator workflow | owner session | NOT YET VERIFIED | no authorized production session was used by automation |
| External provider playback/accounts | provider accounts and real media | NOT YET VERIFIED | no API/OAuth/provider claim made |
| StudioFlow integration | canonical StudioFlow workspace | NOT IN SCOPE | unchanged and preserved |
