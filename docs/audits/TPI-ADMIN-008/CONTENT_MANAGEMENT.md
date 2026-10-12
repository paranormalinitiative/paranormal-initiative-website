# TPI-ADMIN-008 — Content management

TPI Videos, Education Center publishing, Contributor Management, Paranormal
Teams, and Events remain backed by their existing TPI systems. The preview
exposes the currently verified article-comment workflow, plus a protected
Paranormal Teams view with pending/approved/rejected filters and approval
controls backed by the existing `/admin/teams` and `/admin/teams/:id/status`
contracts. Secure transitional links remain for the other management surfaces.

The Teams view does not create a duplicate API or bypass the existing
record-type safety rule: imported listings remain blocked from approval by the
server, and all mutations remain protected by the existing admin gate.

No private StudioFlow recordings are exposed, no recordings are automatically
published, and no team, article, video, contributor, or event records were
mutated in this batch.
