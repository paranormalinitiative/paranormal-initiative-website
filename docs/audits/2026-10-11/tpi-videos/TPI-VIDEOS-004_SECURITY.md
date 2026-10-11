# TPI-VIDEOS-004 Security

Security controls implemented:

- Contributor authentication for all broadcast mutations.
- Owner/admin authorization on identity and lifecycle records.
- Draft/private records excluded from public discovery and direct detail reads.
- Existing `/studio/` authentication boundary preserved.
- Existing `/live-video` Coming Soon route preserved.
- Provider URL allowlist reused; arbitrary hosts and JavaScript URLs rejected.
- Playback URLs are not exposed to public viewers until explicitly verified.
- No stream keys, recording blobs, R2 objects, or credentials are accepted.

Local authorization and URL-validation checks: PASS. Authenticated production
owner and ordinary-member checks: NOT YET VERIFIED in this release.
