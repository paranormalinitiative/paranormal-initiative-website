# TPI UI Redesign — Progress Log

## October 9, 2026 — Settings Center migration [CODEX]

Release: commit `4d0c4a7` pushed to main; Wrangler Version ID `b10402aa-ceb2-4373-9156-5d861ee71c46`. Eight live pages/assets checked against source byte-for-byte (200); account-style/theme/block endpoints reject anonymous users (401), nonexistent public profile style returns 404. Signed-in production mutations were not tested; local synthetic save checks are not live-session evidence. Handoff-document deployment follows with the same feature code.

Migrated all five Settings groups/twelve sections from the isolated reference into the existing Settings destination, with search, direct links, a padded two-column desktop layout, and compact mobile section menu. Six TPI themes now live in Personalization beside independent profile Highlights and heading fonts; added the missing account-theme save route, owner-backed personalization migration 0038, failure rollback, and styling on both profile views. Existing username/password/Profile editor/notification controls and private-library links retained. Actual Messenger block list is readable here. Imported privacy/feed/support/data/policy/payment tools are explicitly pending/disabled, not falsely saved or published. Full inventory, file map, and deferred work: `SETTINGS_MIGRATION.md`.

Local synthetic API/SQLite and actual Chrome member-shell tests passed at 1440/1024/768/390px, including twelve pages, eight policy areas, three secondary areas, search, deep links, save/reload/rollback, owner isolation, and profile styles. No Settings control overflow or JS errors. Migration 0038 applied and schema checked locally/remotely; file-import auth error resolved with equivalent direct D1 query. Cache: shell v55, Settings/Profile style assets v1. Production deployment evidence follows; no real member-session production mutation tested.

## Overview

This document tracks the UI redesign of The Paranormal Initiative website. The goal is to modernize the visual design with a **black + purple** color scheme, improve organization, and create a more polished user experience.

**Test Environment:** `/Users/toddknipple/Desktop/paranormal-initiative-website`
**Live Site:** `https://paranormalinitiative.com/` (GitHub + Cloudflare)
**Live Preview:** http://localhost:8000 (run `python3 -m http.server 8000` from the test directory)

**IMPORTANT:** This test site is used to prototype and validate changes before applying them to the live site. All changes documented here should be replicated to the live site once approved.

## Live Site Rules

When working on the live site (GitHub/Cloudflare):
1. **ONLY modify:** UI, CSS, HTML files
2. **DO NOT TOUCH:** StudioFlow (TPI Studio) — it is complete and working
3. **ADD:** TPI Reels page to the live site
4. **Backend:** Already configured with Cloudflare Workers, D1 Database, R2 Storage

## Member Feed / Content Editor Direction — Oct 8, 2026

- Search-card padding bug fixed: the shared member-mode section reset had overridden the card's padding, leaving controls at its border despite previous CSS adjustments. Desktop and mobile card selectors now override that reset. Real browser geometry confirms 23px top/21px side border-to-control insets on desktop and 19px top/15px side insets on phone. Shortcut rows wrap; More dropdown no longer sits inside a clipping scroll container.
- Todd's latest menu order: Feed, Profile, Photos, Videos, Friends, More. Profile opens the existing profile overview; Photos/Videos open private libraries rather than file pickers. Dropdown includes Files plus Reels, Events, Groups, Para News, ParaTube. Friends/Groups remain inactive. Existing search-card padding is retained.
- Private Photos has Your Photos, Photos of You (photos the owner marks), Albums, and Add Photos and Video. Videos/Files have their own private libraries and upload actions. Documents show filenames and types; Feed document cards have Save to Files. New upload indexing covers Profile, Feed, Messenger, and Content Editor; earlier uploads are recovered through R2 owner metadata. Library-only uploads do not create Feed posts. Verified three responsive widths with real frontend/API/SQLite and stub R2.
- The member search/menu strip was enlarged to a 48px control height with more padding and a stronger card treatment so the section reads as an intentional member tool area instead of a thin divider. It stays stacked and full-width on mobile.
- Member Messenger now accepts text and PDF files. Pending and sent attachments show the filename/title plus the document type, and sent documents are downloadable from the conversation.
- The community composer now completes the distinct Photos, Videos, Files, Link, and Emoji actions. Common file uploads are shown in the Feed as downloadable filename chips, while existing image/video rendering and validated links remain separate attachment types.
- Emoji choices are grouped for scanning into Faces, Paranormal & Mystery, ITC & Research, and Reactions & Community; the Faces group includes 😳 and 😱.
- The member-home Community Feed is the social stream for paranormal and ITC conversation: member posts, replies, media, links, reactions, and emoji.
- The Feed composer no longer exposes a category selector; new posts use the internal general bucket while existing category data remains available for historical context.
- The Content Editor is a separate contributor/admin/owner-only publishing surface for Education Center and other destination content. Normal members must not see its navigation, My Content card, or article-list endpoint.
- Member-home feed requests use the social-only feed scope so published articles and TPI videos stay in their destination/discovery surfaces instead of becoming feed posts.
- Parapost remains a layout/interaction reference only; TPI's own D1-backed member counts and activity statistics are authoritative, especially while membership is intentionally small before the growth campaign.
- Content Editor publication already sends a preference-aware, author-excluding notification with a title/summary and clickable destination link. Thumbnail and optional direct-message previews belong in the notification workflow, never as automatic member Feed posts.

---

## Design System — Color Palette

### Border Radius (Updated)
| Variable | Value | Usage |
|----------|-------|-------|
| `--radius-sm` | `10px` | Small radius (inputs, badges) |
| `--radius-md` | `16px` | Medium radius (buttons, small cards) |
| `--radius-lg` | `24px` | Large radius (cards, panels) |
| `--radius-xl` | `32px` | Extra large radius (modals) |
| `--radius-full` | `9999px` | Pill shape |

### Backgrounds
| Variable | Value | Usage |
|----------|-------|-------|
| `--bg-primary` | `#09090b` | Main page background |
| `--bg-secondary` | `#0f0f14` | Sidebar, footer |
| `--bg-card` | `#131318` | Cards, panels, modals |
| `--bg-card-hover` | `#1a1a22` | Card hover state |
| `--bg-elevated` | `#1c1c28` | Elevated elements |
| `--bg-surface` | `#111118` | Surface elements |

### Purple Accent Scale
| Variable | Value | Usage |
|----------|-------|-------|
| `--purple-50` | `#faf5ff` | Lightest purple |
| `--purple-100` | `#f3e8ff` | Light purple |
| `--purple-200` | `#e9d5ff` | Light purple |
| `--purple-300` | `#d8b4fe` | Medium light |
| `--purple-400` | `#c084fc` | Medium |
| `--purple-500` | `#a855f7` | **Primary accent** |
| `--purple-600` | `#9333ea` | Dark accent |
| `--purple-700` | `#7e22ce` | Darker accent |
| `--purple-800` | `#6b21a8` | Dark |
| `--purple-900` | `#581c87` | Darkest purple |

### Accent Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--accent` | `#a855f7` | Primary accent (buttons, links, highlights) |
| `--accent-hover` | `#c084fc` | Accent hover state |
| `--accent-muted` | `rgba(168, 85, 247, 0.15)` | Subtle accent backgrounds |
| `--accent-border` | `rgba(168, 85, 247, 0.3)` | Accent borders |
| `--accent-glow` | `rgba(168, 85, 247, 0.25)` | Glow effects |

### Text Colors
| Variable | Value | Usage |
|----------|-------|-------|
| `--text-primary` | `#f4f4f5` | Headings, primary text |
| `--text-secondary` | `#a1a1aa` | Body text, descriptions |
| `--text-tertiary` | `#71717a` | Muted text, timestamps |
| `--text-accent` | `#c084fc` | Accent text |
| `--text-on-accent` | `#09090b` | Text on accent backgrounds |

### Borders
| Variable | Value | Usage |
|----------|-------|-------|
| `--border-subtle` | `rgba(255, 255, 255, 0.06)` | Subtle dividers |
| `--border-default` | `rgba(255, 255, 255, 0.1)` | Default borders |
| `--border-strong` | `rgba(255, 255, 255, 0.15)` | Emphasized borders |
| `--border-accent` | `rgba(168, 85, 247, 0.3)` | Accent borders |

### Gradients
| Variable | Value | Usage |
|----------|-------|-------|
| `--gradient-hero` | `linear-gradient(135deg, #09090b 0%, #1a0a2e 50%, #09090b 100%)` | Hero sections |
| `--gradient-card` | `linear-gradient(145deg, #131318 0%, #1a1a24 100%)` | Card backgrounds |
| `--gradient-accent` | `linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)` | Accent buttons |
| `--gradient-accent-soft` | `linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(126, 34, 206, 0.1) 100%)` | Subtle accent backgrounds |
| `--gradient-glow` | `radial-gradient(ellipse at 50% 0%, rgba(168, 85, 247, 0.15) 0%, transparent 60%)` | Glow effects |

### Shadows
| Variable | Value | Usage |
|----------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0, 0, 0, 0.3)` | Small shadows |
| `--shadow-md` | `0 4px 12px rgba(0, 0, 0, 0.4)` | Medium shadows |
| `--shadow-lg` | `0 8px 32px rgba(0, 0, 0, 0.5)` | Large shadows |
| `--shadow-xl` | `0 16px 48px rgba(0, 0, 0, 0.6)` | Extra large shadows |
| `--shadow-glow` | `0 0 24px rgba(168, 85, 247, 0.2)` | Purple glow |
| `--shadow-glow-strong` | `0 0 40px rgba(168, 85, 247, 0.3)` | Strong purple glow |

### Spacing & Layout
| Variable | Value | Usage |
|----------|-------|-------|
| `--space-xs` | `4px` | Extra small spacing |
| `--space-sm` | `8px` | Small spacing |
| `--space-md` | `16px` | Medium spacing |
| `--space-lg` | `24px` | Large spacing |
| `--space-xl` | `32px` | Extra large spacing |
| `--space-2xl` | `48px` | 2x large spacing |
| `--space-3xl` | `64px` | 3x large spacing |

### Border Radius
| Variable | Value | Usage |
|----------|-------|-------|
| `--radius-sm` | `6px` | Small radius |
| `--radius-md` | `10px` | Medium radius |
| `--radius-lg` | `16px` | Large radius |
| `--radius-xl` | `24px` | Extra large radius |
| `--radius-full` | `9999px` | Pill shape |

### Transitions
| Variable | Value | Usage |
|----------|-------|-------|
| `--transition-fast` | `150ms ease` | Fast transitions |
| `--transition-base` | `200ms ease` | Default transitions |
| `--transition-slow` | `300ms ease` | Slow transitions |

### Layout
| Variable | Value | Usage |
|----------|-------|-------|
| `--sidebar-width` | `270px` | Sidebar width |
| `--sidebar-bg` | `#0a0a0f` | Sidebar background |

---

## Files Modified

### style.css
**Changes:**
- Added `:root` CSS variables block with full design system
- Updated body background: `#0f1419` → `var(--bg-primary)`
- Updated body text color: `#e6edf3` → `var(--text-primary)`
- Updated command header with purple gradient background
- Updated header scan animation from cyan to purple
- Updated all buttons to use purple accent
- Updated all cards (dashboard-panel, learning-card, editor-access-card)
- Updated portal-hero with purple glow background effect
- Updated footer
- Updated command-nav navigation
- Updated site-search-band
- Updated discussion-portal, discussion-shell, discussion-sidebar
- Updated discussion-category-title, discussion-topic-button
- Updated discussion-message, discussion-bubble
- Updated discussion-reply-box, discussion-admin-panel
- Updated home-section, home-mission-band, home-focus-grid
- Updated all feed/explore styles (member-explore-*, member-feed-*)
- Updated composer, feed cards, media previews
- Updated type badges from yellow to purple
- Added new keyframe animations (fadeIn, slideInLeft, slideInRight, pulse, glow)
- Enhanced hover effects on dashboard-panel-link (lift + glow + title color change)
- Enhanced hover effects on learning-card (lift + glow + title color change)
- Added active states for buttons (press down effect)
- Replaced all `#55c8ff` (cyan) with `var(--accent)` (purple)
- Replaced all `#00c2ff` with `var(--accent)`
- Replaced all `#9fdcf4` with `var(--accent)`
- Replaced all `#dff3fb` with `var(--text-primary)`
- Replaced all `#243140`, `#1f2a36`, `#263646` with `var(--border-subtle)`, `var(--border-default)`
- Replaced all `#090f14`, `#0c1116`, `#101820`, `#141c24` with `var(--bg-primary)`, `var(--bg-secondary)`, `var(--bg-card)`
- Replaced all `#e6edf3`, `#f4f8fb`, `#c7d5e2`, `#9fb3c8`, `#8aa0b6` with `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`
- Replaced all `#061018` with `var(--text-on-accent)`

**Approximate changes:** 200+ color replacements, 60+ component updates

### member-shell.css
**Changes:**
- Updated sidebar background: `#0b1016` → `var(--sidebar-bg)`
- Updated sidebar border: `#1f2a36` → `var(--border-subtle)`
- Updated sidebar logo color: `#55c8ff` → `var(--accent)`
- Updated nav links with purple hover/active states
- Updated nav badge (notifications) from red/cyan to red/purple
- Updated unread notification pulse animation
- Updated floating chat variables to use design system
- Replaced all `#55c8ff` with `var(--accent)`

**Approximate changes:** 50+ color replacements

### member-home.html
**Changes:**
- Updated all inline styles from `#55c8ff` to `var(--accent)`
- Profile photo borders, text colors, button colors

### All Other HTML Files
**Changes:**
- Global find/replace: `#55c8ff` → `var(--accent)` across all `.html` files

### reels.html (NEW)
**Changes:**
- Created new Reels page with vertical video experience
- Full-screen scroll with CSS scroll-snap
- Category tabs (For You, Following, New)
- Engagement sidebar (like, comment, share, save)
- Author info overlay with follow button
- Tags and music info display
- Progress bar animation
- Swipe hint animation
- Responsive design for mobile
- Purple accent colors throughout

### member-sidebar.html
**Changes:**
- Added "TPI Reels" link to Video & Studio section
- Added "New" tag to Reels navigation item

### social-feed-lab/styles.css
**Changes:**
- Updated `--cyan` variable to `var(--accent)`

---

## What's Been Completed

### ✅ Phase 1: Design System
- Created comprehensive CSS variables
- Established purple/black color palette
- Defined spacing, radius, shadow, and transition systems

### ✅ Phase 2: Core CSS Updates
- Updated style.css with new color system
- Updated member-shell.css for sidebar/navigation
- Replaced all hardcoded cyan colors with variables

### ✅ Phase 3: Component Updates
- Header and navigation
- Footer
- Buttons (primary, secondary, disabled)
- Cards (dashboard-panel, learning-card, editor-access-card)
- Forms (inputs, selects, textareas)
- Discussion forum (sidebar, topics, messages, bubbles)
- Feed page (composer, cards, media, type badges)
- Search bar
- Mission/collaboration sections

### ✅ Phase 4: Feed Page Redesign
- Composer has purple glow border
- Feed cards have hover effects with purple shadows
- Unread items show purple left border accent
- Online members have purple avatar borders
- All text uses proper hierarchy
- Buttons and inputs have purple focus states
- Media previews have rounded corners
- Type badges are now purple

### ✅ Phase 5: Reels Page
- Created new `reels.html` with vertical video experience
- Full-screen scroll with snap scrolling
- Category tabs (For You, Following, New)
- Engagement sidebar (like, comment, share, save)
- Author info overlay with follow button
- Progress bar animation
- Responsive design for mobile
- Added to sidebar navigation with "New" tag

### ✅ Phase 6: Homepage Enhancement
- Enhanced portal-hero with purple glow background
- Improved typography with clamp() for responsive sizing
- Added letter-spacing for better readability
- Max-width constraint for better line length

### ✅ Phase 7: Additional Polish
- Added new keyframe animations (fadeIn, slideInLeft, slideInRight, pulse, glow)
- Enhanced hover effects on dashboard-panel-link (lift + glow + title color change)
- Enhanced hover effects on learning-card (lift + glow + title color change)
- Added active states for buttons (press down effect)
- Replaced all remaining hardcoded colors with CSS variables:
  - `#243140`, `#1f2a36`, `#263646` → `var(--border-subtle)`, `var(--border-default)`
  - `#090f14`, `#0c1116`, `#101820`, `#141c24` → `var(--bg-primary)`, `var(--bg-secondary)`, `var(--bg-card)`
  - `#e6edf3`, `#f4f8fb`, `#c7d5e2`, `#9fb3c8`, `#8aa0b6` → `var(--text-primary)`, `var(--text-secondary)`, `var(--text-tertiary)`
  - `#061018` → `var(--text-on-accent)`
- Replaced all `rgba(0, 194, 255, ...)` (cyan) with `rgba(168, 85, 247, ...)` (purple)
- Replaced all `rgba(85, 200, 255, ...)` (cyan) with `rgba(168, 85, 247, ...)` (purple)
- Replaced all `rgba(67, 215, 255, ...)` (bright cyan) with `rgba(168, 85, 247, ...)` (purple)
- Replaced all `rgba(73, 178, 255, ...)` (cyan) with `rgba(168, 85, 247, ...)` (purple)
- Replaced all `rgba(38, 54, 70, ...)` (blue-gray) with `rgba(255, 255, 255, ...)` (white)
- Replaced all `rgba(36, 49, 64, ...)` (blue-gray) with `rgba(255, 255, 255, ...)` (white)
- Replaced all `#101820` (blue-gray cards) with `#131318` (pure dark gray) in:
  - `member-home.html` (4 instances)
  - `community-home.html` (4 instances)
  - `member-shell.css` (12+ instances)
- Replaced all `#101821` (chat bubble) with `#131318` in `member-shell.css`
- Replaced all light blue-gray text colors with design system variables:
  - `#bfeeff`, `#d8edf7`, `#d7e2ec`, `#d6e2ea` → `var(--text-primary)`
  - `#c3cfda`, `#c1ccd7`, `#c6d5e2` → `var(--text-secondary)`
  - `#7f909f`, `#8ea0b1`, `#91a6bb` → `var(--text-tertiary)`
- Replaced all dark blue-gray backgrounds with design system variables:
  - `#101b25`, `#16212b`, `#17232e`, `#111b24` → `var(--bg-card)`
  - `#05080b`, `#05080c`, `#0b1219` → `var(--bg-primary)`
- Updated CSS version numbers to force cache busting (v=40)
- Updated JavaScript files to use purple instead of cyan:
  - `member-shell.js` — 8 replacements
  - `community-forum.js` — 2 replacements
  - `member-login.js` — 3 replacements
  - `functions/api/[[path]].js` — 7 replacements
  - `paper-editor.js` — 3 replacements

---

## What's Next

### ✅ Phase 8: Completed Enhancements
- ✅ Reduce hero glow intensity
- ✅ Fix homepage button consistency
- ✅ Featured content carousel on homepage
- ✅ Mobile responsiveness improvements
- ✅ Page transitions and section reveals
- ✅ Skeleton loading states
- ✅ Dark/light theme toggle (removed — dark mode only)
- ✅ Homepage simplified — 23 cards reduced to 7 + carousel
- ✅ Community preview section added
- ✅ Spacing fixes throughout
- ✅ All cards rounded to 24px site-wide
- ✅ Universal card styles applied (homepage as source of truth)
- ✅ Purple hue added to all cards (border, glow, background tint)
- ✅ Enhanced card depth with stronger shadows and gradients
- ✅ Featured content hero section added
- ✅ Category badges system created (10 color-coded types)
- ✅ Typography hierarchy improved
- ✅ TPI-branded visual elements added (accent bar, glow effects, patterns)
- ✅ TPI logo added to homepage and sidebar (transparent PNG)
- ✅ Education Center redesigned — 50 cards reduced to 3 quick-start + 8 accordion categories
- ✅ Education Center layout fixes — 3 cards in a row, centered count pills, spacing

### 🔄 Phase 9: Dashboard Enhancements (Based on Parapost Comparison)
- [ ] Add right sidebar with widgets (trending, people discovery, recently viewed)
- [ ] Add activity stats bar (feed counts, likes, comments, shares)
- [ ] Add rich composer (investigation notes, EVP clips, location reports, photos, videos)
- [ ] Add status indicators (online dots, "New" badges, activity timestamps)
- [ ] Add people discovery section (new members, suggested connections)
- [ ] Add trending topics section
- [ ] Add bottom mobile navigation bar

### ✅ Phase 10: Events Section (Based on Paranormal Country Comparison) — DEPLOYED TO LIVE
- [x] Events page created with featured event, filters, and event cards
- [x] Event card design with actual images (date badge, type badge, location, distance, time, RSVP)
- [x] Filter system (All, Investigations, Conferences, Meetups, Workshops, Live Streams)
- [x] RSVP functionality with toggle
- [x] Submit Event CTA linked to submission form
- [x] Added to sidebar navigation (Community section, "New" tag)
- [x] Admin event entry form (admin-events.html) — leadership-gated on live
- [x] Community event submission form (submit-event.html)
- [x] Form formatting fixed and polished
- [x] **Deployed to live site (Oct 4, 2026)** — all three pages migrated from this desktop copy; hardcoded purple literals converted to theme tokens (`color-mix(in srgb, var(--accent) …)` + `var(--purple-700)`) so all six member themes tint the Events pages; events.html + submit-event.html made public/indexable with OG tags + sitemap + search index; admin-events.html kept noindex with an owner/admin gate; sidebar gained Events + Manage Events (admin-only)
- [x] **Eventbrite/Meetup scraper built + events data refreshed (Oct 5, 2026)** — `scripts/scrape-events.py` pulled **82 unique events** into `events-data.json` (40 with dates, 42 with locations, 66 virtual; sources: 52 Eventbrite / 30 Meetup); events page now sorts dated events first, shows date/location/virtual badges, and links out to the original Eventbrite/Meetup pages. Eventbrite rate-limited the scraper mid-run (resets in 1–2 hours; rerun `python3 scripts/scrape-events.py`). **Full technical handoff for this system: see "TPI Event System — Technical Handoff" at the bottom of this file.**

### Phase 11: API Integration (Planned — Not Started)
- [ ] Eventbrite API for paranormal events
- [ ] Meetup API for paranormal groups
- [x] ~~Eventbrite/Meetup scraping~~ **Superseded (Oct 5, 2026):** public-page scrapers shipped first — `scripts/scrape-events.py` (Eventbrite ×7 URLs + Meetup ×4 URLs) → `events-data.json`, 82 events. Official APIs still worth doing for reliability (scrapers are fragile + rate-limited); scraper spec in the Technical Handoff section below
- [ ] Facebook Events API (requires app review)
- [ ] Automated daily/weekly event scraping
- [ ] D1 database schema for events
- [ ] API endpoints for events CRUD
- [ ] Connect admin form to database
- [ ] Connect community form to database

### 🔮 Phase 12: TPI Creator Studio (Future Build)
A dedicated creator studio for producing reels and photo content directly within TPI.

**Planned Features:**
- **Video Reels Creator** — Record, edit, and publish short-form video content
- **Photo Editor** — Edit, crop, filter, and enhance photos before posting
- **Multi-Platform Export** — Create content once, export to YouTube Shorts, TikTok, Facebook Reels, and TPI Reels
- **Templates & Overlays** — TPI-branded templates, lower thirds, watermarks
- **Audio Tools** — Add background music, voiceovers, EVP audio clips
- **Draft System** — Save drafts, schedule posts, batch create content
- **Media Library** — Organize and manage all uploaded photos/videos
- **Analytics** — Track views, engagement, and performance across platforms

**Technical Notes:**
- Could build as a standalone app (like StudioFlow) or integrated into the main site
- Would need FFmpeg for video processing (already have WASM support in ITC Visual Studio)
- Consider using Canvas API for photo editing
- YouTube API, TikTok API, Facebook Graph API for multi-platform publishing
- Store media in R2 bucket (already configured)

**Priority:** Medium — Focus on core site features first, then build creator tools

---

## Technical Notes

### Implementation Process
1. **Test changes** in the desktop test environment
2. **Validate** visually and functionally
3. **Document** changes in this file
4. **Replicate** to live site when approved

### CSS Variable Usage
All colors now use CSS variables. To change the theme globally, update the `:root` block in `style.css`. For example, to change the accent color:
```css
--accent: #a855f7;        /* Change this */
--accent-hover: #c084fc;  /* And this */
```

### JavaScript Files Updated
- `member-shell.js` — Chat colors, theme, navigation
- `community-forum.js` — Forum functionality
- `member-login.js` — Authentication
- `functions/api/[[path]].js` — Backend API
- `paper-editor.js` — Content editor

### Local Testing
To preview changes locally:
```bash
cd /Users/toddknipple/Desktop/paranormal-initiative-website
python3 -m http.server 8000
```
Then open http://localhost:8000 in your browser.

### Files NOT Modified
- `/Users/toddknipple/Documents/GitHub/paranormal-initiative-website/` — Original GitHub folder was NOT modified
- All changes are in the Desktop test copy only

---

## Color Comparison

### Before (Cyan Theme)
- Background: `#0f1419` (dark blue-gray)
- Accent: `#55c8ff` (cyan)
- Cards: `#141c24` with `#1f2a36` borders
- Text: `#e6edf3`, `#8aa0b6`, `#6d8296`

### After (Purple Theme)
- Background: `#09090b` (pure black)
- Accent: `#a855f7` (purple)
- Cards: `#131318` with white-tinted borders
- Text: `#f4f4f5`, `#a1a1aa`, `#71717a`

---

## Live Site Deployment (Oct 4, 2026)

The full redesign was migrated from this test copy to the live repo
(`~/Documents/GitHub/paranormal-initiative-website`, branch `main`) the same day:

- **Method:** git three-way merge — the test repo's base commit (`127e410`) still
  existed in live history, so the redesign diff applied cleanly on top of the live
  site's newer work (Teams Directory, member notifications, Resend email) without
  losing any of it. 39 files patched + `reels.html`, `tpi-banner.png`,
  `tpi-logo.jpg/png` copied over.
- **Post-merge fix:** `body.member-mode .portal-button-secondary` in
  member-shell.css still forced the old dark background/dark text — buttons were
  invisible on member-mode pages. Now uses `var(--bg-card)` / `var(--text-secondary)`
  with a hover state.
- **Post-merge polish:** the email-verification card and password-reset fields
  (built on live after this test copy was made) were re-skinned to the design
  system (`var(--bg-card)`, `var(--border-default)`, `var(--radius-*)`).
- **Cache busting:** every page now references `style.css?v=80`;
  `member-shell.css?v=50`.
- **Untouched on purpose:** `studio/` (StudioFlow bundle), `teams/` directory
  theme (keeps its own blue/green identity), all backend logic beyond the
  cyan→purple default-color swaps the redesign already contained.
- **Verified:** node --check on all six JS files; visual pass on home (hero,
  carousel, community), Education Center (quick start + 8 accordion categories),
  Reels, member-home, member-login (incl. reset steps), Teams Directory; console
  clean after closing a local-D1 migration gap (not a live issue).

## Handoff Checklist

When continuing this work:
1. ✅ Design system is established — use the CSS variables
2. ✅ Cyan is removed — all accent colors are purple
3. ✅ Feed page is redesigned — using new component styles
4. ✅ Reels page is built — full vertical video experience
5. ✅ Homepage enhanced — better hero with purple glow
6. ✅ Micro-interactions added — hover effects, animations, transitions
7. ✅ All hardcoded colors replaced — CSS variables throughout
8. ✅ All blue-gray cards (#101820) replaced with #131318
9. ✅ JavaScript files updated to use purple
10. ✅ Hero glow intensity reduced
11. ✅ Homepage buttons unified to same color
12. ✅ Featured content carousel on homepage
13. ✅ Mobile responsiveness improvements
14. ✅ Page transitions and section reveals
15. ✅ Skeleton loading states added
16. ✅ Dark/light theme toggle (removed — dark mode only)
17. ✅ Hero text alignment fixed (removed max-width: 720px, increased max-width to 1100px)
18. ✅ Homepage simplified — 23 cards reduced to 7 + carousel
19. ✅ Community preview section added (Forum, Reels, Live)
20. ✅ Spacing fixed between Community and Collaboration sections
21. ✅ All cards rounded to 24px (--radius-lg) site-wide (51 card/panel classes)
22. ✅ All hardcoded border-radius values replaced with CSS variables
23. ✅ Universal card styles applied site-wide (homepage as source of truth)
24. ✅ Purple hue added to all cards (border, glow, background tint)
25. ✅ Education Center redesigned — 50 cards reduced to 3 quick-start + 8 accordion categories
26. ✅ Education Center layout fixes — 3 cards in a row, centered count pills, spacing
27. ⬜ Right sidebar with widgets (trending, people discovery, recently viewed)
28. ⬜ Activity stats bar (feed counts, likes, comments, shares)
29. ⬜ Rich composer (investigation notes, EVP clips, location reports)
30. ⬜ Status indicators (online dots, "New" badges, activity timestamps)
31. ⬜ People discovery section (new members, suggested connections)
32. ⬜ Trending topics section
33. ⬜ Bottom mobile navigation bar
34. ✅ Events page with featured event, filters, and event cards
35. ✅ Admin event entry form (admin-events.html) — leadership-gated on live
36. ✅ Community event submission form (submit-event.html)
37. ✅ Event form formatting fixed and polished
38. ✅ Events section deployed to live site (Oct 4, 2026) — theme-token adapted, sidebar + search index + sitemap updated
39. ⬜ Interactive map integration
40. ✅ Eventbrite/Meetup integration, phase 1 (Oct 5, 2026) — public-page scrapers (`scripts/scrape-events.py`) feed `events-data.json` (82 events: 40 dated, 42 located, 66 virtual); events page sorts dated-first with date/location/virtual badges and outbound links; official APIs still pending (fragile scraper + Eventbrite rate limits) — full spec in the Technical Handoff section
41. ⬜ D1 database schema for events
42. ⬜ Connect forms to database API
43. ⬜ TPI Creator Studio (video reels + photo editing)
44. ✅ Members Home / Feed merge (Oct 4, 2026) — Your Feed merged into the HOME page: composer front and center ("You Are the Initiative"), community feed with Activity / Posts / Published Content tabs, sidebar Home renamed and Your Feed item removed (explore.html kept for deep links)
45. ✅ Settings / Profile split (Oct 4, 2026) — member-dashboard.html is Settings-only (Login Settings + full-width Color Theme card, hero "⚙ Edit Profile" button); new member-profile.html is the Profile page (identity card, email verification, full profile form); sidebar Profile → member-profile.html; Members Home / Feed renamed back to "Home" and the upper-right header button returns to member-home.html; Home gained a My Content strip (unpublished/published counts + Content Editor link)
46. ✅ Profile card + hero actions consolidated (Oct 5, 2026) — the member-home identity card moved to the top of member-profile.html (its self-linking Edit Profile button dropped, ⚙ Settings kept), and the dashboard hero beneath it now carries a single "☺ Edit Profile" button on the right that smooth-scrolls to the profile form — Settings / Open Content Editor / Sign Out removed from that hero (Sign Out stays in the top bar)
47. ✅ Profile page simplified + Settings hero trimmed (Oct 5, 2026, supersedes 46's card placement) — the top identity card was removed at Todd's direction; the Profile page is now the hero (single ☺ Edit Profile button, scrolls to the form) plus one card holding the profile summary (photo, role badge, facts, Biography) and the editable form with Save Profile / View Public Profile; the Settings hero lost its ☺ Edit Profile button (Open Content Editor + Sign Out remain)
48. ✅ Edit Profile button moved to the form footer (Oct 5, 2026) — the Profile hero now carries no action buttons; ☺ Edit Profile sits at the bottom of the profile card, ordered above Save Profile and View Public Profile
49. ✅ Landing-page front door + one-home redirect (Oct 5, 2026) — index.html hero reworked into an "Explore before you join" pitch (Paranormal Country model) with Join Free / Sign In / Start Exploring CTAs and a privacy line, existing explore sections kept below; `?member=1` on the homepage now redirects to member-home.html (early head script), and sidebar/mobile-nav Home links point at member-home.html directly — one home page; member-shell.js v55
50. ✅ Landing graphics pass (Oct 5, 2026) — hero rebuilt as a banner-backed card (assets/landing-banner.jpg, 206KB web-compressed from tpi-banner.png) with logo drop-shadow, gradient scrim into the page background, and a four-card "inside the community" teaser strip (Education Center · Explore, Community Feed · Sign in to post (Members), Events · Browse, Reels & Videos · Watch); cards have hover lift + accent border, responsive grid, mobile-verified; member-only CTAs are visually marked

---

## TPI Event System — Technical Handoff (Oct 5, 2026)

> **For the next agent:** this is the complete state of the events data pipeline. The events UI (events.html / submit-event.html / admin-events.html) is LIVE on the production site; the **scraper + data file currently live only in the desktop working copy** `~/Desktop/paranormal-initiative-website/` and are NOT yet in the GitHub repo. Everything below is verified against the actual files, not from memory.

### Where things live
| Piece | Location (desktop working copy `~/Desktop/paranormal-initiative-website/`) | In GitHub repo? |
|---|---|---|
| Scraper | `scripts/scrape-events.py` | NO — copy to repo before relying on it |
| Data | `events-data.json` (82 events) | NO |
| Events UI | `events.html`, `submit-event.html`, `admin-events.html` | YES — deployed Oct 4 (commit `31d55f9`, docs `7a996a4`)
| Extra scripts | `scripts/fetch-events.py` (older query-based fetcher, same output file), `scripts/update-events.sh` (wrapper: cd + run scraper) | NO |

### Scraper: `scripts/scrape-events.py`
- **Deps:** `requests`, `beautifulsoup4` (`pip3 install requests beautifulsoup4`). Run: `python3 scripts/scrape-events.py` from the desktop copy root. `scripts/update-events.sh` is a thin wrapper that just cds + runs it.
- **Headers:** mimics Chrome 120 on macOS (User-Agent/Accept/Accept-Language) — required, Eventbrite 429s plain requests.
- **Eventbrite (7 search URLs)** — `/d/online/paranormal-events/`, `/d/online/ghost-hunting/`, `/d/online/haunted-events/`, `/d/online/ufo-events/`, `/d/online/supernatural-events/`, `/d/united-states/paranormal-events/`, `/d/united-states/ghost-hunting/`; selector `a.event-card-link` (≤30 per URL), fields from link attrs: `aria-label` (title, `View ` prefix stripped), `data-event-location` ("City, ST" or "Online"), `data-event-id` (→ id `eb_<id>`), card text (date regex + venue regex), `img src` → imageUrl, `href` → outbound url. **Eventbrite rate-limits aggressively (HTTP 429); resets in ~1–2 h — the scraper prints `Status: 429` and moves on.**
- **Meetup (4 search URLs)** — `find/?keywords=paranormal|ghost+hunting|ufo|haunted&location=us`; selector `a[href*="/events/"]` (≤30 each), title = first line of link text cleaned with 3 regexes (date/time/weekday stripping), URL prefixed with `https://www.meetup.com` if relative, virtual if text contains "online"/"virtual". **Meetup's anti-scraping means data is thinner: no reliable dates/locations/images → most Meetup rows land in "Other" type with no startDate.**
- **Facebook source exists in the scraper but yields nothing** (login-walled) — left in place, harmless.
- **Rate limit:** the scraper is polite (no retries, single pass). On 429, wait 1–2 hours and rerun; results merge into the same JSON.
- **Classification:** `classify_event_type(title)` keyword-matches title → `investigation / conference / meetup / workshop / livestream / lecture / festival / tour / other`; `classify_category(title)` → category. 47 of 82 events classify to `"other"` — Meetup's thin data is the main cause; tightening title cleaning improves classification more than adding keywords.
- **Dedup:** none — reruns append; if a rerun duplicates rows, dedup on `url` or `id` before committing.

### Data: `events-data.json`
- **Counts (verified Oct 5, 2026):** 82 total · 40 with `startDate` · 42 with `city` or `locationName` · 66 `isVirtual:true` · sources: Eventbrite 52 / Meetup 30.
- **Schema per event:** `id` (`eb_<eventbrite-id>` / `mu_<n>` / `fb_<n>`), `title`, `description` (always ""), `type` (classified), `category` (classified), `startDate` (parsed "Mon, Oct 31, 7:00 PM" → stored "2026-10-31"; empty for most Meetup rows), `endDate`, `locationName` (venue, Eventbrite non-virtual only), `address` (always ""), `city`, `state`, `country` ("United States"), `isVirtual` (bool — location "Online", or title contains online/virtual/live stream), `imageUrl` (Eventbrite only), `organizer`/`organizerUrl` (always ""), `url` (outbound to source page), `source` (`eventbrite`/`meetup`/`facebook`), `status` ("approved").
- **events.html consumes it:** `fetch('events-data.json')` (line ~995) → date filters + type filter + distance filter (Any/10/25/50/100 mi) using `navigator.geolocation` + Nominatim reverse geocode + Haversine; cards render date badge, type badge, location, distance, Virtual badge when `isVirtual`, and "View Event" → original Eventbrite/Meetup URL; **sorting: dated events first, then located ones, virtual last**.

### Display rules (Todd-approved, Oct 5)
1. Events **with dates** first (40), most important signal.
2. Events **with locations** prominent (42).
3. **Virtual/online events lower** in the list.
4. Cards show: 📅 date (when available), 📍 location (city, state or venue), **Virtual** badge for online events, "View Event" → original Eventbrite page.
5. Scraper rerun after rate-limit reset (1–2 h): `python3 scripts/scrape-events.py`.

### Not wired yet (Phase 11 remainder)
- `events-data.json` is NOT deployed to the live site (live events.html still uses static cards) — **next step: deploy `events-data.json` + the fetch/sort/badge/distance JS into the live repo's events.html**, then wire submit-event.html + admin-events.html to D1 (schema/endpoints still pending).
- Official APIs (Eventbrite/Meetup) not integrated; scrapers are the interim solution.
- No automated scheduling; run the scraper manually (update-events.sh) or add cron/worker cron later.

---

*Last updated: October 5, 2026*
