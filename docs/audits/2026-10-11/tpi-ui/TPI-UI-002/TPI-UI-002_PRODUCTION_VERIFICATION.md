# TPI-UI-002 Production Verification

Pre-deployment read-only smoke against the existing Worker passed 10/10,
including public shell, `/live-video` Coming Soon, anonymous `/studio/` denial,
anonymous session behavior, Messenger/API boundaries, and admin API denial.

Post-deployment verification must repeat the same smoke and confirm the new
`workspace-shell.css` asset is served. Authenticated owner/member visual review
is blocked without an approved signed-in browser session; no credentials or
cookies were invented.

No D1, R2, recording, membership, entitlement, role, or livestream state was
changed.
