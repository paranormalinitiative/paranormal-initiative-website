# The Paranormal Initiative Website - Agent Handoff

Last updated: July 25, 2026

## Project Identity

This repository is the static website for **The Paranormal Initiative**. The site should feel professional, dark, research-driven, and evidence-aware. It is not a college, not a generic course site, and not a sensational paranormal entertainment page.

The current focus is the **Education Center / Research Library** and the new **Research Paper Editor**. The user wants full research papers, long-form field papers, and practical investigation material. They do not want short academic-looking summaries.

There is now also a future **Contributor Portal** requirement: the Research Paper Editor should eventually require login, allow admins to add contributors, let contributors submit their own research papers/notes/media, and support moderated article comments including anonymous/name-only comments. See `CONTRIBUTOR_PORTAL_PLAN.md`.

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

- One large writing canvas.
- Compose view and HTML view at the top.
- A compact toolbar similar to Blogger.
- Preview should open separately, not sit permanently next to the editor.
- Image insertion should support upload from computer and URL.
- Video insertion should support upload from computer, URL, YouTube, and Rumble.
- Link insertion should include address and whether to open in a new window.
- Author Note should be insertable automatically from editable author-note fields.
- The editor should include a destination/category dropdown so a paper can be assigned to the correct Education Center section or topic page.
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

### Research Paper Editor

The current editor files are:

- `paper-editor.html`
- `paper-editor.js`
- `style.css`
- linked from `education-center.html`

The editor currently includes:

- Top bar with `Research Paper Editor`, `Preview`, and `Copy HTML`.
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
- The editor is behind a contributor login gate again for public publishing safety.
- The user's existing 10-click dev copy mode bypasses the editor gate and unlocks copy/paste while building.
- The editor page is exempt from the public copy/paste lock once unlocked so writing, copying, and pasting inside the editor works normally.
- The main navigation includes `Member Login`.
- Public users cannot create their own account freely. Registration requires an invite code.
- Contributor tools can create invite codes and add contributor/editor/admin accounts with profile fields.
- Contributor profile fields populate the author note settings when logged in.
- This access layer is a local browser prototype using `localStorage`; it is not production security.
- `Publish Article` can publish a local article record to the selected destination. Destination pages inject matching locally published cards into their existing grids. The generated article opens through `published-article.html?id=...`.

### Comments

`includes.js` now injects local prototype published article cards and a local prototype comment section before the footer on actual readable article/paper pages only. Do not put comments on Education Center hubs, Research Library hubs, destination/category pages, or section listing pages such as `education-area-investigation-science.html`.

Comments currently appear on generated `published-article.html` entries plus article-style pages such as `education-research-*`, `investigation-development-*`, `ghostology-101-lesson-*`, and `evp-itc-lesson-*`. Visitors can comment anonymously or enter a name. Each comment logs a local date/time and supports local replies. Comments are stored per page in `localStorage`.

This is a working front-end scaffold only. Production comments still need backend storage and moderation.

### Easy Access

`education-center.html` has a card at the top of the main grid:

```html
<a class="dashboard-panel dashboard-panel-link" href="paper-editor.html">
```

This gives the user a visible way to open the editor.

## Validation Already Run

These checks passed after the latest editor work:

```bash
node --check paper-editor.js
node --check includes.js
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

## Current Git State At Handoff

Expected modified files from this work:

```text
M education-center.html
M paper-editor.html
M paper-editor.js
M style.css
```

Do not revert unrelated changes without user approval.

## Next Agent Priorities

1. Open `paper-editor.html` in the local browser and visually test the editor.
2. Confirm bold, italic, and strike work on highlighted text.
3. Confirm Compose / HTML view switching preserves content.
4. Confirm Destination dropdown choices match the Education Center landing sections and topic pages.
5. Confirm Preview opens a separate page/window and shows title, subtitle, destination, meta, body, media, and Author Note.
6. Confirm `Publish Article` opens the publish dialog and shows the selected destination and suggested generated paper filename.
7. Confirm the publish dialog can download the full article HTML, copy the full article HTML, copy the destination card, and open the destination page.
8. Confirm the Image button opens a modal card with upload and URL options.
9. Confirm the Video button opens a modal card with upload and URL options.
10. Confirm image upload inserts a visible image.
11. Confirm video upload inserts a playable local video. Note: large uploaded videos become data URLs and may create huge copied HTML; this is acceptable for a prototype but should be replaced with real asset upload/storage later.
12. Confirm YouTube and Rumble URL conversion works with real sample URLs.
13. Confirm inserted media can be moved up/down and resized to Small, Medium, or Full in Compose view.
14. Confirm copied/preview HTML does not include the media control buttons.
15. Improve toolbar buttons with icons if desired, but keep them compact and Blogger-like.
16. Do not reintroduce the permanent preview pane.
17. Do not reintroduce the short rejected paper headings.
18. Replace the local prototype auth/comment storage with a backend before public launch.

## Known Limitations

- The editor is a static-browser prototype. It does not save posts to a backend.
- The editor has a local prototype contributor login gate with invite-code registration. It uses browser `localStorage`; real contributor login still needs a backend or hosted auth provider before public launch.
- Uploaded media is embedded as data URLs in the HTML. This is simple and offline-friendly, but not ideal for production.
- A production workflow should eventually copy uploaded files into an `assets/` folder or use a CMS media library.
- Browser popup settings may block Preview because it opens a new window.
- `document.execCommand` is older browser API but still practical for this lightweight static editor. Replace later only if building a full CMS/editor system.

## Contributor Portal Requirement

Future editor access should work like this:

1. User clicks Research Paper Editor from Education Center and sees a login gate unless dev copy mode is enabled.
2. User can also use Member Login from the main navigation.
3. Contributor registration requires an invite code.
4. Admin/contributor tools can manage local usernames/passwords or future invite links.
4. Contributor can draft/submit research papers, notes, images, and videos.
5. Contributor author fields can auto-fill from their profile.
6. Current `Publish Article` saves locally and places the article card into the selected destination grid in this browser.
7. Production should let an admin/editor review submissions before publishing unless the contributor has direct publish permission.
8. Public article comments should allow anonymous, name-only, or logged-in comments.
9. Comments should be moderated before display in production.

See `CONTRIBUTOR_PORTAL_PLAN.md` before production implementation. The current static login is only a workflow prototype.
