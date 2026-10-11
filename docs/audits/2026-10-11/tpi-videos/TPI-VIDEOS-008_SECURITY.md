# TPI-VIDEOS-008 Security

- Existing server-side video visibility checks remain unchanged.
- External actions are emitted only for records already returned to the
  viewer by the API.
- External links require HTTPS and approved provider host/path validation.
- New-tab links use `noopener noreferrer`.
- Iframe allowlisting remains in the existing resolver; arbitrary hosts,
  credential-bearing URLs, HTTP URLs, and `javascript:` remain rejected.
- Dailymotion’s generic API embed value is not accepted without a Player ID.
- No stream keys, recording identifiers, private local blobs, D1 data, or R2
  objects are exposed by this batch.
- `/studio/` authorization and public `/live-video` Coming Soon behavior are
  outside and preserved by this change.

Security verification includes the focused resolver/server-validation test and
the existing API/security regression suite. Authenticated production creator
publication remains unverified because no owner session was used in this audit.
