# The Paranormal Initiative Website - Agent Handoff

Last updated: July 25, 2026

## Project Identity

This repository is the static website for **The Paranormal Initiative**. The site should feel professional, dark, research-driven, and evidence-aware. It is not a college, not a generic course site, and not a sensational paranormal entertainment page.

The current focus is the **Education Center / Research Library** and the new **Content Editor**. The user wants full research papers, notes, reviews, long-form field papers, and practical investigation material. They do not want short academic-looking summaries.

There is now also a live **Contributor Portal** direction: the Content Editor requires contributor access, invite-only contributors can create accounts, logged-in members land on a private dashboard, contributors can save drafts/publish contributions, and public article comments are being added. See `CONTRIBUTOR_PORTAL_PLAN.md`.

## Non-Negotiable Direction

- Do not turn the Education Center into a college, academy, or classroom-style course unless the user explicitly asks for that later.
- Do not use the rejected paper template:
  - Abstract
  - Field Context
  - Motivation and Bias
  - Applied Method
  - Conclusion
- Do not reduce full papers into snippets or summaries.
- Do not host full third-party papers unless permission is confirmed. External authors' work, such as Anabela Cardoso's Academia.edu papers, should be linked to rather than copied into the site.
- Preserve the user's author note pattern:

```text
Author Note

Todd Wayne
The Paranormal Initiative - Applied Paranormal Research and Studies

Somerset Paranormal Research Society

Correspondence: paranormalinitiative@yahoo.com
```

## What The User Wants

The user wants the site to support full research-paper publishing in a way that is easy to edit. The desired workflow is closer to **Blogger / WordPress editing**:

- One large fixed-size writing canvas.
- Compose view and HTML view at the top.
- A compact toolbar similar to Blogger.
- Preview should open separately, not sit permanently next to the editor.
- Image insertion should support upload from computer and URL.
- Video insertion should support upload from computer, URL, YouTube, and Rumble.
- Link insertion should include address and whether to open in a new window.
- Author Note should be insertable automatically from editable author-note fields.
- The editor should include a destination/category dropdown so a paper can be assigned to the correct Education Center section or topic page.
- The editor should autosave drafts and separate drafts from published work on the contributor dashboard.
- The editor should be dark, but laid out like Blogger rather than like a dashboard.

## Current Built State

### Research Papers

The full research papers were restored and reformatted. Each `education-research-*.html` page now uses a single continuous paper content box:

```html
<article class="lesson-reading-block paper-single-textbox">
```

There should be one main article box per research paper, not multiple cards.

CSS support exists in `style.css`:

```css
.paper-single-textbox h3
.paper-single-textbox h3:first-child
.paper-single-textbox .lesson-reading-copy + h3
```

### Content Editor

The current editor files are:

- `paper-editor.html`
- `paper-editor.js`
- `style.css`
- linked from `education-center.html`

The editor currently includes:

- Top bar with `Content Editor`, `Preview`, and `Copy HTML`.
- Large title input.
- Toolbar with:
  - Compose / HTML view
  - Undo / redo
  - Paragraph / Heading / Quote
  - Bold / Italic / Strikethrough
  - Quote
  - LTR / RTL
  - Link
  - Image upload
  - Image URL
  - Video upload
  - YouTube/Rumble
  - Embed
  - Author Note
  - Clear Format
- One compose editor body.
- HTML textarea that appears only in HTML view.
- Right-side Post Settings panel:
  - Subtitle
  - Destination
  - Author
  - Affiliation
  - Organization
  - Correspondence
  - Website
  - Source / Link Note
  - Labels
  - Publish Article
  - Clear Draft
- Hidden file inputs for image/video upload.
- Image and Video toolbar buttons open small modal cards with upload and URL options.
- Inserted media includes editor-only controls for Move Up, Move Down, Small, Medium, and Full.
- Editor-only media controls are stripped from copied/preview HTML.
- Preview opens a separate browser window using generated HTML.
- Author Note insertion is built into `paper-editor.js` and is generated from the Post Settings author fields.
- Destination selection is built into `paper-editor.js`; `Publish Article` opens a publish dialog with the article filename, destination page, full article HTML download/copy actions, destination card copy action, and an Open Destination Page action.
- The editor is behind a contributor login gate for public publishing safety.
- The user's existing 10-click dev copy mode bypasses the editor gate and unlocks copy/paste while building.
- The editor page is exempt from the public copy/paste lock once unlocked so writing, copying, and pasting inside the editor works normally.
- The main public navigation should stay visitor-focused.
- Public users cannot create their own account freely. Registration requires an invite code.
- `Contributor Invite` and `Member Login` are footer utility links, not primary public nav items.
- `Member Login` is for returning contributors only.
- `Member Dashboard` is private after login and should not be shown as a normal public nav button.
- Logged-in contributors can reach the dashboard from the header greeting/dashboard control.
- `contributor-invite.html` is the invite-only setup page: enter invite code first, then create username/password and contributor profile.
- Owner setup is hidden on `member-login.html` until the site owner's 10-click dev mode is enabled.
- The site owner should create a real owner account through Cloudflare D1 using the `TPI_OWNER_SETUP_KEY`, then use the dashboard admin tools for invites.
- The contributor invite page must not show owner/admin tools to normal visitors.
- System roles are only `contributor`, `admin`, and `owner`. Do not re-add `editor` as a permission role.
- A contributor can still call themselves Editor, Writer, Researcher, Scientist, PhD, etc. in the public title/credentials field.
- Contributor profile fields populate the author note settings when logged in.
- Contributor dashboard sections are split into unpublished drafts and published papers.
- Contributor profiles include a title/role label and an option to use the contributor name/title automatically on comments and replies.
- Cloudflare backend scaffolding has been added: `worker.js`, `functions/api/[[path]].js`, `migrations/0001_contributor_portal.sql`, `migrations/0002_contributor_profiles.sql`, `api-client.js`, and the `TPI_DB` D1 binding in `wrangler.toml`.
- R2 upload endpoints have been added for profile photos and article media. They require the `TPI_MEDIA` R2 binding, which is commented in `wrangler.toml` until the Cloudflare bucket exists.
- The public contributor profile page has been upgraded into a professional profile layout with photo, name/title, role badge, profile details, biography showcase, and published work.
- `CLOUDFLARE_PORTAL_SETUP.md` explains the D1 database, migration, owner setup secret, and first owner login flow.
- `Publish Article` tries to publish to Cloudflare D1 when the API is available, then falls back to a local article record for local preview. Destination pages inject matching published cards into their existing grids. The generated article opens through `published-article.html?id=...`.

### Comments

`includes.js` now injects local prototype published article cards and a local prototype comment section before the footer on actual readable article/paper pages only. Do not put comments on Education Center hubs, Research Library hubs, destination/category pages, or section listing pages such as `education-area-investigation-science.html`.

Comments currently appear on generated `published-article.html` entries plus article-style pages such as `education-research-*`, `investigation-development-*`, `ghostology-101-lesson-*`, and `evp-itc-lesson-*`. Visitors can comment anonymously or enter a name. Logged-in contributors can automatically post or reply using their saved display name and title/role label when their profile option is enabled. Each comment logs a date/time and supports replies. Comments use Cloudflare D1 when the API is available, with `localStorage` fallback for local preview.

This is a working front-end/API scaffold. Production comments still need moderation controls before open public use.

### Easy Access

`education-center.html` has a card at the top of the main grid:

```html
<a class="dashboard-panel dashboard-panel-link" href="paper-editor.html">
```

This gives the user a visible way to open the editor.

## Validation To Run Before Handoff/Deploy

Run these checks after contributor/profile/editor edits:

```bash
node --check paper-editor.js
node --check member-login.js
node --check includes.js
node --check api-client.js
node --check 'functions/api/[[path]].js'
```

Static ID/asset validation also passed for `paper-editor.html`: no missing editor IDs and no missing local CSS/script assets.

The local preview server was running at:

```text
http://127.0.0.1:4174/paper-editor.html
```

If the server is not running, start it from the repo root:

```bash
python3 -m http.server 4174
```

## Important Files

- `education-center.html` - Research Library landing page and editor access card.
- `paper-editor.html` - Editor structure.
- `paper-editor.js` - Editor behavior, upload handling, formatting, preview generation, author note.
- `style.css` - Editor styles and paper layout styles.
- `education-research-*.html` - Full research paper pages.
- `includes.js` - Shared include/navigation behavior.
- `header.html` / `footer.html` - Shared site chrome.

## Next Agent Priorities

1. Add Cloudflare R2 for media uploads and bind it as `TPI_MEDIA`.
2. Test the existing authenticated upload API endpoints for profile photos and editor media after R2 is bound.
3. Verify profile photo upload from computer plus URL fallback against Cloudflare R2.
4. Replace editor image/video/audio data URLs with R2 upload URLs.
5. Visually test `member-dashboard.html`, `contributor-profile.html`, `member-login.html`, `contributor-invite.html`, `paper-editor.html`, `published-article.html`, and comment moderation.
6. Continue converting older legacy pages into the new Content Editor format over time.
7. Do not reintroduce the permanent preview pane.
8. Do not reintroduce the short rejected paper headings.

Recently completed:

- Comment moderation tools were added to the owner/admin dashboard and the Content Editor. Public anonymous/name-only comments are pending by default, contributor-signed comments publish immediately, and owner/admin can approve or delete comments.
- Change Password/account settings were added to `member-dashboard.html`.
- Published article author names and logged-in contributor comment/reply names link to `contributor-profile.html?username=...` when a contributor username is available.
- Legacy authored pages are centralized in `legacy-contributions.js` and can be imported from the Content Editor's My Content library.
- Legacy authored pages behave as a conversion queue. Once a legacy page is saved or published from the Content Editor with the legacy page as its source, it leaves the legacy queue and the editable article becomes the contributor copy.

## Known Limitations

- R2 upload code is wired, but it will not work until the `tpi-contributor-media` bucket exists and the `TPI_MEDIA` binding is uncommented/deployed.
- Uploaded editor media can still fall back to data URLs if R2 is unavailable; production should use R2 URLs.
- Change Password is not implemented yet.
- Comment moderation/admin queue is not implemented yet.
- Browser popup settings may block Preview because it opens a new window.
- `document.execCommand` is older browser API but still practical for this lightweight editor. Replace later only if building a full CMS/editor system.

## Contributor Portal Requirement

Contributor access should work like this:

1. User clicks Content Editor from Education Center and sees a login gate unless dev copy mode is enabled.
2. User can also use Member Login from the footer utility links.
3. Contributor registration requires an invite code.
4. Owner/admin can generate invite links from the private dashboard only.
5. Contributor can draft/save/publish research papers, notes, images, and videos.
6. Contributor author fields can auto-fill from their profile.
7. Current `Publish Article` writes to the API when Cloudflare is available and falls back locally for preview.
8. Public article comments should allow anonymous, name-only, or logged-in comments.
9. Comments should be moderated before display in production.

See `CONTRIBUTOR_PORTAL_PLAN.md` before production implementation. The current static login is only a workflow prototype.
