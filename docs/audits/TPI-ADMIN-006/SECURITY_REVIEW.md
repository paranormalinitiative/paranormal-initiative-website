# Security review

`worker.js` still server-gates `/admin-center-preview/` and all generated
assets for owner/admin sessions. Existing `/api/admin/*` authorization remains
the authority. The preview uses same-origin credentials, does not add a login,
does not grant roles or Studio access, and does not render stream keys,
recordings, or private conversation bodies. `/admin-panel` and `/live-video`
were not replaced.
