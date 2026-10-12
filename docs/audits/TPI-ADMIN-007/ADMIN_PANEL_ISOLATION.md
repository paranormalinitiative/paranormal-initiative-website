# TPI-ADMIN-007A — Administration panel isolation

Status: **IMPLEMENTED — PENDING OWNER REVIEW**

## Root cause

The legacy `/admin-panel` page placed Contributor Invites, Paranormal Teams
approval navigation, and classic article Comment Moderation inside one shared
`data-dashboard-admin` section. The legacy `admin-center.js` view switcher only
filtered elements carrying `data-admin-view`, so owner/admin authorization
revealed the entire shared block on whichever page was selected. This was a
rendering-boundary defect, not three independent API defects.

## Corrected behavior

The shared block is now three independently routed resources:

- `contributors` — Contributor Management and Contributor Invites.
- `teams` — Paranormal Teams and the existing Team Approvals workflow.
- `article-comments` — Education Center / Article Comment Moderation.

Community Reports & Moderation remains under the Community resource. Community
Feed records are not relabeled as classic article comments.

Owner/admin authorization no longer overrides the active legacy view. The
authorization path marks the Contributor Management section as authorized, and
the Administration Center view controller retains the active section boundary.

## Refine preview organization

The protected Refine + shadcn/ui preview now places Reports & Moderation under
Community and Contributor Management, Paranormal Teams, Education Center, and
Article Comment Moderation under Content & Publishing. Existing APIs are reused;
no duplicate backend or new production administration application was created.

## Files modified

- `admin-panel.html`
- `admin-center.js`
- `member-login.js`
- `admin-center-app/src/app.tsx`
- `admin-center-preview/` generated build assets
- `scripts/qa/tpi-admin-006-preview.mjs`
- This audit directory's implementation and verification records.

## Verification

- JavaScript syntax checks passed.
- Refine/Vite production build passed.
- Administration isolation regression suite passed 13/13.
- Local rendered preview showed the reorganized navigation and Reports &
  Moderation resource without unrelated panels.
- Authenticated owner/admin acceptance of real records remains pending.

Release evidence:

- GitHub commit: `2859f7c`
- Cloudflare deployment: `31086383-9600-4ca8-abef-8cc4928cee3a`

## Security and data safety

Existing server-side authorization, D1/R2 bindings, `/admin-panel`,
`/admin-center-preview/`, Creator Studio restrictions, and `/live-video`
Coming Soon behavior were preserved. No team, comment, member, D1, or R2 data
was modified by this repair.

## Remaining limitation

The legacy Paranormal Teams section continues to open the existing protected
`teams/admin.html` workflow rather than duplicating its approval controls.
The preview presents the same integration boundary until a dedicated safe API
contract is approved.
