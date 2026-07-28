# TPI Contributor Portal - Next Build Tasks

Last updated: July 27, 2026

## Read This First

The site is The Paranormal Initiative. Keep it dark, professional, research-driven, and practical. This is not a college-style site, not a course template, and not a place for short paper snippets.

Do not use these rejected headings in research papers:

- Abstract
- Field Context
- Motivation and Bias
- Applied Method
- Conclusion

The research paper system must support full papers, full contributor profiles, drafts, publishing, uploaded media, comments, invite/admin-managed contributor accounts, public member accounts, and the Discussion Portal.

## What Is Already Built

- Cloudflare Worker entry: `worker.js`
- D1 API routes: `functions/api/[[path]].js`
- Frontend API helper: `api-client.js`
- D1 migrations:
  - `migrations/0001_contributor_portal.sql`
  - `migrations/0002_contributor_profiles.sql`
  - `migrations/0003_comment_moderation.sql`
  - `migrations/0004_discussion_portal.sql`
  - `migrations/0005_forum_read_tracking.sql`
  - `migrations/0006_account_recovery.sql`
  - `migrations/0007_discussion_education_categories.sql`
  - `migrations/0008_forum_post_attachments.sql`
  - `migrations/0009_member_chat_color.sql`
  - `migrations/0010_convert_todd_legacy_contributions.sql`
- D1 binding in `wrangler.toml`
- Member login page: `member-login.html`
- Contributor invite page: `contributor-invite.html`
- Private member dashboard: `member-dashboard.html`
- Public contributor profile page: `contributor-profile.html`
- Discussion Portal page: `community-forum.html`
- Discussion Portal script: `community-forum.js`
- R2 upload API endpoints in `functions/api/[[path]].js`
- Content editor page: `paper-editor.html`
- Editor script: `paper-editor.js`
- Shared legacy contribution archive: `legacy-contributions.js`
- Shared nav/comments/greeting behavior: `includes.js`
- Main styling: `style.css`
- Honorary Member profile model:
  - `anabela-cardoso-profile.html`
  - `anabela-cardoso-papers.html`
  - `assets/anabela-cardoso/anabela-cardoso.jpg`
  - `assets/anabela-cardoso/papers/`
  - `ITC_EVP_HISTORICAL_RESEARCH_PROFILES_PLAN.md`

## Honorary Member Profiles

Anabela Cardoso is the first deployed Honorary Member profile.

Current behavior:

- Her public profile page is live.
- Her paper collection page is live.
- Her staged source documents and the oversized Hans Bender scan have been converted into 19 readable TPI article pages. Original source-document links are preserved on each page when the source is hosted inside the site.
- `scripts/build-anabela-articles.py` is the repeatable generator for rebuilding the readable article pages and the collection inventory page.
- Her profile/collection is linked from the Education Center and the EVP / ITC Research shelf.
- Her static profile record appears in the Member & Contributor Access panel above live D1 member accounts.
- She is not a D1 login account. Do not create fake login accounts for historical figures or living researchers unless they personally need site access.

Important distinction:

- **Member & Contributor Access**: real D1 accounts for people who log in.
- **Honorary Member / Historical Profiles**: public research profiles for major figures who may not log in.

Outstanding Anabela work:

- Add translation notes for mixed-language material where needed.
- Upload the oversized `Prof_Hans_Bender_on_F_Jurgensons_anomalo.pdf` to Cloudflare R2, then update its generated article page from `Source PDF pending R2 upload` to a live R2 source link.
- Preserve attribution and the permission note on her profile and collection.
- Add a future **Featured Researcher / Profile Highlight** feature for manually spotlighting one major profile at a time. Anabela Cardoso should be the first model. Keep it respectful, research-focused, and archival rather than award-like or social-media styled.

## Current Working Model

D1 stores records:

- contributor accounts
- owner/admin/contributor roles
- invite codes
- login sessions
- profile text
- profile photo URL/key
- article records
- draft/published status
- comments and replies

R2 must store uploaded files:

- profile photos
- article images
- article video/audio
- PDFs, DOCX, TXT attachments
- AI-generated media
- future media-library files

Do not store large media files in D1. D1 should only store the media URL/key.

## Cloudflare D1 Console Rule

When the user is applying a migration through the Cloudflare dashboard, give them the **full SQL contents** to paste into the D1 Console. Do not tell them to paste a filename such as:

```text
migrations/0007_discussion_education_categories.sql
```

Correct dashboard path:

```text
Cloudflare Dashboard -> D1 SQLite Database -> tpi_contributor_portal -> Console -> paste the full SQL text -> Execute
```

For multi-statement migrations, if Cloudflare Console complains, paste and execute one complete SQL statement at a time.

Legacy conversion note: `migrations/0010_convert_todd_legacy_contributions.sql` converts Todd Wayne's 21-item Legacy Conversion Queue into published D1 Content Editor articles. The SQL is large because it contains full article HTML. Open the file, copy the full SQL text, paste it into Cloudflare D1 Console, and execute it. It is safe to rerun because it uses stable `legacy-*` article ids and `ON CONFLICT(id) DO UPDATE`.

## Navigation Rules

Primary public navigation should stay focused on visitors: what TPI is, research areas, search, education, standards, contact, and public resources.

Contributor tools should stay available but out of the primary public nav:

- `Contributor Invite` belongs in the footer utility links and is only for people who already received an invite code/link.
- `Member Login` belongs in the footer utility links and is for returning members, contributors, admins, and the owner.
- `Member Dashboard` is private after login and should not appear as a public navigation item.

Logged-in contributors can reach the dashboard from the header greeting/dashboard control or after signing in through `member-login.html`.

## Access And Title Rules

System access levels:

- `member`: can maintain a profile and participate in the Discussion Portal only.
- `contributor`: can create/edit/save/publish their own papers and edit their own profile.
- `admin`: can do contributor work, generate/manage invites, moderate comments/forum items, and manage member/contributor access.
- `owner`: Todd/full control, including assigning owner/admin access.

Do not add `editor` as a system permission role. If someone wants to call themselves Editor, Writer, Researcher, Scientist, PhD, Founder, etc., that belongs in the public title/credentials profile field.

Public-facing titles are separate from access levels. Current public title options include Founder / Director, Assistant Director, Advisory Board Member, Paranormal Researcher & Investigator, EVP / ITC Researcher, Field Investigator, Technical Researcher, Historical Researcher, Evidence Reviewer, Education & Outreach, Community Liaison, and Contributor.

## Dashboard Requirements

The member dashboard is the contributor home page.

It needs:

- professional profile editor
- profile photo upload from computer and URL
- display name
- public title/credentials
- role display
- affiliations
- organizations
- correspondence email
- website
- full biography field
- change password/account settings
- public profile preview
- published paper list
- drafts/not-published paper list
- owner/admin invite tools only for owner/admin

The dashboard sections should be clearly named:

- Drafts / Not Published
- Published Papers

## Public Profile Requirements

When the public clicks a contributor name, they should land on:

```text
contributor-profile.html?username=USERNAME
```

The public profile must look polished and professional.

It should show:

- profile photo, if provided
- display name
- public title/credentials
- contributor/admin/owner role label only if appropriate
- affiliation
- organization
- correspondence email
- website
- biography
- published papers only

If there is no biography yet, show:

```text
Biography coming soon.
```

Do not show drafts on public profiles.

## Editor Requirements

The Content Editor should remain Blogger-style:

- large fixed-size compose canvas
- compose view
- HTML view
- compact toolbar
- preview opens separately
- save draft
- autosave draft
- publish article
- destination/category dropdown
- author note insertion from profile/settings
- image upload and URL
- video upload, URL, YouTube, Rumble
- future audio upload for EVP/ITC clips

Publishing behavior:

- Save Draft keeps the paper private/unpublished.
- Autosave updates the draft.
- Publish Article makes the article appear publicly in the selected destination.
- Drafts should appear in the contributor dashboard under Drafts / Not Published.
- Published papers should appear under Published Papers and on public destination pages.

## Comment Requirements

Comments should appear only on actual readable article/paper pages, not on hubs or category pages.

Allowed public comment modes:

- anonymous
- name-only
- logged-in contributor

Logged-in contributor comments/replies should automatically use the contributor display name and title/credentials when their profile setting allows it.

Comments need:

- date/time
- reply button
- moderation status
- admin/owner moderation tools before open public launch

## Discussion Portal Requirements

The Discussion Portal is a dedicated community forum page with a messenger-style reading layout.

Current rules:

- Public visitors can read.
- Signed-in members can create topics and reply.
- Contributors/admin/owner use the same login session as the main site; they should not have to log in twice.
- Forum categories live on the left and remain collapsible.
- Topic/reply content opens on the right as chat-style bubbles.
- New topics and replies can include uploaded forum media: up to 10 images and 2 videos.
- Forum media uploads use R2 through `/api/uploads/forum-media`; the files can come from the computer, device, or synced cloud folders such as iCloud, Dropbox, or Google Drive.
- Direct Google Drive/iCloud/Dropbox picker integration is not built yet; current support uses the browser file picker.
- Member profiles include a chat box color. Forum messages use that color as the bubble accent so readers can more easily see who is speaking.
- Blue badge/icon means topics.
- Green badge/icon means replies.
- Badge brightness should reflect read/unread when the read-tracking table is present.
- Person names in forum posts should open public contributor/member profiles where possible.
- Copy/paste should work inside the forum writing area.
- Admin/director tools can stop, mark inactive, delete, or reopen a topic.
- Normal members cannot delete public threads. At most they may close/stop their own thread if that remains desired.

Current category set:

- General Discussion
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
- Scrying, Divination & Visionary Practices

## Next Implementation Order

1. Live-test member login, dashboard, forum, contributor gate, Content Editor, save draft, publish article, comments, and admin cleanup.
2. Confirm normal members cannot see admin tools or Content Editor access until upgraded.
3. Verify R2 profile photo upload and article media upload on the deployed site.
4. Keep Discussion Portal category badges and read/unread behavior clean.
5. Continue converting older legacy pages into the new Content Editor format over time.
6. Refine search/Education Center browsing as the article library grows.

Recently completed:

- Comment moderation tools were added to the owner/admin dashboard and the Content Editor. Public anonymous/name-only comments are pending by default, contributor-signed comments publish immediately, and owner/admin can approve or delete comments.
- Change Password/account settings were added to the member dashboard with Cloudflare D1 and local-preview fallback behavior.
- Published article author names link to public contributor profiles when the article has a contributor username.
- Logged-in contributor comment and reply names link to public contributor profiles when the comment uses the contributor signature.
- Legacy authored pages now behave as a conversion queue in My Content. Once a legacy page is saved or published from the Content Editor with the legacy page as its source, it leaves the legacy queue and the editable article becomes the contributor copy. Todd Wayne's current queue can be converted in bulk by applying `migrations/0010_convert_todd_legacy_contributions.sql` in Cloudflare D1.
- Legacy conversion records now include best-fit destination and contribution type metadata, so Convert pre-fills the editor destination/type before saving or publishing.
- The Discussion Portal was added with member posting, category browsing, chat-style topic display, leadership/admin cleanup controls, and Education Center-aligned categories.
- Account recovery/password reset table and UI/API foundation were added, but email delivery is not connected yet.
- Member/contributor/admin access boundaries were tightened so normal members do not see contributor/editor/admin tools.

## Validation Commands

Run these after changes:

```bash
node --check paper-editor.js
node --check member-login.js
node --check member-dashboard.js
node --check community-forum.js
node --check includes.js
node --check published-article.js
node --check api-client.js
node --check 'functions/api/[[path]].js'
```

If testing locally:

```bash
python3 -m http.server 4174
```

Open:

```text
http://127.0.0.1:4174/member-login.html
http://127.0.0.1:4174/member-dashboard.html
http://127.0.0.1:4174/contributor-invite.html
http://127.0.0.1:4174/contributor-profile.html
http://127.0.0.1:4174/paper-editor.html
http://127.0.0.1:4174/community-forum.html
```

## Do Not Do

- Do not make public visitors create accounts just to comment.
- Do not let normal members see contributor/editor/admin tools.
- Do not show owner tools to normal visitors.
- Do not put Member Dashboard in public navigation.
- Do not store passwords in JavaScript.
- Do not store large uploaded media in D1.
- Do not publish anonymous comments without moderation for final public launch.
- Do not reintroduce the rejected paper heading template.
