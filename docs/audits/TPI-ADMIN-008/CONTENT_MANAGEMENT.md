# TPI-ADMIN-008 — Content management

TPI Videos, Education Center publishing, Contributor Management, Paranormal
Teams, and Events remain backed by their existing TPI systems. The preview
exposes the currently verified article-comment workflow, plus protected
Contributor Management and Paranormal Teams views. Contributor Management
loads the existing contributor directory and invitation records, supports the
existing invitation types/access levels, and submits role/title updates through
`/admin/contributors/title`. Paranormal Teams has pending/approved/rejected
filters and approval controls backed by the existing `/admin/teams` and
`/admin/teams/:id/status` contracts. Secure transitional links remain for the
other management surfaces.

These views do not create duplicate APIs or bypass existing
record-type safety rule: imported listings remain blocked from approval by the
server, invitation authorization remains server-enforced, and all mutations
remain protected by the existing admin gate.

Creator Management is integrated separately: Creator Directory reads existing
partnership memberships, Founding 50 reads the existing program/application
contracts while keeping production award activation closed, and Creator Studio
Access reads existing entitlement status without granting or revoking access.

Education Center, TPI Videos, and Events now expose their existing published or
approved read listings in the preview. Events also expose a protected
metadata-only review queue across existing statuses. Draft/editor lifecycle controls,
channel editing/ownership/lifecycle controls, and event creation/review remain
on their existing protected workflows for mutation because no complete
preview-safe mutation contract was added for those operations.

No private StudioFlow recordings are exposed, no recordings are automatically
published, and no team, article, video, contributor, or event records were
mutated in this batch.

Reports & Moderation is a protected metadata-only integration over the existing
video and messenger report tables. It does not expose report details, private
conversation identifiers, message bodies, recordings, or stream data, and it
does not invent review-resolution controls.

Notifications is a protected metadata-only integration over the existing
`member_notifications` table. It does not expose notification bodies or action
URLs and does not add notification mutations; existing delivery, preferences,
and admin-send behavior remain on their existing protected workflows.

Creator Channels is a protected metadata-only directory over the existing
`tpi_video_channels` table. It supports visibility and channel/owner search
filters plus published-video counts, but does not edit channels, transfer
ownership, change visibility, or mutate video lifecycle state.
