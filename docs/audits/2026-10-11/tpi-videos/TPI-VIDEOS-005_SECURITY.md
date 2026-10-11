# Security

Mutations require an existing contributor-capable session, ownership/admin authorization, and same-origin validation when the browser supplies an Origin header. Server-side visibility and publication filters remain unchanged. No recording upload, R2 write, stream key, password, or private API token is introduced.

`/studio/` remains protected by the existing Worker gate and `/live-video` remains the public Coming Soon route.
