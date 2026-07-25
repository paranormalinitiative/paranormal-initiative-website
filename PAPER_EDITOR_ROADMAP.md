# Research Paper Editor Roadmap

Last updated: July 25, 2026

## Goal

Build a dark, Blogger-style editor for The Paranormal Initiative so full research papers can be drafted and moved into the website without hand-building many separate content cards.

The editor should help the user produce complete research papers with:

- one continuous body,
- media insertion,
- source links,
- author note fields and insertion,
- HTML output,
- and a separate preview page.

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
    "editor-affiliation", "editor-organization", "editor-correspondence",
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
