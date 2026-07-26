# Contributor Portal, Login, Publishing, and Comments Plan

Last updated: July 26, 2026

## Purpose

The Content Editor is the contributor publishing tool for The Paranormal Initiative. The public Education Center can describe the editor, but opening the editor requires contributor access before someone can submit research papers, notes, images, or videos.

The user also wants public comments on actual posts/articles, with optional anonymous commenting. Public visitors should not need to become members.

## Important Security Boundary

Do **not** implement real usernames and passwords only in static HTML, CSS, or JavaScript.

This repository is currently a static site. Static files can show a login screen, but they cannot securely protect passwords, private editor access, contributor submissions, or moderation controls. Any password stored in front-end code can be viewed by visitors.

Real login needs a backend or hosted auth provider.

Current state note: a Cloudflare-ready backend scaffold has been added. The editor uses a contributor gate, the site owner's 10-click dev copy mode bypasses locks while building, contributor access is admin-managed, public members can use the Discussion Portal, and Cloudflare D1 stores member/contributor accounts, invite codes, sessions, profile text, draft/published article records, comments, replies, forum topics, forum replies, and read tracking. Local `localStorage` behavior remains only as a fallback for local preview.

Chosen secure option:

- Cloudflare Pages Functions + D1 for accounts, invites, articles, comments, and replies.
- Cloudflare R2 for uploaded image/video/audio/document/AI-generated files.

## Current Access Model

- Public visitor: can browse public pages, read public articles, use public search, and read Discussion Portal content.
- Member: can sign in, maintain a profile/dashboard, and create/reply to Discussion Portal topics.
- Contributor: can do member actions plus open the Content Editor, save drafts, publish articles, and manage their own content.
- Admin: can manage member/contributor access, invites, comments, and forum cleanup.
- Owner: full control, including assigning owner/admin access.

Normal members must not see Content Editor tools, contributor tools, invite tools, comment moderation tools, or admin/forum cleanup panels.

## Desired User Flow

### Contributor Access

1. User clicks **Content Editor** in the Education Center.
2. If not logged in, they see a login screen.
3. Member/contributor enters username/email and password.
4. If the account has contributor/admin/owner access, they can open the editor.
5. If the account is a normal member, they are told contributor access is required.
6. Their author fields can auto-fill from their contributor profile.
7. They draft a paper, add images/video, choose destination/category, and can save draft/unpublished work.
8. The editor autosaves drafts while they work.
9. When ready, they click **Publish Article** to make the paper live in the selected destination.

### Admin / Add Contributor

Owner/admin needs a way to:

- Add contributor
- Edit contributor
- Disable contributor
- Reset password / send invite
- Assign member/contributor/admin/owner access
- Assign public leadership/professional title
- Generate invite code
- Review submitted papers
- Approve, reject, or request edits

System permission roles:

- Member
- Contributor
- Admin
- Owner

Public-facing titles are separate from permission roles. A contributor can call themselves editor, writer, researcher, scientist, investigator, PhD, founder, etc. in the profile title/credentials field without changing system permissions. Do not add `editor` as a separate permission role.

## Contributor Profile Fields

Each contributor should have:

- Display name
- Email / login email
- Public correspondence email, if different
- Public title / credentials
- Affiliation
- Organization
- Website
- Biography
- Profile photo
- Default author note
- Comment signature enabled / disabled
- Role
- Active / disabled status

## Invite-Only Account Flow

Current prototype:

1. Owner signs into Member Login and lands on Member Dashboard.
2. Owner/Admin generates a contributor invite link from dashboard admin tools.
3. Contributor opens `contributor-invite.html` from the invite link.
4. Contributor enters/accepts invite code.
5. If the code is valid and unused, the page reveals the account setup form.
6. Contributor creates display name, title/credentials, username, password, and optional author/contact fields.
7. Contributor can choose whether their display name and title should be used automatically on comments and replies.
8. After setup, they use `member-login.html` and land on `member-dashboard.html`.

Cloudflare implementation note: `worker.js`, `functions/api/[[path]].js`, `migrations/0001_contributor_portal.sql` through `migrations/0007_discussion_education_categories.sql` are now present. See `CLOUDFLARE_PORTAL_SETUP.md` for D1 setup, migration SQL, and owner bootstrap instructions.

Cloudflare Console note: when using the dashboard D1 Console, paste the full SQL contents from a migration file. Do not paste the filename.

These fields should populate the Content Editor Post Settings.

## Publishing Model

The current editor can:

- save drafts/unpublished articles
- autosave while writing
- publish live articles
- load draft/published article back into the editor for editing
- store destination/category assignment
- store author metadata
- store draft/published status

Recommended statuses:

- Draft
- Published

Future statuses may include Submitted, In Review, Needs Revision, and Archived if an approval queue is added later.

## Media Storage

Do not keep production uploaded videos as base64/data URLs inside HTML.

Production upload storage should save files to Cloudflare R2.

The saved article should reference media by URL/path.

Current backend state:

- `POST /api/uploads/profile-photo` uploads a logged-in contributor profile image to R2 and saves the returned `/api/media/...` URL in D1.
- `POST /api/uploads/article-media` uploads logged-in contributor article media to R2 and returns a media URL.
- `GET /api/media/...` serves stored R2 media through the Worker.
- These endpoints require the `TPI_MEDIA` R2 binding. The binding is commented in `wrangler.toml` until the bucket exists.

Required upload types:

- profile photo upload from computer
- profile photo by URL
- paper image upload
- paper video/audio upload
- PDFs/DOCX/TXT attachments where appropriate
- AI-generated image/audio/video outputs

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

## Discussion Portal

The Discussion Portal is the community forum. It uses the same member login session as the rest of the site.

Current model:

- Public visitors can read.
- Signed-in members can create topics and reply.
- Categories stay on the left in a collapsible list.
- The active topic opens on the right with messenger-style bubbles.
- Blue topic badges and green reply badges show category activity.
- Member-specific read tracking uses `forum_topic_reads`.
- Leadership/admin cleanup tools can stop, mark inactive, delete, or reopen topics.
- Normal members do not get admin cleanup controls.

Forum categories now align with the Education Center plus community discussion areas:

- Investigation Science
- Evidence Science & Analysis
- Instrumentation & Technology
- Environmental Research
- EVP & ITC Research
- Consciousness & Human Experience
- Ethics & Professional Standards
- Reporting & Documentation
- Community Development & Publication
- Technology Development
- Artificial Intelligence
- Historical & Cultural Research
- Your Paranormal Experiences
- Spirituality, Metaphysics, OBE & NDE
- General Discussion

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

Admin/owner needs:

- View pending comments
- Approve
- Hide
- Mark spam
- Delete only when necessary
- Search comments by article

## Recommended Implementation Order

1. Live-test login, profile, dashboard, forum, Content Editor, save draft, publish article, comments, and admin cleanup.
2. Confirm normal members cannot see or use contributor/admin tools.
3. Verify R2 profile photo and article-media upload on the deployed site.
4. Continue improving paper edit workflow and permissions.
5. Continue converting older legacy pages into Content Editor/D1 article records.
6. Add real email delivery for password reset.
7. Add optional submit/review queue if direct publishing becomes too permissive.

## Do Not Do

- Do not store passwords in JavaScript.
- Do not fake secure login with a client-side password check.
- Do not allow anonymous comments to publish instantly without moderation.
- Do not allow contributors to overwrite live articles without role checks.
- Do not make the Content Editor public-writeable.
