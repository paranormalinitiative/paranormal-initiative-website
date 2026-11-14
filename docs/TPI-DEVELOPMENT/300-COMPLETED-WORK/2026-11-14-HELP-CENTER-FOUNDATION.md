# TPI Community Help Center Foundation

Date: 2026-11-14
Status: IMPLEMENTED — LOCAL BROWSER VERIFIED / RELEASE PENDING

## Scope

Created the first public- and member-facing Help Center foundation for The
Paranormal Initiative. The left navigation takes its information-architecture
cue from familiar community help surfaces, while every label, destination, and
article is TPI-specific and uses the existing shared six-theme palette.

## Implemented

- `help-center.html` home view with search, topic cards, popular guides, and a
  Help Desk escalation panel.
- `help-center-category.html` topic view with article listings.
- `help-center-article.html` article view with breadcrumbs, table of contents,
  helpfulness feedback, related guides, and safety-aware support language.
- `help-center-search.html` client-side search-results view over the shared
  article data source.
- `help-center-contact.html` Help Desk preparation flow that opens a local email
  draft to the established TPI contact address without exposing passwords or
  recovery codes.
- Responsive desktop/tablet/phone navigation, including a mobile topic drawer.
- Theme support for Cryptid & Folklore, Gothic Séance, Cosmic Horror, Asylum &
  Investigation, Field Operations, and Gothic Night, including account-theme
  hydration when a signed-in session is available.
- Public header and member sidebar links, plus sitemap entries for the Help
  Center home and Help Desk.
- Hardened the existing Community YouTube Firefox acceptance fixture so all
  browser-local Messenger frames are hidden before the unrelated feed Play
  control is exercised; this is test isolation only and does not change
  Messenger behavior.

## Content and authority boundary

This is a maintainable orientation and support foundation, not a replacement
for TPI’s authoritative governance, security, product, or operational Markdown.
Future policy articles must be derived from those records, especially the
Community Help Center and single-source-of-truth requirements in
`TPI-OPERATIONAL-ROLES-AND-ADMINISTRATIVE-AUTHORITY-ARCHITECTURE.md` and
`TPI-FUTURE-WORK-REGISTER.md`.

## Verification

- `node --check help-center.js` — passed.
- `node --check help-center-data.js` — passed.
- `git diff --check` — passed.
- `npm run verify:release-safety` — passed, 30/30.
- `npm run verify:community-youtube-preview` — passed, including 12 link-preview
  checks and the isolated Firefox interaction suite.
- Official local Worker at `http://127.0.0.1:8787/` — running.
- Local Firefox-equivalent browser verification — home, category, article,
  search results, theme picker, Help Desk, and mobile navigation drawer passed.
- No production deployment has been performed from this record yet.
