# Research Paper Editor Roadmap

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

The next major phase is a contributor portal: login-protected editor access, admin-managed contributors, submitted papers/media, publishing review, and moderated comments. See `CONTRIBUTOR_PORTAL_PLAN.md`.

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
- A local prototype login gate protects the editor page until a contributor/admin signs in.
- Admin can add contributors in the editor's Contributors dialog.
- Public pages receive a local prototype comment section through `includes.js`.

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

- Store uploaded images in `assets/` or a CMS media library.
- Insert relative asset paths instead of data URLs.
- Add alt text/caption fields in a small modal rather than prompt boxes.

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

- Store uploaded videos in a real media folder/service.
- Add a media picker with tabs:
  - Upload from computer
  - YouTube
  - Rumble
  - URL
  - Embed code
- Test Rumble URL variants with actual user examples.

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

- Make author profiles configurable.
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

- Add a real publish flow that creates the new paper HTML file and inserts the card into the chosen destination page.
- Add different card templates for field articles, investigation development posts, and research-topic papers if their page layouts diverge.
- Let the user choose whether the generated paper should use an `education-research-*`, `investigation-development-*`, or another filename pattern.

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

1. Visually test current editor in the browser.
2. Make the toolbar more icon-like and less text-heavy.
3. Replace prompt-based dialogs with dark modal dialogs for link, image URL, video URL, and embed code.
4. Add save/load draft using `localStorage`.
5. Add export options:
   - Copy body HTML
   - Copy full research page HTML
   - Download draft HTML
6. Add a real media storage strategy before using this as a production publishing tool.
7. Add a "New Paper From Existing Research Page" importer if the user wants to edit current `education-research-*.html` pages.

## Contributor Portal Future Phase

The user wants the Research Paper Editor to require username/password access after the editor workflow is stable. A local prototype exists now, but production auth still needs a backend.

Required features:

- Login before opening the editor. Prototype implemented with localStorage.
- Admin can add contributors. Prototype implemented with localStorage.
- Contributor profiles store author note data. Prototype implemented with localStorage.
- Contributors can submit research notes, papers, images, and videos.
- Admin/editor can review submissions.
- Publish flow places approved articles into the selected Education Center destination.
- Public comments can be anonymous, name-only, or logged-in. Anonymous/name-only prototype implemented with localStorage.
- Comments should be moderated. Production moderation is not implemented yet.

Security rule:

- Do not treat the current localStorage login as real security.
- Choose a backend/auth provider first.
- See `CONTRIBUTOR_PORTAL_PLAN.md`.

## Validation Commands

Run these after editor changes:

```bash
node --check paper-editor.js
node --check includes.js
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
