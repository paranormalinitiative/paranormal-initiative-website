# Content Editor Roadmap

Last updated: July 25, 2026

## Goal

Build a dark, Blogger-style editor for The Paranormal Initiative so full research papers can be drafted and moved into the website without hand-building many separate content cards.

The editor should help the user produce complete research papers with:

- one continuous body,
- media insertion,
- source links,
- destination/category assignment,
- author note fields and insertion,
- HTML output,
- and a separate preview page.

The contributor portal is now in progress: login-protected editor access, invite-only contributor accounts, owner/admin invite generation, dashboard profiles, drafts, published papers, and public profile pages. See `CONTRIBUTOR_PORTAL_PLAN.md`.

## Current Editor Behavior

Location:

```text
paper-editor.html
```

Current local URL:

```text
http://127.0.0.1:4174/paper-editor.html
```

Current layout:

- Top bar with Preview and Copy HTML.
- Large title line.
- Compact toolbar.
- Main writing area.
- Right-side post settings panel.
- HTML view replaces compose view when selected.
- Preview opens a separate page/window.
- Image and Video buttons open small modal cards with the available insertion options.
- Inserted media has editor-only controls for moving and resizing while drafting.
- Destination dropdown chooses where the paper belongs in the Education Center.
- Publish Article opens a publish dialog for the chosen section/page.
- The editor requires contributor login unless the user's 10-click dev copy mode is enabled.
- Public navigation does not include contributor tools.
- Member Login and Contributor Invite are footer utility links so they stay available without distracting first-time visitors.
- Registration is invite-only.
- Returning contributors use `member-login.html`.
- First-time contributors use `contributor-invite.html`, enter an invite code, then create their login/profile.
- With 10-click dev copy mode active, the site owner can reveal owner setup on `member-login.html`.
- Invite codes are generated from the private member dashboard by `owner` or `admin` accounts only.
- Normal visitors should never see owner/admin invite tools on `contributor-invite.html`.
- `Member Dashboard` is not a public nav item. Contributors reach it after member login or from the logged-in header dashboard control.
- Dashboard paper sections are split into unpublished drafts and published papers.
- Drafts autosave and can be reopened in the editor.
- Published papers can also be reopened by the owner/contributor for editing.
- Actual readable article/paper pages receive a local prototype comment section through `includes.js`.
- Education Center hubs, Research Library hubs, destination/category pages, and section listing pages should not show comments.
- Comments allow anonymous/name-only posting, show local date/time, and support replies.
- Logged-in contributors can automatically post/reply with their saved display name and title/role label when their profile option is enabled.
- Destination pages receive published article cards through the API when Cloudflare is available, with local fallback for preview.
- Generated published papers open through `published-article.html`.
- Public contributor profiles open through `contributor-profile.html?username=...`.

## Toolbar Requirements

The toolbar should stay compact and Blogger-like. Avoid large rounded dashboard buttons.

Current toolbar controls:

- Compose view / HTML view
- Undo
- Redo
- Paragraph / Heading / Quote format selector
- Bold
- Italic
- Strikethrough
- Quote
- LTR
- RTL
- Link
- Image
- Video
- Embed code
- Author Note
- Clear Format

Future toolbar improvements:

- Replace text buttons with small icons where practical.
- Add tooltips for compact controls.
- Add underline only if the user asks for it again; it is not currently central.
- Add ordered/unordered lists if the user wants them back.
- Consider a small insert-media menu instead of many media buttons.

## Media Behavior

### Images

Current:

- `Image` opens a modal card.
- Image modal options:
  - Upload from computer
  - Image URL
- Uploaded images are inserted as data URLs inside `<figure class="embedded-media">`.
- Inserted images include editor-only controls:
  - Move Up
  - Move Down
  - Small
  - Medium
  - Full

Future:

- Store uploaded images in Cloudflare R2.
- Insert R2 media URLs instead of data URLs.
- Add alt text/caption fields in a small modal rather than prompt boxes.
- Profile photo should support Upload from Computer and URL. Current dashboard still needs the upload wiring.

### Videos

Current:

- `Video` opens a modal card.
- Video modal options:
  - Upload from computer
  - Video URL
- YouTube URLs are converted to embed URLs.
- Rumble URLs are converted best-effort to `https://rumble.com/embed/.../`.
- Uploaded videos are inserted as data URLs inside a `<video controls>` element.
- Inserted videos include editor-only controls:
  - Move Up
  - Move Down
  - Small
  - Medium
  - Full
- Editor-only controls are stripped out of copied HTML and preview HTML.

Future:

- Store uploaded videos/audio in Cloudflare R2.
- Add a media picker with tabs:
  - Upload from computer
  - YouTube
  - Rumble
  - URL
  - Embed code
- Test Rumble URL variants with actual user examples.
 - Add support for uploaded audio where research papers need EVP/ITC evidence clips.

## Link Behavior

Current:

- `Link` prompts for address.
- The user is asked whether to open in a new window.
- If text is highlighted, the selected text becomes the link.
- If no text is highlighted, the URL itself is inserted as the link text.

Future:

- Replace prompts with a small link dialog:
  - Text to display
  - Address
  - Open in new window checkbox
  - Apply / Cancel

## Author Note

The author note must stay easy to insert.

Current author-note fields in Post Settings:

- Author
- Affiliation
- Organization
- Correspondence
- Website

Default inserted HTML:

```html
<h3>Author Note</h3>
<p>Todd Wayne<br>
The Paranormal Initiative - Applied Paranormal Research and Studies<br>
Somerset Paranormal Research Society<br><br>
Correspondence: paranormalinitiative@yahoo.com</p>
```

Future:

- Make author profiles configurable from the member dashboard.
- Add quick presets if more authors join.
- Keep Todd Wayne as the default.
- Consider an "Insert or Update Author Note" action so changing Post Settings can refresh an existing note.

## Destination Placement

The editor needs to help the user place papers in the correct Education Center location.

Current destination choices:

- Investigation Science
- Evidence Science & Analysis
- Instrumentation & Technology
- Environmental Research
- EVP / ITC Research
- Consciousness & Human Experience
- Ethics & Professional Standards
- Reporting & Documentation
- Community Development & Publication
- Technology Development
- Artificial Intelligence
- Historical & Cultural Research
- Investigation Development Series
- Ghostology Reference
- EVP / ITC Research Notes
- Field Articles
- Method Exercises

Current behavior:

- The selected destination is included in preview metadata.
- `Publish Article` opens a dialog with the generated article filename, destination page, article download/copy actions, destination card copy action, and open-destination action.
- The card includes an HTML comment naming the target file where it belongs.
- The suggested paper filename is generated from the title.

Future:

- Continue the API publish flow so published records appear in the selected destination page and drafts stay private.
- Add different card templates for field articles, investigation development posts, and research-topic papers if their page layouts diverge.
- Let the user choose whether the generated paper should use an `education-research-*`, `investigation-development-*`, or another filename pattern.

## Contributor Dashboard Requirements

The dashboard should feel like a professional contributor home page, not an admin form dump.

Current direction:

- Profile section with display name, public title/credentials, role, affiliation, organization, correspondence email, website, profile photo, and biography.
- Profile photo supports Upload from Computer once R2 is connected, plus URL fallback.
- Separate paper sections:
  - Drafts / Not Published
  - Published Papers
- Owner/admin-only invite tools.
- No public `Member Dashboard` nav button.
- Greeting in the site header after login, for example `Hello, Todd`.

Still required:

- Visual test profile photo upload from computer after R2 is connected.
- Cleaner public profile visual QA after real data is entered.
- Visual test owner/admin comment moderation against live Cloudflare data.

## Cloudflare Storage Direction

D1 is the records database. It stores accounts, invites, sessions, profile text, article records, article status, comments, and media URLs/keys.

R2 is the media/file storage. It must store profile photos, article images, videos, audio, PDFs, DOCX/TXT files, and AI-generated assets.

Do not store large image/video/audio data inside D1.

## Preview

Preview should not be permanently visible in the editor.

Current:

- `Preview` opens a separate generated page/window.
- The preview page uses a dark research-paper layout and includes:
  - Research Library kicker
  - title
  - subtitle
  - author/source/labels meta line
  - article body
  - media styling

Future:

- Consider saving preview output into a temporary local HTML file if popup behavior becomes annoying.
- Match the final `education-research-*.html` page template more closely.

## Paper Page Rules

Research paper pages should keep one body container:

```html
<article class="lesson-reading-block paper-single-textbox">
```

Do not split paper sections into multiple boxes/cards.

Do not use these headings as a default template:

```text
Abstract
Field Context
Motivation and Bias
Applied Method
Conclusion
```

Full papers can still use normal headings, but they should read like actual field/research papers, not artificial academic mini-summaries.

## Copyright / External Papers

The user asked about Academia.edu and external papers. The working policy for the site should be:

- Link to third-party papers unless permission/license clearly allows republication.
- Do not host full third-party PDFs/DOCX/TXT files just because they are downloadable elsewhere.
- For public educational discussion, quote only limited portions and cite/link the source.
- For authors like Anabela Cardoso, create a reference/link page rather than copying the full document.

## Suggested Next Build Steps

1. Create the Cloudflare R2 bucket and uncomment the `TPI_MEDIA` binding.
2. Test profile photo upload from the member dashboard.
3. Replace editor data-URL media insertion with the existing R2 article-media endpoint.
4. Visually test current editor, dashboard, public profile, invite page, login page, published article page, and comment moderation.
5. Make the toolbar more icon-like and less text-heavy after the core portal flow is stable.

Recently completed:

- Comment moderation tools were added to the owner/admin dashboard and the Content Editor. Public anonymous/name-only comments are pending by default, contributor-signed comments publish immediately, and owner/admin can approve or delete comments.
- Change Password/account settings were added to the member dashboard with Cloudflare D1 and local-preview fallback behavior.
- Published article author names link to public contributor profiles when the article has a contributor username.
- Logged-in contributor comment and reply names link to public contributor profiles when the comment uses the contributor signature.
- Legacy authored pages can be imported from the Content Editor's My Content library.
- Legacy authored pages now behave as a conversion queue. Once a legacy page is saved or published from the Content Editor with the legacy page as its source, it leaves the legacy queue and the editable article becomes the contributor copy.
- Legacy conversion records now include best-fit destination and contribution type metadata, so Convert pre-fills the editor destination/type before saving or publishing.

## Contributor Portal State

The Content Editor now has a Cloudflare-ready contributor portal path. D1 stores accounts, invites, sessions, profiles, article records, draft/published status, and comments. Local storage remains only as a local preview fallback.

Legacy authored pages are centralized in `legacy-contributions.js` so the dashboard, public contributor profile, and editor My Content library stay aligned. Legacy items are archived links that can be imported into the Content Editor to create a newer editable article record.

Current/required behavior:

- Login before opening the editor, unless the site owner's 10-click dev copy mode is enabled.
- Invite-only contributor setup through `contributor-invite.html`.
- Returning contributor login through `member-login.html`.
- Private contributor home through `member-dashboard.html`.
- Owner/admin invite generation from the private dashboard only.
- System roles are `contributor`, `admin`, and `owner`.
- `editor` is a public title/credential, not a permission role.
- Contributor profiles store author note data.
- Contributors can submit research notes, papers, images, and videos.
- Contributors can save unpublished drafts and publish articles.
- Published articles appear in the selected Education Center destination.
- Public comments can be anonymous, name-only, or logged-in. Anonymous/name-only prototype implemented with localStorage.
- Comments should be moderated. Production moderation is not implemented yet.

Security rule:

- Do not treat localStorage fallback behavior as real security.
- Real production auth must use the Cloudflare API/D1 session flow.
- See `CONTRIBUTOR_PORTAL_PLAN.md`.

## Validation Commands

Run these after editor/contributor changes:

```bash
node --check paper-editor.js
node --check member-login.js
node --check includes.js
node --check published-article.js
node --check api-client.js
node --check 'functions/api/[[path]].js'
```

Optional static page check:

```bash
python3 - <<'PY'
from html.parser import HTMLParser
from pathlib import Path

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
        self.scripts = []
        self.styles = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.add(attrs["id"])
        if tag == "script" and attrs.get("src"):
            self.scripts.append(attrs["src"])
        if tag == "link" and attrs.get("rel") == "stylesheet":
            self.styles.append(attrs.get("href"))

parser = Parser()
parser.feed(Path("paper-editor.html").read_text())
required = {
    "editor-title", "editor-subtitle", "editor-source", "editor-author",
    "editor-destination", "editor-affiliation", "editor-organization", "editor-correspondence",
    "editor-website", "editor-labels", "paper-editor-body", "editor-html-view",
    "editor-status", "editor-view-mode", "editor-block-format",
    "image-file-input", "video-file-input", "media-modal",
    "media-modal-title", "image-url-input", "image-caption-input",
    "video-url-input"
}
missing_ids = sorted(required - parser.ids)
missing_assets = []
for src in parser.scripts:
    if not src.startswith("http") and not Path(src.split("?")[0]).exists():
        missing_assets.append(src)
for href in parser.styles:
    if href and not href.startswith("http") and not Path(href.split("?")[0]).exists():
        missing_assets.append(href)
print("missing ids:", missing_ids)
print("missing assets:", missing_assets)
PY
```
