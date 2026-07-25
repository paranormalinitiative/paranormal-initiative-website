# Contributor Portal, Login, Publishing, and Comments Plan

Last updated: July 25, 2026

## Purpose

The Research Paper Editor should eventually become a contributor publishing tool for The Paranormal Initiative. The public Education Center can link to the editor, but opening the editor should require contributor access before someone can submit research papers, notes, images, or videos.

The user also wants public comments on actual posts/articles, with optional anonymous commenting. Public visitors should not need to become members.

## Important Security Boundary

Do **not** implement real usernames and passwords only in static HTML, CSS, or JavaScript.

This repository is currently a static site. Static files can show a login screen, but they cannot securely protect passwords, private editor access, contributor submissions, or moderation controls. Any password stored in front-end code can be viewed by visitors.

Real login needs a backend or hosted auth provider.

Current state note: a Cloudflare-ready backend scaffold has been added. The editor uses a login gate, the site owner's 10-click dev copy mode bypasses the gate locally, contributor registration is invite-only, and Cloudflare D1 can store contributor accounts, invite codes, published articles, comments, and replies. Local `localStorage` behavior remains as a fallback for local preview.

Chosen secure option:

- Cloudflare Pages Functions + D1 for accounts, invites, articles, comments, and replies.
- R2 later for uploaded image/video/document files.

## Desired User Flow

### Contributor Access

1. User clicks **Research Paper Editor** in the Education Center.
2. If not logged in, they see a login screen.
3. Contributor enters username/email and password.
4. If approved, they can open the editor.
5. Their author fields can auto-fill from their contributor profile.
6. They draft a paper, add images/video, choose destination/category, and click **Publish Article** or **Submit Article**.
7. Depending on role:
   - Admin can publish directly.
   - Contributor submits for review.

### Admin / Add Contributor

Admin needs a way to:

- Add contributor
- Edit contributor
- Disable contributor
- Reset password / send invite
- Assign role
- Generate invite code
- Review submitted papers
- Approve, reject, or request edits

Possible roles:

- Admin
- Editor
- Contributor
- Viewer

## Contributor Profile Fields

Each contributor should have:

- Display name
- Email / login email
- Public correspondence email, if different
- Affiliation
- Organization
- Website
- Bio note, optional
- Default author note
- Comment signature enabled / disabled
- Role
- Active / disabled status

## Invite-Only Account Flow

Current prototype:

1. Site owner enables 10-click dev unlock or signs in as an admin/editor.
2. In the current static prototype, the owner can open `contributor-invite.html` and use the 10-click-only Owner Tools to generate a portable invite link.
3. The contributor opens the invite link, which imports the invite code into that browser's local storage.
4. The contributor enters the invite code first.
5. If the code is valid and unused, the page reveals the account setup form.
6. The contributor creates display name, title/role label, username, password, and optional author/contact fields.
7. The contributor can choose whether their display name and title should be used automatically on comments and replies.
8. After setup, they use `member-login.html` for returning access.

Cloudflare implementation note: `functions/api/[[path]].js` and `migrations/0001_contributor_portal.sql` are now present. See `CLOUDFLARE_PORTAL_SETUP.md` for D1 setup, migration, and owner bootstrap instructions.

These fields should populate the Research Paper Editor Post Settings.

## Publishing Model

The current static editor can generate:

- article HTML,
- suggested filename,
- destination page,
- destination card.

The future backend should actually save these:

- New article file or database record
- Destination/category assignment
- Uploaded images/videos
- Author metadata
- Submission status
- Review notes
- Publish date

Recommended statuses:

- Draft
- Submitted
- In Review
- Needs Revision
- Published
- Archived

## Media Storage

Do not keep production uploaded videos as base64/data URLs inside HTML.

Future storage should save files to:

- `assets/` if manually managed,
- Cloudflare R2,
- Supabase Storage,
- Firebase Storage,
- WordPress media library,
- or another controlled media store.

The saved article should reference media by URL/path.

## Comments

The user wants comments on readable posts/articles, including anonymous comments. Do not show comment boxes on hubs, landing pages, Research Library listing pages, or Education Center category pages. Show them only after a visitor opens a specific article/paper/card.

Comment options:

- Anonymous comment
- Name-only comment
- Logged-in contributor comment
- Logged-in contributor reply using saved name/title when enabled
- Reply to an existing comment

Recommended comment fields:

- Post/article id
- Name, optional
- Contributor title / role label, optional
- Email, optional and private if collected
- Comment text
- Created date
- Parent comment id, for replies
- Status
- IP/user-agent hash for moderation, if legally/policy appropriate

Recommended statuses:

- Pending
- Approved
- Hidden
- Spam

Moderation should be required before public display, especially for anonymous comments.

## Public Comment UI

Each article page should eventually show:

- Comment list
- Name field, optional
- Comment box
- Submit button
- Date/time on each comment
- Reply option under each comment
- Notice that comments may be moderated

Anonymous mode wording:

```text
You may comment anonymously or add your name if you would like it shown.
```

## Admin Comment Tools

Admin/editor needs:

- View pending comments
- Approve
- Hide
- Mark spam
- Delete only when necessary
- Search comments by article

## Recommended Implementation Order

1. Finish the static editor layout and publish-preview workflow.
2. Choose hosting/auth architecture.
3. Build login gate for `/paper-editor.html`.
4. Build contributor profile storage.
5. Connect editor Post Settings to logged-in contributor profile.
6. Replace data URL media with real file upload/storage.
7. Add submit-for-review flow.
8. Add admin review queue.
9. Add publish-to-destination automation.
10. Add comments with moderation.
11. Add public comment display to article pages.

## Do Not Do

- Do not store passwords in JavaScript.
- Do not fake secure login with a client-side password check.
- Do not allow anonymous comments to publish instantly without moderation.
- Do not allow contributors to overwrite live articles without role checks.
- Do not make the Research Paper Editor public-writeable.
