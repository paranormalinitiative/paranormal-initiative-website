# TPI Contributor Portal - Next Build Tasks

Last updated: July 25, 2026

## Read This First

The site is The Paranormal Initiative. Keep it dark, professional, research-driven, and practical. This is not a college-style site, not a course template, and not a place for short paper snippets.

Do not use these rejected headings in research papers:

- Abstract
- Field Context
- Motivation and Bias
- Applied Method
- Conclusion

The research paper system must support full papers, full contributor profiles, drafts, publishing, uploaded media, comments, and invite-only contributor accounts.

## What Is Already Built

- Cloudflare Worker entry: `worker.js`
- D1 API routes: `functions/api/[[path]].js`
- Frontend API helper: `api-client.js`
- D1 migrations:
  - `migrations/0001_contributor_portal.sql`
  - `migrations/0002_contributor_profiles.sql`
  - `migrations/0003_comment_moderation.sql`
- D1 binding in `wrangler.toml`
- Member login page: `member-login.html`
- Contributor invite page: `contributor-invite.html`
- Private member dashboard: `member-dashboard.html`
- Public contributor profile page: `contributor-profile.html`
- R2 upload API endpoints in `functions/api/[[path]].js`
- Content editor page: `paper-editor.html`
- Editor script: `paper-editor.js`
- Shared legacy contribution archive: `legacy-contributions.js`
- Shared nav/comments/greeting behavior: `includes.js`
- Main styling: `style.css`

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

## Navigation Rules

Primary public navigation should stay focused on visitors: what TPI is, research areas, search, education, standards, contact, and public resources.

Contributor tools should stay available but out of the primary public nav:

- `Contributor Invite` belongs in the footer utility links and is only for people who already received an invite code/link.
- `Member Login` belongs in the footer utility links and is for returning contributors.
- `Member Dashboard` is private after login and should not appear as a public navigation item.

Logged-in contributors can reach the dashboard from the header greeting/dashboard control or after signing in through `member-login.html`.

## Role Rules

System roles:

- `contributor`: can create/edit/save/publish their own papers and edit their own profile.
- `admin`: can do contributor work and generate/manage invites.
- `owner`: Todd/full control.

Do not add `editor` as a system permission role. If someone wants to call themselves Editor, Writer, Researcher, Scientist, PhD, Founder, etc., that belongs in the public title/credentials profile field.

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

## Next Implementation Order

1. Create Cloudflare R2 bucket `tpi-contributor-media`.
2. Uncomment the `TPI_MEDIA` R2 binding in `wrangler.toml` after the bucket exists.
3. Deploy and test profile photo upload from the member dashboard.
4. Replace editor data-URL media storage with the existing R2 article-media endpoint.
5. Visually test dashboard, public profile, invite, login, editor, published article pages, and comment moderation.
6. Continue converting older legacy pages into the new Content Editor format over time.

Recently completed:

- Comment moderation tools were added to the owner/admin dashboard and the Content Editor. Public anonymous/name-only comments are pending by default, contributor-signed comments publish immediately, and owner/admin can approve or delete comments.
- Change Password/account settings were added to the member dashboard with Cloudflare D1 and local-preview fallback behavior.
- Published article author names link to public contributor profiles when the article has a contributor username.
- Logged-in contributor comment and reply names link to public contributor profiles when the comment uses the contributor signature.
- Legacy authored pages now behave as a conversion queue in My Content. Once a legacy page is saved or published from the Content Editor with the legacy page as its source, it leaves the legacy queue and the editable article becomes the contributor copy.
- Legacy conversion records now include best-fit destination and contribution type metadata, so Convert pre-fills the editor destination/type before saving or publishing.

## Validation Commands

Run these after changes:

```bash
node --check paper-editor.js
node --check member-login.js
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
```

## Do Not Do

- Do not make public visitors create accounts just to comment.
- Do not let anyone self-register without an invite.
- Do not show owner tools to normal visitors.
- Do not put Member Dashboard in public navigation.
- Do not store passwords in JavaScript.
- Do not store large uploaded media in D1.
- Do not publish anonymous comments without moderation for final public launch.
- Do not reintroduce the rejected paper heading template.
